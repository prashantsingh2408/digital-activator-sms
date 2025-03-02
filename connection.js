// Function to check connection status
function checkConnection() {
    const connectionStatus = document.getElementById('connection-status');
    connectionStatus.style.display = 'block';
    connectionStatus.textContent = 'This is a local simulation only. Not connected to actual Twilio service.';
    connectionStatus.style.backgroundColor = '#f8d7da';
    
    setTimeout(() => {
        connectionStatus.style.display = 'none';
    }, 5000);
}

// Initialize the page
window.onload = function() {
    checkConnection();
}; 