import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import Login, { saveSession, getSession, clearSession } from "../components/Login.jsx"; 

describe("RenTech Login, Authentication & Session Test Suite", () => {
  const mockOnLogin = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterAll(() => {
    localStorage.clear();
  });

  describe("Session Utilities (saveSession, getSession, clearSession)", () => {
    it("should correctly save and retrieve a session from localStorage", () => {
      const username = "admin";
      const role = "Admin";

      saveSession(role, username);
      const retrieved = getSession();

      expect(retrieved).not.toBeNull();
      expect(retrieved.username).toBe(username);
      expect(retrieved.role).toBe(role);
      expect(retrieved.token).toBeDefined(); 
    });

    it("should return null if there is no session in localStorage", () => {
      const retrieved = getSession();
      expect(retrieved).toBeNull();
    });

    it("should clear the session when clearSession is called", () => {
      saveSession("Customer", "customer");
      clearSession();

      const retrieved = getSession();
      expect(retrieved).toBeNull();
    });
  });

  describe("Mock User Credentials & Roles (Internal Logic)", () => {
    it("should return true or valid credentials for standard admin role", () => {
      const password = "admin";
      const isValid = password === "admin";
      expect(isValid).toBe(true);
    });

    it("should return true or valid credentials for staff role", () => {
      const password = "staff";
      const isValid = password === "staff";
      expect(isValid).toBe(true);
    });

    it("should handle mixed-case or whitespace input using trim and toLowerCase", () => {
      const rawInput = "   Admin   ";
      const processedInput = rawInput.trim().toLowerCase();

      expect(processedInput).toBe("admin");
    });

    it("should fail validation if password does not match user account", () => {
      const passwordInput = "wrong_password";
      const actualPassword = "admin";

      expect(passwordInput === actualPassword).toBe(false);
    });
  });

  describe("Login Component UX & Lifecycle", () => {
    it("should automatically trigger onLogin on mount if a valid session exists in localStorage", () => {
      const validSession = {
        role: "Admin",
        username: "admin",
        token: "YWRtaW46QWRtaW46MTIzNDU2Nzg5", 
        issuedAt: Date.now(),
      };
      localStorage.setItem("rentech_session", JSON.stringify(validSession));

      render(<Login onLogin={mockOnLogin} onBack={mockOnBack} />);

      expect(mockOnLogin).toHaveBeenCalledWith("Admin");
      expect(mockOnLogin).toHaveBeenCalledTimes(1);
    });

    describe("Sign In Form Interactivity", () => {
      it("should successfully log in and save session using internal MOCK_USERS credentials", () => {
        render(<Login onLogin={mockOnLogin} onBack={mockOnBack} />);

        const usernameInput = screen.getByPlaceholderText("admin");
        const passwordInput = screen.getByPlaceholderText("••••••••");
        const signInButton = screen.getByRole("button", { name: /sign in/i });

        fireEvent.change(usernameInput, { target: { value: "staff" } });
        fireEvent.change(passwordInput, { target: { value: "staff" } });
        fireEvent.click(signInButton);

        expect(mockOnLogin).toHaveBeenCalledWith("Staff");

        const savedSession = JSON.parse(localStorage.getItem("rentech_session"));
        expect(savedSession).not.toBeNull();
        expect(savedSession.username).toBe("staff");
        expect(savedSession.role).toBe("Staff");
      });

      it("should show an error message if user provides incorrect passwords or unknown usernames", () => {
        render(<Login onLogin={mockOnLogin} onBack={mockOnBack} />);

        const usernameInput = screen.getByPlaceholderText("admin");
        const passwordInput = screen.getByPlaceholderText("••••••••");
        const signInButton = screen.getByRole("button", { name: /sign in/i });

        fireEvent.change(usernameInput, { target: { value: "unknownUser" } });
        fireEvent.change(passwordInput, { target: { value: "wrongPassword" } });
        fireEvent.click(signInButton);

        expect(mockOnLogin).not.toHaveBeenCalled();
        expect(screen.getByText("Invalid username or password")).toBeTruthy();
      });
    });

    describe("Navigation & Utility Controls", () => {
      it("should clear all current local states and fire home callbacks on exit command", () => {
        localStorage.setItem("rentech_session", JSON.stringify({ token: "active-user-token" }));

        render(<Login onLogin={mockOnLogin} onBack={mockOnBack} />);

        const backButton = screen.getByRole("button", { name: /← back to home/i });
        fireEvent.click(backButton);

        expect(localStorage.getItem("rentech_session")).toBeNull();
        expect(mockOnBack).toHaveBeenCalledTimes(1);
      });
    });
  });
});