import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const alertsRouter = Router();

/** POST /api/alerts – create an alert */
alertsRouter.post('/', async (req, res) => {
  try {
    const body = req.body;
    const type = body?.type ?? 'info';
    const message = body?.message;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Missing or invalid message' });
      return;
    }
    if (!['critical', 'warning', 'info'].includes(type)) {
      res.status(400).json({ error: 'type must be critical, warning, or info' });
      return;
    }

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        type,
        message,
        device: body?.device ?? null,
        acknowledged: false,
        action_target: body?.action_target ?? null,
      })
      .select('id, type, message, device, acknowledged, created_at')
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
});

/** PATCH /api/alerts/:id/acknowledge */
alertsRouter.patch('/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('alerts').update({ acknowledged: true }).eq('id', id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ ok: true, id });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
});
