import { useEffect, useState } from 'react';
import {
  getAllPromoSlidesAdmin,
  createPromoSlide,
  updatePromoSlide,
  deletePromoSlide,
} from '../../services/adminService';
import Loader from '../../components/common/Loader';

const EMPTY_FORM = { image: '', title: '', link: '', order: 0, isActive: true };

export default function ManagePromoSlides() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const loadSlides = () => {
    getAllPromoSlidesAdmin()
      .then((res) => setSlides(res.data))
      .catch(() => setError('Could not load promo slides.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadSlides, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (slide) => {
    setEditingId(slide._id);
    setForm({
      image: slide.image,
      title: slide.title || '',
      link: slide.link || '',
      order: slide.order,
      isActive: slide.isActive,
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      image: form.image,
      title: form.title || undefined,
      link: form.link || undefined,
      order: Number(form.order) || 0,
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await updatePromoSlide(editingId, payload);
      } else {
        await createPromoSlide(payload);
      }
      setShowForm(false);
      loadSlides();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save promo slide.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (slide) => {
    setError('');
    setTogglingId(slide._id);
    try {
      const res = await updatePromoSlide(slide._id, { isActive: !slide.isActive });
      setSlides((prev) => prev.map((s) => (s._id === slide._id ? res.data : s)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update promo slide.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (slide) => {
    if (!window.confirm('Delete this promo slide? This cannot be undone.')) return;
    try {
      await deletePromoSlide(slide._id);
      setSlides(slides.filter((s) => s._id !== slide._id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete promo slide.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-xl font-semibold text-neutral-900">Promo slides</h1>
        <button
          onClick={openCreateForm}
          className="h-9 px-4 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800"
        >
          + Add slide
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={() => setShowForm(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-primary-900 px-5 py-4">
              <p className="font-heading text-white font-semibold">
                {editingId ? 'Edit slide' : 'Add slide'}
              </p>
            </div>
            <div className="p-5 space-y-3">
              <input
                name="image"
                placeholder="Image URL"
                required
                value={form.image}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <input
                name="title"
                placeholder="Caption (optional)"
                value={form.title}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <input
                name="link"
                placeholder="Link — /products/abc123 or https://... (optional)"
                value={form.link}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <div>
                <label htmlFor="order" className="block text-xs text-neutral-600 mb-1">
                  Order (lower shows first)
                </label>
                <input
                  id="order"
                  name="order"
                  type="number"
                  value={form.order}
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                Active (shows in the homepage rotation)
              </label>

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

      {slides.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-16">No promo slides yet.</p>
      ) : (
        <div className="bg-white border border-neutral-100 rounded-lg divide-y divide-neutral-100">
          {slides.map((slide) => (
            <div
              key={slide._id}
              className="flex items-center justify-between gap-4 p-4 flex-wrap"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-16 h-10 rounded-lg overflow-hidden bg-neutral-50 shrink-0 flex items-center justify-center">
                  <img src={slide.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {slide.title || <span className="text-neutral-400">No caption</span>}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Order: {slide.order} ·{' '}
                    <span className={slide.isActive ? 'text-primary-600' : 'text-neutral-400'}>
                      {slide.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => openEditForm(slide)}
                  className="h-8 px-3 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(slide)}
                  disabled={togglingId === slide._id}
                  className="h-8 px-3 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
                >
                  {slide.isActive ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDelete(slide)}
                  className="h-8 px-3 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
