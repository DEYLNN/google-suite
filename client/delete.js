// delete.js
async function loadUsers() {
  const res = await fetch("/users/list");
  const users = await res.json();
  let html = `<div class='table-responsive'><table style='width:100%;border-collapse:collapse;text-align:left;'>`;
  html += `<tr><th>Email</th><th>Nama</th><th>Last Login</th><th>Created</th><th>Delete</th></tr>`;
  users.forEach((user, idx) => {
    html += `<tr>
      <td><b>${user.primaryEmail}</b></td>
      <td>${user.name.givenName} ${user.name.familyName}</td>
      <td>${
        user.lastLogin === "Invalid Date" ||
        user.lastLogin === "01/01/1970, 07.00.00" ||
        user.lastLogin === "1/1/1970, 07.00.00"
          ? "-"
          : user.lastLogin
      }</td>
      <td>${user.created}</td>
      <td><button class='delBtn' data-email='${
        user.primaryEmail
      }'>Delete</button></td>
    </tr>`;
  });
  html += `</table></div>`;
  document.getElementById("userList").innerHTML = html;
  document.querySelectorAll(".delBtn").forEach((btn) => {
    btn.addEventListener("click", async function () {
      if (confirm("Delete user " + this.dataset.email + "?")) {
        const res = await fetch(
          "/users/delete/" + encodeURIComponent(this.dataset.email),
          { method: "DELETE" }
        );
        if (res.ok) {
          this.closest("tr").remove();
        } else {
          alert("Failed to delete user!");
        }
      }
    });
  });
}

loadUsers();
