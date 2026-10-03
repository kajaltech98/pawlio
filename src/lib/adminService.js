import { supabase } from "./supabase";

const DEFAULT_SERVICES = [
  {
    id: "srv-vet",
    name: "Veterinary Consultation",
    description: "Full clinical checkup, temperature, heart rate, physical exam and diagnostics.",
    price: 500,
    duration_minutes: 30,
    duration: "30-45 mins",
    category: "Veterinary",
    active: true,
    is_active: true,
  },
  {
    id: "srv-groom",
    name: "Pet Grooming",
    description: "Deep bath, blow dry, nail clipping, ear cleaning, and hair styling.",
    price: 600,
    duration_minutes: 60,
    duration: "60 mins",
    category: "Grooming",
    active: true,
    is_active: true,
  },
  {
    id: "srv-vacc",
    name: "Vaccination & Health Check",
    description: "Administration of core and lifestyle vaccines with vet review.",
    price: 450,
    duration_minutes: 20,
    duration: "20 mins",
    category: "Preventive",
    active: true,
    is_active: true,
  },
  {
    id: "srv-check",
    name: "Comprehensive Health Check",
    description: "Full body screening, dental assessment, diet and nutrition evaluation.",
    price: 750,
    duration_minutes: 45,
    duration: "45 mins",
    category: "Veterinary",
    active: true,
    is_active: true,
  },
  {
    id: "srv-train",
    name: "Behavioral Training",
    description: "One-on-one session for obedience, anxiety reduction, and leash habits.",
    price: 1000,
    duration_minutes: 60,
    duration: "60 mins",
    category: "Training",
    active: true,
    is_active: true,
  },
];

/**
 * Check if the given user has the admin role
 */
export async function checkUserIsAdmin(user) {
  if (!user) return false;

  // 1. Check user metadata or app metadata
  if (
    user.app_metadata?.role === "admin" ||
    user.user_metadata?.role === "admin"
  ) {
    return true;
  }

  // 2. Check localStorage dev override
  if (localStorage.getItem(`pawlio_admin_role_${user.id}`) === "admin") {
    return true;
  }

  // 3. Query profiles table
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data?.role === "admin") {
      return true;
    }
  } catch (err) {
    console.warn("Could not check admin role in profiles:", err);
  }

  return false;
}

/**
 * Set admin role locally or in DB (for setup/testing)
 */
export async function setAdminRoleOverride(userId, role = "admin") {
  localStorage.setItem(`pawlio_admin_role_${userId}`, role);
  try {
    await supabase.from("profiles").update({ role }).eq("id", userId);
  } catch {}
}

/**
 * Fetch overview statistics for Admin Dashboard
 */
export async function fetchAdminOverviewStats() {
  const result = {
    totalUsers: 0,
    totalPets: 0,
    totalAppointments: 0,
    activeServices: 0,
    appointmentsScheduled: 0,
    appointmentsCompleted: 0,
    appointmentsCancelled: 0,
    recentUsers: [],
    recentAppointments: [],
  };

  try {
    // 1. Users count & recent users
    const { data: usersData, error: usersErr } = await supabase
      .from("profiles")
      .select("id, full_name, phone, created_at, role")
      .order("created_at", { ascending: false });

    if (!usersErr && usersData) {
      result.totalUsers = usersData.length;
      result.recentUsers = usersData.slice(0, 5);
    }

    // 2. Pets count
    const { data: petsData, error: petsErr } = await supabase
      .from("pets")
      .select("id, name, species, breed, owner_id, created_at")
      .order("created_at", { ascending: false });

    if (!petsErr && petsData) {
      result.totalPets = petsData.length;
    }

    // 3. Appointments count & breakdown
    const { data: aptData, error: aptErr } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    if (!aptErr && aptData) {
      result.totalAppointments = aptData.length;
      aptData.forEach((apt) => {
        const status = (apt.status || "scheduled").toLowerCase();
        if (status === "completed") {
          result.appointmentsCompleted++;
        } else if (status === "cancelled") {
          result.appointmentsCancelled++;
        } else {
          result.appointmentsScheduled++;
        }
      });
      result.recentAppointments = aptData.slice(0, 5);
    }

    // 4. Services count
    const services = await fetchAdminServices();
    result.activeServices = services.filter((s) => s.is_active !== false).length;

    // Attach pet & owner info to recent appointments
    if (result.recentAppointments.length > 0 && petsData) {
      const petMap = new Map(petsData.map((p) => [String(p.id), p]));
      const userMap = new Map(
        (usersData || []).map((u) => [String(u.id), u.full_name || "Pet Parent"])
      );

      result.recentAppointments = result.recentAppointments.map((apt) => {
        const pet = petMap.get(String(apt.pet_id));
        const ownerName = userMap.get(String(apt.owner_id));
        return {
          ...apt,
          pet_name: pet?.name || "Pet",
          owner_name: ownerName || "User",
        };
      });
    }

    return result;
  } catch (error) {
    console.error("fetchAdminOverviewStats exception:", error);
    return result;
  }
}

