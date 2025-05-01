import React, { useState, useEffect, useRef } from 'react';
import { FaCommentDots, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { sendMessage, getChatAvailability } from '../../services/ChatService';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [availability, setAvailability] = useState({ available: false, agentsAvailable: 0, estimatedWaitTime: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  
  // Check chat availability
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const status = await getChatAvailability();
        setAvailability(status);
      } catch (error) {
        console.error("Failed to fetch chat availability:", error);
      }
    };
    
    checkAvailability();
    
    // Refresh availability status every minute
    const intervalId = setInterval(checkAvailability, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Initial greeting when chat is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessages = [
        {
          id: 1,
          sender: 'agent',
          senderName: 'YipHelp Support',
          content: `Hi there! 👋 How can I help you today? ${availability.available ? 
            `\nWe have ${availability.agentsAvailable} agent${availability.agentsAvailable > 1 ? 's' : ''} available to chat.` : 
            "\nNo agents are currently online, but we'll respond to your message as soon as possible."}`,
          timestamp: new Date().toISOString(),
        }
      ];
      setMessages(initialMessages);
    }
  }, [isOpen, availability]);
  
  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Toggle chat open/closed
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Handle sending new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      senderName: user?.name || 'You',
      content: newMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, userMessage]);
    setNewMessage('');
    
    // Simulate agent typing
    setTyping(true);
    
    try {
      // Send message to service and get response
      const response = await sendMessage(newMessage);
      
      const agentMessage = {
        id: messages.length + 2,
        sender: 'agent',
        senderName: response.agentName || 'YipHelp Support',
        content: response.content,
        timestamp: response.timestamp || new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        sender: 'agent',
        senderName: 'System',
        content: "Sorry, we encountered an error. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setTyping(false);
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-gray-500 scale-0 opacity-0' : 'bg-pink-500 scale-100 opacity-100'
        }`}
        style={{ transform: isOpen ? 'scale(0)' : 'scale(1)' }}
      >
        <FaCommentDots className="text-white text-xl" />
      </button>

      {/* Chat Window */}
      <div
        className={`bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 flex flex-col ${
          isOpen
            ? 'opacity-100 scale-100 w-80 sm:w-96 h-[480px]'
            : 'opacity-0 scale-95 w-0 h-0'
        }`}
      >
        {/* Header */}
        <div className="bg-pink-500 text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="font-medium">Live Chat Support</h3>
            <p className="text-xs text-pink-100">
              {availability.available 
                ? `${availability.agentsAvailable} agent${availability.agentsAvailable > 1 ? 's' : ''} online • Wait time: ${availability.estimatedWaitTime}`
                : `${availability.estimatedWaitTime}`
              }
            </p>
          </div>
          <button
            onClick={toggleChat}
            className="text-white hover:bg-pink-600 rounded-full p-2"
          >
            <FaTimes />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.sender === 'user'
                    ? 'bg-pink-500 text-white'
                    : 'bg-white shadow-sm border border-gray-200'
                }`}
              >
                {message.sender === 'agent' && (
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    {message.senderName}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs block mt-1 opacity-70">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start mb-3">
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 border-t">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent outline-none text-sm"
              disabled={typing}
            />
            <button
              type="submit"
              className={`ml-2 ${typing ? 'text-gray-400 cursor-not-allowed' : 'text-pink-500'} ${!newMessage.trim() && !typing && 'opacity-50 cursor-not-allowed'}`}
              disabled={!newMessage.trim() || typing}
            >
              {typing ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWidget; 