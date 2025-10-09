import { useState, useEffect, useRef } from 'react';
import {
  LogOut,
  MessageSquare,
  Package,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PendingBookingDot, UnreadMessageDot } from './ui/notification-dot';

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'new' | 'read' | 'replied';
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  pickup: string;
  delivery: string;
  distance: number;
  cost: number;
  status: 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered';
  timestamp: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  // Sound notification toggle and ref to track newest order timestamp
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem('admin_notify_sound');
      return val === null ? true : val === 'true';
    } catch (e) {
      return true;
    }
  });
  const newestOrderTimestampRef = useRef<string | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    fetchMessages();
    fetchOrders();

    // Poll for new orders every 10 seconds
    pollRef.current = window.setInterval(() => {
      fetchOrders();
    }, 10000) as unknown as number;

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('admin_notify_sound', String(isSoundEnabled));
    } catch (e) {
      // ignore
    }
  }, [isSoundEnabled]);

  // Play a phone-like ringtone for the specified duration (ms)
  const playNotificationRingtone = (durationMs = 20000) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Simple ringtone melody pattern (freq in Hz, length in ms)
      const pattern: [number, number][] = [
        [880, 300],
        [740, 300],
        [660, 300],
        [740, 300],
        [880, 600],
        [0, 200],
      ];

      let timePassed = 0;
      const startTime = Date.now();

      const scheduleNextLoop = () => {
        let loopTime = 0;
        for (const [freq, len] of pattern) {
          if (freq > 0) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.value = 0.08;
            osc.connect(gain);
            gain.connect(ctx.destination);

            const t0 = ctx.currentTime + loopTime / 1000;
            osc.start(t0);
            osc.stop(t0 + len / 1000);
          }
          loopTime += len;
        }

        timePassed += loopTime;

        if (Date.now() - startTime + loopTime < durationMs) {
          // schedule another loop slightly after current loopTime
          setTimeout(scheduleNextLoop, loopTime);
        } else {
          // stop and close after remaining time
          setTimeout(() => {
            try { ctx.close(); } catch (e) {}
          }, Math.max(0, durationMs - (Date.now() - startTime)));
        }
      };

      scheduleNextLoop();
    } catch (e) {
      // Fallback: try playing a short embedded silent wav (best-effort)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=');
        audio.loop = true;
        audio.play().catch(() => {});
        setTimeout(() => { audio.pause(); }, durationMs);
      } catch (e2) {}
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setStats(prev => ({
          ...prev,
          totalMessages: data.messages?.length || 0,
          unreadMessages: data.messages?.filter((m: Message) => m.status === 'new').length || 0
        }));
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        const fetchedOrders = data.orders || [];

        // Detect newest order timestamp
        const newestTimestamp = fetchedOrders.reduce((latest: string | null, o: Order) => {
          if (!o.timestamp) return latest;
          if (!latest) return o.timestamp;
          return new Date(o.timestamp) > new Date(latest) ? o.timestamp : latest;
        }, newestOrderTimestampRef.current);

        // If we have a previous timestamp and there's a newer one, play sound
        if (newestOrderTimestampRef.current && newestTimestamp && new Date(newestTimestamp) > new Date(newestOrderTimestampRef.current)) {
          if (isSoundEnabled) playNotificationRingtone(20000);
        }

        // Update the ref to the latest known timestamp
        if (newestTimestamp) newestOrderTimestampRef.current = newestTimestamp;

        setOrders(fetchedOrders);
        const today = new Date().toDateString();
        const todayOrders = fetchedOrders.filter((o: Order) =>
          new Date(o.timestamp).toDateString() === today
        ).length || 0;
        const revenue = fetchedOrders.reduce((sum: number, o: Order) => sum + o.cost, 0) || 0;
        const pending = fetchedOrders.filter((o: Order) => o.status === 'pending').length || 0;

        setStats(prev => ({
          ...prev,
          totalOrders: fetchedOrders.length || 0,
          todayOrders,
          totalRevenue: revenue,
          pendingOrders: pending
        }));
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' })
      });
      fetchMessages();
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-rocs-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">RC</span>
              </div>
              <h1 className="text-2xl font-bold text-rocs-green">Admin Dashboard</h1>
            </div>

            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Sound</span>
                <input
                  type="checkbox"
                  checked={isSoundEnabled}
                  onChange={(e) => setIsSoundEnabled(e.target.checked)}
                  className="toggle-checkbox w-10 h-6 appearance-none bg-gray-200 rounded-full relative cursor-pointer transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:bg-rocs-green"
                />
              </label>

              <Button
                onClick={onLogout}
                variant="outline"
                className="border-rocs-green text-rocs-green hover:bg-rocs-green hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
              <p className="text-xs text-muted-foreground">
                {stats.unreadMessages} unread
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.todayOrders} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="messages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="messages">
              {stats.unreadMessages > 0 ? (
                <UnreadMessageDot>
                  Messages
                </UnreadMessageDot>
              ) : (
                'Messages'
              )}
            </TabsTrigger>
            <TabsTrigger value="orders">
              {stats.pendingOrders > 0 ? (
                <PendingBookingDot>
                  Orders
                </PendingBookingDot>
              ) : (
                'Orders'
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Messages</CardTitle>
                <CardDescription>
                  Messages from the contact form and customer inquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No messages yet</p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-900">{message.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(message.status)}`}>
                              {message.status}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(message.timestamp)}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {message.email}
                            </span>
                            {message.phone && (
                              <span className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {message.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <h5 className="font-medium text-gray-800 mb-2">{message.subject}</h5>
                        <p className="text-gray-700 text-sm mb-3">{message.message}</p>
                        
                        {message.status === 'new' && (
                          <Button
                            size="sm"
                            onClick={() => markMessageAsRead(message.id)}
                            className="bg-rocs-green hover:bg-rocs-green-dark"
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Orders</CardTitle>
                <CardDescription>
                  Manage delivery orders and track their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No orders yet</p>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{order.customerName}</h4>
                            <p className="text-sm text-gray-600">{order.customerPhone}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                            <p className="text-sm text-gray-500 mt-1">{formatDate(order.timestamp)}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Pickup:</p>
                            <p className="text-sm text-gray-600">{order.pickup}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Delivery:</p>
                            <p className="text-sm text-gray-600">{order.delivery}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="text-gray-600">Distance: {order.distance}km</span>
                            <span className="ml-4 font-semibold text-rocs-green">Cost: KES {order.cost}</span>
                          </div>
                          
                          {order.status !== 'delivered' && (
                            <div className="flex space-x-2">
                              {order.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Confirm
                                </Button>
                              )}
                              {order.status === 'confirmed' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'picked_up')}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  Picked Up
                                </Button>
                              )}
                              {order.status === 'picked_up' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'in_transit')}
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  In Transit
                                </Button>
                              )}
                              {order.status === 'in_transit' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Delivered
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
