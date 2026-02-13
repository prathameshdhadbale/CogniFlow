import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chat';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import './ChatPage.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your CogniFlow AI assistant. I can help you manage tasks, analyze your productivity patterns, and provide insights. What would you like to do today?"
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

      if (response.action === 'create_task' || response.action === 'update_task' || response.action === 'delete_task') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.message,
          action: response.action
        }]);
        toast.success(response.message);
      } else if (response.action === 'list_tasks') {
        const taskList = formatTaskList(response.data.tasks);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.message + '\n\n' + taskList
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.message
        }]);
      }
    } catch (error) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatTaskList = (tasks) => {
    if (!tasks || tasks.length === 0) {
      return "No tasks found.";
    }

    return tasks.map((task, idx) => {
      const scheduledTime = task.scheduledFor
        ? new Date(task.scheduledFor).toLocaleString()
        : task.deadline
        ? `Deadline: ${new Date(task.deadline).toLocaleString()}`
        : 'Not scheduled';

      return `${idx + 1}. ${task.title}\n   ${scheduledTime} • ${task.priority || 'medium'} priority`;
    }).join('\n\n');
  };

  const suggestions = [
    "Create a task for tomorrow",
    "What tasks do I have today?",
    "Show my productivity insights",
    "What's my peak productivity time?"
  ];

  return (
    <div className="chat-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Assistant</h1>
          <p className="page-subtitle">Your intelligent productivity companion</p>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'assistant' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  {msg.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                {msg.action && (
                  <div className="action-badge">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {msg.action === 'create_task' && 'Task Created'}
                    {msg.action === 'update_task' && 'Task Updated'}
                    {msg.action === 'delete_task' && 'Task Deleted'}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div className="message-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSubmit}>
          <div className="input-wrapper-chat">
            <input
              type="text"
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <Button type="submit" variant="primary" disabled={loading || !input.trim()}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M18.3333 1.66666L9.16667 10.8333M18.3333 1.66666L12.5 18.3333L9.16667 10.8333M18.3333 1.66666L1.66667 7.49999L9.16667 10.8333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Send
            </Button>
          </div>
        </form>
      </div>

      <div className="suggestions-container">
        <h3 className="suggestions-title">Try asking:</h3>
        <div className="suggestions-grid">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion-card"
              onClick={() => setInput(suggestion)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;