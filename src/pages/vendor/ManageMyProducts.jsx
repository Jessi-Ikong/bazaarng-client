import { useEffect, useState } from "react";
import {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getCategories,
} from "../../services/productService";
import { getImageUrl } from "../../utils/getImageUrl";
import Loader from "../../components/common/Loader";

function formatNaira(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  images: [], // array of uploaded image paths, not a comma string
  offersEnabled: true,
  options: [], // e.g. [{ name: 'Size', values: ['S','M','L'] }]
  variantPrices: {}, // { comboKey: 'price string' } — sparse, blank means "use base price"
};

// Canonical string key for an option combination, e.g. { Size: 'L', Color: 'Red' }
// -> "Color:Red|Size:L" — sorted so key order never affects matching.
function comboKey(combination) {
  return Object.keys(combination)
    .sort()
    .map((k) => `${k}:${combination[k]}`)
    .join("|");
}

// Cartesian product of every option group's values, e.g.
// [{name:'Size',values:['S','M']},{name:'Color',values:['Red']}] ->
// [{Size:'S',Color:'Red'}, {Size:'M',Color:'Red'}]
function getCombinations(groups) {
  if (groups.length === 0) return [];
  return groups.reduce(
    (acc, group) => acc.flatMap((combo) => group.values.map((v) => ({ ...combo, [group.name]: v }))),
    [{}],
  );
}

