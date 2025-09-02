import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { LoadingService } from '@shared/services/loading.service';
import { ToastService } from '@shared/services/toast.service';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription, combineLatest } from 'rxjs';
import { map, switchMap, filter, take } from 'rxjs/operators';
import { WalletFormService } from '../services/wallet-form.service';
import { WalletFacade } from '../services/wallet.facade';

@Component({
  selector: 'app-edit-wallet',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CheckboxModule,
    TooltipModule,
    TranslateModule,
  ],
  templateUrl: './edit-wallet.component.html',
  styleUrls: ['./edit-wallet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditWalletComponent implements OnInit, OnDestroy {
  editWalletForm!: FormGroup;
  
  // Observables for reactive data binding
  wallet$ = this.route.params.pipe(
    switchMap(params => {
      const walletId = params['id'];
      if (walletId && walletId !== 'new') {
        return this.walletFacade.getWalletById(walletId);
      }
      return [null];
    })
  );
  
  isEditMode$ = this.route.params.pipe(
    map(params => params['id'] && params['id'] !== 'new')
  );

  // Form options from service
  walletTypes$ = this.walletFormService.walletTypes$;
  currencies$ = this.walletFormService.currencies$;
  
  // Loading state from global service
  loading$ = this.loadingService.loading$;

  // Icon preview properties
  iconPreviewLoaded: boolean = false;
  iconPreviewError: boolean = false;

  private routeSubscription: Subscription = new Subscription();
  private walletOperationSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private walletFormService: WalletFormService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private walletFacade: WalletFacade
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadWallet();
    this.walletFacade.clearError();
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.walletOperationSubscription.unsubscribe();
  }

  onSubmit(): void {
    if (this.editWalletForm.valid) {
      const walletData = this.walletFormService.getFormData(this.editWalletForm);
      
      combineLatest([this.isEditMode$, this.wallet$]).pipe(
        take(1)
      ).subscribe(([isEditMode, wallet]) => {
        if (isEditMode && wallet) {
          this.updateWallet(walletData, wallet.id!);
        } else {
          this.createWallet(walletData);
        }
      });
    } else {
      this.walletFormService.markFormGroupTouched(this.editWalletForm);
      this.toastService.showError('Please fix the form errors before submitting');
    }
  }

  onCancel(): void {
    this.router.navigate(['/app/wallets']);
  }

  // Form validation methods
  getFieldError(fieldName: string): string {
    return this.walletFormService.getFieldError(this.editWalletForm, fieldName);
  }

  isFieldInvalid(fieldName: string): boolean {
    return this.walletFormService.isFieldInvalid(this.editWalletForm, fieldName);
  }

  // Icon preview methods
  onIconUrlChange(): void {
    this.iconPreviewLoaded = false;
    this.iconPreviewError = false;
  }

  onIconPreviewLoad(): void {
    this.iconPreviewLoaded = true;
    this.iconPreviewError = false;
  }

  onIconPreviewError(_event: any): void {
    this.iconPreviewError = true;
    this.iconPreviewLoaded = false;
  }

  // Color handling methods
  onColorChange(event: any): void {
    const color = event.target.value;
    this.editWalletForm.patchValue({ color });
  }

  onHexInputChange(event: any): void {
    const hexValue = event.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      this.editWalletForm.patchValue({ color: hexValue });
    }
  }

  // Goal progress calculation
  getGoalProgress(): number {
    const goalAmount = this.editWalletForm.get('goalAmount')?.value;
    const balance = this.editWalletForm.get('balance')?.value;
    return this.walletFormService.calculateGoalProgress(goalAmount, balance);
  }

  // Private methods
  private initializeForm(): void {
    this.editWalletForm = this.walletFormService.createForm();
  }

  private loadWallet(): void {
    this.routeSubscription = this.route.params.pipe(
      switchMap(params => {
        const walletId = params['id'];
        if (walletId && walletId !== 'new') {
          // Defer loading state changes to prevent ExpressionChangedAfterItHasBeenCheckedError
          setTimeout(() => {
            this.loadingService.show('Loading wallet...');
          });
          
          this.walletFacade.loadWallets();
          
          return this.walletFacade.wallets$.pipe(
            map(wallets => wallets.find(w => w.id === walletId)),
            filter(wallet => !!wallet),
            take(1)
          );
        } else {
          this.setDefaultValues();
          return [null];
        }
      })
    ).subscribe({
      next: (wallet) => {
        if (wallet) {
          this.walletFormService.populateForm(this.editWalletForm, wallet);
          this.loadingService.hide();
        }
      },
      error: (error) => {
        console.error('Error loading wallet:', error);
        this.loadingService.hide();
      }
    });
  }

  private setDefaultValues(): void {
    this.walletFormService.setDefaultValues(this.editWalletForm);
  }

  private updateWallet(walletData: any, walletId: string): void {
    this.startWalletOperation();
    
    // Defer loading state changes to prevent ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loadingService.show('Updating wallet...');
    });
    
    this.walletFacade.updateWallet(walletId, walletData);
  }

  private createWallet(walletData: any): void {
    this.startWalletOperation();
    
    // Defer loading state changes to prevent ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loadingService.show('Creating wallet...');
    });
    
    this.walletFacade.createWallet(walletData);
  }

  private startWalletOperation(): void {
    // Unsubscribe from any previous operation subscription
    if (this.walletOperationSubscription) {
      this.walletOperationSubscription.unsubscribe();
    }
    
    let operationStarted = false;
    
    this.walletOperationSubscription = this.walletFacade.isLoading$.subscribe((isLoading: boolean) => {
      if (isLoading) {
        operationStarted = true;
      } else if (operationStarted) {
        operationStarted = false;
        this.loadingService.hide();
        
        // Check for errors and navigate accordingly
        this.walletFacade.error$.pipe(take(1)).subscribe(error => {
          if (!error) {
            this.router.navigate(['/app/wallets']);
          }
          // If there's an error, user stays on form (error interceptor shows toast)
        });
      }
    });
  }
}
