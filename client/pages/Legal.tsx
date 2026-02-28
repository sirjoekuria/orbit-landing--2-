import { useState } from "react";
import { ChevronLeft, ChevronDown, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedPage from "../components/AnimatedPage";

const LEGAL_DOCS = [
    {
        id: "privacy",
        title: "Privacy Policy",
        content: (
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                    At Rocs Crew, your privacy is our priority. This Privacy Policy details how we collect, use, and protect your personal information when you use our delivery services.
                </p>
                <p>
                    <strong>Information Collection:</strong> We collect information you provide directly to us, such as when you create or modify your account, request services, contact customer support, or otherwise communicate with us.
                </p>
                <p>
                    <strong>Use of Information:</strong> We may use the information we collect about you for various purposes, including to provide, maintain, and improve our services, develop new features, and process transactions.
                </p>
            </div>
        ),
    },
    {
        id: "terms",
        title: "Terms of Service",
        content: (
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                    By accessing or using the Rocs Crew platform, you agree to be bound by these Terms of Service.
                </p>
                <p>
                    Users are responsible for maintaining the confidentiality of their accounts and passwords. You agree to provide accurate and complete information when registering for our delivery services.
                </p>
                <p>
                    We reserve the right to refuse service, terminate accounts, or cancel orders in our sole discretion if we believe that user conduct violates applicable law or is harmful to our interests.
                </p>
            </div>
        ),
    },
    {
        id: "cookie",
        title: "Cookie Policy",
        content: (
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                    Our website uses cookies and similar tracking technologies to track the activity on our service and hold certain information.
                </p>
                <p>
                    Cookies are files with small amounts of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
            </div>
        ),
    },
];

export function Legal() {
    const navigate = useNavigate();
    const [expandedId, setExpandedId] = useState<string>("privacy");

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 transition-colors duration-300">

                {/* Header */}
                <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-border shadow-sm">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border hover:bg-muted transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <span className="font-bold text-lg tracking-wide">Legal Information</span>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border transition-colors">
                        <UserCircle className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="px-4 py-8 max-w-2xl mx-auto w-full">
                    <p className="text-muted-foreground text-sm mb-6 text-center">
                        Review our latest policies and terms of service to understand how we operate and protect your data.
                    </p>

                    <div className="space-y-4">
                        {LEGAL_DOCS.map((doc) => {
                            const isExpanded = expandedId === doc.id;

                            return (
                                <div
                                    key={doc.id}
                                    className={`bg-card border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? "border-secondary/30 shadow-lg" : "border-border hover:border-border/80"}`}
                                >
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? "" : doc.id)}
                                        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                                    >
                                        <span className={`font-bold text-[16px] ${isExpanded ? "text-secondary" : "text-foreground"}`}>
                                            {doc.title}
                                        </span>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isExpanded ? "bg-secondary text-secondary-foreground rotate-180" : "bg-muted text-muted-foreground"}`}>
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </button>

                                    <div
                                        className={`transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
                                    >
                                        <div className="p-5 pt-0 border-t border-border mt-2">
                                            {doc.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </AnimatedPage>
    );
}

export default Legal;
