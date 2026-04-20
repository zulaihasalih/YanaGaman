// ============================================================
// YanaGaman.jsx — React version of the YanaGaman website
//
// HOW THIS FILE IS ORGANIZED (great for beginners!):
//
//  SECTION 1 — STYLES         : All the CSS (copy-pasted and adapted)
//  SECTION 2 — ICON HELPER    : Tiny helper for Material Icons
//  SECTION 3 — TOAST          : The little popup notification
//  SECTION 4 — NAVBAR         : Top navigation bar
//  SECTION 5 — MODALS         : Login & Signup popup windows
//  SECTION 6 — FOOTER         : Footer shown on every page
//  SECTION 7 — HOME PAGE      : The landing page
//  SECTION 8 — HOW IT WORKS   : How it works page
//  SECTION 9 — ABOUT PAGE     : About us page
//  SECTION 10 — CONTACT PAGE  : Contact + FAQ page
//  SECTION 11 — REGISTER PAGE : Full registration page
//  SECTION 12 — APP           : Main component — ties everything together
//
// TO RUN: put this file inside your React project src/ folder
// then in App.jsx write:  import YanaGaman from './YanaGaman'
// ============================================================

import { useState, useEffect } from "react"
import { auth, db } from "./firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "firebase/auth"
import { ref, set, get, update } from "firebase/database"

