import { render, screen, fireEvent } from '@testing-library/react';
import SearchFieldRow3 from '../SearchForm/SearchFieldRow3';
import React from 'react';
import { vi } from 'vitest';

describe('SearchFieldRow3', () => {
  const mockHandleChange = vi.fn();
  const baseProps = {
    formData: {
      qualified: '',
      gender: '',
      sen: '',
      dbs: '',
    },
    handleChange: mockHandleChange,
  };

  beforeEach(() => {
    mockHandleChange.mockClear();
  });

  { /* Renders all inputs */ }

  it('renders all 4 select inputs', () => {
    render(<SearchFieldRow3 {...baseProps} />);

    expect(screen.getByLabelText(/Qualified Teacher/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tutor Gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/SEN Trained/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/DBS Certified/i)).toBeInTheDocument();
  });

  { /* Fire change events and confirm handleChange is called - qualified */}

  it('calls handleChange when selecting qualified', () => {
    const updatedFormData = { ...baseProps.formData, qualified: '1' };
  
    render(
      <SearchFieldRow3
        {...baseProps}
        formData={updatedFormData}
      />
    );
  
    const select = screen.getByLabelText(/Qualified Teacher/i);
  
    fireEvent.change(select, {
      target: { name: 'qualified', value: '1' },
    });
  
    expect(mockHandleChange).toHaveBeenCalledTimes(1);
  
    const event = mockHandleChange.mock.calls[0][0];
    expect(event.target.name).toBe('qualified');
    expect(event.target.value).toBe('1');
  });

  { /* Fire change events and confirm handleChange is called - gender */}

  it('calls handleChange when selecting gender', () => {
    const updatedFormData = { ...baseProps.formData, gender: 'female' };
  
    render(
      <SearchFieldRow3
        {...baseProps}
        formData={updatedFormData}
      />
    );
  
    const select = screen.getByLabelText(/Tutor Gender/i);
    fireEvent.change(select, { target: { name: 'gender', value: 'female' } });
  
    expect(mockHandleChange).toHaveBeenCalledTimes(1);
  
    const event = mockHandleChange.mock.calls[0][0];
    expect(event.target.name).toBe('gender');
    expect(event.target.value).toBe('female');
  });

  { /* Fire change events and confirm handleChange is called - SEN */}

  it('calls handleChange when selecting SEN', () => {
    const updatedFormData = { ...baseProps.formData, sen: '1' };
  
    render(
      <SearchFieldRow3
        {...baseProps}
        formData={updatedFormData}
      />
    );

    const select = screen.getByLabelText(/SEN Trained/i);
    fireEvent.change(select, { target: { name: 'sen', value: '1' } });

    expect(mockHandleChange).toHaveBeenCalledTimes(1);

    const event = mockHandleChange.mock.calls[0][0];
    expect(event.target.name).toBe('sen');
    expect(event.target.value).toBe('1');
  });

  { /* Fire change events and confirm handleChange is called - DBS */}

  it('calls handleChange when selecting DBS', () => {
    const updatedFormData = { ...baseProps.formData, dbs: '1' };
  
    render(
      <SearchFieldRow3
        {...baseProps}
        formData={updatedFormData}
      />
    );

    const select = screen.getByLabelText(/DBS Certified/i);
    fireEvent.change(select, { target: { name: 'dbs', value: '1' } });

    expect(mockHandleChange).toHaveBeenCalledTimes(1);
    const event = mockHandleChange.mock.calls[0][0];
    expect(event.target.name).toBe('dbs');
    expect(event.target.value).toBe('1');
  });


});