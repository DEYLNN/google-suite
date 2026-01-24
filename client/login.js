// login.js
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginBtn = document.getElementById("loginBtn");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  // Password visibility toggle
  togglePassword.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    const icon = this.querySelector("i");
    if (type === "text") {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });

  // Form submission
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        // Save token to localStorage with expiry
        const tokenData = {
          token: data.token,
          user: data.user,
          expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        };

        localStorage.setItem("authToken", JSON.stringify(tokenData));

        // Show success and redirect
        showSuccess("Login successful! Redirecting...");

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        showError(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  });

  function setLoading(loading) {
    const btnText = loginBtn.querySelector(".btn-text");
    const btnLoading = loginBtn.querySelector(".btn-loading");

    if (loading) {
      btnText.style.display = "none";
      btnLoading.style.display = "flex";
      loginBtn.disabled = true;
    } else {
      btnText.style.display = "block";
      btnLoading.style.display = "none";
      loginBtn.disabled = false;
    }
  }

  function showError(message) {
    removeExistingAlerts();
    const alert = createAlert(message, "error");
    loginForm.insertBefore(alert, loginForm.firstChild);
  }

  function showSuccess(message) {
    removeExistingAlerts();
    const alert = createAlert(message, "success");
    loginForm.insertBefore(alert, loginForm.firstChild);
  }

  function createAlert(message, type) {
    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
            <i class="fas fa-${type === "error" ? "exclamation-circle" : "check-circle"}"></i>
            <span>${message}</span>
        `;
    return alert;
  }

  function removeExistingAlerts() {
    const existingAlerts = loginForm.querySelectorAll(".alert");
    existingAlerts.forEach((alert) => alert.remove());
  }

  // Check if already logged in
  const tokenData = JSON.parse(localStorage.getItem("authToken") || "{}");
  if (tokenData.token && tokenData.expiry && tokenData.expiry > Date.now()) {
    window.location.href = "/dashboard";
  }
});
