import { useEffect, useState } from "react";
import axios from "axios";

// ─────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────
const getGlobalStyles = (theme) => `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: ${theme==="dark"?"#050810":"#f0f4f8"}; transition: background 0.3s ease; }
  :root {
    --bg:           ${theme==="dark"?"#050810":"#f0f4f8"};
    --surface:      ${theme==="dark"?"#0c1220":"#ffffff"};
    --surface2:     ${theme==="dark"?"#111827":"#f8fafc"};
    --border:       ${theme==="dark"?"rgba(99,179,237,0.08)":"rgba(100,116,139,0.12)"};
    --border-bright:${theme==="dark"?"rgba(99,179,237,0.2)":"rgba(56,189,248,0.4)"};
    --accent:#38bdf8; --accent2:#818cf8; --accent3:#34d399; --accent4:#fb923c;
    --text:         ${theme==="dark"?"#e2e8f0":"#0f172a"};
    --muted:        ${theme==="dark"?"#64748b":"#94a3b8"};
    --shadow:       ${theme==="dark"?"rgba(0,0,0,0.5)":"rgba(100,116,139,0.12)"};
    --font-display: 'Syne', sans-serif;
    --font-mono:    'DM Mono', monospace;
  }

  .sidebar-nav-item {
    display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px;
    font-family:var(--font-mono); font-size:13px; font-weight:400; color:var(--muted);
    cursor:pointer; transition:all 0.2s ease; border:1px solid transparent; letter-spacing:0.02em;
  }
  .sidebar-nav-item:hover,.sidebar-nav-item.active {
    color:var(--accent); background:rgba(56,189,248,0.06); border-color:rgba(56,189,248,0.15);
  }
  .sidebar-nav-item .nav-dot {
    width:6px; height:6px; border-radius:50%; background:var(--muted); transition:all 0.2s ease; flex-shrink:0;
  }
  .sidebar-nav-item:hover .nav-dot,.sidebar-nav-item.active .nav-dot {
    background:var(--accent); box-shadow:0 0 8px var(--accent);
  }

  .metric-card {
    background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:24px;
    position:relative; overflow:hidden; cursor:pointer;
    transition:all 0.3s cubic-bezier(0.4,0,0.2,1); box-shadow:0 2px 8px var(--shadow);
  }
  .metric-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent,rgba(56,189,248,0.4),transparent);
    opacity:0; transition:opacity 0.3s ease;
  }
  .metric-card:hover { border-color:var(--border-bright); transform:translateY(-3px); box-shadow:0 20px 40px var(--shadow),0 0 0 1px rgba(56,189,248,0.1); }
  .metric-card:hover::before { opacity:1; }
  .metric-card .glow-dot { width:8px; height:8px; border-radius:50%; position:absolute; top:18px; right:18px; animation:pulse-glow 2s ease-in-out infinite; }

  @keyframes pulse-glow { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }

  .bar-fill { height:100%; border-radius:4px; transition:width 1s cubic-bezier(0.4,0,0.2,1); }

  .activity-row {
    display:flex; align-items:center; gap:14px; border-bottom:1px solid var(--border);
    transition:background 0.2s ease; border-radius:8px; padding:12px 14px; cursor:pointer;
  }
  .activity-row:hover { background:rgba(56,189,248,0.04); }
  .activity-row:last-child { border-bottom:none; }

  .search-input::placeholder { color:var(--muted); }

  .logout-btn {
    font-family:var(--font-mono); font-size:12px; letter-spacing:0.05em; padding:9px 18px;
    background:transparent; border:1px solid rgba(251,146,60,0.3); border-radius:8px;
    color:var(--accent4); cursor:pointer; transition:all 0.2s ease;
  }
  .logout-btn:hover { background:rgba(251,146,60,0.08); border-color:rgba(251,146,60,0.5); }

  .theme-toggle { display:flex; align-items:center; background:var(--surface2); border:1px solid var(--border); border-radius:10px; padding:3px; gap:2px; }
  .theme-btn { font-size:14px; padding:6px 10px; border-radius:7px; border:none; cursor:pointer; transition:all 0.2s ease; background:transparent; color:var(--muted); line-height:1; }
  .theme-btn.active { background:var(--surface); color:var(--text); box-shadow:0 1px 4px var(--shadow); }

  @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .animate-in { animation:fadeInUp 0.5s ease forwards; opacity:0; }
  .animate-in:nth-child(1){animation-delay:0.05s} .animate-in:nth-child(2){animation-delay:0.10s}
  .animate-in:nth-child(3){animation-delay:0.15s} .animate-in:nth-child(4){animation-delay:0.20s}
  .animate-in:nth-child(5){animation-delay:0.25s} .animate-in:nth-child(6){animation-delay:0.30s}

  @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .page-enter { animation:fadeIn 0.35s ease forwards; }

  .status-indicator {
    display:inline-flex; align-items:center; gap:6px; font-family:var(--font-mono); font-size:11px;
    color:var(--accent3); background:rgba(52,211,153,0.08); border:1px solid rgba(52,211,153,0.2);
    padding:4px 10px; border-radius:20px; letter-spacing:0.05em;
  }
  .status-indicator::before {
    content:''; width:6px; height:6px; border-radius:50%; background:var(--accent3);
    box-shadow:0 0 6px var(--accent3); animation:pulse-glow 2s ease-in-out infinite;
  }

  .mini-chart-bar { width:4px; border-radius:2px; opacity:0.3; transition:opacity 0.2s; }
  .mini-chart-bar.active { opacity:1; }

  .tag { font-family:var(--font-mono); font-size:10px; letter-spacing:0.08em; padding:3px 8px; border-radius:4px; text-transform:uppercase; }

  .analytics-stat-card {
    background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:20px 24px;
    box-shadow:0 2px 8px var(--shadow); transition:all 0.25s ease;
  }
  .analytics-stat-card:hover { border-color:var(--border-bright); transform:translateY(-2px); box-shadow:0 12px 32px var(--shadow); }

  .a-table-row { display:grid; padding:12px 16px; border-bottom:1px solid var(--border); align-items:center; transition:background 0.15s ease; cursor:pointer; }
  .a-table-row:hover { background:rgba(56,189,248,0.04); }
  .a-table-row:last-child { border-bottom:none; }

  .scrollbar-hide::-webkit-scrollbar { display:none; }

  .back-btn {
    display:inline-flex; align-items:center; gap:7px; font-family:var(--font-mono); font-size:12px;
    letter-spacing:0.05em; color:var(--muted); cursor:pointer; padding:7px 14px; border-radius:8px;
    border:1px solid var(--border); background:transparent; transition:all 0.2s ease;
  }
  .back-btn:hover { color:var(--accent); border-color:rgba(56,189,248,0.25); background:rgba(56,189,248,0.05); }

  .sparkline-segment { transition:all 0.3s ease; }

  .loading-shimmer {
    background: linear-gradient(90deg, var(--surface) 25%, var(--surface2) 50%, var(--surface) 75%);
    background-size:200% 100%;
    animation:shimmer 1.5s infinite;
    border-radius:8px;
  }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

// ─────────────────────────────────────────────
// DATA CONSTANTS
// ─────────────────────────────────────────────
const METRICS = [
  { key:"users",   label:"TOTAL USERS", value:null,  fallback:"2,481", suffix:"",      color:"#38bdf8", icon:"◈", delta:"+12.4%",    deltaUp:true,  bars:[30,45,35,60,48,70,55,80,65,90]    },
  { key:"servers", label:"SERVERS",     value:null,  fallback:"24",    suffix:" nodes",color:"#818cf8", icon:"⬡", delta:"+2 today",   deltaUp:true,  bars:[60,65,70,60,75,70,80,75,85,80]    },
  { key:"uptime",  label:"UPTIME",      value:null,  fallback:"99.98%",suffix:"",      color:"#34d399", icon:"◎", delta:"30d avg",    deltaUp:true,  bars:[95,98,99,97,100,99,98,100,99,100] },
  { key:"cpu",     label:"CPU LOAD",    value:"65%", fallback:"65%",   suffix:"",      color:"#fb923c", icon:"◐", delta:"4-core avg", deltaUp:false, bars:[40,55,50,65,60,70,65,60,65,65]    },
  { key:"memory",  label:"MEMORY",      value:"8 GB",fallback:"8 GB",  suffix:" /16GB",color:"#e879f9", icon:"▣", delta:"50% used",   deltaUp:false, bars:[45,48,50,52,48,50,55,52,50,50]    },
  { key:"requests",label:"REQUESTS",    value:"1.2K",fallback:"1.2K",  suffix:"/min",  color:"#fbbf24", icon:"⟳", delta:"+8.1%",     deltaUp:true,  bars:[60,70,65,80,75,85,70,80,90,85]    },
];

const ACTIVITY = [
  { icon:"▲", color:"#34d399", label:"Server deployed",       sub:"prod-cluster-04",    time:"2m ago",  tag:"DEPLOY", tagColor:"rgba(52,211,153,0.15)",  tagText:"#34d399" },
  { icon:"◈", color:"#38bdf8", label:"New user registered",   sub:"user@example.com",   time:"14m ago", tag:"AUTH",   tagColor:"rgba(56,189,248,0.15)",  tagText:"#38bdf8" },
  { icon:"⚙", color:"#818cf8", label:"Settings updated",      sub:"Rate limits changed", time:"1h ago",  tag:"CONFIG", tagColor:"rgba(129,140,248,0.15)", tagText:"#818cf8" },
  { icon:"⟳", color:"#fbbf24", label:"App restarted",         sub:"api-service",         time:"2h ago",  tag:"SYS",    tagColor:"rgba(251,191,36,0.15)",  tagText:"#fbbf24" },
  { icon:"⬡", color:"#fb923c", label:"Load balancer updated", sub:"nginx v1.24",         time:"4h ago",  tag:"INFRA",  tagColor:"rgba(251,146,60,0.15)",  tagText:"#fb923c" },
];

const NAV = [
  { id:"dashboard", label:"Dashboard" },
  { id:"analytics", label:"Analytics" },
  { id:"servers",   label:"Servers"   },
  { id:"users",     label:"Users"     },
  { id:"logs",      label:"Logs"      },
  { id:"settings",  label:"Settings"  },
];

// ─────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────
function MiniChart({ bars, color }) {
  const max = Math.max(...bars);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:"3px", height:"32px" }}>
      {bars.map((v, i) => (
        <div key={i} className={`mini-chart-bar ${i===bars.length-1?"active":""}`}
          style={{ height:`${(v/max)*100}%`, background:color, width:"4px", borderRadius:"2px" }} />
      ))}
    </div>
  );
}

function MetricCard({ metric, apiData, index }) {
  const display = metric.value ?? (apiData[metric.key]!=null ? String(apiData[metric.key]) : metric.fallback);
  const pct = metric.key==="cpu"?65 : metric.key==="memory"?50 : metric.key==="uptime"?99.98 : null;
  return (
    <div className="metric-card animate-in" style={{ animationDelay:`${0.05+index*0.05}s` }}>
      <div className="glow-dot" style={{ background:metric.color, boxShadow:`0 0 10px ${metric.color}` }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"16px" }}>
        <div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.12em", color:"var(--muted)", marginBottom:"6px" }}>{metric.label}</div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"28px", fontWeight:"700", color:"var(--text)", lineHeight:1 }}>
            {display}{metric.suffix && <span style={{ fontSize:"14px", color:"var(--muted)", fontWeight:400 }}>{metric.suffix}</span>}
          </div>
        </div>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:"28px", color:metric.color, opacity:0.7, lineHeight:1 }}>{metric.icon}</div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <span style={{ fontFamily:"var(--font-mono)", fontSize:"11px", color:metric.deltaUp?"#34d399":"var(--muted)", letterSpacing:"0.04em" }}>
          {metric.deltaUp?"↑ ":""}{metric.delta}
        </span>
        <MiniChart bars={metric.bars} color={metric.color} />
      </div>
      {pct!==null && (
        <div style={{ marginTop:"14px" }}>
          <div style={{ background:"rgba(128,128,128,0.1)", borderRadius:"4px", height:"3px", overflow:"hidden" }}>
            <div className="bar-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${metric.color}80,${metric.color})` }} />
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeToggle({ theme, setTheme }) {
  return (
    <div className="theme-toggle">
      <button className={`theme-btn ${theme==="light"?"active":""}`} onClick={() => setTheme("light")} title="Light">☀️</button>
      <button className={`theme-btn ${theme==="dark"?"active":""}`}  onClick={() => setTheme("dark")}  title="Dark">🌙</button>
    </div>
  );
}

