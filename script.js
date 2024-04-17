const $button = document.getElementById('load-more')
const $container = document.getElementById('pokemon-gallery');
// const $pokemonCard = document.querySelectorAll('.pokemon-card')
const $modalSec = document.getElementById('pokemon_modal')
const $closeButton = document.querySelector('.close');
let offset = 0;
const limit = 20;
const apiBase = "https://pokeapi.co/api/v2/pokemon";
const smallImgBase = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const largeImgBase = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png"

function parseUrl(url) {
    return url.substring(url.substring(0, url.length - 2).lastIndexOf('/') + 1, url.length - 1)
}

function displayPokemon(pokemonList) {
    pokemonList.forEach((pokemon) => {
        const pokemonCard = document.createElement("div");
        pokemonCard.classList.add("pokemon-card");
        pokemonCard.dataset.name = pokemon.name;
        pokemonCard.innerHTML = `
              <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${parseUrl(
            pokemon.url
        )}.png" alt="${pokemon.name}">
              <p>${pokemon.name}</p>
              
          `;
        $container.append(pokemonCard)
    })
}

async function fetchPokemon() {
    try {
        const response = await fetch(`${apiBase}?offset=${offset}&limit=${limit}`);
        const data = await response.json();
        displayPokemon(data.results);
    } catch (error) {
        console.error("Error fetching Pokemon:", error);
    }
}


$container.addEventListener("click", (e) => {
    e.preventDefault();
    const pokemonCard = e.target.closest(".pokemon-card");
    if (pokemonCard) {
        // 创建会话框元素
        const modalId = 'modal' + Date.now(); // 生成唯一的模态框标识
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.classList.add('modal');

        // 添加会话框内容
        modal.innerHTML = `
            <div class="modal-content">
                <p>pokedex</p>
                 <button class="close" onclick="document.getElementById('${modalId}').style.display = 'none'">close</button>
            </div>
        `;
        document.body.append(modal);
        modal.style.display = 'block';
    }
})

$button.addEventListener("click", async (e) => {
    e.preventDefault();
    offset += limit;
    await fetchPokemon();
});


fetchPokemon();


