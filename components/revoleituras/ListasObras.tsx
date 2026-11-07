import BadgePaginas from './BadgePaginas'
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

export function temListas(edicao: Edicao) {
  return edicao.livrosComplementares.length > 0 || edicao.audiovisual.length > 0 || (edicao.recomendacoesMembros?.length ?? 0) > 0
}

// Listas de obras complementares, usadas no Livro do Mês e no acervo de cada mês
export default function ListasObras({ edicao }: { edicao: Edicao }) {
  const { livrosComplementares, observacaoLivrosComplementares, audiovisual, recomendacoesMembros = [] } = edicao

  return (
    <>
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

      {recomendacoesMembros.length > 0 && (
        <div>
          <h3>Recomendações dos membros</h3>
          <ul>
            {recomendacoesMembros.map(obra => (
              <li key={`${obra.titulo}-${obra.sugeridoPor}`}>
                <Descritor descritor={obra.descritor} emoji={obra.emoji} />{' '}
                <TituloObra titulo={obra.titulo} url={obra.url} />
                {obra.autores && `, de ${juntarNomes(obra.autores)}`}
                {obra.ondeEncontrar && `, disponível em ${obra.ondeEncontrar}`}
                {obra.observacao && ` (${obra.observacao})`}{' '}
                <BadgePaginas paginas={obra.nroPaginas} />
                <Tags tags={obra.tags} />
                <span className="rl-recomendacao">
                  {obra.comentario ? <>— “{obra.comentario}”, <cite>{obra.sugeridoPor}</cite></> : <>— sugerido por <cite>{obra.sugeridoPor}</cite></>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
