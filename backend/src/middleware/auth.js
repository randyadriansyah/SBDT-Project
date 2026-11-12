
const verifyToken = async (req, res, next) => {
    try {
        const { createRemoteJWKSet, jwtVerify } = await import('jose');

        const JWKS = createRemoteJWKSet(
            new URL('http://keycloak:8080/realms/sbdt-realm/protocol/openid-connect/certs')
        );

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak ditemukan'
            });
        }

        const token = authHeader.split(' ')[1];

        const { payload } = await jwtVerify(token, JWKS, {
            issuer: 'http://auth.lokal:61403/realms/sbdt-realm'
        });

        req.user = payload;
        next();

    } catch (error) {
        console.error('JWT verification error:', error.message);

        return res.status(401).json({
            success: false,
            message: 'Token tidak valid'
        });
    }
};

module.exports = verifyToken;
