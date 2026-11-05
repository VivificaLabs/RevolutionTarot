export const LIMITES = {
  temaDescricao: 480,
  temaDescricaoCurta: 160,
  descricaoMedia: 500,
  descricaoCurta: 100,
  observacaoLivrosComplementares: 200,
}

export interface LivroComplementar {
  descritor?: string
  emoji?: string
  titulo: string
  autores: string[]
  url?: string
  nroPaginas?: number
  tags?: string[]
  observacao?: string
}

export interface ObraAudiovisual {
  descritor?: string
  emoji?: string
  titulo: string
  ondeEncontrar: string
  url?: string
  tags?: string[]
  observacao?: string
}

export interface Edicao {
  mes: string
  tema: {
    titulo: string
    descricaoCurta: string
    descricao: string
  }
  obraPrincipal: {
    titulo: string
    autores: string[]
    nroPaginas?: number
    tags?: string[]
    descricaoMedia: string
    descricaoCurta: string
    capa: string
  }
  livrosComplementares: LivroComplementar[]
  observacaoLivrosComplementares?: string
  audiovisual: ObraAudiovisual[]
}

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

export const REGEX_MES = /^\d{4}-(0[1-9]|1[0-2])$/

const DIA_LANCAMENTO = 15

// "2026-12" -> "DEZ/26"
export function formatarMes(mes: string) {
  const [ano, numero] = mes.split('-')
  return `${MESES[Number(numero) - 1]}/${ano.slice(2)}`
}

// ["A", "B", "C"] -> "A, B e C"
export function juntarNomes(nomes: string[]) {
  if (nomes.length < 2) return nomes.join('')
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`
}

// "AAAA-MM-DD" no horário de Brasília
export function hojeEmBrasilia(agora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(agora)
  const parte = (tipo: string) => partes.find(p => p.type === tipo)?.value
  return `${parte('year')}-${parte('month')}-${parte('day')}`
}

// "2026-12" -> "2027-01"
export function proximoMes(mes: string) {
  const [ano, numero] = mes.split('-').map(Number)
  return numero === 12 ? `${ano + 1}-01` : `${ano}-${String(numero + 1).padStart(2, '0')}`
}

// O tema de cada mês é lançado no dia 15 do mês anterior: fica em "Em Breve" até o mês chegar
export function separarEdicoes(edicoes: Edicao[], hoje: string) {
  const mes = hoje.slice(0, 7)
  const dia = Number(hoje.slice(8))
  const seguinte = proximoMes(mes)
  const jaLancou = dia >= DIA_LANCAMENTO

  const publicadas = [...edicoes]
    .filter(edicao => edicao.mes <= mes)
    .sort((a, b) => b.mes.localeCompare(a.mes))

  return {
    atual: publicadas[0] ?? null,
    anteriores: publicadas.slice(1),
    emBreve: jaLancou ? edicoes.find(edicao => edicao.mes === seguinte) ?? null : null,
    proximoLancamento: jaLancou ? null : { mes: seguinte, data: `${DIA_LANCAMENTO}/${mes.slice(5)}` },
  }
}

// [texto](https://...). Aceita um nível de parênteses dentro do link, como nos da Wikipédia
const REGEX_LINK = /\[([^[\]]+)\]\((https?:\/\/(?:[^\s()]|\([^\s()]*\))+)\)/

// "Leia [o artigo](https://x.com) hoje" -> [{ texto: 'Leia ' }, { texto: 'o artigo', url: 'https://x.com' }, { texto: ' hoje' }]
export function dividirLinks(texto: string) {
  const partes = texto.split(REGEX_LINK)
  const trechos: { texto: string; url?: string }[] = []
  for (let i = 0; i < partes.length; i += 3) {
    if (partes[i]) trechos.push({ texto: partes[i] })
    if (i + 1 < partes.length) trechos.push({ texto: partes[i + 1], url: partes[i + 2] })
  }
  return trechos
}

function ehTexto(valor: unknown): valor is string {
  return typeof valor === 'string' && valor.trim().length > 0
}

function ehUrl(valor: unknown) {
  return typeof valor === 'string' && /^https?:\/\/\S+$/.test(valor)
}

function validarTexto(erros: string[], valor: unknown, campo: string, limite?: number) {
  if (!ehTexto(valor)) {
    erros.push(`${campo} é obrigatório`)
    return
  }
  const tamanho = Array.from(valor).length
  if (limite && tamanho > limite) erros.push(`${campo} tem ${tamanho} caracteres (máximo ${limite})`)
}

// O limite conta só o texto visível: o endereço de um link não gasta caracteres
function validarDescricao(erros: string[], valor: unknown, campo: string, limite: number) {
  if (typeof valor !== 'string') {
    validarTexto(erros, valor, campo, limite)
    return
  }
  const trechos = dividirLinks(valor)
  validarTexto(erros, trechos.map(trecho => trecho.texto).join(''), campo, limite)
  if (trechos.some(trecho => !trecho.url && trecho.texto.includes(']('))) {
    erros.push(`${campo} tem um link mal escrito: use [texto](https://...)`)
  }
}

function validarAutores(erros: string[], valor: unknown, campo: string) {
  if (!Array.isArray(valor) || valor.length === 0 || !valor.every(ehTexto)) {
    erros.push(`${campo} precisa ser uma lista com pelo menos um nome`)
  }
}

