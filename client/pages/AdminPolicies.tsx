import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, CheckCircle2, ShieldCheck, MapPin, Users, FileText, BarChart2, Shield } from "lucide-react";

const POLICIES = [
    { id: "term", title: "Terms and Conditions", status: "Active", date: "12 May 2024" },
    { id: "privacy", title: "Privacy Policy", status: "Active", date: "10 May 2024" },
    { id: "refund", title: "Refund Policy", status: "Active", date: "1 May 2024" },
];

export default function AdminPolicies() {
    const navigate = useNavigate();
    const [expandedId, setExpandedId] = useState<string>("term");

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col pb-24 relative overflow-hidden transition-colors duration-300">

            {/* Background Glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-border shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border hover:bg-muted transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <span className="font-bold text-lg tracking-wide">Policy Management</span>
                </div>
                <button className="bg-secondary text-secondary-foreground text-sm font-bold px-4 py-2 rounded-full hover:brightness-110 transition-colors shadow-lg">
                    Update Policy
                </button>
            </div>

            {/* Content Area */}
            <div className="px-5 py-8 max-w-2xl mx-auto w-full flex-1">

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <div className="w-2 h-6 bg-secondary rounded-full" />
                        Active Policies
                    </h2>
                    <div className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
                        NAIROBI HUB
                    </div>
                </div>

                {/* Accorion List */}
                <div className="space-y-4 mb-8">
                    {POLICIES.map((policy) => {
                        const isExpanded = expandedId === policy.id;
                        return (
                            <div
                                key={policy.id}
                                className={`bg-card border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? "border-secondary/30 shadow-lg" : "border-border hover:border-border/80"}`}
                            >
                                <div
                                    onClick={() => setExpandedId(isExpanded ? "" : policy.id)}
                                    className="w-full flex justify-between p-5 cursor-pointer"
                                >
                                    <div>
                                        <h3 className={`font-bold text-[16px] mb-1 ${isExpanded ? "text-secondary" : "text-foreground"}`}>
                                            {policy.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                            <span>Last Check: {policy.date}</span>
                                            <span className="w-1 h-1 bg-border rounded-full" />
                                            <span className="text-primary flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> {policy.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isExpanded ? "bg-secondary text-secondary-foreground rotate-180" : "bg-muted text-muted-foreground"}`}>
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Expanded Fake Content */}
                                <div className={`transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                                    <div className="p-5 pt-0 border-t border-border mt-2 space-y-3">
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            Current version of the {policy.title.toLowerCase()} has been distributed to all riders and user apps. Ensure all changes comply with local regulations before updating.
                                        </p>
                                        <button className="text-sm font-bold text-foreground bg-muted border border-border px-4 py-2 rounded-lg hover:border-secondary/50 transition-colors">
                                            View Document Text
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* System Update Card */}
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 mt-10">
                    <div className="w-2 h-6 bg-secondary rounded-full opacity-50" />
                    Last System Update
                </h2>

                <div className="bg-card border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10" />

                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-foreground text-[16px]">Verified & Synced</h3>
                                <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">Active</span>
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                All legal documents were synced across the fleet apps on <span className="text-foreground">12 May, 10:45 AM</span>.
                                Next scheduled review in <span className="text-secondary">30 days</span>.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Admin Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border px-2 py-3 pb-safe z-50">
                <div className="max-w-md mx-auto flex items-center justify-between px-4">
                    <Link to="/admin" className="flex flex-col items-center gap-1.5 p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <MapPin className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Hub</span>
                    </Link>
                    <Link to="/admin" className="flex flex-col items-center gap-1.5 p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Users className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Fleet</span>
                    </Link>
                    <Link to="/admin/policies" className="flex flex-col items-center gap-1.5 p-2 text-secondary relative">
                        <FileText className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Policies</span>
                        <div className="absolute -bottom-1 w-1 h-1 bg-secondary rounded-full" />
                    </Link>
                    <Link to="/admin" className="flex flex-col items-center gap-1.5 p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <BarChart2 className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Reports</span>
                    </Link>
                    <Link to="/admin" className="flex flex-col items-center gap-1.5 p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Shield className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
