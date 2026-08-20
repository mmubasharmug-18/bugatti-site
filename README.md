# Bugatti — Cinematic Website

A scroll-driven, cinematic single-page experience built with vanilla HTML/CSS/JS, GSAP + ScrollTrigger, and Three.js.

## Run it locally

No build step, no backend. From this folder:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then open `http://localhost:8000` in your browser.

> Opening `index.html` directly via `file://` will work in most browsers, but some (Chrome, in particular) block video/fetch requests under `file://` for security reasons — a local server avoids that.

## Structure

```
index.html          10 sections + preloader + nav + reticle
style.css            design tokens, layout, scene scrims, responsive rules
script.js            preloader, lazy video loading, ScrollTrigger animations, Three.js ambient particles
assets/videos/       01–10 source clips (muted, autoplay, loop)
```

## How it works

- **Preloader** buffers `01-hero.mp4` before reveal; every other clip lazy-loads via `IntersectionObserver` as you approach its section, and pauses when off-screen to save resources.
- **GSAP ScrollTrigger** drives per-section typography reveals, a subtle video scale/parallax drift, and the nav's active-section indicator.
- **Three.js** renders a faint particle field in a fixed canvas behind everything — it drifts with scroll and mouse position to give the page a sense of depth without competing with the vehicle footage.
- **Reticle cursor** (desktop only) is the page's signature interaction: a thin ring with live normalized coordinates, echoing the "engineering precision" theme.
- Everything animates on `transform`/`opacity` only — no layout-thrashing properties — for smooth performance even with several videos in memory.

## Customizing

- Swap copy in `index.html` — each section is self-contained under `<section class="scene" id="...">`.
- Palette and type scale live at the top of `style.css` under `:root`.
- To adjust which sections preload eagerly vs. lazily, edit the `preload` attribute on each `<video>` tag.
