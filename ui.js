// UI handling functions
class ChatUI {
    constructor() {
        // Get UI elements
        this.userChat = document.getElementById('user-chat');
        this.userInput = document.getElementById('user-input');
        this.promptDisplay = document.getElementById('prompt-display');
        this.togglePromptBtn = document.getElementById('toggle-prompt');
        this.charCounter = document.getElementById('char-counter');
        
        // SMS character limit
        this.characterLimit = 160;
        
        // Pre-compile time format
        this.timeFormatter = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        // Set up prompt toggle
        this.setupPromptToggle();
        
        // Set up character counter
        this.setupCharacterCounter();
    }

    // Set up prompt toggle functionality
    setupPromptToggle() {
        if (this.togglePromptBtn && this.promptDisplay) {
            this.togglePromptBtn.addEventListener('click', () => {
                if (this.promptDisplay.style.display === 'none' || !this.promptDisplay.style.display) {
                    this.promptDisplay.style.display = 'block';
                    this.togglePromptBtn.textContent = 'Hide Prompt';
                } else {
                    this.promptDisplay.style.display = 'none';
                    this.togglePromptBtn.textContent = 'Show Prompt';
                }
            });
        }
    }
    
    // Set up character counter for SMS limit
    setupCharacterCounter() {
        if (this.userInput && this.charCounter) {
            this.userInput.addEventListener('input', () => {
                const remaining = this.characterLimit - this.userInput.value.length;
                this.charCounter.textContent = `${remaining} chars left`;
                
                if (remaining < 0) {
                    this.charCounter.classList.add('over-limit');
                } else {
                    this.charCounter.classList.remove('over-limit');
                }
            });
        }
    }

    // Display the current system prompt
    displayPrompt(prompt) {
        if (this.promptDisplay) {
            this.promptDisplay.textContent = prompt;
        }
    }

    // Add a message to the chat UI
    addMessage(chatElement, message, isSent = false) {
        if (!chatElement) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', isSent ? 'sent' : 'received');
        
        // Show SMS breaks for messages over 160 characters
        let messageHtml = '';
        if (message.length > this.characterLimit) {
            // Split message into SMS-sized chunks
            for (let i = 0; i < message.length; i += this.characterLimit) {
                const chunk = message.substring(i, i + this.characterLimit);
                if (i > 0) {
                    messageHtml += `<div class="sms-break">SMS ${Math.floor(i/this.characterLimit) + 1}</div>`;
                }
                messageHtml += chunk;
            }
        } else {
            messageHtml = message;
        }
        
        messageDiv.innerHTML = `
            ${messageHtml}
            <div class="message-time">${this.getCurrentTime()}</div>
        `;
        
        // Use requestAnimationFrame for smoother UI updates
        requestAnimationFrame(() => {
            chatElement.appendChild(messageDiv);
            this.scrollToBottom(chatElement);
        });
    }

    // Show loading indicator in the chat
    showLoading(chatElement) {
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'received', 'loading');
        loadingDiv.innerHTML = `
            Typing...
            <div class="message-time">${this.getCurrentTime()}</div>
        `;
        chatElement.appendChild(loadingDiv);
        this.scrollToBottom(chatElement);
        return loadingDiv;
    }

    // Scroll chat area to bottom
    scrollToBottom(element) {
        element.scrollTop = element.scrollHeight;
    }

    // Clear all messages from the chat
    clearChats() {
        if (this.userChat) {
            this.userChat.innerHTML = '';
        }
    }

    // Helper function to get current time
    getCurrentTime() {
        return this.timeFormatter.format(new Date());
    }
} 