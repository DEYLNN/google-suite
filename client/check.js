// check.js
document.addEventListener("DOMContentLoaded", function () {
  checkAuthentication();
});

async function checkAuthentication() {
  const statusText = document.getElementById("statusText");
  const statusDesc = document.getElementById("statusDesc");

  // Check for token in URL (from OAuth callback)
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get("token");

  if (urlToken) {
    // Save token from OAuth callback
    const tokenData = {
      token: urlToken,
      user: { email: "google-user@domain.com", name: "Google User" },
      expiry: Date.now() + 24 * 60 * 60 * 1000,
    };
    localStorage.setItem("authToken", JSON.stringify(tokenData));
  }

  // Get token from localStorage
  const stored = localStorage.getItem("authToken");

  if (!stored) {
    redirectToLogin("No authentication found");
    return;
  }

  try {
    const tokenData = JSON.parse(stored);

    // Check if token is expired
    if (
      !tokenData.token ||
      !tokenData.expiry ||
      tokenData.expiry < Date.now()
    ) {
      localStorage.removeItem("authToken");
      redirectToLogin("Session expired");
      return;
    }

    statusText.textContent = "Validating token...";
    statusDesc.textContent = "Checking authentication with server";

    // Validate token with server
    const response = await fetch("/auth/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: tokenData.token }),
    });

    const result = await response.json();

    if (result.valid) {
      statusText.textContent = "Access granted!";
      statusDesc.textContent = `Welcome back, ${tokenData.user.name || tokenData.user.email}`;

      setTimeout(() => {
        // Redirect based on current path
        if (window.location.pathname === "/delete") {
          window.location.replace("/delete.html");
        } else {
          window.location.replace("/dashboard");
        }
      }, 2000);
    } else {
      localStorage.removeItem("authToken");
      redirectToLogin("Invalid session");
    }
  } catch (error) {
    console.error("Token validation error:", error);
    localStorage.removeItem("authToken");
    redirectToLogin("Authentication error");
  }
}

function redirectToLogin(reason) {
  const statusText = document.getElementById("statusText");
  const statusDesc = document.getElementById("statusDesc");

  statusText.textContent = "Access denied";
  statusDesc.textContent = reason;

  setTimeout(() => {
    window.location.href = "/login";
  }, 2000);
}
