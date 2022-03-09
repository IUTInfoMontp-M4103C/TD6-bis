function addPokemon(nameOrIndex) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${ROOT_URL}/pokemon/${nameOrIndex}`, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            addPokemonCard(data);
        } else {
            console.log(Error(xhr.statusText));
        }
    }
    xhr.send();
}
