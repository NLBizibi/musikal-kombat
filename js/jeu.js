const bouton = document.getElementById("bouton");
const message = document.getElementById("message");
let nbFrappes = 0;

bouton.addEventListener("click", () => {
    nbFrappes++;
    message.textContent = "Frappes :" + nbFrappes;
});
