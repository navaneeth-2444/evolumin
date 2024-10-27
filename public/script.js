// Malayalam translations object
const translations = {
    'Hospice': 'ഹോസ്പിസ്',
    'What are you ailing from?': 'നിങ്ങൾക്ക് എന്ത് അസുഖമാണ്?',
    'Check Symptoms': 'പരിശോധിക്കുക',
    'Reset': 'പുനഃക്രമീകരിക്കുക',
    'Please describe your symptoms!': 'ദയവായി നിങ്ങളുടെ രോഗലക്ഷണങ്ങൾ വിവരിക്കുക!',
    'Analyzing symptoms...': 'രോഗലക്ഷണങ്ങൾ വിശകലനം ചെയ്യുന്നു...',
    'Translate to Malayalam': 'മലയാളത്തിലേക്ക് വിവർത്തനം ചെയ്യുക',
    'Switch to English': 'E',
    'Error': 'പിശക്',
    'Failed to analyze symptoms': 'രോഗലക്ഷണങ്ങൾ വിശകലനം ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു'
};

let isTranslated = false;

// Initialize all event listeners and UI elements
function initializeApp() {
    // Create and add translation button
    initializeTranslationButton();
    
    // Initialize text input expansion
    const textInput = document.getElementById('textInput');
    const innerBox = document.querySelector('.inner-box');
    
    if (textInput) {
        textInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                innerBox.classList.add('expand');
                setTimeout(() => {
                    textInput.classList.add('hidden');
                }, 50);
            }
        });
    }

    // Initialize symptoms button
    const checkSymptomsButton = document.getElementById("checkSymptomsButton");
    if (checkSymptomsButton) {
        checkSymptomsButton.addEventListener("click", expandAndAnalyze);
    }

    // Initialize input box auto-resize
    const inputBox = document.getElementById("inputBox");
    

    // Add click event for expanded input
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('expanded-input')) {
            event.target.focus();
        }
    });
}

function initializeTranslationButton() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const translateButton = document.createElement('button');
        translateButton.id = 'translateButton';
        translateButton.className = 'translate-btn';
        translateButton.textContent = 'മ';
        sidebar.appendChild(translateButton);
        translateButton.addEventListener('click', toggleTranslation);
    }
}

function toggleTranslation() {
    isTranslated = !isTranslated;
    const translateButton = document.getElementById('translateButton');
    
    if (isTranslated) {
        translateButton.textContent = translations['Switch to English'];
        translateToMalayalam();
    } else {
        translateButton.textContent = 'മ';
        translateToEnglish();
    }
}

function translateToMalayalam() {
    document.querySelectorAll('h1, button, input, textarea, .title, .SymTitle').forEach(element => {
        const originalText = element.textContent.trim();
        if (translations[originalText]) {
            if (!element.getAttribute('data-original')) {
                element.setAttribute('data-original', originalText);
            }
            element.textContent = translations[originalText];
        }
        if (translations[originalText] === 'ഹോസ്പിസ്') {
            element.classList.add('malayalam-text');
        }
    });
    
    const inputBox = document.getElementById('inputBox');
    if (inputBox) {
        if (!inputBox.getAttribute('data-original-placeholder')) {
            inputBox.setAttribute('data-original-placeholder', inputBox.placeholder);
        }
        inputBox.placeholder = translations[inputBox.getAttribute('data-original-placeholder')] || inputBox.placeholder;
    }
}

function translateToEnglish() {
    document.querySelectorAll('[data-original]').forEach(element => {
        element.textContent = element.getAttribute('data-original');
        element.classList.remove('malayalam-text');
    });
    
    const inputBox = document.getElementById('inputBox');
    if (inputBox && inputBox.getAttribute('data-original-placeholder')) {
        inputBox.placeholder = inputBox.getAttribute('data-original-placeholder');
    }
}

async function getAnswer() {
    const inputBox = document.getElementById("inputBox");
    const symptoms = inputBox.value;

    if (!symptoms) {
        const message = isTranslated ? 
            translations['Please describe your symptoms!'] : 
            'Please describe your symptoms!';
        alert(message);
        return;
    }

    inputBox.value = isTranslated ? 
        translations['Analyzing symptoms...'] : 
        'Analyzing symptoms...';
    inputBox.disabled = true;

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ question: symptoms })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || translations['Failed to analyze symptoms']);
        }

        const data = await response.json();
        inputBox.style.height = 'auto';
        inputBox.style.height = `${inputBox.scrollHeight}px`;
        inputBox.value = data.completion;
        
    } catch (error) {
        inputBox.value = `${isTranslated ? translations['Error'] : 'Error'}: ${error.message}`;
        console.error("Error:", error);
    } finally {
        inputBox.disabled = false;
    }
}

function expandAndAnalyze() {
    const inputBox = document.getElementById("inputBox");
    const symptoms = inputBox.value;

    if (!symptoms) {
        const message = isTranslated ? 
            translations['Please describe your symptoms!'] : 
            'Please describe your symptoms!';
        alert(message);
        return;
    }

    inputBox.classList.add('expanded');

    setTimeout(async () => {
        try {
            inputBox.value = isTranslated ? 
                translations['Analyzing symptoms...'] : 
                'Analyzing symptoms...';
            inputBox.disabled = true;

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ question: symptoms })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || translations['Failed to analyze symptoms']);
            }

            const data = await response.json();
            inputBox.value = data.completion;
            
        } catch (error) {
            inputBox.value = `${isTranslated ? translations['Error'] : 'Error'}: ${error.message}`;
            console.error("Error:", error);
        } finally {
            inputBox.disabled = false;
        }
    }, 500);
}

function collapseInputBox() {
    const inputBox = document.getElementById("inputBox");
    inputBox.classList.remove('expanded');
    inputBox.value = '';
    inputBox.disabled = false;
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeApp);