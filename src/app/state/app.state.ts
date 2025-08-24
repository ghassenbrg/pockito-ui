import { NotificationState } from './notification/notification.reducer';
import { WalletState } from './wallets/wallet.state';
import { CategoryState } from './categories/category.state';

export interface AppState {
  notification: NotificationState;
  wallets: WalletState;
  categories: CategoryState;
}
