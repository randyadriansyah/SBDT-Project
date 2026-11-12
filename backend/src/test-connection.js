
const { primary, replica } = require('./config/database');

async function testConnection() {
    try {
        const [primaryResult] = await primary.query(
            'SELECT NOW() AS waktu'
        );

        console.log('PRIMARY CONNECTED:', primaryResult);

        const [replicaResult] = await replica.query(
            'SELECT NOW() AS waktu'
        );

        console.log('REPLICA CONNECTED:', replicaResult);

        console.log('Kedua database berhasil terhubung!');

    } catch (error) {
        console.error('DATABASE CONNECTION ERROR:', error.message);
    } finally {
        await primary.end();
        await replica.end();
    }
}

testConnection();
