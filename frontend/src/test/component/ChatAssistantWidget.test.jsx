import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ChatAssistantWidget from "../../components/ChatAssistantWidget";
import * as customerService from "../../services/customerAssistantService";

describe("ChatAssistantWidget Component", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a floating chat button on the screen", () => {
    render(<ChatAssistantWidget />);
    const button = screen.getByRole("button", { name: /open chat/i });
    expect(button).toBeInTheDocument();
  });

  it("does not show the chat panel before any click", () => {
    render(<ChatAssistantWidget />);
    expect(screen.queryByText("Chat Assistant")).not.toBeInTheDocument();
  });

  it("opens the chat panel when clicked", async () => {
    const user = userEvent.setup();
    render(<ChatAssistantWidget />);

    const openButton = screen.getByRole("button", { name: /open chat/i });
    await user.click(openButton);

    await waitFor(() => {
      expect(screen.getByText("Chat Assistant")).toBeInTheDocument();
    });
  });

  it("closes the chat panel when the floating button is clicked again", async () => {
    const user = userEvent.setup();
    render(<ChatAssistantWidget />);

    await user.click(screen.getByRole("button", { name: /open chat/i }));
    await waitFor(() => {
      expect(screen.getByText("Chat Assistant")).toBeInTheDocument();
    });

    const closeButtons = screen.getAllByRole("button", { name: /close chat/i });
    await user.click(closeButtons[closeButtons.length - 1]);
    await waitFor(() => {
      expect(screen.queryByText("Chat Assistant")).not.toBeInTheDocument();
    });
  });

  it("closes the chat panel when the header X button is clicked", async () => {
    const user = userEvent.setup();
    render(<ChatAssistantWidget />);

    await user.click(screen.getByRole("button", { name: /open chat/i }));
    await waitFor(() => {
      expect(screen.getByText("Chat Assistant")).toBeInTheDocument();
    });

    const closeButtons = screen.getAllByRole("button", { name: /close chat/i });
    await user.click(closeButtons[0]);
    await waitFor(() => {
      expect(screen.queryByText("Chat Assistant")).not.toBeInTheDocument();
    });
  });

  it("shows a greeting message when opened for the first time", async () => {
    const user = userEvent.setup();
    render(<ChatAssistantWidget />);

    await user.click(screen.getByRole("button", { name: /open chat/i }));

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("customer assistant"))
      ).toBeInTheDocument();
    });
  });

  it("has a text box and send button inside the chat panel", async () => {
    const user = userEvent.setup();
    render(<ChatAssistantWidget />);

    await user.click(screen.getByRole("button", { name: /open chat/i }));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Ask your AI assistant...")
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    });
  });

  it("sends a message and shows a reply from the assistant", async () => {
    vi.spyOn(customerService, "postAssistantMessage").mockResolvedValue(
      'Mock reply for: "What gowns do you have?"'
    );
    const user = userEvent.setup();
    render(<ChatAssistantWidget />);

    await user.click(screen.getByRole("button", { name: /open chat/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Ask your AI assistant...")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    await user.type(input, "What gowns do you have?");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Mock reply for: "What gowns do you have\?"/i)
      ).toBeInTheDocument();
    });
  });

  it("does not send a message when the input is empty", async () => {
    vi.spyOn(customerService, "postAssistantMessage").mockResolvedValue("reply");
    const user = userEvent.setup();
    render(<ChatAssistantWidget />);

    await user.click(screen.getByRole("button", { name: /open chat/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(customerService.postAssistantMessage).not.toHaveBeenCalled();
  });

  it("sends a message via Enter key", async () => {
    vi.spyOn(customerService, "postAssistantMessage").mockResolvedValue(
      'Mock reply for: "Hello"'
    );
    const user = userEvent.setup();
    render(<ChatAssistantWidget />);

    await user.click(screen.getByRole("button", { name: /open chat/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Ask your AI assistant...")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    await user.type(input, "Hello{Enter}");

    await waitFor(() => {
      expect(
        screen.getByText(/Mock reply for: "Hello"/i)
      ).toBeInTheDocument();
    });
  });

  it("toggles the button icon between open and close states", async () => {
    const user = userEvent.setup();
    render(<ChatAssistantWidget />);

    expect(
      screen.getByRole("button", { name: /open chat/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open chat/i }));

    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /close chat/i }).length
      ).toBeGreaterThanOrEqual(1);
    });
  });
});
