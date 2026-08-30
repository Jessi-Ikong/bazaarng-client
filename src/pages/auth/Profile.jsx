import { useEffect, useState } from 'react';
import { getMe, updateMyProfile } from '../../services/userService';
import { getMyVendorProfile, updateMyVendorProfile } from '../../services/vendorService';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';

const STATUS_STYLES = {
  pending: 'bg-accent-50 text-accent-600',
  approved: 'bg-primary-50 text-primary-700',
  rejected: 'bg-red-50 text-red-600',
};

export default function Profile() {
  const { user: authUser } = useAuth();
  const [account, setAccount] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [accountForm, setAccountForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: '',
  });
  const [storeForm, setStoreForm] = useState({ storeName: '', storeDescription: '' });

  useEffect(() => {
    getMe()
      .then((res) => {
        const u = res.data;
        setAccount(u);
        setAccountForm({
          name: u.name || '',
          phone: u.phone || '',
          street: u.shippingAddress?.street || '',
          city: u.shippingAddress?.city || '',
          state: u.shippingAddress?.state || '',
          country: u.shippingAddress?.country || '',
        });
      })
      .catch(() => setError('Could not load your profile.'))
      .finally(() => setLoading(false));

    if (authUser?.role === 'vendor') {
      getMyVendorProfile()
        .then((res) => {
          setVendorProfile(res.data);
          setStoreForm({
            storeName: res.data.storeName || '',
            storeDescription: res.data.storeDescription || '',
          });
        })
        .catch(() => {});
    }
  }, [authUser?.role]);

  const handleAccountChange = (e) => setAccountForm({ ...accountForm, [e.target.name]: e.target.value });
  const handleStoreChange = (e) => setStoreForm({ ...storeForm, [e.target.name]: e.target.value });

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await updateMyProfile({
        name: accountForm.name,
        phone: accountForm.phone,
        shippingAddress: {
          street: accountForm.street,
          city: accountForm.city,
          state: accountForm.state,
          country: accountForm.country,
        },
      });
      setAccount(res.data);
      setSuccess('Profile updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await updateMyVendorProfile(storeForm);
      setVendorProfile(res.data);
      setSuccess('Store info updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update store info.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">Profile</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {success && <p className="text-sm text-primary-700 mb-4">{success}</p>}

      {/* Account info — every role */}
      <form onSubmit={handleSaveAccount} className="bg-white border border-neutral-100 rounded-lg p-5 space-y-3 mb-6">
        <div className="flex items-center justify-between mb-1">
          <p className="font-heading font-semibold text-neutral-900">Account</p>
          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 capitalize">
            {account?.role}
          </span>
        </div>

        <p className="text-xs text-neutral-500">{account?.email} (email can't be changed)</p>

        <div>
          <label className="block text-xs text-neutral-600 mb-1">Full name</label>
          <input
            name="name"
            value={accountForm.name}
            onChange={handleAccountChange}
            className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-600 mb-1">Phone</label>
          <input
            name="phone"
            value={accountForm.phone}
            onChange={handleAccountChange}
            className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        {account?.role === 'customer' && (
          <>
            <p className="text-xs text-neutral-600 pt-2">Default shipping address</p>
            <input
              name="street"
              placeholder="Street"
              value={accountForm.street}
              onChange={handleAccountChange}
              className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                name="city"
                placeholder="City"
                value={accountForm.city}
                onChange={handleAccountChange}
                className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <input
                name="state"
                placeholder="State"
                value={accountForm.state}
                onChange={handleAccountChange}
                className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving}
            className="h-9 px-4 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>

      {/* Store info — vendors only */}
      {account?.role === 'vendor' && vendorProfile && (
        <form onSubmit={handleSaveStore} className="bg-white border border-neutral-100 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="font-heading font-semibold text-neutral-900">Store</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${STATUS_STYLES[vendorProfile.status]}`}>
              {vendorProfile.status}
            </span>
          </div>

          <div>
            <label className="block text-xs text-neutral-600 mb-1">Store name</label>
            <input
              name="storeName"
              value={storeForm.storeName}
              onChange={handleStoreChange}
              className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Store description</label>
            <textarea
              name="storeDescription"
              rows={3}
              value={storeForm.storeDescription}
              onChange={handleStoreChange}
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-4 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save store info'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
