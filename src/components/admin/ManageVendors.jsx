import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllVendors, updateVendorStatus } from '../../services/adminService';
import { getOrCreateConversation } from '../../services/chatService';
import Loader from '../../components/common/Loader';

const STATUS_STYLES = {
  pending: 'bg-accent-50 text-accent-600',
  approved: 'bg-primary-50 text-primary-700',
  rejected: 'bg-red-50 text-red-600',
};

const FILTERS = ['all', 'pending', 'approved', 'rejected'];

export default function ManageVendors() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');
  const [actingId, setActingId] = useState(null);

  const loadVendors = () => {
    getAllVendors()
      .then((res) => setVendors(res.data))
      .catch(() => setError('Could not load vendors.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadVendors, []);

  const handleMessage = async (vendor) => {
    if (!vendor.user?._id) return;
    const res = await getOrCreateConversation({ type: 'support', targetUserId: vendor.user._id });
    navigate('/admin/messages', { state: { openConversationId: res.data.id } });
  };

  const handleStatusChange = async (vendorId, status) => {
    setActingId(vendorId);
    try {
      const res = await updateVendorStatus(vendorId, status);
      setVendors(vendors.map((v) => (v._id === vendorId ? res.data : v)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update vendor status.');
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <Loader />;

  const filtered = filter === 'all' ? vendors : vendors.filter((v) => v.status === filter);

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">Vendors</h1>

      <div className="flex gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-8 px-3 rounded-lg text-xs font-medium capitalize ${
              filter === f ? 'bg-primary-900 text-white' : 'bg-white border border-neutral-200 text-neutral-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-16">No vendors in this view.</p>
      ) : (
        <div className="bg-white border border-neutral-100 rounded-lg divide-y divide-neutral-100">
          {filtered.map((vendor) => (
            <div key={vendor._id} className="flex items-center justify-between gap-4 p-4 flex-wrap">
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900">{vendor.storeName}</p>
                <p className="text-xs text-neutral-500">
                  {vendor.user?.name} · {vendor.user?.email}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${STATUS_STYLES[vendor.status]}`}>
                  {vendor.status}
                </span>
                <button
                  onClick={() => handleMessage(vendor)}
                  className="h-8 px-3 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-1"
                >
                  <i className="ti ti-message-circle" />
                  Message
                </button>
                {vendor.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(vendor._id, 'approved')}
                      disabled={actingId === vendor._id}
                      className="h-8 px-3 rounded-lg bg-primary-900 text-white text-xs font-medium hover:bg-primary-800 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(vendor._id, 'rejected')}
                      disabled={actingId === vendor._id}
                      className="h-8 px-3 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
