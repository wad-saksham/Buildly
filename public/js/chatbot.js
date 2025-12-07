// Chatbot functionality
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendButton = document.getElementById("sendButton");

// Handle Enter key press
function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

// Send message to AI
async function sendMessage() {
  const message = chatInput.value.trim();

  if (!message) return;

  // Add user message to chat
  addMessage("user", message);
  chatInput.value = "";

  // Disable input while processing
  chatInput.disabled = true;
  sendButton.disabled = true;

  // Show typing indicator
  addTypingIndicator();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    // Remove typing indicator
    removeTypingIndicator();

    if (response.ok && data.reply) {
      addMessage("ai", data.reply);
    } else {
      addMessage("ai", "Sorry, I encountered an error. Please try again.");
    }
  } catch (error) {
    removeTypingIndicator();
    addMessage(
      "ai",
      "Connection error. Please check your internet and try again."
    );
  } finally {
    // Re-enable input
    chatInput.disabled = false;
    sendButton.disabled = false;
    chatInput.focus();
  }
}

// Add message to chat
function addMessage(sender, text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `flex ${
    sender === "user" ? "justify-end" : "justify-start"
  } mb-4`;

  if (sender === "user") {
    messageDiv.innerHTML = `
      <div class="message-user">
        <p class="text-sm leading-relaxed">${escapeHtml(text)}</p>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="message-ai">
        <div class="flex items-start space-x-3">
          <i class="fas fa-robot text-purple-600 mt-1 text-lg"></i>
          <div class="flex-1">
            <p class="text-sm leading-relaxed">${formatAIResponse(text)}</p>
          </div>
        </div>
      </div>
    `;
  }

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add typing indicator
function addTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.id = "typingIndicator";
  typingDiv.className = "flex justify-start mb-4";
  typingDiv.innerHTML = `
    <div class="message-ai">
      <div class="flex items-center space-x-3">
        <i class="fas fa-robot text-purple-600 text-lg"></i>
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    </div>
  `;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
  const typingIndicator = document.getElementById("typingIndicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Clear chat
function clearChat() {
  if (confirm("Are you sure you want to clear the chat?")) {
    chatMessages.innerHTML = `
      <div class="text-center py-12">
        <div class="welcome-icon">
          <i class="fas fa-robot text-white text-4xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Hello! I'm your AI Assistant</h2>
        <p class="text-gray-600">Ask me anything and I'll do my best to help you.</p>
      </div>
    `;
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Format AI response (preserve line breaks and basic formatting)
function formatAIResponse(text) {
  return escapeHtml(text)
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

// Focus input on load
window.addEventListener("DOMContentLoaded", () => {
  chatInput.focus();
});
