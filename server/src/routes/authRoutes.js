import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { login, getUserById } from '../services/authService.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

export default router;
