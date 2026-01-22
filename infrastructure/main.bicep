// Parameterized Azure Container App deployment template
// This single template supports all three chatbot projects through .bicepparam files

@description('Name of the Container App')
param containerAppName string 

@description('Azure region for deployment')
param location string = 'West Europe'

@description('Resource ID of the managed environment')
param managedEnvironmentId string

@description('Container registry server (e.g., hrndev.azurecr.io)')
param containerRegistryServer string

@description('Container image name with tag (e.g., healthsoc-network-chatbot-ui:latest)')
param containerImage string

@description('API endpoint URL for the backend')
param apiEndpoint string

@description('Project ID for NEXT_PUBLIC_PROJECT_ID environment variable')
param projectId string

@description('Cost center (Kostenstelle) for tagging')
param costCenter string = 'FG473001'

@description('Environment tag (Umgebung) - e.g., Dev, Test, Prod')
param environmentTag string

@description('Responsible person (Verantwortliche*r) for tagging')
param responsiblePerson string = 'Akshay'

@description('Identity type for the container app')
@allowed([
  'None'
  'SystemAssigned'
])
param identityType string = 'None'

@description('Registry authentication identity')
@allowed([
  'system'
  'system-environment'
])
param registryIdentity string = 'system-environment'

@description('Minimum number of replicas')
@minValue(0)
@maxValue(10)
param minReplicas int = 1

@description('Maximum number of replicas')
@minValue(1)
@maxValue(30)
param maxReplicas int = 2

@description('Scale cooldown period in seconds')
param cooldownPeriod int = 300

@description('Polling interval for scaling in seconds')
param pollingInterval int = 30

@description('Concurrent requests threshold for HTTP scaling')
param concurrentRequests string = '10'

@description('CPU allocation (e.g., 0.25, 0.5, 1.0)')
param cpuAllocation string = '0.25'

@description('Memory allocation (e.g., 0.5Gi, 1Gi, 2Gi)')
param memoryAllocation string = '0.5Gi'

@description('Revision suffix for the container app')
param revisionSuffix string

@description('Active revisions mode - Single or Multiple')
@allowed([
  'Single'
  'Multiple'
])
param activeRevisionsMode string = 'Single'

resource containerApp 'Microsoft.App/containerapps@2025-10-02-preview' = {
  name: containerAppName
  location: location
  tags: {
    Kostenstelle: costCenter
    Umgebung: environmentTag
    'Verantwortliche*r': responsiblePerson
  }
  identity: {
    type: identityType
  }
  properties: {
    environmentId: managedEnvironmentId
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: activeRevisionsMode
      ingress: {
        external: true
        targetPort: 3000
        exposedPort: 0
        transport: 'Auto'
        traffic: [
          {
            weight: 100
            latestRevision: true
          }
        ]
        allowInsecure: false
        stickySessions: {
          affinity: 'none'
        }
      }
      registries: [
        {
          server: containerRegistryServer
          identity: registryIdentity
        }
      ]
      identitySettings: []
      maxInactiveRevisions: 100
    }
    template: {
      revisionSuffix: revisionSuffix
      containers: [
        {
          image: containerImage
          imageType: 'ContainerImage'
          name: containerAppName
          env: [
            {
              name: 'NEXT_TELEMETRY_DISABLED'
              value: '1'
            }
            {
              name: 'NEXT_PUBLIC_API_ENDPOINT'
              value: apiEndpoint
            }
            {
              name: 'NEXT_PUBLIC_PROJECT_ID'
              value: projectId
            }
          ]
          resources: {
            cpu: json(cpuAllocation)
            memory: memoryAllocation
          }
          probes: []
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        cooldownPeriod: cooldownPeriod
        pollingInterval: pollingInterval
        rules: [
          {
            name: 'http-scaler'
            http: {
              metadata: {
                concurrentRequests: concurrentRequests
              }
            }
          }
        ]
      }
      volumes: []
    }
  }
}

output containerAppFQDN string = containerApp.properties.configuration.ingress.fqdn
output containerAppName string = containerApp.name
