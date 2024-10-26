
document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const innerBox = document.querySelector('.inner-box');
  
    textInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevents form submission if inside a form
        innerBox.classList.add('expand');
      }
    });
  });
  

document.getElementById('symInput').addEventListener('keypress', async function(e) {
    if (e.key === 'Enter') {
        const symptoms = this.value;

        if (!symptoms) {
            alert("Please describe your symptoms!");
            return;
        }

        // Immediately expand the box and input
        const box = this.parentElement;
        box.classList.add('SymExpand');
        this.classList.add('expanded-input');
        
        // Store original input and show loading
        const originalText = this.value;
        this.value = "Analyzing symptoms...";
        this.disabled = true;

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
            
            // Display the response
            this.value = `${data.completion}`;
            
        } catch (error) {
            this.value = `Error: ${error.message}`;
            console.error("Error:", error);
        } finally {
            this.disabled = false;
        }
    }
});

// Auto-resize textarea as content changes
document.getElementById('symInput').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = `${this.scrollHeight}px`;
});