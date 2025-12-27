import db from "./db";

export const initDatabase = () => {
  try {
    // 1. Create tables if they don't exist
    // Note: If tables already exist, these statements do nothing, even if schema doesn't match.
    // We handle schema updates in the migration step below.
    db.execSync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        record_at TEXT NOT NULL,
        minute INTEGER,
        caloric INTEGER,
        intensity TEXT NOT NULL,
        type TEXT
      );

      CREATE TABLE IF NOT EXISTS food (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        calories INTEGER NOT NULL,
        protein INTEGER,
        carbs INTEGER,
        fat INTEGER,
        date TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS weight (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value REAL NOT NULL, -- in kg or lbs
        date TEXT NOT NULL
      );
    `);

    // 2. Migration Strategy: Check for missing columns and add them safely
    migrateExercisesTable();

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

const migrateExercisesTable = () => {
  try {
    const tableInfo = db.getAllSync("PRAGMA table_info(exercises)") as {
      name: string;
    }[];
    const columns = new Set(tableInfo.map((col) => col.name));

    // Add 'user_id' if missing
    if (!columns.has("user_id")) {
      db.execSync("ALTER TABLE exercises ADD COLUMN user_id INTEGER");
    }

    // Add 'minute' if missing (migrate from duration if exists)
    if (!columns.has("minute")) {
      db.execSync("ALTER TABLE exercises ADD COLUMN minute INTEGER");
      if (columns.has("duration")) {
        db.execSync("UPDATE exercises SET minute = duration");
      }
    }

    // Add 'caloric' if missing (migrate from calories if exists)
    if (!columns.has("caloric")) {
      db.execSync("ALTER TABLE exercises ADD COLUMN caloric INTEGER");
      if (columns.has("calories")) {
        db.execSync("UPDATE exercises SET caloric = calories");
      }
    }

    // Add 'record_at' if missing (migrate from date if exists)
    if (!columns.has("record_at")) {
      db.execSync("ALTER TABLE exercises ADD COLUMN record_at TEXT");
      if (columns.has("date")) {
        db.execSync("UPDATE exercises SET record_at = date");
      }
    }

    // Add 'intensity' if missing
    if (!columns.has("intensity")) {
      db.execSync(
        "ALTER TABLE exercises ADD COLUMN intensity TEXT DEFAULT 'Medium'"
      );
    }

    // Add 'type' if missing
    if (!columns.has("type")) {
      db.execSync("ALTER TABLE exercises ADD COLUMN type TEXT");
    }
  } catch (error) {
    console.error("Error migrating exercises table:", error);
  }
};
