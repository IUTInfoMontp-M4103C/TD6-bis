async function addPokemon(nameOrIndex) {
    try {
        let req = await fetch(`${ROOT_URL}/pokemon/${nameOrIndex}/`);
        let data = await req.json();
        addPokemonCard(data);
    } catch (error) {
        console.log(error);
    }
}
