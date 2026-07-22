import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import Signup from "../../components/SignUp.jsx";

describe("RenTech Sign Up Test Suite", () => {
  const mockOnLogin = vi.fn();
  const mockOnBack = vi.fn();
  const mockOnNavigateToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
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

  const submitForm = async () => {
    const btn = await screen.findByRole("button", { name: /register/i });
    fireEvent.submit(btn.closest("form"));
    await waitFor(() => {});
  };

  const mockApi = (status, json) => {
    global.fetch.mockResolvedValue({
      ok: status < 400,
      json: vi.fn().mockResolvedValue(json),
    });
  };

  describe("Required Field Validation", () => {
    it("should display 'Please fill in all fields' if the username is left empty", async () => {
      renderSignup();
      fillForm({ username: "", password: "password123", confirm: "password123" });
      await submitForm();

      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(screen.getByText("Please fill in all fields")).toBeTruthy();
    });

    it("should display 'Please fill in all fields' if the password is left empty", async () => {
      renderSignup();
      fillForm({ username: "newuser", password: "", confirm: "password123" });
      await submitForm();

      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(screen.getByText("Please fill in all fields")).toBeTruthy();
    });

    it("should display 'Please fill in all fields' if the confirm password is left empty", async () => {
      renderSignup();
      fillForm({ username: "newuser", password: "password123", confirm: "" });
      await submitForm();

      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(screen.getByText("Please fill in all fields")).toBeTruthy();
    });

    it("should display 'Passwords do not match' if password and confirm password differ", async () => {
      renderSignup();
      fillForm({
        username: "bob",
        password: "password123",
        confirm: "differentPassword",
      });
      await submitForm();

      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(screen.getByText("Passwords do not match")).toBeTruthy();
    });

    it("should show server error if signup fails", async () => {
      mockApi(400, { success: false, message: 'Username already exists' });
      renderSignup();
      fillForm({ username: "admin", password: "admin", confirm: "admin" });
      await submitForm();

      await waitFor(() => {
        expect(screen.getByText("Username already exists")).toBeTruthy();
      });
      expect(mockOnLogin).not.toHaveBeenCalled();
    });
  });

  describe("Successful Registration & Default Role Assignment", () => {
    it("should register a new user successfully and assign the default 'Customer' role", async () => {
      mockApi(201, { success: true, data: { username: 'alice', role: 'Customer' } });
      renderSignup();
      fillForm({ username: "alice", password: "password123", confirm: "password123" });
      await submitForm();

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledTimes(1);
        expect(mockOnLogin).toHaveBeenCalledWith("Customer");
      });
    });

    it("should normalize the username (trim + lowercase) before calling the API", async () => {
      let sentBody;
      global.fetch.mockImplementation(async (url, opts) => {
        sentBody = JSON.parse(opts.body);
        return { ok: true, json: vi.fn().mockResolvedValue({ success: true, data: { username: 'alice', role: 'Customer' } }) };
      });
      renderSignup();
      fillForm({ username: "  AlicE  ", password: "password123", confirm: "password123" });
      await submitForm();

      await waitFor(() => {
        expect(sentBody.username).toBe('alice');
        expect(mockOnLogin).toHaveBeenCalledWith("Customer");
      });
    });

    it("should persist a session to localStorage with the default 'Customer' role on successful registration", async () => {
      mockApi(201, { success: true, data: { username: 'charlie', role: 'Customer' } });
      renderSignup();
      fillForm({ username: "charlie", password: "securePass1", confirm: "securePass1" });
      await submitForm();

      await waitFor(() => {
        const savedSession = JSON.parse(localStorage.getItem("rentech_session"));
        expect(savedSession).not.toBeNull();
        expect(savedSession.username).toBe("charlie");
        expect(savedSession.role).toBe("Customer");
        expect(savedSession.token).toBeDefined();
      });
    });

    it("should clear any previous error message once registration succeeds", async () => {
      mockApi(400, { success: false, message: 'Username already exists' });
      renderSignup();

      fillForm({ username: "admin", password: "x", confirm: "x" });
      await submitForm();
      await waitFor(() => {
        expect(screen.getByText("Username already exists")).toBeTruthy();
      });

      mockApi(201, { success: true, data: { username: 'dana', role: 'Customer' } });
      fillForm({ username: "dana", password: "validPass1", confirm: "validPass1" });
      await submitForm();

      await waitFor(() => {
        expect(screen.queryByText("Username already exists")).toBeNull();
        expect(mockOnLogin).toHaveBeenCalledWith("Customer");
      });
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
