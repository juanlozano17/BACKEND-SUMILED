import { Router } from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../supabase.js';
// import { verificarToken } from '../middlewares/auth.middleware.js'; // Ajusta la ruta si aplica

const router = Router();

// Agregamos el middleware de autenticación antes de la función
router.put('/actualizar-password', /* verificarToken, */ async (req, res) => {
  // Si usas un middleware de autenticación, el ID suele venir en req.usuario.id
  // Si aún prefieres enviarlo por body (mientras implementas el token), asegúrate de protegerlo luego.
  const { idUsuario, passwordActual, passwordNueva } = req.body; 
  // O idealmente: const idUsuario = req.usuario.id;

  try {
    // 1. Buscar el usuario en la tabla 'usuarios' usando Supabase
    const { data: usuarios, error: errorFind } = await supabase
      .from('usuarios')
      .select('*')
      .eq('idusuario', idUsuario);

    if (errorFind || !usuarios || usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = usuarios[0];

    // 2. Comparar la contraseña actual con la encriptada en la base de datos
    const esValida = await bcrypt.compare(passwordActual, usuario.contrasena);
    if (!esValida) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    }

    // 3. Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordNueva, salt);

    // 4. Actualizar la nueva contraseña en la tabla 'usuarios'
    const { error: errorUpdate } = await supabase
      .from('usuarios')
      .update({ contrasena: passwordHash })
      .eq('idusuario', idUsuario);

    if (errorUpdate) {
      throw errorUpdate;
    }

    res.json({ mensaje: '¡Contraseña actualizada con éxito!' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error en el servidor al cambiar la contraseña' });
  }
});

export default router;