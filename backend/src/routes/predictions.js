
const express = require('express');
const router = express.Router();

const { primary, replica } = require('../config/database');
const { predict } = require('../models/gaussian-naive-bayes');

// POST: Menjalankan inference dan menyimpan hasil ke PRIMARY
router.post('/', async (req, res) => {
    try {
        const {
            sepalLength,
            sepalWidth,
            petalLength,
            petalWidth
        } = req.body;

        const features = [
            sepalLength,
            sepalWidth,
            petalLength,
            petalWidth
        ];

        if (!features.every(
            value => typeof value === 'number' && Number.isFinite(value)
        )) {
            return res.status(400).json({
                success: false,
                message: 'Keempat fitur harus berupa angka numerik yang valid'
            });
        }

        // Menjalankan model ML
        const result = predict(features);

        // Menyimpan hasil inference ke MySQL Primary
        const [insertResult] = await primary.execute(
            `INSERT INTO predictions
            (sepal_length, sepal_width, petal_length, petal_width,
             predicted_class, probabilities, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                sepalLength,
                sepalWidth,
                petalLength,
                petalWidth,
                result.predictedClass,
                JSON.stringify(result.probabilities),
                req.user?.sub || null
            ]
        );

        res.status(201).json({
            success: true,
            database: 'MySQL Primary',
            message: 'Inference berhasil dan hasil prediksi tersimpan',
            predictionId: insertResult.insertId,
            input: {
                sepalLength,
                sepalWidth,
                petalLength,
                petalWidth
            },
            result
        });

    } catch (error) {
        console.error('Inference error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menjalankan inference'
        });
    }
});

// GET: Membaca riwayat inference dari REPLICA
router.get('/', async (req, res) => {
    try {
        const [rows] = await replica.execute(
            'SELECT * FROM predictions ORDER BY id DESC'
        );

        res.json({
            success: true,
            database: 'MySQL Replica',
            data: rows
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
