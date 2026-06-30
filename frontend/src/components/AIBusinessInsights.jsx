import { useState } from "react";
import { generateResponse } from "../services/aiInsights";

const AIBusinessInsights = ({ insights = [], suggestions = [] }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I’m your RenTech AI business assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const hasData = insights?.length > 0 || suggestions?.length > 0;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    // Simulate API delay – replace with real fetch later
    setTimeout(() => {
      const botReply = {
        role: "assistant",
        text: generateResponse(input, insights, suggestions),
      };

      setMessages((prev) => [...prev, botReply]);
      setLoading(false);
    }, 800);
  };

  if (!hasData) {
    return (
      <div className="p-4 bg-gray-50 border rounded-md" data-testid="ai-fallback">
        <p className="text-gray-500 italic">
          No AI insights or suggestions available at this time.
        </p>

        <div className="mt-4 border-t pt-4">
          <p className="text-sm text-gray-400 mb-2">
            AI Assistant is still available:
          </p>
          <ChatBox
            messages={messages}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insights-container p-6 bg-white shadow rounded-lg space-y-6">

      <div>
        <h2 className="text-xl font-bold mb-4">Generative AI Business Insights</h2>

        <h3 className="text-lg font-semibold text-blue-700 mb-2">
          Business Insights
        </h3>
        {insights?.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1" data-testid="insights-list">
            {insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No insights available.</p>
        )}

        <h3 className="text-lg font-semibold text-green-700 mt-4 mb-2">
          Customer Suggestions
        </h3>
        {suggestions?.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1" data-testid="suggestions-list">
            {suggestions.map((s, index) => (
              <li key={index}>{s}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No suggestions available.</p>
        )}
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-purple-700 mb-2">
          RenTech AI Customer Assistant
        </h3>

        <ChatBox
          messages={messages}
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          loading={loading}
        />
      </div>
    </div>
  );
};

// ChatBox component 
const ChatBox = ({ messages, input, setInput, handleSend, loading }) => {
  return (
    <div className="border rounded-md p-3 bg-gray-50">
      <div
        className="h-64 overflow-y-auto space-y-2 mb-3"
        data-testid="chat-messages"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-md text-sm w-fit max-w-[80%] ${
              msg.role === "user"
                ? "ml-auto bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="text-sm text-gray-400">AI is typing...</div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI assistant..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-purple-600 text-white px-4 py-2 rounded text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIBusinessInsights;