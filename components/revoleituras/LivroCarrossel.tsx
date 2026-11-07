'use client'

import { useState } from 'react'
import Image from 'next/image'
import BadgePaginas from './BadgePaginas'
import CarrosselSeta from './CarrosselSeta'
import ListasObras, { temListas } from './ListasObras'
import Tags from './Tags'
import TextoComLinks from './TextoComLinks'
import { juntarNomes, type Edicao } from '@/lib/revoleituras'

export default function LivroCarrossel({ edicao }: { edicao: Edicao }) {
  const [slide, setSlide] = useState(0)
  const { obraPrincipal } = edicao
  const temExtras = temListas(edicao)
  const noPrincipal = slide === 0

  return (
    <div className={`rl-livro ${noPrincipal ? '' : 'rl-livro--extras'}`}>
      {/* Os dois slides ocupam o mesmo espaço, para a página não pular ao trocar */}
      <div className="rl-livro-slides">
        <div className="rl-slide rl-book" data-ativo={noPrincipal} aria-hidden={!noPrincipal}>
          <Image
            src={`/revoleituras/capas/${obraPrincipal.capa}`}
            alt={`Capa do livro ${obraPrincipal.titulo}`}
            width={600}
            height={900}
            sizes="(max-width: 639px) 220px, 280px"
            className="rl-capa"
          />
          <div className="rl-book-info">
            <h3>{obraPrincipal.titulo} <BadgePaginas paginas={obraPrincipal.nroPaginas} /><Tags tags={obraPrincipal.tags} /></h3>
            <p className="rl-autores">de {juntarNomes(obraPrincipal.autores)}</p>
            <p><TextoComLinks texto={obraPrincipal.descricaoMedia} /></p>
          </div>
        </div>

        {temExtras && (
          <div className="rl-slide rl-obras" data-ativo={!noPrincipal} aria-hidden={noPrincipal}>
            <ListasObras edicao={edicao} />
          </div>
        )}
      </div>

      {temExtras && (
        <CarrosselSeta
          direcao={noPrincipal ? 'direita' : 'esquerda'}
          rotulo={noPrincipal ? 'Ver livros complementares e audiovisual' : 'Voltar para o livro principal'}
          onClick={() => setSlide(noPrincipal ? 1 : 0)}
        />
      )}
    </div>
  )
}
