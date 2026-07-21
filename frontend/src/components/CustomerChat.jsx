import { useState } from 'react';
import ChatBox from './ChatBox';
import { postAssistantMessage } from '../services/customerAssistantService';

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
    const question = input;
    setInput('');
    setLoading(true);

    try {
      const reply = await postAssistantMessage(question);
      if (reply === null) {
        throw new Error('API unavailable');
      }
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'AI assistant is currently unavailable. Please try again later or contact the boutique directly.'
      }]);
    } finally {
      setLoading(false);
    }
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