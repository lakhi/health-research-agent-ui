using './main.bicep'

// SSC Psychology Chatbot - Student Service Center Psychology Project
// NOTE: Update these values with actual SSC infrastructure details when available
param containerAppName = 'ssc-psych-chatbot-ui'
param location = 'West Europe'
param managedEnvironmentId = '/subscriptions/444c1e5c-ac0d-4420-94ea-d4a5414d20e1/resourceGroups/ssc_psychology/providers/Microsoft.App/managedEnvironments/ssc-psych-env'
param containerRegistryServer = 'sscpsych.azurecr.io'
param containerImage = 'sscpsych.azurecr.io/ssc-psych-chatbot-ui:latest'
param apiEndpoint = 'https://ssc-psych-api.example.azurecontainerapps.io/'
param projectId = 'ssc-psych-chatbot'
param costCenter = 'FG473001'
param environmentTag = 'Dev'
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
