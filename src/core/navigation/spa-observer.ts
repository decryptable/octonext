type NavigationListener = (url: URL) => void;

const SPA_EVENTS = ['popstate', 'turbo:load', 'pjax:end', 'pjax:success'];

export function observeNavigation(onChange: NavigationListener): () => void {
  let lastHref = location.href;

  const notify = () => {
    if (location.href === lastHref) return;
    lastHref = location.href;
    onChange(new URL(location.href));
  };

  const schedule = () => queueMicrotask(notify);
  const history = window.history;
  const originalPush = history.pushState.bind(history);
  const originalReplace = history.replaceState.bind(history);

  history.pushState = (...args: Parameters<History['pushState']>) => {
    originalPush(...args);
    schedule();
  };
  history.replaceState = (...args: Parameters<History['replaceState']>) => {
    originalReplace(...args);
    schedule();
  };

  for (const event of SPA_EVENTS) window.addEventListener(event, schedule, true);

  return () => {
    history.pushState = originalPush;
    history.replaceState = originalReplace;
    for (const event of SPA_EVENTS) window.removeEventListener(event, schedule, true);
  };
}
