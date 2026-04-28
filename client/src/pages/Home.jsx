import { Link } from 'react-router-dom';

const STEPS = [
  {
    title: 'Define your JSON config',
    description: 'Describe forms, fields, and data tables in a clean JSON schema your team can version and reuse.',
    icon: '01',
  },
  {
    title: 'Generate your module instantly',
    description: 'ConfigPilot turns your config into production-ready UI with forms, records table, and API-backed workflows.',
    icon: '02',
  },
  {
    title: 'Ship and iterate faster',
    description: 'Swap templates, evolve field definitions, and roll out new internal tools without rewriting frontend screens.',
    icon: '03',
  },
];

const FEATURES = [
  'Generate forms + tables directly from JSON schema',
  'Built-in CRUD workflow connected to your backend',
  'Module templates for CRM, tasks, leads, and inventory',
  'Live config validation before applying UI changes',
  'Searchable records and instant module switching',
  'Production-ready dark SaaS interface out of the box',
];

const WORKFLOW = [
  'Pick a starter template or paste your own JSON.',
  'Validate, apply config, and auto-render your module UI.',
  'Collect records instantly and manage them in one workspace.',
];

export default function Home() {
  return (
    <div className="landing-root">
      <div className="background-glow background-glow-top" />
      <div className="background-glow background-glow-bottom" />

      <header className="landing-nav">
        <div className="landing-brand">
          <span className="brand-icon">⚙</span>
          <span>ConfigPilot</span>
        </div>
        <div className="landing-nav-actions">
          <Link className="btn btn-ghost" to="/login">Login</Link>
          <Link className="btn btn-primary" to="/register">Get Started</Link>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <p className="hero-kicker">ConfigPilot - JSON to Product</p>
          <h1>Build Full-Stack Apps from JSON Configs</h1>
          <p className="hero-description">
            ConfigPilot is a config-driven app engine for internal tools.
            Define your module in JSON and instantly get a working form, records table, and backend-connected CRUD flow.
          </p>
          <div className="hero-cta-row">
            <Link className="btn btn-primary" to="/register">Get Started</Link>
            <Link className="btn btn-ghost" to="/login">Demo</Link>
            <a className="btn btn-ghost" href="https://github.com/ansfaiz/ConfigPilot" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </section>

        <section className="landing-card-grid">
          <article className="card landing-card">
            <span className="section-label">Core Product Value</span>
            <h2>How It Works</h2>
            <div className="steps-grid">
              {STEPS.map((step) => (
                <div key={step.title} className="step-card">
                  <span className="step-index">{step.icon}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="card landing-card">
            <span className="section-label">What Defines ConfigPilot</span>
            <h2>Features</h2>
            <div className="feature-list">
              {FEATURES.map((item) => (
                <div key={item} className="feature-item">
                  <span className="feature-dot" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="card landing-card">
            <span className="section-label">Start Fast</span>
            <h2>Tutorial Workflow</h2>
            <div className="workflow-list">
              {WORKFLOW.map((item, index) => (
                <div key={item} className="workflow-item">
                  <span>{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>

      <footer className="landing-footer">
        <p>ConfigPilot helps teams ship internal products from config, not boilerplate.</p>
        <div className="landing-footer-links">
          <Link to="/login">Sign In</Link>
          <Link to="/register">Create Account</Link>
          <a href="https://github.com/ansfaiz/ConfigPilot" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
