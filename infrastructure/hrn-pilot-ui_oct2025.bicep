param containerapps_hrn_agent_ui_name string = 'hrn-agent-ui'
param managedEnvironments_hrn_env_dev_externalid string = '/subscriptions/444c1e5c-ac0d-4420-94ea-d4a5414d20e1/resourceGroups/health_research_network/providers/Microsoft.App/managedEnvironments/hrn-env-dev'

resource containerapps_hrn_agent_ui_name_resource 'Microsoft.App/containerapps@2025-02-02-preview' = {
  name: containerapps_hrn_agent_ui_name
  location: 'West Europe'
  tags: {
    Kostenstelle: 'FG473001'
    Umgebung: 'Dev'
    'Verantwortliche*r': 'Akshay'
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: managedEnvironments_hrn_env_dev_externalid
    environmentId: managedEnvironments_hrn_env_dev_externalid
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
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
      }
      registries: [
        {
          server: 'hrndev.azurecr.io'
          identity: 'system'
        }
      ]
      identitySettings: []
    }
    template: {
      containers: [
        {
          image: 'hrndev.azurecr.io/agent-ui:latest'
          imageType: 'ContainerImage'
          name: containerapps_hrn_agent_ui_name
          env: [
            {
              name: 'HRN_API_ENDPOINT'
              value: 'https://health-research-api.niceground-23078755.westeurope.azurecontainerapps.io/'
            }
            {
              name: 'NEXT_TELEMETRY_DISABLED'
              value: '1'
            }
          ]
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          probes: []
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
        cooldownPeriod: 180
        pollingInterval: 20
        rules: [
          {
            name: 'http-scaler'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
      volumes: []
    }
  }
}
