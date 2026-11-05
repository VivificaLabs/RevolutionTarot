'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import CarrosselSeta from './CarrosselSeta'
import TextoComLinks from './TextoComLinks'
import { formatarMes, type Edicao } from '@/lib/revoleituras'

export default function AnterioresCarrossel({ edicoes }: { edicoes: Edicao[] }) {
  const trilhaRef = useRef<HTMLDivElement>(null)
  const [podeVoltar, setPodeVoltar] = useState(false)
  const [podeAvancar, setPodeAvancar] = useState(false)

  useEffect(() => {
    const trilha = trilhaRef.current
    if (!trilha) return

    const atualizar = () => {
      setPodeVoltar(trilha.scrollLeft > 1)
      setPodeAvancar(trilha.scrollLeft + trilha.clientWidth < trilha.scrollWidth - 1)
    }
    atualizar()

    const observador = new ResizeObserver(atualizar)
    observador.observe(trilha)
    trilha.addEventListener('scroll', atualizar, { passive: true })
    return () => {
      observador.disconnect()
      trilha.removeEventListener('scroll', atualizar)
    }
  }, [])

  const rolar = (sentido: 1 | -1) => {
    const trilha = trilhaRef.current
    const caixa = trilha?.firstElementChild
    if (!trilha || !caixa) return
    const espaco = parseFloat(getComputedStyle(trilha).columnGap) || 0
    trilha.scrollBy({ left: sentido * (caixa.getBoundingClientRect().width + espaco), behavior: 'smooth' })
  }

  const temSetas = podeVoltar || podeAvancar

  return (
    <div className="rl-anteriores">
      {temSetas && <CarrosselSeta direcao="esquerda" rotulo="Livros mais recentes" desativada={!podeVoltar} onClick={() => rolar(-1)} />}

      <div ref={trilhaRef} className="rl-anteriores-trilha" tabIndex={0} role="group" aria-label="Livros dos meses anteriores">
        {edicoes.map(({ mes, obraPrincipal }) => (
          <article key={mes} className="rl-card">
            <Image
              src={`/revoleituras/capas/${obraPrincipal.capa}`}
              alt={`Capa do livro ${obraPrincipal.titulo}`}
              width={600}
              height={900}
              sizes="(max-width: 767px) 300px, 340px"
              className="rl-capa"
            />
            <h3>[{formatarMes(mes)}] {obraPrincipal.titulo}</h3>
            <p><TextoComLinks texto={obraPrincipal.descricaoCurta} /></p>
          </article>
        ))}
      </div>

      {temSetas && <CarrosselSeta direcao="direita" rotulo="Livros mais antigos" desativada={!podeAvancar} onClick={() => rolar(1)} />}
    </div>
  )
}
