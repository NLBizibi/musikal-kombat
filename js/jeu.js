const bouton = document.getElementById("bouton");
const message = document.getElementById("message");
const scoreDisplay = document.getElementById("scoreDisplay");
const equipesDisplay = document.getElementById("equipesDisplay");
const equipes = ["Acabra", "Grumpies", "Rockers", "Meloche"];
const scoresEquipes = [0, 0, 0, 0];
const nouvellePartie = document.getElementById("nouvellePartie");
let nbFrappes = 0;
let score = 0;
let partieTerminee = false;
function afficherMessage(texte) {
    message.textContent = texte;
}
function ajouterMessage(texte) {
    message.innerHTML += texte + "<br>";
}
function afficherScore() {
    scoreDisplay.textContent = "Score : " + score;
}
function terminerPartie(){
    partieTerminee = true;
    bouton.disabled = true;
    nouvellePartie.style.display = "block";
}
function reinitPartie(){
    nouvellePartie.style.display = "none";
    partieTerminee = false;
    score = 0;
    nbFrappes = 0;
    bouton.disabled = false;
    afficherScore();
    afficherMessage("");
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

/*
bouton.addEventListener("click", () => {
    if(partieTerminee === false) {
        nbFrappes++;
       score++;
        if(nbFrappes<3) {
            afficherMessage("Combo : " + nbFrappes + " Continue !");
        }
        else if (nbFrappes<=4) {
            afficherMessage("Combo : " + nbFrappes + " Ca chauffe !");
        }
        else {
            afficherMessage("Boum, K.O. !");
            terminerPartie();
            afficherEquipe()
        }
        afficherScore();
    }
});

nouvellePartie.addEventListener("click", () => {
    reinitPartie();
});
*/
