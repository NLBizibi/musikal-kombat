const bouton = document.getElementById("bouton");
const message = document.getElementById("message");
let nbFrappes = 0;
function afficherMessage(texte) {
    message.textContent = texte;
};

bouton.addEventListener("click", () => {
    nbFrappes++;
    if(nbFrappes<3) {
        afficherMessage("Combo : " + nbFrappes + " - Continue !");
    }
    else if (nbFrappes<=4) {
        afficherMessage("Combo : " + nbFrappes + " - Ca chauffe !");
    }
    else {
        afficherMessage("Boum, K.O. !");
    }
});
