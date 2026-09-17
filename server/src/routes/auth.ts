import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const authRouter = Router();

/**
 * POST /api/auth/signup
 * Creates a confirmed user via service role (avoids public /auth/v1/signup rate limits).
 * Body: { email, password, displayName?, role?: 'admin' | 'operator' }
 */
authRouter.post('/signup', async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const displayName =
      typeof req.body?.displayName === 'string' && req.body.displayName.trim()
        ? req.body.displayName.trim()
        : email;
    // Public signup never creates admins — use `npm run seed:admin` for that
    if (req.body?.role === 'admin') {
      res.status(403).json({ error: 'Admin accounts cannot be created via signup.' });
      return;
    }
    const role = 'operator' as const;

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'password must be at least 6 characters' });
      return;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: displayName, role },
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (data.user) {
      await supabase
        .from('profiles')
        .update({ role, display_name: displayName })
        .eq('id', data.user.id);
    }

    res.status(201).json({
      id: data.user?.id,
      email: data.user?.email,
      role,
      message: 'Account created. You can sign in now.',
    });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
});
