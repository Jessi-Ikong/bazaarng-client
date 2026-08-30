import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function buildTree(categories) {
  const byId = {};
  categories.forEach((c) => (byId[c._id] = { ...c, children: [] }));
  const roots = [];
  categories.forEach((c) => {
    if (c.parentCategory) {
      byId[c.parentCategory]?.children.push(byId[c._id]);
    } else {
      roots.push(byId[c._id]);
    }
  });
  return roots;
}

// Groups a top-level category's direct children into columns for the
// flyout — each direct child becomes a column header, with ITS children
// listed underneath. A leaf category (no children) just becomes its own
// single-item column, so the flyout degrades gracefully at any depth.
function buildFlyoutColumns(node) {
  if (node.children.length === 0) return [];
  return node.children.map((child) => ({
    heading: child,
    items: child.children.length > 0 ? child.children : [child],
  }));
}

const COPIES = 4; // duplicated passes of the category list, for a seamless infinite-loop marquee
const SPEED_PX_PER_SEC = 26;

export default function CategoryBar() {
  const [tree, setTree] = useState([]);
  const [openId, setOpenId] = useState(null);

  const barRef = useRef(null);
  const scrollRef = useRef(null);
  const firstCopyRef = useRef(null);
  const copyWidthRef = useRef(0);
  const pausedRef = useRef(false);
  const openIdRef = useRef(null);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setTree(buildTree(res.data)))
      .catch(() => setTree([]));
  }, []);

  // Close the flyout on outside click.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) setOpenId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keep a ref mirror of openId so the rAF loop (whose closure is set up
  // once) can read the latest value without re-subscribing every render.
  useEffect(() => {
    openIdRef.current = openId;
  }, [openId]);

  // Measure the width of a single pass through the category list — the
  // marquee loop subtracts exactly this much from scrollLeft once it's
  // been scrolled past, which is what makes the loop invisible: the next
  // copy is pixel-identical to the one just scrolled off.
  useEffect(() => {
    if (firstCopyRef.current) {
      copyWidthRef.current = firstCopyRef.current.offsetWidth;
    }
  }, [tree]);

  // The auto-scrolling marquee itself. Paused while the user is hovering,
  // touching, or has a flyout open — a moving target is hard to click on,
  // and a bar drifting under an open dropdown would look broken.
  useEffect(() => {
    if (tree.length === 0) return;

    const step = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const deltaSeconds = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const el = scrollRef.current;
      const shouldMove = el && !pausedRef.current && openIdRef.current === null && copyWidthRef.current > 0;

      if (shouldMove) {
        el.scrollLeft += SPEED_PX_PER_SEC * deltaSeconds;
        if (el.scrollLeft >= copyWidthRef.current) {
          el.scrollLeft -= copyWidthRef.current;
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [tree]);

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  if (tree.length === 0) return null;

  return (
    <div ref={barRef} className="relative bg-white border-b border-neutral-100">
      <div
        ref={scrollRef}
        className="overflow-x-auto no-scrollbar"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={() => setTimeout(resume, 1200)}
      >
        <div className="flex">
          {Array.from({ length: COPIES }).map((_, copyIndex) => (
            <div
              key={copyIndex}
              ref={copyIndex === 0 ? firstCopyRef : null}
              className="flex gap-1 shrink-0 px-2"
            >
              {tree.map((node) => {
                const hasChildren = node.children.length > 0;
                const isOpen = openId === node._id;
                const pillClass = `flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                  isOpen
                    ? 'border-primary-600 text-primary-800'
                    : 'border-transparent text-neutral-800 hover:text-primary-700'
                }`;

                // Leaf categories are plain links; only parents with
                // subcategories are buttons that toggle the flyout.
                // Keeping these as separate element types (rather than
                // nesting a <Link> inside a <button>) avoids invalid
                // interactive-in-interactive HTML nesting.
                if (!hasChildren) {
                  return (
                    <Link
                      key={`${node._id}-${copyIndex}`}
                      to={`/category/${node.slug}`}
                      title={node.name}
                      className={pillClass}
                    >
                      <i className={`ti ${node.icon || 'ti-category'} text-primary-600`} />
                      {node.name}
                    </Link>
                  );
                }

                return (
                  <button
                    key={`${node._id}-${copyIndex}`}
                    title={node.name}
                    onClick={() => setOpenId(isOpen ? null : node._id)}
                    className={pillClass}
                  >
                    <i className={`ti ${node.icon || 'ti-category'} text-primary-600`} />
                    {node.name}
                    <span className={`text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {tree.map((node) => {
        if (openId !== node._id) return null;
        const columns = buildFlyoutColumns(node);
        return (
          <div
            key={node._id}
            className="absolute left-0 right-0 top-full bg-white border-b border-neutral-100 shadow-lg z-30"
          >
            <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {columns.map((col) => (
                <div key={col.heading._id}>
                  <Link
                    to={`/category/${col.heading.slug}`}
                    onClick={() => setOpenId(null)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 hover:text-primary-700"
                  >
                    <i className={`ti ${col.heading.icon || 'ti-category'}`} />
                    {col.heading.name}
                  </Link>
                  {col.items.map((item) => (
                    <Link
                      key={item._id}
                      to={`/category/${item.slug}`}
                      onClick={() => setOpenId(null)}
                      className="block text-sm text-neutral-700 py-1 hover:text-primary-700"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
