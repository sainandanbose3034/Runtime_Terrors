import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Rocket, Telescope, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useTranslation } from 'react-i18next';

const AsteroidCard = ({ asteroid, onRemove, notes }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);
    const { t } = useTranslation();

    // Risk Logic
    // Risk Logic
    const riskScore = asteroid.risk_score || 0;
    const isHighRisk = riskScore >= 50 || asteroid.is_potentially_hazardous_asteroid;

    const handleAddToWatchlist = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const token = await currentUser.getIdToken();
            await axios.post(`${API_BASE_URL}/api/asteroids/watchlist`, {
                asteroidId: asteroid.id,
                name: asteroid.name,
                notes: 'Added from Dashboard'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdded(true);
        } catch (error) {
            console.error("Failed to add to watchlist", error);
            if (error.response && error.response.status === 400 && error.response.data.message.includes('already')) {
                setAdded(true); // Mark as added if it's already there
                alert("Asteroid is already in your watchlist");
            } else {
                alert(error.response?.data?.message || "Failed to add to watchlist");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`glass-panel rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] border-l-4 ${isHighRisk ? 'border-l-risk-high' : 'border-l-risk-low'}`}>

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-nasa-white tracking-wide">{asteroid.name.replace(/[()]/g, '')}</h3>
                    <p className="text-slate-400 text-xs mt-1 font-mono">ID: {asteroid.id}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${asteroid.safety_score > 80 ? 'bg-green-500/20 text-green-400' : asteroid.safety_score > 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                    {asteroid.safety_score > 80 ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                    <span>{asteroid.safety_score > 80 ? t('dashboard.safe') : asteroid.safety_score > 50 ? t('dashboard.moderate') : t('dashboard.hazardous')}</span>
                </div>
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Telescope size={14} />
                        <span>{t('dashboard.diameter')}</span>
                    </div>
                    <span className="font-mono text-nasa-white text-lg">
                        {Math.round(asteroid.estimated_diameter.meters.estimated_diameter_max)} <span className="text-xs text-slate-500">m</span>
                    </span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Rocket size={14} />
                        <span>{t('dashboard.velocity')}</span>
                    </div>
                    <span className="font-mono text-nasa-white text-lg">
                        {Math.round(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour / 1000)} <span className="text-xs text-slate-500">k km/h</span>
                    </span>
                </div>

                {/* Safety Score */}
                <div className="col-span-2 bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors flex-col">
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>{t('dashboard.risk_level')}</span>
                            <span className={isHighRisk ? "text-risk-high" : "text-risk-low"}>
                                {riskScore}/100
                            </span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${isHighRisk ? 'bg-risk-high' : 'bg-risk-low'}`}
                                style={{ width: `${riskScore}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Approach */}
            <div className="flex justify-between items-end mt-2">
                <div className="text-xs text-slate-400">
                    <p>{t('dashboard.miss_distance')}:</p>
                    <p className="font-mono text-nasa-white text-sm">
                        {(parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers) / 1000000).toFixed(2)} M km
                    </p>
                </div>

                <div className="flex gap-2">
                    {onRemove ? (
                        <button
                            onClick={() => onRemove(asteroid.id)}
                            className="p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold bg-red-900/20 hover:bg-red-900/40 text-red-300 border border-red-500/20 hover:border-red-500/40"
                        >
                            {t('watchlist.remove')} <Trash2 size={14} />
                        </button>
                    ) : (
                        currentUser && (
                            <button
                                onClick={handleAddToWatchlist}
                                disabled={loading || added}
                                className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold ${added ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-nasa-blue hover:bg-blue-700 text-white'}`}
                            >
                                {added ? (
                                    <>{t('watchlist.added')} <ShieldCheck size={14} /></>
                                ) : (
                                    <>{t('watchlist.watch')} <Plus size={14} /></>
                                )}
                            </button>
                        )
                    )}
                </div>
            </div>

            {notes && (
                <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs text-slate-400 italic">"{notes}"</p>
                </div>
            )}

            {/* Geometric Decoration */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-tr from-nasa-blue to-transparent opacity-10 rounded-full blur-xl pointer-events-none"></div>
        </div>
    );
};

export default AsteroidCard;
