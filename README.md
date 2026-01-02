# Search Cognitive Firewall

Search Cognitive Firewall (SCF) is a local-only userscript that reduces cognitive noise on search engine results pages by removing non-essential UI elements.

## What it does
- Removes pre-result AI summaries and engagement-first modules
- Preserves access to original sources and full result depth
- Does not rank, judge, summarize, or automate decisions
- Runs entirely client-side with deterministic behavior

## What it is not
- Not an AI assistant
- Not a content filter
- Not a ranking or recommendation system
- Not a tracking or analytics tool

## Design principles
- Subtractive design over additive features
- Preserve user intent and inspection order
- Fail open, never guess
- No data collection, monetization, or ideology

## Install (Firefox)
1. Install the Violentmonkey extension.
2. Open `src/search-cognitive-firewall.user.js` in this repository.
3. Click **Raw** and install when prompted.
4. Run a Google search to confirm SCF is active.

## What SCF Will Never Do

SCF is intentionally limited by design. It does not attempt to improve, interpret, or optimize search results.

Specifically, SCF will never:
- Rank, reorder, or suppress organic results
- Generate summaries, suggestions, or alternative queries
- Judge relevance, credibility, or intent
- Inject AI-generated content or guidance
- Collect data, analytics, or telemetry
- Store state, preferences, or user behavior

These constraints are not temporary omissions. They are core to SCF’s purpose. The project prioritizes preserving human judgment over automating it.

## Reversibility and Trust

SCF is designed to be fully reversible, transparent, and local-only.

When enabled, SCF modifies only the presentation layer of supported search engines. When disabled, all changes disappear immediately and the platform returns to its native behavior. No settings persist, no state is saved, and no functionality is permanently altered.

SCF does not intercept network traffic, does not communicate externally, and does not depend on remote services. All behavior is deterministic and inspectable in the source code.

Trust is established not through promises, but through restraint. SCF aims to earn trust by doing less, clearly, and reversibly.
