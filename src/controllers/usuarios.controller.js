import { supabase } from '../supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registrarAuditoria } from '../helpers/auditoria.helper.js';

// Configuración global estandarizada para la Cookie
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false,       // 'false' para desarrollo local (HTTP)
    sameSite: 'lax',     // Permite el envío entre puertos en localhost
    path: '/',           // 👈 Garantiza disponibilidad en TODO el sitio
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
};

// 1. OBTENER TODOS LOS USUARIOS (GET) - SIN FILTRO PARA VER ACTIVOS E INACTIVOS
export const getUsuarios = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*'); // 👈 Trae todos para que el Admin pueda gestionar su estado

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. BUSCAR UN USUARIO POR ID (GET)
export const getUsuarioById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('idusuario', id)
            .single();

        if (error || !data) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. REGISTRAR / CREAR NUEVO USUARIO (POST - Con Contraseña Encriptada)
export const createUsuario = async (req, res) => {
    const { id_rol, nombre, correo, contrasena } = req.body;
    try {
        // Encriptamos la clave antes de mandarla a Supabase
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

        const { data, error } = await supabase
            .from('usuarios')
            .insert([{ 
                id_rol: id_rol || null, 
                nombre, 
                correo, 
                contrasena: contrasenaEncriptada,
                estado: true // 👈 Se asegura de crearse como activo por defecto
            }])
            .select();

        if (error) throw error;

        const nuevoUsuario = data[0];

        // Registrar auditoría de creación
        await registrarAuditoria(req, `Creó el usuario ${correo} (ID: ${nuevoUsuario.idusuario})`);

        // Crear token automático al registrarse
        const token = jwt.sign(
            { id_usuario: nuevoUsuario.idusuario, rol: nuevoUsuario.id_rol, correo: nuevoUsuario.correo },
            process.env.JWT_SECRET || 'FirmaSecretaSena2026',
            { expiresIn: '24h' }
        );

        // Guardar la cookie con Path: /
        res.cookie('token_sesion', token, COOKIE_OPTIONS);

        res.status(201).json({ message: 'Usuario registrado con éxito', usuario: nuevoUsuario });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. ACTUALIZAR UN USUARIO (PUT) - CON LOGS DE DEPURACIÓN
export const updateUsuario = async (req, res) => {
    const { id } = req.params;
    
    console.log("----------------------------------------");
    console.log("ID recibido en la ruta:", id);
    console.log("DATOS RECIBIDOS EN EL REQ.BODY:", req.body);

    const { id_rol, nombre, correo, contrasena, estado } = req.body;
    
    try {
        const datosActualizados = { nombre, correo, id_rol, estado };
        
        console.log("DATOS QUE SE ENVIARÁN A SUPABASE:", datosActualizados);

        // Si el usuario decide cambiar la contraseña en la actualización, también se encripta
        if (contrasena) {
            const salt = await bcrypt.genSalt(10);
            datosActualizados.contrasena = await bcrypt.hash(contrasena, salt);
        }

        const { data, error } = await supabase
            .from('usuarios')
            .update(datosActualizados)
            .eq('idusuario', id)
            .select();

        if (error) {
            console.log("ERROR DEVUELTO POR SUPABASE:", error);
            throw error;
        }

        // Registrar auditoría de actualización
        const estadoTexto = estado !== undefined ? (estado ? 'Activo' : 'Inactivo') : '';
        await registrarAuditoria(req, `Actualizó al usuario ID ${id} (${correo}). ${estadoTexto ? 'Estado: ' + estadoTexto : ''}`);

        console.log("RESPUESTA EXITOSA DE SUPABASE:", data);
        res.status(200).json({ message: 'Usuario actualizado con éxito', usuario: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. DESACTIVAR UN USUARIO (BORRADO LÓGICO - Reemplaza al DELETE físico)
export const deleteUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        // En lugar de .delete(), hacemos un .update() cambiando estado a false
        const { data, error } = await supabase
            .from('usuarios')
            .update({ estado: false })
            .eq('idusuario', id)
            .select();

        if (error) throw error;

        const usuarioAfectado = data[0];
        // Registrar auditoría de desactivación
        await registrarAuditoria(req, `Desactivó al usuario ID ${id} (${usuarioAfectado?.correo || ''})`);

        res.status(200).json({ message: 'Usuario desactivado correctamente', usuario: usuarioAfectado });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. CONTROLADOR DE LOGIN: INICIO DE SESIÓN Y VALIDACIÓN DE ESTADO (POST)
export const loginUsuario = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        // Buscar al usuario en Supabase comparando el correo electrónico
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('correo', correo)
            .single();

        // Validar si el correo existe
        if (error || !usuario) {
            return res.status(404).json({ status: 'error', message: 'El correo no está registrado o el usuario no existe.' });
        }

        // Validar si el usuario está inactivo (borrado lógico)
        if (usuario.estado === false) {
            return res.status(403).json({ status: 'error', message: 'Este usuario ha sido desactivado del sistema.' });
        }

        // Comparar la contraseña en texto plano con el hash encriptado de la BD
        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
        
        if (!contrasenaValida) {
            return res.status(401).json({ status: 'error', message: 'Contraseña incorrecta. Inténtalo de nuevo.' });
        }

        // Crear el Token de seguridad firmado
        const token = jwt.sign(
            { id_usuario: usuario.idusuario, rol: usuario.id_rol, correo: usuario.correo },
            process.env.JWT_SECRET || 'FirmaSecretaSena2026',
            { expiresIn: '24h' }
        );

        // Almacenar el token en la Cookie HttpOnly garantizando el path: '/'
        res.cookie('token_sesion', token, COOKIE_OPTIONS);

        // Responder con status 'success' y los datos del usuario para el frontend
        return res.status(200).json({
            status: 'success',
            message: `¡Bienvenido al sistema, ${usuario.nombre}!`,
            usuario
        });

    } catch (error) {
        return res.status(500).json({ status: 'error', error: error.message });
    }
};

// 7. ACTUALIZAR MI PROPIO PERFIL (PUT - Usuario Logueado)
export const updatePerfil = async (req, res) => {
    const id_usuario = req.usuario?.id_usuario || req.usuario?.id;
    const { nombre, apellidos, correo, telefono } = req.body;

    try {
        const { data, error } = await supabase
            .from('usuarios')
            .update({ nombre, apellidos, correo, telefono })
            .eq('idusuario', id_usuario)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ status: 'error', message: error.message });
        }

        // Registrar auditoría de perfil propio
        await registrarAuditoria(req, `Actualizó su propio perfil (ID: ${id_usuario})`);

        res.status(200).json({
            status: 'success',
            message: 'Perfil actualizado correctamente',
            usuario: data
        });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
};