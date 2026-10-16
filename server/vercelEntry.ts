process.env.VERCEL = '1';
import app from './index';

export default function handler(req: any, res: any) {
  return app(req, res);
}
