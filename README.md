# 4X5PI Corner

A lightweight amateur radio site built with Jekyll and hosted on GitHub Pages.

## Local preview

GitHub Pages builds the site from the repository root on the `main` branch. To preview locally, install Ruby, Bundler, and Jekyll, then run:

```sh
bundle install
bundle exec jekyll serve --baseurl ""
```

Add pages inside the relevant section folder. Set `title`, `description`, `parent`, and `nav_order` in front matter to have pages appear in the generated section navigation and index. Set `section_key` on a section landing page and use that value as `parent` for its child pages.

Personal station details, QSL images, and log data are intentionally left for the site owner to add.
