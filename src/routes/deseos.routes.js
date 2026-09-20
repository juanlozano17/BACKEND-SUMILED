import { Router } from 'express';
import { getDeseosUsuario, addDeseo, deleteDeseo } from '../controllers/deseos.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas de deseos protegidas con tu middleware de autenticación
router.get('/deseos', verificarToken, getDeseosUsuario);
router.post('/deseos', verificarToken, addDeseo);
router.delete('/deseos/:id', verificarToken, deleteDeseo);

export default router;