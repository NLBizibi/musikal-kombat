const bouton = document.getElementById("bouton");
const message = document.getElementById("message");

bouton.addEventListener("click", () => {
    message.textContent += "Boum !! ";
});
