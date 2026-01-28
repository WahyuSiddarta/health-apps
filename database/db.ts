import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as SQLite from "expo-sqlite";

const DB_NAME = "health-tracker.db";
const ENCRYPTED_DB_NAME = "health-tracker-encrypted.db";
const ENCRYPTION_KEY_STORAGE = "DB_ENCRYPTION_KEY";
const MIGRATION_COMPLETE_KEY = "DB_ENCRYPTION_MIGRATION_COMPLETE";

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Generate or retrieve the encryption key for SQLCipher
 */
const getOrCreateEncryptionKey = async (): Promise<string> => {
  let key = await AsyncStorage.getItem(ENCRYPTION_KEY_STORAGE);
  if (!key) {
    // Generate a 256-bit key (64 hex characters)
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    key = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    await AsyncStorage.setItem(ENCRYPTION_KEY_STORAGE, key);
  }
  return key;
};

/**
 * Check if migration from unencrypted to encrypted database is needed
 */
const needsMigration = async (): Promise<boolean> => {
  const migrationComplete = await AsyncStorage.getItem(MIGRATION_COMPLETE_KEY);
  if (migrationComplete === "true") {
    return false;
  }

  // Check if old unencrypted database exists by trying to open it
  try {
    const oldDb = SQLite.openDatabaseSync(DB_NAME);
    // Try to read from it - if it has data, we need to migrate
    const result = oldDb.getFirstSync(
      "SELECT name FROM sqlite_master WHERE type='table' LIMIT 1",
    );
    oldDb.closeSync();
    return result !== null;
  } catch {
    // No old database or it's empty
    return false;
  }
};

/**
 * Migrate data from unencrypted database to encrypted database
 */
const migrateToEncryptedDatabase = async (
  encryptionKey: string,
): Promise<void> => {
  console.log("Starting database encryption migration...");

  try {
    // Open the old unencrypted database
    const oldDb = SQLite.openDatabaseSync(DB_NAME);

    // Open new encrypted database and set the key
    const newDb = SQLite.openDatabaseSync(ENCRYPTED_DB_NAME);
    newDb.execSync(`PRAGMA key = '${encryptionKey}'`);

    // Get all tables from old database
    const tables = oldDb.getAllSync(
      "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
    ) as { name: string; sql: string }[];

    // Migrate each table
    for (const table of tables) {
      console.log(`Migrating table: ${table.name}`);

      // Create table in new database
      newDb.execSync(table.sql);

      // Get all data from old table
      const data = oldDb.getAllSync(`SELECT * FROM ${table.name}`);

      if (data.length > 0) {
        // Get column names
        const columns = Object.keys(data[0] as object);
        const placeholders = columns.map((c) => `$${c}`).join(", ");
        const columnNames = columns.join(", ");

        // Insert data into new table
        const insertStmt = newDb.prepareSync(
          `INSERT INTO ${table.name} (${columnNames}) VALUES (${placeholders})`,
        );

        for (const row of data) {
          const params: Record<string, SQLite.SQLiteBindValue> = {};
          for (const col of columns) {
            params[`$${col}`] = (row as Record<string, SQLite.SQLiteBindValue>)[
              col
            ];
          }
          insertStmt.executeSync(params);
        }
        insertStmt.finalizeSync();
      }
    }

    // Close old database
    oldDb.closeSync();
    newDb.closeSync();

    // Mark migration as complete
    await AsyncStorage.setItem(MIGRATION_COMPLETE_KEY, "true");

    console.log("Database encryption migration completed successfully");
  } catch (error) {
    console.error("Error during database encryption migration:", error);
    throw error;
  }
};

/**
 * Initialize and return the encrypted database instance
 */
export const initializeDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  const encryptionKey = await getOrCreateEncryptionKey();

  // Check if we need to migrate from unencrypted to encrypted
  if (await needsMigration()) {
    await migrateToEncryptedDatabase(encryptionKey);
  }

  // Open the encrypted database
  db = SQLite.openDatabaseSync(ENCRYPTED_DB_NAME);
  // Set the encryption key using PRAGMA
  db.execSync(`PRAGMA key = '${encryptionKey}'`);

  return db;
};

/**
 * Get the current database instance (must call initializeDatabase first)
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first.",
    );
  }
  return db;
};

/**
 * Close the database connection
 */
export const closeDatabase = (): void => {
  if (db) {
    db.closeSync();
    db = null;
  }
};

export default {
  initializeDatabase,
  getDatabase,
  closeDatabase,
};
