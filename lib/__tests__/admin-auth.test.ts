/**
 * lib/__tests__/admin-auth.test.ts
 * Testes unitários para utilitários de autenticação admin
 *
 * Rodar: npm test lib/__tests__/admin-auth.test.ts
 */

// next/headers só existe em ambiente Next.js server — mocked aqui
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

import {
  tokenSeguroIgual,
  rateLimitOk,
  getIp,
  logAuditoria,
  headersSeguranca,
  headersSegurancaEmbeddable,
  VALIDACOES_ENV,
  COOKIE_NAME,
  COOKIE_MAX_AGE,
} from '@/lib/admin-auth'
import { NextRequest } from 'next/server'

// ── tokenSeguroIgual ──────────────────────────────────────────────────────────

describe('tokenSeguroIgual', () => {
  it('retorna true para strings idênticas', () => {
    expect(tokenSeguroIgual('abcdef', 'abcdef')).toBe(true)
  })

  it('retorna false para strings diferentes', () => {
    expect(tokenSeguroIgual('abcdef', 'abcdefg')).toBe(false)
  })

  it('é case-sensitive', () => {
    expect(tokenSeguroIgual('Token', 'token')).toBe(false)
  })

  it('retorna false para string vazia vs não vazia', () => {
    expect(tokenSeguroIgual('', 'algo')).toBe(false)
  })

  it('retorna true para duas strings vazias', () => {
    expect(tokenSeguroIgual('', '')).toBe(true)
  })

  it('funciona com tokens longos (simulando tokens de produção)', () => {
    const token = 'x'.repeat(64)
    expect(tokenSeguroIgual(token, token)).toBe(true)
    expect(tokenSeguroIgual(token, token.slice(0, -1) + 'y')).toBe(false)
  })

  it('funciona com caracteres especiais e unicode', () => {
    const t = 'abc!@#$%^&*()_+ção🔮'
    expect(tokenSeguroIgual(t, t)).toBe(true)
    expect(tokenSeguroIgual(t, t + ' ')).toBe(false)
  })
})

// ── rateLimitOk ───────────────────────────────────────────────────────────────

describe('rateLimitOk', () => {
  it('permite a primeira requisição de um IP novo', () => {
    expect(rateLimitOk('192.168.0.1')).toBe(true)
  })

  it('permite até 10 requisições no mesmo período', () => {
    const ip = '10.0.0.10'
    // Usa IP único para não colidir com outros testes
    for (let i = 0; i < 10; i++) {
      expect(rateLimitOk(ip)).toBe(true)
    }
  })

  it('bloqueia a 11ª requisição', () => {
    const ip = '10.0.0.11'
    for (let i = 0; i < 10; i++) rateLimitOk(ip)
    expect(rateLimitOk(ip)).toBe(false)
  })

  it('bloqueia requisições subsequentes após o limite', () => {
    const ip = '10.0.0.12'
    for (let i = 0; i < 10; i++) rateLimitOk(ip)
    expect(rateLimitOk(ip)).toBe(false)
    expect(rateLimitOk(ip)).toBe(false)
  })

  it('IPs diferentes têm janelas independentes', () => {
    const ip1 = '172.16.0.1'
    const ip2 = '172.16.0.2'
    for (let i = 0; i < 10; i++) rateLimitOk(ip1)
    expect(rateLimitOk(ip1)).toBe(false) // ip1 bloqueado
    expect(rateLimitOk(ip2)).toBe(true)  // ip2 ainda livre
  })
})

// ── getIp ─────────────────────────────────────────────────────────────────────

