const AuditLog = require('../models/AuditLog');

class AuditService {
  static async log({ actor, actorName, role, action, entityType, entityId, ipAddress = '', details = {} }) {
    try {
      return await AuditLog.create({
        actor,
        actorName,
        role,
        action,
        entityType,
        entityId: String(entityId),
        ipAddress,
        details,
      });
    } catch (error) {
      console.error('[AuditService Error]', error.message);
      return null;
    }
  }
}

module.exports = AuditService;
