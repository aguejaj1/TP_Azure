#!/usr/bin/env bash
set -e

# Configuration
RESOURCE_GROUP="${1:-rg-flexoffice-prod}"
LOCATION="${2:-francecentral}"
APP_SERVICE_PLAN="asp-flexoffice-prod"
RANDOM_SUFFIX=$((1000 + RANDOM % 9000))
WEB_APP_NAME="flexoffice-app-${RANDOM_SUFFIX}"
POSTGRES_SERVER="psql-flexoffice-${RANDOM_SUFFIX}"
DB_USER="flexadmin"
DB_PASS="SuperSecurePassword2026!"

echo "🚀 Déploiement Azure FlexOffice..."

# 1. Resource Group
echo "📦 Création du Resource Group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

# 2. Azure Database for PostgreSQL Flexible Server
echo "🗄️ Création de PostgreSQL Flexible Server..."
az postgres flexible-server create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$POSTGRES_SERVER" \
  --location "$LOCATION" \
  --admin-user "$DB_USER" \
  --admin-password "$DB_PASS" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --yes

az postgres flexible-server firewall-rule create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$POSTGRES_SERVER" \
  --rule-name AllowAllAzureIPs \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 3. App Service Plan Linux
echo "☁️ Création de l'App Service Plan Linux..."
az appservice plan create \
  --name "$APP_SERVICE_PLAN" \
  --resource-group "$RESOURCE_GROUP" \
  --sku B1 \
  --is-linux

# 4. Multi-container Web App
echo "🐳 Création de la Web App multi-conteneur..."
az webapp create \
  --resource-group "$RESOURCE_GROUP" \
  --plan "$APP_SERVICE_PLAN" \
  --name "$WEB_APP_NAME" \
  --multicontainer-config-type COMPOSE \
  --multicontainer-config-file "./deploy/azure/docker-compose.azure.yml"

# 5. Configuration App Settings
DB_CONN="postgres://${DB_USER}:${DB_PASS}@${POSTGRES_SERVER}.postgres.database.azure.com:5432/flex_office?sslmode=require"
az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$WEB_APP_NAME" \
  --settings \
    AZURE_POSTGRESQL_CONNECTION_STRING="$DB_CONN" \
    JWT_SECRET="azure-jwt-secret-key-${RANDOM_SUFFIX}" \
    WEBSITES_PORT="80"

echo "✅ Déploiement terminé : https://${WEB_APP_NAME}.azurewebsites.net"
