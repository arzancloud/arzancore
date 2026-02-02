/**
 * Portal Service - проверка доступа к порталам и модулям
 * Используется всеми микросервисами
 */

import { eq, and } from 'drizzle-orm';

export interface PortalAccessCheck {
  portalId: string;
  userId: string;
  moduleId: string;
}

export interface PortalAccess {
  allowed: boolean;
  portal?: {
    id: string;
    name: string;
    slug: string;
  };
  user?: {
    id: string;
    role: string;
  };
  module?: {
    plan: string;
    limits: Record<string, number>;
    status: string;
  };
  error?: string;
}

export function createPortalService(db: any, schema: any) {
  return {
    /**
     * Проверить доступ пользователя к модулю портала
     */
    async checkAccess(check: PortalAccessCheck): Promise<PortalAccess> {
      const { portalId, userId, moduleId } = check;

      // 1. Проверить что портал существует и активен
      const portal = await db.query.portals.findFirst({
        where: and(
          eq(schema.portals.id, portalId),
          eq(schema.portals.isActive, true)
        ),
      });

      if (!portal) {
        return { allowed: false, error: 'Portal not found or inactive' };
      }

      // 2. Проверить что пользователь имеет доступ к порталу
      const portalUser = await db.query.portalUsers.findFirst({
        where: and(
          eq(schema.portalUsers.portalId, portalId),
          eq(schema.portalUsers.userId, userId),
          eq(schema.portalUsers.isActive, true)
        ),
      });

      if (!portalUser) {
        return { allowed: false, error: 'User not member of portal' };
      }

      // 3. Проверить доступ к модулю
      if (portalUser.moduleAccess && !portalUser.moduleAccess[moduleId]) {
        return { allowed: false, error: 'User has no access to this module' };
      }

      // 4. Проверить подписку на модуль
      const portalModule = await db.query.portalModules.findFirst({
        where: and(
          eq(schema.portalModules.portalId, portalId),
          eq(schema.portalModules.moduleId, moduleId)
        ),
      });

      if (!portalModule || portalModule.status === 'canceled') {
        return { allowed: false, error: 'Module not subscribed' };
      }

      return {
        allowed: true,
        portal: {
          id: portal.id,
          name: portal.name,
          slug: portal.slug,
        },
        user: {
          id: userId,
          role: portalUser.role,
        },
        module: {
          plan: portalModule.plan,
          limits: portalModule.limits || {},
          status: portalModule.status,
        },
      };
    },

    /**
     * Получить все порталы пользователя
     */
    async getUserPortals(userId: string) {
      return db.query.portalUsers.findMany({
        where: and(
          eq(schema.portalUsers.userId, userId),
          eq(schema.portalUsers.isActive, true)
        ),
        with: {
          portal: true,
        },
      });
    },

    /**
     * Создать событие между сервисами
     */
    async createCrossServiceEvent(event: {
      portalId: string;
      sourceModule: string;
      targetModule: string;
      eventType: string;
      payload: Record<string, any>;
    }) {
      return db.insert(schema.crossServiceEvents).values(event).returning();
    },

    /**
     * Получить необработанные события для модуля
     */
    async getPendingEvents(targetModule: string, limit = 100) {
      return db.query.crossServiceEvents.findMany({
        where: and(
          eq(schema.crossServiceEvents.targetModule, targetModule),
          eq(schema.crossServiceEvents.status, 'pending')
        ),
        limit,
        orderBy: schema.crossServiceEvents.createdAt,
      });
    },
  };
}
