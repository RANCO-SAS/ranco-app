const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatSubscriptionPrice(priceCents: number): string {
  return COP_FORMATTER.format(priceCents / 100);
}

export function formatSubscriptionPriceLabel(
  priceCents: number,
  cycle: 'monthly' | 'annual',
): string {
  const amount = formatSubscriptionPrice(priceCents);
  return cycle === 'monthly' ? `${amount} / mes` : `${amount} / año`;
}
