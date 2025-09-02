import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { WalletService } from '@api/services/wallet.service';
import { WalletDto } from '@api/model/wallet.model';
import * as WalletActions from './wallet.actions';

@Injectable()
export class WalletEffects {
  constructor(
    private actions$: Actions,
    private walletService: WalletService,
    private store: Store
  ) {}

  // Load Wallets Effect
  loadWallets$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.loadWallets),
    mergeMap(() => this.walletService.getUserWallets()
      .pipe(
        map(wallets => WalletActions.loadWalletsSuccess({ wallets })),
        catchError(error => of(WalletActions.loadWalletsFailure({ 
          error: error.message || 'Failed to load wallets' 
        })))
      ))
  ));

  // Create Wallet Effect
  createWallet$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.createWallet),
    mergeMap(({ walletData }) => this.walletService.createWallet(walletData)
      .pipe(
        map(wallet => WalletActions.createWalletSuccess({ wallet })),
        catchError(error => of(WalletActions.createWalletFailure({ 
          error: error.message || 'Failed to create wallet' 
        })))
      ))
  ));

  // Update Wallet Effect
  updateWallet$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.updateWallet),
    mergeMap(({ walletId, walletData }) => this.walletService.updateWallet(walletId, walletData as WalletDto)
      .pipe(
        map(wallet => WalletActions.updateWalletSuccess({ wallet })),
        catchError(error => of(WalletActions.updateWalletFailure({ 
          error: error.message || 'Failed to update wallet' 
        })))
      ))
  ));

  // Delete Wallet Effect
  deleteWallet$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.deleteWallet),
    mergeMap(({ wallet }) => {
      if (this.confirmDeletion(wallet.name)) {
        return this.walletService.deleteWallet(wallet.id!).pipe(
          map(() => WalletActions.deleteWalletSuccess({ walletId: wallet.id! })),
          catchError(error => of(WalletActions.deleteWalletFailure({ 
            error: error.message || 'Failed to delete wallet' 
          })))
        );
      } else {
        return of(WalletActions.deleteWalletFailure({ 
          error: 'Deletion cancelled' 
        }));
      }
    })
  ));

  // Set Default Wallet Effect
  setDefaultWallet$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.setDefaultWallet),
    mergeMap(({ wallet }) => {
      if (!wallet.id) {
        return of(WalletActions.setDefaultWalletFailure({ 
          error: 'Wallet ID is required' 
        }));
      }
      return this.walletService.setDefaultWallet(wallet.id).pipe(
        map(updatedWallet => WalletActions.setDefaultWalletSuccess({ wallet: updatedWallet })),
        catchError(error => of(WalletActions.setDefaultWalletFailure({ 
          error: error.message || 'Failed to set default wallet' 
        })))
      );
    })
  ));

  // Move Wallet Up Effect
  moveWalletUp$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.moveWalletUp),
    mergeMap(({ wallet }) => {
      this.walletService.moveWalletUp(wallet);
      // Since moveWalletUp doesn't return an observable, we need to reload wallets
      return this.walletService.getUserWallets().pipe(
        map(wallets => WalletActions.moveWalletUpSuccess({ wallets })),
        catchError(error => of(WalletActions.moveWalletUpFailure({ 
          error: error.message || 'Failed to move wallet up' 
        })))
      );
    })
  ));

  // Move Wallet Down Effect
  moveWalletDown$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.moveWalletDown),
    mergeMap(({ wallet }) => {
      this.walletService.moveWalletDown(wallet);
      // Since moveWalletDown doesn't return an observable, we need to reload wallets
      return this.walletService.getUserWallets().pipe(
        map(wallets => WalletActions.moveWalletDownSuccess({ wallets })),
        catchError(error => of(WalletActions.moveWalletDownFailure({ 
          error: error.message || 'Failed to move wallet down' 
        })))
      );
    })
  ));

  private confirmDeletion(walletName: string): boolean {
    return confirm(`Are you sure you want to delete ${walletName}?`);
  }
}
