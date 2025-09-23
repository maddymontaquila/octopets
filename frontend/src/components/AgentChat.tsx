import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatState } from '../types/types';
import '../styles/AgentChat.css';

const AgentChat: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: '1',
        content: "Hi there! 🐾 I'm here to help you find the perfect pet-friendly spots for your furry friend! Tell me about your pet - what kind of animal do they have, what do they enjoy doing, and what are you looking for today?",
        sender: 'agent',
        timestamp: new Date(),
      }
    ],
    isWaitingForResponse: false,
  });

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Scroll only within the messages container, not the page
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const generateAgentResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Test responses based on keywords
    if (lowerMessage.includes('dog') || lowerMessage.includes('puppy')) {
      return "🐕 That's awesome! Dogs love exploring new places. Are you looking for dog parks, pet-friendly restaurants, or maybe hiking trails? I can help you find spots where your pup can socialize and have fun!";
    } else if (lowerMessage.includes('cat') || lowerMessage.includes('kitten')) {
      return "🐱 Cats are wonderful companions! Are you looking for cat-friendly cafes, pet stores with climbing areas, or perhaps quiet outdoor spaces where your kitty can safely explore?";
    } else if (lowerMessage.includes('bird') || lowerMessage.includes('parrot')) {
      return "🦜 Birds are such intelligent companions! Are you interested in bird-friendly venues, pet stores with avian sections, or outdoor spaces where your feathered friend can enjoy fresh air safely?";
    } else if (lowerMessage.includes('rabbit') || lowerMessage.includes('bunny')) {
      return "🐰 Rabbits are adorable! I can help you find bunny-friendly spaces, pet stores with rabbit supplies, or quiet outdoor areas where your hoppy friend can safely explore.";
    } else if (lowerMessage.includes('restaurant') || lowerMessage.includes('cafe') || lowerMessage.includes('food')) {
      return "🍽️ Great choice! I can help you find pet-friendly restaurants and cafes where you and your companion can enjoy a meal together. What type of cuisine are you in the mood for?";
    } else if (lowerMessage.includes('park') || lowerMessage.includes('outdoor') || lowerMessage.includes('walk')) {
      return "🌳 Perfect! Outdoor activities are great for pets. I can suggest dog parks, hiking trails, beaches, and other outdoor spaces where pets are welcome. What kind of outdoor experience are you looking for?";
    } else if (lowerMessage.includes('shop') || lowerMessage.includes('store') || lowerMessage.includes('supplies')) {
      return "🛍️ Shopping for your pet! I can direct you to the best pet stores, grooming services, and pet-friendly retail locations. What do you need to pick up for your furry friend?";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! 👋 I'm excited to help you discover amazing pet-friendly places. Tell me about your pet and what kind of adventure you're planning today!";
    } else {
      return "That sounds interesting! 🎯 Based on what you've told me, I can help you find the perfect pet-friendly venues. Would you like me to suggest some options, or do you have a specific type of place in mind? I can recommend restaurants, parks, shops, or other pet-welcoming spots!";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || chatState.isWaitingForResponse) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message and set waiting state
    setChatState(prev => ({
      messages: [...prev.messages, userMessage],
      isWaitingForResponse: true,
    }));

    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      
      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: generateAgentResponse(userMessage.content),
        sender: 'agent',
        timestamp: new Date(),
      };

      setChatState(prev => ({
        messages: [...prev.messages, agentResponse],
        isWaitingForResponse: false,
      }));
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <section className="agent-chat-section">
      <div className="chat-container" ref={chatContainerRef}>
        <div className="chat-header">
          <div className="agent-avatar">
            <span className="agent-icon">🤖</span>
          </div>
          <div className="agent-info">
            <h3>Your Pet-Friendly Guide</h3>
            <p>Tell me about your pet and I'll help you find perfect spots!</p>
          </div>
        </div>
        
        <div className="chat-messages" ref={messagesContainerRef}>
          {chatState.messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user-message' : 'agent-message'}`}
            >
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message agent-message typing-message">
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
        
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Tell me about your pet and what you're looking for..."
              className="chat-input"
              disabled={chatState.isWaitingForResponse}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || chatState.isWaitingForResponse}
              className="send-button"
            >
              <span className="send-icon">📤</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgentChat;