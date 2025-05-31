import { jwtVerify } from 'jose';

const JWT_SECRET_KEY = process.env.JWT_SECRET;
let JWT_SECRET;

if (!JWT_SECRET_KEY) {
    console.error("FATAL ERROR: JWT_SECRET environment variable is not set. This is required for token verification.");
    // In a production environment, you might want to throw an error here to prevent the app from starting
    // or ensure this check is done at build time / server startup.
} else {
    JWT_SECRET = new TextEncoder().encode(JWT_SECRET_KEY);
}

export async function verifyToken(tokenValue) {
    if (!JWT_SECRET) {
        console.error("JWT_SECRET is not configured. Token verification cannot proceed.");
        return null;
    }
    if (!tokenValue) return null;
    try {
        const { payload } = await jwtVerify(tokenValue, JWT_SECRET);
        return payload; // Contains { userId, role, email, name, iat, exp }
    } catch (error) {
        console.warn('JWT Verification Error:', error.message);
        return null;
    }
}
