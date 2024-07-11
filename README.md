# Posty

Une application web simple utilisée à des fins d'enseignement et d'apprentissage d'AWS

## Composants

### web

Dans le dossier [/web](./web). 
Un front-end simple Express pour naviguer les publications d'animaux de compagnie.

### api

Dans le dossier [/api](./api). 
Une API basée sur Express exposant les points de terminaison suivants :

- `/posts`: Lister les 9 dernières publications
- `/posts/:id`: obtenir les détails d'une publication
- `/search?keyword=` pour rechercher des publications en utilisant un mot-clé. Il utilise des index de recherche FULLTEXT sur le titre, le corps et les tags des publications.

### mysql

Si votre instance est suffisamment puissante, alors déployez le service `mysql`. Sinon, commentez-le et spécifiez les valeurs de votre **MySQL** dans le fichier d'environnement à l'intérieur de ["/environments"](./environments).

## Pour commencer

Pour tester cette application :
- Clonez-la dans votre instance AWS EC2.
- `CD` dans le dossier et mettez à jour le fichier `environments/local.env` pour correspondre à votre configuration (si vous avez choisi de ne pas déployer le service MySQL)
- Exécutez `docker compose -f local.yml up`
- Mettez à jour les groupes de sécurité de votre instance pour autoriser les requêtes entrantes dans votre instance depuis Internet.
