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
        user_id INTEGER,
        food_id INTEGER,
        category TEXT,
        created_at TEXT NOT NULL,
        fat REAL,
        protein REAL,
        carbohydrate REAL,
        caloric REAL,
        sugar REAL,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS weight (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        bodyweight REAL NOT NULL,
        viceral_fat REAL,
        fat_percentage REAL,
        nick_cm REAL,
        waist_cm REAL,
        measured_at TEXT NOT NULL
      );
    `);

    // 2. Migration Strategy: Check for missing columns and add them safely
    migrateExercisesTable();
    migrateFoodTable();
    migrateWeightTable();

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

const migrateWeightTable = () => {
  try {
    const tableInfo = db.getAllSync("PRAGMA table_info(weight)") as {
      name: string;
    }[];
    const columns = new Set(tableInfo.map((col) => col.name));

    // Add 'user_id' if missing
    if (!columns.has("user_id")) {
      db.execSync("ALTER TABLE weight ADD COLUMN user_id INTEGER");
    }

    // Add 'bodyweight' if missing (migrate from value if exists)
    if (!columns.has("bodyweight")) {
      db.execSync("ALTER TABLE weight ADD COLUMN bodyweight REAL");
      if (columns.has("value")) {
        db.execSync("UPDATE weight SET bodyweight = value");
      }
    }

    // Add 'viceral_fat' if missing
    if (!columns.has("viceral_fat")) {
      db.execSync("ALTER TABLE weight ADD COLUMN viceral_fat REAL");
    }

    // Add 'fat_percentage' if missing
    if (!columns.has("fat_percentage")) {
      db.execSync("ALTER TABLE weight ADD COLUMN fat_percentage REAL");
    }

    // Add 'nick_cm' if missing
    if (!columns.has("nick_cm")) {
      db.execSync("ALTER TABLE weight ADD COLUMN nick_cm REAL");
    }

    // Add 'waist_cm' if missing
    if (!columns.has("waist_cm")) {
      db.execSync("ALTER TABLE weight ADD COLUMN waist_cm REAL");
    }

    // Add 'measured_at' if missing (migrate from date if exists)
    if (!columns.has("measured_at")) {
      db.execSync("ALTER TABLE weight ADD COLUMN measured_at TEXT");
      if (columns.has("date")) {
        db.execSync("UPDATE weight SET measured_at = date");
      }
    }

    // Cleanup legacy columns
    if (columns.has("value")) {
      try {
        db.execSync("ALTER TABLE weight DROP COLUMN value");
      } catch (e) {
        console.log("Error dropping value column:", e);
      }
    }
    if (columns.has("date")) {
      try {
        db.execSync("ALTER TABLE weight DROP COLUMN date");
      } catch (e) {
        console.log("Error dropping date column:", e);
      }
    }
  } catch (error) {
    console.error("Error migrating weight table:", error);
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

const migrateFoodTable = () => {
  try {
    const tableInfo = db.getAllSync("PRAGMA table_info(food)") as {
      name: string;
    }[];
    const columns = new Set(tableInfo.map((col) => col.name));

    // Add 'user_id' if missing
    if (!columns.has("user_id")) {
      db.execSync("ALTER TABLE food ADD COLUMN user_id INTEGER");
    }

    // Add 'food_id' if missing
    if (!columns.has("food_id")) {
      db.execSync("ALTER TABLE food ADD COLUMN food_id INTEGER");
    }

    // Add 'category' if missing
    if (!columns.has("category")) {
      db.execSync("ALTER TABLE food ADD COLUMN category TEXT");
    }

    // Add 'created_at' if missing (migrate from date if exists)
    if (!columns.has("created_at")) {
      db.execSync("ALTER TABLE food ADD COLUMN created_at TEXT");
      if (columns.has("date")) {
        db.execSync("UPDATE food SET created_at = date");
      }
    }

    // Add 'caloric' if missing (migrate from calories if exists)
    if (!columns.has("caloric")) {
      db.execSync("ALTER TABLE food ADD COLUMN caloric REAL");
      if (columns.has("calories")) {
        db.execSync("UPDATE food SET caloric = calories");
      }
    }

    // Add 'carbohydrate' if missing (migrate from carbs if exists)
    if (!columns.has("carbohydrate")) {
      db.execSync("ALTER TABLE food ADD COLUMN carbohydrate REAL");
      if (columns.has("carbs")) {
        db.execSync("UPDATE food SET carbohydrate = carbs");
      }
    }

    // Add 'sugar' if missing
    if (!columns.has("sugar")) {
      db.execSync("ALTER TABLE food ADD COLUMN sugar REAL");
    }

    // Cleanup legacy columns
    if (columns.has("calories")) {
      try {
        db.execSync("ALTER TABLE food DROP COLUMN calories");
      } catch (e) {
        console.log("Error dropping calories column:", e);
      }
    }
    if (columns.has("carbs")) {
      try {
        db.execSync("ALTER TABLE food DROP COLUMN carbs");
      } catch (e) {
        console.log("Error dropping carbs column:", e);
      }
    }
    if (columns.has("date")) {
      try {
        db.execSync("ALTER TABLE food DROP COLUMN date");
      } catch (e) {
        console.log("Error dropping date column:", e);
      }
    }
  } catch (error) {
    console.error("Error migrating food table:", error);
  }
};
