import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, Activity, Globe, ArrowRight, Rocket } from 'lucide-react';
import RealisticEarth from '../components/RealisticEarth';

import { useTranslation } from 'react-i18next';

const Home = () => {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    return (
        <div className="min-h-screen pt-20 relative">
            <div className="fixed inset-0 z-0">
                <RealisticEarth />
            </div>

            {/* Hero Section */}
            <section className="relative z-10 h-[80vh] flex items-center justify-center text-center px-4 overflow-hidden pointer-events-none">
                <div className="relative z-10 max-w-4xl mx-auto pointer-events-auto">
                    <div className="inline-block mb-4 px-4 py-1 rounded-full bg-nasa-blue/30 border border-nasa-blue/50 text-cyan-400 font-mono text-sm animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                        ● {t('home.system_online')} // {t('home.monitoring_active')}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                        {t('home.hero_title_prefix')} <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-nasa-blue">{t('home.hero_title_suffix')}</span>
                    </h1>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {t('home.hero_desc')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/dashboard"
                            className="px-8 py-4 bg-nasa-blue hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(11,61,145,0.5)] hover:shadow-[0_0_30px_rgba(11,61,145,0.7)] flex items-center justify-center gap-2"
                        >
                            <Rocket size={20} /> {t('home.launch_dashboard')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="relative z-10 py-20 bg-space-bg/50 backdrop-blur-sm">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="bg-nasa-blue/20 p-4 rounded-xl inline-block mb-4 text-nasa-blue">
                                <Globe size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">{t('home.live_feed_title')}</h3>
                            <p className="text-slate-400">{t('home.live_feed_desc')}</p>
                        </div>
                        <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="bg-nasa-red/20 p-4 rounded-xl inline-block mb-4 text-nasa-red">
                                <ShieldAlert size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">{t('home.risk_analysis_title')}</h3>
                            <p className="text-slate-400">{t('home.risk_analysis_desc')}</p>
                        </div>
                        <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="bg-emerald-500/20 p-4 rounded-xl inline-block mb-4 text-emerald-400">
                                <Activity size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">{t('home.watchlist_title')}</h3>
                            <p className="text-slate-400">{t('home.watchlist_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
