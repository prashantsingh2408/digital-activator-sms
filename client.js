// Client-side JavaScript for interacting with AIML API
document.addEventListener('DOMContentLoaded', function() {
    // API configuration
    const baseURL = "https://api.aimlapi.com/v1";
    const apiKey = "95646f1f22f2431eb005d35030db346c"; 
    const systemPrompt = "You are a travel agent. Be descriptive and helpful";

    // Select chat containers
    const twilioChat = document.getElementById('twilio-chat');
    const userChat = document.getElementById('user-chat');
    
    // Select input elements and send buttons
    const twilioInput = document.getElementById('twilio-input');
    const userInput = document.getElementById('user-input');
    const twilioSendBtn = document.getElementById('twilio-send');
    const userSendBtn = document.getElementById('user-send');
    
    // Select control buttons
    const resetBtn = document.getElementById('reset-chat');
    const simulateBtn = document.getElementById('simulate-convo');

    console.log("Elements found:", {
        twilioChat: !!twilioChat,
        userChat: !!userChat,
        twilioInput: !!twilioInput,
        userInput: !!userInput,
        twilioSendBtn: !!twilioSendBtn,
        userSendBtn: !!userSendBtn
    });

    // Function to call the AI API
    async function callAPI(userInput) {
        try {
            console.log("Calling API with:", userInput);
            
            const payload = {
                model: "mistralai/Mistral-7B-Instruct-v0.2",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: userInput
                    }
                ],
                temperature: 0.7,
                max_tokens: 256
            };
            
            const response = await fetch(`${baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log("API response:", data);
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                return "Sorry, received an invalid response from the API.";
            }
            
            return data.choices[0].message.content;
        } catch (error) {
            console.error("API Error:", error);
            return "Sorry, there was an error processing your request: " + error.message;
        }
    }

    // Use the existing addMessage function from index.html
    function addMessage(chatElement, message, isSent = false) {
        console.log(`Adding message to ${isSent ? 'sent' : 'received'} in`, chatElement.id);
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isSent ? 'sent' : 'received');
        
        messageDiv.innerHTML = `
            ${message}
            <div class="message-time">${getCurrentTime()}</div>
        `;
        
        chatElement.appendChild(messageDiv);
        chatElement.scrollTop = chatElement.scrollHeight;
    }

    // Helper function to get current time
    function getCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        return `${hours}:${minutes} ${ampm}`;
    }

    // Handle Twilio side message sending
    async function sendTwilioMessage() {
        const message = twilioInput.value.trim();
        if (!message) return;
        
        console.log("Sending message from Twilio side:", message);
        
        // Add message to Twilio chat as sent
        addMessage(twilioChat, message, true);
        twilioInput.value = '';
        
        try {
            // Show loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('message', 'sent');
            loadingDiv.innerHTML = `
                Typing...
                <div class="message-time">${getCurrentTime()}</div>
            `;
            twilioChat.appendChild(loadingDiv);
            
            // Get AI response
            console.log("Waiting for API response...");
            const aiResponse = await callAPI(message);
            console.log("Received API response:", aiResponse.substring(0, 50) + "...");
            
            // Remove loading indicator
            twilioChat.removeChild(loadingDiv);
            
            // Add response to User chat as received
            addMessage(userChat, aiResponse, false);
            
            console.log("Response added to chat");
        } catch (error) {
            console.error("Error in sendTwilioMessage:", error);
            alert("Error: " + error.message);
        }
    }

    // Handle User side message sending
    function sendUserMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add message to User chat as sent
        addMessage(userChat, message, true);
        
        // Add message to Twilio chat as received (with delay)
        setTimeout(() => {
            addMessage(twilioChat, message, false);
        }, 500);
        
        userInput.value = '';
    }

    // Set up event listeners
    if (twilioSendBtn) {
        twilioSendBtn.addEventListener('click', function() {
            console.log("Twilio send button clicked");
            sendTwilioMessage();
        });
    }

    if (userSendBtn) {
        userSendBtn.addEventListener('click', function() {
            console.log("User send button clicked");
            sendUserMessage();
        });
    }

    // Handle Enter key in inputs
    if (twilioInput) {
        twilioInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendTwilioMessage();
            }
        });
    }

    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendUserMessage();
            }
        });
    }

    // Reset chat button
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            twilioChat.innerHTML = '';
            userChat.innerHTML = '';
        });
    }

    // Simulate conversation button
    if (simulateBtn) {
        simulateBtn.addEventListener('click', async function() {
            console.log("Simulating conversation");
            
            // Clear chats
            twilioChat.innerHTML = '';
            userChat.innerHTML = '';
            
            // Initial message from Twilio
            addMessage(twilioChat, "Hello! I'm your travel assistant. How can I help you today?", true);
            
            // Simulate user response
            setTimeout(() => {
                const userMsg = "I want to visit San Francisco next month";
                addMessage(userChat, userMsg, true);
                
                // Show message in Twilio side
                setTimeout(async () => {
                    addMessage(twilioChat, userMsg, false);
                    
                    // Get AI response
                    const aiResponse = await callAPI(userMsg);
                    
                    // Add AI response to both chats
                    addMessage(twilioChat, aiResponse, true);
                    addMessage(userChat, aiResponse, false);
                }, 1000);
            }, 1500);
        });
    }

    console.log("Chat interface initialized");
});
