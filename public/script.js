
document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const innerBox = document.querySelector('.inner-box');
  
    textInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevents form submission if inside a form
        innerBox.classList.add('expand');
        setTimeout(() => {
            // Initialize your map here
            initializeMap();
        }, 500);
      }
    });
  });


  function initializeMap() {
    const canvas = document.getElementById('canvas');
    // Add your map initialization code here
}


  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('expanded-input')) {
        event.target.focus();
    }
});


  
  document.getElementById("checkSymptomsButton").addEventListener("click", expandAndAnalyze);


  async function getAnswer() {
    const inputBox = document.getElementById("inputBox");
    const symptoms = inputBox.value;

    if (!symptoms) {
        alert("Please describe your symptoms!");
        return;
    }

    // Show loading state in the input box
    const originalValue = inputBox.value;
    inputBox.value = "Analyzing symptoms...";
    inputBox.disabled = true; // Disable input while processing

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
            throw new Error(errorData.details || 'Failed to analyze symptoms');
        }

        const data = await response.json();
        
        // Make the input box larger to accommodate the response
        inputBox.style.height = 'auto'; // Reset height
        inputBox.style.height = `${inputBox.scrollHeight}px`; // Set to content height
        
        // Update the input box with the response
        inputBox.value = data.completion;
        
    } catch (error) {
        // If there's an error, show it in the input box
        inputBox.value = `Error: ${error.message}`;
        console.error("Error:", error);
    } finally {
        // Re-enable the input box
        inputBox.disabled = false;
    }
}

// Add this to make the textarea auto-resize as content changes
document.getElementById("inputBox").addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = `${this.scrollHeight}px`;
});

function expandAndAnalyze() {
    const inputBox = document.getElementById("inputBox");
    const symptoms = inputBox.value;

    if (!symptoms) {
        alert("Please describe your symptoms!");
        return;
    }

    // First expand the input box
    inputBox.classList.add('expanded');

    // Wait for expansion animation to complete before showing loading state
    setTimeout(async () => {
        try {
            // Show loading state
            const originalValue = inputBox.value;
            inputBox.value = "Analyzing symptoms...";
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
                throw new Error(errorData.details || 'Failed to analyze symptoms');
            }

            const data = await response.json();
            
            // Update the input box with the response
            inputBox.value = data.completion;
            
        } catch (error) {
            inputBox.value = `Error: ${error.message}`;
            console.error("Error:", error);
        } finally {
            inputBox.disabled = false;
        }
    }, 500); // Matches the transition duration in CSS
}

// Function to collapse the input box
function collapseInputBox() {
    const inputBox = document.getElementById("inputBox");
    inputBox.classList.remove('expanded');
    inputBox.value = '';
    inputBox.disabled = false;
}

// Auto-resize only when not expanded
document.getElementById("inputBox").addEventListener('input', function() {
    if (!this.classList.contains('expanded')) {
        this.style.height = 'auto';
        this.style.height = `${this.scrollHeight}px`;
    }
});