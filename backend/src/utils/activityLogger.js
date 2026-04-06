import prisma from '../db.js';

/**
 * Log a user action to the ActivityLog table.
 * Call from any controller after successful operations.
 * 
 * @param {number} userId - ID of the authenticated user
 * @param {string} action - Action code e.g. CREATE_REPORT, DELETE_DIRECTOR
 * @param {string} entity - Entity type: report | director | transaction | user | export
 * @param {string|null} entityId - ID of the affected entity (null for global actions)
 * @param {string} description - Human-readable description
 */
export async function logActivity(userId, action, entity, entityId, description) {
    try {
        await prisma.activityLog.create({
            data: {
                userId,
                action,
                entity,
                entityId: entityId !== null && entityId !== undefined ? String(entityId) : null,
                description,
            }
        });
    } catch (err) {
        // Logging errors must never crash the main flow
        console.error('[ActivityLog Error]', err.message);
    }
}

// ─── Action constants ──────────────────────────────────────────────────────────
export const LOG_ACTIONS = {
    // Directors
    CREATE_DIRECTOR: 'CREATE_DIRECTOR',
    UPDATE_DIRECTOR: 'UPDATE_DIRECTOR',
    DELETE_DIRECTOR: 'DELETE_DIRECTOR',
    // Reports
    CREATE_REPORT: 'CREATE_REPORT',
    UPDATE_REPORT: 'UPDATE_REPORT',
    DELETE_REPORT: 'DELETE_REPORT',
    // Transactions
    CREATE_TRANSACTION: 'CREATE_TRANSACTION',
    UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
    DELETE_TRANSACTION: 'DELETE_TRANSACTION',
    // Exports
    EXPORT_PDF: 'EXPORT_PDF',
    EXPORT_EXCEL: 'EXPORT_EXCEL',
    // Auth
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    // Users
    CREATE_USER: 'CREATE_USER',
    UPDATE_USER: 'UPDATE_USER',
    DELETE_USER: 'DELETE_USER',
    CHANGE_PASSWORD: 'CHANGE_PASSWORD',
};
