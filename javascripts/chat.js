// Chat-specific variables
const INACTIVITY_THRESHOLD = 10 * 60 * 1000; // 10 minutes in milliseconds
let lastMessageTime = localStorage.getItem('lastMessageTime') ? parseInt(localStorage.getItem('lastMessageTime')) : Date.now();
let isFirstMessageAfterClear = localStorage.getItem('isFirstMessageAfterClear') === 'true' || false;

// Function to display time with centered styling
function displayCurrentTime() {
    const chatBoxBody = document.getElementById('chatbox-body');
    if (!chatBoxBody) return; // Guard against missing element
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0'); // Ensure 2 digits
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const day = now.getDate().toString().padStart(2, '0');
    const year = now.getFullYear();
    const timeMessage = document.createElement('div');
    timeMessage.className = 'message time-message centered-time';
    timeMessage.textContent = `${month}/${day}/${year} ${hours}:${minutes}`;
    chatBoxBody.appendChild(timeMessage);
    chatBoxBody.scrollTop = chatBoxBody.scrollHeight;
    saveMessage(timeMessage.textContent, 'time');
}

// Function to save message to localStorage
function saveMessage(text, type) {
    let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    chatHistory.push({ text, type, timestamp: Date.now() });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// Function to load chat history from localStorage
function loadChatHistory() {
    const chatBoxBody = document.getElementById('chatbox-body');
    if (!chatBoxBody) return;
    let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const avatarUrl = storedUser.user_image || 'user.png';

    chatBoxBody.innerHTML = ''; // Clear existing content

    // Ensure only one welcome message exists
    const hasWelcomeMessage = chatHistory.some(message => message.type === 'welcome');
    if (!hasWelcomeMessage) {
        const welcomeText = "Welcome to AirWing's Chatbot! How can I assist you?";
        chatHistory = [{ text: welcomeText, type: 'welcome', timestamp: Date.now() }]; // Reset history with only welcome message
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    } else {
        // Filter out duplicate welcome messages
        chatHistory = chatHistory.filter((message, index, self) =>
            message.type !== 'welcome' || index === self.findIndex(m => m.type === 'welcome')
        );
    }

    chatHistory.forEach(message => {
        if (message.type === 'welcome') {
            const msgElement = document.createElement('p');
            msgElement.className = 'welcome-message';
            msgElement.textContent = message.text;
            chatBoxBody.appendChild(msgElement);
        } else if (message.type === 'time') {
            const timeElement = document.createElement('div');
            timeElement.className = 'message time-message centered-time';
            timeElement.textContent = message.text;
            chatBoxBody.appendChild(timeElement);
        } else if (message.type === 'user') {
            const userMessage = document.createElement('div');
            userMessage.className = 'message user-message';
            userMessage.innerHTML = `<p>${message.text}</p><div class="avatar-container"><img src="${avatarUrl}" alt="User" class="user-avatar" onerror="this.src='user.png'" /></div>`;
            chatBoxBody.appendChild(userMessage);
        } else if (message.type === 'ai') {
            const aiMessage = document.createElement('div');
            aiMessage.className = 'message ai-message';
            aiMessage.innerHTML = `<div class="avatar-container"><img src="inglogo.png" alt="AI Avatar" class="ai-avatar" /></div><p>${message.text}</p>`;
            chatBoxBody.appendChild(aiMessage);
        }
    });

    chatBoxBody.scrollTop = chatBoxBody.scrollHeight;
}

// Chat-specific CSS
const chatStyle = document.createElement('style');
chatStyle.textContent = `
    #chatButton {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white;
        border: none;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        font-size: 16px;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        transition: transform 0.3s ease, background 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    #chatButton:hover {
        transform: scale(1.1);
        background: linear-gradient(135deg, #0056b3, #003d80);
    }
    #chatbox {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        height: 400px;
        background: #fff;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
    }
    #chatbox-body {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
        overflow-x: hidden; /* Prevent horizontal scrolling */
    }
    #user-input {
        width: 100%;
        padding: 10px;
        border: none;
        border-top: 1px solid #ddd;
        outline: none;
        font-size: 14px;
    }
    .message {
        display: flex;
        align-items: center;
        margin: 10px 0;
    }
    .user-message {
        justify-content: flex-end;
    }
    .ai-message {
        justify-content: flex-start;
    }
    .time-message {
        justify-content: center;
        margin-bottom: -10px;
    }
    .message p {
        max-width: 70%;
        padding: 8px 12px;
        margin: 0;
        border-radius: 10px;
        background: #f1f1f1;
    }
    .user-message p {
        background: #007bff;
        color: white;
    }
    .time-message {
        width: 100%;
        text-align: center;
    }
    .centered-time {
        color: #666;
        font-size: 12px;
        padding: 2px 8px; /* Reduce padding to minimize space */
        display: inline-block;
    }
    .avatar-container {
        margin: 0 8px;
    }
    .user-avatar, .ai-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
    }
    .typing-animation {
        color: #666;
        font-style: italic;
        padding: 8px 12px;
    }
    .dot1, .dot2, .dot3 {
        animation: blink 1.4s infinite both;
    }
    .dot2 { animation-delay: 0.2s; }
    .dot3 { animation-delay: 0.4s; }
    @keyframes blink {
        0% { opacity: 0.2; }
        20% { opacity: 1; }
        100% { opacity: 0.2; }
    }
    .welcome-message {
        margin-top: 20px;
        text-align: center;
        font-family: 'Arial', sans-serif;
        font-size: 16px;
        font-weight: bold;
        color: #333;
    }
`;
document.head.appendChild(chatStyle);

// Chatbox controls
function openChatbox() {
    const chatbox = document.getElementById('chatbox');
    const chatButton = document.getElementById('chatButton');
    if (chatbox && chatButton) {
        chatbox.style.display = 'flex';
        chatButton.style.display = 'none';
        loadChatHistory();
        setTimeout(() => focusInput(), 100);
    }
}

function closeChatbox() {
    const chatbox = document.getElementById('chatbox');
    const chatButton = document.getElementById('chatButton');
    if (chatbox && chatButton) {
        chatbox.style.display = 'none';
        chatButton.style.display = 'flex';
    }
}

document.addEventListener('click', (event) => {
    const chatbox = document.getElementById('chatbox');
    const chatButton = document.getElementById('chatButton');
    if (chatbox && chatButton && chatbox.style.display !== 'none' && !chatbox.contains(event.target) && !chatButton.contains(event.target)) {
        closeChatbox();
    }
});

function focusInput() {
    const input = document.getElementById("user-input");
    if (input) input.focus();
}

// AI Response Logic
function getAIResponse(userInput) {
    const responses = [
        { keywords: ["name"], response: "Ojan ho mero name" },
        { keywords: ["kaam", "work"], response: "nachaine guff hanne ho mero kaam" },
        { keywords: ["hello", "hi"], response: "Hello! How can I help you today?" },
        { keywords: ["how are you"], response: "I'm doing great! How about you?" },
        { keywords: ["best places to visit", "best place", "best places"], response: "Some of the best places to visit include Paris, Tokyo, New York, and Bali." },
        { keywords: ["best time to visit", "best time"], response: "Some best times to visit include spring and summer months, and autumn and winter months." },
        { keywords: ["best weather"], response: "Some best weather conditions include sunny, warm, and humid days, while rainy, cold, and cloudy days are not as good." },
        { keywords: ["best travel dates"], response: "Some best travel dates include June, July, August, and September." },
        { keywords: ["cheap flight", "cheap flights"], response: "You can check websites like Skyscanner or Google Flights for cheap flight deals." },
        { keywords: ["beach vacations"], response: "Popular beach destinations include the Maldives, Hawaii, and the Caribbean islands." },
        { keywords: ["top tourist attractions"], response: "Some top tourist attractions are the Eiffel Tower, Great Wall of China, and the Grand Canyon." },
        { keywords: ["adventure trips"], response: "For adventure trips, you can explore places like New Zealand, Costa Rica, and the Swiss Alps." },
        { keywords: ["food destinations"], response: "If you're into food, try places like Italy, Thailand, and Japan for a culinary experience." },
        { keywords: ["thanks", "thank you"], response: "Thanks for getting this information please visit the official website." },
        { keywords: ["bye", "goodbye"], response: "Goodbye! Have a great day!" }
    ];

    const lowerCaseInput = userInput.toLowerCase();
    if (lowerCaseInput.includes("what's the time") || lowerCaseInput.includes("time")) {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        return `The current time is ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    }
    if (lowerCaseInput.includes("what's the date") || lowerCaseInput.includes("date")) {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const year = now.getFullYear();
        return `Today is ${month}/${day}/${year}`;
    }

    for (let responseObj of responses) {
        if (responseObj.keywords.some(keyword => lowerCaseInput.includes(keyword))) {
            return responseObj.response;
        }
    }
    return "I'm not sure about that. Could you rephrase your question?";
}

function showTypingAnimation(chatBoxBody) {
    const typingMessage = document.createElement('p');
    typingMessage.className = 'typing-animation';
    typingMessage.innerHTML = 'AirWing is typing<span class="dot1">.</span><span class="dot2">.</span><span class="dot3">.</span>';
    chatBoxBody.appendChild(typingMessage);
    chatBoxBody.scrollTop = chatBoxBody.scrollHeight;
    return typingMessage;
}

function removeTypingAnimation(typingMessage) {
    if (typingMessage && typingMessage.parentNode) {
        typingMessage.parentNode.removeChild(typingMessage);
    }
}

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const chatBoxBody = document.getElementById('chatbox-body');
    if (!userInput || !chatBoxBody || userInput.value.trim() === "") return; // Exit if input is empty

    const currentTime = Date.now();
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const avatarUrl = storedUser.user_image || 'user.png';

    // Show time above the user message if chat was cleared (regardless of inactivity duration)
    if (isFirstMessageAfterClear) {
        displayCurrentTime();
        isFirstMessageAfterClear = false;
        localStorage.setItem('isFirstMessageAfterClear', 'false');
    } else if (currentTime - lastMessageTime >= INACTIVITY_THRESHOLD) {
        // Also show time if inactivity is more than 10 minutes
        displayCurrentTime();
    }

    const userMessage = document.createElement('div');
    userMessage.className = 'message user-message';
    const capitalizedInput = userInput.value.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    userMessage.innerHTML = `<p>${capitalizedInput}</p><div class="avatar-container"><img src="${avatarUrl}" alt="User" class="user-avatar" onerror="this.src='user.png'" /></div>`;
    chatBoxBody.appendChild(userMessage);
    saveMessage(capitalizedInput, 'user');

    lastMessageTime = currentTime;
    localStorage.setItem('lastMessageTime', lastMessageTime.toString());

    const typingMessage = showTypingAnimation(chatBoxBody);
    setTimeout(() => {
        removeTypingAnimation(typingMessage);
        const aiMessage = document.createElement('div');
        aiMessage.className = 'message ai-message';
        const aiResponse = getAIResponse(capitalizedInput);
        aiMessage.innerHTML = `<div class="avatar-container"><img src="inglogo.png" alt="AI Avatar" class="ai-avatar" /></div><p>${aiResponse}</p>`;
        chatBoxBody.appendChild(aiMessage);
        saveMessage(aiResponse, 'ai');
        chatBoxBody.scrollTop = chatBoxBody.scrollHeight;
    }, 800);

    userInput.value = '';
}

function checkEnter(event) {
    if (event.key === "Enter") sendMessage();
}

// Event listeners for chat
document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    if (userInput) userInput.addEventListener('keypress', checkEnter);

    const chatButton = document.getElementById('chatButton');
    if (chatButton) chatButton.addEventListener('click', openChatbox);

    const sendButton = document.querySelector('#chatbox .send-btn');
    if (sendButton) sendButton.addEventListener('click', sendMessage);
});