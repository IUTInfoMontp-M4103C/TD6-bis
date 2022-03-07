# ![](ressources/logo.jpg) Prog web client riche - JavaScript

### IUT Montpellier-Sète – Département Informatique

## TD6 Bis

#### _Thème : AJAX, promesses et async/await_

Cliquez sur le lien ci-dessous pour faire votre fork privé du TD6 Bis (**attention, pas de fork à la main !**):

**TODO:** lien classroom

## Introduction

Nous allons voir ici les différentes techniques et syntaxes qui ont été ajoutées au langage pour faciliter l'utilisation de requêtes AJAX.

Nous utiliserons [l'API Pokémon](https://pokeapi.co) qui permet d'obtenir des informations (très) détaillées sur les différents *pokémon* et autres éléments des jeux videos. On peut faire plusieurs types de requêtes à l'API. Nous utiliserons en particulier (les liens renvoient vers la documentation de l'API) :

- [Pokemon](https://pokeapi.co/docs/v2#pokemon) : informations correspondant à un *pokémon* particulier (par nom ou numéro)
    - `https://pokeapi.co/api/v2/pokemon/{id or name}/`
    ```
    {
        id: 6,
        is_default: true,
        name: "charizard",
        species: {name: "charizard", url: "https://pokeapi.co/api/v2/pokemon-species/6/"},
        sprites: {
            front_default: "https:// ... /pokemon/6.png",
            ...
        },
        types: [
            {
                slot: 1, 
                type: {name: "fire", url: "https://pokeapi.co/api/v2/type/10/"}
            },
            {
                slot: 2, 
                type: {name: "flying", url: "https://pokeapi.co/api/v2/type/3/"}
            },
        ],
        ...
    }
    ```

- [Pokemon Species](https://pokeapi.co/docs/v2#pokemon-species) : informations concernant une *espèce* de *pokémon*
    - `https://pokeapi.co/api/v2/pokemon-species/{id or name}/`
    - Il peut y avoir plusieurs *pokémon* de la même *espèce*. Par exemple l'espèce *charizard* correspond aux *pokémon* *charizard*, *charizard-mega-x*, *charizard-mega-y* et *charizard-gmax*
    ```
    {
        evolution_chain: {url: "https://pokeapi.co/api/v2/evolution-chain/2/"},
        evolves_from_species: {url: "https://pokeapi.co/api/v2/evolution-chain/2/"},
        name: "charizard",
        varieties: [
            {
                is_default: true,
                pokemon: {name: "charizard", url: "https://pokeapi.co/api/v2/pokemon/6/"}
            },
            {
                is_default: false,
                pokemon: {name: "charizard-mega-x", url: "https://pokeapi.co/api/v2/pokemon/10034/"}
            },
            ...
        ],
        ...
    }
    ```

- [Evolution Chains](https://pokeapi.co/docs/v2#evolution-chains) : informations concernant les arbres d'évolution des différentes espèces
    - `https://pokeapi.co/api/v2/evolution-chain/{id}/`
    - Représente un arbre d'espèces. Chaque nœud a un attribut `species` qui représente une espèce et un attribute `evolves_to` qui contient une liste des nœuds correspondant aux évolutions possibles de l'espèce (la liste est vide si l'espèce n'a pas d'évolution possible).
    ```
    {
        id: 2,
        chain: {
            species: {
                name: "charmander", 
                url: "https://pokeapi.co/api/v2/pokemon-species/4/",
            },
            evolves_to: [
                {
                    species: {
                        name: "charmeleon",
                        url: "https://pokeapi.co/api/v2/pokemon-species/5/",
                    },
                    evolves_to: [
                        species: {
                            name: "charizard",
                            url: "https://pokeapi.co/api/v2/pokemon-species/6/",
                        }
                        evolves_to: [],
                    ],
                },
            ],
        },
    }

Dans l'exemple vu en cours (et les fichiers fournis dans ce TD), on a implémenté un bouton qui envoie une requête à l'API pour chercher un *pokémon* et affiche une carte avec les informations basique du *pokémon* (nom, sprite et types). Cette tâche est assez simple car il suffit d'une seule requête AJAX pour obtenir les informations nécessaires et afficher la carte.

Le but de ce TD est d'implémenter une fonctionnalité plus complexe qui, lorsque l'utilisateur cherche un *pokémon* (par nom ou id) et appuie sur le bouton "Ajouter évolutions", affiche tous les *pokémon* de la chaîne d'évolution du *pokémon* choisi. Par exemple si l'utilisateur entre le nom "charmeleon", puis clique sur le bouton, la page doit ajouter les cartes de *charmander*, *charmeleon* et *charizard*.

**Remarque :** [Pour simplifier](https://xkcd.com/2587/), on n'affichera que le *pokémon* "par défaut" (attribut `is_default` vrai) de chaque espèce. Par contre on affichera toutes les espèces de l'arbre (cf. par exemple l'arbre d'évolutions de *eevee* et [les autres exemples ayant plusieurs branches d'évolution](https://bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_with_branched_evolutions)).




## XMLHttpRequest

Dans un premier temps, nous allons écrire 
