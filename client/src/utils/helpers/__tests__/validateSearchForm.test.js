import { describe, it, expect } from 'vitest';
import { validateSearchForm } from '../validateSearchForm';

const validInstruments = ['Piano', 'Guitar', 'Drums'];
const validCities = ['Belfast', 'London'];

describe('validateSearchForm', () => {
  it('returns no errors for valid input', () => {
    const formData = {
      tutorName: 'Sarah Palmer',
      price: '30',
      instrument: 'Piano',
      city: 'Belfast',
    };
    const errors = validateSearchForm(formData, validInstruments, validCities);
    expect(errors).toEqual({});
  });

  it('returns error for invalid tutor name', () => {
    const formData = { tutorName: 'Sarah123' };
    const errors = validateSearchForm(formData, validInstruments, validCities);
    expect(errors.tutorName).toBe("Name should only contain letters.");
  });

  it('returns error for non-numeric price', () => {
    const formData = { price: 'twenty' };
    const errors = validateSearchForm(formData, validInstruments, validCities);
    expect(errors.price).toBe("Price must be a number.");
  });

  it('returns error for invalid instrument', () => {
    const formData = { instrument: 'Banjo' };
    const errors = validateSearchForm(formData, validInstruments, validCities);
    expect(errors.instrument).toBe("Please select a valid instrument.");
  });

  it('returns error for invalid city', () => {
    const formData = { city: 'Mars' };
    const errors = validateSearchForm(formData, validInstruments, validCities);
    expect(errors.city).toBe("Please select a valid city from the list.");
  });

  it('can return multiple errors', () => {
    const formData = {
      tutorName: '123',
      price: 'NaN',
      instrument: 'Flute',
      city: 'Atlantis',
    };
    const errors = validateSearchForm(formData, validInstruments, validCities);
    expect(Object.keys(errors)).toHaveLength(4);
  });
});