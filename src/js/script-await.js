async function addPokemon(nameOrIndex) {
    try {
        let req = await fetch(`${ROOT_URL}/pokemon/${nameOrIndex}/`);
        let data = await req.json();
        addPokemonCard(data);
    } catch (error) {
        console.log(error);
    }
}


// cette version est séquentielle (cf. question 6)
// l'ordre d'affichage est toujours celui de la chaîne d'évolution mais les requêtes correspondant aux différentes espèce ne sont pas faites en parallèle
async function addEvolutionChain(nameOrIndex) {
    try {
        let req = await fetch(`${ROOT_URL}/pokemon/${nameOrIndex}/`);
        let data = await req.json();
        req = await fetch(data.species.url);
        data = await req.json();
        req = await fetch(data.evolution_chain.url);
        data = await req.json();
        for (const url of getSpeciesUrls(data.chain)) {
            req = await fetch(url);
            data = await req.json();
            for (const variety of data.varieties) {
                if (variety.is_default) {
                    req = await fetch(variety.pokemon.url);
                    data = await req.json();
                    addPokemonCard(data);
                    break;
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}


// version parallèle, mais en conservant l'ordre d'affichage des espèces
async function addEvolutionChain(nameOrIndex) {
    try {
        let req = await fetch(`${ROOT_URL}/pokemon/${nameOrIndex}/`);
        let data = await req.json();
        req = await fetch(data.species.url);
        data = await req.json();
        req = await fetch(data.evolution_chain.url);
        data = await req.json();
        // on crée un tableau contenant une promesse pour chaque espèce de la liste
        // (les promesses sont exécutées en parallèle)
        const promises = getSpeciesUrls(data.chain).map(url => {
            return fetch(url)
                .then(response => response.json())
                .then(data => {
                    for (const variety of data.varieties) {
                        if (variety.is_default) {
                            return fetch(variety.pokemon.url);
                        }
                    }
                })
                .then(response => response.json());
        });
        // on attend la résolution de toutes les promesses, et on affiche séquentiellement les résultats
        for (const data of await Promise.all(promises)) {
            addPokemonCard(data);
        }
    } catch (error) {
        console.log(error);
    }
}