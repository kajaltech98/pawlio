import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  Check,
  Pencil,
  X,
  AlertCircle,
  Trash2,
  Upload,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import DashboardSidebar from "../components/layout/DashboardSidebar";
import "./profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(authUser || null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const [userRole, setUserRole] = useState("user");

  // Local file selection and preview state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [markedForRemoval, setMarkedForRemoval] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Snapshot of saved data for clean "Cancel" restoration
  const [initialData, setInitialData] = useState({
    fullName: "",
    phone: "",
    avatarUrl: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let ignore = false;

    const fetchProfile = async () => {
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

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, phone, avatar_url, created_at, updated_at")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (ignore) return;

        console.log("Authenticated user:", currentUser?.id);

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile load error:", profileError);
          console.error("Failed to load profile:", {
            error: profileError,
            userId: currentUser?.id,
          });
          setError("Unable to load your profile.");
        }

        const resolvedName =
          data?.full_name || currentUser.user_metadata?.full_name || "";
        const resolvedPhone = data?.phone || currentUser.phone || "";
        const resolvedAvatar = data?.avatar_url || "";
        const resolvedRole =
          currentUser.user_metadata?.role || "user";

        setFullName(resolvedName);
        setPhone(resolvedPhone);
        setAvatarUrl(resolvedAvatar);
        setUserRole(resolvedRole);
        setAvatarError(false);

        setInitialData({
          fullName: resolvedName,
          phone: resolvedPhone,
          avatarUrl: resolvedAvatar,
        });
      } catch (err) {
        if (!ignore) {
          console.error("Error loading profile:", err);
          setError("Unable to load your profile.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      ignore = true;
    };
  }, [authUser, navigate]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleStartEdit = () => {
    setFieldErrors({});
    setError("");
    setMessage("");
    setShowRemoveConfirm(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Revoke any created preview blob
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setMarkedForRemoval(false);
    setShowRemoveConfirm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Restore previous saved values
    setFullName(initialData.fullName);
    setPhone(initialData.phone);
    setAvatarUrl(initialData.avatarUrl);
    setAvatarError(false);
    setFieldErrors({});
    setError("");
    setIsEditing(false);
  };

  const validateImageFile = (file) => {
    if (!file) return { valid: false, error: "No file selected." };

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const fileName = (file.name || "").toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExt) {
      return {
        valid: false,
        error: "Please select a JPG, PNG, or WEBP image under 5 MB.",
      };
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: "Please select a JPG, PNG, or WEBP image under 5 MB.",
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setFieldErrors({});

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Revoke previous blob if any
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setMarkedForRemoval(false);
    setShowRemoveConfirm(false);
    setAvatarError(false);
  };

  const handleTriggerFileInput = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
    fileInputRef.current?.click();
  };

  const handleConfirmRemovePhoto = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setMarkedForRemoval(true);
    setShowRemoveConfirm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    setFieldErrors({});
    setMessage("");
    setError("");

    // Validation
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setFieldErrors({ fullName: "Full name is required." });
      return;
    }
    if (trimmedName.length < 2) {
      setFieldErrors({ fullName: "Full name must be at least 2 characters." });
      return;
    }

    setSaving(true);

    try {
      let finalAvatarUrl = avatarUrl;

      // 1. Process Removal if requested
      if (markedForRemoval) {
        finalAvatarUrl = null;
        // Optionally clean up previous file from storage if it belonged to our avatars bucket
        if (avatarUrl && avatarUrl.includes("/storage/v1/object/public/avatars/")) {
          try {
            const parts = avatarUrl.split("/storage/v1/object/public/avatars/");
            if (parts[1]) {
              await supabase.storage.from("avatars").remove([decodeURIComponent(parts[1])]);
            }
          } catch (removeErr) {
            console.warn("Storage cleanup note:", removeErr);
          }
        }
      }
      // 2. Process Upload if a new file was chosen
      else if (selectedFile) {
        setUploading(true);
        const ext = selectedFile.name.split(".").pop().toLowerCase() || "jpg";
        const sanitizedExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
        const filePath = `${user.id}/avatar-${Date.now()}.${sanitizedExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          const uploadMsg = uploadError.message || "";
          if (uploadMsg.toLowerCase().includes("bucket not found")) {
            throw new Error(
              "Storage bucket 'avatars' not found. Please create the avatars bucket in Supabase."
            );
          }
          throw new Error(
            `Unable to upload profile photo (${uploadMsg || "Storage request failed"}). Please ensure storage permissions are configured.`
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          throw new Error("Unable to retrieve public photo link.");
        }

        finalAvatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
      }

      // 3. Save profile data to Supabase database
      const sanitizedPhone = phone.trim() || null;

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: trimmedName,
          phone: sanitizedPhone,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        console.error("Profile update error:", updateError);
        setError(`Unable to update your profile: ${updateError.message || "Database update failed"}.`);
        return;
      }

      // 4. Verify and reload avatar from database to ensure persistence
      const { data: refreshedProfile, error: reloadError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url, created_at, updated_at")
        .eq("id", user.id)
        .maybeSingle();

      const persistedAvatar =
        !reloadError && refreshedProfile && refreshedProfile.avatar_url !== undefined
          ? refreshedProfile.avatar_url
          : finalAvatarUrl;

      // Clean up preview blob
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setMarkedForRemoval(false);
      setAvatarError(false);

      setAvatarUrl(persistedAvatar || "");
      setInitialData({
        fullName: trimmedName,
        phone: sanitizedPhone || "",
        avatarUrl: persistedAvatar || "",
      });

      setMessage("Profile updated successfully.");
      setIsEditing(false);

      // Hide message after 4s
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("Unexpected error saving profile:", err);
      setError(err.message || "Unable to update your profile. Please try again.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const getInitials = () => {
    const displayName =
      fullName.trim() || user?.user_metadata?.full_name?.trim() || "";
    if (displayName) {
      const parts = displayName.split(" ").filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "PA";
  };

  // Determine current active avatar to display (respects removal and new preview)
  const currentDisplayAvatar = markedForRemoval
    ? ""
    : previewUrl || avatarUrl || "";

  const formattedMemberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Active Member";

  const roleLabel =
    userRole === "admin"
      ? "Administrator"
      : "PAWLIO Member";

  if (loading) {
    return (
      <div className="profile-loading" style={{ minHeight: "100vh" }}>
        <div className="profile-loading-card">
          <div className="profile-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-layout">
      {/* HIDDEN FILE PICKER INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        style={{ display: "none" }}
        onChange={handleFileSelect}
        aria-label="Upload profile photo"
      />

      {/* SIDEBAR */}
      <DashboardSidebar activeItem="profile" />

      {/* MAIN CONTENT AREA */}
      <main className="profile-main-content">
        <div className="profile-container">
          {/* ===================================================
              PAGE HEADER
             =================================================== */}
          <header className="profile-page-header">
            <div className="profile-header-top-row">
              <button
                type="button"
                className="profile-back-button"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft size={15} />
                <span>Back to Dashboard</span>
              </button>
            </div>

            <div className="profile-header-title-block">
              <span className="profile-eyebrow">ACCOUNT</span>
              <h1 className="profile-main-heading">My Profile</h1>
              <p className="profile-subheading">
                Manage your personal information and PAWLIO account settings.
              </p>
            </div>
          </header>

          {/* GLOBAL FEEDBACK ALERTS */}
          {message && (
            <div className="profile-alert profile-alert-success" role="status">
              <Check size={18} />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="profile-alert profile-alert-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* ===================================================
              PROFILE HERO SUMMARY CARD
             =================================================== */}
          <section className="profile-hero-card" aria-label="Profile Summary">
            <div className="profile-hero-content">
              <div className="profile-hero-avatar-wrapper">
                {currentDisplayAvatar && !avatarError ? (
                  <img
                    src={currentDisplayAvatar}
                    alt={fullName || "Profile avatar"}
                    className="profile-hero-avatar-img"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div
                    className="profile-hero-avatar-initials"
                    aria-label={`Initials avatar: ${getInitials()}`}
                  >
                    {getInitials()}
                  </div>
                )}
                {isEditing && (
                  <button
                    type="button"
                    className="profile-hero-avatar-edit-overlay"
                    onClick={handleTriggerFileInput}
                    title="Change profile photo"
                    aria-label="Change profile photo"
                  >
                    <Camera size={14} />
                  </button>
                )}
              </div>

              <div className="profile-hero-details">
                <div className="profile-hero-name-row">
                  <h2 className="profile-hero-name">
                    {fullName || user?.user_metadata?.full_name || "PAWLIO Member"}
                  </h2>
                  <span
                    className={`profile-role-badge ${
                      userRole === "admin" ? "role-admin" : "role-member"
                    }`}
                  >
                    {roleLabel}
                  </span>
                </div>

                <div className="profile-hero-meta-row">
                  <span className="profile-hero-meta-item">
                    <Mail size={14} />
                    <span>{user?.email || "No email available"}</span>
                  </span>
                  {phone && (
                    <span className="profile-hero-meta-item">
                      <Phone size={14} />
                      <span>{phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-hero-actions">
              {!isEditing ? (
                <button
                  type="button"
                  className="profile-btn-edit"
                  onClick={handleStartEdit}
                >
                  <Pencil size={15} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="profile-btn-cancel-top"
                  onClick={handleCancelEdit}
                >
                  <X size={15} />
                  <span>Cancel Editing</span>
                </button>
              )}
            </div>
          </section>

          {/* ===================================================
              MAIN 2-COLUMN GRID:
              LEFT: Personal Information
              RIGHT: Account Information & Security
             =================================================== */}
          <div className="profile-grid">
            {/* COLUMN 1: PERSONAL INFORMATION */}
            <div className="profile-grid-col-main">
              <section className="profile-card profile-personal-card">
                <div className="profile-card-header">
                  <div className="profile-card-title-group">
                    <span className="profile-card-eyebrow">
                      PERSONAL INFORMATION
                    </span>
                    <h3 className="profile-card-title">
                      Your basic account information
                    </h3>
                  </div>

                  {!isEditing && (
                    <button
                      type="button"
                      className="profile-card-action-link"
                      onClick={handleStartEdit}
                    >
                      <Pencil size={13} />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  /* EDIT MODE FORM */
                  <form onSubmit={handleSaveProfile} noValidate>
                    <div className="profile-form-grid">
                      {/* FULL NAME */}
                      <div className="profile-form-group">
                        <label htmlFor="profileFullName">
                          <User size={15} />
                          <span>Full Name</span>
                          <span className="profile-req-mark">*</span>
                        </label>
                        <input
                          id="profileFullName"
                          name="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (fieldErrors.fullName) {
                              setFieldErrors((prev) => ({
                                ...prev,
                                fullName: null,
                              }));
                            }
                          }}
                          placeholder="e.g. Sarah Jenkins"
                          autoComplete="name"
                          required
                          className={fieldErrors.fullName ? "input-has-error" : ""}
                        />
                        {fieldErrors.fullName && (
                          <span className="profile-field-error">
                            {fieldErrors.fullName}
                          </span>
                        )}
                      </div>

                      {/* EMAIL (READ-ONLY) */}
                      <div className="profile-form-group">
                        <label htmlFor="profileEmail">
                          <Mail size={15} />
                          <span>Email Address</span>
                          <span className="profile-readonly-tag">(Account Email)</span>
                        </label>
                        <input
                          id="profileEmail"
                          name="email"
                          type="email"
                          value={user?.email || ""}
                          disabled
                          readOnly
                          className="input-readonly"
                        />
                        <span className="profile-field-helper">
                          Your login email is managed through your account.
                        </span>
                      </div>

                      {/* PHONE NUMBER */}
                      <div className="profile-form-group">
                        <label htmlFor="profilePhone">
                          <Phone size={15} />
                          <span>Phone Number</span>
                        </label>
                        <input
                          id="profilePhone"
                          name="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +1 (555) 234-5678"
                          autoComplete="tel"
                        />
                        <span className="profile-field-helper">
                          Used for appointment reminders and critical pet updates.
                        </span>
                      </div>

                      {/* REAL PROFILE PHOTO UPLOAD SECTION */}
                      <div className="profile-form-group profile-photo-upload-group">
                        <label className="profile-photo-section-label">
                          <Camera size={15} />
                          <span>Profile Photo</span>
                        </label>

                        <div className="profile-photo-control-card">
                          <div className="profile-photo-avatar-box">
                            {currentDisplayAvatar && !avatarError ? (
                              <img
                                src={currentDisplayAvatar}
                                alt="Selected profile photo"
                                className="profile-photo-preview-avatar"
                                onError={() => setAvatarError(true)}
                              />
                            ) : (
                              <div
                                className="profile-photo-fallback-avatar"
                                aria-label="Initials fallback avatar"
                              >
                                {getInitials()}
                              </div>
                            )}

                            <button
                              type="button"
                              className="profile-photo-camera-badge-btn"
                              onClick={handleTriggerFileInput}
                              title="Select new profile photo"
                              aria-label="Select new profile photo"
                            >
                              <Camera size={13} />
                            </button>
                          </div>

                          <div className="profile-photo-meta-box">
                            <div className="profile-photo-actions-row">
                              <button
                                type="button"
                                className="profile-btn-change-photo"
                                onClick={handleTriggerFileInput}
                                disabled={saving || uploading}
                              >
                                <Upload size={13} />
                                <span>
                                  {currentDisplayAvatar ? "Change Photo" : "Upload Photo"}
                                </span>
                              </button>

                              {currentDisplayAvatar && !showRemoveConfirm && (
                                <button
                                  type="button"
                                  className="profile-btn-remove-photo"
                                  onClick={() => setShowRemoveConfirm(true)}
                                  disabled={saving || uploading}
                                >
                                  <Trash2 size={13} />
                                  <span>Remove Photo</span>
                                </button>
                              )}
                            </div>

                            {/* REMOVE PHOTO CONFIRMATION DIALOG */}
                            {showRemoveConfirm && (
                              <div className="profile-photo-remove-confirm-box" role="alert">
                                <span className="profile-remove-confirm-text">
                                  Remove your profile photo?
                                </span>
                                <div className="profile-remove-confirm-btns">
                                  <button
                                    type="button"
                                    className="profile-btn-confirm-cancel"
                                    onClick={() => setShowRemoveConfirm(false)}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    className="profile-btn-confirm-delete"
                                    onClick={handleConfirmRemovePhoto}
                                  >
                                    Remove Photo
                                  </button>
                                </div>
                              </div>
                            )}

                            <span className="profile-photo-specs-hint">
                              JPG, PNG or WEBP • Max 5 MB
                            </span>

                            {selectedFile && (
                              <span className="profile-photo-pending-notice">
                                Ready to save: <strong>{selectedFile.name}</strong>
                              </span>
                            )}

                            {markedForRemoval && (
                              <span className="profile-photo-remove-notice">
                                Photo will be removed upon saving changes.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FORM ACTION BUTTONS */}
                    <div className="profile-form-actions">
                      <button
                        type="button"
                        className="profile-btn-cancel"
                        onClick={handleCancelEdit}
                        disabled={saving || uploading}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="profile-btn-save"
                        disabled={saving || uploading}
                      >
                        <Save size={16} />
                        <span>
                          {uploading
                            ? "Uploading..."
                            : saving
                            ? "Saving..."
                            : "Save Changes"}
                        </span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* VIEW MODE DISPLAY */
                  <div className="profile-view-details">
                    <div className="profile-details-grid">
                      <div className="profile-detail-item">
                        <span className="profile-detail-label">Full Name</span>
                        <strong className="profile-detail-value">
                          {fullName || "Not provided"}
                        </strong>
                      </div>

                      <div className="profile-detail-item">
                        <span className="profile-detail-label">Email Address</span>
                        <div className="profile-detail-email-wrap">
                          <strong className="profile-detail-value">
                            {user?.email || "Not available"}
                          </strong>
                          <span className="profile-account-pill">Login Email</span>
                        </div>
                        <span className="profile-detail-helper">
                          Your login email is managed through your account.
                        </span>
                      </div>

                      <div className="profile-detail-item">
                        <span className="profile-detail-label">Phone Number</span>
                        <strong className="profile-detail-value">
                          {phone || "Not provided"}
                        </strong>
                      </div>

                      {/* PROFILE PHOTO VIEW DISPLAY */}
                      <div className="profile-detail-item">
                        <span className="profile-detail-label">Profile Photo</span>
                        <div className="profile-view-photo-display">
                          <div className="profile-view-avatar-frame">
                            {avatarUrl && !avatarError ? (
                              <img
                                src={avatarUrl}
                                alt="Profile avatar"
                                className="profile-view-avatar-pic"
                                onError={() => setAvatarError(true)}
                              />
                            ) : (
                              <div className="profile-view-avatar-initials">
                                {getInitials()}
                              </div>
                            )}
                          </div>
                          <div className="profile-view-photo-text">
                            <strong className="profile-view-photo-status">
                              {avatarUrl
                                ? "Profile photo uploaded"
                                : "Initials avatar active"}
                            </strong>
                            <span className="profile-view-photo-sub">
                              {avatarUrl
                                ? "Stored securely in PAWLIO Storage"
                                : "Click Edit to upload a custom profile picture"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* COLUMN 2: ACCOUNT INFORMATION & SECURITY */}
            <div className="profile-grid-col-side">
              {/* ACCOUNT INFORMATION */}
              <section className="profile-card profile-account-card">
                <div className="profile-card-header">
                  <div className="profile-card-title-group">
                    <span className="profile-card-eyebrow">
                      ACCOUNT INFORMATION
                    </span>
                    <h3 className="profile-card-title">Account Details</h3>
                  </div>
                </div>

                <div className="profile-info-rows">
                  <div className="profile-info-row">
                    <div className="profile-info-text">
                      <span className="profile-info-key">Account Status</span>
                      <span className="profile-info-sub">Platform access status</span>
                    </div>
                    <div className="profile-status-badge">
                      <span className="profile-status-dot"></span>
                      <span>Active</span>
                    </div>
                  </div>

                  <div className="profile-info-row">
                    <div className="profile-info-text">
                      <span className="profile-info-key">Member Since</span>
                      <span className="profile-info-sub">Registration date</span>
                    </div>
                    <span className="profile-info-value">
                      {formattedMemberSince}
                    </span>
                  </div>

                  <div className="profile-info-row">
                    <div className="profile-info-text">
                      <span className="profile-info-key">Role</span>
                      <span className="profile-info-sub">Permission tier</span>
                    </div>
                    <span className="profile-info-value">
                      {roleLabel}
                    </span>
                  </div>
                </div>
              </section>

              {/* SECURITY */}
              <section className="profile-card profile-security-card">
                <div className="profile-card-header">
                  <div className="profile-card-title-group">
                    <span className="profile-card-eyebrow">SECURITY</span>
                    <h3 className="profile-card-title">
                      Password & Account Security
                    </h3>
                  </div>
                </div>

                <div className="profile-security-body">
                  <div className="profile-security-notice">
                    <div className="profile-security-icon-wrap">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="profile-security-notice-text">
                      <strong>Encrypted Authentication</strong>
                      <p>
                        Your PAWLIO account is authenticated securely via Supabase.
                        All credentials and tokens are encrypted end-to-end.
                      </p>
                    </div>
                  </div>

                  <div className="profile-security-action-row">
                    <div className="profile-security-action-text">
                      <span className="profile-security-action-title">Sign Out</span>
                      <p className="profile-security-action-desc">
                        End your active session on this device.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="profile-btn-signout"
                      onClick={handleLogout}
                      disabled={loggingOut}
                    >
                      <LogOut size={15} />
                      <span>{loggingOut ? "Signing Out..." : "Sign Out"}</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}