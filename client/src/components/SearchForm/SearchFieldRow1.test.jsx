import { render, screen, fireEvent } from '@testing-library/react';
import SearchFieldRow1 from '../SearchForm/SearchFieldRow1';

describe('SearchFieldRow1', () => {
  const mockHandleChange = vi.fn();
  const baseProps = {
    formData: { instrument: '', level: '', tutorName: '' },
    formErrors: {},
    instrumentOptions: ['Piano', 'Guitar'],
    handleChange: mockHandleChange,
    hasSearched: false,
  };

  { /* All 3 fields render */ }

  it('renders instrument, level, and tutor name fields', () => {
    render(<SearchFieldRow1 {...baseProps} />);

    expect(screen.getByPlaceholderText(/e\.g\. Piano/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /All Levels/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Sarah Palmer/i)).toBeInTheDocument();
  });

  { /* Inputs call onChange */}

  it('calls handleChange on input', () => {
    render(<SearchFieldRow1 {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Sarah Palmer/i), {
      target: { name: 'tutorName', value: 'Test' },
    });

    expect(mockHandleChange).toHaveBeenCalledTimes(1);
  });

  { /* Validation error appears if name is invalid */ }

  it('shows validation error if tutorName is invalid and search attempted', () => {
    render(
      <SearchFieldRow1
        {...baseProps}
        formErrors={{ tutorName: 'Invalid name' }}
        hasSearched={true}
      />
    );

    expect(screen.getByText(/Invalid name/i)).toBeInTheDocument();
  });
});