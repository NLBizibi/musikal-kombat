const bouton = document.getElementById("bouton");
const message = document.getElementById("message");
const scoreDisplay = document.getElementById("scoreDisplay");
let nbFrappes = 0;
let score = 0;
function afficherMessage(texte) {
    message.textContent = texte;
};
function ajouterMessage(texte) {
    message.textContent += texte;
};
function afficherScore() {
    scoreDisplay.textContent = "Score : " + score;
};

bouton.addEventListener("click", () => {
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
    }
    afficherScore();
});
