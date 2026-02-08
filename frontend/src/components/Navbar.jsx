import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Rocket, LogOut, LayoutDashboard, Globe, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { t } = useTranslation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed w-full z-50 bg-space-dark/80 backdrop-blur-md border-b border-white/10">
            <div className="w-full max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-3 group">
                        {/* Radar Logo */}
                        <div className="relative w-10 h-10 flex items-center justify-center bg-cyan-950/30 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] overflow-hidden group-hover:border-cyan-400/50 transition-colors duration-300">
                            {/* Radar Sweep */}
                            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(34,211,238,0.2)_360deg)] animate-[spin_3s_linear_infinite]"></div>

                            {/* Grid Lines */}
                            <div className="absolute inset-0 border border-cyan-500/20 rounded-full scale-75"></div>
                            <div className="absolute inset-0 border border-cyan-500/20 rounded-full scale-50"></div>
                            <div className="absolute w-full h-[1px] bg-cyan-500/20 top-1/2 -translate-y-1/2"></div>
                            <div className="absolute h-full w-[1px] bg-cyan-500/20 left-1/2 -translate-x-1/2"></div>

                            {/* Center Dot */}
                            <div className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_5px_cyan] z-10"></div>

                            {/* Hazardous Blip */}
                            <div className="absolute top-2 right-3 w-1 h-1 bg-red-500 rounded-full animate-ping opacity-75"></div>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all">
                                COSMIC WATCH
                            </span>
                            <span className="text-[10px] text-cyan-500/70 tracking-[0.2em] font-mono leading-none">
                                PLANETARY DEFENSE
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        {currentUser ? (
                            <>
                                <Link to="/dashboard" className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${isActive('/dashboard') ? 'text-cyan-400 bg-white/5 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                                    <LayoutDashboard size={18} />
                                    <span>{t('navbar.dashboard')}</span>
                                </Link>
                                <Link to="/watchlist" className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${isActive('/watchlist') ? 'text-cyan-400 bg-white/5 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                                    <Rocket size={18} />
                                    <span>{t('navbar.watchlist')}</span>
                                </Link>
                                <Link to="/resources" className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${isActive('/resources') ? 'text-cyan-400 bg-white/5 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                                    <BookOpen size={18} />
                                    <span>{t('navbar.resources')}</span>
                                </Link>
                                <div className="h-6 w-px bg-white/10 mx-2"></div>
                                <LanguageSwitcher />
                                <div className="h-6 w-px bg-white/10 mx-2"></div>
                                <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-red-400 transition-colors">
                                    <LogOut size={18} />
                                    <span>{t('navbar.logout')}</span>
                                </button>
                                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-cyan-500/20 border border-white/20">
                                    {currentUser.email[0].toUpperCase()}
                                </div>
                            </>
                        ) : (
                            <>
                                <LanguageSwitcher />
                                <Link to="/login" className="text-slate-300 hover:text-white transition-colors">
                                    {t('navbar.login')}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-4">
                        <LanguageSwitcher />
                        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-space-card/95 backdrop-blur-xl border-b border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {currentUser ? (
                            <>
                                <Link to="/dashboard" className="block px-3 py-2 text-slate-300 hover:bg-white/5 rounded-md">
                                    {t('navbar.dashboard')}
                                </Link>
                                <Link to="/watchlist" className="block px-3 py-2 text-slate-300 hover:bg-white/5 rounded-md">
                                    {t('navbar.watchlist')}
                                </Link>
                                <Link to="/resources" className="block px-3 py-2 text-slate-300 hover:bg-white/5 rounded-md">
                                    {t('navbar.resources')}
                                </Link>
                                <button onClick={logout} className="block w-full text-left px-3 py-2 text-red-400 hover:bg-white/5 rounded-md">
                                    {t('navbar.logout')}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block px-3 py-2 text-slate-300 hover:bg-white/5 rounded-md">
                                    {t('navbar.login')}
                                </Link>
                                <Link to="/signup" className="block px-3 py-2 text-cyan-400 hover:bg-white/5 rounded-md">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
