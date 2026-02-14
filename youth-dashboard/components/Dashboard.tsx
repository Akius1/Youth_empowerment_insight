"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import {
  Users, Briefcase, GraduationCap, MapPin,
  Download, RefreshCw, Search, Filter, ChevronDown,
  FileText, Table, Sun, Moon, TrendingUp, BookOpen,
  X,
} from "lucide-react";

/* ─── Types ───────────────────────────────────────────────────── */
interface DashboardData {
  respondents: any[];
  stats: any;
  total: number;
  filteredCount: number;
  lastUpdated: string;
}
type Theme = "dark" | "light";
type TabId  = "overview" | "branches" | "table";

/* ─── Chart palette ───────────────────────────────────────────── */
const PALETTE = [
  "#10d9a0","#3b82f6","#f59e0b","#a855f7",
  "#f43f5e","#06b6d4","#84cc16","#fb923c",
  "#e879f9","#34d399","#fcd34d","#67e8f9",
];

/* ─── Custom tooltip ──────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label, theme }: any) => {
  if (!active || !payload?.length) return null;
  const isDark = theme === "dark";
  return (
    <div style={{
      background: isDark ? "#0c1830" : "#ffffff",
      border: `1px solid ${isDark ? "rgba(16,217,160,0.25)" : "rgba(5,150,105,0.20)"}`,
      borderRadius: 10,
      padding: "10px 14px",
      boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(15,40,60,0.12)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: 13,
      minWidth: 120,
    }}>
      {label && (
        <p style={{ color: isDark ? "#8da8b8" : "#4a6070", fontSize: 11, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
          {label}
        </p>
      )}
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, fontWeight: 700, margin: "2px 0" }}>
          {entry.name !== "value" && entry.name !== "count" ? `${entry.name}: ` : ""}
          <span style={{ color: isDark ? "#e8f4f8" : "#0d1c28" }}>{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ─── Main Dashboard ──────────────────────────────────────────── */
