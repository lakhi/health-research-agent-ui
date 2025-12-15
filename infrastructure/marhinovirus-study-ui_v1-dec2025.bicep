param containerapps_marhinovirus_study_ui_name string = 'marhinovirus-study-ui'
param managedEnvironments_socialeconpsy_env_externalid string = '/subscriptions/444c1e5c-ac0d-4420-94ea-d4a5414d20e1/resourceGroups/socialeconpsyresearch/providers/Microsoft.App/managedEnvironments/socialeconpsy-env'

resource containerapps_marhinovirus_study_ui_name_resource 'Microsoft.App/containerapps@2025-02-02-preview' = {
  name: containerapps_marhinovirus_study_ui_name
  location: 'West Europe'
  tags: {
    Kostenstelle: 'FG473001'
    Umgebung: 'Test'
    'Verantwortliche*r': 'Akshay'
  }
  kind: 'containerapps'
  identity: {
    type: 'None'
  }
  properties: {
    managedEnvironmentId: managedEnvironments_socialeconpsy_env_externalid
    environmentId: managedEnvironments_socialeconpsy_env_externalid
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
        stickySessions: {
          affinity: 'none'
        }
      }
      registries: [
        {
          server: 'socialeconpsy-drdfgfb2g7aadtgk.azurecr.io'
          identity: 'system-environment'
        }
      ]
      identitySettings: []
      maxInactiveRevisions: 100
    }
    template: {
      containers: [
        {
          image: 'socialeconpsy-drdfgfb2g7aadtgk.azurecr.io/agent-ui:latest'
          imageType: 'ContainerImage'
          name: containerapps_marhinovirus_study_ui_name
          env: [
            {
              name: 'NEXT_TELEMETRY_DISABLED'
              value: '1'
            }
            {
              name: 'NEXT_PUBLIC_BACKEND_API_ENDPOINT'
              value: 'https://marhinovirus-study-api.whitedesert-10483e06.westeurope.azurecontainerapps.io'
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
        minReplicas: 1
        maxReplicas: 2
        cooldownPeriod: 300
        pollingInterval: 30
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
