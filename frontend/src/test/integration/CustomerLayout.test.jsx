import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CustomerLayout from "../../pages/CustomerLayout";
import * as customerService from "../../services/customerAssistantService";
import * as Login from "../../components/Login";

describe("CustomerLayout Component (Integration)", () => {
  beforeEach(() => {
    vi.spyOn(customerService, "postAssistantMessage").mockResolvedValue(
      'Mock reply for: "Show me gowns"'
    );
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(Login, "clearSession").mockImplementation(() => {});
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

  it("switches to transaction history panel when transactions sidebar path is triggered", async () => {
    const user = userEvent.setup();
    renderCustomerLayout();

    expect(screen.getByText(/Browse our premium formal wear collection/i)).toBeInTheDocument();
    
    const transactionsBtn = screen.getByRole("button", { name: /Transactions/i });
    await user.click(transactionsBtn);

    expect(screen.queryByText(/Browse our premium formal wear collection/i)).not.toBeInTheDocument();
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

    expect(Login.clearSession).toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });


  //  BOOKING FORM 


  it("opens the complete booking form overlay when a product item card is triggered", async () => {
    const user = userEvent.setup();
    renderCustomerLayout();

    expect(screen.queryByText("Complete Booking")).not.toBeInTheDocument();

    const availableItem = screen.getByText(/Emerald Silk Mermaid Evening Gown/i).closest("div");
    await user.click(availableItem);

    expect(screen.getByRole("heading", { name: "Complete Booking" })).toBeInTheDocument();
  });

  it("fills out user info fields and toggles booking target identity options", async () => {
    const user = userEvent.setup();
    renderCustomerLayout();

    const availableItem = screen.getByText(/Emerald Silk Mermaid Evening Gown/i).closest("div");
    await user.click(availableItem);

    const meToggleBtn = screen.getByRole("button", { name: "Me" });
    const someoneElseToggleBtn = screen.getByRole("button", { name: "Someone else" });
    
    await user.click(someoneElseToggleBtn);
    await user.click(meToggleBtn);

    const nameInput = screen.getByPlaceholderText("Full Name");
    const phoneInput = screen.getByPlaceholderText("Phone Number");
    const addressInput = screen.getByPlaceholderText("Address");
    const notesTextarea = screen.getByPlaceholderText(/special notes/i);

    await user.type(nameInput, "Jane Doe");
    await user.type(phoneInput, "09123456789");
    await user.type(addressInput, "123 Luxury Lane, Manila");
    await user.type(notesTextarea, "Prefer extra floor length alignment adjustments.");

    expect(nameInput).toHaveValue("Jane Doe");
    expect(phoneInput).toHaveValue("09123456789");
    expect(addressInput).toHaveValue("123 Luxury Lane, Manila");
    expect(notesTextarea).toHaveValue("Prefer extra floor length alignment adjustments.");
  });

  it("handles rental date picker inputs correctly", async () => {
    renderCustomerLayout();

    const availableItem = screen.getByText(/Emerald Silk Mermaid Evening Gown/i).closest("div");
    fireEvent.click(availableItem);

    const datePickerInput = document.querySelector('input[type="date"]') || 
                            screen.queryByLabelText(/rental date/i) ||
                            screen.getByText(/rental date/i).parentElement.querySelector('input');
    
    fireEvent.change(datePickerInput, { target: { value: "2026-07-25" } });
    expect(datePickerInput.value).toBe("2026-07-25");
  });

  it("handles size option listings selection and process progression", async () => {
    const user = userEvent.setup();
    renderCustomerLayout();

    const availableItem = screen.getByText(/Emerald Silk Mermaid Evening Gown/i).closest("div");
    await user.click(availableItem);

    const sizeSelectDropdown = screen.getByRole("combobox") || document.querySelector("select");

    await user.selectOptions(sizeSelectDropdown, "Small (S)");
    expect(sizeSelectDropdown.value).toBe("S");

    const continueBtn = screen.getByRole("button", { name: "Continue to Payment" });
    await user.click(continueBtn);
  });


  // CHAT ASSISTANT


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
    customerService.postAssistantMessage.mockResolvedValue(
      'Mock reply for: "Show me gowns"'
    );
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
        screen.getByText((content) => content.includes("Mock reply for: \"Show me gowns\""))
      ).toBeInTheDocument();
    });
  });

  it("sends a message via Enter key in the chat widget", async () => {
    customerService.postAssistantMessage.mockResolvedValue(
      'Mock reply for: "Rent a suit"'
    );
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
        screen.getByText((content) => content.includes("Mock reply for: \"Rent a suit\""))
      ).toBeInTheDocument();
    });
  });

  it("does not show the chat panel initially after page load", () => {
    renderCustomerLayout();
    expect(screen.queryByPlaceholderText("Ask your AI assistant...")).not.toBeInTheDocument();
    expect(screen.queryByText("Customer Support Assistant")).not.toBeInTheDocument();
  });
});
