import db from "./db";

// --- Exercises ---

export interface ExerciseRecord {
  id: number;
  user_id: number;
  name: string;
  record_at: string;
  minute: number | null;
  caloric: number;
  intensity: string;
  type: string;
}

export const addExercise = (
  name: string,
  recordAt: string,
  minute: number | null,
  caloric: number,
  intensity: string,
  type: string
) => {
  try {
    const statement = db.prepareSync(
      "INSERT INTO exercises (name, record_at, minute, caloric, intensity, type) VALUES ($name, $recordAt, $minute, $caloric, $intensity, $type)"
    );
    const result = statement.executeSync({
      $name: name,
      $recordAt: recordAt,
      $minute: minute,
      $caloric: caloric,
      $intensity: intensity,
      $type: type,
    });
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error adding exercise:", error);
    throw error;
  }
};

export const getExercises = (filters?: {
  date?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  intensity?: string;
}): ExerciseRecord[] => {
  try {
    let query = "SELECT * FROM exercises WHERE 1=1";
    const params: any = {};

    if (filters?.date) {
      query += " AND date(record_at) = date($date)";
      params.$date = filters.date;
    }

    if (filters?.startDate && filters?.endDate) {
      query +=
        " AND date(record_at) BETWEEN date($startDate) AND date($endDate)";
      params.$startDate = filters.startDate;
      params.$endDate = filters.endDate;
    }

    if (filters?.type) {
      query += " AND type = $type";
      params.$type = filters.type;
    }

    if (filters?.intensity) {
      query += " AND intensity = $intensity";
      params.$intensity = filters.intensity;
    }

    query += " ORDER BY record_at DESC";

    return db.getAllSync(query, params) as ExerciseRecord[];
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

export const updateExercise = (
  id: number,
  name: string,
  minute: number | null,
  caloric: number,
  intensity: string,
  type: string
) => {
  try {
    const statement = db.prepareSync(
      "UPDATE exercises SET name = $name, minute = $minute, caloric = $caloric, intensity = $intensity, type = $type WHERE id = $id"
    );
    statement.executeSync({
      $id: id,
      $name: name,
      $minute: minute,
      $caloric: caloric,
      $intensity: intensity,
      $type: type,
    });
  } catch (error) {
    console.error("Error updating exercise:", error);
    throw error;
  }
};

// --- Food ---

export interface FoodRecord {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}

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

export const getFoodLogs = (): FoodRecord[] => {
  try {
    return db.getAllSync(
      "SELECT * FROM food ORDER BY date DESC"
    ) as FoodRecord[];
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

export interface WeightRecord {
  id: number;
  value: number;
  date: string;
}

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

export const getWeightLogs = (): WeightRecord[] => {
  try {
    return db.getAllSync(
      "SELECT * FROM weight ORDER BY date DESC"
    ) as WeightRecord[];
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
