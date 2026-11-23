# musikal-kombat

Jeu de blind-test en réseau (QCM, Sprint, Combo), par Bizibi.

## Lancement

```bash
npm install
node server.js
```

Puis ouvrir `http://localhost:3000`.

## Code animateur

La page `/animateur.html` demande un code avant de pouvoir piloter la partie.
Un code à 6 chiffres est **généré aléatoirement à chaque lancement** et affiché
dans la console du serveur :

```
🔐 Code animateur : 123456 (à transmettre au présentateur)
```

Aucun secret n'est versionné. Le code change à chaque redémarrage : le
présentateur doit le ressaisir si le serveur est relancé.

Le code est mémorisé dans la session du navigateur : un rechargement de page ne
demande pas de le saisir à nouveau. Si un autre appareil se connecte avec le
code, il reprend la main et l'ancien animateur perd ses droits (utile en cas de
panne de l'ordinateur du présentateur).

## Rôles

- **Animateur** : après saisie du code. Seul habilité à lancer la partie,
  passer les manches, valider les réponses Sprint, corriger le Combo et
  modifier les scores.
- **Équipe** : après inscription. Peut répondre au QCM, buzzer pendant le
  Sprint et soumettre une réponse Combo. Son identité est liée à son socket.
- **Spectateur** : les pages `jeu.html` et `tableau.html` sont en lecture seule.

Les réponses du Sprint (titre/artiste) et les réponses Combo de toutes les
équipes ne sont transmises qu'à l'animateur.

Les tentatives de connexion animateur sont limitées à 5 par appareil.

## Tests

```bash
node tests/combo.test.js
```
