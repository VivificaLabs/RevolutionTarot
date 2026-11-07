/**
 * lib/__tests__/revoleituras.test.ts
 * Testes do conteúdo mensal do Revoleituras, incluindo os arquivos reais de content/revoleituras
 *
 * Rodar: npm test lib/__tests__/revoleituras.test.ts
 */

import fs from 'fs'
import os from 'os'
import path from 'path'
import { calcularAgenda, dividirLinks, formatarMes, hojeEmLisboa, juntarNomes, LIMITES, proximoMes, separarEdicoes, validarEdicao, type Edicao } from '@/lib/revoleituras'
import { carregarEdicoes, dataDeHoje } from '@/lib/revoleituras-conteudo'

function criarEdicao(mes = '2026-12'): Edicao {
  return {
    mes,
    tema: { titulo: 'Tema', descricaoCurta: 'Descrição curta do tema', descricao: 'Descrição do tema' },
    obraPrincipal: {
      titulo: 'Livro',
      autores: ['Autora'],
      descricaoMedia: 'Descrição média',
      descricaoCurta: 'Descrição curta',
      capa: `${mes}.jpg`,
    },
    livrosComplementares: [{ descritor: 'PT', titulo: 'Outro', autores: ['Autor'] }],
    audiovisual: [{ descritor: 'ENG', emoji: '🎬', titulo: 'Filme', ondeEncontrar: 'YouTube', url: 'https://youtube.com/x' }],
  }
}

// ── FORMATAÇÃO ────────────────────────────────────────────────────────────────

describe('formatarMes', () => {
  it('gera o rótulo curto do mês', () => {
    expect(formatarMes('2026-12')).toBe('DEZ/26')
    expect(formatarMes('2027-01')).toBe('JAN/27')
  })
})

describe('juntarNomes', () => {
  it('junta um, dois ou mais nomes', () => {
    expect(juntarNomes(['A'])).toBe('A')
    expect(juntarNomes(['A', 'B'])).toBe('A e B')
    expect(juntarNomes(['A', 'B', 'C'])).toBe('A, B e C')
  })
})

describe('dividirLinks', () => {
  it('deixa texto sem link inteiro', () => {
    expect(dividirLinks('Só texto.')).toEqual([{ texto: 'Só texto.' }])
    expect(dividirLinks('Texto com [sic] e (parênteses).')).toEqual([{ texto: 'Texto com [sic] e (parênteses).' }])
  })

  it('separa links no começo, no meio e no fim', () => {
    expect(dividirLinks('[A](https://a.com) meio [B](http://b.com/x?y=1#z) fim [C](https://c.com)')).toEqual([
      { texto: 'A', url: 'https://a.com' },
      { texto: ' meio ' },
      { texto: 'B', url: 'http://b.com/x?y=1#z' },
      { texto: ' fim ' },
      { texto: 'C', url: 'https://c.com' },
    ])
  })

  it('aceita parênteses dentro do endereço, como na Wikipédia', () => {
    expect(dividirLinks('Veja [isto](https://pt.wikipedia.org/wiki/Brasil_(pa%C3%ADs)).')).toEqual([
      { texto: 'Veja ' },
      { texto: 'isto', url: 'https://pt.wikipedia.org/wiki/Brasil_(pa%C3%ADs)' },
      { texto: '.' },
    ])
  })

  it('não transforma em link endereços que não sejam http(s)', () => {
    const texto = '[clique](javascript:alert(1))'
    expect(dividirLinks(texto)).toEqual([{ texto }])
  })
})

describe('hojeEmLisboa', () => {
  it('usa o horário de inverno de Lisboa na virada do mês', () => {
    expect(hojeEmLisboa(new Date('2026-12-31T23:59:00Z'))).toBe('2026-12-31')
    expect(hojeEmLisboa(new Date('2027-01-01T00:00:00Z'))).toBe('2027-01-01')
  })

  it('usa o horário de verão de Lisboa no dia do lançamento', () => {
    expect(hojeEmLisboa(new Date('2027-07-14T22:59:00Z'))).toBe('2027-07-14')
    expect(hojeEmLisboa(new Date('2027-07-14T23:00:00Z'))).toBe('2027-07-15')
  })
})

