/**
 * Configuração central do site da Casa de Cantoneiros.
 *
 * Todas as tarifas, regras de estadia e versão de assets vivem aqui.
 * O simulador de preços, a validação do formulário e a apresentação das
 * tarifas leem estes valores, garantindo que o site nunca fica dessincronizado.
 */
window.CasaConfig = {
  version: '20261108-3',

  reservation: {
    minNights: 2,
    maxNights: 60,
    discount: 0.10,
    discountFromNights: 7
  },

  rates: {
    low: 130,
    high: 150,
    // Meses 0-based: 5 = junho, 8 = setembro
    highSeasonMonths: [5, 6, 7, 8]
  },

  contact: {
    phone: '+351965507158',
    phoneLabel: '(+351) 965 507 158',
    email: 'geral@casadecantoneiros.pt',
    address: 'Avenida de São Martinho 5624, Campos Ruivães, Portugal'
  },

  location: {
    name: 'Casa de Cantoneiros',
    locality: 'Campos Ruivães',
    region: 'Vieira do Minho',
    country: 'PT'
  }
};
