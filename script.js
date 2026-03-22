// =============================================
//  Hub Airport Parking — Booking Form
//  Make.com Webhook Integration
// =============================================

// ⚠️ PASTE YOUR MAKE.COM WEBHOOK URL HERE:
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/iowy2sgzbpfk1wjoj673srgevkutwucn";

// ── Populate hour/minute dropdowns ────────
function pad(n) { return String(n).padStart(2, "0"); }

document.addEventListener("DOMContentLoaded", function () {
  ["checkin_hour","checkout_hour"].forEach(id => {
    const sel = document.getElementById(id);
    for (let h = 0; h < 24; h++) {
      const opt = document.createElement("option");
      opt.value = opt.textContent = pad(h);
      sel.appendChild(opt);
    }
  });

  ["checkin_min","checkout_min"].forEach(id => {
    const sel = document.getElementById(id);
    for (let m = 0; m < 60; m += 5) {
      const opt = document.createElement("option");
      opt.value = opt.textContent = pad(m);
      sel.appendChild(opt);
    }
  });
});

// ── DOM refs ───────────────────────────────
const form        = document.getElementById("booking-form");
const submitBtn   = document.getElementById("submit-btn");
const btnText     = submitBtn.querySelector(".btn-text");
const btnSpinner  = submitBtn.querySelector(".btn-spinner");
const errorBanner = document.getElementById("error-banner");
const errorText   = document.getElementById("error-text");
const bookingCard = document.getElementById("booking-card");
const successCard = document.getElementById("success-card");

// ── Helpers ───────────────────────────────

function setLoading(on) {
  submitBtn.disabled = on;
  btnText.hidden     = on;
  btnSpinner.hidden  = !on;
}

function showError(msg) {
  errorText.textContent = msg || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
  errorBanner.hidden = false;
  errorBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideError() {
  errorBanner.hidden = true;
}

function showSuccess() {
  bookingCard.hidden = true;
  successCard.hidden = false;
  successCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Field validation highlight ────────────

function markInvalid(input) {
  input.classList.add("invalid");
}

function clearInvalid(input) {
  input.classList.remove("invalid");
}

// Live clear on input
form.querySelectorAll("input").forEach(input => {
  input.addEventListener("input", () => clearInvalid(input));
});

// ── Validate all fields ───────────────────

function validateForm() {
  let valid = true;
  const inputs = form.querySelectorAll("input[required]");

  inputs.forEach(input => {
    const empty = input.value.trim() === "";
    if (empty) {
      markInvalid(input);
      valid = false;
    }
  });

  // Extra: check checkout is after checkin
  const checkinVal  = form.querySelector("#checkin_date").value + "T" + form.querySelector("#checkin_hour").value + ":" + form.querySelector("#checkin_min").value;
  const checkoutVal = form.querySelector("#checkout_date").value + "T" + form.querySelector("#checkout_hour").value + ":" + form.querySelector("#checkout_min").value;
  if (checkinVal.length > 1 && checkoutVal.length > 1) {
    if (new Date(checkoutVal) <= new Date(checkinVal)) {
      markInvalid(form.querySelector("#checkout_date"));
      markInvalid(form.querySelector("#checkout_hour"));
      markInvalid(form.querySelector("#checkout_min"));
      showError("วันที่ออกต้องหลังจากวันที่เข้าค่ะ (Check-out must be after check-in)");
      return false;
    }
  }

  if (!valid) {
    showError("กรุณากรอกข้อมูลให้ครบทุกช่องค่ะ (Please fill in all required fields)");
  }

  return valid;
}

// ── Form submit ───────────────────────────

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  if (!validateForm()) return;

  const payload = {
    name:          form.querySelector("#name").value.trim(),
    phone:         form.querySelector("#phone").value.trim(),
    email:         form.querySelector("#email").value.trim(),
    car_plate:     form.querySelector("#car_plate").value.trim().toUpperCase(),
    checkin:       form.querySelector("#checkin_date").value + "T" + form.querySelector("#checkin_hour").value + ":" + form.querySelector("#checkin_min").value,
    checkout:      form.querySelector("#checkout_date").value + "T" + form.querySelector("#checkout_hour").value + ":" + form.querySelector("#checkout_min").value,
    num_people:    parseInt(form.querySelector("#num_people").value),
    total_payment: parseFloat(form.querySelector("#total_payment").value),
    submitted_at:  new Date().toISOString(),
  };

  setLoading(true);

  try {
    // Use form-encoded so Make.com receives each field separately (no CORS preflight)
    await fetch(MAKE_WEBHOOK_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams(payload).toString(),
    });

    showSuccess();
  } catch (err) {
    console.error("Webhook error:", err);
    showError("ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่ค่ะ");
  } finally {
    setLoading(false);
  }
});
