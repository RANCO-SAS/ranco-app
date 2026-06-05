export function getOfferWaitingHint(isViewerClient: boolean): string {
  return isViewerClient
    ? 'Esperando respuesta del trabajador.'
    : 'Esperando respuesta del cliente.';
}
