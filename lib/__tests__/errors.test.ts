/**
 * lib/__tests__/errors.test.ts
 * Testes unitários para classes de erro e handleApiError
 *
 * Rodar: npm test lib/__tests__/errors.test.ts
 */

import {
  ApiError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  logger,
  handleApiError,
} from '@/lib/errors'

// ── Mock de next/server ───────────────────────────────────────────────────────

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    })),
  },
}))

const { NextResponse } = jest.requireMock('next/server')

// ── ApiError ──────────────────────────────────────────────────────────────────

describe('ApiError', () => {
  it('cria erro com mensagem, statusCode e code padrão', () => {
    const err = new ApiError('Algo deu errado')
    expect(err.message).toBe('Algo deu errado')
    expect(err.statusCode).toBe(500)
    expect(err.code).toBe('INTERNAL_ERROR')
    expect(err.name).toBe('ApiError')
  })

  it('aceita statusCode e code personalizados', () => {
    const err = new ApiError('Não encontrado', 404, 'NOT_FOUND')
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
  })

  it('aceita details opcional', () => {
    const details = { campo: 'email', motivo: 'inválido' }
    const err = new ApiError('Validação falhou', 400, 'VALIDATION_ERROR', details)
    expect(err.details).toEqual(details)
  })

  it('é instância de Error', () => {
    expect(new ApiError('teste')).toBeInstanceOf(Error)
  })
})

// ── ValidationError ───────────────────────────────────────────────────────────

describe('ValidationError', () => {
  it('usa status 400 e code VALIDATION_ERROR', () => {
    const err = new ValidationError('Campo obrigatório')
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.name).toBe('ValidationError')
  })

  it('é instância de ApiError e Error', () => {
    const err = new ValidationError('x')
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toBeInstanceOf(Error)
  })

  it('aceita details de validação', () => {
    const err = new ValidationError('Inválido', { campo: 'nome' })
    expect(err.details).toEqual({ campo: 'nome' })
  })
})

// ── NotFoundError ─────────────────────────────────────────────────────────────

describe('NotFoundError', () => {
  it('usa status 404 e code NOT_FOUND', () => {
    const err = new NotFoundError('Agendamento')
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
  })

  it('inclui o nome do recurso na mensagem', () => {
    const err = new NotFoundError('Cupom')
    expect(err.message).toContain('Cupom')
  })

  it('nome é NotFoundError', () => {
    expect(new NotFoundError('X').name).toBe('NotFoundError')
  })
})

// ── UnauthorizedError ─────────────────────────────────────────────────────────

describe('UnauthorizedError', () => {
  it('usa status 401 e code UNAUTHORIZED', () => {
    const err = new UnauthorizedError()
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHORIZED')
  })

  it('usa mensagem padrão "Não autorizado"', () => {
    expect(new UnauthorizedError().message).toBe('Não autorizado')
  })

  it('aceita mensagem personalizada', () => {
    const err = new UnauthorizedError('Token expirado')
    expect(err.message).toBe('Token expirado')
  })
})

// ── ConflictError ─────────────────────────────────────────────────────────────

describe('ConflictError', () => {
  it('usa status 409 e code CONFLICT', () => {
    const err = new ConflictError('Já existe')
    expect(err.statusCode).toBe(409)
    expect(err.code).toBe('CONFLICT')
    expect(err.name).toBe('ConflictError')
  })

  it('preserva a mensagem', () => {
    const err = new ConflictError('Email duplicado')
    expect(err.message).toBe('Email duplicado')
  })
})

// ── logger ────────────────────────────────────────────────────────────────────

describe('logger', () => {
  let logSpy: jest.SpyInstance
  let warnSpy: jest.SpyInstance
  let errorSpy: jest.SpyInstance

  beforeEach(() => {
    logSpy   = jest.spyOn(console, 'log').mockImplementation(() => {})
    warnSpy  = jest.spyOn(console, 'warn').mockImplementation(() => {})
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  it('logger.info chama console.log com nível INFO', () => {
    logger.info('Teste de info')
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toContain('INFO')
    expect(logSpy.mock.calls[0][0]).toContain('Teste de info')
  })

  it('logger.warn chama console.warn com nível WARN', () => {
    logger.warn('Aviso')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain('WARN')
  })

  it('logger.error chama console.error com nível ERROR', () => {
    logger.error('Erro grave', new Error('causa'))
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy.mock.calls[0][0]).toContain('ERROR')
    expect(errorSpy.mock.calls[0][0]).toContain('Erro grave')
  })

  it('logger.error inclui mensagem do erro na saída', () => {
    logger.error('Falhou', new Error('detalhes do erro'))
    expect(errorSpy.mock.calls[0][0]).toContain('detalhes do erro')
  })

  it('logger.info inclui dados extras em JSON', () => {
    logger.info('Com dados', { chave: 'valor' })
    expect(logSpy.mock.calls[0][0]).toContain('"chave"')
    expect(logSpy.mock.calls[0][0]).toContain('"valor"')
  })

  it('logger.info inclui timestamp ISO no formato correto', () => {
    logger.info('Timestamp')
    const saida: string = logSpy.mock.calls[0][0]
    expect(saida).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })
})

// ── handleApiError ────────────────────────────────────────────────────────────

describe('handleApiError', () => {
  beforeEach(() => {
    NextResponse.json.mockClear()
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  it('trata ApiError com statusCode e code corretos', () => {
    handleApiError(new ApiError('Deu ruim', 422, 'CUSTOM_CODE'))
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Deu ruim', code: 'CUSTOM_CODE' }),
      { status: 422 }
    )
  })

  it('trata ValidationError com status 400', () => {
    handleApiError(new ValidationError('Campo inválido'))
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'VALIDATION_ERROR' }),
      { status: 400 }
    )
  })

  it('inclui details quando presentes', () => {
    handleApiError(new ValidationError('Inválido', { campo: 'email' }))
    const chamada = NextResponse.json.mock.calls[0]
    expect(chamada[0].details).toEqual({ campo: 'email' })
  })

  it('não inclui details quando ausentes', () => {
    handleApiError(new ValidationError('Sem details'))
    const chamada = NextResponse.json.mock.calls[0]
    expect(chamada[0].details).toBeUndefined()
  })

  it('trata Error genérico com status 500', () => {
    handleApiError(new Error('erro desconhecido'))
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'INTERNAL_ERROR' }),
      { status: 500 }
    )
  })

  it('trata valor não-Error com status 500', () => {
    handleApiError('string aleatória')
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'INTERNAL_ERROR' }),
      { status: 500 }
    )
  })

  it('trata null/undefined sem lançar exceção', () => {
    expect(() => handleApiError(null)).not.toThrow()
    expect(() => handleApiError(undefined)).not.toThrow()
  })

  it('trata NotFoundError com status 404', () => {
    handleApiError(new NotFoundError('Recurso'))
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'NOT_FOUND' }),
      { status: 404 }
    )
  })

  it('trata UnauthorizedError com status 401', () => {
    handleApiError(new UnauthorizedError())
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'UNAUTHORIZED' }),
      { status: 401 }
    )
  })
})
