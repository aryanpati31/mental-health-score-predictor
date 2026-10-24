
(() => {
  "use strict";

  // ---------------------------------------------------------
  // BACKEND API
  // ---------------------------------------------------------
  const API_BASE =
    "https://mental-health-score-predictor-kxq7.onrender.com";

  // ---------------------------------------------------------
  // HTML ELEMENTS
  // ---------------------------------------------------------
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

  const stressGroup = document.getElementById("stress_level_group");
  const stressInput = document.getElementById("stress_level");

  const GAUGE_ARC_LENGTH = 314;

  // ---------------------------------------------------------
  // CHECK REQUIRED HTML ELEMENTS
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
      "Required HTML elements are missing. Check frontend/index.html."
    );
    return;
  }

  if (!stressGroup || !stressInput) {
    console.error(
      "Stress-level controls were not found. Check their HTML IDs."
    );
  }

  // ---------------------------------------------------------
  // FIELD ERROR HELPERS
  // ---------------------------------------------------------
  function fieldWrapper(input) {
    return input ? input.closest(".field") : null;
  }

  function setFieldError(input, message) {
    const wrapper = fieldWrapper(input);
    if (!wrapper) return;

    wrapper.classList.add("field-error");

    const messageElement = wrapper.querySelector(".error-msg");

    if (messageElement) {
      messageElement.textContent = message;
    }
  }

  function clearFieldError(input) {
    const wrapper = fieldWrapper(input);
    if (!wrapper) return;

    wrapper.classList.remove("field-error");

    const messageElement = wrapper.querySelector(".error-msg");

    if (messageElement) {
      messageElement.textContent = "";
    }
  }

  function clearAllErrors() {
    form.querySelectorAll(".field").forEach((field) => {
      field.classList.remove("field-error");
    });

    form.querySelectorAll(".error-msg").forEach((element) => {
      element.textContent = "";
    });
  }

  // ---------------------------------------------------------
  // STRESS-LEVEL BUTTONS
  // Uses event delegation to handle all four buttons.
  // ---------------------------------------------------------
  if (stressGroup && stressInput) {
    stressGroup.addEventListener("click", (event) => {
      const button = event.target.closest(".seg-btn");

      if (!button || !stressGroup.contains(button)) {
        return;
      }

      // Clear the previous selection.
      stressGroup.querySelectorAll(".seg-btn").forEach((item) => {
        item.classList.remove("active");
        item.setAttribute("aria-pressed", "false");
      });

      // Activate the selected button.
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");

      // Store the value for form submission.
      stressInput.value = button.dataset.value || "";

      // Remove any validation error.
      clearFieldError(stressInput);

      console.log("Selected stress level:", stressInput.value);
    });

    // Initialize accessibility state.
    stressGroup.querySelectorAll(".seg-btn").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        button.classList.contains("active") ? "true" : "false"
      );
    });
  }

  // ---------------------------------------------------------
  // GAUGE TICK MARKS
  // ---------------------------------------------------------
  function drawTicks() {
    document.querySelectorAll(".gauge-ticks").forEach((group) => {
      group.innerHTML = "";

      const cx = 120;
      const cy = 140;
      const outerRadius = 100;
      const innerRadius = 90;

      for (let i = 0; i <= 10; i += 2) {
        const angle = Math.PI - (i / 10) * Math.PI;

        const x1 = cx + outerRadius * Math.cos(angle);
        const y1 = cy - outerRadius * Math.sin(angle);
        const x2 = cx + innerRadius * Math.cos(angle);
        const y2 = cy - innerRadius * Math.sin(angle);

        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );

        line.setAttribute("x1", x1.toFixed(1));
        line.setAttribute("y1", y1.toFixed(1));
        line.setAttribute("x2", x2.toFixed(1));
        line.setAttribute("y2", y2.toFixed(1));

        group.appendChild(line);
      }
    });
  }

  drawTicks();

  // ---------------------------------------------------------
  // FORM VALIDATION
  // ---------------------------------------------------------
  function collectPayload() {
    const formData = new FormData(form);

    function getNumber(name) {
      const value = formData.get(name);

      if (value === null || String(value).trim() === "") {
        return NaN;
      }

      return Number(value);
    }

    return {
      age: getNumber("age"),
      gender: formData.get("gender") || "",
      country: (formData.get("country") || "").trim(),
      academic_level: formData.get("academic_level") || "",
      most_used_platform: formData.get("most_used_platform") || "",
      purpose_of_use: formData.get("purpose_of_use") || "",
      avg_daily_usage_hours: getNumber("avg_daily_usage_hours"),
      daily_unlocks: getNumber("daily_unlocks"),
      study_hours: getNumber("study_hours"),
      physical_activity_hours: getNumber("physical_activity_hours"),
      sleep_hours_per_night: getNumber("sleep_hours_per_night"),
      stress_level: stressInput ? stressInput.value : ""
    };
  }

  function validate(payload) {
    const errors = [];

    const numericChecks = [
      ["age", 10, 100],
      ["avg_daily_usage_hours", 0, 24],
      ["daily_unlocks", 0, Infinity],
      ["study_hours", 0, 24],
      ["physical_activity_hours", 0, 24],
      ["sleep_hours_per_night", 0, 24]
    ];

    numericChecks.forEach(([key, min, max]) => {
      const input = document.getElementById(key);
      const value = payload[key];

      if (!Number.isFinite(value)) {
        errors.push([input, "Please enter a valid number."]);
      } else if (value < min || value > max) {
        const message =
          max === Infinity
            ? `Must be at least ${min}.`
            : `Must be between ${min} and ${max}.`;

        errors.push([input, message]);
      }
    });

    const requiredFields = [
      "gender",
      "country",
      "academic_level",
      "most_used_platform",
      "purpose_of_use"
    ];

    requiredFields.forEach((key) => {
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
        stressInput,
        "Please select a stress level."
      ]);
    }

    return errors;
  }

  // ---------------------------------------------------------
  // SCREEN STATES
  // ---------------------------------------------------------
  function showState(name) {
    const states = {
      idle: stateIdle,
      loading: stateLoading,
      result: stateResult,
      error: stateError
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
  // SCORE INTERPRETATION
  // ---------------------------------------------------------
  function bandFor(score) {
    if (score < 4) {
      return {
        label: "Signal: strained",
        context:
          "Your responses fall in the lower range of this model's score. Consider reviewing your sleep, screen time and daily routine."
      };
    }

    if (score < 7) {
      return {
        label: "Signal: balanced",
        context:
          "Your responses fall in the middle range of this model's score. Consider your habits and recovery routine."
      };
    }

    return {
      label: "Signal: strong",
      context:
        "Your responses fall in the higher range of this model's score. Continue supporting your wellbeing with healthy routines."
    };
  }

  // ---------------------------------------------------------
  // DISPLAY PREDICTION
  // ---------------------------------------------------------
  function renderResult(score) {
    const clampedScore = Math.max(0, Math.min(10, score));
    const result = bandFor(clampedScore);

    scoreNumberEl.textContent = score.toFixed(2);
    scoreBandEl.textContent = result.label;
    scoreContextEl.textContent = result.context;

    gaugeFill.style.transition = "none";
    gaugeFill.style.strokeDashoffset = String(GAUGE_ARC_LENGTH);

    requestAnimationFrame(() => {
      gaugeFill.style.transition = "";

      const offset =
        GAUGE_ARC_LENGTH * (1 - clampedScore / 10);

      gaugeFill.style.strokeDashoffset = String(offset);
    });

    showState("result");
  }

  // ---------------------------------------------------------
  // DISPLAY ERRORS
  // ---------------------------------------------------------
  function renderError(title, message) {
    errorLabelEl.textContent = title;
    errorCopyEl.textContent = message;
    showState("error");
  }

  function applyServerValidationErrors(detail) {
    if (!Array.isArray(detail)) return false;

    let matched = false;

    detail.forEach((error) => {
      const location = Array.isArray(error.loc)
        ? error.loc[error.loc.length - 1]
        : null;

      const input = location
        ? document.getElementById(location)
        : null;

      if (input) {
        setFieldError(input, error.msg || "Invalid value.");
        matched = true;
      }
    });

    return matched;
  }

  // ---------------------------------------------------------
  // FORM SUBMISSION
  // ---------------------------------------------------------
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAllErrors();

    const payload = collectPayload();
    const errors = validate(payload);

    if (errors.length > 0) {
      errors.forEach(([input, message]) => {
        if (input) {
          setFieldError(input, message);
        }
      });

      if (errors[0][0]) {
        errors[0][0].focus();
      }

      return;
    }

    setSubmitting(true);
    showState("loading");

    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (response.status === 422) {
        const matched =
          data && applyServerValidationErrors(data.detail);

        renderError(
          "Check your inputs",
          matched
            ? "Some fields were rejected by the API. Review the highlighted fields."
            : "The API rejected your submission. Please review your inputs."
        );

        return;
      }

      if (!response.ok) {
        const message =
          data && typeof data.detail === "string"
            ? data.detail
            : `The server returned status ${response.status}.`;

        renderError("Prediction failed", message);
        return;
      }

      const score = data?.predicted_mental_health_score;

      if (typeof score !== "number" || !Number.isFinite(score)) {
        renderError(
          "Unexpected response",
          "The server responded, but the predicted score was missing or invalid."
        );

        return;
      }

      renderResult(score);
    } catch (error) {
      console.error("Prediction request failed:", error);

      renderError(
        "Can't reach the server",
        "Unable to connect to the prediction API. Check your internet connection and backend deployment. The first request may take longer if the free service has been idle."
      );
    } finally {
      setSubmitting(false);
    }
  });

  // ---------------------------------------------------------
  // CLEAR ERRORS WHEN FIELDS CHANGE
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
  // RESET / RETRY
  // ---------------------------------------------------------
  resetBtn.addEventListener("click", () => {
    showState("idle");
  });

  errorRetryBtn.addEventListener("click", () => {
    showState("idle");
  });

  console.log("Mental Health Score Predictor JavaScript loaded.");
})();
