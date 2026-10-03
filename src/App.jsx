import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";

import {
  PawPrint,
  Heart,
  ShieldCheck,
  CalendarCheck,
  Bell,
  ArrowRight,
  Scissors,
  Stethoscope,
  Home as HomeIcon,
  Dumbbell,
  Star,
  CheckCircle2,
  Menu,
  X,
  ChevronDown,
  Clock,
} from "lucide-react";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/profile.jsx";
import Notifications from "./pages/Notifications.jsx";
import Settings from "./pages/Settings.jsx";
import FaqPage, { FaqSection } from "./pages/Faq.jsx";
import ContactPage from "./pages/Contact.jsx";
import BlogPage from "./pages/Blog.jsx";
import ArticleDetailPage from "./pages/ArticleDetail.jsx";

// Phase 7: Professional Admin Dashboard
import AdminRoute from "./components/admin/AdminRoute.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminPets from "./pages/admin/AdminPets.jsx";
import AdminAppointments from "./pages/admin/AdminAppointments.jsx";
import AdminServices from "./pages/admin/AdminServices.jsx";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicOnlyRoute from "./components/PublicOnlyRoute.jsx";

import "./App.css";


/* =========================================================
   NAVBAR
========================================================= */

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleAnchorClick = (e, targetId) => {
    closeMenu();
    if (location.pathname === "/") {
      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const isFaqPage = location.pathname === "/faq" || location.pathname === "/FAQ";
  const isBlogPage = location.pathname.startsWith("/blog");
  const isContactPage =
    location.pathname === "/contact" ||
    location.pathname === "/contact-us" ||
    location.pathname === "/Contact";
  const isHomePage = location.pathname === "/";

  return (
    <header className="navbar">

      <div className="nav-container">

        <Link to="/" className="logo" onClick={closeMenu}>
          <span className="logo-icon">
            <PawPrint size={21} />
          </span>

          <span>PAWLIO</span>
        </Link>


        <nav className={`nav-menu ${menuOpen ? "show" : ""}`}>

          <Link
            to="/"
            className={isHomePage ? "active" : ""}
            onClick={closeMenu}
          >
            Home
          </Link>

          <a href="/#about" onClick={(e) => handleAnchorClick(e, "about")}>
            About
          </a>

          <a href="/#services" onClick={(e) => handleAnchorClick(e, "services")}>
            Services
          </a>

          <a href="/#how-it-works" onClick={(e) => handleAnchorClick(e, "how-it-works")}>
            How It Works
          </a>

          <Link
            to="/blog"
            className={isBlogPage ? "active" : ""}
            onClick={closeMenu}
          >
            Blog
          </Link>

          <Link
            to="/faq"
            className={isFaqPage ? "active" : ""}
            onClick={closeMenu}
          >
            FAQ
          </Link>

          <Link
            to="/contact"
            className={isContactPage ? "active" : ""}
            onClick={closeMenu}
          >
            Contact
          </Link>


          <div className="mobile-nav-buttons">
            {user ? (
              <Link
                to="/dashboard"
                className="mobile-register"
                onClick={closeMenu}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="mobile-login"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="mobile-register"
                  onClick={closeMenu}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

        </nav>


        <div className="desktop-nav-buttons">
          {user ? (
            <Link to="/dashboard" className="nav-cta">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="login-btn">
                Login
              </Link>

              <Link to="/register" className="nav-cta">
                Get Started
              </Link>
            </>
          )}
        </div>


        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>

      </div>

    </header>
  );
}


/* =========================================================
   HOME PAGE
========================================================= */

function Home({ scrollTo } = {}) {
  useEffect(() => {
    if (scrollTo) {
      const timer = setTimeout(() => {
        const el = document.getElementById(scrollTo);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [scrollTo]);

  const services = [
    {
      icon: <Stethoscope size={26} />,
      title: "Veterinary Care",
      price: "From ₹500",
      duration: "30 mins",
      description:
        "Comprehensive health consultations, preventive wellness exams, and clinical checkups.",
    },
    {
      icon: <Scissors size={26} />,
      title: "Pet Grooming",
      price: "From ₹600",
      duration: "45 mins",
      description:
        "Professional bath, coat styling, nail trimming, and ear cleaning for fresh and happy pets.",
    },
    {
      icon: <HomeIcon size={26} />,
      title: "Boarding & Daycare",
      price: "From ₹800",
      duration: "Day / Night",
      description:
        "Safe, climate-controlled, and cage-free environment with 24/7 attentive supervision.",
    },
    {
      icon: <Dumbbell size={26} />,
      title: "Behavioral Training",
      price: "From ₹1,000",
      duration: "60 mins",
      description:
        "Positive reinforcement coaching for socialization, leash walking, and obedience manners.",
    },
  ];

  return (
    <>
      {/* =====================================================
          1. HERO (Section 11, 12)
      ===================================================== */}
      <section className="hero" id="home">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <PawPrint size={14} />
              <span>PET CARE, SIMPLIFIED</span>
            </div>

            <h1>
              Smarter care for <br />
              <span className="hero-highlight">happier pets.</span>
            </h1>

            <p>
              Manage your pet's health, appointments, vaccinations and everyday care — all from one simple place.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="primary-btn">
                <span>Get Started</span>
                <ArrowRight size={18} />
              </Link>

              <a href="#services" className="secondary-btn">
                <span>Explore Services</span>
              </a>
            </div>

            <div className="hero-features">
              <div>
                <ShieldCheck size={18} />
                <span>Private & Secure</span>
              </div>
              <div>
                <CalendarCheck size={18} />
                <span>Easy Booking</span>
              </div>
              <div>
                <Bell size={18} />
                <span>Smart Reminders</span>
              </div>
            </div>
          </div>

          {/* HERO EDITORIAL IMAGE + FLOATING CARDS */}
          <div className="hero-image-area">
            <div className="hero-image-container">
              <img
                src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=85"
                alt="Happy golden retriever"
              />
            </div>

            {/* FLOATING CARD 1: VACCINATION */}
            <div className="floating-card hero-float-vax">
              <div className="floating-icon green">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <strong>Vaccination up to date</strong>
                <span>Bruno · Next due Jan 2027</span>
              </div>
            </div>

            {/* FLOATING CARD 2: NEXT APPOINTMENT */}
            <div className="floating-card hero-float-appt">
              <div className="floating-icon orange">
                <CalendarCheck size={18} />
              </div>
              <div>
                <strong>Next appointment</strong>
                <span>Tomorrow · 5:00 PM</span>
              </div>
            </div>

            {/* FLOATING CARD 3: CENTRALIZED RECORDS BENEFIT */}
            <div className="floating-card hero-float-health">
              <div className="floating-icon teal">
                <ShieldCheck size={18} />
              </div>
              <div>
                <strong>All care in one place</strong>
                <span>Records, visits & reminders</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. TRUST / VALUE STRIP (Section 13)
      ===================================================== */}
      <section className="trust-strip">
        <div className="trust-container">
          <div className="trust-item">
            <PawPrint size={20} className="trust-icon" />
            <div>
              <strong>Complete Pet Profiles</strong>
              <span>Centralized IDs & medical info</span>
            </div>
          </div>

          <div className="trust-divider" />

          <div className="trust-item">
            <CalendarCheck size={20} className="trust-icon" />
            <div>
              <strong>Easy Appointments</strong>
              <span>Simple online scheduling</span>
            </div>
          </div>

          <div className="trust-divider" />

          <div className="trust-item">
            <Heart size={20} className="trust-icon" />
            <div>
              <strong>Health Records</strong>
              <span>Clinical history & prescriptions</span>
            </div>
          </div>

          <div className="trust-divider" />

          <div className="trust-item">
            <Bell size={20} className="trust-icon" />
            <div>
              <strong>Smart Reminders</strong>
              <span>Automated vaccination alerts</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          3. WHY PAWLIO (Section 14)
      ===================================================== */}
      <section className="why-section" id="why-pawlio">
        <div className="section-container">
          <div className="center-heading">
            <span className="section-label">WHY PAWLIO</span>
            <h2>
              Everything your pet needs. <br />
              <span className="hero-highlight">Nothing you don't.</span>
            </h2>
            <p>
              Designed around what modern pet parents actually need — organized, reliable, and stress-free care.
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <PawPrint size={24} />
              </div>
              <h3>Complete Pet Profiles</h3>
              <p>
                Keep your pet's essential information, microchip, weight logs, and emergency contacts organized in one place.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <Heart size={24} />
              </div>
              <h3>Health Records</h3>
              <p>
                Keep important health history, clinical checkups, medications, and veterinary notes accessible anytime.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <Bell size={24} />
              </div>
              <h3>Smart Reminders</h3>
              <p>
                Stay ahead of upcoming booster vaccinations and veterinary checkups with automated, timely reminders.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <CalendarCheck size={24} />
              </div>
              <h3>Easy Booking</h3>
              <p>
                Book pet-care services with clinics, groomers, and trainers without unnecessary phone calls or paperwork.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          4. SERVICES (Section 15)
      ===================================================== */}
      <section className="services-section" id="services">
        <div className="section-container">
          <div className="section-heading">
            <div>
              <span className="section-label">OUR SERVICES</span>
              <h2>
                Care designed around <br />
                <span className="hero-highlight">your pet.</span>
              </h2>
            </div>
            <p>
              Explore trusted pet-care services and manage bookings seamlessly from your personal dashboard.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <div className="service-card" key={service.title}>
                <div className="service-card-top">
                  <div className="service-icon">{service.icon}</div>
                  <div className="service-tags">
                    <span className="service-price-tag">{service.price}</span>
                    <span className="service-duration-tag">{service.duration}</span>
                  </div>
                </div>

                <h3>{service.title}</h3>
                <p>{service.description}</p>

                <div className="service-card-bottom">
                  <Link to="/register" className="service-link">
                    <span>Book Service</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          5. HOW IT WORKS (Section 16)
      ===================================================== */}
      <section className="how-section" id="how-it-works">
        <div className="section-container">
          <div className="center-heading">
            <span className="section-label">HOW IT WORKS</span>
            <h2>
              Getting started is <span className="hero-highlight">simple.</span>
            </h2>
            <p>Four easy steps to take complete control of your pet's wellness journey.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">01</span>
              <div className="step-icon">
                <PawPrint size={22} />
              </div>
              <h3>Create your account</h3>
              <p>Sign up in under a minute with secure email credentials to unlock your private dashboard.</p>
            </div>

            <div className="step-card">
              <span className="step-number">02</span>
              <div className="step-icon">
                <Heart size={22} />
              </div>
              <h3>Add your pet</h3>
              <p>Input your companion's details, birthday, breed, photo, and existing medical baseline.</p>
            </div>

            <div className="step-card">
              <span className="step-number">03</span>
              <div className="step-icon">
                <CalendarCheck size={22} />
              </div>
              <h3>Manage their care</h3>
              <p>Log health records, record vaccinations, and book clinic appointments with ease.</p>
            </div>

            <div className="step-card">
              <span className="step-number">04</span>
              <div className="step-icon">
                <Bell size={22} />
              </div>
              <h3>Stay on track</h3>
              <p>Receive automatic alerts before vaccines expire and view timely reminders on your feed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          6. PET CARE VISUAL / ABOUT STORY (Section 17)
      ===================================================== */}
      <section className="about-section" id="about">
        <div className="about-container">
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=85"
              alt="Dogs playing together"
            />
            <div className="experience-card">
              <Heart size={20} fill="currentColor" />
              <div>
                <strong>Care comes first</strong>
                <span>Designed with love for pet parents</span>
              </div>
            </div>
          </div>

          <div className="about-content">
            <span className="section-label">THE PAWLIO STORY</span>
            <h2>
              Your pet's story, <br />
              <span className="hero-highlight">all in one place.</span>
            </h2>

            <p>
              Managing your pet's healthcare, vaccinations, appointments, and daily routines shouldn't require multiple notebooks, lost papers, and phone tag with clinics.
            </p>

            <p>
              PAWLIO unifies your pet's entire life journey into an intuitive, calm digital passport that you can access anywhere, anytime.
            </p>

            <div className="about-points">
              <div>
                <CheckCircle2 size={18} />
                <span>Centralized pet profiles & digital identity</span>
              </div>
              <div>
                <CheckCircle2 size={18} />
                <span>Preventive health records & medical history</span>
              </div>
              <div>
                <CheckCircle2 size={18} />
                <span>Automated vaccine due date monitoring</span>
              </div>
              <div>
                <CheckCircle2 size={18} />
                <span>Fast, reliable appointment booking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          7. FAQ SECTION
      ===================================================== */}
      <FaqSection />

      {/* =====================================================
          8. FINAL CTA (Section 18)
      ===================================================== */}
      <section className="final-cta" id="register">
        <div className="final-cta-container">
          <div className="cta-paw">
            <PawPrint size={32} />
          </div>

          <span className="section-label light">START WITH PAWLIO</span>

          <h2>
            Better care starts with <br />
            knowing what matters.
          </h2>

          <p>
            Join pet parents who trust PAWLIO to organize medical records, schedule appointments, and stay ahead of vaccinations.
          </p>

          <Link to="/register" className="cta-white-btn">
            <span>Create Your PAWLIO Account</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* =====================================================
          9. CONTACT SECTION
      ===================================================== */}
      <section className="contact-section" id="contact">
        <div className="section-container">
          <div className="contact-content">
            <div>
              <span className="section-label">GET IN TOUCH</span>
              <h2>
                We're here for <br />
                <span className="hero-highlight">you and your pet.</span>
              </h2>
              <p>
                Have a question or need assistance with your PAWLIO setup? We'd love to help.
              </p>
            </div>

            <Link to="/contact" className="contact-btn">
              <span>Contact PAWLIO</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          10. FOOTER
      ===================================================== */}
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="logo footer-logo">
            <span className="logo-icon">
              <PawPrint size={20} />
            </span>
            <span>PAWLIO</span>
          </Link>
          <p>
            Pet care, simplified. A modern digital platform for organizing your pet's healthcare, vaccinations, appointments, and everyday wellness.
          </p>
        </div>

        <div className="footer-column">
          <h4>Product</h4>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/pets">My Pets</Link>
          <Link to="/appointments">Appointments</Link>
          <a href="/#services">Services</a>
        </div>

        <div className="footer-column">
          <h4>Company</h4>
          <a href="/#about">About</a>
          <Link to="/blog">Blog</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-column">
          <h4>Support</h4>
          <a href="mailto:support@pawlio.com">Help & Support</a>
          <a href="/#about">Privacy Policy</a>
          <a href="/#about">Terms of Service</a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container">
          <span>© 2026 PAWLIO. All rights reserved.</span>
          <span>Pet Care Management System</span>
        </div>
      </div>
    </footer>
  );
}


