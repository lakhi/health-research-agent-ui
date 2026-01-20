using './main.bicep'

// VaxStudy Chatbot - Marhinovirus Research Study Project
param containerAppName = 'marhinovirus-study-ui'
param location = 'West Europe'
param managedEnvironmentId = '/subscriptions/444c1e5c-ac0d-4420-94ea-d4a5414d20e1/resourceGroups/socialeconpsyresearch/providers/Microsoft.App/managedEnvironments/socialeconpsy-env'
param containerRegistryServer = 'socialeconpsy-drdfgfb2g7aadtgk.azurecr.io'
param containerImage = 'socialeconpsy-drdfgfb2g7aadtgk.azurecr.io/agent-ui:latest'
param apiEndpoint = 'https://marhinovirus-study-api--v1-1.whitedesert-10483e06.westeurope.azurecontainerapps.io'
param projectId = 'vax-study-chatbot'
param costCenter = 'FG473001'
param environmentTag = 'Test'
param responsiblePerson = 'Akshay'
param identityType = 'None'
param registryIdentity = 'system-environment'
param minReplicas = 1
param maxReplicas = 2
param cooldownPeriod = 300
param pollingInterval = 30
param concurrentRequests = '10'
param cpuAllocation = '0.25'
param memoryAllocation = '0.5Gi'
param revisionSuffix = 'v1-1a'
