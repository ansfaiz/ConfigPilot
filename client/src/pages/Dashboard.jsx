import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import DynamicForm from '../components/DynamicForm';
import DynamicTable from '../components/DynamicTable';

const DEFAULT_CONFIG = {
  module: 'contacts',
  title: 'Contacts',
  blocks: [
    {
      type: 'form',
      fields: [
        { name: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
        { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'jane@example.com' },
        { name: 'phone', label: 'Phone', type: 'text', placeholder: '+1 555 000 0000' },
        { name: 'role', label: 'Role', type: 'select', options: ['Engineer', 'Designer', 'Manager', 'Other'] },
        { name: 'active', label: 'Active', type: 'checkbox' },
      ],
    },
    {
      type: 'table',
      columns: [
        { key: 'full_name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'role', label: 'Role' },
        { key: 'active', label: 'Active' },
      ],
    },
  ],
};

function parseConfig(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.module) throw new Error('Missing "module" key');
    if (!Array.isArray(parsed.blocks)) throw new Error('"blocks" must be an array');
    return { config: parsed, error: null };
  } catch (e) {
    return { config: null, error: e.message };
  }
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [configText, setConfigText] = useState(() => JSON.stringify(DEFAULT_CONFIG, null, 2));
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [configError, setConfigError] = useState(null);
  const [configOpen, setConfigOpen] = useState(false);

  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const fetchRecords = useCallback(async (mod) => {
    setRecordsLoading(true);
    try {
      const { data } = await api.get('/records', { params: { module: mod } });
      setRecords(data.records);
    } catch {
      showToast('Failed to load records', 'error');
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (config?.module) fetchRecords(config.module);
  }, [config?.module, fetchRecords]);

  function applyConfig() {
    const { config: parsed, error } = parseConfig(configText);
    if (error) { setConfigError(error); return; }
    setConfigError(null);
    setConfig(parsed);
    setRecords([]);
    setConfigOpen(false);
    fetchRecords(parsed.module);
  }

  async function handleFormSubmit(values) {
    setSubmitLoading(true);
    try {
      await api.post('/records', { module: config.module, data: values });
      showToast('Record saved!');
      fetchRecords(config.module);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save', 'error');
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/records/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showToast('Record deleted');
    } catch {
      showToast('Delete failed', 'error');
    }
  }

  const formBlock = config?.blocks?.find((b) => b.type === 'form');
  const tableBlock = config?.blocks?.find((b) => b.type === 'table');
  const unknownBlocks = config?.blocks?.filter((b) => b.type !== 'form' && b.type !== 'table') ?? [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Navbar */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem', height: 56,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.1rem' }}>⚙️</span>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.02em' }}>ConfigPilot</span>
          {config?.title && (
            <>
              <span style={{ color: 'var(--color-border)', margin: '0 0.25rem' }}>/</span>
              <span className="badge">{config.title}</span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>
            {user?.name}
          </span>
          <button
            id="open-config-btn"
            className="btn btn-ghost"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
            onClick={() => setConfigOpen((p) => !p)}
          >
            {configOpen ? '✕ Close Config' : '⚡ Edit Config'}
          </button>
          <button
            id="logout-btn"
            className="btn btn-ghost"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Config Panel */}
      {configOpen && (
        <div style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '1.25rem 1.5rem'
        }}>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', margin: '0 0 0.75rem' }}>
            Paste a JSON config to change the module, form fields, and table columns. Changes reload records automatically.
          </p>
          <textarea
            id="config-editor"
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            spellCheck={false}
            style={{
              width: '100%', minHeight: 220, resize: 'vertical',
              background: 'var(--color-bg)', border: '1px solid var(--color-border)',
              borderRadius: 8, padding: '0.75rem', color: 'var(--color-text)',
              fontFamily: "'Menlo', 'Monaco', 'Consolas', monospace", fontSize: '0.8rem',
              lineHeight: 1.6, outline: 'none'
            }}
          />
          {configError && (
            <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>
              ⚠ {configError}
            </p>
          )}
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button id="apply-config-btn" className="btn btn-primary" onClick={applyConfig}>
              Apply Config
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setConfigText(JSON.stringify(DEFAULT_CONFIG, null, 2));
                setConfigError(null);
              }}
            >
              Reset to default
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.25rem' }}>
        {!config ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗂</div>
            <p style={{ color: 'var(--color-muted)' }}>No valid config loaded. Click "Edit Config" to paste one.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Form block */}
            {formBlock && (
              <section className="card">
                <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  Add {config.title || config.module}
                </h2>
                <DynamicForm
                  fields={formBlock.fields}
                  onSubmit={handleFormSubmit}
                  loading={submitLoading}
                  submitLabel={`Save ${config.title || config.module}`}
                />
              </section>
            )}

            {/* Unknown block types */}
            {unknownBlocks.map((b, i) => (
              <div
                key={i}
                style={{
                  border: '1px dashed var(--color-border)', borderRadius: 10,
                  padding: '1rem', color: 'var(--color-muted)', fontSize: '0.85rem'
                }}
              >
                ⚠ Unknown block type: <code style={{ color: 'var(--color-accent)' }}>{b.type}</code>
              </div>
            ))}

            {/* Table block */}
            {tableBlock && (
              <section className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                    {config.title || config.module} Records
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {recordsLoading && <span className="spinner" />}
                    <span style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>
                      {records.length} {records.length === 1 ? 'entry' : 'entries'}
                    </span>
                    <button
                      id="refresh-records-btn"
                      className="btn btn-ghost"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                      onClick={() => fetchRecords(config.module)}
                      disabled={recordsLoading}
                    >
                      ↻ Refresh
                    </button>
                  </div>
                </div>
                <DynamicTable
                  columns={tableBlock.columns}
                  rows={records}
                  onDelete={handleDelete}
                />
              </section>
            )}
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 999,
          background: toast.type === 'error' ? 'rgba(248,113,113,0.15)' : 'rgba(74,222,128,0.15)',
          border: `1px solid ${toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)'}`,
          color: toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
          borderRadius: 10, padding: '0.75rem 1.1rem', fontSize: '0.875rem',
          fontWeight: 600, backdropFilter: 'blur(8px)',
          animation: 'fadeInUp 0.2s ease',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
