const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");
const yaml = require("yaml");

const root = path.resolve(__dirname, "..");
const ignoredDirectories = new Set([".git", "node_modules", "vendor", "_site", "_layouts", "_data"]);

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return ignoredDirectories.has(entry.name) || entry.name.startsWith(".")
        ? []
        : markdownFiles(path.join(directory, entry.name));
    }
    return entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md"
      ? [path.join(directory, entry.name)]
      : [];
  });
}

function pageUrl(file, frontMatter) {
  if (frontMatter.permalink) return frontMatter.permalink;
  const relativePath = path.relative(root, file).split(path.sep).join("/");
  const withoutExtension = relativePath.slice(0, -3);
  if (path.basename(withoutExtension) === "index") {
    const directory = path.posix.dirname(withoutExtension);
    return directory === "." ? "/" : `/${directory}/`;
  }
  return `/${withoutExtension}/`;
}

const config = yaml.parse(fs.readFileSync(path.join(root, "_config.yml"), "utf8"));
const pages = markdownFiles(root).map((file) => {
  const frontMatter = matter(fs.readFileSync(file, "utf8")).data;
  return { ...frontMatter, url: pageUrl(file, frontMatter) };
});

module.exports = {
  ...config,
  baseurl: "",
  pages
};