describe('proximoMes', () => {
  it('avança o mês e vira o ano', () => {
    expect(proximoMes('2026-09')).toBe('2026-10')
    expect(proximoMes('2026-12')).toBe('2027-01')
  })
})

describe('dataDeHoje', () => {
  const ambiente = process.env
  afterEach(() => { process.env = ambiente })

  it('aceita a data simulada fora de produção', () => {
    process.env = { ...ambiente, NODE_ENV: 'development', REVOLEITURAS_DATA_SIMULADA: '2026-12-15' }
    expect(dataDeHoje()).toBe('2026-12-15')
  })

  it('ignora a data simulada em produção', () => {
    process.env = { ...ambiente, NODE_ENV: 'production', REVOLEITURAS_DATA_SIMULADA: '2000-01-01' }
    expect(dataDeHoje()).toBe(hojeEmLisboa())
  })
})

// ── SEPARAÇÃO POR MÊS ─────────────────────────────────────────────────────────

describe('separarEdicoes', () => {
  const edicoes = ['2026-12', '2027-02', '2027-01', '2027-03'].map(criarEdicao)
  const meses = (lista: Edicao[]) => lista.map(e => e.mes)

  it('mostra o mês corrente e deixa os passados em ordem do mais novo ao mais antigo', () => {
    const { atual, anteriores } = separarEdicoes(edicoes, '2027-02-01')
    expect(atual?.mes).toBe('2027-02')
    expect(meses(anteriores)).toEqual(['2027-01', '2026-12'])
  })

  it('até o dia 14 esconde o próximo tema, mesmo com o arquivo já enviado', () => {
    const { atual, emBreve, proximoLancamento } = separarEdicoes(edicoes, '2026-12-14')
    expect(atual?.mes).toBe('2026-12')
    expect(emBreve).toBeNull()
    expect(proximoLancamento).toEqual({ mes: '2027-01', data: '15/12' })
  })

  it('a partir do dia 15 lança o próximo tema, sem tirar o atual do lugar', () => {
    const { atual, anteriores, emBreve, proximoLancamento } = separarEdicoes(edicoes, '2026-12-15')
    expect(atual?.mes).toBe('2026-12')
    expect(anteriores).toEqual([])
    expect(emBreve?.mes).toBe('2027-01')
    expect(proximoLancamento).toBeNull()
  })

  it('no dia 1º o tema sai de Em Breve e o anterior vai para Anteriormente', () => {
    const { atual, anteriores, emBreve } = separarEdicoes(edicoes, '2027-01-01')
    expect(atual?.mes).toBe('2027-01')
    expect(meses(anteriores)).toEqual(['2026-12'])
    expect(emBreve).toBeNull()
  })

  it('nunca lança um tema de dois meses à frente', () => {
    expect(separarEdicoes(edicoes, '2026-12-31').emBreve?.mes).toBe('2027-01')
    expect(separarEdicoes(['2027-02'].map(criarEdicao), '2026-12-31').emBreve).toBeNull()
  })

  it('depois do dia 15, sem arquivo, Em Breve fica vazio e sem data prometida', () => {
    const { emBreve, proximoLancamento } = separarEdicoes(['2026-12'].map(criarEdicao), '2026-12-20')
    expect(emBreve).toBeNull()
    expect(proximoLancamento).toBeNull()
  })

  it('mantém o último tema publicado se um mês ficar sem arquivo', () => {
    expect(separarEdicoes(['2026-12', '2027-01'].map(criarEdicao), '2027-05-01').atual?.mes).toBe('2027-01')
  })

  it('antes do primeiro lançamento não revela nada', () => {
    const { atual, anteriores, emBreve, proximoLancamento } = separarEdicoes(edicoes, '2026-11-03')
    expect(atual).toBeNull()
    expect(anteriores).toEqual([])
    expect(emBreve).toBeNull()
    expect(proximoLancamento).toEqual({ mes: '2026-12', data: '15/11' })
  })

  it('entre o primeiro lançamento e o mês chegar, o tema aparece só em Em Breve', () => {
    const { atual, emBreve } = separarEdicoes(edicoes, '2026-11-15')
    expect(atual).toBeNull()
    expect(emBreve?.mes).toBe('2026-12')
  })

  it('funciona sem nenhum arquivo', () => {
    expect(separarEdicoes([], '2026-12-01')).toEqual({ atual: null, anteriores: [], emBreve: null, proximoLancamento: { mes: '2027-01', data: '15/12' } })
  })
})

