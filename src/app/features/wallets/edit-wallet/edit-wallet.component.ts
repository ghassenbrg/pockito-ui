import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
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
import { Wallet } from '../../../api/model/wallet.model';
import { WalletFormService } from '../services/wallet-form.service';
import { WalletActionsService } from '../services/wallet-actions.service';
import { WalletStateService } from '../services/wallet-state.service';

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
  styleUrl: './edit-wallet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditWalletComponent implements OnInit, OnDestroy {
  editWalletForm!: FormGroup;
  wallet: Wallet | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  
  // Icon preview properties
  iconPreviewLoaded: boolean = false;
  iconPreviewError: boolean = false;

  private routeSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private walletFormService: WalletFormService,
    private walletActionsService: WalletActionsService,
    private walletStateService: WalletStateService,
    private route: ActivatedRoute,
    private router: Router
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
    this.isLoading = true;
    this.walletStateService.getWalletById(walletId);
    
    // Subscribe to wallet changes
    this.routeSubscription.add(
      this.walletStateService.wallets$.subscribe(wallets => {
        const wallet = wallets.find(w => w.id === walletId);
        if (wallet) {
          this.wallet = wallet;
          this.walletFormService.populateForm(this.editWalletForm, wallet);
          this.isLoading = false;
        }
      })
    );
  }

  private setDefaultValues(): void {
    this.walletFormService.setDefaultValues(this.editWalletForm);
  }

  onSubmit(): void {
    if (this.editWalletForm.valid) {
      this.isLoading = true;
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
    if (this.wallet) {
      const success = this.walletActionsService.updateWallet(this.wallet, walletData);
      if (success) {
        this.isLoading = false;
        this.router.navigate(['/app/wallets']);
      } else {
        this.isLoading = false;
        console.error('Failed to update wallet');
      }
    }
  }

  private createWallet(walletData: any): void {
    const success = this.walletActionsService.createWallet(walletData);
    if (success) {
      this.isLoading = false;
      this.router.navigate(['/app/wallets']);
    } else {
      this.isLoading = false;
      console.error('Failed to create wallet');
    }
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
    this.iconPreviewLoaded = false;
    this.iconPreviewError = true;
    console.warn('Failed to load icon preview');
  }

  // Goal progress calculation
  getGoalProgress(): number {
    const goalAmount = this.editWalletForm.get('goalAmount')?.value;
    const balance = this.editWalletForm.get('balance')?.value;
    
    return this.walletFormService.calculateGoalProgress(goalAmount, balance);
  }

  // Getters for template
  get walletTypes() {
    return this.walletFormService.walletTypes;
  }

  get currencies() {
    return this.walletFormService.currencies;
  }
}
