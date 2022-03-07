// Version plus simple avec .onload (uniquement lorsque readyState = 4)
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

function addEvolutionChain(nameOrIndex) {
    const xhr1 = new XMLHttpRequest();
    xhr1.open('GET', `${ROOT_URL}/pokemon/${nameOrIndex}/`, true);
    xhr1.onload = function () {     // callback de xhr1
        if (xhr1.status === 200) {
            const data = JSON.parse(xhr1.responseText);
            const xhr2 = new XMLHttpRequest();
            xhr2.open("GET", data.species.url, true);
            xhr2.onload = function () {     // callback de xhr2
                if (xhr2.status === 200) {
                    const data = JSON.parse(xhr2.responseText);
                    const xhr3 = new XMLHttpRequest();
                    xhr3.open("GET", data.evolution_chain.url, true);
                    xhr3.onload = function () {     // callback de xhr3
                        if (xhr3.status === 200) {
                            const data = JSON.parse(xhr3.responseText);
                            for (const speciesUrl of getSpeciesUrls(data.chain)) {
                                const xhr4 = new XMLHttpRequest();
                                xhr4.open("GET", speciesUrl, true);
                                xhr4.onload = function () {     // callback de xhr4
                                    if (xhr4.status === 200) {
                                        const data = JSON.parse(xhr4.responseText);
                                        for (const variety of data.varieties) {
                                            if (variety.is_default) {
                                                const xhr5 = new XMLHttpRequest();
                                                xhr5.open("GET", variety.pokemon.url, true);
                                                xhr5.onload = function () {     // callback de xhr5
                                                    if (xhr5.status === 200) {
                                                        const data = JSON.parse(xhr5.responseText);
                                                        addPokemonCard(data);
                                                    } else {
                                                        console.log(Error(xhr5.statusText));
                                                    }
                                                }
                                                xhr5.send();
                                                break;
                                            }
                                        }
                                    } else {
                                        console.log(Error(xhr4.statusText));
                                    }
                                }
                                xhr4.send();
                            }
                        } else {
                            console.log(Error(xhr3.statusText));
                        }
                    }
                    xhr3.send();
                } else {
                    console.log(Error(xhr2.statusText));
                }
            }
            xhr2.send();
        } else {
            console.log(Error(xhr1.statusText));
        }
    }
    xhr1.send();
}
