import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

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
import { filter, map, switchMap, take } from 'rxjs/operators';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditWalletComponent implements OnInit, OnDestroy {
  editWalletForm!: FormGroup;

  // Observables for reactive data binding
  wallet$ = this.route.params.pipe(
    switchMap((params) => {
      const walletId = params['id'];
      if (walletId && walletId !== 'new') {
        return this.walletFacade.getWalletById(walletId);
      }
      return [null];
    })
  );

  isEditMode$ = this.route.params.pipe(
    map((params) => params['id'] && params['id'] !== 'new')
  );

  // Form options from service
  walletTypes$ = this.walletFormService.walletTypes$;
  currencies$ = this.walletFormService.currencies$;

  // Loading state from NgRx store
  loading$ = this.walletFacade.isLoading$;
  
  // Operation-specific loading states
  isCreatingWallet$ = this.walletFacade.isCreatingWallet$;
  isUpdatingWallet$ = this.walletFacade.isUpdatingWallet$;
  isLoadingWalletById$ = this.walletFacade.isLoadingWalletById$;
  
  // Operation states with loading and errors
  createWalletState$ = this.walletFacade.createWalletState$;
  updateWalletState$ = this.walletFacade.updateWalletState$;
  loadWalletByIdState$ = this.walletFacade.loadWalletByIdState$;

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
    
    // Listen for route changes to ensure loading state is reset
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // Reset loading state when route changes
        if (this.loadingService.isLoading) {
          this.loadingService.hide();
        }
      });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.walletOperationSubscription.unsubscribe();
  }

  onSubmit(): void {
    if (this.editWalletForm.valid) {
      const walletData = this.walletFormService.getFormData(
        this.editWalletForm
      );

      combineLatest([this.isEditMode$, this.wallet$])
        .pipe(take(1))
        .subscribe(([isEditMode, wallet]) => {
          if (isEditMode && wallet) {
            this.updateWallet(walletData, wallet.id!);
          } else {
            this.createWallet(walletData);
          }
        });
    } else {
      this.walletFormService.markFormGroupTouched(this.editWalletForm);
      this.toastService.showError('formErrors');
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
    return this.walletFormService.isFieldInvalid(
      this.editWalletForm,
      fieldName
    );
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
    this.routeSubscription = this.route.params
      .pipe(
        switchMap((params) => {
          const walletId = params['id'];
          
          if (walletId && walletId !== 'new') {
            // Always fetch the latest version from API
            this.loadingService.show('Loading wallet...');
            this.walletFacade.loadWalletById(walletId);

            // Wait for the wallet to load
            return this.walletFacade.selectedWallet$.pipe(
              filter((wallet) => !!wallet && wallet.id === walletId),
              take(1)
            );
          } else {
            this.setDefaultValues();
            return [null];
          }
        })
      )
      .subscribe({
        next: (wallet) => {
          if (wallet) {
            this.walletFormService.populateForm(this.editWalletForm, wallet);
            this.loadingService.hide();
          }
        },
        error: (error) => {
          console.error('Error loading wallet:', error);
          this.loadingService.hide();
        },
      });
  }

  private setDefaultValues(): void {
    this.walletFormService.setDefaultValues(this.editWalletForm);
  }

  private updateWallet(walletData: any, walletId: string): void {
    // Simply dispatch the action - NgRx handles everything else
    this.walletFacade.updateWallet(walletId, walletData);
  }

  private createWallet(walletData: any): void {
    // Simply dispatch the action - NgRx handles everything else
    this.walletFacade.createWallet(walletData);
  }
}
