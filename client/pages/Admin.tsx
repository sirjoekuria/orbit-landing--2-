import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from '../lib/api';
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
  ChevronLeft,
  Home,
  Settings,
  Activity,
  FileDown,
  RefreshCw,
  Plus,
  Zap,
  Skeleton as SkeletonIcon,
  Lock,
  EyeOff,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import PullToRefresh from "../components/Mobile/PullToRefresh";
import { saveFileNative, isNative, triggerSelectionHaptic } from "../lib/mobileUtils";
import AnimatedPage from "../components/AnimatedPage";

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
      const res = await fetch(`${API_BASE_URL}/api/admin/rider-activities`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
      const sres = await fetch(`${API_BASE_URL}/api/admin/rider-activities/stats`);
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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("adminAuth") === "true";
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
      sessionStorage.setItem("adminAuth", "true");
      setError("");
    } else {
      setError("Invalid password");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuth");
    setPassword("");
  };

  const TableSkeleton = () => (
    <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border">
      <div className="bg-background px-6 py-4 border-b border-border">
        <div className="flex space-x-6">
          <Skeleton className="h-4 w-1/4 bg-card/5" />
          <Skeleton className="h-4 w-1/4 bg-card/5" />
          <Skeleton className="h-4 w-1/4 bg-card/5" />
          <Skeleton className="h-4 w-1/4 bg-card/5" />
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-6 py-6">
            <div className="flex justify-between items-center">
              <div className="space-y-3 flex-grow">
                <Skeleton className="h-4 w-3/4 bg-card/5" />
                <Skeleton className="h-3 w-1/2 bg-card/5" />
              </div>
              <Skeleton className="h-10 w-24 rounded-xl bg-card/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-card p-8 rounded-3xl shadow-2xl border border-border">
          <div className="flex items-center space-x-5 mb-6">
            <Skeleton className="h-14 w-14 rounded-2xl bg-card/5" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-3/4 bg-card/5" />
              <Skeleton className="h-3 w-1/2 bg-card/5" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full bg-card/5" />
            <Skeleton className="h-4 w-full bg-card/5" />
            <div className="flex justify-between pt-6">
              <Skeleton className="h-10 w-28 rounded-xl bg-card/5" />
              <Skeleton className="h-10 w-28 rounded-xl bg-card/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Fetch data from API
  const fetchOrders = async (page = 1) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/orders?page=${page}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTotalPages(data.totalPages || 1);
          setCurrentPage(data.page || 1);
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

  const fetchMessages = async (page = 1) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/messages?page=${page}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTotalPages(data.totalPages || 1);
          setCurrentPage(data.page || 1);
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
      const response = await fetch(`${API_BASE_URL}/api/admin/riders`);
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
      const response = await fetch(`${API_BASE_URL}/api/riders/available`);
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
      const response = await fetch(`${API_BASE_URL}/api/admin/partnership-requests`);
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

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      if (isNative()) {
        const res = await fetch(`${API_BASE_URL}/api/admin/rider-activities/export?format=${format}`);
        const content = await res.text();
        const fileName = `activities_${new Date().toISOString().split('T')[0]}.${format}`;
        await saveFileNative(fileName, content);
      } else {
        window.open(`${API_BASE_URL}/api/admin/rider-activities/export?format=${format}`, '_blank');
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export activities');
    }
  };

  const fetchWithCsrf = async (url: string, options: RequestInit = {}) => {
    const csrfRes = await fetch(`${API_BASE_URL}/api/csrf-token`);
    const { token } = await csrfRes.json();

    return fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        "x-csrf-token": token,
      },
    });
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
      const response = await fetchWithCsrf(`/api/admin/riders/${riderId}/status`, {
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
      const response = await fetchWithCsrf(`/api/admin/riders/${riderId}/active`, {
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
      const response = await fetchWithCsrf(`/api/admin/riders/${riderId}`, {
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

      const response = await fetchWithCsrf(
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
      const response = await fetch(`${API_BASE_URL}/api/admin/riders/${riderId}/earnings`);
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
      const response = await fetchWithCsrf(
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
      const response = await fetchWithCsrf(
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
      const response = await fetchWithCsrf(
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
      const response = await fetchWithCsrf(
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
      const response = await fetchWithCsrf(
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
      const response = await fetchWithCsrf(`/api/admin/orders/${orderId}`, {
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

  const deleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetchWithCsrf(`/api/admin/messages/${messageId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessages(messages.filter((msg) => msg.id !== messageId));
      } else {
        alert("Failed to delete message from server");
      }
    } catch (e) {
      console.error("Delete message failed", e);
      alert("Error deleting message");
    }
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
        return "bg-muted text-foreground";
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
        return "bg-muted text-foreground";
      default:
        return "bg-muted text-foreground";
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
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden font-outfit px-4">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rocs-green/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full relative z-10 animate-fade-in translate-y-[-20px]">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-card/10 rounded-3xl flex items-center justify-center mx-auto mb-6 p-4 border border-border shadow-[0_0_30px_rgba(33,197,94,0.1)] overflow-hidden">
              <img src="/logo.webp" alt="Rocs Crew Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">Admin Portal</h1>
            <p className="text-muted-foreground font-medium">Please authenticate to continue.</p>
          </div>

          <form
            onSubmit={handleLogin}
            className="bg-card p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-border relative"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1"
                >
                  Admin Access Key
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border-border text-foreground pl-12 pr-12 py-4 rounded-2xl focus:ring-2 focus:ring-[#eab308]/50 focus:border-[#eab308] transition-all placeholder:text-foreground/20"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium animate-shake flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-black uppercase tracking-widest rounded-xl"
              >
                Unlock Access Portal
              </Button>
            </div>
          </form>

          <p className="text-muted-foreground/40 italic text-[10px] text-center mt-6">
            All access attempts are monitored and logged.
          </p>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 text-foreground/40 hover:text-secondary transition-colors mt-8 font-bold text-xs uppercase tracking-widest"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Website
          </Link>
        </div>

        {/* Footer Text */}
        <div className="absolute bottom-10 left-0 w-full flex items-center justify-center space-x-3 text-muted-foreground uppercase tracking-[0.2em] text-xs font-bold pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
          <span>Rocs Crew Network</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="hidden lg:block bg-background border-b border-[#ffffff05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-foreground tracking-wide">
              Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-card hover:bg-[#152e1d] text-foreground font-bold px-4 py-2 rounded-xl border border-[#ffffff05] transition-all"
            >
              <LogOut className="w-4 h-4 text-secondary" />
              <span className="uppercase text-xs tracking-wider">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)] lg:h-screen">

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-2xl transform flex flex-col justify-between ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-[#ffffff05]`}
        >
          <div className="flex items-center justify-between pt-10 pb-6 px-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center border border-[#eab308]/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                <span className="text-secondary font-bold text-sm">RC</span>
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-foreground leading-tight">
                  Admin Panel
                </h2>
                <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-bold mt-1">
                  Nairobi Logistics
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="mt-4 px-6 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {/* Overview */}
            <button
              onClick={() => {
                triggerSelectionHaptic();
                setActiveTab("overview");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl text-left transition-all mb-6 ${activeTab === "overview"
                ? "bg-card text-foreground shadow-[0_0_15px_rgba(234,179,8,0.05)] border border-border/20"
                : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={`w-5 h-5 ${activeTab === "overview" ? "text-secondary" : "text-secondary/70"}`}>
                <rect width="8" height="8" x="3" y="3" rx="1.5" />
                <rect width="8" height="8" x="13" y="3" rx="1.5" />
                <rect width="8" height="8" x="13" y="13" rx="1.5" />
                <rect width="8" height="8" x="3" y="13" rx="1.5" />
              </svg>
              <span className="font-bold text-sm tracking-wide">Dashboard Overview</span>
            </button>

            {/* Operations Menu */}
            <div className="mb-6">
              <button
                onClick={() =>
                  setExpandedMenus((prev) => ({
                    ...prev,
                    operations: !prev.operations,
                  }))
                }
                className="w-full flex items-center justify-between px-2 py-2 text-foreground hover:text-secondary rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-5 h-5 text-secondary">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <span className="font-bold text-sm tracking-wide">Operations</span>
                </div>
                {expandedMenus.operations ? (
                  <ChevronDown className="w-4 h-4 text-secondary" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-secondary" />
                )}
              </button>
              {expandedMenus.operations && (
                <div className="ml-[18px] pl-5 mt-4 space-y-5">
                  <button
                    onClick={() => {
                      setActiveTab("orders");
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center text-left text-sm transition-colors tracking-wide ${activeTab === "orders"
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-[#c4d6cb]"
                      }`}
                  >
                    <div className={`w-[5px] h-[5px] rounded-full mr-4 ${activeTab === "orders" ? "bg-secondary" : "bg-[#596960]"}`} />
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
                    className={`w-full flex items-center text-left text-sm transition-colors tracking-wide ${activeTab === "messages"
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-[#c4d6cb]"
                      }`}
                  >
                    <div className={`w-[5px] h-[5px] rounded-full mr-4 ${activeTab === "messages" ? "bg-secondary" : "bg-[#596960]"}`} />
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
            <div className="mb-6">
              <button
                onClick={() =>
                  setExpandedMenus((prev) => ({ ...prev, people: !prev.people }))
                }
                className="w-full flex items-center justify-between px-2 py-2 text-foreground hover:text-secondary rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-secondary" />
                  <span className="font-bold text-sm tracking-wide">People</span>
                </div>
                {expandedMenus.people ? (
                  <ChevronDown className="w-4 h-4 text-secondary" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-secondary" />
                )}
              </button>
              {expandedMenus.people && (
                <div className="ml-[18px] pl-5 mt-4 space-y-5">
                  <button
                    onClick={() => {
                      setActiveTab("users");
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center text-left text-sm transition-colors tracking-wide ${activeTab === "users"
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-[#c4d6cb]"
                      }`}
                  >
                    <div className={`w-[5px] h-[5px] rounded-full mr-4 ${activeTab === "users" ? "bg-secondary" : "bg-[#596960]"}`} />
                    Customer Users
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("riders");
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center text-left text-sm transition-colors tracking-wide ${activeTab === "riders"
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-[#c4d6cb]"
                      }`}
                  >
                    <div className={`w-[5px] h-[5px] rounded-full mr-4 ${activeTab === "riders" ? "bg-secondary" : "bg-[#596960]"}`} />
                    Rider Management
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("partnerships");
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center text-left text-sm transition-colors tracking-wide ${activeTab === "partnerships"
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-[#c4d6cb]"
                      }`}
                  >
                    <div className={`w-[5px] h-[5px] rounded-full mr-4 ${activeTab === "partnerships" ? "bg-secondary" : "bg-[#596960]"}`} />
                    Business Partners
                  </button>
                </div>
              )}
            </div>

            {/* Financial Menu */}
            <div className="mb-6">
              <button
                onClick={() =>
                  setExpandedMenus((prev) => ({
                    ...prev,
                    financial: !prev.financial,
                  }))
                }
                className="w-full flex items-center justify-between px-2 py-2 text-foreground hover:text-secondary rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-secondary">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                  </svg>
                  <span className="font-bold text-sm tracking-wide">Financial</span>
                </div>
                {expandedMenus.financial ? (
                  <ChevronDown className="w-4 h-4 text-secondary" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-secondary" />
                )}
              </button>
              {expandedMenus.financial && (
                <div className="ml-[18px] pl-5 mt-4 space-y-5">
                  <button
                    onClick={() => {
                      setActiveTab("rider-earnings");
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center text-left text-sm transition-colors tracking-wide ${activeTab === "rider-earnings"
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-[#c4d6cb]"
                      }`}
                  >
                    <div className={`w-[5px] h-[5px] rounded-full mr-4 ${activeTab === "rider-earnings" ? "bg-secondary" : "bg-[#596960]"}`} />
                    Rider Earnings
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("rider-activity");
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center text-left text-sm transition-colors tracking-wide ${activeTab === "rider-activity"
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-[#c4d6cb]"
                      }`}
                  >
                    <div className={`w-[5px] h-[5px] rounded-full mr-4 ${activeTab === "rider-activity" ? "bg-secondary" : "bg-[#596960]"}`} />
                    Rider Activity Log
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("withdrawal-requests");
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center text-left text-sm transition-colors tracking-wide ${activeTab === "withdrawal-requests"
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-[#c4d6cb]"
                      }`}
                  >
                    <div className={`w-[5px] h-[5px] rounded-full mr-4 ${activeTab === "withdrawal-requests" ? "bg-secondary" : "bg-[#596960]"}`} />
                    Withdrawal Requests
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("automated-payments");
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center text-left text-sm transition-colors tracking-wide ${activeTab === "automated-payments"
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-[#c4d6cb]"
                      }`}
                  >
                    <div className={`w-[5px] h-[5px] rounded-full mr-4 ${activeTab === "automated-payments" ? "bg-secondary" : "bg-[#596960]"}`} />
                    Automated Payments
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Logout Button - moved to bottom area within sidebar */}
          <div className="px-6 pb-8 pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-3 bg-card hover:bg-[#152e1d] text-foreground font-bold px-4 py-4 rounded-xl transition-all border border-[#ffffff0a] shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
            >
              <LogOut className="w-5 h-5 text-secondary" />
              <span className="tracking-widest uppercase text-sm">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full lg:ml-0 overflow-y-auto overflow-x-hidden custom-scrollbar bg-background">
          {/* Mobile Header */}
          <div className="lg:hidden bg-background border-b border-[#ffffff05]">
            <div className="flex items-center justify-between px-6 py-5">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-secondary hover:text-[#c48a04]"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex flex-col items-center">
                <h1 className="text-xl font-bold text-foreground tracking-wide">
                  Admin Panel
                </h1>
                <span className="text-[9px] uppercase tracking-widest text-secondary font-bold mt-1">
                  Dashboard
                </span>
              </div>
              <div className="w-6"></div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block bg-background border-b border-[#ffffff05] sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-foreground tracking-wide capitalize">
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
                <div className="flex items-center space-x-3 bg-card px-4 py-2 rounded-full border border-border">
                  <div className="w-2 h-2 bg-secondary rounded-full shadow-[0_0_10px_rgba(234,179,8,0.8)] animate-pulse" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Live System Check
                  </span>
                  <span className="text-xs text-[#596960] border-l border-[#ffffff10] pl-3 ml-1">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <PullToRefresh onRefresh={loadData}>
            <div className="p-4 lg:p-8">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <AnimatedPage>
                  <div className="space-y-8">
                    {/* Stats Cards */}
                    {/* Dashboard Header */}
                    <div className="bg-card p-6 lg:p-8 rounded-[24px] border border-[#ffffff05] shadow-[0_10px_40px_rgba(0,0,0,0.3)] mb-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center relative z-10 gap-6">
                        <div>
                          <h2 className="text-2xl font-bold text-foreground tracking-wide mb-2">Dashboard Overview</h2>
                          <p className="text-muted-foreground text-sm">Real-time summary of Nairobi Logistics performance</p>
                        </div>
                        <button
                          onClick={async () => {
                            setIsLoading(true);
                            try {
                              await loadData();
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          disabled={isLoading}
                          className="flex items-center space-x-3 bg-secondary hover:bg-[#ca8a04] text-black font-bold px-6 py-3 rounded-full transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] disabled:opacity-50 w-full sm:w-auto justify-center"
                        >
                          {isLoading ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-5 h-5" />
                          )}
                          <span>{isLoading ? "Refreshing..." : "Refresh Dashboard"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {isLoading ? (
                        <>
                          <CardSkeleton /> <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
                        </>
                      ) : (
                        <>
                          <div className="bg-card p-6 rounded-[24px] border border-[#ffffff05] relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 text-blue-400">
                                <Users className="h-7 w-7" />
                              </div>
                              <div className="ml-5 w-0 flex-1">
                                <dl>
                                  <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate mb-1">
                                    Total Users
                                  </dt>
                                  <dd className="text-3xl font-bold text-foreground">
                                    {stats.totalUsers}
                                  </dd>
                                </dl>
                              </div>
                            </div>
                          </div>

                          <div className="bg-card p-6 rounded-[24px] border border-[#ffffff05] relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/10 rounded-full blur-xl group-hover:bg-secondary/20 transition-all pointer-events-none" />
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center border border-border/20 text-secondary">
                                <Package className="h-7 w-7" />
                              </div>
                              <div className="ml-5 w-0 flex-1">
                                <dl>
                                  <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate mb-1">
                                    Total Orders
                                  </dt>
                                  <dd className="text-3xl font-bold text-foreground">
                                    {stats.totalOrders}
                                  </dd>
                                </dl>
                              </div>
                            </div>
                          </div>

                          <div className="bg-card p-6 rounded-[24px] border border-[#ffffff05] relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-all pointer-events-none" />
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 text-green-400">
                                <MessageSquare className="h-7 w-7" />
                              </div>
                              <div className="ml-5 w-0 flex-1">
                                <dl>
                                  <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate mb-1">
                                    New Messages
                                  </dt>
                                  <dd className="text-3xl font-bold text-foreground">
                                    {stats.unreadMessages}
                                  </dd>
                                </dl>
                              </div>
                            </div>
                          </div>

                          <div className="bg-card p-6 rounded-[24px] border border-[#ffffff05] relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-14 h-14 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20 text-purple-400">
                                <TrendingUp className="h-7 w-7" />
                              </div>
                              <div className="ml-5 w-0 flex-1">
                                <dl>
                                  <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate mb-1">
                                    Total Revenue
                                  </dt>
                                  <dd className="text-xl font-bold text-foreground">
                                    KES {stats.totalRevenue.toLocaleString()}
                                  </dd>
                                </dl>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-card rounded-[24px] border border-[#ffffff05] overflow-hidden">
                        <div className="px-8 py-6 border-b border-[#ffffff0a] flex justify-between items-center bg-[#152a1d]">
                          <h3 className="text-lg font-bold text-foreground tracking-wide">
                            Recent Orders
                          </h3>
                          <button
                            onClick={() => setActiveTab("orders")}
                            className="text-sm text-secondary hover:text-foreground font-bold tracking-wider uppercase transition-colors"
                          >
                            View All
                          </button>
                        </div>
                        <div className="p-4 lg:p-6">
                          <div className="space-y-3">
                            {isLoading ? (
                              <div className="space-y-4">
                                <Skeleton className="h-16 w-full rounded-xl bg-[#ffffff0a]" />
                                <Skeleton className="h-16 w-full rounded-xl bg-[#ffffff0a]" />
                                <Skeleton className="h-16 w-full rounded-xl bg-[#ffffff0a]" />
                              </div>
                            ) : orders.length === 0 ? (
                              <div className="py-12 text-center">
                                <Package className="w-12 h-12 text-[#3a4f41] mx-auto mb-3" />
                                <p className="text-sm font-bold text-muted-foreground">No recent orders</p>
                              </div>
                            ) : (
                              orders.slice(0, 5).map((order) => (
                                <div
                                  key={order.id}
                                  className="flex items-center justify-between p-4 bg-background/50 hover:bg-background rounded-xl border border-[#ffffff05] transition-all"
                                >
                                  <div>
                                    <p className="text-sm font-bold text-foreground mb-1">
                                      {order.id}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {order.customerName}
                                    </p>
                                    <p className="text-xs text-[#596960] mt-1 font-mono">
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      {formatDate(order.timestamp)}
                                    </p>
                                  </div>
                                  <span
                                    className={`px-3 py-1.5 text-xs font-bold rounded-full border ${order.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                      order.status === "confirmed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                        order.status === "picked_up" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                          order.status === "in_transit" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                            order.status === "delivered" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                              "bg-red-500/10 text-red-400 border-red-500/20"
                                      }`}
                                  >
                                    {order.status.replace("_", " ")}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-card rounded-[24px] border border-[#ffffff05] overflow-hidden">
                        <div className="px-8 py-6 border-b border-[#ffffff0a] flex justify-between items-center bg-[#152a1d]">
                          <h3 className="text-lg font-bold text-foreground tracking-wide">
                            Recent Messages
                          </h3>
                          <button
                            onClick={() => setActiveTab("messages")}
                            className="text-sm text-secondary hover:text-foreground font-bold tracking-wider uppercase transition-colors"
                          >
                            View All
                          </button>
                        </div>
                        <div className="p-4 lg:p-6">
                          <div className="space-y-3">
                            {isLoading ? (
                              <div className="space-y-4">
                                <Skeleton className="h-16 w-full rounded-xl bg-[#ffffff0a]" />
                                <Skeleton className="h-16 w-full rounded-xl bg-[#ffffff0a]" />
                                <Skeleton className="h-16 w-full rounded-xl bg-[#ffffff0a]" />
                              </div>
                            ) : messages.length === 0 ? (
                              <div className="py-12 text-center">
                                <MessageSquare className="w-12 h-12 text-[#3a4f41] mx-auto mb-3" />
                                <p className="text-sm font-bold text-muted-foreground">No recent messages</p>
                              </div>
                            ) : (
                              messages.slice(0, 5).map((message) => (
                                <div
                                  key={message.id}
                                  className="flex items-center justify-between p-4 bg-background/50 hover:bg-background rounded-xl border border-[#ffffff05] transition-all"
                                >
                                  <div>
                                    <p className="text-sm font-bold text-foreground mb-1">
                                      {message.name}
                                    </p>
                                    <p className="text-sm text-secondary">
                                      {message.subject}
                                    </p>
                                    <p className="text-xs text-[#596960] mt-1 font-mono">
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      {formatDate(message.timestamp)}
                                    </p>
                                  </div>
                                  <span
                                    className={`px-3 py-1.5 text-xs font-bold rounded-full border ${message.status === "new" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                      message.status === "replied" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                        "bg-background0/10 text-gray-400 border-gray-500/20"
                                      }`}
                                  >
                                    {message.status}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedPage>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <AnimatedPage>
                  <div className="space-y-8">
                    {/* Search and Filter */}
                    <div className="flex flex-col gap-6">
                      <div className="flex lg:hidden items-center justify-between">
                        <h2 className="text-3xl font-bold text-foreground">Order<br />Management</h2>
                        <button
                          onClick={async () => {
                            setIsLoading(true);
                            try {
                              await fetchOrders(1);
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          disabled={isLoading}
                          className="flex items-center space-x-2 bg-secondary text-black font-bold px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)] disabled:opacity-50"
                        >
                          {isLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          <span className="text-sm">Refresh</span>
                        </button>
                      </div>

                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                        <input
                          type="text"
                          placeholder="Search orders..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-transparent border border-[#eab308]/30 text-foreground placeholder:text-[#3a4f41] rounded-[16px] pl-12 pr-4 py-4 focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] transition-all"
                        />
                      </div>

                      <div className="flex space-x-3 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar">
                        <div className="relative min-w-[120px]">
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full appearance-none bg-card border border-[#eab308]/30 text-secondary font-bold rounded-full px-5 py-2 pr-10 focus:outline-none focus:border-[#eab308]"
                          >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="picked_up">Picked Up</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
                        </div>
                        <button className="whitespace-nowrap bg-background border border-[#ffffff10] text-foreground font-bold rounded-full px-5 py-2 hover:bg-card">
                          Today
                        </button>
                        <button className="whitespace-nowrap bg-background border border-[#ffffff10] text-foreground font-bold rounded-full px-5 py-2 hover:bg-card">
                          Completed
                        </button>
                      </div>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-4">
                      {isLoading ? (
                        <CardSkeleton />
                      ) : filteredOrders.length === 0 ? (
                        <div className="bg-card rounded-[24px] border border-transparent p-12 text-center shadow-lg relative overflow-hidden">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/5 blur-[80px] rounded-full pointer-events-none" />

                          <div className="w-24 h-24 bg-secondary rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(234,179,8,0.2)] relative z-10 border-4 border-[#112417] outline outline-1 outline-[#eab308]/20">
                            <Package className="w-12 h-12 text-black" />
                          </div>
                          <h3 className="text-2xl font-bold text-foreground mb-3 relative z-10">
                            No orders found
                          </h3>
                          <p className="text-muted-foreground max-w-xs mx-auto mb-8 relative z-10 text-sm">
                            Try adjusting your search or filters to find what you're looking for.
                          </p>

                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setStatusFilter("all");
                            }}
                            className="flex items-center space-x-2 mx-auto text-secondary font-bold text-sm tracking-wide relative z-10 hover:text-foreground transition-colors"
                          >
                            <Filter className="w-4 h-4" />
                            <span>Reset Filters</span>
                          </button>
                        </div>
                      ) : (
                        filteredOrders.map((order) => (
                          <div
                            key={order.id}
                            className="bg-card rounded-[20px] shadow-lg border border-[#ffffff05] p-6 lg:p-8"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
                              <div>
                                <h3 className="text-xl font-bold text-foreground mb-1">
                                  {order.id}
                                </h3>
                                <p className="text-muted-foreground font-medium">
                                  {order.customerName} • <span className="text-secondary">{order.customerPhone}</span>
                                </p>
                                <p className="text-xs text-[#596960] mt-2 font-mono">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  Created: {formatDate(order.timestamp)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-3 self-start">
                                <span
                                  className={`px-4 py-1.5 text-xs font-bold rounded-full border tracking-wide uppercase ${order.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                    order.status === "confirmed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                      order.status === "picked_up" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                        order.status === "in_transit" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                          order.status === "delivered" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                            "bg-red-500/10 text-red-400 border-red-500/20"
                                    }`}
                                >
                                  {order.status.replace("_", " ")}
                                </span>
                                <div className="flex bg-background rounded-lg border border-[#ffffff05] overflow-hidden">
                                  <button
                                    onClick={() =>
                                      setEditingOrder(
                                        editingOrder === order.id ? null : order.id,
                                      )
                                    }
                                    className="p-2.5 text-muted-foreground hover:text-secondary hover:bg-card/5 transition-colors border-r border-[#ffffff05]"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteOrder(order.id)}
                                    className="p-2.5 text-red-500/70 hover:text-red-400 hover:bg-card/5 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6 p-5 bg-background/50 rounded-xl border border-[#ffffff05]">
                              <div>
                                <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-1">
                                  Pickup
                                </p>
                                <p className="text-sm text-foreground font-medium">{order.pickup}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-1">
                                  Delivery
                                </p>
                                <p className="text-sm text-foreground font-medium">
                                  {order.delivery}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-1">
                                  Cost
                                </p>
                                <p className="text-sm text-secondary font-bold">
                                  KES {order.cost} <span className="text-muted-foreground font-normal">({order.distance}km)</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-1">
                                  Status Updated
                                </p>
                                <p className="text-sm text-foreground font-mono">
                                  {order.updatedAt
                                    ? formatDate(order.updatedAt)
                                    : "Not updated"}
                                </p>
                              </div>
                            </div>

                            {order.riderName && (
                              <div className="mb-6 p-4 bg-[#1a2b20] border border-green-500/20 rounded-xl flex items-center space-x-4">
                                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                                  <Bike className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-0.5">
                                    Assigned Rider
                                  </p>
                                  <p className="text-sm text-foreground font-medium">
                                    {order.riderName} • <span className="text-gray-400">{order.riderPhone}</span>
                                  </p>
                                </div>
                              </div>
                            )}

                            {order.notes && (
                              <div className="mb-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                                <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider mb-2 flex items-center">
                                  <MessageSquare className="w-3 h-3 mr-1.5" /> Notes
                                </p>
                                <p className="text-sm text-yellow-100">{order.notes}</p>
                              </div>
                            )}

                            {/* Order Actions */}
                            {editingOrder === order.id ? (
                              <div className="border-t border-[#ffffff10] pt-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
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
                                      className="w-full bg-background border border-[#ffffff15] text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-[#eab308]"
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
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                      Assign Rider
                                    </label>
                                    {order.riderName ? (
                                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                        <p className="text-sm font-bold text-green-400">
                                          {order.riderName}
                                        </p>
                                        <p className="text-xs text-green-300 mb-2">
                                          {order.riderPhone}
                                        </p>
                                        <button
                                          onClick={() => setAssigningRider(order.id)}
                                          className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-1.5 rounded-lg font-bold transition-colors"
                                        >
                                          Change Rider
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setAssigningRider(order.id)}
                                        className="w-full p-4 border-2 border-dashed border-[#ffffff15] rounded-xl text-muted-foreground font-bold hover:border-[#eab308] hover:text-secondary transition-colors"
                                      >
                                        + Assign Rider
                                      </button>
                                    )}

                                    {assigningRider === order.id && (
                                      <div className="mt-3 p-4 bg-background rounded-xl border border-[#ffffff10]">
                                        <label className="block text-xs font-bold text-secondary mb-3">
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
                                          className="w-full bg-card border border-[#ffffff15] text-foreground rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-[#eab308]"
                                          defaultValue=""
                                        >
                                          <option value="">Choose a rider...</option>
                                          {availableRiders.map((rider) => (
                                            <option key={rider.id} value={rider.id}>
                                              {rider.fullName} - {rider.area} ({rider.rating}★)
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          onClick={() => setAssigningRider(null)}
                                          className="mt-3 w-full text-xs font-bold text-muted-foreground hover:text-foreground bg-card/5 py-2 rounded-lg"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => setEditingOrder(null)}
                                  className="w-full bg-secondary text-black font-bold px-4 py-3 rounded-xl hover:bg-[#ca8a04] transition-colors"
                                >
                                  Save Changes
                                </button>
                              </div>
                            ) : (
                              <div className="border-t border-[#ffffff10] pt-6 mt-2">
                                {/* Payment Confirmation Section */}
                                <div className="mb-6 p-5 bg-secondary/5 border border-border/20 rounded-xl relative overflow-hidden">
                                  <div className="absolute right-0 top-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
                                  <h4 className="font-bold text-secondary mb-3 flex items-center tracking-wide relative z-10">
                                    <DollarSign className="w-4 h-4 mr-2" /> Payment Management
                                  </h4>
                                  <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                                    <button
                                      onClick={() =>
                                        confirmPaymentAndSendReceipt(order.id)
                                      }
                                      className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-3 rounded-xl hover:bg-green-500/30 text-sm font-bold flex items-center justify-center transition-colors"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" /> Confirm Payment
                                    </button>
                                    <button
                                      onClick={() => resendReceipt(order.id)}
                                      className="flex-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-3 rounded-xl hover:bg-blue-500/30 text-sm font-bold flex items-center justify-center transition-colors"
                                    >
                                      <Mail className="w-4 h-4 mr-2" /> Resend Receipt
                                    </button>
                                  </div>
                                  <p className="text-muted-foreground text-xs mt-3 relative z-10">
                                    Receipts are linked to <strong>{order.customerEmail}</strong>
                                  </p>
                                </div>

                                {/* Order Status Management */}
                                <div className="flex flex-wrap gap-3">
                                  {order.status === "pending" && (
                                    <button
                                      onClick={() =>
                                        updateOrderStatus(order.id, "confirmed")
                                      }
                                      className="flex-1 min-w-[140px] bg-blue-600 text-foreground font-bold px-4 py-3 rounded-xl hover:bg-blue-700 text-sm flex justify-center items-center shadow-lg"
                                    >
                                      Confirm Order
                                    </button>
                                  )}
                                  {order.status === "confirmed" && (
                                    <button
                                      onClick={() =>
                                        updateOrderStatus(order.id, "picked_up")
                                      }
                                      className="flex-1 min-w-[140px] bg-purple-600 text-foreground font-bold px-4 py-3 rounded-xl hover:bg-purple-700 text-sm flex justify-center items-center shadow-lg"
                                    >
                                      Mark Picked Up
                                    </button>
                                  )}
                                  {order.status === "picked_up" && (
                                    <button
                                      onClick={() =>
                                        updateOrderStatus(order.id, "in_transit")
                                      }
                                      className="flex-1 min-w-[140px] bg-orange-600 text-foreground font-bold px-4 py-3 rounded-xl hover:bg-orange-700 text-sm flex justify-center items-center shadow-lg"
                                    >
                                      In Transit
                                    </button>
                                  )}
                                  {order.status === "in_transit" && (
                                    <button
                                      onClick={() =>
                                        updateOrderStatus(order.id, "delivered")
                                      }
                                      className="flex-1 min-w-[140px] bg-green-600 text-foreground font-bold px-4 py-3 rounded-xl hover:bg-green-700 text-sm flex justify-center items-center shadow-lg"
                                    >
                                      Mark Delivered
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination Controls */}
                    <div className="mt-10 bg-card p-2 rounded-2xl border border-[#ffffff05] shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
                      <div className="flex items-center justify-between px-4 py-2">
                        <p className="text-sm font-bold text-muted-foreground">
                          Showing page <span className="text-foreground">{currentPage}</span> of{' '}
                          <span className="text-foreground">{totalPages}</span>
                        </p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => fetchOrders(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 border border-[#ffffff10] rounded-xl text-secondary hover:bg-card/5 hover:border-[#eab308]/50 disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => fetchOrders(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 border border-[#ffffff10] rounded-xl text-secondary hover:bg-card/5 hover:border-[#eab308]/50 disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedPage>
              )}

              {/* Messages Tab */}
              {activeTab === "messages" && (
                <AnimatedPage>
                  <div className="space-y-8">
                    {/* Search */}
                    <div className="bg-card p-6 lg:p-8 rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-[#ffffff05] relative overflow-hidden flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

                      <div className="relative w-full sm:w-2/3">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                        <input
                          type="text"
                          placeholder="Search messages by name, subject or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 w-full bg-background border border-[#eab308]/30 rounded-[16px] px-4 py-4 text-foreground placeholder:text-[#3a4f41] focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] transition-all"
                        />
                      </div>

                      <button
                        onClick={async () => {
                          setIsLoading(true);
                          try {
                            await fetchMessages(1);
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-secondary text-black font-bold px-6 py-4 rounded-[16px] shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all hover:bg-[#ca8a04] disabled:opacity-50 relative z-10"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-5 h-5" />
                        )}
                        <span>Refresh</span>
                      </button>
                    </div>

                    {/* Messages List */}
                    <div className="space-y-4">
                      {isLoading ? (
                        <CardSkeleton />
                      ) : filteredMessages.length === 0 ? (
                        <div className="bg-card rounded-[24px] border border-transparent p-12 text-center shadow-lg relative overflow-hidden">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 blur-[80px] rounded-full pointer-events-none" />

                          <div className="w-24 h-24 bg-green-500/10 rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(34,197,94,0.1)] relative z-10 border-4 border-[#112417] outline outline-1 outline-green-500/20">
                            <MessageSquare className="w-12 h-12 text-green-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-foreground mb-3 relative z-10">
                            No messages found
                          </h3>
                          <p className="text-muted-foreground max-w-xs mx-auto mb-8 relative z-10 text-sm">
                            You're all caught up! No new messages from customers matching your search.
                          </p>
                        </div>
                      ) : (
                        filteredMessages.map((message) => (
                          <div
                            key={message.id}
                            className="bg-card rounded-[20px] shadow-lg border border-[#ffffff05] p-6 lg:p-8"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-background border border-border/20 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.1)] text-secondary font-bold text-lg">
                                  {message.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="text-xl font-bold text-foreground">
                                    {message.name}
                                  </h4>
                                  <div className="flex items-center text-xs text-[#596960] mt-1 font-mono">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatDate(message.timestamp)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3 self-start">
                                <span
                                  className={`px-4 py-1.5 text-xs font-bold rounded-full border tracking-wide uppercase ${message.status === "new" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                    message.status === "replied" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                      "bg-background0/10 text-gray-400 border-gray-500/20"
                                    }`}
                                >
                                  {message.status}
                                </span>
                                <button
                                  onClick={() => deleteMessage(message.id)}
                                  className="p-2.5 text-red-500/70 hover:text-red-400 bg-background rounded-lg border border-[#ffffff05] hover:bg-card/5 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-background/50 rounded-xl border border-[#ffffff05]">
                              <div className="flex items-center text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground mr-3" />
                                <span className="text-foreground font-medium">{message.email}</span>
                              </div>
                              {message.phone && (
                                <div className="flex items-center text-sm">
                                  <Phone className="w-4 h-4 text-muted-foreground mr-3" />
                                  <span className="text-foreground font-medium">{message.phone}</span>
                                </div>
                              )}
                            </div>

                            <div className="mb-6">
                              <h5 className="font-bold text-secondary mb-3 text-lg">
                                {message.subject}
                              </h5>
                              <div className="p-5 bg-card/5 rounded-xl border border-border text-gray-300 leading-relaxed text-sm">
                                {message.message}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                              {message.status === "new" && (
                                <button
                                  onClick={() => markAsRead(message.id)}
                                  className="flex items-center space-x-2 bg-[#2a3c31] hover:bg-[#344a3d] text-foreground px-5 py-2.5 rounded-xl text-sm font-bold transition-colors border border-border"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>Mark as Read</span>
                                </button>
                              )}

                              <button
                                onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                                className="flex items-center space-x-2 bg-secondary hover:bg-[#ca8a04] text-black px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                              >
                                <Edit className="w-4 h-4" />
                                <span>{replyingTo === message.id ? 'Cancel Reply' : 'Reply Here'}</span>
                              </button>

                              <a
                                href={`mailto:${message.email}?subject=Re: ${message.subject}&body=Dear ${message.name},%0D%0A%0D%0AThank you for contacting Rocs Crew.%0D%0A%0D%0A`}
                                className="flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                              >
                                <Mail className="w-4 h-4" />
                                <span>Email Client</span>
                              </a>
                            </div>

                            {/* Reply Form */}
                            {replyingTo === message.id && (
                              <div className="mt-6 p-6 bg-background rounded-xl border border-[#ffffff10] relative overflow-hidden">
                                <div className="absolute right-0 bottom-0 w-32 h-32 bg-secondary/5 blur-xl pointer-events-none" />
                                <h6 className="font-bold text-secondary mb-4 flex items-center tracking-wide">
                                  <Edit className="w-4 h-4 mr-2" /> Reply to {message.name}
                                </h6>
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  rows={5}
                                  className="w-full px-4 py-3 bg-card text-foreground border border-[#ffffff15] rounded-xl focus:outline-none focus:border-[#eab308] resize-none mb-4"
                                  placeholder="Type your official reply here..."
                                />
                                <div className="flex justify-end space-x-3">
                                  <button
                                    onClick={() => setReplyingTo(null)}
                                    className="bg-card/5 hover:bg-card/10 text-muted-foreground hover:text-foreground px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => sendReply(message.id)}
                                    disabled={!replyText.trim()}
                                    className="bg-secondary hover:bg-[#ca8a04] text-black px-6 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                                  >
                                    Send Reply
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination Controls */}
                    <div className="mt-10 bg-card p-2 rounded-2xl border border-[#ffffff05] shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
                      <div className="flex items-center justify-between px-4 py-2">
                        <p className="text-sm font-bold text-muted-foreground">
                          Showing page <span className="text-foreground">{currentPage}</span> of{' '}
                          <span className="text-foreground">{totalPages}</span>
                        </p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => fetchMessages(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 border border-[#ffffff10] rounded-xl text-secondary hover:bg-card/5 hover:border-[#eab308]/50 disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => fetchMessages(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 border border-[#ffffff10] rounded-xl text-secondary hover:bg-card/5 hover:border-[#eab308]/50 disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedPage>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <AnimatedPage>
                  <div className="space-y-8">
                    {/* Search Header */}
                    <div className="bg-card p-6 lg:p-8 rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-[#ffffff05] relative overflow-hidden flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

                      <div className="relative w-full sm:w-2/3">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                        <input
                          type="text"
                          placeholder="Search users by name, email or phone..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 w-full bg-background border border-[#eab308]/30 rounded-[16px] px-4 py-4 text-foreground placeholder:text-[#3a4f41] focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] transition-all"
                        />
                      </div>

                      <div className="flex space-x-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-background text-foreground border border-[#ffffff10] font-bold px-6 py-4 rounded-[16px] hover:bg-card/5 transition-all">
                          <Filter className="w-5 h-5 text-secondary" />
                          <span>Filter</span>
                        </button>
                      </div>
                    </div>

                    {/* Users List */}
                    <div className="bg-card rounded-[24px] shadow-lg border border-[#ffffff05] overflow-hidden">
                      <div className="px-8 py-6 border-b border-[#ffffff0a] flex justify-between items-center bg-[#152a1d]">
                        <h3 className="text-lg font-bold text-foreground tracking-wide flex items-center">
                          <Users className="w-5 h-5 text-secondary mr-3" /> Customer Directory
                        </h3>
                        <span className="bg-background text-secondary font-mono text-xs px-3 py-1 rounded-full border border-border/20">
                          Total: {filteredUsers.length}
                        </span>
                      </div>

                      {isLoading ? (
                        <div className="p-8"><TableSkeleton /></div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center">
                          <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 border border-[#ffffff0a]">
                            <Users className="w-10 h-10 text-[#3a4f41]" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            No users found
                          </h3>
                          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                            No customer profiles match your current search criteria.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                          <table className="min-w-full divide-y divide-[#ffffff0a]">
                            <thead className="bg-background/50">
                              <tr>
                                <th className="px-8 py-5 text-left text-xs font-bold text-[#596960] uppercase tracking-widest pl-10">
                                  Customer Profile
                                </th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-[#596960] uppercase tracking-widest">
                                  Contact Info
                                </th>
                                <th className="px-8 py-5 text-center text-xs font-bold text-[#596960] uppercase tracking-widest">
                                  Order Activity
                                </th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-[#596960] uppercase tracking-widest">
                                  Lifetime Value
                                </th>
                                <th className="px-8 py-5 text-center text-xs font-bold text-[#596960] uppercase tracking-widest">
                                  Status
                                </th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-[#596960] uppercase tracking-widest pr-10">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ffffff0a]">
                              {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-background/40 transition-colors group">
                                  <td className="px-8 py-5 whitespace-nowrap pl-10">
                                    <div className="flex items-center space-x-4">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a2b20] to-[#0a110d] border border-border/20 flex items-center justify-center text-secondary font-bold shadow-inner">
                                        {user.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <div className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors">
                                          {user.name}
                                        </div>
                                        <div className="text-xs text-[#596960] mt-1 font-mono">
                                          Joined {formatDate(user.joinDate)}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-8 py-5 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                                      <Mail className="w-3.5 h-3.5 mr-2 text-[#596960]" />
                                      {user.email}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <Phone className="w-3.5 h-3.5 mr-2 text-[#596960]" />
                                      {user.phone}
                                    </div>
                                  </td>
                                  <td className="px-8 py-5 whitespace-nowrap text-center">
                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-background border border-[#ffffff0a] group-hover:border-[#eab308]/30 transition-colors">
                                      <span className="text-sm font-bold text-foreground">{user.totalOrders}</span>
                                    </div>
                                  </td>
                                  <td className="px-8 py-5 whitespace-nowrap text-right">
                                    <span className="text-sm font-bold text-secondary">
                                      KES {user.totalSpent.toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="px-8 py-5 whitespace-nowrap text-center">
                                    <span
                                      className={`px-4 py-1.5 inline-flex text-xs font-bold rounded-full uppercase tracking-wider border ${user.status === "active"
                                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                        }`}
                                    >
                                      {user.status}
                                    </span>
                                  </td>
                                  <td className="px-8 py-5 whitespace-nowrap text-right pr-10">
                                    <button
                                      onClick={() => toggleUserStatus(user.id)}
                                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${user.status === "active"
                                        ? "bg-background text-red-400 hover:bg-red-500/10 border-red-500/20"
                                        : "bg-background text-green-400 hover:bg-green-500/10 border-green-500/20"
                                        }`}
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
                      )}
                    </div>
                  </div>
                </AnimatedPage>
              )}
              {/* Riders Tab */}
              {activeTab === "riders" && (
                <AnimatedPage>
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 px-2">
                      <div>
                        <div className="flex items-center space-x-2 text-secondary font-bold text-xs tracking-wider uppercase mb-1">
                          <Shield className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </div>
                        <h2 className="text-3xl font-bold text-foreground tracking-tight">
                          Rider Management
                        </h2>
                      </div>
                      <button
                        onClick={async () => {
                          setIsLoading(true);
                          try {
                            await fetchRiders();
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="flex items-center space-x-2 bg-secondary hover:bg-[#ca8a04] text-black font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-card p-5 sm:p-6 rounded-[24px] border border-[#ffffff05] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-green-500/20 transition-all relative overflow-hidden group">
                        <div className="absolute top-4 right-4 bg-background p-2 rounded-xl border border-[#ffffff05] group-hover:border-border/20 transition-all">
                          <ClipboardList className="w-5 h-5 text-[#3a4f41] group-hover:text-secondary/70" />
                        </div>
                        <div className="text-4xl font-black text-secondary mb-2">
                          {riders.filter((r) => r.status === "pending").length}
                        </div>
                        <div className="text-xs font-bold text-[#596960] uppercase tracking-widest">Pending</div>
                      </div>

                      <div className="bg-card p-5 sm:p-6 rounded-[24px] border border-[#ffffff05] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-green-500/20 transition-all relative overflow-hidden group">
                        <div className="absolute top-4 right-4 bg-background p-2 rounded-xl border border-[#ffffff05] group-hover:border-border/20 transition-all">
                          <UserCheck className="w-5 h-5 text-[#3a4f41] group-hover:text-secondary/70" />
                        </div>
                        <div className="text-4xl font-black text-secondary mb-2">
                          {riders.filter((r) => r.status === "approved").length}
                        </div>
                        <div className="text-xs font-bold text-[#596960] uppercase tracking-widest">Approved</div>
                      </div>

                      <div className="bg-card p-5 sm:p-6 rounded-[24px] border border-[#ffffff05] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-green-500/20 transition-all relative overflow-hidden group">
                        <div className="absolute top-4 right-4 bg-background p-2 rounded-xl border border-[#ffffff05] group-hover:border-border/20 transition-all">
                          <UserX className="w-5 h-5 text-[#3a4f41] group-hover:text-secondary/70" />
                        </div>
                        <div className="text-4xl font-black text-secondary mb-2">
                          {riders.filter((r) => r.status === "rejected").length}
                        </div>
                        <div className="text-xs font-bold text-[#596960] uppercase tracking-widest">Rejected</div>
                      </div>

                      <div className="bg-card p-5 sm:p-6 rounded-[24px] border border-[#ffffff05] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-green-500/20 transition-all relative overflow-hidden group">
                        <div className="absolute top-4 right-4 bg-background p-2 rounded-xl border border-[#ffffff05] group-hover:border-border/20 transition-all">
                          <Bike className="w-5 h-5 text-[#3a4f41] group-hover:text-secondary/70" />
                        </div>
                        <div className="text-4xl font-black text-secondary mb-2">
                          {riders.filter((r) => r.isActive).length}
                        </div>
                        <div className="text-xs font-bold text-[#596960] uppercase tracking-widest">Active</div>
                      </div>
                    </div>

                    {/* Riders List */}
                    <div className="space-y-4">
                      {isLoading ? (
                        <CardSkeleton />
                      ) : riders.length === 0 ? (
                        <div className="bg-background border border-[#ffffff05] rounded-[32px] p-16 text-center shadow-lg relative overflow-hidden my-8">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/5 blur-[80px] rounded-full pointer-events-none" />
                          <Bike className="w-20 h-20 text-secondary mx-auto mb-6 relative z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                          <h3 className="text-2xl font-bold text-foreground mb-3 relative z-10">
                            No riders found
                          </h3>
                          <p className="text-muted-foreground max-w-xs mx-auto mb-10 relative z-10">
                            No rider applications have been submitted yet.
                          </p>
                          <div className="flex justify-center items-center space-x-2 relative z-10">
                            <div className="w-6 h-2 bg-secondary rounded-full"></div>
                            <div className="w-2 h-2 bg-[#3a4f41] rounded-full"></div>
                            <div className="w-2 h-2 bg-[#3a4f41] rounded-full"></div>
                            <div className="w-2 h-2 bg-[#3a4f41] rounded-full"></div>
                            <div className="w-2 h-2 bg-[#3a4f41] rounded-full"></div>
                          </div>
                        </div>
                      ) : (
                        riders.map((rider) => (
                          <div
                            key={rider.id}
                            className="bg-card rounded-[24px] shadow-lg border border-[#ffffff05] p-6 lg:p-8"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-background border border-border/20 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                                  <Bike className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-foreground">
                                    {rider.fullName}
                                  </h3>
                                  <p className="text-muted-foreground text-sm mt-1 font-mono">
                                    {rider.id} • <span className="text-secondary">{rider.area}</span>
                                  </p>
                                  {rider.rating > 0 && (
                                    <div className="flex items-center space-x-1 mt-2">
                                      <Star className="w-4 h-4 text-secondary fill-current" />
                                      <span className="text-sm font-bold text-foreground">
                                        {rider.rating} <span className="text-[#596960] font-normal">({rider.totalDeliveries} deliveries)</span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col sm:items-end space-y-2">
                                <span
                                  className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border ${rider.status === "approved"
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : rider.status === "pending"
                                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                      : "bg-red-500/10 text-red-400 border-red-500/20"
                                    }`}
                                >
                                  {rider.status}
                                </span>

                                {rider.status === "approved" && (
                                  <span
                                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${rider.isActive
                                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                                      : "bg-background0/10 text-gray-400 border-gray-500/20"
                                      }`}
                                  >
                                    {rider.isActive ? "Active" : "Inactive"}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-5 bg-background/50 rounded-[16px] border border-[#ffffff05]">
                              <div>
                                <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-2">
                                  Contact
                                </p>
                                <div className="flex items-center text-sm text-foreground mb-1.5">
                                  <Mail className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                  {rider.email}
                                </div>
                                <div className="flex items-center text-sm text-foreground">
                                  <Phone className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                  {rider.phone}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-2">
                                  Motorcycle Info
                                </p>
                                <p className="text-sm text-foreground font-medium mb-1.5">
                                  {rider.motorcycle}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Exp: <span className="text-foreground">{rider.experience}</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-2">
                                  Dates
                                </p>
                                <p className="text-sm text-foreground font-mono mb-1.5 flex items-center">
                                  <Clock className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                  {formatDate(rider.joinedAt)}
                                </p>
                                {rider.updatedAt && (
                                  <p className="text-xs text-[#596960] font-mono flex items-center">
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    {formatDate(rider.updatedAt)}
                                  </p>
                                )}
                              </div>
                            </div>

                            {rider.motivation && (
                              <div className="mb-6 p-5 bg-background rounded-[16px] border border-[#ffffff05]">
                                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex items-center">
                                  <Star className="w-3.5 h-3.5 mr-1.5" /> Motivation
                                </p>
                                <p className="text-sm text-gray-300 italic leading-relaxed">
                                  "{rider.motivation}"
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap items-center justify-between pt-5 border-t border-[#ffffff0a] gap-4">
                              <div className="flex flex-wrap gap-3">
                                {rider.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        updateRiderStatus(rider.id, "approved")
                                      }
                                      className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                    >
                                      <UserCheck className="w-4 h-4" />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      onClick={() =>
                                        updateRiderStatus(rider.id, "rejected")
                                      }
                                      className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-xl text-sm font-bold transition-all"
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
                                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all border ${rider.isActive
                                      ? "bg-background text-red-400 hover:bg-red-500/10 border-red-500/20"
                                      : "bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20"
                                      }`}
                                  >
                                    {rider.isActive ? "Deactivate Rider" : "Activate Rider"}
                                  </button>
                                )}
                              </div>

                              <button
                                onClick={() => deleteRider(rider.id)}
                                className="flex items-center space-x-2 bg-background text-red-500/70 border border-[#ffffff05] hover:text-red-400 hover:bg-card/5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </AnimatedPage>
              )}
              {/* Partnership Requests Tab */}
              {activeTab === "partnerships" && (
                <AnimatedPage>
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 px-2">
                      <div>
                        <h2 className="text-3xl font-bold text-foreground tracking-tight mb-1">
                          Partnership Requests
                        </h2>
                        <div className="text-muted-foreground text-sm">
                          Nairobi Admin Panel
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          setIsLoading(true);
                          try {
                            await fetchPartnershipRequests();
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="flex items-center space-x-2 bg-secondary hover:bg-[#ca8a04] text-black font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 sm:gap-6">
                      <div className="bg-card p-5 sm:p-6 rounded-[24px] border border-[#ffffff05] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-green-500/20 transition-all text-center">
                        <div className="text-4xl font-black text-secondary mb-2">
                          {partnershipRequests.filter((r) => r.status === "pending").length}
                        </div>
                        <div className="text-xs font-bold text-[#596960] uppercase tracking-widest">Pending</div>
                      </div>

                      <div className="bg-card p-5 sm:p-6 rounded-[24px] border border-[#ffffff05] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-green-500/20 transition-all text-center">
                        <div className="text-4xl font-black text-secondary mb-2">
                          {partnershipRequests.filter((r) => r.status === "approved").length}
                        </div>
                        <div className="text-xs font-bold text-[#596960] uppercase tracking-widest">Approved</div>
                      </div>

                      <div className="bg-card p-5 sm:p-6 rounded-[24px] border border-[#ffffff05] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-green-500/20 transition-all text-center">
                        <div className="text-4xl font-black text-secondary mb-2">
                          {partnershipRequests.filter((r) => r.status === "rejected").length}
                        </div>
                        <div className="text-xs font-bold text-[#596960] uppercase tracking-widest">Rejected</div>
                      </div>
                    </div>

                    {/* Partnership Requests List */}
                    <div className="space-y-4">
                      {isLoading ? (
                        <CardSkeleton />
                      ) : partnershipRequests.length === 0 ? (
                        <div className="bg-background rounded-[32px] p-16 text-center border border-dashed border-[#ffffff15] relative overflow-hidden my-8">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/5 blur-[80px] rounded-full pointer-events-none" />

                          <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 border border-border/20">
                            <Handshake className="w-10 h-10 text-secondary" />
                          </div>
                          <h3 className="text-2xl font-bold text-foreground mb-4 relative z-10">
                            No partnership requests found
                          </h3>
                          <p className="text-muted-foreground max-w-sm mx-auto mb-10 relative z-10 leading-relaxed text-sm">
                            New applications from motorcycle delivery partners will appear here for review.
                          </p>

                          <button className="bg-card hover:bg-[#152a1d] text-foreground border border-[#ffffff10] px-6 py-3 rounded-xl font-bold text-sm transition-all relative z-10">
                            View Archives
                          </button>
                        </div>
                      ) : (
                        partnershipRequests.map((request) => (
                          <div
                            key={request.id}
                            className="bg-card rounded-[24px] shadow-lg border border-[#ffffff05] p-6 lg:p-8"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                              <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-background border border-border/20 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                                  <Building2 className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-foreground">
                                    {request.companyName}
                                  </h3>
                                  <p className="text-muted-foreground text-sm mt-1 font-mono">
                                    {request.id} • <span className="text-secondary">{request.businessCategory}</span>
                                  </p>
                                  <p className="text-xs text-[#596960] mt-2 font-mono flex items-center">
                                    <Clock className="w-3 h-3 mr-1.5" />
                                    Submitted: {formatDate(request.timestamp)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center">
                                <span
                                  className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border ${request.status === "approved"
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : request.status === "pending"
                                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                      : "bg-red-500/10 text-red-400 border-red-500/20"
                                    }`}
                                >
                                  {request.status}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-5 bg-background/50 rounded-[16px] border border-[#ffffff05]">
                              <div>
                                <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-2">
                                  Contact Details
                                </p>
                                <p className="text-sm font-bold text-foreground mb-2">{request.contactPerson}</p>
                                <div className="flex items-center text-sm text-foreground mb-1.5">
                                  <Mail className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                  {request.email}
                                </div>
                                <div className="flex items-center text-sm text-foreground">
                                  <Phone className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                  {request.phone}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-2">
                                  Business Context
                                </p>
                                <p className="text-sm text-muted-foreground mb-1.5">
                                  Category: <span className="text-foreground">{request.businessCategory}</span>
                                </p>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Volume: <span className="text-foreground">{request.deliveryVolume}</span>
                                </p>
                                {request.updatedAt && (
                                  <p className="text-xs text-[#596960] font-mono flex items-center pt-2 border-t border-[#ffffff0a]">
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Last updated: {formatDate(request.updatedAt)}
                                  </p>
                                )}
                              </div>
                            </div>

                            {request.message && (
                              <div className="mb-6 p-5 bg-background rounded-[16px] border border-[#ffffff05]">
                                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex items-center">
                                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Request Message
                                </p>
                                <p className="text-sm text-gray-300 italic leading-relaxed">
                                  "{request.message}"
                                </p>
                              </div>
                            )}

                            {request.adminNotes && (
                              <div className="mb-6 p-5 bg-[#1a2b20] rounded-[16px] border border-green-500/20">
                                <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 flex items-center">
                                  <FileText className="w-3.5 h-3.5 mr-1.5" /> Admin Notes
                                </p>
                                <p className="text-sm text-foreground/90">
                                  {request.adminNotes}
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap items-center justify-between pt-5 border-t border-[#ffffff0a] gap-4">
                              <div className="flex flex-wrap gap-3">
                                {request.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        updatePartnershipRequestStatus(
                                          request.id,
                                          "approved",
                                        )
                                      }
                                      className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 px-4 py-2 rounded-xl text-sm font-bold transition-all"
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
                                      className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                    >
                                      <AlertCircle className="w-4 h-4" />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                )}

                                {request.status !== "pending" && (
                                  <span className="text-sm text-[#596960] font-mono px-2 py-1 bg-background rounded-lg border border-[#ffffff05]">
                                    Request {request.status} on{" "}
                                    {request.updatedAt
                                      ? formatDate(request.updatedAt)
                                      : "Unknown date"}
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => deletePartnershipRequest(request.id)}
                                className="flex items-center space-x-2 bg-background text-red-500/70 border border-[#ffffff05] hover:text-red-400 hover:bg-card/5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </AnimatedPage>
              )}
              {/* Rider Earnings Tab */}
              {activeTab === "rider-earnings" && (
                <AnimatedPage>
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 px-2">
                      <div>
                        <h2 className="text-3xl font-bold text-foreground tracking-tight mb-1">
                          Rider Earnings <br />Management
                        </h2>
                      </div>
                      <button
                        onClick={async () => {
                          setIsLoading(true);
                          try {
                            await fetchRiders();
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="flex items-center space-x-2 bg-secondary hover:bg-[#ca8a04] text-black font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh Data</span>
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-card p-5 sm:p-6 rounded-[24px] border border-green-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-green-500/40 transition-all relative overflow-hidden group">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Pending</div>
                        <div className="text-2xl sm:text-3xl font-black text-secondary">
                          KES{" "}
                          {riders
                            .filter((r) => r.status === "approved")
                            .reduce((sum, r) => sum + (r.currentBalance || 0), 0)
                            .toLocaleString()}
                        </div>
                      </div>

                      <div className="bg-card p-5 sm:p-6 rounded-[24px] border border-green-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-green-500/40 transition-all relative overflow-hidden group">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Earnings</div>
                        <div className="text-2xl sm:text-3xl font-black text-secondary">
                          KES{" "}
                          {riders
                            .filter((r) => r.status === "approved")
                            .reduce((sum, r) => sum + (r.totalEarnings || 0), 0)
                            .toLocaleString()}
                        </div>
                      </div>

                      <div className="bg-card p-5 sm:p-6 rounded-[24px] border border-green-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-green-500/40 transition-all relative overflow-hidden group">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Paid Out</div>
                        <div className="text-2xl sm:text-3xl font-black text-secondary">
                          KES{" "}
                          {riders
                            .filter((r) => r.status === "approved")
                            .reduce((sum, r) => sum + (r.totalWithdrawn || 0), 0)
                            .toLocaleString()}
                        </div>
                      </div>

                      <div className="bg-card p-5 sm:p-6 rounded-[24px] border border-green-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-green-500/40 transition-all relative overflow-hidden group">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Riders w/ Bal</div>
                        <div className="text-2xl sm:text-3xl font-black text-secondary">
                          {
                            riders.filter(
                              (r) =>
                                r.status === "approved" &&
                                (r.currentBalance || 0) > 0,
                            ).length
                          }
                        </div>
                      </div>
                    </div>

                    {/* Riders Earnings List */}
                    <div className="space-y-4">
                      {isLoading ? (
                        <CardSkeleton />
                      ) : riders.filter((r) => r.status === "approved").length ===
                        0 ? (
                        <div className="bg-card rounded-[32px] p-12 sm:p-16 text-center shadow-lg relative overflow-hidden my-8">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 blur-[80px] rounded-full pointer-events-none" />

                          <div className="w-20 h-20 bg-[#162d1d] rounded-[24px] flex items-center justify-center mx-auto mb-8 relative z-10 border border-[#1a3522]">
                            <DollarSign className="w-10 h-10 text-secondary" />
                          </div>
                          <h3 className="text-2xl font-bold text-foreground mb-4 relative z-10">
                            No approved riders found
                          </h3>
                          <p className="text-muted-foreground max-w-sm mx-auto mb-10 relative z-10 leading-relaxed text-sm">
                            Approve riders first from the management panel to start managing their earnings and payouts.
                          </p>

                          <button
                            onClick={() => setActiveTab('riders')}
                            className="bg-background hover:bg-card/5 text-foreground border border-[#ffffff10] px-6 py-3 rounded-xl font-bold text-sm transition-all relative z-10 group"
                          >
                            View Pending Riders <span className="ml-1 group-hover:translate-x-1 inline-block transition-transform">-&gt;</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {riders
                            .filter((r) => r.status === "approved")
                            .map((rider) => (
                              <div
                                key={rider.id}
                                className="bg-card rounded-[24px] shadow-lg border border-[#ffffff05] p-6 lg:p-8 relative overflow-hidden"
                              >
                                <div className="absolute right-0 top-0 w-64 h-64 bg-secondary/5 blur-3xl pointer-events-none rounded-full" />

                                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 bg-background border border-border/20 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                                      <DollarSign className="w-6 h-6 text-secondary" />
                                    </div>
                                    <div>
                                      <h3 className="text-xl font-bold text-foreground">
                                        {rider.fullName}
                                      </h3>
                                      <p className="text-muted-foreground text-sm mt-1 font-mono">
                                        {rider.id} • <span className="text-foreground">{rider.area}</span>
                                      </p>
                                      <div className="flex items-center space-x-1 mt-2">
                                        <Star className="w-4 h-4 text-secondary fill-current" />
                                        <span className="text-sm font-bold text-foreground">
                                          {rider.rating} <span className="text-[#596960] font-normal">({rider.totalDeliveries} deliveries)</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="sm:text-right bg-background/50 p-4 rounded-2xl border border-[#ffffff05]">
                                    <div className="text-xl sm:text-2xl font-black text-green-400 mb-1">
                                      KES {(rider.currentBalance || 0).toLocaleString()}
                                    </div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                      Current Balance
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-5 bg-background/50 rounded-[16px] border border-[#ffffff05]">
                                  <div>
                                    <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-2">
                                      Total Earnings
                                    </p>
                                    <p className="text-sm font-bold text-blue-400">
                                      KES {(rider.totalEarnings || 0).toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-2">
                                      Total Withdrawn
                                    </p>
                                    <p className="text-sm font-bold text-purple-400">
                                      KES {(rider.totalWithdrawn || 0).toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-2">
                                      Last Withdrawal
                                    </p>
                                    <p className="text-sm text-foreground font-mono">
                                      {rider.lastWithdrawal
                                        ? formatDate(rider.lastWithdrawal)
                                        : "Never"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-[#596960] uppercase tracking-wider mb-2">
                                      Contact
                                    </p>
                                    <p className="text-sm text-foreground mb-1">
                                      {rider.email}
                                    </p>
                                    <p className="text-sm text-foreground">
                                      {rider.phone}
                                    </p>
                                  </div>
                                </div>

                                {/* Recent Earnings */}
                                {rider.earnings && rider.earnings.length > 0 && (
                                  <div className="mb-6">
                                    <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 flex items-center">
                                      <Clock className="w-3.5 h-3.5 mr-1.5" /> Recent Earnings
                                    </h4>
                                    <div className="bg-background rounded-[16px] p-4 max-h-40 overflow-y-auto custom-scrollbar border border-[#ffffff05]">
                                      {rider.earnings
                                        .slice(-3)
                                        .map((earning, index) => (
                                          <div
                                            key={index}
                                            className="flex justify-between items-center py-2.5 border-b border-[#ffffff0a] last:border-b-0"
                                          >
                                            <div>
                                              <span className="text-sm font-mono text-foreground">
                                                {earning.orderId}
                                              </span>
                                              <span className="text-xs text-[#596960] font-mono ml-3">
                                                {formatDate(earning.deliveryDate)}
                                              </span>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-sm font-bold text-green-400 mb-0.5">
                                                +KES{" "}
                                                {earning.riderEarning.toLocaleString()}
                                              </div>
                                              <div className="text-xs text-[#596960]">
                                                from KES {earning.amount}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {/* Payment Actions */}
                                <div className="border-t border-[#ffffff0a] pt-5">
                                  {selectedRiderForEarnings === rider.id ? (
                                    <div className="bg-background p-5 sm:p-6 rounded-[20px] border border-border/20 shadow-[0_0_20px_rgba(234,179,8,0.05)]">
                                      <h4 className="font-bold text-secondary mb-4 text-sm flex items-center tracking-wider uppercase">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Process Payment to {rider.fullName}
                                      </h4>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                                        <div>
                                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
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
                                            className="w-full bg-card text-foreground border border-[#ffffff15] rounded-xl px-4 py-3 focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308]"
                                            placeholder="Enter amount"
                                          />
                                          <p className="text-xs text-[#596960] mt-2 font-mono flex items-center">
                                            Max: KES{" "}
                                            {(
                                              rider.currentBalance || 0
                                            ).toLocaleString()}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                            Payment Method
                                          </label>
                                          <select
                                            value={paymentMethod}
                                            onChange={(e) =>
                                              setPaymentMethod(e.target.value)
                                            }
                                            className="w-full bg-card text-foreground border border-[#ffffff15] rounded-xl px-4 py-3 focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308]"
                                          >
                                            <option value="mpesa">M-Pesa</option>
                                            <option value="bank">Bank Transfer</option>
                                            <option value="cash">Cash</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                            Notes (Optional)
                                          </label>
                                          <input
                                            type="text"
                                            value={paymentNotes}
                                            onChange={(e) =>
                                              setPaymentNotes(e.target.value)
                                            }
                                            className="w-full bg-card text-foreground border border-[#ffffff15] rounded-xl px-4 py-3 focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308]"
                                            placeholder="Payment notes"
                                          />
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap gap-3">
                                        <button
                                          onClick={() => processRiderPayment(rider.id)}
                                          disabled={
                                            !paymentAmount ||
                                            parseFloat(paymentAmount) <= 0 ||
                                            parseFloat(paymentAmount) >
                                            (rider.currentBalance || 0)
                                          }
                                          className="bg-green-600 hover:bg-green-500 text-foreground px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center space-x-2"
                                        >
                                          <CreditCard className="w-4 h-4" />
                                          <span>Confirm Payment</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedRiderForEarnings(null);
                                            setPaymentAmount("");
                                            setPaymentNotes("");
                                          }}
                                          className="bg-card text-muted-foreground hover:text-foreground border border-[#ffffff10] px-6 py-2.5 rounded-xl transition-all text-sm font-bold"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap gap-3">
                                      <button
                                        onClick={() => {
                                          setSelectedRiderForEarnings(rider.id);
                                          setPaymentAmount("");
                                          setPaymentNotes("");
                                        }}
                                        disabled={(rider.currentBalance || 0) <= 0}
                                        className="bg-green-500/10 text-green-400 border border-green-500/20 px-6 py-2.5 rounded-xl hover:bg-green-500/20 text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-2"
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
━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
${earnings.earnings
                                                .slice(-5)
                                                .map(
                                                  (e) =>
                                                    `🔹 ${e.orderId}: +KES ${e.riderEarning.toLocaleString()} (${formatDate(e.deliveryDate)})`,
                                                )
                                                .join("\n") || "No earnings recorded yet"
                                              }

⚖️ Commission Structure: 20% Company | 80% Rider
                                  `;
                                            alert(details);
                                          }
                                        }}
                                        className="bg-background text-foreground border border-[#ffffff10] hover:bg-card/5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2"
                                      >
                                        <Eye className="w-4 h-4" />
                                        <span>View Statement</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </AnimatedPage>
              )}
              {/* Rider Activity Log Tab */}
              {activeTab === "rider-activity" && (
                <AnimatedPage>
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4 px-2">
                      <div className="flex items-center space-x-4">
                        <h2 className="text-3xl font-bold text-foreground tracking-tight">
                          Rider Activity Log
                        </h2>
                        <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center border border-border/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                          <ArrowDown className="w-5 h-5 text-secondary" />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={async () => {
                            setIsLoading(true);
                            try {
                              await fetch(`${API_BASE_URL}/api/admin/rider-activities`);
                              await fetchActivities();
                            } catch (error) {
                              console.error('Error refreshing activities:', error);
                            } finally { setIsLoading(false); }
                          }}
                          disabled={isLoading}
                          className="flex items-center space-x-2 bg-secondary hover:bg-[#ca8a04] text-black font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                          <span>Refresh</span>
                        </button>

                        <button
                          onClick={() => handleExport('json')}
                          className="flex items-center space-x-2 bg-transparent text-foreground border border-[#ffffff15] hover:bg-card/5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                        >
                          <Download className="w-4 h-4" />
                          <span>JSON</span>
                        </button>

                        <button
                          onClick={() => handleExport('csv')}
                          className="flex items-center space-x-2 bg-transparent text-foreground border border-[#ffffff15] hover:bg-card/5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                        >
                          <FileDown className="w-4 h-4" />
                          <span>CSV</span>
                        </button>

                        <label className="flex items-center space-x-2 bg-transparent text-foreground border border-[#ffffff15] hover:bg-card/5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>Import</span>
                          <input
                            type="file"
                            accept="application/json"
                            className="hidden"
                            onChange={async (e: any) => {
                              const file = e.target.files && e.target.files[0];
                              if (!file) return;
                              try {
                                const text = await file.text();
                                const parsed = JSON.parse(text);
                                const res = await fetch(`${API_BASE_URL}/api/admin/rider-activities/import`, {
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
                          className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${showAdd ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-secondary/10 text-secondary border border-border/20 hover:bg-secondary/20'}`}
                        >
                          {showAdd ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {showAdd && (
                      <div className="bg-card p-6 rounded-[24px] border border-[#ffffff05] shadow-lg mb-8">
                        <h3 className="text-lg font-bold text-foreground mb-4">Add Manual Activity</h3>
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

                              const res = await fetch(`${API_BASE_URL}/api/admin/rider-activities/log`, {
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
                            } catch (err: any) {
                              console.error('Error creating activity', err);
                              alert('Failed to create activity: ' + (err?.message || err));
                            }
                          }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <input
                              required
                              value={newActivity.riderId}
                              onChange={(e) => setNewActivity((s) => ({ ...s, riderId: e.target.value }))}
                              placeholder="Rider ID (e.g. RD-001)"
                              className="bg-background border border-[#ffffff15] text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-[#eab308]"
                            />
                            <input
                              required
                              value={newActivity.riderName}
                              onChange={(e) => setNewActivity((s) => ({ ...s, riderName: e.target.value }))}
                              placeholder="Rider Name"
                              className="bg-background border border-[#ffffff15] text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-[#eab308]"
                            />
                            <select
                              value={newActivity.type}
                              onChange={(e) => setNewActivity((s) => ({ ...s, type: e.target.value }))}
                              className="bg-background border border-[#ffffff15] text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-[#eab308]"
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

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                            <input
                              value={newActivity.orderId}
                              onChange={(e) => setNewActivity((s) => ({ ...s, orderId: e.target.value }))}
                              placeholder="Order ID (optional)"
                              className="bg-background border border-[#ffffff15] text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-[#eab308]"
                            />
                            <input
                              required
                              value={newActivity.description}
                              onChange={(e) => setNewActivity((s) => ({ ...s, description: e.target.value }))}
                              placeholder="Description"
                              className="bg-background border border-[#ffffff15] text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-[#eab308]"
                            />
                            <input
                              type="number"
                              value={newActivity.amount || ''}
                              onChange={(e) => setNewActivity((s) => ({ ...s, amount: Number(e.target.value) }))}
                              placeholder="Amount (optional)"
                              className="bg-background border border-[#ffffff15] text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-[#eab308]"
                            />
                          </div>

                          <div className="mt-6 flex flex-wrap gap-3">
                            <button type="submit" className="bg-secondary hover:bg-[#ca8a04] text-black font-bold px-6 py-2.5 rounded-xl transition-all">Add Activity</button>
                            <button type="button" onClick={() => setShowAdd(false)} className="bg-background text-foreground border border-[#ffffff10] hover:bg-card/5 px-6 py-2.5 rounded-xl transition-all font-bold text-sm">Cancel</button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Activity Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                      <div className="bg-card p-6 rounded-[24px] border border-[#ffffff05] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-orange-500/20 transition-all text-center">
                        <div className="text-sm font-bold text-muted-foreground mb-2">Today's</div>
                        <div className="text-4xl sm:text-5xl font-black text-orange-400 mb-2">47</div>
                        <div className="text-xs font-bold text-[#596960] tracking-widest uppercase">Activities</div>
                      </div>
                      <div className="bg-card p-6 rounded-[24px] border border-[#ffffff05] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-green-500/20 transition-all text-center">
                        <div className="text-sm font-bold text-muted-foreground mb-2">Deliveries</div>
                        <div className="text-4xl sm:text-5xl font-black text-green-400 mb-2">23</div>
                        <div className="text-xs font-bold text-green-500/70 tracking-widest uppercase">Completed</div>
                      </div>
                      <div className="bg-card p-6 rounded-[24px] border border-[#ffffff05] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-border/20 transition-all text-center">
                        <div className="text-sm font-bold text-muted-foreground mb-2">Payments</div>
                        <div className="text-4xl sm:text-5xl font-black text-secondary mb-2">KSh 5k</div>
                        <div className="text-xs font-bold text-[#596960] tracking-widest uppercase">Settled</div>
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-card p-6 rounded-[24px] shadow-lg border border-[#ffffff05]">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                            Filter by Rider
                          </label>
                          <select className="w-full bg-background text-foreground border border-[#ffffff15] rounded-xl px-4 py-3 focus:outline-none focus:border-[#eab308]">
                            <option value="">All Riders</option>
                            <option value="RD-001">John Mwangi</option>
                            <option value="RD-002">Peter Kimani</option>
                            <option value="RD-003">James Mwangi</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                            Activity Type
                          </label>
                          <select className="w-full bg-background text-foreground border border-[#ffffff15] rounded-xl px-4 py-3 focus:outline-none focus:border-[#eab308]">
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
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                            Date Range
                          </label>
                          <select className="w-full bg-background text-foreground border border-[#ffffff15] rounded-xl px-4 py-3 focus:outline-none focus:border-[#eab308]">
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="all">All Time</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                            Search Order ID
                          </label>
                          <div className="relative">
                            <Search className="w-4 h-4 text-[#596960] absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="e.g. RC-2024-001"
                              className="w-full bg-background text-foreground border border-[#ffffff15] rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-[#eab308]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-card rounded-[24px] shadow-lg border border-[#ffffff05] overflow-hidden">
                      <div className="px-6 py-5 border-b border-[#ffffff0a] flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-1">
                            Live Activity Timeline
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Real-time tracking of all rider activities and earnings
                          </p>
                        </div>
                        <div className="hidden sm:flex items-center space-x-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs font-bold text-green-400 tracking-widest uppercase">Live</span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="space-y-4">
                          {isLoading ? (
                            <CardSkeleton />
                          ) : activities.length === 0 ? (
                            <div className="bg-background rounded-[24px] border border-dashed border-[#ffffff15] p-12 text-center my-8">
                              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-6 border border-border/20">
                                <RefreshCw className="w-8 h-8 text-secondary" />
                              </div>
                              <h3 className="text-lg font-bold text-foreground mb-2">
                                No activities yet
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                Waiting for rider logs to sync...
                              </p>
                            </div>
                          ) : (
                            activities.map((activity) => (
                              <div
                                key={activity.id}
                                className="flex items-start space-x-4 p-5 bg-background rounded-[16px] border border-[#ffffff05] hover:border-[#ffffff15] transition-all"
                              >
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center text-foreground shrink-0 shadow-lg ${activity.type === 'delivery_completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                    activity.type === 'pickup_completed' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                      activity.type === 'payment_received' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                        activity.type === 'order_assigned' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-background0/20 text-gray-400 border border-gray-500/30'
                                    }`}
                                >
                                  <span className="text-xl">
                                    {activity.type === 'delivery_completed' ? '✅' : activity.type === 'pickup_completed' ? '📦' : activity.type === 'payment_received' ? '💰' : activity.type === 'order_assigned' ? '🏍️' : '•'}
                                  </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                    <h4 className="text-base font-bold text-foreground">
                                      {activity.riderName || activity.metadata?.riderName || activity.riderId}
                                    </h4>
                                    <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                                      {new Date(activity.timestamp).toLocaleString()}
                                    </span>
                                  </div>

                                  <p className="text-sm text-gray-300 leading-relaxed mb-3">
                                    {activity.description}
                                  </p>

                                  {activity.netEarning && (
                                    <div className="bg-card rounded-xl p-4 border border-[#ffffff0a]">
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                        <div>
                                          <span className="text-[#596960] font-bold uppercase tracking-wider block mb-1">
                                            Order Amount
                                          </span>
                                          <div className="font-bold text-foreground">
                                            KES {activity.amount?.toLocaleString?.()}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-[#596960] font-bold uppercase tracking-wider block mb-1">
                                            Company (20%)
                                          </span>
                                          <div className="font-bold text-red-400">
                                            -KES {activity.commission?.toFixed?.(2)}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-[#596960] font-bold uppercase tracking-wider block mb-1">
                                            Rider Net (80%)
                                          </span>
                                          <div className="font-bold text-green-400">
                                            +KES {activity.netEarning?.toFixed?.(2)}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {activity.amount && !activity.netEarning && (
                                    <div className="bg-card rounded-xl p-4 border border-[#ffffff0a] inline-block mt-1">
                                      <span className="text-[#596960] font-bold uppercase tracking-wider block mb-1 text-xs">
                                        Payment Amount
                                      </span>
                                      <div className="font-bold text-purple-400">
                                        -KES {activity.amount?.toLocaleString?.()}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col items-end space-y-2 shrink-0 ml-4 hidden sm:flex">
                                  <span
                                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${activity.type === 'delivery_completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                      activity.type === 'pickup_completed' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                        activity.type === 'payment_received' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                          activity.type === 'order_assigned' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-background0/10 text-gray-400 border-gray-500/20'
                                      }`}
                                  >
                                    {activity.type.replace('_', ' ')}
                                  </span>
                                  <span className="text-xs text-[#596960] font-mono tracking-wider">
                                    {activity.riderId}
                                  </span>

                                  <div className="mt-2 pt-2 border-t border-[#ffffff0a]">
                                    <button
                                      onClick={async () => {
                                        if (!confirm('Delete this activity?')) return;
                                        try {
                                          const res = await fetch(`${API_BASE_URL}/api/admin/rider-activities/${activity.id}`, { method: 'DELETE' });
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
                                      className="flex items-center space-x-1 text-red-500/70 hover:text-red-400 text-sm transition-colors py-1 px-2 rounded hover:bg-card/5"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )))}
                        </div>

                        {/* Load More Button */}
                        {!isLoading && activities.length > 0 && (
                          <div className="text-center mt-8">
                            <button className="bg-transparent hover:bg-card/5 text-foreground border border-[#ffffff15] px-6 py-2.5 rounded-xl transition-all font-bold text-sm">
                              Load More Activities
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </AnimatedPage>
              )}
              {/* Withdrawal Requests Tab */}
              {activeTab === "withdrawal-requests" && (
                <AnimatedPage>
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 px-2">
                      <div>
                        <h2 className="text-3xl font-bold text-foreground tracking-tight mb-1">
                          Withdrawal Requests
                        </h2>
                        <div className="text-muted-foreground text-sm">
                          Manage and process rider withdrawal requests.
                        </div>
                      </div>
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
                        className="flex items-center space-x-2 bg-secondary hover:bg-[#ca8a04] text-black font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh Requests</span>
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      <div className="bg-card p-5 sm:p-6 rounded-[24px] border border-border/20 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-[#eab308]/40 transition-all text-center">
                        <div className="text-4xl font-black text-secondary mb-2">3</div>
                        <div className="text-xs font-bold text-secondary/70 tracking-widest uppercase">
                          Pending Requests
                        </div>
                      </div>
                      <div className="bg-card p-5 sm:p-6 rounded-[24px] border border-green-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-green-500/40 transition-all text-center">
                        <div className="text-4xl font-black text-green-500 mb-2">12</div>
                        <div className="text-xs font-bold text-green-500/70 tracking-widest uppercase">Approved Today</div>
                      </div>
                      <div className="bg-card p-5 sm:p-6 rounded-[24px] border border-red-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-red-500/40 transition-all text-center">
                        <div className="text-4xl font-black text-red-500 mb-2">2</div>
                        <div className="text-xs font-bold text-red-500/70 tracking-widest uppercase">Rejected</div>
                      </div>
                      <div className="bg-card p-5 sm:p-6 rounded-[24px] border border-blue-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-blue-500/40 transition-all text-center">
                        <div className="text-3xl font-black text-blue-400 mb-2 whitespace-nowrap">
                          KES 25,480
                        </div>
                        <div className="text-xs font-bold text-blue-400/70 tracking-widest uppercase">Total Requested</div>
                      </div>
                    </div>

                    {/* Fee Calculator */}
                    <div className="bg-card p-6 lg:p-8 rounded-[24px] shadow-lg border border-[#ffffff05]">
                      <h3 className="text-lg font-bold text-foreground mb-6 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-background flex items-center justify-center mr-3 border border-[#ffffff10]">🧮</span>
                        Withdrawal Fee Calculator
                      </h3>
                      <div className="bg-background p-6 rounded-2xl border border-blue-500/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="font-bold text-blue-400 mb-4 text-sm tracking-wider uppercase">
                              Fee Structure
                            </h4>
                            <ul className="text-sm text-gray-300 space-y-3">
                              <li className="flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3"></span>
                                Below KES 1,000: <strong className="text-foreground ml-2 bg-card px-2 py-0.5 rounded border border-[#ffffff10]">KES 20 fee</strong>
                              </li>
                              <li className="flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3"></span>
                                KES 1,000 and above: <strong className="text-foreground ml-2 bg-card px-2 py-0.5 rounded border border-[#ffffff10]">KES 50 fee</strong>
                              </li>
                              <li className="flex items-center text-muted-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#596960] mr-3"></span>
                                Fees are deducted from withdrawal amount
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold text-blue-400 mb-4 text-sm tracking-wider uppercase">
                              Examples
                            </h4>
                            <ul className="text-sm text-gray-300 space-y-3">
                              <li className="flex items-center bg-card p-3 rounded-xl border border-[#ffffff05]">
                                <div className="flex-1">Request <span className="text-foreground font-bold">KES 800</span></div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />
                                <div className="flex-1 text-right">Get <span className="text-green-400 font-bold">KES 780</span> <span className="text-muted-foreground text-xs block">(KES 20 fee)</span></div>
                              </li>
                              <li className="flex items-center bg-card p-3 rounded-xl border border-[#ffffff05]">
                                <div className="flex-1">Request <span className="text-foreground font-bold">KES 1,500</span></div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />
                                <div className="flex-1 text-right">Get <span className="text-green-400 font-bold">KES 1,450</span> <span className="text-muted-foreground text-xs block">(KES 50 fee)</span></div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Withdrawal Requests List */}
                    <div className="bg-card rounded-[24px] shadow-lg border border-[#ffffff05] overflow-hidden">
                      <div className="px-6 py-5 border-b border-[#ffffff0a]">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <h3 className="text-lg font-bold text-foreground">
                            Recent Withdrawal Requests
                          </h3>
                          <div className="flex items-center">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-3 hidden sm:block">Status</label>
                            <select className="bg-background text-foreground border border-[#ffffff15] rounded-xl px-4 py-2 focus:outline-none focus:border-[#eab308] text-sm">
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
                          {isLoading ? (
                            <CardSkeleton />
                          ) : (
                            [
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
                                className="bg-background border border-[#ffffff05] rounded-[20px] p-6 hover:border-[#ffffff15] transition-all relative overflow-hidden"
                              >
                                {request.status === 'pending' && (
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl pointer-events-none rounded-full" />
                                )}
                                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-card border border-[#ffffff10] rounded-full flex items-center justify-center">
                                      <span className="text-foreground font-bold text-lg">
                                        {request.rider
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-foreground text-lg">
                                        {request.rider}
                                      </h4>
                                      <p className="text-sm text-muted-foreground font-mono mt-0.5">
                                        {request.riderId} • <span className="text-foreground">{request.phone}</span>
                                      </p>
                                      <p className="text-xs text-[#596960] flex items-center mt-1.5 font-mono">
                                        <Clock className="w-3.5 h-3.5 mr-1" />
                                        {request.requestedAt}
                                      </p>
                                    </div>
                                  </div>
                                  <span
                                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border ${request.status === "pending"
                                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                      : request.status === "approved"
                                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                      }`}
                                  >
                                    {request.status}
                                  </span>
                                </div>

                                {/* Amount Breakdown */}
                                <div className="bg-card rounded-2xl p-4 sm:p-5 mb-5 border border-[#ffffff0a]">
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                      <span className="text-xs font-bold text-[#596960] uppercase tracking-wider block mb-2">
                                        Requested Amount
                                      </span>
                                      <div className="text-lg font-bold text-foreground">
                                        KES {request.amount.toLocaleString()}
                                      </div>
                                    </div>
                                    <div className="relative sm:after:absolute sm:after:left-0 sm:after:top-2 sm:after:bottom-2 sm:after:w-px sm:after:bg-[#ffffff0a] sm:pl-6">
                                      <span className="text-xs font-bold text-[#596960] uppercase tracking-wider block mb-2">
                                        Withdrawal Fee
                                      </span>
                                      <div className="text-lg font-bold text-red-400">
                                        -KES {request.fee}
                                      </div>
                                    </div>
                                    <div className="relative sm:after:absolute sm:after:left-0 sm:after:top-2 sm:after:bottom-2 sm:after:w-px sm:after:bg-[#ffffff0a] sm:pl-6 bg-background sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                                      <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1 sm:mb-2">Net Amount</span>
                                      <div className="text-2xl font-black text-green-400">
                                        KES {request.netAmount.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {request.notes && (
                                  <div className="mb-6 p-4 bg-card rounded-2xl border border-blue-500/20 inline-flex items-start max-w-full">
                                    <MessageSquare className="w-4 h-4 text-blue-400 mr-3 mt-0.5 shrink-0" />
                                    <div>
                                      <span className="text-xs text-blue-400 font-bold uppercase tracking-wider block mb-1">
                                        Rider Notes
                                      </span>
                                      <p className="text-sm text-gray-300 italic">
                                        "{request.notes}"
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Actions */}
                                {request.status === "pending" && (
                                  <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-[#ffffff0a]">
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
                                      className="bg-green-600 hover:bg-green-500 text-foreground px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center space-x-2"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      <span>Approve</span>
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
                                      className="bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2"
                                    >
                                      <X className="w-4 h-4" />
                                      <span>Reject</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )))}
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedPage>
              )}
              {/* Automated Payments Tab */}
              {activeTab === "automated-payments" && (
                <AnimatedPage>
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-card p-6 rounded-lg shadow border border-border">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-foreground">
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
                            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-foreground px-4 py-2 rounded-lg transition-colors"
                          >
                            <Zap className="w-4 h-4" />
                            <span>Trigger Now</span>
                          </button>
                          <button className="flex items-center space-x-2 bg-rocs-green hover:bg-rocs-green-dark text-foreground px-4 py-2 rounded-lg transition-colors">
                            <TrendingUp className="w-4 h-4" />
                            <span>View Reports</span>
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
                        <div className="bg-background p-4 rounded-lg">
                          <div className="text-2xl font-bold text-muted-foreground">156</div>
                          <div className="text-sm text-muted-foreground">Total Payments</div>
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
                    <div className="bg-card rounded-lg shadow border border-border">
                      <div className="px-6 py-4 border-b border-border">
                        <h3 className="text-lg font-medium text-foreground">
                          Recent Automated Payments
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Payments processed automatically at 23:00 daily
                        </p>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {isLoading ? (
                            <CardSkeleton />
                          ) : (
                            [
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
                                className="border border-border rounded-lg p-4 hover:bg-background transition-colors"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center space-x-4">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center ${payment.status === "success"
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                        }`}
                                    >
                                      <span className="text-foreground text-lg">
                                        {payment.status === "success" ? "✅" : "❌"}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-foreground">
                                        {payment.rider}
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        {payment.phone}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {payment.processedAt}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-foreground">
                                      KES {payment.amount.toLocaleString()}
                                    </div>
                                    <span
                                      className={`px-2 py-1 text-xs font-medium rounded-full ${payment.status === "success"
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
                            )))}
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedPage>
              )}
            </div>
          </PullToRefresh>
        </div>

        {/* Overlay for mobile sidebar */}
        {
          sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )
        }
      </div>
    </div>
  );
}
