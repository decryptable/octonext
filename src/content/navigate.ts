interface TurboGlobal {
  Turbo?: { visit?: (url: string) => void };
}

export function navigateTo(url: string): void {
  const turbo = (window as unknown as TurboGlobal).Turbo;
  if (turbo?.visit) {
    turbo.visit(url);
    return;
  }
  window.location.assign(url);
}
