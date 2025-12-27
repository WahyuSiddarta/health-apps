import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("health-tracker.db");

export default db;
