
const express = require('express');
const cors = require('cors');

const mahasiswaRoutes = require('./routes/mahasiswa');
const predictionsRoutes = require('./routes/predictions');
const verifyToken = require('./middleware/auth');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Halaman utama API (publik)
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'SBDT Backend API is running',
        architecture: 'MySQL Primary-Replica'
    });
});

// Routes mahasiswa (dilindungi JWT)
app.use('/api/mahasiswa', verifyToken, mahasiswaRoutes);

// Routes ML Inference (dilindungi JWT)
app.use('/api/predictions', verifyToken, predictionsRoutes);

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log('SBDT Backend API siap digunakan!');
});
