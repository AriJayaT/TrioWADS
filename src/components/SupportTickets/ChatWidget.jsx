import React, { useState, useRef, useEffect } from "react";
import "./ChatWidget.css";
import PropTypes from "prop-types";

/**
 * ChatWidget component provides a floating chat interface for customer support
 * with mock responses
 * @component
 * @param {Object} props
 * @param {number} [props.maxMessageLength=500] - Maximum length of a message
 * @param {number} [props.maxMessages=50] - Maximum number of messages to keep in history
 * @param {function} [props.onSend] - Callback when a message is sent
 * @returns {React.ReactElement}
 */
export function ChatWidget({
  maxMessageLength = 500,
  maxMessages = 50,
  onSend,
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "👋 Hi! How can I help you with your Jellycat plush today?",
      sender: "support",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    if (isChatOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setTimeout(() => {
        document.getElementById("chat-input")?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  const validateMessage = (message) => {
    if (!message.trim()) {
      setError("Message cannot be empty");
      return false;
    }
    if (message.length > maxMessageLength) {
      setError(`Message cannot exceed ${maxMessageLength} characters`);
      return false;
    }
    return true;
  };

  // Get mock response based on user input
  const getMockResponse = (message) => {
    const lowerCaseMessage = message.toLowerCase();
    
    if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
      return "Hello! How can I help you with your Jellycat plush today?";
    }
    
    if (lowerCaseMessage.includes("clean") || lowerCaseMessage.includes("wash")) {
      return "For most Jellycat plushies, we recommend surface washing with a damp cloth. For deeper cleaning, hand wash gently with mild soap and air dry. Always check the care label for specific instructions.";
    }
    
    if (lowerCaseMessage.includes("return") || lowerCaseMessage.includes("refund")) {
      return "We offer returns within 30 days of purchase. Please make sure the item is in original condition with tags attached. You can start the return process from your account page or contact customer service.";
    }
    
    if (lowerCaseMessage.includes("shipping") || lowerCaseMessage.includes("delivery")) {
      return "Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2 business day delivery. International shipping may take 7-14 business days depending on the destination.";
    }
    
    return "Thank you for your message. Our support team will review your question and get back to you soon. Is there anything else I can help you with?";
  };

  const sendMessage = async () => {
    if (!validateMessage(currentMessage) || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add user message to UI immediately
      const userMessage = {
        text: currentMessage,
        sender: "user",
        time: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => {
        // Limit the number of messages
        const updatedMessages = [...prev, userMessage];
        if (updatedMessages.length > maxMessages) {
          return updatedMessages.slice(-maxMessages);
        }
        return updatedMessages;
      });
      
      // Clear input field
      setCurrentMessage("");

      // Call custom onSend callback if provided
      if (onSend) {
        onSend(currentMessage);
      }

      // Simulate API delay
      setTimeout(() => {
        // Get mock response
        const responseText = getMockResponse(userMessage.text);
        
        // Add support response to UI
        setMessages((prev) => {
          const supportMessage = {
            text: responseText,
            sender: "support",
            time: new Date().toLocaleTimeString(),
          };

          const updatedMessages = [...prev, supportMessage];
          if (updatedMessages.length > maxMessages) {
            return updatedMessages.slice(-maxMessages);
          }
          return updatedMessages;
        });
        
        setIsLoading(false);
      }, 1000); // Simulate a 1-second delay
    } catch (err) {
      console.error("Chat error:", err);
      setError("Failed to send message. Please try again.");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    // Reset messages with mock response
    setMessages([
      {
        text: "👋 Chat history cleared. How can I help you today?",
        sender: "support",
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <div className="chat-widget">
      <div className="chat-button-container">
        <button
          className="chat-toggle-button"
          aria-label="Toggle live chat"
          aria-expanded={isChatOpen}
          onClick={toggleChat}
        >
          💬
        </button>
        {messages.length > 1 && <div className="notification-badge">{messages.length - 1}</div>}
      </div>

      <div className={`chat-window ${isChatOpen ? "open" : ""}`}>
        <div className="chat-header">
          <div className="chat-title">Support Chat</div>
          <div className="chat-actions">
            <button
              className="reset-button"
              aria-label="Reset chat"
              onClick={resetChat}
              disabled={isLoading}
            >
              🔄
            </button>
            <button
              className="close-button"
              aria-label="Close chat"
              onClick={toggleChat}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === "user" ? "user" : "support"}`}
            >
              <div className="message-content">{message.text}</div>
              <div className="message-time">{message.time}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          {error && <div className="error-message">{error}</div>}
          <input
            id="chat-input"
            type="text"
            placeholder="Type your message..."
            aria-label="Chat message"
            value={currentMessage}
            maxLength={maxMessageLength}
            disabled={isLoading}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="chat-input"
          />
          <button
            className="send-button"
            aria-label="Send message"
            disabled={isLoading}
            onClick={sendMessage}
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

ChatWidget.propTypes = {
  maxMessageLength: PropTypes.number,
  maxMessages: PropTypes.number,
  onSend: PropTypes.func,
};