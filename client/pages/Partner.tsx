import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Briefcase, TrendingDown, Code, Zap, ArrowRight, UserCircle } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";

export default function Partner() {
    const navigate = useNavigate();

    const benefits = [
        {
            icon: <Briefcase className="w-6 h-6 text-[#eab308]" />,
            title: "Dedicated Account Manager",
            description: "Direct support line for all your delivery logistics and queries.",
        },
        {
            icon: <TrendingDown className="w-6 h-6 text-[#eab308]" />,
            title: "Discounted Fleet Rates",
            description: "Volume-based tiers ensuring you get the best market rates.",
        },
        {
            icon: <Code className="w-6 h-6 text-[#eab308]" />,
            title: "Custom API Integration",
            description: "Automate your orders directly from your e-commerce platform.",
        },
        {
            icon: <Zap className="w-6 h-6 text-[#eab308]" />,
            title: "Priority Dispatch",
            description: "Your packages hit the road faster with VIP priority routing.",
        },
    ];

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-[#0a110d] text-white flex flex-col pb-20">

                {/* Header */}
                <div className="sticky top-0 z-50 bg-[#0a110d]/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-white/5">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-[#112417] border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <span className="font-bold text-lg tracking-wide">Partner with Rocs Crew</span>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#112417] border border-white/10">
                        <UserCircle className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Hero Section */}
                <div className="relative h-[300px] w-full bg-[#112417] overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80"
                        alt="Motorcycle Delivery"
                        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity brightness-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a110d] via-[#0a110d]/60 to-transparent" />

                    <div className="absolute inset-0 flex flex-col justify-end p-6 pb-8">
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight max-w-[280px]">
                            Scale Your Business with Nairobi's Best Fleet
                        </h1>
                        <p className="text-[#8b9d93] text-sm mb-6 max-w-md">
                            Join 500+ businesses trusting us with their daily logistics operations.
                        </p>
                        <button className="bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] text-black font-extrabold text-sm py-4 px-6 rounded-xl flex items-center justify-center gap-2 max-w-[200px] shadow-[0_10px_30px_rgba(234,179,8,0.2)] transition-transform active:scale-95">
                            APPLY NOW <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="px-4 py-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <div className="w-2 h-6 bg-[#eab308] rounded-full" />
                        Partnership Benefits
                    </h2>

                    <div className="space-y-4">
                        {benefits.map((benefit, idx) => (
                            <div
                                key={idx}
                                className="bg-[#112417] border border-white/5 rounded-2xl p-4 flex gap-4 hover:border-[#eab308]/30 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#0a110d] border border-white/5 flex items-center justify-center shrink-0">
                                    {benefit.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-[15px] mb-1">{benefit.title}</h3>
                                    <p className="text-[#8b9d93] text-sm leading-relaxed">{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </AnimatedPage>
    );
}
