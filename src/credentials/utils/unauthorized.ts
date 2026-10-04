export const UNAUTHORIZED_MESSAGE = "Unauthorized";

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof Error && error.message === UNAUTHORIZED_MESSAGE;
}

// Sends the user to the login page, returning them here afterwards.
export function redirectToLogin() {
  if (window.location.pathname.startsWith("/login")) {
    return;
  }

  const redirect = window.location.pathname + window.location.search;
  window.location.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
}
