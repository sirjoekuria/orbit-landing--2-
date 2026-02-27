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
        <div className="min-h-screen bg-[#0a110d] py-12 px-4 relative overflow-hidden font-outfit">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rocs-green/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#eab308]/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-2xl mx-auto relative z-10">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-10">
                    <Link to="/dashboard">
                        <Button variant="ghost" className="text-white/70 hover:text-[#eab308] hover:bg-white/5 rounded-2xl gap-2 font-medium">
                            <ChevronLeft className="w-5 h-5" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-2xl w-12 h-12 p-0">
                            <Share2 className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-2xl w-12 h-12 p-0">
                            <Download className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Receipt Card */}
                <div className="bg-[#112417] rounded-[2.5rem] border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden relative">
                    {/* Status Header */}
                    <div className="bg-gradient-to-r from-rocs-green to-[#065f46] p-10 text-center relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30 shadow-lg">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Order Confirmed</h1>
                        <p className="text-white/80 font-medium">Order ID: {orderDetails.id}</p>
                    </div>

                    <div className="p-8 md:p-12 space-y-10">
                        {/* Delivery Path */}
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-6 h-6 rounded-full bg-[#eab308]/10 flex items-center justify-center border border-[#eab308]/20 shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-[#eab308]" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#eab308] uppercase tracking-widest mb-1">Pickup Location</p>
                                    <p className="text-white font-medium text-lg">{orderDetails.pickup}</p>
                                </div>
                            </div>

                            <div className="ml-3 h-12 border-l-2 border-dashed border-white/10" />

                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-6 h-6 rounded-full bg-rocs-green/10 flex items-center justify-center border border-rocs-green/20 shrink-0">
                                    <MapPin className="w-3 h-3 text-rocs-green" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-rocs-green uppercase tracking-widest mb-1">Dropoff Location</p>
                                    <p className="text-white font-medium text-lg">{orderDetails.dropoff}</p>
                                </div>
                            </div>
                        </div>

                        <hr className="border-white/5" />

                        {/* Grid Stats */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-[#8b9d93] uppercase tracking-widest">Date & Time</p>
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <Clock className="w-4 h-4 text-[#eab308]" />
                                    <span>{orderDetails.date}, {orderDetails.time}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-[#8b9d93] uppercase tracking-widest">Courier Partner</p>
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <Package className="w-4 h-4 text-[#eab308]" />
                                    <span>{orderDetails.rider}</span>
                                </div>
                            </div>
                        </div>

                        <hr className="border-white/5" />

                        {/* Price Breakdown */}
                        <div className="space-y-4">
                            <h3 className="text-white font-bold tracking-tight">Payment Summary</h3>
                            <div className="space-y-3">
                                {orderDetails.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-[#8b9d93]">
                                        <span>{item.name}</span>
                                        <span className="text-white font-medium">{item.price}</span>
                                    </div>
                                ))}
                                <div className="pt-4 mt-2 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-lg font-bold text-white tracking-tight">Total Paid</span>
                                    <span className="text-2xl font-black text-[#eab308] tracking-tighter">{orderDetails.amount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#eab308]/20 rounded-xl flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-[#eab308]" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#8b9d93] uppercase tracking-widest">Method</p>
                                    <p className="text-white font-bold">{orderDetails.paymentMethod}</p>
                                </div>
                            </div>
                            <CheckCircle2 className="w-6 h-6 text-rocs-green" />
                        </div>
                    </div>

                    {/* Footer Decorative Serration */}
                    <div className="h-4 w-full bg-[#112417] flex gap-1 justify-center">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="w-3 h-3 bg-[#0a110d] rounded-full -mt-2" />
                        ))}
                    </div>
                </div>

                {/* Support Link */}
                <div className="mt-12 text-center">
                    <p className="text-[#8b9d93] mb-4 font-outfit">Having issues with your delivery?</p>
                    <Link to="/support">
                        <Button variant="link" className="text-[#eab308] font-bold hover:text-[#ca8a04] tracking-wider uppercase text-xs">
                            Chat with Support
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
