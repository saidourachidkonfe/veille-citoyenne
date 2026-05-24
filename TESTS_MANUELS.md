# Tests Manuels — Veille Citoyenne

> Ce document décrit les tests manuels à exécuter pour valider le bon fonctionnement de la plateforme.
> Cocher chaque test après vérification.

---

## 1. Authentification

- [ ] **Login Super Admin** → accès dashboard complet (stats, utilisateurs, logs, paramètres, alertes)
- [ ] **Login Institution** → voir uniquement les alertes assignées à cette institution
- [ ] **Mauvais mot de passe** → message d'erreur clair ("Identifiants invalides")
- [ ] **Token expiré** → redirection automatique vers la page de connexion
- [ ] **Compte désactivé** → message "Votre compte est désactivé" (code 403)
- [ ] **Mot de passe oublié** → email reçu avec lien fonctionnel de réinitialisation
- [ ] **Réinitialisation mot de passe** → formulaire fonctionne, mot de passe modifié avec succès

---

## 2. Soumission d'alerte (côté public)

- [ ] **Soumettre une alerte sans compte** (anonyme) → succès, référence reçue
- [ ] **Soumettre avec une photo** (JPEG/PNG) → photo visible dans le dashboard institution
- [ ] **Soumettre avec une vidéo** (MP4) → vidéo lisible dans le dashboard institution
- [ ] **Soumettre avec un audio** (enregistrement navigateur) → audio lisible dans le dashboard
- [ ] **Soumettre sans média** → succès sans erreur
- [ ] **Soumettre avec un fichier interdit** (.exe, .pdf) → rejet avec message d'erreur clair
- [ ] **Soumettre avec un fichier trop lourd** (>20MB) → rejet avec message "fichier trop volumineux"
- [ ] **Soumettre depuis un mobile** sur le réseau WiFi → succès
- [ ] **Soumettre avec géolocalisation** → coordonnées affichées sur la carte dans le dashboard
- [ ] **Soumettre sans géolocalisation** → alerte créée sans erreur, pas de marqueur carte
- [ ] **Champ description trop court** (<20 car.) → erreur de validation
- [ ] **Avertissement légal non coché** → soumission bloquée

---

## 3. Routage des alertes (côté dashboard institution)

### Routage simple (1 institution)
- [ ] **Alerte type "vol"** → apparaît UNIQUEMENT dans le dashboard Police
- [ ] **Alerte type "incendie"** → apparaît UNIQUEMENT dans le dashboard Pompiers
- [ ] **Alerte type "evenement_derangeant"** → apparaît UNIQUEMENT dans Brigade Labale
- [ ] **Alerte type "cambriolage"** → apparaît UNIQUEMENT dans le dashboard Police
- [ ] **Alerte type "violence_domestique"** → apparaît UNIQUEMENT dans le dashboard Police

### Routage double (2 institutions)
- [ ] **Alerte type "accident"** → apparaît dans Pompiers **ET** Police (2 alertes créées, même référence de base)
- [ ] **Alerte type "personne_egaree"** → apparaît dans Police **ET** Gendarmerie
- [ ] **Alerte type "objet_suspect"** → apparaît dans Garde Présidentielle **ET** Police

### Routage rural/urbain
- [ ] **Alerte "conflit" en zone urbaine** → Police uniquement
- [ ] **Alerte "conflit" en zone rurale** → Gendarmerie en priorité

### Isolation inter-institutions
- [ ] **Se connecter avec compte Pompiers** → ne PAS voir les alertes assignées à la Police
- [ ] **Se connecter avec compte Police** → ne PAS voir les alertes assignées aux Pompiers
- [ ] **Tenter de valider une alerte d'une autre institution** → erreur 403

---

## 4. Dashboard Super Admin

- [ ] **Voir toutes les alertes** de toutes les institutions (pas de filtre institution)
- [ ] **Statistiques affichées** : nombre total alertes, par type, par zone, par statut
- [ ] **Créer un compte institution** → login avec ce compte fonctionne
- [ ] **Créer un compte citoyen** → login avec ce compte fonctionne
- [ ] **Désactiver un compte** → l'utilisateur ne peut plus se connecter
- [ ] **Réactiver un compte** → l'utilisateur peut se reconnecter
- [ ] **Logs d'activité** → chaque action admin est enregistrée et visible
- [ ] **Paramètres plateforme** → modifier le nom de l'app, sauvegarder, vérifier la persistance
- [ ] **Gestion des institutions** → ajouter, modifier, supprimer une institution

