import React from 'react';
import { Package, MapPin, Clock, CreditCard, ChevronLeft, Download, Share2, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export default function OrderReceipt() {
    const orderDetails = {
        id: "ROC-8829-XL",
        date: "Feb 28, 2026",
        time: "02:45 PM",
        status: "Delivered",
        pickup: "Westlands, Nairobi",
        dropoff: "Karen, Nairobi",
        service: "Express Delivery",
        amount: "KSh 450.00",
        paymentMethod: "M-Pesa",
        rider: "John Kamau",
        items: [
            { name: "Document Package", price: "KSh 450.00" }
        ]
    };

    return (
        <div className="min-h-screen bg-background py-12 px-4 relative overflow-hidden font-outfit transition-colors duration-300">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-2xl mx-auto relative z-10">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-10">
                    <Link to="/dashboard">
                        <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-muted rounded-2xl gap-2 font-medium">
                            <ChevronLeft className="w-5 h-5" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-border bg-card text-foreground hover:bg-muted rounded-2xl w-12 h-12 p-0">
                            <Share2 className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" className="border-border bg-card text-foreground hover:bg-muted rounded-2xl w-12 h-12 p-0">
                            <Download className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Receipt Card */}
                <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden relative">
                    {/* Status Header */}
                    <div className="bg-gradient-to-r from-primary to-rocs-green-dark p-10 text-center relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                        <div className="w-20 h-20 bg-primary-foreground/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30 shadow-lg">
                            <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-black text-primary-foreground tracking-tight mb-2">Order Confirmed</h1>
                        <p className="text-primary-foreground/80 font-medium">Order ID: {orderDetails.id}</p>
                    </div>

                    <div className="p-8 md:p-12 space-y-10">
                        {/* Delivery Path */}
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20 shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-secondary" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Pickup Location</p>
                                    <p className="text-foreground font-medium text-lg">{orderDetails.pickup}</p>
                                </div>
                            </div>

                            <div className="ml-3 h-12 border-l-2 border-dashed border-border" />

                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                    <MapPin className="w-3 h-3 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Dropoff Location</p>
                                    <p className="text-foreground font-medium text-lg">{orderDetails.dropoff}</p>
                                </div>
                            </div>
                        </div>

                        <hr className="border-border" />

                        {/* Grid Stats */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Date & Time</p>
                                <div className="flex items-center gap-2 text-foreground font-medium">
                                    <Clock className="w-4 h-4 text-secondary" />
                                    <span>{orderDetails.date}, {orderDetails.time}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Courier Partner</p>
                                <div className="flex items-center gap-2 text-foreground font-medium">
                                    <Package className="w-4 h-4 text-secondary" />
                                    <span>{orderDetails.rider}</span>
                                </div>
                            </div>
                        </div>

                        <hr className="border-border" />

                        {/* Price Breakdown */}
                        <div className="space-y-4">
                            <h3 className="text-foreground font-bold tracking-tight">Payment Summary</h3>
                            <div className="space-y-3">
                                {orderDetails.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-muted-foreground">
                                        <span>{item.name}</span>
                                        <span className="text-foreground font-medium">{item.price}</span>
                                    </div>
                                ))}
                                <div className="pt-4 mt-2 border-t border-border flex justify-between items-center">
                                    <span className="text-lg font-bold text-foreground tracking-tight">Total Paid</span>
                                    <span className="text-2xl font-black text-secondary tracking-tighter">{orderDetails.amount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-muted rounded-2xl p-4 flex items-center justify-between border border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-secondary" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Method</p>
                                    <p className="text-foreground font-bold">{orderDetails.paymentMethod}</p>
                                </div>
                            </div>
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                        </div>
                    </div>

                    {/* Footer Decorative Serration */}
                    <div className="h-4 w-full bg-card flex gap-1 justify-center">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="w-3 h-3 bg-background rounded-full -mt-2" />
                        ))}
                    </div>
                </div>

                {/* Support Link */}
                <div className="mt-12 text-center">
                    <p className="text-muted-foreground mb-4 font-outfit">Having issues with your delivery?</p>
                    <Link to="/support">
                        <Button variant="link" className="text-secondary font-bold hover:brightness-110 tracking-wider uppercase text-xs">
                            Chat with Support
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