/**
 * Fetch all users for Admin User Management
 */
export async function fetchAdminUsers() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, avatar_url, created_at, role")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchAdminUsers error:", error);
      throw new Error("Unable to load users.");
    }

    return (data || []).map((u) => {
      // Check if local role override exists
      const localRole = localStorage.getItem(`pawlio_admin_role_${u.id}`);
      return {
        ...u,
        role: localRole || u.role || "user",
      };
    });
  } catch (err) {
    console.error("fetchAdminUsers exception:", err);
    throw err;
  }
}

/**
 * Update user role
 */
export async function updateUserRole(targetUserId, newRole) {
  try {
    localStorage.setItem(`pawlio_admin_role_${targetUserId}`, newRole);
    const { data, error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", targetUserId)
      .select()
      .maybeSingle();

    if (error) {
      console.warn("Could not update role in profiles table, saved locally:", error);
    }
    return data || { id: targetUserId, role: newRole };
  } catch (err) {
    console.error("updateUserRole exception:", err);
    return { id: targetUserId, role: newRole };
  }
}

/**
 * Fetch all registered pets across all users
 */
export async function fetchAdminPets() {
  try {
    const { data: petsData, error: petsError } = await supabase
      .from("pets")
      .select("*")
      .order("created_at", { ascending: false });

    if (petsError) {
      console.error("fetchAdminPets error:", petsError);
      throw new Error("Unable to load pets.");
    }

    // Load owner names
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name");

    const ownerMap = new Map(
      (profilesData || []).map((p) => [String(p.id), p.full_name])
    );

    return (petsData || []).map((pet) => ({
      ...pet,
      owner_name: ownerMap.get(String(pet.owner_id)) || "Unknown Owner",
    }));
  } catch (err) {
    console.error("fetchAdminPets exception:", err);
    throw err;
  }
}

/**
 * Fetch all appointments across all users
 */
export async function fetchAdminAppointments() {
  try {
    const { data: aptData, error: aptError } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: false });

    if (aptError) {
      console.error("fetchAdminAppointments error:", aptError);
      throw new Error("Unable to load appointments.");
    }

    // Load pets & profiles for labels
    const [{ data: petsData }, { data: profilesData }] = await Promise.all([
      supabase.from("pets").select("id, name, species"),
      supabase.from("profiles").select("id, full_name, phone"),
    ]);

    const petMap = new Map((petsData || []).map((p) => [String(p.id), p]));
    const profileMap = new Map((profilesData || []).map((p) => [String(p.id), p]));

    return (aptData || []).map((apt) => {
      const pet = petMap.get(String(apt.pet_id));
      const profile = profileMap.get(String(apt.owner_id));

      return {
        ...apt,
        pet_name: pet?.name || "Pet",
        pet_species: pet?.species || "",
        owner_name: profile?.full_name || "Pet Parent",
        owner_phone: profile?.phone || "",
      };
    });
  } catch (err) {
    console.error("fetchAdminAppointments exception:", err);
    throw err;
  }
}

/**
 * Update appointment status (Scheduled, Completed, Cancelled)
 */
export async function updateAdminAppointmentStatus(appointmentId, newStatus) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status: newStatus.toLowerCase() })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) {
      console.error("updateAdminAppointmentStatus error:", error);
      throw new Error("Unable to update appointment status.");
    }

    return data;
  } catch (err) {
    console.error("updateAdminAppointmentStatus exception:", err);
    throw err;
  }
}

/**
 * Local helper for services storage fallback
 */
