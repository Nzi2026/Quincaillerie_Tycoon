# Quincaillerie Tycoon : application installable (PWA) + Android / iOS

## Contenu du dossier
| Fichier | Rôle |
|---|---|
| `index.html` | Le jeu (votre fichier d'origine + balises PWA + bandeau « Installer »). Le code du jeu lui-même n'a pas été modifié. |
| `manifest.json` | Nom, couleurs et icône de l'appli sur l'écran d'accueil |
| `sw.js` | Service Worker : chargement instantané et jeu **sans connexion** |
| `icons/` | Icônes 192, 512, maskable 512, iOS 180, favicon, et 1024 px pour les stores |
| `capacitor.config.json`, `package.json`, `scripts/` | Pour fabriquer les applications Play Store / App Store |

## 1. Mettre en ligne sur GitHub Pages (gratuit)
1. Créez un dépôt GitHub public et envoyez-y **tout le contenu de ce dossier** (`index.html` à la racine du dépôt).
2. Dépôt → **Settings → Pages** → *Deploy from a branch* → branche `main`, dossier `/ (root)` → **Save**.
3. Après une ou deux minutes, le jeu est disponible sur `https://VOTRE-NOM.github.io/NOM-DU-DEPOT/`.

Le Service Worker exige **HTTPS** (GitHub Pages le fournit) ou `localhost`. Pour tester chez vous : `npx serve .` puis ouvrez `http://localhost:3000`.

## 2. Installer le jeu sur un téléphone
- **Android (Chrome)** : ouvrez le lien, puis touchez **Installer** dans le bandeau du jeu (ou menu ⋮ → *Installer l'application*).
- **iPhone (Safari uniquement)** : touchez **Partager** → **Sur l'écran d'accueil**. Apple ne permet pas de bouton automatique ; le bandeau affiche l'indication.
- **PC (Chrome / Edge)** : icône d'installation dans la barre d'adresse.

Pour vérifier le mode hors ligne : ouvrez le jeu une fois en ligne, passez en mode avion, relancez-le.

## 3. Publier sur Play Store et App Store

### Option A : Capacitor (recommandée : les fichiers sont embarqués dans l'appli)
```
npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npm run build:www
npx cap add android
npx cap add ios
npm run sync
npx cap open android   # Android Studio → Build → Generate Signed Bundle (.aab)
npx cap open ios       # Xcode (Mac) → Product → Archive
```
Changez l'identifiant `com.votrenom.quincaillerietycoon` dans `capacitor.config.json` **avant** `cap add` : il ne pourra plus être modifié une fois l'appli publiée. L'icône à fournir aux stores est `icons/icon-1024-store.png` (sans transparence, comme l'exige Apple).

### Option B : PWABuilder (sans code)
Sur pwabuilder.com, entrez l'adresse GitHub Pages du jeu : il génère un paquet Android (.aab) et un projet Xcode.

Comptes nécessaires : Google Play Console (paiement unique) et Apple Developer (abonnement annuel). Vérifiez les tarifs en vigueur sur leurs sites.

## 4. Mettre à jour le jeu
Modifiez `index.html`, puis **changez `CACHE_VERSION` dans `sw.js`** (`'v1'` → `'v2'`). Sans cela, les joueurs peuvent garder l'ancienne version en cache. La nouvelle version s'active au lancement suivant. Les parties sauvegardées ne sont pas affectées.

## Sauvegarde de la partie : à savoir
- Le jeu sauvegarde dans le stockage du navigateur (`localStorage`, clé `qtSave`). J'ai ajouté une sauvegarde automatique dès que le jeu passe en arrière-plan, car sur téléphone l'ancien déclencheur (`beforeunload`) ne s'exécute pas toujours.
- **Une partie jouée dans le navigateur n'est pas transférée vers l'appli installée** (sur iPhone en particulier, Safari et l'écran d'accueil ont des stockages séparés). De même, l'appli Capacitor a son propre stockage.
- Vider les données du navigateur ou désinstaller l'appli efface la partie. Si vous voulez une vraie protection, il faudra ajouter un bouton « Exporter / Importer ma sauvegarde » (je peux le faire).

## Limites à connaître
- Le jeu n'avance que lorsqu'il est affiché : en arrière-plan, le navigateur met le chronomètre en pause ou le ralentit. Ce n'est pas un défaut de l'installation.
- **App Store** : Apple peut refuser une appli jugée trop proche d'un simple site web. Un jeu complet embarqué avec Capacitor (option A) passe généralement mieux qu'un simple emballage de lien.
- Je n'ai pas pu tester le rendu sur un vrai téléphone ni dans un navigateur. J'ai vérifié la syntaxe, les fichiers référencés, et simulé le comportement hors ligne du Service Worker. Testez d'abord sur votre téléphone avant de soumettre aux stores.
