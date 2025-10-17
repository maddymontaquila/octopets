targetScope = 'subscription'

param resourceGroupName string

param location string

param principalId string

resource rg 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name: resourceGroupName
  location: location
}

module octopets_aca 'octopets-aca/octopets-aca.bicep' = {
  name: 'octopets-aca'
  scope: rg
  params: {
    location: location
    userPrincipalId: principalId
  }
}

module octopets_appinsights 'octopets-appinsights/octopets-appinsights.bicep' = {
  name: 'octopets-appinsights'
  scope: rg
  params: {
    location: location
  }
}

output octopets_aca_AZURE_CONTAINER_REGISTRY_NAME string = octopets_aca.outputs.AZURE_CONTAINER_REGISTRY_NAME

output octopets_aca_AZURE_CONTAINER_REGISTRY_ENDPOINT string = octopets_aca.outputs.AZURE_CONTAINER_REGISTRY_ENDPOINT

output octopets_aca_AZURE_CONTAINER_REGISTRY_MANAGED_IDENTITY_ID string = octopets_aca.outputs.AZURE_CONTAINER_REGISTRY_MANAGED_IDENTITY_ID

output octopets_aca_AZURE_CONTAINER_APPS_ENVIRONMENT_DEFAULT_DOMAIN string = octopets_aca.outputs.AZURE_CONTAINER_APPS_ENVIRONMENT_DEFAULT_DOMAIN

output octopets_aca_AZURE_CONTAINER_APPS_ENVIRONMENT_ID string = octopets_aca.outputs.AZURE_CONTAINER_APPS_ENVIRONMENT_ID

output octopets_appinsights_appInsightsConnectionString string = octopets_appinsights.outputs.appInsightsConnectionString