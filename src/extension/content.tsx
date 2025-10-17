// Content script that injects into bolt.new pages

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ModalContainer } from './components/ModalContainer';
import '../index.css';

type ButtonMode = 'full' | 'compact';

interface ButtonPosition {
  x: number;
  y: number;
}

class BoltPromptGenerator {
  private button: HTMLButtonElement | null = null;
  private modalRoot: HTMLDivElement | null = null;
  private reactRoot: any = null;
  private buttonMode: ButtonMode = 'full';
  private observer: MutationObserver | null = null;
  private isDragging: boolean = false;
  private dragStartPos: { x: number; y: number } = { x: 0, y: 0 };
  private buttonStartPos: { x: number; y: number } = { x: 0, y: 0 };
  private hasMoved: boolean = false;

  private readonly STORAGE_KEY_MODE = 'bolt_prompt_generator_mode';
  private readonly STORAGE_KEY_POSITION = 'bolt_prompt_generator_position';

  init() {
    if (this.isValidBoltPage()) {
      this.loadState();
      this.injectButton();
      this.setupPromptObserver();
    }
  }

  private isValidBoltPage(): boolean {
    const url = window.location.href;
    return url.includes('bolt.new');
  }

  private loadState() {
    const savedMode = localStorage.getItem(this.STORAGE_KEY_MODE) as ButtonMode;
    if (savedMode === 'compact') {
      this.buttonMode = 'compact';
    }
  }

  private saveMode(mode: ButtonMode) {
    localStorage.setItem(this.STORAGE_KEY_MODE, mode);
  }

  private savePosition(position: ButtonPosition) {
    localStorage.setItem(this.STORAGE_KEY_POSITION, JSON.stringify(position));
  }

  private loadPosition(): ButtonPosition | null {
    const saved = localStorage.getItem(this.STORAGE_KEY_POSITION);
    return saved ? JSON.parse(saved) : null;
  }

  private setupPromptObserver() {
    this.observer = new MutationObserver(() => {
      this.checkForPromptInput();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.checkForPromptInput();
  }

  private checkForPromptInput() {
    const textarea = document.querySelector('textarea[placeholder*="prompt" i], textarea[placeholder*="describe" i], textarea');

    if (textarea instanceof HTMLTextAreaElement) {
      const hasContent = textarea.value.trim().length > 0;

      if (hasContent && this.buttonMode === 'full') {
        this.transformToCompact();
      } else if (!hasContent && this.buttonMode === 'compact') {
        const allTextareas = document.querySelectorAll('textarea');
        const anyHasContent = Array.from(allTextareas).some(
          (ta) => (ta as HTMLTextAreaElement).value.trim().length > 0
        );

        if (!anyHasContent) {
          this.transformToFull();
        }
      }
    }
  }

  private transformToCompact() {
    if (!this.button || this.buttonMode === 'compact') return;

    this.buttonMode = 'compact';
    this.saveMode('compact');

    const span = this.button.querySelector('span');
    if (span) {
      span.style.opacity = '0';
      span.style.width = '0';
      span.style.overflow = 'hidden';
    }

    this.button.style.padding = '16px';
    this.button.style.borderRadius = '50%';
    this.button.style.width = '56px';
    this.button.style.height = '56px';
    this.button.style.justifyContent = 'center';
    this.button.style.cursor = 'move';

    const savedPosition = this.loadPosition();
    if (savedPosition) {
      this.button.style.bottom = 'auto';
      this.button.style.right = 'auto';
      this.button.style.top = `${savedPosition.y}px`;
      this.button.style.left = `${savedPosition.x}px`;
    }

    this.enableDragging();
  }

  private transformToFull() {
    if (!this.button || this.buttonMode === 'full') return;

    this.buttonMode = 'full';
    this.saveMode('full');
    localStorage.removeItem(this.STORAGE_KEY_POSITION);

    this.disableDragging();

    const span = this.button.querySelector('span');
    if (span) {
      span.style.opacity = '1';
      span.style.width = 'auto';
      span.style.overflow = 'visible';
    }

    this.button.style.padding = '12px 24px';
    this.button.style.borderRadius = '12px';
    this.button.style.width = 'auto';
    this.button.style.height = 'auto';
    this.button.style.bottom = '24px';
    this.button.style.right = '24px';
    this.button.style.top = 'auto';
    this.button.style.left = 'auto';
    this.button.style.cursor = 'pointer';
  }

  private enableDragging() {
    if (!this.button) return;

    this.button.addEventListener('mousedown', this.handleMouseDown);
    this.button.addEventListener('touchstart', this.handleTouchStart, { passive: false });
  }

  private disableDragging() {
    if (!this.button) return;

    this.button.removeEventListener('mousedown', this.handleMouseDown);
    this.button.removeEventListener('touchstart', this.handleTouchStart);
  }

  private handleMouseDown = (e: MouseEvent) => {
    if (!this.button || this.buttonMode !== 'compact') return;

    e.preventDefault();
    this.isDragging = true;
    this.hasMoved = false;

    const rect = this.button.getBoundingClientRect();
    this.dragStartPos = { x: e.clientX, y: e.clientY };
    this.buttonStartPos = { x: rect.left, y: rect.top };

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);

    if (this.button) {
      this.button.style.transform = 'scale(1.1)';
      this.button.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.5)';
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDragging || !this.button) return;

    const deltaX = e.clientX - this.dragStartPos.x;
    const deltaY = e.clientY - this.dragStartPos.y;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      this.hasMoved = true;
    }

