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

export default ChatBox;