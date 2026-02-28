import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Briefcase, TrendingDown, Code, Zap, ArrowRight, UserCircle } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";

export default function Partner() {
    const navigate = useNavigate();

    const benefits = [
        {
            icon: <Briefcase className="w-6 h-6 text-primary" />,
            title: "Dedicated Account Manager",
            description: "Direct support line for all your delivery logistics and queries.",
        },
        {
            icon: <TrendingDown className="w-6 h-6 text-primary" />,
            title: "Discounted Fleet Rates",
            description: "Volume-based tiers ensuring you get the best market rates.",
        },
        {
            icon: <Code className="w-6 h-6 text-primary" />,
            title: "Custom API Integration",
            description: "Automate your orders directly from your e-commerce platform.",
        },
        {
            icon: <Zap className="w-6 h-6 text-primary" />,
            title: "Priority Dispatch",
            description: "Your packages hit the road faster with VIP priority routing.",
        },
    ];

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 transition-colors duration-300">

                {/* Header */}
                <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-border">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border hover:bg-muted transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <span className="font-bold text-lg tracking-wide">Partner with Rocs Crew</span>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border">
                        <UserCircle className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Hero Section */}
                <div className="relative h-[300px] w-full bg-muted overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80"
                        alt="Motorcycle Delivery"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity brightness-110 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                    <div className="absolute inset-0 flex flex-col justify-end p-6 pb-8">
                        <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3 leading-tight max-w-[280px]">
                            Scale Your Business with Nairobi's Best Fleet
                        </h1>
                        <p className="text-muted-foreground text-sm mb-6 max-w-md">
                            Join 500+ businesses trusting us with their daily logistics operations.
                        </p>
                        <button className="bg-gradient-to-r from-primary to-rocs-green-dark hover:brightness-110 text-primary-foreground font-extrabold text-sm py-4 px-6 rounded-xl flex items-center justify-center gap-2 max-w-[200px] shadow-md transition-transform active:scale-95">
                            APPLY NOW <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="px-4 py-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                        <div className="w-2 h-6 bg-primary rounded-full" />
                        Partnership Benefits
                    </h2>

                    <div className="space-y-4">
                        {benefits.map((benefit, idx) => (
                            <div
                                key={idx}
                                className="bg-card border border-border rounded-2xl p-4 flex gap-4 hover:border-primary/30 transition-colors shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
                                    {benefit.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-[15px] mb-1">{benefit.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </AnimatedPage>
    );
}
