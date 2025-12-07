document.addEventListener("DOMContentLoaded", function () {
  // Check authentication
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  // Display user welcome message
  const userWelcome = document.getElementById("userWelcome");
  if (userWelcome && user.username) {
    userWelcome.textContent = `Welcome back, ${user.username}!`;
  }

  // Mobile menu toggle
  window.toggleMobileMenu = function () {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("mobileMenuOverlay");

    if (sidebar.classList.contains("sidebar-open")) {
      sidebar.classList.remove("sidebar-open");
      overlay.classList.add("hidden");
      document.body.style.overflow = "";
    } else {
      sidebar.classList.add("sidebar-open");
      overlay.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  };

  // Close mobile menu when clicking a nav item
  const closeMobileMenu = () => {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("mobileMenuOverlay");
    if (window.innerWidth < 1024) {
      sidebar.classList.remove("sidebar-open");
      overlay.classList.add("hidden");
      document.body.style.overflow = "";
    }
  };

  // Navigation handling
  const navItems = document.querySelectorAll(".nav-item");
  const content = document.getElementById("content");

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const href = item.getAttribute("href");

      // Allow external links (like /chatbot) to navigate normally
      if (href.startsWith("/") && href !== "/dashboard") {
        closeMobileMenu();
        return; // Let the browser handle the navigation
      }

      e.preventDefault();

      // Remove active class from all items
      navItems.forEach((nav) => {
        nav.classList.remove("active");
      });

      // Add active class to clicked item
      item.classList.add("active");

      // Close mobile menu after selection
      closeMobileMenu();

      // Load content based on selection
      const page = href.substring(1);
      loadPage(page);
    });
  });

  window.loadPage = async function (page) {
    const header = document.querySelector("header h2");

    // Update active nav item
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((nav) => {
      nav.classList.remove("active");
      if (nav.getAttribute("href") === `#${page}`) {
        nav.classList.add("active");
      }
    });

    // Refresh data from API for data-dependent pages
    if (["dashboard", "projects", "tasks", "timeline"].includes(page)) {
      await loadAllData();
    }

    switch (page) {
      case "dashboard":
        header.textContent = "Dashboard";
        loadDashboardContent();
        break;
      case "projects":
        header.textContent = "Projects";
        loadProjectsContent();
        break;
      case "tasks":
        header.textContent = "Task Board";
        loadTasksContent();
        break;

      case "calculator":
        header.textContent = "Construction Calculator";
        loadCalculatorContent();
        break;
      case "timeline":
        header.textContent = "Project Timeline";
        loadTimelineContent();
        break;
      case "documents":
        header.textContent = "Document Management";
        loadDocumentsContent();
        break;
    }
  };

  function loadDashboardContent() {
    // Calculate dynamic stats
    const activeProjectCount = projects.filter(
      (p) => p.status === "active" || p.status === "planning"
    ).length;
    const completedTaskCount = tasks.filter(
      (t) => t.status === "completed"
    ).length;
    const totalTaskCount = tasks.length;
    const completionRate =
      totalTaskCount > 0
        ? Math.round((completedTaskCount / totalTaskCount) * 100)
        : 0;

    // Dynamic messages based on data
    const projectMsg =
      activeProjectCount === 0
        ? "Start your first project"
        : `${activeProjectCount} project${
            activeProjectCount > 1 ? "s" : ""
          } in progress`;
    const taskMsg =
      completedTaskCount === 0
        ? "No tasks completed yet"
        : `${totalTaskCount - completedTaskCount} task${
            totalTaskCount - completedTaskCount !== 1 ? "s" : ""
          } remaining`;
    const rateMsg =
      totalTaskCount === 0
        ? "Create tasks to track progress"
        : completionRate === 100
        ? "All tasks done!"
        : "Keep up the good work!";

    // Show welcome card only for new users
    const showWelcome = projects.length === 0 && tasks.length === 0;

    content.innerHTML = `
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div class="modern-card fade-in-up" style="background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%); color: white;">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-300 text-sm font-medium">Active Projects</p>
                            <p class="text-2xl sm:text-3xl font-bold">${activeProjectCount}</p>
                            <p class="text-gray-400 text-xs mt-1">${projectMsg}</p>
                        </div>
                        <i class="fas fa-project-diagram text-2xl sm:text-3xl text-gray-400"></i>
                    </div>
                </div>
                
                <div class="modern-card fade-in-up" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; animation-delay: 0.1s;">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100 text-sm font-medium">Completed Tasks</p>
                            <p class="text-2xl sm:text-3xl font-bold">${completedTaskCount}</p>
                            <p class="text-green-200 text-xs mt-1">${taskMsg}</p>
                        </div>
                        <i class="fas fa-check-circle text-2xl sm:text-3xl text-green-200"></i>
                    </div>
                </div>
                
                <div class="modern-card fade-in-up sm:col-span-2 lg:col-span-1" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; animation-delay: 0.2s;">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100 text-sm font-medium">Completion Rate</p>
                            <p class="text-2xl sm:text-3xl font-bold">${completionRate}%</p>
                            <p class="text-purple-200 text-xs mt-1">${rateMsg}</p>
                        </div>
                        <i class="fas fa-chart-line text-2xl sm:text-3xl text-purple-200"></i>
                    </div>
                </div>
            </div>

            ${
              showWelcome
                ? `
            <!-- Welcome Message for New Users -->
            <div class="modern-card fade-in-up mb-4 sm:mb-6" style="background: linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%); border: 2px solid #404040;">
                <div class="flex flex-col sm:flex-row items-start sm:items-center">
                    <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center mb-3 sm:mb-0 sm:mr-4 flex-shrink-0">
                        <i class="fas fa-rocket text-white text-xl sm:text-2xl"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg sm:text-xl font-bold text-gray-800 mb-2">Welcome to Buildly!</h3>
                        <p class="text-gray-600 mb-3 text-sm sm:text-base">Get started by creating your first project or exploring our AI assistant for construction help.</p>
                        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button onclick="loadPage('projects')" class="btn-primary px-4 py-2 text-sm">
                                <i class="fas fa-plus mr-2"></i>Create Project
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `
                : ""
            }

            <!-- Quick Actions -->
            <div class="modern-card fade-in-right">
                <h3 class="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Quick Actions</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <button onclick="loadPage('projects')" class="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 text-left group active:scale-95">
                        <i class="fas fa-plus text-xl sm:text-2xl text-gray-800 mb-2 sm:mb-3"></i>
                        <p class="font-semibold text-gray-800 text-sm sm:text-base">New Project</p>
                        <p class="text-gray-600 text-xs sm:text-sm">Start a new construction project</p>
                    </button>
                    
                    <button onclick="loadPage('calculator')" class="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 text-left group active:scale-95">
                        <i class="fas fa-calculator text-xl sm:text-2xl text-orange-600 mb-2 sm:mb-3"></i>
                        <p class="font-semibold text-gray-800 text-sm sm:text-base">Construction Calculator</p>
                        <p class="text-gray-600 text-xs sm:text-sm">Calculate materials needed</p>
                    </button>
                </div>
            </div>
        `;
  }

  function loadProjectsContent() {
    if (projects.length === 0) {
      content.innerHTML = `
              <div class="mb-4 sm:mb-6 flex justify-between items-center gap-3">
                  <h3 class="text-lg sm:text-xl font-bold text-gray-800">All Projects</h3>
                  <button onclick="createNewProject()" class="btn-primary px-4 py-2 text-sm flex-shrink-0">
                      <i class="fas fa-plus mr-2"></i>New Project
                  </button>
              </div>
              
              <div class="modern-card text-center py-8 sm:py-12">
                  <i class="fas fa-project-diagram text-5xl sm:text-6xl text-gray-300 mb-4"></i>
                  <h4 class="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No projects yet</h4>
                  <p class="text-gray-500 mb-6 text-sm sm:text-base px-4">Create your first construction project to get started with Buildly.</p>
                  <button onclick="createNewProject()" class="btn-primary px-6 py-3">
                      <i class="fas fa-plus mr-2"></i>Create Your First Project
                  </button>
              </div>
          `;
    } else {
      content.innerHTML = `
              <div class="mb-4 sm:mb-6 flex justify-between items-center gap-3">
                  <h3 class="text-lg sm:text-xl font-bold text-gray-800">All Projects (${
                    projects.length
                  })</h3>
                  <button onclick="createNewProject()" class="btn-primary px-4 py-2 text-sm flex-shrink-0">
                      <i class="fas fa-plus mr-2"></i>New Project
                  </button>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  ${projects
                    .map(
                      (project) => `
                      <div class="project-card group" onclick="viewProjectDetails(${
                        project.id
                      })">
                          <div class="flex items-start justify-between mb-3 gap-2">
                              <h4 class="text-base sm:text-lg font-bold text-gray-800 flex-1 line-clamp-1">${
                                project.name
                              }</h4>
                              <span class="status-${
                                project.status
                              } px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">${
                        project.status
                      }</span>
                          </div>
                          <p class="text-gray-600 text-sm mb-3 line-clamp-2">${
                            project.description || "No description"
                          }</p>
                          <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                              <div class="flex items-center text-gray-500 text-xs">
                                  <i class="fas fa-calendar mr-2"></i>
                                  ${project.createdAt}
                              </div>
                              <div class="flex items-center space-x-3 sm:space-x-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                  <button onclick="event.stopPropagation(); editProject(${
                                    project.id
                                  })" class="text-gray-700 hover:text-black p-2 sm:p-1" title="Edit">
                                      <i class="fas fa-edit"></i>
                                  </button>
                                  <button onclick="event.stopPropagation(); deleteProject(${
                                    project.id
                                  })" class="text-red-600 hover:text-red-700 p-2 sm:p-1" title="Delete">
                                      <i class="fas fa-trash"></i>
                                  </button>
                              </div>
                          </div>
                      </div>
                  `
                    )
                    .join("")}
              </div>
          `;
    }
  }

  function loadCalculatorContent() {
    content.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div class="modern-card fade-in-left">
                    <div class="flex items-center mb-4 sm:mb-6">
                        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-gray-700 to-black rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                            <i class="fas fa-th text-white text-lg sm:text-xl"></i>
                        </div>
                        <h3 class="text-lg sm:text-xl font-bold text-gray-800">Tile Calculator</h3>
                    </div>
                    <div class="space-y-3 sm:space-y-4">
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2 text-sm">Room Length (ft)</label>
                            <input type="number" id="tileLength" class="modern-input" placeholder="Enter length" inputmode="decimal">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2 text-sm">Room Width (ft)</label>
                            <input type="number" id="tileWidth" class="modern-input" placeholder="Enter width" inputmode="decimal">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2 text-sm">Tile Size (inches)</label>
                            <select id="tileSize" class="modern-select">
                                <option value="12">12" x 12"</option>
                                <option value="18">18" x 18"</option>
                                <option value="24">24" x 24"</option>
                            </select>
                        </div>
                        <button onclick="calculateTiles()" class="btn-primary w-full py-3 font-semibold active:scale-95">
                            <i class="fas fa-calculator mr-2"></i>Calculate Tiles
                        </button>
                        <div id="tileResult" class="p-3 sm:p-4 bg-gray-50 border border-gray-300 rounded-lg hidden">
                            <p class="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Result:</p>
                            <p id="tileCount" class="text-gray-700 text-sm sm:text-base"></p>
                        </div>
                    </div>
                </div>
                
                <div class="modern-card fade-in-right">
                    <div class="flex items-center mb-4 sm:mb-6">
                        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                            <i class="fas fa-cube text-white text-lg sm:text-xl"></i>
                        </div>
                        <h3 class="text-lg sm:text-xl font-bold text-gray-800">Concrete Calculator</h3>
                    </div>
                    <div class="space-y-3 sm:space-y-4">
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2 text-sm">Length (ft)</label>
                            <input type="number" id="concreteLength" class="modern-input" placeholder="Enter length" inputmode="decimal">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2 text-sm">Width (ft)</label>
                            <input type="number" id="concreteWidth" class="modern-input" placeholder="Enter width" inputmode="decimal">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2 text-sm">Thickness (inches)</label>
                            <input type="number" id="concreteThickness" class="modern-input" placeholder="Enter thickness" inputmode="decimal">
                        </div>
                        <button onclick="calculateConcrete()" class="btn-primary w-full py-3 font-semibold active:scale-95" style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);">
                            <i class="fas fa-calculator mr-2"></i>Calculate Concrete
                        </button>
                        <div id="concreteResult" class="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg hidden">
                            <p class="font-semibold text-green-800 mb-2 text-sm sm:text-base">Result:</p>
                            <p id="concreteAmount" class="text-gray-700 text-sm sm:text-base"></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  // Add other content loading functions...
  function loadTasksContent() {
    const pendingTasks = tasks.filter((t) => t.status === "pending");
    const completedTasks = tasks.filter((t) => t.status === "completed");

    const getProjectName = (projectId) => {
      if (!projectId) return null;
      const project = projects.find((p) => p.id == projectId);
      return project ? project.name : "Unknown Project";
    };

    content.innerHTML = `
            <div class="mb-4 sm:mb-6 flex justify-between items-center gap-3">
                <h3 class="text-lg sm:text-xl font-bold text-gray-800">Task Board</h3>
                <button onclick="createNewTask()" class="btn-primary px-4 py-2 text-sm flex-shrink-0">
                    <i class="fas fa-plus mr-2"></i>Add Task
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <!-- Pending Tasks -->
                <div class="modern-card">
                    <div class="flex items-center justify-between mb-4 pb-3 border-b-2 border-orange-200">
                        <h3 class="font-bold text-base sm:text-lg text-gray-800 flex items-center">
                            <i class="fas fa-clock text-orange-500 mr-2"></i>
                            Pending
                        </h3>
                        <span class="bg-orange-100 text-orange-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">${
                          pendingTasks.length
                        }</span>
                    </div>
                    ${
                      pendingTasks.length === 0
                        ? `
                        <div class="text-center py-8 sm:py-12">
                            <i class="fas fa-clipboard-list text-4xl sm:text-5xl text-gray-300 mb-3"></i>
                            <p class="text-gray-500 text-sm">No pending tasks</p>
                            <button onclick="createNewTask()" class="mt-4 text-gray-700 hover:text-black font-medium text-sm py-2">
                                <i class="fas fa-plus mr-1"></i>Add your first task
                            </button>
                        </div>
                    `
                        : pendingTasks
                            .map((task) => {
                              const projectName = getProjectName(
                                task.projectId
                              );
                              return `
                        <div class="task-card mb-3 border-l-4 border-orange-500">
                            <div class="flex items-start justify-between mb-2 gap-2">
                                <h4 class="font-semibold text-gray-800 flex-1 text-sm sm:text-base">${
                                  task.name
                                }</h4>
                                <button onclick="completeTask(${
                                  task.id
                                })" class="text-green-600 hover:text-green-700 p-1" title="Mark as completed">
                                    <i class="fas fa-check-circle text-xl"></i>
                                </button>
                            </div>
                            ${
                              task.description
                                ? `<p class="text-gray-600 text-xs sm:text-sm mb-2">${task.description}</p>`
                                : ""
                            }
                            <div class="flex flex-wrap items-center justify-between mt-3 pt-2 border-t border-gray-100 gap-2">
                                ${
                                  projectName
                                    ? `
                                    <span class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                        <i class="fas fa-project-diagram mr-1"></i>${projectName}
                                    </span>
                                `
                                    : '<span class="text-xs text-gray-400">No project</span>'
                                }
                                <div class="flex items-center space-x-3">
                                    <span class="text-xs text-gray-500 hidden sm:inline">${
                                      task.createdAt
                                    }</span>
                                    <button onclick="deleteTask(${
                                      task.id
                                    })" class="text-red-500 hover:text-red-700 p-1" title="Delete task">
                                        <i class="fas fa-trash text-sm"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                            })
                            .join("")
                    }
                </div>
                
                <!-- Completed Tasks -->
                <div class="modern-card">
                    <div class="flex items-center justify-between mb-4 pb-3 border-b-2 border-green-200">
                        <h3 class="font-bold text-base sm:text-lg text-gray-800 flex items-center">
                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                            Completed
                        </h3>
                        <span class="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">${
                          completedTasks.length
                        }</span>
                    </div>
                    ${
                      completedTasks.length === 0
                        ? `
                        <div class="text-center py-8 sm:py-12">
                            <i class="fas fa-check-double text-4xl sm:text-5xl text-gray-300 mb-3"></i>
                            <p class="text-gray-500 text-sm">No completed tasks yet</p>
                            <p class="text-gray-400 text-xs mt-2">Complete tasks to see them here</p>
                        </div>
                    `
                        : completedTasks
                            .map((task) => {
                              const projectName = getProjectName(
                                task.projectId
                              );
                              return `
                        <div class="task-card mb-3 border-l-4 border-green-500 bg-green-50/30">
                            <div class="flex items-start justify-between mb-2 gap-2">
                                <h4 class="font-semibold text-gray-700 flex-1 line-through text-sm sm:text-base">${
                                  task.name
                                }</h4>
                                <button onclick="pendingTask(${
                                  task.id
                                })" class="text-orange-600 hover:text-orange-700 p-1" title="Move to pending">
                                    <i class="fas fa-undo text-lg"></i>
                                </button>
                            </div>
                            ${
                              task.description
                                ? `<p class="text-gray-500 text-xs sm:text-sm mb-2">${task.description}</p>`
                                : ""
                            }
                            <div class="flex flex-wrap items-center justify-between mt-3 pt-2 border-t border-gray-100 gap-2">
                                ${
                                  projectName
                                    ? `
                                    <span class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                        <i class="fas fa-project-diagram mr-1"></i>${projectName}
                                    </span>
                                `
                                    : '<span class="text-xs text-gray-400">No project</span>'
                                }
                                <div class="flex items-center space-x-3">
                                    <span class="text-xs text-green-600 hidden sm:inline">
                                        <i class="fas fa-check mr-1"></i>${
                                          task.completedAt || task.createdAt
                                        }
                                    </span>
                                    <button onclick="deleteTask(${
                                      task.id
                                    })" class="text-red-500 hover:text-red-700 p-1" title="Delete task">
                                        <i class="fas fa-trash text-sm"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                            })
                            .join("")
                    }
                </div>
            </div>
            
            ${
              tasks.length === 0
                ? `
                <div class="modern-card mt-6 text-center py-12">
                    <div class="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-tasks text-white text-3xl"></i>
                    </div>
                    <h4 class="text-xl font-semibold text-gray-700 mb-2">Ready to get organized?</h4>
                    <p class="text-gray-500 mb-6">Create your first task to start managing your construction workflow.</p>
                    <button onclick="createNewTask()" class="btn-primary px-6 py-3">
                        <i class="fas fa-plus mr-2"></i>Create First Task
                    </button>
                </div>
            `
                : ""
            }
        `;
  }

  function loadTimelineContent() {
    if (activities.length === 0) {
      content.innerHTML = `
              <div class="modern-card text-center py-8 sm:py-12">
                  <i class="fas fa-history text-5xl sm:text-6xl text-gray-300 mb-4"></i>
                  <h4 class="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No activity yet</h4>
                  <p class="text-gray-500 mb-6 text-sm sm:text-base px-4">Start creating projects and tasks to see your activity timeline.</p>
                  <button onclick="loadPage('projects')" class="btn-primary px-6 py-3 w-full sm:w-auto">
                      <i class="fas fa-plus mr-2"></i>Create First Project
                  </button>
              </div>
          `;
    } else {
      const getActivityIcon = (type) => {
        switch (type) {
          case "project":
            return "fa-project-diagram text-gray-700";
          case "task":
            return "fa-tasks text-green-500";
          case "edit":
            return "fa-edit text-orange-500";
          case "delete":
            return "fa-trash text-red-500";
          default:
            return "fa-circle text-gray-500";
        }
      };

      content.innerHTML = `
              <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 class="text-lg sm:text-xl font-bold text-gray-800">Activity Timeline</h3>
                  <button onclick="clearTimeline()" class="text-gray-500 hover:text-red-600 transition-colors px-4 py-2 text-sm">
                      <i class="fas fa-trash mr-2"></i>Clear History
                  </button>
              </div>
              
              <div class="modern-card">
                  <div class="relative">
                      <!-- Timeline line -->
                      <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      
                      <!-- Activities -->
                      <div class="space-y-6">
                          ${activities
                            .map(
                              (activity, index) => `
                              <div class="relative pl-16 pb-6 ${
                                index === activities.length - 1
                                  ? ""
                                  : "border-b border-gray-100"
                              }">
                                  <!-- Icon -->
                                  <div class="absolute left-3 w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                                      <i class="fas ${getActivityIcon(
                                        activity.type
                                      )} text-xs"></i>
                                  </div>
                                  
                                  <!-- Content -->
                                  <div class="flex items-start justify-between">
                                      <div class="flex-1">
                                          <p class="text-gray-800 font-medium">${
                                            activity.description
                                          }</p>
                                          <div class="flex items-center space-x-3 mt-1">
                                              <span class="text-xs text-gray-500">
                                                  <i class="fas fa-calendar mr-1"></i>${
                                                    activity.date
                                                  }
                                              </span>
                                              <span class="text-xs text-gray-500">
                                                  <i class="fas fa-clock mr-1"></i>${
                                                    activity.time
                                                  }
                                              </span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          `
                            )
                            .join("")}
                      </div>
                  </div>
              </div>
          `;
    }
  }

  window.clearTimeline = async function () {
    if (
      confirm(
        "Are you sure you want to clear all activity history? This cannot be undone."
      )
    ) {
      try {
        await apiCall("/activities", "DELETE");
        activities = [];
        loadPage("timeline");
      } catch (error) {
        alert("Failed to clear timeline: " + error.message);
      }
    }
  };

  function loadDocumentsContent() {
    content.innerHTML = `
            <div class="modern-card text-center py-8 sm:py-12">
                <i class="fas fa-file-alt text-5xl sm:text-6xl text-gray-300 mb-4"></i>
                <h4 class="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No documents uploaded</h4>
                <p class="text-gray-500 mb-6 text-sm sm:text-base px-4">Upload blueprints, contracts, and other project documents.</p>
                
                <!-- Hidden file input with mobile-friendly attributes -->
                <input type="file" id="documentUpload" multiple 
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.heic,image/*,application/pdf" 
                    style="display: none;" 
                    onchange="handleFileUpload(event)">
                
                <div class="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <button onclick="document.getElementById('documentUpload').click()" class="btn-primary px-6 py-3">
                        <i class="fas fa-upload mr-2"></i>Upload Documents
                    </button>
                </div>
            </div>
        `;
  }
});

