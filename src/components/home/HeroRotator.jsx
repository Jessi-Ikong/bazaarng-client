import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getActivePromoSlides } from "../../services/promoSlideService";
import TrustBanner from "./TrustBanner";
import PromoCarousel from "./PromoCarousel";

const TURN_DURATION_MS = 30000;

// Alternates the homepage hero between the trust banner and the active
// promo slides, one full 30s turn each: banner, slide 1, banner, slide 2,
// banner, slide 3, back to slide 1, repeating. With no active slides it
// just renders the banner permanently — no timer, no empty carousel state.
export default function HeroRotator() {
  const [slides, setSlides] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showingBanner, setShowingBanner] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    getActivePromoSlides()
      .then((res) => setSlides(res.data))
      .catch(() => setSlides([]))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setShowingBanner((prevShowingBanner) => {
        // A slide's turn just ended — advance the index for next time
        // before handing this turn back to the banner.
        if (!prevShowingBanner) {
          setSlideIndex((i) => (i + 1) % slides.length);
        }
        return !prevShowingBanner;
      });
    }, TURN_DURATION_MS);

    return () => clearInterval(interval);
  }, [slides.length]);

  const showBanner = !loaded || slides.length === 0 || showingBanner;

  // TrustBanner and PromoCarousel are two different elements — React
  // unmounts one and mounts the other on every swap, so neither can ever
  // animate its OWN size change (a freshly-mounted element has no "before"
  // state to transition from). This wrapper is what actually stays mounted
  // across every swap: it measures whichever child is currently rendered
  // and applies that as its own explicit height, so the CSS transition
  // below animates the WRAPPER's real box between the two sizes instead.
  // Width doesn't need measuring — both states are fixed, deterministic
  // rules (full width vs capped-and-centered at lg:), so plain conditional
  // classes transition natively with no measurement needed. `max-w-full`
  // (not omitting max-width) is deliberate: animating max-width to/from
  // `none` doesn't interpolate smoothly in browsers, but two real length
  // values (100% and 36rem) do.
  const contentRef = useRef(null);
  const [wrapperHeight, setWrapperHeight] = useState(null);

  useLayoutEffect(() => {
    const measure = () => {
      if (!contentRef.current) return;
      // Target the actual mb-6 element directly (not just contentRef's
      // firstElementChild) — a linked slide wraps its content in an extra
      // <a>/<Link>, which would otherwise sit between them and hide the
      // real margin from a shallow check. Both TrustBanner and
      // PromoCarousel's own root carry mb-6, at whatever depth.
      const target = contentRef.current.querySelector(".mb-6");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      // That bottom margin would normally collapse straight through this
      // wrapper — but overflow-hidden below (needed to clip the
      // taller/shorter child mid-transition) blocks that collapse, so it
      // has to be measured and added explicitly or it gets clipped away.
      const marginBottom = parseFloat(getComputedStyle(target).marginBottom) || 0;
      setWrapperHeight(rect.height + marginBottom);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [showBanner, slideIndex, loaded]);

  return (
    <div
      className={`transition-all duration-300 ease-in-out overflow-hidden rounded-xl w-full lg:mx-auto ${
        showBanner ? "lg:max-w-full" : "lg:max-w-xl"
      }`}
      style={wrapperHeight ? { height: `${wrapperHeight}px` } : undefined}
    >
      <div ref={contentRef}>
        {showBanner ? (
          <TrustBanner />
        ) : (
          <PromoCarousel slide={slides[slideIndex]} />
        )}
      </div>
    </div>
  );
}
