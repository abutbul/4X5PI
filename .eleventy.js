module.exports = function (eleventyConfig) {
  eleventyConfig.setLayoutsDirectory("_layouts");
  eleventyConfig.addPassthroughCopy("assets");
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