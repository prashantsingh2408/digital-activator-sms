// Main initialization file
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the chat application
    try {
        const app = new ChatApp();
        window.chatApp = app.init(); // Store instances in a global for debugging
        
        // Add debugging helpers to window object
        window.toggleAPIDebug = (enabled) => {
            window.chatApp.api.toggleDebug(enabled);
            return `API debugging ${enabled ? 'enabled' : 'disabled'}`;
        };
        
        window.clearAPICache = () => {
            window.chatApp.api.cache.clear();
            return 'API cache cleared';
        };
        
        console.log("Chat interface initialized");
        console.log("%cDebugging commands available:", "color: blue; font-weight: bold");
        console.log("%ctoggleAPIDebug(true/false)", "color: green");
        console.log("%cclearAPICache()", "color: green");
    } catch (error) {
        console.error("Error initializing chat application:", error);
    }
}); 