function getLocalServices() {
  try {
    const raw = localStorage.getItem("pawlio_admin_services");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalServices(servicesList) {
  try {
    const cleaned = deduplicateServices(servicesList);
    localStorage.setItem("pawlio_admin_services", JSON.stringify(cleaned));
  } catch (e) {
    console.warn("Could not save admin services locally:", e);
  }
}

/**
 * Helper to normalize a service record to guarantee both duration_minutes and active fields
 */
export function normalizeServiceRecord(s) {
  if (!s) return null;
  const isActive =
    s.active !== undefined
      ? Boolean(s.active)
      : s.is_active !== undefined
      ? Boolean(s.is_active)
      : true;

  const durMinutes =
    typeof s.duration_minutes === "number"
      ? s.duration_minutes
      : parseInt(s.duration_minutes || s.duration, 10) || 30;

  const priceVal =
    typeof s.price === "number" ? s.price : parseFloat(s.price) || 0;

  return {
    ...s,
    id: s.id,
    name: s.name || "",
    description: s.description || "",
    category: s.category || "General",
    price: priceVal,
    duration_minutes: durMinutes,
    duration: s.duration || `${durMinutes} mins`,
    active: isActive,
    is_active: isActive,
    image_url: s.image_url || null,
  };
}

/**
 * Deduplicate services array strictly by both service name and service ID.
 * When multiple records exist for the same service name, prioritizes active records.
 */
export function deduplicateServices(serviceList) {
  if (!Array.isArray(serviceList)) return [];

  const nameMap = new Map();
  const idMap = new Map();

  for (const raw of serviceList) {
    if (!raw) continue;
    const s = normalizeServiceRecord(raw);
    if (!s || !s.name) continue;

    const nameKey = s.name.trim().toLowerCase();
    const idKey = s.id ? String(s.id) : null;

    if (nameMap.has(nameKey)) {
      const existing = nameMap.get(nameKey);
      // Prioritize active record over inactive
      if (!existing.active && s.active) {
        nameMap.set(nameKey, s);
        if (idKey) idMap.set(idKey, s);
      }
    } else if (idKey && idMap.has(idKey)) {
      // Same ID already encountered
      const existing = idMap.get(idKey);
      if (!existing.active && s.active) {
        nameMap.set(nameKey, s);
        idMap.set(idKey, s);
      }
    } else {
      nameMap.set(nameKey, s);
      if (idKey) idMap.set(idKey, s);
    }
  }

  return Array.from(nameMap.values());
}

/**
 * Fetch services for Admin Service Management
 */
export async function fetchAdminServices() {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data && data.length > 0) {
      return deduplicateServices(data);
    }

    // Check local fallback
    const local = getLocalServices();
    if (local && local.length > 0) {
      return deduplicateServices(local);
    }

    // Default seed
    setLocalServices(DEFAULT_SERVICES);
    return deduplicateServices(DEFAULT_SERVICES);
  } catch (err) {
    console.warn("fetchAdminServices falling back to defaults:", err);
    const local = getLocalServices();
    return deduplicateServices(local || DEFAULT_SERVICES);
  }
}

/**
 * Create a new service
 */
export async function createAdminService(serviceData) {
  const durMinutes =
    typeof serviceData.duration_minutes === "number"
      ? serviceData.duration_minutes
      : parseInt(serviceData.duration_minutes || serviceData.duration, 10) || 30;

  const isActive =
    serviceData.active !== undefined
      ? Boolean(serviceData.active)
      : serviceData.is_active !== undefined
      ? Boolean(serviceData.is_active)
      : true;

  const primaryPayload = {
    name: serviceData.name.trim(),
    description: serviceData.description?.trim() || "",
    price: Math.max(0, parseFloat(serviceData.price) || 0),
    duration_minutes: durMinutes,
    category: serviceData.category?.trim() || "General",
    active: isActive,
    duration: `${durMinutes} mins`,
    is_active: isActive,
  };

  try {
    // Attempt insert with primary payload
    let { data, error } = await supabase
      .from("services")
      .insert(primaryPayload)
      .select()
      .single();

    // If a column doesn't exist in existing schema, retry with only standard fields
    if (error) {
      const strippedPayload = {
        name: primaryPayload.name,
        description: primaryPayload.description,
        price: primaryPayload.price,
        category: primaryPayload.category,
        duration_minutes: primaryPayload.duration_minutes,
        active: primaryPayload.active,
      };

      const retryRes = await supabase
        .from("services")
        .insert(strippedPayload)
        .select()
        .single();

      if (!retryRes.error && retryRes.data) {
        data = retryRes.data;
        error = null;
      }
    }

    if (!error && data) {
      const normalized = normalizeServiceRecord(data);
      const existing = (await fetchAdminServices()).filter((s) => s.id !== data.id);
      setLocalServices([normalized, ...existing]);
      return normalized;
    }

    // Local fallback if table insert fails
    const localList = await fetchAdminServices();
    const newService = normalizeServiceRecord({
      id: "srv-" + Date.now(),
      ...primaryPayload,
      created_at: new Date().toISOString(),
    });
    setLocalServices([newService, ...localList]);
    return newService;
  } catch (err) {
    console.warn("createAdminService exception, saved locally:", err);
    const localList = await fetchAdminServices();
    const newService = normalizeServiceRecord({
      id: "srv-" + Date.now(),
      ...primaryPayload,
      created_at: new Date().toISOString(),
    });
    setLocalServices([newService, ...localList]);
    return newService;
  }
}

