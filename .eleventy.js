module.exports = function (eleventyConfig) {
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.setLayoutsDirectory("_layouts");
  eleventyConfig.addPassthroughCopy("assets");
  const modelAttachments = require("./_data/site.js").static_files.filter((file) =>
    file.path.startsWith("salvaged-knowledge/Radios/HTs/Anytone/D868/") &&
    [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".doc", ".docx", ".odt", ".txt", ".zip"].includes(file.extname.toLowerCase())
  );
  for (const file of modelAttachments) {
    eleventyConfig.addPassthroughCopy(file.path);
  }
  eleventyConfig.addGlobalData("layout", "page");
  for (const key of ["title", "description", "parent", "section_key", "nav_key", "nav_level", "nav_order", "nav_title", "section", "kicker", "theme_key", "generated_pdf_page", "source_pdf_url", "rendered_pages", "rendered_page_count", "source_page_count", "has_more_pages", "lang"]) {
    eleventyConfig.addGlobalData(`eleventyComputed.page.${key}`, () => (data) => data[key]);
  }
  eleventyConfig.addLiquidFilter("relative_url", (url) => url);
  eleventyConfig.addLiquidFilter("where", (items, key, value) =>
    (items || []).filter((item) => item[key] === value)
  );

  return {
    dir: {
      input: ".",
      output: "_site"
    },
    templateFormats: ["md", "html"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid"
  };
};