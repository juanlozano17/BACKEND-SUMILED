import { Router } from 'express';
import { 
    getUsuarios, 
    getUsuarioById, 
    createUsuario, 
    updateUsuario, 
    deleteUsuario,
    loginUsuario,
    updatePerfil,
    recuperarPassword,     
    actualizarPassword
} from '../controllers/usuarios.controller.js';

import { verificarToken } from '../middlewares/auth.middleware.js';
import upload from '../helpers/upload.helper.js'; // helper de multer para manejar las fotos

const router = Router();

// Rutas generales y específicas
router.get('/usuarios', verificarToken, getUsuarios);

// 1. RUTA DE PERFIL PROPIO (Debe ir obligatoriamente ANTES de /usuarios/:id)
router.put('/usuarios/perfil', verificarToken, upload.single('foto'), updatePerfil);

// Rutas con parámetros por ID
router.get('/usuarios/:id', verificarToken, getUsuarioById);

// upload.single('avatar') aquí para que acepte la foto en el registro
router.post('/usuarios', upload.single('foto'), createUsuario);

router.post('/usuarios/login', loginUsuario); 

// upload.single('avatar') aquí para que el admin pueda actualizar la foto de cualquier usuario
router.put('/usuarios/:id', verificarToken, upload.single('foto'), updateUsuario);

router.delete('/usuarios/:id', verificarToken, deleteUsuario);

router.post('/usuarios/recuperar-password', recuperarPassword);

router.post('/usuarios/actualizar-password', actualizarPassword);

export default router;