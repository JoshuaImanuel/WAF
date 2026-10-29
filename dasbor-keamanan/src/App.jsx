import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Server, Globe, Terminal, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

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
            case 'SQL Injection': return { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', icon: <AlertTriangle size={16} /> };
            case 'XSS': return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: <Terminal size={16} /> };
            case 'Path Traversal': return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: <Globe size={16} /> };
            case 'Honeypot Triggered': return { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', text: 'text-fuchsia-400', icon: <Server size={16} /> };
            default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', icon: <ShieldAlert size={16} /> };
        }
    };

    return (
        <div className="min-h-screen bg-[#050B14] text-slate-300 font-sans selection:bg-cyan-900/50 relative overflow-hidden">
            {/* Latar Belakang Ambient Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-900/10 blur-[120px] pointer-events-none"></div>

            <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 relative z-10 flex flex-col h-screen">
                
                {/* Header Navbar */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-cyan-500 blur-md opacity-40 rounded-full animate-pulse"></div>
                            <div className="p-2.5 bg-gradient-to-br from-cyan-900 to-slate-900 border border-cyan-800 rounded-xl relative">
                                <ShieldCheck className="w-7 h-7 text-cyan-400" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">WAF Command Center</h1>
                            <p className="text-xs text-cyan-500 font-mono mt-0.5 tracking-wider uppercase">Node.js • React • MongoDB</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-[#0A1120] px-4 py-2 rounded-lg border border-slate-800/80">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-sm font-medium text-emerald-400">Sistem Aktif & Terlindungi</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                    
                    {/* Kolom Kiri: Panel Statistik & Status Server */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        
                        {/* Status Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/40 border border-slate-800/60 backdrop-blur-md rounded-2xl p-5 hover:bg-slate-800/40 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20"><Activity className="w-5 h-5 text-rose-400" /></div>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1">{stats.total}</h3>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Diblokir</p>
                            </div>
                            
                            <div className="bg-slate-900/40 border border-slate-800/60 backdrop-blur-md rounded-2xl p-5 hover:bg-slate-800/40 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20"><AlertTriangle className="w-5 h-5 text-amber-400" /></div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1 truncate">{stats.dominan}</h3>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Ancaman Utama</p>
                            </div>
                        </div>

                        {/* Simulasi Grafik Server */}
                        <div className="bg-slate-900/40 border border-slate-800/60 backdrop-blur-md rounded-2xl p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-6">
                                <Cpu className="w-5 h-5 text-indigo-400" />
                                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Kesehatan Server</h2>
                            </div>
                            
                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
                                        <span>Beban CPU</span>
                                        <span className="text-emerald-400">12%</span>
                                    </div>
                                    <div className="w-full bg-[#0A1120] rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-emerald-500 h-1.5 rounded-full w-[12%]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
                                        <span>Penggunaan RAM</span>
                                        <span className="text-cyan-400">2.4 GB / 20 GB</span>
                                    </div>
                                    <div className="w-full bg-[#0A1120] rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-cyan-500 h-1.5 rounded-full w-[12%]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Aktivitas Jaringan Dummy */}
                            <div className="mt-auto pt-6">
                                <div className="flex items-end gap-1 h-12 w-full opacity-60">
                                    {[...Array(24)].map((_, i) => (
                                        <div key={i} className="flex-1 bg-indigo-500/30 rounded-t-sm animate-pulse" 
                                             style={{ 
                                                height: `${Math.random() * 100}%`, 
                                                animationDelay: `${Math.random() * 2}s` 
                                             }}>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-[10px] text-center text-slate-500 font-mono mt-2 uppercase tracking-widest">Pemantauan Lalu Lintas Langsung</div>
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan: Terminal Log Interaktif */}
                    <div className="lg:col-span-8 bg-[#0A1120]/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
                        {/* Garis Aksen Atas */}
                        <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent absolute top-0"></div>
                        
                        <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-5 h-5 text-slate-400" />
                                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Log Investigasi Keamanan</h2>
                            </div>
                            <span className="text-xs font-mono text-slate-500">Pembaruan: {stats.terakhir}</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                            {logs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                    <div className="p-4 bg-slate-900/50 rounded-full mb-4 border border-slate-800">
                                        <ShieldCheck className="w-10 h-10 text-emerald-500/40" />
                                    </div>
                                    <p className="font-mono text-sm">Menunggu aktivitas mencurigakan...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {logs.map((log, index) => {
                                        const style = getWarnaAncaman(log.jenisSerangan);
                                        return (
                                            <div key={index} className={`flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-xl border ${style.border} ${style.bg} hover:bg-slate-800/50 transition-all group`}>
                                                
                                                <div className="flex items-start gap-4">
                                                    <div className={`mt-0.5 p-1.5 rounded bg-[#050B14]/50 border ${style.border}`}>
                                                        {style.icon}
                                                    </div>
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                            <span className={`text-xs font-bold ${style.text} uppercase tracking-wider`}>
                                                                {log.jenisSerangan}
                                                            </span>
                                                            <span className="text-[11px] text-slate-500 font-mono">
                                                                {new Date(log.waktu).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm font-mono">
                                                            <span className="text-slate-400 text-xs">TARGET:</span>
                                                            <span className="text-slate-200 break-all">{log.targetURL}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 md:mt-0 flex flex-col md:items-end bg-[#050B14]/40 px-3 py-1.5 rounded-lg border border-slate-800/50 md:min-w-[140px]">
                                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Sumber Pelaku (IP)</span>
                                                    <span className="text-sm font-mono font-medium text-cyan-300">{log.alamatIP}</span>
                                                </div>

                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default App;