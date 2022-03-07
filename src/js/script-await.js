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


async function addPokemon(nameOrIndex) {
    try {
        let req = await fetch(`${ROOT_URL}/pokemon/${nameOrIndex}/`);
        let data = await req.json();
        addPokemonCard(data);
    } catch (error) {
        console.log(error);
    }
}