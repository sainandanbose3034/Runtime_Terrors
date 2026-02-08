
import React, { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis, PieChart, Pie, Cell
} from 'recharts';
import { X, Cpu, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CosmicAnalytics = ({ isOpen, onClose, data, allData }) => {
    // Fixed hook order to prevent crashes
    const { t } = useTranslation();
    const [mode, setMode] = useState('view'); // 'view' (filtered) or 'all'

    const dataset = mode === 'view' ? data : allData;

    // --- Statistics Logic ---
    const stats = useMemo(() => {
        const total = dataset.length;
        if (total === 0) return null;

        const hazardous = dataset.filter(a => (a.risk_score || 0) >= 50);
        const hazardousCount = hazardous.length;
        const safeCount = total - hazardousCount;

        // Find closest
        const sortedByDist = [...dataset].sort((a, b) => {
            const distA = parseFloat(a.close_approach_data?.[0]?.miss_distance?.kilometers || Infinity);
            const distB = parseFloat(b.close_approach_data?.[0]?.miss_distance?.kilometers || Infinity);
            return distA - distB;
        });
        const closest = sortedByDist[0];
        const closestDistRaw = parseFloat(closest?.close_approach_data?.[0]?.miss_distance?.kilometers || 0);
        const closestDist = (closestDistRaw / 1000000).toFixed(2) + " M km";

        // Find largest
        const sortedBySize = [...dataset].sort((a, b) => {
            const sizeA = a.estimated_diameter?.meters?.estimated_diameter_max || 0;
            const sizeB = b.estimated_diameter?.meters?.estimated_diameter_max || 0;
            return sizeB - sizeA;
        });
        const largest = sortedBySize[0];
        const largestSize = (largest?.estimated_diameter?.meters?.estimated_diameter_max || 0).toFixed(1);

        // Average velocity
        const totalVel = dataset.reduce((acc, curr) => acc + parseFloat(curr.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour || 0), 0);
        const avgVelKmph = (totalVel / total);
        const avgVelKmps = (avgVelKmph / 3600).toFixed(1); // km/s
        const avgVelDisplay = `${parseInt(avgVelKmph).toLocaleString()} km/h`;

        return {
            total,
            hazardousCount,
            safeCount,
            closest,
            closestDist,
            largest,
            largestSize,
            avgVelKmps,
            avgVelDisplay
        };
    }, [dataset]);

    // --- AI Summary Generation ---
    const summaryText = useMemo(() => {
        if (!stats) return "No data available for analysis.";

        const { total, hazardousCount, closest, closestDist, largest, largestSize, avgVelKmps, avgVelDisplay } = stats;
        const percentHaz = ((hazardousCount / total) * 100).toFixed(1);

        let safetyAssessment = "";
        if (percentHaz > 20) safetyAssessment = "CRITICAL ALERT: High density of hazardous objects detected.";
        else if (percentHaz > 5) safetyAssessment = "WARNING: Elevanted threat level. Monitoring recommended.";
        else safetyAssessment = "STATUS: Sector relatively clear. Routine monitoring active.";

        return `
            ANALYSIS COMPLETE.
            
            Scanned ${total} Near-Earth Objects in selected sector.
            
            THREAT ASSESSMENT:
            ${hazardousCount} objects (${percentHaz}%) identified as Potentially Hazardous.
            ${safetyAssessment}
            
            KEY TARGETS:
            • Closest Approach: Object ${closest?.name} at ${closestDist}.
            • Largest Object: Object ${largest?.name} with diameter ~${largestSize}m.
            
            TELEMETRY:
            Average relative velocity across sector is ${avgVelKmps} km/s (${avgVelDisplay}).
        `.trim();
    }, [stats]);


    // --- Chart Data Preparation ---
    const chartData = useMemo(() => {
        return dataset.map(a => ({
            name: a.name.replace(/[()]/g, ''),
            diameter: a.estimated_diameter?.meters?.estimated_diameter_max || 0,
            distance: parseFloat(a.close_approach_data?.[0]?.miss_distance?.kilometers || 0) / 1000000, // in M km
            velocity: parseFloat(a.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour || 0),
            hazardous: (a.risk_score || 0) >= 50 ? 1 : 0
        }));
    }, [dataset]);

    const pieData = useMemo(() => stats ? [
        { name: 'Hazardous', value: stats.hazardousCount || 0, color: '#ef4444' },
        { name: 'Safe', value: stats.safeCount || 0, color: '#22d3ee' },
    ] : [], [stats]);

    // Safety check for rendering (Move this AFTER all hooks)
    if (!isOpen) return null;

    // If no stats (empty data), show empty state
    if (!stats) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                <div
                    className="bg-slate-950/90 border border-cyan-900/50 rounded-2xl p-6 max-w-md w-full text-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-white mb-2">Insufficient Data</h2>
                    <p className="text-slate-400 mb-6">No asteroid data available for analysis. Try adjusting your filters.</p>
                    <button
                        onClick={onClose}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Close Console
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div
                className="bg-slate-950/90 border border-cyan-900/50 rounded-2xl shadow-[0_0_50px_rgba(8,145,178,0.2)] w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-cyan-900/30 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                            <Cpu className="text-cyan-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-wide">COSMIC ANALYTICS CORE</h2>
                            <p className="text-xs text-cyan-500/60 font-mono tracking-widest">AI-POWERED THREAT ANALYSIS</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                            <button
                                onClick={() => setMode('view')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'view' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Current View
                            </button>
                            <button
                                onClick={() => setMode('all')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'all' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                All Database ({allData.length})
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="text-slate-500 hover:text-white hover:rotate-90 transition-all duration-300"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: AI Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Summary Card */}
                        <div className="bg-slate-900/50 border border-cyan-900/30 rounded-xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Activity size={80} className="text-cyan-500" />
                            </div>
                            <h3 className="text-sm font-bold text-cyan-400 mb-4 font-mono flex items-center gap-2">
                                <Cpu size={16} /> SYSTEM SUMMARY
                            </h3>
                            <div className="font-mono text-sm text-cyan-100/80 leading-relaxed whitespace-pre-line border-l-2 border-cyan-500/50 pl-4 py-2 bg-cyan-950/10">
                                {summaryText}
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-center">
                                <div className="text-red-500 font-bold text-2xl">{stats.hazardousCount}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Hazardous</div>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-center">
                                <div className="text-cyan-500 font-bold text-2xl">{stats.safeCount}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Safe</div>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-center col-span-2">
                                <div className="text-white font-bold text-lg">{stats.avgVelKmps} km/s</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Avg Velocity</div>
                            </div>
                        </div>

                        {/* Hazard Ratio Pie */}
                        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl h-64 flex flex-col items-center justify-center">
                            <h4 className="text-xs text-slate-500 uppercase tracking-widest mb-2 self-start">Threat Distribution</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right Column: Graphs */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Scatter Plot */}
                        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl p-4 min-h-[300px]">
                            <h4 className="text-xs text-slate-500 uppercase tracking-widest mb-4">Correlation: Distance vs Size</h4>
                            <ResponsiveContainer width="100%" height={280}>
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis
                                        type="number"
                                        dataKey="distance"
                                        name="Distance"
                                        unit="M km"
                                        stroke="#64748b"
                                        tick={{ fill: '#64748b', fontSize: 10 }}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey="diameter"
                                        name="Diameter"
                                        unit="m"
                                        stroke="#64748b"
                                        tick={{ fill: '#64748b', fontSize: 10 }}
                                    />
                                    <Tooltip
                                        cursor={{ strokeDasharray: '3 3' }}
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    />
                                    <Scatter name="Asteroids" data={chartData} fill="#22d3ee">
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.hazardous ? '#ef4444' : '#22d3ee'} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Velocity Bar Chart */}
                        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl p-4 min-h-[300px]">
                            <h4 className="text-xs text-slate-500 uppercase tracking-widest mb-4">Velocity Profile (Top 20 Fastest)</h4>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart
                                    data={[...chartData].sort((a, b) => b.velocity - a.velocity).slice(0, 20)}
                                    margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} angle={-45} textAnchor="end" height={60} interval={0} />
                                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                        cursor={{ fill: '#ffffff10' }}
                                    />
                                    <Bar dataKey="velocity" name="Velocity (km/h)" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.hazardous ? '#ef4444' : '#3b82f6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CosmicAnalytics;
