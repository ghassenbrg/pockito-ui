import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WalletService } from './wallet.service';
import { environment } from '../../../environments/environment';
import { 
  Wallet, 
  CreateWalletRequest, 
  UpdateWalletRequest 
} from '../models/wallet.model';

/* eslint-disable @typescript-eslint/no-unused-vars */
declare const describe: any;
declare const it: any;
declare const beforeEach: any;
declare const expect: any;
declare const afterEach: any;

describe('WalletService', () => {
  let service: WalletService;
  let httpMock: HttpTestingController;
  let baseUrl: string;

  const mockWallet: Wallet = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Wallet',
    iconType: 'EMOJI',
    iconValue: '💰',
    currencyCode: 'USD',
    color: '#3B82F6',
    type: 'BANK_ACCOUNT',
    initialBalance: 1000.00,
    isDefault: true,
    goalAmount: undefined,
    userId: 'user-123',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  };

  const mockCreateRequest: CreateWalletRequest = {
    name: 'New Wallet',
    iconType: 'EMOJI',
    iconValue: '🏦',
    currencyCode: 'EUR',
    color: '#10B981',
    type: 'SAVINGS',
    initialBalance: 500.00,
    goalAmount: 10000.00,
    setDefault: false
  };

  const mockUpdateRequest: UpdateWalletRequest = {
    name: 'Updated Wallet',
    iconType: 'URL',
    iconValue: 'https://example.com/icon.png',
    currencyCode: 'USD',
    color: '#EF4444',
    type: 'CREDIT_CARD',
    goalAmount: 5000.00
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WalletService]
    });

    service = TestBed.inject(WalletService);
    httpMock = TestBed.inject(HttpTestingController);
    baseUrl = environment.api.baseUrl;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getWallets', () => {
    it('should retrieve all wallets', () => {
      const mockWallets: Wallet[] = [mockWallet];

      service.getWallets().subscribe(wallets => {
        expect(wallets).toEqual(mockWallets);
      });

      const req = httpMock.expectOne(`${baseUrl}/wallets`);
      expect(req.request.method).toBe('GET');
      req.flush(mockWallets);
    });
  });

  describe('getWallet', () => {
    it('should retrieve a specific wallet by ID', () => {
      const walletId = '123e4567-e89b-12d3-a456-426614174000';

      service.getWallet(walletId).subscribe(wallet => {
        expect(wallet).toEqual(mockWallet);
      });

      const req = httpMock.expectOne(`${baseUrl}/wallets/${walletId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockWallet);
    });
  });

  describe('createWallet', () => {
    it('should create a new wallet', () => {
      service.createWallet(mockCreateRequest).subscribe(wallet => {
        expect(wallet).toEqual(mockWallet);
      });

      const req = httpMock.expectOne(`${baseUrl}/wallets`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCreateRequest);
      req.flush(mockWallet);
    });
  });

  describe('updateWallet', () => {
    it('should update an existing wallet', () => {
      const walletId = '123e4567-e89b-12d3-a456-426614174000';
      const updatedWallet = { ...mockWallet, ...mockUpdateRequest };

      service.updateWallet(walletId, mockUpdateRequest).subscribe(wallet => {
        expect(wallet).toEqual(updatedWallet);
      });

      const req = httpMock.expectOne(`${baseUrl}/wallets/${walletId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockUpdateRequest);
      req.flush(updatedWallet);
    });
  });

  describe('setDefaultWallet', () => {
    it('should set a wallet as default', () => {
      const walletId = '123e4567-e89b-12d3-a456-426614174000';

      service.setDefaultWallet(walletId).subscribe(() => {
        expect(true).toBe(true); // Success callback
      });

      const req = httpMock.expectOne(`${baseUrl}/wallets/${walletId}/default`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });

  describe('archiveWallet', () => {
    it('should archive a wallet', () => {
      const walletId = '123e4567-e89b-12d3-a456-426614174000';

      service.archiveWallet(walletId).subscribe(() => {
        expect(true).toBe(true); // Success callback
      });

      const req = httpMock.expectOne(`${baseUrl}/wallets/${walletId}/archive`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });

  describe('activateWallet', () => {
    it('should activate a previously archived wallet', () => {
      const walletId = '123e4567-e89b-12d3-a456-426614174000';

      service.activateWallet(walletId).subscribe(() => {
        expect(true).toBe(true); // Success callback
      });

      const req = httpMock.expectOne(`${baseUrl}/wallets/${walletId}/activate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });

  describe('deleteWallet', () => {
    it('should delete a wallet permanently', () => {
      const walletId = '123e4567-e89b-12d3-a456-426614174000';

      service.deleteWallet(walletId).subscribe(() => {
        expect(true).toBe(true); // Success callback
      });

      const req = httpMock.expectOne(`${baseUrl}/wallets/${walletId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
