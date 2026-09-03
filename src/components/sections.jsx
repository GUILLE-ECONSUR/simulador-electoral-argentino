// components/InflationSection.jsx
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { apiFetch, fmtPct, isoDate, addYears, TODAY, MetricCard, CustomTooltip, ErrMsg, ChartWrap } from './shared';

const RNGS = { '1Y':1, '2Y':2, '3Y':3, '5Y':5, 'MAX':10 };

export function InflationSection() {
  const [cur,   setCur]   = useState(null);
  const [hist,  setHist]  = useState([]);
  const [rng,   setRng]   = useState('2Y');
  const [loadC, setLoadC] = useState(true);
  const [loadH, setLoadH] = useState(true);

  useEffect(() => {
    apiFetch('/inflation?view=current')
      .then(d => { setCur(d); setLoadC(false); })
      .catch(() => setLoadC(false));
  }, []);

  useEffect(() => {
    setLoadH(true);
    const from = isoDate(addYears(TODAY, -RNGS[rng]));
    const to   = isoDate(TODAY);
    apiFetch(`/inflation?view=historical&from=${from}&to=${to}`)
      .then(d  => { setHist(Array.isArray(d) ? d : []); setLoadH(false); })
      .catch(() => { setHist([]); setLoadH(false); });
  }, [rng]);

  return (
    <div className="fade">
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        <MetricCard label="Var. Mensual"     value={cur ? fmtPct(cur.monthly_rate)   : '—'} accent="var(--r)"  loading={loadC} />
        <MetricCard label="Var. Interanual"  value={cur ? fmtPct(cur.yearly_rate)    : '—'} accent="var(--am)" loading={loadC} />
        <MetricCard label="Acumulado Anual"  value={cur ? fmtPct(cur.accumulated)    : '—'} accent="var(--a)"  loading={loadC} />
        {cur?.date && <MetricCard label="Período" value={cur.date} accent="var(--m)" loading={loadC} />}
      </div>

      <ChartWrap title="IPC — Evolución histórica" sub="Índice de Precios al Consumidor · INDEC"
        loading={loadH} data={hist} csvName={`inflacion_${rng}`} minH={280}
        controls={
          <div style={{ display:'flex', gap:3 }}>
            {Object.keys(RNGS).map(r => (
              <button key={r} className={`btn${rng===r?' active':''}`} onClick={() => setRng(r)}>{r}</button>
            ))}
          </div>
        }>
        {hist.length === 0 ? <ErrMsg /> : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={hist} margin={{ top:4, right:8, left:0, bottom:4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--bd)" tick={{ fill:'var(--m)', fontSize:10 }} tickLine={false} interval="preserveStartEnd" />
              <YAxis stroke="var(--bd)" tick={{ fill:'var(--m)', fontSize:10 }} tickLine={false} tickFormatter={v => `${v}%`} width={52} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="monthly_rate" name="Mensual %"     stroke="var(--r)"  strokeWidth={2} dot={false} activeDot={{ r:4 }} />
              <Line type="monotone" dataKey="yearly_rate"  name="Interanual %"  stroke="var(--am)" strokeWidth={2} dot={false} activeDot={{ r:4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartWrap>
    </div>
  );
}

// ─── EMAE ───────────────────────────────────────────────────────────────────
import { AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { fmt, toYYYYMM, Sk } from './shared';

const EMAE_RNGS = { '1Y':1, '2Y':2, '5Y':5, 'MAX':20 };

export function EMAESection() {
  const [cur,     setCur]     = useState(null);
  const [sectors, setSectors] = useState([]);
  const [hist,    setHist]    = useState([]);
  const [rng,     setRng]     = useState('2Y');
  const [serie,   setSerie]   = useState('original');
  const [loadC,   setLoadC]   = useState(true);
  const [loadS,   setLoadS]   = useState(true);
  const [loadH,   setLoadH]   = useState(true);

  useEffect(() => {
    apiFetch('/economic-activity?view=current')
      .then(d => { setCur(d); setLoadC(false); })
      .catch(() => setLoadC(false));
    apiFetch('/economic-activity?view=sectors')
      .then(d => { setSectors(d.sectors || []); setLoadS(false); })
      .catch(() => setLoadS(false));
  }, []);

  useEffect(() => {
    setLoadH(true);
    const from = toYYYYMM(addYears(TODAY, -EMAE_RNGS[rng]));
    const to   = toYYYYMM(TODAY);
    apiFetch(`/economic-activity?view=historical&from=${from}&to=${to}&seasonally_adjusted=true`)
      .then(d => {
        const rows = (Array.isArray(d) ? d : []).map(x => ({
          ...x,
          adj_index: x.seasonally_adjusted?.index,
        }));
        setHist(rows); setLoadH(false);
      })
      .catch(() => { setHist([]); setLoadH(false); });
  }, [rng]);

  const dataKey  = serie === 'desest' ? 'adj_index' : 'general_index';
  const sectorH  = Math.max(220, (sectors.length || 0) * 38 + 40);
  const shortName = n => n?.length > 28 ? n.slice(0, 26) + '…' : n;

  return (
    <div className="fade">
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        <MetricCard label="Índice General"  value={cur ? fmt(cur.general_index)       : '—'} accent="var(--a)"  loading={loadC} />
        <MetricCard label="Var. Mensual"    value={cur ? `${fmt(cur.monthly_variation)}%`   : '—'} sub={cur?.monthly_variation}    accent="var(--g)"  loading={loadC} />
        <MetricCard label="Var. Interanual" value={cur ? `${fmt(cur.yearly_variation)}%`    : '—'} sub={cur?.yearly_variation}     accent="var(--am)" loading={loadC} />
        <MetricCard label="Acumulado"       value={cur ? `${fmt(cur.accumulated_variation)}%` : '—'} accent="var(--pu)" loading={loadC} />
      </div>

      <ChartWrap title="EMAE — Actividad Económica" sub="Base 2004 = 100 · INDEC"
        loading={loadH} data={hist} csvName={`emae_${serie}_${rng}`} minH={260}
        controls={
          <>
            <div style={{ display:'flex', gap:3 }}>
              <button className={`btn${serie==='original'?' active':''}`} onClick={() => setSerie('original')}>Original</button>
              <button className={`btn${serie==='desest'?' active':''}`}   onClick={() => setSerie('desest')}>Desest.</button>
            </div>
            <div style={{ display:'flex', gap:3 }}>
              {Object.keys(EMAE_RNGS).map(r => (
                <button key={r} className={`btn${rng===r?' active':''}`} onClick={() => setRng(r)}>{r}</button>
              ))}
            </div>
          </>
        }>
        {hist.length === 0 ? <ErrMsg /> : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={hist} margin={{ top:4, right:8, left:0, bottom:4 }}>
              <defs>
                <linearGradient id="gEMAE" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--a)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--a)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--bd)" tick={{ fill:'var(--m)', fontSize:10 }} tickLine={false} interval="preserveStartEnd" />
              <YAxis stroke="var(--bd)" tick={{ fill:'var(--m)', fontSize:10 }} tickLine={false} width={48} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey={dataKey} name="Índice" stroke="#0ea5e9" fill="url(#gEMAE)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartWrap>

      <ChartWrap title="Sectores — Variación interanual" sub="Último período disponible"
        loading={loadS} data={sectors} csvName="emae_sectores" minH={sectorH}>
        {sectors.length === 0 ? <ErrMsg /> : (
          <ResponsiveContainer width="100%" height={sectorH}>
            <BarChart data={sectors} layout="vertical" margin={{ top:0, right:40, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" horizontal={false} />
              <XAxis type="number" stroke="var(--bd)" tick={{ fill:'var(--m)', fontSize:10 }} tickFormatter={v => `${v}%`} tickLine={false} />
              <YAxis type="category" dataKey="name" stroke="var(--bd)" tick={{ fill:'var(--m2)', fontSize:10 }} width={170} tickLine={false} tickFormatter={shortName} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="yearly_variation" name="Var. Interanual %" radius={[0,4,4,0]}>
                {sectors.map((s,i) => <Cell key={i} fill={s.yearly_variation >= 0 ? '#22c55e' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartWrap>
    </div>
  );
}

// ─── POBREZA ─────────────────────────────────────────────────────────────────

export function PovertySection() {
  const [cur,      setCur]      = useState(null);
  const [regional, setRegional] = useState([]);
  const [hist,     setHist]     = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.allSettled([
      apiFetch('/poverty?view=current'),
      apiFetch('/poverty?view=regional'),
      apiFetch('/poverty?view=historical&from=2016-S1&to=2025-S2'),
    ]).then(([c, r, h]) => {
      if (c.status === 'fulfilled') setCur(c.value);
      if (r.status === 'fulfilled') setRegional(r.value.regions || []);
      if (h.status === 'fulfilled') setHist(Array.isArray(h.value) ? h.value : []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="fade">
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        <MetricCard label="Tasa de pobreza"     value={cur ? `${fmt(cur.poverty?.rate)}%`                      : '—'} accent="var(--r)"  loading={loading} />
        <MetricCard label="Personas en pobreza" value={cur ? `${fmt((cur.poverty?.people||0)/1e6,1)}M`         : '—'} accent="var(--am)" loading={loading} />
        <MetricCard label="Tasa de indigencia"  value={cur ? `${fmt(cur.extreme_poverty?.rate)}%`              : '—'} accent="var(--r)"  loading={loading} />
        <MetricCard label="Personas indigentes" value={cur ? `${fmt((cur.extreme_poverty?.people||0)/1e6,1)}M` : '—'} accent="var(--am)" loading={loading} />
        {cur?.period && <MetricCard label="Período" value={cur.period} accent="var(--a)" loading={loading} />}
      </div>

      <ChartWrap title="Evolución pobreza e indigencia" sub="% de personas — EPH · INDEC"
        loading={loading} data={hist} csvName="pobreza_historica" minH={260}>
        {hist.length === 0 ? <ErrMsg /> : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={hist} margin={{ top:4, right:8, left:0, bottom:4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" vertical={false} />
              <XAxis dataKey="period" stroke="var(--bd)" tick={{ fill:'var(--m)', fontSize:10 }} tickLine={false} />
              <YAxis stroke="var(--bd)" tick={{ fill:'var(--m)', fontSize:10 }} tickLine={false} tickFormatter={v => `${v}%`} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="poverty_rate"         name="Pobreza %"    stroke="#ef4444" strokeWidth={2.5} dot={{ r:3, fill:'#ef4444' }} />
              <Line type="monotone" dataKey="extreme_poverty_rate" name="Indigencia %" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r:3, fill:'#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartWrap>

      {regional.length > 0 && (
        <ChartWrap title="Pobreza por región" sub="Último período — % de personas"
          loading={loading} data={regional} csvName="pobreza_regional" minH={260}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={regional} margin={{ top:4, right:8, left:0, bottom:4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" vertical={false} />
              <XAxis dataKey="name"  stroke="var(--bd)" tick={{ fill:'var(--m)', fontSize:10 }} tickLine={false} />
              <YAxis stroke="var(--bd)" tick={{ fill:'var(--m)', fontSize:10 }} tickLine={false} tickFormatter={v => `${v}%`} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="poverty_rate"         name="Pobreza %"    fill="#ef4444" radius={[4,4,0,0]} />
              <Bar dataKey="extreme_poverty_rate" name="Indigencia %" fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrap>
      )}
    </div>
  );
}

// ─── EMPLEO ──────────────────────────────────────────────────────────────────

export function LaborSection() {
  const [cur,     setCur]     = useState(null);
  const [gender,  setGender]  = useState(null);
  const [hist,    setHist]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = toQuarter(addYears(TODAY, -5));
    const to   = toQuarter(TODAY);
    Promise.allSettled([
      apiFetch('/labor?view=current'),
      apiFetch('/labor?view=by_gender'),
      apiFetch(`/labor?view=historical&from=${from}&to=${to}`),
    ]).then(([c, g, h]) => {
      if (c.status === 'fulfilled') setCur(c.value);
      if (g.status === 'fulfilled') setGender(g.value);
      if (h.status === 'fulfilled') setHist(Array.isArray(h.value) ? h.value : []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="fade">
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        <MetricCard label="Desempleo"  value={cur ? `${fmt(cur.unemployment_rate)}%`  : '—'} accent="var(--r)"  loading={loading} />
        <MetricCard label="Empleo"     value={cur ? `${fmt(cur.employment_rate)}%`    : '—'} accent="var(--g)"  loading={loading} />
        <MetricCard label="Actividad"  value={cur ? `${fmt(cur.activity_rate)}%`      : '—'} accent="var(--a)"  loading={loading} />
        <MetricCard label="Subempleo"  value={cur ? `${fmt(cur.underemployment_rate)}%` : '—'} accent="var(--am)" loading={loading} />
        {cur?.quarter && <MetricCard label="Trimestre" value={cur.quarter} accent="var(--m)" loading={loading} />}
      </div>

      {gender && !loading && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:10, marginBottom:20 }}>
          {[
            { label:'Desempleo masculino',  value:`${fmt(gender.male?.unemployment_rate)}%`,  accent:'var(--a)' },
            { label:'Desempleo femenino',   value:`${fmt(gender.female?.unemployment_rate)}%`, accent:'var(--pi)' },
            { label:'Actividad masculina',  value:`${fmt(gender.male?.activity_rate)}%`,       accent:'var(--a)' },
            { label:'Actividad femenina',   value:`${fmt(gender.female?.activity_rate)}%`,     accent:'var(--pi)' },
            { label:'Brecha salarial',      value:`${fmt(gender.wage_gap)}%`,                  accent:'var(--am)' },
          ].map((c,i) => <MetricCard key={i} {...c} />)}
        </div>
      )}

      <ChartWrap title="Mercado laboral — Evolución" sub="EPH Continua · INDEC"
        loading={loading} data={hist} csvName="empleo_historico" minH={260}>
        {hist.length === 0 ? <ErrMsg /> : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={hist} margin={{ top:4, right:8, left:0, bottom:4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" vertical={false} />
              <XAxis dataKey="quarter" stroke="var(--bd)" tick={{ fill:'var(--m)', fontSize:10 }} tickLine={false} />
              <YAxis stroke="var(--bd)" tick={{ fill:'var(--m)', fontSize:10 }} tickLine={false} tickFormatter={v => `${v}%`} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="unemployment_rate"  name="Desempleo %"  stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r:4 }} />
              <Line type="monotone" dataKey="employment_rate"    name="Empleo %"     stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r:4 }} />
              <Line type="monotone" dataKey="activity_rate"      name="Actividad %"  stroke="#0ea5e9" strokeWidth={2} dot={false} activeDot={{ r:4 }} />
              <Line type="monotone" dataKey="underemployment_rate" name="Subempleo %" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartWrap>
    </div>
  );
}
