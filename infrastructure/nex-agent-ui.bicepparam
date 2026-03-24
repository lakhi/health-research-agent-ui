using './main.bicep'

// NEX Agent UI - Network Explorer Project
param containerAppName = 'nex-agent-ui'
param location = 'West Europe'
param managedEnvironmentId = '/subscriptions/444c1e5c-ac0d-4420-94ea-d4a5414d20e1/resourceGroups/healthsociety/providers/Microsoft.App/managedEnvironments/nex-apps-env'
param containerRegistryServer = 'nex-acr.azurecr.io'
param containerImage = 'nex-acr.azurecr.io/nex-agent-ui:latest'
param apiEndpoint = 'https://nex-agent-api.PLACEHOLDER.swedencentral.azurecontainerapps.io/'
param projectId = 'nex'
param costCenter = 'FG473001'
param environmentTag = 'Dev'
param responsiblePerson = 'Akshay'
param identityType = 'SystemAssigned'
param registryIdentity = 'system'
param minReplicas = 0
param maxReplicas = 3
param cooldownPeriod = 180
param pollingInterval = 20
param concurrentRequests = '10'
param cpuAllocation = '0.25'
param memoryAllocation = '0.5Gi'
