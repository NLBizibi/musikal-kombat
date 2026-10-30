const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const {
    enregistrerReponse,
    enregistrerCorrection,
    reponsesCombo,
    correctionsCombo,
    calculerScoreFinalCombo
} = require("./modules/combo");

const app = express();
const serveur = http.createServer(app);
const io = new Server(serveur);

app.use(express.static("."));

const questions = [
    {
        texte: "Quel groupe interprète ce morceau ?",
        reponses: ["Téléphone", "Indochine", "Noir Désir", "Trust"],
        bonneReponse: 1
    },
    {
        texte: "Quelle artiste interprète ce morceau ?",
        reponses: ["Christina Aguilera", "P!nk", "Britney Spears", "Kylie Minogue"],
        bonneReponse: 2
    },
    {
        texte: "Quel artiste interprète ce morceau ?",
        reponses: ["Daniel Powter", "James Blunt", "Gavin DeGraw", "Andreas Johnson"],
        bonneReponse: 3
    },
    {
        texte: "Quel groupe interprète ce morceau ?",
        reponses: ["Earth, Wind & Fire", "Kool & The Gang", "Chic", "The Commodores"],
        bonneReponse: 0
    },
    {
        texte: "Quelle artiste interprète ce morceau ?",
        reponses: ["Lara Fabian", "Céline Dion", "Isabelle Boulay", "Natasha St-Pier"],
        bonneReponse: 1
    },
    {
        texte: "Quel groupe interprète ce morceau ?",
        reponses: ["Modjo", "Cassius", "Daft Punk", "Justice"],
        bonneReponse: 2
    },
    {
        texte: "Quel groupe interprète ce morceau ?",
        reponses: ["Téléphone", "Indochine", "Les Rita Mitsouko", "Noir Désir"],
        bonneReponse: 0
    },
    {
        texte: "Quel groupe interprète ce morceau ?",
        reponses: ["The Human League", "Tears for Fears", "Orchestral Manoeuvres in the Dark", "The Buggles"],
        bonneReponse: 3
    },
    {
        texte: "Quel groupe interprète ce morceau ?",
        reponses: ["Début de Soirée", "Images", "Gold", "Partenaire Particulier"],
        bonneReponse: 1
    },
    {
        texte: "Quelle artiste interprète ce morceau ?",
        reponses: ["Ava Max", "Bebe Rexha", "Dua Lipa", "Zara Larsson"],
        bonneReponse: 2
    }
];

const morceauxSprint = [
    {
        titre: "Ce rêve bleu",
        film: "Aladdin",
        source: "audio/sprint/sprint1.mp3"
    },
    {
        titre: "De zéro en héros",
        film: "Hercule",
        source: "audio/sprint/sprint2.mp3"
    },
    {
        titre: "Un homme libre",
        film: "La Planète au trésor",
        source: "audio/sprint/sprint3.mp3"
    },
    {
        titre: "Comme un homme",
        film: "Mulan",
        source: "audio/sprint/sprint4.mp3"
    },
    {
        titre: "Hakuna Matata",
        film: "Le Roi Lion",
        source: "audio/sprint/sprint5.mp3"
    }
];

const equipes = {};

let indiceQuestion = 0;
let partieEnCours = false;
let questionEnCours = false;
let chrono = null;
let tempsRestant = 30;
let premiereBonneReponse = null;
let equipeBuzzee = null;
let equipesElimineesSprint = [];
let morceauSprint = null;
let questionPrete = false;
const nombreMorceauxSprint = morceauxSprint.length;

// État de la manche Combo
const nombreMorceauxCombo = 10;
let morceauCombo = 0;
let chronoCombo = null;
let tempsRestantCombo = 45;
let reponsesOuvertesCombo = false;
let morceauComboDemarre = false;

// Manche actuellement jouée
let mancheActuelle = "qcm";

const ordreManches = [
    "qcm",
    "sprint",
    "combo",
    "uppercut"
];

function envoyerMorceauSprintAnimateur() {
    const morceau = morceauxSprint[morceauSprint - 1];

    console.log("Morceau Sprint envoyé :", morceau);

    io.emit("morceau-sprint-animateur", {
        numero: morceauSprint,
        total: nombreMorceauxSprint,
        titre: morceau.titre,
        artiste: morceau.artiste,
        audio: morceau.source
    });
}

