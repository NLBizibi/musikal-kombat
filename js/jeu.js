const message = document.getElementById("message");
const equipesDisplay = document.getElementById("equipesDisplay");
const nouvellePartie = document.getElementById("nouvellePartie");
const equipeTest = {
    nom: "Acabra",
    score: 0
}
const equipe2 = {
    nom: "Grumpies",
    score: 0
}
const equipes = [equipeTest, equipe2];

function afficherMessage(texte) {
    message.textContent = texte;
}
function ajouterMessage(texte) {
    message.innerHTML += texte + "<br>";
}
function afficherEquipe(nomEquipe, scoreEquipe){
    ajouterMessage(nomEquipe + " : " + scoreEquipe);
}
function afficherToutesEquipes() {
    afficherMessage("");
    for (let i = 0; i < equipes.length; i++) {
        afficherEquipe(equipes[i].nom, equipes[i].score);
    };
}
function ajouterPoint(indiceEquipe){
    equipes[indiceEquipe].score++;
}
function reinitScores() {
    for (let i = 0 ; i < equipes.length ; i++) {
        equipes[i].score = 0;
    }
    afficherToutesEquipes();
}

afficherToutesEquipes();

nouvellePartie.addEventListener("click", () => {
    reinitScores();
});

for (let i = 0; i < equipes.length; i++){
    const boutonEquipe = document.createElement("button");
    boutonEquipe.textContent = equipes[i].nom;
    equipesDisplay.appendChild(boutonEquipe);
    boutonEquipe.addEventListener ("click", () => {
        ajouterPoint(i);
        afficherToutesEquipes();
    });
};

afficherToutesEquipes();
