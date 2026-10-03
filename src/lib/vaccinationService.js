import { supabase } from "./supabase";
import { calculateVaccinationStatus } from "./dateUtils";

/**
 * Validate vaccination form data
 */
export function validateVaccination(form) {
  const errors = {};

  if (!form.pet_id) {
    errors.pet_id = "Please select a pet.";
  }

  if (!form.vaccine_name || !form.vaccine_name.trim()) {
    errors.vaccine_name = "Please enter the vaccine name.";
  } else if (form.vaccine_name.trim().length < 2) {
    errors.vaccine_name = "Vaccine name must be at least 2 characters.";
  }

  if (!form.date_given) {
    errors.date_given = "Please select the vaccination date.";
  }

  if (!form.next_due_date) {
    errors.next_due_date = "Please select the next due date.";
  } else if (form.date_given && form.next_due_date < form.date_given) {
    errors.next_due_date = "Next due date cannot be earlier than the date given.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Helpers for local persistence fallback if table is not yet migrated in Supabase
 */
function getLocalVaccinations(userId) {
  try {
    const raw = localStorage.getItem(`pawlio_vaccinations_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalVaccinations(userId, list) {
  try {
    localStorage.setItem(`pawlio_vaccinations_${userId}`, JSON.stringify(list));
  } catch (e) {
    console.warn("Could not save vaccinations to localStorage:", e);
  }
}

/**
 * Attach dynamic status to vaccination record
 */
export function attachVaccinationStatus(rec) {
  if (!rec) return rec;
  const statusInfo = calculateVaccinationStatus(rec.next_due_date);
  return {
    ...rec,
    status: statusInfo.status,
    statusClass: statusInfo.badgeClass,
    daysDiff: statusInfo.daysDiff,
  };
}

/**
 * Fetch all vaccinations belonging to the user
 */
export async function fetchUserVaccinations(userId) {
  if (!userId) throw new Error("User ID is required to fetch vaccinations.");

  try {
    const { data, error } = await supabase
      .from("vaccinations")
      .select("*")
      .eq("owner_id", userId)
      .order("next_due_date", { ascending: true });

    if (error) {
      // If table doesn't exist yet in Supabase schema cache
      if (error.code === "PGRST205" || error.message?.includes("vaccinations")) {
        console.warn(
          "Supabase 'vaccinations' table not found. Using local persistent storage. (Run supabase_phase5_setup.sql in Supabase SQL editor to enable cloud DB)."
        );
        const local = getLocalVaccinations(userId);
        return local.map(attachVaccinationStatus);
      }
      console.error("fetchUserVaccinations error:", error);
      throw new Error("Unable to load vaccination records.");
    }

    return (data || []).map(attachVaccinationStatus);
  } catch (err) {
    if (err.message === "Unable to load vaccination records.") throw err;
    console.warn("fetchUserVaccinations falling back to local:", err);
    return getLocalVaccinations(userId).map(attachVaccinationStatus);
  }
}

/**
 * Add a new vaccination record
 */
export async function createVaccination(userId, vaccineData) {
  if (!userId) throw new Error("User ID is required.");

  const validation = validateVaccination(vaccineData);
  if (!validation.isValid) {
    const firstKey = Object.keys(validation.errors)[0];
    throw new Error(validation.errors[firstKey]);
  }

  const payload = {
    owner_id: userId,
    pet_id: vaccineData.pet_id,
    vaccine_name: vaccineData.vaccine_name.trim(),
    date_given: vaccineData.date_given,
    next_due_date: vaccineData.next_due_date,
    notes: vaccineData.notes?.trim() || null,
    veterinarian: vaccineData.veterinarian?.trim() || null,
  };

  try {
    const { data, error } = await supabase
      .from("vaccinations")
      .insert(payload)
      .select()
      .single();

    if (!error && data) {
      return attachVaccinationStatus(data);
    }

    if (error && (error.code === "PGRST205" || error.message?.includes("vaccinations"))) {
      // Local fallback
      const localList = getLocalVaccinations(userId);
      const newRec = {
        id: "vax-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        ...payload,
        created_at: new Date().toISOString(),
      };
      setLocalVaccinations(userId, [newRec, ...localList]);
      return attachVaccinationStatus(newRec);
    }

    console.error("createVaccination database error:", error);
    throw new Error("Unable to save the vaccination.");
  } catch (err) {
    if (err.message === "Unable to save the vaccination.") throw err;
    // Local fallback
    const localList = getLocalVaccinations(userId);
    const newRec = {
      id: "vax-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      ...payload,
      created_at: new Date().toISOString(),
    };
    setLocalVaccinations(userId, [newRec, ...localList]);
    return attachVaccinationStatus(newRec);
  }
}

/**
 * Update an existing vaccination record
 */
export async function updateVaccination(userId, vaccineId, vaccineData) {
  if (!userId || !vaccineId) {
    throw new Error("User ID and Vaccine ID are required.");
  }

  const validation = validateVaccination(vaccineData);
  if (!validation.isValid) {
    const firstKey = Object.keys(validation.errors)[0];
    throw new Error(validation.errors[firstKey]);
  }

  const payload = {
    pet_id: vaccineData.pet_id,
    vaccine_name: vaccineData.vaccine_name.trim(),
    date_given: vaccineData.date_given,
    next_due_date: vaccineData.next_due_date,
    notes: vaccineData.notes?.trim() || null,
    veterinarian: vaccineData.veterinarian?.trim() || null,
  };

  try {
    const { data, error } = await supabase
      .from("vaccinations")
      .update(payload)
      .eq("id", vaccineId)
      .eq("owner_id", userId)
      .select()
      .single();

    if (!error && data) {
      return attachVaccinationStatus(data);
    }

    if (error && (error.code === "PGRST205" || error.message?.includes("vaccinations"))) {
      const localList = getLocalVaccinations(userId);
      const updated = localList.map((item) =>
        item.id === vaccineId ? { ...item, ...payload } : item
      );
      setLocalVaccinations(userId, updated);
      const found = updated.find((i) => i.id === vaccineId);
      return attachVaccinationStatus(found);
    }

    console.error("updateVaccination database error:", error);
    throw new Error("Unable to save the vaccination.");
  } catch (err) {
    if (err.message === "Unable to save the vaccination.") throw err;
    const localList = getLocalVaccinations(userId);
    const updated = localList.map((item) =>
      item.id === vaccineId ? { ...item, ...payload } : item
    );
    setLocalVaccinations(userId, updated);
    const found = updated.find((i) => i.id === vaccineId);
    return attachVaccinationStatus(found);
  }
}

/**
 * Delete a vaccination record
 */
export async function deleteVaccination(userId, vaccineId) {
  if (!userId || !vaccineId) {
    throw new Error("User ID and Vaccine ID are required.");
  }

  try {
    const { error } = await supabase
      .from("vaccinations")
      .delete()
      .eq("id", vaccineId)
      .eq("owner_id", userId);

    if (error && !(error.code === "PGRST205" || error.message?.includes("vaccinations"))) {
      console.error("deleteVaccination error:", error);
      throw new Error("Unable to delete this record.");
    }
  } catch (err) {
    if (err.message === "Unable to delete this record.") throw err;
  }

  // Also clean up in local list if present
  const localList = getLocalVaccinations(userId);
  setLocalVaccinations(
    userId,
    localList.filter((item) => item.id !== vaccineId)
  );
  return true;
}

/**
 * Calculate dynamic vaccination summary metrics
 */
export function getVaccinationSummary(vaccinations = []) {
  let total = 0;
  let dueSoon = 0;
  let overdue = 0;
  let upToDate = 0;

  vaccinations.forEach((item) => {
    total++;
    const statusInfo = calculateVaccinationStatus(item.next_due_date);
    if (statusInfo.status === "Overdue") {
      overdue++;
    } else if (statusInfo.status === "Due Soon") {
      dueSoon++;
    } else {
      upToDate++;
    }
  });

  return {
    total,
    dueSoon,
    overdue,
    upToDate,
  };
}
