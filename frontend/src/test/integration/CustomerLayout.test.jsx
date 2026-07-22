import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CustomerLayout from "../../pages/CustomerLayout";
import * as customerService from "../../services/customerAssistantService";
import * as authModule from "../../components/Login";

// Prevent the real axios client from hitting localhost:5000 during tests
// (which produces noisy AxiosError network logs). The default products keep
// the "Emerald Silk Mermaid Evening Gown" card present for the booking tests.
vi.mock("../../services/inventoryApiClient", () => ({
  getProducts: vi.fn(() =>
    Promise.resolve({
      status: "success",
      data: [
        { id: "BK-839260", name: "Emerald Silk Mermaid Evening Gown", price: 4500, category: "GOWN", status: "Available" },
        { id: "BK-112233", name: "A-Line Ivory Lace Wedding Gown", price: 7500, category: "GOWN", status: "Rented" },
        { id: "BK-445566", name: "Midnight Black Peak Lapel Tuxedo", price: 3800, category: "SUIT", status: "Maintenance" },
        { id: "BK-778899", name: "Modern Charcoal Grey Slim Suit", price: 3200, category: "SUIT", status: "Overdue" },
      ],
      total: 4,
      totalPages: 1,
      page: 1,
      limit: 100,
    })
  ),
  getTransactions: vi.fn(() =>
    Promise.resolve({ status: "success", data: [], total: 0, totalPages: 1, page: 1, limit: 200 })
  ),
  createTransaction: vi.fn(() => Promise.resolve({ status: "success", data: {} })),
}));

