import React, { useState, useEffect, useRef } from 'react';
import { Send, User, ChevronLeft, Image, Paperclip, MoreVertical, Search, CheckCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Link } from 'react-router-dom';

interface Message {
    id: string;
    sender: 'user' | 'agent';
    text: string;
    timestamp: string;
}

export default function SupportChat() {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'agent', text: "Hello! I'm Sarah from Rocs Crew Support. How can I help you today?", timestamp: '02:30 PM' },
        { id: '2', sender: 'user', text: "I have a question about my last delivery status.", timestamp: '02:31 PM' },
        { id: '3', sender: 'agent', text: "Sure, let me check that for you. May I have your order ID?", timestamp: '02:31 PM' },
    ]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: inputText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages([...messages, newMessage]);
        setInputText('');

        // Simulate agent response
        setTimeout(() => {
            const response: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'agent',
                text: "Thank you for the information. Our delivery specialist is looking into it now.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, response]);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#0a110d] flex flex-col font-outfit relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rocs-green/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="bg-[#112417]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 md:px-8 sticky top-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard">
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-[#eab308] hover:bg-white/5 rounded-full">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-rocs-green to-[#065f46] rounded-2xl flex items-center justify-center border border-white/10">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-rocs-green border-2 border-[#112417] rounded-full" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold tracking-tight">Customer Support</h2>
                            <p className="text-rocs-green text-xs font-bold uppercase tracking-widest">Agent Sarah • Online</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="text-white/70 hover:text-[#eab308] rounded-full">
                        <Search className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white/70 hover:text-[#eab308] rounded-full">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative z-10 scrollbar-hide">
                <div className="text-center py-4">
                    <span className="text-[10px] font-bold text-[#8b9d93] uppercase tracking-[0.2em] bg-white/5 py-1.5 px-4 rounded-full border border-white/5">Today</span>
                </div>

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div className={`max-w-[80%] md:max-w-[60%] space-y-1`}>
                            <div
                                className={`p-4 md:p-5 rounded-3xl text-sm leading-relaxed shadow-lg ${msg.sender === 'user'
                                        ? 'bg-gradient-to-br from-[#eab308] to-[#ca8a04] text-black font-medium rounded-tr-none'
                                        : 'bg-[#112417] text-white border border-white/5 rounded-tl-none'
                                    }`}
                            >
                                {msg.text}
                            </div>
                            <div className={`flex items-center gap-2 px-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[10px] text-[#8b9d93] font-medium tracking-wider">{msg.timestamp}</span>
                                {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-[#eab308]" />}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-8 bg-[#0a110d] border-t border-white/5 relative z-20">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-3">
                    <div className="flex gap-1 mr-2">
                        <Button type="button" variant="ghost" size="icon" className="text-[#8b9d93] hover:text-[#eab308] rounded-full">
                            <Paperclip className="w-5 h-5" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="text-[#8b9d93] hover:text-[#eab308] rounded-full">
                            <Image className="w-5 h-5" />
                        </Button>
                    </div>
                    <Input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 h-14 bg-[#112417] border-white/10 text-white placeholder:text-[#8b9d93] rounded-2xl focus:ring-[#eab308] focus:border-[#eab308] transition-all"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="w-14 h-14 bg-gradient-to-r from-rocs-green to-[#065f46] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                        <Send className="w-6 h-6 text-white" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