/* =========================================================
   PLACEHOLDER PAGE
========================================================= */

function PlaceholderPage({ title, description }) {

  return (
    <div className="placeholder-page">

      <PawPrint size={45} />

      <h1>
        {title}
      </h1>

      <p>
        {description}
      </p>

      <Link
        to="/"
        className="primary-btn"
      >
        Back to Home
      </Link>

    </div>
  );
}


/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <Home />
                </>
              }
            />
            <Route
              path="/about"
              element={
                <>
                  <Navbar />
                  <Home scrollTo="about" />
                </>
              }
            />
            <Route
              path="/services"
              element={
                <>
                  <Navbar />
                  <Home scrollTo="services" />
                </>
              }
            />
            <Route
              path="/faq"
              element={
                <FaqPage navbar={<Navbar />} footer={<Footer />} />
              }
            />
            <Route
              path="/FAQ"
              element={
                <FaqPage navbar={<Navbar />} footer={<Footer />} />
              }
            />
            <Route
              path="/contact"
              element={
                <ContactPage navbar={<Navbar />} footer={<Footer />} />
              }
            />
            <Route
              path="/contact-us"
              element={
                <ContactPage navbar={<Navbar />} footer={<Footer />} />
              }
            />
            <Route
              path="/Contact"
              element={
                <ContactPage navbar={<Navbar />} footer={<Footer />} />
              }
            />
            <Route
              path="/blog"
              element={
                <BlogPage navbar={<Navbar />} footer={<Footer />} />
              }
            />
            <Route
              path="/blog/:slug"
              element={
                <ArticleDetailPage navbar={<Navbar />} footer={<Footer />} />
              }
            />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={<Navigate to="/login" replace />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* PHASE 8 — SPECIFIED PROTECTED ROUTES */}
            <Route
              path="/pets"
              element={
                <ProtectedRoute>
                  <Dashboard defaultSection="pets-section" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <Dashboard defaultSection="appointments" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/health"
              element={
                <ProtectedRoute>
                  <Dashboard defaultSection="health" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/health-records"
              element={
                <ProtectedRoute>
                  <Dashboard defaultSection="health" defaultSubTab="records" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vaccinations"
              element={
                <ProtectedRoute>
                  <Dashboard defaultSection="health" defaultSubTab="vaccinations" />
                </ProtectedRoute>
              }
            />

            {/* PHASE 7 — PROFESSIONAL ADMIN ROUTES */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminOverview />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/pets"
              element={
                <AdminRoute>
                  <AdminPets />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <AdminRoute>
                  <AdminAppointments />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <AdminRoute>
                  <AdminServices />
                </AdminRoute>
              }
            />
            <Route
              path="*"
              element={
                <>
                  <Navbar />
                  <PlaceholderPage
                    title="Page Not Found"
                    description="The page you are looking for does not exist."
                  />
                </>
              }
            />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}


export default App;