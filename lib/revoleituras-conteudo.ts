import fs from 'fs'
import path from 'path'
import { hojeEmLisboa, validarEdicao, type Edicao } from './revoleituras'

export const PASTA_EDICOES = path.join(process.cwd(), 'content/revoleituras')
export const PASTA_CAPAS = path.join(process.cwd(), 'public/revoleituras/capas')

// Para ver o site em outra data, use REVOLEITURAS_DATA_SIMULADA=AAAA-MM-DD no .env.local. Nunca vale em produção
export function dataDeHoje() {
  const simulada = process.env.NODE_ENV !== 'production' && process.env.REVOLEITURAS_DATA_SIMULADA
  return simulada || hojeEmLisboa()
}

// Só roda no servidor. Um arquivo com erro derruba o build de propósito: o deploy falha e o site fica na versão anterior
export function carregarEdicoes(pastaEdicoes = PASTA_EDICOES, pastaCapas = PASTA_CAPAS): Edicao[] {
  const arquivos = fs.readdirSync(pastaEdicoes).filter(arquivo => arquivo.endsWith('.json'))
  const problemas: string[] = []

  const edicoes = arquivos.map(arquivo => {
    let dados: unknown
    try {
      dados = JSON.parse(fs.readFileSync(path.join(pastaEdicoes, arquivo), 'utf-8'))
    } catch (erro) {
      problemas.push(`${arquivo}: JSON inválido (${(erro as Error).message})`)
      return null
    }

    const erros = validarEdicao(dados, arquivo)
    const edicao = dados as Edicao
    if (typeof edicao.obraPrincipal?.capa === 'string' && !fs.existsSync(path.join(pastaCapas, edicao.obraPrincipal.capa))) {
      erros.push(`a capa ${edicao.obraPrincipal.capa} não está em public/revoleituras/capas`)
    }
    erros.forEach(erro => problemas.push(`${arquivo}: ${erro}`))
    return erros.length === 0 ? edicao : null
  })

  if (problemas.length > 0) throw new Error(`Revoleituras: corrija os arquivos de conteúdo:\n- ${problemas.join('\n- ')}`)

  return edicoes.filter((edicao): edicao is Edicao => edicao !== null)
}
