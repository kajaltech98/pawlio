import { useState, useEffect, useRef, useId } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/**
 * Safely parse YYYY-MM-DD into a local Date without timezone offset
 */
function parseISODate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const parts = dateStr.trim().split("-");
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format Date to YYYY-MM-DD for form values
 */
function toISODate(date) {
  if (!date || isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Format Date to DD-MM-YYYY for display
 */
function toDisplayDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.trim().split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${d}-${m}-${y}`;
}

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function PetDatePicker({
  id = "pet-dob",
  name = "date_of_birth",
  value = "",
  onChange,
  maxDate,
  className = "",
  hasError = false,
  required = false,
}) {
  const containerRef = useRef(null);
  const calendarId = useId();

  // Parse current value
  const selectedDate = parseISODate(value);

  // Compute today's date at local midnight
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Determine max limit (default to today for Date of Birth)
  const effectiveMaxDate = maxDate
    ? typeof maxDate === "string"
      ? parseISODate(maxDate) || today
      : maxDate
    : today;

  // Calendar view state (year & month)
  const initialView = selectedDate || today;
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());
  const [isOpen, setIsOpen] = useState(false);
  const [focusedDate, setFocusedDate] = useState(initialView);

  // Sync view when selectedDate changes or picker opens
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
      setFocusedDate(selectedDate);
    } else {
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
      setFocusedDate(today);
    }
  }, [value, isOpen]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    // Allow forward navigation up to current year + 1 so user can inspect future months if desired
    if (viewYear > now.getFullYear()) return;

    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isNextMonthDisabled = viewYear > now.getFullYear();

  const handleSelectDay = (date, disabled) => {
    if (disabled) return;
    const isoStr = toISODate(date);
    if (onChange) {
      onChange({
        target: {
          name,
          value: isoStr,
        },
      });
    }
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange({
        target: {
          name,
          value: "",
        },
      });
    }
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    if (effectiveMaxDate && today > effectiveMaxDate) return;
    const isoStr = toISODate(today);
    if (onChange) {
      onChange({
        target: {
          name,
          value: isoStr,
        },
      });
    }
    setIsOpen(false);
  };

  // Keyboard navigation within the calendar grid
  const handleCalendarKeyDown = (e) => {
    if (!isOpen) return;

    let nextFocus = new Date(focusedDate);
    let handled = false;

    if (e.key === "ArrowLeft") {
      nextFocus.setDate(nextFocus.getDate() - 1);
      handled = true;
    } else if (e.key === "ArrowRight") {
      nextFocus.setDate(nextFocus.getDate() + 1);
      handled = true;
    } else if (e.key === "ArrowUp") {
      nextFocus.setDate(nextFocus.getDate() - 7);
      handled = true;
    } else if (e.key === "ArrowDown") {
      nextFocus.setDate(nextFocus.getDate() + 7);
      handled = true;
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const isDisabled = effectiveMaxDate && nextFocus > effectiveMaxDate;
      if (!isDisabled) {
        handleSelectDay(focusedDate, false);
      }
      return;
    }

    if (handled) {
      e.preventDefault();
      setFocusedDate(nextFocus);
      if (nextFocus.getMonth() !== viewMonth) {
        setViewMonth(nextFocus.getMonth());
        setViewYear(nextFocus.getFullYear());
      }
    }
  };

  // Generate 42 calendar slots (Monday start)
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Monday-based index: 0 = Mon, ..., 6 = Sun
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

    const days = [];

    // 1. Previous month trailing days
    const prevMonthDaysCount = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDaysCount - i;
      const date = new Date(viewYear, viewMonth - 1, dayNum);
      const isFuture = effectiveMaxDate && date > effectiveMaxDate;
      days.push({
        date,
        dayNum,
        isCurrentMonth: false,
        isPrevMonth: true,
        disabled: Boolean(isFuture),
      });
    }

    // 2. Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const isFuture = effectiveMaxDate && date > effectiveMaxDate;
      days.push({
        date,
        dayNum: d,
        isCurrentMonth: true,
        disabled: Boolean(isFuture),
      });
    }

    // 3. Next month leading days (fill up to 35 or 42 slots)
    const totalSlots = days.length > 35 ? 42 : 35;
    const remaining = totalSlots - days.length;
    for (let n = 1; n <= remaining; n++) {
      const date = new Date(viewYear, viewMonth + 1, n);
      const isFuture = effectiveMaxDate && date > effectiveMaxDate;
      days.push({
        date,
        dayNum: n,
        isCurrentMonth: false,
        isNextMonth: true,
        disabled: Boolean(isFuture),
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const displayValue = toDisplayDate(value);

  return (
    <div className="pawlio-datepicker-container" ref={containerRef}>
      {/* Hidden real input for form compatibility */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={value}
        required={required}
      />

      {/* Styled visible input button */}
      <div
        className={`pawlio-datepicker-input-wrapper pet-input ${
          hasError ? "input-error" : ""
        } ${isOpen ? "is-focused" : ""} ${className}`}
        onClick={() => setIsOpen((prev) => !prev)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={calendarId}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
      >
        <span
          className={`pawlio-datepicker-value ${
            displayValue ? "has-value" : "is-placeholder"
          }`}
        >
          {displayValue || "DD-MM-YYYY"}
        </span>

        <div className="pawlio-datepicker-actions">
          {displayValue && (
            <button
              type="button"
              className="pawlio-datepicker-clear-btn"
              onClick={handleClear}
              title="Clear date"
              aria-label="Clear date"
            >
              <X size={14} />
            </button>
          )}
          <span className="pawlio-datepicker-icon-btn" aria-hidden="true">
            <Calendar size={16} />
          </span>
        </div>
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          id={calendarId}
          className="pawlio-calendar-popover"
          role="dialog"
          aria-label="Date of birth calendar"
          onKeyDown={handleCalendarKeyDown}
        >
          {/* Header with Month Navigation */}
          <div className="pawlio-calendar-header">
            <button
              type="button"
              className="pawlio-calendar-nav-btn"
              onClick={handlePrevMonth}
              title="Previous month"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="pawlio-calendar-month-title">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              className="pawlio-calendar-nav-btn"
              onClick={handleNextMonth}
              disabled={isNextMonthDisabled}
              title={
                isNextMonthDisabled
                  ? "Future months disabled for Date of Birth"
                  : "Next month"
              }
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday labels */}
          <div className="pawlio-calendar-weekdays" role="row">
            {WEEKDAY_NAMES.map((wd) => (
              <span key={wd} className="pawlio-calendar-weekday" role="columnheader">
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="pawlio-calendar-grid" role="grid">
            {calendarDays.map((item, idx) => {
              const isSelected = selectedDate && isSameDay(item.date, selectedDate);
              const isTodayDate = isSameDay(item.date, today);
              const isFocused = isSameDay(item.date, focusedDate);

              let dayClass = "pawlio-calendar-day";
              if (item.disabled) {
                dayClass += " day-disabled";
              } else if (isSelected) {
                dayClass += " day-selected";
              } else if (item.isCurrentMonth) {
                dayClass += " day-current-month";
              } else {
                dayClass += " day-adjacent-month";
              }

              if (isTodayDate) {
                dayClass += " day-today";
              }

              if (isFocused && !isSelected && !item.disabled) {
                dayClass += " day-focused";
              }

              return (
                <button
                  key={`${item.date.toISOString()}-${idx}`}
                  type="button"
                  className={dayClass}
                  disabled={item.disabled}
                  aria-disabled={item.disabled ? "true" : undefined}
                  aria-selected={isSelected ? "true" : undefined}
                  onClick={() => handleSelectDay(item.date, item.disabled)}
                  title={
                    item.disabled
                      ? `${item.date.toDateString()} (Future date cannot be Date of Birth)`
                      : item.date.toDateString()
                  }
                  tabIndex={isSelected || (isTodayDate && !selectedDate) ? 0 : -1}
                >
                  <span className="day-number">{item.dayNum}</span>
                  {isTodayDate && !isSelected && (
                    <span className="today-dot-indicator" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Controls: Today & Clear */}
          <div className="pawlio-calendar-footer">
            <button
              type="button"
              className="pawlio-calendar-footer-btn btn-today"
              onClick={handleSelectToday}
              disabled={Boolean(effectiveMaxDate && today > effectiveMaxDate)}
            >
              Today
            </button>
            <button
              type="button"
              className="pawlio-calendar-footer-btn btn-clear"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
