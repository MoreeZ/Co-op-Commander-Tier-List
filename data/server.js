import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// Route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to save JSON data
app.post('/save', (req, res) => {
    try {
        const data = req.body;
        fs.writeFileSync(
            path.join(__dirname, 'raw_prestiges.json'),
            JSON.stringify(data, null, 2),
            'utf8'
        );
        res.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`JSON Editor available at http://localhost:${PORT}`);
});
