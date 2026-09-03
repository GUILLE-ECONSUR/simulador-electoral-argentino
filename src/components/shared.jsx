// components/shared.jsx
import { Tooltip } from 'recharts';

// ── helpers ────────────────────────────────────────────────────────────────
export const fmt    = (n, dec = 1) => n != null ? Number(n).toLocaleString('es-AR', { maximumFractionDigits: dec }) : '—';
export const fmtCur = (n)          => n != null ? `$${fmt(n, 0)}` : '—';
export const fmtPct = (n)          => n != null ? `${Number(n) > 0 ? '+' : ''}${fmt(n)}%` : '—';

const TODAY  = new Date();
export const isoDate  = (d) => d.toISOString().slice(0, 10);
export const addYears = (d, n) => { const x = new Date(d); x.setFullYear(x.getFullYear() + n); return x; };
export const toYYYYMM = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
export const toQuarter = (d) => `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
export { TODAY };

// Proxy API fetcher — llama al route /api/argenstats para evitar CORS
export const apiFetch = async (path) => {
  // path example: "/dollar?view=current"
  const [route, qs] = path.slice(1).split('?');
  const params = new URLSearchParams(qs || '');
  params.set('path', route);
  const res  = await fetch(`/api/argenstats?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'API Error');
  return json.data;
};

export const exportCSV = (data, name) => {
  if (!data?.length) return;
  const keys = Object.keys(data[0]);
  const csv  = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))].join('\n');
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `${name}.csv`;
  a.click();
};

// ── UI atoms ───────────────────────────────────────────────────────────────
export const Sk = ({ h = 20, w = '100%' }) => (
  <div className="skeleton" style={{ width: w, height: h }} />
);

export const MetricCard = ({ label, value, sub, accent, loading }) => (
  <div style={{
    background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 10,
    padding: '16px 18px', flex: 1, minWidth: 140,
    borderTop: `3px solid ${accent || 'var(--a)'}`,
  }}>
    <div style={{ fontSize: 10, color: 'var(--m)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
      {label}
    </div>
    {loading
      ? <Sk h={26} />
      : <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--tx)', fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.2 }}>{value}</div>
    }
    {sub != null && !loading && (
      <div style={{ fontSize: 11, marginTop: 5, fontFamily: "'JetBrains Mono',monospace",
        color: Number(sub) > 0 ? 'var(--g)' : Number(sub) < 0 ? 'var(--r)' : 'var(--m2)' }}>
        {typeof sub === 'number' ? fmtPct(sub) : sub}
      </div>
    )}
  </div>
);

export const CustomTooltip = ({ active, payload, label, pre = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 8,
      padding: '10px 14px', fontSize: 12, fontFamily: "'JetBrains Mono',monospace",
    }}>
      <div style={{ color: 'var(--m2)', marginBottom: 6, fontSize: 11 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--tx)', marginBottom: 2 }}>
          {p.name}: {pre}{fmt(p.value, 2)}
        </div>
      ))}
    </div>
  );
};

export const ErrMsg = ({ msg }) => (
  <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--m)' }}>
    <div style={{ fontSize: 24, marginBottom: 8 }}>⚠</div>
    <div style={{ fontSize: 12 }}>{msg || 'No hay datos disponibles'}</div>
  </div>
);

export const ChartWrap = ({ title, sub, children, controls, data, csvName, loading, minH = 280 }) => (
  <div style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)' }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--m)', marginTop: 3 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {controls}
        {data?.length > 0 && (
          <button className="btn" onClick={() => exportCSV(data, csvName || title)}>↓ CSV</button>
        )}
      </div>
    </div>
    {loading ? <Sk h={minH} /> : children}
  </div>
);
