import { NotificationState } from './notification/notification.reducer';
import { WalletState } from './wallets/wallet.state';

export interface AppState {
  notification: NotificationState;
  wallets: WalletState;
}
