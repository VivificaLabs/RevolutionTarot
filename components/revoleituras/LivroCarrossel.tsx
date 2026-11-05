'use client'

import { useState } from 'react'
import Image from 'next/image'
import BadgePaginas from './BadgePaginas'
import CarrosselSeta from './CarrosselSeta'
import Tags from './Tags'
import TextoComLinks from './TextoComLinks'
import { juntarNomes, type Edicao } from '@/lib/revoleituras'

function Descritor({ descritor, emoji }: { descritor?: string; emoji?: string }) {
  const conteudo = [descritor, emoji].filter(Boolean).join(' / ')
  return conteudo ? <span className="rl-descritor">[{conteudo}]</span> : null
}

function TituloObra({ titulo, url }: { titulo: string; url?: string }) {
  return url ? <a href={url} target="_blank" rel="noopener noreferrer">{titulo}</a> : <>{titulo}</>
}

export default function LivroCarrossel({ edicao }: { edicao: Edicao }) {
  const [slide, setSlide] = useState(0)
  const { obraPrincipal, livrosComplementares, observacaoLivrosComplementares, audiovisual } = edicao
  const temExtras = livrosComplementares.length > 0 || audiovisual.length > 0
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
            {livrosComplementares.length > 0 && (
              <div>
                <h3>Livros complementares</h3>
                <ul>
                  {livrosComplementares.map(livro => (
                    <li key={livro.titulo}>
                      <Descritor descritor={livro.descritor} emoji={livro.emoji} /> <TituloObra titulo={livro.titulo} url={livro.url} />, de {juntarNomes(livro.autores)}
                      {livro.observacao && ` (${livro.observacao})`}{' '}
                      <BadgePaginas paginas={livro.nroPaginas} />
                      <Tags tags={livro.tags} />
                    </li>
                  ))}
                </ul>
                {observacaoLivrosComplementares && (
                  <p className="rl-obras-nota"><span className="rl-obras-nota-rotulo">Obs:</span> <TextoComLinks texto={observacaoLivrosComplementares} /></p>
                )}
              </div>
            )}

            {audiovisual.length > 0 && (
              <div>
                <h3>Audiovisual</h3>
                <ul>
                  {audiovisual.map(obra => (
                    <li key={obra.titulo}>
                      <Descritor descritor={obra.descritor} emoji={obra.emoji} />{' '}
                      <TituloObra titulo={obra.titulo} url={obra.url} />, disponível em {obra.ondeEncontrar}
                      {obra.observacao && ` (${obra.observacao})`}{' '}
                      <Tags tags={obra.tags} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
