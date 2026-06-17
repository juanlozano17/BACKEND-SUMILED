import { supabase } from '../supabase.js';

// OBTENER TODAS AS ASOCIACIONES DE PRODUCTOS Y PROVEEDORES
export const getProductosProveedores = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('producto_proveedor')
            .select('*, producto(*), proveedores(*)'); // Trae la info completa del producto y del proveedor

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ASOCIAR UN PRODUCTO A UN PROVEEDOR (POST)
export const createProductoProveedor = async (req, res) => {
    const { idproducto, idproveedor, precio_compra_actual } = req.body;
    try {
        const { data, error } = await supabase
            .from('producto_proveedor')
            .insert([{ idproducto, idproveedor, precio_compra_actual }])
            .select();

        if (error) throw error;
        res.status(201).json({ message: 'Asociación Producto-Proveedor registrada con éxito', data: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ELIMINAR LA RELACIÓN (Por si cambias de proveedor para ese producto)
export const deleteProductoProveedor = async (req, res) => {
    const { idproducto, idproveedor } = req.params;
    try {
        const { error } = await supabase
            .from('producto_proveedor')
            .delete()
            .eq('idproducto', idproducto)
            .eq('idproveedor', idproveedor);

        if (error) throw error;
        res.status(200).json({ message: 'Relación Producto-Proveedor eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
