const DAILY_BUDGET_EXCEEDED_ERROR = 'daily_budget_exceeded'
const VIENNA_TIMEZONE = 'Europe/Vienna'

interface DailyBudgetExceededPayload {
  error: string
  reset_time_utc?: string
  daily_budget_eur?: number
}

interface HttpErrorLike {
  status?: number
  payload?: unknown
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const getPayload = (value: unknown): DailyBudgetExceededPayload | null => {
  if (!isObject(value)) {
    return null
  }

  if (typeof value.error !== 'string') {
    return null
  }

  return {
    error: value.error,
    reset_time_utc:
      typeof value.reset_time_utc === 'string'
        ? value.reset_time_utc
        : undefined,
    daily_budget_eur:
      typeof value.daily_budget_eur === 'number'
        ? value.daily_budget_eur
        : undefined
  }
}

const formatToViennaParts = (date: Date) => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: VIENNA_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  const parts = formatter.formatToParts(date)
  return {
    day: parts.find((part) => part.type === 'day')?.value,
    month: parts.find((part) => part.type === 'month')?.value,
    year: parts.find((part) => part.type === 'year')?.value,
    hour: parts.find((part) => part.type === 'hour')?.value,
    minute: parts.find((part) => part.type === 'minute')?.value
  }
}

export const isDailyBudgetExceeded = (
  status: number,
  payload: unknown
): payload is DailyBudgetExceededPayload => {
  if (status !== 429) {
    return false
  }

  const parsedPayload = getPayload(payload)
  if (!parsedPayload) {
    return false
  }

  return parsedPayload.error === DAILY_BUDGET_EXCEEDED_ERROR
}

export const getDailyBudgetExceededPayloadFromError = (
  error: unknown
): DailyBudgetExceededPayload | null => {
  if (!isObject(error)) {
    return null
  }

  const httpError = error as HttpErrorLike
  if (!isDailyBudgetExceeded(httpError.status ?? 0, httpError.payload)) {
    return null
  }

  return httpError.payload as DailyBudgetExceededPayload
}

export const formatResetTimeVienna = (resetTimeUtc?: string): string | null => {
  if (!resetTimeUtc || typeof resetTimeUtc !== 'string') {
    return null
  }

  const date = new Date(resetTimeUtc)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const { day, month, year, hour, minute } = formatToViennaParts(date)
  if (!day || !month || !year || !hour || !minute) {
    return null
  }

  return `${day} ${month} ${year}, ${hour}:${minute} (${VIENNA_TIMEZONE})`
}

export const buildBudgetExceededMessage = (resetTimeUtc?: string): string => {
  const baseMessage =
    'You’ve reached today’s usage limit for this chatbot. Please try again tomorrow.'
  const formattedResetTime = formatResetTimeVienna(resetTimeUtc)

  if (!formattedResetTime) {
    return baseMessage
  }

  return `${baseMessage} It will reset at ${formattedResetTime}.`
}