---

## 5. Workflow alerte (cycle de vie complet)

- [ ] **Soumission** → statut "Soumis" → auto-assigné à une institution → statut "En attente"
- [ ] **Validation par institution** → statut passe à "Validé"
- [ ] **Résolution par institution** → statut passe à "Résolu"
- [ ] **Rejet par institution** → statut passe à "Rejeté", motif obligatoire
- [ ] **Commentaire institution** → ajouté à l'alerte, visible dans le détail
- [ ] **Commentaire interne** → marqué "interne", non visible par le citoyen
- [ ] **Tracking** → chaque changement de statut est enregistré dans l'historique

---

## 6. Pages publiques

- [ ] **Page d'accueil** → affiche les statistiques, les dernières alertes
- [ ] **Liste des alertes** → seules les alertes validées/en cours/résolues sont visibles
- [ ] **Détail d'une alerte** → informations complètes, médias, carte (si géolocalisée)
- [ ] **Liste des événements** → affiche les événements publiés
- [ ] **Détail d'un événement** → informations complètes, carte, description
- [ ] **Page FAQ** → affichée correctement

---

## 7. Réseau local (mobile)

- [ ] **Ouvrir le site depuis le mobile** sur le même WiFi (http://192.168.11.105:5173) → page s'affiche
- [ ] **Soumettre une alerte depuis le mobile** → apparaît dans le dashboard sur le PC
- [ ] **Upload photo depuis la caméra mobile** → photo correctement envoyée et visible
- [ ] **Upload audio enregistré sur mobile** → audio envoyé et lisible
- [ ] **Navigation complète sur mobile** → responsive, pas de coupure d'affichage

---

## 8. Médias

- [ ] **Photos uploadées** → URLs accessibles depuis le réseau local (pas 127.0.0.1)
- [ ] **Vidéos uploadées** → lisibles dans le navigateur
- [ ] **Audio uploadé** → lecteur audio fonctionnel
- [ ] **Alerte dupliquée (accident)** → médias copiés dans les 2 alertes
- [ ] **Suppression d'alerte** → médias supprimés (soft delete n'efface pas les médias)

---

## 9. Notifications Push (FCM)

- [ ] **Abonnement du navigateur** → Lorsqu'un citoyen ou une institution se connecte, le navigateur demande l'autorisation d'envoyer des notifications.
- [ ] **Notification de nouvelle alerte (Institution)** → Soumettre une alerte (ex: Vol) en tant que citoyen. L'institution (Police) reçoit une notification push "Nouvelle alerte".
- [ ] **Notification de validation (Citoyen)** → L'institution valide l'alerte. Le citoyen reçoit une notification push lui indiquant que son signalement est "En cours de traitement".
- [ ] **Test de la notification en arrière-plan** → L'alerte est modifiée pendant que l'utilisateur a fermé l'onglet (mais le navigateur est ouvert) : la notification apparaît au niveau du système (Windows/Android).

---

## 10. Analytique et Performances (Firebase)

- [ ] **Navigation fluide (Page Views)** → Naviguer de la page d'accueil vers `/signaler` puis vers `/dashboard`.
- [ ] **Vérification Analytics Console** → Se rendre sur [Firebase Console > Analytics > Realtime]. Vérifier que l'utilisateur actif apparaît sur la bonne page (`/signaler` ou `/dashboard`).
- [ ] **Latence (Performance Monitoring)** → Se rendre sur [Firebase Console > Performance]. Vérifier que les requêtes réseaux vers l'API Laravel (`/api/alerts`) s'affichent avec leur temps de réponse moyen (en millisecondes).

---

## Tableau de routage de référence

| Type d'alerte | Institution(s) cible(s) | Duplication ? |
|---|---|---|
| vol | Police | Non |
| cambriolage | Police | Non |
| violence_domestique | Police | Non |
| conflit (urbain) | Police | Non |
| conflit (rural) | Gendarmerie + Police | Oui |
| activite_suspecte (urbain) | Police | Non |
| activite_suspecte (rural) | Gendarmerie + Police | Oui |
| incendie | Pompiers | Non |
| accident | Pompiers + Police | Oui |
| personne_egaree | Police + Gendarmerie | Oui |
| objet_suspect | Garde Présidentielle + Police | Oui |
| evenement_derangeant | Brigade Labale | Non |

---

## Comptes de test (seeder)

