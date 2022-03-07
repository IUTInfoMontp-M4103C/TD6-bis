// Version moderne avec fetch (qui renvoie une promesse)
function addPokemon(index) {
    fetch(`${ROOT_URL}/pokemon/${index}`) // -> renvoie une promesse
        .then(response => response.json())      // -> renvoie une promesse
        .then(data => add(data))
        .catch(error => console.log(error));
}

function addEvolutionChain(name) {
    fetch(`${ROOT_URL}/pokemon/${name}/`)
        .then(response => response.json())
        .then(data => fetch(data.species.url))
        .then(response => response.json())
        .then(data => addChain(data.chain))
        .catch(error => console.log(error));
}

function addChain(chain) {
    fetch(chain.species.url)
        .then(response => response.json())
        .then(data => {
            for (const variety of data.varieties) {
                if (variety.is_default) {
                    return fetch(variety.pokemon.url);
                }
            }
        })
        .then(response => response.json())
        .then(data => {
            add(data);
            for (const evolution of chain.evolves_to) {
                addChain(evolution);
            }
        })
        .catch(error => console.log(error));
}
