module.exports = function(eleventyConfig) {
  // Targets are relative to dir.output ("blog"), so these land at
  // blog/images and blog/assets -> served as /blog/images and /blog/assets.
  eleventyConfig.addPassthroughCopy({ "blog-src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "blog-src/assets": "assets" });
  return {
    // Post bodies are Markdown only -- no Liquid pre-pass. Without this, a
    // post containing literal {{ or {% (writing about code or templates)
    // would be parsed as a template and break the build.
    markdownTemplateEngine: false,
    dir: {
      input: "blog-src",
      output: "blog",
      includes: "_includes"
    }
  };
};
