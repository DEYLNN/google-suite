// app.js
function checkAuth() {
  const tokenData = JSON.parse(localStorage.getItem("authToken") || "{}");
  if (!tokenData.token || tokenData.expiry < Date.now()) {
    window.location.href = "/login";
    return false;
  }
  return true;
}

function getAuthHeaders() {
  const tokenData = JSON.parse(localStorage.getItem("authToken") || "{}");
  return {
    Authorization: `Bearer ${tokenData.token}`,
    "Content-Type": "application/json",
  };
}

// Check auth on page load
if (!checkAuth()) {
  // Will redirect to login
} else {
  // Initialize page
  updateSlotInfo();
}

document.getElementById("loginBtn").addEventListener("click", function () {
  window.location.href = "/auth/login";
});

async function updateSlotInfo() {
  const slotDiv = document.getElementById("slotInfo");
  const slotUsed = document.getElementById("slotUsed");
  const slotMax = document.getElementById("slotMax");
  const slotFill = document.getElementById("slotFill");
  if (!slotDiv || !slotUsed || !slotMax) return;
  slotUsed.textContent = "-";
  slotMax.textContent = "200";
  try {
    const res = await fetch("/users/slot-info", {
      headers: getAuthHeaders(),
    });

    if (res.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
      return;
    }

    const data = await res.json();
    const used = data.used || 0;
    const max = data.max || 200;
    slotUsed.textContent = used;
    slotMax.textContent = max;
    slotDiv.dataset.used = used;
    slotDiv.dataset.max = max;

    // Update progress bar
    const percentage = (used / max) * 100;
    if (slotFill) {
      slotFill.style.width = percentage + "%";
    }
  } catch {
    slotUsed.textContent = "-";
    slotMax.textContent = "200";
    if (slotFill) slotFill.style.width = "0%";
  }
}

updateSlotInfo();

document
  .getElementById("createMultiForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!checkAuth()) return;

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text') || submitBtn;
    const originalText = btnText.textContent;
    
    // Disable button and show loading
    submitBtn.disabled = true;
    btnText.innerHTML = '<div class="spinner" style="width: 1rem; height: 1rem; display: inline-block; margin-right: 0.5rem;"></div>Processing...';
    
    try {
      const count = parseInt(form.count.value);
      const customEmail = form.customEmail.value.trim();
      const slotDiv = document.getElementById("slotInfo");
      const used = parseInt(slotDiv?.dataset.used || "0");
      const max = parseInt(slotDiv?.dataset.max || "200");
      
      if (max - used < count) {
        alert(`Slot tidak cukup! Sisa slot: ${max - used}`);
        return;
      }
      
      document.getElementById("result").textContent = "Processing...";
      const res = await fetch("/users/create-multi", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ count, customEmail }),
      });

      if (res.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
        return;
      }

      const result = await res.json();
    const resultsCard = document.getElementById("resultsCard");
    resultsCard.style.display = "block";

    let html = `<div class="table-responsive"><table>`;
    html += `<tr><th><i class="fas fa-envelope"></i> Email</th><th><i class="fas fa-user"></i> Nama</th><th><i class="fas fa-key"></i> Password</th><th><i class="fas fa-copy"></i> Copy</th></tr>`;
    result.forEach((user, idx) => {
      if (user.status === "CREATED") {
        html += `<tr style='color:green;'>
          <td><b>${user.email}</b></td>
          <td>${user.firstName} ${user.lastName}</td>
          <td><span class='pw-mask' id='pw-mask-${idx}'>***</span> <button class='pw-toggle' data-idx='${idx}' style='background:none;border:none;cursor:pointer;font-size:1.1em;color:#667eea;padding:0 2px;' title='Show/Hide Password'>👁</button></td>
          <td><button class='copyBtn' data-idx='${idx}'><i class="fas fa-copy"></i> Copy</button></td>
        </tr>`;
      } else {
        html += `<tr style='color:red;'><td colspan='4'><i class="fas fa-exclamation-triangle"></i> ${user.email} - ${
          user.error || "FAILED"
        }</td></tr>`;
      }
    });
    html += `</table></div>`;
    document.getElementById("result").innerHTML = html;

    // Copy logic - email only
    document.querySelectorAll(".copyBtn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const user = result[this.dataset.idx];
        const email = user.email;
        navigator.clipboard.writeText(email);
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => (this.innerHTML = originalText), 2000);
      });
    });

    // Password show/hide logic
    document.querySelectorAll(".pw-toggle").forEach((btn) => {
      btn.addEventListener("click", function () {
        const idx = this.dataset.idx;
        const mask = document.getElementById("pw-mask-" + idx);
        if (mask.textContent === "***") {
          mask.textContent = result[idx].password;
        } else {
          mask.textContent = "***";
        }
      });
    });
    updateSlotInfo();
    
    } catch (error) {
      console.error('Error creating users:', error);
      document.getElementById("result").innerHTML = '<p style="color: #f87171;">Error creating users. Please try again.</p>';
    } finally {
      // Re-enable button and restore text
      submitBtn.disabled = false;
      btnText.textContent = originalText;
    }
  });

document.getElementById("gotoDelete").addEventListener("click", function () {
  window.location.href = "/delete-users";
});
