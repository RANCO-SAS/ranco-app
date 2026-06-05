const openedPaymentRequestIds = new Set<string>();

export function markPaymentScreenOpened(serviceRequestId: string): void {
  openedPaymentRequestIds.add(serviceRequestId);
}

export function shouldAutoOpenPayment(serviceRequestId: string): boolean {
  return !openedPaymentRequestIds.has(serviceRequestId);
}

export function resetPaymentPromptSession(): void {
  openedPaymentRequestIds.clear();
}
