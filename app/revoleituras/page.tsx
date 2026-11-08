import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import Image from 'next/image'
import AcervoGaleria from '@/components/revoleituras/AcervoGaleria'
import BadgePaginas from '@/components/revoleituras/BadgePaginas'
import FlagBackground from '@/components/revoleituras/FlagBackground'
import LivroCarrossel from '@/components/revoleituras/LivroCarrossel'
import RevoleiturasNavbar from '@/components/revoleituras/RevoleiturasNavbar'
import Tags from '@/components/revoleituras/Tags'
import TextoComLinks from '@/components/revoleituras/TextoComLinks'
import { EMAIL_CONTATO, REVOLEITURAS_URL, WHATSAPP_COMUNIDADE_URL, WHATSAPP_REVOLEITURAS_URL } from '@/lib/contato'
import { calcularAgenda, formatarMes, juntarNomes, separarEdicoes } from '@/lib/revoleituras'
import { carregarEdicoes, dataDeHoje } from '@/lib/revoleituras-conteudo'
import './revoleituras.css'

const TITLE = 'Revoleituras | Revolution Tarot'
const DESCRIPTION = 'Revoleituras, do Revolution Tarot.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: REVOLEITURAS_URL },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: REVOLEITURAS_URL,
    siteName: 'Revolution Tarot',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/images/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/images/og-image.png'],
  },
  // Página ainda com Lorem Ipsum: liberar a indexação quando o conteúdo real entrar
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#1f0308',
}

// Confere a data a cada hora, para os temas trocarem sozinhos no dia 15 e na virada do mês
export const revalidate = 3600

const FAQ: { pergunta: string; resposta: ReactNode; acoes?: ReactNode }[] = [
  {
    pergunta: 'Preciso ser de esquerda para participar?',
    resposta: <><strong>Não.</strong> Pode ficar à vontade para ler a seleção de livros, inclusive para discordar deles se quiser. Mas saiba que <strong>temos um posicionamento explícito</strong> e <strong>não toleraremos desrespeito</strong> nas discussões.</>,
  },
  {
    pergunta: 'Podemos sugerir outras obras de acordo com o tema do mês?',
    resposta: <>A obra principal, não, pois já foi selecionada de antemão. Mas outras sugestões que complementem a leitura — tanto outros livros como artigos, filmes, documentários, músicas… — serão muito bem-vindas. Já há planos para criarmos e centralizarmos um acervo só nosso.</>,
  },
  {
    pergunta: 'Podemos sugerir temas também?',
    resposta: <><strong>Por ora, não</strong>. Eu já decidi os temas pra cada mês até Dezembro de 2027. Mas <strong>feedback é sempre bem-vindo</strong>.</>,
  },
  {
    pergunta: 'Pra ganhar o desconto, tem que ser com o livro principal?',
    resposta: <>Não. <strong>Pode ser com algum dos livros secundários que estarão listados aqui.</strong> Mas precisa estar na lista, não pode ser um livro que você só quis ler.</>,
  },
  {
    pergunta: 'Não quero/posso comprar o livro, mas queria ler. E agora?',
    resposta: <>Entre em contato conosco. A gente dá um jeitinho, se é que vocês me entendem 👀 🏴‍☠️</>,
    acoes: (
      <>
        <a href={`mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent('Revoleituras')}`} className="rl-btn rl-btn--primary">Enviar email</a>
        <BotaoComunidade texto="Pergunte na comunidade" />
      </>
    ),
  },
]

const REGRAS: { regra: ReactNode; exemplo?: string }[] = [
  {
    regra: <>Você pode utilizar o desconto do Revoleituras <strong>uma vez por mês</strong>.</>,
    exemplo: 'Exemplo: li três livros do Revoleituras e acumulei 3 descontos de 13%. Posso agendar 3 leituras com 13% de desconto em meses diferentes.',
  },
  {
    regra: <>O desconto do Revoleituras é <strong>acumulável com outros descontos</strong>.</>,
    exemplo: 'Exemplo: tenho o desconto de indicação e um do Revoleituras de 13%. Então posso agendar uma leitura com 23% de desconto.',
  },
  {
    regra: <>O desconto do Revoleituras pode ser usado <strong>em qualquer tiragem</strong> do catálogo normal ou em tiragens especiais.</>,
  },
]

const BENEFICIOS = [
  'Um tema por mês, várias opções de livros',
  'Sugestões de obras audiovisuais para complementar os estudos',
  'Comunidade no WhatsApp para discussão',
  'Leitura e propagação do clube → gera desconto nas tiragens de Tarot',
]

const DESCONTOS: { titulo: string; texto: ReactNode }[] = [
  { titulo: '+3% de desconto', texto: <>Ao postar uma <strong>foto com um dos livros</strong> nos stories marcando a página</> },
  { titulo: '+5% de desconto', texto: <>Quando compartilhar <strong>uma citação do livro</strong> (foto nos stories, post nas redes...)</> },
  { titulo: '+5% de desconto', texto: <>Se fizer <strong>resenha em um post exclusivo</strong>, no feed do seu perfil</> },
]

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="rl-btn-icon">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function BotaoComunidade({ texto = 'Entrar na comunidade' }: { texto?: string }) {
  return (
    <a href={WHATSAPP_COMUNIDADE_URL} target="_blank" rel="noopener noreferrer" className="rl-btn rl-btn--whatsapp">
      <IconWhatsApp />
      {texto}
    </a>
  )
}

