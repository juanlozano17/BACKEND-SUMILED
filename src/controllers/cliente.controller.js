import { supabase } from '../supabase.js';

// 1. Obtener todos los clientes (GET)
export const getClientes = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('cliente') // <-- Cambiado a 'cliente' (singular)
            .select('*');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Buscar cliente por ID (GET)
export const getClienteById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('cliente') // <-- Cambiado a 'cliente'
            .select('*')
            .eq('id', id)
            .single();

        if (error) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Registrar nuevo cliente (POST)
export const createCliente = async (req, res) => {
    try {
        const { nombre, cedula, telefono, correo } = req.body; 

        const { data, error } = await supabase
            .from('cliente') // <-- Cambiado a 'cliente'
            .insert([{ nombre, cedula, telefono, correo }])
            .select();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Actualizar cliente (PUT)
export const updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, cedula, telefono, correo } = req.body;

        const { data, error } = await supabase
            .from('cliente') // <-- Cambiado a 'cliente'
            .update({ nombre, cedula, telefono, correo })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Eliminar cliente (DELETE)
export const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('cliente') // <-- Cambiado a 'cliente'
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json({ message: 'Cliente eliminado correctamente', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};