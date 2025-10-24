import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild, TemplateRef, ContentChild, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DialogBreakpoints {
  [key: string]: string;
}

@Component({
  selector: 'app-pockito-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pockito-dialog.component.html',
  styleUrls: ['./pockito-dialog.component.scss']
})
export class PockitoDialogComponent implements OnInit, OnChanges, OnDestroy {
  @Input() visible: boolean = false;
  @Input() header: string = '';
  @Input() modal: boolean = true;
  @Input() closable: boolean = true;
  @Input() closeOnEscape: boolean = true;
  @Input() maximizable: boolean = false;
  @Input() breakpoints: DialogBreakpoints = {};
  @Input() style: { [key: string]: string } = {};
  @Input() width: string = '50vw';
  @Input() height: string = 'auto';
  @Input() position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'center';
  @Input() headerColor: string = 'default';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onShow = new EventEmitter<void>();
  @Output() onHide = new EventEmitter<void>();
  @Output() onMaximize = new EventEmitter<void>();
  @Output() onMinimize = new EventEmitter<void>();

  @ViewChild('dialogElement', { static: false }) dialogElement!: ElementRef;
  @ContentChild('header', { static: false }) headerTemplate?: TemplateRef<any>;
  @ContentChild('footer', { static: false }) footerTemplate?: TemplateRef<any>;

  isMaximized: boolean = false;
  isVisible: boolean = false;
  private originalBodyOverflow: string = '';

  ngOnInit() {
    this.isVisible = this.visible;
  }

  ngOnChanges() {
    this.isVisible = this.visible;
    this.manageBodyScroll();
  }

  ngOnDestroy() {
    this.restoreBodyScroll();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey() {
    if (this.closeOnEscape && this.visible) {
      this.hide();
    }
  }

  show() {
    this.visible = true;
    this.isVisible = true;
    this.manageBodyScroll();
    this.visibleChange.emit(true);
    this.onShow.emit();
  }

  hide() {
    this.visible = false;
    this.isVisible = false;
    this.manageBodyScroll();
    this.visibleChange.emit(false);
    this.onHide.emit();
  }

  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  toggleMaximize() {
    this.isMaximized = !this.isMaximized;
    if (this.isMaximized) {
      this.onMaximize.emit();
    } else {
      this.onMinimize.emit();
    }
  }

  onMaskClick(event: Event) {
    if (this.modal && event.target === event.currentTarget) {
      this.hide();
    }
  }

  getDialogStyles(): { [key: string]: string } {
    const baseStyles = {
      width: this.width,
      height: this.height,
      ...this.style
    };

    if (this.isMaximized) {
      return {
        ...baseStyles,
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        margin: '0',
        borderRadius: '0'
      };
    }

    return baseStyles;
  }

  getResponsiveWidth(): string {
    if (this.isMaximized) {
      return '100vw';
    }

    // Apply breakpoints logic
    const screenWidth = window.innerWidth;
    const sortedBreakpoints = Object.keys(this.breakpoints)
      .map(key => ({ key, value: parseInt(key) }))
      .sort((a, b) => b.value - a.value);

    for (const breakpoint of sortedBreakpoints) {
      if (screenWidth <= breakpoint.value) {
        return this.breakpoints[breakpoint.key];
      }
    }

    return this.width;
  }

  private manageBodyScroll(): void {
    if (this.isVisible) {
      this.disableBodyScroll();
    } else {
      this.restoreBodyScroll();
    }
  }

  private disableBodyScroll(): void {
    if (typeof document !== 'undefined') {
      // Store the original overflow value
      this.originalBodyOverflow = document.body.style.overflow;
      // Disable scrolling
      document.body.style.overflow = 'hidden';
    }
  }

  private restoreBodyScroll(): void {
    if (typeof document !== 'undefined') {
      // Restore the original overflow value
      document.body.style.overflow = this.originalBodyOverflow;
    }
  }
}
