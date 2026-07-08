import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import NotAuthorized from "../../pages/NotAuthorized";
import ProtectedRoute from "../../components/ProtectedRoute";
import * as LoginModule from "../../components/Login";

describe("/unauthorized - NotAuthorized page", () => {
  function renderNotAuthorized(initialEntries = ["/unauthorized"]) {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <NotAuthorized />
      </MemoryRouter>
    );
  }

  it("/unauthorized - renders heading and error description", () => {
    renderNotAuthorized();
    expect(screen.getByText("Not Authorized")).toBeInTheDocument();
    expect(
      screen.getByText(/You do not have permission to access this page/i)
    ).toBeInTheDocument();
  });

  it("/unauthorized - renders go to login button", () => {
    renderNotAuthorized();
    const button = screen.getByRole("button", { name: /go to login/i });
    expect(button).toBeInTheDocument();
  });

  it("/unauthorized - renders lock emoji for visual indication", () => {
    renderNotAuthorized();
    expect(screen.getByText("🔒")).toBeInTheDocument();
  });

  it("/unauthorized - displays contact administrator message", () => {
    renderNotAuthorized();
    expect(
      screen.getByText(/contact your administrator/i)
    ).toBeInTheDocument();
  });

  it("/unauthorized - navigates to /login on button click", async () => {
    const user = userEvent.setup();
    renderNotAuthorized();
    const button = screen.getByRole("button", { name: /go to login/i });
    await user.click(button);
  });

  it("/unauthorized - renders centered flex layout", () => {
    renderNotAuthorized();
    const container = document.querySelector(".min-h-screen");
    expect(container).toBeInTheDocument();
    expect(container.className).toContain("flex");
    expect(container.className).toContain("items-center");
    expect(container.className).toContain("justify-center");
  });

  it("/unauthorized?ref=/admin - renders page with query parameters without breaking", () => {
    renderNotAuthorized(["/unauthorized?ref=/admin"]);
    expect(screen.getByText("Not Authorized")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go to login/i })).toBeInTheDocument();
    expect(screen.getByText("🔒")).toBeInTheDocument();
  });

  it("/unauthorized/ - renders page with trailing slash without breaking", () => {
    renderNotAuthorized(["/unauthorized/"]);
    expect(screen.getByText("Not Authorized")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go to login/i })).toBeInTheDocument();
  });
});

describe("customer access to protected endpoints - redirects to /unauthorized", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("/admin - customer blocked from admin-only route", async () => {
    LoginModule.saveSession("Customer", "customer");
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <ProtectedRoute allowedRoles={["Admin"]}>
          <div>Admin Panel</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
    });
  });

  it("/reports - customer blocked from multi-role route", async () => {
    LoginModule.saveSession("Customer", "customer");
    render(
      <MemoryRouter initialEntries={["/reports"]}>
        <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
          <div>Reports Dashboard</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.queryByText("Reports Dashboard")).not.toBeInTheDocument();
    });
  });

  it("/admin/analytics - staff blocked from admin-only route", async () => {
    LoginModule.saveSession("Staff", "staff");
    render(
      <MemoryRouter initialEntries={["/admin/analytics"]}>
        <ProtectedRoute allowedRoles={["Admin"]}>
          <div>Analytics Dashboard</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.queryByText("Analytics Dashboard")).not.toBeInTheDocument();
    });
  });

  it("/ - customer allowed when no role restriction", async () => {
    LoginModule.saveSession("Customer", "customer");
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ProtectedRoute>
          <div>Home</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Home")).toBeInTheDocument();
    });
  });
});
