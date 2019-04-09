const BASE_URL = "http://localhost:3000"
const TRAINERS_URL = `${BASE_URL}/trainers`
const POKEMONS_URL = `${BASE_URL}/pokemons`

class Pokemon{
  static pokemons = [];
  constructor(id, nickname, species, trainer_id){
    this.id = id;
    this.nickname = nickname;
    this.species = species;
    this.trainer_id = trainer_id;

    Pokemon.pokemons.push(this);
  }

  remove(){
    Pokemon.pokemons = Pokemon.pokemons.filter(pokemon => pokemon.id !== this.id);
  }
}

class Trainer{
  static trainers = [];
  constructor(id, name, pokemonsData){
    this.id = id;
    this.name = name;
    let pokemons = [];
    pokemonsData.forEach(item => {
      pokemons.push(new Pokemon(item.id, item.nickname, item.species, item.trainer_id));
    })
    this.pokemons = pokemons;

    Trainer.trainers.push(this);
  }

  renderCard(){
    let mainContainer = document.querySelector("main");
    let card = document.createElement("div");
    card.classList.add("card");
    card.dataset.id = this.id;
    card.innerHTML = `<p>${this.name}</p>`;
    let addButton = document.createElement("button");
    addButton.dataset.trainerId = this.id;
    addButton.innerText = "Add Pokemon";
    addButton.addEventListener("click", addButtonHandler)
    let list = document.createElement("ul");
    this.pokemons.forEach(pokemon => {
      let listItem = document.createElement("li");
      listItem.innerText = `${pokemon.nickname} (${pokemon.species})`;
      listItem.dataset.id = pokemon.id
      let releaseButton = document.createElement("button");
      releaseButton.innerText = "Release";
      releaseButton.classList.add("release");
      releaseButton.dataset.pokemonId = pokemon.id;
      releaseButton.addEventListener("click", releaseButtonHandler)
      listItem.appendChild(releaseButton);
      list.appendChild(listItem);
    })
    card.appendChild(addButton);
    card.appendChild(list);
    mainContainer.appendChild(card);
  }

  removePokemon(pokemonId){
    let pokemon = this.pokemons.find(pokemon => pokemon.id === pokemonId);
    let cards = document.querySelectorAll(".card")
    let card = Array.from(cards).filter(card => parseInt(card.dataset.id) === this.id)[0];
    let list = card.querySelector("ul");
    let listItem = Array.from(list.children).find(item => item.dataset.id === pokemonId);
    listItem.remove();
  }

  addPokemon(pokemon){
    let cards = document.querySelectorAll(".card")
    let card = Array.from(cards).filter(card => parseInt(card.dataset.id) === this.id)[0];
    let list = card.querySelector("ul");
    let listItem = document.createElement("li");
    listItem.innerText = `${pokemon.nickname} (${pokemon.species})`;
    listItem.dataset.id = pokemon.id
    let releaseButton = document.createElement("button");
    releaseButton.innerText = "Release";
    releaseButton.classList.add("release");
    releaseButton.dataset.pokemonId = pokemon.id;
    releaseButton.addEventListener("click", releaseButtonHandler)
    listItem.appendChild(releaseButton);
    list.appendChild(listItem);
    this.pokemons.push(pokemon);
  }
}

function addButtonHandler(event){
  let trainerId = event.target.parentNode.dataset.id;
  let trainer = Trainer.trainers.find(train => train.id === parseInt(trainerId));

  if(trainer.pokemons.length < 6){
    fetch(POKEMONS_URL,{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accepts: "json"
      },
      body: JSON.stringify({"trainer_id": parseInt(trainerId)})
    })
    .then(res => res.json())
    .then(data => {
      let newPoke = new Pokemon(data.id, data.nickname, data.species, data.trainer_id);
      trainer.addPokemon(newPoke);
    })
  }
}

function releaseButtonHandler(event){
  let listItem = event.target.parentNode;
  let trainerCard = listItem.parentNode.parentNode;
  let trainer = Trainer.trainers.find(trainer => trainer.id === parseInt(trainerCard.dataset.id));
  let pokemonId = listItem.querySelector("button").dataset.pokemonId;
  fetch(`${POKEMONS_URL}/${pokemonId}`,{
    method: "DELETE"
  })
  .then(res => res.json())

  trainer.removePokemon(pokemonId);
}


document.addEventListener("DOMContentLoaded", runner);

function runner(e){
  renderPokemonTrainerCards();
}

function renderPokemonTrainerCards(){
  fetch(TRAINERS_URL)
  .then(res => res.json())
  .then(data => {
    data.forEach(item => {
      let trainer = new Trainer(item.id, item.name, item.pokemons);
      trainer.renderCard();
    })
  })
}
