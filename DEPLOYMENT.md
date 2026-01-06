# Multi-Project Architecture Setup Guide

## Overview

This repository now supports three chatbot projects using a unified codebase with configuration-driven theming and deployment.

## Projects

1. **HealthSoc Network Chatbot** (`healthsoc-network-chatbot`) - Blue/white theme
2. **VaxStudy Chatbot** (`vax-study-chatbot`) - Orange theme
3. **SSC Psychology Chatbot** (`ssc-psych-chatbot`) - Orange theme

## Local Development

### Testing Different Projects Locally

```bash
# Test HealthSoc Network Chatbot
NEXT_PUBLIC_PROJECT_ID=healthsoc-network-chatbot pnpm dev

# Test VaxStudy Chatbot (default)
NEXT_PUBLIC_PROJECT_ID=vax-study-chatbot pnpm dev

# Test SSC Psychology Chatbot
NEXT_PUBLIC_PROJECT_ID=ssc-psych-chatbot pnpm dev
```

### Building for Production

```bash
# Build HealthSoc Network Chatbot
NEXT_PUBLIC_PROJECT_ID=healthsoc-network-chatbot pnpm build

# Build VaxStudy Chatbot
NEXT_PUBLIC_PROJECT_ID=vax-study-chatbot pnpm build

# Build SSC Psychology Chatbot
NEXT_PUBLIC_PROJECT_ID=ssc-psych-chatbot pnpm build
```

## GitHub Secrets Configuration

You need to configure secrets for each project in GitHub Settings > Secrets and Variables > Actions:

### HealthSoc Network Chatbot

- `HEALTHSOC_NETWORK_CHATBOT_ACR_LOGIN_SERVER` = `hrndev.azurecr.io`
- `HEALTHSOC_NETWORK_CHATBOT_ACR_USERNAME` = (ACR username)
- `HEALTHSOC_NETWORK_CHATBOT_ACR_PASSWORD` = (ACR password)
- `HEALTHSOC_NETWORK_CHATBOT_AZURE_CREDENTIALS` = (Azure service principal JSON)

### VaxStudy Chatbot

- `VAX_STUDY_CHATBOT_ACR_LOGIN_SERVER` = `socialeconpsy-drdfgfb2g7aadtgk.azurecr.io`
- `VAX_STUDY_CHATBOT_ACR_USERNAME` = (ACR username)
- `VAX_STUDY_CHATBOT_ACR_PASSWORD` = (ACR password)
- `VAX_STUDY_CHATBOT_AZURE_CREDENTIALS` = (Azure service principal JSON)

### SSC Psychology Chatbot

- `SSC_PSYCH_CHATBOT_ACR_LOGIN_SERVER` = `sscpsych.azurecr.io` (update when ready)
- `SSC_PSYCH_CHATBOT_ACR_USERNAME` = (ACR username)
- `SSC_PSYCH_CHATBOT_ACR_PASSWORD` = (ACR password)
- `SSC_PSYCH_CHATBOT_AZURE_CREDENTIALS` = (Azure service principal JSON)

## Deployment

### Manual Deployment via GitHub Actions

1. Go to **Actions** tab in GitHub
2. Select the workflow for the project you want to deploy:
   - Deploy HealthSoc Network Chatbot
   - Deploy VaxStudy Chatbot
   - Deploy SSC Psychology Chatbot
3. Click **Run workflow** > **Run workflow**

Each workflow will:

1. Build the Docker image with the correct `NEXT_PUBLIC_PROJECT_ID`
2. Push to the project-specific Azure Container Registry
3. Deploy to Azure Container Apps using Bicep parameters
4. Display the deployment URL

### Infrastructure Configuration

Infrastructure is managed through:

- **Single template**: `infrastructure/main.bicep` (parameterized)
- **Project-specific parameters**: `infrastructure/{project-id}.bicepparam`

To update infrastructure for a specific project, edit its `.bicepparam` file.

## Project Configuration

All project-specific settings are in `src/config/projects.ts`:

- API endpoints
- Theme colors and fonts
- Metadata (titles, descriptions)
- Project names

### Adding a New Project

1. Add project definition to `src/config/projects.ts`
2. Create `infrastructure/{project-id}.bicepparam` with Azure settings
3. Create `.github/workflows/deploy-{project-id}.yml` workflow
4. Add GitHub secrets for the new project
5. Test locally with `NEXT_PUBLIC_PROJECT_ID={project-id} pnpm dev`

## Environment Variables

### Build-time (set in Dockerfile or CI/CD)

- `NEXT_PUBLIC_PROJECT_ID` - Selects which project configuration to use

### Runtime (optional override)

- `NEXT_PUBLIC_API_ENDPOINT` - Override API endpoint (takes priority over config)

## File Structure

```
src/
  config/
    projects.ts        # Project configurations (themes, endpoints, metadata)
    endpoints.ts       # Endpoint resolution logic
  app/
    layout.tsx         # Dynamic metadata based on project
    globals.css        # Theme CSS variables
infrastructure/
  main.bicep          # Parameterized Azure template
  healthsoc-network-chatbot.bicepparam
  vax-study-chatbot.bicepparam
  ssc-psych-chatbot.bicepparam
.github/
  workflows/
    deploy-healthsoc-network-chatbot.yml
    deploy-vax-study-chatbot.yml
    deploy-ssc-psych-chatbot.yml
```

## Benefits of This Architecture

✅ **Single codebase** - Bug fixes and features deploy to all projects
✅ **No branch synchronization** - No more merge conflicts between project branches
✅ **Per-project theming** - Different colors, fonts, branding per project
✅ **Independent deployments** - Deploy one project without affecting others
✅ **Easy scaling** - Add new projects in ~30 minutes
✅ **Type-safe configuration** - TypeScript ensures correct project config
