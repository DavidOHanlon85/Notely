import { render, screen, fireEvent } from '@testing-library/react';
import SearchFormWrapper from './SearchFormWrapper';
import SearchFieldRow1 from './SearchFieldRow1';
import SearchFieldRow2 from './SearchFieldRow2';
import SearchFieldRow3 from './SearchFieldRow3';
import SearchSortField from './SearchSortField';
import SearchSubmitButton from './SearchSubmitButton';
import React from 'react';
import { vi } from 'vitest';

describe('SearchForm integration', () => {
  const mockHandleSearch = vi.fn();
  const mockHandleChange = vi.fn();

  const baseProps = {
    formData: {
      instrument: '',
      level: '',
      tutorName: '',
      lessonType: '',
      price: '',
      city: '',
      qualified: '',
      gender: '',
      sen: '',
      dbs: '',
      sortBy: '',
    },
    formErrors: {},
    instrumentOptions: ['Piano', 'Guitar'],
    cityOptions: ['Belfast', 'Dublin'],
    handleChange: mockHandleChange,
    hasSearched: false,
  };

  beforeEach(() => {
    mockHandleSearch.mockClear();
    mockHandleChange.mockClear();
  });

  { /* Form Integration Test */ }

  it('renders form and triggers handleSearch on submit', () => {
    render(
      <SearchFormWrapper handleSearch={mockHandleSearch}>
        <SearchFieldRow1 {...baseProps} />
        <SearchFieldRow2 {...baseProps} />
        <SearchFieldRow3 {...baseProps} />
        <SearchSortField formData={baseProps.formData} handleChange={mockHandleChange} />
        <SearchSubmitButton />
      </SearchFormWrapper>
    );

    // Fill in name input
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Sarah Palmer/i), {
      target: { name: 'tutorName', value: 'Sarah' },
    });

    // Select a lesson type
    fireEvent.change(screen.getByLabelText(/Lesson Type/i), {
      target: { name: 'lessonType', value: 'Online' },
    });

    // Choose sort option
    fireEvent.change(screen.getByLabelText(/Sort By/i), {
      target: { name: 'sortBy', value: 'priceLowHigh' },
    });

    // Click Search button
    fireEvent.click(screen.getByRole('button', { name: /Find Your Teacher!/i }));

    expect(mockHandleSearch).toHaveBeenCalledTimes(1);
  });
});