// ============================================================
// SECTION 1 — STYLES
// Instead of a separate .css file, we write all CSS here as
// a JavaScript string and inject it into the page using a
// <style> tag inside the component. This keeps everything in
// one file — perfect while learning!
// ============================================================
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

  /* Reset browser default styles */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { overflow-x: hidden; width: 100%; max-width: 100vw; border: none; margin: 0; padding: 0; }

  /* CSS Variables — change colors here to retheme the whole app */
  :root {
    --primary: #500088;
    --primary-container: #6b21a8;
    --surface: #fff7fe;
    --surface-low: #fbf0fc;
    --surface-container: #f5ebf6;
    --surface-high: #efe5f1;
    --surface-highest: #e9dfeb;
    --on-surface: #1f1a22;
    --on-surface-variant: #4c4452;
    --outline-variant: #cfc2d4;
    --error: #ba1a1a;
    --on-secondary-container: #684c81;
  }

  body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--surface); color: var(--on-surface); }

  /* Material Symbols (Google's icon font) */
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    font-family: 'Material Symbols Outlined';
    font-style: normal; font-weight: normal;
    display: inline-block; line-height: 1; vertical-align: middle;
  }

  /* ---- TOAST (slide-up notification) ---- */
  .toast {
    position: fixed; bottom: 2rem; right: 2rem;
    background: var(--primary); color: #fff;
    padding: 1rem 1.5rem; border-radius: 0.75rem;
    font-weight: 600; z-index: 999;
    transform: translateY(4rem); opacity: 0;
    transition: all 0.3s; pointer-events: none; font-size: 0.9rem;
  }
  .toast.show { transform: translateY(0); opacity: 1; }

  /* ---- MODAL (popup window) ---- */
  .modal-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(31,26,34,0.5); z-index: 200;
    align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
  }
  .modal-overlay.open { display: flex; }
  .modal {
    background: var(--surface); border-radius: 1.5rem;
    padding: 2.5rem; width: 100%; max-width: 440px;
    margin: 1rem; position: relative;
    box-shadow: 0 24px 48px rgba(80,0,136,0.15);
  }
  .modal-close {
    position: absolute; top: 1.25rem; right: 1.25rem;
    background: none; border: none; cursor: pointer;
    color: var(--on-surface-variant); font-size: 1.5rem;
    line-height: 1; padding: 0.25rem;
  }
  .modal h2 { font-size: 1.75rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem; }
  .modal > p { color: var(--on-surface-variant); margin-bottom: 2rem; font-size: 0.95rem; }

  /* ---- FORMS ---- */
  .form-group { margin-bottom: 1.25rem; }
  .form-group label {
    display: block; font-size: 0.75rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--on-surface-variant); margin-bottom: 0.5rem;
  }
  .form-group input, .form-group select, .form-group textarea {
    width: 100%; background: var(--surface-high);
    border: 2px solid transparent; border-radius: 0.75rem;
    padding: 0.85rem 1rem; font-family: inherit;
    font-size: 0.95rem; color: var(--on-surface); outline: none;
    transition: border-color 0.2s;
  }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
    border-color: var(--primary); background: var(--surface);
  }
  .error-msg { color: var(--error); font-size: 0.8rem; margin-top: 0.35rem; display: none; }
  .field-invalid input, .field-invalid select, .field-invalid textarea { border-color: var(--error); }
  .field-invalid .error-msg { display: block; }

  /* ---- BUTTONS ---- */
  .btn-full {
    width: 100%; padding: 1rem; border-radius: 0.875rem;
    font-size: 1rem; font-weight: 700; border: none;
    cursor: pointer; font-family: inherit; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  }
  .btn-full.primary { background: var(--primary); color: #fff; box-shadow: 0 8px 24px rgba(80,0,136,0.25); }
  .btn-full.primary:hover { opacity: 0.92; transform: translateY(-1px); }
  .btn-ghost {
    background: none; border: none; color: var(--primary);
    font-weight: 600; padding: 0.5rem 1.25rem; border-radius: 0.5rem;
    cursor: pointer; font-family: inherit; font-size: 0.9rem; transition: background 0.2s;
  }
  .btn-ghost:hover { background: var(--surface-low); }
  .btn-primary {
    background: var(--primary); color: #fff; border: none;
    font-weight: 700; padding: 0.5rem 1.5rem; border-radius: 0.5rem;
    cursor: pointer; font-family: inherit; font-size: 0.9rem;
    transition: opacity 0.2s; box-shadow: 0 4px 12px rgba(80,0,136,0.2);
  }
  .btn-primary:hover { opacity: 0.9; }
  .btn-large {
    padding: 1rem 2.5rem; border-radius: 1rem; font-weight: 700;
    font-size: 1.1rem; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s;
  }
  .btn-large.primary { background: var(--primary); color: #fff; box-shadow: 0 8px 30px rgba(80,0,136,0.3); }
  .btn-large.primary:hover { transform: translateY(-2px); }
  .btn-large.secondary { background: var(--surface-high); color: var(--primary); }
  .btn-large.secondary:hover { background: var(--surface-highest); }
  .btn-white {
    background: #fff; color: var(--primary); border: none;
    padding: 1rem 2rem; border-radius: 0.875rem; font-weight: 700;
    font-size: 1rem; cursor: pointer; font-family: inherit; transition: transform 0.2s;
  }
  .btn-white:hover { transform: scale(1.03); }
  .btn-outline-white {
    background: none; border: 2px solid rgba(255,255,255,0.35); color: #fff;
    padding: 1rem 2rem; border-radius: 0.875rem; font-weight: 700;
    font-size: 1rem; cursor: pointer; font-family: inherit; transition: background 0.2s;
  }
  .btn-outline-white:hover { background: rgba(255,255,255,0.1); }
  .safety-btn {
    display: inline-block; background: rgba(255,255,255,0.15); color: #fff;
    border: 2px solid rgba(255,255,255,0.3); border-radius: 0.75rem;
    padding: 0.6rem 1.25rem; font-weight: 700; font-size: 0.9rem;
    cursor: pointer; margin-top: 1rem; transition: background 0.2s; font-family: inherit;
  }
  .safety-btn:hover { background: rgba(255,255,255,0.25); }
  .store-btn {
    background: var(--primary); color: #fff; border: none;
    padding: 1rem 2rem; border-radius: 1rem; font-weight: 700;
    font-size: 0.95rem; cursor: pointer; font-family: inherit;
    display: flex; align-items: center; gap: 0.75rem; transition: all 0.2s;
  }
  .store-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(80,0,136,0.2); }

  /* ---- MODAL EXTRAS ---- */
  .modal-switch { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--on-surface-variant); }
  .modal-switch a { color: var(--primary); font-weight: 700; cursor: pointer; text-decoration: underline; }
  .tab-btns { display: flex; background: var(--surface-high); border-radius: 0.75rem; padding: 0.25rem; margin-bottom: 1.5rem; gap: 0.25rem; }
  .tab-btn { flex: 1; padding: 0.6rem; border: none; background: none; border-radius: 0.5rem; cursor: pointer; font-family: inherit; font-weight: 600; font-size: 0.85rem; color: var(--on-surface-variant); transition: all 0.2s; }
  .tab-btn.active { background: #fff; color: var(--primary); box-shadow: 0 2px 8px rgba(80,0,136,0.1); }

  /* ---- NAVBAR ---- */
  nav {
    position: fixed; top: 0; left: 0; right: 0; width: 100vw; z-index: 100;
    background: rgba(255,247,254,0.85); backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(207,194,212,0.3);
  }
  .nav-inner {
    display: flex; justify-content: space-between; align-items: center;
    padding: 1rem 2rem; max-width: 1280px; margin: 0 auto; width: 100%;
  }
  .logo { font-size: 1.5rem; font-weight: 800; color: var(--primary); cursor: pointer; letter-spacing: -0.02em; }
  .nav-links { display: flex; gap: 2rem; align-items: center; }
  .nav-links a { color: var(--on-surface-variant); font-weight: 500; text-decoration: none; cursor: pointer; transition: color 0.2s; font-size: 0.95rem; }
  .nav-links a:hover, .nav-links a.active-link { color: var(--primary); }
  .nav-links a.active-link { font-weight: 700; border-bottom: 2px solid var(--primary); padding-bottom: 2px; }
  .nav-actions { display: flex; gap: 0.75rem; align-items: center; }
  .user-indicator { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.9rem; color: var(--primary); background: var(--surface-low); padding: 0.4rem 1rem; border-radius: 2rem; }
  .user-avatar { width: 28px; height: 28px; background: var(--primary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; }
  .btn-logout { background: none; border: none; cursor: pointer; color: var(--on-surface-variant); font-size: 0.85rem; font-family: inherit; padding: 0.25rem 0.5rem; border-radius: 0.5rem; }
  .btn-logout:hover { color: var(--error); }

  /* ---- PAGE LAYOUT ---- */
  main { padding-top: 5rem; width: 100%; border: none; outline: none; }
  section { padding: 5rem 2rem; width: 100%; border: none; }
  .container { max-width: 1280px; margin: 0 auto; padding: 0 2rem; width: 100%; border: none; }
  #root { width: 100%; border: none; outline: none; }

  /* ---- HOME PAGE ---- */
  .hero { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; padding: 4rem 2rem 3rem; width: 100%; }
  .hero-title { font-size: clamp(2.5rem,5vw,4.5rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 1.5rem; color: var(--primary); }
  .hero-watermark { color: rgba(80,0,136,0.15); font-size: clamp(2.5rem,5vw,4.5rem); font-weight: 800; }
  .hero-title em { font-style: italic; color: var(--primary); }
  .hero-sub { color: var(--on-surface-variant); font-size: 1.1rem; line-height: 1.7; max-width: 480px; margin-bottom: 2rem; }
  .booking-card { background: #fff; border-radius: 1.5rem; padding: 1.5rem; box-shadow: 0 0 40px rgba(80,0,136,0.08); border: 1px solid rgba(207,194,212,0.2); max-width: 420px; }
  .input-row { display: flex; align-items: center; gap: 0.75rem; background: var(--surface-low); padding: 1rem 1.25rem; border-radius: 0.875rem; margin-bottom: 0.75rem; }
  .input-row input { background: none; border: none; outline: none; font-family: inherit; font-size: 0.95rem; width: 100%; color: var(--on-surface); }
  .input-row .material-symbols-outlined { color: var(--primary); flex-shrink: 0; }
  .hero-img { border-radius: 1.5rem; overflow: hidden; position: relative; height: 500px; }
  .hero-img img { width: 100%; height: 100%; object-fit: cover; }
  .hero-img-overlay { position: absolute; inset: 0; background: linear-gradient(to top,rgba(80,0,136,0.35),transparent); }
  .route-card {
    position: absolute; bottom: 2rem; left: 2rem; right: 2rem;
    background: rgba(255,247,254,0.92); backdrop-filter: blur(12px);
    padding: 1.25rem 1.5rem; border-radius: 1rem;
    display: flex; justify-content: space-between; align-items: center;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
  .route-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: var(--primary); margin-bottom: 0.25rem; }
  .route-name { font-weight: 700; font-size: 1.05rem; }
  .route-price { font-weight: 800; font-size: 1.25rem; color: var(--primary); }
  .route-time { font-size: 0.75rem; color: var(--on-surface-variant); }
  .features-section { background: var(--surface-low); width: 100%; margin: 0; }
  .section-tag { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--primary); margin-bottom: 0.5rem; }
  .section-title { font-size: 2.5rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 3rem; }
  .bento { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; }
  .bento-card { border-radius: 1.5rem; padding: 2.5rem; position: relative; overflow: hidden; }
  .bento-card.wide { grid-column: span 2; }
  .bento-card.bg-highest { background: var(--surface-highest); }
  .bento-card.bg-white { background: #fff; border: 1px solid var(--outline-variant); }
  .bento-card.bg-primary { background: var(--primary); color: #fff; }
  .bento-card h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.75rem; letter-spacing: -0.02em; }
  .bento-card p { color: var(--on-surface-variant); line-height: 1.7; font-size: 0.95rem; }
  .bento-card.bg-primary p { color: rgba(255,255,255,0.8); }
  .bento-icon { margin-bottom: 1.5rem; }
  .bento-icon .material-symbols-outlined { color: var(--primary); font-size: 2.5rem; }
  .eco-img { position: absolute; right: 0; bottom: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.08; filter: grayscale(1); border-radius: 1.5rem; }
  .safety-icon-bg { font-size: 6rem; opacity: 0.15; position: absolute; right: 1.5rem; top: 50%; transform: translateY(-50%); display: flex; align-items: center; justify-content: center; }
  .cta-section { text-align: center; }
  .cta-title { font-size: clamp(2rem,4vw,3.5rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 2rem; color: var(--primary); }
  .cta-title span { color: var(--primary); }
  .cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
  .trust-line { display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: var(--on-surface-variant); font-weight: 500; }
  .trust-line .material-symbols-outlined { color: #e8a000; font-size: 1.2rem; }

  /* ---- HOW IT WORKS PAGE ---- */
  .badge-pill { display: inline-block; background: var(--surface-highest); color: var(--primary); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 0.4rem 1rem; border-radius: 2rem; margin-bottom: 1.25rem; }
  .hiw-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
  .hiw-title { font-size: clamp(2rem,4vw,3.5rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 1.25rem; color: var(--primary); line-height: 1.2; word-break: break-word; }
  .hiw-sub { color: var(--on-surface-variant); font-size: 1.05rem; line-height: 1.7; max-width: 440px; }
  .hiw-img-wrap { position: relative; }
  .hiw-img { border-radius: 1.5rem; overflow: hidden; height: 480px; }
  .hiw-img img { width: 100%; height: 100%; object-fit: cover; }
  .quote-card { position: absolute; bottom: -2rem; left: -2rem; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); border-radius: 1rem; padding: 1.5rem; max-width: 280px; box-shadow: 0 8px 32px rgba(80,0,136,0.1); }
  .quote-card .material-symbols-outlined { color: var(--primary); font-size: 2rem; margin-bottom: 0.75rem; display: block; }
  .quote-card p { font-style: italic; font-size: 0.9rem; color: var(--on-surface-variant); line-height: 1.6; }
  .step-card { border-radius: 1.5rem; padding: 2.5rem; position: relative; overflow: hidden; }
  .step-num { font-size: 4rem; font-weight: 900; color: rgba(80,0,136,0.08); margin-bottom: 1rem; line-height: 1; }
  .step-card h3 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.75rem; letter-spacing: -0.02em; }
  .step-card p { color: var(--on-surface-variant); line-height: 1.7; font-size: 0.95rem; }
  .step-card.bg-low { background: var(--surface-low); }
  .step-card.bg-primary { background: var(--primary); color: #fff; }
  .step-card.bg-primary p { color: rgba(255,255,255,0.85); }
  .step-card.bg-primary .step-num { color: rgba(255,255,255,0.08); }
  .step-card.bg-highest { background: var(--surface-highest); }
  .step-card.bg-white { background: #fff; border: 1px solid rgba(207,194,212,0.2); box-shadow: 0 0 40px rgba(80,0,136,0.04); }
  .schedule-previews { display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap; }
  .sched-item { min-width: 100px; padding: 1rem; border-radius: 0.875rem; text-align: center; flex-shrink: 0; }
  .sched-item.normal { background: var(--surface-highest); }
  .sched-item.active { background: var(--primary); color: #fff; }
  .sched-day { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.35rem; }
  .sched-day.normal { color: var(--primary); }
  .sched-time { font-size: 1.25rem; font-weight: 800; }
  .sched-dest { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 0.35rem; opacity: 0.6; }
  .hub-icon { position: absolute; right: 1rem; top: 1rem; font-size: 6rem; opacity: 0.1; }
  .eta-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
  .eta-pill { background: rgba(255,255,255,0.88); backdrop-filter: blur(8px); padding: 0.75rem 1.5rem; border-radius: 2rem; display: flex; align-items: center; gap: 0.75rem; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
  .eta-pill .eta-label { font-weight: 800; font-size: 0.9rem; }
  .plans-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; margin-top: 1.5rem; }
  .plan-item { background: var(--surface-low); border-radius: 0.875rem; padding: 1rem; }
  .plan-name { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--primary); margin-bottom: 0.35rem; }
  .plan-price { font-size: 1.25rem; font-weight: 800; }
  .plan-period { font-size: 0.8rem; font-weight: 400; color: var(--on-surface-variant); }
  .hiw-cta-box { background: var(--primary-container); color: #fff; border-radius: 2rem; padding: 4rem; text-align: center; }
  .hiw-cta-box h2 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.02em; }
  .hiw-cta-box > p { opacity: 0.85; margin-bottom: 2rem; font-size: 1.05rem; }
  .cta-btn-pair { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

  /* ---- ABOUT PAGE ---- */
  .about-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
  .about-title { font-size: clamp(2.5rem,5vw,3.75rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 1.5rem; line-height: 1.1; color: var(--primary); font-style: italic; }
  .about-title .dim { color: var(--primary); }
  .about-sub { color: var(--on-surface-variant); font-size: 1.05rem; line-height: 1.7; max-width: 480px; margin-bottom: 2rem; }
  .avatar-row { display: flex; align-items: center; gap: 1rem; }
  .avatars { display: flex; }
  .avatars img { width: 44px; height: 44px; border-radius: 50%; border: 3px solid var(--surface); object-fit: cover; margin-left: -8px; }
  .avatars img:first-child { margin-left: 0; }
  .avatar-text { font-size: 0.9rem; font-weight: 500; color: var(--on-surface-variant); }
  .about-img-wrap { position: relative; }
  .about-img { border-radius: 1.5rem; overflow: hidden; height: 480px; }
  .about-img img { width: 100%; height: 100%; object-fit: cover; }
  .glow-blur { position: absolute; inset: -1rem; background: rgba(80,0,136,0.05); border-radius: 2rem; filter: blur(2rem); z-index: -1; }
  .safety-section { background: var(--surface-low); }
  .safety-section-title { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
  .safety-section-sub { color: var(--on-surface-variant); max-width: 540px; line-height: 1.7; }
  .iso-badge { color: var(--primary); font-weight: 700; display: flex; align-items: center; gap: 0.5rem; white-space: nowrap; }
  .safety-card { border-radius: 1.5rem; padding: 2.5rem; overflow: hidden; position: relative; }
  .safety-card.white { background: #fff; box-shadow: 0 0 40px rgba(80,0,136,0.04); border: 1px solid rgba(207,194,212,0.2); }
  .safety-card.purple { background: var(--primary); color: #fff; }
  .safety-card.highest { background: var(--surface-highest); }
  .safety-card.img-card { padding: 0; min-height: 280px; position: relative; overflow: hidden; border-radius: 1.5rem; }
  .safety-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
  .icon-box { width: 3.5rem; height: 3.5rem; background: rgba(80,0,136,0.08); border-radius: 0.875rem; display: flex; align-items: center; justify-content: center; }
  .icon-box .material-symbols-outlined { color: var(--primary); font-size: 1.75rem; }
  .safety-card h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.75rem; letter-spacing: -0.02em; }
  .safety-card.white p, .safety-card.highest p { color: var(--on-surface-variant); line-height: 1.7; font-size: 0.95rem; }
  .safety-card.purple p { color: rgba(255,255,255,0.8); line-height: 1.7; font-size: 0.95rem; }
  .tag-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1.25rem; }
  .tag-pill { background: var(--surface-container); color: var(--on-surface-variant); padding: 0.4rem 0.875rem; border-radius: 2rem; font-size: 0.8rem; font-weight: 600; }
  .safety-card.purple .material-symbols-outlined { font-size: 2.5rem; margin-bottom: 1rem; display: block; }
  .safety-card.purple h3 { color: #fff; }
  .live-dot { display: flex; align-items: center; gap: 0.5rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.15); font-size: 0.85rem; font-weight: 600; }
  .pulse { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  .safety-img-inner { width: 100%; height: 100%; min-height: 280px; object-fit: cover; }
  .dark-overlay { position: absolute; inset: 0; background: linear-gradient(to top,rgba(80,0,136,0.9) 0%,transparent 60%); display: flex; align-items: flex-end; padding: 2.5rem; }
  .dark-text { color: #fff; max-width: 340px; }
  .dark-text h3 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.75rem; }
  .dark-text p { opacity: 0.85; line-height: 1.7; font-size: 0.95rem; }
  .stats-section { text-align: center; }
  .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 2rem; }
  .stat-item .num { font-size: 3rem; font-weight: 800; color: var(--primary); margin-bottom: 0.35rem; letter-spacing: -0.03em; }
  .stat-item .lbl { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--on-surface-variant); }
  .about-cta-box { background: var(--surface-highest); border-radius: 2.5rem; padding: 5rem 3rem; text-align: center; }
  .about-cta-box h2 { font-size: 2.5rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 1rem; color: var(--primary); }
  .about-cta-box > p { color: var(--on-surface-variant); font-size: 1.05rem; margin-bottom: 2.5rem; max-width: 500px; margin-left: auto; margin-right: auto; }
  .store-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

  /* ---- CONTACT PAGE ---- */
  .contact-title { font-size: clamp(2rem,4vw,3.5rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.05; margin-bottom: 1rem; color: var(--primary); white-space: nowrap; }
  .contact-title .accent { color: var(--primary); }
  .contact-sub { color: var(--on-surface-variant); font-size: 0.95rem; line-height: 1.7; max-width: 100%; margin-bottom: 3rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .contact-grid { display: grid; grid-template-columns: 7fr 5fr; gap: 2rem; }
  .contact-form-card { background: var(--surface-low); border-radius: 1.5rem; padding: 3rem; }
  .contact-form-card h2 { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 2rem; }
  .contact-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
  .contact-info-stack { display: flex; flex-direction: column; gap: 1.25rem; }
  .contact-loc-card { background: var(--primary); color: #fff; border-radius: 1.5rem; padding: 2rem; }
  .contact-loc-card h3 { font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem; }
  .contact-loc-card > p { opacity: 0.8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.25rem; }
  .loc-map { border-radius: 0.875rem; overflow: hidden; aspect-ratio: 16/9; filter: grayscale(1) brightness(0.7); }
  .loc-map img { width: 100%; height: 100%; object-fit: cover; opacity: 0.55; }
  .contact-mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .contact-mini-card { background: var(--surface-highest); border-radius: 1rem; padding: 1.25rem; }
  .contact-mini-card .material-symbols-outlined { color: var(--primary); margin-bottom: 0.75rem; display: block; }
  .contact-mini-card h4 { font-weight: 700; font-size: 0.95rem; margin-bottom: 0.35rem; }
  .contact-mini-card p { font-size: 0.85rem; color: var(--on-surface-variant); }
  .faq-section { margin-top: 5rem; }
  .faq-title { text-align: center; font-size: 2.25rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 0.75rem; color: var(--primary); }
  .faq-sub { text-align: center; color: var(--on-surface-variant); margin-bottom: 3rem; font-size: 1rem; }
  .faq-list { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.75rem; }
  .faq-item { background: var(--surface-low); border-radius: 1rem; overflow: hidden; }
  .faq-q { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; cursor: pointer; transition: background 0.2s; }
  .faq-q:hover { background: var(--surface-container); }
  .faq-q h4 { font-weight: 700; font-size: 1rem; }
  .faq-icon { font-size: 1.5rem; color: var(--primary); transition: transform 0.3s; flex-shrink: 0; }
  .faq-icon.open { transform: rotate(45deg); }
  .faq-a { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
  .faq-a.open { max-height: 200px; }
  .faq-a p { padding: 0 1.5rem 1.25rem; color: var(--on-surface-variant); line-height: 1.7; font-size: 0.95rem; }

  /* ---- REGISTER PAGE ---- */
  .register-grid { display: grid; grid-template-columns: 5fr 7fr; gap: 3rem; align-items: start; }
  .reg-title { font-size: clamp(2rem,4vw,3rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 1rem; }
  .reg-title .accent { color: var(--primary-container); }
  .reg-sub { color: var(--on-surface-variant); font-size: 1.05rem; line-height: 1.7; }
  .trust-card { background: var(--surface-low); border-radius: 1.25rem; padding: 2rem; }
  .trust-card h3 { font-size: 1.1rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem; }
  .trust-item { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; }
  .trust-icon-wrap { width: 2.5rem; height: 2.5rem; background: rgba(80,0,136,0.08); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .trust-icon-wrap .material-symbols-outlined { color: var(--primary); font-size: 1.25rem; }
  .trust-item h4 { font-weight: 700; font-size: 0.9rem; margin-bottom: 0.2rem; }
  .trust-item p { font-size: 0.85rem; color: var(--on-surface-variant); line-height: 1.5; }
  .reg-img-wrap { position: relative; border-radius: 1.25rem; overflow: hidden; height: 220px; }
  .reg-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
  .reg-img-overlay { position: absolute; inset: 0; background: linear-gradient(to top,rgba(80,0,136,0.6),transparent); display: flex; align-items: flex-end; padding: 1.5rem; }
  .reg-img-stat .big { font-size: 2rem; font-weight: 800; color: #fff; }
  .reg-img-stat .small { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.85; color: #fff; }
  .register-form-card { background: #fff; border-radius: 1.5rem; padding: 3rem; box-shadow: 0 0 40px rgba(80,0,136,0.06); }
  .register-form-card h2 { font-size: 1.75rem; font-weight: 800; margin-bottom: 2rem; letter-spacing: -0.02em; }
  .role-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--primary); margin-bottom: 0.75rem; display: block; }
  .role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; }
  .role-card { border: 2px solid var(--outline-variant); border-radius: 0.875rem; padding: 1.25rem; cursor: pointer; text-align: center; transition: all 0.2s; background: var(--surface-low); }
  .role-card:hover { border-color: var(--primary); background: rgba(80,0,136,0.04); }
  .role-card.selected { border-color: var(--primary); background: rgba(80,0,136,0.06); }
  .role-card .material-symbols-outlined { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
  .role-card .material-symbols-outlined { color: var(--on-surface-variant); }
  .role-card.selected .material-symbols-outlined { color: var(--primary); }
  .role-card-label { font-weight: 700; font-size: 0.9rem; color: var(--on-surface); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .form-terms { font-size: 0.85rem; color: var(--on-surface-variant); text-align: center; margin-top: 1.25rem; line-height: 1.6; }
  .form-terms a { color: var(--primary); font-weight: 600; cursor: pointer; }
  .mini-stats { margin-top: 1.5rem; display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }
  .mini-stat-card { background: var(--surface-low); border-radius: 1rem; padding: 1rem; display: flex; align-items: center; gap: 0.875rem; }
  .mini-stat-icon { width: 3rem; height: 3rem; background: #fff; border-radius: 0.875rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .mini-stat-icon .material-symbols-outlined { color: var(--primary); font-size: 1.5rem; }
  .mini-stat-num { font-weight: 700; font-size: 0.9rem; }
  .mini-stat-lbl { font-size: 0.75rem; color: var(--on-surface-variant); }
  .uptime-card { background: rgba(80,0,136,0.05); border-radius: 1rem; padding: 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .uptime-num { font-size: 1.5rem; font-weight: 900; color: var(--primary); }
  .uptime-lbl { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(80,0,136,0.6); }

  /* ---- FOOTER ---- */
  footer { background: var(--surface-low); padding: 4rem 2rem 2rem; }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 3rem; max-width: 1280px; margin: 0 auto 3rem; }
  .footer-logo { font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1rem; text-align: left; }
  .footer-desc { color: var(--on-surface-variant); font-size: 0.9rem; line-height: 1.7; max-width: 280px; text-align: left; }
  .footer-col h4 { font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--primary); margin-bottom: 1rem; }
  .footer-col a { display: block; color: var(--on-surface-variant); text-decoration: none; font-size: 0.9rem; margin-bottom: 0.6rem; cursor: pointer; transition: color 0.2s; }
  .footer-col a:hover { color: var(--primary); }
  .footer-bottom { max-width: 1280px; margin: 0 auto; padding-top: 2rem; border-top: 1px solid var(--outline-variant); display: flex; justify-content: space-between; align-items: center; color: var(--on-surface-variant); font-size: 0.85rem; }
  .footer-icons { display: flex; gap: 1rem; }
  .footer-icons .material-symbols-outlined { cursor: pointer; color: var(--on-surface-variant); transition: color 0.2s; }
  .footer-icons .material-symbols-outlined:hover { color: var(--primary); }

  /* ---- RESPONSIVE — makes things stack on small screens ---- */
  @media (max-width: 900px) {
    .hero, .hiw-hero, .about-hero, .register-grid { grid-template-columns: 1fr; }
    .hero-img { height: 300px; }
    .bento { grid-template-columns: 1fr; }
    .bento-card.wide { grid-column: span 1; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .contact-grid { grid-template-columns: 1fr; }
    .contact-form-grid { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr; }
  }
  /* ===================== DASHBOARD ===================== */
  .dashboard-page { min-height: 100vh; background: var(--surface-low); padding: 6rem 2rem 3rem; }
  .dashboard-container { max-width: 1000px; margin: 0 auto; }
  .dashboard-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2.5rem; background: white; padding: 2rem; border-radius: 1.5rem; box-shadow: 0 2px 16px rgba(80,0,136,0.07); }
  .dashboard-avatar { width: 5rem; height: 5rem; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; color: white; flex-shrink: 0; }
  .dashboard-header-info h2 { font-size: 1.5rem; font-weight: 800; color: var(--primary); margin-bottom: 0.25rem; }
  .dashboard-header-info p { color: var(--on-surface-variant); font-size: 0.95rem; }
  .dashboard-role-badge { display: inline-block; background: var(--primary-container); color: var(--primary); font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 2rem; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.4rem; }
  .dashboard-tabs { display: flex; gap: 0.5rem; margin-bottom: 2rem; background: white; padding: 0.5rem; border-radius: 1rem; box-shadow: 0 2px 8px rgba(80,0,136,0.06); overflow-x: auto; }
  .dashboard-tab { flex: 1; min-width: fit-content; padding: 0.75rem 1.25rem; border: none; background: transparent; border-radius: 0.75rem; font-weight: 600; font-size: 0.9rem; cursor: pointer; color: var(--on-surface-variant); transition: all 0.2s; white-space: nowrap; }
  .dashboard-tab.active { background: var(--primary); color: white; }
  .dashboard-card { background: white; border-radius: 1.5rem; padding: 2rem; box-shadow: 0 2px 16px rgba(80,0,136,0.07); margin-bottom: 1.5rem; }
  .dashboard-card h3 { font-size: 1.1rem; font-weight: 800; color: var(--primary); margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 2px solid var(--primary-container); }
  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .detail-item { background: var(--surface-low); border-radius: 0.75rem; padding: 1rem; }
  .detail-item label { font-size: 0.75rem; font-weight: 700; color: var(--on-surface-variant); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.25rem; }
  .detail-item span { font-size: 0.95rem; font-weight: 600; color: var(--on-surface); }
  .detail-item input, .detail-item select { width: 100%; border: 2px solid var(--primary-container); border-radius: 0.5rem; padding: 0.4rem 0.6rem; font-size: 0.95rem; font-weight: 600; color: var(--on-surface); background: white; outline: none; }
  .detail-item input:focus, .detail-item select:focus { border-color: var(--primary); }
  .edit-btn { display: flex; align-items: center; gap: 0.5rem; background: var(--primary-container); color: var(--primary); border: none; border-radius: 0.75rem; padding: 0.6rem 1.25rem; font-weight: 700; font-size: 0.9rem; cursor: pointer; margin-top: 1rem; transition: all 0.2s; }
  .edit-btn:hover { background: var(--primary); color: white; }
  .save-btn { display: flex; align-items: center; gap: 0.5rem; background: var(--primary); color: white; border: none; border-radius: 0.75rem; padding: 0.6rem 1.25rem; font-weight: 700; font-size: 0.9rem; cursor: pointer; margin-top: 1rem; margin-left: 0.5rem; transition: all 0.2s; }
  .emergency-card { background: #fff5f5; border: 2px solid #ffe4e4; border-radius: 1rem; padding: 1.25rem; }
  .emergency-card h4 { font-size: 0.95rem; font-weight: 700; color: #c0392b; margin-bottom: 0.75rem; }
  .add-emergency-btn { background: var(--primary); color: white; border: none; border-radius: 0.75rem; padding: 0.75rem 1.5rem; font-weight: 700; cursor: pointer; width: 100%; margin-top: 1rem; }
  .empty-state { text-align: center; padding: 3rem; color: var(--on-surface-variant); }
  .empty-state p { font-size: 1rem; margin-top: 0.5rem; }
  .payment-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.8rem; font-weight: 700; }
  .payment-badge.active { background: #e8f5e9; color: #2e7d32; }
  .payment-badge.pending { background: #fff3e0; color: #e65100; }
  .logout-btn { background: #fff0f0; color: #c0392b; border: none; border-radius: 0.75rem; padding: 0.6rem 1.25rem; font-weight: 700; cursor: pointer; margin-left: auto; }
  .logout-btn:hover { background: #c0392b; color: white; }

  @media (max-width: 768px) {
    .nav-links { display: none; }
  }
`

// ============================================================
// SECTION 2 — ICON HELPER
// Instead of writing <span className="material-symbols-outlined">
// every time, we use this small Icon component.
//
// Usage:  <Icon name="star" />
// ============================================================
function Icon({ name, style }) {
  return <span className="material-symbols-outlined" style={style}>{name}</span>
}

// ============================================================
// SECTION 3 — TOAST
// The little notification that slides up from the bottom.
//
// Props:
//   message — the text to show
//   show    — true/false: whether it's visible
// ============================================================
function Toast({ message, show }) {
  return (
    <div className={`toast ${show ? "show" : ""}`}>
      {message}
    </div>
  )
}

// ============================================================
// SECTION 4 — NAVBAR
// The sticky top navigation bar.
//
// Props:
//   currentPage   — which page is active (e.g. "home")
//   goTo          — function to navigate to a page
//   currentUser   — the logged-in user object (or null)
//   onLogout      — function to log the user out
//   openLogin     — function to open the login modal
//   openSignup    — function to open the signup modal
// ============================================================
function Navbar({ currentPage, goTo, currentUser, onLogout, openLogin, openSignup }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const initials = currentUser
    ? (currentUser.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : ""

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest(".profile-dropdown-wrapper")) setDropdownOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleDashboard() {
    setDropdownOpen(false)
    goTo("dashboard")
  }

  function handleLogout() {
    setDropdownOpen(false)
    onLogout()
  }

  return (
    <nav>
      <div className="nav-inner">

        {/* Logo */}
        <div className="logo" onClick={() => goTo("home")}>YanaGaman</div>

        {/* Navigation links */}
        <div className="nav-links">
          <a className={currentPage === "home" ? "active-link" : ""} onClick={() => goTo("home")}>Home</a>
          <a className={currentPage === "howitworks" ? "active-link" : ""} onClick={() => goTo("howitworks")}>How it Works</a>
          <a className={currentPage === "about" ? "active-link" : ""} onClick={() => goTo("about")}>About Us</a>
          <a className={currentPage === "contact" ? "active-link" : ""} onClick={() => goTo("contact")}>Contact Us</a>
        </div>

        {/* Login/Signup OR Profile Dropdown */}
        {!currentUser ? (
          <div className="nav-actions">
            <button className="btn-ghost" onClick={openLogin}>Login</button>
            <button className="btn-primary" onClick={openSignup}>Sign Up</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={onLogout} style={{ background: "#fff0f0", color: "#c0392b", border: "none", borderRadius: "0.875rem", padding: "0.5rem 1rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}>
            Sign Out
          </button>
          <div className="profile-dropdown-wrapper" style={{ position: "relative" }}>
            {/* Profile Button */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "var(--primary-container)", border: "none", borderRadius: "2rem", padding: "0.4rem 1rem 0.4rem 0.4rem", cursor: "pointer", transition: "all 0.2s" }}
            >
              <div style={{ width: "2.2rem", height: "2.2rem", background: "linear-gradient(135deg, var(--primary), #9c27b0)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800, color: "white" }}>
                {initials}
              </div>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--primary)" }}>{(currentUser.name || "User").split(" ")[0]}</span>
              <span style={{ fontSize: "0.7rem", color: "var(--primary)", transition: "transform 0.2s", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 0.75rem)", right: 0, background: "white", borderRadius: "1.25rem", boxShadow: "0 8px 32px rgba(80,0,136,0.18)", minWidth: "220px", overflow: "hidden", zIndex: 200, border: "1px solid var(--primary-container)" }}>
                
                {/* User Info Header */}
                <div style={{ padding: "1.25rem", background: "linear-gradient(135deg, var(--primary-container), #f3e5f5)", borderBottom: "1px solid var(--primary-container)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "2.75rem", height: "2.75rem", background: "linear-gradient(135deg, var(--primary), #9c27b0)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 800, color: "white" }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--primary)" }}>{currentUser.name || "User"}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--on-surface-variant)" }}>{currentUser.email || ""}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: "0.6rem", display: "inline-block", background: "var(--primary)", color: "white", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.7rem", borderRadius: "2rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {currentUser.role === "driver" ? "🚗 Driver" : "🛕 Passenger"}
                  </div>
                </div>

                {/* Menu Items */}
                <div style={{ padding: "0.5rem" }}>
                  <button onClick={handleDashboard} style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "none", border: "none", borderRadius: "0.75rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "var(--on-surface)", textAlign: "left", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--primary-container)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <Icon name="person" style={{ fontSize: "1.1rem", color: "var(--primary)" }} />
                    My Dashboard
                  </button>
                  <button onClick={handleDashboard} style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "none", border: "none", borderRadius: "0.75rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "var(--on-surface)", textAlign: "left", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--primary-container)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <Icon name="emergency" style={{ fontSize: "1.1rem", color: "var(--primary)" }} />
                    Emergency Contacts
                  </button>
                  <button onClick={handleDashboard} style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "none", border: "none", borderRadius: "0.75rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "var(--on-surface)", textAlign: "left", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--primary-container)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <Icon name="payments" style={{ fontSize: "1.1rem", color: "var(--primary)" }} />
                    Payments
                  </button>
                  <div style={{ height: "1px", background: "var(--primary-container)", margin: "0.4rem 0" }} />
                  <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "none", border: "none", borderRadius: "0.75rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "#c0392b", textAlign: "left", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fff0f0"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <Icon name="logout" style={{ fontSize: "1.1rem", color: "#c0392b" }} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        )}

      </div>
    </nav>
  )
}

// ============================================================
// SECTION 5 — MODALS (Login & Signup popups)
// ============================================================

// --- Helper: a single form field with label and optional error ---
// This avoids repeating the same form-group HTML over and over.
function Field({ label, type = "text", placeholder, value, onChange, error, children }) {
  return (
    <div className={`form-group ${error ? "field-invalid" : ""}`}>
      <label>{label}</label>
      {children || (
        type === "select" ? null : (
          <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        )
      )}
      {error && <div className="error-msg">{error}</div>}
    </div>
  )
}

// --- LOGIN MODAL ---
function LoginModal({ isOpen, onClose, onLogin, switchToSignup }) {
  // State for the two form fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  // State to track validation errors
  const [errors, setErrors] = useState({})

  async function handleSubmit() {
    const newErrors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const snap = await get(ref(db, "users/" + result.user.uid))
      const userData = snap.val() || { name: email.split("@")[0], email, role: "passenger" }
      onLogin(userData)
      setErrors({})
      setEmail("")
      setPassword("")
      onClose()
    } catch (err) {
      setErrors({ email: "Invalid email or password. Please try again." })
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Welcome back</h2>
        <p>Sign in to your YanaGaman account</p>

        <div className={`form-group ${errors.email ? "field-invalid" : ""}`}>
          <label>Email Address</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          <div className="error-msg">{errors.email}</div>
        </div>

        <div className={`form-group ${errors.password ? "field-invalid" : ""}`}>
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          <div className="error-msg">{errors.password}</div>
        </div>

        <button className="btn-full primary" onClick={handleSubmit}>
          Sign In <Icon name="arrow_forward" style={{ fontSize: "1.1rem" }} />
        </button>

        <div className="modal-switch">
          Don't have an account?{" "}
          <a onClick={() => { onClose(); switchToSignup() }}>Sign up</a>
        </div>
      </div>
    </div>
  )
}

// --- SIGNUP MODAL ---
function SignupModal({ isOpen, onClose, onSignup, switchToLogin }) {
  const [tab, setTab] = useState("passenger")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [city, setCity] = useState("")
  const [pickup, setPickup] = useState("")
  const [dropLocation, setDropLocation] = useState("")
  const [sameEveningRoutine, setSameEveningRoutine] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [vehicleType, setVehicleType] = useState("own")
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [errors, setErrors] = useState({})
  const [showPwd, setShowPwd] = useState(false)

  const cities = [
    "Colombo 1 – Fort", "Colombo 2 – Slave Island", "Colombo 3 – Kollupitiya",
    "Colombo 4 – Bambalapitiya", "Colombo 5 – Havelock Town", "Colombo 6 – Wellawatta",
    "Colombo 7 – Cinnamon Gardens", "Colombo 10 – Borella", "Colombo 15 – Mutwal",
    "Dehiwala", "Mount Lavinia", "Nugegoda", "Maharagama", "Kotte"
  ]

  async function handleSubmit() {
    const newErrors = {}
    if (!name) newErrors.name = "Please enter your full name"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Valid email required"
    if (!phone) newErrors.phone = "Phone required"
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters"
    if (tab === "passenger" && !pickup) newErrors.pickup = "Pickup location required"
    if (tab === "passenger" && !dropLocation) newErrors.dropLocation = "Drop location required"
    if (tab === "driver" && vehicleType === "own" && !vehicleNumber) newErrors.vehicleNumber = "Vehicle number required"

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const userData = tab === "passenger"
        ? { name, email, phone, city, role: tab, pickup, dropLocation, sameEveningRoutine, companyName }
        : { name, email, phone, city, role: tab, vehicleType, vehicleNumber: vehicleType === "own" ? vehicleNumber : "Company Vehicle", companyName }
      await set(ref(db, "users/" + result.user.uid), userData)
      onSignup({ name, email, role: tab })
      setErrors({})
      setName(""); setEmail(""); setPhone(""); setPassword(""); setCity("")
      setPickup(""); setDropLocation(""); setSameEveningRoutine(false)
      setVehicleNumber(""); setCompanyName("")
      onClose()
    } catch (err) {
      setErrors({ email: err.message })
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Create account</h2>
        <p>Join 50,000+ Colombo commuters</p>

        {/* Passenger / Driver tab selector */}
        <div className="tab-btns">
          <button className={`tab-btn ${tab === "passenger" ? "active" : ""}`} onClick={() => setTab("passenger")}>🛕 Passenger</button>
          <button className={`tab-btn ${tab === "driver" ? "active" : ""}`} onClick={() => setTab("driver")}>🚗 Driver</button>
        </div>

        {/* Common Fields */}
        <div className={`form-group ${errors.name ? "field-invalid" : ""}`}>
          <label>Full Name</label>
          <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
          <div className="error-msg">{errors.name}</div>
        </div>

        <div className={`form-group ${errors.email ? "field-invalid" : ""}`}>
          <label>Email</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          <div className="error-msg">{errors.email}</div>
        </div>

        <div className={`form-group ${errors.phone ? "field-invalid" : ""}`}>
          <label>Mobile Number</label>
          <input type="tel" placeholder="+94 77 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />
          <div className="error-msg">{errors.phone}</div>
        </div>

        <div className={`form-group ${errors.password ? "field-invalid" : ""}`}>
          <label>Password</label>
          <div style={{ position: "relative" }}>
            <input type={showPwd ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: "3rem", width: "100%" }} />
            <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--on-surface-variant)", fontSize: "1.1rem" }}>
              {showPwd ? "🙈" : "👁️"}
            </button>
          </div>
          <div className="error-msg">{errors.password}</div>
        </div>

        <div className="form-group">
          <label>Company Name (Optional)</label>
          <input type="text" placeholder="Your company name" value={companyName} onChange={e => setCompanyName(e.target.value)} />
        </div>

        {/* Passenger-only Fields */}
        {tab === "passenger" && (
          <>
            <div className={`form-group ${errors.pickup ? "field-invalid" : ""}`}>
              <label>Pickup Location</label>
              <select value={city} onChange={e => { setCity(e.target.value); setPickup(e.target.value) }}>
                <option value="">Select pickup region</option>
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
              <div className="error-msg">{errors.pickup}</div>
            </div>

            <div className={`form-group ${errors.dropLocation ? "field-invalid" : ""}`}>
              <label>Drop Location</label>
              <input type="text" placeholder="Enter drop location" value={dropLocation} onChange={e => setDropLocation(e.target.value)} />
              <div className="error-msg">{errors.dropLocation}</div>
            </div>

            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", textTransform: "none", letterSpacing: 0, fontSize: "0.9rem" }}>
                <input
                  type="checkbox"
                  checked={sameEveningRoutine}
                  onChange={e => setSameEveningRoutine(e.target.checked)}
                  style={{ width: "1.1rem", height: "1.1rem", accentColor: "var(--primary)", cursor: "pointer" }}
                />
                Use same routine for evening return trip
              </label>
            </div>
          </>
        )}

        {/* Driver-only Fields */}
        {tab === "driver" && (
          <>
            <div className="form-group">
              <label>Vehicle Type</label>
              <select value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
                <option value="own">My Own Vehicle</option>
                <option value="company">Company Provided Vehicle</option>
              </select>
            </div>

            {vehicleType === "own" && (
              <div className={`form-group ${errors.vehicleNumber ? "field-invalid" : ""}`}>
                <label>Vehicle Number <span style={{ color: "var(--error)" }}>*</span></label>
                <input type="text" placeholder="e.g. CAB-1234" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} />
                <div className="error-msg">{errors.vehicleNumber}</div>
              </div>
            )}
          </>
        )}

        <button className="btn-full primary" style={{ marginTop: "0.5rem" }} onClick={handleSubmit}>
          Create My Account <Icon name="arrow_forward" style={{ fontSize: "1.1rem" }} />
        </button>

        <div className="modal-switch">
          Already have an account?{" "}
          <a onClick={() => { onClose(); switchToLogin() }}>Log in</a>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SECTION 6 — FOOTER
// Shown at the bottom of every page.
// ============================================================
function Footer({ goTo }) {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="footer-logo">YanaGaman</div>
          <p className="footer-desc">
            Defining the future of urban mobility in Sri Lanka through precision engineering and communal intelligence.
          </p>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          <a>Fleet</a>
          <a>Business</a>
          <a>Pricing</a>
        </div>
        <div className="footer-col">
          <h4>Resources</h4>
          <a>Support</a>
          <a>Blog</a>
          <a onClick={() => goTo("about")}>Safety</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 YanaGaman. All rights reserved.</span>
        <div className="footer-icons">
          <Icon name="public" />
          <Icon name="alternate_email" />
        </div>
      </div>
    </footer>
  )
}

// ============================================================
// SECTION 7 — HOME PAGE
// ============================================================
function HomePage({ goTo, openLogin, openSignup, currentUser, showToast }) {
  const [pickup, setPickup] = useState("")
  const [destination, setDestination] = useState("")

  // What happens when you click "Find My Pool"
  function handleFindPool() {
    if (!pickup || !destination) {
      showToast("Please enter pickup and destination")
      return
    }
    if (!currentUser) {
      showToast("Please sign in to find pools")
      openLogin()
      return
    }
    showToast(`Searching pools from ${pickup} to ${destination}… 🚗`)
  }

  return (
    <>
      <main>
        {/* ---- HERO SECTION ---- */}
        <div className="container">
          <div className="hero">
            {/* Left side: text + booking form */}
            <div>
              <h1 className="hero-title">
                Colombo's Rhythm,<br /><em>Synchronized.</em>
              </h1>
              <p className="hero-sub">
                YanaGaman isn't just pooling; it's a premium smart transit ecosystem designed for the urban kinetic.
                Move faster, smarter, and greener through the heart of Sri Lanka.
              </p>
              <div className="booking-card">
                <div className="input-row">
                  <Icon name="location_on" />
                  <input type="text" placeholder="Where from?" value={pickup} onChange={e => setPickup(e.target.value)} />
                </div>
                <div className="input-row">
                  <Icon name="near_me" />
                  <input type="text" placeholder="Destination in Colombo" value={destination} onChange={e => setDestination(e.target.value)} />
                </div>
                <button className="btn-full primary" style={{ marginTop: "0.5rem" }} onClick={handleFindPool}>
                  Find My Pool
                </button>
              </div>
            </div>

            {/* Right side: image with route overlay */}
            <div className="hero-img">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJbtiTi7LEpSMrUORbXiwVHzojpLUxOKSJ5sjaikONMAwnJCjXwc5FIbhAGJ9gqDdLRHuEWLCac1nyUfVdsTvZw0UK-iKYhfLbITxXdH5w0dKevmF0s3yEzS7xniPz8ui0mtqVcsiZDMtDhH41OuFwk9JRgvCCUjJX39BtNcAF6nJYZtbHCOkWSxjE9CFTfFb8R_VFTL5n7du0TjZvOzxs5tip_7PrCEKgv7eZikLausGqvgSPnQO1WQvpdm24KCovHi2sWDGYN6k"
                alt="Colombo cityscape"
              />
              <div className="hero-img-overlay" />
              <div className="route-card">
                <div>
                  <div className="route-label">Live Popular Route</div>
                  <div className="route-name">Borella → Fort</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="route-price">LKR 140</div>
                  <div className="route-time">Next in 4 mins</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---- FEATURES BENTO GRID ---- */}
        <section className="features-section">
          <div className="container">
            <div className="section-tag">Atmospheric Precision</div>
            <h2 className="section-title">Why YanaGaman?</h2>
            <div className="bento">

              {/* Card 1 - Eco (spans 2 columns) */}
              <div className="bento-card bg-highest wide">
                <div className="bento-icon"><Icon name="eco" /></div>
                <h3>Eco-Friendly Evolution</h3>
                <p>Our intelligent algorithms optimize routes to reduce Colombo's carbon footprint by up to 40%.</p>
                <img className="eco-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEerUK1fpDkeVl8jfQNHP2Zz5-YuJ0YcKeXQ3-YqeffjStVTbs_hNTpKBXD12c1y-ubw5amT1PNAFhB3d-GO8Agt23K5pi2f_nKPOoQ4MBUJUUoCzrRDy3_IJDNoVbyrdWsXruAkrO3u37-PknvzyT3_jrQJTOaXWXkDG3SUZyttKYE9qDzHAoNRsk7nxSnJIMeCrB6Q46HORZg7TyJimbFS119ggE5WFyONDDHhrF9Irsakg_88pZFS7IFE3xiuIzg2zZfvctuwI" alt="" />
              </div>

              {/* Card 2 - Flex Schedule */}
              <div className="bento-card bg-white">
                <div className="bento-icon"><Icon name="schedule" /></div>
                <h3>Flex Schedule</h3>
                <p>Book now or pre-schedule for the whole week. Our dynamic pooling adapts to your rhythm.</p>
              </div>

              {/* Card 3 - Neural Routing */}
              <div className="bento-card bg-white">
                <div className="bento-icon"><Icon name="alt_route" /></div>
                <h3>Neural Routing</h3>
                <p>Bypass peak-hour gridlock. Real-time traffic data finds the most efficient paths.</p>
              </div>

              {/* Card 4 - Security (spans 2 columns) */}
              <div className="bento-card bg-primary wide">
                <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <h3>Security by Design</h3>
                    <p>Verified profiles, real-time trip sharing, and a 24/7 support concierge.</p>
                    <button className="safety-btn" onClick={() => goTo("about")}>Safety Standards</button>
                  </div>
                  <Icon name="verified_user" style={{ fontSize: "6rem", opacity: 0.15, position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ---- CALL TO ACTION ---- */}
        <section className="cta-section">
          <div className="container">
            <h2 className="cta-title">
              Ready to join the<br /><span>transport revolution?</span>
            </h2>
            <div className="cta-btns">
              <button className="btn-large primary" onClick={openSignup}>Start Your First Pool</button>
              <button className="btn-large secondary" onClick={() => goTo("howitworks")}>How It Works</button>
            </div>
            <div className="trust-line">
              <Icon name="star" style={{ color: "#e8a000", fontSize: "1.2rem", fontVariationSettings: "'FILL' 1" }} />
              Trusted by 50,000+ Colombo commuters
            </div>
          </div>
        </section>
      </main>
      <Footer goTo={goTo} />
    </>
  )
}

// ============================================================
// SECTION 8 — HOW IT WORKS PAGE
// ============================================================
function HowItWorksPage({ goTo, openSignup }) {
  return (
    <>
      <main>
        {/* Hero */}
        <section>
          <div className="container">
            <div className="hiw-hero">
              <div>
                <div className="badge-pill">The Kinetic Journey</div>
                <h1 className="hiw-title">
                  Atmospheric<br />
                  <span style={{ background: "linear-gradient(135deg,var(--primary),var(--primary-container))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Precision.
                  </span>
                </h1>
                <p className="hiw-sub">
                  Redefining urban movement through data-driven logistics and elegant simplicity.
                </p>
              </div>
              <div className="hiw-img-wrap">
                <div className="hiw-img">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE8oeIOPqToTDEzYbxNMa73pywTh1IJlK8sIKLJhMyEKkjd8HyaN7AEoiSAbPw8UnEy6hltXdSr3jd8V71g0GBwjoGqEf2mrUgH74dRek9uYlIqat5htdY01ByClSErS5kre_Z6cxkCv_odga2rX_mftaXwAkdRzgsfDJb1AYIKxEK3w9DG0OIhcmKOhyFR29a2FwywFnVWgdqsPqayKo9_OqlBwM-KQrTtWdV4PuzrY_fvnl7L2Mrsb5mt81RTbpBqRRTPJm9Lj0" alt="" />
                </div>
                <div className="quote-card">
                  <Icon name="auto_awesome" />
                  <p>"The future of transport isn't just fast; it's smart."</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Steps */}
        <section style={{ background: "var(--surface-low)" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>

              {/* Row 1: Steps 1 & 2 */}
              <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: "1.25rem" }}>
                <div className="step-card bg-low">
                  <div className="step-num">01</div>
                  <h3>Set Schedule</h3>
                  <p>Define your weekly rhythm once. Our system learns your preferences to anticipate your needs.</p>
                  <div className="schedule-previews">
                    <div className="sched-item normal"><div className="sched-day normal">MON</div><div className="sched-time">08:30</div><div className="sched-dest">Work Hub</div></div>
                    <div className="sched-item active"><div className="sched-day">WED</div><div className="sched-time">17:45</div><div className="sched-dest">Gym District</div></div>
                    <div className="sched-item normal"><div className="sched-day normal">FRI</div><div className="sched-time">19:00</div><div className="sched-dest">City Center</div></div>
                  </div>
                </div>
                <div className="step-card bg-primary" style={{ position: "relative" }}>
                  <Icon name="hub" style={{ fontSize: "6rem", opacity: 0.1, position: "absolute", right: "1rem", top: "1rem" }} />
                  <div className="step-num">02</div>
                  <h3>Smart Pooling Match</h3>
                  <p>Our kinetic algorithm matches you with commuters sharing 90%+ of your route.</p>
                </div>
              </div>

              {/* Row 2: Steps 3 & 4 */}
              <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: "1.25rem" }}>
                <div className="step-card bg-highest">
                  <div className="step-num">03</div>
                  <h3>Real-time Transparency</h3>
                  <p style={{ marginBottom: "1.25rem" }}>Track every kilometer and every cent in high definition.</p>
                  <div style={{ height: "140px", borderRadius: "0.875rem", overflow: "hidden", position: "relative", background: "var(--surface-container)" }}>
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBamk9BUUkdonV18mp9jj76wiVGZpVay5knfVkvsMg26fIL23clYJeyhneFKmsEOcp3ZwFotZVF1Ov-U5nY7lle6iJlO5rGxwEIpuQKxb-frcnIM-jmDvneqTQgkI2TfzyHjeltdKst_37MYjPCkuV90bDS3ABAjt4JYx8O17DKqmcNTcvw_qdnX2Kfxx_VIMJgCryCkKgVwYMwLNoJzuNmug4PomIgRcXiiyG1-jKJAVYIssNKDsQ5NbccwIfj7RLCvmDtb3KkQ_U" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div className="eta-overlay">
                      <div className="eta-pill">
                        <Icon name="near_me" style={{ color: "var(--primary)" }} />
                        <span className="eta-label">ETA 4 MIN</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="step-card bg-white">
                  <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div className="step-num">04</div>
                      <h3>Flexible Subscriptions</h3>
                      <p>Choose a plan that fits your lifestyle. Pause, upgrade, or modify with a single tap.</p>
                      <button className="btn-primary" style={{ marginTop: "1.5rem" }} onClick={() => goTo("register")}>View Plans</button>
                    </div>
                    <div style={{ flex: 1, minWidth: "160px" }}>
                      <div className="plans-mini">
                        <div className="plan-item"><div className="plan-name">Commuter</div><div className="plan-price">LKR 4,900<span className="plan-period">/mo</span></div></div>
                        <div className="plan-item"><div className="plan-name">Daily Max</div><div className="plan-price">LKR 12,900<span className="plan-period">/mo</span></div></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section>
          <div className="container">
            <div className="hiw-cta-box">
              <h2>Ready to move with precision?</h2>
              <p>Join 50,000+ urban explorers who have upgraded their commute.</p>
              <div className="cta-btn-pair">
                <button className="btn-white" onClick={openSignup}>Get Started Now</button>
                <button className="btn-outline-white" onClick={() => goTo("contact")}>Book a Demo</button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer goTo={goTo} />
    </>
  )
}

// ============================================================
// SECTION 9 — ABOUT PAGE
// ============================================================
function AboutPage({ goTo }) {
  return (
    <>
      <main>
        {/* Mission hero */}
        <section>
          <div className="container">
            <div className="about-hero">
              <div>
                <span className="badge-pill">Our Mission</span>
                <h1 className="about-title">
                  Breathing Life Back<br />Into <span className="dim">Colombo.</span>
                </h1>
                <p className="about-sub">
                  At YanaGaman, we are more than just a transport network. We are an urban heartbeat committed to
                  reducing carbon emissions. Through intelligent kinetic routing and our electric-first fleet,
                  we aim to lower Colombo's transport footprint by 40% by 2030.
                </p>
                <div className="avatar-row">
                  <div className="avatars">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWxXwLugjzQQ4mkhTJzhN3Vy7-07jAb_zxRxgQYXwuO2ykAeAj2eqaltxCx_fIbNLrs1hY1JWEffyp53jOBp-RkDlH2AvgWTj8tloZwQgDzQjjQ6WL_8T7uHHdXJF4JCxVUEOqDZDJtOHSqtliD-izVJnLAa_isOl9Le5OIJVgKvlC9ywZs_cFTd3urKjl8HaaCFqxHMIy0fcCoSZew-J-CN12vBpWZN8dedybmpELsvJVjHnyg1Xp9cTowcTxR1bkRuHOQPQdDBU" alt="" />
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj-WuMTfJCQ1bej-Jl1RkHCinDZb9Hj5m2cRrZaksZJZnI8Uc3VHzTr9dfaqD3ExCsTw2eLUn8QGwQmrNQUc_dOIxp3uyBC7p0JuQ1-VZEk4Ge0NEZvETqRD5QvJIMBPi68tamVX5TYmaeqUm_jmH9rjHmE9JCEH-aU0IGJZWuDN18lbN2DvF7W6u_tIejb0XU21iaYwCr4AkiQb7p7pMcm8PNR1ElgJX6YXYsX9zMCREI54P0B2a85tg5xHfiiatNA93WG1cg5Xs" alt="" />
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh0JVtnTcRV2FQ6_w29961lRhZmY8hQIPp2ekJKmdu1nmaYjdiY0MsKmITtESBHv-5MIm1CN3R4jaQuOKu8KqYD3HpOGhBLdiz3YDJ88bjSvmIj8RE_lVZMUpZfdN-zkdqujA-FGZMRS7BMNVE-xIrEtowK70V9PMg0OZ_zKyvQJiLB2KvZ1bLKTa8yPzJl1bopK-FIFhpIF4kU2GLdQdk27VuynDEP7E6zYET_Q84i5il3Z3pN_bfVJ2ZvT2kszuuJeAl4cvUH6Q" alt="" />
                  </div>
                  <span className="avatar-text">Trusted by 50,000+ Daily Commuters</span>
                </div>
              </div>
              <div className="about-img-wrap">
                <div className="glow-blur" />
                <div className="about-img">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2pkAVuWL5xKC4QMDhWKD6hZGZFJ1dl8q8ZNjalpof-HnT0s8i70yWWkZfLMCHZ_Sr51EQurXk_8ta07PPrNnyGIK04zzQ3ZGYrnA150AniV-BpYc8iPaNINdYWrABc0BPIvzodqVl604cx7KrLfQg_A33s49qXhTA3IUL3lFWP2NasCoOAbobkCwQOHMYMVFE0YgbXbs8wCFy5w9J0Gq5SHa8iPdUFEWtstm7Kccqqj3h7LHOZVHpZSvSs-dJecCzhprMmB28DYs" alt="Colombo night" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Safety section */}
        <section className="safety-section">
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 className="safety-section-title">Safety Beyond the Standard.</h2>
                <p className="safety-section-sub">Our safety ecosystem ensures peace of mind from the first step to the final door.</p>
              </div>
              <div className="iso-badge"><Icon name="verified_user" /> ISO Certified Safety Protocols</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
              {/* Row 1 */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.25rem" }}>
                <div className="safety-card white">
                  <div className="safety-card-header">
                    <div className="icon-box"><Icon name="security" /></div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--on-surface-variant)" }}>Certified Protocol</span>
                  </div>
                  <h3>Vetted Guardians</h3>
                  <p>Every YanaGaman driver undergoes an intensive 7-stage vetting process including criminal background checks and advanced night-driving certification.</p>
                  <div className="tag-pills">
                    <span className="tag-pill">Background Cleared</span>
                    <span className="tag-pill">Psychometric Tested</span>
                  </div>
                </div>
                <div className="safety-card purple">
                  <Icon name="radar" />
                  <h3>Real-time Precision</h3>
                  <p>Hyper-local GPS tracking that refreshes every 0.5 seconds. Our AI monitor flags deviations instantly.</p>
                  <div className="live-dot"><div className="pulse" /><span>Live System Monitoring</span></div>
                </div>
              </div>
              {/* Row 2 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.25rem" }}>
                <div className="safety-card highest">
                  <div style={{ width: "3.5rem", height: "3.5rem", background: "#fff", borderRadius: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginLeft: "auto", marginRight: "auto" }}>
                    <Icon name="family_restroom" style={{ color: "var(--primary)", fontSize: "1.75rem" }} />
                  </div>
                  <h3>Parental Tether</h3>
                  <p>Share a live encrypted link allowing guardians to view the cabin feed in real-time.</p>
                </div>
                <div className="safety-card img-card">
                  <img className="safety-img-inner" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQG2mZ1EJ92qdr5zFEj-3wm6rPk40HyeqvkHqPd1-DIBu2cqAz5kj44Qw3eRdVaqFJE6qk9RrY14k3EsszqHnUMsJ6lIuP7JomK_ck-cf-EbLjFberNdXc3ic8zIEOizXFOdX61f0vnbfC54ufotzPOQv0ILCRgVTE2QT1KzkDDHgzIVSu_tZdWIT7iiAZXxfQvZqihumZiBmcpuBPuFynB9sSEmmKtA6ljXp6g95klc6Iy6SzGSzFJQWoKqTf8kZow8gCpt219XA" alt="" />
                  <div className="dark-overlay">
                    <div className="dark-text">
                      <h3>Built for the Dark.</h3>
                      <p>Our fleet is equipped with 360-degree high-intensity illumination and infrared sensors.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-item"><div className="num">0.0%</div><div className="lbl">Safety Incidents</div></div>
              <div className="stat-item"><div className="num">12M</div><div className="lbl">KMs Tracked</div></div>
              <div className="stat-item"><div className="num">850</div><div className="lbl">Certified Guardians</div></div>
              <div className="stat-item"><div className="num">35%</div><div className="lbl">CO₂ Reduction</div></div>
            </div>
          </div>
        </section>

        {/* App download CTA */}
        <section>
          <div className="container">
            <div className="about-cta-box">
              <h2>Experience the Future of Urban Mobility.</h2>
              <p>Join the movement for a safer, cleaner, and more intelligent Colombo. Download the YanaGaman app today.</p>
              <div className="store-btns">
                <button className="store-btn"><Icon name="android" /> Google Play</button>
                <button className="store-btn"><Icon name="phone_iphone" /> App Store</button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer goTo={goTo} />
    </>
  )
}

// ============================================================
// SECTION 10 — CONTACT PAGE
// ============================================================
function ContactPage({ goTo, showToast }) {
  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("General Inquiry")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState({})

  // Track which FAQ item is open (by index, or null if none)
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    {
      q: "How quickly can I get set up?",
      a: "Onboarding typically takes less than 24 hours. Once your profile is verified, you can start booking rides right away."
    },
    {
      q: "What regions do you currently support?",
      a: "We currently operate across the greater Colombo metropolitan area. We're expanding to Kandy and Galle in 2025."
    },
    {
      q: "Is there a dedicated account manager?",
      a: "Enterprise and Daily Max plan subscribers receive a dedicated account manager. All users have 24/7 in-app concierge support."
    },
    {
      q: "What security protocols are in place?",
      a: "We use ISO-certified end-to-end encryption. Drivers are background-checked with 7-stage vetting. Live GPS tracking and SOS buttons are standard."
    },
  ]

  function handleSubmit() {
    const newErrors = {}
    if (!name) newErrors.name = "Name is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Valid email required"
    if (!message) newErrors.message = "Message is required"

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setName(""); setEmail(""); setMessage("")
    setErrors({})
    showToast("Message sent! We'll get back to you within 24 hours ✉️")
  }

  return (
    <>
      <main>
        <section>
          <div className="container">

            {/* Page heading */}
            <h1 className="contact-title">Let's move together.</h1>
            <p className="contact-sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>Reach out to our team for partnerships, support, or a deep dive into our urban kinetic ecosystem.</p>

            {/* Two-column grid: form on left, info on right */}
            <div className="contact-grid">

              {/* Left: Contact form */}
              <div className="contact-form-card">
                <h2>Send a message</h2>
                <div className="contact-form-grid">
                  <div className={`form-group ${errors.name ? "field-invalid" : ""}`}>
                    <label>Full Name</label>
                    <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
                    <div className="error-msg">{errors.name}</div>
                  </div>
                  <div className={`form-group ${errors.email ? "field-invalid" : ""}`}>
                    <label>Email Address</label>
                    <input type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                    <div className="error-msg">{errors.email}</div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)}>
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Partnership Proposal</option>
                    <option>Media &amp; Press</option>
                  </select>
                </div>
                <div className={`form-group ${errors.message ? "field-invalid" : ""}`}>
                  <label>Message</label>
                  <textarea rows={5} placeholder="Tell us how we can help..." value={message} onChange={e => setMessage(e.target.value)} style={{ resize: "none" }} />
                  <div className="error-msg">{errors.message}</div>
                </div>
                <button className="btn-full primary" onClick={handleSubmit}>
                  Send Message <Icon name="send" style={{ fontSize: "1.1rem" }} />
                </button>
              </div>

              {/* Right: Location + contact mini cards */}
              <div className="contact-info-stack">
                <div className="contact-loc-card">
                  <div style={{ width: "2.75rem", height: "2.75rem", background: "rgba(255,255,255,0.12)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                    <Icon name="location_on" />
                  </div>
                  <h3>Global Headquarters</h3>
                  <p>128 Urban Kinetic Way, Suite 400<br />Innovation District, Colombo 07</p>
                  <div className="loc-map">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcs37J6kKp_iqFkRQNCTy2Xm_-FimaaS8bFGJ18kxgC0k4cl1uYHlLm7IAoy-9HbkMxj1ycElkQb3bpr0spK9dteW201NNyyYvd5aCFbvz5BqpmpZD_Nc8qnJ1q1O-jKgJfEp-p_3vTMSRiRPGUqJLX1Kg1TExS8bpICNHnqdllvrQfpZDVaZNLFz8tghIaE3PPFXcXXM9krMAIdZfU0qAK9xqts3Ar9r3KWlf_j5waGKoYJqiAigWohMs0j2j3Ti6rE_nS4FeCoE" alt="Map" />
                  </div>
                </div>
                <div className="contact-mini-grid">
                  <div className="contact-mini-card">
                    <Icon name="call" />
                    <h4>Call Us</h4>
                    <p>+94 11 426 2626</p>
                  </div>
                  <div className="contact-mini-card">
                    <Icon name="mail" />
                    <h4>Email Support</h4>
                    <p>hello@yanagaman.lk</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ accordion */}
            <div className="faq-section">
              <h2 className="faq-title">Common Questions</h2>
              <p className="faq-sub">Everything you need to know about the YanaGaman experience.</p>
              <div className="faq-list">
                {faqs.map((faq, i) => {
                  const isOpen = openFaq === i
                  return (
                    <div key={i} className="faq-item">
                      <div className="faq-q" onClick={() => setOpenFaq(isOpen ? null : i)}>
                        <h4>{faq.q}</h4>
                        <Icon name="add" style={{ fontSize: "1.5rem", color: "var(--primary)", transition: "transform 0.3s", transform: isOpen ? "rotate(45deg)" : "none", flexShrink: 0 }} />
                      </div>
                      <div className={`faq-a ${isOpen ? "open" : ""}`}>
                        <p>{faq.a}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer goTo={goTo} />
    </>
  )
}

// ============================================================
// SECTION 11 — REGISTER PAGE
// ============================================================
function RegisterPage({ goTo, showToast, onRegister }) {
  const [role, setRole] = useState("passenger")    // "passenger" or "driver"
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [city, setCity] = useState("")
  const [errors, setErrors] = useState({})

  const cities = [
    "Colombo 1 – Fort", "Colombo 2 – Slave Island", "Colombo 3 – Kollupitiya",
    "Colombo 4 – Bambalapitiya", "Colombo 5 – Havelock Town", "Colombo 6 – Wellawatta",
    "Colombo 7 – Cinnamon Gardens", "Colombo 10 – Borella", "Colombo 15 – Mutwal",
    "Dehiwala", "Mount Lavinia", "Nugegoda", "Maharagama", "Kotte"
  ]

  async function handleRegister() {
    const newErrors = {}
    if (!name) newErrors.name = "Full name required"
    if (!phone) newErrors.phone = "Phone required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Valid email required"
    if (password.length < 6) newErrors.password = "Min 6 characters"

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await set(ref(db, "users/" + result.user.uid), { name, email, phone, city, role })
      onRegister({ name, email, role })
      showToast(`Account created! Welcome to YanaGaman, ${name} 🎉`)
      goTo("home")
    } catch (err) {
      setErrors({ email: err.message })
    }
  }

  return (
    <>
      <main>
        <section>
          <div className="container">
            <div className="register-grid">

              {/* Left column: info + trust cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div>
                  <h1 className="reg-title">Moving with<br /><span className="accent">Atmospheric</span> Precision.</h1>
                  <p className="reg-sub">Join YanaGaman and experience a new rhythm of urban transport.</p>
                </div>

                <div className="trust-card">
                  <h3>Trust &amp; Safety</h3>
                  <div className="trust-item">
                    <div className="trust-icon-wrap"><Icon name="verified_user" /></div>
                    <div>
                      <h4>Verified Professionals</h4>
                      <p>Every member undergoes rigorous background checks and identity verification.</p>
                    </div>
                  </div>
                  <div className="trust-item">
                    <div className="trust-icon-wrap"><Icon name="encrypted" /></div>
                    <div>
                      <h4>Data Privacy</h4>
                      <p>Your personal information is protected with industry-leading encryption protocols.</p>
                    </div>
                  </div>
                </div>

                <div className="reg-img-wrap">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuFlmAh6BQQJZR486YePlr6Mk1JXKBTE3gv2wG4ETtva_MwSu7DB0lfcKPku94pjwzwvhRddTGNmnH7sa2EnQFLlHujQ6g0OttI3JfNo_dwrp-L-ljQHaYoygb0SJGmb96zMIXAhfxhUWlE1ZqHWrLbOCCeLMMM_G5XNHk8AN-KFp7ZKovkQVWoKppaPFfZuASkukyYSv8v6NMtewCZ70hRT1IcYLMQyIxRb2QzjZ3yyhu1nXmYe0fcGPiXUC5j5hxJuQx5YOkaCU" alt="" />
                  <div className="reg-img-overlay">
                    <div className="reg-img-stat">
                      <div className="big">1.2M+</div>
                      <div className="small">Trips completed</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: the registration form */}
              <div>
                <div className="register-form-card">
                  <h2>Create your account</h2>

                  {/* Role selector cards */}
                  <span className="role-label">Choose your role</span>
                  <div className="role-grid">
                    <div className={`role-card ${role === "passenger" ? "selected" : ""}`} onClick={() => setRole("passenger")}>
                      <Icon name="hail" />
                      <span className="role-card-label">I want to Ride</span>
                    </div>
                    <div className={`role-card ${role === "driver" ? "selected" : ""}`} onClick={() => setRole("driver")}>
                      <Icon name="directions_car" />
                      <span className="role-card-label">I want to Drive</span>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className={`form-group ${errors.name ? "field-invalid" : ""}`}>
                      <label>Full Name</label>
                      <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
                      <div className="error-msg">{errors.name}</div>
                    </div>
                    <div className={`form-group ${errors.phone ? "field-invalid" : ""}`}>
                      <label>Phone Number</label>
                      <input type="tel" placeholder="+94 77 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />
                      <div className="error-msg">{errors.phone}</div>
                    </div>
                  </div>

                  <div className={`form-group ${errors.email ? "field-invalid" : ""}`}>
                    <label>Email Address</label>
                    <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                    <div className="error-msg">{errors.email}</div>
                  </div>

                  <div className={`form-group ${errors.password ? "field-invalid" : ""}`}>
                    <label>Password</label>
                    <input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
                    <div className="error-msg">{errors.password}</div>
                  </div>

                  <div className="form-group">
                    <label>Pickup Region</label>
                    <select value={city} onChange={e => setCity(e.target.value)}>
                      <option value="">Select your region</option>
                      {cities.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <button className="btn-full primary" onClick={handleRegister}>
                    Create My Account <Icon name="arrow_forward" style={{ fontSize: "1.1rem" }} />
                  </button>

                  <p className="form-terms">
                    By clicking "Create My Account", you agree to our{" "}
                    <a>Terms of Service</a> and <a>Privacy Policy</a>.
                  </p>
                </div>

                {/* Mini stats below the form */}
                <div className="mini-stats">
                  <div className="mini-stat-card">
                    <div className="mini-stat-icon"><Icon name="map" /></div>
                    <div>
                      <div className="mini-stat-num">Dynamic Service Map</div>
                      <div className="mini-stat-lbl">Available across greater Colombo</div>
                    </div>
                  </div>
                  <div className="uptime-card">
                    <div className="uptime-num">99%</div>
                    <div className="uptime-lbl">Uptime</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer goTo={goTo} />
    </>
  )
}


// ============================================================
// SECTION 13 — DASHBOARD PAGE
// ============================================================

function DashboardPage({ currentUser, onLogout, goTo, showToast }) {
  const [activeTab, setActiveTab] = useState("profile")
  const [userData, setUserData] = useState(currentUser)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [editingRoute, setEditingRoute] = useState(false)
  const [routeData, setRouteData] = useState({})
  const [emergencyContacts, setEmergencyContacts] = useState([])
  const [showAddEmergency, setShowAddEmergency] = useState(false)
  const [emergencyName, setEmergencyName] = useState("")
  const [emergencyPhone, setEmergencyPhone] = useState("")
  const [emergencyRelation, setEmergencyRelation] = useState("")
  const isPassenger = userData?.role === "passenger" || userData?.role === "rider"
  const isDriver = userData?.role === "driver"

  useEffect(() => {
    if (auth.currentUser) {
      get(ref(db, "users/" + auth.currentUser.uid)).then(snap => {
        if (snap.val()) { setUserData(snap.val()); setEditData(snap.val()); setRouteData(snap.val()) }
      })
      get(ref(db, "emergency/" + auth.currentUser.uid)).then(snap => {
        if (snap.val()) setEmergencyContacts(Object.values(snap.val()))
      })
    }
  }, [])

  async function saveEdit() {
    try {
      await update(ref(db, "users/" + auth.currentUser.uid), editData)
      setUserData(editData); setEditing(false)
      showToast("Profile updated! ✅")
    } catch { showToast("Failed to save.") }
  }

  async function saveRoute() {
    try {
      await update(ref(db, "users/" + auth.currentUser.uid), {
        pickup: routeData.pickup || "",
        dropLocation: routeData.dropLocation || "",
        sameEveningRoutine: routeData.sameEveningRoutine || false
      })
      setUserData({ ...userData, pickup: routeData.pickup, dropLocation: routeData.dropLocation, sameEveningRoutine: routeData.sameEveningRoutine })
      setEditingRoute(false)
      showToast("Route updated successfully! ✅")
    } catch { showToast("Failed to save route.") }
  }

  async function saveEmergencyContact() {
    if (!emergencyName || !emergencyPhone) return
    const contact = { name: emergencyName, phone: emergencyPhone, relation: emergencyRelation }
    const newList = [...emergencyContacts, contact]
    try {
      await set(ref(db, "emergency/" + auth.currentUser.uid), newList)
      setEmergencyContacts(newList)
      setEmergencyName(""); setEmergencyPhone(""); setEmergencyRelation("")
      setShowAddEmergency(false)
      showToast("Emergency contact saved! ✅")
    } catch { showToast("Failed to save contact.") }
  }

  async function handleLogout() {
    await signOut(auth); onLogout(); goTo("home")
    showToast("Signed out successfully 👋")
  }

  const initials = userData?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U"
  const tabs = [
    { id: "profile", label: "Profile", icon: "person" },
    { id: "emergency", label: "Emergency", icon: "emergency" },
    { id: "payments", label: "Payments", icon: "payments" },
    { id: "trips", label: "Trips", icon: "directions_car" },
  ]

  const Field = ({ label, value, editKey, type = "text" }) => (
    <div style={{ background: "var(--surface-low)", borderRadius: "0.875rem", padding: "1rem 1.25rem" }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>{label}</div>
      {editing && editKey
        ? <input value={editData[editKey] || ""} onChange={e => setEditData({...editData, [editKey]: e.target.value})}
            style={{ width: "100%", border: "2px solid var(--primary)", borderRadius: "0.5rem", padding: "0.35rem 0.6rem", fontSize: "0.95rem", fontWeight: 600, outline: "none", background: "white" }} />
        : <div style={{ fontSize: "0.95rem", fontWeight: 600, color: value ? "var(--on-surface)" : "var(--on-surface-variant)" }}>{value || "—"}</div>
      }
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, var(--surface-low) 0%, var(--primary-container) 100%)", paddingTop: "5.5rem", paddingBottom: "3rem" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 1.5rem" }}>

        {/* ── HEADER CARD ── */}
        <div style={{ background: "white", borderRadius: "2rem", padding: "2rem", marginBottom: "1.5rem", boxShadow: "0 4px 24px rgba(80,0,136,0.10)", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ width: "5rem", height: "5rem", background: "linear-gradient(135deg, var(--primary), #9c27b0)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", fontWeight: 800, color: "white", flexShrink: 0, boxShadow: "0 4px 16px rgba(80,0,136,0.3)" }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.2rem" }}>{userData?.name || "User"}</div>
            <div style={{ fontSize: "0.9rem", color: "var(--on-surface-variant)", marginBottom: "0.4rem" }}>{userData?.email}</div>
            <span style={{ background: "var(--primary-container)", color: "var(--primary)", fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.85rem", borderRadius: "2rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {isDriver ? "🚗 Driver" : "🛕 Passenger"}
            </span>
          </div>
          <button onClick={handleLogout} style={{ background: "#fff0f0", color: "#c0392b", border: "none", borderRadius: "0.875rem", padding: "0.65rem 1.25rem", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
            Sign Out
          </button>
        </div>

        {/* ── TABS ── */}
        <div style={{ background: "white", borderRadius: "1.25rem", padding: "0.5rem", marginBottom: "1.5rem", boxShadow: "0 2px 12px rgba(80,0,136,0.08)", display: "flex", gap: "0.4rem", overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, minWidth: "fit-content", padding: "0.75rem 1rem", border: "none", borderRadius: "0.875rem", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", transition: "all 0.2s", background: activeTab === t.id ? "var(--primary)" : "transparent", color: activeTab === t.id ? "white" : "var(--on-surface-variant)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", whiteSpace: "nowrap" }}>
              <Icon name={t.icon} style={{ fontSize: "1rem" }} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <>
            <div style={{ background: "white", borderRadius: "1.5rem", padding: "1.75rem", marginBottom: "1.25rem", boxShadow: "0 2px 16px rgba(80,0,136,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "2px solid var(--primary-container)" }}>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary)" }}>Personal Details</div>
                {isPassenger && !editing && <button onClick={() => { setEditData({...userData}); setEditing(true) }} style={{ background: "var(--primary-container)", color: "var(--primary)", border: "none", borderRadius: "0.75rem", padding: "0.5rem 1rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}><Icon name="edit" style={{ fontSize: "1rem" }} /> Edit</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <Field label="Full Name" value={userData?.name} editKey="name" />
                <Field label="Email" value={userData?.email} />
                <Field label="Mobile Number" value={userData?.phone} editKey="phone" />
                <Field label="City / Region" value={userData?.city} editKey="city" />
                {userData?.companyName && <Field label="Company" value={userData?.companyName} editKey="companyName" />}
              </div>
              {editing && (
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                  <button onClick={() => setEditing(false)} style={{ background: "var(--surface-low)", color: "var(--on-surface-variant)", border: "none", borderRadius: "0.75rem", padding: "0.65rem 1.25rem", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                  <button onClick={saveEdit} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.65rem 1.5rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}><Icon name="check" style={{ fontSize: "1rem" }} /> Save Changes</button>
                </div>
              )}
            </div>

            {isPassenger && (
              <div style={{ background: "white", borderRadius: "1.5rem", padding: "1.75rem", marginBottom: "1.25rem", boxShadow: "0 2px 16px rgba(80,0,136,0.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "2px solid var(--primary-container)" }}>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary)" }}>🗺️ Route Details</div>
                  {!editingRoute && (
                    <button onClick={() => { setRouteData({ pickup: userData?.pickup || "", dropLocation: userData?.dropLocation || "", sameEveningRoutine: userData?.sameEveningRoutine || false }); setEditingRoute(true) }}
                      style={{ background: "var(--primary-container)", color: "var(--primary)", border: "none", borderRadius: "0.75rem", padding: "0.5rem 1rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Icon name="edit" style={{ fontSize: "1rem" }} /> Edit Route
                    </button>
                  )}
                </div>

                {editingRoute ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem", marginBottom: "1rem" }}>
                      {/* Pickup */}
                      <div style={{ background: "var(--surface-low)", borderRadius: "0.875rem", padding: "1rem 1.25rem" }}>
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>📍 Pickup Location</div>
                        <input
                          value={routeData.pickup || ""}
                          onChange={e => setRouteData({ ...routeData, pickup: e.target.value })}
                          placeholder="Enter pickup location"
                          style={{ width: "100%", border: "2px solid var(--primary)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", fontSize: "0.95rem", fontWeight: 600, outline: "none", background: "white" }}
                        />
                      </div>
                      {/* Drop */}
                      <div style={{ background: "var(--surface-low)", borderRadius: "0.875rem", padding: "1rem 1.25rem" }}>
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>🏁 Drop Location</div>
                        <input
                          value={routeData.dropLocation || ""}
                          onChange={e => setRouteData({ ...routeData, dropLocation: e.target.value })}
                          placeholder="Enter drop location"
                          style={{ width: "100%", border: "2px solid var(--primary)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", fontSize: "0.95rem", fontWeight: 600, outline: "none", background: "white" }}
                        />
                      </div>
                    </div>
                    {/* Evening Routine Toggle */}
                    <div style={{ background: "var(--surface-low)", borderRadius: "0.875rem", padding: "1rem 1.25rem", marginBottom: "1rem" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.875rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={routeData.sameEveningRoutine || false}
                          onChange={e => setRouteData({ ...routeData, sameEveningRoutine: e.target.checked })}
                          style={{ width: "1.2rem", height: "1.2rem", accentColor: "var(--primary)", cursor: "pointer" }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--on-surface)" }}>Same evening return route</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--on-surface-variant)" }}>Use the same pickup & drop for your evening trip</div>
                        </div>
                      </label>
                    </div>
                    {/* Save / Cancel */}
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button onClick={() => setEditingRoute(false)} style={{ background: "var(--surface-low)", color: "var(--on-surface-variant)", border: "2px solid var(--outline-variant)", borderRadius: "0.75rem", padding: "0.65rem 1.25rem", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                      <button onClick={saveRoute} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.65rem 1.5rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Icon name="check" style={{ fontSize: "1rem" }} /> Save Route
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                    <div style={{ background: "var(--surface-low)", borderRadius: "0.875rem", padding: "1rem 1.25rem" }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>📍 Pickup Location</div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 600, color: userData?.pickup ? "var(--on-surface)" : "var(--on-surface-variant)" }}>{userData?.pickup || "Not set"}</div>
                    </div>
                    <div style={{ background: "var(--surface-low)", borderRadius: "0.875rem", padding: "1rem 1.25rem" }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>🏁 Drop Location</div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 600, color: userData?.dropLocation ? "var(--on-surface)" : "var(--on-surface-variant)" }}>{userData?.dropLocation || "Not set"}</div>
                    </div>
                    <div style={{ background: "var(--surface-low)", borderRadius: "0.875rem", padding: "1rem 1.25rem" }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>Evening Return</div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--on-surface)" }}>{userData?.sameEveningRoutine ? "✅ Same routine" : "❌ Different route"}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isDriver && (
              <div style={{ background: "white", borderRadius: "1.5rem", padding: "1.75rem", marginBottom: "1.25rem", boxShadow: "0 2px 16px rgba(80,0,136,0.07)" }}>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary)", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "2px solid var(--primary-container)" }}>🚗 Vehicle Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                  <Field label="Vehicle Type" value={userData?.vehicleType === "own" ? "Own Vehicle" : "Company Vehicle"} />
                  <Field label="Vehicle Number" value={userData?.vehicleNumber} />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── EMERGENCY TAB ── */}
        {activeTab === "emergency" && (
          <div style={{ background: "white", borderRadius: "1.5rem", padding: "1.75rem", boxShadow: "0 2px 16px rgba(80,0,136,0.07)" }}>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary)", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "2px solid var(--primary-container)" }}>🚨 Emergency Contacts</div>
            {emergencyContacts.length === 0 && !showAddEmergency && (
              <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--on-surface-variant)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🚨</div>
                <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>No emergency contacts yet</div>
                <div style={{ fontSize: "0.9rem" }}>Add someone who should be notified in emergencies</div>
              </div>
            )}
            {emergencyContacts.map((c, i) => (
              <div key={i} style={{ background: "#fff5f5", border: "2px solid #ffe0e0", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem" }}>
                <div style={{ fontWeight: 700, color: "#c0392b", marginBottom: "0.75rem", fontSize: "0.9rem" }}>🚨 {c.relation || "Emergency Contact"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div style={{ background: "white", borderRadius: "0.625rem", padding: "0.75rem" }}><div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#c0392b", textTransform: "uppercase", marginBottom: "0.2rem" }}>Name</div><div style={{ fontWeight: 600 }}>{c.name}</div></div>
                  <div style={{ background: "white", borderRadius: "0.625rem", padding: "0.75rem" }}><div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#c0392b", textTransform: "uppercase", marginBottom: "0.2rem" }}>Phone</div><div style={{ fontWeight: 600 }}>{c.phone}</div></div>
                </div>
              </div>
            ))}
            {showAddEmergency && (
              <div style={{ background: "var(--surface-low)", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  {[["Contact Name", emergencyName, setEmergencyName, "Full name"], ["Phone Number", emergencyPhone, setEmergencyPhone, "+94 77 000 0000"], ["Relationship", emergencyRelation, setEmergencyRelation, "e.g. Mother, Spouse"]].map(([label, val, setter, ph]) => (
                    <div key={label}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--on-surface-variant)", textTransform: "uppercase", marginBottom: "0.3rem" }}>{label}</div>
                      <input value={val} onChange={e => setter(e.target.value)} placeholder={ph} style={{ width: "100%", border: "2px solid var(--primary-container)", borderRadius: "0.5rem", padding: "0.6rem 0.75rem", fontSize: "0.9rem", outline: "none" }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button onClick={() => setShowAddEmergency(false)} style={{ background: "var(--surface-low)", color: "var(--on-surface-variant)", border: "2px solid var(--outline-variant)", borderRadius: "0.75rem", padding: "0.6rem 1.25rem", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                  <button onClick={saveEmergencyContact} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>✅ Save Contact</button>
                </div>
              </div>
            )}
            {!showAddEmergency && (
              <button onClick={() => setShowAddEmergency(true)} style={{ width: "100%", background: "var(--primary)", color: "white", border: "none", borderRadius: "0.875rem", padding: "0.875rem", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", marginTop: "0.5rem" }}>
                + Add Emergency Contact
              </button>
            )}
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {activeTab === "payments" && (
          <div style={{ background: "white", borderRadius: "1.5rem", padding: "1.75rem", boxShadow: "0 2px 16px rgba(80,0,136,0.07)" }}>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary)", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "2px solid var(--primary-container)" }}>💳 Subscription & Payments</div>
            <div style={{ background: "linear-gradient(135deg, var(--primary), #9c27b0)", borderRadius: "1.25rem", padding: "1.5rem", color: "white", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Current Plan</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>Commuter Plan</div>
              <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>LKR 4,900 / month</div>
              <div style={{ marginTop: "1rem", background: "rgba(255,255,255,0.2)", display: "inline-block", padding: "0.25rem 0.875rem", borderRadius: "2rem", fontSize: "0.8rem", fontWeight: 700 }}>✅ Active</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem", marginBottom: "1.5rem" }}>
              {[["Next Billing", "01 May 2026"], ["Payment Method", "•••• 4242"]].map(([l, v]) => (
                <div key={l} style={{ background: "var(--surface-low)", borderRadius: "0.875rem", padding: "1rem 1.25rem" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>{l}</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--on-surface)" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--primary)", marginBottom: "1rem" }}>Payment History</div>
            {[["01 Apr 2026", "LKR 4,900", "Paid"], ["01 Mar 2026", "LKR 4,900", "Paid"], ["01 Feb 2026", "LKR 4,900", "Paid"]].map(([date, amount, status], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.875rem 0", borderBottom: "1px solid var(--surface-low)" }}>
                <span style={{ color: "var(--on-surface-variant)", fontSize: "0.9rem" }}>{date}</span>
                <span style={{ fontWeight: 700 }}>{amount}</span>
                <span style={{ background: "#e8f5e9", color: "#2e7d32", fontSize: "0.8rem", fontWeight: 700, padding: "0.2rem 0.75rem", borderRadius: "2rem" }}>{status}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── TRIPS TAB ── */}
        {activeTab === "trips" && (
          <div style={{ background: "white", borderRadius: "1.5rem", padding: "1.75rem", boxShadow: "0 2px 16px rgba(80,0,136,0.07)" }}>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary)", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "2px solid var(--primary-container)" }}>🚗 Trip History</div>
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🛕</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--on-surface)", marginBottom: "0.5rem" }}>No trips yet!</div>
              <div style={{ color: "var(--on-surface-variant)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>Your completed trips will appear here once you start riding.</div>
              <button onClick={() => goTo("home")} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: "0.875rem", padding: "0.875rem 2rem", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}>
                🚗 Book a Ride
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ============================================================
// SECTION 12 — APP (the main component)
//
// This is the ROOT of everything. It holds:
//   - Which page is currently shown
//   - Who is logged in
//   - Toast notifications
//   - Whether modals are open
//
// Think of this as the "headquarters" — it owns all the
// shared state and passes pieces down to child components.
// ============================================================
export default function YanaGaman() {
  // --- STATE --- (things that can change and cause re-renders)
  const [currentPage, setCurrentPage] = useState("home")    // which page to show
  const [currentUser, setCurrentUser] = useState(null)       // logged-in user (or null)
  const [showLogin, setShowLogin] = useState(false)          // login modal open?
  const [showSignup, setShowSignup] = useState(false)        // signup modal open?
  const [toast, setToast] = useState({ msg: "", show: false }) // toast notification

  // Auto-restore login session on page refresh
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await get(ref(db, "users/" + firebaseUser.uid))
        if (snap.val()) setCurrentUser(snap.val())
      } else {
        setCurrentUser(null)
      }
    })
    return () => unsub()
  }, [])

  // Navigate to a page and scroll to top
  function goTo(page) {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  // Show a toast notification for 3.5 seconds
  function showToast(msg) {
    setToast({ msg, show: true })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500)
  }

  // Called when login/signup succeeds — store the user in state
  function handleLogin(user) {
    setCurrentUser(user)
    showToast(`Welcome back, ${user.name ? user.name.split(" ")[0] : "User"}! 👋`)
    setShowLogin(false)
    goTo("dashboard")
  }

  function handleSignup(user) {
    setCurrentUser(user)
    showToast(`Account created! Welcome to YanaGaman, ${user.name} 🎉`)
    setShowSignup(false)
    goTo("dashboard")
  }

  function handleLogout() {
    setCurrentUser(null)
    showToast("You have been signed out")
  }

  // Decide which page component to render based on currentPage
  function renderPage() {
    const sharedProps = { goTo, showToast }

    switch (currentPage) {
      case "home":
        return <HomePage {...sharedProps} currentUser={currentUser} openLogin={() => setShowLogin(true)} openSignup={() => setShowSignup(true)} />
      case "howitworks":
        return <HowItWorksPage {...sharedProps} openSignup={() => setShowSignup(true)} />
      case "about":
        return <AboutPage {...sharedProps} />
      case "contact":
        return <ContactPage {...sharedProps} />
      case "register":
        return <RegisterPage {...sharedProps} onRegister={user => { setCurrentUser(user); goTo("dashboard") }} />
      case "dashboard":
        return currentUser
          ? <DashboardPage currentUser={currentUser} onLogout={handleLogout} goTo={goTo} showToast={showToast} />
          : <HomePage {...sharedProps} currentUser={currentUser} openLogin={() => setShowLogin(true)} openSignup={() => setShowSignup(true)} />
      default:
        return <HomePage {...sharedProps} currentUser={currentUser} openLogin={() => setShowLogin(true)} openSignup={() => setShowSignup(true)} />
    }
  }

  return (
    <div style={{ width: "100%", minWidth: 0, overflowX: "hidden" }}>
      {/* Inject all CSS styles into the page */}
      <style>{CSS}</style>

      {/* The sticky top navigation */}
      <Navbar
        currentPage={currentPage}
        goTo={goTo}
        currentUser={currentUser}
        onLogout={handleLogout}
        openLogin={() => setShowLogin(true)}
        openSignup={() => setShowSignup(true)}
      />

      {/* Login popup */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
        switchToSignup={() => setShowSignup(true)}
      />

      {/* Signup popup */}
      <SignupModal
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        onSignup={handleSignup}
        switchToLogin={() => setShowLogin(true)}
      />

      {/* The current page */}
      {renderPage()}

      {/* Toast notification (slide-up popup) */}
      <Toast message={toast.msg} show={toast.show} />
    </div>
  )
}
