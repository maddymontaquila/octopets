@description('The location for the resource(s) to be deployed.')
param location string = resourceGroup().location

param applicationType string = 'web'

param kind string = 'web'

resource law_octopets_appinsights 'Microsoft.OperationalInsights/workspaces@2025-02-01' = {
  name: take('lawoctopetsappinsights-${uniqueString(resourceGroup().id)}', 63)
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
  tags: {
    'aspire-resource-name': 'law_octopets_appinsights'
  }
}

resource octopets_appinsights 'Microsoft.Insights/components@2020-02-02' = {
  name: take('octopets_appinsights-${uniqueString(resourceGroup().id)}', 260)
  kind: kind
  location: location
  properties: {
    Application_Type: applicationType
    WorkspaceResourceId: law_octopets_appinsights.id
  }
  tags: {
    'aspire-resource-name': 'octopets-appinsights'
  }
}

output appInsightsConnectionString string = octopets_appinsights.properties.ConnectionString

output name string = octopets_appinsights.name