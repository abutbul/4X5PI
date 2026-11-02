# 4X5PI Radio Ham Alcove

A lightweight amateur radio site built with Jekyll and hosted on GitHub Pages.

## Local preview

Preview and build locally with Node.js and npm; Ruby is not required for local preview:

```sh
npm install
npm run dev
```

Run `npm run build` to generate the site into `_site/` without starting the development server.

## GitHub Pages deployment

The workflow in `.github/workflows/pages.yml` builds the site with Jekyll and deploys it whenever changes are pushed to `main`, or when manually started from the Actions tab. In the repository settings, set **Pages > Build and deployment > Source** to **GitHub Actions**. The first deployment will appear after the workflow has been pushed and completed successfully.

Add pages inside the relevant section folder. Set `title`, `description`, `parent`, and `nav_order` in front matter to have pages appear in the generated section navigation and index. Set `section_key` on a section landing page and use that value as `parent` for its child pages.

Personal station details, QSL images, and log data are intentionally left for the site owner to add.
