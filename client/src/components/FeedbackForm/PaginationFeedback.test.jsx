import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PaginationFeedback from './PaginationFeedback';

// Small local helper so each test can render with minimal noise
function renderPagination(overrides = {}) {
  const defaultProps = {
    currentPage: 1,
    totalFeedback: 25,
    feedbackPerPage: 10,
    setCurrentPage: vi.fn(),
  };
  const props = { ...defaultProps, ...overrides };
  const utils = render(<PaginationFeedback {...props} />);
  return { ...utils, props };
}

describe('<PaginationFeedback />', () => {
  beforeEach(() => vi.clearAllMocks());

  // Renders nothing when only one page is needed
  it('returns null when total pages <= 1', () => {
    const { container } = renderPagination({
      totalFeedback: 5,
      feedbackPerPage: 10,
    });
    expect(container.firstChild).toBeNull();
  });

  // Renders the correct number of dots and shows only "next" on page 1
  it('renders page dots and next/prev arrows appropriately', () => {
    const { container } = renderPagination({
      currentPage: 1,
      totalFeedback: 42,     // 5 pages with perPage=10
      feedbackPerPage: 10,
    });

    const buttons = screen.getAllByRole('button'); // includes dots + next arrow
    const dots = Array.from(container.querySelectorAll('.notely-dot'));
    // There should be 5 dots
    expect(dots).toHaveLength(5);

    // On first page, there should be no "prev" arrow but there should be a "next" arrow
    // Total buttons = 5 dots + 1 next arrow
    expect(buttons.length).toBe(6);

    // Current page (1) should be marked active
    expect(dots[0].classList.contains('active')).toBe(true);
  });

  // Active indicator moves when currentPage changes via dot click
  it('invokes setCurrentPage when a dot is clicked', () => {
    const { container, props } = renderPagination({
      currentPage: 1,
      totalFeedback: 30, // 3 pages
      feedbackPerPage: 10,
    });

    const dots = Array.from(container.querySelectorAll('.notely-dot'));
    // Click page 3
    fireEvent.click(dots[2]);
    expect(props.setCurrentPage).toHaveBeenCalledWith(3);
  });

  // Next arrow increments page
  it('invokes setCurrentPage(current + 1) when next arrow is clicked', () => {
    const { props } = renderPagination({
      currentPage: 2,
      totalFeedback: 30, // 3 pages
      feedbackPerPage: 10,
    });

    // There are 3 dots + 1 prev + 1 next = 5 buttons total. Last button is next.
    const buttons = screen.getAllByRole('button');
    const next = buttons[buttons.length - 1];
    fireEvent.click(next);

    expect(props.setCurrentPage).toHaveBeenCalledWith(3);
  });

  // Prev arrow decrements page
  it('invokes setCurrentPage(current - 1) when prev arrow is clicked', () => {
    const { props } = renderPagination({
      currentPage: 3,
      totalFeedback: 30, // 3 pages
      feedbackPerPage: 10,
    });

    // Buttons: prev + 3 dots = 4 buttons (no next on last page)
    const buttons = screen.getAllByRole('button');
    const prev = buttons[0]; // first button should be prev arrow
    fireEvent.click(prev);

    expect(props.setCurrentPage).toHaveBeenCalledWith(2);
  });

  // Accepts numeric strings and still computes total pages correctly
  it('handles numeric string props for counts', () => {
    const { container } = renderPagination({
      totalFeedback: '20',
      feedbackPerPage: '10',
    });
    const dots = Array.from(container.querySelectorAll('.notely-dot'));
    expect(dots).toHaveLength(2); // 20/10 = 2 pages
  });
});