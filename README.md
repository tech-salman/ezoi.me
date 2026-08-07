# ezoi.me — Muhammad Salman Nadeem

Personal portfolio, blog, Islam AI assistant, and a directory of 470+ verified
student offers. Static site, no build step, deployed to GitHub Pages.

**Live:** https://ezoi.me

## Sections
| Path | Description |
| --- | --- |
| `/` | Portfolio: summary, experience, projects, education, links |
| `/blogs/` | Blog hub → `articles/`, `tricks/`, `websites/` |
| `/pages/` | Owned domains index |
| `/islamAI/` | Islam AI chat assistant (Quran, Hadith, Fiqh) |
| `/tools/` | Student offers hub: 15 categories, 470+ offers |

## Structure
```
index.html              portfolio homepage
styles.css              shared theme (dark default, light via data-theme)
js/app.js               theme + cookies + nav + scrollspy + copy + SW register
sw.js                   service worker (same-origin cache, offline fallback)
offline.html            offline fallback page
404.html                not-found page + client-side redirect map
sitemap.xml             auto-generated, 500+ URLs
robots.txt              allows search + AI crawlers (GPTBot, ClaudeBot, …)
llms.txt / llms.md      AI-readable site summary (AI SEO)
_redirects              retired-path map (Netlify/Cloudflare format)
redirect-map.txt        human-readable redirect documentation
manifest.webmanifest    PWA manifest
.nojekyll               required so /tools/_next/ assets are served
CNAME                   ezoi.me
```

## Local preview
```bash
python -m http.server 8899
# open http://127.0.0.1:8899/
```

## Regenerating the sitemap
The sitemap lists every directory containing an `index.html`, excluding
`.git`, `.github`, and `_next`. Regenerate after adding or removing pages.

## Deployment
Pushing to `main` triggers `.github/workflows/static.yml`, which uploads the
whole repository and deploys it to GitHub Pages.

## Contact
- Email: salman.nadeem.com@gmail.com
- GitHub: https://github.com/tech-salman
- Upwork: https://www.upwork.com/freelancers/~014342acfaddb97fc7
