import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

// Builds a nested tree from the flat category list the backend returns
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

function CategoryNode({ node }) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div className="flex items-center justify-between">
        <Link
          to={`/category/${node.slug}`}
          className="py-1.5 text-sm text-neutral-900 hover:text-primary-600 flex-1"
        >
          {node.name}
        </Link>
        {hasChildren && (
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Collapse' : 'Expand'}
            className="px-2 text-neutral-400 hover:text-primary-600"
          >
            {open ? '−' : '+'}
          </button>
        )}
      </div>
      {hasChildren && open && (
        <ul className="pl-3 border-l border-neutral-100">
          {node.children.map((child) => (
            <CategoryNode key={child._id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Sidebar() {
  const [tree, setTree] = useState([]);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setTree(buildTree(res.data)))
      .catch(() => setTree([]));
  }, []);

  return (
    <aside className="w-56 shrink-0 bg-white border border-neutral-100 rounded-lg p-3 h-fit">
      <h2 className="font-heading text-sm font-semibold text-neutral-600 uppercase tracking-wide mb-2">
        Categories
      </h2>
      <ul>
        {tree.map((node) => (
          <CategoryNode key={node._id} node={node} />
        ))}
      </ul>
    </aside>
  );
}
