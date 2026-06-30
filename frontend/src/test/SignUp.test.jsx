import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import Signup from "../components/SignUp.jsx";

describe("RenTech Sign Up Test Suite", () => {
  const mockOnLogin = vi.fn();
  const mockOnBack = vi.fn();
  const mockOnNavigateToLogin = vi.fn();
  let extraUsers;
  let mockSetExtraUsers;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    extraUsers = {};
    mockSetExtraUsers = vi.fn((updater) => {
      extraUsers =
        typeof updater === "function" ? updater(extraUsers) : updater;
    });
  });

  afterAll(() => {
    localStorage.clear();
  });

  const renderSignup = (overrides = {}) =>
    render(
      <Signup
        onLogin={mockOnLogin}
        onBack={mockOnBack}
        onNavigateToLogin={mockOnNavigateToLogin}
        extraUsers={extraUsers}
        setExtraUsers={mockSetExtraUsers}
        {...overrides}
      />
    );

  const fillForm = ({ username, password, confirm }) => {
    const usernameInput = screen.getByPlaceholderText("newcustomer");
    const [passwordInput, confirmInput] =
      screen.getAllByPlaceholderText("••••••••");

    if (username !== undefined) {
      fireEvent.change(usernameInput, { target: { value: username } });
    }
    if (password !== undefined) {
      fireEvent.change(passwordInput, { target: { value: password } });
    }
    if (confirm !== undefined) {
      fireEvent.change(confirmInput, { target: { value: confirm } });
    }

    return { usernameInput, passwordInput, confirmInput };
  };

  const submitForm = () => {
    const registerButton = screen.getByRole("button", { name: /^register$/i });
    fireEvent.submit(registerButton.closest("form"));
  };

  describe("Required Field Validation", () => {
    it("should display 'Please fill in all fields' if the username is left empty", () => {
      renderSignup();
      fillForm({ username: "", password: "password123", confirm: "password123" });
      submitForm();

      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(screen.getByText("Please fill in all fields")).toBeTruthy();
    });

    it("should display 'Please fill in all fields' if the password is left empty", () => {
      renderSignup();
      fillForm({ username: "newuser", password: "", confirm: "password123" });
      submitForm();

      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(screen.getByText("Please fill in all fields")).toBeTruthy();
    });

    it("should display 'Please fill in all fields' if the confirm password is left empty", () => {
      renderSignup();
      fillForm({ username: "newuser", password: "password123", confirm: "" });
      submitForm();

      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(screen.getByText("Please fill in all fields")).toBeTruthy();
    });

    it("should display 'Passwords do not match' if password and confirm password differ", () => {
      renderSignup();
      fillForm({
        username: "bob",
        password: "password123",
        confirm: "differentPassword",
      });
      submitForm();

      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(screen.getByText("Passwords do not match")).toBeTruthy();
    });

    it("should display 'Username already exists' for a built-in MOCK_USERS username", () => {
      renderSignup();
      fillForm({ username: "admin", password: "admin", confirm: "admin" });
      submitForm();

      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(screen.getByText("Username already exists")).toBeTruthy();
    });

    it("should display 'Username already exists' for a username already present in extraUsers", () => {
      extraUsers = { existinguser: { password: "pw123", role: "Customer" } };
      renderSignup();
      fillForm({ username: "existinguser", password: "newpass", confirm: "newpass" });
      submitForm();

      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(screen.getByText("Username already exists")).toBeTruthy();
    });

    it("should treat usernames as case-insensitive when checking duplicates", () => {
      renderSignup();
      fillForm({ username: "  Admin  ", password: "admin", confirm: "admin" });
      submitForm();

      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(screen.getByText("Username already exists")).toBeTruthy();
    });
  });

  describe("Successful Registration & Default Role Assignment", () => {
    it("should register a new user successfully and assign the default 'Customer' role", () => {
      renderSignup();
      fillForm({ username: "alice", password: "password123", confirm: "password123" });
      submitForm();

      expect(mockOnLogin).toHaveBeenCalledTimes(1);
      expect(mockOnLogin).toHaveBeenCalledWith("Customer");
    });

    it("should normalize the username (trim + lowercase) before registering", () => {
      renderSignup();
      fillForm({ username: "  AlicE  ", password: "password123", confirm: "password123" });
      submitForm();

      expect(mockSetExtraUsers).toHaveBeenCalledTimes(1);
      expect(extraUsers).toHaveProperty("alice");
      expect(extraUsers.alice).toEqual({ password: "password123", role: "Customer" });
    });

    it("should persist a session to localStorage with the default 'Customer' role on successful registration", () => {
      renderSignup();
      fillForm({ username: "charlie", password: "securePass1", confirm: "securePass1" });
      submitForm();

      const savedSession = JSON.parse(localStorage.getItem("rentech_session"));
      expect(savedSession).not.toBeNull();
      expect(savedSession.username).toBe("charlie");
      expect(savedSession.role).toBe("Customer");
      expect(savedSession.token).toBeDefined();
    });

    it("should clear any previous error message once registration succeeds", () => {
      renderSignup();

      fillForm({ username: "", password: "x", confirm: "x" });
      submitForm();
      expect(screen.getByText("Please fill in all fields")).toBeTruthy();

      fillForm({ username: "dana", password: "validPass1", confirm: "validPass1" });
      submitForm();

      expect(screen.queryByText("Please fill in all fields")).toBeNull();
      expect(mockOnLogin).toHaveBeenCalledWith("Customer");
    });
  });

  describe("Navigation & Utility Controls", () => {
    it("should call onBack when the back button is clicked", () => {
      renderSignup();
      const backButton = screen.getByRole("button", { name: /← back to home/i });
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it("should not render a back button when onBack is not provided", () => {
      renderSignup({ onBack: undefined });
      expect(screen.queryByRole("button", { name: /← back to home/i })).toBeNull();
    });

    it("should call onNavigateToLogin when the 'Sign In' link is clicked", () => {
      renderSignup();
      const signInLink = screen.getByRole("button", { name: /^sign in$/i });
      fireEvent.click(signInLink);

      expect(mockOnNavigateToLogin).toHaveBeenCalledTimes(1);
    });
  });
});