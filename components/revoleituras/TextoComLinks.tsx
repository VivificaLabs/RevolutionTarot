import { dividirLinks } from '@/lib/revoleituras'

export default function TextoComLinks({ texto }: { texto: string }) {
  return (
    <>
      {dividirLinks(texto).map((trecho, i) => (
        trecho.url
          ? <a key={i} href={trecho.url} target="_blank" rel="noopener noreferrer" className="rl-link">{trecho.texto}</a>
          : <span key={i}>{trecho.texto}</span>
      ))}
    </>
  )
}
