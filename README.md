# Agent UI

A modern multi-project chat interface for the Health in Society Research Network (NEX) and VAX Study agents at Uni Wien built with Next.js, Tailwind CSS, and TypeScript. Cloned and modified from Agno Agent UI: <https://docs.agno.com/agent-os/agent-ui>

# Open-source client libraries for building Agno frontends

1. <https://reddit.com/r/agno>
2. <https://github.com/antipopp/agno-client>

## License

This project is licensed under the [MIT License](./LICENSE).

## API Endpoint Configuration Changes

### vax-study-chatbot (local dev swap)

The following files had their hardcoded production API endpoint replaced with localhost for local development:

1. [src/config/projects.ts](src/config/projects.ts#L96) - Line 96
2. [infrastructure/vax-study-chatbot.bicepparam](infrastructure/vax-study-chatbot.bicepparam#L9) - Line 9

**Changed from:** `https://marhinovirus-study-api.whitedesert-10483e06.westeurope.azurecontainerapps.io`  
**Changed to:** `http://localhost:8000`

### nex (production endpoint set for deployment)

The following file had its localhost placeholder replaced with the production API endpoint for deployment:

1. [src/config/projects.tsx](src/config/projects.tsx#L81) - Line 81

**Changed from:** `http://localhost:8000`  
**Changed to:** `https://nex-agent-api.thankfulcliff-e4e3da3e.swedencentral.azurecontainerapps.io`

> **Note:** `NEXT_PUBLIC_*` env vars must be baked in at `next build` time — Container Apps runtime env vars alone don't work. The Dockerfile now declares `ARG NEXT_PUBLIC_PROJECT_ID` in the builder stage so the workflow build arg is correctly forwarded to the Next.js build.

## Steps to Deploy to Azure (Vax-Study-Daily Release)

1. Update the API endpoints in projects.ts and the vax study bicep

2. deploy using bicep param (below seems to not release and deploy a new version):

az deployment group create \
 --resource-group socialeconpsyresearch \
 --template-file infrastructure/main.bicep \
 --parameters infrastructure/vax-study-chatbot.bicepparam

1. verify the revisions are healthy
   az containerapp revision list \
    --name marhinovirus-study-ui \
    --resource-group socialeconpsyresearch \
    --output table

2. reroute traffic to original:
   az containerapp ingress traffic set \
    --name marhinovirus-study-ui \
    --resource-group socialeconpsyresearch \
    --revision-weight marhinovirus-study-ui--v1-a1=0 marhinovirus-study-ui--0000006=100