// ─────────────────────────────────────────────
// SPARKLINE SVG
// ─────────────────────────────────────────────
function Sparkline({ data, color, width=120, height=40 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });
  const pathD = "M" + pts.join(" L");
  const areaD = `${pathD} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${color.replace("#","")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// BAR CHART
// ─────────────────────────────────────────────
function BarChart({ data, color, labels, width=400, height=120 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const barW = Math.floor((width - (data.length - 1) * 6) / data.length);
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 20}`} style={{ overflow:"visible" }}>
      {data.map((v, i) => {
        const barH = ((v / max) * height) || 2;
        const x = i * (barW + 6);
        const y = height - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="3"
              fill={color} opacity={i === data.length - 1 ? 1 : 0.45} />
            {labels && (
              <text x={x + barW / 2} y={height + 14} textAnchor="middle"
                fontSize="8" fill="var(--muted)" fontFamily="var(--font-mono)">{labels[i]}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────
function DonutChart({ segments, size=120 }) {
  const r = 44, cx = size/2, cy = size/2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((a, s) => a + s.value, 0);
  return (
    <svg width={size} height={size}>
      {segments.map((s, i) => {
        const pct = s.value / total;
        const dash = pct * circ;
        const gap  = circ - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={s.color} strokeWidth="14"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{ transform:`rotate(-90deg)`, transformOrigin:`${cx}px ${cy}px`, transition:"stroke-dasharray 0.8s ease" }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy-4} textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text)" fontFamily="var(--font-display)">{total.toLocaleString()}</text>
      <text x={cx} y={cy+14} textAnchor="middle" fontSize="8" fill="var(--muted)" fontFamily="var(--font-mono)">TOTAL</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// ANALYTICS PAGE
// ─────────────────────────────────────────────
function AnalyticsPage({ onBack, theme }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const isLight = theme === "light";

  useEffect(() => {
    // Function to fetch analytics data
    const fetchAnalytics = () => {
      setLoading(true);
      axios.get("http://localhost:9000/analytics")
        .then(res => { 
          // Set actual system metrics from API
          setAnalyticsData(res.data);
          setLoading(false);
          setError(null);
        })
        .catch((err) => {
          console.error("Analytics API error:", err);
          setError(true);
          setAnalyticsData(null);
          setLoading(false);
        });
    };

    // Fetch immediately on component mount
    fetchAnalytics();

    // Set up auto-refresh every 10 seconds
    const interval = setInterval(fetchAnalytics, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const TABS = ["overview", "traffic", "pages"];

  const StatCard = ({ label, value, delta, deltaUp, trend, color }) => (
    <div className="analytics-stat-card">
      <div style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.14em", color:"var(--muted)", marginBottom:"6px" }}>{label}</div>
      <div style={{ fontFamily:"var(--font-display)", fontSize:"26px", fontWeight:"800", color:"var(--text)", lineHeight:1, marginBottom:"8px" }}>{value}</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <span style={{ fontFamily:"var(--font-mono)", fontSize:"11px", color: deltaUp ? "#34d399" : "#fb923c", letterSpacing:"0.04em" }}>
          {deltaUp ? "↑" : "↓"} {delta}
        </span>
        <Sparkline data={trend} color={color} width={100} height={36} />
      </div>
    </div>
  );

  return (
    <div className="page-enter" style={{ padding:"32px", flex:1 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"28px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          <button className="back-btn" onClick={onBack}>← BACK</button>
          <div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.14em", color:"var(--muted)", marginBottom:"4px" }}>ANALYTICS</div>
            <h2 style={{ margin:0, fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"22px", letterSpacing:"-0.03em" }}>Performance Insights</h2>
          </div>
        </div>
        <div style={{ display:"flex", gap:"4px", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"10px", padding:"4px" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              fontFamily:"var(--font-mono)", fontSize:"11px", letterSpacing:"0.06em",
              padding:"7px 16px", borderRadius:"7px", border:"none", cursor:"pointer",
              textTransform:"uppercase", transition:"all 0.2s ease",
              background: activeTab===t ? "var(--accent)" : "transparent",
              color: activeTab===t ? "#000" : "var(--muted)",
              fontWeight: activeTab===t ? "500" : "400",
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"16px", marginBottom:"24px" }}>
          {[1,2,3,4].map(i => <div key={i} className="loading-shimmer" style={{ height:"110px" }} />)}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ padding:"20px", background:"rgba(251,146,60,0.08)", border:"1px solid rgba(251,146,60,0.2)", borderRadius:"12px", fontFamily:"var(--font-mono)", fontSize:"13px", color:"var(--accent4)", marginBottom:"24px" }}>
          ⚠ Could not reach analytics API — showing cached data.
        </div>
      )}

      {/* Content */}
      {!loading && analyticsData && (
        <>
          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:"16px", marginBottom:"28px" }}>
                {/* CPU Usage */}
                <div className="analytics-stat-card">
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.14em", color:"var(--muted)", marginBottom:"6px" }}>CPU USAGE</div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:"26px", fontWeight:"800", color:"var(--text)", lineHeight:1, marginBottom:"8px" }}>{analyticsData.cpu?.toFixed(1)}%</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", marginBottom:"8px" }}>{((analyticsData.cpu || 0) * 0.28).toFixed(2)} / 28 GHz</div>
                  <div style={{ height:"6px", background:"var(--border)", borderRadius:"3px", overflow:"hidden", marginTop:"8px" }}>
                    <div style={{ height:"100%", width:`${analyticsData.cpu}%`, background:"#38bdf8", borderRadius:"3px", transition:"width 0.3s ease" }} />
                  </div>
                </div>

                {/* RAM Usage */}
                <div className="analytics-stat-card">
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.14em", color:"var(--muted)", marginBottom:"6px" }}>RAM USAGE</div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:"26px", fontWeight:"800", color:"var(--text)", lineHeight:1, marginBottom:"8px" }}>{analyticsData.ram?.toFixed(1)}%</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", marginBottom:"8px" }}>{analyticsData.used_ram?.toFixed(2)} / {analyticsData.total_ram?.toFixed(2)} GB</div>
                  <div style={{ height:"6px", background:"var(--border)", borderRadius:"3px", overflow:"hidden", marginTop:"8px" }}>
                    <div style={{ height:"100%", width:`${analyticsData.ram}%`, background:"#818cf8", borderRadius:"3px", transition:"width 0.3s ease" }} />
                  </div>
                </div>

                {/* Disk Usage */}
                <div className="analytics-stat-card">
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.14em", color:"var(--muted)", marginBottom:"6px" }}>DISK USAGE</div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:"26px", fontWeight:"800", color:"var(--text)", lineHeight:1, marginBottom:"8px" }}>{analyticsData.disk?.toFixed(1)}%</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", marginBottom:"8px" }}>{((analyticsData.disk || 0) * 5.12).toFixed(2)} / 512 GB</div>
                  <div style={{ height:"6px", background:"var(--border)", borderRadius:"3px", overflow:"hidden", marginTop:"8px" }}>
                    <div style={{ height:"100%", width:`${analyticsData.disk}%`, background:"#fb923c", borderRadius:"3px", transition:"width 0.3s ease" }} />
                  </div>
                </div>
              </div>

              {/* System Status Card */}
              <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"24px", boxShadow:"0 2px 8px var(--shadow)" }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.14em", color:"var(--muted)", marginBottom:"4px" }}>SYSTEM METRICS</div>
                <h3 style={{ margin:"0 0 20px", fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"16px" }}>Resource Usage Graphs</h3>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:"20px" }}>
                  
                  {/* CPU Graph */}
                  <div style={{ padding:"16px", background:"var(--surface2)", borderRadius:"12px", border:"1px solid var(--border)" }}>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", marginBottom:"12px", textTransform:"uppercase", letterSpacing:"0.05em" }}>CPU Usage</div>
                    <div style={{ position:"relative", height:"120px", marginBottom:"12px" }}>
                      <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none" style={{ display:"block" }}>
                        <defs>
                          <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        {/* Background grid */}
                        <line x1="0" y1="25" x2="200" y2="25" stroke="var(--border)" strokeWidth="0.5" opacity="0.3"/>
                        <line x1="0" y1="50" x2="200" y2="50" stroke="var(--border)" strokeWidth="0.5" opacity="0.3"/>
                        <line x1="0" y1="75" x2="200" y2="75" stroke="var(--border)" strokeWidth="0.5" opacity="0.3"/>
                        {/* Bar for CPU usage */}
                        <rect x="10" y={100 - (analyticsData.cpu || 0)} width="180" height={analyticsData.cpu || 0} fill="url(#cpuGrad)" rx="2"/>
                        <rect x="10" y={100 - (analyticsData.cpu || 0)} width="180" height={analyticsData.cpu || 0} fill="none" stroke="#38bdf8" strokeWidth="1.5" rx="2"/>
                      </svg>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontFamily:"var(--font-display)", fontSize:"20px", fontWeight:"700", color:"#38bdf8" }}>{analyticsData.cpu?.toFixed(1)}%</div>
                        <div style={{ fontFamily:"var(--font-mono)", fontSize:"9px", color:"var(--muted)", marginTop:"2px" }}>{((analyticsData.cpu || 0) * 0.28).toFixed(2)} GHz</div>
                      </div>
                    </div>
                  </div>

                  {/* RAM Graph */}
                  <div style={{ padding:"16px", background:"var(--surface2)", borderRadius:"12px", border:"1px solid var(--border)" }}>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", marginBottom:"12px", textTransform:"uppercase", letterSpacing:"0.05em" }}>RAM Usage</div>
                    <div style={{ position:"relative", height:"120px", marginBottom:"12px" }}>
                      <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none" style={{ display:"block" }}>
                        <defs>
                          <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        {/* Background grid */}
                        <line x1="0" y1="25" x2="200" y2="25" stroke="var(--border)" strokeWidth="0.5" opacity="0.3"/>
                        <line x1="0" y1="50" x2="200" y2="50" stroke="var(--border)" strokeWidth="0.5" opacity="0.3"/>
                        <line x1="0" y1="75" x2="200" y2="75" stroke="var(--border)" strokeWidth="0.5" opacity="0.3"/>
                        {/* Bar for RAM usage */}
                        <rect x="10" y={100 - (analyticsData.ram || 0)} width="180" height={analyticsData.ram || 0} fill="url(#ramGrad)" rx="2"/>
                        <rect x="10" y={100 - (analyticsData.ram || 0)} width="180" height={analyticsData.ram || 0} fill="none" stroke="#818cf8" strokeWidth="1.5" rx="2"/>
                      </svg>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontFamily:"var(--font-display)", fontSize:"20px", fontWeight:"700", color:"#818cf8" }}>{analyticsData.ram?.toFixed(1)}%</div>
                        <div style={{ fontFamily:"var(--font-mono)", fontSize:"9px", color:"var(--muted)", marginTop:"2px" }}>{analyticsData.used_ram?.toFixed(2)} / {analyticsData.total_ram?.toFixed(2)} GB</div>
                      </div>
                    </div>
                  </div>

                  {/* DISK Graph */}
                  <div style={{ padding:"16px", background:"var(--surface2)", borderRadius:"12px", border:"1px solid var(--border)" }}>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", marginBottom:"12px", textTransform:"uppercase", letterSpacing:"0.05em" }}>DISK Usage</div>
                    <div style={{ position:"relative", height:"120px", marginBottom:"12px" }}>
                      <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none" style={{ display:"block" }}>
                        <defs>
                          <linearGradient id="diskGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#fb923c" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        {/* Background grid */}
                        <line x1="0" y1="25" x2="200" y2="25" stroke="var(--border)" strokeWidth="0.5" opacity="0.3"/>
                        <line x1="0" y1="50" x2="200" y2="50" stroke="var(--border)" strokeWidth="0.5" opacity="0.3"/>
                        <line x1="0" y1="75" x2="200" y2="75" stroke="var(--border)" strokeWidth="0.5" opacity="0.3"/>
                        {/* Bar for DISK usage */}
                        <rect x="10" y={100 - (analyticsData.disk || 0)} width="180" height={analyticsData.disk || 0} fill="url(#diskGrad)" rx="2"/>
                        <rect x="10" y={100 - (analyticsData.disk || 0)} width="180" height={analyticsData.disk || 0} fill="none" stroke="#fb923c" strokeWidth="1.5" rx="2"/>
                      </svg>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontFamily:"var(--font-display)", fontSize:"20px", fontWeight:"700", color:"#fb923c" }}>{analyticsData.disk?.toFixed(1)}%</div>
                        <div style={{ fontFamily:"var(--font-mono)", fontSize:"9px", color:"var(--muted)", marginTop:"2px" }}>{((analyticsData.disk || 0) * 5.12).toFixed(2)} / 512 GB</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── TRAFFIC TAB ── */}
          {activeTab === "traffic" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
              <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"24px", boxShadow:"0 2px 8px var(--shadow)" }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.14em", color:"var(--muted)", marginBottom:"4px" }}>REAL-TIME</div>
                <h3 style={{ margin:"0 0 20px", fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"16px" }}>System Resources</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                  <div style={{ padding:"20px", background:"var(--surface2)", borderRadius:"12px", border:"1px solid var(--border)" }}>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", marginBottom:"12px" }}>CPU TEMPERATURE</div>
                    <div style={{ fontFamily:"var(--font-display)", fontSize:"24px", fontWeight:"700", color:"#38bdf8" }}>{analyticsData.temperature ? analyticsData.temperature.toFixed(1) : (30 + (analyticsData.cpu || 0) * 0.5).toFixed(1)}°C</div>
                  </div>
                  <div style={{ padding:"20px", background:"var(--surface2)", borderRadius:"12px", border:"1px solid var(--border)" }}>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", marginBottom:"12px" }}>UPTIME</div>
                    <div style={{ fontFamily:"var(--font-display)", fontSize:"24px", fontWeight:"700", color:"#34d399" }}>{analyticsData.uptime || "45d 2h"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PAGES TAB ── */}
          {activeTab === "pages" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
              <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"24px", boxShadow:"0 2px 8px var(--shadow)" }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.14em", color:"var(--muted)", marginBottom:"4px" }}>DETAILS</div>
                <h3 style={{ margin:"0 0 20px", fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"16px" }}>System Information</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                  <div style={{ padding:"16px", background:"var(--surface2)", borderRadius:"12px", border:"1px solid var(--border)" }}>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", marginBottom:"8px" }}>LAST UPDATE</div>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:"13px", color:"var(--text)" }}>Just now</div>
                  </div>
                  <div style={{ padding:"16px", background:"var(--surface2)", borderRadius:"12px", border:"1px solid var(--border)" }}>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", marginBottom:"8px" }}>STATUS</div>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:"13px", color: analyticsData.health_color === "critical" ? "#fb923c" : analyticsData.health_color === "warning" ? "#fbbf24" : "#34d399" }}>
                      ● {analyticsData.health_status || "Healthy"}
                    </div>
                  </div>
                </div>
              </div>

              {/* System Health Logs */}
              <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"24px", boxShadow:"0 2px 8px var(--shadow)" }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.14em", color:"var(--muted)", marginBottom:"4px" }}>LOGS</div>
                <h3 style={{ margin:"0 0 16px", fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"16px" }}>Health Logs</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  {analyticsData.logs && analyticsData.logs.map((log, i) => {
                    const logColor = log.level === "critical" ? "#fb923c" : log.level === "warning" ? "#fbbf24" : "#34d399";
                    const logBg = log.level === "critical" ? "rgba(251,146,60,0.08)" : log.level === "warning" ? "rgba(251,191,36,0.08)" : "rgba(52,211,153,0.08)";
                    return (
                      <div key={i} style={{ padding:"12px", background:logBg, border:`1px solid ${logColor}40`, borderRadius:"8px", display:"flex", alignItems:"center", gap:"12px" }}>
                        <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:logColor, flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontFamily:"var(--font-mono)", fontSize:"11px", color:logColor, fontWeight:"500", letterSpacing:"0.05em" }}>{log.metric}</div>
                          <div style={{ fontFamily:"var(--font-mono)", fontSize:"12px", color:"var(--text)", marginTop:"2px" }}>{log.message}</div>
                        </div>
                        <div style={{ fontFamily:"var(--font-display)", fontSize:"14px", fontWeight:"700", color:logColor }}>{log.value.toFixed(1)}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD PAGE
// ─────────────────────────────────────────────
function DashboardPage({ data, isLight }) {
  const trackBg = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.04)";
  return (
    <div className="page-enter" style={{ padding:"32px", flex:1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.14em", color:"var(--muted)", marginBottom:"6px" }}>SYSTEM METRICS</div>
          <h2 style={{ margin:0, fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"22px", letterSpacing:"-0.03em" }}>Live Performance</h2>
        </div>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:"11px", color:"var(--muted)", display:"flex", alignItems:"center", gap:"8px" }}>
          <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#34d399", display:"inline-block", boxShadow:"0 0 6px #34d399" }} />
          Refreshing every 30s
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"16px", marginBottom:"32px" }}>
        {METRICS.map((m, i) => <MetricCard key={m.key} metric={m} apiData={data} index={i} />)}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"20px" }}>
        {/* Activity */}
        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"24px", boxShadow:"0 2px 8px var(--shadow)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
            <div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.14em", color:"var(--muted)", marginBottom:"4px" }}>ACTIVITY FEED</div>
              <h3 style={{ margin:0, fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"16px" }}>Recent Events</h3>
            </div>
            <span style={{ fontFamily:"var(--font-mono)", fontSize:"11px", color:"var(--accent)", cursor:"pointer", letterSpacing:"0.05em" }}>VIEW ALL →</span>
          </div>
          <div>
            {ACTIVITY.map((item, i) => (
              <div key={i} className="activity-row">
                <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:`${item.color}18`, border:`1px solid ${item.color}30`, display:"flex", alignItems:"center", justifyContent:"center", color:item.color, fontSize:"14px", flexShrink:0 }}>{item.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:"13px", fontWeight:"600", marginBottom:"2px" }}>{item.label}</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:"11px", color:"var(--muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.sub}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"5px", flexShrink:0 }}>
                  <span className="tag" style={{ background:item.tagColor, color:item.tagText }}>{item.tag}</span>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)" }}>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Server Health */}
        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"24px", boxShadow:"0 2px 8px var(--shadow)" }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.14em", color:"var(--muted)", marginBottom:"4px" }}>CLUSTER STATUS</div>
          <h3 style={{ margin:"0 0 20px", fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"16px" }}>Server Health</h3>
          {[
            { name:"prod-cluster-01", pct:92, color:"#34d399", status:"HEALTHY" },
            { name:"prod-cluster-02", pct:78, color:"#38bdf8", status:"HEALTHY" },
            { name:"staging-01",      pct:45, color:"#fbbf24", status:"WARN"    },
            { name:"dev-cluster",     pct:21, color:"#818cf8", status:"IDLE"    },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom:"18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                <span style={{ fontFamily:"var(--font-mono)", fontSize:"12px", color:"var(--text)" }}>{s.name}</span>
                <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                  <span className="tag" style={{ background:`${s.color}18`, color:s.color }}>{s.status}</span>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:"11px", color:s.color }}>{s.pct}%</span>
                </div>
              </div>
              <div style={{ background:trackBg, borderRadius:"4px", height:"4px", overflow:"hidden" }}>
                <div className="bar-fill" style={{ width:`${s.pct}%`, background:`linear-gradient(90deg,${s.color}60,${s.color})` }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop:"8px", padding:"14px", background:"rgba(56,189,248,0.04)", border:"1px solid rgba(56,189,248,0.12)", borderRadius:"10px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"var(--font-mono)", fontSize:"11px", color:"var(--muted)" }}>AVG LOAD</span>
            <span style={{ fontFamily:"var(--font-display)", fontSize:"18px", fontWeight:"700", color:"var(--accent)" }}>59%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT COMPONENT
// ─────────────────────────────────────────────
function Dashboard() {
  const [data, setData]           = useState({});
  const [activeNav, setActiveNav] = useState(() => {
    // Load from localStorage on initial render
    return localStorage.getItem("activeNav") || "dashboard";
  });
  const [time, setTime]           = useState(new Date());
  const [theme, setTheme]         = useState(() => {
    // Load from localStorage on initial render
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/"; return; }
    axios.get("http://localhost:8000/dashboard", { params:{ token } })
      .then(res => setData(res.data))
      .catch(() => alert("Unauthorized"));
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Save activeNav to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activeNav", activeNav);
  }, [activeNav]);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const logout = () => { localStorage.removeItem("token"); window.location.href = "/"; };

  const timeStr = time.toLocaleTimeString("en-US", { hour12:false });
  const dateStr = time.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });
  const isLight = theme === "light";

  // PAGE TITLES
  const pageTitles = { dashboard:"Overview", analytics:"Analytics", servers:"Servers", users:"Users", logs:"Logs", settings:"Settings" };

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"var(--font-display)", background:"var(--bg)", color:"var(--text)", transition:"background 0.3s ease, color 0.3s ease" }}>
      <style>{getGlobalStyles(theme)}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width:"220px", background:"var(--surface)",
        borderRight:`1px solid ${isLight?"rgba(100,116,139,0.12)":"rgba(99,179,237,0.08)"}`,
        display:"flex", flexDirection:"column", padding:"28px 16px",
        flexShrink:0, position:"sticky", top:0, height:"100vh",
        boxShadow: isLight ? "2px 0 12px rgba(100,116,139,0.08)" : "none",
        transition:"background 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ padding:"0 8px 28px", borderBottom:"1px solid var(--border)", marginBottom:"24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:"linear-gradient(135deg,#38bdf8,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", color:"#fff" }}>◈</div>
            <div>
              <div style={{ fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"15px", letterSpacing:"-0.02em" }}>Satluj.UI</div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:"9px", color:"var(--muted)", letterSpacing:"0.1em" }}>CONTROL PANEL</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:"3px" }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.14em", color:"var(--muted)", padding:"0 8px", marginBottom:"8px" }}>NAVIGATION</div>
          {NAV.map(item => (
            <div key={item.id} className={`sidebar-nav-item ${activeNav===item.id?"active":""}`} onClick={() => setActiveNav(item.id)}>
              <div className="nav-dot" />{item.label}
            </div>
          ))}
        </nav>

        {/* Clock */}
        <div style={{ padding:"16px", background:isLight?"rgba(56,189,248,0.06)":"rgba(56,189,248,0.04)", border:"1px solid var(--border)", borderRadius:"12px", textAlign:"center" }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"22px", fontWeight:"500", color:"var(--accent)", letterSpacing:"0.05em" }}>{timeStr}</div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", letterSpacing:"0.08em", marginTop:"4px" }}>{dateStr}</div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflowY:"auto" }} className="scrollbar-hide">

        {/* Topbar */}
        <header style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"20px 32px",
          borderBottom:`1px solid ${isLight?"rgba(100,116,139,0.12)":"rgba(99,179,237,0.08)"}`,
          background:"var(--surface)", position:"sticky", top:0, zIndex:10,
          boxShadow: isLight ? "0 2px 8px rgba(100,116,139,0.08)" : "none",
          transition:"background 0.3s ease",
        }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:"16px" }}>
            <h1 style={{ margin:0, fontFamily:"var(--font-display)", fontSize:"20px", fontWeight:"800", letterSpacing:"-0.03em" }}>{pageTitles[activeNav]}</h1>
            <div className="status-indicator">ALL SYSTEMS NOMINAL</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"8px", padding:"8px 14px" }}>
              <span style={{ fontFamily:"var(--font-mono)", fontSize:"13px", color:"var(--muted)" }}>⌕</span>
              <input type="text" placeholder="Search..." className="search-input"
                style={{ background:"transparent", border:"none", outline:"none", color:"var(--text)", fontFamily:"var(--font-mono)", fontSize:"13px", width:"160px" }} />
              <span style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--muted)", background:"var(--border)", padding:"2px 6px", borderRadius:"4px" }}>⌘K</span>
            </div>
            <button style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"8px", padding:"8px 12px", cursor:"pointer", color:"var(--muted)", fontSize:"14px", lineHeight:1, transition:"all 0.2s", position:"relative" }}>
              🔔
              <span style={{ position:"absolute", top:"6px", right:"6px", width:"6px", height:"6px", borderRadius:"50%", background:"#fb923c", boxShadow:"0 0 6px #fb923c" }} />
            </button>
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <button className="logout-btn" onClick={logout}>LOGOUT</button>
          </div>
        </header>

        {/* ── Page Router ── */}
        {activeNav === "dashboard" && <DashboardPage data={data} isLight={isLight} />}
        {activeNav === "analytics" && <AnalyticsPage onBack={() => setActiveNav("dashboard")} theme={theme} />}

        {/* Placeholder for other pages */}
        {!["dashboard","analytics"].includes(activeNav) && (
          <div className="page-enter" style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"12px", padding:"32px" }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:"40px", opacity:0.15 }}>◈</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:"20px", fontWeight:"700", color:"var(--text)", opacity:0.4 }}>{pageTitles[activeNav]}</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:"12px", color:"var(--muted)", letterSpacing:"0.06em" }}>COMING SOON</div>
          </div>
        )}
      </main>

      {/* Watermark */}
      <div style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        fontFamily: "var(--font-mono)",
        fontSize: "13px",
        fontWeight: "500",
        color: isLight ? "#64748b" : "#94a3b8",
        opacity: 0.85,
        pointerEvents: "none",
        letterSpacing: "0.05em",
        padding: "8px 12px",
        background: isLight ? "rgba(226,232,240,0.5)" : "rgba(15,23,42,0.5)",
        border: isLight ? "1px solid rgba(100,116,139,0.2)" : "1px solid rgba(99,179,237,0.1)",
        borderRadius: "6px",
        backdropFilter: "blur(4px)"
      }}>
        Powered by Ayush Bakaya
      </div>
    </div>
  );
}

export default Dashboard;