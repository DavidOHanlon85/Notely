import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SearchPage from "./SearchPage";

// Child chrome stubs 
vi.mock("../../components/UI/DoubleButtonNavBar", () => ({
  default: () => <div data-testid="nav">Nav</div>,
}));
vi.mock("../../components/UI/SocialsFooter", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));
vi.mock("../../components/SearchForm/SearchHero", () => ({
  default: () => <div data-testid="hero">Hero</div>,
}));
vi.mock("../../components/SearchForm/SearchFieldTopRow", () => ({
  default: () => <div data-testid="toprow">TopRow</div>,
}));
vi.mock("../../components/SearchForm/SearchFieldMoreFilters", () => ({
  default: () => <div data-testid="morefilters">MoreFilters</div>,
}));
vi.mock("../../components/SearchForm/SearchSortField", () => ({
  default: () => <div data-testid="sort">Sort</div>,
}));
vi.mock("../../components/SearchForm/TutorResultsGrid", () => ({
  default: ({ tutors = [] }) => (
    <div data-testid="grid">grid:{tutors.length}</div>
  ),
}));
// Provide our own Search button so we can trigger handleSearch reliably
vi.mock("../../components/SearchForm/SearchFormWrapper", () => ({
  default: ({ children, handleSearch }) => (
    <div data-testid="form">
      {children}
      <button onClick={handleSearch}>Search</button>
    </div>
  ),
}));
// Minimal pagination that calls setCurrentPage
vi.mock("../../components/SearchForm/Pagination", () => ({
  default: ({ currentPage, setCurrentPage }) => (
    <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
  ),
}));
// No-op submit button (wrapper supplies our Search trigger)
vi.mock("../../components/SearchForm/SearchSubmitButton", () => ({
  default: () => null,
}));

// ── Services + validation ─────────────────────────────────────────────────────
vi.mock("../../services/api/tutorServices", () => ({
  fetchDistinctFields: vi.fn(),
  fetchTutors: vi.fn(),
}));
vi.mock("../../utils/helpers/validateSearchForm", () => ({
  validateSearchForm: vi.fn(),
}));

import { fetchDistinctFields, fetchTutors } from "../../services/api/tutorServices";
import { validateSearchForm } from "../../utils/helpers/validateSearchForm";

describe("SearchPage (lean)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateSearchForm.mockReturnValue({}); // no client-side errors
    fetchDistinctFields.mockResolvedValue({
      instruments: [{ instrument: "Guitar", instrument_active: 1 }],
      cities: [{ city: "London" }],
    });
    fetchTutors.mockResolvedValue({
      tutors: [{ id: 1 }, { id: 2 }],
      totalTutors: 2,
    });
  });

  it("loads options, performs a search, renders results header/grid, and re-queries on pagination", async () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    // Options fetched on mount
    await waitFor(() => {
      expect(fetchDistinctFields).toHaveBeenCalledTimes(1);
    });

    // Trigger a search
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    // Results header shows total + grid receives tutors
    await screen.findByText(/2 tutors found/i);
    expect(screen.getByTestId("grid").textContent).toBe("grid:2");

    // Pagination triggers another fetch with updated page
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    // We don't assert exact call count (debounce can add calls); just verify refetch happened
    await waitFor(() => {
      expect(fetchTutors.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});