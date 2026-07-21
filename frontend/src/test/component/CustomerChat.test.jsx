import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CustomerChat from "../../components/CustomerChat";
import * as customerService from "../../services/customerAssistantService";

describe("CustomerChat Component", () => {
  beforeEach(() => {
    // Mock the API call to simulate different scenarios
    vi.spyOn(customerService, "postAssistantMessage").mockImplementation(
      (question) => new Promise(resolve => 
        setTimeout(() => resolve(`Mock reply for: "${question}"`), 800)
      )
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the full initial chat UI on load", () => {
    render(<CustomerChat />);

    expect(screen.getByText(/your customer assistant/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ask your AI assistant...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toHaveTextContent("Send");
    expect(screen.getByTestId("chat-messages")).toBeInTheDocument();
    expect(screen.queryByText("AI is typing...")).not.toBeInTheDocument();
  });

  it("sends a message, shows loading, then renders the reply via button or Enter", async () => {
    const user = userEvent.setup();
    render(<CustomerChat />);

    const input = screen.getByPlaceholderText("Ask your AI assistant...");

    await user.type(input, "Help me{enter}");

    expect(screen.getByText("Help me")).toBeInTheDocument();
    expect(screen.getByText("AI is typing...")).toBeInTheDocument();

    expect(customerService.postAssistantMessage).toHaveBeenCalledWith("Help me");

    await waitFor(() => {
      expect(screen.queryByText("AI is typing...")).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Mock reply for: "Help me"/i)).toBeInTheDocument();
  });

  it("does nothing when user clicks Send with empty or whitespace-only input", async () => {
    const user = userEvent.setup();
    render(<CustomerChat />);

    const sendButton = screen.getByRole("button", { name: /send/i });
    await user.click(sendButton);

    expect(customerService.postAssistantMessage).not.toHaveBeenCalled();

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    await user.type(input, "   ");
    await user.click(sendButton);

    expect(customerService.postAssistantMessage).not.toHaveBeenCalled();
  });

  it("rejects sending while a reply is loading", async () => {
    // Create a promise that we can resolve later to control loading state
    let resolvePromise;
    vi.spyOn(customerService, "postAssistantMessage").mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve; })
    );

    const user = userEvent.setup();
    render(<CustomerChat />);

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    const sendButton = screen.getByRole("button", { name: /send/i });

    await user.type(input, "First message");
    await user.click(sendButton);

    expect(screen.getByText("AI is typing...")).toBeInTheDocument();

    await user.type(input, "Second message");
    await user.click(sendButton);

    expect(customerService.postAssistantMessage).toHaveBeenCalledTimes(1);
  });

  it("shows a fallback message when the API is unavailable (null response)", async () => {
    vi.spyOn(customerService, "postAssistantMessage").mockResolvedValue(null);

    const user = userEvent.setup();
    render(<CustomerChat />);

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    const sendButton = screen.getByRole("button", { name: /send/i });

    await user.type(input, "Hello");
    await user.click(sendButton);

    await waitFor(() => {
      expect(
        screen.getByText("AI assistant is currently unavailable. Please try again later or contact the boutique directly.")
      ).toBeInTheDocument();
    });
  });

  it("shows a fallback message when the API throws an error (rejected promise)", async () => {
    vi.spyOn(customerService, "postAssistantMessage").mockRejectedValue(
      new Error("Network error")
    );

    const user = userEvent.setup();
    render(<CustomerChat />);

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    const sendButton = screen.getByRole("button", { name: /send/i });

    await user.type(input, "Hello");
    await user.click(sendButton);

    await waitFor(() => {
      expect(
        screen.getByText("AI assistant is currently unavailable. Please try again later or contact the boutique directly.")
      ).toBeInTheDocument();
    });
  });
});
