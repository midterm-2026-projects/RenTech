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

  it("renders the RenTech header and welcome message", () => {
    renderCustomerLayout();
    expect(screen.getByText("RenTech")).toBeInTheDocument();
    expect(screen.getByText("Welcome to RenTech")).toBeInTheDocument();
  });

  it("renders the welcome description text", () => {
    renderCustomerLayout();
    expect(
      screen.getByText(
        /Browse our collection of premium rental wear and book your perfect outfit/i
      )
    ).toBeInTheDocument();
  });

  it("renders navigation links for catalog and bookings", () => {
    renderCustomerLayout();
    expect(screen.getByText("Catalog")).toBeInTheDocument();
    expect(screen.getByText("My Bookings")).toBeInTheDocument();
  });

  it("nav links point to the correct paths", () => {
    renderCustomerLayout();
    const catalogLink = screen.getByText("Catalog").closest("a");
    const bookingsLink = screen.getByText("My Bookings").closest("a");
    expect(catalogLink).toHaveAttribute("href", "/catalog");
    expect(bookingsLink).toHaveAttribute("href", "/bookings");
  });

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