// Glifo fa-check (Font Awesome Free, CC BY 4.0)
function IconCheck() {
  return (
    <svg viewBox="0 0 448 512" aria-hidden="true" className="rl-check">
      <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
    </svg>
  )
}

function SectionHeading({ num, title, subtitle }: { num: string; title: string; subtitle?: string }) {
  return (
    <header className="rl-section-heading">
      <span className="rl-section-num">{`// ${num}`}</span>
      <h2>{title}</h2>
      {subtitle && <p className="rl-subtitle">{subtitle}</p>}
    </header>
  )
}

export default function RevoleiturasPage() {
  const hoje = dataDeHoje()
  const { atual, anteriores, emBreve, proximoLancamento } = separarEdicoes(carregarEdicoes(), hoje)
  const agenda = calcularAgenda(hoje, atual, emBreve)
  const temAnteriores = anteriores.length > 0
  const ocultos = [
    ...(atual ? [] : ['#livro-do-mes']),
    ...(temAnteriores ? [] : ['#acervo']),
  ]

  // Numeração das seções visíveis, sem buracos quando alguma estiver escondida
  let contador = 0
  const proximoNumero = () => String(++contador).padStart(2, '0')

  return (
    <div className="revoleituras" id="topo">
      <FlagBackground />
      <RevoleiturasNavbar ocultos={ocultos} />

      <main>
        <section className="rl-hero">
          <p className="rl-subtitle rl-hero-kicker">Clube do Livro</p>
          <h1 className="glitch-title">Revoleituras</h1>
          <p className="rl-hero-tagline">Chega de catarse política de 4 em 4 anos. A revolução começa agora.</p>

          <div className="rl-columns">
            <div className="rl-hero-text">
              <p>E se a gente usar o poder da internet pra se organizar, ler juntos e discutir ideias progressistas? Enviesados pra esquerda, obviamente. ☭</p>
              <p>Todo mês teremos um tema central e sugestões de livros para lermos em conjunto e discutirmos ideias, pontos de vista e aprendermos juntos sobre aspectos políticos que talvez não sejam nossa zona de conforto, mas que sem dúvida precisam ser conhecidos para que não haja mais desespero nas próximas eleições.</p>
              <p className="rl-hero-signature">Organizado por Olivia Mattiazzo, programadora, taróloga, mestranda em Matemática e ansiosa por fazer a diferença.</p>
              <BotaoComunidade />
            </div>

            <aside className="rl-box">
              <figure className="rl-quote">
                <blockquote>Nada a temer senão o correr da luta<br />Nada a fazer senão esquecer o medo</blockquote>
                <figcaption>{`// Caçador de Mim, Milton Nascimento`}</figcaption>
              </figure>

              <ul className="rl-checklist">
                {BENEFICIOS.map(item => (
                  <li key={item}>
                    <IconCheck />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section id="como-funciona">
          <SectionHeading num={proximoNumero()} title="Como Funciona" />

          <div className="rl-columns">
            <div className="rl-como-texto">
              <p>Todo mês, teremos um tema diferente e sugestões de obras — tanto uma principal, quanto secundárias, e também audiovisuais. Não tem data para finalizar nem encontro mensal, porque eu entendo que todo mundo tem vida pra além daqui. Temos uma comunidade montada no WhatsApp para irmos conversando sobre as ideias do livro e partilhar quotes que achamos interessantes, bem como insights que tivemos a partir da leitura. A participação no Revoleituras é totalmente gratuita, mas tem coisas que você pode fazer que podem te render até 13% de desconto em leituras de Tarot comigo 👀</p>
              <div className="rl-actions">
                <a href="#faq-regras" className="rl-btn rl-btn--primary">Mais detalhes em: FAQ e regras para utilização dos descontos ⏩</a>
                <a href={WHATSAPP_REVOLEITURAS_URL} target="_blank" rel="noopener noreferrer" className="rl-btn rl-btn--whatsapp">
                  <IconWhatsApp />
                  Dúvidas? Entre em contato diretamente comigo
                </a>
              </div>
            </div>

            <div className="rl-descontos">
              <h3 className="rl-subtitle">Como funcionam os descontos?</h3>
              <p>A acumulação de desconto funciona da seguinte forma:</p>

              {DESCONTOS.map(({ titulo, texto }, i) => (
                <article key={i} className="rl-box rl-box--small">
                  <h4>{titulo}</h4>
                  <p>{texto}</p>
                </article>
              ))}

              <p className="rl-note">Lembre-se sempre de marcar a página <a href="https://instagram.com/revolution.tarot" target="_blank" rel="noopener noreferrer">@revolution.tarot</a> para que eu possa ver a publicação e contabilizar sua participação!</p>
            </div>
          </div>
        </section>

        <section id="agenda">
          <SectionHeading num={proximoNumero()} title="Agenda" subtitle="Datas e prazos para as leituras" />
          <ul className="rl-agenda">
            <li>
              <h3>Todo dia 15</h3>
              <p>Lançamento do tema e obra principal</p>
              <p>Próxima data: <a href="#em-breve" className="rl-link">{agenda.lancamento}</a></p>
            </li>
            <li>
              <h3>Dia 01 de cada mês</h3>
              <p>Inicia-se a leitura e a acumulação de descontos</p>
              <p>
                Próxima data:{' '}
                {agenda.livro
                  ? <a href={agenda.livro.secao} className="rl-link">{agenda.inicio} - Livro: {agenda.livro.titulo}</a>
                  : agenda.inicio}
                {agenda.revelacao && ` - Livro: será revelado em ${agenda.revelacao}`}
                {agenda.emLeitura && (
                  <>
                    <br />
                    Em leitura agora: <a href="#livro-do-mes" className="rl-link">{agenda.emLeitura}</a>
                  </>
                )}
              </p>
            </li>
            <li>
              <h3>Até o dia 25</h3>
              <p>Último dia para postar e acumular descontos</p>
              <p>Próxima data: {agenda.prazoPostagem}</p>
            </li>
            <li>
              <h3>Último dia do mês</h3>
              <p>Contabilização e comunicação dos descontos</p>
              <BotaoComunidade />
            </li>
          </ul>
          <p className="rl-agenda-nota">Todas as datas seguem o horário de Lisboa.</p>
        </section>

        {atual && (
          <section id="livro-do-mes">
            <SectionHeading num={proximoNumero()} title="Livro do Mês" subtitle={`${formatarMes(atual.mes)} - ${atual.tema.titulo}`} />
            <p className="rl-tema-descricao"><TextoComLinks texto={atual.tema.descricao} /></p>
            <LivroCarrossel edicao={atual} />
          </section>
        )}

        <section id="em-breve">
          <SectionHeading num={proximoNumero()} title="Em Breve" />
          {emBreve ? (
            <div className="rl-columns">
              <div className="rl-em-breve-tema">
                <h3 className="rl-subtitle">{`${formatarMes(emBreve.mes)} - ${emBreve.tema.titulo}`}</h3>
                <p><TextoComLinks texto={emBreve.tema.descricaoCurta} /></p>
              </div>

              <article className="rl-box rl-em-breve-livro">
                <Image
                  src={`/revoleituras/capas/${emBreve.obraPrincipal.capa}`}
                  alt={`Capa do livro ${emBreve.obraPrincipal.titulo}`}
                  width={600}
                  height={900}
                  sizes="140px"
                  className="rl-capa"
                />
                <div className="rl-book-info">
                  <h3>{emBreve.obraPrincipal.titulo} <BadgePaginas paginas={emBreve.obraPrincipal.nroPaginas} /><Tags tags={emBreve.obraPrincipal.tags} /></h3>
                  <p className="rl-autores">de {juntarNomes(emBreve.obraPrincipal.autores)}</p>
                  <p><TextoComLinks texto={emBreve.obraPrincipal.descricaoCurta} /></p>
                </div>
              </article>
            </div>
          ) : (
            <p className="rl-note">
              {proximoLancamento
                ? `O tema de ${formatarMes(proximoLancamento.mes)} será revelado em ${proximoLancamento.data}.`
                : 'O próximo tema será revelado em breve.'}
            </p>
          )}
        </section>

        {temAnteriores && (
          <section id="acervo">
            <SectionHeading num={proximoNumero()} title="Acervo" subtitle="Os temas e livros que já lemos" />
            <AcervoGaleria edicoes={anteriores} />
          </section>
        )}

        <section id="faq-regras">
          <SectionHeading num={proximoNumero()} title="FAQ e regras" subtitle="Perguntas frequentes e regras para utilização dos descontos" />

          <div className="rl-columns">
            <div>
              <div className="rl-faq">
                {FAQ.map(({ pergunta, resposta, acoes }) => (
                  <details key={pergunta}>
                    <summary>{pergunta}</summary>
                    <p>{resposta}</p>
                    {acoes && <div className="rl-faq-acoes">{acoes}</div>}
                  </details>
                ))}
              </div>

              <div className="rl-faq-contato">
                <p>Ainda tem alguma dúvida? Entre em contato</p>
                <a href={WHATSAPP_REVOLEITURAS_URL} target="_blank" rel="noopener noreferrer" className="rl-btn rl-btn--whatsapp">
                  <IconWhatsApp />
                  Dúvidas? Entre em contato diretamente comigo
                </a>
              </div>
            </div>

            <div className="rl-regras">
              <h3 className="rl-subtitle">Utilizando os descontos</h3>
              {REGRAS.map(({ regra, exemplo }, i) => (
                <article key={i} className="rl-box rl-box--small">
                  <p>{regra}</p>
                  {exemplo && <p className="rl-regra-exemplo">{exemplo}</p>}
                </article>
              ))}
              <p className="rl-note">Situações excepcionais ou não previstas serão avaliadas individualmente, reservando-me o direito de rever e ajustar estas condições sempre que necessário.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
