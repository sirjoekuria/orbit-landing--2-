import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, CheckCircle, MapPin, Clock, LogOut, TrendingUp, Star, RefreshCw, ChevronRight } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../components/ui/button';
import AnimatedPage from '../components/AnimatedPage';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
    picked_up: { label: 'Picked Up', color: 'bg-purple-100 text-purple-700' },
    in_transit: { label: 'In Transit', color: 'bg-indigo-100 text-indigo-700' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
};

const VALID_STATUSES = ['pending', 'confirmed', 'picked_up', 'in_transit', 'delivered'];

export default function RiderDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [earnings, setEarnings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'orders' | 'earnings'>('orders');

    useEffect(() => {
        if (!user) { navigate('/rider-login'); return; }
        if (user.userType !== 'rider') { navigate('/'); return; }
    }, [user, navigate]);

    const loadData = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const [ordersRes, earningsRes] = await Promise.all([
                fetch(`/api/riders/assigned-orders?riderId=${user.id}`),
                fetch(`/api/admin/riders/${user.id}/earnings`),
            ]);
            if (ordersRes.ok) { const d = await ordersRes.json(); setOrders(d.orders || []); }
            if (earningsRes.ok) { const d = await earningsRes.json(); setEarnings(d.earnings || []); }
        } catch (e) {
            console.error('Failed to load rider data:', e);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => { loadData(); }, [loadData]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const csrfRes = await fetch('/api/csrf-token');
            const { token } = await csrfRes.json();
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-csrf-token': token },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, currentStatus: newStatus } : o));
            }
        } catch (e) {
            console.error('Status update failed:', e);
        } finally {
            setUpdatingId(null);
        }
    };

    const getNextStatus = (current: string): string | null => {
        const idx = VALID_STATUSES.indexOf(current);
        return idx >= 0 && idx < VALID_STATUSES.length - 1 ? VALID_STATUSES[idx + 1] : null;
    };

    const activeOrders = orders.filter(o => o.currentStatus !== 'delivered');
    const completedOrders = orders.filter(o => o.currentStatus === 'delivered');
    const totalEarned = earnings.reduce((s: number, e: any) => s + (e.netEarning || e.net_earning || 0), 0);
    const avgRating = completedOrders.reduce((s: number, o: any) => s + (o.riderRating || 0), 0) /
        (completedOrders.filter(o => o.riderRating).length || 1);

    const handleLogout = async () => {
        await logout();
        navigate('/rider-login');
    };

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-rocs-green text-white px-6 py-6">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold">Rider Dashboard</h1>
                            <p className="text-sm opacity-80">{user?.name}</p>
                        </div>
                        <button onClick={handleLogout} className="flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors">
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="max-w-2xl mx-auto px-4 pt-4">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                            { label: 'Active', value: activeOrders.length, color: 'text-blue-600', icon: <Clock className="w-4 h-4" /> },
                            { label: 'Delivered', value: completedOrders.length, color: 'text-green-600', icon: <CheckCircle className="w-4 h-4" /> },
                            { label: 'Earnings', value: `KES ${Math.round(totalEarned).toLocaleString()}`, color: 'text-rocs-green', icon: <TrendingUp className="w-4 h-4" /> },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white rounded-xl p-3 shadow-sm text-center">
                                <div className={`flex justify-center mb-1 ${stat.color}`}>{stat.icon}</div>
                                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                                <p className="text-xs text-gray-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {completedOrders.filter(o => o.riderRating).length > 0 && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-2 mb-4">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm text-amber-800 font-medium">
                                Your avg. rating: {avgRating.toFixed(1)} / 5
                            </span>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
                        {(['orders', 'earnings'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-white shadow-sm text-rocs-green' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab === 'orders' ? `Orders (${orders.length})` : 'Earnings'}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-end mb-3">
                        <button onClick={loadData} className="text-xs text-gray-400 flex items-center gap-1 hover:text-rocs-green">
                            <RefreshCw className="w-3 h-3" /> Refresh
                        </button>
                    </div>

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="space-y-3 pb-8">
                            {isLoading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-xl" />)
                            ) : orders.length === 0 ? (
                                <div className="bg-white rounded-xl p-10 text-center shadow-sm text-gray-400">
                                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p>No orders assigned yet.</p>
                                </div>
                            ) : (
                                [...activeOrders, ...completedOrders].map(order => {
                                    const nextStatus = getNextStatus(order.currentStatus);
                                    const statusMeta = STATUS_LABELS[order.currentStatus] || STATUS_LABELS.pending;
                                    return (
                                        <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-mono font-semibold text-gray-500">{order.id}</span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusMeta.color}`}>
                                                    {statusMeta.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-700 mb-1">
                                                <MapPin className="w-3 h-3 text-rocs-green shrink-0" />
                                                <span className="font-medium truncate">{order.pickup}</span>
                                                <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
                                                <span className="truncate">{order.delivery}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="text-xs text-gray-400">
                                                    {order.customerName} · KES {(order.cost || 0).toLocaleString()}
                                                </div>
                                                {order.riderRating && (
                                                    <div className="flex items-center gap-1 text-xs text-amber-600">
                                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                        {order.riderRating}/5
                                                    </div>
                                                )}
                                            </div>
                                            {nextStatus && order.currentStatus !== 'delivered' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateStatus(order.id, nextStatus)}
                                                    disabled={updatingId === order.id}
                                                    className="mt-3 w-full bg-rocs-green text-white text-xs h-8"
                                                >
                                                    {updatingId === order.id ? 'Updating...' : `Mark as ${STATUS_LABELS[nextStatus]?.label}`}
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Earnings Tab */}
                    {activeTab === 'earnings' && (
                        <div className="space-y-3 pb-8">
                            {isLoading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)
                            ) : earnings.length === 0 ? (
                                <div className="bg-white rounded-xl p-10 text-center shadow-sm text-gray-400">
                                    <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p>No earnings yet.</p>
                                </div>
                            ) : (
                                earnings.map((e: any, i: number) => (
                                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{e.orderId}</p>
                                            <p className="text-xs text-gray-400">{new Date(e.deliveryDate || e.created_at).toLocaleDateString('en-KE')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-rocs-green">KES {(e.netEarning || e.net_earning || 0).toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">of KES {(e.orderAmount || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Withdrawal Link */}
                            <div className="mt-4">
                                <Link to="/rider-withdrawal">
                                    <Button className="w-full bg-rocs-green text-white">Request Withdrawal</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
}
