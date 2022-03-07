# ![](ressources/logo.jpg) Prog web client riche - JavaScript

### IUT Montpellier-Sète - Département Informatique

## TD6 Bis

#### _Thème : AJAX, promesses et async/await_

Cliquez sur le lien ci-dessous pour faire votre fork privé du TD6 Bis (**attention, pas de fork à la main !**):

**TODO:** lien classroom

## Introduction

Nous allons voir ici les différentes techniques et syntaxes qui ont été ajoutées au langage pour faciliter l'utilisation de requêtes AJAX.

Nous utiliserons [l'API Pokémon](https://pokeapi.co) qui permet d'obtenir des informations (très) détaillées sur les différents *pokémon* et autres éléments des jeux videos. On peut faire plusieurs types de requêtes à l'API. Nous utiliserons en particulier (les liens renvoient vers la documentation de l'API, les exemples de réponses ne montrent qu'une partie des valeurs renvoyées, qui sont celles qui nous intéressent dans ce TD) :

- [Pokemon](https://pokeapi.co/docs/v2#pokemon) : informations correspondant à un *pokémon* particulier (par nom ou numéro)
    - `https://pokeapi.co/api/v2/pokemon/{id or name}/`
    - Exemple de réponse :
    ```json
        {
            "id": 6,
            "is_default": true,
            "name": "charizard",
            "species": {"name": "charizard", "url": "https://pokeapi.co/api/v2/pokemon-species/6/"},
            "sprites": {
                "front_default": "https:// ... /pokemon/6.png",
            },
            "types": [
                {
                    "slot": 1, 
                    "type": {"name": "fire", "url": "https://pokeapi.co/api/v2/type/10/"}
                },
                {
                    "slot": 2, 
                    "type": {"name": "flying", "url": "https://pokeapi.co/api/v2/type/3/"}
                },
            ],
        }
    ```

- [Pokemon Species](https://pokeapi.co/docs/v2#pokemon-species) : informations concernant une *espèce* de *pokémon*
    - `https://pokeapi.co/api/v2/pokemon-species/{id or name}/`
    - Il peut y avoir plusieurs *pokémon* de la même *espèce*. Par exemple l'espèce *charizard* correspond aux *pokémon* *charizard*, *charizard-mega-x*, *charizard-mega-y* et *charizard-gmax*
    - Exemple de réponse :
        ```json
        {
            "evolution_chain": {"url": "https://pokeapi.co/api/v2/evolution-chain/2/"},
            "evolves_from_species": {"url": "https://pokeapi.co/api/v2/evolution-chain/2/"},
            "name": "charizard",
            "varieties": [
                {
                    "is_default": true,
                    "pokemon": {"name": "charizard", "url": "https://pokeapi.co/api/v2/pokemon/6/"}
                },
                {
                    "is_default": false,
                    "pokemon": {"name": "charizard-mega-x", "url": "https://pokeapi.co/api/v2/pokemon/10034/"}
                },
                {
                    "is_default": false, 
                    "pokemon": {"name": "charizard-mega-y", "url": "https://pokeapi.co/api/v2/pokemon/10035/"}
                },
                {
                    "is_default": false, 
                    "pokemon": {"name": "charizard-gmax", "url": "https://pokeapi.co/api/v2/pokemon/10196/"}
                }
            ],
        }
        ```

- [Evolution Chains](https://pokeapi.co/docs/v2#evolution-chains) : informations concernant les chaînes d'évolution des différentes espèces
    - `https://pokeapi.co/api/v2/evolution-chain/{id}/`
    - Représente un arbre d'espèces. Chaque nœud a un attribut `species` qui représente une espèce et un attribut `evolves_to` qui contient une liste de nœuds correspondant aux évolutions possibles de l'espèce (la liste est vide si l'espèce n'a pas d'évolution possible).
    - Exemple de réponse :
        ```json
        {
            "id": 2,
            "chain": {
                "species": {
                    "name": "charmander", 
                    "url": "https://pokeapi.co/api/v2/pokemon-species/4/",
                },
                "evolves_to": [
                    {
                        "species": {
                            "name": "charmeleon",
                            "url": "https://pokeapi.co/api/v2/pokemon-species/5/",
                        },
                        "evolves_to": [
                            {
                                "species": {
                                    "name": "charizard",
                                    "url": "https://pokeapi.co/api/v2/pokemon-species/6/",
                                },
                                "evolves_to": [],
                            }
                        ],
                    },
                ],
            },
        }
        ```

Dans l'exemple vu en cours (et les fichiers fournis dans ce TD), on a implémenté un bouton qui envoie une requête à l'API pour chercher un *pokémon* et affiche une carte avec les informations basique du *pokémon* (nom, sprite et types). Cette tâche est assez simple car il suffit d'une seule requête AJAX pour obtenir les informations nécessaires et afficher la carte.

Le but de ce TD est d'implémenter une fonctionnalité plus complexe qui, lorsque l'utilisateur cherche un *pokémon* (par nom ou id) et appuie sur le bouton "Ajouter évolutions", affiche tous les *pokémon* de la chaîne d'évolution du *pokémon* choisi. Par exemple si l'utilisateur entre le nom "charmeleon", puis clique sur le bouton, la page doit ajouter les cartes de *charmander*, *charmeleon* et *charizard*.

**Remarque :** [Pour simplifier](https://xkcd.com/2587/), on n'affichera que le *pokémon* "par défaut" (attribut `is_default` vrai) de chaque espèce. Par contre on affichera toutes les espèces de la chaîne (cf. par exemple la chaîne d'évolution de *eevee* ou [les autres *pokémon* ayant plusieurs branches d'évolution](https://bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_with_branched_evolutions)).


Étant donné un nom de *pokémon* (ou un *id*), il faut donc :
- **faire une requête** sur le *pokémon* demandé
- obtenir l'espèce du *pokémon* et **faire une requête** sur son espèce (on peut utiliser l'attribut `species.url` des données du *pokémon*)
- **faire une requête** sur la chaîne d'évolution de l'espèce (on peut utiliser l'attribut `evolution_chain.url` des données de l'espèce)
- parcourir toutes les espèces dans la chaîne d'évolution, et pour chaque espèce :
    - **faire une requête** pour obtenir les données de l'espèce
    - trouver le *pokémon* par défaut en parcourant les éléments dans l'attribut `varieties` pour trouver celui qui a un attribut `is_default` vrai (vous pouvez aussi probablement prendre le premier élément dans `varieties`, même s'il n'est pas explicitement dit que c'est toujours celui par défaut)
    - **faire une requête** pour obtenir les données de ce *pokémon*
    - appeler la fonction `addPokemonCard()` définie dans le script `script-base.js` pour afficher la carte correspondante

**Remarque :** Pour énumérer toutes les espèces d'une chaîne d'évolution, vous pouvez utiliser la fonction récursive `getSpeciesUrl()` du fichier `script-base.js` (il faut lui donner le premier nœud de la chaîne, c'est-à-dire l'attribut `chain` de l'objet renvoyé par la requête).


## XMLHttpRequest

Dans un premier temps, nous allons écrire la fonction `addEvolutionChain(nameOrIndex)` en utilisant directement la classe `XMLHttpRequest`.

1. Dans le fichier `script-xhr.js`, en vous inspirant de la fonction `addPokemon(nameOrIndex)`, écrivez la fonction `addEvolutionChain(nameOrIndex)` qui affiche les cartes de toutes les espèces de la chaîne d'évolution du *pokémon* passé en argument.

    **Indication :** Il y a 5 requêtes différentes à écrire (dont deux qui sont dans une boucle qui seront donc exécutées plusieurs fois). Toutes les actions à exécuter après avoir reçu les données de la requête doivent être dans le corps de la fonction *callback* passée à l'*event listener*.
    
    Cela signifie que la création et l'appel de la seconde requête se trouvent dans le *callback* de la première requête, que la création et l'appel de la troisième requête se trouvent dans le *callback* de la seconde (qui est lui-même dans le *callback* de la première) et ainsi de suite :

    ```js
    function addEvolutionChain(nameOrIndex) {
        const xhr1 = new XMLHttpRequest();  // création de la première requête
        xhr1.open('GET', `${ROOT_URL}/pokemon/${nameOrIndex}/`, true);
        xhr1.onload = function () {     // callback de la première requête
            if (xhr1.status === 200) {
                const data = JSON.parse(xhr1.responseText);
                const xhr2 = new XMLHttpRequest();  // création de la 2e requête
                xhr2.open("GET", data.species.url, true);
                xhr2.onload = function () {     // callback de la 2e requête
                    if (xhr2.status === 200) {
                        const data = JSON.parse(xhr2.responseText);
                        const xhr3 = new XMLHttpRequest();  // création de la 3e requête
                        xhr3.open("GET", data.evolution_chain.url, true);
                        xhr3.onload = function () {     // callback de la troisième requête
                        
                        ...

                        } 
                    } else {
                        console.log(Error(xhr2.statusText));
                    }
                }
                xhr2.send();
            } else {
                console.log(Error(xhr1.statusText));
            }
        }
        xhr1.send();
    }
    ```

# Promesses

Bien que la classe `XMLHttpRequest` (introduite en 2000) soit très pratique pour faire des requêtes asynchrones sans avoir à recharger intégralement la page, l'exemple de l'exercice précédent montre assez clairement qu'il y a un problème.

Comme il faut mettre tout le code à exécuter après une requête dans le bloc du *callback*, si on veut utiliser des fonction anonymes, on finit avec un niveau de profondeur proportionnel au nombre de requêtes à exécuter successivement (cf. *callback hell* ou *pyramid of doom*)

Pour corriger ce problème, le standard *ECMAScript 2015* a introduit la notion de *promesse*, implémentée par la classe `Promise`.

Informellement, une promesse est une valeur qui n'existe pas encore. Au bout d'un certain temps, la promesse est soit *accomplie* (et elle contient alors la valeur attendue, qui peut être récupérée), soit *échouée* (une erreur s'est produite).

Pour définir une promesse, on crée un objet de type *Promise* en lui passant en argument une fonction qui prend deux arguments `resolve` et `reject`. Cette fonction représente les actions exécutées par la promesse pour obtenir la valeur attendue. Lorsque la valeur est obtenue, la fonction de la promesse doit appeler `resolve(valeur)` pour rendre la valeur disponible. Si une erreur se produit, la fonction doit appeler `reject(erreur)` pour qu'une erreur soit transmise.

Par exemple :

```js
const p = new Promise((resolve, reject) => {
    const x = uneFonctionAsynchroneQuiPrendDuTemps();
    if (x != undefined) {
        resolve(x);     // la valeur est disponible
    } else {
        reject(Error("Pas de valeur !"));   // erreur lors de l'exécution
    }
});
```

Lorsque l'on a une promesse, on peut appeler sa méthode `then` en lui passant en argument une fonction à un paramètre qui décrit ce qu'il faut faire avec la valeur de la promesse lorsqu'elle sera disponible :

```js
p.then(value => {
    console.log(`La valeur calculée est ${value}`;
});
```

La fonction passée à `then` ne sera appelée que lorsque le code de la promesse aura obtenu la valeur (l'instruction `resolve(valeur)` dans le corps de la promesse).

Ce qui est particulièrement intéressant, c'est que le résultat de la méthode `then` est renvoyé sous la forme d'une promesse, c'est-à-dire que l'on peut à nouveau appeler `then` sur ce résultat :

```js
p.then(value => {
    console.log(`valeur reçue : ${value}`);
    return value + 1;
}).then(value => {
    console.log(`valeur incrémentée de 1: ${value}`);
    return value * 2;
}).then(value => {
    console.log(`valeur précédente doublée: ${value}`);
})
```

On peut également appeler la méthode `catch` d'une promesse qui prend en argument une fonction qui décrit les actions à exécuter si la promesse a échoué (si elle a appelé `reject(erreur)`.


2. Ouvrez le fichier `script-promise.js` et étudiez la fonction `getData(url)`.
    
    **Indication :** Cette fonction renvoie une promesse qui crée un `XMLHttpRequest` pour faire une requête sur l'URL passé en argument. Lorsque la réponse à la requête est obtenue, s'il n'y a pas eu d'erreur la promesse est résolue et la valeur de la promesse est l'objet représenté par la réponse à la requête. S'il y a eu une erreur, la promesse échoue en transmettant le message d'erreur de la requête.

3. En vous inspirant de la fonction `addPokemon(nameOrIndex)` (du fichier `script-promise.js`), écrivez la fonction `addEvolutionChain(nameOrIndex)` en utilisant des promesses.
    
    **Indication :** Les étapes sont exactement les mêmes que pour la version avec des `XMLHttpRequest` mais le code devrait être bien plus clair et concis car vous pouvez enchaîner les différentes étapes à l'aide de la méthode `then` :

    ```js
    function addEvolutionChain(nameOrIndex) {
    getData(`${ROOT_URL}/pokemon/${nameOrIndex}/`)
        .then(data => getData(data.species.url))
        .then(data => getData(data.evolution_chain.url))
        .then(data => {
            ...
        });
    ```

# Fetch

Les promesses allègent énormément le code des programmes qui exécutent de nombreuses actions asynchrones successivement. Toutefois, la plupart du temps il n'est même pas nécessaire d'écrire directement des objets de type `Promise`.

En effet, beaucoup de tâches asynchrones peuvent être réalisées en appelant des fonctions disponibles qui vont renvoyer des promesses (la promesse est automatiquement créée par la fonction, puis renvoyée).

En particulier, pour faire des requêtes `GET` ou `POST` asynchrones, il existe une fonction `fetch(url)` qui exécute la requête et renvoie une promesse. Un léger inconvénient est que la valeur renvoyée par la promesse n'est pas directement un objet *Javascript* obtenu en interprétant du *JSON* mais un tableau d'octets. Pour interpréter le résultat de la requête comme du *JSON* et en faire un objet *Javascript* on peut utiliser la méthode `json()` sur le résultat de `fetch()`, qui renvoie à son tour une promesse :

```js
fetch("http:// ... /")
    .then(data => data.json())
    .then(data => {
        console.log(`données reçues: ${data}`);
    });
```

4. Dans le fichier `script-fetch.js`, en vous inspirant de la fonction `addPokemon(nameOrIndex)`, écrivez la fonction `addEvolutionChain(nameOrIndex)` en utilisant la fonction `fetch` (et la méthode `.json()` pour décoder les réponses aux requêtes).

