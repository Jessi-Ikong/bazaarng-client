import { Link } from "react-router-dom";

// A slide's link may be a plain relative path (/products/abc123) or a full
// URL — and a full URL might still point at this same site (e.g. an admin
// pasted it straight from the address bar), which must still navigate
// internally rather than opening a new tab. Only a genuinely different
// hostname counts as external.
function resolveLinkTarget(link) {
  if (!/^https?:\/\//i.test(link)) {
    return { isExternal: false, href: link };
  }
  try {
    const url = new URL(link);
    if (url.hostname === window.location.hostname) {
      return { isExternal: false, href: `${url.pathname}${url.search}${url.hash}` };
    }
    return { isExternal: true, href: link };
  } catch {
    return { isExternal: true, href: link };
  }
}

// Displays a single promo slide. Height is fixed (not derived from the
// image's own dimensions or content) — below lg: picked to closely match
// TrustBanner's actual rendered height (176px from sm: upward, ~150px on
// mobile) so alternating between the two never visibly jumps the page.
// At lg: and up, this deliberately breaks from that match: the frame goes
// taller (2x the sm:/lg: height below) and narrower (capped + centered)
// for a more deliberate large-screen promo look — the resulting layout
// shift when switching with the banner at that size is expected/accepted.
export default function PromoCarousel({ slide }) {
  const { image, title, link } = slide;
  const { isExternal, href } = link ? resolveLinkTarget(link) : { isExternal: false, href: null };

  const content = (
    <div className="relative rounded-xl overflow-hidden mb-6 h-40 sm:h-44 lg:h-[352px] lg:max-w-xl lg:mx-auto bg-neutral-100">
      <img
        src={image}
        alt={title || "Promotion"}
        className="w-full h-full object-cover"
      />
      {title && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 sm:px-8 py-4">
          <p className="font-heading text-lg sm:text-xl font-semibold text-white">
            {title}
          </p>
        </div>
      )}
    </div>
  );

  if (!link) return content;

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return (
    <Link to={href} className="block">
      {content}
    </Link>
  );
}
