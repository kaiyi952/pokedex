const $button = document.getElementById('load-more')
const $container = document.getElementById('pokemon-gallery');
const $modalSec = document.getElementById('pokemon_modal')
const $closeButton = document.querySelector('.close');
let offset = 0;
const limit = 20;
const apiBase = "https://pokeapi.co/api/v2/pokemon";
const smallImgBase = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const largeImgBase = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";

// 函数：从URL中解析Pokemon的ID
function parseUrl(url) {
    return url.substring(url.substring(0, url.length - 2).lastIndexOf('/') + 1, url.length - 1)
}

// 函数：展示Pokemon列表
function displayPokemon(pokemonList) {
    pokemonList.forEach((pokemon) => {
        const pokemonCard = document.createElement("div");
        pokemonCard.classList.add("pokemon-card");
        pokemonCard.dataset.name = pokemon.name;
        pokemonCard.dataset.id = parseUrl(pokemon.url);
        pokemonCard.innerHTML = `
            <div class="caught-overlay">Caught</div> <!-- 遮罩元素 -->
            <img src="${smallImgBase}/${pokemonCard.dataset.id}.png" alt="${pokemon.name}">
            <p>${pokemon.name}</p>
        `;
        $container.append(pokemonCard)
    })
}


// 异步函数：获取Pokemon列表
async function fetchPokemon() {
    try {
        const response = await fetch(`${apiBase}?offset=${offset}&limit=${limit}`);
        const data = await response.json();
        displayPokemon(data.results);
    } catch (error) {
        console.error("Error fetching Pokemon:", error);
    }
}

// 异步函数：获取Pokemon的移动
async function fetchPokemonMove(pokemonName) {
    try {
        const response = await fetch(`${apiBase}/${pokemonName}`);
        const data = await response.json();
        const moves = data.moves[0].move.name;
        return moves;
    } catch (error) {
        console.error("Error fetching Pokemon moves:", error);
        return ""; // 返回一个空字符串或其他默认值
    }
}

// 异步函数：获取Pokemon的能力
async function fetchPokemonAbility(pokemonName) {
    try {
        const response = await fetch(`${apiBase}/${pokemonName}`);
        const data = await response.json();
        const abilities = data.abilities.map(obj => obj.ability.name).join(", ");
        return abilities;
    } catch (error) {
        console.error("Error fetching Pokemon abilities:", error);
        return ""; // 返回一个空字符串或其他默认值
    }
}

// 捕捉Pokemon函数
function catchPokemon(pokemonId) {
    // 将捕捉的Pokemon信息保存到本地存储中
    const caughtPokemon = JSON.parse(localStorage.getItem("caughtPokemon")) || {};
    caughtPokemon[pokemonId] = true;
    localStorage.setItem("caughtPokemon", JSON.stringify(caughtPokemon));

    const pokemonCard = document.querySelector(`.pokemon-card[data-id="${pokemonId}"]`);
    if (pokemonCard) {
        pokemonCard.classList.add("caught");
        // 显示遮罩
        const overlay = pokemonCard.querySelector(".caught-overlay");
        if (overlay) {
            overlay.style.opacity = "1";
        }
    }
}

// 释放Pokemon函数
function releasePokemon(pokemonId) {
    // 从本地存储中释放Pokemon信息
    const caughtPokemon = JSON.parse(localStorage.getItem("caughtPokemon")) || {};
    delete caughtPokemon[pokemonId];
    localStorage.setItem("caughtPokemon", JSON.stringify(caughtPokemon));

    const pokemonCard = document.querySelector(`.pokemon-card[data-id="${pokemonId}"]`);
    if (pokemonCard) {
        pokemonCard.classList.remove("caught");
        // 隐藏遮罩
        const overlay = pokemonCard.querySelector(".caught-overlay");
        if (overlay) {
            overlay.style.opacity = "0";
        }
    }
}

// 根据是否捕捉显示按钮
function toggleCatchReleaseButton(pokemonId) {
    const caughtPokemon = JSON.parse(localStorage.getItem("caughtPokemon")) || {};
    if (caughtPokemon[pokemonId]) {
        return `
            <button class="release" data-id="${pokemonId}">Release</button>
        `;
    } else {
        return `
            <button class="catch" data-id="${pokemonId}">Catch</button>
        `;
    }
}

// 点击捕捉或释放按钮的事件处理程序
$container.addEventListener("click", async (e) => {
    e.preventDefault();
    const pokemonCard = e.target.closest(".pokemon-card");
    if (pokemonCard) {
        const pokemonId = pokemonCard.dataset.id;
        const pokemonName = pokemonCard.dataset.name;
        const modalId = 'modal' + pokemonId;
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.classList.add('modal');
        const PokemonMoves = await fetchPokemonMove(pokemonName);
        const PokemonAbility = await fetchPokemonAbility(pokemonName);

        // 添加模态框内容
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class='modal-title'>${pokemonName}</div>
                    <button class="modal-close" onclick="document.getElementById('${modalId}').style.display = 'none'">close</button>
                </div>
                <div class="modal-main">
                    <div class="img-large"><img src="${largeImgBase}${pokemonId}.png" alt="${pokemonName}"></div>
                    <div class="details">
                        <h2>Moves</h2>
                        <p>${PokemonMoves}</p>
                        <h2>Abilities</h2>
                        <p>${PokemonAbility}</p>
                        ${toggleCatchReleaseButton(pokemonId)}
                    </div>
                </div>
            </div>
        `;

        document.body.append(modal);
        modal.style.display = 'block';
    }
});

// 点击“Load More”按钮加载更多Pokemon
$button.addEventListener("click", async (e) => {
    e.preventDefault();
    offset += limit;
    await fetchPokemon();
});

// 点击“Catch”或“Release”按钮的事件处理程序
document.body.addEventListener("click", async (e) => {
    const target = e.target;
    if (target.classList.contains("catch")) {
        const pokemonId = target.dataset.id;
        catchPokemon(pokemonId);
        target.textContent = "Caught";
        target.disabled = true;
        const modal = target.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    } else if (target.classList.contains("release")) {
        const pokemonId = target.dataset.id;
        releasePokemon(pokemonId);
        const modal = target.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
});

// 初始化页面时从本地存储中检查已捕捉的Pokemon，并更新按钮状态
function initCaughtPokemon() {
    const caughtPokemon = JSON.parse(localStorage.getItem("caughtPokemon")) || {};
    const pokemonCards = document.querySelectorAll(".pokemon-card");
    pokemonCards.forEach(card => {
        const pokemonId = card.dataset.id;
        if (caughtPokemon[pokemonId]) {
            card.classList.add("caught");
            const overlay = card.querySelector(".caught-overlay");
            if (overlay) {
                overlay.style.opacity = "1";
            }
        }
    });
}

// 页面加载时初始化
document.addEventListener("DOMContentLoaded", async () => {
    await fetchPokemon();
    initCaughtPokemon();
});

