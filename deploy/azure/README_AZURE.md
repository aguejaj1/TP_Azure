# Guide de Déploiement Azure App Service (PaaS) & CI/CD

Ce document explique comment déployer l'architecture microservices FlexOffice sur **Microsoft Azure App Service** et connecter le pipeline **GitHub Actions / GitLab CI** pour automatiser les tests et déploiements à chaque commit.

---

## 1. Architecture Déployée sur Azure

```
                +-------------------------------------------------+
                |        Azure Web App for Containers (PaaS)      |
                |                                                 |
  Internet ---> |  [Port 80]  Frontend React (Nginx)              |
                |        |                   |                    |
                |        v                   v                    |
                |  [Port 5001]         [Port 5002]                |
                |  Auth Service  <---> Booking Service            |
                +--------|-------------------|--------------------+
                         |                   |
                         v                   v
                +-------------------------------------------------+
                |   Azure Database for PostgreSQL Flexible Server |
                +-------------------------------------------------+
```

---

## 2. Déploiement Initial via Script

Vous pouvez provisionner l'ensemble de l'infrastructure en une seule commande avec Azure CLI :

### Avec PowerShell (Windows) :
```powershell
cd deploy/azure
./deploy-azure.ps1
```

### Avec Bash (Linux/macOS ou Cloud Shell) :
```bash
cd deploy/azure
chmod +x deploy-azure.sh
./deploy-azure.sh
```

---

## 3. Configuration des Secrets GitHub Actions

Pour activer le déploiement continu automatisé à chaque commit sur `main`, configurez les secrets suivants dans votre dépôt GitHub (**Settings > Secrets and variables > Actions**) :

### 1. `AZURE_CREDENTIALS`
Générez un Service Principal Azure avec la commande suivante :
```bash
az ad sp create-for-rbac \
  --name "sp-flexoffice-github-actions" \
  --role contributor \
  --scopes /subscriptions/<VOTRE_SUBSCRIPTION_ID>/resourceGroups/rg-flexoffice-prod \
  --sdk-auth
```
Copiez l'intégralité du JSON retourné dans le secret GitHub `AZURE_CREDENTIALS`.

### 2. `AZURE_APP_NAME`
Le nom de votre Azure Web App (ex: `flexoffice-app-5421`).

---

## 4. Fonctionnement du Pipeline CI/CD

Chaque commit ou Pull Request sur `main` déclenche le workflow `.github/workflows/ci-cd.yml` :
1. **Tests Automatiques** :
   - Tests Jest d'authentification (`services/auth-service`)
   - Tests Jest de réservation et anti-surbooking (`services/booking-service`)
   - Compilation et build du Frontend React (`frontend`)
2. **Build Docker & Push** :
   - Construction des 3 images conteneurs
   - Publication sur GitHub Packages / Container Registry avec tag du commit (`SHA`) et `latest`
3. **Déploiement Continu PaaS** :
   - Mise à jour du multi-conteneur sur Azure App Service via `docker-compose.azure.yml`
   - Redémarrage sans coupure de service (Zero-downtime deployment)
