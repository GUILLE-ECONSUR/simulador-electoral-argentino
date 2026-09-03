// components/DollarSection.jsx
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { apiFetch, fmtCur, fmt, isoDate, addYears, TODAY, MetricCard, CustomTooltip, ErrMsg, ChartWrap, Sk } from './shared';

const DTYPES  = ['OFICIAL','BLUE','MEP','CCL','TARJETA','MAYORISTA'];
const DCOLORS = { OFICIAL:'#0ea5e9', BLUE:'#22c55e', MEP:'#f59e0b', CCL:'#a78bfa', TARJETA:'#ef4444', MAYORISTA:'#94a3b8' };
const RNGS    = { '3M':0.25, '6M':0.5, '1Y':1, '3Y':3, '5Y':5 };

export default function DollarSection() {
  const [cur,   setCur]   = useState(null);
  const [hist,  setHist]  = useState([]);
  const [type,  setType]  = useState('BLUE');
  const [rng,   setRng]   = useState('1Y');
  const [loadC, setLoadC] = useState(true);
  const [loadH, setLoadH] = useState(true);
  const [err,   setErr]   = useState(null);

  useEffect(() => {
    apiFetch('/dollar?view=current')
      .then(d  => { setCur(d); setLoadC(false); })
      .catch(e => { setErr(e.message); setLoadC(false); });
  }, []);

  useEffect(() => {
    setLoadH(true);
    const from = isoDate(addYears(TODAY, -RNGS[rng]));
    const to   = isoDate(TODAY);
    apiFetch(`/dollar?view=historical&type=${type}&from=${from}&to=${to}`)
      .then(d  => { setHist(Array.isArray(d) ? d : []); setLoadH(false); })
      .catch(() => { setHist([]); setLoadH(false); });
  }, [type, rng]);

  const color = DCOLORS[type] || '#0ea5e9';

  return (
    <div className="fade">
      {err && (
        <div style={{ background:'#1a0a0a', border:'1px solid #ef444440', borderRadius:8,
          padding:'10px 14px', marginBottom:16, fontSize:12, color:'var(--r)' }}>{err}</div>
      )}

      {/* Cards cotización */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        {DTYPES.map(t => (
          <MetricCard key={t} label={t} accent={DCOLORS[t]} loading={loadC}
            value={cur ? fmtCur(cur[t]?.sell) : '—'}
            sub={cur?.[t] ? `Compra ${fmtCur(cur[t]?.buy)}` : null} />
        ))}
      </div>

      {/* Gráfico histórico */}
      <ChartWrap title="Cotización histórica" sub={`Dólar ${type} — precio de venta`}
        loading={loadH} data={hist} csvName={`dolar_${type}_${rng}`} minH={280}
        controls={
          <>
            <div style={{ display:'flex', gap:3 }}>
              {['OFICIAL','BLUE','MEP','CCL'].map(t => (
                <button key={t} className={`btn${type===t?' active':''}`} onClick={() => setType(t)}>{t}</button>
              ))}
            </div>
            <div style={{ display:'flex', gap:3 }}>
              {Object.keys(RNGS).map(r => (
                <button key={r} className={`btn${rng===r?' active':''}`} onClick={() => setRng(r)}>{r}</button>
              ))}
            </div>
          </>
        }>
        {hist.length === 0 ? <ErrMsg /> : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={hist} margin={{ top:4, right:8, left:0, bottom:4 }}>
              <defs>
                <linearGradient id="gDollar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" vertical={false} />
              <XAxis dataKey="date"  stroke="var(--bd)" tick={{ fill:'var(--m)', fontSize:10, fontFamily:"'JetBrains Mono'" }} tickLine={false} interval="preserveStartEnd" />
              <YAxis stroke="var(--bd)" tick={{ fill:'var(--m)', fontSize:10, fontFamily:"'JetBrains Mono'" }} tickLine={false} tickFormatter={v => `$${v}`} width={72} />
              <Tooltip content={<CustomTooltip pre="$" />} />
              <Area type="monotone" dataKey="sell" name="Venta"   stroke={color} fill="url(#gDollar)" strokeWidth={2}   dot={false} />
              <Area type="monotone" dataKey="buy"  name="Compra"  stroke={color} fill="transparent"   strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartWrap>

      {/* Brecha cambiaria */}
      {cur && (
        <div style={{ background:'var(--s1)', border:'1px solid var(--bd)', borderRadius:12, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:14, color:'var(--tx)' }}>Brecha cambiaria</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {['BLUE','MEP','CCL','TARJETA'].map(t => {
              const oficial = cur['OFICIAL']?.sell;
              const val     = cur[t]?.sell;
              const brecha  = oficial && val ? ((val - oficial) / oficial) * 100 : null;
              return (
                <div key={t} style={{ flex:1, minWidth:100, background:'var(--s2)', borderRadius:8, padding:'12px 14px' }}>
                  <div style={{ fontSize:10, color:'var(--m)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>{t}</div>
                  <div style={{ fontSize:18, fontWeight:700, fontFamily:"'JetBrains Mono',monospace",
                    color: brecha != null && brecha > 0 ? 'var(--am)' : 'var(--g)' }}>
                    {brecha != null ? `+${fmt(brecha, 1)}%` : '—'}
                  </div>
                  <div style={{ fontSize:10, color:'var(--m)', marginTop:4 }}>vs Oficial</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
