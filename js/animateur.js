const socket = io();

const boutonNouvellePartie =
    document.getElementById("nouvellePartie");

const statusAnimateur =
    document.getElementById("statusAnimateur");

const questionAnimateur =
    document.getElementById("question");

const numeroQuestion =
    document.getElementById("numeroQuestion");

const equipesDisplay =
    document.getElementById("equipesDisplay");

socket.on("connect", () => {
    console.log("Animateur connecté au serveur");
});

socket.on("disconnect", () => {
    console.log("Animateur déconnecté du serveur");
});

boutonNouvellePartie.addEventListener("click", () => {
    socket.emit("demarrer-partie");

    statusAnimateur.textContent =
        "La partie est en cours !";
});

socket.on("nouvelle-question", (question) => {
    numeroQuestion.textContent =
        "Question " +
        question.numero +
        " / " +
        question.total;

    questionAnimateur.textContent =
        question.texte;
});

socket.on("chrono", (temps) => {
    document.getElementById("chrono").textContent =
        temps + " s";
});

socket.on("scores", (scores) => {
    equipesDisplay.innerHTML = "";

    for (const nomEquipe in scores) {
        const ligne = document.createElement("p");

        ligne.textContent =
            nomEquipe +
            " : " +
            scores[nomEquipe].score +
            " point(s)";

        equipesDisplay.appendChild(ligne);
    }
});

socket.on("partie-terminee", () => {
    statusAnimateur.textContent =
        "La partie est terminée !";

    questionAnimateur.textContent =
        "";

    numeroQuestion.textContent =
        "QCM terminé";
});