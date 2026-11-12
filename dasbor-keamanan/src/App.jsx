import React, { useState, useEffect, useCallback } from 'react';
import { Shield, AlertCircle, Terminal, Activity, Clock, ArrowUpDown, Lock, LogOut } from 'lucide-react';

function App() {
    const [token, setToken] = useState(localStorage.getItem('waf_token') || '');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [logs, setLogs] = useState([]);
    const [sortOrder, setSortOrder] = useState('newest');
    const [stats, setStats] = useState({
        total: 0,
        terakhir: '-',
        dominan: '-'
    });

    const handleLogout = useCallback(() => {
        localStorage.removeItem('waf_token');
        setToken('');
        setLogs([]);
    }, []);

    const kalkulasiStatistik = (data) => {
        if (data.length === 0) return;
        const total = data.length;
        const waktuTerakhir = new Date(data[0].waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const frekuensi = {};
        let ancamanDominan = data[0].jenisSerangan;
        let maksFrekuensi = 0;
        
        data.forEach(log => {
            frekuensi[log.jenisSerangan] = (frekuensi[log.jenisSerangan] || 0) + 1;
            if (frekuensi[log.jenisSerangan] > maksFrekuensi) {
                maksFrekuensi = frekuensi[log.jenisSerangan];
                ancamanDominan = log.jenisSerangan;
            }
        });
        setStats({ total, terakhir: waktuTerakhir, dominan: ancamanDominan });
    };

    const fetchLogs = useCallback(() => {
        if (!token) return;

        fetch('http://localhost:3000/api/logs', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (response.status === 401 || response.status === 403) {
                    handleLogout();
                    throw new Error('Session expired');
                }
                return response.json();
            })
            .then(data => {
                setLogs(data);
                kalkulasiStatistik(data);
            })
            .catch(error => console.error("Gagal mengambil data log:", error));
    }, [token, handleLogout]);

    useEffect(() => {
        if (!token) return;
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, [token, fetchLogs]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                setLoginError(data.message || 'Authentication failed.');
            } else {
                localStorage.setItem('waf_token', data.token);
                setToken(data.token);
                setUsername('');
                setPassword('');
            }
        } catch {
            setLoginError('Unable to connect to WAF server.');
        } finally {
            setIsLoading(false);
        }
    };

    const getBadgeStyle = (jenis) => {
        switch(jenis) {
            case 'SQL Injection': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'XSS': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Path Traversal': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'Honeypot Triggered': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'Rate Limit Exceeded': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
            default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
        }
    };

    // Tampilan Login Gate jika belum terautentikasi
    if (!token) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans flex items-center justify-center px-4 selection:bg-zinc-800">
                <div className="w-full max-w-sm bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-6 space-y-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <Lock className="w-5 h-5 text-zinc-100" />
                        </div>
                        <h1 className="text-base font-semibold text-zinc-100 tracking-wide">WAF Console Access</h1>
                        <p className="text-xs text-zinc-500">Authenticate to view security telemetry</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {loginError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center">
                                {loginError}
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-400">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors"
                                placeholder="admin"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-400">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const sortedLogs = [...logs].sort((a, b) => {
        if (sortOrder === 'newest') {
            return new Date(b.waktu) - new Date(a.waktu);
        } else {
            return new Date(a.waktu) - new Date(b.waktu);
        }
    });

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-zinc-800">
            <header className="border-b border-zinc-800/80 bg-zinc-950/50 sticky top-0 z-10 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-md">
                            <Shield className="w-5 h-5 text-zinc-100" />
                        </div>
                        <h1 className="text-sm font-semibold text-zinc-100 tracking-wide">WAF Console</h1>
                        <span className="text-zinc-700 mx-2">/</span>
                        <span className="text-xs font-mono text-zinc-500">production-env</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-xs font-medium text-zinc-300">System Online</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                            title="Sign Out"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-zinc-500 mb-2">
                            <Activity className="w-4 h-4" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider">Total Threats Blocked</h3>
                        </div>
                        <p className="text-3xl font-bold text-zinc-100">{stats.total}</p>
                    </div>
                    
                    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-zinc-500 mb-2">
                            <AlertCircle className="w-4 h-4" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider">Top Attack Vector</h3>
                        </div>
                        <p className="text-xl font-semibold text-zinc-100 truncate">{stats.dominan}</p>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-zinc-500 mb-2">
                            <Clock className="w-4 h-4" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider">Latest Incident</h3>
                        </div>
                        <p className="text-xl font-mono text-zinc-100">{stats.terakhir}</p>
                    </div>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/50">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-zinc-400" />
                            <h2 className="text-sm font-semibold text-zinc-200">Security Events Log</h2>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1">
                                <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                                <select 
                                    className="bg-transparent text-xs text-zinc-300 font-medium outline-none cursor-pointer"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="newest" className="bg-zinc-900">Terbaru</option>
                                    <option value="oldest" className="bg-zinc-900">Terlama</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono border-l border-zinc-800 pl-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse"></span>
                                Live Sync
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800/50 bg-zinc-900/20 text-xs uppercase tracking-wider text-zinc-500">
                                    <th className="px-5 py-3 font-medium">Timestamp</th>
                                    <th className="px-5 py-3 font-medium">Event Type</th>
                                    <th className="px-5 py-3 font-medium">Target Path</th>
                                    <th className="px-5 py-3 font-medium text-right">Source IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50 text-sm">
                                {sortedLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-5 py-8 text-center text-zinc-500">
                                            No security events recorded.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedLogs.map((log, index) => (
                                        <tr key={index} className="hover:bg-zinc-800/20 transition-colors group">
                                            <td className="px-5 py-3 whitespace-nowrap text-zinc-400 font-mono text-xs">
                                                {new Date(log.waktu).toLocaleString('id-ID', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second:'2-digit' })}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeStyle(log.jenisSerangan)}`}>
                                                    {log.jenisSerangan}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 font-mono text-xs text-zinc-300 break-all">
                                                {log.targetURL}
                                            </td>
                                            <td className="px-5 py-3 text-right font-mono text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                                {log.alamatIP}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}

export default App;