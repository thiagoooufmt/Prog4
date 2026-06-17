const typeTranslations = {
  grass: 'Grama',
  fire: 'Fogo',
  water: 'Água',
  bug: 'Inseto',
  normal: 'Normal',
  poison: 'Veneno',
  electric: 'Elétrico',
  ground: 'Terra',
  fairy: 'Fada',
  fighting: 'Lutador',
  psychic: 'Psíquico',
  rock: 'Pedra',
  ghost: 'Fantasma',
  ice: 'Gelo',
  dragon: 'Dragão',
  steel: 'Aço',
  flying: 'Voador',
  dark: 'Sombrio'
};

const state = {
  pokemonList: [],
  currentList: [],
  activeFilter: 'all',
  isSearching: false
};

const elements = {
  grid: document.getElementById('pokemon-display-grid'),
  searchInput: document.getElementById('pokemon-search-input'),
  searchBtn: document.getElementById('search-submit-btn'),
  typeFilter: document.getElementById('type-filter-select'),
  clearBtn: document.getElementById('clear-view-btn'),
  statsTotal: document.getElementById('stats-total'),
  statsFilter: document.getElementById('stats-filter')
};

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadInitialPokedex();
});

function setupEventListeners() {
  elements.searchBtn.addEventListener('click', handleSearch);
  
  elements.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  elements.typeFilter.addEventListener('change', handleFilterChange);
  elements.clearBtn.addEventListener('click', resetPokedex);
}

async function loadInitialPokedex() {
  try {
    showSpinner();
    
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
    if (!response.ok) throw new Error('Erro ao obter lista da API');
    
    const data = await response.json();
    
    const detailPromises = data.results.map(p => 
      fetch(p.url).then(res => {
        if (!res.ok) throw new Error('Erro ao carregar detalhes');
        return res.json();
      })
    );
    
    const results = await Promise.all(detailPromises);
    
    state.pokemonList = results.map(pokemon => formatPokemonData(pokemon));
    state.currentList = [...state.pokemonList];
    
    updateStatsCounter();
    renderPokemonGrid(state.currentList);
  } catch (error) {
    console.error(error);
    renderErrorState('Erro ao carregar', 'Não foi possível carregar a lista de Pokémon.');
  }
}

function formatPokemonData(raw) {
  return {
    id: raw.id,
    name: raw.name,
    types: raw.types.map(t => t.type.name),
    image: raw.sprites.other['official-artwork'].front_default || raw.sprites.front_default
  };
}

function showSpinner() {
  elements.grid.innerHTML = `
    <div class="loading-screen" id="loading-placeholder">
      <div class="pokeball-spinner"></div>
      <p>Carregando Pokédex...</p>
    </div>
  `;
}

function renderPokemonGrid(list) {
  elements.grid.innerHTML = '';
  
  if (list.length === 0) {
    renderErrorState('Nenhum Pokémon encontrado', 'Verifique sua busca ou filtro.');
    return;
  }

  list.forEach((pokemon, index) => {
    const card = document.createElement('article');
    const mainType = pokemon.types[0];
    
    card.className = `pokemon-card theme-${mainType} fade-in`;
    card.style.animationDelay = `${(index % 12) * 0.02}s`;
    
    const badgesHtml = pokemon.types.map(t => `
      <span class="type-badge type-${t}">
        ${typeTranslations[t] || t}
      </span>
    `).join('');
    
    const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;

    card.innerHTML = `
      <div class="pokemon-id">${formattedId}</div>
      <div class="pokemon-image-container">
        <img class="pokemon-img" src="${pokemon.image}" alt="${pokemon.name}">
      </div>
      <div class="pokemon-info">
        <h2 class="pokemon-name">${pokemon.name}</h2>
        <div class="pokemon-types">
          ${badgesHtml}
        </div>
      </div>
    `;

    elements.grid.appendChild(card);
  });
}

function renderErrorState(title, description) {
  elements.grid.innerHTML = `
    <div class="error-state fade-in">
      <div class="error-icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h3>${title}</h3>
      <p>${description}</p>
      <button class="reset-btn" onclick="resetPokedexFromButton()">
        <i class="fa-solid fa-rotate-left"></i>
        <span>Voltar</span>
      </button>
    </div>
  `;
}

window.resetPokedexFromButton = function() {
  resetPokedex();
};

function updateStatsCounter() {
  elements.statsTotal.textContent = state.currentList.length;
  elements.statsFilter.textContent = state.activeFilter === 'all' 
    ? 'Todos' 
    : (typeTranslations[state.activeFilter] || state.activeFilter);
}

function handleFilterChange(e) {
  const selectedType = e.target.value;
  state.activeFilter = selectedType;
  
  elements.searchInput.value = '';
  state.isSearching = false;

  if (selectedType === 'all') {
    state.currentList = [...state.pokemonList];
  } else {
    state.currentList = state.pokemonList.filter(pokemon => 
      pokemon.types.includes(selectedType)
    );
  }

  updateStatsCounter();
  renderPokemonGrid(state.currentList);
}

async function handleSearch() {
  const query = elements.searchInput.value.trim().toLowerCase();
  
  if (!query) {
    return;
  }

  showSpinner();
  state.isSearching = true;
  
  elements.typeFilter.value = 'all';
  state.activeFilter = 'all';

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        state.currentList = [];
        updateStatsCounter();
        renderErrorState(
          'Pokémon não encontrado', 
          `Não encontramos nenhum Pokémon correspondente a "${query}".`
        );
        return;
      }
      throw new Error('Erro ao buscar dados na API');
    }

    const rawPokemon = await response.json();
    const formatted = formatPokemonData(rawPokemon);
    
    state.currentList = [formatted];
    updateStatsCounter();
    renderPokemonGrid(state.currentList);
  } catch (error) {
    console.error(error);
    renderErrorState(
      'Falha na busca', 
      'Não foi possível completar a pesquisa.'
    );
  }
}

function resetPokedex() {
  elements.searchInput.value = '';
  elements.typeFilter.value = 'all';
  state.activeFilter = 'all';
  state.isSearching = false;
  state.currentList = [...state.pokemonList];
  
  updateStatsCounter();
  renderPokemonGrid(state.currentList);
}
