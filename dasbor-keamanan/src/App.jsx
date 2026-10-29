import React, { useState, useEffect } from 'react';

function App() {
    const [logs, setLogs] = useState([]);

    const fetchLogs = () => {
        fetch('http://localhost:3000/api/logs')
            .then(response => response.json())
            .then(data => setLogs(data))
            .catch(error => console.error("Gagal mengambil data log:", error));
    };

    useEffect(() => {
        // Ambil data saat pertama kali dimuat
        fetchLogs();
        
        // Atur pembaruan data otomatis setiap 5 detik
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-6 text-red-500">Dasbor Keamanan Web Application Firewall</h1>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 flex justify-between items-center">
                    <span>Riwayat Serangan Terkini</span>
                    <span className="text-sm font-normal text-gray-400">Pembaruan otomatis aktif (5 detik)</span>
                </h2>
                
                {logs.length === 0 ? (
                    <p className="text-gray-400">Belum ada aktivitas mencurigakan yang terdeteksi.</p>
                ) : (
                    <ul className="space-y-3">
                        {logs.map((log, index) => (
                            <li key={index} className="bg-gray-700 p-3 rounded font-mono text-sm border-l-4 border-red-500 flex flex-col md:flex-row md:gap-4">
                                <span className="text-gray-400 whitespace-nowrap">
                                    [{new Date(log.waktu).toLocaleString('id-ID')}]
                                </span> 
                                <div>
                                    <span className="text-yellow-400 font-bold">{log.jenisSerangan}</span> 
                                    <span className="ml-2">dari IP: <span className="text-green-400">{log.alamatIP}</span></span> 
                                    <span className="ml-2 text-blue-300 block md:inline mt-1 md:mt-0">Target: {log.targetURL}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default App;