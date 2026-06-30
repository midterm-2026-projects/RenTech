import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CustomerChat from "../components/CustomerChat";
import * as customerService from "../services/customerAssistantService";

describe("CustomerChat Component", () => {
  beforeEach(() => {
    vi.spyOn(customerService, "generateCustomerResponse").mockImplementation(
      (input) => `Mock reply for: "${input}"`
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

    await waitFor(() => {
      expect(customerService.generateCustomerResponse).toHaveBeenCalledWith(
        "Help me",
        [],
        expect.any(Array)
      );
    });

    await waitFor(() => {
      expect(screen.queryByText("AI is typing...")).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Mock reply for: "Help me"/i)).toBeInTheDocument();

    const sendButton = screen.getByRole("button", { name: /send/i });

    await user.type(input, "Show me gowns");
    await user.click(sendButton);

    expect(screen.getByText("Show me gowns")).toBeInTheDocument();

    await waitFor(() => {
      expect(customerService.generateCustomerResponse).toHaveBeenCalledWith(
        "Show me gowns",
        [],
        expect.any(Array)
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Mock reply for: "Show me gowns"/i)).toBeInTheDocument();
    });
  });

  it("does nothing when user clicks Send with empty or whitespace-only input", async () => {
    const user = userEvent.setup();
    render(<CustomerChat />);

    const sendButton = screen.getByRole("button", { name: /send/i });
    await user.click(sendButton);

    const messages = screen.getAllByRole("generic").filter(el =>
      el.className.includes("p-2 rounded-md")
    );
    expect(messages).toHaveLength(1);
    expect(customerService.generateCustomerResponse).not.toHaveBeenCalled();

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    await user.type(input, "   ");
    await user.click(sendButton);

    expect(screen.getAllByRole("generic").filter(el =>
      el.className.includes("p-2 rounded-md")
    )).toHaveLength(1);
    expect(customerService.generateCustomerResponse).not.toHaveBeenCalled();
  });

  it("rejects sending while a reply is loading", async () => {
    const user = userEvent.setup();
    render(<CustomerChat />);

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    const sendButton = screen.getByRole("button", { name: /send/i });

    await user.type(input, "First message");
    await user.click(sendButton);

    expect(screen.getByText("AI is typing...")).toBeInTheDocument();

    await user.type(input, "Second message");
    await user.click(sendButton);

    await waitFor(() => {
      expect(customerService.generateCustomerResponse).toHaveBeenCalledTimes(1);
    });
  });

  it("shows a fallback message when the service returns null", async () => {
    customerService.generateCustomerResponse.mockReturnValue(null);

    const user = userEvent.setup();
    render(<CustomerChat />);

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    const sendButton = screen.getByRole("button", { name: /send/i });

    await user.type(input, "Hello");
    await user.click(sendButton);

    await waitFor(() => {
      expect(
        screen.getByText("I'm not sure how to respond to that.")
      ).toBeInTheDocument();
    });
  });

  it("sends with the default sample products when products prop is empty", async () => {
    const user = userEvent.setup();
    render(<CustomerChat products={[]} />);

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    const sendButton = screen.getByRole("button", { name: /send/i });

    await user.type(input, "Recommend a gown");
    await user.click(sendButton);

    await waitFor(() => {
      expect(customerService.generateCustomerResponse).toHaveBeenCalledWith(
        "Recommend a gown",
        [],
        []
      );
    });
  });

  it("completes a full send flow with custom products prop", async () => {
    const customProducts = [{ id: 99, name: "Custom Gown" }];
    const user = userEvent.setup();
    render(<CustomerChat products={customProducts} />);

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    const sendButton = screen.getByRole("button", { name: /send/i });

    await user.type(input, "Find something");
    await user.click(sendButton);

    expect(screen.getByText("Find something")).toBeInTheDocument();

    await waitFor(() => {
      expect(customerService.generateCustomerResponse).toHaveBeenCalledWith(
        "Find something",
        [],
        customProducts
      );
    });
  });
});
