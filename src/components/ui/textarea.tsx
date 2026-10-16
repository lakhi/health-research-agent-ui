import * as React from 'react'

import { cn } from '@/lib/utils'

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const MIN_HEIGHT = 40
const MAX_HEIGHT = 96

/**
 * The height the placeholder needs as text. Chrome counts a placeholder in scrollHeight,
 * but nothing guarantees that elsewhere (Safari), so it is measured as the value — of a
 * throwaway copy, since writing into the real field would be a programmatic value
 * change, which some browsers answer by wiping the user's undo history. The copy shares
 * the field's classes and parent (so its font) and is gone again before paint.
 */
const placeholderHeight = (textarea: HTMLTextAreaElement) => {
  const copy = textarea.cloneNode() as HTMLTextAreaElement
  copy.removeAttribute('id')
  copy.setAttribute('aria-hidden', 'true')
  copy.tabIndex = -1
  Object.assign(copy.style, {
    position: 'absolute',
    visibility: 'hidden',
    pointerEvents: 'none',
    width: `${textarea.offsetWidth}px`,
    height: `${MIN_HEIGHT}px`
  })
  copy.value = textarea.placeholder
  textarea.after(copy)
  const { scrollHeight } = copy
  copy.remove()
  return scrollHeight
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, onChange, placeholder, ...props }, forwardedRef) => {
    const [showScroll, setShowScroll] = React.useState(false)
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      let scrollHeight: number
      if (!textarea.value && textarea.placeholder) {
        // While empty, fit the placeholder so a long one isn't cut off on phones
        scrollHeight = placeholderHeight(textarea)
      } else {
        textarea.style.height = `${MIN_HEIGHT}px`
        scrollHeight = textarea.scrollHeight
      }
      const newHeight = Math.min(Math.max(scrollHeight, MIN_HEIGHT), MAX_HEIGHT)
      textarea.style.height = `${newHeight}px`
      setShowScroll(scrollHeight > MAX_HEIGHT)
    }, [])

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const cursorPosition = e.target.selectionStart
        onChange?.(e)
        requestAnimationFrame(() => {
          adjustHeight()
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(
              cursorPosition,
              cursorPosition
            )
          }
        })
      },
      [onChange, adjustHeight]
    )

    const handleRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        const ref = forwardedRef as
          | React.MutableRefObject<HTMLTextAreaElement | null>
          | ((instance: HTMLTextAreaElement | null) => void)
          | null

        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }

        textareaRef.current = node
      },
      [forwardedRef]
    )

    React.useEffect(() => {
      if (textareaRef.current) {
        adjustHeight()
      }
    }, [value, placeholder, adjustHeight])

    // The same text needs more lines in a narrower box (phone rotation, window resize),
    // and a late web font can rewrap it too
    React.useEffect(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      let width = textarea.offsetWidth
      let frame = 0
      const observer = new ResizeObserver(() => {
        // Only width changes matter; the height is ours, and reacting to it would loop
        if (textarea.offsetWidth === width) return
        width = textarea.offsetWidth
        // Next frame: resizing the observed box inside its own callback makes the
        // browser report a "ResizeObserver loop" error
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(adjustHeight)
      })
      observer.observe(textarea)
      document.fonts?.ready.then(adjustHeight)
      return () => {
        observer.disconnect()
        cancelAnimationFrame(frame)
      }
    }, [adjustHeight])

    return (
      <textarea
        className={cn(
          'w-full resize-none bg-transparent shadow-sm',
          'rounded-xl border border-border',
          'px-3 py-2',
          'text-sm leading-5',
          'focus-visible:ring-0.5 focus-visible:ring-ring focus-visible:border-primary/50 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          showScroll ? 'overflow-y-auto' : 'overflow-hidden',
          className
        )}
        style={{
          minHeight: `${MIN_HEIGHT}px`,
          height: `${MIN_HEIGHT}px`,
          maxHeight: `${MAX_HEIGHT}px`
        }}
        ref={handleRef}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

TextArea.displayName = 'TextArea'

export type { TextareaProps }
export { TextArea }
