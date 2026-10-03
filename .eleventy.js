module.exports = function(eleventyConfig) {
  // Targets are relative to dir.output ("blog"), so these land at
  // blog/images and blog/assets -> served as /blog/images and /blog/assets.
  eleventyConfig.addPassthroughCopy({ "blog-src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "blog-src/assets": "assets" });
  return {
    dir: {
      input: "blog-src",
      output: "blog",
      includes: "_includes"
    }
  };
};
