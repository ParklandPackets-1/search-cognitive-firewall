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
