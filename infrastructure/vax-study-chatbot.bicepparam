using './vax-ui.bicep'

param containerAppName = 'marhinovirus-infobot'
param location = 'Sweden Central'
param managedEnvironmentId = '/subscriptions/44365843-c70c-4844-a430-ad0193819039/resourceGroups/vax-study/providers/Microsoft.App/managedEnvironments/vax-env'
param containerRegistryServer = 'vaxacr.azurecr.io'
param acrUsername = 'vaxacr'
param acrPassword = '34W4otQUHjz0gwmz0qAERFb22RUJD2YNjZ34zDiNiHcQtaxF5L00JQQJ99CDACfhMk5Eqg7NAAACAZCRf4Ot'
param containerImage = 'vaxacr.azurecr.io/vax-study-chatbot-ui:latest'
param apiEndpoint = 'https://marhinovirus-api.wittywave-d78264d4.swedencentral.azurecontainerapps.io'
param projectId = 'vax-study-chatbot'
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
