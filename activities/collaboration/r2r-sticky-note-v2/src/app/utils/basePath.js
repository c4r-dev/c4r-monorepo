export function getBasePath() {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_BASE_PATH || '';
  }
  try {
    const parts = window.location.pathname.split('/');
    // Expect: ['', domain, activity, ...]
    if (parts.length >= 3) {
      return `/${parts[1]}/${parts[2]}`;
    }
    return '';
  } catch (_) {
    return '';
  }
}

