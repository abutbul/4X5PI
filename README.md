# 4X5PI Radio Ham Alcove

A lightweight amateur radio site built with Jekyll and hosted on GitHub Pages.

## Local preview

Jekyll is the only site builder, locally and in CI, and both use the gem versions pinned in `Gemfile.lock` (the `github-pages` gem, Jekyll 3.10). You need Ruby 3.3 with Bundler and Node.js 24:

```sh
npm install
bundle install
npm run dev     # http://localhost:4000/4X5PI/ with live reload
npm run build   # one-off build into _site/
```

Both commands first extract selectable text from the D868 PDFs. Searchable Markdown pages are created temporarily in the model's `pdf-text/` directory; that directory is Git-ignored, so only the original documents and `index.md` are source files. The generated HTML pages are included in `_site/` and the GitHub Pages deployment artifact.

## GitHub Pages deployment

The workflow in `.github/workflows/pages.yml` installs the Node PDF extractor, generates the temporary D868 text pages, builds the site with `bundle exec jekyll build` (the same command and gem versions as a local build), and deploys it whenever changes are pushed to `main`, or when manually started from the Actions tab. In the repository settings, set **Pages > Build and deployment > Source** to **GitHub Actions**. Generated Markdown is not committed; only the built HTML and original source documents are published. The first deployment will appear after the workflow has been pushed and completed successfully.

Add pages inside the relevant section folder. Set `title`, `description`, `parent`, and `nav_order` in front matter to have pages appear in the generated section navigation and index. Set `section_key` on a section landing page and use that value as `parent` for its child pages.

Personal station details, QSL images, and log data are intentionally left for the site owner to add.
