import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import Sidebar from "../components/Sidebar";

describe("Sidebar Layout and Interactions", () => {
  it("renders profile header details correctly", () => {
    render(<Sidebar />);
    
    const adminElements = screen.getAllByText("Admin");
    expect(adminElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText("Admin User")).toBeInTheDocument();
  });

  it("renders all core menu option buttons", () => {
    render(<Sidebar />);
    
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Inventory")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("AI Intelligence")).toBeInTheDocument();
    expect(screen.getByText("System Settings")).toBeInTheDocument();
  });

  it("handles the active tab highlight shift on navigation button click", () => {
    render(<Sidebar />);
    
    const inventoryBtn = screen.getByText("Inventory").closest("button");
    const dashboardBtn = screen.getByText("Dashboard").closest("button");
    
    expect(dashboardBtn).toHaveClass("bg-rose-50/60");
    expect(inventoryBtn).not.toHaveClass("bg-rose-50/60");
    
    fireEvent.click(inventoryBtn);
    
    expect(inventoryBtn).toHaveClass("bg-rose-50/60");
    expect(dashboardBtn).not.toHaveClass("bg-rose-50/60");
  });

  it("triggers and closes the sign out confirmation modal workflow", () => {
    render(<Sidebar />);
    
    expect(screen.queryByText("Confirm Sign Out")).not.toBeInTheDocument();
    
    const signOutBtn = screen.getByText("Sign Out");
    fireEvent.click(signOutBtn);
    
    expect(screen.getByText("Confirm Sign Out")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to sign out/i)).toBeInTheDocument();
    
    const cancelBtn = screen.getByText("Cancel");
    fireEvent.click(cancelBtn);
    
    expect(screen.queryByText("Confirm Sign Out")).not.toBeInTheDocument();
  });
});