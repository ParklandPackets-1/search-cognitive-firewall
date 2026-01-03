# Debugging SOP – Search Cognitive Firewall

## Purpose
Provide a repeatable, low-risk approach to debugging Google SERP changes
without breaking search usability.

## Principles
- Never hide entire results containers
- Prefer header-anchored module removal
- Fail-open over completeness
- Observe, then narrow scope

## Process
1. Reproduce with GCF OFF
2. Toggle GCF ON and observe deltas
3. Identify module by visible header text
4. Confirm module root does NOT contain `#rso`
5. Add header phrase → test → reload
6. If blank SERP occurs, revert immediately

## Stop Conditions
- Blank page
- Loss of organic results
- Structural containers affected

When in doubt: **remove less, not more**.
