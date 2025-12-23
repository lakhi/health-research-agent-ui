// TODO: works on local. test on Azure after 05-Jan-2026 (and remove hardcoded fallback if successful)
export function getDefaultEndpoint(): string {
  const endpoint =
    process.env.NEXT_PUBLIC_BACKEND_API_ENDPOINT ||
    'https://marhinovirus-study-api.whitedesert-10483e06.westeurope.azurecontainerapps.io'

  return endpoint
}