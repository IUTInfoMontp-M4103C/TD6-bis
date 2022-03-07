// // Version intiale avec .onreadystatechange
// function addPokemon(index) {
//     const xhr = new XMLHttpRequest();
//     xhr.open('GET', `${ROOT_URL}/pokemon/${index}`, true);
//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 const data = JSON.parse(xhr.responseText);
//                 add(data);
//             } else {
//                 console.log(`${xhr.status}: ${xhr.responseText}`);
//             }
//         }
//     }
//     xhr.send();
// }


// Version plus simple avec .onload (uniquement lorsque readyState = 4)
function addPokemon(index) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${ROOT_URL}/pokemon/${index}`, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log(data);
            add(data);
        } else {
            console.log(Error(xhr.statusText));
        }
    }
    xhr.send();
}

function addEvolutionChain(name) {
    const xhr1 = new XMLHttpRequest();
    xhr1.open('GET', `${ROOT_URL}/pokemon/${name}/`, true);
    xhr1.onload = function () {
        if (xhr1.status === 200) {
            const data = JSON.parse(xhr1.responseText);
            console.log(data);
            const xhr2 = new XMLHttpRequest();
            xhr2.open("GET", data.species.url, true);
            xhr2.onload = function () {
                if (xhr2.status === 200) {
                    const data = JSON.parse(xhr2.responseText);
                    console.log(data);
                    const xhr3 = new XMLHttpRequest();
                    xhr3.open("GET", data.evolution_chain.url, true);
                    xhr3.onload = function () {
                        if (xhr3.status === 200) {
                            const data = JSON.parse(xhr3.responseText);
                            console.log(data);
                            addChain(data.chain);
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

function addChain(chain) {
    const xhr1 = new XMLHttpRequest();
    xhr1.open("GET", chain.species.url, true);
    xhr1.onload = function () {
        if (xhr1.status === 200) {
            const data = JSON.parse(xhr1.responseText);
            console.log(data);
            for (const variety of data.varieties) {
                if (variety.is_default) {
                    const xhr2 = new XMLHttpRequest();
                    xhr2.open("GET", variety.pokemon.url, true);
                    xhr2.onload = function () {
                        if (xhr2.status === 200) {
                            const data = JSON.parse(xhr2.responseText);
                            console.log(data);
                            add(data);
                            for (const evolution of chain.evolves_to) {
                                addChain(evolution);
                            }
                        } else {
                            console.log(Error(xhr.statusText));
                        }
                    }
                    xhr2.send();
                    break;
                }
            }
        } else {
            console.log(Error(xhr.statusText));
        }
    }
    xhr1.send();
}