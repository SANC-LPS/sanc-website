// Permalinks are relative to dir.output ("blog"), so this writes
// blog/<slug>/index.html -> served as /blog/<slug>/.
// This flattens URLs to /blog/<slug>/ instead of /blog/posts/<slug>/.
//
// ogType marks every file in this folder as an individual post, which base.njk
// uses to emit og:type="article" plus article:published_time. Pages outside
// this folder (blog index, category pages) fall back to og:type="website".
// Note: Eleventy always defines `date` (it falls back to the file date), so
// ogType -- not the presence of `date` -- is what identifies a real post.
module.exports = {
  ogType: "article",
  eleventyComputed: {
    permalink: (data) => "/" + data.page.fileSlug + "/index.html"
  }
};
