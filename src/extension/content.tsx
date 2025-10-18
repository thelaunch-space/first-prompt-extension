// Content script that injects into bolt.new pages
// Implements smart edge-docking button UX:
// - Full mode (bottom-right) when page is empty
// - Compact mode (left-edge tab) after user enters prompt
// - Auto-hides to left edge, slides out on hover
// - No dragging functionality for simplified UX

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ModalContainer } from './components/ModalContainer';
import '../index.css';

type ButtonMode = 'full' | 'compact';

class BoltPromptGenerator {
  private button: HTMLButtonElement | null = null;
  private modalRoot: HTMLDivElement | null = null;
  private reactRoot: any = null;
  private buttonMode: ButtonMode = 'full';
  private observer: MutationObserver | null = null;

  private readonly STORAGE_KEY_MODE = 'bolt_prompt_generator_mode';

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

  private setupPromptObserver() {
    this.observer = new MutationObserver(() => {
      this.checkForPromptInput();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.checkForPromptInput();
    this.checkUrlForProject();
  }

  private checkForPromptInput() {
    if (this.hasActiveProject()) {
      if (this.buttonMode === 'full') {
        this.transformToCompact();
      }
      return;
    }

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

        if (!anyHasContent && !this.hasActiveProject()) {
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

    this.button.style.padding = '12px 10px';
    this.button.style.borderRadius = '0 8px 8px 0';
    this.button.style.width = '52px';
    this.button.style.height = '56px';
    this.button.style.justifyContent = 'center';
    this.button.style.cursor = 'pointer';
    this.button.style.left = '-40px';
    this.button.style.top = '50%';
    this.button.style.transform = 'translateY(-50%)';
    this.button.style.bottom = 'auto';
    this.button.style.right = 'auto';
    this.button.style.transition = 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease';

    const img = this.button.querySelector('img');
    if (img) {
      (img as HTMLImageElement).style.transform = 'scale(1.1)';
    }

    this.enableEdgeHover();
  }

  private transformToFull() {
    if (!this.button || this.buttonMode === 'full') return;

    this.buttonMode = 'full';
    this.saveMode('full');

    this.disableEdgeHover();

    const span = this.button.querySelector('span');
    if (span) {
      span.style.opacity = '1';
      span.style.width = 'auto';
      span.style.overflow = 'visible';
    }

    const img = this.button.querySelector('img');
    if (img) {
      (img as HTMLImageElement).style.transform = 'scale(1)';
    }

    this.button.style.padding = '12px 20px';
    this.button.style.borderRadius = '10px';
    this.button.style.width = 'auto';
    this.button.style.height = 'auto';
    this.button.style.bottom = '24px';
    this.button.style.right = '24px';
    this.button.style.top = 'auto';
    this.button.style.left = 'auto';
    this.button.style.transform = 'none';
    this.button.style.cursor = 'pointer';
    this.button.style.transition = 'all 0.3s ease';
  }

  private enableEdgeHover() {
    if (!this.button) return;

    this.button.addEventListener('mouseenter', this.handleEdgeHover);
    this.button.addEventListener('mouseleave', this.handleEdgeLeave);
  }

  private disableEdgeHover() {
    if (!this.button) return;

    this.button.removeEventListener('mouseenter', this.handleEdgeHover);
    this.button.removeEventListener('mouseleave', this.handleEdgeLeave);
  }

  private handleEdgeHover = () => {
    if (!this.button || this.buttonMode !== 'compact') return;
    this.button.style.left = '0px';
    this.button.style.boxShadow = '0 8px 28px rgba(0, 0, 0, 0.35)';
  };

  private handleEdgeLeave = () => {
    if (!this.button || this.buttonMode !== 'compact') return;
    this.button.style.left = '-40px';
    this.button.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.25)';
  };

  private hasActiveProject(): boolean {
    const url = window.location.href;
    return url.includes('bolt.new/~/');
  }

  private checkUrlForProject() {
    if (this.hasActiveProject() && this.buttonMode === 'full') {
      this.transformToCompact();
    } else if (!this.hasActiveProject() && this.buttonMode === 'compact') {
      const textarea = document.querySelector('textarea');
      if (textarea instanceof HTMLTextAreaElement && !textarea.value.trim()) {
        this.transformToFull();
      }
    }
  }


  private injectButton() {
    if (this.button) return;

    this.button = document.createElement('button');
    this.button.id = 'bolt-prompt-generator-btn';
    this.button.title = 'Generate Prompt';

    // Get the custom icon URL from the extension
    const iconUrl = chrome.runtime.getURL('icon128.png');

    this.button.innerHTML = `
      <img src="${iconUrl}" width="44" height="44" style="transition: transform 0.3s ease; flex-shrink: 0;" alt="Bolt Prompt Generator" />
      <span style="transition: opacity 0.3s ease, width 0.3s ease; font-weight: 600; letter-spacing: -0.01em;">
        Generate First <span style="background: linear-gradient(135deg, #ffffff 0%, #A78BFA 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700;">Prompt</span>
      </span>
    `;

    const isCompact = this.buttonMode === 'compact';

    this.button.style.cssText = `
      position: fixed;
      ${isCompact ? 'left: -40px; top: 50%; transform: translateY(-50%);' : 'bottom: 24px; right: 24px;'}
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: ${isCompact ? '12px 10px' : '12px 20px'};
      background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
      color: white;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 600;
      border: none;
      border-radius: ${isCompact ? '0 8px 8px 0' : '10px'};
      cursor: pointer;
      box-shadow: ${isCompact ? '0 4px 16px rgba(0, 0, 0, 0.25)' : '0 10px 30px rgba(0, 0, 0, 0.3)'};
      transition: ${isCompact ? 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease' : 'all 0.3s ease'};
      ${isCompact ? 'width: 52px; height: 56px;' : ''}
    `;

    if (isCompact) {
      const span = this.button.querySelector('span');
      if (span instanceof HTMLElement) {
        span.style.opacity = '0';
        span.style.width = '0';
        span.style.overflow = 'hidden';
      }
      const img = this.button.querySelector('img');
      if (img instanceof HTMLImageElement) {
        img.style.transform = 'scale(1.1)';
      }
      this.enableEdgeHover();
      this.button.addEventListener('click', () => {
        this.openModal();
      });
    } else {
      this.button.addEventListener('mouseenter', () => {
        if (this.button && this.buttonMode === 'full') {
          this.button.style.transform = 'translateY(-2px)';
          this.button.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.4)';
        }
      });

      this.button.addEventListener('mouseleave', () => {
        if (this.button && this.buttonMode === 'full') {
          this.button.style.transform = 'translateY(0)';
          this.button.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
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

window.addEventListener('pushstate', () => {
  setTimeout(() => {
    const generator = new BoltPromptGenerator();
    generator.init();
  }, 100);
});

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => {
      generator.init();
    }, 100);
  }
}).observe(document, {subtree: true, childList: true});
