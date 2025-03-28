export const getAriaLabel = (action: string, context?: string): string => {
  return context ? `${action} ${context}` : action
}

export const getAriaDescribedBy = (elementId: string): string => {
  return `${elementId}-description`
}

export const getAriaErrorMessage = (elementId: string): string => {
  return `${elementId}-error`
}

export const getAriaLiveRegion = (elementId: string): string => {
  return `${elementId}-live`
}

export const focusElement = (elementId: string): void => {
  const element = document.getElementById(elementId)
  if (element) {
    element.focus()
  }
}

export const trapFocus = (element: HTMLElement): void => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstFocusable = focusableElements[0] as HTMLElement
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

  element.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus()
      }
    }
  })
}

export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const liveRegion = document.getElementById('t-t-m-live-region')
  if (liveRegion) {
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.textContent = message
  }
}
