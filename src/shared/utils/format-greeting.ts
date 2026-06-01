export function getTimeGreeting(date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return 'Buenos días';
  }

  if (hour >= 12 && hour < 19) {
    return 'Buenas tardes';
  }

  return 'Buenas noches';
}

export function getDisplayName(fullName: string | null | undefined): string {
  if (!fullName?.trim()) {
    return '';
  }

  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0];
  }

  return `${parts[0]} ${parts[1]}`;
}

export function formatPersonalGreeting(
  fullName: string | null | undefined,
  date = new Date(),
): string {
  const name = getDisplayName(fullName);
  const greeting = getTimeGreeting(date);

  return name ? `${greeting}, ${name}` : greeting;
}
