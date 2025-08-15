import { createReducer, on } from '@ngrx/store';
import * as NotificationActions from './notification.actions';

export interface NotificationInfo {
  id: string;
  message: string;
  status: number;
  displayType: 'banner' | 'toast';
  notificationType: 'error' | 'warning' | 'info' | 'success';
  timestamp: number;
}

export interface NotificationState {
  notificationQueue: NotificationInfo[];
  currentNotification: NotificationInfo | null;
  isVisible: boolean;
  displayType: 'banner' | 'toast';
  globalDisplayType: 'banner' | 'toast';
  maxQueueSize: number;
}

export const initialState: NotificationState = {
  notificationQueue: [],
  currentNotification: null,
  isVisible: false,
  displayType: 'toast',
  globalDisplayType: 'toast',
  maxQueueSize: 10
};

// Helper function to calculate notification type from status if not explicitly provided
function calculateNotificationType(status: number, explicitType?: 'error' | 'warning' | 'info' | 'success'): 'error' | 'warning' | 'info' | 'success' {
  if (explicitType) return explicitType;
  
  if (status >= 500) return 'error';
  if (status >= 400) return 'warning';
  if (status >= 300) return 'info';
  if (status >= 200) return 'success';
  return 'error';
}

export const notificationReducer = createReducer(
  initialState,
  on(NotificationActions.raise, (state, { message, status, displayType, notificationType }) => {
    const calculatedType = calculateNotificationType(status, notificationType);
    
    const newNotification: NotificationInfo = {
      id: generateNotificationId(),
      message,
      status,
      displayType: displayType || state.globalDisplayType,
      notificationType: calculatedType,
      timestamp: Date.now()
    };
    
    const newQueue = [...state.notificationQueue, newNotification].slice(-state.maxQueueSize);
    
    return {
      ...state,
      notificationQueue: newQueue,
      currentNotification: newNotification,
      isVisible: true,
      displayType: newNotification.displayType
    };
  }),
  
  on(NotificationActions.raiseMultiple, (state, { errors }) => {
    const newNotifications: NotificationInfo[] = errors.map(error => ({
      id: generateNotificationId(),
      message: error.message,
      status: error.status,
      displayType: error.displayType || state.globalDisplayType,
      notificationType: calculateNotificationType(error.status, error.notificationType),
      timestamp: Date.now()
    }));
    
    const newQueue = [...state.notificationQueue, ...newNotifications].slice(-state.maxQueueSize);
    
    return {
      ...state,
      notificationQueue: newQueue,
      currentNotification: newNotifications[newNotifications.length - 1], // Show the last notification
      isVisible: true,
      displayType: newNotifications[newNotifications.length - 1].displayType
    };
  }),
  
  on(NotificationActions.clear, (state) => {
    const remainingQueue = state.notificationQueue.slice(1); // Remove first notification
    const nextNotification = remainingQueue.length > 0 ? remainingQueue[0] : null;
    
    return {
      ...state,
      notificationQueue: remainingQueue,
      currentNotification: nextNotification,
      isVisible: nextNotification !== null
    };
  }),
  
  on(NotificationActions.clearAll, (state) => ({
    ...state,
    notificationQueue: [],
    currentNotification: null,
    isVisible: false
  })),
  
  on(NotificationActions.dismiss, (state) => {
    const remainingQueue = state.notificationQueue.slice(1); // Remove first notification
    const nextNotification = remainingQueue.length > 0 ? remainingQueue[0] : null;
    
    return {
      ...state,
      notificationQueue: remainingQueue,
      currentNotification: nextNotification,
      isVisible: nextNotification !== null
    };
  }),
  
  on(NotificationActions.dismissById, (state, { errorId }) => {
    const remainingQueue = state.notificationQueue.filter(notification => notification.id !== errorId);
    const nextNotification = remainingQueue.length > 0 ? remainingQueue[0] : null;
    
    return {
      ...state,
      notificationQueue: remainingQueue,
      currentNotification: nextNotification,
      isVisible: nextNotification !== null
    };
  }),
  
  on(NotificationActions.setDisplayType, (state, { displayType }) => ({
    ...state,
    globalDisplayType: displayType
  })),
  
  on(NotificationActions.setMaxQueueSize, (state, { maxSize }) => ({
    ...state,
    maxQueueSize: maxSize,
    notificationQueue: state.notificationQueue.slice(-maxSize) // Trim queue if needed
  }))
);

// Helper function to generate unique notification IDs
function generateNotificationId(): string {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