describe('getIp', () => {
  function makeReq(headers: Record<string, string>): NextRequest {
    return new NextRequest('http://localhost/test', { headers })
  }

  it('extrai IP do header x-forwarded-for', () => {
    const req = makeReq({ 'x-forwarded-for': '203.0.113.5' })
    expect(getIp(req)).toBe('203.0.113.5')
  })

  it('pega apenas o primeiro IP de x-forwarded-for com múltiplos valores', () => {
    const req = makeReq({ 'x-forwarded-for': '203.0.113.5, 10.0.0.1, 192.168.1.1' })
    expect(getIp(req)).toBe('203.0.113.5')
  })

  it('remove espaços do IP extraído', () => {
    const req = makeReq({ 'x-forwarded-for': '  203.0.113.5  ' })
    expect(getIp(req)).toBe('203.0.113.5')
  })

  it('cai para x-real-ip quando x-forwarded-for não existe', () => {
    const req = makeReq({ 'x-real-ip': '203.0.113.10' })
    expect(getIp(req)).toBe('203.0.113.10')
  })

  it('retorna "unknown" quando nenhum header de IP existe', () => {
    const req = makeReq({})
    expect(getIp(req)).toBe('unknown')
  })

  it('x-forwarded-for tem prioridade sobre x-real-ip', () => {
    const req = makeReq({
      'x-forwarded-for': '1.2.3.4',
      'x-real-ip': '5.6.7.8',
    })
    expect(getIp(req)).toBe('1.2.3.4')
  })
})

// ── logAuditoria ──────────────────────────────────────────────────────────────

