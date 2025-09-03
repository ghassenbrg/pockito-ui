import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { WalletService } from '@api/services/wallet.service';
import { WalletDto } from '@api/model/wallet.model';
import * as WalletActions from './wallet.actions';

@Injectable()
export class WalletEffects {
  constructor(
    private actions$: Actions,
    private walletService: WalletService,
    private store: Store,
    private router: Router
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

  // Load Single Wallet by ID Effect
  loadWalletById$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.loadWalletById),
    mergeMap(({ walletId }) => this.walletService.getWallet(walletId)
      .pipe(
        map(wallet => WalletActions.loadWalletByIdSuccess({ wallet })),
        catchError(error => of(WalletActions.loadWalletByIdFailure({ 
          error: error.message || 'Failed to load wallet' 
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
      // Get current wallets to calculate new order
      return this.walletService.getUserWallets().pipe(
        switchMap(wallets => {
          const currentIndex = wallets.findIndex(w => w.id === wallet.id);
          if (currentIndex > 0) {
            // Create new order array with wallet moved up
            const newOrder = [...wallets];
            const temp = newOrder[currentIndex];
            newOrder[currentIndex] = newOrder[currentIndex - 1];
            newOrder[currentIndex - 1] = temp;
            
            // Use reorderWallets API to update the order
            const walletIds = newOrder.map(w => w.id!);
            return this.walletService.reorderWallets(walletIds).pipe(
              map(() => WalletActions.moveWalletUpSuccess({ wallets: newOrder })),
              catchError(error => of(WalletActions.moveWalletUpFailure({ 
                error: error.message || 'Failed to move wallet up' 
              })))
            );
          } else {
            // Can't move up, return current wallets
            return of(WalletActions.moveWalletUpSuccess({ wallets }));
          }
        }),
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
      // Get current wallets to calculate new order
      return this.walletService.getUserWallets().pipe(
        switchMap(wallets => {
          const currentIndex = wallets.findIndex(w => w.id === wallet.id);
          if (currentIndex < wallets.length - 1) {
            // Create new order array with wallet moved down
            const newOrder = [...wallets];
            const temp = newOrder[currentIndex];
            newOrder[currentIndex] = newOrder[currentIndex + 1];
            newOrder[currentIndex + 1] = temp;
            
            // Use reorderWallets API to update the order
            const walletIds = newOrder.map(w => w.id!);
            return this.walletService.reorderWallets(walletIds).pipe(
              map(() => WalletActions.moveWalletDownSuccess({ wallets: newOrder })),
              catchError(error => of(WalletActions.moveWalletDownFailure({ 
                error: error.message || 'Failed to move wallet down' 
              })))
            );
          } else {
            // Can't move down, return current wallets
            return of(WalletActions.moveWalletDownSuccess({ wallets }));
          }
        }),
        catchError(error => of(WalletActions.moveWalletDownFailure({ 
          error: error.message || 'Failed to move wallet down' 
        })))
      );
    })
  ));

  // Navigation effects for successful operations
  createWalletSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.createWalletSuccess),
    tap(() => {
      // Navigate to wallets list after successful creation
      setTimeout(() => this.router.navigate(['/app/wallets']), 300);
    })
  ), { dispatch: false });

  updateWalletSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.updateWalletSuccess),
    tap(() => {
      // Navigate to wallets list after successful update
      setTimeout(() => this.router.navigate(['/app/wallets']), 300);
    })
  ), { dispatch: false });

  deleteWalletSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.deleteWalletSuccess),
    tap(() => {
      // Navigate to wallets list after successful deletion
      setTimeout(() => this.router.navigate(['/app/wallets']), 300);
    })
  ), { dispatch: false });

  setDefaultWalletSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.setDefaultWalletSuccess),
    tap(() => {
      // Stay on current page after setting default wallet
      // Could add a success toast here if needed
    })
  ), { dispatch: false });

  moveWalletUpSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.moveWalletUpSuccess),
    tap(() => {
      // Stay on current page after moving wallet
      // Could add a success toast here if needed
    })
  ), { dispatch: false });

  moveWalletDownSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.moveWalletDownSuccess),
    tap(() => {
      // Stay on current page after moving wallet
      // Could add a success toast here if needed
    })
  ), { dispatch: false });

  private confirmDeletion(walletName: string): boolean {
    return confirm(`Are you sure you want to delete ${walletName}?`);
  }
}
