import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, ShieldBan, Clock } from 'lucide-react';

function App() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        terakhir: '-',
        dominan: '-'
    });

    const fetchLogs = () => {
        fetch('http://localhost:3000/api/logs')
            .then(response => response.json())
            .then(data => {
                setLogs(data);
                kalkulasiStatistik(data);
            })
            .catch(error => console.error("Gagal mengambil data log:", error));
    };

    const kalkulasiStatistik = (data) => {
        if (data.length === 0) return;
        
        const total = data.length;
        const waktuTerakhir = new Date(data[0].waktu).toLocaleTimeString('id-ID');
        
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

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    const getWarnaAncaman = (jenis) => {
        switch(jenis) {
            case 'SQL Injection': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'XSS': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            case 'Path Traversal': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'Honeypot Triggered': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                
                <div className="flex items-center space-x-4 border-b border-slate-800 pb-6">
                    <div className="p-3 bg-indigo-500/20 rounded-lg">
                        <ShieldAlert className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Sistem Pusat Keamanan</h1>
                        <p className="text-slate-400 text-sm mt-1">Pemantauan Web Application Firewall & Honeypot</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center space-x-4 shadow-sm">
                        <div className="p-3 bg-rose-500/10 rounded-full">
                            <Activity className="w-6 h-6 text-rose-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-medium">Total Ancaman Dihalau</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center space-x-4 shadow-sm">
                        <div className="p-3 bg-amber-500/10 rounded-full">
                            <ShieldBan className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-medium">Serangan Terbanyak</p>
                            <p className="text-xl font-bold text-white mt-1 truncate">{stats.dominan}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center space-x-4 shadow-sm">
                        <div className="p-3 bg-emerald-500/10 rounded-full">
                            <Clock className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-medium">Aktivitas Terakhir</p>
                            <p className="text-xl font-bold text-white mt-1">{stats.terakhir}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <h2 className="text-lg font-semibold text-white">Riwayat Lalu Lintas Berbahaya</h2>
                        <span className="flex items-center text-xs font-medium px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>
                            Sinkronisasi Aktif
                        </span>
                    </div>
                    
                    <div className="p-0">
                        {logs.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                                <ShieldAlert className="w-12 h-12 mb-3 opacity-20" />
                                <p>Situasi aman. Belum ada aktivitas ancaman yang terekam oleh sensor.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800/60 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {logs.map((log, index) => (
                                    <div key={index} className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start space-x-4">
                                            <div className="mt-1 hidden md:block">
                                                <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-3 mb-1">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getWarnaAncaman(log.jenisSerangan)}`}>
                                                        {log.jenisSerangan}
                                                    </span>
                                                    <span className="text-slate-400 text-xs font-mono">
                                                        {new Date(log.waktu).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-300 font-mono mt-1 break-all">
                                                    Target: <span className="text-indigo-300">{log.targetURL}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-950/50 px-3 py-1.5 rounded-md border border-slate-800 md:text-right w-fit md:w-auto">
                                            <p className="text-xs text-slate-500 mb-0.5 uppercase tracking-wider">Sumber IP</p>
                                            <p className="text-sm font-mono text-cyan-400">{log.alamatIP}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;