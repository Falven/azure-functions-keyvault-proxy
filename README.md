# azure-functions-keyvault-proxy

An Azure Key Vault API proxy written in TypeScript for Azure Functions.

## Goals

To allow users to insert custom logic before or after requests to their Azure Key Vault instances, with minimal setup.
To allow users to log queries, intercept queries, add custom security mechanisms, etc.
To allow users to add a layer of abstraction and fault-tolerance to their Azure Key Vault-accessing microservices.

## About

- Targets [Azure Key Vault API version 7.1](https://docs.microsoft.com/en-us/rest/api/keyvault/)
- All Key, Secret, Certificate, and Storage endpoints included.
- Allows a user to [disable endpoints](https://docs.microsoft.com/en-us/azure/azure-functions/disable-function) they do not wish to expose.
- Targets Azure Functions Runtime ~3
- Utilizes Yarn Berry and plug-n-play modules. 

## Setup

Requires 2 Azure Function App Settings (Environment Variables)

To allow Yarn to load modules via plug-n-play.

1. `"NODE_OPTIONS": "--require ./.pnp.js"`

The endpoint this proxy will route requests to

2. `"AZURE_KEYVAULT_BACKEND_HOST": "https://my-keyvault.vault.azure.net"`

Azure deployment is up to the user, it can be deployed via zip deploy or through a pipeline.

## Usage

Usage of the proxy involves [standard Azure Key Vault authentication, requests, and responses.](https://docs.microsoft.com/en-us/azure/key-vault/general/authentication-requests-and-responses)
