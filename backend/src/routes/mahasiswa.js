
const express = require('express');
const router = express.Router();

const { primary, replica } = require('../config/database');

// GET: Menampilkan semua mahasiswa (REPLICA)
router.get('/', async (req, res) => {
    try {
        const [rows] = await replica.query(
            'SELECT * FROM mahasiswa'
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

// GET: Menampilkan mahasiswa berdasarkan ID (REPLICA)
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await replica.execute(
            'SELECT * FROM mahasiswa WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mahasiswa tidak ditemukan'
            });
        }

        res.json({
            success: true,
            database: 'MySQL Replica',
            data: rows[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST: Menambahkan mahasiswa (PRIMARY)
router.post('/', async (req, res) => {
    try {
        const { nama, jurusan } = req.body;

        if (!nama || !jurusan) {
            return res.status(400).json({
                success: false,
                message: 'Nama dan jurusan wajib diisi'
            });
        }

        const [result] = await primary.execute(
            'INSERT INTO mahasiswa (nama, jurusan) VALUES (?, ?)',
            [nama, jurusan]
        );

        res.status(201).json({
            success: true,
            database: 'MySQL Primary',
            message: 'Mahasiswa berhasil ditambahkan',
            id: result.insertId
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// PUT: Mengubah data mahasiswa (PRIMARY)
router.put('/:id', async (req, res) => {
    try {
        const { nama, jurusan } = req.body;

        const [result] = await primary.execute(
            'UPDATE mahasiswa SET nama = ?, jurusan = ? WHERE id = ?',
            [nama, jurusan, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mahasiswa tidak ditemukan'
            });
        }

        res.json({
            success: true,
            database: 'MySQL Primary',
            message: 'Data mahasiswa berhasil diperbarui'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE: Menghapus mahasiswa (PRIMARY)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await primary.execute(
            'DELETE FROM mahasiswa WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mahasiswa tidak ditemukan'
            });
        }

        res.json({
            success: true,
            database: 'MySQL Primary',
            message: 'Mahasiswa berhasil dihapus'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
