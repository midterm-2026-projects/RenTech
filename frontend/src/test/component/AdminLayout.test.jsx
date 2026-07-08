import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import AdminLayout from "../../pages/AdminLayout";
import * as LoginModule from "../../components/Login";

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
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
  });

  it("renders the Admin Dashboard heading after passing role check", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });
  });

  it("embeds the Analytics Dashboard component for admin users", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.getByText("Revenue Trends")).toBeInTheDocument();
      expect(screen.getByText("Demand Forecasting (SMA)")).toBeInTheDocument();
    });
  });

  it("embeds the AI Business Insights component with data", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.getByText("Generative AI Business Insights")).toBeInTheDocument();
      expect(
        screen.getByText("Rental demand for winter coats is up 20% this week.")
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Bundle evening gowns with matching jewelry for a 10% discount."
        )
      ).toBeInTheDocument();
    });
  });

  it("renders the Sidebar component for admin users", async () => {
    LoginModule.saveSession("Admin", "admin");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
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
      expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();
      expect(screen.queryByText("Revenue Trends")).not.toBeInTheDocument();
    });
  });

  it("does not render admin content for staff users", async () => {
    LoginModule.saveSession("Staff", "staff");
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();
      expect(screen.queryByText("Revenue Trends")).not.toBeInTheDocument();
    });
  });

  it("does not render admin content when no session exists", async () => {
    renderAdminLayout();

    await waitFor(() => {
      expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();
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
});
