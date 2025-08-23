import { TestBed } from '@angular/core/testing';
import { ModalService } from './modal.service';
import { FocusTrapService } from './focus-trap.service';
import { ModalConfig } from './modal.interface';

/* eslint-disable @typescript-eslint/no-unused-vars */
declare const describe: any;
declare const it: any;
declare const beforeEach: any;
declare const expect: any;
declare const jasmine: any;

// Type for spy objects
type SpyObj<T> = {
  [P in keyof T]: any;
};

describe('ModalService', () => {
  let service: ModalService;
  let focusTrapService: SpyObj<FocusTrapService>;

  beforeEach(() => {
    const focusTrapSpy = jasmine.createSpyObj('FocusTrapService', [
      'activate', 'deactivate', 'refresh'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ModalService,
        { provide: FocusTrapService, useValue: focusTrapSpy }
      ]
    });

    service = TestBed.inject(ModalService);
    focusTrapService = TestBed.inject(FocusTrapService) as SpyObj<FocusTrapService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open a modal with default configuration', (done: any) => {
    const config: ModalConfig = {
      id: 'test-modal',
      title: 'Test Modal'
    };

    const subscription = service.open(config).subscribe(result => {
      expect(result).toBeDefined();
      subscription.unsubscribe();
      done();
    });

    // Check if modal is registered
    expect(service.isModalOpen('test-modal')).toBe(true);
    expect(service.getOpenModalCount()).toBe(1);
    
    // Close the modal with a result to complete the observable
    service.close('test-modal', { confirmed: true });
  });

  it('should open a modal with custom configuration', (done: any) => {
    const config: ModalConfig = {
      id: 'custom-modal',
      title: 'Custom Modal',
      closeOnBackdropClick: false,
      closeOnEscape: false,
      showCloseButton: false,
      trapFocus: false,
      restoreFocus: false
    };

    const subscription = service.open(config).subscribe(result => {
      expect(result).toBeDefined();
      subscription.unsubscribe();
      done();
    });

    expect(service.isModalOpen('custom-modal')).toBe(true);
    
    // Close the modal with a result to complete the observable
    service.close('custom-modal', { confirmed: false });
  });

  it('should close a specific modal', () => {
    const config: ModalConfig = {
      id: 'close-test',
      title: 'Close Test'
    };

    service.open(config);
    expect(service.isModalOpen('close-test')).toBe(true);

    service.close('close-test');
    expect(service.isModalOpen('close-test')).toBe(false);
    expect(service.getOpenModalCount()).toBe(0);
  });

  it('should close all modals', () => {
    service.open({ id: 'modal1', title: 'Modal 1' });
    service.open({ id: 'modal2', title: 'Modal 2' });
    service.open({ id: 'modal3', title: 'Modal 3' });

    expect(service.getOpenModalCount()).toBe(3);

    service.closeAll();
    expect(service.getOpenModalCount()).toBe(0);
  });

  it('should support legacy methods for backward compatibility', () => {
    service.openLegacy('legacy-type', { data: 'test' });
    
    // Should create a modal with legacy type
    expect(service.getOpenModalCount()).toBe(1);
    
    service.closeLegacy();
    expect(service.getOpenModalCount()).toBe(0);
  });

  it('should handle focus trap activation', () => {
    const element = document.createElement('div');
    service.activateFocusTrap(element);
    
    expect(focusTrapService.activate).toHaveBeenCalledWith(element);
  });

  it('should handle focus trap deactivation', () => {
    service.deactivateFocusTrap();
    
    expect(focusTrapService.deactivate).toHaveBeenCalled();
  });

  it('should handle focus trap refresh', () => {
    service.refreshFocusTrap();
    
    expect(focusTrapService.refresh).toHaveBeenCalled();
  });

  it('should return active modals observable', () => {
    // Subscribe first, then open modal
    let receivedModals: any[] = [];
    const subscription = service.getActiveModals().subscribe(modals => {
      receivedModals = modals;
    });

    // Open a modal
    service.open({ id: 'test', title: 'Test' });
    
    // Check the result
    expect(Array.isArray(receivedModals)).toBe(true);
    expect(receivedModals.length).toBe(1);
    expect(receivedModals[0].config.id).toBe('test');
    
    subscription.unsubscribe();
  });

  it('should maintain backward compatibility with onOpen and onClose', () => {
    // Subscribe first, then open modal
    let receivedModals: any[] = [];
    const subscription = service.onOpen().subscribe(modals => {
      receivedModals = modals;
    });

    // Open a modal
    service.open({ id: 'legacy-test', title: 'Legacy Test' });
    
    // Check the result
    expect(Array.isArray(receivedModals)).toBe(true);
    expect(receivedModals.length).toBe(1);
    expect(receivedModals[0].config.id).toBe('legacy-test');
    
    subscription.unsubscribe();
  });
});
