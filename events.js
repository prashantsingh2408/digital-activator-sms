// Event handling functions
class ChatEvents {
    constructor(chatUI, apiService) {
        this.ui = chatUI;
        this.api = apiService;
        
        // Get UI elements
        this.userSendBtn = document.getElementById('user-send');
        this.resetBtn = document.getElementById('reset-chat');
        this.simulateBtn = document.getElementById('simulate-convo');
        this.toggleDebugBtn = document.getElementById('toggle-debug');
        
        // Track if message is being processed
        this.isProcessing = false;
    }

    // Set up all event listeners
    setupEventListeners() {
        this.setupSendButtons();
        this.setupKeyboardEvents();
        this.setupControlButtons();
        this.setupDebugToggle();
    }

    // Set up send button event listeners
    setupSendButtons() {
        if (this.userSendBtn) {
            this.userSendBtn.addEventListener('click', () => this.sendUserMessage());
        }
    }

    // Set up keyboard event listeners
    setupKeyboardEvents() {
        if (this.ui.userInput) {
            this.ui.userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.sendUserMessage();
                }
            });
        }
    }

    // Set up control button event listeners
    setupControlButtons() {
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.ui.clearChats());
        }

        if (this.simulateBtn) {
            this.simulateBtn.addEventListener('click', () => this.simulateConversation());
        }
    }

    // Set up debug toggle event listeners
    setupDebugToggle() {
        if (this.toggleDebugBtn) {
            this.toggleDebugBtn.addEventListener('click', () => {
                const isDebugEnabled = this.api.debugMode;
                this.api.toggleDebug(!isDebugEnabled);
                this.toggleDebugBtn.textContent = `Debug: ${!isDebugEnabled ? 'On' : 'Off'}`;
            });
        }
    }

    // Handle User side message sending
    async sendUserMessage() {
        // Prevent multiple simultaneous messages
        if (this.isProcessing) return;
        
        const message = this.ui.userInput.value.trim();
        if (!message) return;
        
        this.isProcessing = true;
        
        // Add message to User chat as sent
        this.ui.addMessage(this.ui.userChat, message, true);
        this.ui.userInput.value = '';
        
        try {
            // Show loading indicator
            const loadingDiv = this.ui.showLoading(this.ui.userChat);
            
            // Get AI response
            const aiResponse = await this.api.callAPI(message);
            
            // Remove loading indicator
            if (loadingDiv && loadingDiv.parentNode) {
                this.ui.userChat.removeChild(loadingDiv);
            }
            
            // Add response to user chat
            this.ui.addMessage(this.ui.userChat, aiResponse, false);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            this.isProcessing = false;
        }
    }

    // Simulate a conversation
    async simulateConversation() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        // Clear chats
        this.ui.clearChats();
        
        // Initial message from User
        this.ui.addMessage(this.ui.userChat, "Hello! I need help planning a trip.", true);
        
        // Loading indicator
        const loadingDiv = this.ui.showLoading(this.ui.userChat);
        
        try {
            // Get AI response
            const aiResponse = await this.api.callAPI("Hello! I need help planning a trip.");
            
            // Remove loading
            if (loadingDiv && loadingDiv.parentNode) {
                this.ui.userChat.removeChild(loadingDiv);
            }
            
            // Add AI response to user chat
            this.ui.addMessage(this.ui.userChat, aiResponse, false);
        } catch (error) {
            console.error("Error in simulation:", error);
        } finally {
            this.isProcessing = false;
        }
    }
} 