// Mobile menu toggle
function toggleMobileMenu() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("mobileMenuOverlay");

  if (sidebar && overlay) {
    if (sidebar.classList.contains("-translate-x-full")) {
      sidebar.classList.remove("-translate-x-full");
      sidebar.classList.add("translate-x-0");
      overlay.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    } else {
      sidebar.classList.add("-translate-x-full");
      sidebar.classList.remove("translate-x-0");
      overlay.classList.add("hidden");
      document.body.style.overflow = "";
    }
  }
}

// Logout function
function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

// Chat functionality
const messagesContainer = document.getElementById("messagesContainer");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const emptyState = document.getElementById("emptyState");

// Load chat history from localStorage
function loadChatHistory() {
  const history = localStorage.getItem("chatHistory");
  if (history) {
    const messages = JSON.parse(history);
    messages.forEach((msg) => {
      addMessage(msg.text, msg.isUser, false);
    });
    if (messages.length > 0) {
      emptyState.style.display = "none";
    }
  }
}

// Save chat history to localStorage
function saveChatHistory() {
  const messages = [];
  const messageElements = messagesContainer.querySelectorAll(".message");
  messageElements.forEach((element) => {
    messages.push({
      text: element.textContent,
      isUser: element.classList.contains("user-message"),
    });
  });
  localStorage.setItem("chatHistory", JSON.stringify(messages));
}

// Add message to chat
function addMessage(text, isUser = false, save = true) {
  // Hide empty state
  if (emptyState) {
    emptyState.style.display = "none";
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user-message" : "bot-message"}`;
  messageDiv.textContent = text;

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  if (save) {
    saveChatHistory();
  }
}

// Show typing indicator
function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot-message typing-indicator";
  typingDiv.id = "typingIndicator";

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("div");
    dot.className = "typing-dot";
    typingDiv.appendChild(dot);
  }

  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
  const typingIndicator = document.getElementById("typingIndicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Send message to backend
async function sendMessage(message) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to get response");
    }

    return data.reply;
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
}

// Handle form submission
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = messageInput.value.trim();
  if (!message) return;

  // Disable input and button
  messageInput.disabled = true;
  sendButton.disabled = true;

  // Add user message
  addMessage(message, true);
  messageInput.value = "";

  // Show typing indicator
  showTypingIndicator();

  try {
    // Get bot response
    const reply = await sendMessage(message);

    // Remove typing indicator
    removeTypingIndicator();

    // Add bot message
    addMessage(reply, false);
  } catch (error) {
    // Remove typing indicator
    removeTypingIndicator();

    // Show error message
    addMessage(
      "Sorry, I encountered an error. Please try again later.",
      false
    );
  } finally {
    // Re-enable input and button
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
  }
});

// Clear chat function
function clearChat() {
  if (confirm("Are you sure you want to clear the chat history?")) {
    messagesContainer.innerHTML = "";
    localStorage.removeItem("chatHistory");

    // Show empty state again
    const emptyStateHTML = `
      <div class="empty-state" id="emptyState">
        <i class="fas fa-comments"></i>
        <h3 class="text-xl font-semibold mb-2">Start a Conversation</h3>
        <p class="text-center max-w-md">
          Ask me anything! I'm here to help with your construction
          projects, answer questions, and provide assistance.
        </p>
      </div>
    `;
    messagesContainer.innerHTML = emptyStateHTML;
  }
}

// Check authentication
function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
  }
}

// Initialize
checkAuth();
loadChatHistory();
messageInput.focus();
