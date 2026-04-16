import { FastifyInstance } from 'fastify';
import { AppStore } from '../../store';
import { requireUser } from '../../lib/auth';
import { requestBaseUrl } from '../../lib/request-base-url';

export function registerNotificationRoutes(app: FastifyInstance, store: AppStore): void {
  /**
   * GET /v1/notifications
   * List the current user's notifications (latest 50).
   */
  app.get(
    '/v1/notifications',
    { schema: { tags: ['notifications'], summary: 'List notifications for current user' } },
    async (request, reply) => {
      const auth = await requireUser(request, reply, store);
      if (!auth) return;
      const notifications = await store.listNotifications(requestBaseUrl(request), auth.user.id);
      return { notifications };
    }
  );

  /**
   * GET /v1/notifications/count
   * Return the unread notification count. Lightweight — safe to poll frequently.
   */
  app.get(
    '/v1/notifications/count',
    { schema: { tags: ['notifications'], summary: 'Count unread notifications' } },
    async (request, reply) => {
      const auth = await requireUser(request, reply, store);
      if (!auth) return;
      const count = await store.countUnreadNotifications(requestBaseUrl(request), auth.user.id);
      return { count };
    }
  );

  /**
   * POST /v1/notifications/read-all
   * Mark all of the current user's notifications as read.
   */
  app.post(
    '/v1/notifications/read-all',
    { schema: { tags: ['notifications'], summary: 'Mark all notifications as read' } },
    async (request, reply) => {
      const auth = await requireUser(request, reply, store);
      if (!auth) return;
      await store.markAllNotificationsRead(requestBaseUrl(request), auth.user.id);
      return { ok: true };
    }
  );
}
