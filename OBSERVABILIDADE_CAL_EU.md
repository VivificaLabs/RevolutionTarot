# Observabilidade - Cal.eu Integration

## Fluxo de Logs para Rastrear Eventos Cal.eu

### 1. **Cliente — BookingWizard.tsx**

Logs prefixados com `[CLIENTE_CAL]`, `[STEP4_CARTAO]`, `[STEP4_CONFIRMAR]`, `[CLIENTE]`:

```
[CLIENTE_CAL] Criando evento Cal.eu  → Iniciância da criação
[CLIENTE_CAL] Evento criado com sucesso → Sucesso (retorna calBookingId e calBookingUid)
[CLIENTE_CAL] Falha ao criar evento → Erro (continua com undefined para IDs)
[CLIENTE] Agendamento salvo com sucesso → Confirmação em Supabase
[CLIENTE] Erro ao salvar agendamento → Falha em Supabase (bloqueia flow)
```

**Onde encontrar:** DevTools → Console (F12)

### 2. **Backend — POST /api/cal/agendar**

Logs prefixados com `[CAL_AGENDAR]` e `[CAL_AGENDAR_ERROR]`:

```
[CAL_AGENDAR] REQUEST_BODY_PARSED → Dados recebidos do cliente
[CAL_AGENDAR] CALEU_REQUEST_PAYLOAD → Payload enviado para Cal.eu API
[CAL_AGENDAR] CALEU_RESPONSE_STATUS → HTTP status da resposta
[CAL_AGENDAR] CALEU_RESPONSE_BODY → JSON retornado pelo Cal.eu
[CAL_AGENDAR] CALEU_BOOKING_SUCCESS → Evento criado: { bookingId, bookingUid }
[CAL_AGENDAR_ERROR] CALEU_API_ERROR → Status e erro do Cal.eu
```

**Onde encontrar:** `tail -f ~/.pm2/logs/server.log` ou console do servidor

### 3. **Backend — GET /api/cal/slots**

Logs prefixados com `[CAL_SLOTS]` e `[CAL_SLOTS_ERROR]`:

```
[CAL_SLOTS] REQUEST_PARAMS → eventTypeId, data recebidos
[CAL_SLOTS] TIME_RANGE_CALCULATED → startTime, endTime montados
[CAL_SLOTS] CALEU_REQUEST_URL → URL enviada para Cal.eu
[CAL_SLOTS] CALEU_RESPONSE_STATUS → HTTP status
[CAL_SLOTS] SLOTS_EXTRACTED → Quantidade de slots disponíveis
[CAL_SLOTS_ERROR] CALEU_API_ERROR → Falha em buscar slots
```

**Onde encontrar:** Server logs

### 4. **Backend — POST /api/agendamentos**

Logs prefixados com `[AGENDAMENTOS]` e `[AGENDAMENTOS_ERROR]`:

```
[AGENDAMENTOS] REQUEST_START → Requisição recebida
[AGENDAMENTOS] REQUEST_BODY_PARSED → Dados do cliente (email, nome, tiragemNome, metodoPagamento)
[AGENDAMENTOS] CLIENTE_CHECK_RESULT → Cliente existe em DB?
[AGENDAMENTOS] CLIENTE_INSERT_SUCCESS / UPDATE_SUCCESS → Cliente criado/atualizado
[AGENDAMENTOS] AGENDAMENTO_INSERT_SUCCESS → Agendamento salvo com ID
[AGENDAMENTOS] CUPOM_INCREMENT_SUCCESS → Cupom processado (se aplicável)
[AGENDAMENTOS] REQUEST_SUCCESS → Tudo ok: retorna agendamentoId
[AGENDAMENTOS_ERROR] — Qualquer erro em cada etapa
```

**Onde encontrar:** Server logs

### 5. **Backend — PATCH /api/agendamentos/update-cal**

Logs prefixados com `[UPDATE_CAL]` e `[UPDATE_CAL_ERROR]`:

```
[UPDATE_CAL] REQUEST_START → Requisição para atualizar Cal IDs
[UPDATE_CAL] AGENDAMENTO_UPDATE_SUCCESS → Cal IDs atualizados em Supabase
[UPDATE_CAL_ERROR] — Qualquer erro
```

**Use este endpoint se:** Cal.eu falhar inicialmente, mas depois você conseguir criar o evento manualmente ou reintentar.

---

## Checklist de Debugging — Cal.eu Events Faltando

### 1. Verificar se eventos estão sendo CRIADOS

```bash
# Grep nos logs para "CALEU_BOOKING_SUCCESS"
grep "CALEU_BOOKING_SUCCESS" ~/.pm2/logs/server.log
```

