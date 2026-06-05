export const COLOMBIAN_BANKS = [
  'Bancolombia',
  'Davivienda',
  'BBVA Colombia',
  'Banco de Bogotá',
  'Banco Popular',
  'Banco Caja Social',
  'Scotiabank Colpatria',
  'Nequi',
  'Daviplata',
] as const;

export type ColombianBank = (typeof COLOMBIAN_BANKS)[number];
