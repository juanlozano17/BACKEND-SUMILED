import { supabase } from '../supabase.js';

export const registrarAuditoria = async (req, accion) => {
    try {
        const id_usuario = req.usuario?.id_usuario || req.usuario?.id || null;
        
        // Obtener IP limpia (si es ::1 en local, la dejamos o la adaptamos)
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Desconocida';
        if (ip === '::1') ip = '127.0.0.1 (Local)';

        // Generar la fecha actual exacta en hora local de Colombia (Bogotá)
        const fechaLocal = new Date().toLocaleString('es-CO', { 
            timeZone: 'America/Bogota',
            hour12: false // Formato de 24 horas si lo prefieres, o true si prefieres AM/PM
        });

        const { error } = await supabase.from('auditoria').insert([
            { 
                id_usuario, 
                accion, 
                ip,
                // Si tu columna en Supabase es de tipo texto/varchar para la fecha:
                // fecha: fechaLocal 
            }
        ]);

        if (error) {
            console.error("❌ Error de Supabase al insertar auditoría:", error);
        }
    } catch (error) {
        console.error("❌ Error crítico en el helper de auditoría:", error);
    }
};