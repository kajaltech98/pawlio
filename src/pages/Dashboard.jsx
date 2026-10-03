import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  PawPrint,
  CalendarCheck,
  Heart,
  Clock3,
  Plus,
  ArrowRight,
  Stethoscope,
  Home,
  Bell,
  ChevronRight,
  LogOut,
  X,
  UserRound,
  Search,
  ShieldCheck,
  Pencil,
  Trash2,
  AlertTriangle,
  Sparkles,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext.jsx";
import {
  fetchUserPets,
  createPet,
  updatePet,
  deletePet,
  calculatePetAge,
} from "../lib/petService";

import {
  fetchUserHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
} from "../lib/healthRecordService";

import {
  fetchUserVaccinations,
  createVaccination,
  updateVaccination,
  deleteVaccination,
  getVaccinationSummary,
} from "../lib/vaccinationService";

import {
  computeUpcomingReminders,
  syncRemindersToNotifications,
} from "../lib/reminderService";

import {
  formatCalendarDate,
  formatAppointmentDate,
  formatAppointmentTime,
  calculateVaccinationStatus,
} from "../lib/dateUtils";

// Modals & Components
import PetCard from "../components/pets/PetCard.jsx";
import PetDetailsModal from "../components/pets/PetDetailsModal.jsx";
import PetFormModal from "../components/pets/PetFormModal.jsx";
import DeletePetModal from "../components/pets/DeletePetModal.jsx";
import PetToast from "../components/pets/PetToast.jsx";
import HealthRecordModal from "../components/health/HealthRecordModal.jsx";
import DeleteHealthRecordModal from "../components/health/DeleteHealthRecordModal.jsx";
import VaccinationModal from "../components/health/VaccinationModal.jsx";
import DeleteVaccinationModal from "../components/health/DeleteVaccinationModal.jsx";
import AppointmentTimePicker from "../components/appointments/AppointmentTimePicker.jsx";
import DemoPaymentFlow from "../components/appointments/DemoPaymentFlow.jsx";

import DashboardSidebar from "../components/layout/DashboardSidebar";
import { useNotifications } from "../context/NotificationContext";
import { formatNotificationTime } from "../lib/notificationService";

import { deduplicateServices } from "../lib/adminService";

import "../components/pets/pets.css";
import "../components/health/health.css";

const defaultServices = [
  { id: "srv-vet", name: "Veterinary Consultation", price: 500 },
  { id: "srv-groom", name: "Pet Grooming", price: 600 },
  { id: "srv-vacc", name: "Vaccination & Health Check", price: 450 },
  { id: "srv-check", name: "Comprehensive Health Check", price: 750 },
  { id: "srv-train", name: "Behavioral Training", price: 1000 },
];

