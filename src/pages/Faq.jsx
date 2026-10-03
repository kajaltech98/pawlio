import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PawPrint,
  ShieldCheck,
  CalendarCheck,
  Sparkles,
  Check,
  HelpCircle,
  ArrowRight,
  Plus,
  Minus,
} from "lucide-react";

export const FAQ_DATA = [
  {
    id: "01",
    category: "Getting Started",
    q: "What is PAWLIO and how does it help pet parents?",
    a: "PAWLIO is an all-in-one digital pet care platform designed to organize medical records, vaccination schedules, appointments, and care history into one simple, beautifully designed space.",
  },
  {
    id: "02",
    category: "Health & Vaccinations",
    q: "How does the vaccination and reminder system work?",
    a: "When you log a vaccination, PAWLIO automatically calculates expiration dates and categorizes records as 'Up to Date', 'Due Soon', or 'Overdue'. You receive timely dashboard alerts so preventive care is never missed.",
  },
  {
    id: "03",
    category: "Getting Started",
    q: "Can I manage multiple pets under a single account?",
    a: "Yes! PAWLIO supports multi-pet management. You can register dogs, cats, birds, and other companions, each with their own isolated profiles, health histories, and booking logs.",
  },
  {
    id: "04",
    category: "Appointments",
    q: "How do appointments and cancellations work?",
    a: "From your dashboard or services directory, select your pet, chosen service, and appointment slot. Scheduled visits appear on your calendar, and you can cancel or reschedule with one click.",
  },
  {
    id: "05",
    category: "Privacy & Security",
    q: "Is my pet's medical information secure?",
    a: "Yes. PAWLIO uses authenticated accounts and Supabase Row Level Security (RLS) database access controls to help protect your pet's personal health information and records.",
  },
];

export const FAQ_CATEGORIES = [
  "All",
  "Getting Started",
  "Appointments",
  "Health & Vaccinations",
  "Privacy & Security",
];

export function FaqSection() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openFaqId, setOpenFaqId] = useState("01");

  const filteredFaqs =
    selectedCategory === "All"
      ? FAQ_DATA
      : FAQ_DATA.filter((item) => item.category === selectedCategory);

  const handleToggle = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="faq-main-section" id="faq">
      <div className="faq-container">
        {/* HERO BLOCK */}
        <div className="faq-hero-block">
          <div className="faq-hero-badge">
            <Sparkles size={14} />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>

          <h1 className="faq-hero-title">
            Got questions? <br />
            <span className="hero-highlight">We've got answers.</span>
          </h1>

          <p className="faq-hero-subtitle">
            Everything you need to know about managing your pet's care with PAWLIO.
          </p>

          {/* Tasteful Pet-Care Visual Badges */}
          <div className="faq-hero-pills">
            <span className="faq-pill-tag">
              <PawPrint size={13} /> Pet Health Profiles
            </span>
            <span className="faq-pill-tag">
              <ShieldCheck size={13} /> Immunization Schedules
            </span>
            <span className="faq-pill-tag">
              <CalendarCheck size={13} /> Seamless Appointments
            </span>
          </div>
        </div>

        {/* TWO-COLUMN DESKTOP COMPOSITION */}
        <div className="faq-layout-grid">
          {/* LEFT COLUMN: STICKY HELP & INFO PANEL */}
          <aside className="faq-sidebar-panel">
            <div className="faq-sidebar-card">
              <span className="faq-sidebar-label">HELP CENTER</span>
              <h3 className="faq-sidebar-title">Need guidance with PAWLIO?</h3>
              <p className="faq-sidebar-desc">
                Find quick answers about your pet's care, appointments, vaccination schedules, and health records.
              </p>

              <div className="faq-sidebar-highlights">
                <div className="faq-highlight-item">
                  <Check size={15} />
                  <span>Centralized pet identity & records</span>
                </div>
                <div className="faq-highlight-item">
                  <Check size={15} />
                  <span>Automated booster status alerts</span>
                </div>
                <div className="faq-highlight-item">
                  <Check size={15} />
                  <span>Convenient appointment tracking</span>
                </div>
                <div className="faq-highlight-item">
                  <Check size={15} />
                  <span>Secure Supabase RLS isolation</span>
                </div>
              </div>
            </div>

            {/* HELP CARD (SECTION 12) */}
            <div className="faq-help-card">
              <div className="faq-help-icon">
                <HelpCircle size={22} />
              </div>
              <h4>Still have questions?</h4>
              <p>
                Our team is here to help you understand PAWLIO and your pet's care journey.
              </p>
              <Link to="/contact" className="faq-contact-btn">
                <span>Contact Us</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </aside>

          {/* RIGHT COLUMN: CATEGORY PILLS & ACCORDION */}
          <div className="faq-content-column">
            {/* CATEGORY FILTER PILLS (SECTION 4) */}
            <div
              className="faq-categories-row"
              role="tablist"
              aria-label="FAQ Categories"
            >
              {FAQ_CATEGORIES.map((cat) => {
                const count =
                  cat === "All"
                    ? FAQ_DATA.length
                    : FAQ_DATA.filter((f) => f.category === cat).length;
                const isActive = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`faq-cat-pill ${isActive ? "active" : ""}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      const matches =
                        cat === "All"
                          ? FAQ_DATA
                          : FAQ_DATA.filter((f) => f.category === cat);
                      if (
                        matches.length > 0 &&
                        !matches.some((f) => f.id === openFaqId)
                      ) {
                        setOpenFaqId(matches[0].id);
                      }
                    }}
                  >
                    <span>{cat}</span>
                    <span className="faq-cat-count">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* FAQ ACCORDION LIST (SECTIONS 5, 6, 7, 8, 9) */}
            <div className="faq-accordion-list">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`faq-card ${isOpen ? "open" : ""}`}
                  >
                    <button
                      type="button"
                      className="faq-question-btn"
                      onClick={() => handleToggle(faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faq.id}`}
                      id={`faq-header-${faq.id}`}
                    >
                      <div className="faq-question-left">
                        <span className="faq-num-badge">{faq.id}</span>
                        <span className="faq-question-text">{faq.q}</span>
                      </div>
                      <span
                        className={`faq-icon-bubble ${isOpen ? "open" : ""}`}
                        aria-hidden="true"
                      >
                        {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                      </span>
                    </button>

                    <div
                      id={`faq-answer-${faq.id}`}
                      role="region"
                      aria-labelledby={`faq-header-${faq.id}`}
                      className={`faq-answer-collapse ${
                        isOpen ? "expanded" : ""
                      }`}
                    >
                      <div className="faq-answer-inner">
                        <p>{faq.a}</p>
                        <div className="faq-answer-footer">
                          <span className="faq-tag-chip">{faq.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FaqBottomCta() {
  return (
    <section className="faq-cta-section">
      <div className="faq-cta-container">
        <div className="faq-cta-icon-badge">
          <PawPrint size={28} />
        </div>
        <span className="faq-cta-eyebrow">
          READY TO MAKE PET CARE SIMPLER?
        </span>
        <h2 className="faq-cta-heading">
          Keep your pet's appointments, vaccinations, health records and care information organized in one place.
        </h2>
        <div className="faq-cta-buttons">
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

export default function FaqPage({ navbar, footer }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "FAQ | PAWLIO Pet Care";
  }, []);

  return (
    <div className="faq-page-wrapper">
      {navbar}
      <FaqSection />
      <FaqBottomCta />
      {footer}
    </div>
  );
}
