import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chat';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import './ChatPage.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your CogniFlow AI assistant. I can see your tasks, thoughts, reflections, and patterns. Ask me anything about your productivity!"
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
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.message
      }]);
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
    "What tasks do I have scheduled today?",
    "What's my peak productivity time?",
    "Show me my full schedule for this week",
    "What do my recent thoughts say about my work style?",
    "How am I doing with task completion?",
    "What patterns have you noticed in my reflections?",
    "Am I overloading myself?",
    "When should I schedule difficult tasks?"
  ];

  const handleSuggestion = (question) => {
    setInput(question);
  };

  return (
    <div className="chat-page">
      <h1 className="section-title">AI Assistant</h1>
      <p className="section-subtitle">
        Ask about your schedule, patterns, thoughts, and get personalized insights
      </p>

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
            placeholder="Ask about your schedule, patterns, or productivity..."
            disabled={loading}
          />
          <Button type="submit" variant="primary" disabled={loading || !input.trim()}>
            Send
          </Button>
        </form>
      </div>

      <Card title="💡 Suggested Questions" style={{ marginTop: '2rem' }}>
        <div className="suggested-questions">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              className="suggestion-btn"
              onClick={() => handleSuggestion(question)}
            >
              {question}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;