export default function Dashboard({ defaultSection, defaultSubTab }) {
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  const [user, setUser] = useState(authUser || null);
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [appointmentFilterTab, setAppointmentFilterTab] = useState("upcoming"); // 'upcoming' | 'history' | 'all'
  const [services, setServices] = useState(() => deduplicateServices(defaultServices));
  const [healthRecords, setHealthRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);

  const [activeSection, setActiveSection] = useState(defaultSection || "dashboard");
  const [healthSubTab, setHealthSubTab] = useState(defaultSubTab || "records"); // 'records' | 'vaccinations'
  const [healthPetFilter, setHealthPetFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [toast, setToast] = useState(null);

  // PET MANAGEMENT STATE (PHASE 3)
  const [selectedPetForDetails, setSelectedPetForDetails] = useState(null);
  const [selectedPetForEdit, setSelectedPetForEdit] = useState(null);
  const [selectedPetForDelete, setSelectedPetForDelete] = useState(null);
  const [showPetFormModal, setShowPetFormModal] = useState(false);
  const [savingPet, setSavingPet] = useState(false);
  const [deletingPet, setDeletingPet] = useState(false);
  const [petSearch, setPetSearch] = useState("");
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState("All");
  const [petsLoading, setPetsLoading] = useState(false);
  const [petsError, setPetsError] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState(false);

  // HEALTH RECORD MODALS STATE (PHASE 5)
  const [showHealthRecordModal, setShowHealthRecordModal] = useState(false);
  const [selectedHealthRecordForEdit, setSelectedHealthRecordForEdit] = useState(null);
  const [selectedHealthRecordForDelete, setSelectedHealthRecordForDelete] = useState(null);
  const [savingHealthRecord, setSavingHealthRecord] = useState(false);
  const [deletingHealthRecord, setDeletingHealthRecord] = useState(false);

  // VACCINATION MODALS STATE (PHASE 5)
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [selectedVaccinationForEdit, setSelectedVaccinationForEdit] = useState(null);
  const [selectedVaccinationForDelete, setSelectedVaccinationForDelete] = useState(null);
  const [savingVaccination, setSavingVaccination] = useState(false);
  const [deletingVaccination, setDeletingVaccination] = useState(false);

  // APPOINTMENT MODAL STATE (PHASE 4)
  const [showAppointment, setShowAppointment] = useState(false);
  const [savingAppointment, setSavingAppointment] = useState(false);
  const [appointmentPet, setAppointmentPet] = useState("");
  const [appointmentService, setAppointmentService] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [appointmentFormError, setAppointmentFormError] = useState("");
  const [appointmentBookingStep, setAppointmentBookingStep] = useState("form"); // 'form' | 'payment'
  const isCreatingAppointmentRef = useRef(false);

  // Handle direct section navigation on load
  useEffect(() => {
    if (defaultSection) {
      setActiveSection(defaultSection);
      const timer = setTimeout(() => {
        const el = document.getElementById(defaultSection);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [defaultSection]);

  useEffect(() => {
    if (defaultSubTab) {
      setHealthSubTab(defaultSubTab);
    }
  }, [defaultSubTab]);

  // INITIAL LOAD
  useEffect(() => {
    let ignore = false;

    const fetchDashboard = async () => {
      try {
        let currentUser = authUser;
        if (!currentUser) {
          const { data: { user: fetchedUser } = {}, error: userError } =
            await supabase.auth.getUser();
          if (userError || !fetchedUser) {
            if (!ignore) navigate("/login", { replace: true });
            return;
          }
          currentUser = fetchedUser;
        }

        if (ignore) return;
        setUser(currentUser);

        // 1. Profile Name & Avatar
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", currentUser.id)
            .maybeSingle();

          if (!ignore && profileData) {
            if (profileData.full_name) setProfileName(profileData.full_name);
            if (profileData.avatar_url) setProfileAvatar(profileData.avatar_url);
          }
        } catch (profErr) {
          console.warn("Profile fetch warning:", profErr);
        }

        // 2. Pets
        let loadedPets = [];
        try {
          loadedPets = await fetchUserPets(currentUser.id);
          if (!ignore) setPets(loadedPets);
        } catch (err) {
          console.error("Pets load exception:", err);
          if (!ignore) setPets([]);
        }

        // 3. Services
        try {
          const { data: serviceData, error: serviceError } = await supabase
            .from("services")
            .select("*")
            .order("name");

          if (!ignore) {
            let loaded = [];
            if (!serviceError && serviceData && serviceData.length > 0) {
              loaded = serviceData;
            } else {
              const localServices = localStorage.getItem("pawlio_admin_services");
              if (localServices) {
                try {
                  loaded = JSON.parse(localServices);
                } catch {
                  loaded = defaultServices;
                }
              } else {
                loaded = defaultServices;
              }
            }

            setServices(deduplicateServices(loaded));
          }
        } catch (err) {
          console.error("Services load exception:", err);
          if (!ignore) setServices(deduplicateServices(defaultServices));
        }

        // 4. Appointments
        let loadedAppointments = [];
        try {
          const { data: appointmentData, error: appointmentError } =
            await supabase
              .from("appointments")
              .select("*")
              .eq("owner_id", currentUser.id)
              .order("appointment_date", { ascending: true })
              .order("appointment_time", { ascending: true });

          if (!ignore && !appointmentError) {
            loadedAppointments = appointmentData || [];
            setAppointments(loadedAppointments);
          }
        } catch (err) {
          console.error("Appointments load exception:", err);
        }

        // 5. Health Records
        let loadedHealth = [];
        try {
          loadedHealth = await fetchUserHealthRecords(currentUser.id);
          if (!ignore) setHealthRecords(loadedHealth);
        } catch (err) {
          console.error("Health records load exception:", err);
        }

        // 6. Vaccinations
        let loadedVaccinations = [];
        try {
          loadedVaccinations = await fetchUserVaccinations(currentUser.id);
          if (!ignore) setVaccinations(loadedVaccinations);
        } catch (err) {
          console.error("Vaccinations load exception:", err);
        }

        // 7. Notifications
        let loadedNotifications = [];
        try {
          const { data: notificationData, error: notificationError } =
            await supabase
              .from("notifications")
              .select("*")
              .eq("user_id", currentUser.id)
              .order("created_at", { ascending: false });

          if (!ignore && !notificationError) {
            loadedNotifications = notificationData || [];
          }
        } catch (err) {
          console.error("Notifications load exception:", err);
        }

        // 8. Reminders Sync (Deduplicated)
        try {
          const currentReminders = computeUpcomingReminders(
            loadedPets,
            loadedVaccinations,
            loadedAppointments
          );
          const newNotifs = await syncRemindersToNotifications(
            currentUser.id,
            currentReminders,
            loadedNotifications
          );
          if (!ignore && newNotifs.length > 0) {
            refreshNotifications();
          }
        } catch (remErr) {
          console.warn("Reminder sync notice:", remErr);
        }
      } catch (error) {
        console.error("Dashboard init error:", error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      ignore = true;
    };
  }, [navigate]);

  // =========================
  // UPCOMING REMINDERS & SUMMARY
  // =========================
  const upcomingReminders = useMemo(() => {
    return computeUpcomingReminders(pets, vaccinations, appointments);
  }, [pets, vaccinations, appointments]);

  const vaxSummary = useMemo(() => {
    return getVaccinationSummary(vaccinations);
  }, [vaccinations]);

  // Defensively deduplicated active services for appointment booking (Issue 4)
  const activeUniqueServices = useMemo(() => {
    return deduplicateServices(services).filter((s) => Boolean(s.active));
  }, [services]);

  // Compute next upcoming appointment & total active count (Requirement 8)
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return appointments
      .filter((a) => {
        const status = (a.status || "").toLowerCase();
        if (status === "cancelled" || status === "completed") return false;
        if (!a.appointment_date) return false;
        const [y, m, d] = a.appointment_date.split("-").map(Number);
        const aptDate = new Date(y, m - 1, d);
        return aptDate >= now;
      })
      .sort((a, b) => {
        const d1 = new Date(`${a.appointment_date}T${a.appointment_time || "00:00"}`);
        const d2 = new Date(`${b.appointment_date}T${b.appointment_time || "00:00"}`);
        return d1 - d2;
      });
  }, [appointments]);

  const nextAppointment = upcomingAppointments[0] || null;
  const upcomingAppointmentsCount = upcomingAppointments.length;
  const historyAppointmentsCount = useMemo(() => {
    return Math.max(0, appointments.length - upcomingAppointmentsCount);
  }, [appointments.length, upcomingAppointmentsCount]);

  const filteredAppointments = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return appointments.filter((apt) => {
      const status = (apt.status || "scheduled").toLowerCase();
      let isUpcoming = false;
      if (apt.appointment_date) {
        const [y, m, d] = apt.appointment_date.split("-").map(Number);
        const aptDate = new Date(y, m - 1, d);
        isUpcoming = aptDate >= now && status !== "cancelled" && status !== "completed";
      }

      if (appointmentFilterTab === "upcoming") {
        return isUpcoming;
      }
      if (appointmentFilterTab === "history") {
        return !isUpcoming || status === "completed" || status === "cancelled";
      }
      return true; // 'all'
    });
  }, [appointments, appointmentFilterTab]);

  // Escape key handler for appointment modal (Requirement 23)
  useEffect(() => {
    if (!showAppointment) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowAppointment(false);
        setAppointmentFormError("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAppointment]);

  // =========================
  // PET MANAGEMENT HANDLERS (PHASE 3)
  // =========================
  const handleOpenAddPet = () => {
    setSelectedPetForEdit(null);
    setShowPetFormModal(true);
  };

  const handleOpenEditPet = (pet) => {
    setSelectedPetForEdit(pet);
    setShowPetFormModal(true);
  };

  const handleViewPet = (pet) => {
    setSelectedPetForDetails(pet);
  };

  const handleOpenDeletePet = (pet) => {
    setSelectedPetForDelete(pet);
  };

  const handleClosePetFormModal = () => {
    setShowPetFormModal(false);
    setSelectedPetForEdit(null);
  };

  const handleSavePet = async (petFormData) => {
    if (!user) return;
    setSavingPet(true);
    try {
      if (selectedPetForEdit) {
        const updated = await updatePet(user.id, selectedPetForEdit.id, petFormData);
        setPets((curr) => curr.map((p) => (p.id === updated.id ? updated : p)));
        if (selectedPetForDetails?.id === updated.id) {
          setSelectedPetForDetails(updated);
        }
        setToast({
          type: "success",
          message: `${updated.name}'s profile has been updated!`,
        });
      } else {
        const created = await createPet(user.id, petFormData);
        setPets((curr) => [created, ...curr]);
        setToast({
          type: "success",
          message: `${created.name} was added to your pets!`,
        });
      }
      handleClosePetFormModal();
    } catch (error) {
      console.error("Save pet error:", error);
      throw error;
    } finally {
      setSavingPet(false);
    }
  };

  const handleConfirmDeletePet = async (petToDelete) => {
    if (!user || !petToDelete) return;
    setDeletingPet(true);
    try {
      await deletePet(user.id, petToDelete.id);
      setPets((curr) => curr.filter((p) => p.id !== petToDelete.id));
      if (selectedPetForDetails?.id === petToDelete.id) {
        setSelectedPetForDetails(null);
      }
      setToast({
        type: "success",
        message: `${petToDelete.name} was removed from your pets.`,
      });
      setSelectedPetForDelete(null);
    } catch (error) {
      console.error("Delete pet error:", error);
      setToast({
        type: "error",
        message: error.message || "Failed to delete pet.",
      });
    } finally {
      setDeletingPet(false);
    }
  };

  // BOOK APPOINTMENT MODAL OPENER (Issue 4)
  const handleOpenBookAppointment = async (petId = null) => {
    if (petId) {
      setAppointmentPet(petId);
    } else if (pets.length > 0 && !appointmentPet) {
      setAppointmentPet(pets[0].id);
    }
    setAppointmentFormError("");
    setAppointmentBookingStep("form");
    setShowAppointment(true);

    // Refresh active services from Supabase so admin changes are immediately visible
    try {
      const { data: latestServices, error: sErr } = await supabase
        .from("services")
        .select("*")
        .order("name");

      if (!sErr && latestServices && latestServices.length > 0) {
        setServices(deduplicateServices(latestServices));
      }
    } catch (e) {
      console.warn("Could not refresh services on modal open:", e);
    }
  };

  // SHORTCUTS FROM PET DETAILS MODAL
  const handlePetBookAppointment = (pet) => {
    handleOpenBookAppointment(pet?.id);
  };

  // =========================
  // HEALTH RECORD HANDLERS (PHASE 5)
  // =========================
  const handleOpenAddHealthRecord = (initialPetId = null) => {
    setSelectedHealthRecordForEdit(
      initialPetId ? { pet_id: initialPetId } : null
    );
    setShowHealthRecordModal(true);
  };

  const handleOpenEditHealthRecord = (record) => {
    setSelectedHealthRecordForEdit(record);
    setShowHealthRecordModal(true);
  };

  const handleCloseHealthRecordModal = () => {
    setShowHealthRecordModal(false);
    setSelectedHealthRecordForEdit(null);
  };

  const handleSaveHealthRecord = async (formData, recordId) => {
    if (!user) return;
    const ownedPet = pets.find((p) => String(p.id) === String(formData.pet_id));
    if (!ownedPet) {
      setToast({
        type: "error",
        message: "Selected pet does not belong to your account.",
      });
      return;
    }
    setSavingHealthRecord(true);
    try {
      if (recordId) {
        // Edit existing
        const updated = await updateHealthRecord(user.id, recordId, formData);
        setHealthRecords((curr) =>
          curr.map((r) => (r.id === updated.id ? updated : r))
        );
        setToast({
          type: "success",
          message: "Health record updated successfully.",
        });
      } else {
        // Create new
        const created = await createHealthRecord(user.id, formData);
        setHealthRecords((curr) => [created, ...curr]);
        setToast({
          type: "success",
          message: "Health record added successfully.",
        });
      }
      handleCloseHealthRecordModal();
    } catch (error) {
      console.error("Save health record error:", error);
      throw error;
    } finally {
      setSavingHealthRecord(false);
    }
  };

  const handleOpenDeleteHealthRecord = (record) => {
    setSelectedHealthRecordForDelete(record);
  };

  const handleConfirmDeleteHealthRecord = async (recordToDelete) => {
    if (!user || !recordToDelete) return;
    setDeletingHealthRecord(true);
    try {
      await deleteHealthRecord(user.id, recordToDelete.id);
      setHealthRecords((curr) => curr.filter((r) => r.id !== recordToDelete.id));
      setSelectedHealthRecordForDelete(null);
      setToast({
        type: "success",
        message: "Health record deleted successfully.",
      });
    } catch (error) {
      console.error("Delete health record error:", error);
      setToast({
        type: "error",
        message: error.message || "Unable to delete this record.",
      });
    } finally {
      setDeletingHealthRecord(false);
    }
  };

  // =========================
  // VACCINATION HANDLERS (PHASE 5)
  // =========================
  const handleOpenAddVaccination = (initialPetId = null) => {
    setSelectedVaccinationForEdit(
      initialPetId ? { pet_id: initialPetId } : null
    );
    setShowVaccinationModal(true);
  };

  const handleOpenEditVaccination = (vax) => {
    setSelectedVaccinationForEdit(vax);
    setShowVaccinationModal(true);
  };

  const handleCloseVaccinationModal = () => {
    setShowVaccinationModal(false);
    setSelectedVaccinationForEdit(null);
  };

  const handleSaveVaccination = async (formData, vaccineId) => {
    if (!user) return;
    const ownedPet = pets.find((p) => String(p.id) === String(formData.pet_id));
    if (!ownedPet) {
      setToast({
        type: "error",
        message: "Selected pet does not belong to your account.",
      });
      return;
    }
    setSavingVaccination(true);
    try {
      if (vaccineId) {
        const updated = await updateVaccination(user.id, vaccineId, formData);
        setVaccinations((curr) =>
          curr.map((v) => (v.id === updated.id ? updated : v))
        );
        setToast({
          type: "success",
          message: "Vaccination record updated successfully.",
        });
      } else {
        const created = await createVaccination(user.id, formData);
        setVaccinations((curr) => [created, ...curr]);
        setToast({
          type: "success",
          message: "Vaccination record added successfully.",
        });
      }
      handleCloseVaccinationModal();
    } catch (error) {
      console.error("Save vaccination error:", error);
      throw error;
    } finally {
      setSavingVaccination(false);
    }
  };

  const handleOpenDeleteVaccination = (vax) => {
    setSelectedVaccinationForDelete(vax);
  };

  const handleConfirmDeleteVaccination = async (vaxToDelete) => {
    if (!user || !vaxToDelete) return;
    setDeletingVaccination(true);
    try {
      await deleteVaccination(user.id, vaxToDelete.id);
      setVaccinations((curr) => curr.filter((v) => v.id !== vaxToDelete.id));
      setSelectedVaccinationForDelete(null);
      setToast({
        type: "success",
        message: "Vaccination record deleted successfully.",
      });
    } catch (error) {
      console.error("Delete vaccination error:", error);
      setToast({
        type: "error",
        message: error.message || "Unable to delete this record.",
      });
    } finally {
      setDeletingVaccination(false);
    }
  };

  // =========================
  // APPOINTMENT HANDLERS (PHASE 4 & DEMO PAYMENT)
  // =========================
  const handleProceedToPayment = (e) => {
    if (e) e.preventDefault();
    setAppointmentFormError("");

    if (!appointmentPet) {
      setAppointmentFormError(
        pets.length === 0
          ? "Please add a pet first before booking an appointment."
          : "Please select a pet."
      );
      return;
    }

    // Security validation: verify pet belongs to logged-in user
    const ownedPet = pets.find((p) => String(p.id) === String(appointmentPet));
    if (!ownedPet) {
      setAppointmentFormError("Selected pet does not belong to your account.");
      return;
    }

    if (!appointmentService) {
      setAppointmentFormError("Please select a service.");
      return;
    }

    // Security validation: verify service exists and is active
    const chosenService = services.find((s) => String(s.id) === String(appointmentService));
    if (
      !chosenService ||
      chosenService.active === false ||
      chosenService.is_active === false
    ) {
      setAppointmentFormError("The selected service is currently unavailable or inactive.");
      return;
    }

    if (!appointmentDate) {
      setAppointmentFormError("Please select an appointment date.");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (appointmentDate < todayStr) {
      setAppointmentFormError("Appointment date cannot be in the past.");
      return;
    }

    if (!appointmentTime) {
      setAppointmentFormError("Please select a preferred time.");
      return;
    }

    // Security validation: prevent duplicate booking conflicts
    const hasConflict = appointments.some((apt) => {
      const existingTime = apt.appointment_time ? apt.appointment_time.slice(0, 5) : "";
      const selectedTime = appointmentTime ? appointmentTime.slice(0, 5) : "";
      return (
        String(apt.pet_id) === String(appointmentPet) &&
        apt.appointment_date === appointmentDate &&
        existingTime === selectedTime &&
        (apt.status || "scheduled").toLowerCase() !== "cancelled"
      );
    });
    if (hasConflict) {
      setAppointmentFormError(
        "This pet already has an appointment booked at this exact date and time."
      );
      return;
    }

    // Validated: Proceed to Demo Payment Review step
    setAppointmentBookingStep("payment");
  };

  const handleConfirmDemoBooking = async (paymentInfo) => {
    if (!user || isCreatingAppointmentRef.current || savingAppointment) return null;
    isCreatingAppointmentRef.current = true;
    const chosenService = services.find((s) => String(s.id) === String(appointmentService));
    const servicePrice =
      chosenService?.price !== undefined &&
      chosenService?.price !== null &&
      !isNaN(Number(chosenService.price))
        ? Number(chosenService.price)
        : null;

    setSavingAppointment(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          owner_id: user.id,
          pet_id: appointmentPet,
          service_id: chosenService?.id || null,
          service_type: getServiceName(appointmentService),
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          notes: appointmentNotes.trim() || null,
          status: "scheduled",
          amount: servicePrice,
          payment_status: "pending", // Strictly 'pending' for demo, NOT 'paid'
          razorpay_order_id: null,
          razorpay_payment_id: null,
          razorpay_signature: null,
        })
        .select()
        .single();

      if (error) {
        console.error("Booking error:", error);
        throw error;
      }

      setAppointments((current) =>
        [...current, data].sort((a, b) => {
          const dateA = `${a.appointment_date} ${a.appointment_time}`;
          const dateB = `${b.appointment_date} ${b.appointment_time}`;
          return dateA.localeCompare(dateB);
        })
      );

      // Notification
      await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          title: "Appointment booked",
          message: `Your appointment for ${getPetName(appointmentPet)} (${getServiceName(
            appointmentService
          )}) has been scheduled for ${formatAppointmentDate(appointmentDate)} at ${formatAppointmentTime(appointmentTime)}. (Demo payment confirmed).`,
          type: "appointment",
          is_read: false,
        });

      refreshNotifications();

      setToast({
        type: "success",
        message: "Appointment booked (Demo Mode)!",
      });

      return data;
    } catch (err) {
      console.error("Error booking appointment in demo flow:", err);
      throw err;
    } finally {
      setSavingAppointment(false);
      isCreatingAppointmentRef.current = false;
    }
  };

  const handleCloseAppointmentModal = () => {
    setShowAppointment(false);
    setAppointmentPet("");
    setAppointmentService("");
    setAppointmentDate("");
    setAppointmentTime("");
    setAppointmentNotes("");
    setAppointmentFormError("");
    setAppointmentBookingStep("form");
  };

  // APPOINTMENT CANCELLATION (PHASE 8 DATA INTEGRITY)
  const handleCancelAppointment = async (appointmentId) => {
    if (!user || !appointmentId) return;
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId)
        .eq("owner_id", user.id);

      if (error) throw error;

      setAppointments((current) =>
        current.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt
        )
      );

      const targetApt = appointments.find((a) => a.id === appointmentId);
      if (targetApt) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: "Appointment cancelled",
          message: `Your appointment for ${getPetName(targetApt.pet_id)} (${targetApt.service_type}) on ${formatCalendarDate(targetApt.appointment_date)} has been cancelled.`,
          type: "appointment",
          is_read: false,
        });
        refreshNotifications();
      }

      setToast({
        type: "info",
        message: "Appointment has been cancelled.",
      });
    } catch (err) {
      console.error("Cancel appointment error:", err);
      setToast({
        type: "error",
        message: "Could not cancel appointment. Please try again.",
      });
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  // HELPERS
  const getPetName = (petId) => {
    const pet = pets.find((item) => String(item.id) === String(petId));
    return pet?.name || "Pet";
  };

  const getServiceName = (serviceId) => {
    const service = services.find((item) => String(item.id) === String(serviceId));
    return service?.name || serviceId || "Service";
  };

  const scrollToSection = (e, sectionId) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    const targetId = typeof e === "string" ? e : sectionId;
    if (!targetId) return;
    setActiveSection(targetId);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // PET CATEGORY FILTERS & RETRY HANDLERS
  const petFilterCategories = ["All", "Dogs", "Cats", "Other"];

  const handleRetryPets = async () => {
    if (!user) return;
    setPetsLoading(true);
    setPetsError(false);
    try {
      const loaded = await fetchUserPets(user.id);
      setPets(loaded || []);
    } catch (err) {
      console.error("Retry pets error:", err);
      setPetsError(true);
    } finally {
      setPetsLoading(false);
    }
  };

  const handleRetryAppointments = async () => {
    if (!user) return;
    setAppointmentsLoading(true);
    setAppointmentsError(false);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("owner_id", user.id)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });
      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error("Retry appointments error:", err);
      setAppointmentsError(true);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const filteredPets = pets.filter((pet) => {
    const q = petSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      pet.name?.toLowerCase().includes(q) ||
      pet.breed?.toLowerCase().includes(q) ||
      pet.species?.toLowerCase().includes(q) ||
      pet.color?.toLowerCase().includes(q);

    const matchesSpecies = (() => {
      if (selectedSpeciesFilter === "All") return true;
      const sp = (pet.species || "").toLowerCase().trim();
      if (selectedSpeciesFilter === "Dogs" || selectedSpeciesFilter === "Dog") {
        return sp === "dog" || sp === "dogs";
      }
      if (selectedSpeciesFilter === "Cats" || selectedSpeciesFilter === "Cat") {
        return sp === "cat" || sp === "cats";
      }
      if (selectedSpeciesFilter === "Other") {
        return sp !== "dog" && sp !== "dogs" && sp !== "cat" && sp !== "cats";
      }
      return sp === selectedSpeciesFilter.toLowerCase();
    })();

    return matchesSearch && matchesSpecies;
  });

  // FILTERED HEALTH RECORDS & VACCINATIONS
  const filteredHealthRecords = healthRecords.filter((rec) => {
    if (healthPetFilter === "all") return true;
    return String(rec.pet_id) === String(healthPetFilter);
  });

  const filteredVaccinations = vaccinations.filter((vax) => {
    if (healthPetFilter === "all") return true;
    return String(vax.pet_id) === String(healthPetFilter);
  });

  const firstPet = pets[0];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <PawPrint size={35} />
        <p>Loading your PAWLIO dashboard...</p>
      </div>
    );
  }

  const greetingTime = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();
  const userDisplayName =
    profileName?.split(" ")[0] ||
    user?.user_metadata?.full_name?.split(" ")[0] ||
    "Pet Parent";

  return (
    <div className="dashboard-page">
      {/* ================= SIDEBAR ================= */}
      <DashboardSidebar activeItem={activeSection} />

      {/* ================= MAIN ================= */}
      <main className="dashboard-main" id="dashboard">
        <div className="dashboard-page-container">
          {/* HEADER */}
          <header className="dashboard-header">
          <div>
            <span className="section-label">PET CARE DASHBOARD</span>
            <h1>{greetingTime}, {userDisplayName} 👋</h1>
            <p>
              Here's what's happening with your pet family today.
            </p>
          </div>

          <div className="dashboard-header-right">
            <button
              type="button"
              className="dashboard-notification"
              onClick={() => navigate("/notifications")}
              aria-label="View notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-indicator"></span>}
            </button>
            <Link to="/profile" className="dashboard-avatar-btn" title="View profile">
              {profileAvatar ? (
                <img src={profileAvatar} alt={userDisplayName} />
              ) : (
                <span>{userDisplayName.charAt(0).toUpperCase()}</span>
              )}
            </Link>
          </div>
        </header>

        {/* ================= QUICK ACTIONS BAR ================= */}
        <div className="dashboard-quick-actions-bar">
          <button
            type="button"
            className="quick-action-pill primary"
            onClick={handleOpenAddPet}
          >
            <Plus size={15} />
            <span>Add Pet</span>
          </button>
          <button
            type="button"
            className="quick-action-pill"
            onClick={() => handleOpenBookAppointment()}
          >
            <CalendarCheck size={15} />
            <span>Book Appointment</span>
          </button>
          <button
            type="button"
            className="quick-action-pill"
            onClick={() => handleOpenAddHealthRecord()}
          >
            <Heart size={15} />
            <span>Add Health Record</span>
          </button>
          <button
            type="button"
            className="quick-action-pill"
            onClick={() => handleOpenAddVaccination()}
          >
            <ShieldCheck size={15} />
            <span>Add Vaccination</span>
          </button>
        </div>

        {/* ================= SUMMARY STATS (4 Premium Cards) ================= */}
        <section className="dashboard-stats">
          {/* 1. My Pets */}
          <div className="dashboard-stat-card" onClick={() => scrollToSection("pets-section")}>
            <div className="stat-icon">
              <PawPrint size={22} />
            </div>
            <div className="stat-info-col">
              <span className="stat-title">My Pets</span>
              <strong className="stat-value">{pets.length}</strong>
              <small className="stat-sub">Your pet family</small>
            </div>
          </div>

          {/* 2. Upcoming Appointments */}
          <div className="dashboard-stat-card" onClick={() => scrollToSection("appointments")}>
            <div className="stat-icon">
              <CalendarCheck size={22} />
            </div>
            <div className="stat-info-col">
              <span className="stat-title">Upcoming Appointments</span>
              <strong className="stat-value">{upcomingAppointmentsCount}</strong>
              <small className="stat-sub">Scheduled visits</small>
            </div>
          </div>

          {/* 3. Vaccinations */}
          <div className="dashboard-stat-card" onClick={() => { setActiveSection("health"); setHealthSubTab("vaccinations"); }}>
            <div className="stat-icon">
              <ShieldCheck size={22} />
            </div>
            <div className="stat-info-col">
              <span className="stat-title">Vaccinations</span>
              <strong className="stat-value">{vaxSummary.total}</strong>
              <small className="stat-sub">
                {vaxSummary.total === 0 ? (
                  "No records added"
                ) : vaxSummary.dueSoon > 0 ? (
                  <span style={{ color: "#C98A3D", fontWeight: 600 }}>{vaxSummary.dueSoon} Due Soon</span>
                ) : vaxSummary.overdue > 0 ? (
                  <span style={{ color: "#C65D5D", fontWeight: 600 }}>{vaxSummary.overdue} Overdue</span>
                ) : (
                  "Up to date"
                )}
              </small>
            </div>
          </div>

          {/* 4. Notifications */}
          <div className="dashboard-stat-card" onClick={() => navigate("/notifications")}>
            <div className="stat-icon">
              <Bell size={22} />
            </div>
            <div className="stat-info-col">
              <span className="stat-title">Notifications</span>
              <strong className="stat-value">{unreadCount}</strong>
              <small className="stat-sub">{upcomingReminders.length} Active alerts</small>
            </div>
          </div>
        </section>

        {/* ================= FEATURED UPCOMING APPOINTMENT ================= */}
        {nextAppointment && (
          <div className="featured-appointment-card">
            <div className="featured-apt-left">
              <div className="featured-apt-badge">
                <span className="featured-apt-dot"></span>
                <span>UPCOMING APPOINTMENT</span>
                <span className={`appointment-status status-${(nextAppointment.status || "scheduled").toLowerCase()}`}>
                  {nextAppointment.status || "Scheduled"}
                </span>
              </div>
              <h3 className="featured-apt-title">
                {nextAppointment.service_type || nextAppointment.service?.name || "Pet Service"}
              </h3>
              <p className="featured-apt-details">
                For <strong>{getPetName(nextAppointment.pet_id) || nextAppointment.pet?.name || "Your Pet"}</strong> ·{" "}
                <strong>{formatCalendarDate(nextAppointment.appointment_date)}</strong> at{" "}
                <strong>{formatAppointmentTime(nextAppointment.appointment_time) || "Scheduled Time"}</strong>
              </p>
            </div>
            <div className="featured-apt-right">
              <button
                type="button"
                className="btn-featured-view"
                onClick={() => {
                  const el = document.getElementById("appointments");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                View Appointment →
              </button>
            </div>
          </div>
        )}

        {/* ================= PRIMARY PET HERO / GET STARTED ================= */}
        {firstPet ? (
          <section className="pet-profile-card">
            <div className="pet-profile-image">
              {firstPet.photo_url ? (
                <img
                  src={firstPet.photo_url}
                  alt={firstPet.name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="pet-placeholder">
                  <PawPrint size={38} />
                </div>
              )}
            </div>

            <div className="pet-profile-info">
              <span className="section-label">PRIMARY PET</span>
              <h2>{firstPet.name}</h2>
              <p>
                {firstPet.breed
                  ? `${firstPet.breed} · ${firstPet.species}`
                  : firstPet.species}
              </p>
              <div className="pet-tags">
                <span className="pet-status-chip">Active Profile</span>
                {firstPet.gender && <span>{firstPet.gender}</span>}
                {calculatePetAge(firstPet.date_of_birth) && (
                  <span>{calculatePetAge(firstPet.date_of_birth)}</span>
                )}
              </div>
            </div>

            <button
              className="outline-dashboard-btn"
              onClick={handleOpenAddPet}
            >
              Add another pet
              <Plus size={16} />
            </button>
          </section>
        ) : (
          <section className="pet-profile-card empty-pet-card">
            <div className="empty-pet-icon">
              <PawPrint size={32} />
            </div>

            <div className="pet-profile-info">
              <span className="section-label">GET STARTED</span>
              <h2>Add your first pet</h2>
              <p>Create a pet profile to start tracking health records, vaccinations, and appointments.</p>
            </div>

            <button
              className="outline-dashboard-btn"
              onClick={handleOpenAddPet}
            >
              Add Pet
              <Plus size={16} />
            </button>
          </section>
        )}

        {/* ================= PART 4 — DASHBOARD UPCOMING REMINDERS ================= */}
        <section className="reminders-section">
          <div className="reminders-header">
            <div className="reminders-header-left">
              <div className="bell-badge">
                <Clock3 size={18} />
              </div>
              <div>
                <span className="section-label">TIMELY ALERTS</span>
                <h3>Upcoming Reminders</h3>
              </div>
            </div>

            {upcomingReminders.length > 0 && (
              <span className="reminders-count-badge">
                {upcomingReminders.length} Active {upcomingReminders.length === 1 ? "Alert" : "Alerts"}
              </span>
            )}
          </div>

          {upcomingReminders.length === 0 ? (
            <div className="reminders-empty">
              <Bell size={24} />
              <p>You're all caught up. No upcoming vaccinations or appointments due.</p>
            </div>
          ) : (
            <div className="reminders-timeline">
              {upcomingReminders.map((reminder, idx) => {
                const isOverdue = reminder.urgency === "high" && reminder.title.includes("Overdue");
                const isUrgent = reminder.urgency === "high" && !isOverdue;
                const isLast = idx === upcomingReminders.length - 1;

                return (
                  <div key={reminder.id} className="timeline-item">
                    <div className="timeline-rail">
                      <div className={`timeline-marker ${isOverdue ? "marker-overdue" : isUrgent ? "marker-urgent" : "marker-normal"}`}>
                        {reminder.type === "vaccination" ? <ShieldCheck size={13} /> : <CalendarCheck size={13} />}
                      </div>
                      {!isLast && <div className="timeline-line"></div>}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-top">
                        <strong className="timeline-title">{reminder.title}</strong>
                        <span
                          className={`reminder-tag ${
                            isOverdue
                              ? "tag-overdue"
                              : isUrgent
                              ? "tag-urgent"
                              : "tag-upcoming"
                          }`}
                        >
                          {isOverdue
                            ? "Overdue"
                            : reminder.daysDiff === 0
                            ? "Due Today"
                            : reminder.daysDiff === 1
                            ? "Tomorrow"
                            : `In ${reminder.daysDiff} days`}
                        </span>
                      </div>
                      <p className="timeline-text">{reminder.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ================= MY PETS SECTION (PHASE 3) ================= */}
        <section className="dashboard-card" id="pets-section">
          <div className="dashboard-card-header">
            <div className="dashboard-card-header-text">
              <span className="section-label">MY PETS</span>
              <h2 className="section-title">Your Pets</h2>
              <p className="section-subtitle">
                Manage profiles, health details, and care information for all your pets.
              </p>
            </div>

            <button
              type="button"
              className="dashboard-header-action-btn"
              onClick={handleOpenAddPet}
              title="Add a new pet profile"
            >
              <Plus size={16} />
              <span>Add Pet</span>
            </button>
          </div>

          {petsError ? (
            <div className="section-error-state">
              <AlertCircle size={26} color="#C65D5D" />
              <p>Unable to load your pets.</p>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleRetryPets}
              >
                Try Again
              </button>
            </div>
          ) : petsLoading ? (
            <div className="pet-grid-skeleton">
              {[1, 2, 3].map((n) => (
                <div key={n} className="pet-card-skeleton">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
                    <div className="skeleton-shimmer" style={{ width: 82, height: 82, borderRadius: 16 }} />
                    <div className="skeleton-shimmer" style={{ width: 70, height: 24, borderRadius: 20 }} />
                  </div>
                  <div className="skeleton-shimmer" style={{ width: "60%", height: 22, marginTop: 8 }} />
                  <div className="skeleton-shimmer" style={{ width: "40%", height: 16 }} />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <div className="skeleton-shimmer" style={{ width: 60, height: 26, borderRadius: 8 }} />
                    <div className="skeleton-shimmer" style={{ width: 70, height: 26, borderRadius: 8 }} />
                  </div>
                  <div className="skeleton-shimmer" style={{ width: "100%", height: 38, borderRadius: 10, marginTop: 12 }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {pets.length > 0 && (
                <div className="pet-management-bar">
                  <div className="pet-filter-row">
                    <div className="pet-search-box">
                      <Search size={16} />
                      <input
                        type="text"
                        className="pet-search-input"
                        placeholder="Search pets by name, breed..."
                        value={petSearch}
                        onChange={(e) => setPetSearch(e.target.value)}
                        aria-label="Search pets by name or breed"
                      />
                    </div>

                    <div className="pet-species-pills" role="toolbar" aria-label="Filter pets by category">
                      {petFilterCategories.map((sp) => (
                        <button
                          key={sp}
                          type="button"
                          className={`pet-pill ${
                            selectedSpeciesFilter === sp ? "active" : ""
                          }`}
                          onClick={() => setSelectedSpeciesFilter(sp)}
                        >
                          {sp}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {pets.length === 0 ? (
                <div className="pet-empty-state">
                  <div className="pet-empty-icon">
                    <PawPrint size={28} />
                  </div>
                  <h4>No pets added yet</h4>
                  <p>
                    Add your first pet to start managing their health, appointments and care history.
                  </p>
                  <button
                    type="button"
                    className="pet-empty-btn"
                    onClick={handleOpenAddPet}
                  >
                    <Plus size={16} />
                    <span>Add Your First Pet</span>
                  </button>
                </div>
              ) : filteredPets.length === 0 ? (
                <div className="pet-empty-state" style={{ padding: "34px 20px" }}>
                  <div className="pet-empty-icon" style={{ background: "#f3f4f6", color: "#6b7280" }}>
                    <Search size={24} />
                  </div>
                  <h4>No pets found</h4>
                  <p>
                    No pets matching "{petSearch || selectedSpeciesFilter}". Try adjusting your search or filters.
                  </p>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ marginTop: 6 }}
                    onClick={() => {
                      setPetSearch("");
                      setSelectedSpeciesFilter("All");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="pets-grid">
                  {filteredPets.map((pet) => (
                    <PetCard
                      key={pet.id}
                      pet={pet}
                      onView={handleViewPet}
                      onEdit={handleOpenEditPet}
                      onDelete={handleOpenDeletePet}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* ================= APPOINTMENTS SECTION ================= */}
        <section id="appointments" className="dashboard-card appointment-section">
          <div className="dashboard-card-header">
            <div className="dashboard-card-header-text">
              <span className="section-label">APPOINTMENTS</span>
              <h2 className="section-title">Appointments &amp; Care Schedule</h2>
              <p className="section-subtitle">
                View upcoming visits and keep track of your pet's care history.
              </p>
            </div>

            <button
              type="button"
              className="dashboard-header-action-btn"
              onClick={() => handleOpenBookAppointment()}
              title="Book a new care appointment"
            >
              <Plus size={16} />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* TABS (Upcoming / History / All) */}
          <div className="appointment-segmented-tabs" role="tablist" aria-label="Appointment view filters">
            <button
              type="button"
              role="tab"
              aria-selected={appointmentFilterTab === "upcoming"}
              className={`appointment-tab-btn ${appointmentFilterTab === "upcoming" ? "active" : ""}`}
              onClick={() => setAppointmentFilterTab("upcoming")}
            >
              <span>Upcoming</span>
              <span className="appointment-tab-count">{upcomingAppointmentsCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={appointmentFilterTab === "history"}
              className={`appointment-tab-btn ${appointmentFilterTab === "history" ? "active" : ""}`}
              onClick={() => setAppointmentFilterTab("history")}
            >
              <span>History</span>
              <span className="appointment-tab-count">{historyAppointmentsCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={appointmentFilterTab === "all"}
              className={`appointment-tab-btn ${appointmentFilterTab === "all" ? "active" : ""}`}
              onClick={() => setAppointmentFilterTab("all")}
            >
              <span>All</span>
              <span className="appointment-tab-count">{appointments.length}</span>
            </button>
          </div>

          {appointmentsError ? (
            <div className="section-error-state">
              <AlertCircle size={26} color="#C65D5D" />
              <p>Unable to load appointments.</p>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleRetryAppointments}
              >
                Try Again
              </button>
            </div>
          ) : appointmentsLoading ? (
            <div className="appointment-list">
              {[1, 2].map((n) => (
                <div key={n} className="appointment-card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1.2 }}>
                    <div className="skeleton-shimmer" style={{ width: 44, height: 44, borderRadius: 12 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                      <div className="skeleton-shimmer" style={{ width: "70%", height: 18 }} />
                      <div className="skeleton-shimmer" style={{ width: "40%", height: 14 }} />
                    </div>
                  </div>
                  <div className="skeleton-shimmer" style={{ width: 180, height: 36, borderRadius: 10 }} />
                  <div className="skeleton-shimmer" style={{ width: 100, height: 28, borderRadius: 20 }} />
                </div>
              ))}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="appointment-empty-state">
              <div className="appointment-empty-icon">
                <CalendarCheck size={28} />
              </div>
              <h4>
                {appointmentFilterTab === "upcoming"
                  ? "No upcoming appointments"
                  : appointmentFilterTab === "history"
                  ? "No appointment history yet"
                  : "No appointments booked yet"}
              </h4>
              <p>
                {appointmentFilterTab === "upcoming"
                  ? "Your pet's care schedule is clear for now."
                  : appointmentFilterTab === "history"
                  ? "Past completed or cancelled appointments will appear here."
                  : "Schedule your pet's veterinary visits, grooming, and health checks."}
              </p>
              {appointmentFilterTab !== "history" && (
                <button
                  type="button"
                  className="pet-empty-btn"
                  onClick={() => {
                    if (pets.length > 0 && !appointmentPet) {
                      setAppointmentPet(pets[0].id);
                    }
                    setShowAppointment(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Book Appointment</span>
                </button>
              )}
            </div>
          ) : (
            <div className="appointment-list">
              {filteredAppointments.map((appointment) => {
                const status = (appointment.status || "scheduled").toLowerCase();
                const petName = getPetName(appointment.pet_id) || "Your Pet";
                const serviceTitle = appointment.service_type || appointment.service?.name || "Care Consultation";
                const formattedDate = formatAppointmentDate(appointment.appointment_date);
                const formattedTime = formatAppointmentTime(appointment.appointment_time);

                return (
                  <div className="appointment-card" key={appointment.id}>
                    {/* LEFT: ICON + SERVICE & PET */}
                    <div className="appointment-card-main">
                      <div className="appointment-card-icon" aria-hidden="true">
                        <CalendarCheck size={22} />
                      </div>
                      <div className="appointment-card-details">
                        <h4 className="appointment-service-name">
                          {serviceTitle}
                        </h4>
                        <p className="appointment-pet-name">
                          <PawPrint size={13} />
                          <span>{petName}</span>
                        </p>
                      </div>
                    </div>

                    {/* CENTER: TIMEZONE-SAFE DATE & TIME (NO SECONDS) */}
                    <div className="appointment-card-datetime">
                      <div className="apt-dt-row">
                        <Calendar size={14} className="apt-dt-icon" />
                        <span className="apt-date-text">{formattedDate}</span>
                      </div>
                      <div className="apt-dt-row">
                        <Clock size={14} className="apt-dt-icon" />
                        <span className="apt-time-text">{formattedTime}</span>
                      </div>
                    </div>

                    {/* AMOUNT & PAYMENT INFO (DEMO MODE) */}
                    {((appointment.amount !== null && appointment.amount !== undefined) || appointment.payment_status) && (
                      <div className="appointment-card-payment-info">
                        {appointment.amount !== null && appointment.amount !== undefined && (
                          <span className="appointment-amount-tag">₹{appointment.amount}</span>
                        )}
                        {appointment.payment_status && (
                          <span className={`appointment-payment-pill payment-${appointment.payment_status}`}>
                            {appointment.payment_status === "pending" ? "Demo (Pending)" : appointment.payment_status}
                          </span>
                        )}
                      </div>
                    )}

                    {/* RIGHT: STATUS BADGE + CANCEL ACTION */}
                    <div className="appointment-card-actions">
                      <span className={`appointment-status-pill status-${status}`}>
                        <span className="status-indicator-dot"></span>
                        <span>{appointment.status || "Scheduled"}</span>
                      </span>

                      {status === "scheduled" && (
                        <button
                          type="button"
                          className="btn-appointment-cancel"
                          onClick={() => handleCancelAppointment(appointment.id)}
                          title="Cancel this appointment"
                          aria-label={`Cancel appointment for ${petName}`}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ================= PET HEALTH & VACCINATIONS (PHASE 5) ================= */}
        <section className="dashboard-card" id="health">
          <div className="dashboard-card-header" style={{ marginBottom: 16 }}>
            <div>
              <span className="section-label">PREVENTIVE CARE & RECORDS</span>
              <h3>Pet Health & Vaccinations</h3>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {healthSubTab === "records" ? (
                <button
                  className="text-dashboard-btn"
                  onClick={() => handleOpenAddHealthRecord()}
                >
                  <Plus size={15} />
                  Add Health Record
                </button>
              ) : (
                <button
                  className="text-dashboard-btn"
                  onClick={() => handleOpenAddVaccination()}
                >
                  <Plus size={15} />
                  Add Vaccination
                </button>
              )}
            </div>
          </div>

          {/* SUB-TABS & PET FILTER */}
          <div className="health-tabs-container">
            <div className="health-nav-tabs">
              <button
                type="button"
                className={`health-tab-btn ${
                  healthSubTab === "records" ? "active" : ""
                }`}
                onClick={() => setHealthSubTab("records")}
              >
                <Heart size={16} />
                <span>Health Records</span>
                <span className="health-tab-badge">
                  {filteredHealthRecords.length}
                </span>
              </button>

              <button
                type="button"
                className={`health-tab-btn ${
                  healthSubTab === "vaccinations" ? "active" : ""
                }`}
                onClick={() => setHealthSubTab("vaccinations")}
              >
                <ShieldCheck size={16} />
                <span>Vaccinations</span>
                <span className="health-tab-badge">
                  {filteredVaccinations.length}
                </span>
              </button>
            </div>

            {pets.length > 1 && (
              <div className="health-controls-row">
                <select
                  className="health-pet-select"
                  value={healthPetFilter}
                  onChange={(e) => setHealthPetFilter(e.target.value)}
                  aria-label="Filter by pet"
                >
                  <option value="all">All Pets</option>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* TAB 1: HEALTH RECORDS */}
          {healthSubTab === "records" && (
            <div>
              {filteredHealthRecords.length === 0 ? (
                <div className="health-empty-state">
                  <div className="empty-icon">
                    <Heart size={26} />
                  </div>
                  <p>No health records yet.</p>
                  <small>
                    Track checkups, surgeries, medications, and general vet notes for your pets.
                  </small>
                  <button
                    type="button"
                    className="auth-submit"
                    style={{ width: "auto", marginTop: 10, padding: "0 22px" }}
                    onClick={() => handleOpenAddHealthRecord()}
                  >
                    + Add Health Record
                  </button>
                </div>
              ) : (
                <div className="health-records-grid">
                  {filteredHealthRecords.map((record) => (
                    <div className="health-card" key={record.id}>
                      <div className="health-card-header">
                        <div className="health-card-main">
                          <div className="health-card-icon">
                            <Stethoscope size={20} />
                          </div>

                          <div className="health-card-titles">
                            <div className="health-card-title-row">
                              <h4>{record.title}</h4>
                              <span className="health-type-pill">
                                {record.record_type}
                              </span>
                            </div>

                            <div className="health-card-meta">
                              <span className="pet-tag">
                                {getPetName(record.pet_id)}
                              </span>
                              <span>·</span>
                              <span>{formatCalendarDate(record.record_date)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="health-card-actions">
                          <button
                            type="button"
                            className="health-btn-action"
                            title="Edit record"
                            aria-label="Edit health record"
                            onClick={() => handleOpenEditHealthRecord(record)}
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            type="button"
                            className="health-btn-action danger"
                            title="Delete record"
                            aria-label="Delete health record"
                            onClick={() => handleOpenDeleteHealthRecord(record)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {record.description && (
                        <div className="health-card-body">
                          {record.description}
                        </div>
                      )}

                      {(record.veterinarian || record.follow_up_date || record.notes) && (
                        <div className="health-card-footer">
                          {record.veterinarian ? (
                            <span className="health-vet-label">
                              <strong>Veterinarian:</strong> {record.veterinarian}
                            </span>
                          ) : <span></span>}

                          {record.follow_up_date && (
                            <span>
                              <strong>Follow-up:</strong> {formatCalendarDate(record.follow_up_date)}
                            </span>
                          )}

                          {record.notes && (
                            <span style={{ fontStyle: "italic" }}>
                              Note: {record.notes}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VACCINATIONS */}
          {healthSubTab === "vaccinations" && (
            <div>
              {filteredVaccinations.length === 0 ? (
                <div className="health-empty-state">
                  <div className="empty-icon">
                    <ShieldCheck size={26} />
                  </div>
                  <p>No vaccination records yet.</p>
                  <small>
                    Manage Rabies, DHPP, Bordetella, and track due dates with automatic status monitoring.
                  </small>
                  <button
                    type="button"
                    className="auth-submit"
                    style={{ width: "auto", marginTop: 10, padding: "0 22px" }}
                    onClick={() => handleOpenAddVaccination()}
                  >
                    + Add Vaccination
                  </button>
                </div>
              ) : (
                <div className="vaccinations-grid">
                  {filteredVaccinations.map((vax) => {
                    const statusInfo = calculateVaccinationStatus(vax.next_due_date);

                    return (
                      <div className="vaccination-card" key={vax.id}>
                        <div className="vaccination-card-top">
                          <div>
                            <div className="vaccination-card-pet-name">
                              {getPetName(vax.pet_id)}
                            </div>
                            <h4 className="vaccination-card-vaccine-name">
                              {vax.vaccine_name}
                            </h4>
                          </div>

                          <span className={`vaccine-status-pill ${statusInfo.badgeClass}`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="vaccination-dates-box">
                          <div className="vax-date-col">
                            <span>Given</span>
                            <strong>{formatCalendarDate(vax.date_given)}</strong>
                          </div>

                          <div className="vax-date-col">
                            <span>Next Due</span>
                            <strong>{formatCalendarDate(vax.next_due_date)}</strong>
                          </div>
                        </div>

                        {vax.veterinarian && (
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                            <strong>Vet:</strong> {vax.veterinarian}
                          </div>
                        )}

                        {vax.notes && (
                          <div className="vaccination-notes">
                            {vax.notes}
                          </div>
                        )}

                        <div className="vaccination-card-actions">
                          <button
                            type="button"
                            onClick={() => handleOpenEditVaccination(vax)}
                            title="Edit vaccination"
                          >
                            <Pencil size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            className="danger"
                            onClick={() => handleOpenDeleteVaccination(vax)}
                            title="Delete vaccination"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ================= NOTIFICATIONS SECTION ================= */}
        <section id="notifications" className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <span className="section-label">NOTIFICATIONS</span>
              <h3>Your Notifications</h3>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="btn-mark-all"
                  style={{ height: "34px", fontSize: "12px", padding: "0 12px" }}
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              )}
              <Link
                to="/notifications"
                className="text-dashboard-btn"
                style={{ fontSize: "13px" }}
              >
                View all notifications
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="empty-dashboard-state">
              <Bell size={28} />
              <p>You're all caught up.</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  className={`notification-item ${
                    notification.is_read
                      ? "notification-read"
                      : "notification-unread"
                  }`}
                  key={notification.id}
                  onClick={() =>
                    !notification.is_read && markAsRead(notification.id)
                  }
                  style={{
                    cursor: !notification.is_read ? "pointer" : "default",
                  }}
                  title={!notification.is_read ? "Click to mark as read" : ""}
                >
                  <div className="notification-icon">
                    <Bell size={19} />
                  </div>

                  <div className="notification-info">
                    <strong>{notification.title}</strong>
                    <span>{notification.message}</span>
                    <small>
                      {formatNotificationTime(notification.created_at)}
                    </small>
                  </div>

                  {!notification.is_read && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="notification-dot"></span>
                      <button
                        type="button"
                        className="btn-mark-single-read"
                        style={{ height: 26, fontSize: "11px", padding: "0 8px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        Mark as read
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* MOBILE LOGOUT */}
        <button
          type="button"
          className="dashboard-mobile-logout"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogOut size={16} />
          {loggingOut ? "Signing out..." : "Sign Out"}
        </button>
        </div>
      </main>

      {/* ================= MODALS ================= */}

      {/* PHASE 3: PET FORM MODAL */}
      <PetFormModal
        isOpen={showPetFormModal}
        initialPet={selectedPetForEdit}
        onClose={handleClosePetFormModal}
        onSubmit={handleSavePet}
        isSubmitting={savingPet}
      />

      {/* PHASE 3 & PHASE 5: PET DETAILS MODAL */}
      <PetDetailsModal
        isOpen={!!selectedPetForDetails}
        pet={selectedPetForDetails}
        onClose={() => setSelectedPetForDetails(null)}
        onEdit={handleOpenEditPet}
        onDelete={handleOpenDeletePet}
        onBookAppointment={handlePetBookAppointment}
        onAddHealthRecord={(pet) => handleOpenAddHealthRecord(pet.id)}
        onAddVaccination={(pet) => handleOpenAddVaccination(pet.id)}
        healthRecords={healthRecords}
        vaccinations={vaccinations}
      />

      {/* PHASE 3: DELETE PET MODAL */}
      <DeletePetModal
        isOpen={!!selectedPetForDelete}
        pet={selectedPetForDelete}
        onClose={() => setSelectedPetForDelete(null)}
        onConfirm={handleConfirmDeletePet}
        isDeleting={deletingPet}
      />

      {/* PHASE 5: HEALTH RECORD MODAL (ADD & EDIT) */}
      <HealthRecordModal
        isOpen={showHealthRecordModal}
        initialRecord={selectedHealthRecordForEdit}
        pets={pets}
        onClose={handleCloseHealthRecordModal}
        onSubmit={handleSaveHealthRecord}
        isSaving={savingHealthRecord}
      />

      {/* PHASE 5: DELETE HEALTH RECORD MODAL */}
      <DeleteHealthRecordModal
        isOpen={!!selectedHealthRecordForDelete}
        record={selectedHealthRecordForDelete}
        petName={getPetName(selectedHealthRecordForDelete?.pet_id)}
        onClose={() => setSelectedHealthRecordForDelete(null)}
        onConfirm={handleConfirmDeleteHealthRecord}
        isDeleting={deletingHealthRecord}
      />

      {/* PHASE 5: VACCINATION MODAL (ADD & EDIT) */}
      <VaccinationModal
        isOpen={showVaccinationModal}
        initialVaccination={selectedVaccinationForEdit}
        pets={pets}
        onClose={handleCloseVaccinationModal}
        onSubmit={handleSaveVaccination}
        isSaving={savingVaccination}
      />

      {/* PHASE 5: DELETE VACCINATION MODAL */}
      <DeleteVaccinationModal
        isOpen={!!selectedVaccinationForDelete}
        vaccination={selectedVaccinationForDelete}
        petName={getPetName(selectedVaccinationForDelete?.pet_id)}
        onClose={() => setSelectedVaccinationForDelete(null)}
        onConfirm={handleConfirmDeleteVaccination}
        isDeleting={deletingVaccination}
      />

      {/* PHASE 4: APPOINTMENT MODAL */}
      {showAppointment && (
        <div
          className="pet-modal-overlay"
          onClick={handleCloseAppointmentModal}
        >
          <div className="pet-modal appointment-booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pet-modal-header">
              <div>
                <span className="section-label">
                  {appointmentBookingStep === "payment"
                    ? "APPOINTMENT SUMMARY & PAYMENT"
                    : "APPOINTMENT BOOKING"}
                </span>
                <h2>
                  {appointmentBookingStep === "payment"
                    ? "Demo Payment Checkout"
                    : "Book a Care Visit"}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseAppointmentModal}
                className="pet-modal-close"
                aria-label="Close booking modal"
              >
                <X size={20} />
              </button>
            </div>

            {appointmentBookingStep === "payment" ? (
              <DemoPaymentFlow
                pet={pets.find((p) => String(p.id) === String(appointmentPet))}
                service={
                  services.find((s) => String(s.id) === String(appointmentService)) ||
                  activeUniqueServices.find((s) => String(s.id) === String(appointmentService))
                }
                date={appointmentDate}
                time={appointmentTime}
                notes={appointmentNotes}
                onConfirmBooking={handleConfirmDemoBooking}
                onBackToForm={() => setAppointmentBookingStep("form")}
                onCloseModal={handleCloseAppointmentModal}
                onViewAppointment={(_aptId) => {
                  handleCloseAppointmentModal();
                  setActiveSection("appointments");
                }}
              />
            ) : (
              <form className="pet-form booking-step-form" onSubmit={handleProceedToPayment}>
                {appointmentFormError && (
                  <div className="form-error-badge">{appointmentFormError}</div>
                )}

                {/* STEP 1 */}
                <div className="booking-step-block">
                  <div className="booking-step-label">
                    <span className="booking-step-num">1</span>
                    <span>Select Pet</span>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <select
                      value={appointmentPet}
                      onChange={(e) => setAppointmentPet(e.target.value)}
                      required
                    >
                      <option value="">Choose your pet</option>
                      {pets.map((pet) => (
                        <option key={pet.id} value={pet.id}>
                          {pet.name} · {pet.species} {pet.breed ? `(${pet.breed})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* STEP 2 */}
                <div className="booking-step-block">
                  <div className="booking-step-label">
                    <span className="booking-step-num">2</span>
                    <span>Select Service</span>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <select
                      value={appointmentService}
                      onChange={(e) => setAppointmentService(e.target.value)}
                      required
                    >
                      <option value="">Choose a service</option>
                      {activeUniqueServices.map((service) => {
                        const duration = service.duration_minutes
                          ? `${service.duration_minutes} mins`
                          : service.duration || "30 mins";
                        return (
                          <option key={service.id} value={service.id}>
                            {service.name} · ₹{service.price} · {duration}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* STEP 3 */}
                <div className="booking-step-block">
                  <div className="booking-step-label">
                    <span className="booking-step-num">3</span>
                    <span>Date & Preferred Time</span>
                  </div>
                  <div className="pet-form-row" style={{ marginBottom: 0 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <AppointmentTimePicker
                        id="appointmentTime"
                        value={appointmentTime}
                        onChange={(newTime) => {
                          setAppointmentTime(newTime);
                          if (appointmentFormError) setAppointmentFormError("");
                        }}
                        hasError={Boolean(appointmentFormError && !appointmentTime)}
                      />
                    </div>
                  </div>
                </div>

                {/* STEP 4 */}
                <div className="booking-step-block">
                  <div className="booking-step-label">
                    <span className="booking-step-num">4</span>
                    <span>Special Care Notes (Optional)</span>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <textarea
                      rows="2"
                      placeholder="Tell our veterinarian or groomer anything important about your pet..."
                      value={appointmentNotes}
                      onChange={(e) => setAppointmentNotes(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={savingAppointment}
                >
                  Proceed to Payment (Demo)
                  <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TOASTS */}
      {toast && (
        <PetToast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}