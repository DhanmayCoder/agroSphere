
    
    
document.addEventListener('DOMContentLoaded', function() {
    
    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { // A bit more scroll before it triggers
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- MODIFIED Scroll-in Animations using IntersectionObserver ---
    // This new logic makes animations re-trigger every time you scroll.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // When element enters the screen, add 'visible' to trigger animation
                entry.target.classList.add('visible');
            } else {
                // When element leaves the screen, remove 'visible' to reset it
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.1 // Animation starts when 10% of the element is visible
    });

    const elementsToAnimate = document.querySelectorAll('.scroll-animate');
    elementsToAnimate.forEach(el => observer.observe(el));
    //sidebar logic
    const logoBtn = document.getElementById('logo-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const body = document.body;

    const toggleSidebar = () => {
        sidebar.classList.toggle('sidebar-open');
        sidebarOverlay.classList.toggle('visible');
        body.classList.toggle('sidebar-active');
    };
    
    // Ensure all sidebar elements exist before adding listeners
    if (logoBtn && sidebar && sidebarOverlay && sidebarCloseBtn) {
        logoBtn.addEventListener('click', (event) => {
            event.preventDefault();
            toggleSidebar();
        });
        sidebarOverlay.addEventListener('click', toggleSidebar);
        sidebarCloseBtn.addEventListener('click', toggleSidebar);
    }




    // --- Authentication Form Logic (for login.html and register.html) ---
    const form = document.querySelector('.auth-form');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const formId = form.id;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const messageEl = document.getElementById('form-message');
            
            // Clear previous messages
            messageEl.textContent = '';
            messageEl.className = 'p-3 rounded-md text-sm mb-4 hidden';

            if (formId === 'register-form') {
                // --- Registration Logic ---
                if (data.password !== data['confirm-password']) {
                    showMessage('Passwords do not match.', 'error');
                    return;
                }
                
                // Simulate checking if user exists
                if (localStorage.getItem(data.email)) {
                    showMessage('An account with this email already exists.', 'error');
                } else {
                    // Store user data (Note: storing passwords in localStorage is insecure)
                    const userData = { password: data.password, name: data.name };
                    localStorage.setItem(data.email, JSON.stringify(userData));
                    showMessage('Registration successful! You can now log in.', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                }
            } else if (formId === 'login-form') {
                // --- Login Logic ---
                const storedUserData = localStorage.getItem(data.email);

                if (storedUserData) {
                    const userData = JSON.parse(storedUserData);
                    if (userData.password === data.password) {
                        showMessage(`Welcome back, ${userData.name}! Redirecting...`, 'success');
                        // In a real app, you'd create a session token here
                        setTimeout(() => {
                            window.location.href = 'index.html'; // Redirect to homepage
                        }, 2000);
                    } else {
                        showMessage('Incorrect password. Please try again.', 'error');
                    }
                } else {
                    showMessage('No account found with that email address.', 'error');
                }
            }
        });

        function showMessage(message, type) {
            const messageEl = document.getElementById('form-message');
            messageEl.textContent = message;
            messageEl.classList.remove('hidden', 'success', 'error');
            messageEl.classList.add(type);
        }
    }
});

//chatbot logic 

document.addEventListener('DOMContentLoaded', function() {
    // --- CHATBOT LOGIC ---
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const closeChat = document.getElementById('close-chat');
    const chatLog = document.getElementById('chat-log');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const typingIndicator = document.getElementById('typing-indicator');

    // --- Toggle Chat Window ---
    const toggleChatWindow = () => {
        chatWindow.classList.toggle('open');
        if (chatWindow.classList.contains('open')) {
            userInput.focus();
        }
    };

    chatBubble.addEventListener('click', toggleChatWindow);
    closeChat.addEventListener('click', toggleChatWindow);

    // --- Add a message to the chat log ---
    const addMessage = (sender, text) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        // Basic markdown for bolding
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        messageElement.innerHTML = text;
        chatLog.appendChild(messageElement);
        // Scroll to the latest message
        chatLog.scrollTop = chatLog.scrollHeight;
    };

    // --- Handle form submission ---
    chatForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const userText = userInput.value.trim();
        
        if (userText) {
            addMessage('user', userText);
            userInput.value = '';
            
            // Get a real AI response
            getAIResponse(userText);
        }
    });

    // --- Get AI Response from the Generative AI Model ---
    const getAIResponse = async (userText) => {
        typingIndicator.classList.remove('hidden');
        chatLog.scrollTop = chatLog.scrollHeight;

        const apiKey = "AIzaSyAICgNvyUUe4ikL5GG3P_2D9LFvY7m0oSg"; // API key will be automatically provided in the environment.
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        // This is a detailed instruction for the AI on how to behave.
        const systemPrompt = `You are the "AgroSphere AI Assistant," a friendly and professional agronomist. Your goal is to provide helpful, accurate, and encouraging advice to farmers and gardeners.

        **Your Persona:**
        - **Expert:** You have deep knowledge of agriculture, specializing in crops like bananas and muskmelons.
        - **Friendly & Encouraging:** Your tone should be positive and supportive.
        - **Professional:** Provide clear, well-structured answers. Use professional language but avoid overly technical jargon unless necessary.
        - **Concise:** Keep your answers to a few sentences or a short paragraph. Use bullet points for lists.

        **Your Knowledge Base:**
        - You have expert-level knowledge based on professional guides for **Banana** and **Muskmelon** cultivation. You should be able to answer detailed questions about their growth cycles, soil requirements, fertigation schedules, and pest management.
        - For questions outside of bananas and muskmelons, you will use your general agricultural knowledge and the provided search tool to find the best possible answer.

        **Instructions:**
        - Greet the user warmly if they say hello.
        - If you are asked a question you can answer from your core knowledge (banana/muskmelon), provide a direct and confident answer.
        - If you are asked about any other crop or a topic outside your core knowledge, use the search tool to find the information and then provide a helpful summary.
        - Always keep the user's success as your top priority.`;
        
        const payload = {
            contents: [{ parts: [{ text: userText }] }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            tools: [{ "google_search": {} }] // Enable Google Search for broader knowledge
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const result = await response.json();
            
            let botText = "Sorry, I couldn't process that. Could you try asking in a different way?";
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content?.parts?.[0]?.text) {
                botText = result.candidates[0].content.parts[0].text;
            }
            
            addMessage('bot', botText);

        } catch (error) {
            console.error("AI Chatbot Error:", error);
            addMessage('bot', "I'm having a little trouble connecting right now. Please try again in a moment.");
        } finally {
            typingIndicator.classList.add('hidden');
        }
    };
    
    // Initial welcome message
    setTimeout(() => {
        addMessage('bot', 'Welcome to AgroSphere! I am your AI assistant. How can I help you with your farming needs today?');
    }, 1000);
});

    // --- Sidebar Dropdown Logic ---
document.addEventListener('DOMContentLoaded', function() {
    const dropdownToggles = document.querySelectorAll('.sidebar-dropdown-toggle');

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(event) {
            // Prevent the link from navigating to "#"
            event.preventDefault(); 
            
            // Find the parent ".sidebar-dropdown" container
            const dropdown = this.closest('.sidebar-dropdown');
            
            if (dropdown) {
                // Toggle the "open" class to trigger the CSS animations
                dropdown.classList.toggle('open');
            }
        });
    });
});


