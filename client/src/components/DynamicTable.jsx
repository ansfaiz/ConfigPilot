// columns: [{ key, label }]
// rows: array of record objects with .data JSONB + .id + .created_at
// onDelete: optional (id) => void

export default function DynamicTable({ columns = [], rows = [], onDelete }) {
  if (!Array.isArray(columns) || columns.length === 0) {
    return (
      <div style={{ color: 'var(--color-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
        No columns configured for this table.
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div style={{
        padding: '3rem 1rem', textAlign: 'center',
        border: '1px dashed var(--color-border)', borderRadius: 10
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>No records yet — submit the form to add one.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem'
      }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            {columns.map((col) => (
              <th key={col.key} style={{
                textAlign: 'left', padding: '0.6rem 0.8rem',
                color: 'var(--color-muted)', fontWeight: 600,
                fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                {col.label || col.key}
              </th>
            ))}
            <th style={{ width: 60 }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.1s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = ''}
            >
              {columns.map((col) => {
                const val = row.data?.[col.key];
                const display = val === undefined || val === null || val === ''
                  ? <span style={{ color: 'var(--color-border)' }}>—</span>
                  : typeof val === 'boolean'
                    ? <span style={{ color: val ? 'var(--color-success)' : 'var(--color-danger)' }}>{val ? 'Yes' : 'No'}</span>
                    : String(val);

                return (
                  <td key={col.key} style={{ padding: '0.65rem 0.8rem', color: 'var(--color-text)' }}>
                    {display}
                  </td>
                );
              })}
              <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>
                {onDelete && (
                  <button
                    className="btn btn-danger"
                    onClick={() => onDelete(row.id)}
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    title="Delete record"
                  >
                    ✕
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
