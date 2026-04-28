import { useMemo, useState } from 'react';

// fields: [{ name, label, type, required, placeholder, options }]
// type can be: text, email, number, textarea, select, checkbox

export default function DynamicForm({ fields = [], onSubmit, onValidationError, loading, submitLabel = 'Submit' }) {
  const normalizedFields = useMemo(
    () => fields.filter((field) => field?.name).map((field) => ({
      ...field,
      label: field.label || field.name,
      type: field.type || 'text',
    })),
    [fields]
  );

  const [values, setValues] = useState(() =>
    normalizedFields.reduce((acc, field) => {
      acc[field.name] = field.type === 'checkbox' ? false : '';
      return acc;
    }, {})
  );
  const [errors, setErrors] = useState({});

  if (normalizedFields.length === 0) {
    return (
      <div className="empty-message">
        No fields configured for this form.
      </div>
    );
  }

  function validate() {
    const errs = {};
    normalizedFields.forEach((f) => {
      if (f.required && !values[f.name] && values[f.name] !== false) {
        errs[f.name] = `${f.label || f.name} is required`;
      }
    });
    return errs;
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setValues((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      onValidationError?.(errs);
      return;
    }
    onSubmit?.(values);
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      {normalizedFields.map((field) => (
        <div key={field.name} className={field.type === 'checkbox' ? 'field-row field-row-full' : 'field-row'}>
          {field.type !== 'checkbox' && (
            <label className="label" htmlFor={`field-${field.name}`}>
              {field.label || field.name}
              {field.required && <span style={{ color: 'var(--color-danger)', marginLeft: 3 }}>*</span>}
            </label>
          )}

          {field.type === 'textarea' ? (
            <textarea
              id={`field-${field.name}`}
              className="input"
              name={field.name}
              value={values[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder || ''}
              rows={4}
              style={{ resize: 'vertical', minHeight: 112 }}
            />
          ) : field.type === 'select' ? (
            <select
              id={`field-${field.name}`}
              className="input"
              name={field.name}
              value={values[field.name]}
              onChange={handleChange}
            >
              <option value="">-- Select --</option>
              {(field.options || []).map((opt) => (
                <option key={opt.value ?? opt} value={opt.value ?? opt}>
                  {opt.label ?? opt}
                </option>
              ))}
            </select>
          ) : field.type === 'checkbox' ? (
            <label className="checkbox-row">
              <input
                id={`field-${field.name}`}
                type="checkbox"
                name={field.name}
                checked={!!values[field.name]}
                onChange={handleChange}
              />
              <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{field.label || field.name}</span>
            </label>
          ) : (
            <input
              id={`field-${field.name}`}
              className="input"
              type={field.type || 'text'}
              name={field.name}
              value={values[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder || ''}
              required={field.required}
            />
          )}

          {errors[field.name] && <span className="field-error">{errors[field.name]}</span>}
        </div>
      ))}

      <button
        id="dynamic-form-submit"
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{ alignSelf: 'flex-start', minWidth: 170 }}
      >
        {loading ? (
          <>
            <span className="spinner spinner-sm" />
            Saving...
          </>
        ) : submitLabel}
      </button>
    </form>
  );
}
