import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import API_BASE_URL from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Send, Minimize2, Maximize2 } from 'lucide-react';

// Initialize socket outside component to prevent multiple connections
const socket = io(API_BASE_URL);

const GlobalChat = () => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    // Hide chat on Dashboard to prevent 3D view obstruction
    if (location.pathname === '/dashboard') return null;

    // Generate a random explorer ID if not logged in
    const [explorerId] = useState(() => Math.floor(1000 + Math.random() * 9000));

    // Determine username
    const username = currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : `Explorer #${explorerId}`;

    useEffect(() => {
        // Join chat room
        socket.emit('join_chat', { username });

        // Listen for messages
        socket.on('receive_message', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off('receive_message');
        };
    }, [username]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim() === '') return;

        const messageData = {
            id: Date.now(),
            text: message,
            author: username,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isUser: true // Helper for local styling, though all are broadcast
        };

        // Emit to server
        socket.emit('send_message', messageData);
        setMessage('');
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => { setIsOpen(true); setIsMinimized(false); }}
                className="fixed bottom-6 right-6 px-6 py-3 bg-nasa-blue hover:bg-blue-600 text-white rounded-2xl shadow-[0_0_15px_rgba(11,61,145,0.5)] transition-all hover:scale-105 z-50 flex items-center gap-3 border border-cyan-400/30 backdrop-blur-md group animate-bounce-subtle"
                title="Open Mission Chat"
            >
                <div className="relative">
                    <MessageSquare size={20} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></span>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                </div>
                <span className="font-bold tracking-wide text-sm hidden md:block">Global Chat</span>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 glass-panel rounded-2xl z-50 transition-all duration-300 flex flex-col ${isMinimized ? 'w-72 h-14' : 'w-80 md:w-96 h-[500px]'}`}>

            {/* Header */}
            <div
                className="flex justify-between items-center p-4 border-b border-slate-700 cursor-pointer bg-slate-800/50 rounded-t-2xl"
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-bold text-white tracking-wide text-sm">Mission Control Chat</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="hover:text-white">
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="hover:text-red-400">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Content (Hidden if minimized) */}
            {!isMinimized && (
                <>
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        <div className="text-center text-xs text-slate-500 my-2">
                            <span className="bg-slate-800 px-2 py-1 rounded">System: Connected as {username}</span>
                        </div>

                        {messages.map((msg) => {
                            const isMe = msg.author === username;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isMe ? 'bg-nasa-blue text-white' : 'bg-slate-700 text-slate-300'}`}>
                                            {msg.author.charAt(0)}
                                        </div>
                                        <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-nasa-blue text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                                            {!isMe && <div className="text-[10px] text-cyan-400 font-bold mb-1">{msg.author}</div>}
                                            {msg.text}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-1 px-2">{msg.time}</span>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={sendMessage} className="p-3 border-t border-slate-700 bg-slate-800/30 rounded-b-2xl">
                        <div className="relative">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Transmit message..."
                                className="w-full bg-slate-900 border border-slate-600 text-white rounded-full pl-4 pr-12 py-2 focus:outline-none focus:border-nasa-blue focus:ring-1 focus:ring-nasa-blue text-sm transition-all"
                            />
                            <button
                                type="submit"
                                disabled={message.trim() === ''}
                                className="absolute right-1 top-1 p-1.5 bg-nasa-blue text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-nasa-blue transition-colors"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default GlobalChat;
