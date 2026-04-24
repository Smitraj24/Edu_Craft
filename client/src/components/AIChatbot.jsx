import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, BookOpen, Lightbulb } from 'lucide-react';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';

const AIChatbot = ({ courseTitle, courseDescription }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '👋 Hi! I\'m EduBot, your AI learning assistant. Ask me anything about your courses, concepts, or study strategies!',
            timestamp: new Date().toISOString()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load suggestions when chatbot opens
    useEffect(() => {
        if (isOpen && suggestions.length === 0) {
            loadSuggestions();
        }
    }, [isOpen]);

    // Focus input when chatbot opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const loadSuggestions = async () => {
        try {
            const { data } = await api.get('/api/chatbot/suggestions');
            setSuggestions(data.suggestions);
        } catch (error) {
            console.error('Failed to load suggestions:', error);
        }
    };

    const handleSendMessage = async (messageText = inputMessage) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: messageText.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Prepare conversation history (last 10 messages)
            const conversationHistory = messages.slice(-10).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Choose endpoint based on context
            const endpoint = courseTitle ? '/api/chatbot/course-help' : '/api/chatbot/ask';
            const payload = courseTitle 
                ? { message: messageText.trim(), courseTitle, courseDescription }
                : { message: messageText.trim(), conversationHistory };

            const { data } = await api.post(endpoint, payload);

            const assistantMessage = {
                role: 'assistant',
                content: data.response,
                timestamp: data.timestamp
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chatbot error:', error);
            const errorMessage = error.response?.data?.message || 'Sorry, I encountered an error. Please try again.';
            
            toast.error(errorMessage);
            
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `❌ ${errorMessage}`,
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        handleSendMessage(suggestion);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-primary to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
                    aria-label="Open AI Chatbot"
                >
                    <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-purple-600 p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">EduBot</h3>
                                <p className="text-xs text-white/80">AI Learning Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors"
                            aria-label="Close chatbot"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Course Context Badge */}
                    {courseTitle && (
                        <div className="px-4 py-2 bg-primary/10 border-b border-slate-700 flex items-center gap-2">
                            <BookOpen size={16} className="text-primary" />
                            <span className="text-xs text-slate-300 truncate">Context: {courseTitle}</span>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f172a]">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                        message.role === 'user'
                                            ? 'bg-primary text-white rounded-br-sm'
                                            : 'bg-slate-700 text-slate-100 rounded-bl-sm'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                    <span className="text-xs opacity-60 mt-1 block">
                                        {new Date(message.timestamp).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-primary" />
                                    <span className="text-sm text-slate-300">EduBot is thinking...</span>
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {messages.length === 1 && suggestions.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-400 text-xs">
                                    <Lightbulb size={14} />
                                    <span>Try asking:</span>
                                </div>
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full text-left text-sm bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg px-3 py-2 transition-colors border border-slate-600/50"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-700 bg-[#1e293b]">
                        <div className="flex gap-2">
                            <textarea
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything..."
                                className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm"
                                rows="2"
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!inputMessage.trim() || isLoading}
                                className="bg-primary hover:bg-primary-hover disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl px-4 transition-all flex items-center justify-center"
                                aria-label="Send message"
                            >
                                {isLoading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            Press Enter to send • Shift+Enter for new line
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatbot;
