import { StackHeader } from '@/components/layout/stack-header';
import { NotificationsScreen } from '@/features/notifications/screens/notifications-screen';

export default function NotificationsRoute() {
  return (
    <>
      <StackHeader title="Notificaciones" />
      <NotificationsScreen />
    </>
  );
}
