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
        <div className="min-h-screen bg-background flex flex-col font-outfit relative overflow-hidden transition-colors duration-300">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="bg-card/80 backdrop-blur-xl border-b border-border px-4 py-4 md:px-8 sticky top-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-muted rounded-full">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-rocs-green-dark rounded-2xl flex items-center justify-center border border-border/50">
                                <User className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary border-2 border-background rounded-full" />
                        </div>
                        <div>
                            <h2 className="text-foreground font-bold tracking-tight">Customer Support</h2>
                            <p className="text-primary text-xs font-bold uppercase tracking-widest">Agent Sarah • Online</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-full">
                        <Search className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-full">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative z-10 scrollbar-hide">
                <div className="text-center py-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] bg-muted py-1.5 px-4 rounded-full border border-border">Today</span>
                </div>

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div className={`max-w-[80%] md:max-w-[60%] space-y-1`}>
                            <div
                                className={`p-4 md:p-5 rounded-3xl text-sm leading-relaxed shadow-lg ${msg.sender === 'user'
                                    ? 'bg-gradient-to-br from-primary to-rocs-green-dark text-primary-foreground font-medium rounded-tr-none'
                                    : 'bg-card text-foreground border border-border rounded-tl-none'
                                    }`}
                            >
                                {msg.text}
                            </div>
                            <div className={`flex items-center gap-2 px-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[10px] text-muted-foreground font-medium tracking-wider">{msg.timestamp}</span>
                                {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-primary" />}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-8 bg-background border-t border-border relative z-20">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-3">
                    <div className="flex gap-1 mr-2">
                        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-full">
                            <Paperclip className="w-5 h-5" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-full">
                            <Image className="w-5 h-5" />
                        </Button>
                    </div>
                    <Input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-2xl focus:ring-primary focus:border-primary transition-all"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="w-14 h-14 bg-gradient-to-r from-primary to-rocs-green-dark rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                        <Send className="w-6 h-6 text-primary-foreground" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
