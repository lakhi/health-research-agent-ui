const STORAGE_KEY = 'health_research_anonymous_user_id'

/**
 * Returns the long-lived anonymous user id for this browser profile,
 * generating and persisting one in localStorage on the first visit.
 *
 * Unlike session_id (one per conversation), this UUID survives reloads and
 * browser restarts, letting the backend count returning visitors without
 * any real identity. Returns null when localStorage is unavailable.
 */
export const getAnonymousUserId = (): string | null => {
  if (typeof window === 'undefined') return null

  try {
    let userId = window.localStorage.getItem(STORAGE_KEY)
    if (!userId) {
      userId = crypto.randomUUID()
      window.localStorage.setItem(STORAGE_KEY, userId)
    }
    return userId
  } catch {
    // localStorage can throw in hardened/private browsing modes
    return null
  }
}
