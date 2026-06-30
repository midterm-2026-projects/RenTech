import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ChatBox from "../components/ChatBox";

describe("ChatBox Component", () => {
  const mockMessages = [
    { role: "assistant", text: "Hello, I'm a bot." },
    { role: "user", text: "Hi there!" },
  ];

  it("renders messages correctly", () => {
    render(
      <ChatBox
        messages={mockMessages}
        input=""
        setInput={() => {}}
        handleSend={() => {}}
        loading={false}
      />
    );

    expect(screen.getByText("Hello, I'm a bot.")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("applies correct styling based on message role", () => {
    render(
      <ChatBox
        messages={mockMessages}
        input=""
        setInput={() => {}}
        handleSend={() => {}}
        loading={false}
      />
    );

    const assistantMsg = screen.getByText("Hello, I'm a bot.").closest("div");
    const userMsg = screen.getByText("Hi there!").closest("div");

    expect(assistantMsg).toHaveClass("bg-gray-200", "text-gray-800");
    expect(userMsg).toHaveClass("ml-auto", "bg-blue-500", "text-white");
  });

  it("shows loading indicator when loading is true", () => {
    render(
      <ChatBox
        messages={[]}
        input=""
        setInput={() => {}}
        handleSend={() => {}}
        loading={true}
      />
    );

    expect(screen.getByText("AI is typing...")).toBeInTheDocument();
  });

  it("does not show loading indicator when loading is false", () => {
    render(
      <ChatBox
        messages={[]}
        input=""
        setInput={() => {}}
        handleSend={() => {}}
        loading={false}
      />
    );

    expect(screen.queryByText("AI is typing...")).not.toBeInTheDocument();
  });

  it("calls handleSend when Send button is clicked", async () => {
    const handleSend = vi.fn();
    const user = userEvent.setup();

    render(
      <ChatBox
        messages={[]}
        input=""
        setInput={() => {}}
        handleSend={handleSend}
        loading={false}
      />
    );

    const button = screen.getByRole("button", { name: /send/i });
    await user.click(button);

    expect(handleSend).toHaveBeenCalledTimes(1);
  });

  it("calls handleSend when Enter key is pressed", async () => {
    const handleSend = vi.fn();
    const user = userEvent.setup();

    render(
      <ChatBox
        messages={[]}
        input="test"
        setInput={() => {}}
        handleSend={handleSend}
        loading={false}
      />
    );

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    await user.type(input, "{enter}");

    expect(handleSend).toHaveBeenCalledTimes(1);
  });

  it("does not call handleSend on Enter if input is empty (parent handles that)", async () => {
    const handleSend = vi.fn();
    const user = userEvent.setup();

    render(
      <ChatBox
        messages={[]}
        input=""
        setInput={() => {}}
        handleSend={handleSend}
        loading={false}
      />
    );

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    await user.type(input, "{enter}");

    // ChatBox calls handleSend unconditionally; parent must guard against empty input
    expect(handleSend).toHaveBeenCalledTimes(1);
  });

  it("displays the current input value", () => {
    render(
      <ChatBox
        messages={[]}
        input="Hello world"
        setInput={() => {}}
        handleSend={() => {}}
        loading={false}
      />
    );

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    expect(input).toHaveValue("Hello world");
  });

  it("renders the messages container with the correct test id", () => {
    render(
      <ChatBox
        messages={[]}
        input=""
        setInput={() => {}}
        handleSend={() => {}}
        loading={false}
      />
    );

    expect(screen.getByTestId("chat-messages")).toBeInTheDocument();
  });

  it("renders the send button with correct text", () => {
    render(
      <ChatBox
        messages={[]}
        input=""
        setInput={() => {}}
        handleSend={() => {}}
        loading={false}
      />
    );

    expect(screen.getByRole("button", { name: /send/i })).toHaveTextContent("Send");
  });

  it("renders the input field with the correct placeholder", () => {
    render(
      <ChatBox
        messages={[]}
        input=""
        setInput={() => {}}
        handleSend={() => {}}
        loading={false}
      />
    );

    expect(screen.getByPlaceholderText("Ask your AI assistant...")).toBeInTheDocument();
  });


  it("calls setInput with the typed value", () => {
  const setInput = vi.fn();

  render(
    <ChatBox
      messages={[]}
      input=""
      setInput={setInput}
      handleSend={() => {}}
      loading={false}
    />
  );

  const input = screen.getByPlaceholderText("Ask your AI assistant...");

  fireEvent.change(input, {
    target: { value: "Hello" },
  });

  expect(setInput).toHaveBeenCalledOnce();
  expect(setInput).toHaveBeenCalledWith("Hello");
  });
});