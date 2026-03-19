// =============================================
//  Hub Airport Parking — Booking Form
//  Make.com Webhook Integration
// =============================================

// ⚠️ PASTE YOUR MAKE.COM WEBHOOK URL HERE:
const MAKE_WEBHOOK_URL = "REPLACE_WITH_YOUR_MAKE_WEBHOOK_URL";

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
  const checkin  = form.querySelector("#checkin");
  const checkout = form.querySelector("#checkout");
  if (checkin.value && checkout.value) {
    if (new Date(checkout.value) <= new Date(checkin.value)) {
      markInvalid(checkout);
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
    checkin:       form.querySelector("#checkin").value,
    checkout:      form.querySelector("#checkout").value,
    total_payment: parseFloat(form.querySelector("#total_payment").value),
    submitted_at:  new Date().toISOString(),
  };

  setLoading(true);

  try {
    const res = await fetch(MAKE_WEBHOOK_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    if (res.ok) {
      showSuccess();
    } else {
      showError(`เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (${res.status}) — กรุณาลองใหม่ค่ะ`);
    }
  } catch (err) {
    console.error("Webhook error:", err);
    showError("ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่ค่ะ");
  } finally {
    setLoading(false);
  }
});
