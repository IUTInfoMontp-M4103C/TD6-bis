const ROOT_URL = 'https://pokeapi.co/api/v2';


function add(data) {
    // div principal
    const pokemon = document.createElement('div');
    pokemon.classList.add('pokemon');
    pokemon.addEventListener('click', function () {
        pokemon.parentElement.removeChild(pokemon);
    });
    document.getElementById('pokemon-list').appendChild(pokemon);

    // nom
    const name = document.createElement('div');
    name.innerHTML = `${data.name}`;
    name.classList.add('name');
    pokemon.appendChild(name);

    // types
    const type = document.createElement('p');
    type.innerHTML = `Type: ${data.types.map(type => type.type.name).join(', ')}`;
    pokemon.appendChild(type);
    
    // sprite
    const sprite = document.createElement('img');
    sprite.src = data.sprites.front_default;
    pokemon.appendChild(sprite);
}


function getSearchInput() {
        let searchInput = document.getElementById('search-input').value;
        if (searchInput === '') {
            searchInput = ~~(Math.random() * 898) + 1;
        }
        return searchInput;
}


window.addEventListener('load', () => {
    document.getElementById('button1').addEventListener('click', () => addPokemon(getSearchInput()));
    document.getElementById('button2').addEventListener('click', () => addEvolutionChain(getSearchInput()));
    addPokemon(25);
});


async function get(url) {
    return await(await fetch(url)).json();
}
