const chatBox = document.getElementById("chat-box");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const caseSelector = document.getElementById("case_id");
const historyList = document.getElementById("history-list");
const switchBtn = document.getElementById("switch-patient");
const voiceBtn = document.getElementById("voice-btn");

let chatHistory = {};

function addToHistory(caseId, speaker, text) {
  if (!chatHistory[caseId]) chatHistory[caseId] = [];
  chatHistory[caseId].push(`${speaker}: ${text}`);
  renderHistory(caseId);
}

function renderHistory(caseId) {
  historyList.innerHTML = '';
  (chatHistory[caseId] || []).forEach(line => {
    const li = document.createElement("li");
    li.textContent = line;
    historyList.appendChild(li);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  const caseId = caseSelector.value;

  if (!message) return;

  chatBox.innerHTML += `<div class="user"><strong>You:</strong> ${message}</div>`;
  addToHistory(caseId, "You", message);
  input.value = "";

  try {
    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, case_id: caseId }),
    });

    const data = await res.json();

    if (data.reply) {
      chatBox.innerHTML += `<div class="bot"><strong>${caseId}:</strong> ${data.reply}</div>`;
      addToHistory(caseId, caseId, data.reply);
      speakText(data.reply);
    } else {
      chatBox.innerHTML += `<div class="bot">⚠️ Error: ${data.error || "No response"}</div>`;
    }

    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    chatBox.innerHTML += `<div class="bot">⚠️ Server Error</div>`;
  }
});

switchBtn.addEventListener("click", () => {
  const caseId = caseSelector.value;
  chatBox.innerHTML = '';
  input.value = '';
  renderHistory(caseId);
});

// Voice input
voiceBtn.addEventListener("click", () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
  };

  recognition.onerror = (e) => {
    console.error("Speech recognition error", e);
  };

  recognition.start();
});

// Voice output
function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}
