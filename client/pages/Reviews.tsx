import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Search, Star, Home, Package, Settings, RefreshCw, MessageSquare } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";

export default function Reviews() {
    const navigate = useNavigate();

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-background text-foreground flex flex-col pb-24 relative overflow-hidden transition-colors duration-300">

                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-border shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border hover:bg-muted transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-foreground" />
                        </button>
                        <span className="font-bold text-lg tracking-wide">Review Management</span>
                    </div>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border hover:bg-muted transition-colors">
                        <Search className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="px-5 py-6 flex-1 max-w-2xl mx-auto w-full flex flex-col">

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Total Reviews</span>
                            <span className="text-3xl font-black text-foreground">0</span>
                        </div>
                        <div className="bg-card border border-secondary/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Star className="w-3 h-3 text-secondary fill-secondary" /> 5 Star
                            </span>
                            <span className="text-3xl font-black text-secondary">0</span>
                        </div>
                        <div className="bg-card border border-primary/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Good</span>
                            <span className="text-3xl font-black text-primary">0</span>
                        </div>
                    </div>

                    {/* Empty State */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center mt-10">
                        <div className="w-24 h-24 bg-card border border-border shadow-lg rounded-[32px] flex items-center justify-center mb-6 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-transparent rounded-[32px] opacity-50" />
                            <MessageSquare className="w-10 h-10 text-secondary relative z-10" />
                        </div>
                        <h2 className="text-2xl font-black text-foreground mb-3">No reviews found</h2>
                        <p className="text-muted-foreground text-sm max-w-[260px] mx-auto leading-relaxed mb-10">
                            You haven't received any customer ratings or feedback for your delivered orders yet.
                        </p>

                        <button className="w-full bg-gradient-to-r from-secondary to-rocs-green-dark hover:brightness-110 text-secondary-foreground font-extrabold text-lg py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                            <RefreshCw className="w-5 h-5" /> REFRESH REVIEWS
                        </button>
                    </div>
                </div>

                {/* Rider Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border px-2 py-3 pb-safe z-50">
                    <div className="max-w-md mx-auto flex items-center justify-between px-6">
                        <Link to="/rider-dashboard" className="flex flex-col items-center gap-1.5 p-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Home className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Dashboard</span>
                        </Link>
                        <Link to="/rider-dashboard" className="flex flex-col items-center gap-1.5 p-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Package className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Deliveries</span>
                        </Link>
                        <Link to="/reviews" className="flex flex-col items-center gap-1.5 p-2 text-secondary relative">
                            <Star className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Reviews</span>
                            <div className="absolute -bottom-1 w-1 h-1 bg-secondary rounded-full" />
                        </Link>
                        <Link to="/rider-dashboard" className="flex flex-col items-center gap-1.5 p-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Settings className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Settings</span>
                        </Link>
                    </div>
                </div>

            </div>
        </AnimatedPage>
    );
}
