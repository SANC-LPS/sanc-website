// Build-time Node code. This never reaches the browser, so the site's
// client-side rules (no template literals, ASCII-only) do not apply here.
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt({ html: true, linkify: false, typographer: false });

// --- video parsing -------------------------------------------------------
// Both branches rebuild the embed URL from a validated id and never
// interpolate the raw input, so a pasted value cannot inject into the src.

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

// Explicit host paths first; a bare id is handled separately below.
const YOUTUBE_PATTERNS = [
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/watch\?(?:[^#]*&)?v=([A-Za-z0-9_-]{11})/,
  /youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/
];

// Rumble only publishes embeddable iframes under /embed/<id>/. Real ids look
// like "v6uz6v" or "u4nvf6q.v70bqqu". Matches a bare embed URL or the src of
// a pasted <iframe> snippet; any query string is dropped when rebuilding.
const RUMBLE_EMBED = /rumble\.com\/embed\/([A-Za-z0-9._-]+?)\/?(?:\?|["'\s>]|$)/;

// A normal Rumble watch page, e.g. rumble.com/v2667bs-some-title.html --
// not embeddable, and the most likely paste mistake.
const RUMBLE_PAGE = /rumble\.com\/v[A-Za-z0-9]/i;

function videoEmbed(value) {
  if (!value || typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw) return null;

  for (const re of YOUTUBE_PATTERNS) {
    const m = raw.match(re);
    if (m) {
      const id = m[1];
      return {
        provider: 'youtube',
        src: 'https://www.youtube-nocookie.com/embed/' + id,
        thumb: 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg'
      };
    }
  }

  // Bare 11-character YouTube id (only when the value is nothing but the id).
  // Excludes all-lowercase hyphenated words: a typo like "not-a-video" is
  // also exactly 11 legal id characters, and treating it as an id would
  // silently embed a dead video instead of warning. Real ids are random
  // base64url, so an all-lowercase dash-separated word is effectively never
  // a genuine id -- and a full URL still works for any id that looks like one.
  if (YOUTUBE_ID.test(raw) && !/^[a-z]+(?:-[a-z]+)+$/.test(raw)) {
    return {
      provider: 'youtube',
      src: 'https://www.youtube-nocookie.com/embed/' + raw,
      thumb: 'https://img.youtube.com/vi/' + raw + '/hqdefault.jpg'
    };
  }

  const rm = raw.match(RUMBLE_EMBED);
  if (rm) {
    // Strip a trailing dot so a stray separator cannot become part of the id.
    const id = rm[1].replace(/\.+$/, '');
    if (id) {
      return {
        provider: 'rumble',
        src: 'https://rumble.com/embed/' + id + '/',
        thumb: ''
      };
    }
  }

  return null;
}

module.exports = function (eleventyConfig) {
  // Targets are relative to dir.output ("blog"), so these land at
  // blog/images and blog/assets -> served as /blog/images and /blog/assets.
  eleventyConfig.addPassthroughCopy({ "blog-src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "blog-src/assets": "assets" });

  // Returns { provider, src, thumb } or null. Warns (never throws) on a
  // non-empty value it cannot parse, so one bad paste cannot break a deploy.
  eleventyConfig.addFilter('videoEmbed', function (value) {
    const parsed = videoEmbed(value);
    if (!parsed && value && String(value).trim()) {
      const where = (this.page && this.page.inputPath) || 'unknown post';
      console.warn(
        '[video] Unrecognized video value ' + JSON.stringify(String(value).trim()) +
        ' in ' + where + ' -- no embed was rendered.'
      );
      if (RUMBLE_PAGE.test(String(value)) && !/rumble\.com\/embed\//.test(String(value))) {
        console.warn(
          "[video] Rumble page links can't be embedded; use the Embed IFRAME URL from the Embed button."
        );
      }
    }
    return parsed;
  });

  eleventyConfig.addFilter('markdownify', function (value) {
    if (!value) return '';
    return md.render(String(value));
  });

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
