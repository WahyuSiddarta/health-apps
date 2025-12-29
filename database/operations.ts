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
  user_id: number;
  food_id: number;
  category: string;
  created_at: string;
  fat: number;
  protein: number;
  carbohydrate: number;
  caloric: number;
  sugar: number;
  name: string;
}

export const addFood = (
  userId: number,
  foodId: number,
  category: string,
  createdAt: string,
  fat: number,
  protein: number,
  carbohydrate: number,
  caloric: number,
  sugar: number,
  name: string
) => {
  try {
    const statement = db.prepareSync(
      "INSERT INTO food (user_id, food_id, category, created_at, fat, protein, carbohydrate, caloric, sugar, name) VALUES ($userId, $foodId, $category, $createdAt, $fat, $protein, $carbohydrate, $caloric, $sugar, $name)"
    );
    const result = statement.executeSync({
      $userId: userId,
      $foodId: foodId,
      $category: category,
      $createdAt: createdAt,
      $fat: fat,
      $protein: protein,
      $carbohydrate: carbohydrate,
      $caloric: caloric,
      $sugar: sugar,
      $name: name,
    });
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error adding food:", error);
    throw error;
  }
};

export const getFood = (filters?: {
  date?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}): FoodRecord[] => {
  try {
    let query = "SELECT * FROM food WHERE 1=1";
    const params: any = {};

    if (filters?.date) {
      query += " AND date(created_at) = date($date)";
      params.$date = filters.date;
    }

    if (filters?.startDate && filters?.endDate) {
      query +=
        " AND date(created_at) BETWEEN date($startDate) AND date($endDate)";
      params.$startDate = filters.startDate;
      params.$endDate = filters.endDate;
    }

    if (filters?.category) {
      query += " AND category = $category";
      params.$category = filters.category;
    }

    query += " ORDER BY created_at DESC";

    return db.getAllSync(query, params) as FoodRecord[];
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

export const updateFood = (
  id: number,
  userId: number,
  foodId: number,
  category: string,
  createdAt: string,
  fat: number,
  protein: number,
  carbohydrate: number,
  caloric: number,
  sugar: number,
  name: string
) => {
  try {
    const statement = db.prepareSync(
      "UPDATE food SET user_id = $userId, food_id = $foodId, category = $category, created_at = $createdAt, fat = $fat, protein = $protein, carbohydrate = $carbohydrate, caloric = $caloric, sugar = $sugar, name = $name WHERE id = $id"
    );
    statement.executeSync({
      $id: id,
      $userId: userId,
      $foodId: foodId,
      $category: category,
      $createdAt: createdAt,
      $fat: fat,
      $protein: protein,
      $carbohydrate: carbohydrate,
      $caloric: caloric,
      $sugar: sugar,
      $name: name,
    });
  } catch (error) {
    console.error("Error updating food:", error);
    throw error;
  }
};

// --- Weight ---

export interface WeightRecord {
  id: number;
  user_id: number;
  bodyweight: number;
  viceral_fat: number | null;
  fat_percentage: number | null;
  nick_cm: number | null;
  waist_cm: number | null;
  measured_at: string;
}

export const addWeight = (
  userId: number,
  bodyweight: number,
  viceralFat: number | null,
  fatPercentage: number | null,
  nickCm: number | null,
  waistCm: number | null,
  measuredAt: string
) => {
  try {
    const statement = db.prepareSync(
      "INSERT INTO weight (user_id, bodyweight, viceral_fat, fat_percentage, nick_cm, waist_cm, measured_at) VALUES ($userId, $bodyweight, $viceralFat, $fatPercentage, $nickCm, $waistCm, $measuredAt)"
    );
    const result = statement.executeSync({
      $userId: userId,
      $bodyweight: bodyweight,
      $viceralFat: viceralFat,
      $fatPercentage: fatPercentage,
      $nickCm: nickCm,
      $waistCm: waistCm,
      $measuredAt: measuredAt,
    });
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error adding weight:", error);
    throw error;
  }
};

export const getWeightLogs = (filters?: {
  date?: string;
  startDate?: string;
  endDate?: string;
}): WeightRecord[] => {
  try {
    let query = "SELECT * FROM weight WHERE 1=1";
    const params: any = {};

    if (filters?.date) {
      query += " AND date(measured_at) = date($date)";
      params.$date = filters.date;
    }

    if (filters?.startDate && filters?.endDate) {
      query +=
        " AND date(measured_at) BETWEEN date($startDate) AND date($endDate)";
      params.$startDate = filters.startDate;
      params.$endDate = filters.endDate;
    }

    query += " ORDER BY measured_at DESC";

    return db.getAllSync(query, params) as WeightRecord[];
  } catch (error) {
    console.error("Error getting weight logs:", error);
    return [];
  }
};

export const updateWeight = (
  id: number,
  userId: number,
  bodyweight: number,
  viceralFat: number | null,
  fatPercentage: number | null,
  nickCm: number | null,
  waistCm: number | null,
  measuredAt: string
) => {
  try {
    const statement = db.prepareSync(
      "UPDATE weight SET user_id = $userId, bodyweight = $bodyweight, viceral_fat = $viceralFat, fat_percentage = $fatPercentage, nick_cm = $nickCm, waist_cm = $waistCm, measured_at = $measuredAt WHERE id = $id"
    );
    statement.executeSync({
      $id: id,
      $userId: userId,
      $bodyweight: bodyweight,
      $viceralFat: viceralFat,
      $fatPercentage: fatPercentage,
      $nickCm: nickCm,
      $waistCm: waistCm,
      $measuredAt: measuredAt,
    });
  } catch (error) {
    console.error("Error updating weight:", error);
    throw error;
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
