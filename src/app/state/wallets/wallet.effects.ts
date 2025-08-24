import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { WalletService } from '@shared/services/wallet.service';
import * as WalletActions from './wallet.actions';

@Injectable()
export class WalletEffects {

  loadWallets$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.loadWallets),
    mergeMap(() => this.walletService.getWallets()
      .pipe(
        map(wallets => WalletActions.loadWalletsSuccess({ wallets })),
        catchError(error => of(WalletActions.loadWalletsFailure({ error: error.message || 'Failed to load wallets' })))
      ))
  ));

  loadWallet$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.loadWallet),
    mergeMap(({ id }) => this.walletService.getWallet(id)
      .pipe(
        map(wallet => WalletActions.loadWalletSuccess({ wallet })),
        catchError(error => of(WalletActions.loadWalletFailure({ error: error.message || 'Failed to load wallet' })))
      ))
  ));

  createWallet$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.createWallet),
    mergeMap(({ wallet }) => this.walletService.createWallet(wallet)
      .pipe(
        map(createdWallet => WalletActions.createWalletSuccess({ wallet: createdWallet })),
        catchError(error => of(WalletActions.createWalletFailure({ error: error.message || 'Failed to create wallet' })))
      ))
  ));

  updateWallet$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.updateWallet),
    mergeMap(({ id, wallet }) => this.walletService.updateWallet(id, wallet)
      .pipe(
        map(updatedWallet => WalletActions.updateWalletSuccess({ wallet: updatedWallet })),
        catchError(error => of(WalletActions.updateWalletFailure({ error: error.message || 'Failed to update wallet' })))
      ))
  ));

  archiveWallet$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.archiveWallet),
    mergeMap(({ id }) => this.walletService.archiveWallet(id)
      .pipe(
        map(() => WalletActions.archiveWalletSuccess({ walletId: id })),
        catchError(error => of(WalletActions.archiveWalletFailure({ error: error.message || 'Failed to archive wallet' })))
      ))
  ));

  setDefaultWallet$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.setDefaultWallet),
    mergeMap(({ id }) => this.walletService.setDefaultWallet(id)
      .pipe(
        map(() => WalletActions.setDefaultWalletSuccess({ walletId: id })),
        catchError(error => of(WalletActions.setDefaultWalletFailure({ error: error.message || 'Failed to set default wallet' })))
      ))
  ));

  reorderWallet$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.reorderWallet),
    tap(({ id, newOrder }) => console.log(`Effect: Reordering wallet ${id} to position ${newOrder}`)),
    mergeMap(({ id, newOrder }) => this.walletService.reorderWallet(id, newOrder)
      .pipe(
        tap(() => console.log(`Effect: Reorder API call successful for wallet ${id}`)),
        map(() => WalletActions.reorderWalletSuccess({ walletId: id, newOrder })),
        catchError(error => {
          console.error(`Effect: Reorder failed for wallet ${id}:`, error);
          return of(WalletActions.reorderWalletFailure({ error: error.message || 'Failed to reorder wallet' }));
        })
      ))
  ));

  // Reload wallets after successful reorder to ensure state consistency
  reloadAfterReorder$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.reorderWalletSuccess),
    tap(({ walletId, newOrder }) => console.log(`Effect: Reloading wallets after reorder success for wallet ${walletId} to position ${newOrder}`)),
    mergeMap(() => this.walletService.getWallets()
      .pipe(
        tap(wallets => console.log(`Effect: Reloaded ${wallets.length} wallets after reorder`)),
        map(wallets => WalletActions.loadWalletsSuccess({ wallets })),
        catchError(error => {
          console.error('Effect: Failed to reload wallets after reorder:', error);
          return of(WalletActions.loadWalletsFailure({ error: error.message || 'Failed to reload wallets' }));
        })
      ))
  ));

  normalizeDisplayOrders$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.normalizeDisplayOrders),
    mergeMap(() => this.walletService.normalizeDisplayOrders()
      .pipe(
        map(() => WalletActions.normalizeDisplayOrdersSuccess()),
        catchError(error => of(WalletActions.normalizeDisplayOrdersFailure({ error: error.message || 'Failed to normalize display orders' })))
      ))
  ));

  // Reload wallets after successful normalization to ensure state consistency
  reloadAfterNormalize$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.normalizeDisplayOrdersSuccess),
    mergeMap(() => this.walletService.getWallets()
      .pipe(
        map(wallets => WalletActions.loadWalletsSuccess({ wallets })),
        catchError(error => of(WalletActions.loadWalletsFailure({ error: error.message || 'Failed to reload wallets' })))
      ))
  ));

  // Navigation effects
  createWalletSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.createWalletSuccess),
    tap(() => this.router.navigate(['/wallets']))
  ), { dispatch: false });

  updateWalletSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(WalletActions.updateWalletSuccess),
    tap(() => this.router.navigate(['/wallets']))
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private walletService: WalletService,
    private router: Router
  ) {}
}
