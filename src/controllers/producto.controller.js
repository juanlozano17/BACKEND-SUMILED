import { supabase } from '../supabase.js';

// 1. Obtener todos los productos (GET)
export const getProductos = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('producto')
            .select('*');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Buscar producto por ID (GET)
export const getProductoById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('producto')
            .select('*')
            .eq('idproducto', id)
            .single();

        if (error) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Crear un nuevo producto (POST)
export const createProducto = async (req, res) => {
    try {
        // Eliminado 'estado' para evitar errores con Supabase
        const { idcategoria, nombre_producto, precio, descripcion, caracteristicas, imagenes, stock } = req.body;

        const { data, error } = await supabase
            .from('producto')
            .insert([{ idcategoria, nombre_producto, precio, descripcion, caracteristicas, imagenes, stock }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]); // Devolvemos el objeto creado directamente
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Actualizar un producto (PUT)
export const updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        // Eliminado 'estado'
        const { idcategoria, nombre_producto, precio, descripcion, caracteristicas, imagenes, stock } = req.body;

        const { data, error } = await supabase
            .from('producto')
            .update({ idcategoria, nombre_producto, precio, descripcion, caracteristicas, imagenes, stock })
            .eq('idproducto', id)
            .select();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Eliminar un producto (DELETE)
export const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('producto')
            .delete()
            .eq('idproducto', id)
            .select();

        if (error) throw error;
        res.json({ message: 'Producto eliminado correctamente', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};