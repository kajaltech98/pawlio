import React, { useState, useEffect, useRef } from "react";
import {
  to24HourTime,
  parseTimeTo12HourParts,
  formatAppointmentTime,
} from "../../lib/dateUtils";
import "./appointment-time-picker.css";

const STANDARD_HOURS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

const STANDARD_MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"];

export default function AppointmentTimePicker({
  id = "pawlio-appointment-time",
  value = "",
  onChange,
  hasError = false,
  placeholder = "Select preferred time",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Initialize or derive 12h parts from value
  const initialParts = value
    ? parseTimeTo12HourParts(value)
    : { hour: "09", minute: "00", period: "AM" };

  const [hour, setHour] = useState(initialParts.hour);
  const [minute, setMinute] = useState(initialParts.minute);
  const [period, setPeriod] = useState(initialParts.period);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  // Synchronize internal state whenever value changes from outside
  useEffect(() => {
    if (value) {
      const parts = parseTimeTo12HourParts(value);
      setHour(parts.hour);
      setMinute(parts.minute);
      setPeriod(parts.period);
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Build minute options list (preserve custom minute if existing appointment had one)
  const minuteOptions = STANDARD_MINUTES.includes(minute)
    ? STANDARD_MINUTES
    : [minute, ...STANDARD_MINUTES].sort();

  // Commit selected time in 24-hour format expected by the app and DB
  const handleDone = () => {
    const time24 = to24HourTime(hour, minute, period);
    if (typeof onChange === "function") {
      onChange(time24);
    }
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const formattedDisplay = value ? formatAppointmentTime(value) : "";
  const previewTime = `${hour}:${minute} ${period}`;

  return (
    <div
      className="pawlio-time-picker-wrapper"
      ref={containerRef}
      id={`${id}-container`}
    >
      {/* Hidden input to ensure accessibility and form integration */}
      <input
        type="hidden"
        id={id}
        name={id}
        value={value || ""}
        readOnly
      />

      {/* Visible Trigger Field */}
      <button
        type="button"
        ref={triggerRef}
        className={`pawlio-time-trigger ${isOpen ? "is-open" : ""} ${
          hasError ? "has-error" : ""
        }`}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Preferred appointment time selector"
      >
        {formattedDisplay ? (
          <span className="pawlio-time-trigger-value">{formattedDisplay}</span>
        ) : (
          <span className="pawlio-time-trigger-placeholder">
            {placeholder}
          </span>
        )}

        <span className="pawlio-time-trigger-icon" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </span>
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div
          className="pawlio-time-popover"
          role="dialog"
          aria-modal="true"
          aria-label="Select appointment time"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.tagName !== "SELECT") {
              e.preventDefault();
              handleDone();
            }
          }}
        >
          {/* Header */}
          <div className="pawlio-time-popover-header">
            <span className="pawlio-time-popover-title">
              Select preferred time
            </span>
            <button
              type="button"
              className="pawlio-time-popover-close"
              onClick={() => {
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label="Close time selector"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* 3-Column Selectors: Hour, Minute, Period */}
          <div className="pawlio-time-grid">
            {/* Hour */}
            <div className="pawlio-time-col">
              <label
                htmlFor={`${id}-hour-select`}
                className="pawlio-time-label"
              >
                Hour
              </label>
              <div className="pawlio-time-select-wrap">
                <select
                  id={`${id}-hour-select`}
                  className="pawlio-time-select"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  aria-label="Appointment Hour"
                >
                  {STANDARD_HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span
                  className="pawlio-time-select-chevron"
                  aria-hidden="true"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Minute */}
            <div className="pawlio-time-col">
              <label
                htmlFor={`${id}-minute-select`}
                className="pawlio-time-label"
              >
                Minute
              </label>
              <div className="pawlio-time-select-wrap">
                <select
                  id={`${id}-minute-select`}
                  className="pawlio-time-select"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  aria-label="Appointment Minute"
                >
                  {minuteOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <span
                  className="pawlio-time-select-chevron"
                  aria-hidden="true"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Period (AM / PM) */}
            <div className="pawlio-time-col">
              <label
                htmlFor={`${id}-period-select`}
                className="pawlio-time-label"
              >
                Period
              </label>
              <div className="pawlio-time-select-wrap">
                <select
                  id={`${id}-period-select`}
                  className="pawlio-time-select"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  aria-label="Appointment Period AM or PM"
                >
                  {PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <span
                  className="pawlio-time-select-chevron"
                  aria-hidden="true"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Selected Time Live Preview */}
          <div className="pawlio-time-preview-card">
            <div className="pawlio-time-preview-meta">
              <span className="pawlio-time-preview-label">Selected time</span>
              <span className="pawlio-time-preview-hint">12-hour format</span>
            </div>
            <span className="pawlio-time-preview-value">{previewTime}</span>
          </div>

          {/* Popover Actions */}
          <div className="pawlio-time-actions">
            <button
              type="button"
              className="pawlio-time-btn-done"
              onClick={handleDone}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
