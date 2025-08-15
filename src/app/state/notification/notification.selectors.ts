import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotificationState, NotificationInfo } from './notification.reducer';

export const selectNotificationState = createFeatureSelector<NotificationState>('notification');

export const selectCurrentNotification = createSelector(
  selectNotificationState,
  (state) => state.currentNotification
);

export const selectIsNotificationVisible = createSelector(
  selectNotificationState,
  (state) => state.isVisible
);

export const selectNotificationMessage = createSelector(
  selectCurrentNotification,
  (notification) => notification?.message || ''
);

export const selectNotificationStatus = createSelector(
  selectCurrentNotification,
  (notification) => notification?.status || 0
);

export const selectNotificationDisplayType = createSelector(
  selectNotificationState,
  (state) => state.displayType
);

export const selectGlobalDisplayType = createSelector(
  selectNotificationState,
  (state) => state.globalDisplayType
);

// Fixed visibility selectors - only show one at a time
export const selectShouldShowBanner = createSelector(
  selectNotificationState,
  (state) => state.isVisible && state.displayType === 'banner'
);

export const selectShouldShowToast = createSelector(
  selectNotificationState,
  (state) => state.isVisible && state.displayType === 'toast'
);

// Queue management selectors
export const selectNotificationQueue = createSelector(
  selectNotificationState,
  (state) => state.notificationQueue
);

export const selectTotalQueueLength = createSelector(
  selectNotificationState,
  (state) => state.notificationQueue.length
);

// Separate counting for banner vs toast
export const selectBannerQueueLength = createSelector(
  selectNotificationState,
  (state) => state.notificationQueue.filter((n: NotificationInfo) => n.displayType === 'banner').length
);

export const selectToastQueueLength = createSelector(
  selectNotificationState,
  (state) => state.notificationQueue.filter((n: NotificationInfo) => n.displayType === 'toast').length
);

export const selectHasMultipleNotifications = createSelector(
  selectNotificationState,
  (state) => state.notificationQueue.length > 1
);

export const selectNextNotification = createSelector(
  selectNotificationState,
  (state) => state.notificationQueue.length > 1 ? state.notificationQueue[1] : null
);

export const selectMaxQueueSize = createSelector(
  selectNotificationState,
  (state) => state.maxQueueSize
);

export const selectQueueIsFull = createSelector(
  selectNotificationState,
  (state) => state.notificationQueue.length >= state.maxQueueSize
);

export const selectNotificationById = (notificationId: string) => createSelector(
  selectNotificationState,
  (state) => state.notificationQueue.find((notification: NotificationInfo) => notification.id === notificationId) || null
);

// Enhanced selectors for notification categorization - now uses explicit type from state
export const selectNotificationType = createSelector(
  selectCurrentNotification,
  (notification) => notification?.notificationType || 'error'
);

export const selectNotificationSeverity = createSelector(
  selectCurrentNotification,
  (notification) => {
    if (!notification) return 'high';
    
    switch (notification.notificationType) {
      case 'error': return 'high';
      case 'warning': return 'medium';
      case 'info': return 'low';
      case 'success': return 'none';
      default: return 'high';
    }
  }
);