| Rôle | Email | Mot de passe |
|---|---|---|
| Super Admin | admin@veillecitoyenne.bf | Admin@2026! |
| Police | police.arr1@veillecitoyenne.bf | Institution@2026! |
| Gendarmerie | gendarmerie.arr2@veillecitoyenne.bf | Institution@2026! |
| Pompiers | pompiers.arr3@veillecitoyenne.bf | Institution@2026! |
| Garde Prés. | gpn@veillecitoyenne.bf | Institution@2026! |
| Brigade Labale | labale.arr5@veillecitoyenne.bf | Institution@2026! |
| Contributeur | contrib@veillecitoyenne.bf | Contrib@2026! |
| Citoyen | aminata@veillecitoyenne.bf | Citoyen@2026! |

---

## 11. Refactoring des Rôles & Inscription (Citoyen vs Contributeur)

### Inscription Publique
- [ ] **Web & Mobile :** L'écran de création de compte assigne par défaut le rôle `citoyen` aux nouveaux utilisateurs.
- [ ] **Accès direct :** Les citoyens peuvent s'inscrire, se connecter, consulter les alertes/événements, et laisser des commentaires.

### Gestion des Événements
- [ ] **Citoyen simple :** Ne voit plus le bouton de création d'événement dans le dashboard Web. L'API `POST /events` renvoie une erreur `403 Forbidden` pour un citoyen.
- [ ] **Contributeur :** Peut accéder à "Mes Événements", créer de nouveaux événements, et supprimer les siens.
- [ ] **Super Admin :** Peut créer des comptes avec le rôle `contributeur` depuis l'interface d'administration des utilisateurs.
- [ ] **Affichage Profil :** Le rôle affiché dans la page Profil web/mobile reflète correctement le statut "Contributeur" ou "Citoyen".

---

## 11. Application Mobile — UX & Interactions

### Micro-interactions (PressableCard)
- [ ] **Clic sur une alerte (Accueil)** → la carte s'enfonce légèrement (scale 0.95) puis rebondit avec élasticité avant navigation
- [ ] **Clic sur un événement (Accueil)** → même effet de ressort sur les cards événements
- [ ] **Vitesse d'animation** → l'enfoncement est rapide (~50ms), le rebond est lent et organique (~18ms)

### Skeletons de chargement
- [ ] **Ouverture de l'appli (hors cache)** → les grilles de skeletons shimmer s'affichent à la place du texte "Chargement..."
- [ ] **Effet shimmer** → oscillation fluide entre deux tons de gris (pas de clignotement brusque)
- [ ] **Transition** → les skeletons disparaissent sans saut visuel quand les données arrivent

### Retour Haptique
- [ ] **Sélection d'un type d'incident** (formulaire) → légère vibration tactile (Impact.Light)
- [ ] **Soumission réussie** → vibration de succès (Notification.Success) + toast vert
- [ ] **Soumission échouée** → vibration d'erreur (Notification.Error) + toast rouge

### Statistiques Globales (Accueil)
- [ ] **Section "Statistiques Globales"** → affiche le nombre total de signalements et le % résolu
- [ ] **Données dynamiques** → les valeurs changent selon les données réelles de l'API `/alerts/stats`
- [ ] **Mode sombre** → fond de la statsGrid adapté (`#1A2035`)

### Profil — Section Informations
- [ ] **Section "Informations" visible** → FAQ & Aide, Guide, Mentions légales, Nous contacter
- [ ] **Clic sur chaque lien** → toast "Bientôt disponible sur mobile" (non bloquant)
- [ ] **Séparateurs** → lignes de séparation entre les items dans la groupCard

### Commentaires sur Événements
- [ ] **Formulaire de commentaire** visible en bas de la page détail d'un événement
- [ ] **Utilisateur non connecté** → clic sur "Envoyer" redirige vers la page de login
- [ ] **Commentaire vide** → bouton désactivé (ne soumet pas)
- [ ] **Commentaire soumis** → toast succès, liste de commentaires rechargée automatiquement
- [ ] **Clavier iOS** → le formulaire remonte avec le clavier (KeyboardAvoidingView)

### Mode Sombre (Dark Mode)
- [ ] **Accueil** → bg `#0A0E1A`, sections et cartes adaptées
- [ ] **Profil** → header reste bleu, groupCards passent en `#1A2035`
- [ ] **Toggle** → changement instantané sans redémarrage

---

## 12. Gatekeeping — Stratégie Visiteur → Citoyen

> Objectif : Le visiteur non connecté peut **lire** tout le contenu, mais est bloqué dès qu'il tente une **action interactive**.

