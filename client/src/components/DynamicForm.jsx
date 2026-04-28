import { useState } from 'react';

// fields: [{ name, label, type, required, placeholder, options }]
// type can be: text, email, number, textarea, select, checkbox

export default function DynamicForm({ fields = [], onSubmit, loading, submitLabel = 'Submit' }) {
  const [values, setValues] = useState(() =>
    fields.reduce((acc, f) => {
      acc[f.name] = f.type === 'checkbox' ? false : '';
      return acc;
    }, {})
  );
  const [errors, setErrors] = useState({});

  if (!Array.isArray(fields) || fields.length === 0) {
    return (
      <div style={{ color: 'var(--color-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
        No fields configured for this form.
      </div>
    );
  }

  function validate() {
    const errs = {};
    fields.forEach((f) => {
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
      return;
    }
    onSubmit?.(values);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {fields.map((field) => (
        <div key={field.name}>
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
              style={{ resize: 'vertical' }}
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                id={`field-${field.name}`}
                type="checkbox"
                name={field.name}
                checked={!!values[field.name]}
                onChange={handleChange}
                style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }}
              />
              <span style={{ color: 'var(--color-text)' }}>{field.label || field.name}</span>
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

          {errors[field.name] && (
            <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              {errors[field.name]}
            </span>
          )}
        </div>
      ))}

      <button
        id="dynamic-form-submit"
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{ alignSelf: 'flex-start', minWidth: 100 }}
      >
        {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : submitLabel}
      </button>
    </form>
  );
}
