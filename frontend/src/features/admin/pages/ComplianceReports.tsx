import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

/* ================= TYPES ================= */

interface AuditLog {
    id: number;
    timestamp: string;
    src_ip: string;
    type: string;
    action: string;
    handled_by?: string;
}

interface ReportItem {
    name: string;
    date: string;
    status: string;
}

/* ================= COMPONENT ================= */

const ComplianceReports = () => {

    const [stats, setStats] = useState({
        total: 0,
        blocks: 0,
        autoRate: 0
    });

    // Reports created once (avoids impure Date.now during render)
    const [reports] = useState<ReportItem[]>(() => [
        {
            name: 'Weekly Security Audit',
            date: new Date().toISOString(),
            status: 'Ready'
        },
        {
            name: 'Incident Response Latency',
            date: new Date(Date.now() - 86400000).toISOString(),
            status: 'Ready'
        },
        {
            name: 'GDPR Compliance Check',
            date: new Date(Date.now() - 172800000).toISOString(),
            status: 'Archived'
        },
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiClient.get('/logs/audit');
                const logs: AuditLog[] = res.data;

                console.log("Fetched logs for stats:", logs);

                const blocks = logs.filter((l) =>
                    l.action.includes('BLOCK')
                ).length;

                const auto = logs.filter((l) =>
                    l.handled_by === 'SYSTEM_AUTOMATION'
                ).length;

                setStats({
                    total: logs.length,
                    blocks,
                    autoRate: logs.length > 0 ? (auto / logs.length) * 100 : 0
                });

            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FileText className="text-primary" />
                    Compliance & Reports
                </h1>
                <p className="text-slate-400 mt-2">
                    System Accountability & Governance Audit Dashboard.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface-dark p-6 rounded-xl border border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Total Recorded Events
                    </p>
                    <p className="text-3xl font-bold text-white mt-1">
                        {stats.total}
                    </p>
                </div>

                <div className="bg-surface-dark p-6 rounded-xl border border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Threats Neutralized
                    </p>
                    
                    <p className="text-3xl font-bold text-primary mt-1">
                        {stats.blocks}
                    </p>
                </div>

                <div className="bg-surface-dark p-6 rounded-xl border border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Automation Rate
                    </p>
                    <p className="text-3xl font-bold text-primary mt-1">
                        {stats.autoRate.toFixed(1)}%
                    </p>
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-surface-dark rounded-xl border border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-white">
                        Generated Reports
                    </h3>
                </div>

                <div className="divide-y divide-slate-800">
                    {reports.map((report, idx) => (
                        <div
                            key={idx}
                            className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">
                                        {report.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {format(new Date(report.date), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            </div>

                            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ComplianceReports;
