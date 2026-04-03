import { Router } from 'express';

export const createStubRouter = (module: string) => {
  const router = Router();
  router.get('/', (_req, res) => {
    res.status(501).json({ module, message: `${module} module scaffolded; implementation pending.` });
  });
  return router;
};
