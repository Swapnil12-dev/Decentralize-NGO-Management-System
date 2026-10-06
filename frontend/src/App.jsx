import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ethers } from "ethers";
import NgoManagementArtifact from "./contracts/NgoManagement.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

/* -------------------------------------------------------------------------- */
/*  Styles (kept in this file so the whole app stays a single component file)  */
/* -------------------------------------------------------------------------- */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

:root {
  --bg: #f4f6fb;
  --surface: #ffffff;
  --ink: #0f172a;
  --ink-soft: #475569;
  --ink-mute: #94a3b8;
  --line: #e5e9f2;
  --brand: #4f46e5;
  --brand-2: #7c3aed;
  --brand-soft: #eef0ff;
  --green: #059669;
  --green-soft: #e7f8f1;
  --amber: #d97706;
  --amber-soft: #fff4e0;
  --red: #dc2626;
  --shadow-sm: 0 1px 2px rgba(15,23,42,.05), 0 1px 3px rgba(15,23,42,.06);
  --shadow-md: 0 4px 6px -1px rgba(15,23,42,.06), 0 12px 24px -6px rgba(15,23,42,.10);
  --shadow-lg: 0 20px 40px -12px rgba(79,70,229,.25);
  --radius: 18px;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--bg);
  color: var(--ink);
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.ngo-app { min-height: 100vh; display: flex; flex-direction: column; }
.container { width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 24px; }

