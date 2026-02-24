import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';
import { Helmet } from 'react-helmet-async';
import { Package, Clock, CheckCircle, MapPin, User, Mail, Phone, Home, LayoutDashboard, ChevronRight, RefreshCw, Star } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../components/ui/button';
import AnimatedPage from '../components/AnimatedPage';
import AddressBook from "../components/AddressBook";

type Order = {
    id: string;
    pickup: string;
    delivery: string;
    distance: number;
    cost: number;
    packageDetails: string;
    paymentMethod: string;
    paymentStatus: string;
    currentStatus: string;
    createdAt: string;
    estimatedDelivery?: string;
    riderName?: string;
    riderPhone?: string;
    riderRating?: number;
};

const STATUS_LABEL: Record<string, { label: string; color: string; icon: JSX.Element }> = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: <Clock className="w-3 h-3" /> },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="w-3 h-3" /> },
    picked_up: { label: 'Picked Up', color: 'bg-purple-100 text-purple-700', icon: <Package className="w-3 h-3" /> },
    in_transit: { label: 'In Transit', color: 'bg-indigo-100 text-indigo-700', icon: <MapPin className="w-3 h-3" /> },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
};

export default function UserDashboard() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'account'>('overview');
    const [ratingModal, setRatingModal] = useState<{ orderId: string; riderName: string } | null>(null);
    const [ratingValue, setRatingValue] = useState(0);
    const [ratingSubmitted, setRatingSubmitted] = useState<Set<string>>(new Set());

    const loadOrders = useCallback(async () => {
        if (!user?.email) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/orders/user/${encodeURIComponent(user.email)}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch (e) {
            console.error('Failed to load orders', e);
        } finally {
            setIsLoading(false);
        }
    }, [user?.email]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const submitRating = async () => {
        if (!ratingModal || ratingValue === 0) return;
        try {
            await fetch(`${API_BASE_URL}/api/orders/${ratingModal.orderId}/rate-rider`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: ratingValue }),
            });
            setRatingSubmitted(prev => new Set([...prev, ratingModal.orderId]));
        } catch (e) {
            console.error('Rating failed', e);
        } finally {
            setRatingModal(null);
            setRatingValue(0);
        }
    };

    const recentOrders = orders.slice(0, 3);
    const totalSpent = orders.reduce((sum, o) => sum + (o.cost || 0), 0);
    const delivered = orders.filter(o => o.currentStatus === 'delivered').length;
    const pending = orders.filter(o => o.currentStatus !== 'delivered').length;

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Please sign in to view your dashboard.</p>
                    <Link to="/login"><Button className="bg-rocs-green text-white">Sign In</Button></Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <Helmet>
                    <title>User Dashboard | Rocs Crew</title>
                </Helmet>
                {/* Header Banner */}
                <div className="bg-rocs-green text-white px-6 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Welcome back, {user.name}!</h1>
                                <p className="text-sm opacity-80">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border-b sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto flex">
                        {[
                            { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
                            { key: 'orders', label: 'My Orders', icon: <Package className="w-4 h-4" /> },
                            { key: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                    ? 'border-rocs-green text-rocs-green'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-6">

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Total Orders', value: orders.length, color: 'text-rocs-green' },
                                    { label: 'Delivered', value: delivered, color: 'text-green-600' },
                                    { label: 'Active', value: pending, color: 'text-amber-600' },
                                ].map(stat => (
                                    <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 text-center">
                                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                        <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Total Spent */}
                            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Spent</p>
                                    <p className="text-2xl font-bold text-rocs-green">KES {totalSpent.toLocaleString()}</p>
                                </div>
                                <Package className="w-8 h-8 text-rocs-green/30" />
                            </div>

                            {/* Recent Orders */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="font-semibold text-gray-800">Recent Orders</h2>
                                    <button onClick={() => setActiveTab('orders')} className="text-xs text-rocs-green flex items-center gap-1">
                                        View all <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                                {isLoading ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />)}
                                    </div>
                                ) : recentOrders.length === 0 ? (
                                    <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm">
                                        <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p>No orders yet.</p>
                                        <Link to="/book-delivery"><Button className="mt-3 bg-rocs-green text-white text-sm">Book a Delivery</Button></Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {recentOrders.map(order => (
                                            <OrderCard key={order.id} order={order} onRate={setRatingModal} ratingSubmitted={ratingSubmitted} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <Link to="/book-delivery">
                                    <div className="bg-rocs-green text-white rounded-xl p-4 flex items-center gap-3 hover:bg-rocs-green-dark transition-colors">
                                        <Package className="w-5 h-5" />
                                        <span className="font-medium text-sm">Book Delivery</span>
                                    </div>
                                </Link>
                                <Link to="/tracking">
                                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                                        <MapPin className="w-5 h-5 text-rocs-green" />
                                        <span className="font-medium text-sm text-gray-700">Track Order</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-gray-800">All Orders ({orders.length})</h2>
                                <button onClick={loadOrders} className="text-xs text-gray-500 flex items-center gap-1 hover:text-rocs-green">
                                    <RefreshCw className="w-3 h-3" /> Refresh
                                </button>
                            </div>
                            {isLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />)}
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="bg-white rounded-xl p-10 text-center text-gray-500 shadow-sm">
                                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No orders found</p>
                                    <p className="text-sm mt-1">Your past deliveries will appear here.</p>
                                    <Link to="/book-delivery"><Button className="mt-4 bg-rocs-green text-white">Book Your First Delivery</Button></Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orders.map(order => (
                                        <OrderCard key={order.id} order={order} expanded onRate={setRatingModal} ratingSubmitted={ratingSubmitted} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Account Tab */}
                    {activeTab === 'account' && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="font-semibold text-gray-800 mb-4">Profile Information</h2>
                                <div className="space-y-3">
                                    {[
                                        { icon: <User className="w-4 h-4" />, label: 'Name', value: user.name || '—' },
                                        { icon: <Mail className="w-4 h-4" />, label: 'Email', value: user.email },
                                        { icon: <Phone className="w-4 h-4" />, label: 'Phone', value: user.phone || '—' },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-rocs-green">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">{item.label}</p>
                                                <p className="text-sm font-medium text-gray-800">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="font-semibold text-gray-800 mb-3">Quick Links</h2>
                                <div className="space-y-2">
                                    {[
                                        { to: '/', icon: <Home className="w-4 h-4" />, label: 'Home' },
                                        { to: '/book-delivery', icon: <Package className="w-4 h-4" />, label: 'Book a Delivery' },
                                        { to: '/tracking', icon: <MapPin className="w-4 h-4" />, label: 'Track an Order' },
                                    ].map(link => (
                                        <Link key={link.to} to={link.to} className="flex items-center gap-2 text-sm text-gray-700 hover:text-rocs-green py-2 border-b border-gray-50 last:border-0">
                                            <span className="text-rocs-green">{link.icon}</span> {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Saved Addresses Section */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="font-semibold text-gray-800 mb-3">Saved Addresses</h2>
                                <AddressBook />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Rating Modal */}
            {
                ratingModal && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                            <h3 className="text-lg font-bold text-gray-800 text-center mb-1">Rate Your Rider</h3>
                            <p className="text-sm text-gray-500 text-center mb-4">{ratingModal.riderName}</p>
                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setRatingValue(star)}
                                        className={`text-3xl transition-transform ${ratingValue >= star ? 'scale-110' : 'opacity-30'}`}
                                    >
                                        <Star className={`w-8 h-8 ${ratingValue >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => setRatingModal(null)}>Skip</Button>
                                <Button className="flex-1 bg-rocs-green text-white" onClick={submitRating} disabled={ratingValue === 0}>
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}

function OrderCard({
    order,
    expanded = false,
    onRate,
    ratingSubmitted,
}: {
    order: Order;
    expanded?: boolean;
    onRate: (args: { orderId: string; riderName: string }) => void;
    ratingSubmitted: Set<string>;
}) {
    const status = STATUS_LABEL[order.currentStatus] || STATUS_LABEL.pending;
    const canRate = order.currentStatus === 'delivered' && order.riderName && !ratingSubmitted.has(order.id);

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-semibold text-gray-600">{order.id}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.icon} {status.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-800 truncate">{order.pickup} → {order.delivery}</p>
                    {expanded && (
                        <p className="text-xs text-gray-400 mt-1">{order.packageDetails}</p>
                    )}
                </div>
                <div className="text-right shrink-0">
                    <p className="font-bold text-rocs-green text-sm">KES {order.cost?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-KE')}</p>
                </div>
            </div>

            {expanded && order.riderName && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Rider: <span className="text-gray-700 font-medium">{order.riderName}</span></span>
                </div>
            )}

            {canRate && (
                <button
                    onClick={() => onRate({ orderId: order.id, riderName: order.riderName! })}
                    className="mt-3 w-full text-xs text-amber-600 border border-amber-200 rounded-lg py-1.5 flex items-center justify-center gap-1 hover:bg-amber-50 transition-colors"
                >
                    <Star className="w-3 h-3" /> Rate your rider
                </button>
            )}

            {order.currentStatus !== 'delivered' && (
                <Link to="/tracking" state={{ trackingId: order.id }} className="block mt-2">
                    <button className="w-full text-xs text-rocs-green border border-rocs-green/30 rounded-lg py-1.5 flex items-center justify-center gap-1 hover:bg-green-50 transition-colors">
                        <MapPin className="w-3 h-3" /> View Tracking
                    </button>
                </Link>
            )}
        </div>
    );
}
