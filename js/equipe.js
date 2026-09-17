const socket = io();

const statusEquipe =
    document.getElementById("statusEquipe");

const questionEquipe =
    document.getElementById("questionEquipe");

const propositionsEquipe =
    document.getElementById("propositionsEquipe");

const scoreEquipe =
    document.getElementById("score");

const parametres =
    new URLSearchParams(window.location.search);

const nomEquipe =
    parametres.get("equipe") || "Équipe";

document.getElementById("nomEquipe").textContent =
    nomEquipe;

socket.on("connect", () => {
    console.log("Équipe connectée au serveur");

    socket.emit("inscription-equipe", nomEquipe);
});

socket.on("disconnect", () => {
    console.log("Équipe déconnectée du serveur");
});

socket.on("partie-demarree", () => {
    statusEquipe.textContent =
        "La partie est en cours !";
});

socket.on("nouvelle-question", (question) => {
    console.log(
        "Question " +
        question.numero +
        " / " +
        question.total
    );

    // Réinitialisation de l'affichage
    statusEquipe.textContent =
        "À vous de jouer !";

    questionEquipe.textContent =
        question.texte;

    propositionsEquipe.innerHTML = "";

    for (let i = 0; i < question.reponses.length; i++) {
        const bouton = document.createElement("button");

        bouton.textContent =
            question.reponses[i];

        bouton.addEventListener("click", () => {
            socket.emit("reponse-equipe", i);

            for (
                let j = 0;
                j < propositionsEquipe.children.length;
                j++
            ) {
                propositionsEquipe.children[j].disabled = true;
            }

            statusEquipe.textContent =
                "Réponse envoyée...";
        });

        propositionsEquipe.appendChild(bouton);
    }
});

socket.on("resultat-reponse", (resultat) => {
    if (resultat.bonne) {
        statusEquipe.textContent =
            "✅ Bonne réponse !";
    } else {
        statusEquipe.textContent =
            "❌ Mauvaise réponse !";
    }
});

socket.on("score", (score) => {
    scoreEquipe.textContent = score;
});

socket.on("scores", (scores) => {
    if (scores[nomEquipe]) {
        scoreEquipe.textContent =
            scores[nomEquipe].score;
    }
});

socket.on("partie-terminee", () => {
    statusEquipe.textContent =
        "La partie est terminée !";

    questionEquipe.textContent = "";

    propositionsEquipe.innerHTML = "";
});

socket.on("chrono", (temps) => {
    document.getElementById("chronoEquipe").textContent =
        temps + " s";
});

socket.on("temps-ecoule", () => {
    statusEquipe.textContent =
        "⏱️ Temps écoulé !";
});