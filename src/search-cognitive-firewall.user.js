// ==UserScript==
// @name         Search Cognitive Firewall
// @namespace    search-cognitive-firewall
// @version      0.1.2
// @description  Subtractive presentation-layer firewall for SERPs (Google/Bing). Local-only, reversible, deterministic, fail-open.
// @match        https://www.google.com/search*
// @match        https://www.bing.com/search*
// @run-at       document-end
// @grant        none
// ==/UserScript==

// ===== SCF: DESIGN CONTRACT (READ ME FIRST) =====
/*
----------------------------------------------------------------
Search Cognitive Firewall — v0.1.2

Design contract:
- Subtractive only
- No ranking, judging, summarizing, or automation
- No storage, telemetry, or network activity
- Deterministic behavior
- Fail open (native SERP always recoverable)

Path B invariant (inspection-order enforcement):
- When SCF is ON, hide any composite/non-organic blocks that appear
  BEFORE the first true organic result.
- This is structural sequencing, not content judgment.

If this script ever breaks:
- Search MUST continue to work normally (fail open).
----------------------------------------------------------------
*/

(function () {
  'use strict';

  // ===== SCF: INTERNAL STATE (IN-MEMORY ONLY) =====
  let enabled = false;   // default OFF (fail-open)
  let styleEl = null;
  let observer = null;

  // ===== SCF: CSS_RULES (STRUCTURAL SUBTRACTION ONLY) =====
  // WARNING: No content-based filtering. No ranking. No “smart” rules.
  const CSS_RULES = `
/* ---------------- Google ---------------- */

/* Reason: Internal SCF marker class used to hide entire modules deterministically */
.scf-hide-module { display: none !important; }

/* Reason: Paid attention redirection, not organic results */
#tads, #tadsb, #bottomads, .uEierd { display: none !important; }

/* Reason: Right-rail attention anchoring; reduces scan integrity */
#rhs, #rhscol, .osrp-blk { display: none !important; }

/* Reason: Branching prompts that interrupt linear scanning (some PAA variants).
   NOTE: Path B will hide remaining pre-organic shells above first organic result. */
.related-question-pair, .kp-blk { display: none !important; }

/* Reason: Visual interruption via non-text carousels / packs (common variants) */
g-scrolling-carousel, .ULSxyf, .mR2gOd { display: none !important; }

/* ---------------- Bing ---------------- */

/* Reason: Paid attention redirection, not organic results */
#b_context .b_ad, .b_ad, .b_ans .b_ad { display: none !important; }

/* Reason: Right-rail attention anchoring; reduces scan integrity */
#b_context { display: none !important; }
`;

  // ===== SCF: HELPERS =====

  function isGoogle() {
    return location.hostname.includes('google.');
  }

  function isBing() {
    return location.hostname.includes('bing.com');
  }

  function getGoogleRoot() {
    // Google layouts vary; these cover most.
    return (
      document.querySelector('#center_col') ||
      document.querySelector('#search') ||
      document.querySelector('main')
    );
  }

  // Find the first outbound (non-Google) organic link inside the results root.
  // Deterministic: structural constraints only.
  function findFirstOrganicLink(root) {
    const anchors = root.querySelectorAll('a[href]');
    for (const a of anchors) {
      const href = a.getAttribute('href');
      if (!href) continue;
      if (!href.startsWith('http')) continue;

      // Exclude internal Google links / nav chrome
      if (href.includes('google.com')) continue;

      // Exclude obvious ad containers
      if (a.closest('#tads, #tadsb, #bottomads')) continue;

      return a;
    }
    return null;
  }

  // ===== SCF: PATH B — INSPECTION-ORDER ENFORCEMENT (DOM ORDER) =====
  // Hide all sibling blocks before the first organic result block.
  // This fixes the “tall AI Overview” problem because we no longer use geometry.
  function removePreOrganicBlocks() {
    if (!enabled) return;

    if (isGoogle()) {
      const root = getGoogleRoot();
      if (!root) return;

      const firstOrganicLink = findFirstOrganicLink(root);
      if (!firstOrganicLink) return;

      // Walk up to the direct child of root that contains the first organic link.
      let firstBlock = firstOrganicLink;
      while (firstBlock && firstBlock.parentElement !== root) {
        firstBlock = firstBlock.parentElement;
      }
      if (!firstBlock) return;

      // Hide every previous sibling block (DOM order, deterministic).
      let sib = firstBlock.previousElementSibling;
      while (sib) {
        sib.classList.add('scf-hide-module');
        sib = sib.previousElementSibling;
      }

      return;
    }

    if (isBing()) {
      // v0.1.x: Bing is CSS-only for now
      return;
    }
  }

  // Observe SERP mutations to catch late-injected modules.
  function startObserver() {
    if (!isGoogle()) return;

    const root = getGoogleRoot();
    if (!root) return;

    stopObserver();

    observer = new MutationObserver(() => {
      if (!enabled) return;
      removePreOrganicBlocks();
    });

    observer.observe(root, { childList: true, subtree: true });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // ===== SCF: FIREWALL CONTROL (ENABLE / DISABLE) =====

  function enableFirewall() {
    if (styleEl) return;

    styleEl = document.createElement('style');
    styleEl.id = 'scf-style';
    styleEl.textContent = CSS_RULES;
    document.head.appendChild(styleEl);

    enabled = true;
    updateToggle();

    // Path B enforcement now + watch for late injection
    removePreOrganicBlocks();
    startObserver();
  }

  function disableFirewall() {
    if (!styleEl) return;

    styleEl.remove();
    styleEl = null;

    enabled = false;
    updateToggle();

    stopObserver();

    // Remove our marker classes (reversible)
    document.querySelectorAll('.scf-hide-module').forEach(el => el.classList.remove('scf-hide-module'));
  }

  // ===== SCF: TOGGLE UI (USER-CONTROLLED, REVERSIBLE) =====

  function createToggle() {
    const btn = document.createElement('button');
    btn.id = 'scf-toggle';
    btn.type = 'button';

    btn.style.position = 'fixed';
    btn.style.right = '14px';
    btn.style.bottom = '14px';
    btn.style.zIndex = '999999';

    btn.style.padding = '8px 10px';
    btn.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
    btn.style.fontSize = '12px';
    btn.style.fontWeight = '600';

    btn.style.background = '#111';
    btn.style.color = '#fff';
    btn.style.border = '1px solid #444';
    btn.style.borderRadius = '6px';
    btn.style.cursor = 'pointer';
    btn.style.opacity = '0.70';

    btn.addEventListener('mouseenter', () => { btn.style.opacity = '1'; });
   

  function updateToggle() {
    const btn = document.getElementById('scf-toggle');
    if (!btn) return;
    btn.textContent = enabled ? 'SCF: ON' : 'SCF: OFF';
  }

  // ===== SCF: BOOT SEQUENCE =====
  function init() {
    createToggle();
    // Default OFF (fail open)
  }

  init();

})(); btn.addEventListener('mouseleave', () => { btn.style.opacity = '0.70'; });

    btn.addEventListener('click', () => {
      enabled ? disableFirewall() : enableFirewall();
    });

    document.body.appendChild(btn);
    updateToggle();
  }
