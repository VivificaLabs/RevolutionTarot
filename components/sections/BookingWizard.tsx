'use client'

import { useState, useEffect } from 'react'
import {
  TIRAGENS, IDIOMAS, FUSOS, HORARIOS_AO_VIVO_LISBOA, PERIODOS_URGENCIA,
  SIMBOLOS, metodosPorMoeda,
  precoComUrgencia, converterPreco, formatarPreco,
  type Moeda, type Idioma, type Canal, type MetodoPagamento,
  type DadosStep1, type DadosStep2, type DadosStep3,
} from '@/lib/booking'

// ── Configuração ──────────────────────────────────────────────────────────────
//
// NEXT_PUBLIC_ENABLE_STRIPE: define se Stripe (Cartão de Crédito) está habilitado
//   - true: mostra opção de pagamento por Cartão
//   - false (padrão): oculta Cartão, deixa apenas Pix e Revolut
//
// Usar em .env.local:
//   NEXT_PUBLIC_ENABLE_STRIPE=true

const STRIPE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_STRIPE === 'true'

// ── Cal.eu Event Types ────────────────────────────────────────────────────────
//
// Mapeamento de tipos de evento para IDs numéricos no Cal.eu
// Atualizar com os IDs corretos do seu workspace Cal.eu
//
// IMPORTANTE: obter IDs em https://cal.eu/admin/apps/installed/cal-com
// ou via API: GET /v2/event-types

const CAL_EVENT_TYPES = {
  'tiragem-padrao': parseInt(process.env.NEXT_PUBLIC_CAL_ET_PADRAO || '1'),
  'tiragem-urgente': parseInt(process.env.NEXT_PUBLIC_CAL_ET_URGENTE || '2'),
  'ao-vivasso': parseInt(process.env.NEXT_PUBLIC_CAL_ET_AO_VIVO || '3'),
}

// ── Estilos base reutilizáveis ────────────────────────────────────────────────

const S = {
  input: {
    width: '100%',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--border)',
    color: 'var(--ink)',
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.78rem',
    padding: '11px 14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,

  label: {
    fontSize: '0.6rem',
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
    color: 'var(--cyan)',
    display: 'block',
    marginBottom: 8,
  },

  select: {
    width: '100%',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--border)',
    color: 'var(--ink)',
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.78rem',
    padding: '11px 14px',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none' as const,
  },

  btnPrimary: {
    background: 'var(--magenta)',
    color: '#fff',
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    border: 'none',
    padding: '13px 28px',
    cursor: 'pointer',
    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
    transition: 'opacity 0.2s',
  } as React.CSSProperties,

  btnSecondary: {
    background: 'transparent',
    color: 'var(--muted)',
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    border: '1px solid var(--border)',
    padding: '13px 24px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  fieldGroup: {
    marginBottom: 24,
  },

  card: {
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid var(--border)',
    padding: '16px 20px',
    marginBottom: 12,
    position: 'relative' as const,
  },

  infoBox: {
    background: 'rgba(0,245,212,0.04)',
    border: '1px solid rgba(0,245,212,0.15)',
    padding: '14px 18px',
    marginBottom: 28,
    fontSize: '0.75rem',
    color: 'var(--muted)',
    lineHeight: 1.75,
  },

  resumoBox: {
    background: 'rgba(201,168,76,0.06)',
    border: '1px solid rgba(201,168,76,0.2)',
    padding: '14px 18px',
    marginBottom: 28,
    fontSize: '0.75rem',
    lineHeight: 1.8,
  },
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function Tooltip({ texto }: { texto: string }) {
  const [vis, setVis] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-block', marginLeft: 6 }}>
      <span
        onMouseEnter={() => setVis(true)}
        onMouseLeave={() => setVis(false)}
        style={{ cursor: 'help', color: 'var(--muted)', fontSize: '0.7rem' }}
      >
        ⓘ
      </span>
      {vis && (
        <span style={{
          position: 'absolute',
          bottom: '130%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1a0218',
          border: '1px solid var(--border)',
          color: 'var(--ink)',
          fontSize: '0.65rem',
          padding: '8px 12px',
          width: 220,
          lineHeight: 1.6,
          zIndex: 50,
          pointerEvents: 'none',
          whiteSpace: 'normal',
        }}>
          {texto}
        </span>
      )}
    </span>
  )
}

// ── Barra de progresso ────────────────────────────────────────────────────────

const PASSOS = ['Leitura', 'Data & Hora', 'Dados', 'Pagamento', 'Confirmação']

