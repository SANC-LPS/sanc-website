// Permalinks are relative to dir.output ("blog"), so this writes
// blog/<slug>/index.html -> served as /blog/<slug>/.
// This flattens URLs to /blog/<slug>/ instead of /blog/posts/<slug>/.
module.exports = {
  eleventyComputed: {
    permalink: (data) => "/" + data.page.fileSlug + "/index.html"
  }
};
