import { render, screen, fireEvent } from '@testing-library/react';
import SearchFieldRow2 from './SearchFieldRow2'; // adjust path if needed

describe('SearchFieldRow2', () => {
  const mockHandleChange = vi.fn();

  const baseProps = {
    formData: {
      lessonType: '',
      price: '',
      city: ''
    },
    formErrors: {},
    handleChange: mockHandleChange,
    instrumentOptions: ['Piano', 'Guitar'],
    cityOptions: ['Belfast', 'Dublin'],
    hasSearched: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  { /* Renders all 3 input fields */ }

  it('renders all 3 input fields', () => {
    render(<SearchFieldRow2 {...baseProps} />);

    expect(screen.getByLabelText(/Lesson Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Max Price/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Belfast/i)).toBeInTheDocument();
  });

  { /* City in put allows typing and handleChange is called on input change */ }

  it('allows typing in city input and triggers handleChange', () => {
    render(<SearchFieldRow2 {...baseProps} />);
    const cityInput = screen.getByPlaceholderText(/e\.g\. Belfast/i);

    fireEvent.change(cityInput, {
      target: { name: 'city', value: 'Belfast' }
    });

    expect(mockHandleChange).toHaveBeenCalledTimes(1);
    expect(mockHandleChange.mock.calls[0][0].target.name).toBe('city');
  });

  { /* Validation Error Messages Appear */ }

  it('shows validation errors when form has been submitted', () => {
    render(
      <SearchFieldRow2
        {...baseProps}
        hasSearched={true}
        formErrors={{ price: 'Invalid price', city: 'Invalid city' }}
      />
    );

    expect(screen.getByText(/Invalid price/i)).toBeInTheDocument();
    expect(screen.getByText(/Invalid city/i)).toBeInTheDocument();
  });
});