import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  ArrowLeft,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { formatAppointmentDate, formatAppointmentTime } from "../../lib/dateUtils";
import "./demo-payment.css";

export default function DemoPaymentFlow({
  pet,
  service,
  date,
  time,
  notes,
  onConfirmBooking,
  onBackToForm,
  onCloseModal,
  onViewAppointment,
}) {
  const [step, setStep] = useState("summary"); // 'summary' | 'processing' | 'success' | 'failed'
  const [method, setMethod] = useState("upi"); // 'upi' | 'card' | 'netbanking'

  // Demo inputs
  const [upiId, setUpiId] = useState("alex@okhdfcbank");
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("•••");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  const [demoRefId, setDemoRefId] = useState("");
  const [savedAppointment, setSavedAppointment] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Concurrency guard against rapid multi-clicks or double-submissions
  const isSubmittingRef = useRef(false);

  // Initialize a realistic demo transaction reference code
  useEffect(() => {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    setDemoRefId(`DEMO-PAY-${randomHex}`);
  }, []);

  const priceAmount =
    service?.price !== undefined &&
    service?.price !== null &&
    !isNaN(Number(service.price))
      ? Number(service.price)
      : 0;

  // Trigger Demo Payment
  const handlePay = async () => {
    if (isSubmittingRef.current || step === "processing" || savedAppointment) {
      return;
    }
    isSubmittingRef.current = true;
    setErrorMessage("");
    setStep("processing");

    // Simulate realistic payment gateway processing latency
    setTimeout(async () => {
      try {
        const appointmentData = await onConfirmBooking({
          method,
          demoRefId,
        });

        if (appointmentData) {
          setSavedAppointment(appointmentData);
          setStep("success");
        } else {
          setErrorMessage("Failed to schedule appointment in database.");
          setStep("failed");
          isSubmittingRef.current = false;
        }
      } catch (err) {
        console.error("Demo payment error:", err);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during demo processing."
        );
        setStep("failed");
        isSubmittingRef.current = false;
      }
    }, 1400);
  };

  // Simulate Payment Failure (Educational / QA Testing)
  const handleSimulateFailure = () => {
    setStep("processing");
    setTimeout(() => {
      setErrorMessage("Demonstration: Payment was declined or cancelled by bank.");
      setStep("failed");
    }, 1100);
  };

  // -------------------------------------------------------------
  // VIEW: PROCESSING STATE
  // -------------------------------------------------------------
  if (step === "processing") {
    return (
      <div className="demo-state-container">
        <div className="demo-spinner"></div>
        <h3 className="demo-processing-title">Processing Demo Payment...</h3>
        <p className="demo-processing-subtitle">
          Contacting demo banking gateway for ₹{priceAmount}. Please do not close this window.
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: SUCCESS CONFIRMATION
  // -------------------------------------------------------------
  if (step === "success") {
    return (
      <div className="demo-state-container">
        <div className="demo-success-badge">
          <CheckCircle2 size={32} />
        </div>

        <h3 className="demo-success-title">Payment Successful</h3>
        <p className="demo-success-subtitle">
          Your appointment has been confirmed in Demo Mode.
        </p>

        {/* Demo Notice */}
        <div className="demo-mode-banner" style={{ width: "100%", boxSizing: "border-box" }}>
          <span className="demo-mode-banner-icon">
            <Sparkles size={16} />
          </span>
          <span>
            <strong>Demo Mode:</strong> No real payment was charged. Database record created with <em>payment_status: 'pending'</em>.
          </span>
        </div>

        {/* Receipt Card */}
        <div className="demo-receipt-card">
          <div className="demo-receipt-row">
            <span>Reference ID</span>
            <strong className="demo-receipt-ref">{demoRefId}</strong>
          </div>
          <div className="demo-receipt-row">
            <span>Service</span>
            <strong>{service?.name || "Pet Service"}</strong>
          </div>
          <div className="demo-receipt-row">
            <span>Pet</span>
            <strong>{pet?.name || "Your Pet"}</strong>
          </div>
          <div className="demo-receipt-row">
            <span>Schedule</span>
            <strong>
              {formatAppointmentDate(date)} at {formatAppointmentTime(time)}
            </strong>
          </div>
          <div className="demo-receipt-row">
            <span>Payment Method</span>
            <strong>
              {method === "upi"
                ? `UPI (${upiId})`
                : method === "card"
                ? `Card (${cardNumber})`
                : `Net Banking (${selectedBank})`}
            </strong>
          </div>
          <div className="demo-summary-divider"></div>
          <div className="demo-receipt-row">
            <span>Amount Paid</span>
            <strong style={{ fontSize: "16px", color: "#0F766E" }}>
              ₹{priceAmount}.00 (Demo)
            </strong>
          </div>
          <div className="demo-receipt-row">
            <span>Record Status</span>
            <span className="demo-receipt-status">
              <ShieldCheck size={12} /> Pending (Demo Showcase)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="demo-actions-col" style={{ width: "100%" }}>
          <button
            type="button"
            className="demo-pay-btn"
            onClick={() => {
              if (onViewAppointment) {
                onViewAppointment(savedAppointment?.id);
              } else if (onCloseModal) {
                onCloseModal();
              }
            }}
          >
            <span>View in Appointments</span>
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            className="demo-cancel-btn"
            onClick={onCloseModal}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: FAILED / CANCELLED STATE
  // -------------------------------------------------------------
  if (step === "failed") {
    return (
      <div className="demo-state-container">
        <div className="demo-failure-badge">
          <AlertCircle size={32} />
        </div>

        <h3 className="demo-failure-title">Payment Declined / Cancelled</h3>
        <p className="demo-failure-subtitle">
          {errorMessage || "The demonstration payment was not completed. No money was charged and no appointment was booked."}
        </p>

        <div className="demo-actions-col" style={{ width: "100%" }}>
          <button
            type="button"
            className="demo-pay-btn"
            onClick={() => setStep("summary")}
          >
            Try Demo Payment Again
          </button>
          <button
            type="button"
            className="demo-cancel-btn"
            onClick={onBackToForm}
          >
            <ArrowLeft size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            Back to Appointment Details
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: APPOINTMENT SUMMARY & PAYMENT METHODS (DEFAULT)
  // -------------------------------------------------------------
  return (
    <div>
      {/* Demo Mode Notice Banner */}
      <div className="demo-mode-banner">
        <span className="demo-mode-banner-icon">
          <Sparkles size={16} />
        </span>
        <span>
          <strong>Demo Mode:</strong> No real payment will be processed. Choose a simulated payment method below to complete the showcase flow.
        </span>
      </div>

      {/* Appointment Summary Box */}
      <div className="demo-summary-card">
        <div className="demo-summary-row">
          <span>Pet</span>
          <strong>
            {pet?.name} · {pet?.species} {pet?.breed ? `(${pet.breed})` : ""}
          </strong>
        </div>
        <div className="demo-summary-row">
          <span>Service</span>
          <strong>{service?.name}</strong>
        </div>
        <div className="demo-summary-row">
          <span>Date & Time</span>
          <strong>
            {formatAppointmentDate(date)} at {formatAppointmentTime(time)}
          </strong>
        </div>
        {notes && (
          <div className="demo-summary-row">
            <span>Special Notes</span>
            <strong style={{ maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {notes}
            </strong>
          </div>
        )}
        <div className="demo-summary-divider"></div>
        <div className="demo-summary-total">
          <span>Total Payable</span>
          <span className="demo-summary-total-amount">₹{priceAmount}.00</span>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="demo-methods-title">Select Payment Method (Demo)</div>
      <div className="demo-methods-grid">
        <button
          type="button"
          className={`demo-method-btn ${method === "upi" ? "active" : ""}`}
          onClick={() => setMethod("upi")}
        >
          <span className="demo-method-icon">
            <Smartphone size={18} />
          </span>
          <span>UPI</span>
        </button>

        <button
          type="button"
          className={`demo-method-btn ${method === "card" ? "active" : ""}`}
          onClick={() => setMethod("card")}
        >
          <span className="demo-method-icon">
            <CreditCard size={18} />
          </span>
          <span>Card</span>
        </button>

        <button
          type="button"
          className={`demo-method-btn ${method === "netbanking" ? "active" : ""}`}
          onClick={() => setMethod("netbanking")}
        >
          <span className="demo-method-icon">
            <Building2 size={18} />
          </span>
          <span>Net Banking</span>
        </button>
      </div>

      {/* Method Input Details */}
      <div className="demo-method-panel">
        {method === "upi" && (
          <div>
            <div className="demo-field-group">
              <label htmlFor="demo-upi-input">UPI ID / VPA</label>
              <input
                id="demo-upi-input"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@bank"
              />
              <span className="demo-field-hint">
                Simulated handles: Google Pay, PhonePe, Paytm, BHIM
              </span>
            </div>
            <div className="demo-quick-chips">
              <button
                type="button"
                className="demo-chip"
                onClick={() => setUpiId("alex@okhdfcbank")}
              >
                alex@okhdfcbank
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => setUpiId("pawlio.care@ybl")}
              >
                pawlio.care@ybl
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => setUpiId("member@paytm")}
              >
                member@paytm
              </button>
            </div>
          </div>
        )}

        {method === "card" && (
          <div>
            <div className="demo-field-group">
              <label htmlFor="demo-card-num">Card Number</label>
              <input
                id="demo-card-num"
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4111 2222 3333 4444"
              />
            </div>
            <div className="demo-two-cols">
              <div className="demo-field-group">
                <label htmlFor="demo-card-exp">Valid Thru</label>
                <input
                  id="demo-card-exp"
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                />
              </div>
              <div className="demo-field-group">
                <label htmlFor="demo-card-cvv">CVV</label>
                <input
                  id="demo-card-cvv"
                  type="password"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        )}

        {method === "netbanking" && (
          <div>
            <div className="demo-field-group">
              <label htmlFor="demo-bank-select">Select Bank</label>
              <select
                id="demo-bank-select"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
              >
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="State Bank of India">State Bank of India</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
              </select>
              <span className="demo-field-hint">
                Simulated retail net banking gateway
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="demo-actions-col">
        <button
          type="button"
          className="demo-pay-btn"
          onClick={handlePay}
          disabled={step === "processing" || isSubmittingRef.current}
        >
          <Lock size={15} />
          <span>Pay ₹{priceAmount}.00 (Demo)</span>
        </button>

        <button
          type="button"
          className="demo-cancel-btn"
          onClick={onBackToForm}
        >
          ← Edit Appointment Details
        </button>

        {/* Subtle QA / Demo Failure trigger */}
        <div className="demo-fail-btn-wrap">
          <button
            type="button"
            className="demo-fail-btn"
            onClick={handleSimulateFailure}
            title="Demonstrate how failure or cancellation is handled"
          >
            [Dev Test] Simulate Payment Failure
          </button>
        </div>
      </div>
    </div>
  );
}
