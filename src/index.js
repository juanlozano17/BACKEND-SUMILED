import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Importaciones de rutas
import clientesRoutes from './routes/clientes.routes.js';
import productoRoutes from './routes/producto.routes.js';
import proveedoresRoutes from './routes/proveedores.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import ventaRoutes from './routes/venta.routes.js';
import detalleVentaRoutes from './routes/detalle_venta.routes.js';
import medioPagoRoutes from './routes/medio_pago.routes.js';
import transportadoraRoutes from './routes/transportadora.routes.js';
import registroEnvioRoutes from './routes/registro_envio.routes.js';
import detalleEnvioRoutes from './routes/detalle_envio.routes.js';
import deseosRoutes from './routes/deseos.routes.js';
import productoProveedorRoutes from './routes/producto_proveedor.routes.js';
import auditoriaRoutes from './routes/auditoria.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; 

// Configuración robusta de CORS y Cookie Parser
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'], 
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Enlaces de la API
app.use('/api', usuariosRoutes); 
app.use('/api', clientesRoutes);
app.use('/api', productoRoutes);
app.use('/api', proveedoresRoutes);
app.use('/api', categoriasRoutes);
app.use('/api', rolesRoutes);
app.use('/api', ventaRoutes); 
app.use('/api', medioPagoRoutes);
app.use('/api', transportadoraRoutes);
app.use('/api', registroEnvioRoutes);
app.use('/api', detalleEnvioRoutes);
app.use('/api', deseosRoutes);
app.use('/api', productoProveedorRoutes);
app.use('/api', auditoriaRoutes);

// Mensaje en consola
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` Servidor encendido en: http://localhost:${PORT}`);
    console.log(`==================================================`);
});