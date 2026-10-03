import { supabase } from "./supabase";
import { getDaysDifferenceFromToday, formatCalendarDate, formatAppointmentTime } from "./dateUtils";

/**
 * Format appointment time nicely in 12-hour format with zero padding (e.g. "17:00" -> "05:00 PM")
 */
function formatTime12h(timeStr) {
  if (!timeStr) return "";
  return formatAppointmentTime(timeStr);
}

/**
 * Compute active reminders from vaccinations and appointments in memory.
 * This runs fast on the client for the Dashboard Reminder Section.
 */
export function computeUpcomingReminders(pets = [], vaccinations = [], appointments = []) {
  const reminders = [];
  const petMap = new Map(pets.map((p) => [String(p.id), p.name || "Your pet"]));

  // 1. VACCINATION REMINDERS
  vaccinations.forEach((vax) => {
    if (!vax.next_due_date) return;
    const petName = petMap.get(String(vax.pet_id)) || "Your pet";
    const daysDiff = getDaysDifferenceFromToday(vax.next_due_date);

    if (daysDiff === null) return;

    if (daysDiff < 0) {
      // Overdue
      reminders.push({
        id: `vax-overdue-${vax.id}`,
        type: "vaccination",
        urgency: "high",
        petName,
        vaccineName: vax.vaccine_name,
        targetDate: vax.next_due_date,
        title: "Vaccination Overdue",
        message: `${petName}'s ${vax.vaccine_name} vaccination is overdue.`,
        daysDiff,
      });
    } else if (daysDiff === 0) {
      // Due Today
      reminders.push({
        id: `vax-today-${vax.id}`,
        type: "vaccination",
        urgency: "high",
        petName,
        vaccineName: vax.vaccine_name,
        targetDate: vax.next_due_date,
        title: "Vaccination Due Today",
        message: `${petName}'s ${vax.vaccine_name} vaccination is due today.`,
        daysDiff,
      });
    } else if (daysDiff <= 30) {
      // Due Soon (e.g. 7 days, 30 days)
      reminders.push({
        id: `vax-due-${vax.id}-${daysDiff}`,
        type: "vaccination",
        urgency: daysDiff <= 7 ? "high" : "medium",
        petName,
        vaccineName: vax.vaccine_name,
        targetDate: vax.next_due_date,
        title: `Vaccination due in ${daysDiff} ${daysDiff === 1 ? "day" : "days"}`,
        message: `${petName}'s ${vax.vaccine_name} vaccination is due in ${daysDiff} ${
          daysDiff === 1 ? "day" : "days"
        }.`,
        daysDiff,
      });
    }
  });

  // 2. APPOINTMENT REMINDERS
  appointments.forEach((apt) => {
    if (!apt.appointment_date) return;
    // Don't remind for cancelled or completed appointments
    if (apt.status === "cancelled" || apt.status === "completed") return;

    const petName = petMap.get(String(apt.pet_id)) || "Your pet";
    const daysDiff = getDaysDifferenceFromToday(apt.appointment_date);
    if (daysDiff === null) return;

    const timeFormatted = formatTime12h(apt.appointment_time);
    const serviceName = apt.service_type || "appointment";

    if (daysDiff === 0) {
      // Today
      reminders.push({
        id: `apt-today-${apt.id}`,
        type: "appointment",
        urgency: "high",
        petName,
        targetDate: apt.appointment_date,
        title: "Appointment Today",
        message: `${petName} has a ${serviceName} today at ${timeFormatted}.`,
        daysDiff,
      });
    } else if (daysDiff === 1) {
      // Tomorrow
      reminders.push({
        id: `apt-tomorrow-${apt.id}`,
        type: "appointment",
        urgency: "medium",
        petName,
        targetDate: apt.appointment_date,
        title: "Appointment Tomorrow",
        message: `${petName} has a ${serviceName} tomorrow at ${timeFormatted}.`,
        daysDiff,
      });
    } else if (daysDiff > 1 && daysDiff <= 7) {
      // Upcoming within 7 days
      const formattedDate = formatCalendarDate(apt.appointment_date);
      reminders.push({
        id: `apt-soon-${apt.id}`,
        type: "appointment",
        urgency: "low",
        petName,
        targetDate: apt.appointment_date,
        title: "Upcoming Appointment",
        message: `${petName} has a ${serviceName} on ${formattedDate} at ${timeFormatted}.`,
        daysDiff,
      });
    }
  });

  // Sort by urgency and proximity
  return reminders.sort((a, b) => a.daysDiff - b.daysDiff);
}

/**
 * Deduplicated sync of reminders to the user's notifications table.
 * Strictly prevents creating duplicate notifications on dashboard reload.
 */
export async function syncRemindersToNotifications(userId, reminders = [], existingNotifications = []) {
  if (!userId || reminders.length === 0) return [];

  // Check sync timestamp in session/local storage (only sync at most once per hour per user)
  const lastSyncKey = `pawlio_reminder_sync_${userId}`;
  const now = Date.now();
  const lastSync = localStorage.getItem(lastSyncKey);
  if (lastSync && now - parseInt(lastSync, 10) < 1000 * 60 * 30) {
    // Synced within last 30 minutes, skip DB inserts
    return [];
  }

  const existingMessages = new Set(
    existingNotifications.map((n) => (n.message || "").trim().toLowerCase())
  );

  const newNotifications = [];

  for (const rem of reminders) {
    const trimmedMsg = rem.message.trim().toLowerCase();
    // If exact or identical message was already recorded, skip
    if (existingMessages.has(trimmedMsg)) {
      continue;
    }

    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          title: rem.title,
          message: rem.message,
          type: rem.type === "vaccination" ? "vaccination" : "appointment",
          is_read: false,
        })
        .select()
        .maybeSingle();

      if (!error && data) {
        newNotifications.push(data);
        existingMessages.add(trimmedMsg);
      }
    } catch (err) {
      console.warn("Could not insert notification reminder:", err);
    }
  }

  localStorage.setItem(lastSyncKey, String(now));
  return newNotifications;
}
