const message = document.getElementById("message");
const status = document.getElementById("status");
const equipesDisplay = document.getElementById("equipesDisplay");
const nouvellePartie = document.getElementById("nouvellePartie");
let partieEnCours = false;
const equipeTest = {
    nom: "Acabra",
    score: 0,
    active: true
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
function checkStatus() {
    if (partieEnCours) {
        status.textContent = "La partie est en cours !";
    }
    else {
        status.textContent = "La partie est terminée !";
    }
}
function demarrerPartie() {
    if (partieEnCours) {
        const confirmation = confirm("Es-tu sûr ?");
        if (!confirmation) {
            return;
        }
    }
    reinitScores();
    partieEnCours = true;
    checkStatus();
}
function terminerPartie() {
    partieEnCours = false;
    checkStatus();
}
function afficherEquipe(nomEquipe, scoreEquipe, active){
    if (active === true) {
        ajouterMessage(nomEquipe + " : " + scoreEquipe + " - Equipe active");
    }
    else {
        ajouterMessage(nomEquipe + " : " + scoreEquipe + " - Equipe inactive");

    }
}  
function afficherToutesEquipes() {
    afficherMessage("");
    for (let i = 0; i < equipes.length; i++) {
        afficherEquipe(equipes[i].nom, equipes[i].score, equipes[i].active);
    };
}
function activerEquipe(indiceEquipe) {
    equipes[indiceEquipe].active = true;
    afficherToutesEquipes();
}
function desactiverEquipe(indiceEquipe) {
    equipes[indiceEquipe].active = false;
    afficherToutesEquipes();
}
function ajouterPoint(indiceEquipe){
    if(equipes[indiceEquipe].active) {
        equipes[indiceEquipe].score++;
    }
    else{
        alert("L'équipe " + equipes[indiceEquipe].nom + " est inactive !");
    }
}
function reinitScores() {
    for (let i = 0 ; i < equipes.length ; i++) {
        equipes[i].score = 0;
    }
    afficherToutesEquipes();
}

nouvellePartie.addEventListener("click", () => {
    demarrerPartie();
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
