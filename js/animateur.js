const socket = io();

const boutonNouvellePartie =
    document.getElementById("nouvellePartie");
const statusAnimateur =
    document.getElementById("statusAnimateur");
const questionAnimateur =
    document.getElementById("question");
const numeroQuestion =
    document.getElementById("numeroQuestion");
const chrono =
    document.getElementById("chrono");
const equipesDisplay =
    document.getElementById("equipesDisplay");
const mancheAnimateur =
    document.getElementById("manche");
const boutonMancheSuivante =
    document.getElementById("mancheSuivante");
const boutonBonneReponseSprint =
    document.getElementById("bonneReponseSprint");
const boutonMauvaiseReponseSprint =
    document.getElementById("mauvaiseReponseSprint");
const boutonTestSprint =
    document.getElementById("testSprint");
const morceauSprintAnimateur =
    document.getElementById("morceauSprintAnimateur");
const reponseSprintAnimateur =
    document.getElementById("reponseSprintAnimateur");
const audioSprint =
    document.getElementById("audioSprint");
const boutonLancerAudioSprint =
    document.getElementById("lancerAudioSprint");
const boutonPersonneNeTrouveSprint =
    document.getElementById("personneNeTrouveSprint");

boutonTestSprint.addEventListener("click", () => {
    socket.emit("test-sprint");
});


let listeEquipes = [];

boutonNouvellePartie.disabled = true;
boutonMancheSuivante.disabled = true;

socket.on("connect", () => {
    console.log("Animateur connecté au serveur");
});

socket.on("disconnect", () => {
    console.log("Animateur déconnecté du serveur");
});

socket.on("manche-changee", (manche) => {
    mancheAnimateur.textContent = "Manche : " + manche.toUpperCase();
    statusAnimateur.textContent = "Manche " + manche.toUpperCase();
});

socket.on("manche-terminee", (manche) => {
    console.log( "Manche terminée :", manche);
    statusAnimateur.textContent = "Manche " + manche.toUpperCase() + " terminée";
    boutonMancheSuivante.disabled = false;
});

socket.on("liste-equipes", (equipes) => {
    console.log("Liste des équipes reçue :", equipes);
    listeEquipes = equipes;
    afficherEquipes();
    boutonNouvellePartie.disabled =
        listeEquipes.length === 0;
});

socket.on("partie-demarree", () => {
    statusAnimateur.textContent = "La partie est en cours !";
    boutonMancheSuivante.disabled = true;
});

socket.on("nouvelle-question", (question) => {
    mancheAnimateur.textContent = "Manche : " + question.manche.toUpperCase();
    numeroQuestion.textContent = "Question " + question.numero + " / " + question.total;
    questionAnimateur.textContent = question.texte;
});

socket.on("chrono", (temps) => {
    chrono.textContent =
        temps + " s";
});

socket.on("morceau-sprint-animateur", (morceau) => {
    morceauSprintAnimateur.textContent =
        "Morceau Sprint " +
        morceau.numero +
        " / " +
        morceau.total;

    reponseSprintAnimateur.textContent =
        morceau.artiste +
        " — " +
        morceau.titre;
    
    audioSprint.src = morceau.audio;
    audioSprint.load();

    boutonPersonneNeTrouveSprint.disabled = false;
});

socket.on("buzzer-gagnant", (nomEquipe) => {
    audioSprint.pause();
    boutonPersonneNeTrouveSprint.disabled = true;

    statusAnimateur.textContent ="🔴 BUZZ : " + nomEquipe;

    boutonBonneReponseSprint.disabled = false;
    boutonMauvaiseReponseSprint.disabled = false;

    console.log(
        "Équipe ayant buzzé :",
        nomEquipe
    );
});

socket.on("buzzer-rearme", () => {
    if (!audioSprint.ended) {
        audioSprint.play();
    }
    boutonPersonneNeTrouveSprint.disabled = false;
});

boutonLancerAudioSprint.addEventListener("click", () => {
    audioSprint.currentTime = 0;
    audioSprint.play();
});

boutonBonneReponseSprint.addEventListener("click", () => {
    boutonBonneReponseSprint.disabled = true;
    boutonMauvaiseReponseSprint.disabled = true;

    socket.emit("validation-sprint", true);
});

boutonMauvaiseReponseSprint.addEventListener("click", () => {
    boutonBonneReponseSprint.disabled = true;
    boutonMauvaiseReponseSprint.disabled = true;

    socket.emit("validation-sprint", false);
});

boutonPersonneNeTrouveSprint.addEventListener("click", () => {
    audioSprint.pause();
    boutonPersonneNeTrouveSprint.disabled = true;

    socket.emit("sprint-personne-ne-trouve");
});

socket.on("scores", (scores) => {
    for (let i = 0; i < listeEquipes.length; i++) {
        const equipe =
            listeEquipes[i];
        if (scores[equipe.nom]) {
            equipe.score = scores[equipe.nom].score;
        }
    }

    afficherEquipes();
});

socket.on("partie-terminee", () => {
    statusAnimateur.textContent = "La partie est terminée !";
    questionAnimateur.textContent = "";
    numeroQuestion.textContent = "Partie terminée";
    chrono.textContent = "—";
    boutonMancheSuivante.disabled = true;
});

boutonNouvellePartie.addEventListener("click", () => {
    socket.emit("demarrer-partie");
    statusAnimateur.textContent = "La partie est en cours !";
});

boutonMancheSuivante.addEventListener("click", () => {
    boutonMancheSuivante.disabled = true;
    socket.emit("passer-manche-suivante");
});

function afficherEquipes() {
    equipesDisplay.innerHTML = "";
    for (let i = 0; i < listeEquipes.length; i++) {
        const equipe = listeEquipes[i];
        const ligne = document.createElement("p");
        ligne.textContent = equipe.nom + " : " + equipe.score + " point(s) - " +
            (
                equipe.connectee
                    ? "connectée"
                    : "déconnectée"
            );
        equipesDisplay.appendChild(ligne);
    }
}