using './main.bicep'

// HealthSoc Network Chatbot - Health Research Network Project
param containerAppName = 'hrn-agent-ui'
param location = 'West Europe'
param managedEnvironmentId = '/subscriptions/444c1e5c-ac0d-4420-94ea-d4a5414d20e1/resourceGroups/health_research_network/providers/Microsoft.App/managedEnvironments/hrn-env-dev'
param containerRegistryServer = 'hrndev.azurecr.io'
param containerImage = 'hrndev.azurecr.io/healthsoc-network-chatbot-ui:latest'
param apiEndpoint = 'https://health-research-api.niceground-23078755.westeurope.azurecontainerapps.io/'
param projectId = 'healthsoc-network-chatbot'
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
// TODO: Update revisionSuffix with appropriate version tag (placeholder)
param revisionSuffix = ''