function morceauSuivantSprint() {
    morceauSprint++;
    if (morceauSprint > nombreMorceauxSprint) {
        terminerManche();
        return;
    }

    equipeBuzzee = null;
    equipesElimineesSprint = [];

    console.log("Sprint - morceau " + morceauSprint + " / " + nombreMorceauxSprint); 

    io.emit("nouveau-morceau-sprint", {
        numero: morceauSprint,
        total: nombreMorceauxSprint
    });
    envoyerMorceauSprintAnimateur();
}

function passerMancheSuivante() {

    const indiceManche =
        ordreManches.indexOf(mancheActuelle);

    if (indiceManche === -1) {
        return;
    }

    if (indiceManche >= ordreManches.length - 1) {
        console.log("Dernière manche atteinte.");
        return;
    }

    mancheActuelle =
        ordreManches[indiceManche + 1];

    console.log(
        "Passage à la manche :",
        mancheActuelle
    );

    equipeBuzzee = null;
    if (mancheActuelle === "sprint") {
        morceauSprint = 1;
        equipesElimineesSprint = [];

        io.emit("nouveau-morceau-sprint", {
            numero: morceauSprint,
            total: nombreMorceauxSprint
        });

        envoyerMorceauSprintAnimateur();
    }

    io.emit("manche-changee", mancheActuelle);

    if (mancheActuelle === "combo") {
        morceauCombo = 1;
        preparerMorceauCombo();
    }
}

