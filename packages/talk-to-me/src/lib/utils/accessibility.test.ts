import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getAriaLabel,
  getAriaDescribedBy,
  getAriaErrorMessage,
  getAriaLiveRegion,
  focusElement,
  trapFocus,
  announceToScreenReader
} from './accessibility'

describe('accessibility utils', () => {
  describe('getAriaLabel', () => {
    it('should return action without context', () => {
      expect(getAriaLabel('Submit')).toBe('Submit')
    })

    it('should return action with context', () => {
      expect(getAriaLabel('Submit', 'comment')).toBe('Submit comment')
    })
  })

  describe('getAriaDescribedBy', () => {
    it('should return correct ID', () => {
      expect(getAriaDescribedBy('comment-input')).toBe('comment-input-description')
    })
  })

  describe('getAriaErrorMessage', () => {
    it('should return correct ID', () => {
      expect(getAriaErrorMessage('comment-input')).toBe('comment-input-error')
    })
  })

  describe('getAriaLiveRegion', () => {
    it('should return correct ID', () => {
      expect(getAriaLiveRegion('comment-list')).toBe('comment-list-live')
    })
  })

  describe('focusElement', () => {
    beforeEach(() => {
      document.body.innerHTML = '<button id="test-button">Test</button>'
    })

    afterEach(() => {
      document.body.innerHTML = ''
    })

    it('should focus element when it exists', () => {
      const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus')
      focusElement('test-button')
      expect(focusSpy).toHaveBeenCalled()
    })

    it('should not throw when element does not exist', () => {
      expect(() => focusElement('non-existent')).not.toThrow()
    })
  })

  describe('trapFocus', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="modal">
          <button id="first">First</button>
          <input id="second" />
          <a href="#" id="last">Last</a>
        </div>
      `
    })

    afterEach(() => {
      document.body.innerHTML = ''
    })

    it('should trap focus within element', () => {
      const modal = document.getElementById('modal') as HTMLElement
      const firstButton = document.getElementById('first') as HTMLElement
      const lastLink = document.getElementById('last') as HTMLElement

      trapFocus(modal)
      firstButton.focus()

      // Simulate Tab key
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true })
      modal.dispatchEvent(tabEvent)

      expect(document.activeElement).toBe(lastLink)
    })
  })

  describe('announceToScreenReader', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="t-t-m-live-region"></div>'
    })

    afterEach(() => {
      document.body.innerHTML = ''
    })

    it('should update live region with message', () => {
      announceToScreenReader('Test message')
      const liveRegion = document.getElementById('t-t-m-live-region')
      expect(liveRegion?.textContent).toBe('Test message')
    })

    it('should set correct priority', () => {
      announceToScreenReader('Test message', 'assertive')
      const liveRegion = document.getElementById('t-t-m-live-region')
      expect(liveRegion?.getAttribute('aria-live')).toBe('assertive')
    })

    it('should not throw when live region does not exist', () => {
      document.body.innerHTML = ''
      expect(() => announceToScreenReader('Test message')).not.toThrow()
    })
  })
})
