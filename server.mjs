import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
const app = express();
const port = 3000;

// Initialize Gemini API
const genAI = new GoogleGenerativeAI('AIzaSyBDEA1iia2FldTyBEovX7IfNKbkqJhkLeM');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

app.use(express.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
    const symptoms = req.body.question;
    
    try {
        console.log('Received symptoms:', symptoms);
        
        // Structured prompt for consistent responses
        const prompt = `The user is suffering from: ${symptoms}. 
        Analyze these symptoms and provide:
        1. Possible condition(s)
        2. If minor: Brief first aid steps
        3. If serious: Clearly state to seek immediate medical attention
        
        Keep the response concise and direct. I don't want a heading. I want the small paragraph to start with the name
        of the most probable disease and then goes on to explain about it in a short paragraph.(for example, if it is a fever then :
        "Common Cold is the most common type of...")(do not make this part pointwise. I want the first part to be in a small paragraph or sentence)
        if minor, then pointwise give steps to remedy and make it concise. If major, then direct to a hospital. Make the response smaller and more compact and the first paragraph should just give important info and not this huge paragraph`;
        
        // Generate response from Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ completion: text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: "An error occurred", 
            details: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});