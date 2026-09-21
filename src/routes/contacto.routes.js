import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/contacto', async (req, res) => {
  const { nombres, correo, telefono, asunto } = req.body;

  try {
    // Configuración del emisor (puedes usar tu correo personal de Gmail con contraseña de aplicación)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'juanrlozano17@gmail.com',        
        pass: 'ubksxrvfdllwdgcg'}
    });

    const mailOptions = {
      from: correo,
      to: 'contactosumiled@protonmail.com',  
      subject: `Nuevo mensaje de contacto de: ${nombres}`,
      html: `
        <h3>Has recibido un nuevo mensaje desde la web de Sumiled</h3>
        <p><strong>Nombres:</strong> ${nombres}</p>
        <p><strong>Correo electrónico:</strong> ${correo}</p>
        <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
        <p><strong>Mensaje / Asunto:</strong></p>
        <p>${asunto}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Correo enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ success: false, message: 'Error al enviar el correo desde el servidor' });
  }
});

export default router;