export default function ManageMyProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([getMyProducts(), getCategories()])
      .then(([productsRes, categoriesRes]) => {
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      })
      .catch(() => setError("Could not load your products."))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    const variantPrices = {};
    (product.variantPrices || []).forEach((vp) => {
      variantPrices[comboKey(vp.combination)] = String(vp.price);
    });

    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category?._id || product.category,
      stock: product.stock,
      images: product.images || [],
      offersEnabled: product.offersEnabled,
      options: (product.options || []).map((g) => ({
        name: g.name,
        values: g.values.join(", "),
      })),
      variantPrices,
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError("");
    setUploading(true);
    try {
      // Upload sequentially — simple and fine for the handful of images
      // a product listing realistically needs.
      const uploadedPaths = [];
      for (const file of files) {
        const res = await uploadProductImage(file);
        uploadedPaths.push(res.data.url);
      }
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedPaths],
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = ""; // allow re-selecting the same file if needed
    }
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      setError("Image URL must start with http:// or https://");
      return;
    }
    setError("");
    setForm((prev) => ({ ...prev, images: [...prev.images, trimmed] }));
    setUrlInput("");
  };

  const handleAddOptionGroup = () => {
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { name: "", values: "" }],
    }));
  };

  const handleOptionGroupChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((g, i) =>
        i === index ? { ...g, [field]: value } : g,
      ),
    }));
  };

  const handleRemoveOptionGroup = (index) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Each option group's "values" is edited as a comma-separated string in
    // the UI, but the backend wants a real array — convert here.
    const cleanedOptions = form.options
      .map((g) => ({
        name: g.name.trim(),
        values: (typeof g.values === "string" ? g.values.split(",") : g.values)
          .map((v) => v.trim())
          .filter(Boolean),
      }))
      .filter((g) => g.name && g.values.length > 0);

    // Only combinations that still exist under the final cleaned option
    // groups get a variant price — one left blank (or belonging to a
    // group/value the vendor since removed) just uses the base price.
    const finalCombinations = getCombinations(cleanedOptions);
    const cleanedVariantPrices = finalCombinations
      .map((combination) => {
        const priceStr = form.variantPrices[comboKey(combination)];
        if (!priceStr) return null;
        const price = Number(priceStr);
        return price > 0 ? { combination, price } : null;
      })
      .filter(Boolean);

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
      offersEnabled: form.offersEnabled,
      images: form.images,
      options: cleanedOptions,
      variantPrices: cleanedVariantPrices,
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await deleteProduct(productId);
      setProducts(products.filter((p) => p._id !== productId));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete product.");
    }
  };

  // Live-parsed from the comma-separated values as the vendor types, so the
  // variant price rows below update immediately — not just after saving.
  const liveOptionGroups = form.options
    .map((g) => ({
      name: g.name.trim(),
      values: (typeof g.values === "string" ? g.values.split(",") : g.values)
        .map((v) => v.trim())
        .filter(Boolean),
    }))
    .filter((g) => g.name && g.values.length > 0);
  const liveCombinations = getCombinations(liveOptionGroups);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-xl font-semibold text-neutral-900">
          My products
        </h1>
        <button
          onClick={openCreateForm}
          className="h-9 px-4 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800"
        >
          + Add product
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
                {editingId ? "Edit product" : "Add product"}
              </p>
            </div>
            <div className="p-5 space-y-3">
              <input
                name="name"
                placeholder="Product name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <textarea
                name="description"
                placeholder="Description"
                required
                rows={3}
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="price"
                  type="number"
                  placeholder="Price (₦)"
                  required
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                <input
                  name="stock"
                  type="number"
                  placeholder="Stock"
                  required
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <select
                name="category"
                required
                value={form.category}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div>
                <p className="text-xs text-neutral-600 mb-2">Product images</p>
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-100"
                      >
                        <img
                          src={getImageUrl(img)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-0 right-0 w-5 h-5 bg-black/60 text-white text-xs flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="block w-full h-10 rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-500 flex items-center justify-center cursor-pointer hover:bg-neutral-50">
                  {uploading ? "Uploading..." : "+ Upload image(s)"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-px bg-neutral-100" />
                  <span className="text-[10px] text-neutral-400 uppercase">
                    or
                  </span>
                  <div className="flex-1 h-px bg-neutral-100" />
                </div>

                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Paste an image URL"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddUrl();
                      }
                    }}
                    className="flex-1 h-9 rounded-lg border border-neutral-100 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="h-9 px-3 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-neutral-600">
                    Options{" "}
                    <span className="text-neutral-400">
                      (e.g. Size, Color — optional)
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={handleAddOptionGroup}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    + Add option
                  </button>
                </div>
                {form.options.map((group, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      placeholder="Name (e.g. Size)"
                      value={group.name}
                      onChange={(e) =>
                        handleOptionGroupChange(i, "name", e.target.value)
                      }
                      className="w-28 h-9 rounded-lg border border-neutral-100 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                    <input
                      placeholder="Values, comma-separated (e.g. S, M, L, XL)"
                      value={group.values}
                      onChange={(e) =>
                        handleOptionGroupChange(i, "values", e.target.value)
                      }
                      className="flex-1 h-9 rounded-lg border border-neutral-100 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionGroup(i)}
                      className="text-red-500 hover:text-red-700 shrink-0"
                    >
                      <i className="ti ti-x" />
                    </button>
                  </div>
                ))}
              </div>

              {liveCombinations.length > 0 && (
                <div>
                  <p className="text-xs text-neutral-600 mb-1.5">
                    Variant prices{" "}
                    <span className="text-neutral-400">
                      (optional — blank uses the base price)
                    </span>
                  </p>
                  <div className="space-y-1.5">
                    {liveCombinations.map((combo) => {
                      const key = comboKey(combo);
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-neutral-600 flex-1 truncate">
                            {Object.entries(combo)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(", ")}
                          </span>
                          <input
                            type="number"
                            min="0"
                            placeholder="Base price"
                            value={form.variantPrices[key] || ""}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                variantPrices: {
                                  ...prev.variantPrices,
                                  [key]: e.target.value,
                                },
                              }))
                            }
                            className="w-28 h-8 rounded-lg border border-neutral-100 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  name="offersEnabled"
                  checked={form.offersEnabled}
                  onChange={handleChange}
                />
                Allow buyers to make offers on this product
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
                  disabled={submitting || uploading}
                  className="h-9 px-4 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save product"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-16">
          You haven't listed any products yet.
        </p>
      ) : (
        <div className="bg-white border border-neutral-100 rounded-lg divide-y divide-neutral-100">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex items-center justify-between gap-4 p-4 flex-wrap"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-50 shrink-0 flex items-center justify-center">
                  {product.images?.[0] ? (
                    <img
                      src={getImageUrl(product.images[0])}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-neutral-300 text-[8px]">No img</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatNaira(product.price)} · Stock: {product.stock} ·{" "}
                    {product.status}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => openEditForm(product)}
                  className="h-8 px-3 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
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