// ── AGENDA ────────────────────────────────────────────────────────────────────

describe('calcularAgenda', () => {
  const dezembro = criarEdicao('2026-12')
  const janeiro = criarEdicao('2027-01')

  it('antes do dia 15 mostra as próximas datas sem revelar o livro', () => {
    expect(calcularAgenda('2026-11-05', null, null)).toEqual({
      lancamento: '15/11', inicio: '01/12', prazoPostagem: '25/12', livro: null, emLeitura: null, revelacao: '15/11',
    })
  })

  it('no dia 15 mantém a data do dia e já mostra o livro em Em Breve', () => {
    expect(calcularAgenda('2026-11-15', null, dezembro)).toEqual({
      lancamento: '15/11', inicio: '01/12', prazoPostagem: '25/12', livro: { titulo: 'Livro', secao: '#em-breve' }, emLeitura: null, revelacao: null,
    })
  })

  it('depois do dia 15 avança o lançamento para o mês seguinte', () => {
    expect(calcularAgenda('2026-11-16', null, dezembro).lancamento).toBe('15/12')
  })

  it('no dia 1º aponta para o Livro do Mês, sem repetir o livro em leitura', () => {
    expect(calcularAgenda('2026-12-01', dezembro, null)).toEqual({
      lancamento: '15/12', inicio: '01/12', prazoPostagem: '25/12', livro: { titulo: 'Livro', secao: '#livro-do-mes' }, emLeitura: null, revelacao: null,
    })
  })

  it('no dia 2 avança o início, esconde o próximo livro e mostra o livro em leitura', () => {
    expect(calcularAgenda('2026-12-02', dezembro, null)).toEqual({
      lancamento: '15/12', inicio: '01/01', prazoPostagem: '25/12', livro: null, emLeitura: 'Livro', revelacao: '15/12',
    })
  })

  it('o prazo de postagem vale até o próprio dia 25 e depois avança', () => {
    expect(calcularAgenda('2026-12-25', dezembro, janeiro).prazoPostagem).toBe('25/12')
    expect(calcularAgenda('2026-12-26', dezembro, janeiro).prazoPostagem).toBe('25/01')
  })

  it('vira o ano, com o livro em leitura e o próximo lado a lado', () => {
    expect(calcularAgenda('2026-12-20', dezembro, janeiro)).toEqual({
      lancamento: '15/01', inicio: '01/01', prazoPostagem: '25/12',
      livro: { titulo: 'Livro', secao: '#em-breve' }, emLeitura: 'Livro', revelacao: null,
    })
  })

  it('sem arquivo depois do dia 15 não promete data de revelação', () => {
    expect(calcularAgenda('2026-12-20', dezembro, null)).toEqual({
      lancamento: '15/01', inicio: '01/01', prazoPostagem: '25/12', livro: null, emLeitura: 'Livro', revelacao: null,
    })
  })

  it('no dia 1º sem arquivo do mês não aponta para um livro antigo', () => {
    expect(calcularAgenda('2027-01-01', dezembro, null).livro).toBeNull()
  })
})

// ── VALIDAÇÃO ─────────────────────────────────────────────────────────────────

