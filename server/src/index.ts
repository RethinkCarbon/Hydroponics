import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { sensorsRouter } from './routes/sensors.js';
import { controlRouter } from './routes/control.js';
import { alertsRouter } from './routes/alerts.js';
import { runCirculationTick } from './lib/runCirculationTick.js';
import { runShadeControl } from './lib/runShadeControl.js';
import { runVentControl } from './lib/runVentControl.js';
import { runIrrigationControl } from './lib/runIrrigationControl.js';
import { runFlushControl } from './lib/runFlushControl.js';
import { runRefillControl } from './lib/runRefillControl.js';
import { runUvControl } from './lib/runUvControl.js';
import { runPHControl } from './lib/runPHControl.js';
import { runSystemOverrides } from './lib/runSystemOverrides.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
  name: 'Hydroponics API',
  endpoints: {
    health: 'GET /api/health',
    sensors: 'POST /api/sensors/ingest',
    control: 'POST /api/control/flush | /irrigation/stop | /emergency/stop | /emergency/reset',
    alerts: 'POST /api/alerts, PATCH /api/alerts/:id/acknowledge',
  },
});
});

app.use('/api/health', healthRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/control', controlRouter);
app.use('/api/alerts', alertsRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  setInterval(() => {
    runCirculationTick().catch(() => {});
    runShadeControl().catch(() => {});
    runVentControl().catch(() => {});
    runIrrigationControl().catch(() => {});
    runFlushControl().catch(() => {});
    runRefillControl().catch(() => {});
    runUvControl().catch(() => {});
    runPHControl().catch(() => {});
    runSystemOverrides().catch(() => {});
  }, 30_000);
});
