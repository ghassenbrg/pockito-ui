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
