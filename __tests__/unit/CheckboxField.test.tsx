/**
 * @jest-environment jsdom
 */
// Rodar: npm test __tests__/unit/CheckboxField.test.tsx

import type { ReactElement } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { CheckboxField } from '@/components/ui/CheckboxField'

// Necessário para que o React 18 aceite act() em ambiente de teste
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

// ── Setup ──────────────────────────────────────────────────────────────────────

let container: HTMLDivElement
let root: ReturnType<typeof createRoot>

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

function render(ui: ReactElement) {
  act(() => root.render(ui))
}

// ── Helpers DOM ────────────────────────────────────────────────────────────────

function getInput() {
  return container.querySelector('input[type="checkbox"]') as HTMLInputElement
}

function getVisualBox() {
  // Primeiro <span> dentro do <label> — o box visual customizado
  return container.querySelector('label > span[aria-hidden]') as HTMLElement
}

function getCheckmark() {
  // <span> interno ao box — exibido apenas quando checked=true
  return container.querySelector('label > span[aria-hidden] > span') as HTMLElement | null
}

// ── Estrutura ──────────────────────────────────────────────────────────────────

describe('CheckboxField — estrutura', () => {
  it('renderiza um input nativo do tipo checkbox', () => {
    render(<CheckboxField id="x" checked={false} onChange={() => {}}>Label</CheckboxField>)
    expect(getInput()).not.toBeNull()
    expect(getInput().type).toBe('checkbox')
  })

  it('aplica o id passado ao input nativo', () => {
    render(<CheckboxField id="meu-id" checked={false} onChange={() => {}}>Label</CheckboxField>)
    expect(getInput().id).toBe('meu-id')
  })

  it('renderiza o texto dos children', () => {
    render(<CheckboxField id="x" checked={false} onChange={() => {}}>Texto de label</CheckboxField>)
    expect(container.textContent).toContain('Texto de label')
  })

  it('o input nativo é oculto visualmente', () => {
    render(<CheckboxField id="x" checked={false} onChange={() => {}}>Label</CheckboxField>)
    const input = getInput()
    // opacity fica '0' (unitless); width/height ficam '0px' (com unidade)
    expect(input.style.opacity).toBe('0')
    expect(input.style.width).toBe('0px')
    expect(input.style.height).toBe('0px')
  })
})

// ── Prop checked ───────────────────────────────────────────────────────────────

describe('CheckboxField — prop checked', () => {
  it('input nativo reflete checked=true', () => {
    render(<CheckboxField id="x" checked={true} onChange={() => {}}>Label</CheckboxField>)
    expect(getInput().checked).toBe(true)
  })

  it('input nativo reflete checked=false', () => {
    render(<CheckboxField id="x" checked={false} onChange={() => {}}>Label</CheckboxField>)
    expect(getInput().checked).toBe(false)
  })

  it('exibe o símbolo ✓ quando checked=true', () => {
    render(<CheckboxField id="x" checked={true} onChange={() => {}}>Label</CheckboxField>)
    expect(container.textContent).toContain('✓')
    expect(getCheckmark()).not.toBeNull()
  })

  it('não exibe o símbolo ✓ quando checked=false', () => {
    render(<CheckboxField id="x" checked={false} onChange={() => {}}>Label</CheckboxField>)
    expect(container.textContent).not.toContain('✓')
    expect(getCheckmark()).toBeNull()
  })
})

// ── Prop color ─────────────────────────────────────────────────────────────────
//
// jsdom/cssstyle rejeita CSS custom properties (var()) em propriedades com
// validação de cor (color, border, borderColor). A prop `boxShadow` aceita
// qualquer string, por isso é usada como vetor de verificação da color prop.

describe('CheckboxField — prop color', () => {
  it('o box-shadow usa a color customizada quando marcado', () => {
    render(<CheckboxField id="x" checked={true} onChange={() => {}} color="var(--magenta)">Label</CheckboxField>)
    expect(getVisualBox().style.boxShadow).toContain('var(--magenta)')
  })

  it('o box-shadow usa var(--cyan) por padrão quando marcado sem prop color', () => {
    render(<CheckboxField id="x" checked={true} onChange={() => {}}>Label</CheckboxField>)
    expect(getVisualBox().style.boxShadow).toContain('var(--cyan)')
  })

  it('o box-shadow muda quando colors diferentes são fornecidas', () => {
    render(<CheckboxField id="x" checked={true} onChange={() => {}} color="var(--magenta)">Label</CheckboxField>)
    const shadowMagenta = getVisualBox().style.boxShadow

    render(<CheckboxField id="x" checked={true} onChange={() => {}} color="var(--cyan)">Label</CheckboxField>)
    const shadowCyan = getVisualBox().style.boxShadow

    expect(shadowMagenta).not.toBe(shadowCyan)
  })
})

// ── Estilo visual do box ───────────────────────────────────────────────────────

describe('CheckboxField — estilo do box visual', () => {
  it('aplica box-shadow quando marcado', () => {
    render(<CheckboxField id="x" checked={true} onChange={() => {}}>Label</CheckboxField>)
    const shadow = getVisualBox().style.boxShadow
    expect(shadow).toBeTruthy()
    expect(shadow).not.toBe('none')
  })

  it('remove box-shadow quando desmarcado', () => {
    render(<CheckboxField id="x" checked={false} onChange={() => {}}>Label</CheckboxField>)
    expect(getVisualBox().style.boxShadow).toBe('none')
  })
})

// ── onChange ───────────────────────────────────────────────────────────────────

describe('CheckboxField — onChange', () => {
  it('chama onChange com true ao marcar o checkbox', () => {
    const handler = jest.fn()
    render(<CheckboxField id="x" checked={false} onChange={handler}>Label</CheckboxField>)
    act(() => {
      // .click() em jsdom: alterna checked e dispara click + change nativos
      getInput().click()
    })
    expect(handler).toHaveBeenCalledWith(true)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('chama onChange com false ao desmarcar o checkbox', () => {
    const handler = jest.fn()
    render(<CheckboxField id="x" checked={true} onChange={handler}>Label</CheckboxField>)
    act(() => {
      getInput().click()
    })
    expect(handler).toHaveBeenCalledWith(false)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('não chama onChange se nenhuma interação ocorrer', () => {
    const handler = jest.fn()
    render(<CheckboxField id="x" checked={false} onChange={handler}>Label</CheckboxField>)
    expect(handler).not.toHaveBeenCalled()
  })
})
