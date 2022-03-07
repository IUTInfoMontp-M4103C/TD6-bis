function getData(url) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
            } else {
                reject(`${xhr.status}: ${xhr.responseText}`);
            }
        }
        xhr.send();
    });
}


function addEvolutionChain(name) {
    getData(`${ROOT_URL}/pokemon/${name}/`)
        .then(data => getData(data.species.url))
        .then(data => getData(data.evolution_chain.url))
        .then(data => addChain(data.chain))
        .catch(error => console.log(error));
}

function addChain(chain) {
    getData(chain.species.url)
        .then(data => {
            for (const variety of data.varieties) {
                if (variety.is_default) {
                    return getData(variety.pokemon.url);
                }
            }
        })
        .then(data => {
            add(data);
            for (const evolution of chain.evolves_to) {
                addChain(evolution);
            }
        })
        .catch(error => console.log(error));
}

function addPokemon(name) {
    getData(`${ROOT_URL}/pokemon/${name}/`)
        .then(data => add(data))
        .catch(error => console.log(error));
}