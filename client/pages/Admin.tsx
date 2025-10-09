import { useState, useEffect } from "react";
import {
  PendingBookingDot,
  UnreadMessageDot,
} from "../components/ui/notification-dot";
import {
  Users,
  Package,
  MessageSquare,
  TrendingUp,
  LogOut,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Bike,
  UserCheck,
  UserX,
  Star,
  Handshake,
  Building2,
  DollarSign,
  CreditCard,
  Download,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  Settings,
  Activity,
} from "lucide-react";

const ADMIN_PASSWORD = "Admin432";

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  timestamp: string;
  status: "new" | "read" | "replied";
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickup: string;
  delivery: string;
  distance: number;
  cost: number;
  status:
    | "pending"
    | "confirmed"
    | "picked_up"
    | "in_transit"
    | "delivered"
    | "cancelled";
  timestamp: string;
  riderName?: string;
  riderPhone?: string;
  notes?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  status: "active" | "inactive";
}

const sampleMessages: Message[] = [];

const sampleOrders: Order[] = [];

const sampleUsers: User[] = [];

export default function Admin() {
  const [activities, setActivities] = useState<any[]>([]);
  const [activityStats, setActivityStats] = useState<any>(null);

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/admin/rider-activities');
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
      const sres = await fetch('/api/admin/rider-activities/stats');
      if (sres.ok) {
        const sdata = await sres.json();
        setActivityStats(sdata || null);
      }
    } catch (e) {
      console.error('Failed to load activities/stats', e);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "orders"
    | "messages"
    | "users"
    | "riders"
    | "rider-earnings"
    | "partnerships"
  >("overview");

  // Data states
  const [messages, setMessages] = useState<Message[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [riders, setRiders] = useState<any[]>([]);
  const [availableRiders, setAvailableRiders] = useState<any[]>([]);
  const [partnershipRequests, setPartnershipRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newActivity, setNewActivity] = useState({ riderId: '', riderName: '', type: 'order_assigned', orderId: '', description: '', amount: 0 });

  // Rider earnings state
  const [riderEarnings, setRiderEarnings] = useState<any[]>([]);
  const [selectedRiderForEarnings, setSelectedRiderForEarnings] = useState<
    string | null
  >(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("mpesa");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [assigningRider, setAssigningRider] = useState<string | null>(null);

  // UI states
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{
    [key: string]: boolean;
  }>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid password");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
  };

  // Fetch data from API
  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const formattedOrders = data.orders.map((order: any) => ({
            id: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            pickup: order.pickup,
            delivery: order.delivery,
            distance: order.distance,
            cost: order.cost,
            status: order.currentStatus,
            timestamp: order.createdAt,
            riderName: order.riderName,
            riderPhone: order.riderPhone,
            notes: order.notes,
          }));
          setOrders(formattedOrders);
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/admin/messages");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Fallback to sample data
      setMessages(sampleMessages);
    }
  };

  const fetchRiders = async () => {
    try {
      const response = await fetch("/api/admin/riders");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRiders(data.riders);
        }
      }
    } catch (error) {
      console.error("Error fetching riders:", error);
    }
  };

  const fetchAvailableRiders = async () => {
    try {
      const response = await fetch("/api/riders/available");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailableRiders(data.riders);
        }
      }
    } catch (error) {
      console.error("Error fetching available riders:", error);
    }
  };

  const fetchPartnershipRequests = async () => {
    try {
      const response = await fetch("/api/admin/partnership-requests");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPartnershipRequests(data.requests);
        }
      }
    } catch (error) {
      console.error("Error fetching partnership requests:", error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchOrders(),
      fetchMessages(),
      fetchRiders(),
      fetchAvailableRiders(),
      fetchPartnershipRequests(),
    ]);
    setIsLoading(false);
  };

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Auto-refresh every 30 seconds when on orders or rider-earnings tab
  useEffect(() => {
    if (
      isAuthenticated &&
      (activeTab === "orders" || activeTab === "rider-earnings")
    ) {
      const interval = setInterval(() => {
        if (activeTab === "orders") {
          fetchOrders();
        } else if (activeTab === "rider-earnings") {
          fetchRiders();
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, activeTab]);

  // Rider management functions
  const updateRiderStatus = async (
    riderId: string,
    status: "approved" | "rejected",
  ) => {
    try {
      const response = await fetch(`/api/admin/riders/${riderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchRiders();
      } else {
        alert("Failed to update rider status");
      }
    } catch (error) {
      console.error("Error updating rider status:", error);
      alert("Error updating rider status");
    }
  };

  const toggleRiderActive = async (riderId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/riders/${riderId}/active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        await fetchRiders();
      } else {
        alert("Failed to update rider status");
      }
    } catch (error) {
      console.error("Error updating rider status:", error);
      alert("Error updating rider status");
    }
  };

  const deleteRider = async (riderId: string) => {
    if (!confirm("Are you sure you want to delete this rider?")) return;

    try {
      const response = await fetch(`/api/admin/riders/${riderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchRiders();
      } else {
        alert("Failed to delete rider");
      }
    } catch (error) {
      console.error("Error deleting rider:", error);
      alert("Error deleting rider");
    }
  };

  const assignRiderToOrder = async (orderId: string, riderId: string) => {
    try {
      const selectedRider = availableRiders.find((r) => r.id === riderId);
      if (!selectedRider) {
        alert("Selected rider not found");
        return;
      }

      const response = await fetch(
        `/api/admin/orders/${orderId}/assign-rider`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            riderId: selectedRider.id,
            riderName: selectedRider.fullName,
            riderPhone: selectedRider.phone,
          }),
        },
      );

      if (response.ok) {
        await fetchOrders();
        setAssigningRider(null);
      } else {
        alert("Failed to assign rider");
      }
    } catch (error) {
      console.error("Error assigning rider:", error);
      alert("Error assigning rider");
    }
  };

  // Rider earnings management functions
  const fetchRiderEarnings = async (riderId: string) => {
    try {
      const response = await fetch(`/api/admin/riders/${riderId}/earnings`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error("Error fetching rider earnings:", error);
    }
    return null;
  };

  const processRiderPayment = async (riderId: string) => {
    try {
      const response = await fetch(
        `/api/admin/riders/${riderId}/process-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: parseFloat(paymentAmount),
            paymentMethod,
            notes: paymentNotes,
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        alert(
          `✅ Payment Processed Successfully!\n\nAmount: KES ${parseFloat(paymentAmount).toLocaleString()}\nNew Balance: KES ${result.newBalance.toLocaleString()}\nPayment ID: ${result.paymentId}`,
        );

        // Reset form
        setPaymentAmount("");
        setPaymentNotes("");
        setSelectedRiderForEarnings(null);

        // Refresh data
        await fetchRiders();
      } else {
        const error = await response.json();
        alert(`❌ Payment Failed:\n${error.error}`);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("❌ Error processing payment. Please try again.");
    }
  };

  // Partnership management functions
  const updatePartnershipRequestStatus = async (
    requestId: string,
    status: "approved" | "rejected",
  ) => {
    try {
      const response = await fetch(
        `/api/admin/partnership-requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      if (response.ok) {
        await fetchPartnershipRequests();
      } else {
        alert("Failed to update partnership request status");
      }
    } catch (error) {
      console.error("Error updating partnership request status:", error);
      alert("Error updating partnership request status");
    }
  };

  const deletePartnershipRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to delete this partnership request?"))
      return;

    try {
      const response = await fetch(
        `/api/admin/partnership-requests/${requestId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        await fetchPartnershipRequests();
      } else {
        alert("Failed to delete partnership request");
      }
    } catch (error) {
      console.error("Error deleting partnership request:", error);
      alert("Error deleting partnership request");
    }
  };

  // Payment confirmation function
  const confirmPaymentAndSendReceipt = async (orderId: string) => {
    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/confirm-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      // Check if response is ok first, then parse JSON
      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          const order = orders.find((o) => o.id === orderId);
          alert(
            `✅ Payment Confirmed Successfully!\n\n📧 Receipt sent to: ${order?.customerEmail}\n�� Order ID: ${orderId}\n\nCustomer has been notified via email with their receipt.`,
          );

          // Refresh orders to get latest data
          await fetchOrders();
        } else {
          alert(
            `❌ Payment confirmation failed:\n${result.error || "Unknown error"}\n\nPlease try again or contact support.`,
          );
        }
      } else {
        // Handle error response
        const errorResult = await response
          .json()
          .catch(() => ({ error: "Unknown server error" }));
        alert(
          `❌ Payment confirmation failed:\n${errorResult.error || "Server error"}\n\nPlease try again or contact support.`,
        );
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert(
        "❌ Error confirming payment. Please check your connection and try again.",
      );
    }
  };

  // Resend receipt function
  const resendReceipt = async (orderId: string) => {
    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/resend-receipt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      // Check if response is ok first, then parse JSON
      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          alert(
            `✅ Receipt Resent Successfully!\n\n📧 Email sent to: ${result.customerEmail}\n📋 Order ID: ${orderId}\n\nThe customer will receive their receipt shortly.`,
          );
        } else {
          alert(
            `❌ Failed to resend receipt:\n${result.error || "Unknown error"}\n\nPlease try again or check email settings.`,
          );
        }
      } else {
        // Handle error response
        const errorResult = await response
          .json()
          .catch(() => ({ error: "Unknown server error" }));
        alert(
          `❌ Failed to resend receipt:\n${errorResult.error || "Server error"}\n\nPlease try again or check email settings.`,
        );
      }
    } catch (error) {
      console.error("Error resending receipt:", error);
      alert(
        "❌ Error resending receipt. Please check your connection and try again.",
      );
    }
  };

  // Order management functions
  const updateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"],
  ) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const result = await response.json();

        // Update local state
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order,
          ),
        );

        // Show success message with email confirmation
        if (newStatus === "confirmed" && result.emailSent) {
          const order = orders.find((o) => o.id === orderId);
          alert(
            `✅ Order confirmed successfully!\n📧 Receipt email sent to: ${order?.customerEmail}\n\nCustomer will receive their delivery confirmation and receipt.`,
          );
        }

        // Refresh orders to get latest data
        await fetchOrders();
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status");
    }
  };

  const assignRider = (
    orderId: string,
    riderName: string,
    riderPhone: string,
  ) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? { ...order, riderName, riderPhone, status: "confirmed" }
          : order,
      ),
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders(orders.filter((order) => order.id !== orderId));
  };

  // Message management functions
  const handleReply = (messageId: string) => {
    setReplyingTo(messageId);
    setReplyText("");
  };

  const sendReply = (messageId: string) => {
    setMessages(
      messages.map((msg) =>
        msg.id === messageId ? { ...msg, status: "replied" as const } : msg,
      ),
    );
    setReplyingTo(null);
    setReplyText("");
    alert("Reply sent successfully!");
  };

  const markAsRead = (messageId: string) => {
    setMessages(
      messages.map((msg) =>
        msg.id === messageId ? { ...msg, status: "read" as const } : msg,
      ),
    );
  };

  const deleteMessage = (messageId: string) => {
    setMessages(messages.filter((msg) => msg.id !== messageId));
  };

  // User management functions
  const toggleUserStatus = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "active" ? "inactive" : "active",
            }
          : user,
      ),
    );
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-KE");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "read":
        return "bg-gray-100 text-gray-800";
      case "replied":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "picked_up":
        return "bg-purple-100 text-purple-800";
      case "in_transit":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    totalMessages: messages.length,
    unreadMessages: messages.filter((m) => m.status === "new").length,
    totalRevenue: orders.reduce((sum, order) => sum + order.cost, 0),
  };

  // Filter functions
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMessages = messages.filter(
    (message) =>
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-rocs-green rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">🔒</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-rocs-green">
              Admin Dashboard
            </h2>
            <p className="mt-2 text-gray-600">
              Enter your password to access the admin panel
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-lg rounded-xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rocs-green"
                  placeholder="Enter admin password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-rocs-green hover:bg-rocs-green-dark text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Access Dashboard
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Authorized personnel only. All access attempts are logged.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-rocs-green">
                Admin Dashboard
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-rocs-green rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">RC</span>
            </div>
            <h2 className="text-lg font-semibold text-rocs-green">
              Admin Panel
            </h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {/* Overview */}
          <button
            onClick={() => {
              setActiveTab("overview");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors mb-1 ${
              activeTab === "overview"
                ? "bg-rocs-green text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Dashboard Overview</span>
          </button>

          {/* Operations Menu */}
          <div className="mb-2">
            <button
              onClick={() =>
                setExpandedMenus((prev) => ({
                  ...prev,
                  operations: !prev.operations,
                }))
              }
              className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5" />
                <span className="font-medium">Operations</span>
              </div>
              {expandedMenus.operations ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {expandedMenus.operations && (
              <div className="ml-6 mt-1 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("orders");
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "orders"
                      ? "bg-rocs-green text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {stats.pendingOrders > 0 ? (
                    <PendingBookingDot>Orders Management</PendingBookingDot>
                  ) : (
                    "Orders Management"
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("messages");
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "messages"
                      ? "bg-rocs-green text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {stats.unreadMessages > 0 ? (
                    <UnreadMessageDot>Customer Messages</UnreadMessageDot>
                  ) : (
                    "Customer Messages"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* People Management Menu */}
          <div className="mb-2">
            <button
              onClick={() =>
                setExpandedMenus((prev) => ({ ...prev, people: !prev.people }))
              }
              className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <span className="font-medium">People</span>
              </div>
              {expandedMenus.people ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {expandedMenus.people && (
              <div className="ml-6 mt-1 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("users");
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "users"
                      ? "bg-rocs-green text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Customer Users
                </button>
                <button
                  onClick={() => {
                    setActiveTab("riders");
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "riders"
                      ? "bg-rocs-green text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Rider Management
                </button>
                <button
                  onClick={() => {
                    setActiveTab("partnerships");
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "partnerships"
                      ? "bg-rocs-green text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Business Partners
                </button>
              </div>
            )}
          </div>

          {/* Financial Menu */}
          <div className="mb-2">
            <button
              onClick={() =>
                setExpandedMenus((prev) => ({
                  ...prev,
                  financial: !prev.financial,
                }))
              }
              className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Financial</span>
              </div>
              {expandedMenus.financial ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {expandedMenus.financial && (
              <div className="ml-6 mt-1 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("rider-earnings");
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "rider-earnings"
                      ? "bg-rocs-green text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Rider Earnings
                </button>
                <button
                  onClick={() => {
                    setActiveTab("rider-activity");
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "rider-activity"
                      ? "bg-rocs-green text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Rider Activity Log
                </button>
                <button
                  onClick={() => {
                    setActiveTab("withdrawal-requests");
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "withdrawal-requests"
                      ? "bg-rocs-green text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Withdrawal Requests
                </button>
                <button
                  onClick={() => {
                    setActiveTab("automated-payments");
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "automated-payments"
                      ? "bg-rocs-green text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Automated Payments
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Logout Button - moved to bottom area within sidebar */}
        <div className="px-3 pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-rocs-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">RC</span>
              </div>
              <h1 className="text-lg font-bold text-rocs-green">
                Admin Dashboard
              </h1>
            </div>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-rocs-green capitalize">
                {activeTab === "rider-earnings"
                  ? "Rider Earnings"
                  : activeTab === "rider-activity"
                    ? "Rider Activity Log"
                    : activeTab === "withdrawal-requests"
                      ? "Withdrawal Requests"
                      : activeTab === "automated-payments"
                        ? "Automated Payments"
                        : activeTab.replace("-", " ")}
              </h1>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Users
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalUsers}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Package className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Orders
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalOrders}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <MessageSquare className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          New Messages
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.unreadMessages}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Revenue
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          KES {stats.totalRevenue.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Recent Orders
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {order.id}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.customerName}
                            </p>
                            <p className="text-xs text-gray-400">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {formatDate(order.timestamp)}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Recent Messages
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {messages.slice(0, 3).map((message) => (
                        <div
                          key={message.id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {message.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {message.subject}
                            </p>
                            <p className="text-xs text-gray-400">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {formatDate(message.timestamp)}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(message.status)}`}
                          >
                            {message.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order Management
                  </h2>
                  <button
                    onClick={async () => { setIsLoading(true); try { await fetchOrders(); } finally { setIsLoading(false); } }}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-rocs-green hover:bg-rocs-green-dark text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    )}
                    <span>
                      {isLoading ? "Refreshing..." : "Refresh Orders"}
                    </span>
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-rocs-green"
                      />
                    </div>
                  </div>
                  <div className="sm:w-48">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-rocs-green"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow border border-gray-200 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.id}
                        </h3>
                        <p className="text-gray-600">
                          {order.customerName} • {order.customerPhone}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Created: {formatDate(order.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                        <button
                          onClick={() =>
                            setEditingOrder(
                              editingOrder === order.id ? null : order.id,
                            )
                          }
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="p-2 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Pickup
                        </p>
                        <p className="text-sm text-gray-900">{order.pickup}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Delivery
                        </p>
                        <p className="text-sm text-gray-900">
                          {order.delivery}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Cost
                        </p>
                        <p className="text-sm text-gray-900">
                          KES {order.cost} ({order.distance}km)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Status Updated
                        </p>
                        <p className="text-sm text-gray-900">
                          {order.updatedAt
                            ? formatDate(order.updatedAt)
                            : "Not updated"}
                        </p>
                      </div>
                    </div>

                    {order.riderName && (
                      <div className="mb-4 p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium text-gray-600">
                          Assigned Rider
                        </p>
                        <p className="text-sm text-gray-900">
                          {order.riderName} ���� {order.riderPhone}
                        </p>
                      </div>
                    )}

                    {order.notes && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded">
                        <p className="text-sm font-medium text-yellow-800">
                          Notes
                        </p>
                        <p className="text-sm text-yellow-700">{order.notes}</p>
                      </div>
                    )}

                    {/* Order Actions */}
                    {editingOrder === order.id ? (
                      <div className="border-t pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Update Status
                            </label>
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(
                                  order.id,
                                  e.target.value as Order["status"],
                                )
                              }
                              className="w-full border border-gray-300 rounded px-3 py-2"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="picked_up">Picked Up</option>
                              <option value="in_transit">In Transit</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Assign Rider
                            </label>
                            {order.riderName ? (
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm font-medium text-green-800">
                                  {order.riderName}
                                </p>
                                <p className="text-sm text-green-600">
                                  {order.riderPhone}
                                </p>
                                <button
                                  onClick={() => setAssigningRider(order.id)}
                                  className="text-xs text-green-600 hover:text-green-800 mt-1"
                                >
                                  Change Rider
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setAssigningRider(order.id)}
                                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-rocs-green hover:text-rocs-green transition-colors"
                              >
                                + Assign Rider
                              </button>
                            )}

                            {assigningRider === order.id && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                  Select Available Rider:
                                </label>
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      assignRiderToOrder(
                                        order.id,
                                        e.target.value,
                                      );
                                    }
                                  }}
                                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                  defaultValue=""
                                >
                                  <option value="">Choose a rider...</option>
                                  {availableRiders.map((rider) => (
                                    <option key={rider.id} value={rider.id}>
                                      {rider.fullName} - {rider.area} (Rating:{" "}
                                      {rider.rating})
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => setAssigningRider(null)}
                                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setEditingOrder(null)}
                          className="bg-rocs-green text-white px-4 py-2 rounded hover:bg-rocs-green-dark"
                        >
                          Save Changes
                        </button>
                      </div>
                    ) : (
                      <div className="border-t pt-4">
                        {/* Payment Confirmation Section */}
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                            💰 Payment Management
                          </h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                confirmPaymentAndSendReceipt(order.id)
                              }
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium flex items-center space-x-2"
                            >
                              <span>✅ Confirm Payment & Send Receipt</span>
                            </button>
                            <button
                              onClick={() => resendReceipt(order.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium flex items-center space-x-2"
                            >
                              <span>📧 Resend Receipt</span>
                            </button>
                          </div>
                          <p className="text-yellow-700 text-xs mt-2">
                            Click "Confirm Payment" to send a receipt email to{" "}
                            <strong>{order.customerEmail}</strong>
                          </p>
                        </div>

                        {/* Order Status Management */}
                        <div className="flex space-x-2 flex-wrap">
                          {order.status === "pending" && (
                            <button
                              onClick={() =>
                                updateOrderStatus(order.id, "confirmed")
                              }
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                            >
                              Confirm Order
                            </button>
                          )}
                          {order.status === "confirmed" && (
                            <button
                              onClick={() =>
                                updateOrderStatus(order.id, "picked_up")
                              }
                              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
                            >
                              Mark Picked Up
                            </button>
                          )}
                          {order.status === "picked_up" && (
                            <button
                              onClick={() =>
                                updateOrderStatus(order.id, "in_transit")
                              }
                              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-sm"
                            >
                              In Transit
                            </button>
                          )}
                          {order.status === "in_transit" && (
                            <button
                              onClick={() =>
                                updateOrderStatus(order.id, "delivered")
                              }
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div className="space-y-6">
              {/* Search */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-rocs-green"
                  />
                </div>
              </div>

              {/* Messages List */}
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className="bg-white rounded-lg shadow border border-gray-200 p-6"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-900">
                          {message.name}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(message.status)}`}
                        >
                          {message.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(message.timestamp)}
                        </div>
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

                    <h5 className="font-medium text-gray-800 mb-2">
                      {message.subject}
                    </h5>
                    <p className="text-gray-700 text-sm mb-4">
                      {message.message}
                    </p>

                    <div className="flex space-x-2">
                      {message.status === "new" && (
                        <button
                          onClick={() => markAsRead(message.id)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}

                      <button
                        onClick={() => handleReply(message.id)}
                        className="bg-rocs-green hover:bg-rocs-green-dark text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Reply
                      </button>

                      <a
                        href={`mailto:${message.email}?subject=Re: ${message.subject}&body=Dear ${message.name},%0D%0A%0D%0AThank you for contacting Rocs Crew.%0D%0A%0D%0A`}
                        className="bg-rocs-yellow hover:bg-rocs-yellow-dark text-gray-800 px-3 py-1 rounded text-sm transition-colors"
                      >
                        Email Reply
                      </a>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === message.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h6 className="font-medium text-gray-800 mb-2">
                          Reply to {message.name}
                        </h6>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rocs-green resize-none"
                          placeholder="Type your reply here..."
                        />
                        <div className="flex justify-end space-x-2 mt-3">
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => sendReply(message.id)}
                            disabled={!replyText.trim()}
                            className="bg-rocs-green hover:bg-rocs-green-dark text-white px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
                          >
                            Send Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Search */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-rocs-green"
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Spent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Joined {formatDate(user.joinDate)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.totalOrders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            KES {user.totalSpent.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => toggleUserStatus(user.id)}
                              className={`${user.status === "active" ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}`}
                            >
                              {user.status === "active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Riders Tab */}
          {activeTab === "riders" && (
            <div className="space-y-6">
              {/* Header with refresh button */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Rider Management
                  </h2>
                  <button
                    onClick={async () => { setIsLoading(true); try { await fetchRiders(); } finally { setIsLoading(false); } }}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-rocs-green hover:bg-rocs-green-dark text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    )}
                    <span>
                      {isLoading ? "Refreshing..." : "Refresh Riders"}
                    </span>
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {riders.filter((r) => r.status === "pending").length}
                    </div>
                    <div className="text-sm text-blue-600">Pending</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {riders.filter((r) => r.status === "approved").length}
                    </div>
                    <div className="text-sm text-green-600">Approved</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {riders.filter((r) => r.status === "rejected").length}
                    </div>
                    <div className="text-sm text-red-600">Rejected</div>
                  </div>
                  <div className="bg-rocs-green-light p-4 rounded-lg">
                    <div className="text-2xl font-bold text-rocs-green">
                      {riders.filter((r) => r.isActive).length}
                    </div>
                    <div className="text-sm text-rocs-green">Active</div>
                  </div>
                </div>
              </div>

              {/* Riders List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rocs-green mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading riders...</p>
                  </div>
                ) : riders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
                    <Bike className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No riders found
                    </h3>
                    <p className="text-gray-600">
                      No rider applications have been submitted yet.
                    </p>
                  </div>
                ) : (
                  riders.map((rider) => (
                    <div
                      key={rider.id}
                      className="bg-white rounded-lg shadow border border-gray-200 p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-rocs-green rounded-full flex items-center justify-center">
                            <Bike className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {rider.fullName}
                            </h3>
                            <p className="text-gray-600">
                              {rider.id} • {rider.area}
                            </p>
                            {rider.rating > 0 && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600">
                                  {rider.rating} ({rider.totalDeliveries}{" "}
                                  deliveries)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${
                              rider.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : rider.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {rider.status}
                          </span>

                          {rider.status === "approved" && (
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                rider.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {rider.isActive ? "Active" : "Inactive"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Contact
                          </p>
                          <p className="text-sm text-gray-900">{rider.email}</p>
                          <p className="text-sm text-gray-900">{rider.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Motorcycle
                          </p>
                          <p className="text-sm text-gray-900">
                            {rider.motorcycle}
                          </p>
                          <p className="text-sm text-gray-600">
                            Experience: {rider.experience}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Application Date
                          </p>
                          <p className="text-sm text-gray-900">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {formatDate(rider.joinedAt)}
                          </p>
                          {rider.updatedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Last updated: {formatDate(rider.updatedAt)}
                            </p>
                          )}
                        </div>
                      </div>

                      {rider.motivation && (
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                          <p className="text-sm font-medium text-gray-600">
                            Why they want to join:
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {rider.motivation}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                          {rider.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  updateRiderStatus(rider.id, "approved")
                                }
                                className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                              >
                                <UserCheck className="w-4 h-4" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() =>
                                  updateRiderStatus(rider.id, "rejected")
                                }
                                className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                              >
                                <UserX className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {rider.status === "approved" && (
                            <button
                              onClick={() =>
                                toggleRiderActive(rider.id, !rider.isActive)
                              }
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                rider.isActive
                                  ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                  : "bg-rocs-green text-white hover:bg-rocs-green-dark"
                              }`}
                            >
                              {rider.isActive ? "Deactivate" : "Activate"}
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => deleteRider(rider.id)}
                          className="text-red-400 hover:text-red-600 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Partnership Requests Tab */}
          {activeTab === "partnerships" && (
            <div className="space-y-6">
              {/* Header with refresh button */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Partnership Requests
                  </h2>
                  <button
                    onClick={async () => { setIsLoading(true); try { await fetchPartnershipRequests(); } finally { setIsLoading(false); } }}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-rocs-green hover:bg-rocs-green-dark text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    )}
                    <span>
                      {isLoading ? "Refreshing..." : "Refresh Requests"}
                    </span>
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {
                        partnershipRequests.filter(
                          (r) => r.status === "pending",
                        ).length
                      }
                    </div>
                    <div className="text-sm text-blue-600">Pending Review</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        partnershipRequests.filter(
                          (r) => r.status === "approved",
                        ).length
                      }
                    </div>
                    <div className="text-sm text-green-600">Approved</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {
                        partnershipRequests.filter(
                          (r) => r.status === "rejected",
                        ).length
                      }
                    </div>
                    <div className="text-sm text-red-600">Rejected</div>
                  </div>
                </div>
              </div>

              {/* Partnership Requests List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rocs-green mx-auto mb-4"></div>
                    <p className="text-gray-600">
                      Loading partnership requests...
                    </p>
                  </div>
                ) : partnershipRequests.length === 0 ? (
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
                    <Handshake className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No partnership requests found
                    </h3>
                    <p className="text-gray-600">
                      No partnership requests have been submitted yet.
                    </p>
                  </div>
                ) : (
                  partnershipRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white rounded-lg shadow border border-gray-200 p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-rocs-green rounded-full flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {request.companyName}
                            </h3>
                            <p className="text-gray-600">
                              {request.id} • {request.businessCategory}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Submitted: {formatDate(request.timestamp)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${
                              request.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : request.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Contact Person
                          </p>
                          <p className="text-sm text-gray-900">
                            {request.contactPerson}
                          </p>
                          <p className="text-sm text-gray-900">
                            {request.email}
                          </p>
                          <p className="text-sm text-gray-900">
                            {request.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Business Details
                          </p>
                          <p className="text-sm text-gray-900">
                            Category: {request.businessCategory}
                          </p>
                          <p className="text-sm text-gray-900">
                            Volume: {request.deliveryVolume}
                          </p>
                          {request.updatedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Last updated: {formatDate(request.updatedAt)}
                            </p>
                          )}
                        </div>
                      </div>

                      {request.message && (
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                          <p className="text-sm font-medium text-gray-600">
                            Request Message:
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {request.message}
                          </p>
                        </div>
                      )}

                      {request.adminNotes && (
                        <div className="mb-4 p-3 bg-blue-50 rounded">
                          <p className="text-sm font-medium text-blue-800">
                            Admin Notes:
                          </p>
                          <p className="text-sm text-blue-700 mt-1">
                            {request.adminNotes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                          {request.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  updatePartnershipRequestStatus(
                                    request.id,
                                    "approved",
                                  )
                                }
                                className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() =>
                                  updatePartnershipRequestStatus(
                                    request.id,
                                    "rejected",
                                  )
                                }
                                className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                              >
                                <AlertCircle className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {request.status !== "pending" && (
                            <span className="text-sm text-gray-500">
                              Request {request.status} on{" "}
                              {request.updatedAt
                                ? formatDate(request.updatedAt)
                                : "Unknown date"}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => deletePartnershipRequest(request.id)}
                          className="text-red-400 hover:text-red-600 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Rider Earnings Tab */}
          {activeTab === "rider-earnings" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Rider Earnings Management
                  </h2>
                  <button
                    onClick={async () => { setIsLoading(true); try { await fetchRiders(); } finally { setIsLoading(false); } }}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-rocs-green hover:bg-rocs-green-dark text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    )}
                    <span>{isLoading ? "Refreshing..." : "Refresh Data"}</span>
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      KES{" "}
                      {riders
                        .filter((r) => r.status === "approved")
                        .reduce((sum, r) => sum + (r.currentBalance || 0), 0)
                        .toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">
                      Total Pending Payouts
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      KES{" "}
                      {riders
                        .filter((r) => r.status === "approved")
                        .reduce((sum, r) => sum + (r.totalEarnings || 0), 0)
                        .toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-600">
                      Total Rider Earnings
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      KES{" "}
                      {riders
                        .filter((r) => r.status === "approved")
                        .reduce((sum, r) => sum + (r.totalWithdrawn || 0), 0)
                        .toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-600">
                      Total Paid Out
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {
                        riders.filter(
                          (r) =>
                            r.status === "approved" &&
                            (r.currentBalance || 0) > 0,
                        ).length
                      }
                    </div>
                    <div className="text-sm text-yellow-600">
                      Riders with Balance
                    </div>
                  </div>
                </div>
              </div>

              {/* Riders Earnings List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rocs-green mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading rider earnings...</p>
                  </div>
                ) : riders.filter((r) => r.status === "approved").length ===
                  0 ? (
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
                    <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No approved riders found
                    </h3>
                    <p className="text-gray-600">
                      Approve riders first to manage their earnings.
                    </p>
                  </div>
                ) : (
                  riders
                    .filter((r) => r.status === "approved")
                    .map((rider) => (
                      <div
                        key={rider.id}
                        className="bg-white rounded-lg shadow border border-gray-200 p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-rocs-green rounded-full flex items-center justify-center">
                              <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {rider.fullName}
                              </h3>
                              <p className="text-gray-600">
                                {rider.id} • {rider.area}
                              </p>
                              <div className="flex items-center space-x-1 mt-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600">
                                  {rider.rating} ({rider.totalDeliveries}{" "}
                                  deliveries)
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              KES {(rider.currentBalance || 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              Current Balance
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Total Earnings
                            </p>
                            <p className="text-lg font-semibold text-blue-600">
                              KES {(rider.totalEarnings || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Total Withdrawn
                            </p>
                            <p className="text-lg font-semibold text-purple-600">
                              KES {(rider.totalWithdrawn || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Last Withdrawal
                            </p>
                            <p className="text-sm text-gray-900">
                              {rider.lastWithdrawal
                                ? formatDate(rider.lastWithdrawal)
                                : "Never"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Contact
                            </p>
                            <p className="text-sm text-gray-900">
                              {rider.email}
                            </p>
                            <p className="text-sm text-gray-900">
                              {rider.phone}
                            </p>
                          </div>
                        </div>

                        {/* Recent Earnings */}
                        {rider.earnings && rider.earnings.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Recent Earnings
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                              {rider.earnings
                                .slice(-3)
                                .map((earning, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0"
                                  >
                                    <div>
                                      <span className="text-xs text-gray-600">
                                        {earning.orderId}
                                      </span>
                                      <span className="text-xs text-gray-500 ml-2">
                                        {formatDate(earning.deliveryDate)}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-green-600">
                                        +KES{" "}
                                        {earning.riderEarning.toLocaleString()}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        from KES {earning.amount}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Payment Actions */}
                        <div className="border-t pt-4">
                          {selectedRiderForEarnings === rider.id ? (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-800 mb-3">
                                Process Payment to {rider.fullName}
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount (KES)
                                  </label>
                                  <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) =>
                                      setPaymentAmount(e.target.value)
                                    }
                                    max={rider.currentBalance || 0}
                                    min="1"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-rocs-green"
                                    placeholder="Enter amount"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Max: KES{" "}
                                    {(
                                      rider.currentBalance || 0
                                    ).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Method
                                  </label>
                                  <select
                                    value={paymentMethod}
                                    onChange={(e) =>
                                      setPaymentMethod(e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-rocs-green"
                                  >
                                    <option value="mpesa">M-Pesa</option>
                                    <option value="bank">Bank Transfer</option>
                                    <option value="cash">Cash</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={paymentNotes}
                                    onChange={(e) =>
                                      setPaymentNotes(e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-rocs-green"
                                    placeholder="Payment notes"
                                  />
                                </div>
                              </div>

                              <div className="flex space-x-2">
                                <button
                                  onClick={() => processRiderPayment(rider.id)}
                                  disabled={
                                    !paymentAmount ||
                                    parseFloat(paymentAmount) <= 0 ||
                                    parseFloat(paymentAmount) >
                                      (rider.currentBalance || 0)
                                  }
                                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  <span>Process Payment</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRiderForEarnings(null);
                                    setPaymentAmount("");
                                    setPaymentNotes("");
                                  }}
                                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedRiderForEarnings(rider.id);
                                  setPaymentAmount("");
                                  setPaymentNotes("");
                                }}
                                disabled={(rider.currentBalance || 0) <= 0}
                                className="bg-rocs-green text-white px-4 py-2 rounded hover:bg-rocs-green-dark text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                              >
                                <DollarSign className="w-4 h-4" />
                                <span>Pay Rider</span>
                              </button>
                              <button
                                onClick={async () => {
                                  const earnings = await fetchRiderEarnings(
                                    rider.id,
                                  );
                                  if (earnings) {
                                    const details = `
🚴‍♂️ RIDER EARNINGS SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Rider: ${earnings.fullName}
🆔 ID: ${earnings.riderId}
📧 Email: ${earnings.email}

💰 FINANCIAL SUMMARY
━━━━━━━��━━━━━━━━━━━━━━━━━━━
💵 Current Balance: KES ${earnings.currentBalance.toLocaleString()}
📈 Total Earnings: KES ${earnings.totalEarnings.toLocaleString()}
💸 Total Withdrawn: KES ${earnings.totalWithdrawn.toLocaleString()}
📅 Last Withdrawal: ${earnings.lastWithdrawal ? formatDate(earnings.lastWithdrawal) : "Never"}

📊 DELIVERY STATS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚚 Total Deliveries: ${earnings.totalDeliveries}
⭐ Rating: ${earnings.rating}/5.0

📋 RECENT EARNINGS (Last 5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${
  earnings.earnings
    .slice(-5)
    .map(
      (e) =>
        `🔹 ${e.orderId}: +KES ${e.riderEarning.toLocaleString()} (${formatDate(e.deliveryDate)})`,
    )
    .join("\n") || "No earnings recorded yet"
}

�� Commission Structure: 20% Company | 80% Rider
                                `;
                                    alert(details);
                                  }
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium flex items-center space-x-2"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Details</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Rider Activity Log Tab */}
          {activeTab === "rider-activity" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Rider Activity Log
                  </h2>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          await fetch('/api/admin/rider-activities');
                          await fetchActivities();
                        } catch (error) {
                          console.error('Error refreshing activities:', error);
                        } finally { setIsLoading(false); }
                      }}
                      disabled={isLoading}
                      className="flex items-center space-x-2 bg-rocs-green hover:bg-rocs-green-dark text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    )}
                      <span>
                        {isLoading ? 'Refreshing...' : 'Refresh Activities'}
                      </span>
                    </button>

                    <button
                      onClick={() => window.open('/api/admin/rider-activities/export?format=json', '_blank')}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                    >
                      Export JSON
                    </button>

                    <button
                      onClick={() => window.open('/api/admin/rider-activities/export?format=csv', '_blank')}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium"
                    >
                      Export CSV
                    </button>

                    <label className="bg-white border rounded px-3 py-2 text-sm cursor-pointer">
                      Import JSON
                      <input
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={async (e:any) => {
                          const file = e.target.files && e.target.files[0];
                          if (!file) return;
                          try {
                            const text = await file.text();
                            const parsed = JSON.parse(text);
                            const res = await fetch('/api/admin/rider-activities/import', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(parsed),
                            });
                            if (res.ok) {
                              alert('Import successful');
                              await fetchActivities();
                            } else {
                              const data = await res.json();
                              alert('Import failed: ' + (data.error || 'unknown'));
                            }
                          } catch (err) {
                            alert('Failed to import file: ' + (err.message || err));
                          }
                        }}
                      />
                    </label>

                    <button
                      onClick={() => setShowAdd(a => !a)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm font-medium"
                    >
                      {showAdd ? 'Close Add' : 'Add Activity'}
                    </button>

                  </div>
                </div>

                {showAdd && (
                  <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Add Activity</h3>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          const payload = {
                            riderId: newActivity.riderId,
                            riderName: newActivity.riderName,
                            type: newActivity.type,
                            orderId: newActivity.orderId || undefined,
                            description: newActivity.description,
                            amount: newActivity.amount ? Number(newActivity.amount) : undefined,
                          };

                          const res = await fetch('/api/admin/rider-activities/log', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                          });

                          if (res.ok) {
                            alert('Activity added successfully');
                            setNewActivity({ riderId: '', riderName: '', type: 'order_assigned', orderId: '', description: '', amount: 0 });
                            setShowAdd(false);
                            await fetchActivities();
                          } else {
                            const data = await res.json().catch(() => ({ error: 'Unknown error' }));
                            alert('Failed to add activity: ' + (data.error || 'Unknown'));
                          }
                        } catch (err:any) {
                          console.error('Error creating activity', err);
                          alert('Failed to create activity: ' + (err?.message || err));
                        }
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          required
                          value={newActivity.riderId}
                          onChange={(e) => setNewActivity((s) => ({ ...s, riderId: e.target.value }))}
                          placeholder="Rider ID (e.g. RD-001)"
                          className="border border-gray-300 rounded px-3 py-2"
                        />
                        <input
                          required
                          value={newActivity.riderName}
                          onChange={(e) => setNewActivity((s) => ({ ...s, riderName: e.target.value }))}
                          placeholder="Rider Name"
                          className="border border-gray-300 rounded px-3 py-2"
                        />
                        <select
                          value={newActivity.type}
                          onChange={(e) => setNewActivity((s) => ({ ...s, type: e.target.value }))}
                          className="border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="order_assigned">Order Assigned</option>
                          <option value="pickup_completed">Pickup Completed</option>
                          <option value="delivery_completed">Delivery Completed</option>
                          <option value="payment_received">Payment Received</option>
                          <option value="status_change">Status Change</option>
                          <option value="earnings_added">Earnings Added</option>
                          <option value="login">Login</option>
                          <option value="logout">Logout</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <input
                          value={newActivity.orderId}
                          onChange={(e) => setNewActivity((s) => ({ ...s, orderId: e.target.value }))}
                          placeholder="Order ID (optional)"
                          className="border border-gray-300 rounded px-3 py-2"
                        />
                        <input
                          required
                          value={newActivity.description}
                          onChange={(e) => setNewActivity((s) => ({ ...s, description: e.target.value }))}
                          placeholder="Description"
                          className="border border-gray-300 rounded px-3 py-2"
                        />
                        <input
                          type="number"
                          value={newActivity.amount || ''}
                          onChange={(e) => setNewActivity((s) => ({ ...s, amount: Number(e.target.value) }))}
                          placeholder="Amount (optional)"
                          className="border border-gray-300 rounded px-3 py-2"
                        />
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button type="submit" className="bg-rocs-green text-white px-4 py-2 rounded hover:bg-rocs-green-dark">Add Activity</button>
                        <button type="button" onClick={() => setShowAdd(false)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Activity Stats */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">47</div>
                    <div className="text-sm text-blue-600">
                      Today's Activities
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">23</div>
                    <div className="text-sm text-green-600">Deliveries</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">5</div>
                    <div className="text-sm text-purple-600">Payments</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">18</div>
                    <div className="text-sm text-orange-600">Pickups</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">12</div>
                    <div className="text-sm text-yellow-600">Active Riders</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">156</div>
                    <div className="text-sm text-red-600">Total Activities</div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Rider
                    </label>
                    <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-rocs-green">
                      <option value="">All Riders</option>
                      <option value="RD-001">John Mwangi</option>
                      <option value="RD-002">Peter Kimani</option>
                      <option value="RD-003">James Mwangi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activity Type
                    </label>
                    <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-rocs-green">
                      <option value="">All Types</option>
                      <option value="delivery_completed">
                        Deliveries Completed
                      </option>
                      <option value="payment_received">
                        Payments Received
                      </option>
                      <option value="order_assigned">Orders Assigned</option>
                      <option value="pickup_completed">
                        Pickups Completed
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Range
                    </label>
                    <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-rocs-green">
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search Order ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RC-2024-001"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-rocs-green"
                    />
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Live Activity Timeline
                  </h3>
                  <p className="text-sm text-gray-600">
                    Real-time tracking of all rider activities and earnings
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Real activities from server */}
                    {activities.length === 0 && <div className="text-sm text-gray-500">No activities yet</div>}
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                            activity.type === 'delivery_completed' ? 'bg-green-500' :
                            activity.type === 'pickup_completed' ? 'bg-orange-500' :
                            activity.type === 'payment_received' ? 'bg-purple-500' :
                            activity.type === 'order_assigned' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}
                        >
                          <span className="text-lg">{activity.type === 'delivery_completed' ? '✅' : activity.type === 'pickup_completed' ? '📦' : activity.type === 'payment_received' ? '💰' : activity.type === 'order_assigned' ? '🏍️' : '•'}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {activity.riderName || activity.metadata?.riderName || activity.riderId}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {activity.description}
                          </p>

                          {activity.netEarning && (
                            <div className="bg-white rounded p-3 border border-gray-200">
                              <div className="grid grid-cols-3 gap-4 text-xs">
                                <div>
                                  <span className="text-gray-500">
                                    Order Amount:
                                  </span>
                                  <div className="font-semibold text-gray-900">
                                    KES {activity.amount?.toLocaleString?.()}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Company (20%):
                                  </span>
                                  <div className="font-semibold text-red-600">
                                    -KES {activity.commission?.toFixed?.(2)}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Rider Net (80%):
                                  </span>
                                  <div className="font-semibold text-green-600">
                                    +KES {activity.netEarning?.toFixed?.(2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {activity.amount && !activity.netEarning && (
                            <div className="bg-white rounded p-3 border border-gray-200">
                              <span className="text-xs text-gray-500">
                                Payment Amount:
                              </span>
                              <div className="font-semibold text-purple-600">
                                -KES {activity.amount?.toLocaleString?.()}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end space-y-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              activity.type === 'delivery_completed' ? 'bg-green-100 text-green-800' :
                              activity.type === 'pickup_completed' ? 'bg-orange-100 text-orange-800' :
                              activity.type === 'payment_received' ? 'bg-purple-100 text-purple-800' :
                              activity.type === 'order_assigned' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {activity.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {activity.riderId}
                          </span>

                          <div className="mt-2 flex items-center space-x-2">
                            <button
                              onClick={async () => {
                                if (!confirm('Delete this activity?')) return;
                                try {
                                  const res = await fetch(`/api/admin/rider-activities/${activity.id}`, { method: 'DELETE' });
                                  if (res.ok) {
                                    alert('Activity deleted');
                                    await fetchActivities();
                                  } else {
                                    const data = await res.json().catch(() => ({}));
                                    alert('Failed to delete activity: ' + (data.error || 'Unknown'));
                                  }
                                } catch (err) {
                                  console.error('Error deleting activity', err);
                                  alert('Failed to delete activity');
                                }
                              }}
                              className="p-2 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  <div className="text-center mt-6">
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg transition-colors">
                      Load More Activities
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Withdrawal Requests Tab */}
          {activeTab === "withdrawal-requests" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Withdrawal Requests Management
                  </h2>
                  <button
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        const response = await fetch(
                          "/api/admin/withdrawal-requests",
                        );
                        if (response.ok) {
                          const data = await response.json();
                          console.log("Withdrawal requests loaded:", data);
                        }
                      } catch (error) {
                        console.error(
                          "Error refreshing withdrawal requests:",
                          error,
                        );
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-rocs-green hover:bg-rocs-green-dark text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    )}
                    <span>
                      {isLoading ? "Refreshing..." : "Refresh Requests"}
                    </span>
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">3</div>
                    <div className="text-sm text-yellow-600">
                      Pending Requests
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-sm text-green-600">Approved Today</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">2</div>
                    <div className="text-sm text-red-600">Rejected</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      KES 25,480
                    </div>
                    <div className="text-sm text-blue-600">Total Requested</div>
                  </div>
                </div>
              </div>

              {/* Fee Calculator */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Withdrawal Fee Calculator
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">
                        Fee Structure:
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>
                          • Below KES 1,000: <strong>KES 20 fee</strong>
                        </li>
                        <li>
                          • KES 1,000 and above: <strong>KES 50 fee</strong>
                        </li>
                        <li>• Fees are deducted from withdrawal amount</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">
                        Examples:
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Request KES 800 → Get KES 780 (KES 20 fee)</li>
                        <li>
                          • Request KES 1,500 → Get KES 1,450 (KES 50 fee)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Withdrawal Requests List */}
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      Recent Withdrawal Requests
                    </h3>
                    <div className="flex space-x-2">
                      <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="processed">Processed</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Sample Withdrawal Requests */}
                    {[
                      {
                        id: "WR-001",
                        rider: "John Mwangi",
                        riderId: "RD-001",
                        phone: "+254 712 345 678",
                        amount: 800,
                        fee: 20,
                        netAmount: 780,
                        status: "pending",
                        requestedAt: "2 hours ago",
                        notes: "Need funds for motorcycle maintenance",
                      },
                      {
                        id: "WR-002",
                        rider: "Peter Kimani",
                        riderId: "RD-002",
                        phone: "+254 700 123 456",
                        amount: 1500,
                        fee: 50,
                        netAmount: 1450,
                        status: "pending",
                        requestedAt: "4 hours ago",
                        notes: "Emergency medical expenses",
                      },
                    ].map((request) => (
                      <div
                        key={request.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-rocs-green rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {request.rider
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {request.rider}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {request.riderId} • {request.phone}
                              </p>
                              <p className="text-xs text-gray-500">
                                {request.requestedAt}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${
                              request.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : request.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>

                        {/* Amount Breakdown */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">
                                Requested Amount:
                              </span>
                              <div className="font-semibold text-gray-900">
                                KES {request.amount.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Withdrawal Fee:
                              </span>
                              <div className="font-semibold text-red-600">
                                -KES {request.fee}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Net Amount:</span>
                              <div className="font-semibold text-green-600">
                                KES {request.netAmount.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {request.notes && (
                          <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                            <span className="text-xs text-blue-600 font-medium">
                              Notes:
                            </span>
                            <p className="text-sm text-blue-700 mt-1">
                              {request.notes}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        {request.status === "pending" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Approve withdrawal of KES ${request.amount} for ${request.rider}?`,
                                  )
                                ) {
                                  alert(
                                    `✅ Withdrawal approved for ${request.rider}\nNet amount: KES ${request.netAmount}`,
                                  );
                                }
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("Reason for rejection:");
                                if (reason) {
                                  alert(
                                    `❌ Withdrawal rejected for ${request.rider}\nReason: ${reason}`,
                                  );
                                }
                              }}
                              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Automated Payments Tab */}
          {activeTab === "automated-payments" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Automated Payment System
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Trigger automated payments now? This will pay all riders with balance.",
                          )
                        ) {
                          alert("🚀 Automated payments triggered manually!");
                        }
                      }}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      🚀 Trigger Now
                    </button>
                    <button className="bg-rocs-green hover:bg-rocs-green-dark text-white px-4 py-2 rounded-lg transition-colors">
                      📊 View Reports
                    </button>
                  </div>
                </div>

                {/* Scheduler Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-800 font-medium">
                        Scheduler Active
                      </span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Next payment: Today at 23:00
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">15</div>
                    <div className="text-sm text-blue-600">Riders Eligible</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      KES 45,290
                    </div>
                    <div className="text-sm text-purple-600">Total Pending</div>
                  </div>
                </div>

                {/* Payment Settings */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-medium text-yellow-800 mb-2">
                    📅 Automated Payment Schedule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
                    <div>
                      <ul className="space-y-1">
                        <li>
                          • <strong>Daily Schedule:</strong> 23:00 hrs (11 PM)
                        </li>
                        <li>
                          • <strong>Payment Method:</strong> M-Pesa to
                          registered phone
                        </li>
                        <li>
                          • <strong>Eligibility:</strong> Approved riders with
                          balance
                        </li>
                      </ul>
                    </div>
                    <div>
                      <ul className="space-y-1">
                        <li>
                          • <strong>Processing Time:</strong> 2-5 minutes per
                          rider
                        </li>
                        <li>
                          • <strong>Retry Policy:</strong> 3 attempts for failed
                          payments
                        </li>
                        <li>
                          • <strong>Notification:</strong> SMS + Email
                          confirmation
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Payment History Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">156</div>
                    <div className="text-sm text-gray-600">Total Payments</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      98.7%
                    </div>
                    <div className="text-sm text-green-600">Success Rate</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">23</div>
                    <div className="text-sm text-blue-600">
                      Today's Payments
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">2</div>
                    <div className="text-sm text-red-600">Failed Payments</div>
                  </div>
                </div>
              </div>

              {/* Recent Automated Payments */}
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Recent Automated Payments
                  </h3>
                  <p className="text-sm text-gray-600">
                    Payments processed automatically at 23:00 daily
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Sample Automated Payments */}
                    {[
                      {
                        id: "AP-001",
                        rider: "John Mwangi",
                        phone: "+254712345678",
                        amount: 2480,
                        status: "success",
                        transactionId: "MP2024001234",
                        processedAt: "23:00 Today",
                      },
                      {
                        id: "AP-002",
                        rider: "Peter Kimani",
                        phone: "+254700123456",
                        amount: 1890,
                        status: "success",
                        transactionId: "MP2024001235",
                        processedAt: "23:01 Today",
                      },
                      {
                        id: "AP-003",
                        rider: "James Mwangi",
                        phone: "+254701987654",
                        amount: 3460,
                        status: "failed",
                        transactionId: null,
                        error: "M-Pesa timeout",
                        processedAt: "23:02 Today",
                      },
                    ].map((payment) => (
                      <div
                        key={payment.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                payment.status === "success"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            >
                              <span className="text-white text-lg">
                                {payment.status === "success" ? "✅" : "❌"}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {payment.rider}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {payment.phone}
                              </p>
                              <p className="text-xs text-gray-500">
                                {payment.processedAt}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              KES {payment.amount.toLocaleString()}
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                payment.status === "success"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </div>
                        </div>

                        {payment.transactionId && (
                          <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                            <span className="text-xs text-green-600 font-medium">
                              Transaction ID:
                            </span>
                            <span className="text-sm text-green-700 ml-2">
                              {payment.transactionId}
                            </span>
                          </div>
                        )}

                        {payment.error && (
                          <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                            <span className="text-xs text-red-600 font-medium">
                              Error:
                            </span>
                            <span className="text-sm text-red-700 ml-2">
                              {payment.error}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
