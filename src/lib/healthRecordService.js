import { supabase } from "./supabase";

export const HEALTH_RECORD_TYPES = [
  "Checkup",
  "Vaccination",
  "Treatment",
  "Medication",
  "Surgery",
  "Other",
];

/**
 * Helper to store optional columns locally if DB table lacks them
 */
function getLocalHealthExtra(recordId) {
  try {
    const raw = localStorage.getItem(`pawlio_health_extra_${recordId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalHealthExtra(recordId, data) {
  try {
    const existing = getLocalHealthExtra(recordId);
    localStorage.setItem(
      `pawlio_health_extra_${recordId}`,
      JSON.stringify({ ...existing, ...data })
    );
  } catch (e) {
    console.warn("Could not save health record extra to localStorage:", e);
  }
}

function removeLocalHealthExtra(recordId) {
  try {
    localStorage.removeItem(`pawlio_health_extra_${recordId}`);
  } catch {}
}

/**
 * Extract missing column name from PostgreSQL error message
 */
function extractMissingColumn(errorMessage) {
  if (!errorMessage || typeof errorMessage !== "string") return null;
  const match1 = errorMessage.match(/column ["']?([a-zA-Z0-9_]+)["']? of relation/i);
  if (match1) return match1[1];
  const match2 = errorMessage.match(/Could not find the ['"]([a-zA-Z0-9_]+)['"] column/i);
  if (match2) return match2[1];
  const match3 = errorMessage.match(/column ["']?([a-zA-Z0-9_]+)["']? does not exist/i);
  if (match3) return match3[1];
  return null;
}

/**
 * Validate health record form
 */
export function validateHealthRecord(form) {
  const errors = {};

  if (!form.pet_id) {
    errors.pet_id = "Please select a pet.";
  }

  if (!form.record_type || !form.record_type.trim()) {
    errors.record_type = "Please select a record type.";
  }

  if (!form.title || !form.title.trim()) {
    errors.title = "Please enter a record title.";
  } else if (form.title.trim().length < 2) {
    errors.title = "Title must be at least 2 characters.";
  }

  if (!form.record_date) {
    errors.record_date = "Please select a date.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Fetch all health records for a user's pets
 */
export async function fetchUserHealthRecords(userId) {
  if (!userId) throw new Error("User ID is required to fetch health records.");

  try {
    const { data, error } = await supabase
      .from("health_records")
      .select("*")
      .eq("owner_id", userId)
      .order("record_date", { ascending: false });

    if (error) {
      console.error("fetchUserHealthRecords error:", error);
      throw new Error("Unable to load health records.");
    }

    return (data || []).map((rec) => {
      const extra = getLocalHealthExtra(rec.id);
      return {
        ...rec,
        follow_up_date: rec.follow_up_date || extra.follow_up_date || null,
        notes: rec.notes || extra.notes || null,
      };
    });
  } catch (err) {
    console.error("fetchUserHealthRecords exception:", err);
    throw err;
  }
}

/**
 * Create a new health record
 */
export async function createHealthRecord(userId, recordData) {
  if (!userId) throw new Error("User ID is required.");

  const validation = validateHealthRecord(recordData);
  if (!validation.isValid) {
    const firstKey = Object.keys(validation.errors)[0];
    throw new Error(validation.errors[firstKey]);
  }

  let payload = {
    owner_id: userId,
    pet_id: recordData.pet_id,
    record_type: recordData.record_type.trim(),
    title: recordData.title.trim(),
    description: recordData.description?.trim() || null,
    record_date: recordData.record_date,
    veterinarian: recordData.veterinarian?.trim() || null,
    follow_up_date: recordData.follow_up_date || null,
    notes: recordData.notes?.trim() || null,
  };

  const omittedKeys = {};
  const maxAttempts = 6;
  let attempt = 0;
  let savedRecord = null;

  while (attempt < maxAttempts) {
    attempt++;
    const { data, error } = await supabase
      .from("health_records")
      .insert(payload)
      .select()
      .single();

    if (!error && data) {
      savedRecord = data;
      break;
    }

    const missingCol = extractMissingColumn(error?.message);
    if (missingCol && Object.prototype.hasOwnProperty.call(payload, missingCol)) {
      omittedKeys[missingCol] = payload[missingCol];
      const newPayload = { ...payload };
      delete newPayload[missingCol];
      payload = newPayload;
      continue;
    }

    console.error("createHealthRecord database error:", error);
    throw new Error("Unable to save the health record.");
  }

  if (!savedRecord) {
    throw new Error("Unable to save the health record.");
  }

  if (Object.keys(omittedKeys).length > 0) {
    setLocalHealthExtra(savedRecord.id, omittedKeys);
  }

  return {
    ...savedRecord,
    ...omittedKeys,
  };
}

/**
 * Update an existing health record
 */
export async function updateHealthRecord(userId, recordId, recordData) {
  if (!userId || !recordId) {
    throw new Error("User ID and Record ID are required.");
  }

  const validation = validateHealthRecord(recordData);
  if (!validation.isValid) {
    const firstKey = Object.keys(validation.errors)[0];
    throw new Error(validation.errors[firstKey]);
  }

  let payload = {
    pet_id: recordData.pet_id,
    record_type: recordData.record_type.trim(),
    title: recordData.title.trim(),
    description: recordData.description?.trim() || null,
    record_date: recordData.record_date,
    veterinarian: recordData.veterinarian?.trim() || null,
    follow_up_date: recordData.follow_up_date || null,
    notes: recordData.notes?.trim() || null,
  };

  const omittedKeys = {};
  const maxAttempts = 6;
  let attempt = 0;
  let updatedRecord = null;

  while (attempt < maxAttempts) {
    attempt++;
    const { data, error } = await supabase
      .from("health_records")
      .update(payload)
      .eq("id", recordId)
      .eq("owner_id", userId)
      .select()
      .single();

    if (!error && data) {
      updatedRecord = data;
      break;
    }

    const missingCol = extractMissingColumn(error?.message);
    if (missingCol && Object.prototype.hasOwnProperty.call(payload, missingCol)) {
      omittedKeys[missingCol] = payload[missingCol];
      const newPayload = { ...payload };
      delete newPayload[missingCol];
      payload = newPayload;
      continue;
    }

    console.error("updateHealthRecord database error:", error);
    throw new Error("Unable to save the health record.");
  }

  if (!updatedRecord) {
    throw new Error("Unable to save the health record.");
  }

  if (Object.keys(omittedKeys).length > 0) {
    setLocalHealthExtra(updatedRecord.id, omittedKeys);
  }

  return {
    ...updatedRecord,
    ...omittedKeys,
  };
}

/**
 * Delete a health record
 */
export async function deleteHealthRecord(userId, recordId) {
  if (!userId || !recordId) {
    throw new Error("User ID and Record ID are required.");
  }

  const { error } = await supabase
    .from("health_records")
    .delete()
    .eq("id", recordId)
    .eq("owner_id", userId);

  if (error) {
    console.error("deleteHealthRecord database error:", error);
    throw new Error("Unable to delete this record.");
  }

  removeLocalHealthExtra(recordId);
  return true;
}
