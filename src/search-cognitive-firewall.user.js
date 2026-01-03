// ==UserScript==
// @name         Google Cognitive Firewall (GCF)
// @namespace    google-cognitive-firewall
// @version      0.2.3
// @description  Subtractive SERP cleanup for Google. Session-only persistence (reload keeps state; closing tab resets). Local-only. Fail-open.
// @match        https://www.google.*/*q=*
// @match        https://www.google.*/*search*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

/*
================================================================
Google Cognitive Firewall (GCF) — Minimum Mode

Design contract:
- Subtractive only (presentation-layer cleanup)
- No ranking, judging, summarizing, or “smart” filtering
- Local-only: no telemetry, no network interception
- Deterministic toggle: user-controlled ON/OFF
- Fail-open: if selectors miss, Google remains usable

Stability stance:
- Google A/B tests SERP layouts; modules may reappear.
- This release prioritizes "never break search" over completeness.
================================================================
*/

(() => {
  'use strict';

  // =========================
  // CONFIG
  // =========================
  const STYLE_ID = 'gcf-style';
  const TOGGLE_ID = 'gcf-toggle';
  const KEY = 'gcf_enabled'; // sessionStorage: persists across reloads, resets when tab/window closes

  // Header phrases (English + French variants seen so far)
  const HEADERS = {
    peopleAlsoAsk: [
      'People also ask',
      'Autres questions posées',
    ],
    popularProducts: [
      'Popular products',
      'Produits populaires',
    ],
    inStoresNearby: [
      'In stores nearby',
      'En magasin à proximité',
      'En magasins à proximité',
    ],
    videos: [
      'Videos',
      'Vidéos',
    ],
    peopleAlsoSearchFor: [
      'People also search for',
      'People also searched for',
      'Related searches',
      'Searches related to',
      'Recherches associées',
      'Autres recherches associées',
      'Recherches liées à',
    ],
    relatedProductsServices: [
      'Find related products & services',
      'Find related products and services',
      'Trouver des produits et services associés',
    ],
  };

  // CSS removal is intentionally conservative (avoid broad structural selectors).
  const CSS_RULES = `
/* Internal hide marker */
.gcf-hide { display: none !important; }

/* Top nav / filter chips (layout-dependent; best-effort) */
#hdtb,
#appbar { display: none !important; }

/* Right rail */
#rhs,
#rhscol { display: none !important; }

/* Ads */
#tads,
#tadsb,
#bottomads { display: none !important; }
`;

  // =========================
  // STATE
  // =========================
  let enabled = sessionStorage.getItem(KEY) === '1';
  let observer = null;

  // =========================
  // DOM ROOTS
  // =========================
  function getResultsRoot() {
    return (
      document.querySelector('#search') ||
      document.querySelector('#center_col') ||
      document.querySelector('#main') ||
      document.querySelector('main')
    );
  }

  function getObserverRoot() {
    // Prefer #search when available; fall back to body.
    return document.querySelector('#search') || document.body;
  }

  // =========================
  // STYLE INJECTION
  // =========================
  function ensureStyle() {
    let style = document.getElementById(STYLE_ID);
    if (style) return;

    style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    style.textContent = CSS_RULES;
    (document.head || document.documentElement).appendChild(style);
  }

  function removeStyle() {
    const style = document.getElementById(STYLE_ID);
    if (style) style.remove();
  }

  // =========================
  // SAFE MODULE HIDING
  // =========================
  function findHeaderElements(root, headerPhrases) {
    if (!root) return [];
    const candidates = root.querySelectorAll('span, div, h2, h3');
    const out = [];

    for (const el of candidates) {
      const t = (el.textContent || '').trim();
      if (!t) continue;

      for (const phrase of headerPhrases) {
        if (t === phrase || t.startsWith(phrase)) {
          out.push(el);
          break;
        }
      }
    }
    return out;
  }

  function isUnsafeToHide(node) {
    if (!node || node.nodeType !== 1) return true;

    const id = (node.id || '').toLowerCase();
    const tag = (node.tagName || '').toUpperCase();

    // Never hide whole-page / whole-results containers
    if (tag === 'HTML' || tag === 'BODY') return true;
    if (id === 'search' || id === 'main' || id === 'center_col') return true;

    // Never hide anything that contains organic results list
    if (node.querySelector && node.querySelector('#rso')) return true;

    return false;
  }

  function findModuleRoot(el, boundaryRoot) {
    let cur = el;
    let steps = 0;

    while (cur && steps < 18) {
      // If boundary is provided, prefer the direct child under it.
      if (boundaryRoot && cur.parentElement === boundaryRoot) return cur;

      // Prefer "module-ish" wrappers
      if (cur.hasAttribute && (cur.hasAttribute('jscontroller') || cur.hasAttribute('data-hveid'))) {
        return cur;
      }

      cur = cur.parentElement;
      steps++;
    }
    return null;
  }

  function hideByHeaderWithin(root, headerPhrases, boundaryRootForClimb) {
    const headers = findHeaderElements(root, headerPhrases);
    if (!headers.length) return 0;

    let count = 0;

    for (const h of headers) {
      const mod = findModuleRoot(h, boundaryRootForClimb || null);
      if (!mod) continue;
      if (isUnsafeToHide(mod)) continue;

      mod.classList.add('gcf-hide');
      count++;
    }

    return count;
  }

  // =========================
  // APPLY / CLEAR
  // =========================
  function applyAllRemovals() {
    if (!enabled) return;

    ensureStyle();

    const resultsRoot = getResultsRoot();

    // In-results removals
    hideByHeaderWithin(resultsRoot, HEADERS.peopleAlsoAsk, resultsRoot);
    hideByHeaderWithin(resultsRoot, HEADERS.popularProducts, resultsRoot);
    hideByHeaderWithin(resultsRoot, HEADERS.inStoresNearby, resultsRoot);
    hideByHeaderWithin(resultsRoot, HEADERS.videos, resultsRoot);
    hideByHeaderWithin(resultsRoot, HEADERS.relatedProductsServices, resultsRoot);

    // “People also search for” often lives near the bottom.
    // IMPORTANT: bounded zones only (no document-wide scans).
    const bottomZones = [
      document.querySelector('#botstuff'),
      document.querySelector('#bres'),
      document.querySelector('#foot'),
      resultsRoot,
    ].filter(Boolean);

    for (const zone of bottomZones) {
      hideByHeaderWithin(zone, HEADERS.peopleAlsoSearchFor, null);
    }
  }

  function clearAllRemovals() {
    removeStyle();
    document.querySelectorAll('.gcf-hide').forEach(el => el.classList.remove('gcf-hide'));
  }

  // =========================
  // TOGGLE UI
  // =========================
  function updateToggle() {
    const btn = document.getElementById(TOGGLE_ID);
    if (!btn) return;
    btn.textContent = enabled ? 'GCF: ON' : 'GCF: OFF';
  }

  function createToggle() {
    if (document.getElementById(TOGGLE_ID)) return;

    const btn = document.createElement('button');
    btn.id = TOGGLE_ID;
    btn.type = 'button';

    btn.style.position = 'fixed';
    btn.style.right = '14px';
    btn.style.bottom = '14px';
    btn.style.zIndex = '999999';
    btn.style.padding = '8px 10px';
    btn.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
    btn.style.fontSize = '12px';
    btn.style.fontWeight = '700';
    btn.style.background = '#111';
    btn.style.color = '#fff';
    btn.style.border = '1px solid #444';
    btn.style.borderRadius = '6px';
    btn.style.cursor = 'pointer';
    btn.style.opacity = '0.75';

    btn.addEventListener('mouseenter', () => { btn.style.opacity = '1'; });
    btn.addEventListener('mouseleave', () => { btn.style.opacity = '0.75'; });

    btn.addEventListener('click', () => {
      enabled = !enabled;
      sessionStorage.setItem(KEY, enabled ? '1' : '0');
      updateToggle();

      if (enabled) {
        applyAllRemovals();
        startObserver();
      } else {
        stopObserver();
        clearAllRemovals();
      }
    });

    document.body.appendChild(btn);
    updateToggle();
  }

  // =========================
  // OBSERVER (late-injected modules)
  // =========================
  function startObserver() {
    stopObserver();

    const root = getObserverRoot();
    if (!root) return;

    observer = new MutationObserver(() => {
      if (!enabled) return;
      applyAllRemovals();
    });

    observer.observe(root, { childList: true, subtree: true });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // =========================
  // BOOT
  // =========================
  function init() {
    createToggle();

    if (enabled) {
      applyAllRemovals();
      startObserver();
    } else {
      clearAllRemovals(); // fail-open
    }
  }

  init();
})();
