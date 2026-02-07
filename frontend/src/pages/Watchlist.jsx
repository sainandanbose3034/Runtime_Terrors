import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import AsteroidCard from '../components/AsteroidCard';
import { useTranslation } from 'react-i18next';

const Watchlist = () => {
    const { currentUser } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        if (currentUser) {
            fetchWatchlist();
        }
    }, [currentUser]);

    const fetchWatchlist = async () => {
        try {
            const token = await currentUser.getIdToken();
            const response = await axios.get(`${API_BASE_URL}/api/asteroids/watchlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWatchlist(response.data.watchlist || []);
        } catch (error) {
            console.error("Error fetching watchlist:", error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWatchlist = async (asteroidId) => {
        if (!window.confirm('Remove from watchlist?')) return;
        try {
            const token = await currentUser.getIdToken();
            await axios.delete(`${API_BASE_URL}/api/asteroids/watchlist/${asteroidId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWatchlist(prev => prev.filter(item => item.asteroidId !== asteroidId));
        } catch (error) {
            console.error("Failed to remove", error);
        }
    };

    if (loading) return <div className="text-center text-white pt-20">{t('dashboard.loading')}</div>;

    return (
        <div className="container mx-auto px-4 py-8 pt-24 min-h-screen">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="bg-cyan-500/10 text-cyan-300 p-2 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-[0_0_10px_rgba(34,211,238,0.1)]">{t('watchlist.title')}</span>
                {t('watchlist.subtitle')}
            </h1>

            {watchlist.length === 0 ? (
                <div className="glass-panel p-10 text-center rounded-2xl">
                    <p className="text-slate-300/60 text-lg mb-4">{t('watchlist.empty')}</p>
                    <Link to="/dashboard" className="inline-block bg-nasa-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-cyan-500/20">
                        {t('navbar.dashboard')}
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {watchlist.map((item) => (
                        <AsteroidCard
                            key={item.id}
                            asteroid={item}
                            onRemove={removeFromWatchlist}
                            notes={item.saved_notes}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Watchlist;
