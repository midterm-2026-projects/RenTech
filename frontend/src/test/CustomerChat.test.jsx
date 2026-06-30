import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CustomerChat from "../components/CustomerChat";
import * as customerService from "../services/customerAssistantService";

describe("CustomerChat Component", () => {
  // Mock the service before each test
  beforeEach(() => {
    vi.spyOn(customerService, "generateCustomerResponse").mockImplementation(
      (input) => `Mock reply for: "${input}"`
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders initial assistant message", () => {
    render(<CustomerChat />);
    expect(
      screen.getByText(/your customer assistant/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ask your AI assistant...")
    ).toBeInTheDocument();
  });

  it("renders the send button and input field", () => {
    render(<CustomerChat />);
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ask your AI assistant...")
    ).toBeInTheDocument();
  });

  it("allows user to type a message and sends it", async () => {
    const user = userEvent.setup();
    render(<CustomerChat />);

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    const sendButton = screen.getByRole("button", { name: /send/i });

    await user.type(input, "Hello assistant");
    await user.click(sendButton);

    // User message appears
    expect(screen.getByText("Hello assistant")).toBeInTheDocument();

    // Service was called with the input (waits for 800ms setTimeout)
    await waitFor(() => {
      expect(customerService.generateCustomerResponse).toHaveBeenCalledWith(
        "Hello assistant",
        [],
        expect.any(Array)
      );
    });

    // Assistant reply appears
    await waitFor(() => {
      expect(screen.getByText(/Mock reply for: "Hello assistant"/i)).toBeInTheDocument();
    });
  });

  it("sends message when Enter key is pressed", async () => {
    const user = userEvent.setup();
    render(<CustomerChat />);

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    await user.type(input, "Help me{enter}");

    expect(screen.getByText("Help me")).toBeInTheDocument();

    await waitFor(() => {
      expect(customerService.generateCustomerResponse).toHaveBeenCalledWith(
        "Help me",
        [],
        expect.any(Array)
      );
    });
  });

  it("does not send empty messages", async () => {
    const user = userEvent.setup();
    render(<CustomerChat />);

    const sendButton = screen.getByRole("button", { name: /send/i });
    await user.click(sendButton);

    // No new message added
    const messages = screen.getAllByRole("generic").filter(el =>
      el.className.includes("p-2 rounded-md")
    );
    expect(messages).toHaveLength(1); // only initial assistant message
    expect(customerService.generateCustomerResponse).not.toHaveBeenCalled();
  });

  it("shows loading indicator while waiting for reply", async () => {
    const user = userEvent.setup();
    render(<CustomerChat />);

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    const sendButton = screen.getByRole("button", { name: /send/i });

    await user.type(input, "Test");
    await user.click(sendButton);

    // Immediately after click, loading should be true
    expect(screen.getByText("AI is typing...")).toBeInTheDocument();

    // Wait for reply (after the 800ms setTimeout fires)
    await waitFor(() => {
      expect(screen.queryByText("AI is typing...")).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("calls service with custom products when provided as prop", async () => {
    const customProducts = [{ id: 99, name: "Custom Gown" }];
    const user = userEvent.setup();
    render(<CustomerChat products={customProducts} />);

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    const sendButton = screen.getByRole("button", { name: /send/i });

    await user.type(input, "Recommend something");
    await user.click(sendButton);

    await waitFor(() => {
      expect(customerService.generateCustomerResponse).toHaveBeenCalledWith(
        "Recommend something",
        [],
        customProducts
      );
    });
  });
});
