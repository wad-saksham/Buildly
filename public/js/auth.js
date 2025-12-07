document.addEventListener("DOMContentLoaded", function () {
  console.log("Auth.js loaded successfully");

  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loadingOverlay = document.getElementById("loadingOverlay");

  // Debug: Check if all elements are found
  console.log("Elements found:", {
    loginTab: !!loginTab,
    registerTab: !!registerTab,
    loginForm: !!loginForm,
    registerForm: !!registerForm,
    loadingOverlay: !!loadingOverlay,
  });

  // Tab switching
  loginTab.addEventListener("click", () => {
    loginTab.classList.add("border-black", "text-black");
    loginTab.classList.remove("border-transparent", "text-gray-500");
    registerTab.classList.add("border-transparent", "text-gray-500");
    registerTab.classList.remove("border-black", "text-black");

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  });

  registerTab.addEventListener("click", () => {
    registerTab.classList.add("border-black", "text-black");
    registerTab.classList.remove("border-transparent", "text-gray-500");
    loginTab.classList.add("border-transparent", "text-gray-500");
    loginTab.classList.remove("border-black", "text-black");

    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  });

  // Login form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    showLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        showError(data.error || "Login failed");
      }
    } catch (error) {
      showError("Network error. Please try again.");
    } finally {
      showLoading(false);
    }
  });

  // Register form submission
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      username: document.getElementById("registerUsername").value,
      email: document.getElementById("registerEmail").value,
      password: document.getElementById("registerPassword").value,
    };

    showLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("Account created successfully! Please login.");
        // Switch to login tab
        loginTab.click();
        registerForm.reset();
      } else {
        showError(data.error || "Registration failed");
      }
    } catch (error) {
      showError("Network error. Please try again.");
    } finally {
      showLoading(false);
    }
  });

  function showLoading(show) {
    if (show) {
      loadingOverlay.classList.remove("hidden");
    } else {
      loadingOverlay.classList.add("hidden");
    }
  }

  function showError(message) {
    // Create error notification
    const notification = createNotification(message, "error");
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  function showSuccess(message) {
    // Create success notification
    const notification = createNotification(message, "success");
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  function createNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 z-50 animate-slide-up ${
      type === "error" ? "notification-error" : "notification-success"
    }`;
    notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${
                  type === "error" ? "fa-exclamation-circle" : "fa-check-circle"
                } mr-3 text-xl"></i>
                <span class="font-medium">${message}</span>
            </div>
        `;
    return notification;
  }
});
