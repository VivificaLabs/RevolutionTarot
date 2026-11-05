interface CarrosselSetaProps {
  direcao: 'esquerda' | 'direita'
  rotulo: string
  desativada?: boolean
  onClick: () => void
}

export default function CarrosselSeta({ direcao, rotulo, desativada, onClick }: CarrosselSetaProps) {
  return (
    <button type="button" className="rl-seta" aria-label={rotulo} disabled={desativada} onClick={onClick}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={direcao === 'direita' ? 'M9 4l8 8-8 8' : 'M15 4l-8 8 8 8'} />
      </svg>
    </button>
  )
}
