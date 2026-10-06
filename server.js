const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const serveur = http.createServer(app);
const io = new Server(serveur);

app.use(express.static("."));

const questions = [
    {
        question: "Qui interprète cet extrait ?",
        reponses: [
            "Jeanne Mas",
            "Desireless",
            "Lio",
            "Julie Pietri"
        ],
        bonneReponse: 1
    },
    {
        question: "Quel groupe interprète cet extrait ?",
        reponses: [
            "Architects",
            "While She Sleeps",
            "LANDMVRKS",
            "Bring Me The Horizon"
        ],
        bonneReponse: 2
    },
    {
        question: "Quel groupe interprète cet extrait ?",
        reponses: [
            "Images",
            "Début de Soirée",
            "Gold",
            "Partenaire Particulier"
        ],
        bonneReponse: 0
    },
    {
        question: "Quel groupe interprète cet extrait ?",
        reponses: [
            "All Saints",
            "Destiny's Child",
            "TLC",
            "Spice Girls"
        ],
        bonneReponse: 3
    },
    {
        question: "Qui interprète cet extrait ?",
        reponses: [
            "Corona",
            "Gala",
            "Haddaway",
            "Snap!"
        ],
        bonneReponse: 1
    },
    {
        question: "Quel groupe interprète cet extrait ?",
        reponses: [
            "New Radicals",
            "The Verve",
            "Semisonic",
            "Spin Doctors"
        ],
        bonneReponse: 0
    },
    {
        question: "Quel groupe interprète cet extrait ?",
        reponses: [
            "O-Zone",
            "Aqua",
            "Eiffel 65",
            "Las Ketchup"
        ],
        bonneReponse: 0
    },
    {
        question: "Qui interprète cet extrait ?",
        reponses: [
            "Angèle",
            "Stromae",
            "Orelsan",
            "Maître Gims"
        ],
        bonneReponse: 1
    },
    {
        question: "Quel groupe interprète cet extrait ?",
        reponses: [
            "Stardust",
            "Modjo",
            "Cassius",
            "Superfunk"
        ],
        bonneReponse: 1
    },
    {
        question: "Qui interprète cet extrait ?",
        reponses: [
            "Dua Lipa",
            "Lady Gaga",
            "Katy Perry",
            "Miley Cyrus"
        ],
        bonneReponse: 3
    }
];

const morceauxSprint = [
    {
        titre: "Tu ne m'as pas laissé le temps",
        artiste: "David Hallyday",
        audio: "/audio/sprint/sprint1.mp3"
    },
    {
        titre: "Where I'm Headed",
        artiste: "Lene Marlin",
        audio: "/audio/sprint/sprint2.mp3"
    },
    {
        titre: "Mambo N. 5",
        artiste: "Lou Bega",
        audio: "/audio/sprint/sprint3.mp3"
    },
    {
        titre: "Mais qui est la Belette ?",
        artiste: "Manau",
        audio: "/audio/sprint/sprint4.mp3"
    },
    {
        titre: "Livin' la vida loca",
        artiste: "Ricky Martin",
        audio: "/audio/sprint/sprint5.mp3"
    }
];

const equipes = {};

let indiceQuestion = 0;
let partieEnCours = false;
let chrono = null;
let tempsRestant = 30;
let premiereBonneReponse = null;
let equipeBuzzee = null;
let equipesElimineesSprint = [];
let morceauSprint = null;
const nombreMorceauxSprint = morceauxSprint.length;

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

    io.emit("morceau-sprint-animateur", {
        numero: morceauSprint,
        total: nombreMorceauxSprint,
        titre: morceau.titre,
        artiste: morceau.artiste,
        audio: morceau.audio
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

        } else {

            equipes[nomEquipe].socketId = socket.id;
            equipes[nomEquipe].connectee = true;

            // Si la reconnexion a lieu pendant une question,
            // l'équipe reprendra à la question suivante.
            if (partieEnCours) {
                equipes[nomEquipe].aRepondu = true;
            }
        }

    socket.emit("inscription-validee", {
        nom: nomEquipe,
        score: equipes[nomEquipe].score,
        partieEnCours: partieEnCours,
        manche: mancheActuelle
    });

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

    socket.on("reponse-equipe", (reponse) => {
        const nomEquipe = socket.nomEquipe;
        if (!partieEnCours) {
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

        envoyerQuestion();
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

    socket.on("disconnect", () => {
        if (socket.nomEquipe && equipes[socket.nomEquipe] && equipes[socket.nomEquipe].socketId === socket.id) {
            equipes[socket.nomEquipe].socketId =null;
            equipes[socket.nomEquipe].connectee =false;
            // Une équipe déconnectée ne doit pas
            // empêcher la progression du jeu.
            if (partieEnCours) {
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

    chrono = setInterval(() => {
        tempsRestant--;
        io.emit("chrono", tempsRestant);

        if (tempsRestant === 0) {
            clearInterval(chrono);

            for (const nomEquipe in equipes) {
                equipes[nomEquipe].aRepondu = true;
            }
            io.emit("temps-ecoule");
            questionSuivante();
        }
    }, 1000);

    console.log(
        "Question " +
        (indiceQuestion + 1) +
        " envoyée"
    );
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