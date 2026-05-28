import type { ReactNode } from 'react'

export interface CheckboxFieldProps {
  id: string
  checked: boolean
  onChange: (value: boolean) => void
  color?: string
  children: ReactNode
}

export function CheckboxField({
  id,
  checked,
  onChange,
  color = 'var(--cyan)',
  children,
}: CheckboxFieldProps) {
  return (
    <label
      htmlFor={id}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', userSelect: 'none' }}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
      />
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          width: 18,
          height: 18,
          marginTop: 2,
          border: `1px solid ${checked ? color : 'var(--border)'}`,
          background: checked ? `color-mix(in srgb, ${color} 12%, transparent)` : 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
          boxShadow: checked ? `0 0 6px ${color}55` : 'none',
          clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
        }}
      >
        {checked && (
          <span style={{ color, fontSize: '0.65rem', fontFamily: "'Space Mono', monospace", lineHeight: 1, fontWeight: 700 }}>
            ✓
          </span>
        )}
      </span>
      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.5 }}>
        {children}
      </span>
    </label>
  )
}

export default CheckboxField
