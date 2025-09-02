import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Wallet } from '../../../api/model/wallet.model';
import { WalletFormService } from '../services/wallet-form.service';
import { WalletActionsService } from '../services/wallet-actions.service';
import { WalletStateService } from '../services/wallet-state.service';
import { LoadingService } from '../../../shared/services/loading.service';

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
    TranslateModule
  ],
  templateUrl: './edit-wallet.component.html',
  styleUrls: ['./edit-wallet.component.scss']
})
export class EditWalletComponent implements OnInit, OnDestroy {
  editWalletForm!: FormGroup;
  wallet: Wallet | null = null;
  isEditMode: boolean = false;
  
  // Icon preview properties
  iconPreviewLoaded: boolean = false;
  iconPreviewError: boolean = false;

  // Loading state from global service
  loading$ = this.loadingService.loading$;

  private routeSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private walletFormService: WalletFormService,
    private walletActionsService: WalletActionsService,
    private walletStateService: WalletStateService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadWallet();
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  private initializeForm(): void {
    this.editWalletForm = this.walletFormService.createForm();
  }

  private loadWallet(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const walletId = params['id'];
      if (walletId && walletId !== 'new') {
        this.isEditMode = true;
        this.loadExistingWallet(walletId);
      } else {
        this.isEditMode = false;
        this.setDefaultValues();
      }
    });
  }

  private loadExistingWallet(walletId: string): void {
    this.loadingService.show('Loading wallet...');
    this.walletStateService.getWalletById(walletId);
    
    // Subscribe to wallet changes
    this.routeSubscription.add(
      this.walletStateService.wallets$.subscribe(wallets => {
        const wallet = wallets.find(w => w.id === walletId);
        if (wallet) {
          this.wallet = wallet;
          this.walletFormService.populateForm(this.editWalletForm, wallet);
          this.loadingService.hide();
        }
      })
    );
  }

  private setDefaultValues(): void {
    this.walletFormService.setDefaultValues(this.editWalletForm);
  }

  onSubmit(): void {
    if (this.editWalletForm.valid) {
      const walletData = this.walletFormService.getFormData(this.editWalletForm);

      if (this.isEditMode && this.wallet) {
        // Update existing wallet
        this.updateWallet(walletData);
      } else {
        // Create new wallet
        this.createWallet(walletData);
      }
    } else {
      this.walletFormService.markFormGroupTouched(this.editWalletForm);
    }
  }

  private updateWallet(walletData: any): void {
    if (this.wallet?.id) {
      this.loadingService.show('Updating wallet...');
      this.walletActionsService.updateWallet(this.wallet.id, walletData).pipe(
        finalize(() => this.loadingService.hide())
      ).subscribe({
        next: () => {
          this.router.navigate(['/app/wallets']);
        },
        error: (error) => {
          console.error('Failed to update wallet:', error);
        }
      });
    }
  }

  private createWallet(walletData: any): void {
    this.loadingService.show('Creating wallet...');
    this.walletActionsService.createWallet(walletData).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: () => {
        this.router.navigate(['/app/wallets']);
      },
      error: (error) => {
        console.error('Failed to create wallet:', error);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/app/wallets']);
  }

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

  onColorChange(event: any): void {
    const color = event.target.value;
    this.editWalletForm.patchValue({ color });
  }

  onHexInputChange(event: any): void {
    const hexValue = event.target.value;
    // Validate hex format
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

  // Form options from service
  walletTypes$ = this.walletFormService.walletTypes$;
  currencies$ = this.walletFormService.currencies$;
}