describe('validarEdicao', () => {
  // any de propósito: estes testes precisam montar edições fora do formato
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validar = (ajustar: (e: any) => void) => {
    const edicao = criarEdicao()
    ajustar(edicao)
    return validarEdicao(edicao, '2026-12.json').join(' | ')
  }

  it('aceita uma edição completa, com listas vazias e sem opcionais', () => {
    expect(validarEdicao(criarEdicao(), '2026-12.json')).toEqual([])
    expect(validar(e => { e.livrosComplementares = []; e.audiovisual = [] })).toBe('')
    expect(validar(e => { delete e.audiovisual[0].url; delete e.audiovisual[0].emoji })).toBe('')
  })

  it('aceita textos exatamente no limite, contando emoji como um caractere', () => {
    expect(validar(e => { e.obraPrincipal.descricaoCurta = 'a'.repeat(LIMITES.descricaoCurta) })).toBe('')
    expect(validar(e => { e.obraPrincipal.descricaoCurta = '👀'.repeat(LIMITES.descricaoCurta) })).toBe('')
  })

  it('recusa textos acima do limite, dizendo o tamanho', () => {
    expect(validar(e => { e.tema.descricao = 'a'.repeat(480) })).toBe('')
    expect(validar(e => { e.tema.descricao = 'a'.repeat(481) })).toContain('tema.descricao tem 481 caracteres (máximo 480)')
    expect(validar(e => { e.tema.descricaoCurta = 'a'.repeat(161) })).toContain('tema.descricaoCurta tem 161 caracteres (máximo 160)')
    expect(validar(e => { delete e.tema.descricaoCurta })).toContain('tema.descricaoCurta é obrigatório')
    expect(validar(e => { e.obraPrincipal.descricaoMedia = 'a'.repeat(501) })).toContain('descricaoMedia')
    expect(validar(e => { e.obraPrincipal.descricaoCurta = 'a'.repeat(101) })).toContain('descricaoCurta')
  })

  it('nos limites das descrições, conta só o texto visível dos links', () => {
    const link = `[${'a'.repeat(100)}](https://exemplo.com/${'b'.repeat(300)})`
    expect(validar(e => { e.obraPrincipal.descricaoCurta = link })).toBe('')
    expect(validar(e => { e.obraPrincipal.descricaoCurta = `${link}!` })).toContain('descricaoCurta tem 101 caracteres')
  })

  it('aceita links nas quatro descrições', () => {
    const texto = 'Veja [isto](https://exemplo.com).'
    expect(validar(e => {
      e.tema.descricao = texto
      e.tema.descricaoCurta = texto
      e.obraPrincipal.descricaoMedia = texto
      e.obraPrincipal.descricaoCurta = texto
    })).toBe('')
  })

  it('recusa links mal escritos, dizendo o campo', () => {
    for (const texto of ['[isto](exemplo.com)', '[isto](https://exemplo .com)', '[isto](javascript:alert(1))', '[isto](https://exemplo.com']) {
      expect(validar(e => { e.tema.descricao = texto })).toContain('tema.descricao tem um link mal escrito')
    }
  })

  it('não confunde colchetes e parênteses comuns com link', () => {
    expect(validar(e => { e.tema.descricao = 'Texto [sic] com (parênteses) normais.' })).toBe('')
  })

  it('recusa descrição que contém só um link sem texto', () => {
    expect(validar(e => { e.tema.descricao = '[ ](https://exemplo.com)' })).toContain('tema.descricao é obrigatório')
  })

  it('recusa campo obrigatório faltando ou vazio', () => {
    expect(validar(e => { delete e.tema })).toContain('tema.titulo é obrigatório')
    expect(validar(e => { e.obraPrincipal.titulo = '   ' })).toContain('obraPrincipal.titulo é obrigatório')
    expect(validar(e => { e.obraPrincipal.autores = [] })).toContain('obraPrincipal.autores')
    expect(validar(e => { delete e.audiovisual })).toContain('audiovisual precisa ser uma lista')
    expect(validar(e => { delete e.audiovisual[0].ondeEncontrar })).toContain('audiovisual[0].ondeEncontrar')
  })

  it('confere o mês com o nome do arquivo', () => {
    expect(validarEdicao(criarEdicao('2027-01'), '2026-12.json').join()).toContain('igual ao nome do arquivo')
    expect(validarEdicao(criarEdicao('2026-13'), '2026-13.json').join()).toContain('AAAA-MM')
    expect(validarEdicao(criarEdicao(), 'dezembro.json').join()).toContain('nome do arquivo precisa ser')
  })

  it('aceita url opcional nos livros complementares e recusa endereço inválido', () => {
    expect(validar(e => { e.livrosComplementares[0].url = 'https://exemplo.com/livro' })).toBe('')
    for (const url of ['exemplo.com', 'javascript:alert(1)', '']) {
      expect(validar(e => { e.livrosComplementares[0].url = url })).toContain('livrosComplementares[0].url')
    }
  })

  it('aceita tituloCurto opcional de até 30 caracteres', () => {
    expect(validar(e => { e.tema.tituloCurto = 'Constituição' })).toBe('')
    expect(validar(e => { e.tema.tituloCurto = 'a'.repeat(31) })).toContain('tema.tituloCurto tem 31 caracteres (máximo 30)')
    expect(validar(e => { e.tema.tituloCurto = '' })).toContain('tema.tituloCurto é obrigatório')
  })

  it('aceita recomendações de membros nos formatos de livro e de audiovisual', () => {
    expect(validar(e => {
      e.recomendacoesMembros = [
        { descritor: 'BR', emoji: '📚', titulo: 'Livro', autores: ['Autora'], nroPaginas: 120, sugeridoPor: 'Fulana', comentario: 'Gostei' },
        { titulo: 'Filme', ondeEncontrar: 'YouTube', url: 'https://youtube.com/x', sugeridoPor: 'Siclana' },
      ]
    })).toBe('')
  })

  it('recusa recomendação sem quem sugeriu ou com campos inválidos', () => {
    const base = { titulo: 'Livro', sugeridoPor: 'Fulana' }
    expect(validar(e => { e.recomendacoesMembros = [{ titulo: 'Livro' }] })).toContain('recomendacoesMembros[0].sugeridoPor é obrigatório')
    expect(validar(e => { e.recomendacoesMembros = [{ ...base, comentario: 'a'.repeat(201) }] })).toContain('recomendacoesMembros[0].comentario tem 201')
    expect(validar(e => { e.recomendacoesMembros = [{ ...base, autores: [] }] })).toContain('recomendacoesMembros[0].autores')
    expect(validar(e => { e.recomendacoesMembros = [{ ...base, url: 'exemplo.com' }] })).toContain('recomendacoesMembros[0].url')
    expect(validar(e => { e.recomendacoesMembros = [{ ...base, nroPaginas: '12' }] })).toContain('recomendacoesMembros[0].nroPaginas')
    expect(validar(e => { e.recomendacoesMembros = 'nada' })).toContain('recomendacoesMembros precisa ser uma lista')
  })

  it('aceita observação opcional da lista de livros, com link fora da contagem', () => {
    expect(validar(e => { e.observacaoLivrosComplementares = 'Veja [esta lista](https://exemplo.com/lojas).' })).toBe('')
    expect(validar(e => { e.observacaoLivrosComplementares = 'a'.repeat(200) })).toBe('')
  })

  it('recusa observação da lista inválida', () => {
    expect(validar(e => { e.observacaoLivrosComplementares = 'a'.repeat(201) })).toContain('observacaoLivrosComplementares tem 201 caracteres (máximo 200)')
    expect(validar(e => { e.observacaoLivrosComplementares = '' })).toContain('observacaoLivrosComplementares é obrigatório')
    expect(validar(e => { e.observacaoLivrosComplementares = '[isto](exemplo.com)' })).toContain('observacaoLivrosComplementares tem um link mal escrito')
  })

  it('aceita tags opcionais na obra principal e nas duas listas', () => {
    expect(validar(e => {
      e.obraPrincipal.tags = ['gratuito']
      e.livrosComplementares[0].tags = ['gratuito', 'PDF']
      e.audiovisual[0].tags = ['gratuito']
    })).toBe('')
    expect(validar(e => { e.livrosComplementares[0].tags = [] })).toBe('')
  })

  it('recusa tags fora do formato de lista de textos', () => {
    for (const tags of ['gratuito', [''], ['   '], [1], null]) {
      expect(validar(e => { e.obraPrincipal.tags = tags })).toContain('obraPrincipal.tags')
      expect(validar(e => { e.livrosComplementares[0].tags = tags })).toContain('livrosComplementares[0].tags')
      expect(validar(e => { e.audiovisual[0].tags = tags })).toContain('audiovisual[0].tags')
    }
  })

  it('aceita nroPaginas opcional na obra principal e nos livros complementares', () => {
    expect(validar(e => {
      e.obraPrincipal.nroPaginas = 123
      e.livrosComplementares[0].nroPaginas = 1
    })).toBe('')
  })

  it('recusa nroPaginas que não seja um inteiro positivo', () => {
    for (const nroPaginas of ['123', 0, -5, 12.5, null]) {
      expect(validar(e => { e.obraPrincipal.nroPaginas = nroPaginas })).toContain('obraPrincipal.nroPaginas')
      expect(validar(e => { e.livrosComplementares[0].nroPaginas = nroPaginas })).toContain('livrosComplementares[0].nroPaginas')
    }
  })

  it('aceita livros e obras sem descritor', () => {
    expect(validar(e => {
      delete e.livrosComplementares[0].descritor
      delete e.audiovisual[0].descritor
    })).toBe('')
  })

  it('aceita descritores novos de até 3 letras e recusa os outros', () => {
    expect(validar(e => { e.livrosComplementares[0].descritor = 'FRA' })).toBe('')
    for (const descritor of ['LIVR', 'pt', 'P1', '']) {
      expect(validar(e => { e.livrosComplementares[0].descritor = descritor })).toContain('descritor')
    }
  })

  it('aceita qualquer emoji e recusa texto no campo emoji', () => {
    for (const emoji of ['🇧🇷', '🇪🇸', '📖', '🎬', '👩🏽‍💻', '1️⃣', '❤️']) {
      expect(validar(e => { e.livrosComplementares[0].emoji = emoji })).toBe('')
    }
    expect(validar(e => { e.livrosComplementares[0].emoji = '1' })).toContain('emoji')
    expect(validar(e => { e.livrosComplementares[0].emoji = 'BR' })).toContain('emoji')
  })

  it('recusa url que não seja http(s) e nome de capa perigoso', () => {
    expect(validar(e => { e.audiovisual[0].url = 'javascript:alert(1)' })).toContain('url')
    expect(validar(e => { e.obraPrincipal.capa = '../segredo.jpg' })).toContain('capa')
    expect(validar(e => { e.obraPrincipal.capa = 'capa.gif' })).toContain('capa')
  })

  it('recusa conteúdo que não é um objeto', () => {
    expect(validarEdicao([], '2026-12.json')).toHaveLength(1)
    expect(validarEdicao(null, '2026-12.json')).toHaveLength(1)
  })
})

