const bouton = document.getElementById("bouton");
const message = document.getElementById("message");
let nbFrappes = 0;

bouton.addEventListener("click", () => {
    nbFrappes++;
    if(nbFrappes<=4) {
        message.textContent = "Combo : " + nbFrappes;
    }
    else {
        message.textContent = "K.O. !"
    }
});
