# Veille Citoyenne - SKILLS & APPRENTISSAGES

Ce fichier documente les problèmes complexes rencontrés et les solutions appliquées au fil du développement de la plateforme. Il sert de mémoire technique pour les développements futurs.

---

## Skill appris — 01/05/2026
**Contexte :** Optimisation des performances Frontend (Vite) et Backend (Laravel).
**Problème rencontré :**
- **Vite** : Bundle principal trop lourd, causant des lenteurs au premier chargement. Erreur lors de la création de `manualChunks` pour `firebase` à cause des importations de sous-modules (Firebase v12).
- **React** : Mauvaise UX lors du chargement des données.
- **Laravel** : Problème de requêtes N+1 et lourdeur des calculs statistiques pour le dashboard Super Admin.
**Solution appliquée :**
1. **Code Splitting (Vite)** : Configuration de `manualChunks` comme fonction `(id)` dans `vite.config.js` pour séparer `leaflet`, `recharts`, `firebase` et `react` proprement.
2. **React.lazy & Suspense** : Transformation des imports de pages en `React.lazy` et ajout d'un `Suspense` global avec un fallback squelette (`PageSkeleton`).
3. **Skeletons Loaders** : Création d'un composant `SkeletonCard.jsx` réutilisable (variants: stat, alert, table-row) pour remplacer les spinners basiques.
4. **Cache Redis (Laravel)** : Utilisation de `Cache::remember()` sur les calculs statistiques complexes de l'AdminController (`admin_dashboard_stats`) et sur le flux public des alertes.
5. **Index MySQL** : Création d'une migration pour ajouter des index simples et composites sur la table `alerts` (assigned_institution, status, type, created_at) pour accélérer le triage.
6. **Lazy Loading Images** : Ajout systématique de l'attribut `loading="lazy"` sur toutes les balises `<img src="...">` du frontend via un script de migration.
**À retenir :**
- Ne jamais assigner "firebase" de façon brute dans `manualChunks` (tableau) sur Vite 5+ ; toujours utiliser une fonction conditionnelle sur l'`id` pour capter ses sous-modules.
- Le cache public doit être invalidé dès qu'une entité change d'état (ex: validation d'une alerte).
- `Zustand` avec un export basique `const { state } = useStore()` est déjà optimisé avec shallow-compare sous le capot.
**Stack concernée :** Laravel 12 / React 18 / Redis / Firebase / Vite

---

## Skill appris — 01/05/2026 (Bugs & Fiabilisation)
**Contexte :** Audit de fiabilisation de l'application React et gestion des erreurs silencieuses.
**Problèmes rencontrés :**
- Redirection d'authentification cassée : l'utilisateur non connecté était redirigé vers une route `/connexion` inexistante (404) au lieu de `/portail-prive-vc`.
- Double soumission du formulaire d'alerte due à la présence conjointe de `onClick={handleSubmit}` sur le bouton et `onSubmit={handleSubmit}` sur la balise `<form>`.
- Crash complet de l'application si les identifiants Firebase sont absents ou si le navigateur bloque l'accès aux Service Workers.
- Plantage de `onMessage` (FCM) lors de la réception de messages "data-only" (sans l'objet `notification`).
- Erreur de build Vite (`Top-level await is not available`) causée par l'utilisation d'imports dynamiques (`await import()`) à la racine du module `firebase.js` avec la cible `es2020`.
- Échec de validation Laravel (erreur 422) sur les champs booléens car le frontend envoyait les chaînes `"true"` ou `"false"` au lieu de vrais booléens.
**Solutions appliquées :**
1. **Redirection Auth** : Ajustement rigoureux du composant `ProtectedRoute.jsx`.
2. **Formulaires React** : Suppression du `onClick` manuel sur les boutons `submit` pour laisser l'événement `onSubmit` du formulaire gérer la propagation.
3. **Crash Guards** : Enveloppement de toutes les initialisations Firebase (`getAnalytics`, `getMessaging`) dans des blocs `try/catch` défensifs, et utilisation systématique de l'optional chaining (`payload?.notification?.title`).
4. **Imports Statiques** : Retour aux imports ES statiques (`import { getFirestore }`) au lieu des imports dynamiques pour contourner les limitations du top-level await sous `es2020`.
5. **Casting des requêtes** : Conversion explicite en booléen (`payload.maintenance_mode === 'true'`) dans le frontend avant la requête API pour satisfaire le validateur Laravel `boolean`.
**Stack concernée :** React 18 / Vite / Firebase / Laravel 12 (Validation)

---

## Skill appris — 09/05/2026 (Audit Sécurité — Nouvelles Fonctionnalités Événements)

**Contexte :** Audit de sécurité suite à l'ajout des fonctionnalités RSVP réel, commentaires, galerie post-événement et bouton SOS sur la plateforme Veille Citoyenne.

### Failles trouvées et corrigées ✅

**SEC-NEW-01 — XSS Stocké via commentaires (CORRIGÉ)**
- **Fichier :** `EventController@addComment`
- **Problème :** `author_name` et `content` stockés sans assainissement HTML. Si le contenu est un jour utilisé dans un template email ou rendu sans échappement, une injection `<script>` est possible.
- **Fix :** Ajout de `strip_tags()` avant `trim()` sur les deux champs avant persistance en base.
- **Leçon :** Toujours `strip_tags()` sur les champs texte libres côté backend, même si React échappe en front. La défense en profondeur s'applique à chaque couche.

**SEC-NEW-02 — Validation MIME trop permissive pour la galerie (CORRIGÉ)**
- **Fichier :** `EventController@addGalleryPhoto`
- **Problème :** Seule la règle `image` était appliquée, permettant des types MIME non standards.
- **Fix :** Ajout de `mimes:jpg,jpeg,png,gif,webp` pour restreindre aux formats image courants.
- **Leçon :** La règle `image` de Laravel vérifie le MIME mais reste permissive. Toujours compléter avec `mimes:` pour être explicite sur les extensions autorisées.

**SEC-NEW-03 — RSVP possible sur un événement terminé (CORRIGÉ)**
- **Fichier :** `EventController@rsvp`
- **Problème :** Aucune vérification que l'événement n'était pas terminé (`ends_at` passé). Un bot pouvait continuer à manipuler le compteur après la fin.
- **Fix :** Ajout du check `if ($event->isEnded()) return 422` au début de la méthode.

**SEC-NEW-04 — Absence de modération des commentaires (CORRIGÉ)**
- **Fichier :** `EventController`, `routes/api.php`
- **Problème :** Aucune route de suppression de commentaires. Un spam ou contenu offensant ne pouvait pas être retiré.
- **Fix :** Ajout de `DELETE /events/{event}/comments/{comment}` accessible uniquement au créateur de l'événement et aux super_admin. Le vérouillage `$comment->event_id !== $event->id` empêche la suppression d'un commentaire appartenant à un autre événement (IDOR).

**SEC-NEW-05 — Violation Rules of Hooks React (CORRIGÉ)**
- **Fichier :** `PublicLayout.jsx`
- **Problème :** `useLocation()` était appelé après deux `return` conditionnels (`if (!checked)` et `if (maintenance)`). Cela viole les Rules of Hooks de React et cause un crash en StrictMode.
- **Fix :** `useLocation()` déplacé en première ligne du composant, avant tout return conditionnel.
- **Leçon :** En React, tous les hooks doivent être appelés **avant** tout return conditionnel, toujours en tête du composant.

**SEC-NEW-06 — Requête N+1 dans formatEvent() (CORRIGÉ)**
- **Fichier :** `EventController@index`, `EventController@myEvents`, `EventController@formatEvent`
- **Problème :** `EventRsvp::where('event_id', $event->id)->count()` tirait une requête SQL séparée pour chaque événement lors du listing (20 événements = 20 requêtes COUNT supplémentaires).
- **Fix :** Utilisation de `->withCount('rsvps')` sur les queries Laravel Eloquent, puis `$event->rsvps_count` dans `formatEvent()` avec fallback `?? count()` pour `show()`.
- **Leçon :** `withCount()` génère un seul LEFT JOIN SQL au lieu de N requêtes. Toujours utiliser `withCount()` / `with()` pour les agrégats sur des collections.

### Failles héritées corrigées dans cette session ✅

**SEC-04 — Photos d'alertes : validation MIME permissive (CORRIGÉ)**
- **Fichier :** `AlertController@store` (validation `photos.*`)
- **Problème :** La validation acceptait `application/octet-stream` comme MIME type valide pour les images. Un attaquant pouvait uploader un fichier non-image déguisé.
- **Fix :** Suppression du callback permissif, remplacement par la règle standard `mimes:jpg,jpeg,png,gif,webp,heic`.

**SEC-07 — updateUser : institution_type sans validation exists: (CORRIGÉ)**
- **Fichier :** `AdminController@updateUser`
- **Problème :** Le champ `institution_type` dans la mise à jour d'un utilisateur n'avait pas de contrainte `exists:institutions,slug`. Un super admin pouvait assigner n'importe quelle valeur arbitraire.
- **Fix :** Ajout de `exists:institutions,slug` à la règle de validation.

**SEC-11 — Tracking appareil structuré (AMÉLIORÉ)**
- **Fichier :** `AlertController@formatTracking` (nouvelle méthode), `AlertDetailsPage.jsx`
- **Décision :** Les institutions ont besoin de voir l'IP des déclarants pour leur travail (ex: vérifier la provenance d'un signalement). L'IP reste visible pour institutions ET super_admin.
- **Amélioration :** Le `device_fingerprint` (chaîne pipe-delimitée brute) est désormais parsé côté backend dans `formatTracking()` et retourné comme objet structuré avec : `ecran`, `type` (Mobile/Desktop), `fuseau`, `langue`, `plateforme`, `pixel_ratio`, `couleurs`. La section tracking du frontend a été entièrement refaite avec sections séparées (Déclarant, Réseau, Appareil, Navigateur, Historique), chaque ligne lisible directement.
- **Leçon :** Le parsing des données brutes doit se faire côté backend (une seule fois), pas répété côté frontend avec des `.split('|')[2]` fragiles.

**SEC-12 — fcm_token dans $fillable (mass assignment) (CORRIGÉ)**
- **Fichier :** `App\Models\User`
- **Problème :** `fcm_token` était dans `$fillable`, rendant ce champ accessible via une mise à jour de masse (`User::update([...])`). Un attaquant accédant à un endpoint de mise à jour de profil pouvait potentiellement écraser le token FCM.
- **Fix :** Retrait de `fcm_token` du tableau `$fillable`. Le token est uniquement mis à jour via `POST /me/fcm-token` qui utilise `->update(['fcm_token' => ...])` directement, contournant `$fillable` par design.
- **Leçon :** `$fillable` protège contre les mises à jour non voulues via la saisie utilisateur. Les champs sensibles comme les tokens doivent toujours en être exclus.

**SEC-13 — Absence de headers HTTP de sécurité (CORRIGÉ)**
- **Fichier :** Nouveau `App\Http\Middleware\SecurityHeaders`, `bootstrap/app.php`
- **Problème :** L'API ne renvoyait aucun header de sécurité. Vulnérabilités exposées : clickjacking (X-Frame-Options manquant), MIME sniffing (X-Content-Type-Options manquant), fuites d'info via Referrer.
- **Fix :** Création du middleware `SecurityHeaders` appliqué globalement avec : `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Content-Security-Policy`.
- **Leçon :** Ces headers sont la première ligne de défense côté navigateur. Les ajouter en middleware global (pas par route) garantit une couverture totale.

### Failles identifiées non corrigées (acceptées ou dépendantes d'architecture)

| Code | Description | Raison non corrigée |
|------|-------------|---------------------|
| SEC-14 | `localhost` dans les domaines stateful Sanctum | Environnement de dev uniquement — à retirer en production |
| SEC-15 | Tokens auth dans `sessionStorage` (XSS risk) | Changement d'architecture complet requis (httpOnly cookies). Prévu pour une refonte auth. |

---

## Skill appris — 01/05/2026 (Tests & Validations Backend)
**Contexte :** Écriture et exécution de tests unitaires/fonctionnels (PHPUnit) pour valider l'envoi des médias, le workflow de signalement, et les jobs de notification Firebase.
**Problèmes rencontrés :**
- L'ensemble des tests échouait avec une erreur SQL `Syntax error: 1 near "SHOW"`. Cela était dû à une migration de base de données qui utilisait une requête brute MySQL (`DB::select("SHOW INDEX FROM...")`). L'environnement de test de Laravel utilise par défaut SQLite en mémoire, qui ne comprend pas la syntaxe MySQL.
- Échec du test unitaire `AlertMediaTest::test_upload_oversized_photo_is_rejected`. Lors de la vérification, nous nous sommes rendu compte que la validation du poids maximum (`max_upload_size_mb`) était appliquée aux vidéos et audios, mais oubliée pour les photos dans `AlertController`.
**Solutions appliquées :**
1. **Migrations Agnostiques** : Remplacement de la requête MySQL brute par la méthode native Laravel `Schema::getIndexes($table)` pour vérifier l'existence d'un index, garantissant une compatibilité MySQL/SQLite/PostgreSQL.
2. **Couverture de validation** : Ajout de la règle `"max:{$maxPhotoKb}"` au tableau `photos.*` dans le `AlertController` pour bloquer les images dépassant la limite.
3. **Tests des Notifications** : Création d'une suite de tests `NotificationJobTest` en utilisant `Queue::fake()` pour s'assurer que les jobs d'envoi FCM (`SendAlertNotification` et `SendPublicAlertNotification`) sont bien dispatchés lors de la création et de la validation d'une alerte, sans envoyer de vrais e-mails/requêtes HTTP pendant les tests.
**Stack concernée :** Laravel 12 / PHPUnit / SQLite / Validation Backend
