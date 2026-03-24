# Theme Extension

> Day 05 of my [50 Projects in 50 Days](https://reneebe.github.io/50projects) challenge.

A Chrome extension that injects AI-generated CSS themes into any webpage with one click. Describe a visual mood — *"neon tokyo rainstorm"*, *"dusty 70s paperback"* — and the extension generates a full set of CSS custom properties (colors, gradients, glassmorphism values, fonts, background patterns) and applies them live to the active tab.

> **Chrome Store submission is pending review.** In the meantime, you can install it manually from source (see below).

## Features

- Natural language theme generation — describe a vibe, get a full theme
- Optional background pattern generation (e.g. *"leopard print"*, *"circuit board"*)
- Live preview with color swatches and palette image before applying
- Injects directly into any site's `:root` with no page reload
- Brings in matching Google Fonts automatically
- Supports your own Gemini or Claude API keys, or uses the default shared worker

## Tech Stack

- React + TypeScript (Vite) — popup UI
- Tailwind CSS
- Chrome Extension Manifest v3
- Cloudflare Worker (`nano-claude-theme-manager`) — AI backend via Gemini + Claude

## Install from Source

1. Clone this repo
2. `npm install && npm run build`
3. Open Chrome → `chrome://extensions` → enable **Developer mode**
4. Click **Load unpacked** → select the `dist/` folder
5. Pin the extension and click the icon on any page

## Usage

1. Type a theme description in the popup (or pick an example chip)
2. Optionally add a background pattern description
3. Hit **Generate** — preview the palette
4. Hit **Apply** to inject the theme into the current tab

API keys are optional — the extension uses a shared Cloudflare Worker by default. To use your own, expand the settings panel and add a Gemini and/or Claude key.
