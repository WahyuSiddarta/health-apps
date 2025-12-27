import db from "./db";

// --- Exercises ---

export const addExercise = (
  name: string,
  duration: number,
  calories: number,
  date: string
) => {
  try {
    const statement = db.prepareSync(
      "INSERT INTO exercises (name, duration, calories, date) VALUES ($name, $duration, $calories, $date)"
    );
    const result = statement.executeSync({
      $name: name,
      $duration: duration,
      $calories: calories,
      $date: date,
    });
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error adding exercise:", error);
    throw error;
  }
};

export const getExercises = () => {
  try {
    return db.getAllSync("SELECT * FROM exercises ORDER BY date DESC");
  } catch (error) {
    console.error("Error getting exercises:", error);
    return [];
  }
};

export const deleteExercise = (id: number) => {
  try {
    const statement = db.prepareSync("DELETE FROM exercises WHERE id = $id");
    statement.executeSync({ $id: id });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    throw error;
  }
};

// --- Food ---

export const addFood = (
  name: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  date: string
) => {
  try {
    const statement = db.prepareSync(
      "INSERT INTO food (name, calories, protein, carbs, fat, date) VALUES ($name, $calories, $protein, $carbs, $fat, $date)"
    );
    const result = statement.executeSync({
      $name: name,
      $calories: calories,
      $protein: protein,
      $carbs: carbs,
      $fat: fat,
      $date: date,
    });
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error adding food:", error);
    throw error;
  }
};

export const getFoodLogs = () => {
  try {
    return db.getAllSync("SELECT * FROM food ORDER BY date DESC");
  } catch (error) {
    console.error("Error getting food logs:", error);
    return [];
  }
};

export const deleteFood = (id: number) => {
  try {
    const statement = db.prepareSync("DELETE FROM food WHERE id = $id");
    statement.executeSync({ $id: id });
  } catch (error) {
    console.error("Error deleting food:", error);
    throw error;
  }
};

// --- Weight ---

export const addWeight = (value: number, date: string) => {
  try {
    const statement = db.prepareSync(
      "INSERT INTO weight (value, date) VALUES ($value, $date)"
    );
    const result = statement.executeSync({ $value: value, $date: date });
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error adding weight:", error);
    throw error;
  }
};

export const getWeightLogs = () => {
  try {
    return db.getAllSync("SELECT * FROM weight ORDER BY date DESC");
  } catch (error) {
    console.error("Error getting weight logs:", error);
    return [];
  }
};

export const deleteWeight = (id: number) => {
  try {
    const statement = db.prepareSync("DELETE FROM weight WHERE id = $id");
    statement.executeSync({ $id: id });
  } catch (error) {
    console.error("Error deleting weight:", error);
    throw error;
  }
};
