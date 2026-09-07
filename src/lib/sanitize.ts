import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p", "a", "em", "strong", "b", "i", "u", "s", "ul", "ol", "li",
  "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
  "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td",
  "hr", "br", "span", "div", "section", "article", "details", "summary",
  "iframe", "video", "audio", "source", "picture", "sup", "sub"
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height", "loading"],
  iframe: ["src", "title", "width", "height", "allow", "allowfullscreen", "frameborder"],
  video: ["src", "controls", "poster", "width", "height", "preload"],
  audio: ["src", "controls", "preload"],
  source: ["src", "type", "srcset"],
  td: ["colspan", "rowspan", "align"],
  th: ["colspan", "rowspan", "align"],
};

export function sanitizeHtmlContent(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
      iframe: ["http", "https"],
    },
    allowedIframeDomains: [
      "youtube.com",
      "www.youtube.com",
      "youtu.be",
      "player.vimeo.com",
      "vimeo.com",
      "www.google.com",
      "google.com",
      "maps.google.com",
      "spotify.com",
      "open.spotify.com",
      "soundcloud.com",
      "w.soundcloud.com",
    ],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}
