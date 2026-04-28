import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
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

const MODULE_TEMPLATES = [
  { name: 'Contacts CRM', config: DEFAULT_CONFIG },
  {
    name: 'Task Manager',
    config: {
      module: 'tasks',
      title: 'Tasks',
      blocks: [
        {
          type: 'form',
          fields: [
            { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Release sprint v3' },
            { name: 'assignee', label: 'Assignee', type: 'text', placeholder: 'Team member name' },
            { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
            { name: 'due_date', label: 'Due Date', type: 'date' },
            { name: 'completed', label: 'Completed', type: 'checkbox' },
          ],
        },
        {
          type: 'table',
          columns: [
            { key: 'title', label: 'Title' },
            { key: 'assignee', label: 'Assignee' },
            { key: 'priority', label: 'Priority' },
            { key: 'due_date', label: 'Due Date' },
            { key: 'completed', label: 'Done' },
          ],
        },
      ],
    },
  },
  {
    name: 'Product Inventory',
    config: {
      module: 'products',
      title: 'Products',
      blocks: [
        {
          type: 'form',
          fields: [
            { name: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'Noise-canceling Headphones' },
            { name: 'sku', label: 'SKU', type: 'text', required: true, placeholder: 'PRD-1024' },
            { name: 'price', label: 'Price', type: 'number', required: true, placeholder: '99.99' },
            { name: 'stock', label: 'Stock', type: 'number', placeholder: '35' },
            { name: 'active', label: 'Active Listing', type: 'checkbox' },
          ],
        },
        {
          type: 'table',
          columns: [
            { key: 'name', label: 'Name' },
            { key: 'sku', label: 'SKU' },
            { key: 'price', label: 'Price' },
            { key: 'stock', label: 'Stock' },
            { key: 'active', label: 'Status' },
          ],
        },
      ],
    },
  },
  {
    name: 'Leads Tracker',
    config: {
      module: 'leads',
      title: 'Leads',
      blocks: [
        {
          type: 'form',
          fields: [
            { name: 'company', label: 'Company', type: 'text', required: true, placeholder: 'Acme Inc.' },
            { name: 'contact_name', label: 'Contact Name', type: 'text', required: true, placeholder: 'Taylor Smith' },
            { name: 'stage', label: 'Stage', type: 'select', options: ['New', 'Qualified', 'Proposal', 'Closed'] },
            { name: 'source', label: 'Source', type: 'text', placeholder: 'LinkedIn' },
            { name: 'hot_lead', label: 'Hot Lead', type: 'checkbox' },
          ],
        },
        {
          type: 'table',
          columns: [
            { key: 'company', label: 'Company' },
            { key: 'contact_name', label: 'Contact' },
            { key: 'stage', label: 'Stage' },
            { key: 'source', label: 'Source' },
            { key: 'hot_lead', label: 'Hot Lead' },
          ],
        },
      ],
    },
  },
];

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
  const [configOpen, setConfigOpen] = useState(true);
  const [configValidMessage, setConfigValidMessage] = useState('');

  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchRecords = useCallback(async (mod) => {
    setRecordsLoading(true);
    try {
      const { data } = await api.get('/records', { params: { module: mod }, skipToast: true });
      setRecords(data.records);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load records');
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (config?.module) {
      Promise.resolve().then(() => fetchRecords(config.module));
    }
  }, [config?.module, fetchRecords]);

  function applyConfig() {
    const { config: parsed, error } = parseConfig(configText);
    if (error) {
      setConfigError(error);
      toast.error(error);
      return;
    }
    setConfigError(null);
    setConfigValidMessage('Config is valid and applied.');
    setConfig(parsed);
    setRecords([]);
    fetchRecords(parsed.module);
    toast.success('Config applied.');
  }

  function validateConfigOnly() {
    const { error } = parseConfig(configText);
    if (error) {
      setConfigError(error);
      setConfigValidMessage('');
      toast.error(error);
      return;
    }
    setConfigError(null);
    setConfigValidMessage('Looks good. JSON structure is valid.');
    toast.success('Config looks valid.');
  }

  function applyTemplate(templateConfig) {
    const nextText = JSON.stringify(templateConfig, null, 2);
    setConfigText(nextText);
    setConfig(templateConfig);
    setConfigError(null);
    setConfigValidMessage('');
    fetchRecords(templateConfig.module);
    toast.success(`Template loaded: ${templateConfig.title || templateConfig.module}`);
  }

  async function handleFormSubmit(values) {
    setSubmitLoading(true);
    try {
      await api.post('/records', { module: config.module, data: values }, { skipToast: true });
      toast.success('Record saved!');
      fetchRecords(config.module);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this record permanently? This action cannot be undone.');
    if (!confirmed) return;
    try {
      await api.delete(`/records/${id}`, { skipToast: true });
      setRecords((prev) => prev.filter((r) => r.id !== id));
      toast.success('Record deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  }

  const formBlock = config?.blocks?.find((b) => b.type === 'form');
  const tableBlock = config?.blocks?.find((b) => b.type === 'table');
  const unknownBlocks = config?.blocks?.filter((b) => b.type !== 'form' && b.type !== 'table') ?? [];

  return (
    <div className="dashboard-root">
      <header className="dashboard-nav">
        <div className="dashboard-brand">
          <span className="brand-icon">⚙</span>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.02em' }}>ConfigPilot</span>
          {config?.title && (
            <>
              <span style={{ color: 'var(--color-border)', margin: '0 0.25rem' }}>/</span>
              <span className="badge">{config.title}</span>
            </>
          )}
        </div>
        <div className="dashboard-nav-actions">
          <span className="dashboard-user-pill">
            <span className="dashboard-user-avatar">{(user?.name || 'U').slice(0, 1).toUpperCase()}</span>
            <span>{user?.name || 'User'}</span>
          </span>
            <button
            id="open-config-btn"
            className="btn btn-ghost"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            onClick={() => setConfigOpen((p) => !p)}
          >
              {configOpen ? 'Hide Config' : 'Edit Config'}
          </button>
          <button
            id="logout-btn"
            className="btn btn-ghost"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-hero card">
          <h1>{config?.title || 'Config-driven workspace'}</h1>
          <p>ConfigPilot converts JSON module definitions into working full-stack CRUD interfaces for your team.</p>
          <div className="template-row">
            {MODULE_TEMPLATES.map((template) => (
              <button
                key={template.name}
                className="btn btn-ghost"
                onClick={() => applyTemplate(template.config)}
                style={{ fontSize: '0.8rem' }}
              >
                {template.name}
              </button>
            ))}
          </div>
        </section>

        {configOpen && (
          <section className="card">
            <div className="config-panel-head">
              <h2>Config Editor</h2>
              <span className="badge">{config?.module || 'module'}</span>
            </div>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>
              Edit JSON config, validate it before applying, and switch modules instantly.
            </p>
          <textarea
            id="config-editor"
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            spellCheck={false}
            className="config-editor"
          />
          {configError && (
            <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>
              ⚠ {configError}
            </p>
          )}
          {configValidMessage && (
            <p style={{ color: 'var(--color-success)', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>
              ✓ {configValidMessage}
            </p>
          )}
          <div className="config-actions">
            <button className="btn btn-ghost" onClick={validateConfigOnly}>
              Validate Config
            </button>
            <button id="apply-config-btn" className="btn btn-primary" onClick={applyConfig}>
              Save & Apply Config
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
          </section>
        )}

        {!config ? (
            <div className="empty-table-state">
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗂</div>
            <p style={{ color: 'var(--color-muted)' }}>No valid config loaded. Click "Edit Config" to paste one.</p>
          </div>
        ) : (
          <div className="dashboard-content">
            {formBlock && (
              <section className="card">
                <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  Add {config.title || config.module}
                </h2>
                <DynamicForm
                  key={JSON.stringify(formBlock.fields || [])}
                  fields={formBlock.fields}
                  onSubmit={handleFormSubmit}
                  onValidationError={() => toast.error('Please fix the highlighted fields.')}
                  loading={submitLoading}
                  submitLabel={`Save ${config.title || config.module}`}
                />
              </section>
            )}

            {unknownBlocks.map((b, i) => (
              <div key={i} className="unknown-block-warning">
                ⚠ Unknown block type: <code style={{ color: 'var(--color-accent)' }}>{b.type}</code>
              </div>
            ))}

            {tableBlock && (
              <section className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                    {config.title || config.module} Records
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                      Refresh
                    </button>
                  </div>
                </div>
                <DynamicTable
                  columns={tableBlock.columns}
                  rows={records}
                  loading={recordsLoading}
                  onDelete={handleDelete}
                />
              </section>
            )}
          </div>
        )}
      </main>

    </div>
  );
}
