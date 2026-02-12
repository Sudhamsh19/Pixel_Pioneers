import { Radar, ShieldBan, Wand2, Timer} from 'lucide-react';
import { useSystemHealth } from '../../../hooks/useSystemHealth';
import { useLiveTraffic } from '../../../hooks/useLiveTraffic';
import clsx from 'clsx';

const CommandCenter = () => {
    const { health } = useSystemHealth();
    const { traffic } = useLiveTraffic();

    // Calculate segments for the donut chart
    const total = health?.severity_dist.total || 1;
    const segments = [
        { label: 'Critical', value: health?.severity_dist.critical || 0, color: '#c91717' },
        { label: 'High', value: health?.severity_dist.high || 0, color: '#f59e0b' },
        { label: 'Medium', value: health?.severity_dist.medium || 0, color: '#ff4d00' },
        { label: 'Low', value: health?.severity_dist.low || 0, color: '#64748b' }
    ];

    const circumference = 2 * Math.PI * 40;
    let accumulatedOffset = 0;

    // Filter for only actioned items for the table
    const recentActions = traffic.filter(p => p.action !== 'MONITOR').slice(0, 4);

    return (
        <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">
            

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-dark/80 backdrop-blur-sm rounded-xl p-5 border border-slate-800 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Radar className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">Active Threats</p>
                    <div className="flex items-center gap-2">
                        <h3 className="text-3xl font-bold text-white tracking-tight">{health?.active_threats.toLocaleString() || '...'}</h3>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded flex items-center">
                            ↑ 12%
                        </span>
                    </div>
                    <div className="mt-4 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '65%' }}></div>
                    </div>
                </div>

                <div className="bg-surface-dark/80 backdrop-blur-sm rounded-xl p-5 border border-slate-800 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldBan className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">Blocked IPs (24h)</p>
                    <div className="flex items-center gap-2">
                        <h3 className="text-3xl font-bold text-white tracking-tight">{health?.blocked_ips.toLocaleString() || '...'}</h3>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            Avg. 350/hr
                        </span>
                    </div>
                    <div className="mt-4 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden border-b-2 border-primary/30">
                        <div className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(255,77,0,0.5)]" style={{ width: '88%' }}></div>
                    </div>
                </div>

                <div className="bg-surface-dark/80 backdrop-blur-sm rounded-xl p-5 border border-slate-800 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Wand2 className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">Auto-Remediated</p>
                    <div className="flex items-center gap-2">
                        <h3 className="text-3xl font-bold text-white tracking-tight">{health?.automation_rate || '94.2%'}</h3>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded flex items-center">
                            ↑ 2.1%
                        </span>
                    </div>
                    <div className="mt-4 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '94%' }}></div>
                    </div>
                </div>

                <div className="bg-surface-dark/80 backdrop-blur-sm rounded-xl p-5 border border-slate-800 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Timer className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">Mean Time to Respond</p>
                    <div className="flex items-center gap-2">
                        <h3 className="text-3xl font-bold text-white tracking-tight">1m 42s</h3>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded flex items-center">
                            ↓ 15s
                        </span>
                    </div>
                    <div className="mt-4 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full opacity-50" style={{ width: '45%' }}></div>
                    </div>
                </div>
            </div>

            {/* Split Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Severity Distribution */}
                <div className="lg:col-span-2 bg-surface-dark rounded-xl border border-slate-800 flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-base text-white uppercase tracking-tight">Incident Severity Distribution</h3>
                        <div className="bg-surface-darker border border-slate-800 text-slate-400 text-[10px] uppercase font-bold px-3 py-1 rounded">
                            Last 24 Hours
                        </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col md:flex-row items-center justify-around gap-8">
                        {/* Abstract Donut Chart */}
                        <div className="relative w-56 h-56 flex-shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="12" />
                                {segments.map((segment, idx) => {
                                    const segmentLength = (segment.value / total) * circumference;
                                    const offset = accumulatedOffset;
                                    accumulatedOffset += segmentLength;
                                    return (
                                        <circle 
                                            key={idx}
                                            cx="50" cy="50" r="40" 
                                            fill="transparent" 
                                            stroke={segment.color} 
                                            strokeWidth="12" 
                                            strokeDasharray={`${segmentLength} ${circumference}`} 
                                            strokeDashoffset={-offset} 
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-white">Total</span>
                                <span className="text-sm text-slate-500 font-mono">{health?.severity_dist.total || '0'}</span>
                            </div>
                        </div>

                        {/* Legend Grid */}
                        <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-md">
                            {[
                                { label: 'Critical', value: health?.severity_dist.critical || 0, change: '+2 new', color: 'bg-red-500' },
                                { label: 'High', value: health?.severity_dist.high || 0, change: '-5 avg', color: 'bg-amber-500' },
                                { label: 'Medium', value: health?.severity_dist.medium || 0, change: null, color: 'bg-primary' },
                                { label: 'Low', value: health?.severity_dist.low || 0, change: null, color: 'bg-slate-500' }
                            ].map((item, i) => (
                                <div key={i} className="bg-surface-darker/50 p-4 rounded-lg border border-slate-800/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={clsx("w-2 h-2 rounded-full", item.color)}></span>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{item.label}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-3xl font-bold text-white">{item.value}</span>
                                        {item.change && <span className={clsx("text-[10px] font-bold", item.change.includes('+') ? "text-red-500" : "text-slate-500")}>{item.change}</span>}
                                    </div>
                                    <div className="mt-2 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                        <div className={clsx("h-full", item.color)} style={{ width: `${(item.value / (health?.severity_dist.total || 1)) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-surface-dark rounded-xl border border-slate-800 flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-base text-white uppercase tracking-tight">System Health</h3>
                    </div>
                    <div className="p-5 flex flex-col gap-3">
                        {[
                            { name: 'API Gateway', status: 'Online (14ms)', color: 'bg-emerald-500' },
                            { name: 'Database Cluster', status: 'Critical Delay (2.4s)', color: 'bg-red-500', iconColor: 'text-red-500' },
                            { name: 'Decision Engine', status: 'Processing (Idle)', color: 'bg-amber-500' },
                            { name: 'Ingestion Pipelines', status: 'Service Interruption', color: 'bg-red-500' }
                        ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-surface-darker/50 border border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className={clsx("p-2 rounded bg-surface-dark", s.iconColor || "text-primary")}>
                                        <ShieldBan className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-white uppercase tracking-tight">{s.name}</h4>
                                        <p className={clsx("text-[10px] font-bold", s.color.replace('bg-', 'text-'))}>{s.status}</p>
                                    </div>
                                </div>
                                <div className={clsx("h-2 w-2 rounded-full", s.color)}></div>
                            </div>
                        ))}
                        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-500">
                            <span>LAST CHECK: JUST NOW</span>
                            <button className="text-primary hover:underline">VIEW DETAILED DIAGNOSTICS →</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface-dark rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-surface-darker/30">
                    <h3 className="font-bold text-base text-white uppercase tracking-wider flex items-center gap-2">
                        <Timer className="text-primary w-5 h-5" />
                        Recent Automated Actions
                    </h3>
                    <button className="text-slate-500 hover:text-white flex items-center gap-2 text-xs font-bold">
                         <Radar className="w-4 h-4" /> FILTER
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs uppercase font-bold tracking-tighter">
                        <thead className="bg-surface-darker text-slate-400">
                            <tr>
                                <th className="px-6 py-4 font-bold border-b border-slate-800">Time</th>
                                <th className="px-6 py-4 font-bold border-b border-slate-800">Action Type</th>
                                <th className="px-6 py-4 font-bold border-b border-slate-800">Target</th>
                                <th className="px-6 py-4 font-bold border-b border-slate-800">Trigger</th>
                                <th className="px-6 py-4 font-bold border-b border-slate-800">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {recentActions.map((action, idx) => (
                                <tr key={idx} className="hover:bg-primary/5 transition-colors border-b border-slate-800/50">
                                    <td className="px-6 py-4 text-slate-500 font-mono">{new Date(action.timestamp).toLocaleTimeString()}</td>
                                    <td className="px-6 py-4 text-white font-black">{action.action}</td>
                                    <td className="px-6 py-4 text-slate-400 font-mono">{action.src_ip}</td>
                                    <td className="px-6 py-4 text-slate-500">{action.type}</td>
                                    <td className="px-6 py-4">
                                        <span className={clsx("px-3 py-1 rounded border text-[10px]",
                                            idx === 1 ? "bg-red-500/10 text-red-500 border-red-500/30" : "bg-primary/10 text-primary border-primary/30"
                                        )}>
                                            {idx === 1 ? 'PENDING APPROVAL' : 'SUCCESS'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest pt-4">
                <span>© 2023 SEC-CORP. ALL RIGHTS RESERVED.</span>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> SYSTEM STATUS: 99.99% UPTIME</span>
                    <span>V2.4.0 (BUILD 8821)</span>
                </div>
            </div>
        </div>
    );
};

export default CommandCenter;
