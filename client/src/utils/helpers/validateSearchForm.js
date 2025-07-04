{
    /* Client Side Validation */
}

export function validateSearchForm(formData, instrumentOptions, cityOptions) {
    const errors = {};
  
    if (formData.tutorName && !/^[a-zA-Z\s]+$/.test(formData.tutorName)) {
      errors.tutorName = "Name should only contain letters.";
    }
  
    if (formData.price && isNaN(Number(formData.price))) {
      errors.price = "Price must be a number.";
    }
  
    if (
      formData.instrument &&
      !instrumentOptions.includes(formData.instrument)
    ) {
      errors.instrument = "Please select a valid instrument.";
    }
  
    if (formData.city && !cityOptions.includes(formData.city)) {
      errors.city = "Please select a valid city from the list.";
    }
  
    return errors;
  }