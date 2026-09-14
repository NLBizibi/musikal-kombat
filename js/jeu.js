const bouton = document.getElementById("bouton");
const message = document.getElementById("message");
const scoreDisplay = document.getElementById("scoreDisplay");
const nouvellePartie = document.getElementById("nouvellePartie");
let nbFrappes = 0;
let score = 0;
let partieTerminee = false;
function afficherMessage(texte) {
    message.textContent = texte;
}
function ajouterMessage(texte) {
    message.textContent += texte;
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

nouvellePartie.style.display = "none";

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
        }
        afficherScore();
    }
});

nouvellePartie.addEventListener("click", () => {
    reinitPartie();
});
