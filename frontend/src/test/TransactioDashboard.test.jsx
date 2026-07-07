import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import TransactionDashboard from '../components/TransactionDashboard.jsx'; 

describe("Transaction Dashboard Frontend Unit Tests", () => {

  it("should render the main headers correctly on load", () => {
    render(<TransactionDashboard />);
    
    const mainTitle = screen.getByText("Records");
    expect(mainTitle).toBeDefined();

    const subtitle = screen.getByText("Digital logbook of all rental transactions.");
    expect(subtitle).toBeDefined();
  });

  it("should display the search bar input field with the correct placeholder text", () => {
    render(<TransactionDashboard />);
    
    const searchInput = screen.getByPlaceholderText("Search by ID, customer, or item...");
    expect(searchInput).toBeDefined();
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

    expect(screen.getByText("Vintage Gatsby Sequin Dress")).toBeDefined();
  });

  it("should display a fallback message when a search returns zero results", async () => {
    render(<TransactionDashboard />);
    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText("Search by ID, customer, or item...");
    await user.type(searchInput, "xyzabc123789");

    const emptyStateMessage = screen.getByText("No records match your tracking filter options.");
    expect(emptyStateMessage).toBeDefined();
  });

});