import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { auditLogs, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { AuthRequest } from './auth';

// Extend Request type to include audit context
declare global {
  namespace Express {
    interface Request {
      auditContext?: {
        entityId: string;
        entityType: string;
        action: string;
        adminId?: number;
      };
    }
  }
}

// Helper function to extract admin ID from authenticated request
function extractAdminFromRequest(req: AuthRequest): number | null {
  // req.user is populated by the authMiddleware that runs before this
  if (req.user && req.user.role === 'admin') {
    return req.user.id;
  }
  return null;
}

// Helper function to format entity for audit
function formatEntityForAudit(entity: any): string {
  try {
    // Remove sensitive fields like passwords
    const sanitized = { ...entity };
    delete sanitized.password;
    return JSON.stringify(sanitized);
  } catch (error) {
    return String(entity);
  }
}

// Main audit middleware function
export function createAuditMiddleware(action: 'CREATE' | 'UPDATE' | 'DELETE' | 'REVIEW', entityType: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Extract admin info early and store it in the request context
    const adminId = extractAdminFromRequest(req);
    
    // Store audit context including admin info
    req.auditContext = {
      entityId: req.params.id || 'unknown',
      entityType,
      action,
      adminId: adminId || undefined
    };

    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(body: any) {
      // Call the audit logging asynchronously without blocking the response
      logAuditEntry(req, res, body, action, entityType).catch(error => {
        console.error('[AUDIT] Error in async audit logging:', error);
      });
      
      // Call original res.json
      return originalJson.call(this, body);
    };

    next();
  };
}

// Function to log audit entry
async function logAuditEntry(
  req: AuthRequest, 
  res: Response, 
  responseBody: any, 
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'REVIEW',
  entityType: string
) {
  try {
    // Only log successful operations (2xx status codes)
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return;
    }

    // Get admin ID from the context set during middleware initialization
    const adminId = req.auditContext?.adminId;
    if (!adminId) {
      return; // Not an admin or invalid token
    }

    let entityId = '';
    let oldValues = null;
    let newValues = null;
    let description = '';

    // Extract entity ID and values based on action
    if (action === 'CREATE') {
      const created = responseBody?.success ? 
        (responseBody.product || responseBody.user || responseBody.kyc || responseBody.contract) : null;
      if (created) {
        entityId = String(created.id || created.userId || 'unknown');
        newValues = formatEntityForAudit(created);
        description = `Creó ${entityType} con ID ${entityId}`;
      }
    } else if (action === 'UPDATE' || action === 'REVIEW') {
      entityId = req.params.id || 'unknown';
      
      // For KYC reviews, add specific details
      if ((action === 'REVIEW' || entityType === 'kyc') && req.body.status) {
        const status = req.body.status;
        const reason = req.body.rejectionReason;
        description = `Revisó KYC ID ${entityId} - Estado: ${status}`;
        if (reason) {
          description += ` - Motivo: ${reason}`;
        }
      } else {
        description = `Actualizó ${entityType} con ID ${entityId}`;
      }
      
      const updated = responseBody?.success ? 
        (responseBody.product || responseBody.user || responseBody.kyc || responseBody.contract) : null;
      if (updated) {
        newValues = formatEntityForAudit(updated);
      }
      
      // For request body changes
      if (req.body && Object.keys(req.body).length > 0) {
        newValues = formatEntityForAudit(req.body);
      }
      
    } else if (action === 'DELETE') {
      entityId = req.params.id || 'unknown';
      description = `Eliminó ${entityType} con ID ${entityId}`;
    }

    // Get client info
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('User-Agent') || '';

    // Insert audit log
    await db.insert(auditLogs).values({
      adminId,
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      description,
      ipAddress,
      userAgent
    });;

  } catch (error) {
    console.error('[AUDIT] Error logging audit entry:', error);
    console.error('[AUDIT] Error stack:', error.stack);
    // Don't throw error to avoid breaking the main operation
  }
}

// Export named imports for specific entity types
export const auditUser = {
  create: createAuditMiddleware('CREATE', 'users'),
  update: createAuditMiddleware('UPDATE', 'users'),
  delete: createAuditMiddleware('DELETE', 'users')
};

export const auditKyc = {
  create: createAuditMiddleware('CREATE', 'kyc'),
  update: createAuditMiddleware('REVIEW', 'kyc'),
  delete: createAuditMiddleware('DELETE', 'kyc')
};

export const auditProduct = {
  create: createAuditMiddleware('CREATE', 'products'),
  update: createAuditMiddleware('UPDATE', 'products'),
  delete: createAuditMiddleware('DELETE', 'products')
};

export const auditContract = {
  create: createAuditMiddleware('CREATE', 'contracts'),
  update: createAuditMiddleware('UPDATE', 'contracts'),
  delete: createAuditMiddleware('DELETE', 'contracts')
};

// Extend Request interface to include audit context
declare global {
  namespace Express {
    interface Request {
      auditContext?: {
        entityId: string;
        entityType: string;
        action: string;
        oldValues?: any;
      };
    }
  }
}