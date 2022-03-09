function addPokemon(nameOrIndex) {
    fetch(`${ROOT_URL}/pokemon/${nameOrIndex}`)
        .then(response => response.json())
        .then(data => addPokemonCard(data))
        .catch(error => console.log(error));
}
