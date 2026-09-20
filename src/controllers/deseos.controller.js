import { supabase } from '../supabase.js';

// 1. OBTENER DESEOS DEL USUARIO LOGUEADO
export const getDeseosUsuario = async (req, res) => {
    // Extraer id del usuario decodificado por el middleware JWT
    const id_usuario = req.usuario?.id_usuario || req.usuario?.id;

    if (!id_usuario) {
        return res.status(400).json({ error: 'No se identificó el usuario en la petición.' });
    }

    try {
        // Hacemos el JOIN con la tabla 'producto' (singular)
        const { data, error } = await supabase
            .from('deseos')
            .select('id_deseo, id_producto, producto(*)')
            .eq('id_usuario', id_usuario);

        if (error) throw error;
        res.status(200).json(data || []);
    } catch (error) {
        console.error("Error al obtener lista de deseos:", error);
        res.status(500).json({ error: error.message });
    }
};

// 2. AGREGAR PRODUCTO A DESEOS
export const addDeseo = async (req, res) => {
    const id_usuario = req.usuario?.id_usuario || req.usuario?.id;
    const { id_producto } = req.body;

    if (!id_usuario || !id_producto) {
        return res.status(400).json({ error: 'Falta el id del usuario o el id del producto.' });
    }

    try {
        // A. Verificar si el ítem ya está agregado para evitar errores de duplicado
        const { data: existente, error: errVerificar } = await supabase
            .from('deseos')
            .select('id_deseo')
            .eq('id_usuario', id_usuario)
            .eq('id_producto', id_producto)
            .maybeSingle();

        if (errVerificar) throw errVerificar;

        if (existente) {
            return res.status(200).json({ 
                message: 'El producto ya está en tus favoritos.', 
                deseo: existente 
            });
        }

        // B. Insertar en la tabla deseos
        const { data, error } = await supabase
            .from('deseos')
            .insert([{ id_usuario, id_producto }])
            .select();

        if (error) throw error;

        return res.status(201).json({ 
            message: 'Producto agregado a favoritos con éxito.', 
            deseo: data[0] 
        });

    } catch (error) {
        console.error("Error al insertar deseo en Supabase:", error);
        res.status(500).json({ error: error.message });
    }
};

// 3. ELIMINAR DE DESEOS
export const deleteDeseo = async (req, res) => {
    const { id } = req.params; // Corresponde al id_deseo

    try {
        const { error } = await supabase
            .from('deseos')
            .delete()
            .eq('id_deseo', id);

        if (error) throw error;
        res.status(200).json({ message: 'Eliminado de favoritos correctamente.' });
    } catch (error) {
        console.error("Error al eliminar de favoritos:", error);
        res.status(500).json({ error: error.message });
    }
};