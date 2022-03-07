function addPokemon(nameOrIndex) {
    fetch(`${ROOT_URL}/pokemon/${nameOrIndex}`)
        .then(response => response.json())
        .then(data => addPokemonCard(data))
        .catch(error => console.log(error));
}


function addEvolutionChain(nameOrIndex) {
    fetch(`${ROOT_URL}/pokemon/${nameOrIndex}/`)
        .then(response => response.json())
        .then(data => fetch(data.species.url))
        .then(response => response.json())
        .then(data => fetch(data.evolution_chain.url))
        .then(response => response.json())
        .then(data => {
            for (const url of getSpeciesUrls(data.chain)) {
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        for (const variety of data.varieties) {
                            if (variety.is_default) {
                                return fetch(variety.pokemon.url);
                            }
                        }
                    })
                    .then(response => response.json())
                    .then(data => addPokemonCard(data));
            }
        })
        .catch(error => console.log(error));
}
