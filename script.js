const cohortName = "2306-FSA-ET-WEB-FT-SF";
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}`;

/**
 * Fetches all players from the API.
 * @returns {Object[]} the array of player objects
 */
const fetchAllPlayers = async () => {
  try {
    const response = await fetch(`${API_URL}/players`);
    const puppyList = await response.json();
    return puppyList.data.players;
  } catch (err) {
    console.error("Uh oh, trouble fetching players!", err);
  }
};

/**
 * Fetches a single player from the API.
 * @param {number} playerId
 * @returns {Object} the player object
 */
const fetchSinglePlayer = async (playerId) => {
  try {
    const response = await fetch(`${API_URL}/players${playerId}`);
    const singlePuppy = await response.json();
    return singlePuppy;
  } catch (err) {
    console.error(`Oh no, trouble fetching player #${playerId}!`, err);
  }
};

/**
 * Adds a new player to the roster via the API.
 * @param {Object} playerObj the player to add
 * @returns {Object} the player returned by the API
 */
const addNewPlayer = async (playerObj) => {
  try {
    const response = await fetch(`${API_URL}/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playerObj),
    });
    const data = await response.json();
    alert(`Puppy successfully added to roster!`)
    return data;
  } catch (err) {
    console.error("Oops, something went wrong with adding that player!", err);
  }
};

/**
 * Removes a player from the roster via the API.
 * @param {number} playerId the ID of the player to remove
 */
const removePlayer = async (playerId) => {
  try {
    await fetch(`${API_URL}/players/${playerId}`, {
      method: "DELETE",
    });
    alert(`Puppy successfully cut from the team!`)
  } catch (err) {
    console.error(`Whoops, trouble removing player #${playerId} from the roster!`, err);
  }
};

/**
 * Updates `<main>` to display a list of all players.
 *
 * If there are no players, a corresponding message is displayed instead.
 *
 * Each player is displayed in a card with the following information:
 * - name
 * - id
 * - image (with alt text of the player's name)
 *
 * Additionally, each card has two buttons:
 * - "See details" button that, when clicked, calls `renderSinglePlayer` to
 *    display more information about the player
 * - "Remove from roster" button that, when clicked, will call `removePlayer` to
 *    remove that specific player and then re-render all players
 *
 * Note: this function should replace the current contents of `<main>`, not append to it.
 * @param {Object[]} playerList - an array of player objects
 */
const renderAllPlayers = (playerList) => {
  const mainElement = document.querySelector("main");
  mainElement.innerHTML = "";

  const playerCards = playerList.map((player) => {
    const playerCard = document.createElement("div");
    playerCard.className = "player-card";

    const playerName = document.createElement("h2");
    playerName.innerText = player.name;

    const playerId = document.createElement("p");
    playerId.innerText = `ID: ${player.id}`;

    const playerImage = document.createElement("img");
    playerImage.src = player.imageUrl;
    playerImage.alt = player.name;

    const seeDetailsButton = document.createElement("button");
    seeDetailsButton.innerText = "See details";
    seeDetailsButton.addEventListener("click", () => {
      renderSinglePlayer(player);
    });

    const removeButton = document.createElement("button");
    removeButton.innerText = "Remove from roster";
    removeButton.addEventListener("click", async () => {
      await removePlayer(player.id);
      const updatedPlayers = await fetchAllPlayers();
      renderAllPlayers(updatedPlayers);
    });

    playerCard.appendChild(playerName);
    playerCard.appendChild(playerId);
    playerCard.appendChild(playerImage);
    playerCard.appendChild(seeDetailsButton);
    playerCard.appendChild(removeButton);

    return playerCard;
  });

  mainElement.append(...playerCards);
};

/**
 * Updates `<main>` to display a single player.
 * The player is displayed in a card with the following information:
 * - name
 * - id
 * - breed
 * - image (with alt text of the player's name)
 * - team name, if the player has one, or "Unassigned"
 *
 * The card also contains a "Back to all players" button that, when clicked,
 * will call `renderAllPlayers` to re-render the full list of players.
 * @param {Object} player an object representing a single player
 */
const renderSinglePlayer = (player) => {
  const mainElement = document.querySelector("main");
  mainElement.innerHTML = "";

  const playerCard = document.createElement("div");
  playerCard.className = "player-card";

  const playerName = document.createElement("h2");
  playerName.innerHTML = player.name;

  const playerId = document.createElement("p");
  playerId.innerHTML = `ID: ${player.id}`;

  const playerBreed = document.createElement("p");
  playerBreed.innerHTML = `Breed: ${player.breed}`;

  const playerImage = document.createElement("img");
  playerImage.src = player.imageUrl;
  playerImage.alt = player.name;

  const playerTeam = document.createElement("p");
  playerTeam.innerHTML = player.teamId ? `Team: ${player.teamId}` : "Unassigned";

  const backToAllPlayersButton = document.createElement("button");
  backToAllPlayersButton.innerText = "Back to all players";
  backToAllPlayersButton.addEventListener("click", async () => {
    const allPlayers = await fetchAllPlayers();
    renderAllPlayers(allPlayers);
  });

  playerCard.appendChild(playerName);
  playerCard.appendChild(playerId);
  playerCard.appendChild(playerBreed);
  playerCard.appendChild(playerImage);
  playerCard.appendChild(playerTeam);
  playerCard.appendChild(backToAllPlayersButton);

  mainElement.appendChild(playerCard);
};

const createInput = (type, placeholder) => {
  const input = document.createElement("input");
  input.type = type;
  input.placeholder = placeholder;
  return input;
};

/**
 * Fills in `<form id="new-player-form">` with the appropriate inputs and a submit button.
 * When the form is submitted, it should call `addNewPlayer`, fetch all players,
 * and then render all players to the DOM.
 */
const renderNewPlayerForm = () => {
  const playerForm = document.createElement("form");
  playerForm.id = "new-player-form";

  const nameInput = createInput("text", "Enter player name");
  const breedInput = createInput("text", "Enter player breed");
  const teamInput = createInput("text", "Enter player team");
  const imageInput = createInput("text", "Enter player image URL");

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.innerText = "Add Player";

  playerForm.appendChild(nameInput);
  playerForm.appendChild(breedInput);
  playerForm.appendChild(teamInput);
  playerForm.appendChild(imageInput);
  playerForm.appendChild(submitButton);

  playerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const playerObj = {
      name: nameInput.value,
      breed: breedInput.value,
      teamId: teamInput.value,
      imageUrl: imageInput.value,
    };

    await addNewPlayer(playerObj);
    const updatedPlayers = await fetchAllPlayers();
    renderAllPlayers(updatedPlayers);

    playerForm.reset();
  });

  document.querySelector("#playerform").appendChild(playerForm);
};

/**
 * Initializes the app by fetching all players and rendering them to the DOM.
 */
const init = async () => {
  const players = await fetchAllPlayers();
  renderAllPlayers(players);

  renderNewPlayerForm();
};

init();
