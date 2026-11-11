# Script de déploiement automatique sur Microsoft Azure (PowerShell)
# Prérequis : Azure CLI installé (`az login`)

param(
    [string]$ResourceGroup = "rg-flexoffice-prod",
    [string]$Location = "francecentral",
    [string]$AppServicePlan = "asp-flexoffice-prod",
    [string]$WebAppName = "flexoffice-app-$((Get-Random -Minimum 1000 -Maximum 9999))",
    [string]$PostgresServer = "psql-flexoffice-$((Get-Random -Minimum 1000 -Maximum 9999))",
    [string]$DbUser = "flexadmin",
    [string]$DbPassword = "SuperSecurePassword2026!"
)

Write-Host "🚀 Démarrage du déploiement FlexOffice sur Azure..." -ForegroundColor Cyan

# 1. Groupe de ressources
Write-Host "📦 Création du Groupe de Ressources [$ResourceGroup] en région [$Location]..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location

# 2. Base de données PostgreSQL Flexible Server (Optionnel Cloud)
Write-Host "🗄️ Provisionnement Azure Database for PostgreSQL Flexible Server..." -ForegroundColor Yellow
az postgres flexible-server create `
    --resource-group $ResourceGroup `
    --name $PostgresServer `
    --location $Location `
    --admin-user $DbUser `
    --admin-password $DbPassword `
    --sku-name Standard_B1ms `
    --tier Burstable `
    --storage-size 32 `
    --yes

# Autoriser les services Azure à contacter la base
az postgres flexible-server firewall-rule create `
    --resource-group $ResourceGroup `
    --name $PostgresServer `
    --rule-name AllowAllAzureIPs `
    --start-ip-address 0.0.0.0 `
    --end-ip-address 0.0.0.0

# 3. Plan App Service Linux (PaaS)
Write-Host "☁️ Création de l'App Service Plan Linux (B1)..." -ForegroundColor Yellow
az appservice plan create `
    --name $AppServicePlan `
    --resource-group $ResourceGroup `
    --sku B1 `
    --is-linux

# 4. Web App multi-conteneurs
Write-Host "🐳 Création de l'App Service Multi-Container [$WebAppName]..." -ForegroundColor Yellow
az webapp create `
    --resource-group $ResourceGroup `
    --plan $AppServicePlan `
    --name $WebAppName `
    --multicontainer-config-type COMPOSE `
    --multicontainer-config-file "./deploy/azure/docker-compose.azure.yml"

# 5. Configuration des variables d'environnement
$DbConnString = "postgres://$($DbUser):$($DbPassword)@$($PostgresServer).postgres.database.azure.com:5432/flex_office?sslmode=require"

Write-Host "⚙️ Configuration des variables de production..." -ForegroundColor Yellow
az webapp config appsettings set `
    --resource-group $ResourceGroup `
    --name $WebAppName `
    --settings `
        AZURE_POSTGRESQL_CONNECTION_STRING="$DbConnString" `
        JWT_SECRET="prod-flex-office-jwt-key-$((Get-Random))" `
        WEBSITES_PORT="80"

Write-Host "✅ Déploiement terminé avec succès !" -ForegroundColor Green
Write-Host "🌐 URL de votre application : https://$WebAppName.azurewebsites.net" -ForegroundColor Cyan
