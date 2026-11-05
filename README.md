# CasaDeCantoneiros

Website institucional para a Casa de Cantoneiros — turismo rural em Campos Ruivães,
Vieira do Minho.

## Sobre o projeto

O site apresenta a casa, a galeria, os contactos e o formulário de reservas, com um
simulador de preços integrado e regras de estadia centralizadas.

## Funcionalidades

- Página inicial, sobre, galeria, reservas, contactos e privacidade.
- Galeria responsiva com AVIF/WebP, `srcset`, lazy-load e lightbox Fancybox.
- Simulador de preços com tarifas por época, estadia mínima de 2 noites e 10% de
  desconto a partir de 7 noites.
- Configuração central de tarifas e contactos em `js/site-config.js`.
- Formulário de reserva via Web3Forms com validação de datas e honeypot.
- SEO: `sitemap.xml`, `robots.txt`, JSON-LD `LodgingBusiness` e Open Graph.
- Favicons multiformato e `site.webmanifest`.

## Tecnologias usadas

- HTML, CSS e JavaScript
- jQuery, AOS, Fancybox
- Python + Pillow para otimização de imagens

## Scripts

Ver [`scripts/README.md`](scripts/README.md) para gerar imagens responsivas, dados da
galeria e favicons.

## Autor

Rodrigo Matias