io.on("connection", (socket) => {
    console.log("Un appareil vient de se connecter");
    socket.emit(
        "liste-equipes",
        creerListeEquipes()
    );
    socket.on("passer-manche-suivante", () => {

        if (!partieEnCours) {
        return;
        }

        passerMancheSuivante();
    });

    socket.on("inscription-equipe", (nomEquipe) => {

        if (typeof nomEquipe !== "string") {
            socket.emit(
                "inscription-refusee",
                "Nom d'équipe invalide."
            );

            return;
        }

        nomEquipe = nomEquipe.trim();

        if (partieEnCours) {

            if (!equipes[nomEquipe]) {

                socket.emit(
                    "inscription-refusee",
                    "La partie a déjà commencé."
                );

                return;
            }

            if (
                equipes[nomEquipe].connectee &&
                equipes[nomEquipe].socketId !== socket.id
            ) {

                socket.emit(
                    "inscription-refusee",
                    "Ce nom d'équipe est déjà connecté."
                );

                return;
            }
        }

        if (nomEquipe.length < 2) {
            socket.emit(
                "inscription-refusee",
                "Le nom doit contenir au moins 2 caractères."
            );

            return;
        }   

        if (nomEquipe.length > 20) {
            socket.emit(
                "inscription-refusee",
                "Le nom doit contenir au maximum 20 caractères."
            );

            return;
        }

        if (
            equipes[nomEquipe] &&
            equipes[nomEquipe].socketId !== null &&
            equipes[nomEquipe].socketId !== socket.id
        ) {
            socket.emit(
                "inscription-refusee",
                "Ce nom d'équipe est déjà utilisé."
            );

            return;
        }

        socket.nomEquipe = nomEquipe;

        if (!equipes[nomEquipe]) {

            equipes[nomEquipe] = {
                score: 0,
                aRepondu: false,
                socketId: socket.id,
                connectee: true
            };

        } 
        else {

            equipes[nomEquipe].socketId = socket.id;
            equipes[nomEquipe].connectee = true;

            // Si la reconnexion a lieu pendant une question,
            // l'équipe reprendra à la question suivante.
            if (partieEnCours && mancheActuelle === "qcm") {
                if (questionEnCours && questionPrete) {
                    // La question est préparée, mais pas encore lancée.
                    equipes[nomEquipe].aRepondu = false;
                } else {
                    // On conserve la règle actuelle pour les autres situations.
                    equipes[nomEquipe].aRepondu = true;
                }
            }
        }

        socket.emit("inscription-validee", {
            nom: nomEquipe,
            score: equipes[nomEquipe].score,
            partieEnCours: partieEnCours,
            manche: mancheActuelle
        });

        if (partieEnCours && mancheActuelle === "qcm" && questionEnCours) {
            const question = questions[indiceQuestion];

            socket.emit("nouvelle-question", {
                manche: mancheActuelle,
                numero: indiceQuestion + 1,
                total: questions.length,
                texte: question.texte,
                reponses: question.reponses
            });

            socket.emit("chrono", tempsRestant);
        }

        io.emit(
            "liste-equipes",
            creerListeEquipes()
        );

        console.log(
            nomEquipe +
            " est inscrit(e)"
        );
    });

    socket.on("demarrer-partie", () => {
        mancheActuelle = "qcm";
        console.log("La partie est lancée par l'animateur");
        equipeBuzzee = null;

        clearInterval(chrono);

        indiceQuestion = 0;
        partieEnCours = true;

        for (const nomEquipe in equipes) {
            equipes[nomEquipe].score = 0;
            equipes[nomEquipe].aRepondu = false;
        }

        io.emit("partie-demarree");
        io.emit("manche-changee", mancheActuelle);
        io.emit("scores", equipes);

        envoyerQuestion();
    });

    socket.on("affichage-classement", (afficher) => {
        io.emit("affichage-classement", afficher);
    });

    socket.on("test-sprint", () => {
        console.log("MODE TEST : démarrage direct du Sprint");

        clearInterval(chrono);

        partieEnCours = true;
        mancheActuelle = "sprint";
        morceauSprint = 1;
        equipeBuzzee = null;
        equipesElimineesSprint = [];

        io.emit("partie-demarree");
        io.emit("manche-changee", mancheActuelle);
        io.emit("scores", equipes);

        io.emit("nouveau-morceau-sprint", {
            numero: morceauSprint,
            total: nombreMorceauxSprint
        });
        envoyerMorceauSprintAnimateur();
    });

    socket.on("test-combo", () => {
        console.log("🧪 Test direct du Combo");

        clearInterval(chrono);
        clearInterval(chronoCombo);

        partieEnCours = true;
        mancheActuelle = "combo";

        morceauCombo = 1;
        tempsRestantCombo = 45;
        reponsesOuvertesCombo = false;
        morceauComboDemarre = false;

        // Réinitialiser les réponses et corrections Combo
        for (const equipeId of Object.keys(reponsesCombo)) {
            delete reponsesCombo[equipeId];
        }

        for (const equipeId of Object.keys(correctionsCombo)) {
            delete correctionsCombo[equipeId];
        }

        io.emit("manche-changee", mancheActuelle);

        preparerMorceauCombo();
    });

    socket.on("reponse-equipe", (reponse) => {
        const nomEquipe = socket.nomEquipe;
        if (!partieEnCours || mancheActuelle !== "qcm" ||!questionEnCours || questionPrete) {
            return;
        }
        if (!nomEquipe || !equipes[nomEquipe]) {
            return;
        }
        if (equipes[nomEquipe].aRepondu) {
            return;
        }
        equipes[nomEquipe].aRepondu = true;
        const questionActuelle = questions[indiceQuestion];
        const bonneReponse = reponse === questionActuelle.bonneReponse;

        if (bonneReponse) {
            equipes[nomEquipe].score++;
            if (premiereBonneReponse === null) {
                premiereBonneReponse = nomEquipe;
                equipes[nomEquipe].score++;

                console.log(
                    nomEquipe +
                    " gagne le point de rapidité !"
                );
            }
        }
        socket.emit("resultat-reponse", {
            bonne: bonneReponse
        });

        io.emit("scores", equipes);
        console.log(nomEquipe + " a répondu " + (reponse + 1) + " : " + (bonneReponse ? "CORRECT" : "INCORRECT"));

        if (toutesLesEquipesOntRepondu()) {
            clearInterval(chrono);
            questionSuivante();
        }
    });

    socket.on("question-suivante-qcm", () => {
        if (!partieEnCours || mancheActuelle !== "qcm") {
            return;
        }

        if (!questionEnCours && indiceQuestion < questions.length) {
            envoyerQuestion();
        }
    });

    socket.on("demarrer-question-qcm", () => {
        console.log("Demande de démarrage QCM reçue");

        if (!partieEnCours || mancheActuelle !== "qcm") {
            return;
        }

        demarrerChronoQcm();
    });

    socket.on("modifier-score", (donnees) => {
        const nomEquipe = donnees.nomEquipe;
        const modification = donnees.modification;

        if (!equipes[nomEquipe]) {
            return;
        }
        if (modification !== 1 && modification !== -1) {
            return;
        }
        equipes[nomEquipe].score += modification;

        console.log(
            "Score manuel :",
            nomEquipe,
            modification > 0 ? "+1" : "-1",
            "→",
            equipes[nomEquipe].score
        );
        io.emit("scores", equipes);
    });

    socket.on("buzzer", () => {
        if (!partieEnCours || mancheActuelle !== "sprint") {
            return;
        }
        if (!socket.nomEquipe || equipeBuzzee !== null) {
            return;
        }
        if (equipesElimineesSprint.includes(socket.nomEquipe)) {
            return;
        }

        equipeBuzzee = socket.nomEquipe;
        console.log("BUZZ !", equipeBuzzee);
        io.emit("buzzer-gagnant", equipeBuzzee);
    });

    socket.on("validation-sprint", (bonneReponse) => {
        if (!partieEnCours || mancheActuelle !== "sprint") {
            return;
        }
        if (equipeBuzzee === null) {
            return;
        }
        const nomEquipe = equipeBuzzee;
        if (bonneReponse === true) {
            equipes[nomEquipe].score++;
            console.log(
                nomEquipe + " gagne 1 point au Sprint"
            );
            io.emit("scores", equipes);
            morceauSuivantSprint();
        } 
        else {
            equipesElimineesSprint.push(nomEquipe);
            console.log(nomEquipe + " est éliminée pour ce morceau");
            equipeBuzzee = null;

            const equipesConnectees = Object.keys(equipes).filter(
            (nom) => equipes[nom].connectee);

            const toutesEliminees = equipesConnectees.every(
                (nom) => equipesElimineesSprint.includes(nom)
            );

            if (toutesEliminees) {
                console.log(
                    "Toutes les équipes sont éliminées : aucun point."
                );

                morceauSuivantSprint();
            } 
            else {
                io.emit(
                    "buzzer-rearme",
                    equipesElimineesSprint
                );
            }          
        }
    });

    socket.on("sprint-personne-ne-trouve", () => {
        if (!partieEnCours || mancheActuelle !== "sprint") {
            return;
        }
        if (equipeBuzzee !== null) {
            return;
        }
        console.log(
            "Personne ne trouve : passage au morceau suivant"
        );
        morceauSuivantSprint();
    });

    socket.on("demarrer-morceau-combo", () => {
        demarrerChronoCombo();
    });

    socket.on("combo-reponse", (reponse) => {
        // Vérifier que le Combo est actif
        if (!partieEnCours || mancheActuelle !== "combo") {
            return;
        }

        // Vérifier que les réponses sont ouvertes
        if (!reponsesOuvertesCombo) {
            return;
        }

        // Vérifier l'identité de l'équipe
        const nomEquipe = socket.nomEquipe;
        if (!nomEquipe || !equipes[nomEquipe] || equipes[nomEquipe].socketId !== socket.id) {
            return;
        }

        // Vérifier que la réponse est une chaîne
        if (typeof reponse !== "string") {
            return;
        }

        // Nettoyer la réponse
        const texte = reponse.trim().slice(0, 300);

        if (texte.length === 0) {
            return;
        }

        // Enregistrer la réponse
        enregistrerReponse(nomEquipe, morceauCombo, texte);

        console.log(
            "Combo : réponse enregistrée",
            nomEquipe,
            "morceau",
            morceauCombo
        );

        // Confirmer la réception
        socket.emit("combo-reponse-enregistree", {
            numero: morceauCombo
        });
    });

    socket.on("disconnect", () => {
        if (socket.nomEquipe && equipes[socket.nomEquipe] && equipes[socket.nomEquipe].socketId === socket.id) {
            equipes[socket.nomEquipe].socketId =null;
            equipes[socket.nomEquipe].connectee =false;
            // Une équipe déconnectée ne doit pas
            // empêcher la progression du jeu.
            if (partieEnCours && mancheActuelle === "qcm" && questionEnCours) {
                equipes[socket.nomEquipe].aRepondu =true;
                if (toutesLesEquipesOntRepondu()) {
                    clearInterval(chrono);
                    questionSuivante();
                }
            }
            io.emit("liste-equipes", creerListeEquipes());

            console.log(socket.nomEquipe +" s'est déconnecté");
        } 
        else {
            console.log("Un appareil vient de se déconnecter");
        }
    });
});

