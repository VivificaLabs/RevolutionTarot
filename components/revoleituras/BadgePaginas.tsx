export default function BadgePaginas({ paginas }: { paginas?: number }) {
  return paginas ? <span className="rl-paginas">{paginas} pp.</span> : null
}
