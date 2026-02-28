import React, { useState } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Plus, Wallet as WalletIcon, ChevronRight, LayoutDashboard, History, Settings, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export default function Wallet() {
    const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'withdrawals'>('all');

    const transactions = [
        { id: '1', type: 'withdrawal', amount: 'KSh 450', title: 'Delivery Order #8829', date: 'Today, 02:45 PM', status: 'Completed' },
        { id: '2', type: 'deposit', amount: 'KSh 2,500', title: 'Wallet Top-up (M-Pesa)', date: 'Yesterday, 06:12 PM', status: 'Completed' },
        { id: '3', type: 'withdrawal', amount: 'KSh 120', title: 'Delivery Tip', date: 'Feb 25, 2026', status: 'Completed' },
        { id: '4', type: 'withdrawal', amount: 'KSh 380', title: 'Delivery Order #8712', date: 'Feb 24, 2026', status: 'Completed' },
    ];

    return (
        <div className="min-h-screen bg-background py-12 px-4 md:px-8 space-y-12 relative overflow-hidden font-outfit transition-colors duration-300">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-secondary/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">My Wallet</h1>
                        <p className="text-muted-foreground text-lg font-medium leading-relaxed">Manage your balances and transaction history.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button className="bg-gradient-to-r from-primary to-rocs-green-dark hover:brightness-110 text-primary-foreground font-bold h-14 px-8 rounded-2xl shadow-lg transition-all">
                            <Plus className="w-5 h-5 mr-3" />
                            TOP UP
                        </Button>
                        <Button variant="outline" className="border-border bg-card text-foreground hover:bg-muted h-14 px-8 rounded-2xl">
                            WITHDRAW
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Card Section */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Balance Card */}
                        <div className="bg-gradient-to-br from-rocs-green to-[#065f46] rounded-[2.5rem] p-10 md:p-12 shadow-[0_0_40px_rgba(33,197,94,0.3)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-card/10 blur-[100px] rounded-full -mr-48 -mt-48" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="w-14 h-14 bg-card/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-border/30 shadow-lg">
                                        <WalletIcon className="w-8 h-8 text-foreground" />
                                    </div>
                                    <Button variant="ghost" className="text-foreground hover:bg-card/10 rounded-full h-10 w-10 p-0">
                                        <ChevronRight className="w-6 h-6" />
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-foreground/70 font-bold uppercase tracking-[0.2em] text-sm">Available Balance</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-foreground">KSh</span>
                                        <span className="text-6xl font-black text-foreground tracking-tighter">4,820.50</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transactions Section */}
                        <div className="bg-card rounded-[2.5rem] p-8 md:p-10 border border-border shadow-2xl">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-bold text-foreground tracking-tight">Recent Activity</h3>
                                <div className="flex bg-muted rounded-xl p-1 border border-border">
                                    {(['all', 'deposits', 'withdrawals'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'deposit' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                                                } border border-border group-hover:scale-110 transition-transform`}>
                                                {tx.type === 'deposit' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <p className="text-foreground font-bold tracking-tight">{tx.title}</p>
                                                <p className="text-muted-foreground text-xs font-medium">{tx.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-black tracking-tighter ${tx.type === 'deposit' ? 'text-primary' : 'text-foreground'
                                                }`}>
                                                {tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                                            </p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{tx.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button variant="link" className="w-full mt-10 text-primary font-bold hover:brightness-110 uppercase tracking-widest text-xs">
                                View All Transactions
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar Section */}
                    <div className="space-y-10">
                        {/* Quick Actions Card */}
                        <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-2xl space-y-8">
                            <h3 className="text-xl font-bold text-foreground tracking-tight">Quick Actions</h3>
                            <div className="space-y-4">
                                <Button className="w-full justify-between h-14 bg-muted border border-border hover:bg-muted/80 text-foreground rounded-2xl px-6 group">
                                    <div className="flex items-center gap-4">
                                        <History className="w-5 h-5 text-primary" />
                                        <span className="font-bold">Usage Stats</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button className="w-full justify-between h-14 bg-muted border border-border hover:bg-muted/80 text-foreground rounded-2xl px-6 group">
                                    <div className="flex items-center gap-4">
                                        <Settings className="w-5 h-5 text-primary" />
                                        <span className="font-bold">Bank Settings</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>

                        {/* Payment Method Card */}
                        <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-2xl space-y-8 relative overflow-hidden">
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/5 blur-3xl rounded-full" />
                            <h3 className="text-xl font-bold text-foreground tracking-tight">Default Payment</h3>
                            <div className="p-6 bg-muted border border-border rounded-3xl relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center shadow-sm">
                                        <CreditCard className="w-6 h-6 text-primary" />
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <p className="text-foreground font-black text-xl tracking-tighter mb-1">M-Pesa Business</p>
                                <p className="text-muted-foreground text-sm font-medium tracking-widest">**** **** **50</p>
                            </div>
                            <Button className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all text-xs">
                                Change Default
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
