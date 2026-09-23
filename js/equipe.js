const socket = io();
const zoneInscription = document.getElementById("zoneInscription");
const formInscription = document.getElementById("formInscription");
const nomEquipeInput = document.getElementById("nomEquipeInput");
const boutonInscription = document.getElementById("boutonInscription");
const statusInscription = document.getElementById("statusInscription");
const interfaceEquipe = document.getElementById("interfaceEquipe");
const scoreEquipe = document.getElementById("scoreEquipe");
const statusEquipe = document.getElementById("statusEquipe");
const questionEquipe = document.getElementById("questionEquipe");
const propositionsEquipe = document.getElementById("propositionsEquipe");
const score = document.getElementById("score");
const chronoEquipe = document.getElementById("chronoEquipe");
const nomEquipeDisplay = document.getElementById("nomEquipe");
const boutonBuzzer = document.getElementById("boutonBuzzer");

let nomEquipe = null;

interfaceEquipe.style.display = "none";
scoreEquipe.style.display = "none";


socket.on("connect", () => {

    console.log("Équipe connectée au serveur");

    const nomSauvegarde =
        localStorage.getItem("musikalKombatEquipe");

    if (nomSauvegarde) {

        console.log(
            "Tentative de reconnexion avec " +
            nomSauvegarde
        );

        socket.emit(
            "inscription-equipe",
            nomSauvegarde
        );
    }
});


socket.on("disconnect", () => {

    console.log(
        "Équipe déconnectée du serveur"
    );

    if (nomEquipe !== null) {

        statusEquipe.textContent =
            "⚠️ Connexion perdue. Reconnexion en cours...";
    } else {

        statusInscription.textContent =
            "Connexion au serveur perdue.";
    }
});


formInscription.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        const nomSaisi =
            nomEquipeInput.value.trim();

        if (nomSaisi.length < 2) {

            statusInscription.textContent =
                "Le nom doit contenir au moins 2 caractères.";

            return;
        }

        boutonInscription.disabled = true;

        statusInscription.textContent =
            "Inscription en cours...";

        socket.emit(
            "inscription-equipe",
            nomSaisi
        );
    }
);


socket.on("inscription-validee", (donnees) => {
    nomEquipe = donnees.nom;
    localStorage.setItem("musikalKombatEquipe", nomEquipe);
    nomEquipeDisplay.textContent = donnees.nom;
    score.textContent = donnees.score;
    zoneInscription.style.display = "none";
    interfaceEquipe.style.display = "block";
    scoreEquipe.style.display = "block";
    if (donnees.partieEnCours) {
        statusEquipe.textContent = "Reconnexion réussie. Vous reprendrez à la prochaine question.";
    } 
    else {
        statusEquipe.textContent = "Équipe inscrite ! En attente de la partie...";
    }
        console.log("Équipe inscrite : " + donnees.nom);
    if (donnees.manche === "sprint") {
        boutonBuzzer.disabled = false;
    } 
    else {
        boutonBuzzer.disabled = true;
    }
});

socket.on( "inscription-refusee", (message) => {
        statusInscription.textContent = message;
        boutonInscription.disabled = false;
        zoneInscription.style.display = "block";
        interfaceEquipe.style.display = "none";
        scoreEquipe.style.display = "none";
    }
);

socket.on("partie-demarree", () => {
        statusEquipe.textContent =
            "La partie est en cours !";
    }
);

socket.on("nouvelle-question", (question) => {
    if (question.manche !== "sprint") {
        boutonBuzzer.disabled = true;
    }

    console.log("Question " + question.numero + " / " + question.total);
    statusEquipe.textContent = "À vous de jouer !";
    questionEquipe.textContent = question.texte;
    propositionsEquipe.innerHTML = "";

    for (let i = 0; i < question.reponses.length; i++) {
        const bouton = document.createElement("button");
        bouton.textContent = question.reponses[i];

        bouton.addEventListener("click", () => {
            socket.emit("reponse-equipe", i);
            for (let j = 0; j < propositionsEquipe.children.length; j++) {
                propositionsEquipe.children[j].disabled = true;
            }

            statusEquipe.textContent = "Réponse envoyée...";
        });

        propositionsEquipe.appendChild(bouton);
    }
});


socket.on("resultat-reponse", (resultat) => {
    if (resultat.bonne) {
        statusEquipe.textContent = "✅ Bonne réponse !";
    } 
    else {
        statusEquipe.textContent = "❌ Mauvaise réponse !";
    }
});

socket.on("score", (nouveauScore) => {
        score.textContent = nouveauScore;
});

socket.on(
    "scores",
    (scores) => {

        if (
            nomEquipe !== null &&
            scores[nomEquipe]
        ) {

            score.textContent =
                scores[nomEquipe].score;
        }
    }
);

socket.on("chrono", (temps) => {
        chronoEquipe.textContent =
            temps + " s";
    }
);

socket.on("temps-ecoule", () => {
        statusEquipe.textContent = "⏱️ Temps écoulé !";
    }
);

socket.on("manche-changee", (manche) => {
    console.log("Manche changee reçue : ", manche);
    if (manche === "sprint") {
        boutonBuzzer.disabled = false;
        statusEquipe.textContent = "🔴 SPRINT : à vous de jouer !";
    } else {
        boutonBuzzer.disabled = true;
    }
});

socket.on("partie-terminee", () => {
    statusEquipe.textContent = "La partie est terminée !";
    questionEquipe.textContent = "";
    propositionsEquipe.innerHTML = "";
    chronoEquipe.textContent = "—";
});

boutonBuzzer.addEventListener("click", () => {
    boutonBuzzer.disabled = true;
    socket.emit("buzzer");
});