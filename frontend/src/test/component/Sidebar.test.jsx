import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";

// A wrapper component to mimic AdminLayout's tab state management behavior
function SidebarTestWrapper({ initialTab = "dashboard" }) {
  const [currentTab, setCurrentTab] = useState(initialTab);
  return (
    <MemoryRouter>
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />
    </MemoryRouter>
  );
}

describe("Sidebar Layout and Interactions", () => {
  it("renders profile header details correctly", () => {
    render(
      <MemoryRouter>
        <Sidebar currentTab="dashboard" onTabChange={vi.fn()} />
      </MemoryRouter>
    );

    const adminElements = screen.getAllByText("Admin");
    expect(adminElements.length).toBeGreaterThan(0);

    expect(screen.getByText("Admin User")).toBeInTheDocument();
  });

  it("renders all core menu option buttons", () => {
    render(
      <MemoryRouter>
        <Sidebar currentTab="dashboard" onTabChange={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Inventory")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("AI Intelligence")).toBeInTheDocument();
    expect(screen.getByText("System Settings")).toBeInTheDocument();
  });

  it("handles the active tab highlight shift on navigation button click", () => {
    // Render using the wrapper that updates state on onTabChange
    render(<SidebarTestWrapper initialTab="dashboard" />);

    const inventoryBtn = screen.getByText("Inventory").closest("button");
    const dashboardBtn = screen.getByText("Dashboard").closest("button");

    // Assert dashboard is initially highlighted
    expect(dashboardBtn).toHaveClass("bg-rose-50/50");
    expect(inventoryBtn).not.toHaveClass("bg-rose-50/50");

    // Click inventory tab
    fireEvent.click(inventoryBtn);

    // Assert active class shifted to inventory
    expect(inventoryBtn).toHaveClass("bg-rose-50/50");
    expect(dashboardBtn).not.toHaveClass("bg-rose-50/60");
  });

  it("triggers and closes the sign out confirmation modal workflow", () => {
    render(
      <MemoryRouter>
        <Sidebar currentTab="dashboard" onTabChange={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.queryByText("Confirm Sign Out")).not.toBeInTheDocument();

    const signOutBtn = screen.getByText("Sign Out");
    fireEvent.click(signOutBtn);

    expect(screen.getByText("Confirm Sign Out")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to sign out/i)).toBeInTheDocument();

    const cancelBtn = screen.getByText("Cancel");
    fireEvent.click(cancelBtn);

    expect(screen.queryByText("Confirm Sign Out")).not.toBeInTheDocument();
  });

  /* ========================================================================
     NEW EXPLICIT PROP ACTIONS & ROUTING COMPATIBILITY TESTS
     ======================================================================== */

  it("calls onTabChange with 'transactions' when the Transactions item is clicked", () => {
    const mockOnTabChange = vi.fn();
    render(
      <MemoryRouter>
        <Sidebar currentTab="dashboard" onTabChange={mockOnTabChange} />
      </MemoryRouter>
    );

    const transactionsBtn = screen.getByText("Transactions").closest("button");
    fireEvent.click(transactionsBtn);

    // Verifies it emits the specific lowercase value required by AdminLayout routing
    expect(mockOnTabChange).toHaveBeenCalledWith("transactions");
  });

  it("calls onTabChange with 'settings' when the System Settings item is clicked", () => {
    const mockOnTabChange = vi.fn();
    render(
      <MemoryRouter>
        <Sidebar currentTab="dashboard" onTabChange={mockOnTabChange} />
      </MemoryRouter>
    );

    const settingsBtn = screen.getByText("System Settings").closest("button");
    fireEvent.click(settingsBtn);

    // Verifies it emits the specific lowercase value required by AdminLayout routing
    expect(mockOnTabChange).toHaveBeenCalledWith("settings");
  });
});
