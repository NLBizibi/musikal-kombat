const message = document.getElementById("message");
const scoreDisplay = document.getElementById("scoreDisplay");
const equipesDisplay = document.getElementById("equipesDisplay");
const equipes = ["Acabra", "Grumpies", "Rockers", "Meloche"];
const scoresEquipes = [0, 0, 0, 0];
const nouvellePartie = document.getElementById("nouvellePartie");
function afficherMessage(texte) {
    message.textContent = texte;
}
function ajouterMessage(texte) {
    message.innerHTML += texte + "<br>";
}
function afficherScore() {
    scoreDisplay.textContent = "Score : " + score;
}
function afficherEquipe(nomEquipe, scoreEquipe){
    ajouterMessage(nomEquipe + " : " + scoreEquipe);
}
function afficherToutesEquipes() {
    afficherMessage("");
    for (let i = 0; i < equipes.length; i++) {
        afficherEquipe(equipes[i], scoresEquipes[i]);
    };
}
function ajouterPoint(indiceEquipe){
    scoresEquipes[indiceEquipe]++;
}

nouvellePartie.style.display = "none";

for (let i = 0; i < equipes.length; i++){
    const boutonEquipe = document.createElement("button");
    boutonEquipe.textContent = equipes[i];
    equipesDisplay.appendChild(boutonEquipe);
    boutonEquipe.addEventListener ("click", () => {
        ajouterPoint(i);
        afficherToutesEquipes();
    });
};

afficherToutesEquipes();

bouton.addEventListener("click", () => {
    ajouterPoint(0);
    afficherToutesEquipes();
});
