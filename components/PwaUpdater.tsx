'use client';

import { useEffect } from 'react';

/**
 * Автоматически отслеживает появление новой версии Service Worker
 * и обновляет страницу / очищает кэши навигации без ручных действий пользователя.
 */
export function PwaUpdater() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let refreshing = false;
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.getRegistration().then((reg) => {
          reg?.update().catch(() => {});
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    navigator.serviceWorker.getRegistration().then((reg) => {
      reg?.update().catch(() => {});
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
