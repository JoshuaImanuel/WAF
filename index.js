const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());

const wafMiddleware = (req, res, next) => {
    const sqlInjectionPattern = /(\b(SELECT|UPDATE|DELETE|INSERT|DROP|ALTER)\b)|('|"|;|--)/i;
    const xssPattern = /(<script\b[^>]*>[\s\S]*?<\/script>|<[^>]*on\w+\s*=)/i;
    const pathTraversalPattern = /(\.\.\/|\.\.\\)/i;
    
    const url = decodeURIComponent(req.url);

    if (sqlInjectionPattern.test(url) || xssPattern.test(url) || pathTraversalPattern.test(url)) {
        const threatType = sqlInjectionPattern.test(url) ? 'SQL Injection' : (xssPattern.test(url) ? 'XSS' : 'Path Traversal');
        const logData = `[${new Date().toISOString()}] Serangan ${threatType} dari IP: ${req.ip} ke URL: ${url}\n`;
        fs.appendFileSync('security.log', logData);
        
        console.log(`[PERINGATAN] Serangan ${threatType} terdeteksi pada URL: ${url}`);
        return res.status(403).send("Akses Ditolak: Aktivitas mencurigakan terdeteksi.");
    }
    next();
};

app.use(wafMiddleware);

app.get('/wp-admin', (req, res) => {
    const logData = `[${new Date().toISOString()}] HONEYPOT TERPICU oleh IP: ${req.ip} pada URL: ${req.url}\n`;
    fs.appendFileSync('security.log', logData);
    
    console.log(`[HONEYPOT] Aktivitas peretasan tertangkap dari IP: ${req.ip}`);
    res.status(401).send("Unauthorized Access: Insiden ini telah dicatat dan dilaporkan.");
});

app.get('/api/logs', (req, res) => {
    if (!fs.existsSync('security.log')) {
        return res.json([]);
    }
    const logContent = fs.readFileSync('security.log', 'utf8');
    const logsArray = logContent.split('\n').filter(line => line.trim() !== '');
    res.json(logsArray);
});

app.get('/', (req, res) => {
    res.send("Server berjalan dengan aman.");
});

app.listen(3000, () => {
    console.log("Sistem beroperasi pada port 3000");
});