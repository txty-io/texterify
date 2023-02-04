#!/bin/bash

npx @openapitools/openapi-generator-cli generate -i ./docs/swagger.yml -g typescript-aurelia -o ./docs/openapi-typescript-client
cp ./docs/openapi-typescript-client/models.ts ./app/javascript/typings/APITypes.ts