describe('logAuditoria', () => {
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  it('chama console.log com prefixo [ADMIN AUDIT]', () => {
    logAuditoria('login', '1.2.3.4')
    expect(consoleSpy).toHaveBeenCalledTimes(1)
    expect(consoleSpy.mock.calls[0][0]).toBe('[ADMIN AUDIT]')
  })

  it('inclui o evento no log', () => {
    logAuditoria('login_falhou', '1.2.3.4')
    const json = JSON.parse(consoleSpy.mock.calls[0][1])
    expect(json.evento).toBe('login_falhou')
  })

  it('inclui o IP no log', () => {
    logAuditoria('logout', '10.10.10.10')
    const json = JSON.parse(consoleSpy.mock.calls[0][1])
    expect(json.ip).toBe('10.10.10.10')
  })

  it('inclui detalhe quando informado', () => {
    logAuditoria('acesso', '1.1.1.1', 'rota /admin/healthcheck')
    const json = JSON.parse(consoleSpy.mock.calls[0][1])
    expect(json.detalhe).toBe('rota /admin/healthcheck')
  })

  it('detalhe é string vazia quando não informado', () => {
    logAuditoria('acesso', '1.1.1.1')
    const json = JSON.parse(consoleSpy.mock.calls[0][1])
    expect(json.detalhe).toBe('')
  })

  it('inclui timestamp no log', () => {
    logAuditoria('qualquer', '0.0.0.0')
    const json = JSON.parse(consoleSpy.mock.calls[0][1])
    expect(json.ts).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('não inclui informações sensíveis no log (ex: token)', () => {
    logAuditoria('login', '1.2.3.4', 'detalhe seguro')
    const raw: string = consoleSpy.mock.calls[0][1]
    expect(raw).not.toContain('token')
    expect(raw).not.toContain('password')
    expect(raw).not.toContain('secret')
  })
})

// ── headersSeguranca ──────────────────────────────────────────────────────────

describe('headersSeguranca', () => {
  it('retorna objeto com headers de segurança', () => {
    const h = headersSeguranca()
    expect(h['Cache-Control']).toBe('no-store, no-cache, must-revalidate')
    expect(h['Pragma']).toBe('no-cache')
    expect(h['X-Content-Type-Options']).toBe('nosniff')
    expect(h['X-Frame-Options']).toBe('DENY')
  })

  it('tem exatamente 4 headers', () => {
    expect(Object.keys(headersSeguranca())).toHaveLength(4)
  })

  it('retorna novo objeto a cada chamada', () => {
    const h1 = headersSeguranca()
    const h2 = headersSeguranca()
    expect(h1).not.toBe(h2)
    expect(h1).toEqual(h2)
  })
})

describe('headersSegurancaEmbeddable', () => {
  it('não inclui X-Frame-Options', () => {
    const h = headersSegurancaEmbeddable()
    expect(h['X-Frame-Options']).toBeUndefined()
  })

  it('inclui os outros headers de segurança', () => {
    const h = headersSegurancaEmbeddable()
    expect(h['Cache-Control']).toBe('no-store, no-cache, must-revalidate')
    expect(h['Pragma']).toBe('no-cache')
    expect(h['X-Content-Type-Options']).toBe('nosniff')
  })
})

// ── Constantes ────────────────────────────────────────────────────────────────

describe('COOKIE_NAME e COOKIE_MAX_AGE', () => {
  it('COOKIE_NAME é uma string não vazia', () => {
    expect(typeof COOKIE_NAME).toBe('string')
    expect(COOKIE_NAME.length).toBeGreaterThan(0)
  })

  it('COOKIE_MAX_AGE é 2 horas em segundos (7200)', () => {
    expect(COOKIE_MAX_AGE).toBe(7200)
  })
})

// ── VALIDACOES_ENV ────────────────────────────────────────────────────────────

describe('VALIDACOES_ENV', () => {
  it('tem pelo menos 8 variáveis configuradas', () => {
    expect(VALIDACOES_ENV.length).toBeGreaterThanOrEqual(8)
  })

  it('cada entrada tem nome, obrigatoria e validar', () => {
    VALIDACOES_ENV.forEach(v => {
      expect(v.nome).toBeTruthy()
      expect(typeof v.obrigatoria).toBe('boolean')
      expect(typeof v.validar).toBe('function')
    })
  })

  describe('STRIPE_SECRET_KEY', () => {
    const v = VALIDACOES_ENV.find(e => e.nome === 'STRIPE_SECRET_KEY')!

    it('é obrigatória', () => {
      expect(v.obrigatoria).toBe(true)
    })

    it('aceita sk_live_...', () => {
      expect(v.validar('sk_live_abc123').ok).toBe(true)
    })

    it('aceita sk_test_...', () => {
      expect(v.validar('sk_test_abc123').ok).toBe(true)
    })

    it('rejeita outros formatos', () => {
      expect(v.validar('pk_live_abc').ok).toBe(false)
      expect(v.validar('').ok).toBe(false)
    })
  })

  describe('STRIPE_WEBHOOK_SECRET', () => {
    const v = VALIDACOES_ENV.find(e => e.nome === 'STRIPE_WEBHOOK_SECRET')!

    it('aceita whsec_...', () => {
      expect(v.validar('whsec_abc123').ok).toBe(true)
    })

    it('rejeita outros formatos', () => {
      expect(v.validar('sk_live_abc').ok).toBe(false)
    })
  })

  describe('NEXT_PUBLIC_SUPABASE_URL', () => {
    const v = VALIDACOES_ENV.find(e => e.nome === 'NEXT_PUBLIC_SUPABASE_URL')!

    it('aceita URL válida do Supabase', () => {
      expect(v.validar('https://xyzabc.supabase.co').ok).toBe(true)
    })

    it('rejeita URL sem https', () => {
      expect(v.validar('http://xyzabc.supabase.co').ok).toBe(false)
    })

    it('rejeita URL de outro domínio', () => {
      expect(v.validar('https://meusite.com').ok).toBe(false)
    })

    it('rejeita string que não é URL', () => {
      expect(v.validar('nao-eh-url').ok).toBe(false)
    })
  })

  describe('ADMIN_TOKEN', () => {
    const v = VALIDACOES_ENV.find(e => e.nome === 'ADMIN_TOKEN')!

    it('aceita token com 32 ou mais caracteres', () => {
      expect(v.validar('a'.repeat(32)).ok).toBe(true)
      expect(v.validar('a'.repeat(64)).ok).toBe(true)
    })

    it('rejeita token com menos de 32 caracteres', () => {
      expect(v.validar('curto').ok).toBe(false)
      expect(v.validar('a'.repeat(31)).ok).toBe(false)
    })
  })

  describe('NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY', () => {
    const anon = VALIDACOES_ENV.find(e => e.nome === 'NEXT_PUBLIC_SUPABASE_ANON_KEY')!
    const service = VALIDACOES_ENV.find(e => e.nome === 'SUPABASE_SERVICE_ROLE_KEY')!
    const jwtFake = 'eyJ' + 'a'.repeat(100)

    it('anon aceita JWT longo começando com eyJ', () => {
      expect(anon.validar(jwtFake).ok).toBe(true)
    })

    it('service aceita JWT longo começando com eyJ', () => {
      expect(service.validar(jwtFake).ok).toBe(true)
    })

    it('rejeita strings curtas mesmo começando com eyJ', () => {
      expect(anon.validar('eyJcurto').ok).toBe(false)
    })
  })
})
