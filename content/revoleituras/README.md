# Conteúdo do Revoleituras

Cada mês é um arquivo. Para publicar um tema novo, suba dois arquivos pelo GitHub:

1. `content/revoleituras/AAAA-MM.json` (copie o mês anterior como modelo)
2. `public/revoleituras/capas/AAAA-MM.jpg` (proporção 2:3, cerca de 600×900px)

Não precisa mexer em código. Pode subir com antecedência, porque o site segue o calendário sozinho (horário de Lisboa):

| Quando | O que acontece com o tema de dezembro, por exemplo |
|---|---|
| Até 14/11 | Fica escondido. "Em Breve" avisa a data do lançamento |
| De 15/11 a 30/11 | Aparece em "Em Breve", só com o tema e o livro principal, para gerar curiosidade |
| Em dezembro | Vira o "Livro do Mês" |
| A partir de janeiro | Vai para o "Acervo", se já houver o arquivo de janeiro |

Para conferir no seu computador como o site fica em outra data, use `REVOLEITURAS_DATA_SIMULADA=2026-12-15` no arquivo `.env.local`. Essa opção não vale em produção.

## Campos

| Campo | Regra |
|---|---|
| `mes` | Igual ao nome do arquivo, ex.: `2026-12`. O site mostra `DEZ/26` |
| `tema.titulo` | Obrigatório |
| `tema.tituloCurto` | Opcional, até 30 caracteres. Aparece no card do "Acervo", ex.: `DEZ/26 - Constituição`. Sem ele, o card usa o título completo |
| `tema.descricaoCurta` | Até 160 caracteres (aparece em "Em Breve" e no "Acervo") |
| `tema.descricao` | Até 480 caracteres (aparece em "Livro do Mês") |
| `obraPrincipal.titulo` | Obrigatório |
| `obraPrincipal.autores` | Lista com pelo menos um nome |
| `obraPrincipal.nroPaginas` | Opcional. Número sem aspas, ex.: `123`. O site mostra um badge `123 pp.` em "Livro do Mês" e "Em Breve" |
| `obraPrincipal.tags` | Opcional. Etiquetas ao lado do título em "Livro do Mês" e "Em Breve" |
| `obraPrincipal.descricaoMedia` | Até 500 caracteres |
| `obraPrincipal.descricaoCurta` | Até 100 caracteres (aparece em "Em Breve" e no "Acervo") |
| `obraPrincipal.capa` | Nome do arquivo da capa (`.jpg`, `.jpeg`, `.png` ou `.webp`) |
| `livrosComplementares` | Lista, pode ser vazia. Cada item: `titulo`, `autores`, e opcionais `descritor`, `emoji`, `url`, `nroPaginas`, `tags` e `observacao` |
| `observacaoLivrosComplementares` | Opcional. Até 200 caracteres. Aparece logo depois da lista de livros e aceita links |
| `audiovisual` | Lista, pode ser vazia. Cada item: `titulo`, `ondeEncontrar`, e opcionais `descritor`, `url`, `emoji`, `tags` e `observacao` |

## Recomendações dos membros

`recomendacoesMembros` é uma lista opcional, que aparece depois do audiovisual. Cada item pode ser um livro (`autores`, `nroPaginas`) ou uma obra audiovisual (`ondeEncontrar`, `url`):

| Campo | Regra |
|---|---|
| `titulo` | Obrigatório |
| `sugeridoPor` | Obrigatório: nome de quem recomendou |
| `comentario` | Opcional, até 200 caracteres. Aparece abaixo da obra: — “comentário”, Nome |
| `descritor`, `emoji`, `autores`, `ondeEncontrar`, `url`, `nroPaginas`, `tags`, `observacao` | Opcionais, com as mesmas regras das outras listas |

## Links nas descrições

As quatro descrições (`tema.descricaoCurta`, `tema.descricao`, `obraPrincipal.descricaoMedia` e `obraPrincipal.descricaoCurta`) e `observacaoLivrosComplementares` aceitam links neste formato:

```
Leia o [artigo 5º](https://www.exemplo.com/artigo) antes de começar.
```

O link abre em nova aba, e o limite de caracteres conta só o texto visível. O endereço precisa começar com `http://` ou `https://`, sem espaços.

## Tags

`tags` é uma lista de textos curtos que aparecem como etiquetas no fim da linha, ex.: `"tags": ["gratuito", "PDF"]`.

## Descritor e emoji

`descritor` é opcional e indica o idioma: de 1 a 3 letras maiúsculas, como `PT`, `ES` ou `ENG`. Para um idioma novo, é só usar a sigla. `emoji` aceita qualquer emoji, inclusive bandeiras.

Se algum arquivo estiver errado, o deploy falha com a lista do que corrigir, e o site continua no ar na versão anterior.
