import { useEffect } from "react";

const setMeta = (name, content, attr = "name") => {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setLink = (rel, href) => {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const setJsonLd = (id, data) => {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.text = JSON.stringify(data);
};

export function useSEO({ title, description, image, type = "website", jsonLd }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Silk Route Naturals` : "Silk Route Naturals | Treasures of the Ancient Trade";
    document.title = fullTitle;
    setMeta("description", description || "Single-origin almonds, pistachios, hazelnuts, dates and saffron, sourced from the ancient Silk Route. Slow-cured, hand-graded, luxury heritage superfoods.");
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description || "Treasures from the ancient Silk Route.", "property");
    setMeta("og:type", type, "property");
    setMeta("og:url", window.location.href, "property");
    if (image) setMeta("og:image", image, "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description || "Treasures from the ancient Silk Route.");
    if (image) setMeta("twitter:image", image);
    setLink("canonical", window.location.href);
    if (jsonLd) setJsonLd("page-jsonld", jsonLd);
  }, [title, description, image, type, jsonLd]);
}