// Calculator functions
function calculateTiles() {
  const length = parseFloat(document.getElementById("tileLength").value);
  const width = parseFloat(document.getElementById("tileWidth").value);
  const tileSize = parseFloat(document.getElementById("tileSize").value);

  if (!length || !width) return;

  const roomArea = length * width;
  const tileArea = (tileSize * tileSize) / 144; // Convert to sq ft
  const tilesNeeded = Math.ceil(roomArea / tileArea);
  const tilesWithWaste = Math.ceil(tilesNeeded * 1.1); // 10% waste

  document.getElementById(
    "tileCount"
  ).textContent = `You need ${tilesNeeded} tiles (${tilesWithWaste} with 10% waste factor)`;
  document.getElementById("tileResult").classList.remove("hidden");
}

function calculateConcrete() {
  const length = parseFloat(document.getElementById("concreteLength").value);
  const width = parseFloat(document.getElementById("concreteWidth").value);
  const thickness = parseFloat(
    document.getElementById("concreteThickness").value
  );

  if (!length || !width || !thickness) return;

  const volume = (length * width * (thickness / 12)) / 27; // Convert to cubic yards

  document.getElementById(
    "concreteAmount"
  ).textContent = `You need ${volume.toFixed(2)} cubic yards of concrete`;
  document.getElementById("concreteResult").classList.remove("hidden");
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

// Global function to create new project
window.createNewProject = function () {
  const projectName = prompt("Enter project name:");
  if (projectName && projectName.trim()) {
    alert(
      `Project "${projectName}" created successfully!\n\nNote: This is a demo. Full project management features coming soon.`
    );
    // Reload projects page to show the new project would be added here
    loadPage("projects");
  }
};

// Global function to create new task
window.createNewTask = function () {
  const taskName = prompt("Enter task name:");
  if (taskName && taskName.trim()) {
    alert(
      `Task "${taskName}" created successfully!\n\nNote: This is a demo. Full task management features coming soon.`
    );
    // Reload tasks page to show the new task would be added here
    loadPage("tasks");
  }
};

// Global function to handle file upload
window.handleFileUpload = function (event) {
  const files = event.target.files;
  if (files.length > 0) {
    const fileNames = Array.from(files)
      .map((f) => f.name)
      .join(", ");
    alert(
      `Files selected: ${fileNames}\n\nNote: This is a demo. File upload functionality coming soon.`
    );
  }
};

// Storage for projects and tasks - loaded from API
let projects = [];
let tasks = [];
let activities = [];

// Get auth token
function getToken() {
  return localStorage.getItem("token");
}

// API helper function
async function apiCall(endpoint, method = "GET", data = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  };
  if (data) {
    options.body = JSON.stringify(data);
  }
  const response = await fetch(`/api${endpoint}`, options);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }
  return response.json();
}

