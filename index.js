require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const DISCORD_USER_ID = process.env.DISCORD_USER_ID;

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

// Helper Function: Real-Time Discord Webhook Alerting dengan User Mention
const sendDiscordAlert = async (threatType, ip, targetUrl) => {
    if (!DISCORD_WEBHOOK_URL) return;

    const mentionText = DISCORD_USER_ID
        ? `<@${DISCORD_USER_ID}> Security alert triggered!`
        : '🚨 Security alert triggered!';

    const payload = {
        content: mentionText,
        allowed_mentions: {
            users: DISCORD_USER_ID ? [DISCORD_USER_ID] : []
        },
        embeds: [
            {
                title: "🚨 WAF Security Alert",
                color: 15548997,
                fields: [
                    { name: "Threat Type", value: `\`${threatType}\``, inline: true },
                    { name: "Source IP", value: `\`${ip}\``, inline: true },
                    { name: "Target Path", value: `\`${targetUrl}\``, inline: false }
                ],
                footer: { text: "WAF Command Center • Action: Blocked" },
                timestamp: new Date().toISOString()
            }
        ]
    };

    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error('Discord Webhook error:', await response.text());
        }
    } catch (error) {
        console.error('Gagal mengirim alert ke Discord:', error.message);
    }
};

// Konfigurasi Rate Limiter
const wafRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/api/logs' || req.path === '/api/login',
    handler: async (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;
        const target = req.originalUrl;

        try {
            await CatatanKeamanan.create({
                jenisSerangan: 'Rate Limit Exceeded',
                targetURL: target,
                alamatIP: ip,
                waktu: new Date()
            });
            console.log(`[RATE LIMIT] IP ${ip} melebihi batas request pada ${target}`);
        } catch (err) {
            console.error('Gagal menyimpan log rate limit:', err);
        }

        res.status(429).json({
            status: 'blocked',
            message: 'Too many requests. Access temporarily restricted by WAF.'
        });
    }
});

app.use(wafRateLimiter);

// Middleware Deteksi Serangan WAF
const wafMiddleware = async (req, res, next) => {
    if (req.path === '/api/login' || req.path === '/api/logs') {
        return next();
    }

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
        
        sendDiscordAlert(threatType, req.ip, url);
        
        console.log(`[PERINGATAN] Serangan ${threatType} terdeteksi pada URL: ${url}`);
        return res.status(403).send("Akses Ditolak: Aktivitas mencurigakan terdeteksi.");
    }
    next();
};

app.use(wafMiddleware);

// Middleware Verifikasi Token JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Access token required.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden: Invalid or expired token.' });
        }
        req.user = decoded;
        next();
    });
};

// Endpoint Login Admin
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
        return res.json({ token, username });
    }

    return res.status(401).json({ message: 'Invalid credentials.' });
});

// Honeypot Trap
app.get('/wp-admin', async (req, res) => {
    const logBaru = new CatatanKeamanan({
        jenisSerangan: 'Honeypot Triggered',
        alamatIP: req.ip,
        targetURL: req.url
    });
    await logBaru.save();
    
    sendDiscordAlert('Honeypot Triggered', req.ip, req.url);
    
    console.log(`[HONEYPOT] Aktivitas peretasan tertangkap dari IP: ${req.ip}`);
    res.status(401).send("Unauthorized Access: Insiden ini telah dicatat dan dilaporkan.");
});

// Endpoint Logs yang Sudah Dilindungi JWT
app.get('/api/logs', verifyToken, async (req, res) => {
    try {
        const logs = await CatatanKeamanan.find().sort({ waktu: -1 }).limit(100);
        res.json(logs);
    } catch {
        res.status(500).json({ pesan: "Terjadi kesalahan saat mengambil data log" });
    }
});

app.get('/', (req, res) => {
    res.send("Server berjalan dengan aman.");
});

app.listen(3000, () => {
    console.log("Sistem beroperasi pada port 3000");
});