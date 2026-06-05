import type { AppIconName } from '@/components/ui/app-icon';
import {
  CLIENT_SERVICE_FEE_PERCENT_LABEL,
  WORKER_SERVICE_FEE_PERCENT_LABEL,
} from '@/features/payments/constants/platform-fee';

export const PAYMENT_TERMS_LAST_UPDATED = 'Junio 2026';

export type TermsBulletItem = {
  text: string;
  icon?: AppIconName;
};

export type TermsSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: TermsBulletItem[];
  feeCards?: boolean;
};

export const PAYMENT_TERMS_INTRO =
  'Bienvenido a Ranco. Estos términos explican cómo funciona la plataforma, el sistema de pagos y el rol que cumplimos como intermediarios entre clientes y profesionales independientes.';

export const PAYMENT_TERMS_SECTIONS: TermsSection[] = [
  {
    id: 'introduction',
    title: '1. Introducción',
    paragraphs: [
      'Ranco es una plataforma digital que conecta personas que necesitan servicios locales con profesionales independientes cercanos.',
      'Al usar la negociación de precios, aceptar ofertas o completar pagos dentro de la app, confirmas que has leído y comprendes estas condiciones.',
    ],
  },
  {
    id: 'intermediary',
    title: '2. Rol de Ranco en los pagos',
    paragraphs: [
      'Ranco actúa exclusivamente como medio para la efectuancia del pago entre el cliente y el profesional. No prestamos el servicio contratado ni somos parte del acuerdo laboral o comercial entre las partes.',
      'Facilitamos la negociación, el registro del precio acordado y el procesamiento del pago una vez finalizado el trabajo. La calidad, puntualidad y ejecución del servicio son responsabilidad directa del profesional contratado.',
    ],
  },
  {
    id: 'payment-flow',
    title: '3. Cómo funciona el sistema de pagos',
    bullets: [
      { text: 'Cliente y profesional acuerdan un precio en COP mediante la negociación en el chat.', icon: 'card-outline' },
      { text: 'Al aceptar la oferta, el monto queda registrado como precio acordado para ese servicio.', icon: 'shield-checkmark-outline' },
      { text: 'Al completar el trabajo, el cliente paga el precio acordado más una tarifa adicional del 5% a Ranco.', icon: 'wallet-outline' },
      { text: 'Ranco procesa el pago y deja disponible el saldo neto para que el profesional lo reclame.', icon: 'time-outline' },
      { text: 'Al retirar, al profesional se le descuenta un 5% sobre el precio acordado como comisión de plataforma.', icon: 'person-outline' },
    ],
  },
  {
    id: 'fees',
    title: '4. Tarifas y comisiones',
    paragraphs: [
      'Ranco aplica una estructura transparente y dividida sobre el precio acordado entre las partes:',
      'El cliente paga un 5% adicional sobre el precio pactado al momento del cobro. El profesional recibe el precio acordado menos un 5% al reclamar su pago. Ambos cargos se informan antes de confirmar la transacción.',
    ],
    feeCards: true,
  },
  {
    id: 'negotiation',
    title: '5. Negociación de precios',
    paragraphs: [
      'Las ofertas y contraofertas dentro del chat son propuestas hasta que una parte las acepta. El precio aceptado es el monto base para el cobro posterior, sin incluir la tarifa adicional del cliente.',
      'Ranco no garantiza que una oferta sea la más baja del mercado. Las partes son libres de negociar, retirar o rechazar propuestas antes de aceptar.',
    ],
  },
  {
    id: 'responsibilities',
    title: '6. Responsabilidades de los usuarios',
    bullets: [
      { text: 'Proporcionar información veraz sobre el servicio, disponibilidad y datos de contacto.', icon: 'person-outline' },
      { text: 'Cumplir con los acuerdos de precio, horario y alcance del trabajo aceptado.', icon: 'time-outline' },
      { text: 'Usar la plataforma de forma legal y respetuosa con la comunidad Ranco.', icon: 'shield-checkmark-outline' },
    ],
  },
  {
    id: 'simulation',
    title: '7. Pagos en la versión actual',
    paragraphs: [
      'En esta etapa del producto, los pagos se procesan de forma simulada para validar el flujo completo entre cliente y profesional. No se realiza un débito real a tarjetas ni transferencias bancarias reales hasta que se habilite una pasarela certificada.',
      'Aun así, el registro del precio, tarifas y estados de pago dentro de Ranco reflejan la lógica operativa que aplicará cuando el cobro real esté disponible.',
    ],
  },
  {
    id: 'privacy',
    title: '8. Privacidad y datos',
    paragraphs: [
      'Los datos de pago, historial de servicios y conversaciones se tratan conforme a nuestras políticas de privacidad. Ranco no comparte información financiera con terceros no autorizados.',
      'Puedes solicitar aclaraciones sobre el tratamiento de tus datos contactando al equipo de soporte de Ranco.',
    ],
  },
];

export const PAYMENT_FEE_CARDS = [
  {
    label: 'Cargo al cliente',
    value: `+${CLIENT_SERVICE_FEE_PERCENT_LABEL}`,
    caption: 'adicional sobre el precio pactado',
  },
  {
    label: 'Descuento al profesional',
    value: `-${WORKER_SERVICE_FEE_PERCENT_LABEL}`,
    caption: 'sobre el precio acordado al retirar',
  },
] as const;

export const PAYMENT_TERMS_NEGOTIATION_SUMMARY =
  'Ranco actúa como intermediario de pago. Al aceptar una oferta confirmas el precio base; al pagar se aplicará un 5% adicional y al profesional se le descontará un 5% al retirar.';
