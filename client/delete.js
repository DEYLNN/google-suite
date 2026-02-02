// delete.js
let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
const usersPerPage = 10;

function getAuthHeaders() {
  const tokenData = JSON.parse(localStorage.getItem("authToken") || "{}");
  return {
    Authorization: `Bearer ${tokenData.token}`,
    "Content-Type": "application/json",
  };
}

function showLoadingOverlay(message = "Loading users...") {
  const overlay = document.createElement("div");
  overlay.className = "loading-overlay";
  overlay.id = "loadingOverlay";
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="cosmic-loader">
        <div class="orbit">
          <div class="planet"></div>
        </div>
        <div class="orbit orbit-2">
          <div class="planet planet-2"></div>
        </div>
        <div class="orbit orbit-3">
          <div class="planet planet-3"></div>
        </div>
      </div>
      <h3 style="color: white; margin: 0; font-size: 1.2rem;">${message}</h3>
      <p style="color: rgba(255,255,255,0.7); margin: 0.5rem 0 0 0;">Please wait while we fetch the data</p>
    </div>
  `;
  document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.remove();
  }
}

async function loadUsers() {
  showLoadingOverlay("Loading users...");

  try {
    const res = await fetch("/users/list", {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    }

    allUsers = await res.json();
    filteredUsers = [...allUsers];
    currentPage = 1;

    // Reduced loading delay for better performance
    await new Promise((resolve) => setTimeout(resolve, 200));

    hideLoadingOverlay();
    updateDisplay();
    setupSearch();
  } catch (error) {
    console.error("Error loading users:", error);
    hideLoadingOverlay();
    document.getElementById("userList").innerHTML =
      '<p style="text-align: center; color: #f87171;">Error loading users</p>';
    document.getElementById("emailCounter").textContent = "Error";
  }
}

function getCurrentPageUsers() {
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  return filteredUsers.slice(startIndex, endIndex);
}

function getTotalPages() {
  return Math.ceil(filteredUsers.length / usersPerPage);
}

function renderUsers() {
  const currentUsers = getCurrentPageUsers();
  let html = `<div class='table-responsive'><table>`;
  html += `<tr><th><i class="fas fa-envelope"></i> Email</th><th><i class="fas fa-user"></i> Nama</th><th><i class="fas fa-clock"></i> Last Login</th><th><i class="fas fa-calendar-plus"></i> Created</th><th><i class="fas fa-cogs"></i> Actions</th></tr>`;

  if (currentUsers.length === 0) {
    html += `<tr><td colspan="5" style="text-align: center; color: rgba(255,255,255,0.6);">No users found</td></tr>`;
  } else {
    currentUsers.forEach((user, idx) => {
      // Use global utility functions for consistent datetime handling
      const lastLoginDisplay = toWIB(user.lastLogin);
      const createdDisplay = toWIB(user.created);
      html += `<tr>
        <td><b>${user.primaryEmail}</b></td>
        <td>${user.name.givenName} ${user.name.familyName}</td>
        <td>${lastLoginDisplay}</td>
        <td>${createdDisplay}</td>
        <td class="action-buttons">
          <button class='copyBtn' data-email='${user.primaryEmail}' title="Copy Email"><i class="fas fa-copy"></i></button>
          <button class='delBtn' data-email='${user.primaryEmail}' title="Delete User"><i class="fas fa-trash-alt"></i></button>
        </td>
      </tr>`;
    });
  }

  html += `</table></div>`;
  document.getElementById("userList").innerHTML = html;

  // Reattach event listeners for copy buttons
  document.querySelectorAll(".copyBtn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const email = this.dataset.email;
      navigator.clipboard.writeText(email).then(() => {
        const originalIcon = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i>';
        this.style.backgroundColor = '#10B981';
        setTimeout(() => {
          this.innerHTML = originalIcon;
          this.style.backgroundColor = '';
        }, 1000);
      }).catch(() => {
        alert('Failed to copy email!');
      });
    });
  });

  // Reattach event listeners for delete buttons
  document.querySelectorAll(".delBtn").forEach((btn) => {
    btn.addEventListener("click", async function () {
      if (confirm("Delete user " + this.dataset.email + "?")) {
        const originalText = this.innerHTML;
        this.innerHTML =
          '<div class="spinner" style="width: 1rem; height: 1rem;"></div> Deleting...';
        this.disabled = true;

        try {
          const res = await fetch(
            "/users/delete/" + encodeURIComponent(this.dataset.email),
            {
              method: "DELETE",
              headers: getAuthHeaders(),
            },
          );

          if (res.ok) {
            // Remove from arrays
            allUsers = allUsers.filter(
              (u) => u.primaryEmail !== this.dataset.email,
            );
            filteredUsers = filteredUsers.filter(
              (u) => u.primaryEmail !== this.dataset.email,
            );

            // Adjust current page if necessary
            const totalPages = getTotalPages();
            if (currentPage > totalPages && totalPages > 0) {
              currentPage = totalPages;
            }

            updateDisplay();
          } else if (res.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/login";
          } else {
            alert("Failed to delete user!");
            this.innerHTML = originalText;
            this.disabled = false;
          }
        } catch (error) {
          alert("Error deleting user!");
          this.innerHTML = originalText;
          this.disabled = false;
        }
      }
    });
  });
}

function updateEmailCounter() {
  const total = allUsers.length;
  const filtered = filteredUsers.length;
  const showing = getCurrentPageUsers().length;

  let counterText;
  if (filtered === total) {
    if (filtered <= usersPerPage) {
      counterText = `${total} emails`;
    } else {
      const startIndex = (currentPage - 1) * usersPerPage + 1;
      const endIndex = Math.min(startIndex + showing - 1, filtered);
      counterText = `${startIndex}-${endIndex} of ${total} emails`;
    }
  } else {
    if (filtered <= usersPerPage) {
      counterText = `${filtered} of ${total} emails`;
    } else {
      const startIndex = (currentPage - 1) * usersPerPage + 1;
      const endIndex = Math.min(startIndex + showing - 1, filtered);
      counterText = `${startIndex}-${endIndex} of ${filtered} (${total} total) emails`;
    }
  }

  document.getElementById("emailCounter").textContent = counterText;
}

function renderPagination() {
  const totalPages = getTotalPages();
  const paginationControls = document.getElementById("paginationControls");

  if (totalPages <= 1) {
    paginationControls.style.display = "none";
    return;
  }

  paginationControls.style.display = "flex";

  // Update pagination info
  const paginationInfo = document.getElementById("paginationInfo");
  paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  // Update prev/next buttons
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  // Update page numbers
  const pageNumbers = document.getElementById("pageNumbers");
  pageNumbers.innerHTML = "";

  // Calculate visible page range
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  // Adjust range to always show 5 pages when possible
  if (endPage - startPage < 4) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + 4);
    } else {
      startPage = Math.max(1, endPage - 4);
    }
  }

  // Add first page and ellipsis if needed
  if (startPage > 1) {
    addPageButton(1, false);
    if (startPage > 2) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      ellipsis.className = "page-btn page-number";
      ellipsis.style.cursor = "default";
      pageNumbers.appendChild(ellipsis);
    }
  }

  // Add visible page numbers
  for (let i = startPage; i <= endPage; i++) {
    addPageButton(i, i === currentPage);
  }

  // Add last page and ellipsis if needed
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      ellipsis.className = "page-btn page-number";
      ellipsis.style.cursor = "default";
      pageNumbers.appendChild(ellipsis);
    }
    addPageButton(totalPages, false);
  }
}

function addPageButton(pageNum, isActive) {
  const pageNumbers = document.getElementById("pageNumbers");
  const btn = document.createElement("button");
  btn.className = `page-btn page-number ${isActive ? "active" : ""}`;
  btn.textContent = pageNum;
  btn.onclick = () => goToPage(pageNum);
  pageNumbers.appendChild(btn);
}

function goToPage(page) {
  const totalPages = getTotalPages();
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    updateDisplay();
  }
}

function setupPagination() {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      updateDisplay();
    }
  };

  nextBtn.onclick = () => {
    if (currentPage < getTotalPages()) {
      currentPage++;
      updateDisplay();
    }
  };
}

function updateDisplay() {
  updateEmailCounter();
  renderUsers();
  renderPagination();
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  const filterSelect = document.getElementById("filterSelect");
  
  if (!searchInput || !filterSelect) return;

  function applyFilters() {
    const query = searchInput.value.toLowerCase().trim();
    const filterValue = filterSelect.value;

    if (query === "" && filterValue === "all") {
      filteredUsers = [...allUsers];
    } else {
      filteredUsers = allUsers.filter((user) => {
        const email = user.primaryEmail.toLowerCase();
        const name = `${user.name.givenName} ${user.name.familyName}`.toLowerCase();
        const searchMatch = query === "" || email.includes(query) || name.includes(query);
        
        let filterMatch = true;
        if (filterValue === "never-login") {
          filterMatch = isNeverLoggedIn(user.lastLogin);
        } else if (filterValue === "has-login") {
          filterMatch = hasLoggedIn(user.lastLogin);
        }
        
        return searchMatch && filterMatch;
      });
    }

    currentPage = 1; // Reset to first page when filtering
    updateDisplay();
  }

  searchInput.addEventListener("input", applyFilters);
  filterSelect.addEventListener("change", applyFilters);
}

loadUsers();
setupPagination();
