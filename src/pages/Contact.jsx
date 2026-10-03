import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  PawPrint,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import "./contact.css";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    petName: "",
    subject: "General Inquiry",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const validateForm = () => {
    const newErrors = {};

    // 1. Name validation
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Please enter your full name.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Name cannot exceed 100 characters.";
    }

    // 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please provide a valid email address (e.g. name@example.com).";
    }

    // 3. Phone validation (optional field, but if provided, validate characters)
    if (formData.phone && formData.phone.trim()) {
      const phoneClean = formData.phone.trim();
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,16}$/;
      if (!phoneRegex.test(phoneClean)) {
        newErrors.phone = "Please enter a valid phone number.";
      }
    }

    // 4. Message validation
    if (!formData.message || !formData.message.trim()) {
      newErrors.message = "Please enter your message details.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    } else if (formData.message.trim().length > 2500) {
      newErrors.message = "Message cannot exceed 2500 characters.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmittingRef.current || submitting) return;

    setGeneralError("");
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setGeneralError("Please correct the highlighted fields before submitting.");
      return;
    }

    setErrors({});
    isSubmittingRef.current = true;
    setSubmitting(true);

    // Simulate submission delay with robust error catching
    setTimeout(() => {
      try {
        setSubmitting(false);
        setSubmitted(true);
        isSubmittingRef.current = false;
      } catch (err) {
        console.error("Contact submission error:", err);
        setSubmitting(false);
        setGeneralError("Unable to send your message right now. Please try again.");
        isSubmittingRef.current = false;
      }
    }, 500);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      petName: "",
      subject: "General Inquiry",
      message: "",
    });
    setErrors({});
    setGeneralError("");
    setSubmitted(false);
    isSubmittingRef.current = false;
  };

  return (
    <section className="contact-main-section" id="contact-content">
      <div className="contact-container">
        {/* HERO BLOCK */}
        <div className="contact-hero-block">
          <div className="contact-hero-badge">
            <Sparkles size={14} />
            <span>GET IN TOUCH</span>
          </div>

          <h1 className="contact-hero-title">
            We're here for <br />
            <span className="hero-highlight">you and your pet.</span>
          </h1>

          <p className="contact-hero-subtitle">
            Have questions about PAWLIO, appointment bookings, immunization tracking, or veterinary clinic onboarding? Our dedicated care support team is here to help.
          </p>

          <div className="contact-hero-pills">
            <span className="contact-pill-tag">
              <PawPrint size={14} /> Dedicated Pet Care Team
            </span>
            <span className="contact-pill-tag">
              <Clock size={14} /> Fast Response Within 4 Hours
            </span>
            <span className="contact-pill-tag">
              <ShieldCheck size={14} /> 24/7 Clinical Emergency Line
            </span>
          </div>
        </div>

        {/* TWO-COLUMN GRID */}
        <div className="contact-layout-grid">
          {/* LEFT: DIRECT COMMUNICATION INFO */}
          <aside className="contact-info-panel">
            <div className="contact-info-card">
              <span className="contact-card-eyebrow">DIRECT COMMUNICATION</span>
              <h2 className="contact-card-title">Reach Out to Us</h2>
              <p className="contact-card-desc">
                Contact our customer support desk, clinical coordination partners, or emergency veterinary line anytime.
              </p>

              <div className="contact-channels-list">
                {/* Email Channel */}
                <div className="contact-channel-item">
                  <div className="contact-channel-icon">
                    <Mail size={19} />
                  </div>
                  <div className="contact-channel-details">
                    <span className="contact-channel-label">Email Support</span>
                    <a
                      href="mailto:hello@pawlio.com"
                      className="contact-channel-value"
                    >
                      hello@pawlio.com
                    </a>
                    <span className="contact-channel-subtext">
                      Inquiries & platform assistance
                    </span>
                  </div>
                </div>

                {/* Phone Channel */}
                <div className="contact-channel-item">
                  <div className="contact-channel-icon">
                    <Phone size={19} />
                  </div>
                  <div className="contact-channel-details">
                    <span className="contact-channel-label">Care Assistance</span>
                    <a
                      href="tel:+18005557294"
                      className="contact-channel-value"
                    >
                      +1 (800) 555-PAW-HELP
                    </a>
                    <span className="contact-channel-subtext">
                      Toll-free customer guidance
                    </span>
                  </div>
                </div>

                {/* HQ Location */}
                <div className="contact-channel-item">
                  <div className="contact-channel-icon">
                    <MapPin size={19} />
                  </div>
                  <div className="contact-channel-details">
                    <span className="contact-channel-label">Headquarters</span>
                    <span className="contact-channel-value">
                      108 Health Boulevard, Suite 400
                    </span>
                    <span className="contact-channel-subtext">
                      Pet Wellness District, CA 94107
                    </span>
                  </div>
                </div>

                {/* Hours */}
                <div className="contact-channel-item">
                  <div className="contact-channel-icon">
                    <Clock size={19} />
                  </div>
                  <div className="contact-channel-details">
                    <span className="contact-channel-label">Care Hours</span>
                    <span className="contact-channel-value">
                      Monday – Sunday, 8am – 8pm EST
                    </span>
                    <span className="contact-channel-subtext">
                      Emergency clinical lines active 24/7
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* EMERGENCY HELPLINE CALLOUT */}
            <div className="contact-helpline-card">
              <div className="contact-helpline-badge">
                <HeartHandshake size={14} />
                <span>Urgent Clinical Assistance</span>
              </div>
              <a href="tel:+18005557294" className="contact-helpline-number">
                +1 (800) 555-7294
              </a>
              <p className="contact-helpline-desc">
                If your pet requires immediate attention, our verified veterinary hotline is available around the clock.
              </p>
            </div>
          </aside>

          {/* RIGHT: INTERACTIVE CONTACT FORM */}
          <div className="contact-form-panel">
            <div className="contact-form-header">
              <h2 className="contact-form-title">Send Us a Message</h2>
              <p className="contact-form-desc">
                Fill in the details below and a PAWLIO care specialist will get back to you promptly.
              </p>
            </div>

            {submitted ? (
              <div className="contact-success-state">
                <div className="contact-success-icon">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="contact-success-title">Message Received!</h3>
                <p className="contact-success-desc">
                  Thank you for contacting PAWLIO, <strong>{formData.name || "Pet Parent"}</strong>. We have received your inquiry and our care team will follow up via email at <strong>{formData.email || "your email"}</strong> within 4 hours.
                </p>
                <button
                  type="button"
                  className="contact-success-reset-btn"
                  onClick={handleReset}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                {generalError && (
                  <div className="contact-error-banner" role="alert">
                    <AlertCircle size={18} />
                    <span>{generalError}</span>
                  </div>
                )}

                <div className="contact-form-row">
                  <div className="contact-form-group">
                    <label className="contact-form-label" htmlFor="contact-name">
                      Full Name <span>*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.name}
                      onChange={handleChange}
                      className={`contact-form-input ${errors.name ? "has-error" : ""}`}
                    />
                    {errors.name && <span className="contact-field-error">{errors.name}</span>}
                  </div>

                  <div className="contact-form-group">
                    <label className="contact-form-label" htmlFor="contact-email">
                      Email Address <span>*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. sarah@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`contact-form-input ${errors.email ? "has-error" : ""}`}
                    />
                    {errors.email && <span className="contact-field-error">{errors.email}</span>}
                  </div>
                </div>

                <div className="contact-form-row">
                  <div className="contact-form-group">
                    <label className="contact-form-label" htmlFor="contact-phone">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      placeholder="e.g. +1 (555) 234-5678"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`contact-form-input ${errors.phone ? "has-error" : ""}`}
                    />
                    {errors.phone && <span className="contact-field-error">{errors.phone}</span>}
                  </div>

                  <div className="contact-form-group">
                    <label className="contact-form-label" htmlFor="contact-pet">
                      Pet Name & Breed (Optional)
                    </label>
                    <input
                      id="contact-pet"
                      name="petName"
                      type="text"
                      placeholder="e.g. Bruno (Golden Retriever)"
                      value={formData.petName}
                      onChange={handleChange}
                      className="contact-form-input"
                    />
                  </div>
                </div>

                <div className="contact-form-group">
                  <label className="contact-form-label" htmlFor="contact-subject">
                    Topic / Department <span>*</span>
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="contact-form-select"
                  >
                    <option value="General Inquiry">General Question / Feedback</option>
                    <option value="Appointments">Appointment Booking & Scheduling</option>
                    <option value="Health Records">Health Records & Vaccinations</option>
                    <option value="Account Support">Account & Login Assistance</option>
                    <option value="Clinic Partner">Veterinary Partner Onboarding</option>
                  </select>
                </div>

                <div className="contact-form-group">
                  <div className="contact-label-with-counter">
                    <label className="contact-form-label" htmlFor="contact-message">
                      Message Details <span>*</span>
                    </label>
                    <span className="contact-char-count">
                      {formData.message.length}/2500
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Please describe how we can assist you and your pet..."
                    value={formData.message}
                    onChange={handleChange}
                    className={`contact-form-textarea ${errors.message ? "has-error" : ""}`}
                  />
                  {errors.message && <span className="contact-field-error">{errors.message}</span>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="contact-form-submit-btn"
                >
                  <span>{submitting ? "Sending..." : "Send Message"}</span>
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactBottomCta() {
  return (
    <section className="contact-cta-section">
      <div className="contact-cta-container">
        <div className="contact-cta-badge">
          <PawPrint size={26} />
        </div>
        <span className="contact-cta-eyebrow">
          READY TO MAKE PET CARE SIMPLER?
        </span>
        <h2 className="contact-cta-heading">
          Keep your pet's appointments, vaccinations, health records and care information organized in one place.
        </h2>
        <div className="contact-cta-buttons">
          <Link to="/register" className="faq-cta-primary-btn">
            <span>Get Started</span>
            <ArrowRight size={17} />
          </Link>
          <a href="/#services" className="faq-cta-secondary-btn">
            <span>Explore Services</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default function ContactPage({ navbar, footer }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Contact PAWLIO | Pet Care Management";
  }, []);

  return (
    <div className="contact-page-wrapper">
      {navbar}
      <ContactSection />
      <ContactBottomCta />
      {footer}
    </div>
  );
}
