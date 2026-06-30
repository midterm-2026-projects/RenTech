import { useState } from 'react';
import ChatBox from './ChatBox';
import { generateCustomerResponse } from '../services/customerAssistantService';

const CustomerChat = ({ products = [] }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I’m your customer assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate network delay (replace with real API call later)
    setTimeout(() => {
      const botReply = {
        role: 'assistant',
        text: generateCustomerResponse(input, [], products) ?? "I'm not sure how to respond to that."
      };
      setMessages(prev => [...prev, botReply]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="customer-chat-container p-4 bg-white shadow rounded-lg">
      <h3 className="text-lg font-semibold text-blue-700 mb-2">
        Customer Support Assistant
      </h3>
      <ChatBox
        messages={messages}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        loading={loading}
      />
    </div>
  );
};

export default CustomerChat;