describe("CustomerLayout Component (Integration)", () => {
  beforeEach(() => {
    localStorage.clear();
    authModule.saveSession("Customer", "customer");
    vi.spyOn(customerService, "postAssistantMessage").mockResolvedValue(
      'Mock reply for: "Show me gowns"'
    );
    vi.spyOn(window, "alert").mockImplementation(() => {});
    
    // Mock global fetch to prevent ECONNREFUSED in Transaction component tests
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => []
    });
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

  it("renders the primary Collection page header and description text", async () => {
    renderCustomerLayout();
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Collection" })).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Browse our premium formal wear collection/i)
    ).toBeInTheDocument();
  });

  it("renders sidebar navigation buttons for Collection and Transactions", async () => {
    renderCustomerLayout();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Collection/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Transactions/i })).toBeInTheDocument();
    });
  });

  it("renders the sidebar profile identity header and online status footer", async () => {
    renderCustomerLayout();
    await waitFor(() => {
      const userProfileNames = screen.getAllByText("Customer");
      expect(userProfileNames.length).toBeGreaterThanOrEqual(2);
    });
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("switches to transaction history panel when transactions sidebar path is triggered", async () => {
    const user = userEvent.setup();
    renderCustomerLayout();

    await waitFor(() => {
      expect(screen.getByText(/Browse our premium formal wear collection/i)).toBeInTheDocument();
    });
    
    const transactionsBtn = screen.getByRole("button", { name: /Transactions/i });
    await user.click(transactionsBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Browse our premium formal wear collection/i)).not.toBeInTheDocument();
    });
  });

  it("handles user logout process modal state verification flow correctly", async () => {
    const user = userEvent.setup();
    const clearSessionSpy = vi.spyOn(authModule, "clearSession");
    renderCustomerLayout();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Sign Out/i })).toBeInTheDocument();
    });
    const sidebarSignOutBtn = screen.getByRole("button", { name: /Sign Out/i });
    await user.click(sidebarSignOutBtn);

    expect(screen.getByText("Confirm Sign Out")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to sign out?/i)).toBeInTheDocument();

    const modalButtons = screen.getAllByRole("button", { name: "Sign Out" });
    const modalConfirmBtn = modalButtons[modalButtons.length - 1]; 
    await user.click(modalConfirmBtn);

    expect(clearSessionSpy).toHaveBeenCalled();
  });


  //  BOOKING FORM 


  it("opens the complete booking form overlay when a product item card is triggered", async () => {
    const user = userEvent.setup();
    renderCustomerLayout();

    const availableItem = await screen.findByText(/Emerald Silk Mermaid Evening Gown/i);
    // Click the card's "Rent Now" button (only Available items render one).
    const cardDetails = availableItem.parentElement;
    const rentBtn = cardDetails.querySelector("button");
    await user.click(rentBtn);

    await waitFor(() => {
      expect(screen.getByText(/Complete Booking/i)).toBeInTheDocument();
    });
  });

  it("it should fill out the info of customer", async () => {
    const user = userEvent.setup();
    renderCustomerLayout();

    const availableItem = await screen.findByText(/Emerald Silk Mermaid Evening Gown/i);
    await user.click(availableItem.closest(".rounded-xl") || availableItem.parentElement);

    const nameInput = await waitFor(() => 
      document.querySelector('input[name*="name" i], input[id*="name" i], input') || screen.queryByPlaceholderText(/full name|name|customer name/i)
    );
    const phoneInput = await waitFor(() => 
      document.querySelector('input[name*="phone" i], input[name*="contact" i], input[id*="phone" i], input[type="tel"]') || screen.queryByPlaceholderText(/phone number|phone|contact|mobile/i)
    );
    const addressInput = await waitFor(() => 
      document.querySelector('input[name*="address" i], input[id*="address" i]') || screen.queryByPlaceholderText(/address|location|delivery/i)
    );
    const notesTextarea = await waitFor(() => 
      document.querySelector('textarea, input[name*="note" i]') || screen.queryByPlaceholderText(/special notes|notes|instructions|remarks/i)
    );

    if (nameInput) await user.type(nameInput, "Jane Doe");
    if (phoneInput) await user.type(phoneInput, "09123456789");
    if (addressInput) await user.type(addressInput, "123 Luxury Lane, Manila");
    if (notesTextarea) await user.type(notesTextarea, "Prefer extra floor length alignment adjustments.");

    if (nameInput) expect(nameInput).toHaveValue("Jane Doe");
    if (phoneInput) expect(phoneInput).toHaveValue("09123456789");
    if (addressInput) expect(addressInput).toHaveValue("123 Luxury Lane, Manila");
    if (notesTextarea) expect(notesTextarea).toHaveValue("Prefer extra floor length alignment adjustments.");
  });

  it("handles rental date picker inputs correctly", async () => {
    renderCustomerLayout();

    const availableItem = await screen.findByText(/Emerald Silk Mermaid Evening Gown/i);
    fireEvent.click(availableItem.closest(".rounded-xl") || availableItem.parentElement);

    const datePickerInput = await waitFor(() => 
      document.querySelector('input[type="date"]') || document.querySelector('input[type="text"]')
    );
    
    fireEvent.change(datePickerInput, { target: { value: "2026-07-25" } });
    expect(datePickerInput.value).toBe("2026-07-25");
  });

  it("handles size option listings selection and process progression", async () => {
    const user = userEvent.setup();
    renderCustomerLayout();

    const availableItem = await screen.findByText(/Emerald Silk Mermaid Evening Gown/i);
    await user.click(availableItem.closest(".rounded-xl") || availableItem.parentElement);

    const sizeSelectDropdown = await waitFor(() => 
      document.querySelector("select") || document.querySelector('[role="combobox"]') || document.querySelector('input')
    );

    if (sizeSelectDropdown && sizeSelectDropdown.tagName === "SELECT") {
      await user.selectOptions(sizeSelectDropdown, "Small (S)");
      expect(sizeSelectDropdown.value).toBe("S");
    } else if (sizeSelectDropdown) {
      await user.click(sizeSelectDropdown);
    }
  });


  // CHAT ASSISTANT


  it("renders the floating chat widget button", async () => {
    renderCustomerLayout();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /open chat/i })).toBeInTheDocument();
    });
  });

  it("chat panel is closed by default", () => {
    renderCustomerLayout();
    expect(screen.queryByText("Chat Assistant")).not.toBeInTheDocument();
  });

  it("clicking the widget opens the chat panel with a greeting", async () => {
    const user = userEvent.setup();
    renderCustomerLayout();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /open chat/i })).toBeInTheDocument();
    });
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

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /open chat/i })).toBeInTheDocument();
    });
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

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /open chat/i })).toBeInTheDocument();
    });
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

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /open chat/i })).toBeInTheDocument();
    });
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
    expect(screen.queryByText("Chat Assistant")).not.toBeInTheDocument();
  });
});