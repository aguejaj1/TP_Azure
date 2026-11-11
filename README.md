# 🏢 FlexOffice - Système de Réservation de Salles & Bureaux
### Focus : Architecture Microservices Découplée & Pipeline CI/CD Azure

Application complète permettant aux employés d'une entreprise de réserver un bureau en flex office ou une salle de réunion équipée, avec gestion d'authentification centralisée, contrôle d'accès par rôle (RBAC), détection intelligente des conflits d'horaires et automatisation CI/CD complète.

---

## 📑 Sommaire
- [Architecture Technique](#-architecture-technique)
- [Enjeux Cloud Expérimentés](#-enjeux-cloud-expérimentés)
- [Comptes Démo Pré-configurés](#-comptes-démo-pré-configurés)
- [Démarrage Rapide](#-démarrage-rapide)
- [Exécution des Tests Automatisés](#-exécution-des-tests-automatisés)
- [Exécution avec Docker & Docker Compose](#-exécution-avec-docker--docker-compose)
- [Pipeline CI/CD (GitHub Actions / GitLab CI) & Azure PaaS](#-pipeline-cicd-github-actions--azure-paas)
- [Structure du Projet](#-structure-du-projet)

---

## 🏛️ Architecture Technique

| Composant | Technologie | Port | Description |
|---|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide | `3000` | Interface utilisateur responsive, plan d'étage interactif, badges de statut microservices |
| **Service 1 : Auth** | Node.js, Express, JWT, bcryptjs | `5001` | Microservice de gestion des utilisateurs, rôles (`EMPLOYEE`, `MANAGER`, `ADMIN`) et vérification de tokens |
| **Service 2 : Booking** | Node.js, Express, Fetch REST | `5002` | Microservice de gestion des salles, bureaux flex, calendrier, vérification anti-surbooking |
| **Passerelle / Ingress**| Nginx Reverse Proxy | `80` | Routage des requêtes client vers les microservices respectifs |
| **Base de Données** | PostgreSQL 16 (ou mémoire locale) | `5432` | Persistance relationnelle avec initialisation automatique |

---

## ☁️ Enjeux Cloud Expérimentés

1. **Architecture Découplée & Communication Inter-Services** :
   - Deux API distinctes et autonomes.
   - Lorsque le client effectue une réservation sur le **Service 2 (Booking)**, ce dernier contacte directement le **Service 1 (Auth)** via un appel HTTP REST (`/api/auth/verify`) pour valider l'identité et les permissions de l'utilisateur.
   - Les services disposent de leurs propres suites de tests unitaires et d'intégration et de leurs propres `Dockerfile`.

2. **Automatisation CI/CD & Déploiement Continu sur PaaS Azure** :
   - Pipeline GitHub Actions (`.github/workflows/ci-cd.yml`) et GitLab CI (`.gitlab-ci.yml`).
   - À chaque commit ou Pull Request :
     - Exécution des tests automatisés (Jest & Supertest).
     - Construction des images Docker multi-étages.
     - Publication sur un registre de conteneurs (GHCR / Azure Container Registry).
     - Déploiement automatique sur **Azure App Service (Web App for Containers)**.

---

## 🔑 Comptes Démo Pré-configurés

Des boutons de **connexion en 1-clic** sont directement intégrés sur l'écran d'accueil :

| Profil | Email | Mot de passe | Rôle | Département |
|---|---|---|---|---|
| **Alice (Employé)** | `alice@company.com` | `alice123` | `EMPLOYEE` | Ingénierie |
| **Bob (Employé)** | `bob@company.com` | `bob123` | `EMPLOYEE` | Design & UX |
| **Sophie (Manager)** | `manager@company.com` | `manager123` | `MANAGER` | Marketing |
| **Admin Système** | `admin@company.com` | `admin123` | `ADMIN` | IT & Facilities |

---

## 🚀 Démarrage Rapide

### 1. Cloner ou ouvrir le dossier du projet
```powershell
cd "C:\Users\aymen.mouanis.27\Desktop\flex-office-app"
```

### 2. Installer toutes les dépendances
```powershell
node scripts/install-all.js
```

### 3. Lancer l'ensemble des services en local
```powershell
node scripts/start-all.js
```
L'application est immédiatement accessible :
- **Frontend Web** : [http://localhost:3000](http://localhost:3000)
- **API Auth** : [http://localhost:5001/api/auth/health](http://localhost:5001/api/auth/health)
- **API Booking** : [http://localhost:5002/api/bookings/health](http://localhost:5002/api/bookings/health)

---

## 🧪 Exécution des Tests Automatisés

Pour lancer la suite de tests unitaires et d'intégration (comme exécuté dans le pipeline CI/CD) :

```powershell
node scripts/test-all.js
```

Ou individuellement par service :
```powershell
cd services/auth-service && npm test
cd services/booking-service && npm test
```

---

## 🐳 Exécution avec Docker & Docker Compose

Pour démarrer l'ensemble de la pile (PostgreSQL + Auth + Booking + Frontend + Nginx Gateway) :

```powershell
docker compose up --build
```
L'application complète sera disponible sur le port standard : [http://localhost](http://localhost).

Pour arrêter la pile :
```powershell
docker compose down
```

---

## ☁️ Pipeline CI/CD & Déploiement Azure

Consultez le guide détaillé dans [`deploy/azure/README_AZURE.md`](deploy/azure/README_AZURE.md).

- **Script de déploiement automatique Azure** : `deploy/azure/deploy-azure.ps1`
- **Définition du workflow GitHub Actions** : `.github/workflows/ci-cd.yml`
- **Définition du workflow GitLab CI** : `.gitlab-ci.yml`
- **Configuration Compose pour Azure App Service** : `deploy/azure/docker-compose.azure.yml`

---

## 📂 Structure du Projet

```text
flex-office-app/
├── .github/workflows/ci-cd.yml      # Pipeline GitHub Actions (Test, Build, Deploy Azure)
├── .gitlab-ci.yml                   # Pipeline GitLab CI
├── docker-compose.yml               # Orchestration Docker locale multi-conteneurs
├── ARCHITECTURE.md                  # Documentation technique & diagrammes de séquence
├── README.md                        # Documentation générale
│
├── services/
│   ├── auth-service/                # Microservice 1 : Utilisateurs & JWT (Port 5001)
│   │   ├── Dockerfile
│   │   ├── src/ (index, models, controllers, middleware, routes)
│   │   └── tests/ (auth.test.js)
│   │
│   └── booking-service/             # Microservice 2 : Réservations & Bureaux (Port 5002)
│       ├── Dockerfile
│       ├── src/ (index, models, controllers, services/authClient, routes)
│       └── tests/ (booking.test.js)
│
├── frontend/                        # Application Web React 18 + Vite + Tailwind (Port 3000)
│   ├── Dockerfile & nginx.conf
│   └── src/ (components, context, pages, services)
│
├── gateway/                         # Passerelle Nginx Ingress (Port 80)
│   ├── Dockerfile
│   └── nginx.conf
│
├── deploy/azure/                    # Scripts & templates Azure App Service PaaS
│   ├── docker-compose.azure.yml
│   ├── deploy-azure.ps1
│   ├── deploy-azure.sh
│   └── README_AZURE.md
│
└── scripts/
    ├── install-all.js               # Installation en une commande
    ├── test-all.js                  # Lancement des tests de tous les services
    └── start-all.js                 # Démarrage simultané en développement
```
