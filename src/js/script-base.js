/**
 * URL de l'API
 */
const ROOT_URL = 'https://pokeapi.co/api/v2';


/**
 * Ajoute sur la page une carte correspondant au pokémon décrit par les données passées en paramètre
 * 
 * @param data données du pokémon à afficher (résultat de la requête à l'API)
 */
function addPokemonCard(data) {
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


/**
 * Renvoie la liste des URL de requêtes des espèces qui apparaissent dans la chaîne d'évolution à partir du nœud passé en paramètre.
 * 
 * @param evolution_link nœud de la chaîne d'évolution (initialement, c'est `data.chain` où `data` est le résultat de la requête à l'API sur une chaîne d'évolution)
 * @returns un tableau contenant les URL de requêtes des espèces de la chaîne d'évolution
 */
function getSpeciesUrls(evolution_link) {
    const urls = [evolution_link.species.url];
    for (const link of evolution_link.evolves_to) {
        urls.push(...getSpeciesUrls(link));
    }
    return urls;
}


/**
 * @returns la valeur du champ d'input, ou un nombre aléatoire entre 1 et 898 si l'input est vide (index aléatoire d'un pokémon)
 */
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
