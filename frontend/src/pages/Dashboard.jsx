import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import AsteroidVis from '../components/AsteroidVis';
import AsteroidCard from '../components/AsteroidCard';
import AnalyticsModal from '../components/AnalyticsModal';
import { Search, Radar, List, Box, ArrowUp, ArrowDown, ArrowUpDown, Bell, BellOff, Activity } from 'lucide-react';

import { useTranslation } from 'react-i18next';

import { calculateRisk } from '../utils/asteroidUtils';

const Dashboard = () => {
    const { t } = useTranslation();
    const [asteroids, setAsteroids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAsteroids, setFilteredAsteroids] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or '3d'
    const [focusedAsteroidId, setFocusedAsteroidId] = useState(null);
    const [sortBy, setSortBy] = useState('name'); // 'name', 'risk'
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);

    useEffect(() => {
        if (Notification.permission === 'granted') {
            setNotificationsEnabled(true);
        }
    }, []);

    useEffect(() => {
        if (asteroids.length > 0 && notificationsEnabled) {
            checkAlerts(asteroids);
        }
    }, [asteroids, notificationsEnabled]);

    const handleShowIn3D = (id) => {
        setFocusedAsteroidId(id);
        setViewMode('3d');
    };

    const toggleNotifications = async () => {
        if (notificationsEnabled) {
            setNotificationsEnabled(false);
            return;
        }

        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
            return;
        }

        if (Notification.permission === 'granted') {
            setNotificationsEnabled(true);
            checkAlerts(asteroids);
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                new Notification("Cosmic Watch System Online", {
                    body: "You will be alerted of any hazardous asteroids.",
                    icon: "/icon.png"
                });
                checkAlerts(asteroids);
            }
        }
    };



    const checkAlerts = (data) => {
        // Prevent multiple alerts per session
        if (sessionStorage.getItem('safetyAlertSent')) return;

        const hazardous = data.filter(a => (a.safety_score || 100) < 60);
        if (hazardous.length > 0) {
            const target = hazardous[0];
            new Notification(`⚠️ CRITICAL WARNING: ${target.name}`, {
                body: `Safety Score: ${target.safety_score}. Approach detected!`,
                requireInteraction: true,
                icon: "/icon.png"
            });
            sessionStorage.setItem('safetyAlertSent', 'true');
        }
    };

    useEffect(() => {
        fetchAsteroids();
    }, []);

    useEffect(() => {
        let result = [...asteroids];

        // 1. Filter
        if (searchTerm !== '') {
            const lower = searchTerm.toLowerCase();
            result = result.filter(a => a.name.toLowerCase().includes(lower));
        }

        // 2. Sort
        result.sort((a, b) => {
            let valA, valB;
            if (sortBy === 'name') {
                valA = a.name.replace(/[()]/g, '').trim();
                valB = b.name.replace(/[()]/g, '').trim();
                return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            } else if (sortBy === 'risk') {
                valA = a.risk_score || 0;
                valB = b.risk_score || 0;
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            }
            return 0;
        });

        setFilteredAsteroids(result);
    }, [searchTerm, asteroids, sortBy, sortOrder]);

    const fetchAsteroids = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/asteroids/feed`);
            // Flatten the day-wise object into a single array
            if (response.data.near_earth_objects) {
                const flatList = Object.values(response.data.near_earth_objects).flat().map(ast => ({
                    ...ast,
                    risk_score: calculateRisk(ast)
                }));
                setAsteroids(flatList);
                // filteredAsteroids will be updated by the useEffect
            }
        } catch (error) {
            console.error("Error fetching asteroids:", error);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="container mx-auto px-4 py-8 pt-24 min-h-screen">
            {/* Mission Control Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-center glass-panel p-4 rounded-2xl mb-8 gap-4">

                {/* Status Indicators */}
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 text-sm">
                        <Radar size={16} className="text-cyan-400 animate-pulse" />
                        <span className="text-slate-300">{t('dashboard.status_active')}</span>
                    </div>
                    <div className="w-px h-4 bg-slate-700"></div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">{t('dashboard.tracked_objects')}:</span>
                        <span className="text-white font-mono font-bold">{asteroids.length}</span>
                    </div>
                    <div className="w-px h-4 bg-slate-700"></div>
                    <button
                        onClick={toggleNotifications}
                        className={`flex items-center gap-2 text-sm transition-colors ${notificationsEnabled ? 'text-green-400 hover:text-green-300' : 'text-slate-400 hover:text-white'}`}
                        title={notificationsEnabled ? t('dashboard.disable_alerts') : t('dashboard.enable_alerts')}
                    >
                        {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                        <span>{notificationsEnabled ? t('dashboard.alerts_on') : t('dashboard.enable_alerts')}</span>
                    </button>
                </div>

                {/* View Controls & Filter/Sort */}
                <div className="flex flex-col md:flex-row gap-4 items-center w-full xl:w-auto">

                    <button
                        onClick={() => setShowAnalytics(true)}
                        className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    >
                        <Activity size={18} />
                        <span className="text-sm font-medium">Analytics</span>
                    </button>

                    {/* View Toggle */}
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded flex items-center gap-2 text-sm transition-all ${viewMode === 'list' ? 'bg-nasa-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <List size={16} /> {t('dashboard.view_list')}
                        </button>
                        <button
                            onClick={() => setViewMode('3d')}
                            className={`p-2 rounded flex items-center gap-2 text-sm transition-all ${viewMode === '3d' ? 'bg-nasa-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Box size={16} /> {t('dashboard.view_3d')}
                        </button>
                    </div>

                    <div className="w-px h-8 bg-slate-700 hidden md:block"></div>

                    {/* Sorting Controls */}
                    <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-700/50">
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-slate-300 text-sm font-medium py-1 pl-2 pr-6 appearance-none focus:outline-none cursor-pointer hover:text-white [&>option]:bg-slate-900 [&>option]:text-white"
                            >
                                <option value="name" className="bg-slate-900 text-white">{t('dashboard.sort_name')}</option>
                                <option value="risk" className="bg-slate-900 text-white">{t('dashboard.sort_risk')}</option>
                            </select>
                            <ArrowUpDown size={12} className="absolute right-1 top-1.5 text-slate-500 pointer-events-none" />
                        </div>

                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title={sortOrder === 'asc' ? "Ascending" : "Descending"}
                        >
                            {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder={t('dashboard.filter_placeholder')}
                            className="w-full bg-space-dark border border-slate-600 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-nasa-blue focus:ring-1 focus:ring-nasa-blue transition-all placeholder:text-slate-500 font-mono text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === '3d' && !loading ? (
                <div className="animate-in fade-in zoom-in duration-500">
                    <div className="animate-in fade-in zoom-in duration-500">
                        <AsteroidVis
                            asteroids={filteredAsteroids}
                            focusedAsteroidId={focusedAsteroidId}
                            setFocusedAsteroidId={setFocusedAsteroidId}
                        />
                    </div>
                </div>
            ) : (
                <>
                    {/* Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-64 glass-panel rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAsteroids.map(asteroid => (
                                <AsteroidCard
                                    key={asteroid.id}
                                    asteroid={asteroid}
                                    onShow3D={handleShowIn3D}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {!loading && filteredAsteroids.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                    <p>No asteroids found matching your search.</p>
                </div>
            )}

            <AnalyticsModal
                isOpen={showAnalytics}
                onClose={() => setShowAnalytics(false)}
                data={filteredAsteroids}
                allData={asteroids}
            />
        </div>
    );
};

export default Dashboard;
