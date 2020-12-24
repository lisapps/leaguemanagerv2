import { useState, useEffect } from "react";

const useForm = (callback, validate) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // As a side effect of the value of errors changing, check if the errors object contains any keys (if it’s empty) and if so, call the callback (submit form) function.
  useEffect(() => {
    
    if (Object.keys(errors).length === 0 && isSubmitting) {
      callback();
    }

  }, [errors]);

  const initVals = (vals) => {
    Object.keys(vals).forEach((key) => {
      setValues((values) => ({
        ...values,
        [key]: vals[key],
      }));
    });
  };

  const handleClear = (fName) => {
    setValues((values) => ({
      ...values,
      [fName]: "",
    }));
  };

  const handleChange = (event) => {
    
    event.persist && event.persist();

    setIsSubmitting(false);

    let n = event.target.name;
    let newErrState = errors;

    delete newErrState[n];
    
    setErrors(newErrState);

    setValues((values) => ({
      ...values,
      [event.target.name]: event.target.value,
    }));
    
  };

  const handleDDChange = (n, val) => {

    setIsSubmitting(false);
    var errs = errors;

    delete errs[n];

    setValues((values) => ({
      ...values,
      [n]: val,
    }));

  };

  const handleSubmit = (event) => {
    if (event) event.preventDefault();
    setErrors(validate(values));
    setIsSubmitting(true);
  };

  const resetForm = () => {
    setValues({});
    setErrors({});
  };

  return {
    handleChange,
    handleDDChange,
    handleSubmit,
    values,
    setValues,
    errors,
    resetForm,
    initVals,
    handleClear,
  };
};

export default useForm;
