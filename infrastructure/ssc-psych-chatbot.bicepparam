using './vax-ui.bicep'

// SSC Psychology Chatbot — Student Service Center Psychology Project
// Credential-based ACR auth (vax-ui.bicep): no managed-identity role grant needed.
// acrPassword is read from the environment at deploy time — never commit it:
//   export SSC_PSYCH_ACR_PASSWORD=$(az acr credential show -g ssc-psych-test -n sscpsychacr --query 'passwords[0].value' -o tsv)
param containerAppName = 'ssc-psych-chatbot-ui'
param location = 'Sweden Central'
param managedEnvironmentId = '/subscriptions/44365843-c70c-4844-a430-ad0193819039/resourceGroups/ssc-psych-test/providers/Microsoft.App/managedEnvironments/ssc-psych-env'
param containerRegistryServer = 'sscpsychacr.azurecr.io'
param acrUsername = 'sscpsychacr'
param acrPassword = readEnvironmentVariable('SSC_PSYCH_ACR_PASSWORD', '')
param containerImage = 'sscpsychacr.azurecr.io/ssc-psych-chatbot-ui:latest'
param apiEndpoint = 'https://ssc-psych-api.politesmoke-3283667d.swedencentral.azurecontainerapps.io'
param projectId = 'ssc-psych-chatbot'
param costCenter = 'FG473001'
param environmentTag = 'Test'
param responsiblePerson = 'Akshay'
param minReplicas = 1
param maxReplicas = 2
param cooldownPeriod = 300
param pollingInterval = 30
param concurrentRequests = '10'
param cpuAllocation = '0.25'
param memoryAllocation = '0.5Gi'