### Écran Accueil (`index.jsx`)
- [ ] **Bouton "Créer un signalement"** (Actions rapides) → visiteur clique → modale AuthPrompt s'affiche ("Rejoignez la communauté !")
- [ ] **Carte "Carte des incidents"** (Actions rapides) → visiteur clique → modale AuthPrompt ("Carte exclusive")
- [ ] **Clic sur une alerte** (Dernières alertes publiques) → modale AuthPrompt ("Accès restreint")
- [ ] **Clic sur un événement** (Prochains événements) → modale AuthPrompt ("Inscription requise")
- [ ] **Bouton [+] central (FAB)** dans la TabBar → visiteur clique → redirection directe vers `/(auth)/login`
- [ ] **Modale AuthPrompt** → bouton "Se connecter / S'inscrire" → redirige vers `/(auth)/login`
- [ ] **Modale AuthPrompt** → bouton "Plus tard" → ferme la modale, reste sur l'accueil

### Écran Profil (`profile.jsx`)
- [ ] **Clic sur la photo de profil** (visiteur) → toast info + redirection vers login
- [ ] **Clic sur "Informations personnelles"** (visiteur) → toast info + redirection vers login
- [ ] **Bouton "Se connecter"** affiché à la place de "Se déconnecter" pour un visiteur
- [ ] **Statistiques** (0 signalements, 0 points) → affichées même pour le visiteur

### Écran Événements (`events/index.jsx`)
- [ ] **Clic sur une carte d'événement** → visiteur → modale AuthPrompt bleu
- [ ] **Bouton "Je participe"** sur une carte → visiteur → modale AuthPrompt
- [ ] **Mode Calendrier** : clic sur un jour marqué (événement) → visiteur → modale AuthPrompt
- [ ] **Icône calendrier en haut à droite** → bascule entre vue liste et vue calendrier ✓ (pour tous)
- [ ] **Bouton "Afficher plus d'événements"** → fonctionne pour tous (visiteur + connecté)
- [ ] **Sections "À venir" / "Passés"** → séparées correctement avec indicateur coloré

### Écran Carte & Alertes (`alerts/index.jsx`)
- [ ] **Clic sur une carte d'alerte** (grille 2 colonnes) → visiteur → modale AuthPrompt ("Accès restreint")
- [ ] **Clic sur un marqueur unique** sur la MapView → visiteur → modale AuthPrompt
- [ ] **Clic sur un cluster** (bulle avec plusieurs alertes) → Bottom Sheet s'ouvre (liste des incidents)
- [ ] **Clic sur un incident dans le Bottom Sheet** → visiteur → modale AuthPrompt
- [ ] **Bouton "Afficher plus d'alertes"** → charge 4 alertes supplémentaires
- [ ] **Bouton "Trier par"** → bascule entre "Plus récentes" et "Plus anciennes"

---

## 13. Carte & Alertes — Nouvelle Interface

### MapView Interactive
- [ ] **Bouton [+] Zoom** (haut droite) → zoom in sur la carte avec animation fluide
- [ ] **Bouton [–] Zoom** (haut droite) → zoom out sur la carte avec animation fluide
- [ ] **Bouton "Couches"** (icône layers) → bascule entre mode Standard et Satellite
- [ ] **Bouton "Ma position"** (bas gauche) → recentre la carte sur Ouagadougou + toast "Centré sur votre position"
- [ ] **Compteur d'incidents** (bas droite) → affiche le nombre réel d'alertes géolocalisées

### Clusters & Marqueurs
- [ ] **Marqueur unique** → icône ⚠️ blanche sur fond bleu
- [ ] **Cluster (N alertes)** → bulle colorée avec le nombre affiché en blanc
- [ ] **Clic cluster** → Bottom Sheet glisse du bas avec la liste des N alertes du cluster
- [ ] **Bottom Sheet** → tap en dehors → ferme le Bottom Sheet

### Liste d'alertes (grille 2 colonnes)
- [ ] **Chips de filtre** (Toutes / Soumises / En cours / Résolues) → filtrent la liste et la grille
- [ ] **Compteurs sur les chips** → affichent le vrai nombre d'alertes selon le statut
- [ ] **Barre de recherche** → filtre les alertes selon le texte saisi (>2 caractères)
- [ ] **Pull to refresh** → actualise les alertes et la carte
- [ ] **Cartes d'alertes** → icône couleur selon le type (accident, incendie, sécurité...)
- [ ] **Badge de statut** → couleur correcte selon le statut (Soumis, En cours, Résolu)
