export const lazyWithDelay = <T extends unknown>(
  factory: () => Promise<T>,
  delayMs = 1200 // how long to delay before resolving
) =>
  new Promise<T>((resolve) => {
    const delay = new Promise((r) => setTimeout(r, delayMs));
    Promise.all([factory(), delay]).then(([mod]) => resolve(mod));
  });