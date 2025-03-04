const express = require('express');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');
const fs = require('fs');
const app = express();
const port = 3000;
const server = http.createServer(app);

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Opprett WebSocket-server
const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
    console.log('WebSocket connection established');
});

// Send live-reload-melding til alle klienter
const broadcastReload = () => {
    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket er åpen
            client.send('reload');
        }
    });
};

// Overvåk filendringer i `public`-mappen
fs.watch(path.join(__dirname, 'public'), { recursive: true }, (eventType, filename) => {
    console.log(`File changed: ${filename}`);
    broadcastReload();
});

app.post('/vbucks', (req, res) => {
    const newData = req.body;
    // Les eksisterende data fra JSON-filen
    fs.readFile('data.json', 'utf8', (err, fileData) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal server error");
        }
        // Start med tom array hvis filen ikke finnes
        const jsonData = fileData ? JSON.parse(fileData) : [];
        // Legg til ny data
        jsonData.push(newData);
        // Skriv den oppdaterte dataen tilbake til filen
        fs.writeFile('data.json', JSON.stringify(jsonData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                return res.status(500).send("Internal server error");
            }
            res.redirect("https://skibidirizz.no/public/view/index.html");
        });
    });
});

// Setter public som root-mappe
app.use(express.static(path.join(__dirname, 'public')));

// Routing til ulike filer, legg inn egne ved å kopiere en av app.get-funkjonene
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/vbucks', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view', 'vbucks.html'));
});
app.get('/ninja', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view', 'ninja.html'));
});

// Eksempel routing når noen skriver /hei inn i url-linjen får de Yo tilbake
// **Kan/bør byttes ut med annen kode**
app.get('/Hei', (req, res) => {
    res.send('Yo');
});
app.get('/lektordahle', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'egil', 'egil.html'));
});
app.get('/min-blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'egil', 'min-blog.html'));
});

// Start HTTP- og WebSocket-server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});