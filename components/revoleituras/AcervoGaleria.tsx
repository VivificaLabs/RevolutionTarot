'use client'

import { useEffect, useRef, useState, type MouseEvent, type FocusEvent } from 'react'
import Image from 'next/image'
import BadgePaginas from './BadgePaginas'
import ListasObras from './ListasObras'
import Tags from './Tags'
import TextoComLinks from './TextoComLinks'
import { formatarMes, juntarNomes, type Edicao } from '@/lib/revoleituras'

const LARGURA_CARD = 260

// Abre o card para o lado onde houver espaço na tela
function posicionarCard(e: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>) {
  const botao = e.currentTarget
  const caixa = botao.getBoundingClientRect()
  botao.dataset.lado = caixa.right + LARGURA_CARD + 12 > window.innerWidth ? 'esquerda' : 'direita'
}

export default function AcervoGaleria({ edicoes }: { edicoes: Edicao[] }) {
  const [aberta, setAberta] = useState<Edicao | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !aberta) return
    dialog.showModal()
    dialog.scrollTop = 0
    // A página por trás não rola enquanto o acervo está aberto
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = '' }
  }, [aberta])

  const fechar = () => dialogRef.current?.close()

  return (
    <>
      <ul className="rl-acervo">
        {edicoes.map(edicao => {
          const { mes, tema, obraPrincipal } = edicao
          return (
            <li key={mes}>
              <button
                type="button"
                className="rl-acervo-item"
                aria-label={`Ver o acervo de ${formatarMes(mes)}: ${tema.titulo}`}
                onMouseEnter={posicionarCard}
                onFocus={posicionarCard}
                onClick={() => setAberta(edicao)}
              >
                <Image
                  src={`/revoleituras/capas/${obraPrincipal.capa}`}
                  alt=""
                  width={600}
                  height={900}
                  sizes="120px"
                  className="rl-capa"
                />
                <span className="rl-acervo-card" aria-hidden="true">
                  <span className="rl-acervo-card-tema">{formatarMes(mes)} - {tema.tituloCurto ?? tema.titulo}</span>
                  <span className="rl-acervo-card-livro">{obraPrincipal.titulo}</span>
                  <span className="rl-acervo-card-autores">de {juntarNomes(obraPrincipal.autores)}</span>
                  <span className="rl-acervo-card-acao">Clique na capa para ver mais</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <dialog
        ref={dialogRef}
        className="rl-modal"
        aria-labelledby="rl-modal-titulo"
        onClose={() => setAberta(null)}
        onClick={e => { if (e.target === e.currentTarget) fechar() }}
      >
        {aberta && (
          <div className="rl-modal-topo">
            <button type="button" className="rl-modal-fechar" aria-label="Fechar" onClick={fechar}>✕</button>
          </div>
        )}
        {aberta && (
          <div className="rl-modal-conteudo">
            <span className="rl-section-num">{`// ${formatarMes(aberta.mes)}`}</span>
            <h2 id="rl-modal-titulo" className="rl-modal-titulo">{aberta.tema.titulo}</h2>
            <p><TextoComLinks texto={aberta.tema.descricaoCurta} /></p>

            <article className="rl-box rl-modal-principal">
              <Image
                src={`/revoleituras/capas/${aberta.obraPrincipal.capa}`}
                alt={`Capa do livro ${aberta.obraPrincipal.titulo}`}
                width={600}
                height={900}
                sizes="96px"
                className="rl-capa"
              />
              <div className="rl-book-info">
                <span className="rl-modal-rotulo">Livro principal</span>
                <h3>{aberta.obraPrincipal.titulo} <BadgePaginas paginas={aberta.obraPrincipal.nroPaginas} /><Tags tags={aberta.obraPrincipal.tags} /></h3>
                <p className="rl-autores">de {juntarNomes(aberta.obraPrincipal.autores)}</p>
                <p><TextoComLinks texto={aberta.obraPrincipal.descricaoCurta} /></p>
              </div>
            </article>

            <div className="rl-obras">
              <ListasObras edicao={aberta} />
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
