# NextLakeLabs Website

A simple, fast, SEO-optimized static website for NextLakeLabs consulting company.

## Tech Stack

**Why Plain HTML/CSS/JS?**

| Consideration | Our Choice | Why |
|--------------|------------|-----|
| **Simplicity** | Plain HTML/CSS | No build tools, no dependencies, no framework complexity |
| **SEO** | Semantic HTML | Search engines prefer pure HTML; no client-side rendering delays |
| **Speed** | Zero frameworks | Page loads instantly; no JavaScript bundle to parse |
| **Maintenance** | No npm packages | Nothing to update, no security vulnerabilities |
| **Hosting** | Static files | Works anywhere: GitHub Pages, Netlify, Vercel, Azure Static Web Apps |
| **Cost** | Free hosting | Static sites can be hosted for free on most platforms |

## Project Structure

```
nextlake-website/
├── index.html      # Main landing page
├── blog.html       # Blog page (ready for future posts)
├── styles.css      # Modern responsive CSS with CSS variables
├── script.js       # Minimal JS (nav toggle, form handling)
├── favicon.svg     # SVG favicon
└── README.md       # This file
```

## Features

- **Modern UI Design** - Clean, professional with gradient accents
- **Blog Ready** - Blog page structure ready for future content
- **Responsive** - Works on all devices
- **SEO Optimized** - Proper meta tags, structured data, semantic HTML
- **Fast** - No framework overhead, minimal JS

## SEO Features

- Semantic HTML5 structure (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`)
- Proper heading hierarchy (h1 → h2 → h3)
- Meta tags (description, keywords, Open Graph, Twitter Cards)
- Structured data (JSON-LD schema for Organization)
- Canonical URL
- Fast load times (no heavy frameworks)
- Mobile responsive design
- Accessible markup

## Deployment Options

### Option 1: GitHub Pages (Free)
```bash
# Push to GitHub, then enable Pages in Settings > Pages
```

### Option 2: Netlify (Free)
```bash
# Drag and drop folder to netlify.com/drop
# Or connect your GitHub repo
```

### Option 3: Vercel (Free)
```bash
npm i -g vercel
vercel
```

### Option 4: Azure Static Web Apps
```bash
# Use Azure Portal or CLI to create a Static Web App
# Connect to your GitHub repo for automatic deployments
```

## Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --color-primary: #6366f1;      /* Indigo - main brand */
    --color-primary-dark: #4f46e5; /* Darker for hover */
    --color-accent: #8b5cf6;       /* Purple accent */
    --color-text: #475569;         /* Body text */
    --color-heading: #0f172a;      /* Headings */
}
```

### Contact Form
The form currently logs to console. To make it functional:

1. **Formspree** (easiest): Add your form endpoint in `script.js`
2. **Netlify Forms**: Add `netlify` attribute to form; deploying to Netlify automatically enables it
3. **Custom backend**: Send form data to your API endpoint

## Browser Support

- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome for Android)
- Graceful degradation for older browsers

## Performance

- **No build step required**
- **< 50KB total page size** (HTML + CSS + JS)
- **100/100 Lighthouse score potential** (with proper hosting)

## License

© 2026 NextLakeLabs. All rights reserved.
