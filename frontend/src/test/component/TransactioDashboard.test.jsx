import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const SEED = [
  { id: "TX-1001", username: "ana rivera", itemName: "Vintage Gatsby Sequin Dress", date: "May 01, 2026", pricePerDay: 500, daysRented: 3, totalCost: 1500, status: "Active" },
  { id: "TX-1002", username: "carlos mendez", itemName: "Barong Tagalog", date: "May 02, 2026", pricePerDay: 400, daysRented: 2, totalCost: 800, status: "Active" },
  { id: "TX-1003", username: "liza santos", itemName: "Emerald Velvet Gown", date: "May 03, 2026", pricePerDay: 600, daysRented: 3, totalCost: 1800, status: "Active" },
  { id: "TX-1004", username: "daniel cruz", itemName: "Black Tuxedo", date: "May 04, 2026", pricePerDay: 700, daysRented: 2, totalCost: 1400, status: "Returned" },
  { id: "TX-1005", username: "isabel garcia", itemName: "Champagne Silk Gown", date: "May 02, 2026", pricePerDay: 850, daysRented: 2, totalCost: 1700, status: "Active" },
];

vi.mock('../../services/inventoryApiClient', () => ({
  getTransactions: vi.fn(async ({ search = '', status = '' } = {}) => {
    let data = [...SEED];
    if (search) {
      const s = String(search).toLowerCase();
      data = data.filter(
        (r) =>
          r.id.toLowerCase().includes(s) ||
          r.username.toLowerCase().includes(s) ||
          r.itemName.toLowerCase().includes(s)
      );
    }
    if (status) {
      const arr = String(status).split(',').map((x) => x.trim()).filter(Boolean);
      if (arr.length) data = data.filter((r) => arr.includes(r.status));
    }
    return { status: 'success', data, page: 1, limit: 10, total: data.length, totalPages: 1 };
  }),
  updateTransactionStatus: vi.fn(async () => ({ status: 'success', data: {} })),
}));

import TransactionDashboard from "../../components/TransactionDashboard.jsx";

describe("Transaction Dashboard Frontend Unit Tests", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the main controls correctly on load", async () => {
    render(<TransactionDashboard />);

    expect(screen.getByPlaceholderText("Search by ID, customer, or item...")).toBeDefined();
    expect(screen.getByText("Export CSV")).toBeDefined();

    const items = await screen.findAllByText("#TX-1001");
    expect(items.length).toBeGreaterThan(0);
  });

  it("should display the search bar input field with the correct placeholder text", async () => {
    render(<TransactionDashboard />);
    expect(screen.getByPlaceholderText("Search by ID, customer, or item...")).toBeDefined();
    const items = await screen.findAllByText("#TX-1001");
    expect(items.length).toBeGreaterThan(0);
  });

  it("should render default table column headers properly", async () => {
    render(<TransactionDashboard />);

    expect(screen.getByText("Transaction ID")).toBeDefined();
    expect(screen.getByText("Customer")).toBeDefined();
    expect(screen.getByText("Item")).toBeDefined();
    expect(screen.getByText("Status")).toBeDefined();
    expect(screen.getByText("Amount")).toBeDefined();
    const items = await screen.findAllByText("#TX-1001");
    expect(items.length).toBeGreaterThan(0);
  });

  it("should update rows dynamically when a query is typed into the search bar", async () => {
    render(<TransactionDashboard />);
    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText("Search by ID, customer, or item...");

    await user.type(searchInput, "Gatsby Sequin");

    const rows = await screen.findAllByText("Vintage Gatsby Sequin Dress");
    expect(rows.length).toBeGreaterThan(0);
  });

  it("should display a fallback message when a search returns zero results", async () => {
    render(<TransactionDashboard />);
    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText("Search by ID, customer, or item...");
    await user.type(searchInput, "xyzabc123789");

    const messages = await screen.findAllByText("No records match your tracking filter options");
    expect(messages.length).toBeGreaterThan(0);
  });

});
