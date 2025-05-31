import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import './ChatWidget.css';
import { useSocket } from '../context/SocketContext';
import { useChatUpdates } from '../hooks/useChatUpdates';

const ChatWidget = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [recipientId, setRecipientId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat session
  useEffect(() => {
    const initializeChat = async () => {
      if (!user?.id) return;
      try {
        // Get or create chat session
        const response = await apiClient.post('/chat/initialize', {
          userId: user.id
        });
        setChatId(response.data.chatId);
        setRecipientId(response.data.recipientId);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };
    initializeChat();
  }, [user?.id]);

  // Real-time handlers
  const handleNewMessage = useCallback((message) => {
    if (message.chatId === chatId) {
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(m =>
          m.id === message.id ||
          (m.timestamp === message.timestamp && m.content === message.content)
        );
        if (messageExists) return prev;
        return [...prev, message];
      });
    }
  }, [chatId]);

  const handleTypingStatus = useCallback((status) => {
    if (status.userId !== user?.id && status.chatId === chatId) {
      setIsTyping(status.isTyping);
    }
  }, [user?.id, chatId]);

  // Use the new chat updates hook
  useChatUpdates(handleNewMessage, handleTypingStatus);

  // Load initial messages
  useEffect(() => {
    const loadInitialMessages = async () => {
      if (!chatId) return;
      try {
        const response = await apiClient.get('/chat/messages', {
          params: { chatId }
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    loadInitialMessages();
  }, [chatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !chatId) return;
    try {
      const message = {
        chatId,
        senderId: user?.id,
        recipientId,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };
      // Emit message through WebSocket
      socket.emit('send_message', message);
      // Add message to local state immediately
      setMessages(prev => [...prev, { ...message, sender: 'me' }]);
      setNewMessage('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (!socket || !chatId) return;
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_status', {
        isTyping: true,
        chatId,
        recipientId
      });
    }
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const timeout = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_status', {
        isTyping: false,
        chatId,
        recipientId
      });
    }, 1000);
    setTypingTimeout(timeout);
  };

  return (
    <div className="chat-widget">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'me' ? 'sent' : 'received'}`}
          >
            <div className="message-content">{message.content}</div>
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message received">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleTyping}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWidget; 