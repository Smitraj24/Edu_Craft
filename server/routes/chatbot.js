const express = require('express');
const Groq = require('groq-sdk');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Initialize Groq AI
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || ''
});

// System prompt for educational context
const SYSTEM_PROMPT = `You are EduBot, an intelligent educational assistant for EduCraft Learning Management System. Your role is to:

1. Help students understand course concepts and topics
2. Answer questions about learning materials
3. Provide explanations in a clear, educational manner
4. Encourage critical thinking and learning
5. Be patient, supportive, and encouraging
6. Suggest study strategies and learning tips
7. Help with homework and assignments (guide, don't solve directly)
8. Explain complex topics in simple terms

Guidelines:
- Keep responses concise but informative (2-3 paragraphs max)
- Use examples to illustrate concepts
- Ask follow-up questions to ensure understanding
- Be encouraging and positive
- If you don't know something, admit it and suggest resources
- Never provide complete assignment solutions, guide students instead
- Focus on educational value

Remember: You're here to facilitate learning, not just provide answers.`;

// @route   POST /api/chatbot/ask
// @desc    Send a question to the AI chatbot
// @access  Protected (Students only)
router.post('/ask', protect, async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Check if API key is configured
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ 
                message: 'AI service not configured. Please contact administrator.',
                error: 'GROQ_API_KEY not set'
            });
        }

        // Build messages array for Groq
        const messages = [
            {
                role: 'system',
                content: SYSTEM_PROMPT
            }
        ];

        // Add conversation history
        if (conversationHistory && conversationHistory.length > 0) {
            const recentHistory = conversationHistory.slice(-5);
            recentHistory.forEach(msg => {
                messages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                });
            });
        }

        // Add current message
        messages.push({
            role: 'user',
            content: message
        });

        console.log('🤖 Chatbot request from user:', req.user.email);
        console.log('📝 Message:', message);

        // Generate response using Groq
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.3-70b-versatile', // Fast and powerful model
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 0.95,
            stream: false
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

        console.log('✅ Response generated successfully');

        res.json({
            success: true,
            response: aiResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Chatbot Error:', error.message);
        console.error('Full error:', error);
        
        // Handle specific API errors
        if (error.message?.includes('API key') || error.message?.includes('401')) {
            return res.status(500).json({ 
                message: 'AI service configuration error. Please contact administrator.',
                error: 'Invalid API key'
            });
        }

        if (error.message?.includes('quota') || error.message?.includes('429')) {
            return res.status(429).json({ 
                message: 'AI service temporarily busy. Please try again in a moment.',
                error: 'Rate limit exceeded'
            });
        }

        res.status(500).json({ 
            message: 'Failed to get AI response. Please try again.',
            error: error.message 
        });
    }
});

// @route   POST /api/chatbot/course-help
// @desc    Get help specific to a course
// @access  Protected
router.post('/course-help', protect, async (req, res) => {
    try {
        const { message, courseTitle, courseDescription } = req.body;

        if (!message || !courseTitle) {
            return res.status(400).json({ message: 'Message and course title are required' });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ 
                message: 'AI service not configured',
                error: 'GROQ_API_KEY not set'
            });
        }

        const courseContext = `${SYSTEM_PROMPT}

Current Course Context:
Course: ${courseTitle}
${courseDescription ? `Description: ${courseDescription}` : ''}

Provide a helpful response specific to this course context.`;

        console.log('🤖 Course-specific help request');
        console.log('📚 Course:', courseTitle);
        console.log('📝 Question:', message);

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: courseContext
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 0.95,
            stream: false
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

        console.log('✅ Course help response generated');

        res.json({
            success: true,
            response: aiResponse,
            courseTitle,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Course Help Error:', error.message);
        res.status(500).json({ 
            message: 'Failed to get course-specific help',
            error: error.message 
        });
    }
});

// @route   GET /api/chatbot/suggestions
// @desc    Get suggested questions for students
// @access  Protected
router.get('/suggestions', protect, (req, res) => {
    const suggestions = [
        "Can you explain this concept in simpler terms?",
        "What are some practical examples of this topic?",
        "How can I improve my understanding of this subject?",
        "What study strategies would you recommend?",
        "Can you help me break down this complex topic?",
        "What are the key points I should focus on?",
        "How does this relate to real-world applications?",
        "Can you suggest some practice exercises?"
    ];

    res.json({
        success: true,
        suggestions: suggestions.sort(() => Math.random() - 0.5).slice(0, 4)
    });
});

module.exports = router;
