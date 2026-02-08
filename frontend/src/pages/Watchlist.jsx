import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { calculateRisk } from '../utils/asteroidUtils';
import AsteroidCard from '../components/AsteroidCard';
import ConfirmationModal from '../components/ConfirmationModal';
import { useTranslation } from 'react-i18next';



const Watchlist = () => {
    const { currentUser } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { t } = useTranslation();

    const location = useLocation();

    useEffect(() => {
        if (currentUser) {
            fetchWatchlist();
        }
    }, [currentUser, location]);

    const fetchWatchlist = async () => {
        setLoading(true);
        try {
            const token = await currentUser.getIdToken();
            const response = await axios.get(`${API_BASE_URL}/api/asteroids/watchlist`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                }
            });

            const list = response.data.watchlist || [];
            // Inject risk_score using the shared utility
            const listWithRisk = list.map(item => ({
                ...item,
                risk_score: calculateRisk(item)
            }));
            setWatchlist(listWithRisk);
        } catch (error) {
            console.error("Error fetching watchlist:", error);
        } finally {
            setLoading(false);
        }
    };



    const confirmRemove = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleRemoveFromWatchlist = async () => {
        if (!deleteId) return;

        try {
            const token = await currentUser.getIdToken();
            await axios.delete(`${API_BASE_URL}/api/asteroids/watchlist/${deleteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from state immediately
            setWatchlist(prev => prev.filter(item => item.id !== deleteId && item.asteroidId !== deleteId));
            setDeleteId(null);
        } catch (error) {
            console.error("Failed to remove", error);
        }
    };

    if (loading && watchlist.length === 0) return <div className="text-center text-white pt-20">{t('dashboard.loading')}</div>;

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
                            // Important: Pass the ID that the delete API expects. 
                            // Usually this is `item.asteroidId` or `item.id` depending on backend.
                            // We'll pass `item.asteroidId` if it exists, otherwise `item.id`.
                            onRemove={() => confirmRemove(item.asteroidId || item.id)}
                            notes={item.saved_notes}
                        />
                    ))}
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleRemoveFromWatchlist}
                title={t('watchlist.removeConfirmTitle') || "Remove from Watchlist"}
                message={t('watchlist.removeConfirmMessage') || "Are you sure you want to stop tracking this object? You will stop receiving alerts for it."}
                confirmText={t('common.remove') || "Remove"}
                cancelText={t('common.cancel') || "Cancel"}
                isDanger={true}
            />
        </div>
    );
};

export default Watchlist;
