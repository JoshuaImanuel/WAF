const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/waf_security')
    .then(() => console.log('Terhubung ke basis data MongoDB'))
    .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

const logSchema = new mongoose.Schema({
    waktu: { type: Date, default: Date.now },
    jenisSerangan: String,
    alamatIP: String,
    targetURL: String
});

const CatatanKeamanan = mongoose.model('CatatanKeamanan', logSchema);

const wafMiddleware = async (req, res, next) => {
    const sqlInjectionPattern = /(\b(SELECT|UPDATE|DELETE|INSERT|DROP|ALTER)\b)|('|"|;|--)/i;
    const xssPattern = /(<script\b[^>]*>[\s\S]*?<\/script>|<[^>]*on\w+\s*=)/i;
    const pathTraversalPattern = /(\.\.\/|\.\.\\)/i;
    
    const url = decodeURIComponent(req.url);

    if (sqlInjectionPattern.test(url) || xssPattern.test(url) || pathTraversalPattern.test(url)) {
        const threatType = sqlInjectionPattern.test(url) ? 'SQL Injection' : (xssPattern.test(url) ? 'XSS' : 'Path Traversal');
        
        const logBaru = new CatatanKeamanan({
            jenisSerangan: threatType,
            alamatIP: req.ip,
            targetURL: url
        });
        await logBaru.save();
        
        console.log(`[PERINGATAN] Serangan ${threatType} terdeteksi pada URL: ${url}`);
        return res.status(403).send("Akses Ditolak: Aktivitas mencurigakan terdeteksi.");
    }
    next();
};

app.use(wafMiddleware);

app.get('/wp-admin', async (req, res) => {
    const logBaru = new CatatanKeamanan({
        jenisSerangan: 'Honeypot Triggered',
        alamatIP: req.ip,
        targetURL: req.url
    });
    await logBaru.save();
    
    console.log(`[HONEYPOT] Aktivitas peretasan tertangkap dari IP: ${req.ip}`);
    res.status(401).send("Unauthorized Access: Insiden ini telah dicatat dan dilaporkan.");
});

app.get('/api/logs', async (req, res) => {
    try {
        const logs = await CatatanKeamanan.find().sort({ waktu: -1 }).limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ pesan: "Terjadi kesalahan saat mengambil data log" });
    }
});

app.get('/', (req, res) => {
    res.send("Server berjalan dengan aman.");
});

app.listen(3000, () => {
    console.log("Sistem beroperasi pada port 3000");
});