import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import AdminLayout from "../../pages/AdminLayout";
import * as LoginModule from "../../components/Login";

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
  };
});

vi.mock("../../services/inventoryApiClient", () => ({
  getProducts: vi.fn(() =>
    Promise.resolve({ total: 1, data: [{ id: 1, name: "Test Product", status: "Available" }] })
  ),
  getTransactions: vi.fn(() =>
    Promise.resolve({ data: [{ id: "TX-001", username: "ana rivera", itemName: "Vintage Gatsby Sequin Dress", date: "May 01, 2026", totalCost: 1500, status: "Active" }] })
  ),
  softDeleteProduct: vi.fn(() => Promise.resolve({ status: "success" })),
  updateTransactionStatus: vi.fn(() => Promise.resolve({ status: "success" })),
}));

vi.mock("../../services/analyticsApiClient", () => {
  const api = {
    get: vi.fn((path) => {
      if (path === '/api/analytics/kpis') {
        return Promise.resolve({ data: [] });
      }
      if (path === '/api/analytics/summaries') {
        return Promise.resolve({ data: [{ period: 'Jan', metric_name: 'revenue', metric_value: 100 }] });
      }
      if (path === '/api/analytics/forecasts') {
        return Promise.resolve({ data: [{ forecast_date: '2026-01-01', actual_value: 10, forecast_value: 12 }] });
      }
      if (path === '/api/analytics/revenue-projections') {
        return Promise.resolve({ data: [{ projected_revenue: 0 }] });
      }
      return Promise.resolve({ data: [] });
    }),
    post: vi.fn(() =>
      Promise.resolve({
        data: {
          insights: [
            'Rental demand for winter coats is up 20% this week.',
            'Bundle evening gowns with matching jewelry for a 10% discount.',
          ],
          suggestions: ['Test suggestion'],
        },
      })
    ),
  };

  return {
    getAnalyticsDashboard: vi.fn(() =>
      Promise.resolve({
        summaries: [{ period: 'Jan', metric_name: 'revenue', metric_value: 100 }],
        forecasts: [
          { forecast_date: '2026-01-01', actual_value: 10, forecast_value: 12 },
        ],
        kpis: [],
        projections: [{ projected_revenue: 0 }],
      })
    ),
    default: api,
  };
});

function renderAdminLayout() {
  return render(
    <MemoryRouter>
      <AdminLayout />
    </MemoryRouter>
  );
}

describe("AdminLayout Component (Integration)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("renders the Admin Dashboard heading after passing role check", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    expect(await screen.findByText(/Admin Portal/i)).toBeInTheDocument();
  });

  it("embeds the Analytics Dashboard component for admin users", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    expect(await screen.findByText("Total Revenue")).toBeInTheDocument();
    expect(await screen.findByText("Revenue Trajectory")).toBeInTheDocument();
  });

  it("embeds the AI Business Insights component with data", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    expect(await screen.findByText("Total Revenue")).toBeInTheDocument();
    expect(screen.queryByText("AI Business Insights")).not.toBeInTheDocument();
  });

  it("does NOT embed the AI Business Insights panel on the dashboard (now lives in AI Intelligence)", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    expect(await screen.findByText("Total Revenue")).toBeInTheDocument();
    expect(screen.queryByText("AI Business Insights")).not.toBeInTheDocument();
  });

  it("renders the Sidebar component for admin users", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    const dashboardElements = await screen.findAllByText("Dashboard");
    expect(dashboardElements.length).toBeGreaterThanOrEqual(1);

    expect(await screen.findByText("Inventory")).toBeInTheDocument();
    expect(await screen.findByText("AI Intelligence")).toBeInTheDocument();
  });

  it("renders the sidebar with sign out button", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    expect(await screen.findByText("Sign Out")).toBeInTheDocument();
  });

  it("does not render admin content for customer users", async () => {
    LoginModule.saveSession("Customer", "customer");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.queryByText(/Admin Portal/i)).not.toBeInTheDocument();
      expect(screen.queryByText("Revenue Trends")).not.toBeInTheDocument();
    });
  });

  it("does not render admin content for staff users", async () => {
    LoginModule.saveSession("Staff", "staff");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.queryByText(/Admin Portal/i)).not.toBeInTheDocument();
      expect(screen.queryByText("Revenue Trends")).not.toBeInTheDocument();
    });
  });

  it("does not render admin content when no session exists", async () => {
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.queryByText(/Admin Portal/i)).not.toBeInTheDocument();
      expect(screen.queryByText("Revenue Trends")).not.toBeInTheDocument();
    });
  });

  it("shows the loading spinner during role check before rendering content", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();

    await waitFor(() => {
      expect(document.querySelector(".animate-spin")).not.toBeInTheDocument();
    });
  });

  it("has a flex layout with sidebar on the left", async () => {
    LoginModule.saveSession("Admin", "admin");
    const { container } = renderAdminLayout();

    await waitFor(() => {
      const flexContainer = container.querySelector(".flex");
      expect(flexContainer).toBeInTheDocument();
    });
  });

  it("renders the admin profile section in the sidebar", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.getAllByText("Admin").length).toBeGreaterThanOrEqual(1);
    });
  });

  /* ========================================================================
     NEW INTERACTION & BEHAVIOR TESTS FOR TRANSACTIONS & SYSTEM SETTINGS
     ======================================================================== */

  it("switches to the Transaction Dashboard view when clicking the Transactions button", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    expect(await screen.findByText("Total Revenue")).toBeInTheDocument();

    const transactionsBtn = await screen.findByRole("button", { name: /transactions/i });
    await userEvent.click(transactionsBtn);

    expect(await screen.findByRole("heading", { name: /records/i })).toBeInTheDocument();
  });

  it("switches to the System Settings view when clicking the System Settings button", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    expect(await screen.findByText("Total Revenue")).toBeInTheDocument();

    const settingsBtn = await screen.findByRole("button", { name: /settings|system settings/i });
    await userEvent.click(settingsBtn);

    expect(await screen.findByRole("heading", { name: /system settings/i })).toBeInTheDocument();
  });

  it("switches to a distinct Inventory view (not the dashboard) when clicking Inventory", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    expect(await screen.findByText("Total Revenue")).toBeInTheDocument();

    const inventoryBtn = await screen.findByRole("button", { name: /inventory/i });
    await userEvent.click(inventoryBtn);

    await waitFor(() => {
      expect(screen.getByText("Stock Levels")).toBeInTheDocument();
      expect(screen.queryByText("Total Revenue")).not.toBeInTheDocument();
    });
  });

  it("switches to a distinct AI Intelligence view when clicking AI Intelligence", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    expect(await screen.findByText("Total Revenue")).toBeInTheDocument();

    const aiBtn = await screen.findByRole("button", { name: /ai intelligence/i });
    await userEvent.click(aiBtn);

    await waitFor(() => {
      expect(screen.getAllByText("AI Intelligence").length).toBeGreaterThanOrEqual(2);
      expect(screen.queryByText("Total Revenue")).not.toBeInTheDocument();
    });
  });
});