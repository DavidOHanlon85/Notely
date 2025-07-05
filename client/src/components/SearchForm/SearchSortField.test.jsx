import { render, screen, fireEvent } from '@testing-library/react';
import SearchSortField from '../SearchForm/SearchSortField';
import React from 'react';
import { vi } from 'vitest';

describe('SearchSortField', () => {
  const mockHandleChange = vi.fn();
  const baseProps = {
    formData: {
      sortBy: '',
    },
    handleChange: mockHandleChange,
  };

  beforeEach(() => {
    mockHandleChange.mockClear();
  });

  { /* Render sort select input */ }

  it('renders the sort select input', () => {
    render(<SearchSortField {...baseProps} />);
    expect(screen.getByLabelText(/Sort By/i)).toBeInTheDocument();
  });

  { /* Renders all implemented sort options */ }

  it('renders all implemented sort options', () => {
    render(<SearchSortField {...baseProps} />);
    expect(screen.getByRole('option', { name: 'Recommended' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Price: Low to High' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Price: High to Low' })).toBeInTheDocument();
  });

  { /* Calls handleChange when sort option is selected */ }

  it('calls handleChange when sort option is selected', () => {
    const updatedProps = {
      ...baseProps,
      formData: {
        ...baseProps.formData,
        sortBy: 'priceLowHigh',
      },
    };
  
    render(<SearchSortField {...updatedProps} />);
  
    const select = screen.getByLabelText(/Sort By/i);
  
    fireEvent.change(select, {
      target: { name: 'sortBy', value: 'priceLowHigh' },
    });
  
    expect(mockHandleChange).toHaveBeenCalledTimes(1);
  
    const event = mockHandleChange.mock.calls[0][0];
    expect(event.target.name).toBe('sortBy');
    expect(event.target.value).toBe('priceLowHigh');
  });
});