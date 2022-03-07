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

**Indication :** Pour énumérer toutes les espèces d'une chaîne d'évolution, vous pouvez utiliser la fonction récursive `getSpeciesUrl()` du fichier `script-base.js` (il faut lui donner le premier nœud de la chaîne, c'est-à-dire l'attribut `chain` de l'objet renvoyé par la requête).

**Remarque :** Dans toute la suite, nous allons lancer en parallèle les requêtes pour obtenir les données correspondant aux espèces de la chaîne d'évolution. Cela signifie que les réponses ne vont pas nécessairement arriver dans l'ordre, ce qui fait que l'affichage sur la page ne correspondra pas toujours à l'ordre réel de la chaîne d'évolution. Étant donné que le but est ici de voir comment utiliser des séries d'appels asynchrones, dans un premier temps nous allons ignorer ce problème et considérer qu'on veut simplement afficher toutes les espèces de la chaîne indépendamment de leur ordre.


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

## Promesses

Bien que la classe `XMLHttpRequest` soit très pratique pour faire des requêtes asynchrones sans avoir à recharger intégralement la page, l'exemple de l'exercice précédent montre assez clairement qu'il y a un problème.

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

## Fetch

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


## Async / Await

La dernière nouveauté de *Javascript* en termes de tâches asynchrones est l'introduction des deux mots-clés `async` et `await`.

Le premier, `async`, est un modifieur qui sert à déclarer des fonctions comme étant *asynchrones*. Il se place avant la définition de la fonction :

```js
async function maFonctionAsynchrone(x, y) {
    ...
}
```

Une fonction asynchrone renvoie toujours une promesse. Au moment où la fonction est appelée, elle renvoie immédiatement une promesse, et poursuit son exécution. Lorsque l'exécution de la fonction termine, la promesse est résolue et la valeur de la promesse est la valeur effectivement renvoyée par la fonction (à l'aide d'un `return`).

L'intérêt des fonctions asynchrones est qu'elles peuvent utiliser le mot clé `await` pour "attendre" la résolution d'une promesse et obtenir directement le résultat. En effet, lorsque l'on utilise `await` (qui n'est valide que s'il est utilisé dans le corps d'une fonction `async`) l'exécution de la fonction est suspendue jusqu'à ce que l'expression qui suit `await` soit résolue.

Par exemple

```js
async function get(url) {
    // appelle fetch, attend que la réponse soit obtenue et place la réponse dans la variable response
    const response = await fetch(url);
    // appelle la méthode .json() sur la réponse, attend que le résultat soit disponible et le renvoie
    return await response.json();
}

const p = get("http:// ... /");     // le résultat de get() est une promesse
p.then(data => console.log());      // on peut attendre la résolution de la promesse avec then
```

Il est également possible de rattraper les erreurs levées par une promesse qui a été rejetée avec un bloc `try ... catch` :

```js
async function get(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        // si une promesse est rejetée pendant un await, une exception est levée contenant l'erreur de la promesse
        console.log("Erreur :" + error);
    }
}
```

5. Dans le fichier `script-await.js`, en vous inspirant de la fonction `addPokemon(nameOrIndex)`, écrivez la fonction asynchrone `addEvolutionChain(nameOrIndex)` en utilisant `await`.
   
   **Indication :** Vous pouvez utiliser `fetch()` et `.json()` comme si c'étaient des fonctions séquentielles en utilisant le mot clé `await` (le code de la fonction attend que le résultat soit disponible avant de continuer, mais la fonction ne bloque pas l'exécution d'autres parties du code qui pourraient s'exécuter en parallèle (par exemple la gestion d'événements, ou d'autres fonction asynchrones)

## Bonus (d'un sujet qui est déjà entièrement en bonus)

Comme indiqué dans une remarque en début de sujet, lorsqu'on lance toutes les requêtes correspondant aux différentes espèces d'une chaîne d'évolution en parallèle, il est possible que les réponses n'arrivent pas dans l'ordre des requêtes, et comme l'affichage sur la page se fait au moment où les réponses sont obtenues, il est possible que les *pokémon* ne soient pas affichés dans l'ordre de leur évolution.

Une première solution est d'exécuter séquentiellement le traîtement des différentes espèces de la chaîne d'évolution (les URL renvoyées par `getSpeciesUrl()`). On peut en effet faire une boucle qui pour chaque URL, lance la requête et attend que les données aient été intégralement traîtées et la carte correspondante affichée avant de passer à l'URL suivant.

6. Modifiez une des versions de la fonction `addEvolutionChain(nameOrIndex)` pour qu'elle traîte séquentiellement les différentes espèces qui apparaissent dans la chaîne d'évolution.
   
   **Indication :** A priori, c'est la version avec `async`/`await` qui est la plus simple à modifier ainsi (d'ailleurs la version que vous avez écrite vérifie peut-être déjà cette propriété).

L'inconvénient de la solution séquentielle est qu'elle ne profite pas du fait qu'on peut envoyer toutes les requêtes en parallèle. En effet, toutes les requêtes au réseau sont envoyées l'une après l'autre (la durée totale est donc la somme des durées de chaque requête) alors qu'on pourrait les envoyer toute en même temps (la durée total serait alors la durée de la plus longue requête), et traîter les réponses obtenues séquentiellement.

Dans ce scénario, au moment où l'on obtient la liste des URL correspondant aux espèces de la chaîne, il lancer en parallèle les tâches qui consistent à obtenir les données à afficher (pour chaque espèce, la requêtes à l'espèce, puis la recherche du *pokémon* par défaut et la requête au *pokémon* par défaut). Les résultats sont stockés dans un tableau, et ce n'est que quand toutes les données ont été obtenues qu'on exécute l'affichage sur la page.

7. Modifiez encore la fonction `addEvolutionChain(nameOrIndex)` pour qu'elle lance toutes les requêtes en parallèle, mais qu'elle affiche les cartes correspondant aux différents *pokémon* de la chaîne dans le bon ordre.

    **Indication :** Le plus simple ici est d'utiliser une version hybride qui utilise à la fois `async`/`await` pour le début, puis lance la séquence de requêtes pour chaque espèce sous forme d'un tableau de promesses, et utilise `await` pour attendre que toutes les promesses soient résolues avant d'afficher les cartes avec une boucle.

    Vous pouvez en particulier chercher comment utiliser `Promise.all()` pour attendre qu'une liste de promesses soient résolues et obtenir toutes leurs valeurs.