export default function Dashboard() {
  const [theme, setTheme]       = useState<Theme>("dark");
  const [data, setData]         = useState<DashboardData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState<TabId>("overview");
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting]   = useState<string | null>(null);
  const [tablePage, setTablePage]   = useState(0);
  const [filters, setFilters] = useState({
    gender: "all", employment: "all", education: "all",
    marital: "all", branch: "all", search: "",
  });

  const PAGE_SIZE = 15;
  const isDark = theme === "dark";

  // Axis / grid colours derived from theme
  const AXIS  = isDark ? "#4a6a7a" : "#8da8b8";
  const GRID  = isDark ? "rgba(255,255,255,0.04)" : "rgba(15,40,60,0.065)";

  /* ── Theme init & toggle ──────────────────────────────────── */
  useEffect(() => {
    const stored = localStorage.getItem("ye-theme");
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = (stored as Theme) || (system ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("ye-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  /* ── Data fetch ───────────────────────────────────────────── */
  const fetchData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const params = new URLSearchParams(filters as any);
      const res  = await fetch(`/api/data?${params}`);
      const json = await res.json();
      setData(json);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Exports ──────────────────────────────────────────────── */
  const download = async (url: string, filename: string) => {
    const res  = await fetch(url);
    const blob = await res.blob();
    const a    = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob), download: filename,
    });
    a.click();
  };

  const handleExport = async (fmt: "csv" | "excel") => {
    setExporting(fmt);
    const date = new Date().toISOString().split("T")[0];
    if (fmt === "excel") await download("/api/export/excel", `youth-empowerment-${date}.xlsx`);
    else                 await download("/api/export/csv?type=respondents", `youth-empowerment-${date}.csv`);
    setExporting(null);
  };

  const handleStatsCsv = async () => {
    setExporting("stats");
    await download("/api/export/csv?type=stats", `youth-stats-${new Date().toISOString().split("T")[0]}.csv`);
    setExporting(null);
  };

  const handlePDF = async () => {
    setExporting("pdf");
    try {
      const { default: jsPDF }    = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc   = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const stats = data!.stats;
      const total = data!.filteredCount;
      const DARK_BG  = [4, 9, 15] as [number,number,number];
      const CARD_BG  = [8, 15, 28] as [number,number,number];
      const ROW_BG   = [12, 24, 44] as [number,number,number];
      const ACCENT   = [16, 217, 160] as [number,number,number];
      const AMBER_C  = [245, 158, 11] as [number,number,number];
      const TEXT_L   = [240, 249, 255] as [number,number,number];
      const TEXT_M   = [140, 168, 184] as [number,number,number];

      // Header
      doc.setFillColor(...DARK_BG); doc.rect(0, 0, 210, 52, "F");
      doc.setTextColor(...ACCENT); doc.setFontSize(20); doc.setFont("helvetica","bold");
      doc.text("YOUTH EMPOWERMENT PROGRAM", 105, 20, { align: "center" });
      doc.setFontSize(11); doc.setTextColor(...TEXT_M);
      doc.text("Analytics Report — Dunamis International Gospel Centre", 105, 31, { align: "center" });
      doc.setFontSize(9); doc.setTextColor(80, 110, 130);
      doc.text(`Generated: ${new Date().toLocaleString()}  ·  Respondents: ${total}`, 105, 44, { align: "center" });

      let y = 60;
      const section = (title: string) => {
        doc.setTextColor(...ACCENT); doc.setFontSize(11); doc.setFont("helvetica","bold");
        doc.text(title, 14, y); y += 6;
      };

      section("SUMMARY OVERVIEW");
      autoTable(doc, {
        startY: y,
        body: [
          ["Total Registrations", String(total), "Branches Covered", String(Object.keys(stats.branchBreakdown).length)],
          ["Male", String(stats.genderBreakdown.Male||0), "Female", String(stats.genderBreakdown.Female||0)],
          ["Employed", String(stats.employmentBreakdown.Employed||0), "Unemployed", String(stats.employmentBreakdown.Unemployed||0)],
          ["Students", String(stats.employmentBreakdown.Student||0), "Self Employed", String(stats.employmentBreakdown["Self Employed"]||0)],
        ],
        theme: "grid",
        styles: { fillColor: CARD_BG, textColor: TEXT_L, fontSize: 10, cellPadding: 4 },
        alternateRowStyles: { fillColor: ROW_BG },
        columnStyles: { 0: { fontStyle:"bold", textColor: ACCENT }, 2: { fontStyle:"bold", textColor: ACCENT } },
      });

      y = (doc as any).lastAutoTable.finalY + 10;
      section("EDUCATION LEVEL BREAKDOWN");
      autoTable(doc, {
        startY: y,
        head: [["Education Level","Count","Percentage"]],
        body: Object.entries(stats.educationBreakdown)
          .sort(([,a],[,b]) => (b as number)-(a as number))
          .map(([k,v]) => [k, v, `${Math.round(((v as number)/total)*100)}%`]) as any,
        theme: "striped",
        headStyles: { fillColor: ACCENT, textColor: DARK_BG },
        styles: { fillColor: CARD_BG, textColor: TEXT_L },
        alternateRowStyles: { fillColor: ROW_BG },
      });

      y = (doc as any).lastAutoTable.finalY + 10;
      if (y > 250) { doc.addPage(); y = 20; }
      section("TOP BRANCHES BY REGISTRATION");
      autoTable(doc, {
        startY: y,
        head: [["Branch","Count","% Share"]],
        body: stats.topBranches.slice(0,15).map((b: any) => [b.name, b.count, `${b.percentage}%`]),
        theme: "striped",
        headStyles: { fillColor: AMBER_C, textColor: DARK_BG },
        styles: { fillColor: CARD_BG, textColor: TEXT_L, fontSize: 9 },
        alternateRowStyles: { fillColor: ROW_BG },
      });

      doc.addPage();
      doc.setFillColor(...DARK_BG); doc.rect(0,0,210,20,"F");
      doc.setTextColor(...ACCENT); doc.setFontSize(12); doc.setFont("helvetica","bold");
      doc.text("COMPLETE RESPONDENTS LIST", 105, 13, { align: "center" });
      autoTable(doc, {
        startY: 25,
        head: [["#","Full Name","Gender","Employment","Education","Branch"]],
        body: data!.respondents.slice(0,200).map((r:any,i:number) => [i+1,r.fullName,r.gender,r.employmentStatus,r.education,r.branch]),
        theme: "striped",
        headStyles: { fillColor: ACCENT, textColor: DARK_BG, fontSize: 9 },
        styles: { fillColor: CARD_BG, textColor: TEXT_L, fontSize: 8 },
        alternateRowStyles: { fillColor: ROW_BG },
        columnStyles: { 0:{cellWidth:8}, 1:{cellWidth:44}, 5:{cellWidth:40} },
      });

      doc.save(`youth-empowerment-report-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch(e) { console.error(e); }
    setExporting(null);
  };

  /* ── Loading screen ───────────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      flexDirection:"column", gap:16 }}>
      <div style={{ width:44, height:44, border:"2.5px solid var(--accent)",
        borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.9s linear infinite" }} />
      <p style={{ color:"var(--text-muted)", fontSize:14, fontWeight:500, letterSpacing:"0.02em" }}>
        Loading dashboard…
      </p>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"#f43f5e", fontSize:14 }}>Failed to load data.</p>
    </div>
  );

  /* ── Derived chart data ───────────────────────────────────── */
  const { stats, filteredCount, total } = data;

  const genderData     = Object.entries(stats.genderBreakdown).map(([name,value]) => ({ name, value: value as number }));
  const employmentData = Object.entries(stats.employmentBreakdown).map(([name,value]) => ({ name, value: value as number })).sort((a,b)=>b.value-a.value);
  const educationData  = Object.entries(stats.educationBreakdown).map(([name,value]) => ({ name, value: value as number })).sort((a,b)=>b.value-a.value);
  const maritalData    = Object.entries(stats.maritalBreakdown).filter(([k])=>k&&k!=="Unknown").map(([name,value]) => ({ name, value: value as number }));
  const locationData   = Object.entries(stats.locationBreakdown).map(([name,value]) => ({ name, value: value as number })).sort((a,b)=>b.value-a.value).slice(0,8);
  const courseData     = Object.entries(stats.courseCategories).map(([name,value]) => ({ name, value: value as number })).sort((a,b)=>b.value-a.value);

  const uniqueBranches = [...new Set(data.respondents.map((r:any) => r.branch))].filter(Boolean).sort() as string[];
  const paginated      = data.respondents.slice(tablePage * PAGE_SIZE, (tablePage+1) * PAGE_SIZE);
  const totalPages     = Math.ceil(data.respondents.length / PAGE_SIZE);

  const activeFilterCount = Object.entries(filters).filter(([k,v]) => k !== "search" && v !== "all").length
    + (filters.search ? 1 : 0);

  /* ─────────────────────────────────────────────────────────── */
  /* SUB-COMPONENTS                                              */
  /* ─────────────────────────────────────────────────────────── */

  const StatCard = ({ icon: Icon, label, value, sub, accent, delay = "d0" }: any) => (
    <div className={`stat-card p-5 anim-fade-up ${delay}`}>
      <div className="stat-card-accent" style={{ background: accent }} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ width:36, height:36, borderRadius:9, display:"flex", alignItems:"center",
          justifyContent:"center", background:`${accent}18`, border:`1px solid ${accent}30` }}>
          <Icon size={17} style={{ color: accent }} />
        </div>
        <span className="section-label" style={{ color:"var(--text-muted)" }}>{sub}</span>
      </div>
      <div className="display-num" style={{ marginBottom:4 }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:500 }}>{label}</div>
    </div>
  );

  const ChartSection = ({ title, subtitle, children, style }: any) => (
    <div className="chart-card" style={style}>
      <div style={{ padding:"20px 22px 0" }}>
        <div className="chart-title">{title}</div>
        <div className="chart-sub">{subtitle}</div>
      </div>
      <div style={{ padding:"16px 22px 20px" }}>{children}</div>
    </div>
  );

  /* ─────────────────────────────────────────────────────────── */
  /* RENDER                                                       */
  /* ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ maxWidth:1400, margin:"0 auto", padding:"28px 20px 60px" }}>

      {/* ── HEADER ── */}
      <header style={{ marginBottom:28 }}>
        <div style={{ display:"flex", flexWrap:"wrap", alignItems:"flex-start",
          justifyContent:"space-between", gap:16 }}>

          {/* Brand */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <div className="live-dot" />
              <span style={{ fontSize:11, fontWeight:700, textTransform:"uppercase",
                letterSpacing:"0.08em", color:"var(--accent)" }}>Live Analytics</span>
            </div>
            <h1 className="page-title" style={{ fontSize:"clamp(1.5rem,4vw,2.2rem)", lineHeight:1.1, marginBottom:6 }}>
              Youth Empowerment{" "}
              <span style={{ color:"var(--accent)" }}>Dashboard</span>
            </h1>
            <p style={{ fontSize:13, color:"var(--text-muted)", maxWidth:480, lineHeight:1.6 }}>
              Dunamis International Gospel Centre · Registrations across all branches
            </p>
          </div>

          {/* Controls */}
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8 }}>
            {/* Theme toggle */}
            <button className="theme-toggle" onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
              {isDark
                ? <Sun size={17} />
                : <Moon size={17} />}
            </button>

            {/* Sync */}
            <button className="btn btn-sync" onClick={() => fetchData(true)} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? "anim-spin" : ""} />
              Sync Sheet
            </button>

            {/* Exports */}
            <button className="btn btn-rose" onClick={handlePDF} disabled={exporting === "pdf"}>
              <FileText size={14} />
              {exporting === "pdf" ? "Generating…" : "PDF"}
            </button>
            <button className="btn btn-green" onClick={() => handleExport("excel")} disabled={exporting === "excel"}>
              <Table size={14} />
              {exporting === "excel" ? "…" : "Excel"}
            </button>
            <button className="btn btn-blue" onClick={() => handleExport("csv")} disabled={exporting === "csv"}>
              <Download size={14} />
              {exporting === "csv" ? "…" : "CSV"}
            </button>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:12, flexWrap:"wrap" }}>
          <hr className="divider" style={{ flex:1, minWidth:40 }} />
          <span style={{ fontSize:11.5, color:"var(--text-muted)", whiteSpace:"nowrap" }}>
            Last synced {new Date(data.lastUpdated).toLocaleString()}
          </span>
          {filteredCount !== total && (
            <span className="badge badge-amber">
              {filteredCount} / {total} filtered
            </span>
          )}
        </div>
      </header>

      {/* ── SEARCH + FILTERS ── */}
      <section style={{ marginBottom:24 }}>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:10 }}>
          {/* Search */}
          <div style={{ position:"relative", flex:1, minWidth:220 }}>
            <Search size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
              color:"var(--text-muted)", pointerEvents:"none" }} />
            <input
              className="input-base"
              style={{ paddingLeft:38, paddingRight:14, paddingTop:10, paddingBottom:10 }}
              type="text"
              placeholder="Search name, email, branch…"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>

          {/* Filter toggle */}
          <button
            className="btn btn-ghost"
            onClick={() => setShowFilters(!showFilters)}
            style={{ gap:7, paddingTop:10, paddingBottom:10 }}>
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="badge badge-emerald" style={{ padding:"2px 7px", fontSize:10 }}>
                {activeFilterCount}
              </span>
            )}
            <ChevronDown size={13} style={{ transition:"transform 0.2s",
              transform: showFilters ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>

          {/* Clear */}
          {activeFilterCount > 0 && (
            <button className="btn btn-ghost"
              onClick={() => setFilters({ gender:"all", employment:"all", education:"all",
                marital:"all", branch:"all", search:"" })}>
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="card" style={{ padding:18 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px,1fr))", gap:14 }}>
              {[
                { key:"gender",     label:"Gender",        opts:["all","Male","Female"] },
                { key:"employment", label:"Employment",    opts:["all","Employed","Unemployed","Student","Self Employed"] },
                { key:"education",  label:"Education",     opts:["all","Secondary","OND","HND","BSc","MSc","PhD"] },
                { key:"marital",    label:"Marital Status",opts:["all","Single","Married"] },
              ].map(({ key, label, opts }) => (
                <div key={key}>
                  <label className="section-label" style={{ display:"block", marginBottom:5 }}>{label}</label>
                  <select
                    className="select-base"
                    style={{ padding:"8px 10px" }}
                    value={(filters as any)[key]}
                    onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}>
                    {opts.map(o => <option key={o} value={o}>{o === "all" ? `All ${label}` : o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="section-label" style={{ display:"block", marginBottom:5 }}>Branch</label>
                <select
                  className="select-base"
                  style={{ padding:"8px 10px" }}
                  value={filters.branch}
                  onChange={e => setFilters(f => ({ ...f, branch: e.target.value }))}>
                  <option value="all">All Branches</option>
                  {uniqueBranches.slice(0,50).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── TABS ── */}
      <div className="tab-strip" style={{ marginBottom:24 }}>
        {(["overview","branches","table"] as TabId[]).map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}>
            {tab === "overview" ? "Overview"
             : tab === "branches" ? "Branches"
             : "Data Table"}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* OVERVIEW TAB                                          */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <>
          {/* KPI Cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:14, marginBottom:20 }}>
            <StatCard icon={Users}        label="Total Registrations" value={filteredCount}
              sub="All Time"  accent="#10d9a0" delay="d0" />
            <StatCard icon={Briefcase}    label="Employed / Working"
              value={(stats.employmentBreakdown.Employed||0)+(stats.employmentBreakdown["Self Employed"]||0)}
              sub="Working"   accent="#f59e0b" delay="d1" />
            <StatCard icon={GraduationCap} label="BSc Degree & Above"
              value={(stats.educationBreakdown.BSc||0)+(stats.educationBreakdown.MSc||0)+(stats.educationBreakdown.PhD||0)}
              sub="Qualified" accent="#3b82f6" delay="d2" />
            <StatCard icon={MapPin}       label="Branches Covered"
              value={Object.keys(stats.branchBreakdown).length}
              sub="Locations" accent="#a855f7" delay="d3" />
          </div>

          {/* Row 1 */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:14, marginBottom:14 }}>

            {/* Gender */}
            <ChartSection title="Gender Distribution" subtitle="Respondents by gender">
              <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={genderData} cx="50%" cy="50%" innerRadius={46} outerRadius={72} paddingAngle={3} dataKey="value">
                      {genderData.map((_,i) => <Cell key={i} fill={i===0 ? "#3b82f6" : "#f43f5e"} stroke="transparent" />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip theme={theme} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:12 }}>
                  {genderData.map((item,i) => {
                    const col = i===0 ? "#3b82f6" : "#f43f5e";
                    const pct = Math.round((item.value / filteredCount) * 100);
                    return (
                      <div key={item.name}>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}>
                          <span style={{ color:"var(--text-secondary)", fontWeight:500 }}>{item.name}</span>
                          <span style={{ color: col, fontWeight:700 }}>{item.value} <span style={{ color:"var(--text-muted)", fontWeight:400 }}>({pct}%)</span></span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-bar" style={{ width:`${pct}%`, background: col }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ChartSection>

            {/* Employment */}
            <ChartSection title="Employment Status" subtitle="Distribution across categories">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={employmentData} barCategoryGap="32%">
                  <CartesianGrid strokeDasharray="2 4" stroke={GRID} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill:AXIS, fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:AXIS, fontSize:11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip theme={theme} />} />
                  <Bar dataKey="value" radius={[5,5,0,0]}>
                    {employmentData.map((_,i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartSection>
          </div>

          {/* Row 2 */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:14, marginBottom:14 }}>

            {/* Education */}
            <ChartSection title="Education Level" subtitle="Highest qualification attained">
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {educationData.map((item,i) => {
                  const pct = Math.round((item.value / filteredCount) * 100);
                  const rel = Math.round((item.value / educationData[0].value) * 100);
                  const col = PALETTE[i % PALETTE.length];
                  return (
                    <div key={item.name}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, marginBottom:5 }}>
                        <span style={{ color:"var(--text-secondary)", fontWeight:500 }}>{item.name}</span>
                        <span style={{ color:"var(--text-primary)", fontWeight:700 }}>
                          {item.value}{" "}<span style={{ color:"var(--text-muted)", fontWeight:400 }}>({pct}%)</span>
                        </span>
                      </div>
                      <div className="progress-track" style={{ height:5 }}>
                        <div className="progress-bar"
                          style={{ width:`${rel}%`, background:`linear-gradient(90deg,${col},${PALETTE[(i+1)%PALETTE.length]})` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartSection>

            {/* Fields of Study */}
            <ChartSection title="Fields of Study" subtitle="Course category breakdown">
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <ResponsiveContainer width={160} height={200}>
                  <PieChart>
                    <Pie data={courseData} cx="50%" cy="50%" outerRadius={75} paddingAngle={2} dataKey="value">
                      {courseData.map((_,i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="transparent" />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip theme={theme} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6,
                  overflowY:"auto", maxHeight:200 }} className="scroll-thin">
                  {courseData.map((item,i) => (
                    <div key={item.name} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:9, height:9, borderRadius:3, flexShrink:0,
                        background: PALETTE[i % PALETTE.length] }} />
                      <span style={{ fontSize:12, color:"var(--text-secondary)", flex:1,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)" }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartSection>
          </div>

          {/* Row 3 */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>

            {/* Location */}
            <ChartSection title="Geographic Distribution" subtitle="Registrations by state">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={locationData} layout="vertical" barCategoryGap="20%" margin={{ left:10, right:20 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke={GRID} horizontal={false} />
                  <XAxis type="number" tick={{ fill:AXIS, fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill:AXIS, fontSize:11 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<ChartTooltip theme={theme} />} />
                  <Bar dataKey="value" radius={[0,5,5,0]}>
                    {locationData.map((_,i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartSection>

            {/* Marital */}
            <ChartSection title="Marital Status" subtitle="Single vs Married">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={maritalData} cx="50%" cy="45%" outerRadius={80} paddingAngle={3} dataKey="value"
                    label={({ name, percent }) => `${name} ${Math.round((percent??0)*100)}%`}
                    labelLine={false}>
                    {maritalData.map((_,i) => <Cell key={i} fill={["#10d9a0","#f59e0b","#3b82f6","#f43f5e"][i]} stroke="transparent" />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip theme={theme} />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartSection>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* BRANCHES TAB                                          */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === "branches" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Horizontal bar chart */}
          <div className="chart-card" style={{ padding:"20px 22px" }}>
            <div className="chart-title" style={{ marginBottom:2 }}>Top 15 Branches by Registrations</div>
            <div className="chart-sub" style={{ marginBottom:18 }}>Branches ranked by number of youth registered</div>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={stats.topBranches.slice(0,15)} layout="vertical" barCategoryGap="14%" margin={{ left:14, right:40 }}>
                <CartesianGrid strokeDasharray="2 4" stroke={GRID} horizontal={false} />
                <XAxis type="number" tick={{ fill:AXIS, fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill:AXIS, fontSize:10.5 }}
                  axisLine={false} tickLine={false} width={150} />
                <Tooltip content={<ChartTooltip theme={theme} />} />
                <Bar dataKey="count" radius={[0,5,5,0]}
                  label={{ position:"right", fontSize:11, fill:AXIS }}>
                  {stats.topBranches.slice(0,15).map((_:any,i:number) =>
                    <Cell key={i} fill={`hsl(${155+i*9},${70-i*1.5}%,${isDark?58-i:48-i}%)`} />
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Branch table */}
          <div className="card" style={{ overflow:"hidden" }}>
            <div style={{ padding:"16px 20px 14px", borderBottom:"1px solid var(--border-subtle)" }}>
              <div className="chart-title">All Branches — Complete List</div>
              <div className="chart-sub">{stats.topBranches.length} branches with registrations</div>
            </div>
            <div className="scroll-thin" style={{ overflowX:"auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width:48 }}>#</th>
                    <th>Branch Name</th>
                    <th style={{ textAlign:"center", width:80 }}>Count</th>
                    <th style={{ width:"35%" }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topBranches.map((branch: any, i: number) => (
                    <tr key={branch.name}>
                      <td style={{ color:"var(--text-muted)", fontSize:11 }}>{i+1}</td>
                      <td style={{ color:"var(--text-primary)", fontWeight:500 }}>{branch.name}</td>
                      <td style={{ textAlign:"center" }}>
                        <span className="badge badge-emerald">{branch.count}</span>
                      </td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div className="progress-track" style={{ flex:1, height:5 }}>
                            <div className="progress-bar"
                              style={{ width:`${branch.percentage}%`, background:`hsl(${155+i*9},65%,${isDark?56:46}%)` }} />
                          </div>
                          <span style={{ fontSize:11.5, color:"var(--text-muted)", width:30, textAlign:"right" }}>
                            {branch.percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* DATA TABLE TAB                                        */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === "table" && (
        <div className="card" style={{ overflow:"hidden" }}>
          {/* Table header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"16px 20px", borderBottom:"1px solid var(--border-subtle)", flexWrap:"wrap", gap:10 }}>
            <div>
              <div className="chart-title">Respondents Database</div>
              <div className="chart-sub">
                {filteredCount} records · Page {tablePage+1} of {totalPages}
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-blue" onClick={handleStatsCsv} disabled={exporting === "stats"}>
                <Download size={13} /> Stats CSV
              </button>
              <button className="btn btn-blue" onClick={() => handleExport("csv")} disabled={exporting === "csv"}>
                <Download size={13} /> Full CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="scroll-thin" style={{ overflowX:"auto" }}>
            <table className="data-table" style={{ minWidth:860 }}>
              <thead>
                <tr>
                  {["#","Full Name","Gender","Employment","Education","Branch","Marital","Email"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((r: any, i: number) => (
                  <tr key={r.id}>
                    <td style={{ color:"var(--text-muted)", fontSize:11, width:42 }}>
                      {tablePage * PAGE_SIZE + i + 1}
                    </td>
                    <td style={{ color:"var(--text-primary)", fontWeight:600, maxWidth:180,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
                      title={r.fullName}>
                      {r.fullName}
                    </td>
                    <td>
                      <span className={`badge ${r.gender === "Male" ? "badge-blue" : "badge-rose"}`}>
                        {r.gender}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        r.employmentStatus === "Employed"     ? "badge-emerald" :
                        r.employmentStatus === "Student"      ? "badge-blue" :
                        r.employmentStatus === "Self Employed"? "badge-amber" : "badge-purple"
                      }`}>{r.employmentStatus}</span>
                    </td>
                    <td style={{ fontSize:12 }}>{r.education}</td>
                    <td style={{ fontSize:12, maxWidth:150, overflow:"hidden",
                      textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={r.branch}>
                      {r.branch}
                    </td>
                    <td style={{ fontSize:12, color:"var(--text-muted)" }}>{r.maritalStatus}</td>
                    <td style={{ fontSize:11, color:"var(--text-muted)", maxWidth:180,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
                      title={r.email}>
                      {r.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"14px 20px", borderTop:"1px solid var(--border-subtle)", flexWrap:"wrap", gap:8 }}>
            <button className="btn btn-ghost"
              onClick={() => setTablePage(Math.max(0, tablePage-1))}
              disabled={tablePage === 0}>
              ← Prev
            </button>
            <div style={{ display:"flex", gap:4 }}>
              {Array.from({ length: Math.min(7, totalPages) }, (_,i) => {
                const page = totalPages <= 7 ? i
                  : tablePage < 4 ? i
                  : tablePage > totalPages-4 ? totalPages-7+i
                  : tablePage-3+i;
                return (
                  <button key={page} onClick={() => setTablePage(page)}
                    style={{
                      width:34, height:34, borderRadius:8,
                      fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:"pointer",
                      transition:"all 0.15s ease",
                      background: tablePage === page ? "var(--accent)" : "transparent",
                      color: tablePage === page ? "#04090f" : "var(--text-secondary)",
                      border: tablePage === page ? "1px solid transparent" : "1px solid var(--border-subtle)",
                    }}>
                    {page+1}
                  </button>
                );
              })}
            </div>
            <button className="btn btn-ghost"
              onClick={() => setTablePage(Math.min(totalPages-1, tablePage+1))}
              disabled={tablePage >= totalPages-1}>
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ marginTop:40, paddingTop:20, borderTop:"1px solid var(--border-subtle)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexWrap:"wrap", gap:10 }}>
        <p style={{ fontSize:12, color:"var(--text-muted)" }}>
          Dunamis International Gospel Centre · Youth Empowerment Analytics
        </p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button className="btn btn-ghost" style={{ fontSize:11, padding:"5px 10px" }}
            onClick={handlePDF}>
            <FileText size={12} /> PDF Report
          </button>
          <button className="btn btn-ghost" style={{ fontSize:11, padding:"5px 10px" }}
            onClick={handleStatsCsv}>
            <Download size={12} /> Stats CSV
          </button>
          <button className="btn btn-ghost" style={{ fontSize:11, padding:"5px 10px" }}
            onClick={() => handleExport("excel")}>
            <Table size={12} /> Full Excel
          </button>
        </div>
      </footer>
    </div>
  );
}
