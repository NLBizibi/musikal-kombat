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
const boutonTestCombo = document.getElementById("testCombo");
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
const boutonAfficherClassement =
    document.getElementById("afficherClassement");
const boutonQuestionSuivanteQcm =
    document.getElementById("questionSuivanteQcm");
const audioQcm = 
    document.getElementById("lecteur-qcm");
const boutonLancerAudioQcm =
    document.getElementById("lancerAudioQcm");
const infosCombo = document.getElementById("infosCombo");
const morceauComboAnimateur =
    document.getElementById("morceauComboAnimateur");
const chronoComboAnimateur =
    document.getElementById("chronoComboAnimateur");
const boutonLancerMorceauCombo =
    document.getElementById("lancerMorceauCombo");
const statusComboAnimateur =
    document.getElementById("statusComboAnimateur");
const correctionCombo =
    document.getElementById("correctionCombo");

const listeReponsesCombo =
    document.getElementById("listeReponsesCombo");

let classementAffiche = false;

boutonAfficherClassement.addEventListener("click", () => {
    classementAffiche = !classementAffiche;

    socket.emit(
        "affichage-classement",
        classementAffiche
    );

    boutonAfficherClassement.textContent =
        classementAffiche
            ? "🎮 Revenir au jeu"
            : "🏆 Afficher le classement";
});

boutonTestSprint.addEventListener("click", () => {
    socket.emit("test-sprint");
});

boutonTestCombo.addEventListener("click", () => {
    socket.emit("test-combo");
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

    mancheAnimateur.textContent =
        "Manche : " + manche.toUpperCase();

    statusAnimateur.textContent =
        "Manche " + manche.toUpperCase();

    infosCombo.style.display =
        manche === "combo" ? "block" : "none";

    if (manche !== "combo") {
        boutonLancerMorceauCombo.disabled = true;
    }
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
    boutonMancheSuivante.disabled = false;
});

socket.on("nouvelle-question", (question) => {
    mancheAnimateur.textContent = "Manche : " + question.manche.toUpperCase();
    numeroQuestion.textContent = "Question " + question.numero + " / " + question.total;
    questionAnimateur.textContent = question.texte;
    boutonLancerAudioQcm.disabled = false;

    // Charger l'extrait correspondant à la question
    audioQcm.pause();
    audioQcm.src = "/audio/qcm/qcm" + question.numero + ".mp3";
    audioQcm.load();

    console.log("Audio QCM chargé :", audioQcm.src);
});

socket.on("qcm-attente-question-suivante", () => {
    boutonQuestionSuivanteQcm.disabled = false;
});

boutonQuestionSuivanteQcm.addEventListener("click", () => {
    boutonQuestionSuivanteQcm.disabled = true;

    socket.emit("question-suivante-qcm");
});

socket.on("chrono", (temps) => {
    chrono.textContent =
        temps + " s";
});

