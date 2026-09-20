import { Router } from 'express';
import { 
    getUsuarios, 
    getUsuarioById, 
    createUsuario, 
    updateUsuario, 
    deleteUsuario,
    loginUsuario,
    updatePerfil 
} from '../controllers/usuarios.controller.js';

import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas con el segmento /usuarios para que coincidan con app.use('/api', usuariosRoutes)
router.get('/usuarios', verificarToken, getUsuarios);
router.get('/usuarios/:id', verificarToken, getUsuarioById);
router.post('/usuarios', createUsuario);
router.post('/usuarios/login', loginUsuario); 
router.put('/usuarios/perfil', verificarToken, updatePerfil);
router.put('/usuarios/:id', verificarToken, updateUsuario);
router.delete('/usuarios/:id', verificarToken, deleteUsuario);

export default router;