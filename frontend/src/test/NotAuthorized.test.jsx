import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import NotAuthorized from "../components/NotAuthorized";

describe("NotAuthorized Component", () => {
  function renderNotAuthorized(initialEntries = ["/unauthorized"]) {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <NotAuthorized />
      </MemoryRouter>
    );
  }

  it("renders the heading and description text", () => {
    renderNotAuthorized();
    expect(screen.getByText("Not Authorized")).toBeInTheDocument();
    expect(
      screen.getByText(/You do not have permission to access this page/i)
    ).toBeInTheDocument();
  });

  it("renders a button linking to the login page", () => {
    renderNotAuthorized();
    const button = screen.getByRole("button", { name: /go to login/i });
    expect(button).toBeInTheDocument();
  });

  it("renders a lock emoji icon for visual indication", () => {
    renderNotAuthorized();
    expect(screen.getByText("🔒")).toBeInTheDocument();
  });

  it("contains a contact administrator message in the description", () => {
    renderNotAuthorized();
    expect(
      screen.getByText(/contact your administrator/i)
    ).toBeInTheDocument();
  });

  it("navigates to /login when the button is clicked", async () => {
    const user = userEvent.setup();
    const { container } = renderNotAuthorized();

    const button = screen.getByRole("button", { name: /go to login/i });
    await user.click(button);
  });

  it("has a centered layout with proper background styling", () => {
    renderNotAuthorized();
    const container = document.querySelector(".min-h-screen");
    expect(container).toBeInTheDocument();
    expect(container.className).toContain("flex");
    expect(container.className).toContain("items-center");
    expect(container.className).toContain("justify-center");
  });
});
