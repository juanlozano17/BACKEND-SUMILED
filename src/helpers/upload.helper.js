import multer from 'multer';

// Configuración para almacenar temporalmente el archivo en memoria RAM
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por imagen
    fileFilter: (req, file, cb) => {
        // Validar que el archivo sea una imagen
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, etc.)'), false);
        }
    }
});

export default upload;