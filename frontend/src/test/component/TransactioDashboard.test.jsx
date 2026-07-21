import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const SEED = [
  { id: "TX-1001", username: "ana rivera", itemName: "Vintage Gatsby Sequin Dress", date: "May 01, 2026", totalCost: 1500, status: "Active" },
  { id: "TX-1002", username: "carlos mendez", itemName: "Barong Tagalog", date: "May 02, 2026", totalCost: 800, status: "Active" },
  { id: "TX-1003", username: "liza santos", itemName: "Emerald Velvet Gown", date: "May 03, 2026", totalCost: 1800, status: "Active" },
  { id: "TX-1004", username: "daniel cruz", itemName: "Black Tuxedo", date: "May 04, 2026", totalCost: 1400, status: "Returned" },
  { id: "TX-1005", username: "isabel garcia", itemName: "Champagne Silk Gown", date: "May 02, 2026", totalCost: 1700, status: "Active" },
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

  it("should render the main headers correctly on load", async () => {
    render(<TransactionDashboard />);

    expect(screen.getByText("Records")).toBeDefined();
    expect(await screen.findByText("Digital logbook of all rental transactions.")).toBeDefined();
  });

  it("should display the search bar input field with the correct placeholder text", () => {
    render(<TransactionDashboard />);
    expect(screen.getByPlaceholderText("Search by ID, customer, or item...")).toBeDefined();
  });

  it("should render default table column headers properly", () => {
    render(<TransactionDashboard />);

    expect(screen.getByText("ID")).toBeDefined();
    expect(screen.getByText("Customer")).toBeDefined();
    expect(screen.getByText("Item")).toBeDefined();
    expect(screen.getByText("Status")).toBeDefined();
    expect(screen.getByText("Amount")).toBeDefined();
  });

  it("should update rows dynamically when a query is typed into the search bar", async () => {
    render(<TransactionDashboard />);
    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText("Search by ID, customer, or item...");

    await user.type(searchInput, "Gatsby Sequin");

    expect(await screen.findByText("Vintage Gatsby Sequin Dress")).toBeDefined();
  });

  it("should display a fallback message when a search returns zero results", async () => {
    render(<TransactionDashboard />);
    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText("Search by ID, customer, or item...");
    await user.type(searchInput, "xyzabc123789");

    expect(await screen.findByText("No records match your tracking filter options.")).toBeDefined();
  });

});
