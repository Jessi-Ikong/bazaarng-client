import { useEffect } from 'react';

// Lightweight SEO helper — sets the page title and meta description
// directly via the DOM, no dependency needed. This genuinely helps:
// Google's crawler renders JS before indexing, so a dynamically-set
// title/description IS picked up correctly.
//
// Honest limitation worth knowing: crawlers that DON'T execute JS —
// most notably link-preview bots for WhatsApp, Facebook, and Twitter/X —
// won't see these dynamic tags, so sharing a BazaarNG link there will show
// a generic preview rather than the actual product image/name. Fixing
// that properly needs server-side rendering or prerendering, which is a
// bigger architectural change than "SEO basics" — worth revisiting later
// if social sharing becomes something you care about.
export function useDocumentMeta(title, description) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }
  }, [title, description]);
}