Se encontrar eventos com sucesso → events estão sendo criados no Cal.eu.
Se NÃO encontrar → **problema: eventos nunca foram tentados**.

### 2. Se eventos não estão sendo criados, verificar por quê

```bash
# A. Evento Cal.eu foi criado mas erro silencioso?
grep "CALEU_API_ERROR" ~/.pm2/logs/server.log

# B. EventTypeId não foi preenchido?
grep "EventTypeId não configurado" ~/.pm2/logs/server.log

# C. Cliente nunca chegou a pagar/confirmar?
grep "STEP4_CARTAO\|STEP4_CONFIRMAR" ~/.pm2/logs/browser-console.log  # DevTools
```

### 3. Se Cal.eu retorna erro, qual é?

```bash
# Ver resposta exata do Cal.eu
grep -A 3 "CALEU_RESPONSE_BODY" ~/.pm2/logs/server.log
```

Erros comuns:
- `"error": "Invalid eventTypeId"` → EventTypeId não existe em Cal.eu
- `"error": "Not authenticated"` → CAL_API_KEY inválida ou expirada
- `"error": "No availability"` → Nenhum slot disponível nessa data/hora
- `"error": "Invalid attendee email"` → Email do cliente inválido

### 4. Se slots estão vazios

```bash
# Verificar quantos slots foram retornados
grep "SLOTS_EXTRACTED" ~/.pm2/logs/server.log

# Se "count: 0" → nenhum slot disponível para essa data em Cal.eu
# Se "count: > 0" mas nada mostra no UI → problema no cliente, não no backend
```

### 5. Se tudo funciona mas Cal IDs não aparecem em Supabase

```sql
-- Query em Supabase:
SELECT id, email_cliente, cal_booking_id, cal_booking_uid FROM agendamentos
WHERE cal_booking_id IS NOT NULL
LIMIT 5;
```

Se vazio → eventos criados mas IDs não foram salvos (falha em Supabase).

---

## Como Integrar com Observabilidade (Datadog, Sentry, etc.)

### Estrutura de Logs (uniforme)

Todos os endpoints seguem este padrão:

```javascript
logInfo(step, data)     // console.log
logError(step, error)   // console.error
```

**Para Datadog (exemplo):**

```typescript
// app/lib/logger.ts
export function logInfo(step: string, data: any) {
  console.log(`[CONTEXT] ${new Date().toISOString()} | ${step}`, data)
  // dd_logs.send({ message: step, data, level: 'info' })
}

export function logError(step: string, error: any) {
  console.error(`[CONTEXT_ERROR] ${new Date().toISOString()} | ${step}`, error)
  // dd_logs.send({ message: step, error, level: 'error' })
}
```

Depois importar em cada rota e usar em vez de console.log direto.

### Dashboard Suggested

Track estes eventos em tempo real:

1. **CAL_AGENDAR success rate**: `CALEU_BOOKING_SUCCESS` / total requests
2. **CAL_SLOTS latency**: Time between `CALEU_REQUEST_URL` e `SLOTS_EXTRACTED`
3. **AGENDAMENTOS success rate**: `AGENDAMENTO_INSERT_SUCCESS` / total requests
4. **Cal.eu errors**: Count de `CALEU_API_ERROR` por tipo
5. **End-to-end conversion**: Usuários chegando em Step4 vs Agendamentos salvos

---

## Testando (Manual)

### 1. Simular criação de evento (curl)

```bash
curl -X POST https://example.com/api/cal/agendar \
  -H "Content-Type: application/json" \
  -d '{
    "eventTypeId": 123,
    "startTime": "2026-04-25T10:00:00.000Z",
    "nome": "João",
    "email": "joao@example.com",
    "idioma": "pt",
    "tiragem": "Tarot Express",
    "urgencia": false,
    "nota": "Teste",
    "fusoCliente": "Europe/Lisbon"
  }'
```

Resposta esperada:
```json
{
  "bookingId": 12345,
  "bookingUid": "abc123def456"
}
```

### 2. Verificar slots disponíveis

```bash
curl "https://example.com/api/cal/slots?eventTypeId=123&data=2026-04-25"
```

Resposta esperada:
```json
{
  "slots": ["10:00:00", "10:30:00", "11:00:00", ...]
}
```

---

## Próximos Passos

1. ✅ Adicioners logs completados
2. Next: Configurar agregação de logs (rsyslog / ELK / Datadog)
3. Next: Criar alertas para Cal.eu errors > threshold
4. Next: Dashboard de observabilidade em tempo real
