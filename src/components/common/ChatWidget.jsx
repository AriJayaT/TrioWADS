import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaCommentDots, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import { sendMessage, getChatAvailability } from '../../services/ChatService';
import { useChatUpdates } from '../../hooks/useChatUpdates';
import { useSocket } from '../../context/SocketContext';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [availability, setAvailability] = useState({ available: false, agentsAvailable: 0, estimatedWaitTime: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [recipientId, setRecipientId] = useState(null);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const { socket, isConnected } = useSocket();
  const notificationTimeoutRef = useRef(null);

  // Real-time handlers
  const handleNewMessage = useCallback((message) => {
    console.log('[ChatWidget] handleNewMessage called:', message);
    console.log('[ChatWidget] Received new message:', message);
    setMessages((prev) => {
      // Check if message already exists to prevent duplicates
      const messageExists = prev.some(m => 
        m.id === message.id || 
        (m.timestamp === message.timestamp && m.content === message.content)
      );
      if (messageExists) {
        console.log('[ChatWidget] Message already exists, skipping:', message);
        return prev;
      }
      
      // Format the message with proper sender information
      const formattedMessage = {
        ...message,
        sender: message.senderId === user?.id ? 'me' : message.sender || 'agent',
        senderName: message.senderName || (message.sender === 'agent' ? 'Support Agent' : 'You')
      };
      
      console.log('[ChatWidget] Adding new message:', formattedMessage);
      
      // Show notification if chat is closed and message is from other user
      if (!isOpen && message.senderId !== user?.id) {
        // Clear any existing notification timeout
        if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current);
        }
        
        setNotification({
          content: message.content,
          senderName: formattedMessage.senderName,
          timestamp: message.timestamp
        });
        
        // Auto-hide notification after 5 seconds
        notificationTimeoutRef.current = setTimeout(() => {
          setNotification(null);
        }, 5000);
      }
      
      return [...prev, formattedMessage];
    });
  }, [user?.id, isOpen]);

  const handleTypingStatus = useCallback((status) => {
    console.log('[ChatWidget] Received typing status:', status);
    if (status.userId !== user?.id) {
      setTyping(status.isTyping);
    }
  }, [user?.id]);

  // Use the chat updates hook
  useChatUpdates(handleNewMessage, handleTypingStatus);

  // Load initial messages
  useEffect(() => {
    const loadInitialMessages = async () => {
      if (!user?.id || !chatId) return;
      try {
        const response = await apiClient.get('/chat/messages', { params: { chatId } });
        setMessages(response.data);
      } catch (error) {
        console.error('Error loading initial messages:', error);
      }
    };
    loadInitialMessages();
  }, [user?.id, chatId]);

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
    if (!newMessage.trim() || !socket || !isConnected) {
      console.log('[ChatWidget] Cannot send message - socket not connected or empty message');
      return;
    }

    const userMessage = {
      chatId,
      senderId: user?.id,
      recipientId,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    try {
      console.log('[ChatWidget] Sending message:', userMessage);
      
      // Add message to local state immediately
      setMessages(prev => [...prev, { 
        ...userMessage, 
        sender: 'me', 
        senderName: 'You',
        id: Date.now().toString() // Add unique ID for message
      }]);
      setNewMessage('');
      
      // Send message through socket
      socket.emit('send_message', userMessage);
      
      // Ensure we're in the chat room
      socket.emit('join_room', chatId);
    } catch (error) {
      console.error('[ChatWidget] Error sending message:', error);
      const errorMessage = {
        id: Date.now().toString(),
        chatId,
        sender: 'system',
        senderName: 'System',
        content: "Sorry, we encountered an error. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Initialize chat session
  useEffect(() => {
    const initializeChat = async () => {
      if (!user?.id) {
        console.log('[ChatWidget] No user ID available, skipping chat initialization');
        return;
      }

      // If we already have a chatId, just load messages and join room
      if (chatId) {
        console.log('[ChatWidget] Chat session already initialized, loading messages');
        try {
          const messagesResponse = await apiClient.get('/chat/messages', {
            params: { chatId }
          });
          setMessages(messagesResponse.data);
          
          // Join the chat room
          if (socket && isConnected) {
            console.log('[ChatWidget] Joining chat room:', chatId);
            socket.emit('join_room', chatId);
          }
        } catch (error) {
          console.error('[ChatWidget] Error loading messages:', error);
        }
        return;
      }

      try {
        console.log('[ChatWidget] Initializing chat session for user:', user.id);
        const response = await apiClient.post('/chat/initialize', {
          userId: user.id
        });
        
        console.log('[ChatWidget] Chat session initialized:', response.data);
        setChatId(response.data.chatId);
        setRecipientId(response.data.recipientId);
        
        // Load initial messages and join room
        if (response.data.chatId) {
          const messagesResponse = await apiClient.get('/chat/messages', {
            params: { chatId: response.data.chatId }
          });
          setMessages(messagesResponse.data);
          
          // Join the chat room
          if (socket && isConnected) {
            console.log('[ChatWidget] Joining chat room:', response.data.chatId);
            socket.emit('join_room', response.data.chatId);
          }
        }
      } catch (error) {
        console.error('[ChatWidget] Error initializing chat:', error);
      }
    };

    initializeChat();
  }, [user?.id, chatId, socket, isConnected]);

  // Add a useEffect to join the chat room whenever chatId and socket are available
  useEffect(() => {
    if (chatId && socket && isConnected) {
      console.log('[ChatWidget] Joining chat room:', chatId);
      socket.emit('join_room', chatId, (response) => {
        if (response && response.success) {
          console.log('[ChatWidget] Successfully joined chat room:', chatId);
        } else {
          console.error('[ChatWidget] Failed to join chat room:', response?.error || 'Unknown error');
        }
      });
    }
  }, [chatId, socket, isConnected]);

  // Add socket connection status logging
  useEffect(() => {
    if (socket) {
      const handleConnect = () => {
        console.log('[ChatWidget] Socket connected');
        if (chatId) {
          console.log('[ChatWidget] Re-joining chat room after reconnection:', chatId);
          socket.emit('join_room', chatId);
        }
      };

      const handleDisconnect = (reason) => {
        console.log('[ChatWidget] Socket disconnected:', reason);
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, [socket, chatId]);

  useEffect(() => {
    console.log('ChatWidget mounted, user:', user);
  }, [user]);

  useEffect(() => {
    console.log('[ChatWidget] useChatUpdates hook registered');
  }, []);

  // Cleanup notification timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Notification */}
      {notification && (
        <div 
          className="absolute bottom-24 right-0 bg-white text-gray-800 px-4 py-3 rounded-lg shadow-lg animate-bounce border border-pink-200 max-w-xs cursor-pointer"
          onClick={() => {
            setIsOpen(true);
            setNotification(null);
          }}
        >
          <div className="font-medium text-pink-500 mb-1">{notification.senderName}</div>
          <div className="text-sm">{notification.content}</div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
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
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`mb-3 flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.senderId === user?.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-white shadow-sm border border-gray-200'
                }`}
              >
                {message.senderName && message.senderId !== user?.id && (
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
          {/* Typing indicator (optional) */}
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