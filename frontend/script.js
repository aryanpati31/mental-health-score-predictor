
(() => {
  "use strict";

  // Deployed FastAPI backend URL
  const API_BASE =
    "https://mental-health-score-predictor-kxq7.onrender.com";

  const form = document.getElementById("predict-form");
  const submitBtn = document.getElementById("submit-btn");
  const resetBtn = document.getElementById("reset-btn");
  const errorRetryBtn = document.getElementById("error-retry-btn");

  const stateIdle = document.getElementById("state-idle");
  const stateLoading = document.getElementById("state-loading");
  const stateResult = document.getElementById("state-result");
  const stateError = document.getElementById("state-error");

  const scoreNumberEl = document.getElementById("score-number");
  const scoreBandEl = document.getElementById("score-band");
  const scoreContextEl = document.getElementById("score-context");
  const gaugeFill = document.getElementById("gauge-fill");

  const errorLabelEl = document.getElementById("error-label");
  const errorCopyEl = document.getElementById("error-copy");

  const GAUGE_ARC_LENGTH = 314;

  // ---------------------------------------------------------
  // Check that the required HTML elements exist
  // ---------------------------------------------------------
  if (
    !form ||
    !submitBtn ||
    !resetBtn ||
    !errorRetryBtn ||
    !stateIdle ||
    !stateLoading ||
    !stateResult ||
    !stateError ||
    !scoreNumberEl ||
    !scoreBandEl ||
    !scoreContextEl ||
    !gaugeFill ||
    !errorLabelEl ||
    !errorCopyEl
  ) {
    console.error(
      "Some required HTML elements are missing. Check frontend/index.html."
    );
    return;
  }

  // ---------------------------------------------------------
  // Draw gauge tick marks
  // ---------------------------------------------------------
  function drawTicks() {
    document.querySelectorAll(".gauge-ticks").forEach((g) => {
      g.innerHTML = "";

      const cx = 120;
      const cy = 140;
      const rOuter = 100;
      const rInner = 90;

      for (let i = 0; i <= 10; i += 2) {
        const angle = Math.PI - (i / 10) * Math.PI;

        const x1 = cx + rOuter * Math.cos(angle);
        const y1 = cy - rOuter * Math.sin(angle);
        const x2 = cx + rInner * Math.cos(angle);
        const y2 = cy - rInner * Math.sin(angle);

        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );

        line.setAttribute("x1", x1.toFixed(1));
        line.setAttribute("y1", y1.toFixed(1));
        line.setAttribute("x2", x2.toFixed(1));
        line.setAttribute("y2", y2.toFixed(1));

        g.appendChild(line);
      }
    });
  }

  drawTicks();

  // ---------------------------------------------------------
  // Stress-level segmented buttons
  // ---------------------------------------------------------
  const segGroup = document.getElementById("stress_level_group");
  const stressHiddenInput = document.getElementById("stress_level");

  if (segGroup && stressHiddenInput) {
    segGroup.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        segGroup.querySelectorAll(".seg-btn").forEach((b) => {
          b.classList.remove("active");
        });

        btn.classList.add("active");
        stressHiddenInput.value = btn.dataset.value || "";

        clearFieldError(stressHiddenInput);
      });
    });
  }

  // ---------------------------------------------------------
  // Field-level error helpers
  // ---------------------------------------------------------
  function fieldWrapper(input) {
    return input ? input.closest(".field") : null;
  }

  function setFieldError(input, message) {
    const wrap = fieldWrapper(input);

    if (!wrap) return;

    wrap.classList.add("field-error");

    const msgEl = wrap.querySelector(".error-msg");

    if (msgEl) {
      msgEl.textContent = message;
    }
  }

  function clearFieldError(input) {
    const wrap = fieldWrapper(input);

    if (!wrap) return;

    wrap.classList.remove("field-error");

    const msgEl = wrap.querySelector(".error-msg");

    if (msgEl) {
      msgEl.textContent = "";
    }
  }

  function clearAllErrors() {
    form.querySelectorAll(".field").forEach((field) => {
      field.classList.remove("field-error");
    });

    form.querySelectorAll(".error-msg").forEach((message) => {
      message.textContent = "";
    });
  }

  // ---------------------------------------------------------
  // Validate form values before sending them to the API
  // ---------------------------------------------------------
  function validate(payload) {
    const errors = [];

    const numericChecks = [
      ["age", 10, 100],
      ["avg_daily_usage_hours", 0, 24],
      ["daily_unlocks", 0, Infinity],
      ["study_hours", 0, 24],
      ["physical_activity_hours", 0, 24],
      ["sleep_hours_per_night", 0, 24],
    ];

    numericChecks.forEach(([key, min, max]) => {
      const input = document.getElementById(key);
      const value = payload[key];

      if (
        value === "" ||
        value === null ||
        value === undefined ||
        !Number.isFinite(value)
      ) {
        errors.push([input, "Please enter a valid number."]);
      } else if (value < min || value > max) {
        const range =
          max === Infinity
            ? `Must be at least ${min}.`
            : `Must be between ${min} and ${max}.`;

        errors.push([input, range]);
      }
    });

    [
      "gender",
      "country",
      "academic_level",
      "most_used_platform",
      "purpose_of_use",
    ].forEach((key) => {
      const input = document.getElementById(key);

      if (
        !payload[key] ||
        String(payload[key]).trim() === ""
      ) {
        errors.push([input, "This field is required."]);
      }
    });

    if (!payload.stress_level) {
      errors.push([
        stressHiddenInput,
        "Please select a stress level.",
      ]);
    }

    return errors;
  }

  // ---------------------------------------------------------
  // Collect form data in the exact format expected by FastAPI
  // ---------------------------------------------------------
  function collectPayload() {
    const fd = new FormData(form);

    function getNumber(name, parser) {
      const value = fd.get(name);

      if (value === null || String(value).trim() === "") {
        return NaN;
      }

      return parser(value);
    }

    return {
      age: getNumber("age", (value) => Number(value)),
      gender: fd.get("gender") || "",
      country: (fd.get("country") || "").trim(),
      academic_level: fd.get("academic_level") || "",
      most_used_platform: fd.get("most_used_platform") || "",
      purpose_of_use: fd.get("purpose_of_use") || "",
      avg_daily_usage_hours: getNumber(
        "avg_daily_usage_hours",
        parseFloat
      ),
      daily_unlocks: getNumber(
        "daily_unlocks",
        (value) => Number(value)
      ),
      study_hours: getNumber("study_hours", parseFloat),
      physical_activity_hours: getNumber(
        "physical_activity_hours",
        parseFloat
      ),
      sleep_hours_per_night: getNumber(
        "sleep_hours_per_night",
        parseFloat
      ),
      stress_level: fd.get("stress_level") || "",
    };
  }

  // ---------------------------------------------------------
  // Switch between idle, loading, result and error screens
  // ---------------------------------------------------------
  function showState(name) {
    const states = {
      idle: stateIdle,
      loading: stateLoading,
      result: stateResult,
      error: stateError,
    };

    Object.values(states).forEach((element) => {
      element.hidden = true;
    });

    if (states[name]) {
      states[name].hidden = false;
    }
  }

  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    submitBtn.classList.toggle("loading", isSubmitting);
  }

  // ---------------------------------------------------------
  // Score labels
  // ---------------------------------------------------------
  function bandFor(score) {
    if (score < 4) {
      return {
        label: "Signal: strained",
        context:
          "Your responses suggest elevated strain right now. Consider reviewing your sleep, screen time and daily routine.",
      };
    }

    if (score < 7) {
      return {
        label: "Signal: balanced",
        context:
          "Your responses fall in the middle range of this model's score. Consider your habits and recovery routine.",
      };
    }

    return {
      label: "Signal: strong",
      context:
        "Your responses fall in the higher range of this model's score. Continue supporting your wellbeing with healthy routines.",
    };
  }

  // ---------------------------------------------------------
  // Display the prediction
  // ---------------------------------------------------------
  function renderResult(score) {
    const clamped = Math.max(0, Math.min(10, score));
    const { label, context } = bandFor(clamped);

    scoreNumberEl.textContent = score.toFixed(2);
    scoreBandEl.textContent = label;
    scoreContextEl.textContent = context;

    gaugeFill.style.transition = "none";
    gaugeFill.style.strokeDashoffset = String(GAUGE_ARC_LENGTH);

    requestAnimationFrame(() => {
      gaugeFill.style.transition = "";

      const offset =
        GAUGE_ARC_LENGTH * (1 - clamped / 10);

      gaugeFill.style.strokeDashoffset = String(offset);
    });

    showState("result");
  }

  // ---------------------------------------------------------
  // Display an error message
  // ---------------------------------------------------------
  function renderError(label, message) {
    errorLabelEl.textContent = label;
    errorCopyEl.textContent = message;
    showState("error");
  }

  // ---------------------------------------------------------
  // Handle validation errors returned by FastAPI
  // ---------------------------------------------------------
  function applyServerValidationErrors(detail) {
    if (!Array.isArray(detail)) return false;

    let matched = false;

    detail.forEach((error) => {
      const field = Array.isArray(error.loc)
        ? error.loc[error.loc.length - 1]
        : null;

      const input = field
        ? document.getElementById(field)
        : null;

      const target =
        field === "stress_level"
          ? stressHiddenInput
          : input;

      if (target) {
        setFieldError(target, error.msg || "Invalid value.");
        matched = true;
      }
    });

    return matched;
  }

  // ---------------------------------------------------------
  // Submit form and call the deployed prediction API
  // ---------------------------------------------------------
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAllErrors();

    const payload = collectPayload();
    const clientErrors = validate(payload);

    if (clientErrors.length > 0) {
      clientErrors.forEach(([input, message]) => {
        if (input) {
          setFieldError(input, message);
        }
      });

      clientErrors[0][0]?.focus?.();
      return;
    }

    setSubmitting(true);
    showState("loading");

    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 422) {
        const body = await response.json().catch(() => null);

        const matched =
          body && applyServerValidationErrors(body.detail);

        renderError(
          "Check your inputs",
          matched
            ? "Some fields were rejected by the API. Review the highlighted fields."
            : "The API rejected your submission. Please review your inputs."
        );

        return;
      }

      if (!response.ok) {
        let message = `The server returned status ${response.status}.`;

        const body = await response.json().catch(() => null);

        if (body && typeof body.detail === "string") {
          message = body.detail;
        }

        renderError("Prediction failed", message);
        return;
      }

      const data = await response.json();

      if (
        typeof data.predicted_mental_health_score !== "number" ||
        !Number.isFinite(data.predicted_mental_health_score)
      ) {
        renderError(
          "Unexpected response",
          "The server responded, but the predicted score was missing or invalid."
        );

        return;
      }

      renderResult(data.predicted_mental_health_score);
    } catch (error) {
      console.error("Prediction request failed:", error);

      renderError(
        "Can't reach the server",
        `Couldn't connect to ${API_BASE}. Check the deployed backend and your internet connection. The first request may take a little longer if the free service has been idle.`
      );
    } finally {
      setSubmitting(false);
    }
  });

  // ---------------------------------------------------------
  // Clear field errors when users edit their answers
  // ---------------------------------------------------------
  form.querySelectorAll("input, select").forEach((element) => {
    element.addEventListener("input", () => {
      clearFieldError(element);
    });

    element.addEventListener("change", () => {
      clearFieldError(element);
    });
  });

  // ---------------------------------------------------------
  // Reset result or return from the error screen
  // ---------------------------------------------------------
  resetBtn.addEventListener("click", () => {
    showState("idle");
  });

  errorRetryBtn.addEventListener("click", () => {
    showState("idle");
  });
})();