socket.on("morceau-sprint-animateur", (morceau) => {
    console.log("Morceau reçu par animateur :", morceau);
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
    console.log("Source Sprint :", audioSprint.src);

    audioSprint.currentTime = 0;

    audioSprint.play().catch((erreur) => {
        console.error("Erreur lecture Sprint :", erreur);
    });
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

boutonLancerAudioQcm.addEventListener("click", () => {
    boutonLancerAudioQcm.disabled = true;
    socket.emit("demarrer-question-qcm");
});

socket.on("qcm-question-demarree", () => {
    audioQcm.currentTime = 0;

    audioQcm.play().catch((erreur) => {
        console.warn("Lecture audio impossible :", erreur.message);
    });
});

// Préparation d'un morceau Combo

socket.on("combo-morceau-prepare", (morceau) => {

    infosCombo.style.display = "block";
    correctionCombo.style.display = "none";
    listeReponsesCombo.innerHTML = "";

    morceauComboAnimateur.textContent =
        "Morceau " + morceau.numero + " / " + morceau.total;

    chronoComboAnimateur.textContent =
        morceau.temps + " s";

    boutonLancerMorceauCombo.disabled = false;

    statusComboAnimateur.textContent =
        "Morceau prêt. En attente du lancement.";
});


// Lancement du morceau par l'animateur

boutonLancerMorceauCombo.addEventListener("click", () => {

    boutonLancerMorceauCombo.disabled = true;

    socket.emit("demarrer-morceau-combo");
});


// Confirmation du démarrage

socket.on("combo-demarre", (donnees) => {

    boutonLancerMorceauCombo.disabled = true;

    chronoComboAnimateur.textContent =
        donnees.temps + " s";

    statusComboAnimateur.textContent =
        "Réponses ouvertes !";
});


// Actualisation du chronomètre

socket.on("combo-chrono", (temps) => {

    chronoComboAnimateur.textContent =
        temps + " s";
});


// Fin du temps

socket.on("combo-temps-ecoule", () => {

    boutonLancerMorceauCombo.disabled = true;

    chronoComboAnimateur.textContent = "0 s";

    statusComboAnimateur.textContent =
        "Temps écoulé. Réponses verrouillées.";
});

socket.on("combo-reponse-direct", (donnees) => {
    correctionCombo.style.display = "block";
    let ligne = Array.from(listeReponsesCombo.children)
        .find(element => element.dataset.equipe === donnees.nomEquipe);

    if (!ligne) {
        ligne = document.createElement("div");
        ligne.dataset.equipe = donnees.nomEquipe;

        const nom = document.createElement("h4");
        nom.textContent = donnees.nomEquipe;

        const reponse = document.createElement("p");
        reponse.className = "texteReponseCombo";

        ligne.appendChild(nom);
        ligne.appendChild(reponse);

        listeReponsesCombo.appendChild(ligne);
    }

    ligne.querySelector(".texteReponseCombo").textContent =
        donnees.reponse;
    
    ajouterBoutonsCorrectionCombo(
        ligne,
        donnees.nomEquipe,
        donnees.numero
    ); 
});

socket.on("combo-reponses-correction", (donnees) => {

    // Afficher le panneau de correction
    correctionCombo.style.display = "block";

    // Effacer les éventuelles anciennes réponses
    listeReponsesCombo.innerHTML = "";

    // Mettre à jour le statut
    statusComboAnimateur.textContent =
        "Correction du morceau " + donnees.numero;

    // Afficher chaque équipe et sa réponse
    for (const equipe of donnees.reponses) {

        const ligne = document.createElement("div");
        ligne.dataset.equipe = equipe.nomEquipe;

        const nom = document.createElement("h4");
        nom.textContent = equipe.nomEquipe;

        const reponse = document.createElement("p");
        reponse.className = "texteReponseCombo";
        reponse.textContent =
            equipe.reponse || "Aucune réponse";

        ligne.appendChild(nom);
        ligne.appendChild(reponse);

        ajouterBoutonsCorrectionCombo(
            ligne,
            equipe.nomEquipe,
            donnees.numero
        );

        listeReponsesCombo.appendChild(ligne);
    }
});

function ajouterBoutonsCorrectionCombo(ligne, nomEquipe, numero) {

    // Éviter de créer plusieurs fois les boutons
    if (ligne.querySelector(".boutonsCorrectionCombo")) {
        return;
    }
    const conteneur = document.createElement("div");
    conteneur.className = "boutonsCorrectionCombo";

    for (const points of [0, 1, 2]) {
        const bouton = document.createElement("button");
        bouton.type = "button";
        bouton.textContent = `${points} pt${points > 1 ? "s" : ""}`;
        bouton.addEventListener("click", () => {
            socket.emit("combo-corriger", {
                nomEquipe,
                numero,
                points
            });

        });
        conteneur.appendChild(bouton);
    }
    ligne.appendChild(conteneur);
}

function afficherEquipes() {
    equipesDisplay.innerHTML = "";

    for (let i = 0; i < listeEquipes.length; i++) {
        const equipe = listeEquipes[i];

        const ligne = document.createElement("p");

        const infos = document.createElement("span");
        infos.textContent =
            equipe.nom +
            " : " +
            equipe.score +
            " point(s) - " +
            (equipe.connectee ? "connectée" : "déconnectée");

        const boutonPlus = document.createElement("button");
        boutonPlus.textContent = "+1";
        boutonPlus.addEventListener("click", () => {
            socket.emit("modifier-score", {
                nomEquipe: equipe.nom,
                modification: 1
            });
        });

        const boutonMoins = document.createElement("button");
        boutonMoins.textContent = "−1";
        boutonMoins.addEventListener("click", () => {
            socket.emit("modifier-score", {
                nomEquipe: equipe.nom,
                modification: -1
            });
        });

        ligne.appendChild(infos);
        ligne.appendChild(boutonPlus);
        ligne.appendChild(boutonMoins);

        equipesDisplay.appendChild(ligne);
    }
}