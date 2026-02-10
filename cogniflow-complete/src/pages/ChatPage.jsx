import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chat';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import './ChatPage.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your CogniFlow assistant. I can help you understand your schedule, explain why tasks are scheduled when they are, adjust your load, or answer questions about your productivity patterns. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      setLoading(true);
      const response = await chatService.sendMessage(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
    } catch (error) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble connecting right now. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "Why is this task scheduled here?",
    "Am I overloaded this week?",
    "What's my best work time?",
    "Adjust tomorrow's schedule"
  ];

  const handleSuggestion = (question) => {
    setInput(question);
  };

  return (
    <div className="chat-page">
      <h1 className="section-title">Chat Assistant</h1>
      <p className="section-subtitle">Ask about your schedule, patterns, and get explanations</p>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <div className={`message-bubble ${msg.role}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div className="message-bubble assistant typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-container" onSubmit={handleSubmit}>
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your schedule, patterns, or adjustments..."
            disabled={loading}
          />
          <Button type="submit" variant="primary" disabled={loading || !input.trim()}>
            Send
          </Button>
        </form>
      </div>

      <Card title="Suggested Questions" style={{ marginTop: '2rem' }}>
        <div className="suggested-questions">
          {suggestedQuestions.map((question, index) => (
            <Button 
              key={index} 
              variant="secondary" 
              onClick={() => handleSuggestion(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;
