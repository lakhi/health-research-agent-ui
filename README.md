# Agent UI

A modern chat interface for the Health Research Network agent at Uni Wien built with Next.js, Tailwind CSS, and TypeScript. Cloned and modified from Agno Agent UI: https://docs.agno.com/agent-os/agent-ui


## License

This project is licensed under the [MIT License](./LICENSE).

## Steps to Deploy to Azure (Vax-Study-Daily Release)


1. Update the API endpoints in projects.ts and the vax study bicep

2. deploy using bicep param:

az deployment group create \
  --resource-group socialeconpsyresearch \
  --template-file infrastructure/main.bicep \
  --parameters infrastructure/vax-study-chatbot.bicepparam

3. verify the revisions are healthy
   az containerapp revision list \
    --name marhinovirus-study-ui \
    --resource-group socialeconpsyresearch \
    --output table

4. reroute traffic to original:
az containerapp ingress traffic set \
  --name marhinovirus-study-ui \
  --resource-group socialeconpsyresearch \
  --revision-weight marhinovirus-study-ui--v1-a1=0 marhinovirus-study-ui--0000006=100
