import { supabase } from "./supabase";

/**
 * Normalizes pet object to ensure consistent field names across the UI
 */
export function normalizePet(pet, extra = {}) {
  if (!pet) return null;
  return {
    ...pet,
    breed: pet.breed || extra.breed || "",
    gender: pet.gender || extra.gender || "",
    date_of_birth: pet.date_of_birth || extra.date_of_birth || "",
    weight: pet.weight !== undefined && pet.weight !== null ? pet.weight : (extra.weight ?? ""),
    color: pet.color || extra.color || "",
    allergies: pet.allergies || extra.allergies || "",
    medical_conditions: pet.medical_conditions || extra.medical_conditions || "",
    emergency_information:
      pet.emergency_information ||
      pet.emergency_info ||
      pet.emergency_contact ||
      extra.emergency_information ||
      "",
    photo_url:
      pet.photo_url ||
      pet.image_url ||
      pet.image ||
      extra.photo_url ||
      "",
  };
}

/**
 * Helper to get locally stored extra pet fields (if DB table is missing optional columns)
 */
function getLocalExtra(petId) {
  try {
    const raw = localStorage.getItem(`pawlio_pet_extra_${petId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Helper to save locally stored extra pet fields
 */
function setLocalExtra(petId, data) {
  try {
    const existing = getLocalExtra(petId);
    localStorage.setItem(
      `pawlio_pet_extra_${petId}`,
      JSON.stringify({ ...existing, ...data })
    );
  } catch (e) {
    console.warn("Could not save pet extra to localStorage:", e);
  }
}

/**
 * Helper to remove local extra fields on delete
 */
function removeLocalExtra(petId) {
  try {
    localStorage.removeItem(`pawlio_pet_extra_${petId}`);
  } catch {}
}

/**
 * Extract missing column name from Supabase/PostgreSQL error message
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
 * Calculate age string from birth date (e.g., "2 years 3 mos", "4 months old", "1 year old")
 */
export function calculatePetAge(dateOfBirth) {
  if (!dateOfBirth) return "";
  try {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return "";

    const now = new Date();
    if (dob > now) return "Not born yet";

    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();

    if (days < 0) {
      months--;
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    if (years === 0 && months === 0) {
      return "Under 1 month";
    }
    if (years === 0) {
      return `${months} ${months === 1 ? "month" : "months"} old`;
    }
    if (months === 0) {
      return `${years} ${years === 1 ? "year" : "years"} old`;
    }
    return `${years} ${years === 1 ? "yr" : "yrs"}, ${months} ${months === 1 ? "mo" : "mos"}`;
  } catch {
    return "";
  }
}

/**
 * Client-side validation for pet form inputs
 */
export function validatePetForm(form) {
  const errors = {};

  if (!form.name || !form.name.trim()) {
    errors.name = "Pet name is required.";
  } else if (form.name.trim().length < 2) {
    errors.name = "Pet name must be at least 2 characters.";
  } else if (form.name.trim().length > 50) {
    errors.name = "Pet name cannot exceed 50 characters.";
  }

  if (!form.species || !form.species.trim()) {
    errors.species = "Species is required.";
  }

  if (form.date_of_birth) {
    const dob = new Date(form.date_of_birth);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dob > today) {
      errors.date_of_birth = "Date of birth cannot be in the future.";
    }
  }

  if (form.weight !== "" && form.weight !== null && form.weight !== undefined) {
    const numWeight = parseFloat(form.weight);
    if (isNaN(numWeight) || numWeight <= 0) {
      errors.weight = "Weight must be a positive number.";
    } else if (numWeight > 500) {
      errors.weight = "Weight seems unusually high. Please enter weight in kg.";
    }
  }

  if (form.photo_url && form.photo_url.trim()) {
    const trimmed = form.photo_url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("data:image/")) {
      errors.photo_url = "Image must be a valid web URL (http:// or https://) or image data.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Fetch all pets belonging exclusively to the logged-in user
 */
export async function fetchUserPets(userId) {
  if (!userId) throw new Error("User ID is required to fetch pets.");

  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchUserPets error:", error);
    throw error;
  }

  return (data || []).map((pet) => {
    const extra = getLocalExtra(pet.id);
    return normalizePet(pet, extra);
  });
}

/**
 * Resilient insert handler that handles schema column discrepancies dynamically
 */
export async function createPet(userId, petData) {
  if (!userId) throw new Error("User ID is required to create a pet.");

  const validation = validatePetForm(petData);
  if (!validation.isValid) {
    const firstKey = Object.keys(validation.errors)[0];
    throw new Error(validation.errors[firstKey]);
  }

  // Construct primary candidate payload
  let payload = {
    owner_id: userId,
    name: petData.name.trim(),
    species: petData.species.trim(),
    breed: petData.breed?.trim() || null,
    gender: petData.gender || null,
    date_of_birth: petData.date_of_birth || null,
    weight: petData.weight !== "" && petData.weight !== null && !isNaN(parseFloat(petData.weight)) ? parseFloat(petData.weight) : null,
    color: petData.color?.trim() || null,
    allergies: petData.allergies?.trim() || null,
    medical_conditions: petData.medical_conditions?.trim() || null,
    emergency_information: petData.emergency_information?.trim() || null,
    photo_url: petData.photo_url?.trim() || null,
  };

  const omittedKeys = {};
  const maxAttempts = 12;
  let attempt = 0;
  let savedPet = null;

  while (attempt < maxAttempts) {
    attempt++;
    const { data, error } = await supabase
      .from("pets")
      .insert(payload)
      .select()
      .single();

    if (!error && data) {
      savedPet = data;
      break;
    }

    const missingCol = extractMissingColumn(error?.message);
    if (missingCol && Object.prototype.hasOwnProperty.call(payload, missingCol)) {
      omittedKeys[missingCol] = payload[missingCol];
      const newPayload = { ...payload };
      delete newPayload[missingCol];

      // Try known alternative names if applicable
      if (missingCol === "photo_url" && !omittedKeys["image_url"]) {
        newPayload.image_url = payload.photo_url;
      } else if (missingCol === "emergency_information" && !omittedKeys["emergency_info"]) {
        newPayload.emergency_info = payload.emergency_information;
      } else if (missingCol === "emergency_info" && !omittedKeys["emergency_contact"]) {
        newPayload.emergency_contact = omittedKeys.emergency_information;
      }

      payload = newPayload;
      continue;
    }

    // Unrecoverable database error
    console.error("createPet error:", error);
    throw error;
  }

  if (!savedPet) {
    throw new Error("Unable to save pet record. Please try again.");
  }

  // Save omitted extra fields to localStorage to prevent data loss
  const extraToStore = {
    ...omittedKeys,
    weight: petData.weight,
    color: petData.color,
    allergies: petData.allergies,
    medical_conditions: petData.medical_conditions,
    emergency_information: petData.emergency_information,
    photo_url: petData.photo_url,
  };
  setLocalExtra(savedPet.id, extraToStore);

  return normalizePet(savedPet, extraToStore);
}

/**
 * Resilient update handler that handles schema column discrepancies dynamically
 */
export async function updatePet(userId, petId, petData) {
  if (!userId || !petId) throw new Error("User ID and Pet ID are required.");

  const validation = validatePetForm(petData);
  if (!validation.isValid) {
    const firstKey = Object.keys(validation.errors)[0];
    throw new Error(validation.errors[firstKey]);
  }

  let payload = {
    name: petData.name.trim(),
    species: petData.species.trim(),
    breed: petData.breed?.trim() || null,
    gender: petData.gender || null,
    date_of_birth: petData.date_of_birth || null,
    weight: petData.weight !== "" && petData.weight !== null && !isNaN(parseFloat(petData.weight)) ? parseFloat(petData.weight) : null,
    color: petData.color?.trim() || null,
    allergies: petData.allergies?.trim() || null,
    medical_conditions: petData.medical_conditions?.trim() || null,
    emergency_information: petData.emergency_information?.trim() || null,
    photo_url: petData.photo_url?.trim() || null,
  };

  const omittedKeys = {};
  const maxAttempts = 12;
  let attempt = 0;
  let updatedPet = null;

  while (attempt < maxAttempts) {
    attempt++;
    const { data, error } = await supabase
      .from("pets")
      .update(payload)
      .eq("id", petId)
      .eq("owner_id", userId) // Enforce user-only access
      .select()
      .single();

    if (!error && data) {
      updatedPet = data;
      break;
    }

    const missingCol = extractMissingColumn(error?.message);
    if (missingCol && Object.prototype.hasOwnProperty.call(payload, missingCol)) {
      omittedKeys[missingCol] = payload[missingCol];
      const newPayload = { ...payload };
      delete newPayload[missingCol];

      if (missingCol === "photo_url" && !omittedKeys["image_url"]) {
        newPayload.image_url = payload.photo_url;
      } else if (missingCol === "emergency_information" && !omittedKeys["emergency_info"]) {
        newPayload.emergency_info = payload.emergency_information;
      } else if (missingCol === "emergency_info" && !omittedKeys["emergency_contact"]) {
        newPayload.emergency_contact = omittedKeys.emergency_information;
      }

      payload = newPayload;
      continue;
    }

    console.error("updatePet error:", error);
    throw error;
  }

  if (!updatedPet) {
    throw new Error("Unable to update pet record. Please try again.");
  }

  const extraToStore = {
    ...omittedKeys,
    weight: petData.weight,
    color: petData.color,
    allergies: petData.allergies,
    medical_conditions: petData.medical_conditions,
    emergency_information: petData.emergency_information,
    photo_url: petData.photo_url,
  };
  setLocalExtra(updatedPet.id, extraToStore);

  return normalizePet(updatedPet, extraToStore);
}

/**
 * Delete a pet belonging exclusively to the user
 */
export async function deletePet(userId, petId) {
  if (!userId || !petId) throw new Error("User ID and Pet ID are required.");

  const { error } = await supabase
    .from("pets")
    .delete()
    .eq("id", petId)
    .eq("owner_id", userId); // Enforce user-only access

  if (error) {
    console.error("deletePet error:", error);
    throw error;
  }

  removeLocalExtra(petId);
  return true;
}
