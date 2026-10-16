import { Router, Request, Response } from 'express';
import { store } from '../db';

const router = Router();

// GET /api/v1/notifications
router.get('/', (req: Request, res: Response) => {
  return res.json(store.notifications);
});

// PUT /api/v1/notifications/:id/read - Mark one as read
router.put('/:id/read', (req: Request, res: Response) => {
  const notif = store.notifications.find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });
  notif.isRead = true;
  return res.json(notif);
});

// PUT /api/v1/notifications/mark-all-read - Mark all as read
router.put('/mark-all-read', (req: Request, res: Response) => {
  store.notifications.forEach(n => { n.isRead = true; });
  return res.json({ message: 'All notifications marked as read' });
});

export default router;