/**
 * Update an existing service
 */
export async function updateAdminService(serviceId, serviceData) {
  const durMinutes =
    typeof serviceData.duration_minutes === "number"
      ? serviceData.duration_minutes
      : parseInt(serviceData.duration_minutes || serviceData.duration, 10) || 30;

  const isActive =
    serviceData.active !== undefined
      ? Boolean(serviceData.active)
      : serviceData.is_active !== undefined
      ? Boolean(serviceData.is_active)
      : true;

  const payload = {
    name: serviceData.name.trim(),
    description: serviceData.description?.trim() || "",
    price: Math.max(0, parseFloat(serviceData.price) || 0),
    duration_minutes: durMinutes,
    category: serviceData.category?.trim() || "General",
    active: isActive,
    duration: `${durMinutes} mins`,
    is_active: isActive,
  };

  try {
    let { data, error } = await supabase
      .from("services")
      .update(payload)
      .eq("id", serviceId)
      .select()
      .maybeSingle();

    if (error) {
      // Retry without compatibility aliases if column missing
      const strippedPayload = {
        name: payload.name,
        description: payload.description,
        price: payload.price,
        category: payload.category,
        duration_minutes: payload.duration_minutes,
        active: payload.active,
      };

      const retryRes = await supabase
        .from("services")
        .update(strippedPayload)
        .eq("id", serviceId)
        .select()
        .maybeSingle();

      if (!retryRes.error && retryRes.data) {
        data = retryRes.data;
        error = null;
      }
    }

    if (!error && data) {
      const normalized = normalizeServiceRecord(data);
      const existing = await fetchAdminServices();
      const updated = existing.map((s) => (s.id === serviceId ? { ...s, ...normalized } : s));
      setLocalServices(updated);
      return normalized;
    }

    // Local fallback
    const existing = await fetchAdminServices();
    const fallbackService = normalizeServiceRecord({ id: serviceId, ...payload });
    const updated = existing.map((s) => (s.id === serviceId ? { ...s, ...fallbackService } : s));
    setLocalServices(updated);
    return fallbackService;
  } catch (err) {
    console.warn("updateAdminService fallback:", err);
    const existing = await fetchAdminServices();
    const fallbackService = normalizeServiceRecord({ id: serviceId, ...payload });
    const updated = existing.map((s) => (s.id === serviceId ? { ...s, ...fallbackService } : s));
    setLocalServices(updated);
    return fallbackService;
  }
}

/**
 * Toggle service active/inactive status (deactivate without deleting)
 */
export async function toggleServiceActive(serviceId, currentStatus) {
  const newActive = !currentStatus;
  try {
    let { data, error } = await supabase
      .from("services")
      .update({ active: newActive, is_active: newActive })
      .eq("id", serviceId)
      .select()
      .maybeSingle();

    if (error) {
      // Retry with active only
      const retryRes = await supabase
        .from("services")
        .update({ active: newActive })
        .eq("id", serviceId)
        .select()
        .maybeSingle();

      if (!retryRes.error && retryRes.data) {
        data = retryRes.data;
        error = null;
      }
    }

    if (!error && data) {
      const normalized = normalizeServiceRecord(data);
      const existing = await fetchAdminServices();
      const updated = existing.map((s) =>
        s.id === serviceId ? { ...s, ...normalized, active: newActive, is_active: newActive } : s
      );
      setLocalServices(updated);
      return normalized;
    }

    // Local fallback
    const existing = await fetchAdminServices();
    const updated = existing.map((s) =>
      s.id === serviceId ? { ...s, active: newActive, is_active: newActive } : s
    );
    setLocalServices(updated);
    return { id: serviceId, active: newActive, is_active: newActive };
  } catch (err) {
    console.warn("toggleServiceActive fallback:", err);
    const existing = await fetchAdminServices();
    const updated = existing.map((s) =>
      s.id === serviceId ? { ...s, active: newActive, is_active: newActive } : s
    );
    setLocalServices(updated);
    return { id: serviceId, active: newActive, is_active: newActive };
  }
}
