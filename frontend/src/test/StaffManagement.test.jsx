import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import StaffManagement from "../components/StaffManagement.jsx"; 

describe("Staff Management - Video Validation Test Suite", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const getForm = () => screen.getByRole("button", { name: /\+ add/i }).closest("form");

  it("should display 'Both fields are required' if the username field is left empty", () => {
    render(<StaffManagement />);
    const usernameInput = screen.getByPlaceholderText("customer");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    fireEvent.change(usernameInput, { target: { value: "" } });
    fireEvent.change(passwordInput, { target: { value: "somepassword" } });
    fireEvent.submit(getForm());

    expect(screen.getByText("Both fields are required")).toBeTruthy();
  });

  it("should display 'Both fields are required' if the password field is left empty", () => {
    render(<StaffManagement />);
    const usernameInput = screen.getByPlaceholderText("customer");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    fireEvent.change(usernameInput, { target: { value: "jj" } });
    fireEvent.change(passwordInput, { target: { value: "" } });
    fireEvent.submit(getForm());

    expect(screen.getByText("Both fields are required")).toBeTruthy();
  });

  it("should clear out the entry input text boxes immediately following a successful add", () => {
    render(<StaffManagement />);
    const usernameInput = screen.getByPlaceholderText("customer");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    fireEvent.change(usernameInput, { target: { value: "jj" } });
    fireEvent.change(passwordInput, { target: { value: "nj" } });
    fireEvent.submit(getForm());

    expect(usernameInput.value).toBe("");
    expect(passwordInput.value).toBe("");
  });

});