function ProgressBar({ atual }: { atual: number }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {PASSOS.map((passo, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < PASSOS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28,
                border: `1px solid ${i <= atual ? 'var(--cyan)' : 'var(--border)'}`,
                background: i < atual ? 'var(--cyan)' : i === atual ? 'rgba(0,245,212,0.1)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem',
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                color: i < atual ? 'var(--bg)' : i === atual ? 'var(--cyan)' : 'var(--muted)',
                transition: 'all 0.3s',
              }}>
                {i < atual ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: '0.55rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: i === atual ? 'var(--cyan)' : 'var(--muted)',
                whiteSpace: 'nowrap',
              }}>
                {passo}
              </span>
            </div>
            {i < PASSOS.length - 1 && (
              <div style={{
                flex: 1,
                height: 1,
                background: i < atual ? 'var(--cyan)' : 'var(--border)',
                margin: '0 8px',
                marginBottom: 24,
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Step 1 — Sobre a leitura ──────────────────────────────────────────────────

function Step1({
  dados,
  onChange,
  onNext,
  onCancel,
}: {
  dados: Partial<DadosStep1>
  onChange: (d: Partial<DadosStep1>) => void
  onNext: () => void
  onCancel: () => void
}) {
  const tiragem = TIRAGENS.find(t => t.id === dados.tiragemId)
  const moeda = dados.moeda ?? 'BRL'

  const precoBRL = tiragem?.precoBRL ?? 0
  const precoFinal = dados.urgencia ? precoComUrgencia(precoBRL) : precoBRL
  const taxaUrgencia = precoComUrgencia(precoBRL) - precoBRL

  const tudo = !!dados.tiragemId && !!dados.idioma && !!dados.moeda

  return (
    <div>
      <div style={S.infoBox}>
        <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>Passo 01</span>
        <br />
        O primeiro passo do seu agendamento é escolher qual tipo de leitura você quer.
      </div>

      {/* Moeda */}
      <div style={S.fieldGroup}>
        <label style={S.label}>Moeda</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['BRL', 'USD', 'EUR'] as Moeda[]).map(m => (
            <button
              key={m}
              onClick={() => onChange({ ...dados, moeda: m })}
              style={{
                background: moeda === m ? 'var(--cyan)' : 'transparent',
                color: moeda === m ? 'var(--bg)' : 'var(--muted)',
                border: `1px solid ${moeda === m ? 'var(--cyan)' : 'rgba(0,245,212,0.2)'}`,
                padding: '7px 16px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {SIMBOLOS[m]} {m}
            </button>
          ))}
        </div>
      </div>

      {/* Leitura desejada */}
      <div style={S.fieldGroup}>
        <label style={S.label}>Leitura desejada <span style={{ color: 'var(--magenta)' }}>*</span></label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TIRAGENS.map(t => {
            const sel = dados.tiragemId === t.id
            return (
              <div
                key={t.id}
                onClick={() => onChange({ ...dados, tiragemId: t.id })}
                style={{
                  ...S.card,
                  border: `1px solid ${sel ? 'var(--cyan)' : 'var(--border)'}`,
                  background: sel ? 'rgba(0,245,212,0.06)' : 'rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <div>
                  <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '1.1rem',
                    fontStyle: 'italic',
                    color: sel ? 'var(--ink)' : 'var(--muted)',
                  }}>
                    {t.nome}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
                    {t.subtitulo}
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: sel ? 'var(--gold)' : 'var(--muted)',
                }}>
                  {formatarPreco(converterPreco(t.precoBRL, moeda), moeda)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Idioma */}
      <div style={S.fieldGroup}>
        <label style={S.label}>Idioma da leitura <span style={{ color: 'var(--magenta)' }}>*</span></label>
        <div style={{ display: 'flex', gap: 8 }}>
          {IDIOMAS.map(({ value, label }) => {
            const sel = (dados.idioma ?? 'pt') === value
            return (
              <button
                key={value}
                onClick={() => onChange({ ...dados, idioma: value as Idioma })}
                style={{
                  background: sel ? 'rgba(201,168,76,0.15)' : 'transparent',
                  color: sel ? 'var(--gold)' : 'var(--muted)',
                  border: `1px solid ${sel ? 'var(--gold)' : 'var(--border)'}`,
                  padding: '7px 16px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Urgência */}
      <div style={{ ...S.fieldGroup, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <input
          type="checkbox"
          id="urgencia"
          checked={dados.urgencia ?? false}
          onChange={e => onChange({ ...dados, urgencia: e.target.checked })}
          style={{ marginTop: 3, accentColor: 'var(--magenta)', cursor: 'pointer' }}
        />
        <label htmlFor="urgencia" style={{ fontSize: '0.78rem', color: 'var(--muted)', cursor: 'pointer', lineHeight: 1.5 }}>
          Agendamento com urgência (entrega / atendimento prioritário)
        </label>
      </div>

      {dados.urgencia && tiragem && (
        <div style={{
          background: 'rgba(255,45,120,0.06)',
          border: '1px solid rgba(255,45,120,0.3)',
          padding: '14px 18px',
          marginBottom: 24,
          fontSize: '0.78rem',
          color: 'var(--magenta)',
          lineHeight: 1.75,
        }}>
          O agendamento com urgência implica em uma taxa extra de{' '}
          <strong>{formatarPreco(converterPreco(taxaUrgencia, moeda), moeda)}</strong>,
          resultando no valor total de{' '}
          <strong>{formatarPreco(converterPreco(precoFinal, moeda), moeda)}</strong>.
          Deseja continuar?
        </div>
      )}

      {/* Botões */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
        <button style={S.btnSecondary} onClick={onCancel}>Cancelar</button>
        <button
          style={{ ...S.btnPrimary, opacity: tudo ? 1 : 0.4, cursor: tudo ? 'pointer' : 'not-allowed' }}
          onClick={() => tudo && onNext()}
          disabled={!tudo}
        >
          Seguinte →
        </button>
      </div>
    </div>
  )
}

// ── Step 2 — Data e hora ──────────────────────────────────────────────────────

function Step2({
  step1,
  dados,
  onChange,
  onNext,
  onBack,
}: {
  step1: Partial<DadosStep1>
  dados: Partial<DadosStep2>
  onChange: (d: Partial<DadosStep2>) => void
  onNext: () => void
  onBack: () => void
}) {
  const tiragem = TIRAGENS.find(t => t.id === step1.tiragemId)
  const moeda = step1.moeda ?? 'BRL'
  const urgencia = step1.urgencia ?? false
  const precoBRL = urgencia ? precoComUrgencia(tiragem?.precoBRL ?? 0) : (tiragem?.precoBRL ?? 0)
  const fuso = FUSOS.find(f => f.tz === (dados.fusoTz ?? 'Europe/Lisbon')) ?? FUSOS[0]
  const ehRegular = !tiragem?.aoVivo && !urgencia

  const [slots, setSlots] = useState<string[]>([])
  const [slotsCarregando, setSlotsCarregando] = useState(false)
  const [slotsErro, setSlotsErro] = useState('')

  useEffect(() => {
    if (!ehRegular || !dados.data) { setSlots([]); return }
    const id = CAL_EVENT_TYPES['tiragem-padrao']
    setSlotsCarregando(true)
    setSlotsErro('')
    setSlots([])
    fetch(`/api/cal/slots?eventTypeId=${id}&data=${dados.data}`)
      .then(r => r.json())
      .then(d => {
        console.log('[CLIENTE_SLOTS] resposta da API:', d)
        if (d.error) setSlotsErro(d.error)
        else setSlots(d.slots ?? [])
      })
      .catch(() => setSlotsErro('Erro ao buscar horários disponíveis'))
      .finally(() => setSlotsCarregando(false))
  }, [dados.data, ehRegular]) // eslint-disable-line react-hooks/exhaustive-deps

  // Agrupa slots disponíveis em Manhã / Tarde / Noite (hora Lisboa)
  const slotsPorPeriodo = [
    { label: 'Manhã', de: 6,  ate: 12 },
    { label: 'Tarde', de: 12, ate: 18 },
    { label: 'Noite', de: 18, ate: 24 },
  ].map(p => {
    const disponiveis = slots.filter(s => {
      const h = parseInt(new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Lisbon', hour: 'numeric', hour12: false,
      }).format(new Date(s)))
      return h >= p.de && h < p.ate
    })
    return { label: p.label, primeiroSlot: disponiveis[0] ?? null }
  }).filter(p => p.primeiroSlot !== null)

  // Dias permitidos
  const hoje = new Date()
  const dataMinima = new Date(hoje)
  if (urgencia) {
    dataMinima.setDate(dataMinima.getDate() + 1)
  } else {
    // próxima semana
    dataMinima.setDate(dataMinima.getDate() + (7 - dataMinima.getDay() + 1))
  }

  function diasPermitidos(data: Date): boolean {
    const dow = data.getDay() // 0=dom, 1=seg, 2=ter...
    if (tiragem?.aoVivo) return dow === 0 || dow === 6
    return [2, 3, 4, 0, 6].includes(dow) // ter, qua, qui, sáb, dom
  }

  // Calendário simples (3 semanas)
  const semanas: Date[][] = []
  const cursor = new Date(dataMinima)
  cursor.setDate(cursor.getDate() - cursor.getDay()) // começa no domingo
  for (let s = 0; s < 4; s++) {
    const sem: Date[] = []
    for (let d = 0; d < 7; d++) {
      sem.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    semanas.push(sem)
  }

  function isoData(d: Date) {
    return d.toISOString().split('T')[0]
  }

  const dataSel = dados.data ?? null
  const tudo = !!dataSel && (
    ehRegular
      ? !!dados.slotISO
      : !!(dados.hora !== null && dados.hora !== undefined) || !!dados.periodo
  )

  return (
    <div>
      {/* Resumo */}
      <div style={S.resumoBox}>
        <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
          {tiragem?.nome} · {IDIOMAS.find(i => i.value === step1.idioma)?.label ?? 'Português'}
          {urgencia ? ' · urgência' : ''}
        </span>
        <br />
        <span style={{ color: 'var(--muted)' }}>
          {formatarPreco(converterPreco(precoBRL, moeda), moeda)}
        </span>
      </div>

      <div style={S.infoBox}>
        {tiragem?.aoVivo
          ? <>
              Para videochamada: o atendimento acontece majoritariamente durante os finais de semana —
              CLT né mores. Selecione o horário mais adequado pra você — atenção ao fuso horário!
            </>
          : <>
              Para entrega via fotos e áudios: até as 23h do dia selecionado (horário de Lisboa).
            </>
        }
      </div>

      {/* Fuso */}
      <div style={S.fieldGroup}>
        <label style={S.label}>Seu fuso horário</label>
        <select
          style={S.select}
          value={dados.fusoTz ?? 'Europe/Lisbon'}
          onChange={e => onChange({ ...dados, fusoTz: e.target.value, hora: null, periodo: null, slotISO: null })}
        >
          {FUSOS.map(f => (
            <option key={f.tz} value={f.tz}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Calendário */}
      <div style={S.fieldGroup}>
        <label style={S.label}>Data</label>
        <div style={{ border: '1px solid var(--border)', overflow: 'hidden' }}>
          {/* Cabeçalho */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
            background: 'rgba(0,0,0,0.3)',
            borderBottom: '1px solid var(--border)',
          }}>
            {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
              <div key={d} style={{
                textAlign: 'center', padding: '8px 4px',
                fontSize: '0.58rem', letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--muted)',
              }}>{d}</div>
            ))}
          </div>

          {/* Dias */}
          {semanas.map((sem, si) => (
            <div key={si} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {sem.map((dia, di) => {
                const iso = isoData(dia)
                const disponivel = dia >= dataMinima && diasPermitidos(dia)
                const selecionado = iso === dataSel
                return (
                  <div
                    key={di}
                    onClick={() => disponivel && onChange({ ...dados, data: iso, hora: null, periodo: null, slotISO: null })}
                    style={{
                      textAlign: 'center',
                      padding: '10px 4px',
                      fontSize: '0.75rem',
                      cursor: disponivel ? 'pointer' : 'default',
                      color: selecionado ? 'var(--bg)' : disponivel ? 'var(--ink)' : 'rgba(255,255,255,0.15)',
                      background: selecionado ? 'var(--cyan)' : disponivel ? 'rgba(0,245,212,0.04)' : 'transparent',
                      borderBottom: '1px solid var(--border)',
                      borderRight: di < 6 ? '1px solid var(--border)' : 'none',
                      transition: 'all 0.15s',
                      fontWeight: selecionado ? 700 : 400,
                    }}
                  >
                    {dia.getDate()}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Horários — Ao vivo */}
      {dataSel && tiragem?.aoVivo && (
        <div style={S.fieldGroup}>
          <label style={S.label}>Horário (Lisboa)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {HORARIOS_AO_VIVO_LISBOA.map(h => {
              const hLocal = h + fuso.offsetLisboa
              const sel = dados.hora === h
              return (
                <button
                  key={h}
                  onClick={() => onChange({ ...dados, hora: h })}
                  style={{
                    background: sel ? 'var(--cyan)' : 'transparent',
                    color: sel ? 'var(--bg)' : 'var(--muted)',
                    border: `1px solid ${sel ? 'var(--cyan)' : 'var(--border)'}`,
                    padding: '10px 20px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {String(h).padStart(2,'0')}h Lisboa
                  {fuso.offsetLisboa !== 0 && (
                    <span style={{ fontSize: '0.6rem', display: 'block', marginTop: 2 }}>
                      {String(((hLocal % 24) + 24) % 24).padStart(2,'0')}h local
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Slots Cal.eu — Tiragens regulares */}
      {dataSel && ehRegular && (
        <div style={S.fieldGroup}>
          <label style={S.label}>Período preferido (Lisboa)</label>
          {slotsCarregando && (
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Buscando horários...</div>
          )}
          {slotsErro && (
            <div style={{ fontSize: '0.72rem', color: 'var(--magenta)' }}>⚠️ {slotsErro}</div>
          )}
          {!slotsCarregando && !slotsErro && slotsPorPeriodo.length === 0 && (
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Nenhum horário disponível para este dia.</div>
          )}
          {!slotsCarregando && slotsPorPeriodo.length > 0 && (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                {slotsPorPeriodo.map(({ label, primeiroSlot }) => {
                  const sel = dados.slotISO === primeiroSlot
                  return (
                    <button
                      key={label}
                      onClick={() => onChange({ ...dados, slotISO: primeiroSlot })}
                      style={{
                        background: sel ? 'var(--cyan)' : 'transparent',
                        color: sel ? 'var(--bg)' : 'var(--muted)',
                        border: `1px solid ${sel ? 'var(--cyan)' : 'var(--border)'}`,
                        padding: '10px 20px',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              {dados.slotISO && (
                <div style={{ fontSize: '0.68rem', color: 'var(--magenta)', marginTop: 10, lineHeight: 1.5 }}>
                  ⚠️ Horário preferencial — não há garantia de entrega nesse período. A tiragem será entregue com certeza até as 23h de Lisboa do dia selecionado.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Períodos — Urgência não-ao-vivo */}
      {dataSel && !tiragem?.aoVivo && urgencia && (
        <div style={S.fieldGroup}>
          <label style={S.label}>Período preferido (Lisboa)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {PERIODOS_URGENCIA.map(({ label, horaLisboa }) => {
              const hLocal = horaLisboa + fuso.offsetLisboa
              const sel = dados.periodo === label
              return (
                <button
                  key={label}
                  onClick={() => onChange({ ...dados, periodo: label, hora: horaLisboa })}
                  style={{
                    background: sel ? 'var(--cyan)' : 'transparent',
                    color: sel ? 'var(--bg)' : 'var(--muted)',
                    border: `1px solid ${sel ? 'var(--cyan)' : 'var(--border)'}`,
                    padding: '10px 20px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                  {fuso.offsetLisboa !== 0 && (
                    <span style={{ fontSize: '0.6rem', display: 'block', marginTop: 2 }}>
                      {String(((hLocal % 24) + 24) % 24).padStart(2,'0')}h local
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
        <button style={S.btnSecondary} onClick={onBack}>← Voltar</button>
        <button
          style={{ ...S.btnPrimary, opacity: tudo ? 1 : 0.4, cursor: tudo ? 'pointer' : 'not-allowed' }}
          onClick={() => tudo && onNext()}
          disabled={!tudo}
        >
          Seguinte →
        </button>
      </div>
    </div>
  )
}

// ── Step 3 — Informações pessoais ─────────────────────────────────────────────

function Step3({
  step1,
  step2,
  dados,
  onChange,
  onNext,
  onBack,
}: {
  step1: Partial<DadosStep1>
  step2: Partial<DadosStep2>
  dados: Partial<DadosStep3>
  onChange: (d: Partial<DadosStep3>) => void
  onNext: () => void
  onBack: () => void
}) {
  const tiragem = TIRAGENS.find(t => t.id === step1.tiragemId)
  const moeda = step1.moeda ?? 'BRL'
  const urgencia = step1.urgencia ?? false
  const precoBRL = urgencia ? precoComUrgencia(tiragem?.precoBRL ?? 0) : (tiragem?.precoBRL ?? 0)
  const canal = dados.canal ?? 'whatsapp'

  const tudo = !!dados.nome?.trim() &&
    (canal === 'whatsapp' ? !!dados.contatoWhatsapp?.trim() : !!dados.contatoTelegram?.trim()) &&
    !!dados.email?.trim() &&
    (!dados.indicacao || !!dados.indicadoPor?.trim())

  return (
    <div>
      <div style={S.resumoBox}>
        <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
          {tiragem?.nome} · {IDIOMAS.find(i => i.value === step1.idioma)?.label}
          {urgencia ? ' · urgência' : ''} · {formatarPreco(converterPreco(precoBRL, moeda), moeda)}
        </span>
        <br />
        <span style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>
          {step2.data} {step2.periodo ? `· ${step2.periodo}` : step2.hora != null ? `· ${String(step2.hora).padStart(2,'0')}h Lisboa` : ''}
        </span>
      </div>

      <div style={S.infoBox}>
        <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>Passo 03</span>
        <br />
        Preciso de alguns dados seus para a tiragem e entrega. Bora?
      </div>

      {/* Nome */}
      <div style={S.fieldGroup}>
        <label style={S.label}>Nome completo <span style={{ color: 'var(--magenta)' }}>*</span></label>
        <input
          style={S.input}
          type="text"
          placeholder="Como você se chama?"
          value={dados.nome ?? ''}
          onChange={e => onChange({ ...dados, nome: e.target.value })}
        />
      </div>

      {/* Canal de entrega */}
      <div style={S.fieldGroup}>
        <label style={S.label}>Entrega via <span style={{ color: 'var(--magenta)' }}>*</span></label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {(['whatsapp', 'telegram'] as Canal[]).map(c => (
            <button
              key={c}
              onClick={() => onChange({ ...dados, canal: c })}
              style={{
                background: canal === c ? 'rgba(0,245,212,0.08)' : 'transparent',
                color: canal === c ? 'var(--cyan)' : 'var(--muted)',
                border: `1px solid ${canal === c ? 'var(--cyan)' : 'var(--border)'}`,
                padding: '8px 20px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {c === 'whatsapp' ? '📱 WhatsApp' : '✈️ Telegram'}
            </button>
          ))}
        </div>

        {canal === 'whatsapp' ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              style={{ ...S.select, width: 'auto', minWidth: 100 }}
              value={dados.contatoWhatsappPais ?? '+55'}
              onChange={e => onChange({ ...dados, contatoWhatsappPais: e.target.value })}
            >
              <option value="+55">🇧🇷 +55</option>
              <option value="+351">🇵🇹 +351</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+34">🇪🇸 +34</option>
              <option value="+54">🇦🇷 +54</option>
              <option value="+52">🇲🇽 +52</option>
            </select>
            <input
              style={{ ...S.input, flex: 1 }}
              type="tel"
              placeholder="Número do WhatsApp"
              value={dados.contatoWhatsapp ?? ''}
              onChange={e => onChange({ ...dados, contatoWhatsapp: e.target.value })}
            />
          </div>
        ) : (
          <input
            style={S.input}
            type="text"
            placeholder="@seu_telegram"
            value={dados.contatoTelegram ?? ''}
            onChange={e => onChange({ ...dados, contatoTelegram: e.target.value })}
          />
        )}
      </div>

      {/* Email */}
      <div style={S.fieldGroup}>
        <label style={S.label}>
          E-mail <span style={{ color: 'var(--magenta)' }}>*</span>
          <Tooltip texto="Você receberá a confirmação do agendamento por aqui. Também serve de contato alternativo caso eu não te encontre no WhatsApp ou Telegram." />
        </label>
        <input
          style={S.input}
          type="email"
          placeholder="seu@email.com"
          value={dados.email ?? ''}
          onChange={e => onChange({ ...dados, email: e.target.value })}
        />
      </div>

      {/* Cupom */}
      <div style={S.fieldGroup}>
        <label style={S.label}>Cupom de desconto</label>
        <input
          style={S.input}
          type="text"
          placeholder="CÓDIGO (opcional)"
          value={dados.cupom ?? ''}
          onChange={e => onChange({ ...dados, cupom: e.target.value.toUpperCase() })}
        />
      </div>

      {/* Indicação */}
      <div style={{ ...S.fieldGroup }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <input
            type="checkbox"
            id="indicacao"
            checked={dados.indicacao ?? false}
            onChange={e => onChange({ ...dados, indicacao: e.target.checked, indicadoPor: '' })}
            style={{ marginTop: 3, accentColor: 'var(--cyan)', cursor: 'pointer' }}
          />
          <label htmlFor="indicacao" style={{ fontSize: '0.78rem', color: 'var(--muted)', cursor: 'pointer', lineHeight: 1.5 }}>
            Fui indicada por alguém
            <Tooltip texto="Conto isso para dar um desconto especial pra quem te indicou. Obrigada por espalhar a revolução! 🔮" />
          </label>
        </div>
        {dados.indicacao && (
          <input
            style={S.input}
            type="text"
            placeholder="Nome de quem te indicou *"
            value={dados.indicadoPor ?? ''}
            onChange={e => onChange({ ...dados, indicadoPor: e.target.value })}
          />
        )}
      </div>

      {/* Nota */}
      <div style={S.fieldGroup}>
        <label style={S.label}>
          Contexto / nota
          <Tooltip texto="Opcional! Se quiser me mandar um contexto por áudio, pode chamar no WhatsApp profissional +351 939 189 631. Fica à vontade." />
        </label>
        <textarea
          style={{
            ...S.input,
            minHeight: 100,
            resize: 'vertical',
            fontFamily: "'Space Mono', monospace",
          }}
          placeholder="Escreva o que quiser — contexto, pergunta principal, o que estiver na cabeça. Opcional."
          value={dados.nota ?? ''}
          onChange={e => onChange({ ...dados, nota: e.target.value })}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
        <button style={S.btnSecondary} onClick={onBack}>← Voltar</button>
        <button
          style={{ ...S.btnPrimary, opacity: tudo ? 1 : 0.4, cursor: tudo ? 'pointer' : 'not-allowed' }}
          onClick={() => tudo && onNext()}
          disabled={!tudo}
        >
          Seguinte →
        </button>
      </div>
    </div>
  )
}

// ── Step 4 — Pagamento ────────────────────────────────────────────────────────

function Step4({
  step1,
  step2,
  step3,
  desconto,
  onNext,
  onBack,
  onMetodo,
  metodo,
}: {
  step1: Partial<DadosStep1>
  step2: Partial<DadosStep2>
  step3: Partial<DadosStep3>
  desconto: number
  onNext: () => void
  onBack: () => void
  onMetodo: (m: MetodoPagamento | null) => void
  metodo: MetodoPagamento | null
}) {
  const tiragem = TIRAGENS.find(t => t.id === step1.tiragemId)
  const moeda = step1.moeda ?? 'BRL'
  const urgencia = step1.urgencia ?? false
  const precoBRL = urgencia ? precoComUrgencia(tiragem?.precoBRL ?? 0) : (tiragem?.precoBRL ?? 0)
  const descontoValorBRL = precoBRL * (desconto / 100)
  const totalBRL = precoBRL - descontoValorBRL

  const [cartao, setCartao] = useState({ numero: '', validade: '', cvv: '' })
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  // Métodos disponíveis para a moeda selecionada, respeitando flags de feature
  const metodosDisponivelsPorMoeda = metodosPorMoeda(moeda)
  const metodosDisponiveis = STRIPE_ENABLED 
    ? metodosDisponivelsPorMoeda 
    : metodosDisponivelsPorMoeda.filter(m => m !== 'cartao')
  
  // Se o método selecionado deixou de estar disponível, reseta a seleção
  if (metodo && !metodosDisponiveis.includes(metodo)) {
    onMetodo(null)
  }

  async function confirmarFluxo() {
    // 1. CRIAR EVENTO NO CAL.EU FIRST (obrigatório)
    console.log('[STEP4_FLUXO] Etapa 1/3: Criando evento no Cal.eu...')
    let calIds = { calBookingId: undefined, calBookingUid: undefined }
    try {
      calIds = await criarEventoCaleu(step1, step2, step3)
      console.log('[STEP4_FLUXO] ✅ Cal.eu sucesso:', calIds)
    } catch (erroCaleu) {
      console.error('[STEP4_FLUXO] ❌ Cal.eu falhou (bloqueando):', erroCaleu)
      const msg = erroCaleu instanceof Error ? erroCaleu.message : 'erro desconhecido'
      setErro(`Erro ao criar evento no calendário: ${msg}`)
      throw erroCaleu
    }

    // 2. PROCESSAR PAGAMENTO (se Cartão E Stripe habilitado)
    let stripePaymentId: string | undefined = undefined
    if (STRIPE_ENABLED && metodo === 'cartao') {
      console.log('[STEP4_FLUXO] Etapa 2/3: Processando pagamento Stripe...')
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            valorBRL: totalBRL,
            moeda,
            descricao: `${tiragem?.nome} — Revolution Tarot`,
            email: step3.email,
            nome: step3.nome,
          }),
        })
        const data = await res.json()
        if (data.error) {
          console.error('[STEP4_FLUXO] ❌ Stripe falhou:', data.error)
          throw new Error(data.error)
        }
        stripePaymentId = data.paymentId
        console.log('[STEP4_FLUXO] ✅ Stripe sucesso:', { stripePaymentId })
      } catch (erroStripe) {
        console.error('[STEP4_FLUXO] ❌ Pagamento falhou (bloqueando):', erroStripe)
        const msg = erroStripe instanceof Error ? erroStripe.message : 'erro desconhecido'
        setErro(`Erro ao processar pagamento: ${msg}`)
        throw erroStripe
      }
    } else {
      console.log('[STEP4_FLUXO] Etapa 2/3: Pulando (método Pix/Revolut)')
    }

    // 3. SALVAR AGENDAMENTO EM SUPABASE
    console.log('[STEP4_FLUXO] Etapa 3/3: Salvando agendamento em Supabase...')
    try {
      await salvarAgendamento(
        step1, step2, step3,
        metodo, desconto,
        stripePaymentId,
        calIds.calBookingId,
        calIds.calBookingUid
      )
      console.log('[STEP4_FLUXO] ✅ Supabase sucesso, avançando para Step5')
      onNext()
    } catch (erroSupabase) {
      console.error('[STEP4_FLUXO] ❌ Supabase falhou (bloqueando):', erroSupabase)
      const msg = erroSupabase instanceof Error ? erroSupabase.message : 'erro desconhecido'
      setErro(`Erro ao salvar agendamento: ${msg}`)
      throw erroSupabase
    }
  }

  async function handleConfirmar() {
    if (!podeProsseguir) return

    setCarregando(true)
    setErro('')

    try {
      await confirmarFluxo()
    } catch (erro) {
      console.error('[STEP4_FLUXO] Fluxo abortado em erro:', erro)
    } finally {
      setCarregando(false)
    }
  }

  const podeProsseguir = !!metodo && (metodo !== 'cartao' || (!!cartao.numero && !!cartao.validade && !!cartao.cvv))

  return (
    <div>
      {/* Resumo financeiro */}
      <div style={S.resumoBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ color: 'var(--muted)' }}>Valor original</span>
          <span style={{ color: 'var(--ink)' }}>{formatarPreco(converterPreco(precoBRL, moeda), moeda)}</span>
        </div>
        {desconto > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--muted)' }}>Cupom ({step3.cupom}) — {desconto}% off</span>
            <span style={{ color: 'var(--yes, #7dd4a8)' }}>− {formatarPreco(converterPreco(descontoValorBRL, moeda), moeda)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border2)', paddingTop: 8, marginTop: 4 }}>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Total</span>
          <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '1.05rem' }}>{formatarPreco(converterPreco(totalBRL, moeda), moeda)}</span>
        </div>
      </div>

      {/* Métodos */}
      <label style={{ ...S.label, marginBottom: 16 }}>Método de pagamento</label>

      {/* PIX */}
      {metodosDisponiveis.includes('pix') && (
        <div
          onClick={() => onMetodo('pix')}
          style={{
            ...S.card,
            border: `1px solid ${metodo === 'pix' ? 'var(--cyan)' : 'var(--border)'}`,
            background: metodo === 'pix' ? 'rgba(0,245,212,0.06)' : 'rgba(0,0,0,0.2)',
            cursor: 'pointer', marginBottom: 8, transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: metodo === 'pix' ? 12 : 0 }}>
            <span>🇧🇷</span>
            <span style={{ fontWeight: 700, color: metodo === 'pix' ? 'var(--ink)' : 'var(--muted)' }}>Pix</span>
          </div>
          {metodo === 'pix' && (
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.7 }}>
              Chave: <span style={{ color: 'var(--ink)', fontFamily: "'Space Mono', monospace" }}>revolutiontarot.byolivia@gmail.com</span>
              <br />
              Após o pagamento, envie o comprovante para{' '}
              <span style={{ color: 'var(--cyan)' }}>+351 939 189 631</span> no WhatsApp.
            </div>
          )}
        </div>
      )}

      {/* Revolut */}
      {metodosDisponiveis.includes('revolut') && (
        <div
          onClick={() => onMetodo('revolut')}
          style={{
            ...S.card,
            border: `1px solid ${metodo === 'revolut' ? 'var(--cyan)' : 'var(--border)'}`,
            background: metodo === 'revolut' ? 'rgba(0,245,212,0.06)' : 'rgba(0,0,0,0.2)',
            cursor: 'pointer', marginBottom: 8, transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: metodo === 'revolut' ? 12 : 0 }}>
            <span>🇪🇺</span>
            <span style={{ fontWeight: 700, color: metodo === 'revolut' ? 'var(--ink)' : 'var(--muted)' }}>Revolut</span>
          </div>
          {metodo === 'revolut' && (
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.7 }}>
              @ Revolut: <span style={{ color: 'var(--ink)', fontFamily: "'Space Mono', monospace" }}>@olimattiazzo</span>
              <br />
              Após o pagamento, envie o comprovante para{' '}
              <span style={{ color: 'var(--cyan)' }}>+351 939 189 631</span> no WhatsApp.
            </div>
          )}
        </div>
      )}

      {/* Cartão */}
      {STRIPE_ENABLED && metodosDisponiveis.includes('cartao') && (
        <div
          style={{
            ...S.card,
            border: `1px solid ${metodo === 'cartao' ? 'var(--cyan)' : 'var(--border)'}`,
            background: metodo === 'cartao' ? 'rgba(0,245,212,0.06)' : 'rgba(0,0,0,0.2)',
            cursor: 'pointer', marginBottom: 20, transition: 'all 0.2s',
          }}
          onClick={() => onMetodo('cartao')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: metodo === 'cartao' ? 16 : 0 }}>
            <span>💳</span>
            <span style={{ fontWeight: 700, color: metodo === 'cartao' ? 'var(--ink)' : 'var(--muted)' }}>
              Cartão de crédito
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--muted)', marginLeft: 'auto' }}>
              processado em {SIMBOLOS[moeda]}
            </span>
          </div>
          {metodo === 'cartao' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} onClick={e => e.stopPropagation()}>
              <input
                style={S.input}
                type="text"
                placeholder="Número do cartão"
                maxLength={19}
                value={cartao.numero}
                onChange={e => setCartao(c => ({ ...c, numero: e.target.value }))}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input
                  style={S.input}
                  type="text"
                  placeholder="MM/AA"
                  maxLength={5}
                  value={cartao.validade}
                  onChange={e => setCartao(c => ({ ...c, validade: e.target.value }))}
                />
                <input
                  style={S.input}
                  type="text"
                  placeholder="CVV"
                  maxLength={4}
                  value={cartao.cvv}
                  onChange={e => setCartao(c => ({ ...c, cvv: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {erro && (
        <div style={{ fontSize: '0.72rem', color: 'var(--magenta)', marginBottom: 12 }}>
          ⚠️ {erro}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button style={S.btnSecondary} onClick={onBack} disabled={carregando}>← Voltar</button>
        <button
          style={{ ...S.btnPrimary, opacity: podeProsseguir && !carregando ? 1 : 0.4, cursor: podeProsseguir ? 'pointer' : 'not-allowed' }}
          onClick={handleConfirmar}
          disabled={!podeProsseguir || carregando}
        >
          {carregando ? 'Processando...' : metodo === 'cartao' ? 'Pagar →' : 'Confirmar →'}
        </button>
      </div>
    </div>
  )
}

// ── Step 5 — Confirmação ──────────────────────────────────────────────────────

function Step5({
  step1,
  step2,
  step3,
}: {
  step1: Partial<DadosStep1>
  step2: Partial<DadosStep2>
  step3: Partial<DadosStep3>
}) {
  const tiragem = TIRAGENS.find(t => t.id === step1.tiragemId)
  const moeda = step1.moeda ?? 'BRL'
  const urgencia = step1.urgencia ?? false
  const precoBRL = urgencia ? precoComUrgencia(tiragem?.precoBRL ?? 0) : (tiragem?.precoBRL ?? 0)

  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ fontSize: '3rem', marginBottom: 20 }}>🔮</div>

      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
        fontStyle: 'italic',
        fontWeight: 300,
        color: 'var(--ink)',
        marginBottom: 8,
        lineHeight: 1.2,
      }}>
        Agendamento confirmado.
      </h2>

      <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 32 }}>
        As cartas já sabem que você vem aí
      </p>

      <div style={{ ...S.resumoBox, textAlign: 'left', maxWidth: 480, margin: '0 auto 32px' }}>
        <div style={{ marginBottom: 6 }}>
          <span style={{ color: 'var(--muted)' }}>Tiragem: </span>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{tiragem?.nome}</span>
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ color: 'var(--muted)' }}>Idioma: </span>
          <span style={{ color: 'var(--ink)' }}>{IDIOMAS.find(i => i.value === step1.idioma)?.label}</span>
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ color: 'var(--muted)' }}>Data: </span>
          <span style={{ color: 'var(--ink)' }}>
            {step2.data}
            {step2.periodo ? ` · ${step2.periodo}` : step2.hora != null ? ` · ${String(step2.hora).padStart(2,'0')}h Lisboa` : ''}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--muted)' }}>Valor: </span>
          <span style={{ color: 'var(--ink)' }}>{formatarPreco(converterPreco(precoBRL, moeda), moeda)}</span>
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.85, maxWidth: 440, margin: '0 auto' }}>
        Você receberá um e-mail em{' '}
        <span style={{ color: 'var(--cyan)' }}>{step3.email}</span>{' '}
        em breve confirmando todos os detalhes do agendamento.
        <br /><br />
        Qualquer dúvida, me chama no WhatsApp{' '}
        <span style={{ color: 'var(--cyan)' }}>+351 939 189 631</span>.
      </p>
    </div>
  )
}

// Converte hora local de Lisboa (number) + data (YYYY-MM-DD) para ISO UTC
// Usa Intl para calcular o offset correto incluindo DST automaticamente
function lisboaHoraParaISO(data: string, horaLisboa: number): string {
  const probe = new Date(`${data}T12:00:00Z`)
  const horaProbeEmLisboa = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Lisbon', hour: 'numeric', hour12: false }).format(probe)
  )
  const offsetHoras = horaProbeEmLisboa - 12 // +1 no verão, 0 no inverno
  const horaUTC = ((horaLisboa - offsetHoras) % 24 + 24) % 24
  return `${data}T${String(horaUTC).padStart(2, '0')}:00:00.000Z`
}

// ── Função helper: criar evento no Cal.eu ────────────────────────────────

async function criarEventoCaleu(
  step1: Partial<DadosStep1>,
  step2: Partial<DadosStep2>,
  step3: Partial<DadosStep3>,
) {
  try {
    const tiragem = TIRAGENS.find(t => t.id === step1.tiragemId)
    if (!tiragem) {
      throw new Error(`Tiragem não encontrada: ${step1.tiragemId}`)
    }

    // Seleciona o eventTypeId baseado em tipo de tiragem e urgência
    let tipoEvento: 'ao-vivasso' | 'tiragem-urgente' | 'tiragem-padrao'
    
    if (tiragem.aoVivo) {
      tipoEvento = 'ao-vivasso'
    } else if (step1.urgencia) {
      tipoEvento = 'tiragem-urgente'
    } else {
      tipoEvento = 'tiragem-padrao'
    }

    const eventTypeId = CAL_EVENT_TYPES[tipoEvento]

    if (!eventTypeId) {
      throw new Error(`EventTypeId não configurado para tipo: ${tipoEvento}`)
    }

    // Monta o startTime para o Cal.eu:
    // - Tiragem regular: usa slotISO retornado pelo /api/cal/slots (já em UTC)
    // - Ao vivo / urgente: converte hora Lisboa → UTC
    let startTime: string
    if (step2.slotISO) {
      startTime = step2.slotISO
    } else if (step2.hora !== null && step2.hora !== undefined) {
      startTime = lisboaHoraParaISO(step2.data!, step2.hora)
    } else {
      throw new Error('Horário não selecionado')
    }

    console.log('[CLIENTE_CAL] Criando evento Cal.eu', {
      tipoEvento,
      eventTypeId,
      startTime,
      nome: step3.nome,
      email: step3.email,
      tiragem: tiragem.nome,
      urgencia: step1.urgencia,
    })

    const res = await fetch('/api/cal/agendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        eventTypeId,
        startTime,
        nome: step3.nome,
        email: step3.email,
        idioma: step1.idioma,
        tiragem: tiragem.nome,
        urgencia: step1.urgencia,
        nota: step3.nota,
        fusoCliente: step2.fusoTz,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[CLIENTE_CAL] Erro ao criar evento:', data)
      throw new Error(data.error || data.detail || 'Erro ao criar evento Cal.eu')
    }

    console.log('[CLIENTE_CAL] Evento criado com sucesso:', data)
    return {
      calBookingId: data.bookingId,
      calBookingUid: data.bookingUid,
    }
  } catch (error) {
    console.error('[CLIENTE_CAL] Falha ao criar evento:', error)
    throw error
  }
}

// ── Função helper: salvar agendamento no backend ────────────────────────────

async function salvarAgendamento(
  step1: Partial<DadosStep1>,
  step2: Partial<DadosStep2>,
  step3: Partial<DadosStep3>,
  metodoPagamento: MetodoPagamento | null,
  desconto: number,
  stripePaymentId?: string,
  calBookingId?: string,
  calBookingUid?: string,
) {
  const tiragem = TIRAGENS.find(t => t.id === step1.tiragemId)
  const precoBRL = step1.urgencia ? precoComUrgencia(tiragem?.precoBRL ?? 0) : (tiragem?.precoBRL ?? 0)
  const descontoValorBRL = precoBRL * (desconto / 100)
  const totalBRL = precoBRL - descontoValorBRL

  // Formata o contato completo (país + número para WhatsApp)
  let contatoCompleto = step3.contatoWhatsapp ?? ''
  if (step3.canal === 'whatsapp' && step3.contatoWhatsappPais) {
    contatoCompleto = `${step3.contatoWhatsappPais}${step3.contatoWhatsapp}`
  }

  const payload = {
    // Step 1
    tiragemId: step1.tiragemId,
    tiragemNome: tiragem?.nome,
    idioma: step1.idioma,
    urgencia: step1.urgencia,
    moeda: step1.moeda,
    precoBrl: precoBRL,
    cupomCodigo: step3.cupom,
    cupomDesconto: desconto,
    totalBrl: totalBRL,
    // Step 2
    dataAgendada: step2.data,
    horaLisboa: step2.hora ?? null,
    periodo: step2.periodo ?? null,
    fusoCliente: step2.fusoTz,
    // Step 3
    nome: step3.nome,
    email: step3.email,
    canal: step3.canal,
    contato: contatoCompleto,
    indicadoPor: step3.indicadoPor,
    nota: step3.nota,
    // Step 4
    metodoPagamento,
    stripePaymentId,
    // Cal.eu
    calBookingId,
    calBookingUid,
  }

  try {
    const res = await fetch('/api/agendamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[CLIENTE] Erro ao salvar agendamento:', data)
      throw new Error(data.error || data.detail || 'Erro ao processar agendamento')
    }

    console.log('[CLIENTE] Agendamento salvo com sucesso:', data)
    return data
  } catch (error) {
    console.error('[CLIENTE] Falha na requisição:', error)
    throw error
  }
}

// ── Wizard principal ──────────────────────────────────────────────────────────

export default function BookingWizard() {
  const [step, setStep] = useState(0)
  const [step1, setStep1] = useState<Partial<DadosStep1>>({ idioma: 'pt', moeda: 'BRL' })
  const [step2, setStep2] = useState<Partial<DadosStep2>>({ fusoTz: 'Europe/Lisbon' })
  const [step3, setStep3] = useState<Partial<DadosStep3>>({ canal: 'whatsapp', contatoWhatsappPais: '+55' })
  const [metodo, setMetodo] = useState<MetodoPagamento | null>(null)
  const [desconto, setDesconto] = useState(0)

  // Valida cupom ao sair do campo
  async function validarCupom(codigo: string) {
    if (!codigo) { setDesconto(0); return }
    const res = await fetch('/api/cupom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo }),
    })
    const data = await res.json()
    setDesconto(data.valido ? data.desconto : 0)
  }

  function cancelar() {
    setStep(0)
    setStep1({ idioma: 'pt', moeda: 'BRL' })
    setStep2({ fusoTz: 'Europe/Lisbon' })
    setStep3({ canal: 'whatsapp', contatoWhatsappPais: '+55' })
    setMetodo(null)
    setDesconto(0)
  }

  return (
    <section id="agendar" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '80px 48px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 24, height: 1, background: 'var(--cyan)' }} />
            <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--cyan)' }}>
              Agende já
            </span>
          </div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'var(--ink)',
            lineHeight: 1.15,
          }}>
            Tá na hora de entender o que você <span style={{ color: 'var(--magenta)', fontStyle: 'normal', fontWeight: 600 }}>já sabe.</span>
          </h2>
        </div>

        <ProgressBar atual={step} />

        {step === 0 && (
          <Step1
            dados={step1}
            onChange={setStep1}
            onNext={() => setStep(1)}
            onCancel={cancelar}
          />
        )}
        {step === 1 && (
          <Step2
            step1={step1}
            dados={step2}
            onChange={setStep2}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <Step3
            step1={step1}
            step2={step2}
            dados={step3}
            onChange={d => {
              setStep3(d)
              if (d.cupom !== step3.cupom) validarCupom(d.cupom ?? '')
            }}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step4
            step1={step1}
            step2={step2}
            step3={step3}
            desconto={desconto}
            metodo={metodo}
            onMetodo={setMetodo}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <Step5
            step1={step1}
            step2={step2}
            step3={step3}
          />
        )}
      </div>
    </section>
  )
}
