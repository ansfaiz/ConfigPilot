import { useMemo, useState } from 'react';

export default function DynamicTable({ columns = [], rows = [], onDelete, loading }) {
  const [query, setQuery] = useState('');

  const filteredRows = useMemo(() => {
    if (!query.trim()) return rows;
    const term = query.trim().toLowerCase();
    return rows.filter((row) => columns.some((col) => String(row.data?.[col.key] ?? '').toLowerCase().includes(term)));
  }, [rows, columns, query]);

  if (!Array.isArray(columns) || columns.length === 0) {
    return (
      <div className="empty-message">
        No columns configured for this table.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="table-loading-wrap">
        <span className="spinner" />
        <p>Loading records...</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="empty-table-state">
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>No records yet — submit the form to add one.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="table-toolbar">
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search records"
          aria-label="Search records"
          style={{ maxWidth: 320 }}
        />
        <span className="table-count">{filteredRows.length} of {rows.length} shown</span>
      </div>
      <div className="table-wrap">
      <table className="cp-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>
                {col.label || col.key}
              </th>
            ))}
            <th style={{ width: 60 }} />
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row) => (
            <tr
              key={row.id}
            >
              {columns.map((col) => {
                const val = row.data?.[col.key];
                const display = val === undefined || val === null || val === ''
                  ? <span style={{ color: 'var(--color-border)' }}>—</span>
                  : typeof val === 'boolean'
                    ? <span style={{ color: val ? 'var(--color-success)' : 'var(--color-danger)' }}>{val ? 'Yes' : 'No'}</span>
                    : String(val);

                return (
                  <td key={col.key}>
                    {display}
                  </td>
                );
              })}
              <td style={{ textAlign: 'right' }}>
                {onDelete && (
                  <button
                    className="btn btn-danger"
                    onClick={() => onDelete(row.id, row.data)}
                    style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                    title="Delete record"
                  >
                    🗑 Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {!!rows.length && filteredRows.length === 0 && (
        <div className="empty-message" style={{ paddingTop: '1rem' }}>
          No records match this search.
        </div>
      )}
    </div>
  );
}
