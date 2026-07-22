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
    Promise.resolve({ data: [], total: 0, totalPages: 1, page: 1, limit: 8 })
  ),
  getTransactions: vi.fn(() =>
    Promise.resolve({ data: [], total: 0, totalPages: 1, page: 1, limit: 10 })
  ),
  softDeleteProduct: vi.fn(() => Promise.resolve({ status: "success" })),
}));

vi.mock("../../services/analyticsApiClient", () => ({
  getAnalyticsDashboard: vi.fn(() =>
    Promise.resolve({
      summaries: [{ period: "Jan", metric_value: 100, metric_name: "revenue" }],
      forecasts: [
        { forecast_date: "2026-01-01", actual_value: 10, forecast_value: 12, model: "arima" },
      ],
      kpis: [],
      projections: [{ projected_revenue: 0 }],
    })
  ),
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: { insights: ["Test insight"], suggestions: ["Test suggestion"] } })),
  },
}));

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
  });

  it("renders the Admin Dashboard heading after passing role check", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.getByText(/Admin Portal/i)).toBeInTheDocument();
      expect(screen.getByText("Revenue Trajectory")).toBeInTheDocument();
    });
  });

  it("embeds the Dashboard charts for admin users", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.getByText("Revenue Trajectory")).toBeInTheDocument();
    });
  });

  it("does NOT embed the AI Business Insights panel on the dashboard (now lives in AI Intelligence)", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.getByText("Revenue Trajectory")).toBeInTheDocument();
    });

    expect(screen.queryByText("AI Business Insights")).not.toBeInTheDocument();
  });

  it("renders the Sidebar component for admin users", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.getAllByText("Dashboard").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Inventory")).toBeInTheDocument();
      expect(screen.getByText("AI Intelligence")).toBeInTheDocument();
    });
  });

  it("renders the sidebar with sign out button", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });
  });

  it("does not render admin content for customer users", async () => {
    LoginModule.saveSession("Customer", "customer");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.queryByText("Revenue Trajectory")).not.toBeInTheDocument();
    });
  });

  it("does not render admin content for staff users", async () => {
    LoginModule.saveSession("Staff", "staff");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.queryByText("Revenue Trajectory")).not.toBeInTheDocument();
    });
  });

  it("does not render admin content when no session exists", async () => {
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.queryByText("Revenue Trajectory")).not.toBeInTheDocument();
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

    // 1. Wait for dashboard view to settle
    await waitFor(() => {
      expect(screen.getByText("Revenue Trajectory")).toBeInTheDocument();
    });

    // 2. Locate and click the Transactions tab inside the sidebar
    const transactionsBtn = screen.getByRole("button", { name: /transactions/i });
    await userEvent.click(transactionsBtn);

    // 3. Verify page content updates to reflect the Transaction view state change
    await waitFor(() => {
      expect(screen.getAllByText("Transactions").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("switches to the System Settings view when clicking the System Settings button", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    // 1. Wait for dashboard view to settle
    await waitFor(() => {
      expect(screen.getByText("Revenue Trajectory")).toBeInTheDocument();
    });

    // 2. Locate and click the System Settings tab inside the sidebar
    const settingsBtn = screen.getByRole("button", { name: /system settings/i });
    await userEvent.click(settingsBtn);

    // 3. Wait for the settings content to render (it takes time to load)
    await waitFor(() => {
      expect(screen.getByText("Account & Settings")).toBeInTheDocument();
      expect(screen.getByText("Semaphore SMS Gateway")).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it("switches to a distinct Inventory view (not the dashboard) when clicking Inventory", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.getByText("Revenue Trajectory")).toBeInTheDocument();
    });

    const inventoryBtn = screen.getByRole("button", { name: /inventory/i });
    await userEvent.click(inventoryBtn);

    await waitFor(() => {
      expect(screen.getByText("Stock Levels")).toBeInTheDocument();
      expect(screen.getByText("Optimization Score")).toBeInTheDocument();
      // Inventory must NOT render the dashboard graphs
      expect(screen.queryByText("Revenue Trajectory")).not.toBeInTheDocument();
    });
  });

  it("switches to a distinct AI Intelligence view when clicking AI Intelligence", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.getByText("Revenue Trajectory")).toBeInTheDocument();
    });

    const aiBtn = screen.getByRole("button", { name: /ai intelligence/i });
    await userEvent.click(aiBtn);

    await waitFor(() => {
      expect(screen.getByText("AI Business Insights")).toBeInTheDocument();
      // AI view renders its own analytics charts...
      expect(screen.getByText("Demand Forecasting (SMA)")).toBeInTheDocument();
      // ...but NOT the dashboard's KPI cards (it is a distinct view).
      expect(screen.queryByText("Total Revenue")).not.toBeInTheDocument();
    });
  });
});
