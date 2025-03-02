// API handling functions
class ApiService {
    constructor(apiKey) {
        this.baseURL = "https://api.aimlapi.com/v1";
        this.apiKey = apiKey;
        this.systemPrompt = SYSTEM_PROMPTS.sms || SYSTEM_PROMPTS.travel;
        this.cache = new Map(); // Add response caching
        this.debugMode = true; // Enable debug mode by default
        this.maxResponseLength = 160; // SMS character limit
    }

    // Toggle debug mode
    toggleDebug(enabled) {
        this.debugMode = enabled;
        console.log(`API debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Log request and response data in a structured way
    logRequestResponse(requestData, responseData, timing) {
        if (!this.debugMode) return;
        
        console.group('API Communication');
        console.log('%cRequest:', 'color: blue; font-weight: bold');
        console.log(requestData);
        
        console.log('%cResponse:', 'color: green; font-weight: bold');
        console.log(responseData);
        
        console.log('%cTiming:', 'color: purple; font-weight: bold');
        console.log(`${timing}ms`);
        console.groupEnd();
    }

    async callAPI(userInput) {
        try {
            // Check if this is a numeric menu selection
            const menuSelection = this.processMenuSelection(userInput);
            if (menuSelection) {
                userInput = menuSelection;
            }
            
            // Check cache first
            const cacheKey = userInput.trim().toLowerCase();
            if (this.cache.has(cacheKey)) {
                if (this.debugMode) {
                    console.log("%cUsing cached response for:", "color: orange; font-weight: bold", userInput);
                }
                return this.cache.get(cacheKey);
            }
            
            console.log("Calling API with:", userInput);
            
            const payload = {
                model: "mistralai/Mistral-7B-Instruct-v0.2",
                messages: [
                    {
                        role: "system",
                        content: this.systemPrompt
                    },
                    {
                        role: "user",
                        content: userInput
                    }
                ],
                temperature: 0.7,
                max_tokens: 100, // Reduced to ensure SMS length limit
                max_length: this.maxResponseLength
            };
            
            const startTime = performance.now();
            
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const endTime = performance.now();
            
            this.logRequestResponse(payload, data, Math.round(endTime - startTime));
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                return "Sorry, received an invalid response from the API.";
            }
            
            let result = data.choices[0].message.content;
            
            // Ensure response is within SMS length limit
            if (result.length > this.maxResponseLength) {
                result = result.substring(0, this.maxResponseLength - 3) + "...";
            }
            
            // Cache the response
            this.cache.set(cacheKey, result);
            
            return result;
        } catch (error) {
            console.error("API Error:", error);
            return "Sorry, error processing request. Please try again.";
        }
    }
    
    // Process numeric menu selection
    processMenuSelection(input) {
        // If input is just a number between 1-6, convert to the corresponding request
        const menuOptions = {
            "1": "Show me the latest news headlines",
            "2": "What's the weather forecast today?",
            "3": "Give me latest stock market updates",
            "4": "Show me today's sports headlines",
            "5": "What's trending in entertainment?",
            "6": "What are the latest political developments?"
        };
        
        const trimmedInput = input.trim();
        if (menuOptions[trimmedInput]) {
            return menuOptions[trimmedInput];
        }
        
        return null;
    }
} 