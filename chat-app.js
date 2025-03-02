// Main chat application class
class ChatApp {
    constructor() {
        this.apiKey = "95646f1f22f2431eb005d35030db346c";
        this.instances = {};
    }
    
    init() {
        // Create services
        this.instances.ui = new ChatUI();
        this.instances.api = new ApiService(this.apiKey);
        this.instances.events = new ChatEvents(this.instances.ui, this.instances.api);
        
        // Set up event listeners
        this.instances.events.setupEventListeners();
        
        // Display current prompt
        this.instances.ui.displayPrompt(this.instances.api.systemPrompt);
        
        console.log("Chat app initialized");
        
        // Return instance references
        return this.instances;
    }
} 