// ── LEITURA DOS ARQUIVOS ──────────────────────────────────────────────────────

describe('carregarEdicoes', () => {
  it('os arquivos reais de content/revoleituras estão válidos e com capa', () => {
    expect(() => carregarEdicoes()).not.toThrow()
  })

  describe('com arquivos de teste', () => {
    let pasta: string
    beforeEach(() => { pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'revoleituras-')) })
    afterEach(() => { fs.rmSync(pasta, { recursive: true }) })

    const salvar = (nome: string, conteudo: string) => fs.writeFileSync(path.join(pasta, nome), conteudo)

    it('lê os JSON e ignora outros arquivos, como o README', () => {
      salvar('2026-12.json', JSON.stringify(criarEdicao()))
      salvar('2026-12.jpg', '')
      salvar('README.md', '# oi')
      expect(carregarEdicoes(pasta, pasta).map(e => e.mes)).toEqual(['2026-12'])
    })

    it('avisa qual arquivo tem JSON quebrado', () => {
      salvar('2026-12.json', '{ quebrado')
      expect(() => carregarEdicoes(pasta, pasta)).toThrow(/2026-12\.json: JSON inválido/)
    })

    it('avisa quando a capa não foi enviada', () => {
      salvar('2026-12.json', JSON.stringify(criarEdicao()))
      expect(() => carregarEdicoes(pasta, pasta)).toThrow(/capa 2026-12\.jpg não está/)
    })

    it('lista os erros de todos os arquivos de uma vez', () => {
      salvar('2026-12.json', JSON.stringify({ ...criarEdicao(), tema: {} }))
      salvar('2027-01.json', '{ quebrado')
      salvar('2026-12.jpg', '')
      expect(() => carregarEdicoes(pasta, pasta)).toThrow(/2026-12\.json: tema\.titulo[\s\S]*2027-01\.json: JSON inválido/)
    })
  })
})
