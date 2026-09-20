import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    // 1. Buscamos el token en la Cookie (App Web) O en Headers (Postman)
    let token = req.cookies?.token_sesion;

    // Si no viene en cookie, revisamos si viene en Authorization Header
    if (!token && req.headers['authorization']) {
        const authHeader = req.headers['authorization'];
        token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    }

    // 2. Si no hay token en ningún lado, denegamos el acceso
    if (!token) {
        return res.status(403).json({ 
            status: 'error', 
            message: 'Acceso denegado. No se proporcionará un token de seguridad.' 
        });
    }

    try {
        // 3. Verificamos el token con la clave secreta
        const verificado = jwt.verify(token, process.env.JWT_SECRET || 'FirmaSecretaSena2026');
        
        // 4. Inyectamos los datos del usuario decodificados en la petición
        req.usuario = verificado; 
        
        next(); // Permiso concedido
    } catch (error) {
        return res.status(401).json({ 
            status: 'error', 
            message: 'Token inválido o expirado.' 
        });
    }
};