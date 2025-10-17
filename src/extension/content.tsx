// Content script that injects into bolt.new pages

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ModalContainer } from './components/ModalContainer';
import '../index.css';

class BoltPromptGenerator {
  private button: HTMLButtonElement | null = null;
  private modalRoot: HTMLDivElement | null = null;
  private reactRoot: any = null;

  init() {
    if (this.isValidBoltPage()) {
      this.injectButton();
    }
  }

  private isValidBoltPage(): boolean {
    const url = window.location.href;
    return url.includes('bolt.new');
  }

  private injectButton() {
    if (this.button) return;

    this.button = document.createElement('button');
    this.button.id = 'bolt-prompt-generator-btn';
    this.button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      <span>Generate First Prompt</span>
    `;

    this.button.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999998;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
    `;

    this.button.addEventListener('mouseenter', () => {
      if (this.button) {
        this.button.style.transform = 'translateY(-2px)';
        this.button.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
      }
    });

    this.button.addEventListener('mouseleave', () => {
      if (this.button) {
        this.button.style.transform = 'translateY(0)';
        this.button.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
      }
    });

    this.button.addEventListener('click', () => {
      this.openModal();
    });

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
