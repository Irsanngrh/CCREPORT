import prisma from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/**
 * Generates a signed access token (short-lived) and refresh token (long-lived).
 * @param {object} user - The authenticated user object from the database.
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export function generateTokens(user) {
    const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { id: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
}

/**
 * Validates credentials and generates tokens.
 * This function can be replaced with an LDAP/Active Directory implementation
 * by swapping the bcrypt verification for an LDAP bind call.
 * 
 * @param {string} username
 * @param {string} password
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 * @throws {Error} if credentials are invalid
 */
export async function loginWithCredentials(username, password) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw new Error('INVALID_CREDENTIALS');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('INVALID_CREDENTIALS');

    const { accessToken, refreshToken } = generateTokens(user);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    return {
        user: { id: user.id, username: user.username, role: user.role },
        accessToken,
        refreshToken
    };
}

/**
 * Rotates a refresh token: verifies the old one, generates and stores a new pair.
 * @param {string} existingRefreshToken
 * @returns {{ accessToken: string, newRefreshToken: string, user: object }}
 * @throws {Error} if token is invalid or expired
 */
export async function rotateRefreshToken(existingRefreshToken) {
    const user = await prisma.user.findFirst({ where: { refreshToken: existingRefreshToken } });
    if (!user) throw new Error('TOKEN_INVALID');

    try {
        jwt.verify(existingRefreshToken, JWT_REFRESH_SECRET);
    } catch {
        // Expired token — force the stored token to null (logout this session)
        await prisma.user.update({ where: { id: user.id }, data: { refreshToken: null } });
        throw new Error('TOKEN_EXPIRED');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

    return { accessToken, newRefreshToken, user: { id: user.id, username: user.username, role: user.role } };
}

/**
 * Revokes a refresh token by clearing it from the database.
 * This prevents the token from being reused even if it hasn't expired.
 * @param {string} refreshToken
 * @returns {number|null} userId of the logged-out user, or null if not found
 */
export async function revokeRefreshToken(refreshToken) {
    const user = await prisma.user.findFirst({ where: { refreshToken } });
    if (!user) return null;
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: null } });
    return user.id;
}
