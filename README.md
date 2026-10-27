# Sustainable-AI-Using-Digital-Twins
Sustainable AI Using Digital Twins

An agentic-AI-dashboard style presentation built from the documents in `materials/` (kept in their original order):

| # | Module | Image |
|---|--------|-------|
| 00 | Mission overview (cover, KPIs, agenda) | — |
| 01 | The Origins of Digital Twins | Apollo 13 Mission |
| 02 | Most Common Application Areas | Application Areas wheel (interactive badges) |
| 03 | Digital Twins for Smart Cities | Decarbonization Engine |
| 04 | OODA Loop & Digital Twins | OODA Loop (interactive quadrants) + Operational Framework |
| 05 | Sustainable AI — 12 Dimensions | 12 Dimensions (interactive badges) |
| 06 | Sustainable Business Continuity | 6 Dimensions (interactive badges) |

The circular badges in the infographics light up on hover (spotlight + glow) and are linked to the detail panel beside each image.

## Run locally

```bash
python3 -m http.server 8765 --directory site
```

Then open http://127.0.0.1:8765. Keys: `←` / `→` to navigate, `F` for full-screen present mode. Add `?debug` to the URL to outline the hotspot areas.

## Deploy to Netlify

The site is plain static HTML/CSS/JS in `site/` — no build step. `netlify.toml` already sets `publish = "site"`, so either connect this repo in Netlify, or drag the `site/` folder onto https://app.netlify.com/drop.