function envoyerQuestion() {
    if (indiceQuestion >= questions.length) {
        terminerManche();
        return;
    }
    questionEnCours = true;
    questionPrete = true;
    premiereBonneReponse = null;

    for (const nomEquipe in equipes) {
        equipes[nomEquipe].aRepondu = false;
    }

    

    tempsRestant = 30;

    const question = questions[indiceQuestion];

    io.emit("nouvelle-question", {
        manche: mancheActuelle,
        numero: indiceQuestion + 1,
        total: questions.length,
        texte: question.texte,
        reponses: question.reponses
    });

    io.emit("chrono", tempsRestant);
    clearInterval(chrono);

    console.log(
        "Question " +
        (indiceQuestion + 1) +
        " envoyée"
    );
}

function demarrerChronoQcm() {
    if (!questionPrete || !questionEnCours) {
        return;
    }

    questionPrete = false;
    io.emit("qcm-question-demarree");

    clearInterval(chrono);

    chrono = setInterval(() => {
        tempsRestant--;
        io.emit("chrono", tempsRestant);

        if (tempsRestant <= 0) {
            clearInterval(chrono);

            for (const nomEquipe in equipes) {
                equipes[nomEquipe].aRepondu = true;
            }

            io.emit("temps-ecoule");
            questionSuivante();
        }
    }, 1000);
}

