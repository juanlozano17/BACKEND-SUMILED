import { Router } from 'express';
import { getAuditoriaLogs } from '../controllers/auditoria.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/auditoria', verificarToken, getAuditoriaLogs);

export default router;