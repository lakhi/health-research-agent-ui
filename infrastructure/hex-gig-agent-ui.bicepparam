using './main.bicep'

// HeX-GiG Agent UI - Health Network Explorer (GiG)
param containerAppName = 'hex-gig-agent-ui'
param location = 'Sweden Central'
param managedEnvironmentId = '/subscriptions/444c1e5c-ac0d-4420-94ea-d4a5414d20e1/resourceGroups/healthsociety/providers/Microsoft.App/managedEnvironments/hex-gig-apps-env'
param containerRegistryServer = 'hexgigacr.azurecr.io'
param containerImage = 'hexgigacr.azurecr.io/hex-gig-agent-ui:latest'
// TODO: update apiEndpoint to the new BE FQDN once hex-gig-agent-api is deployed (Phase 2 of rename plan).
param apiEndpoint = 'https://nex-agent-api.thankfulcliff-e4e3da3e.swedencentral.azurecontainerapps.io/'
param projectId = 'hex-gig'
param costCenter = 'FG473001'
param environmentTag = 'Dev'
param responsiblePerson = 'Akshay'
param identityType = 'SystemAssigned'
param registryIdentity = 'system'
param minReplicas = 1
param maxReplicas = 3
param cooldownPeriod = 180
param pollingInterval = 20
param concurrentRequests = '10'
param cpuAllocation = '0.25'
param memoryAllocation = '0.5Gi'
