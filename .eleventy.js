module.exports = function (eleventyConfig) {
  eleventyConfig.setLayoutsDirectory("_layouts");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addGlobalData("layout", "page");
  for (const key of ["title", "description", "parent", "section_key", "nav_key", "nav_level", "nav_order", "nav_title", "section", "kicker", "theme_key", "generated_pdf_page", "source_pdf_url"]) {
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