/* ------------------------------ Navbar ------------------------------ */
.nav {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,.82);
  backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--line);
}
.nav-inner { display: flex; align-items: center; justify-content: space-between; height: 72px; gap: 16px; }
.brand { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--ink); }
.brand-logo {
  width: 40px; height: 40px; border-radius: 12px;
  background: linear-gradient(135deg, var(--brand), var(--brand-2));
  display: grid; place-items: center; color: #fff;
  box-shadow: var(--shadow-lg);
}
.brand-name { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 18px; letter-spacing: -.02em; line-height: 1.1; }
.brand-sub { font-size: 11px; color: var(--ink-mute); font-weight: 500; letter-spacing: .04em; text-transform: uppercase; }
.nav-links { display: flex; gap: 6px; }
.nav-links a {
  color: var(--ink-soft); text-decoration: none; font-weight: 600; font-size: 14px;
  padding: 8px 14px; border-radius: 10px; transition: all .2s;
}
.nav-links a:hover { background: var(--brand-soft); color: var(--brand); }
.wallet-pill {
  display: flex; align-items: center; gap: 10px;
  background: var(--surface); border: 1px solid var(--line);
  padding: 7px 14px 7px 10px; border-radius: 999px; box-shadow: var(--shadow-sm);
  font-size: 13px; font-weight: 600; color: var(--ink);
}
.dot { width: 9px; height: 9px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 4px var(--green-soft); }
.dot.off { background: var(--red); box-shadow: 0 0 0 4px #fde8e8; }
.net-tag { font-size: 11px; font-weight: 700; color: var(--brand); background: var(--brand-soft); padding: 3px 8px; border-radius: 6px; }

/* ------------------------------- Hero ------------------------------- */
.hero {
  position: relative; overflow: hidden; color: #fff;
  background:
    radial-gradient(900px 400px at 85% -10%, rgba(255,255,255,.18), transparent 60%),
    radial-gradient(700px 400px at 0% 110%, rgba(124,58,237,.55), transparent 60%),
    linear-gradient(135deg, #3730a3 0%, #4f46e5 45%, #7c3aed 100%);
  padding: 72px 0 120px;
}
.hero::after {
  content: ""; position: absolute; inset: 0; opacity: .12;
  background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 26px 26px;
  pointer-events: none;
}
.hero-inner { position: relative; z-index: 1; max-width: 720px; }
.eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.25);
  padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: .04em;
}
.hero h1 {
  font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800;
  font-size: clamp(34px, 5vw, 56px); line-height: 1.05; letter-spacing: -.03em; margin: 20px 0 16px;
}
.hero p { font-size: 18px; line-height: 1.6; color: rgba(255,255,255,.82); margin: 0 0 30px; max-width: 600px; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border: none; cursor: pointer; font-family: inherit; font-weight: 700; font-size: 15px;
  padding: 13px 22px; border-radius: 12px; transition: transform .15s, box-shadow .2s, background .2s;
  text-decoration: none;
}
.btn:active { transform: translateY(1px); }
.btn:disabled { opacity: .6; cursor: not-allowed; }
.btn-white { background: #fff; color: var(--brand); box-shadow: 0 8px 20px rgba(0,0,0,.18); }
.btn-white:hover { transform: translateY(-2px); }
.btn-ghost { background: rgba(255,255,255,.14); color: #fff; border: 1px solid rgba(255,255,255,.3); }
.btn-ghost:hover { background: rgba(255,255,255,.22); }
.btn-primary { background: linear-gradient(135deg, var(--brand), var(--brand-2)); color: #fff; box-shadow: var(--shadow-lg); }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 24px 40px -12px rgba(79,70,229,.45); }
.btn-green { background: linear-gradient(135deg, #059669, #10b981); color: #fff; box-shadow: 0 10px 24px -8px rgba(5,150,105,.5); }
.btn-green:hover:not(:disabled) { transform: translateY(-2px); }
.btn-block { width: 100%; }

/* ------------------------------ Stats ------------------------------- */
.stats { margin-top: -72px; position: relative; z-index: 2; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.stat {
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 22px; box-shadow: var(--shadow-md); display: flex; gap: 16px; align-items: center;
  transition: transform .2s;
}
.stat:hover { transform: translateY(-3px); }
.stat-icon { width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; flex-shrink: 0; }
.stat-icon.indigo { background: var(--brand-soft); color: var(--brand); }
.stat-icon.green { background: var(--green-soft); color: var(--green); }
.stat-icon.amber { background: var(--amber-soft); color: var(--amber); }
.stat-icon.violet { background: #f3eaff; color: var(--brand-2); }
.stat-label { font-size: 12px; font-weight: 600; color: var(--ink-mute); text-transform: uppercase; letter-spacing: .06em; }
.stat-value { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -.02em; margin-top: 2px; }
.stat-value small { font-size: 13px; color: var(--ink-mute); font-weight: 600; margin-left: 4px; }

/* ----------------------------- Sections ----------------------------- */
.section { padding: 72px 0 0; }
.section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 28px; }
.section-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 30px; font-weight: 800; letter-spacing: -.02em; margin: 0; }
.section-desc { color: var(--ink-soft); margin: 6px 0 0; font-size: 15px; }

.layout { display: grid; grid-template-columns: 380px 1fr; gap: 28px; align-items: start; }

/* ------------------------------ Cards ------------------------------- */
.card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow-sm); }
.form-card { padding: 28px; position: sticky; top: 96px; }
.form-card h3 { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0 0 4px; font-size: 20px; font-weight: 800; }
.form-card .sub { margin: 0 0 22px; color: var(--ink-soft); font-size: 14px; }
.field { margin-bottom: 16px; }
.field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 7px; color: var(--ink); }
.input, .textarea {
  width: 100%; font-family: inherit; font-size: 15px; color: var(--ink);
  background: #fafbfe; border: 1.5px solid var(--line); border-radius: 12px;
  padding: 12px 14px; outline: none; transition: border .2s, box-shadow .2s, background .2s;
}
.input:focus, .textarea:focus { border-color: var(--brand); background: #fff; box-shadow: 0 0 0 4px rgba(79,70,229,.12); }
.textarea { resize: vertical; min-height: 96px; }
.input-affix { position: relative; }
.input-affix .input { padding-right: 56px; }
.input-affix span {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  font-size: 12px; font-weight: 700; color: var(--ink-mute); letter-spacing: .06em;
}
.hint { display: flex; gap: 8px; align-items: flex-start; font-size: 12.5px; color: var(--ink-soft); background: var(--brand-soft); padding: 11px 13px; border-radius: 10px; margin-bottom: 18px; line-height: 1.5; }

/* ------------------------------ Toolbar ----------------------------- */
.toolbar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 22px; }
.search { position: relative; flex: 1; min-width: 200px; }
.search svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--ink-mute); }
.search .input { padding-left: 42px; background: #fff; }
.tabs { display: flex; background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 4px; gap: 2px; }
.tab { border: none; background: transparent; font-family: inherit; font-weight: 600; font-size: 13px; color: var(--ink-soft); padding: 8px 14px; border-radius: 9px; cursor: pointer; transition: all .2s; }
.tab:hover { color: var(--brand); }
.tab.active { background: var(--brand); color: #fff; box-shadow: 0 4px 10px rgba(79,70,229,.35); }

/* --------------------------- Campaign cards ------------------------- */
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; }
.campaign { padding: 0; overflow: hidden; display: flex; flex-direction: column; transition: transform .25s, box-shadow .25s; }
.campaign:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.campaign-banner { height: 8px; background: linear-gradient(90deg, var(--brand), var(--brand-2)); }
.campaign.done .campaign-banner { background: linear-gradient(90deg, #059669, #34d399); }
.campaign-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; flex: 1; }
.campaign-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; padding: 5px 10px; border-radius: 999px; letter-spacing: .02em; }
.badge.live { background: var(--brand-soft); color: var(--brand); }
.badge.done { background: var(--green-soft); color: var(--green); }
.cid { font-size: 12px; font-weight: 700; color: var(--ink-mute); }
.campaign h4 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; font-weight: 800; letter-spacing: -.01em; margin: 0; line-height: 1.25; word-break: break-word; }
.campaign .desc { margin: 0; color: var(--ink-soft); font-size: 14.5px; line-height: 1.6; word-break: break-word; }
.ngo-line { display: flex; align-items: center; gap: 10px; background: #f8fafc; border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px; }
.avatar { width: 32px; height: 32px; border-radius: 10px; background: linear-gradient(135deg, var(--brand), var(--brand-2)); color: #fff; display: grid; place-items: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
.ngo-meta { min-width: 0; flex: 1; }
.ngo-meta small { display: block; font-size: 11px; color: var(--ink-mute); font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
.ngo-meta code { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 12.5px; color: var(--ink); }
.copy-btn { background: none; border: none; cursor: pointer; color: var(--ink-mute); padding: 6px; border-radius: 8px; display: grid; place-items: center; transition: all .2s; }
.copy-btn:hover { background: var(--brand-soft); color: var(--brand); }

.progress-wrap { display: flex; flex-direction: column; gap: 10px; }
.progress-row { display: flex; justify-content: space-between; align-items: baseline; }
.raised { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: -.02em; }
.raised small { font-size: 13px; color: var(--ink-mute); font-weight: 600; margin-left: 4px; }
.goal-txt { font-size: 13px; color: var(--ink-soft); font-weight: 500; }
.goal-txt b { color: var(--ink); }
.bar { height: 10px; background: #eef1f7; border-radius: 999px; overflow: hidden; }
.bar > div { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--brand), var(--brand-2)); transition: width .8s cubic-bezier(.22,1,.36,1); }
.campaign.done .bar > div { background: linear-gradient(90deg, #059669, #34d399); }
.pct { font-size: 12.5px; font-weight: 700; color: var(--brand); }
.campaign.done .pct { color: var(--green); }

.donate { display: flex; gap: 10px; padding-top: 4px; margin-top: auto; }
.donate .input-affix { flex: 1; }
.donate .btn { padding: 12px 18px; white-space: nowrap; }
.goal-met { display: flex; align-items: center; gap: 10px; background: var(--green-soft); color: var(--green); border-radius: 12px; padding: 13px 15px; font-weight: 700; font-size: 14px; margin-top: auto; }

/* ------------------------------ Empty ------------------------------- */
.empty { text-align: center; padding: 64px 24px; border: 2px dashed var(--line); border-radius: var(--radius); background: #fff; grid-column: 1 / -1; }
.empty-icon { width: 68px; height: 68px; border-radius: 20px; background: var(--brand-soft); color: var(--brand); display: grid; place-items: center; margin: 0 auto 18px; }
.empty h4 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; margin: 0 0 6px; }
.empty p { color: var(--ink-soft); margin: 0; font-size: 14.5px; }

/* ----------------------------- Features ----------------------------- */
.features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.feature { padding: 26px; }
.feature .stat-icon { margin-bottom: 16px; }
.feature h5 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 17px; font-weight: 800; margin: 0 0 6px; }
.feature p { margin: 0; color: var(--ink-soft); font-size: 14.5px; line-height: 1.6; }

/* ------------------------------ Footer ------------------------------ */
.footer { margin-top: 96px; background: #0b1020; color: #aab3c9; }
.footer-inner { padding: 40px 24px; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
.footer .brand { color: #fff; }
.footer small { font-size: 13px; }
.footer code { color: #c7d2fe; font-size: 12px; font-family: ui-monospace, Menlo, monospace; }

/* ------------------------------ Loader ------------------------------ */
.loader-screen { min-height: 100vh; display: grid; place-items: center; background: var(--bg); padding: 24px; }
.loader-card { text-align: center; background: #fff; border: 1px solid var(--line); border-radius: 24px; padding: 48px 56px; box-shadow: var(--shadow-md); max-width: 420px; }
.spinner { width: 54px; height: 54px; border-radius: 50%; border: 4px solid var(--brand-soft); border-top-color: var(--brand); animation: spin .9s linear infinite; margin: 0 auto 22px; }
.spinner.sm { width: 16px; height: 16px; border-width: 2.5px; margin: 0; border-color: rgba(255,255,255,.4); border-top-color: #fff; }
.loader-card h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; margin: 0 0 6px; }
.loader-card p { margin: 0; color: var(--ink-soft); font-size: 14px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ------------------------------ Toasts ------------------------------ */
.toasts { position: fixed; right: 22px; bottom: 22px; z-index: 100; display: flex; flex-direction: column; gap: 10px; }
.toast {
  display: flex; align-items: center; gap: 12px; min-width: 280px; max-width: 380px;
  background: #0f172a; color: #fff; padding: 14px 16px; border-radius: 14px; font-size: 14px; font-weight: 600;
  box-shadow: 0 20px 40px -10px rgba(15,23,42,.5); animation: slideIn .35s cubic-bezier(.22,1,.36,1);
}
.toast .ti { width: 28px; height: 28px; border-radius: 9px; display: grid; place-items: center; flex-shrink: 0; }
.toast.success .ti { background: rgba(16,185,129,.2); color: #34d399; }
.toast.error .ti { background: rgba(239,68,68,.2); color: #f87171; }
.toast.info .ti { background: rgba(129,140,248,.2); color: #a5b4fc; }
@keyframes slideIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }

/* --------------------------- Offline notice ------------------------- */
.offline { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; border-radius: 14px; padding: 16px 18px; font-size: 14px; line-height: 1.55; margin-bottom: 22px; display: flex; gap: 12px; }

/* ---------------------------- Responsive ---------------------------- */
@media (max-width: 1024px) {
  .layout { grid-template-columns: 1fr; }
  .form-card { position: static; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .features { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .nav-links { display: none; }
  .grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr; }
  .hero { padding: 52px 0 110px; }
  .wallet-pill .net-tag { display: none; }
  .container { padding: 0 18px; }
}
`;

/* -------------------------------------------------------------------------- */
/*  Small presentational helpers                                               */
/* -------------------------------------------------------------------------- */
const Icon = ({ name, size = 20 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "heart":
      return (
        <svg {...common}>
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "flag":
      return (
        <svg {...common}>
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <path d="M4 22v-7" />
        </svg>
      );
    case "coins":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6" />
          <path d="M18.1 10.4A6 6 0 1 1 10.4 18.1" />
          <path d="M7 6h1v4" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case "check-circle":
      return (
        <svg {...common}>
          <path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" />
          <path d="m22 4-10 10-3-3" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      );
    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "copy":
      return (
        <svg {...common}>
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "zap":
      return (
        <svg {...common}>
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case "inbox":
      return (
        <svg {...common}>
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.2a2 2 0 0 0-1.7 1.1z" />
        </svg>
      );
    default:
      return null;
  }
};

const shortAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

const formatNumber = (n) => {
  const num = Number(n);
  if (!isFinite(num)) return "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
};

/* -------------------------------------------------------------------------- */
/*  App                                                                        */
/* -------------------------------------------------------------------------- */
function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [donationAmount, setDonationAmount] = useState({});

  // UI-only state (does not touch any backend logic)
  const [toasts, setToasts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [donatingId, setDonatingId] = useState(null);
  const [connectError, setConnectError] = useState(false);

  useEffect(() => {
    initWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------------------------- UI helpers --------------------------- */
  const notify = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const copyAddress = async (addr) => {
    try {
      await navigator.clipboard.writeText(addr);
      notify("Address copied to clipboard", "info");
    } catch (e) {
      notify("Could not copy address", "error");
    }
  };

  /* ----------------------- Backend logic (unchanged) ---------------------- */
  const initWeb3 = async () => {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(0);
      const address = await signer.getAddress();
      setAccount(address);

      const ngoContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        NgoManagementArtifact.abi,
        signer
      );

      setContract(ngoContract);
      await fetchCampaigns(ngoContract);
    } catch (error) {
      console.error("Failed to connect to Web3:", error);
      setConnectError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async (contractInstance) => {
    try {
      const count = await contractInstance.campaignCount();
      const loadedCampaigns = [];

      for (let i = 1; i <= Number(count); i++) {
        const c = await contractInstance.getCampaign(i);
        loadedCampaigns.push({
          id: Number(c.id),
          ngo: c.ngo,
          title: c.title,
          description: c.description,
          goal: ethers.formatEther(c.goal),
          raised: ethers.formatEther(c.raised),
          isCompleted: c.isCompleted,
        });
      }

      setCampaigns(loadedCampaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!contract || !title || !goal) return;

    try {
      setCreating(true);
      const goalInWei = ethers.parseEther(goal);
      const tx = await contract.createCampaign(title, description, goalInWei);
      await tx.wait();

      setTitle("");
      setDescription("");
      setGoal("");
      await fetchCampaigns(contract);
      notify("Campaign created on Blockchain!", "success");
    } catch (error) {
      console.error("Error creating campaign:", error);
      notify("Failed to create campaign.", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDonate = async (id) => {
    const amount = donationAmount[id];
    if (!contract || !amount) return;

    try {
      setDonatingId(id);
      const valInWei = ethers.parseEther(amount);
      const tx = await contract.donate(id, { value: valInWei });
      await tx.wait();

      setDonationAmount({ ...donationAmount, [id]: "" });
      await fetchCampaigns(contract);
      notify("Donation successful!", "success");
    } catch (error) {
      console.error("Error sending donation:", error);
      notify("Donation failed.", "error");
    } finally {
      setDonatingId(null);
    }
  };

  /* ------------------------- Derived UI values ------------------------- */
  const stats = useMemo(() => {
    const totalRaised = campaigns.reduce((s, c) => s + Number(c.raised), 0);
    const totalGoal = campaigns.reduce((s, c) => s + Number(c.goal), 0);
    const completed = campaigns.filter((c) => c.isCompleted).length;
    return {
      total: campaigns.length,
      raised: totalRaised,
      goal: totalGoal,
      completed,
      active: campaigns.length - completed,
    };
  }, [campaigns]);

  const visibleCampaigns = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns
      .filter((c) => {
        if (filter === "active") return !c.isCompleted;
        if (filter === "completed") return c.isCompleted;
        return true;
      })
      .filter(
        (c) =>
          !q ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.ngo.toLowerCase().includes(q)
      )
      .slice()
      .reverse();
  }, [campaigns, filter, query]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ------------------------------ Loading ------------------------------ */
  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loader-screen">
          <div className="loader-card">
            <div className="spinner" />
            <h2>Connecting to Local Blockchain Node...</h2>
            <p>Establishing a secure link with your Hardhat network.</p>
          </div>
        </div>
      </>
    );
  }

  /* ------------------------------- Render ------------------------------ */
  return (
    <>
      <style>{styles}</style>

      <div className="ngo-app">
        {/* ------------------------------ Navbar ------------------------------ */}
        <header className="nav">
          <div className="container nav-inner">
            <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <div className="brand-logo">
                <Icon name="heart" size={20} />
              </div>
              <div>
                <div className="brand-name">ChainAid</div>
                <div className="brand-sub">NGO Management</div>
              </div>
            </a>

            <nav className="nav-links">
              <a href="#create" onClick={(e) => { e.preventDefault(); scrollTo("create"); }}>Create</a>
              <a href="#campaigns" onClick={(e) => { e.preventDefault(); scrollTo("campaigns"); }}>Campaigns</a>
              <a href="#why" onClick={(e) => { e.preventDefault(); scrollTo("why"); }}>Why Blockchain</a>
            </nav>

            <div className="wallet-pill" title={account}>
              <span className={connectError ? "dot off" : "dot"} />
              <span>{account ? shortAddress(account) : "Not connected"}</span>
              <span className="net-tag">Hardhat</span>
            </div>
          </div>
        </header>

        {/* ------------------------------- Hero ------------------------------- */}
        <section className="hero" id="top">
          <div className="container">
            <div className="hero-inner">
              <span className="eyebrow">
                <Icon name="shield" size={14} /> Transparent • Trustless • On-chain
              </span>
              <h1>Decentralized NGO Management System</h1>
              <p>
                Launch fundraising campaigns and receive donations directly on the
                blockchain. Every contribution is recorded, verifiable and
                tamper-proof.
              </p>
              <div className="hero-actions">
                <button className="btn btn-white" onClick={() => scrollTo("create")}>
                  <Icon name="plus" size={18} /> Create Campaign
                </button>
                <button className="btn btn-ghost" onClick={() => scrollTo("campaigns")}>
                  Browse Campaigns
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------- Stats ------------------------------- */}
        <section className="stats">
          <div className="container">
            <div className="stats-grid">
              <div className="stat">
                <div className="stat-icon indigo"><Icon name="flag" size={22} /></div>
                <div>
                  <div className="stat-label">Total Campaigns</div>
                  <div className="stat-value">{stats.total}</div>
                </div>
              </div>
              <div className="stat">
                <div className="stat-icon green"><Icon name="coins" size={22} /></div>
                <div>
                  <div className="stat-label">Total Raised</div>
                  <div className="stat-value">{formatNumber(stats.raised)}<small>ETH</small></div>
                </div>
              </div>
              <div className="stat">
                <div className="stat-icon amber"><Icon name="target" size={22} /></div>
                <div>
                  <div className="stat-label">Combined Goal</div>
                  <div className="stat-value">{formatNumber(stats.goal)}<small>ETH</small></div>
                </div>
              </div>
              <div className="stat">
                <div className="stat-icon violet"><Icon name="check-circle" size={22} /></div>
                <div>
                  <div className="stat-label">Goals Met</div>
                  <div className="stat-value">{stats.completed}<small>/ {stats.total}</small></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------- Create + Campaigns ----------------------- */}
        <main className="container">
          <section className="section" id="create">
            <div className="section-head">
              <div>
                <h2 className="section-title">Fund the change you believe in</h2>
                <p className="section-desc">
                  Start a new NGO campaign, or support an existing cause below.
                </p>
              </div>
            </div>

            <div className="layout">
              {/* ------------------------- Create form ------------------------- */}
              <aside className="card form-card">
                <h3>➕ Create NGO Campaign</h3>
                <p className="sub">Your campaign is published directly to the blockchain.</p>

                <form onSubmit={handleCreateCampaign}>
                  <div className="field">
                    <label htmlFor="title">Campaign Title</label>
                    <input
                      id="title"
                      className="input"
                      type="text"
                      placeholder="Campaign Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="description">Campaign Description</label>
                    <textarea
                      id="description"
                      className="textarea"
                      placeholder="Campaign Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="goal">Goal Amount</label>
                    <div className="input-affix">
                      <input
                        id="goal"
                        className="input"
                        type="number"
                        step="any"
                        min="0"
                        placeholder="Goal Amount (ETH)"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        required
                      />
                      <span>ETH</span>
                    </div>
                  </div>

                  <div className="hint">
                    <Icon name="info" size={16} />
                    <span>
                      Submitting will open a blockchain transaction. Funds raised go
                      directly to the NGO wallet.
                    </span>
                  </div>

                  <button type="submit" className="btn btn-green btn-block" disabled={creating}>
                    {creating ? (<><div className="spinner sm" /> Confirming…</>) : (<><Icon name="zap" size={18} /> Launch Campaign</>)}
                  </button>
                </form>
              </aside>

              {/* ------------------------- Campaign list ------------------------ */}
              <div id="campaigns">
                <div className="section-head" style={{ marginBottom: 18 }}>
                  <div>
                    <h2 className="section-title" style={{ fontSize: 24 }}>📢 Active Campaigns</h2>
                    <p className="section-desc">
                      {stats.active} active • {stats.completed} completed
                    </p>
                  </div>
                </div>

                {connectError && (
                  <div className="offline">
                    <Icon name="info" size={20} />
                    <div>
                      <strong>Unable to reach the blockchain node.</strong>
                      <br />
                      Make sure your Hardhat node is running on 127.0.0.1:8545 and the
                      contract is deployed, then refresh the page.
                    </div>
                  </div>
                )}

                <div className="toolbar">
                  <div className="search">
                    <Icon name="search" size={18} />
                    <input
                      className="input"
                      type="text"
                      placeholder="Search campaigns, NGOs or wallet…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <div className="tabs">
                    {[
                      ["all", "All"],
                      ["active", "Active"],
                      ["completed", "Completed"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        className={`tab ${filter === key ? "active" : ""}`}
                        onClick={() => setFilter(key)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid">
                  {campaigns.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon"><Icon name="inbox" size={30} /></div>
                      <h4>No campaigns yet</h4>
                      <p>No active campaigns found on the blockchain ledger.</p>
                    </div>
                  ) : visibleCampaigns.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon"><Icon name="search" size={30} /></div>
                      <h4>No matching campaigns</h4>
                      <p>Try a different search term or filter.</p>
                    </div>
                  ) : (
                    visibleCampaigns.map((c) => {
                      const goalNum = Number(c.goal);
                      const raisedNum = Number(c.raised);
                      const pct = goalNum > 0 ? Math.min(100, (raisedNum / goalNum) * 100) : 0;

                      return (
                        <article key={c.id} className={`card campaign ${c.isCompleted ? "done" : ""}`}>
                          <div className="campaign-banner" />
                          <div className="campaign-body">
                            <div className="campaign-top">
                              <span className={`badge ${c.isCompleted ? "done" : "live"}`}>
                                {c.isCompleted ? (<><Icon name="check" size={13} /> Goal Met</>) : (<><Icon name="zap" size={13} /> Live</>)}
                              </span>
                              <span className="cid">#{String(c.id).padStart(3, "0")}</span>
                            </div>

                            <h4>
                              {c.title} {c.isCompleted ? "✅ (Goal Met)" : ""}
                            </h4>
                            <p className="desc">{c.description}</p>

                            <div className="ngo-line">
                              <div className="avatar">{c.ngo ? c.ngo.slice(2, 4).toUpperCase() : "NG"}</div>
                              <div className="ngo-meta">
                                <small>NGO Wallet</small>
                                <code title={c.ngo}>{shortAddress(c.ngo)}</code>
                              </div>
                              <button className="copy-btn" type="button" onClick={() => copyAddress(c.ngo)} title="Copy full address">
                                <Icon name="copy" size={16} />
                              </button>
                            </div>

                            <div className="progress-wrap">
                              <div className="progress-row">
                                <div className="raised">
                                  {formatNumber(c.raised)}<small>ETH raised</small>
                                </div>
                                <span className="pct">{pct.toFixed(0)}%</span>
                              </div>
                              <div className="bar"><div style={{ width: `${pct}%` }} /></div>
                              <div className="goal-txt">
                                Raised: <b>{c.raised} ETH</b> / Goal: <b>{c.goal} ETH</b>
                              </div>
                            </div>

                            {!c.isCompleted ? (
                              <div className="donate">
                                <div className="input-affix">
                                  <input
                                    className="input"
                                    type="number"
                                    step="any"
                                    min="0"
                                    placeholder="Amount in ETH"
                                    value={donationAmount[c.id] || ""}
                                    onChange={(e) =>
                                      setDonationAmount({ ...donationAmount, [c.id]: e.target.value })
                                    }
                                  />
                                  <span>ETH</span>
                                </div>
                                <button
                                  className="btn btn-primary"
                                  onClick={() => handleDonate(c.id)}
                                  disabled={donatingId === c.id}
                                >
                                  {donatingId === c.id ? (<><div className="spinner sm" /> Sending</>) : (<><Icon name="heart" size={16} /> Donate ETH</>)}
                                </button>
                              </div>
                            ) : (
                              <div className="goal-met">
                                <Icon name="check-circle" size={20} /> This campaign has reached its goal. Thank you!
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------- Features ---------------------------- */}
          <section className="section" id="why">
            <div className="section-head">
              <div>
                <h2 className="section-title">Why donate on-chain?</h2>
                <p className="section-desc">Built for accountability from the first transaction to the last.</p>
              </div>
            </div>
            <div className="features">
              <div className="card feature">
                <div className="stat-icon indigo"><Icon name="eye" size={22} /></div>
                <h5>Full transparency</h5>
                <p>Every campaign and donation lives on a public ledger, so anyone can verify where funds went.</p>
              </div>
              <div className="card feature">
                <div className="stat-icon green"><Icon name="shield" size={22} /></div>
                <h5>Tamper-proof records</h5>
                <p>Smart-contract logic enforces goals and balances. Records can't be edited or quietly removed.</p>
              </div>
              <div className="card feature">
                <div className="stat-icon amber"><Icon name="globe" size={22} /></div>
                <h5>Borderless giving</h5>
                <p>Donate from anywhere in seconds with no intermediaries taking a cut of your contribution.</p>
              </div>
            </div>
          </section>
        </main>

        {/* ------------------------------ Footer ------------------------------ */}
        <footer className="footer">
          <div className="container footer-inner">
            <div className="brand">
              <div className="brand-logo"><Icon name="heart" size={20} /></div>
              <div>
                <div className="brand-name">ChainAid</div>
                <small>Decentralized NGO Management System</small>
              </div>
            </div>
            <div>
              <small>Contract: </small>
              <code>{CONTRACT_ADDRESS}</code>
            </div>
          </div>
        </footer>
      </div>

      {/* ------------------------------- Toasts ------------------------------- */}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <div className="ti">
              <Icon name={t.type === "success" ? "check" : t.type === "error" ? "x" : "info"} size={16} />
            </div>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;