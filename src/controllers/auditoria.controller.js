import { supabase } from '../supabase.js';

export const getAuditoriaLogs = async (req, res) => {
    try {
        // Traemos los logs de auditoría ordenados
        const { data: logs, error: errorLogs } = await supabase
            .from('auditoria')
            .select('*')
            .order('fecha_hora', { ascending: false });

        if (errorLogs) throw errorLogs;

        // Para evitar problemas de relaciones en Supabase, traemos los usuarios aparte o los mapeamos
        const { data: usuarios } = await supabase.from('usuarios').select('idusuario, correo');
        
        const usuariosMap = {};
        if (usuarios) {
            usuarios.forEach(u => {
                usuariosMap[u.idusuario] = u.correo;
            });
        }

        const logsFormateados = logs.map(log => ({
            id_auditoria: log.id_auditoria,
            accion: log.accion,
            ip: log.ip,
            fecha_hora: log.fecha_hora,
            admin_correo: usuariosMap[log.id_usuario] || 'Sistema / Desconocido'
        }));

        res.status(200).json(logsFormateados);
    } catch (error) {
        console.error("Error al obtener auditoría:", error);
        res.status(500).json({ mensaje: "Error al obtener los registros de auditoría" });
    }
};