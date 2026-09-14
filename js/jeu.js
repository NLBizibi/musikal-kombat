const bouton = document.getElementById("bouton");
const message = document.getElementById("message");
let nbFrappes = 0;

bouton.addEventListener("click", () => {
    nbFrappes++;
    if(nbFrappes<3) {
        message.textContent = "Combo : " + nbFrappes + " - Continue !";
    }
    else if (nbFrappes<=4) {
        message.textContent = "Combo : " + nbFrappes + " - Ca chauffe !";
    }
    else {
        message.textContent = "K.O. !!!";
    }
});