function validarPaginas(erros: string[], valor: unknown, campo: string) {
  if (valor !== undefined && (!Number.isInteger(valor) || (valor as number) <= 0)) {
    erros.push(`${campo} precisa ser um número inteiro maior que zero, sem aspas (ex.: 123)`)
  }
}

function validarTags(erros: string[], valor: unknown, campo: string) {
  if (valor !== undefined && (!Array.isArray(valor) || !valor.every(ehTexto))) {
    erros.push(`${campo} precisa ser uma lista de textos (ex.: ["gratuito"])`)
  }
}

function validarObra(erros: string[], obra: Record<string, unknown>, campo: string) {
  validarTexto(erros, obra.titulo, `${campo}.titulo`)
  if (obra.descritor !== undefined && (typeof obra.descritor !== 'string' || !/^[A-Z]{1,3}$/.test(obra.descritor))) {
    erros.push(`${campo}.descritor precisa ter de 1 a 3 letras maiúsculas (ex.: PT, ES, ENG)`)
  }
  // Emojis como 1️⃣ começam com um dígito, então são retirados antes de procurar texto digitado
  if (obra.emoji !== undefined && (!ehTexto(obra.emoji) || /[A-Za-z0-9]/.test(obra.emoji.replace(/\d️?⃣/g, '')))) {
    erros.push(`${campo}.emoji não pode ter letras nem números`)
  }
  if (obra.url !== undefined && !ehUrl(obra.url)) erros.push(`${campo}.url precisa começar com http:// ou https://`)
  validarTags(erros, obra.tags, `${campo}.tags`)
  if (obra.observacao !== undefined && !ehTexto(obra.observacao)) {
    erros.push(`${campo}.observacao precisa ser um texto (ou remova o campo)`)
  }
}

function comoLista(valor: unknown, campo: string, erros: string[]) {
  if (Array.isArray(valor)) return valor as Record<string, unknown>[]
  erros.push(`${campo} precisa ser uma lista (pode ser vazia)`)
  return []
}

// Devolve a lista de erros encontrados, em português, para aparecer no log do deploy
export function validarEdicao(dados: unknown, nomeArquivo: string): string[] {
  if (typeof dados !== 'object' || dados === null || Array.isArray(dados)) return ['o arquivo precisa conter um objeto JSON']

  const erros: string[] = []
  const edicao = dados as Record<string, unknown>
  const nomeSemExtensao = nomeArquivo.replace(/\.json$/, '')

  if (!REGEX_MES.test(nomeSemExtensao)) erros.push('o nome do arquivo precisa ser AAAA-MM.json (ex.: 2026-12.json)')
  if (typeof edicao.mes !== 'string' || !REGEX_MES.test(edicao.mes)) erros.push('mes precisa estar no formato AAAA-MM (ex.: 2026-12)')
  else if (edicao.mes !== nomeSemExtensao) erros.push(`mes (${edicao.mes}) precisa ser igual ao nome do arquivo (${nomeSemExtensao})`)

  const tema = (edicao.tema ?? {}) as Record<string, unknown>
  validarTexto(erros, tema.titulo, 'tema.titulo')
  validarDescricao(erros, tema.descricaoCurta, 'tema.descricaoCurta', LIMITES.temaDescricaoCurta)
  validarDescricao(erros, tema.descricao, 'tema.descricao', LIMITES.temaDescricao)

  const principal = (edicao.obraPrincipal ?? {}) as Record<string, unknown>
  validarTexto(erros, principal.titulo, 'obraPrincipal.titulo')
  validarAutores(erros, principal.autores, 'obraPrincipal.autores')
  validarPaginas(erros, principal.nroPaginas, 'obraPrincipal.nroPaginas')
  validarTags(erros, principal.tags, 'obraPrincipal.tags')
  validarDescricao(erros, principal.descricaoMedia, 'obraPrincipal.descricaoMedia', LIMITES.descricaoMedia)
  validarDescricao(erros, principal.descricaoCurta, 'obraPrincipal.descricaoCurta', LIMITES.descricaoCurta)
  if (typeof principal.capa !== 'string' || !/^[\w-]+\.(jpg|jpeg|png|webp)$/.test(principal.capa)) {
    erros.push('obraPrincipal.capa precisa ser o nome de um arquivo .jpg, .jpeg, .png ou .webp')
  }

  comoLista(edicao.livrosComplementares, 'livrosComplementares', erros).forEach((livro, i) => {
    const campo = `livrosComplementares[${i}]`
    validarObra(erros, livro, campo)
    validarAutores(erros, livro.autores, `${campo}.autores`)
    validarPaginas(erros, livro.nroPaginas, `${campo}.nroPaginas`)
  })

  if (edicao.observacaoLivrosComplementares !== undefined) {
    validarDescricao(erros, edicao.observacaoLivrosComplementares, 'observacaoLivrosComplementares', LIMITES.observacaoLivrosComplementares)
  }

  comoLista(edicao.audiovisual, 'audiovisual', erros).forEach((obra, i) => {
    const campo = `audiovisual[${i}]`
    validarObra(erros, obra, campo)
    validarTexto(erros, obra.ondeEncontrar, `${campo}.ondeEncontrar`)
  })

  return erros
}
