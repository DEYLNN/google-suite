document.getElementById("loginBtn").addEventListener("click", function () {
  window.location.href = "/auth/login";
});

async function updateSlotInfo() {
  const slotDiv = document.getElementById("slotInfo");
  const slotUsed = document.getElementById("slotUsed");
  const slotMax = document.getElementById("slotMax");
  if (!slotDiv || !slotUsed || !slotMax) return;
  slotUsed.textContent = "-";
  slotMax.textContent = "200";
  try {
    const res = await fetch("/users/slot-info");
    const data = await res.json();
    slotUsed.textContent = data.used || 0;
    slotMax.textContent = data.max || 200;
    slotDiv.dataset.used = data.used;
    slotDiv.dataset.max = data.max;
  } catch {
    slotUsed.textContent = "-";
    slotMax.textContent = "200";
  }
}

updateSlotInfo();

document
  .getElementById("createMultiForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count, customEmail }),
    });
    const result = await res.json();
    let html = `<h3>Hasil:</h3><table style='width:100%;border-collapse:collapse;text-align:left;'>`;
    html += `<tr><th>Email</th><th>Nama</th><th>Password</th><th>Copy</th></tr>`;
    result.forEach((user, idx) => {
      if (user.status === "CREATED") {
        html += `<tr style='color:green;'>
          <td><b>${user.email}</b></td>
          <td>${user.firstName} ${user.lastName}</td>
          <td><span class='pw-mask' id='pw-mask-${idx}'>***</span> <button class='pw-toggle' data-idx='${idx}' style='background:none;border:none;cursor:pointer;font-size:1.1em;color:#222;padding:0 2px;' title='Show/Hide Password'>👁</button></td>
          <td><button class='copyBtn' data-idx='${idx}'>Copy</button></td>
        </tr>`;
      } else {
        html += `<tr style='color:red;'><td colspan='4'>❌ ${user.email} - ${
          user.error || "FAILED"
        }</td></tr>`;
      }
    });
    html += `</table>`;
    document.getElementById("result").innerHTML = html;

    // Copy logic
    document.querySelectorAll(".copyBtn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const user = result[this.dataset.idx];
        const text = `Email: ${user.email}\nNama: ${user.firstName} ${user.lastName}\nPassword: ${user.password}`;
        navigator.clipboard.writeText(text);
        this.textContent = "Copied!";
        setTimeout(() => (this.textContent = "Copy"), 1000);
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
  });

document.getElementById("gotoDelete").addEventListener("click", function () {
  window.location.href = "/delete-users";
});