// Load all data from API
async function loadAllData() {
  try {
    const [projectsData, tasksData, activitiesData] = await Promise.all([
      apiCall("/projects"),
      apiCall("/tasks"),
      apiCall("/activities"),
    ]);
    projects = projectsData.map((p) => ({
      id: p._id,
      name: p.name,
      description: p.description,
      status: p.status,
      createdAt: new Date(p.createdAt).toLocaleDateString(),
    }));
    tasks = tasksData.map((t) => ({
      id: t._id,
      name: t.title,
      description: t.description,
      projectId: t.project?._id || null,
      projectName: t.project?.name || null,
      status: t.status,
      createdAt: new Date(t.createdAt).toLocaleDateString(),
      completedAt: t.completedAt
        ? new Date(t.completedAt).toLocaleDateString()
        : null,
    }));
    activities = activitiesData.map((a) => ({
      id: a._id,
      type: a.type,
      description: a.description,
      date: new Date(a.createdAt).toLocaleDateString(),
      time: new Date(a.createdAt).toLocaleTimeString(),
    }));
  } catch (error) {
    console.error("Failed to load data:", error);
  }
}

// Initialize data on page load
loadAllData();

// Modern Modal System
function showModal(title, fields, onSubmit) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <h2>${title}</h2>
      </div>
      <div class="modal-body">
        ${fields
          .map(
            (field) => `
          <label class="block text-gray-700 font-semibold mb-2 text-sm">${
            field.label
          }</label>
          ${
            field.type === "textarea"
              ? `<textarea id="${field.id}" class="modal-textarea" placeholder="${field.placeholder}"></textarea>`
              : `<input type="${field.type || "text"}" id="${
                  field.id
                }" class="modal-input" placeholder="${field.placeholder}">`
          }
        `
          )
          .join("")}
      </div>
      <div class="modal-footer">
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="submitModal()">Create</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById(fields[0].id).focus(), 100);

  // Store submit handler
  window.currentModalSubmit = onSubmit;

  // Close on overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);
}

function closeModal() {
  const overlay = document.querySelector(".modal-overlay");
  if (overlay) {
    overlay.remove();
  }
  window.currentModalSubmit = null;
}

function submitModal() {
  if (window.currentModalSubmit) {
    window.currentModalSubmit();
  }
}

// Global function to create new project
window.createNewProject = function () {
  showModal(
    "Create New Project",
    [
      {
        id: "projectName",
        label: "Project Name",
        placeholder: "Enter project name",
      },
      {
        id: "projectDescription",
        label: "Description",
        type: "textarea",
        placeholder: "Enter project description",
      },
    ],
    async () => {
      const name = document.getElementById("projectName").value.trim();
      const description = document
        .getElementById("projectDescription")
        .value.trim();

      if (name) {
        try {
          const newProject = await apiCall("/projects", "POST", {
            name,
            description,
          });
          projects.push({
            id: newProject._id,
            name: newProject.name,
            description: newProject.description,
            status: newProject.status,
            createdAt: new Date(newProject.createdAt).toLocaleDateString(),
          });
          closeModal();
          loadPage("projects");
        } catch (error) {
          alert("Failed to create project: " + error.message);
        }
      }
    }
  );
};

// Global function to create new task
window.createNewTask = function () {
  // Build project options
  const projectOptions =
    projects.length > 0
      ? projects
          .map((p) => `<option value="${p.id}">${p.name}</option>`)
          .join("")
      : '<option value="">No projects available</option>';

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <h2>Create New Task</h2>
      </div>
      <div class="modal-body">
        <label class="block text-gray-700 font-semibold mb-2 text-sm">Task Name</label>
        <input type="text" id="taskName" class="modal-input" placeholder="Enter task name">
        
        <label class="block text-gray-700 font-semibold mb-2 text-sm">Description</label>
        <textarea id="taskDescription" class="modal-textarea" placeholder="Enter task description"></textarea>
        
        <label class="block text-gray-700 font-semibold mb-2 text-sm">Assign to Project</label>
        <select id="taskProject" class="modal-input">
          <option value="">No Project</option>
          ${projectOptions}
        </select>
      </div>
      <div class="modal-footer">
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="submitTaskModal()">Create Task</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById("taskName").focus(), 100);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  const escapeHandler = (e) => {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);
};

window.submitTaskModal = async function () {
  const name = document.getElementById("taskName").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const projectId = document.getElementById("taskProject").value;

  if (name) {
    try {
      const newTask = await apiCall("/tasks", "POST", {
        title: name,
        description,
        projectId: projectId || null,
      });
      tasks.push({
        id: newTask._id,
        name: newTask.title,
        description: newTask.description,
        projectId: newTask.project || null,
        status: newTask.status,
        createdAt: new Date(newTask.createdAt).toLocaleDateString(),
      });
      closeModal();
      loadPage("tasks");
    } catch (error) {
      alert("Failed to create task: " + error.message);
    }
  }
};

// Mark task as completed
window.completeTask = async function (taskId) {
  try {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      await apiCall(`/tasks/${taskId}`, "PUT", {
        title: task.name,
        description: task.description,
        status: "completed",
        projectId: task.projectId,
      });
      task.status = "completed";
      task.completedAt = new Date().toLocaleDateString();
      loadPage("tasks");
    }
  } catch (error) {
    alert("Failed to complete task: " + error.message);
  }
};

// Mark task as pending
window.pendingTask = async function (taskId) {
  try {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      await apiCall(`/tasks/${taskId}`, "PUT", {
        title: task.name,
        description: task.description,
        status: "pending",
        projectId: task.projectId,
      });
      task.status = "pending";
      delete task.completedAt;
      loadPage("tasks");
    }
  } catch (error) {
    alert("Failed to update task: " + error.message);
  }
};

// Delete task
window.deleteTask = async function (taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    try {
      await apiCall(`/tasks/${taskId}`, "DELETE");
      tasks = tasks.filter((t) => t.id !== taskId);
      loadPage("tasks");
    } catch (error) {
      alert("Failed to delete task: " + error.message);
    }
  }
};

// Global function to handle file upload
window.handleFileUpload = function (event) {
  const files = event.target.files;
  if (files.length > 0) {
    const fileNames = Array.from(files)
      .map((f) => f.name)
      .join(", ");
    alert(
      `Files selected: ${fileNames}\n\nNote: This is a demo. File upload functionality coming soon.`
    );
  }
};

// View project details
window.viewProjectDetails = function (projectId) {
  const project = projects.find((p) => p.id == projectId);
  if (!project) return;

  const projectTasks = tasks.filter((t) => t.projectId == projectId);
  const pendingTasks = projectTasks.filter(
    (t) => t.status === "pending"
  ).length;
  const completedTasks = projectTasks.filter(
    (t) => t.status === "completed"
  ).length;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-container" style="max-width: 600px;">
      <div class="modal-header">
        <h2><i class="fas fa-project-diagram mr-2"></i>${project.name}</h2>
      </div>
      <div class="modal-body">
        <div class="mb-4">
          <label class="block text-gray-600 text-sm font-semibold mb-1">Status</label>
          <span class="status-${
            project.status
          } px-3 py-1 rounded-full text-sm font-semibold inline-block">${
    project.status
  }</span>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-600 text-sm font-semibold mb-1">Description</label>
          <p class="text-gray-700">${
            project.description || "No description provided"
          }</p>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-600 text-sm font-semibold mb-1">Created Date</label>
          <p class="text-gray-700"><i class="fas fa-calendar mr-2"></i>${
            project.createdAt
          }</p>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-600 text-sm font-semibold mb-2">Tasks Overview</label>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div class="text-orange-600 text-2xl font-bold">${pendingTasks}</div>
              <div class="text-orange-700 text-sm">Pending Tasks</div>
            </div>
            <div class="bg-green-50 border border-green-200 rounded-lg p-3">
              <div class="text-green-600 text-2xl font-bold">${completedTasks}</div>
              <div class="text-green-700 text-sm">Completed Tasks</div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Close</button>
        <button class="modal-btn modal-btn-primary" onclick="closeModal(); editProject(${
          project.id
        })">
          <i class="fas fa-edit mr-2"></i>Edit Project
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  const escapeHandler = (e) => {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);
};

// Edit project
window.editProject = function (projectId) {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <h2>Edit Project</h2>
      </div>
      <div class="modal-body">
        <label class="block text-gray-700 font-semibold mb-2 text-sm">Project Name</label>
        <input type="text" id="editProjectName" class="modal-input" value="${
          project.name
        }">
        
        <label class="block text-gray-700 font-semibold mb-2 text-sm">Description</label>
        <textarea id="editProjectDescription" class="modal-textarea">${
          project.description || ""
        }</textarea>
        
        <label class="block text-gray-700 font-semibold mb-2 text-sm">Status</label>
        <select id="editProjectStatus" class="modal-input">
          <option value="planning" ${
            project.status === "planning" ? "selected" : ""
          }>Planning</option>
          <option value="active" ${
            project.status === "active" ? "selected" : ""
          }>Active</option>
          <option value="completed" ${
            project.status === "completed" ? "selected" : ""
          }>Completed</option>
          <option value="on-hold" ${
            project.status === "on-hold" ? "selected" : ""
          }>On Hold</option>
        </select>
      </div>
      <div class="modal-footer">
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="saveProjectEdit(${
          project.id
        })">Save Changes</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById("editProjectName").focus(), 100);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  const escapeHandler = (e) => {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);
};

window.saveProjectEdit = async function (projectId) {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return;

  const name = document.getElementById("editProjectName").value.trim();
  const description = document
    .getElementById("editProjectDescription")
    .value.trim();
  const status = document.getElementById("editProjectStatus").value;

  if (name) {
    try {
      await apiCall(`/projects/${projectId}`, "PUT", {
        name,
        description,
        status,
      });
      project.name = name;
      project.description = description;
      project.status = status;
      closeModal();
      loadPage("projects");
    } catch (error) {
      alert("Failed to update project: " + error.message);
    }
  }
};

// Delete project
window.deleteProject = async function (projectId) {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return;

  const projectTasks = tasks.filter((t) => t.projectId == projectId);
  const confirmMsg =
    projectTasks.length > 0
      ? `Are you sure you want to delete "${project.name}"?\n\nThis project has ${projectTasks.length} task(s) associated with it. The tasks will not be deleted but will become unassigned.`
      : `Are you sure you want to delete "${project.name}"?`;

  if (confirm(confirmMsg)) {
    try {
      await apiCall(`/projects/${projectId}`, "DELETE");
      // Remove project from local array
      projects = projects.filter((p) => p.id !== projectId);
      // Unassign tasks from this project locally
      tasks.forEach((task) => {
        if (task.projectId == projectId) {
          task.projectId = null;
        }
      });
      loadPage("projects");
    } catch (error) {
      alert("Failed to delete project: " + error.message);
    }
  }
};
