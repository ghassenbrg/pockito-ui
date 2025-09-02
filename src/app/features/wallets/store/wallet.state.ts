import { Wallet } from '@api/model/wallet.model';

export interface WalletState {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  viewMode: 'cards' | 'list';
  isLoading: boolean;
  error: string | null;
}

export const initialState: WalletState = {
  wallets: [],
  selectedWallet: null,
  viewMode: 'cards',
  isLoading: false,
  error: null
};
