import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Search, Star, Home, Package, Settings, RefreshCw, MessageSquare } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";

export default function Reviews() {
    const navigate = useNavigate();

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-[#0a110d] text-white flex flex-col pb-24 relative overflow-hidden">

                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#eab308]/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <div className="sticky top-0 z-50 bg-[#0a110d]/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-white/5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#112417] border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <span className="font-bold text-lg tracking-wide">Review Management</span>
                    </div>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#112417] border border-white/10 hover:bg-white/10 transition-colors">
                        <Search className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="px-5 py-6 flex-1 max-w-2xl mx-auto w-full flex flex-col">

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <div className="bg-[#112417] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                            <span className="text-[#8b9d93] text-[10px] font-bold uppercase tracking-wider">Total Reviews</span>
                            <span className="text-3xl font-black text-white">0</span>
                        </div>
                        <div className="bg-[#112417] border border-[#eab308]/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                            <span className="text-[#8b9d93] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Star className="w-3 h-3 text-[#eab308] fill-[#eab308]" /> 5 Star
                            </span>
                            <span className="text-3xl font-black text-[#eab308]">0</span>
                        </div>
                        <div className="bg-[#112417] border border-green-500/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                            <span className="text-[#8b9d93] text-[10px] font-bold uppercase tracking-wider">Good</span>
                            <span className="text-3xl font-black text-green-400">0</span>
                        </div>
                    </div>

                    {/* Empty State */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center mt-10">
                        <div className="w-24 h-24 bg-[#112417] border border-white/5 shadow-[0_0_30px_rgba(234,179,8,0.1)] rounded-[32px] flex items-center justify-center mb-6 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#eab308]/20 to-transparent rounded-[32px] opacity-50" />
                            <MessageSquare className="w-10 h-10 text-[#eab308] relative z-10" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-3">No reviews found</h2>
                        <p className="text-[#8b9d93] text-sm max-w-[260px] mx-auto leading-relaxed mb-10">
                            You haven't received any customer ratings or feedback for your delivered orders yet.
                        </p>

                        <button className="w-full bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-extrabold text-lg py-4 rounded-xl shadow-[0_10px_30px_rgba(234,179,8,0.2)] flex items-center justify-center gap-2 transition-transform active:scale-95">
                            <RefreshCw className="w-5 h-5" /> REFRESH REVIEWS
                        </button>
                    </div>
                </div>

                {/* Rider Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-[#0a110d]/95 backdrop-blur-xl border-t border-white/5 px-2 py-3 pb-safe z-50">
                    <div className="max-w-md mx-auto flex items-center justify-between px-6">
                        <Link to="/rider-dashboard" className="flex flex-col items-center gap-1.5 p-2 text-gray-500 hover:text-white transition-colors">
                            <Home className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Dashboard</span>
                        </Link>
                        <Link to="/rider-dashboard" className="flex flex-col items-center gap-1.5 p-2 text-gray-500 hover:text-white transition-colors">
                            <Package className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Deliveries</span>
                        </Link>
                        <Link to="/reviews" className="flex flex-col items-center gap-1.5 p-2 text-[#eab308] relative">
                            <Star className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Reviews</span>
                            <div className="absolute -bottom-1 w-1 h-1 bg-[#eab308] rounded-full" />
                        </Link>
                        <Link to="/rider-dashboard" className="flex flex-col items-center gap-1.5 p-2 text-gray-500 hover:text-white transition-colors">
                            <Settings className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Settings</span>
                        </Link>
                    </div>
                </div>

            </div>
        </AnimatedPage>
    );
}
