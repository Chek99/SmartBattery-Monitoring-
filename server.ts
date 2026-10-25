import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// In-memory store for real ESP32 telemetry
interface TelemetryRecord {
  timestamp: number;
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  soc: number;
  soh: number;
  internalResistance: number;
  source: 'hardware' | 'simulated';
}

let latestTelemetry: TelemetryRecord = {
  timestamp: Date.now(),
  voltage: 3.41,
  current: 54,
  power: 184,
  temperature: 26.8,
  soc: 24.5,
  soh: 92.4,
  internalResistance: 38.6,
  source: 'simulated'
};

const telemetryHistory: TelemetryRecord[] = [];

// Seed initial history
for (let i = 20; i >= 0; i--) {
  telemetryHistory.push({
    timestamp: Date.now() - i * 3000,
    voltage: Math.round((3.41 + (Math.random() - 0.5) * 0.02) * 100) / 100,
    current: Math.round(54 + (Math.random() - 0.5) * 6),
    power: Math.round(184 + (Math.random() - 0.5) * 10),
    temperature: Math.round((26.8 + (Math.random() - 0.5) * 0.4) * 10) / 10,
    soc: 24.5,
    soh: 92.4,
    internalResistance: 38.6,
    source: 'simulated'
  });
}

// 1. Ingest telemetry from physical ESP32 or curl
app.post('/api/telemetry', (req, res) => {
  const { voltage, current, power, temperature } = req.body;

  if (typeof voltage !== 'number') {
    return res.status(400).json({ error: 'Missing numeric voltage field' });
  }

  const v = Math.round(voltage * 100) / 100;
  const i = typeof current === 'number' ? Math.round(current) : 0;
  const p = typeof power === 'number' ? Math.round(power) : Math.round(v * Math.abs(i));
  const t = typeof temperature === 'number' ? Math.round(temperature * 10) / 10 : 25.0;

  // Simple Li-ion SoC estimation
  let soc = 50;
  if (v <= 3.0) soc = 0;
  else if (v >= 4.2) soc = 100;
  else soc = Math.round(((v - 3.0) / 1.2) * 1000) / 10;

  latestTelemetry = {
    timestamp: Date.now(),
    voltage: v,
    current: i,
    power: p,
    temperature: t,
    soc,
    soh: 92.4,
    internalResistance: 38.6,
    source: 'hardware'
  };

  telemetryHistory.push(latestTelemetry);
  if (telemetryHistory.length > 200) {
    telemetryHistory.shift();
  }

  console.log(`[ESP32 Ingestion] V=${v}V, I=${i}mA, P=${p}mW, T=${t}°C`);
  return res.json({ status: 'ok', received: latestTelemetry });
});

// 2. Fetch current telemetry & history
app.get('/api/telemetry', (_req, res) => {
  res.json({
    latest: latestTelemetry,
    history: telemetryHistory.slice(-50),
    lastHardwarePing: latestTelemetry.source === 'hardware' ? latestTelemetry.timestamp : null
  });
});

// 3. Reset to baseline
app.post('/api/telemetry/reset', (_req, res) => {
  latestTelemetry = {
    timestamp: Date.now(),
    voltage: 3.41,
    current: 54,
    power: 184,
    temperature: 26.8,
    soc: 24.5,
    soh: 92.4,
    internalResistance: 38.6,
    source: 'simulated'
  };
  res.json({ status: 'reset', latest: latestTelemetry });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const PORT = 3000;

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IoT Battery Dashboard running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
