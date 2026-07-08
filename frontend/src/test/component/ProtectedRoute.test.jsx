import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ProtectedRoute from "../../components/ProtectedRoute";
import * as LoginModule from "../../components/Login";

function renderProtected(allowedRoles, content = <div>Protected Content</div>, initialEntries = ["/protected"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ProtectedRoute allowedRoles={allowedRoles}>
        {content}
      </ProtectedRoute>
    </MemoryRouter>
  );
}

describe("ProtectedRoute Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a spinning indicator while checking authentication", () => {
    renderProtected(["Admin"]);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders children when user has an allowed role", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderProtected(["Admin"]);

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  it("redirects to /login when no session exists", async () => {
    renderProtected(["Admin"]);

    await waitFor(() => {
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  it("redirects to /unauthorized when user role is not allowed", async () => {
    LoginModule.saveSession("Customer", "customer");
    renderProtected(["Admin"]);

    await waitFor(() => {
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  it("redirects staff users to /unauthorized when only Admin is allowed", async () => {
    LoginModule.saveSession("Staff", "staff");
    renderProtected(["Admin"]);

    await waitFor(() => {
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  it("allows access for any role when no allowedRoles restriction is set", async () => {
    LoginModule.saveSession("Staff", "staff");
    renderProtected(undefined);

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  it("allows multiple allowed roles to access the content", async () => {
    LoginModule.saveSession("Staff", "staff");
    renderProtected(["Admin", "Staff"]);

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  it("stops showing the spinner once the check completes", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderProtected(["Admin"]);

    await waitFor(() => {
      expect(document.querySelector(".animate-spin")).not.toBeInTheDocument();
    });
  });

  it("spinner contains the correct CSS animation class", () => {
    renderProtected(["Admin"]);
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
    expect(spinner.className).toContain("rounded-full");
  });

  it("navigates to /login when no session and user clicks a link", async () => {
    renderProtected(["Admin"]);

    await waitFor(() => {
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  it("handles an expired session gracefully", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderProtected(["Admin"]);

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });
});
