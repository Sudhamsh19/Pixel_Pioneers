import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, FileText, Gavel, History, Settings, Bell, Search } from 'lucide-react';
import clsx from 'clsx';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: FileText, label: 'Incidents', path: '/admin/incidents' },
        { icon: History, label: 'Audit Logs', path: '/admin/compliance' },
        { icon: Gavel, label: 'Policies', path: '/admin/policy' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div className="flex h-screen bg-background-dark text-slate-200 font-display selection:bg-primary selection:text-white dark">
            {/* Sidebar */}
            <aside className="w-64 bg-surface-dark border-r border-slate-800 flex flex-col z-20 hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tighter">
                        <Shield className="w-6 h-6" />
                        <span className="text-white">SOAR<span className="text-slate-500 font-light">OPS</span></span>
                    </div>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative",
                                    isActive
                                        ? "bg-primary/10 text-primary border-r-2 border-primary"
                                        : "text-slate-400 hover:bg-primary/10 hover:text-primary"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-dark transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white text-xs font-bold">
                            AU
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-slate-200">Admin User</p>
                            <p className="text-xs text-slate-500 truncate">SecOps Lead</p>
                        </div>
                        <Settings className="w-4 h-4 text-slate-400" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-surface-dark border-b border-slate-800 flex items-center justify-between px-6 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-white">
                            Dashboard <span className="text-slate-500 font-normal mx-2">/</span> <span className="text-base font-normal text-slate-400">Shift Delta</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                            <span className="text-sm text-slate-400">Open Tickets:</span>
                            <span className="text-lg font-bold text-white">12</span>
                        </div>
                        <div className="h-4 w-px bg-slate-700"></div>
                        <button className="relative p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface-dark"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto bg-background-dark">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
