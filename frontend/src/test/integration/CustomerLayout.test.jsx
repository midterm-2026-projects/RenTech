import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CustomerLayout from "../../pages/CustomerLayout";
import * as customerService from "../../services/customerAssistantService";

describe("CustomerLayout Component (Integration)", () => {
  beforeEach(() => {
    vi.spyOn(customerService, "generateCustomerResponse").mockImplementation(
      (input) => `Mock reply for: "${input}"`
    );
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderCustomerLayout() {
    return render(
      <MemoryRouter>
        <CustomerLayout />
      </MemoryRouter>
    );
  }

  it("renders the primary Collection page header and description text", () => {
    renderCustomerLayout();
    expect(screen.getByRole("heading", { level: 1, name: "Collection" })).toBeInTheDocument();
    expect(
      screen.getByText(/Browse our premium formal wear collection/i)
    ).toBeInTheDocument();
  });

  it("renders sidebar navigation buttons for Collection and Transactions", () => {
    renderCustomerLayout();
    expect(screen.getByRole("button", { name: /Collection/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Transactions/i })).toBeInTheDocument();
  });

  it("renders the sidebar profile identity header and online status footer", () => {
    renderCustomerLayout();
    const userProfileNames = screen.getAllByText("Maria Santos");
    expect(userProfileNames.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Customer")).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("maintains collection display panel when alternative sidebar paths are triggered", async () => {
    const user = userEvent.setup();
    renderCustomerLayout();

    expect(screen.getByRole("heading", { level: 1, name: "Collection" })).toBeInTheDocument();
    
    const transactionsBtn = screen.getByRole("button", { name: /Transactions/i });
    await user.click(transactionsBtn);

    expect(screen.getByRole("heading", { level: 1, name: "Collection" })).toBeInTheDocument();
  });

  it("handles user logout process modal state verification flow correctly", async () => {
    const user = userEvent.setup();
    renderCustomerLayout();

    const sidebarSignOutBtn = screen.getByRole("button", { name: /Sign Out/i });
    await user.click(sidebarSignOutBtn);

    expect(screen.getByText("Confirm Sign Out")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to sign out?/i)).toBeInTheDocument();

    const modalButtons = screen.getAllByRole("button", { name: "Sign Out" });
    const modalConfirmBtn = modalButtons[modalButtons.length - 1]; 
    await user.click(modalConfirmBtn);

    expect(window.alert).toHaveBeenCalledWith("Signing out...");
  });

  // =========================================================================
  // ORIGINAL CHAT ASSISTANT TESTING SECTIONS (UNTOUCHED)
  // =========================================================================

  it("renders the floating chat widget button", () => {
    renderCustomerLayout();
    expect(
      screen.getByRole("button", { name: /open chat/i })
    ).toBeInTheDocument();
  });

  it("chat panel is closed by default", () => {
    renderCustomerLayout();
    expect(screen.queryByText("Chat Assistant")).not.toBeInTheDocument();
  });

  it("clicking the widget opens the chat panel with a greeting", async () => {
    const user = userEvent.setup();
    renderCustomerLayout();

    await user.click(screen.getByRole("button", { name: /open chat/i }));

    await waitFor(() => {
      expect(screen.getByText("Chat Assistant")).toBeInTheDocument();
      expect(
        screen.getByText((content) => content.includes("customer assistant"))
      ).toBeInTheDocument();
    });
  });

  it("closes the chat panel when the floating button is clicked again", async () => {
    const user = userEvent.setup();
    renderCustomerLayout();

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

  it("allows sending a message through the chat widget", async () => {
    const user = userEvent.setup();
    renderCustomerLayout();

    await user.click(screen.getByRole("button", { name: /open chat/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Ask your AI assistant...")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    await user.type(input, "Show me gowns");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Mock reply for: "Show me gowns"/i)
      ).toBeInTheDocument();
    });
  });

  it("sends a message via Enter key in the chat widget", async () => {
    const user = userEvent.setup();
    renderCustomerLayout();

    await user.click(screen.getByRole("button", { name: /open chat/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Ask your AI assistant...")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Ask your AI assistant...");
    await user.type(input, "Rent a suit{Enter}");

    await waitFor(() => {
      expect(
        screen.getByText(/Mock reply for: "Rent a suit"/i)
      ).toBeInTheDocument();
    });
  });

  it("does not show the chat panel initially after page load", () => {
    renderCustomerLayout();
    expect(screen.queryByPlaceholderText("Ask your AI assistant...")).not.toBeInTheDocument();
    expect(screen.queryByText("Customer Support Assistant")).not.toBeInTheDocument();
  });
});