function preparerMorceauCombo() {

    if (!partieEnCours || mancheActuelle !== "combo") {
        return;
    }

    if (morceauCombo < 1 || morceauCombo > nombreMorceauxCombo) {
        return;
    }

    // Aucun chronomètre ne doit rester actif
    clearInterval(chronoCombo);
    chronoCombo = null;

    tempsRestantCombo = 45;
    reponsesOuvertesCombo = false;
    morceauComboDemarre = false;

    console.log(
        "Combo : préparation du morceau",
        morceauCombo,
        "/",
        nombreMorceauxCombo
    );

    // Informer les interfaces qu'un morceau est prêt
    io.emit("combo-morceau-prepare", {
        numero: morceauCombo,
        total: nombreMorceauxCombo,
        temps: tempsRestantCombo
    });
}

function demarrerChronoCombo() {
    if (!partieEnCours || mancheActuelle !== "combo") {
        return;
    }

    if (morceauComboDemarre || reponsesOuvertesCombo) {
        return;
    }

    if (morceauCombo < 1 || morceauCombo > nombreMorceauxCombo) {
        return;
    }

    morceauComboDemarre = true;
    reponsesOuvertesCombo = true;
    tempsRestantCombo = 45;

    console.log("Combo : lancement du morceau", morceauCombo);

    io.emit("combo-demarre", {
        numero: morceauCombo,
        temps: tempsRestantCombo
    });

    clearInterval(chronoCombo);

    chronoCombo = setInterval(() => {
        tempsRestantCombo--;
        io.emit("combo-chrono", tempsRestantCombo);

        if (tempsRestantCombo <= 0) {
            clearInterval(chronoCombo);
            chronoCombo = null;
            reponsesOuvertesCombo = false;
            console.log(
                "Combo : fin du temps pour le morceau",
                morceauCombo
            );
            io.emit("combo-temps-ecoule", {
                numero: morceauCombo
            });
        }
    }, 1000);
}

function toutesLesEquipesOntRepondu() {
    const noms = Object.keys(equipes);
    if (noms.length === 0) {
        return false;
    }
    for (let i = 0; i < noms.length; i++) {
        if (!equipes[noms[i]].aRepondu) {
            return false;
        }
    }
    return true;
}

function questionSuivante() {
    if (!questionEnCours) {
        return;
    }

    questionEnCours = false;
    indiceQuestion++;

    if (indiceQuestion >= questions.length) {
        terminerManche();
        return;
    }

    console.log(
        "Question terminée. En attente de l'animateur."
    );

    io.emit("qcm-attente-question-suivante");
}

function terminerPartie() {
    clearInterval(chrono);
    partieEnCours = false;
    io.emit("partie-terminee");
    io.emit("scores", equipes);
    console.log("La partie est terminée");
}

function terminerManche() {
    clearInterval(chrono);
    io.emit("manche-terminee", mancheActuelle);
    console.log(
        "Manche terminée :",
        mancheActuelle
    );
}

function creerListeEquipes() {
    const liste = [];
    for (const nomEquipe in equipes) {
        liste.push({
            nom: nomEquipe,
            score: equipes[nomEquipe].score,
            connectee: equipes[nomEquipe].connectee
        });
    }
    return liste;
}

serveur.listen(3000, () => {
    console.log("Musikal Kombat est lancé !");
    console.log("http://localhost:3000");
});