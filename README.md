# Google Cognitive Firewall (GCF)

Google Cognitive Firewall is a **subtractive, presentation-layer userscript** for Google Search.

It reduces non-essential SERP clutter while preserving full access to information, user intent, and manual judgment.

This project does **not** rank results, summarize content, inject AI, or automate decisions.  
It exists to reclaim cognitive bandwidth — locally, transparently, and by choice.

---

## Design principles

- **Subtractive over additive**  
  Remove structural noise instead of adding new interfaces.

- **User agency first**  
  Manual toggle. No automation of judgment.

- **Fail-open by design**  
  If something breaks or changes upstream, Google Search remains usable.

- **Local-only execution**  
  No telemetry, analytics, tracking, or network interception.

- **Deterministic behavior**  
  No heuristics, prediction, or adaptive logic.

---

## Browser configuration (optional)

GCF is designed to work with standard userscript managers such as Tampermonkey or Violentmonkey.

Recommended configuration:
- Pin the userscript manager to your browser toolbar for visibility and quick access
- Allow the manager to run in Incognito if you want GCF active during private searches

GCF remains local-only, session-scoped, and domain-limited regardless of browser mode.

---

## Minimum Mode (v0.2)

This release prioritizes **stability and reversibility** over aggressive removal.

Minimum Mode is intentionally conservative. It aims to improve scan clarity and reduce cognitive interruption without risking broken layouts or lost access to results.

---

## Permissions & scope

Some userscript managers require enabling access on “All sites.”  
This is a manager-level setting and does **not** change GCF’s actual execution scope.

GCF itself is restricted by its match rules and only runs on Google Search pages:

- `https://www.google.*/*`
- `https://www.google.*/*search*`

International Google domains (e.g. google.ca, google.co.uk, google.de) are supported automatically.

GCF does not:
- Run on non-Google sites
- Intercept network requests
- Collect, transmit, or store user data
  
---

## What this version guarantees

- Preserves access to organic results (fail-open)
- Runs locally (no network interception, telemetry, or data collection)
- Subtractive presentation-layer changes only
- User-controlled ON/OFF toggle
- Session-only persistence:
  - stays enabled across reloads in the same tab
  - resets when the tab or browser window is closed

---

## Known limitations (by design)

- Google frequently A/B tests SERP layouts; some modules may reappear
- Selectors are **best-effort** to avoid breaking search
- This project does not guarantee permanent removal of all UI elements
- Layout behavior may vary by language, region, or account state

These limitations are intentional trade-offs in favor of stability and user trust.

---

## What this project is not

- Not an AI assistant
- Not a ranking system
- Not a content filter
- Not an ad blocker
- Not an attempt to defeat or bypass Google systems

GCF modifies **presentation only**, leaving content, ordering, and interpretation to the user.

---

## Installation

1. Install a userscript manager such as **Violentmonkey**
2. Create a new userscript
3. Paste the contents of `src/google-cognitive-firewall.user.js`
4. Save and visit Google Search
5. Use the on-page toggle to enable or disable GCF

---

## Project status

- **Engine:** Google Search
- **Mode:** Minimum Mode only
- **Stability:** Actively tested against live layouts
- **Future work:** Research / strict modes, additional engines (out of scope for v0.2)

---

## License

MIT
