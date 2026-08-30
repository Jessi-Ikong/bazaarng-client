import { useEffect, useState } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/adminService';
import Loader from '../../components/common/Loader';

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

function CategoryNode({ node, depth, onEdit, onDelete }) {
  return (
    <div>
      <div
        className="flex items-center justify-between py-2 border-b border-neutral-100"
        style={{ paddingLeft: depth * 20 }}
      >
        <span className="text-sm text-neutral-900">{node.name}</span>
        <div className="flex gap-2">
          <button onClick={() => onEdit(node)} className="text-xs text-primary-600 hover:underline">
            Edit
          </button>
          <button onClick={() => onDelete(node)} className="text-xs text-red-600 hover:underline">
            Delete
          </button>
        </div>
      </div>
      {node.children.map((child) => (
        <CategoryNode key={child._id} node={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', parentCategory: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = () => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => setError('Could not load categories.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadCategories, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ name: '', parentCategory: '' });
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditingId(category._id);
    setForm({ name: category.name, parentCategory: category.parentCategory || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = { name: form.name, parentCategory: form.parentCategory || null };

    try {
      if (editingId) {
        await updateCategory(editingId, payload);
      } else {
        await createCategory(payload);
      }
      setShowForm(false);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete "${category.name}"? This can't be undone.`)) return;
    try {
      await deleteCategory(category._id);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete category — it may have subcategories.');
    }
  };

  if (loading) return <Loader />;

  const tree = buildTree(categories);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-xl font-semibold text-neutral-900">Categories</h1>
        <button
          onClick={openCreateForm}
          className="h-9 px-4 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800"
        >
          + Add category
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={() => setShowForm(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="bg-white rounded-xl w-full max-w-sm"
          >
            <div className="bg-primary-900 px-5 py-4">
              <p className="font-heading text-white font-semibold">
                {editingId ? 'Edit category' : 'Add category'}
              </p>
            </div>
            <div className="p-5 space-y-3">
              <input
                placeholder="Category name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <select
                value={form.parentCategory}
                onChange={(e) => setForm({ ...form, parentCategory: e.target.value })}
                className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="">No parent (top-level category)</option>
                {categories
                  .filter((c) => c._id !== editingId)
                  .map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="h-9 px-4 rounded-lg border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-9 px-4 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {tree.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-16">No categories yet.</p>
      ) : (
        <div className="bg-white border border-neutral-100 rounded-lg px-4">
          {tree.map((node) => (
            <CategoryNode key={node._id} node={node} depth={0} onEdit={openEditForm} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
