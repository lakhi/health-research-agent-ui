using './main.bicep'

// NEX Agent UI - Network Explorer Project
param containerAppName = 'nex-agent-ui'
param location = 'Sweden Central'
param managedEnvironmentId = '/subscriptions/444c1e5c-ac0d-4420-94ea-d4a5414d20e1/resourceGroups/healthsociety/providers/Microsoft.App/managedEnvironments/nex-apps-env'
param containerRegistryServer = 'nexacr.azurecr.io'
param containerImage = 'nexacr.azurecr.io/nex-agent-ui:latest'
param apiEndpoint = 'https://nex-agent-api.thankfulcliff-e4e3da3e.swedencentral.azurecontainerapps.io/'
param projectId = 'nex'
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
