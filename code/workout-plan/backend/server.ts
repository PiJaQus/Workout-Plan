import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// 🛡️ Włącz CORS dla wszystkich domen (do devu OK)
app.use(cors());

app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong 🏋️‍♂️' });
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});