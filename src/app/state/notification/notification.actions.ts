import { createAction, props } from '@ngrx/store';

export const raise = createAction(
  '[Notification] Raise Notification',
  props<{ 
    message: string; 
    status: number; 
    displayType?: 'banner' | 'toast';
    notificationType?: 'error' | 'warning' | 'info' | 'success';
  }>()
);

export const raiseMultiple = createAction(
  '[Notification] Raise Multiple Notifications',
  props<{ 
    errors: Array<{ 
      message: string; 
      status: number; 
      displayType?: 'banner' | 'toast';
      notificationType?: 'error' | 'warning' | 'info' | 'success';
    }> 
  }>()
);

export const clear = createAction(
  '[Notification] Clear Notification'
);

export const clearAll = createAction(
  '[Notification] Clear All Notifications'
);

export const dismiss = createAction(
  '[Notification] Dismiss Notification'
);

export const dismissById = createAction(
  '[Notification] Dismiss Notification By ID',
  props<{ errorId: string }>()
);

export const setDisplayType = createAction(
  '[Notification] Set Display Type',
  props<{ displayType: 'banner' | 'toast' }>()
);

export const setMaxQueueSize = createAction(
  '[Notification] Set Max Queue Size',
  props<{ maxSize: number }>()
);
