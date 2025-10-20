@description('The location for the resource(s) to be deployed.')
param location string = resourceGroup().location

resource octopetsacr 'Microsoft.ContainerRegistry/registries@2025-04-01' = {
  name: take('octopetsacr${uniqueString(resourceGroup().id)}', 50)
  location: location
  sku: {
    name: 'Basic'
  }
  tags: {
    'aspire-resource-name': 'octopetsacr'
  }
}

output name string = octopetsacr.name

output loginServer string = octopetsacr.properties.loginServer