    const newX = this.buttonStartPos.x + deltaX;
    const newY = this.buttonStartPos.y + deltaY;

    const maxX = window.innerWidth - 56;
    const maxY = window.innerHeight - 56;

    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    this.button.style.left = `${constrainedX}px`;
    this.button.style.top = `${constrainedY}px`;
  };

  private handleMouseUp = () => {
    if (!this.button) return;

    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);

    if (this.button) {
      this.button.style.transform = 'scale(1)';
      this.button.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
    }

    if (this.isDragging && this.hasMoved) {
      const rect = this.button.getBoundingClientRect();
      this.savePosition({ x: rect.left, y: rect.top });
    } else if (this.isDragging && !this.hasMoved) {
      this.openModal();
    }

    this.isDragging = false;
    this.hasMoved = false;
  };

  private handleTouchStart = (e: TouchEvent) => {
    if (!this.button || this.buttonMode !== 'compact') return;

    e.preventDefault();
    const touch = e.touches[0];
    this.isDragging = true;
    this.hasMoved = false;

    const rect = this.button.getBoundingClientRect();
    this.dragStartPos = { x: touch.clientX, y: touch.clientY };
    this.buttonStartPos = { x: rect.left, y: rect.top };

    document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd);

    if (this.button) {
      this.button.style.transform = 'scale(1.1)';
      this.button.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.5)';
    }
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (!this.isDragging || !this.button) return;

    e.preventDefault();
    const touch = e.touches[0];

    const deltaX = touch.clientX - this.dragStartPos.x;
    const deltaY = touch.clientY - this.dragStartPos.y;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      this.hasMoved = true;
    }

    const newX = this.buttonStartPos.x + deltaX;
    const newY = this.buttonStartPos.y + deltaY;

    const maxX = window.innerWidth - 56;
    const maxY = window.innerHeight - 56;

    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    this.button.style.left = `${constrainedX}px`;
    this.button.style.top = `${constrainedY}px`;
  };

  private handleTouchEnd = () => {
    if (!this.button) return;

    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);

    if (this.button) {
      this.button.style.transform = 'scale(1)';
      this.button.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
    }

    if (this.isDragging && this.hasMoved) {
      const rect = this.button.getBoundingClientRect();
      this.savePosition({ x: rect.left, y: rect.top });
    } else if (this.isDragging && !this.hasMoved) {
      this.openModal();
    }

    this.isDragging = false;
    this.hasMoved = false;
  };

  private injectButton() {
    if (this.button) return;

    this.button = document.createElement('button');
    this.button.id = 'bolt-prompt-generator-btn';
    this.button.title = 'Generate Prompt';
    this.button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      <span style="transition: opacity 0.3s ease, width 0.3s ease; font-weight: 600; letter-spacing: -0.01em;">
        Generate First <span style="background: linear-gradient(135deg, #ffffff 0%, #60A5FA 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700;">Prompt</span>
      </span>
    `;

    const isCompact = this.buttonMode === 'compact';
    const savedPosition = isCompact ? this.loadPosition() : null;

    this.button.style.cssText = `
      position: fixed;
      ${savedPosition ? `top: ${savedPosition.y}px; left: ${savedPosition.x}px;` : 'bottom: 24px; right: 24px;'}
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: ${isCompact ? 'center' : 'flex-start'};
      gap: 8px;
      padding: ${isCompact ? '16px' : '12px 24px'};
      background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
      color: white;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 600;
      border: none;
      border-radius: ${isCompact ? '50%' : '12px'};
      cursor: ${isCompact ? 'move' : 'pointer'};
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
      ${isCompact ? 'width: 56px; height: 56px;' : ''}
    `;

    if (isCompact) {
      const span = this.button.querySelector('span');
      if (span instanceof HTMLElement) {
        span.style.opacity = '0';
        span.style.width = '0';
        span.style.overflow = 'hidden';
      }
      this.enableDragging();
    } else {
      this.button.addEventListener('mouseenter', () => {
        if (this.button && this.buttonMode === 'full') {
          this.button.style.transform = 'translateY(-2px)';
          this.button.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
        }
      });

      this.button.addEventListener('mouseleave', () => {
        if (this.button && this.buttonMode === 'full') {
          this.button.style.transform = 'translateY(0)';
          this.button.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
        }
      });

      this.button.addEventListener('click', () => {
        this.openModal();
      });
    }

    document.body.appendChild(this.button);
  }

  private openModal() {
    if (this.modalRoot) return;

    this.modalRoot = document.createElement('div');
    this.modalRoot.id = 'bolt-prompt-generator-modal';
    document.body.appendChild(this.modalRoot);

    this.reactRoot = ReactDOM.createRoot(this.modalRoot);
    this.reactRoot.render(
      <React.StrictMode>
        <ModalContainer onClose={() => this.closeModal()} />
      </React.StrictMode>
    );
  }

  private closeModal() {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }

    if (this.modalRoot) {
      this.modalRoot.remove();
      this.modalRoot = null;
    }
  }
}

const generator = new BoltPromptGenerator();
generator.init();

window.addEventListener('popstate', () => {
  generator.init();
});
