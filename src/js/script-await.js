async function addEvolutionChain(name) {
    try {
        let req = await fetch(`${ROOT_URL}/pokemon/${name}/`);
        let data = await req.json();
        req = await fetch(data.species.url);
        data = await req.json();
        req = await fetch(data.evolution_chain.url);
        data = await req.json();
        addChain(data.chain);
    } catch (error) {
        console.log(error);
    }
}

async function addChain(chain) {
    try {
        let req = await fetch(chain.species.url);
        let data = await req.json();
        for (variety of data.varieties) {
            if (variety.is_default) {
                req = await fetch(variety.pokemon.url);
                data = await req.json();
                break;
            }
        }
        add(data);
        for (const evolution of chain.evolves_to) {
            addChain(evolution);
        }
    } catch (error) {
        console.log(error);
    }
}

async function addPokemon(name) {
    try {
        let req = await fetch(`${ROOT_URL}/pokemon/${name}/`);
        let data = await req.json();
        add(data);
    } catch (error) {
        console.log(error);
    }
}