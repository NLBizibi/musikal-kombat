const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const serveur = http.createServer(app);
const io = new Server(serveur);

app.use(express.static("."));

const questions = [
    {
        texte: "Qui a interprété Encore un matin ?",
        reponses: [
            "Jean-Pierre Mader",
            "Jean-Jacques Goldman",
            "Daniel Balavoine",
            "Johnny Hallyday"
        ],
        bonneReponse: 1
    },
    {
        texte: "Qui a chanté Gigi l'Amoroso ?",
        reponses: [
            "Michèle Torr",
            "Mireille Mathieu",
            "Dalida",
            "France Gall"
        ],
        bonneReponse: 2
    },
    {
        texte: "Qui chante La Bohème ?",
        reponses: [
            "Charles Aznavour",
            "Georges Brassens",
            "Serge Gainsbourg",
            "Jacques Brel"
        ],
        bonneReponse: 0
    },
    {
        texte: "Quel groupe a chanté L'Aventurier ?",
        reponses: [
            "Téléphone",
            "Indochine",
            "Gold",
            "Partenaire Particulier"
        ],
        bonneReponse: 1
    },
    {
        texte: "Qui chante Je te donne ?",
        reponses: [
            "Jean-Jacques Goldman",
            "Francis Cabrel",
            "Michel Berger",
            "Renaud"
        ],
        bonneReponse: 0
    },
    {
        texte: "Qui a chanté Comme d'habitude ?",
        reponses: [
            "Claude François",
            "Joe Dassin",
            "Michel Sardou",
            "Alain Barrière"
        ],
        bonneReponse: 0
    },
    {
        texte: "Quel groupe chante Le vent nous portera ?",
        reponses: [
            "Noir Désir",
            "Louise Attaque",
            "Mano Negra",
            "Indochine"
        ],
        bonneReponse: 0
    },
    {
        texte: "Qui chante Alexandrie Alexandra ?",
        reponses: [
            "Claude François",
            "Patrick Juvet",
            "Daniel Balavoine",
            "Michel Delpech"
        ],
        bonneReponse: 0
    },
    {
        texte: "Qui interprète Mistral gagnant ?",
        reponses: [
            "Renaud",
            "Francis Cabrel",
            "Alain Souchon",
            "Maxime Le Forestier"
        ],
        bonneReponse: 0
    },
    {
        texte: "Qui chante Pour que tu m'aimes encore ?",
        reponses: [
            "Patricia Kaas",
            "Céline Dion",
            "Lara Fabian",
            "Julie Zenatti"
        ],
        bonneReponse: 1
    }
];

const equipes = {};

let indiceQuestion = 0;
let partieEnCours = false;
let chrono = null;
let tempsRestant = 30;
let premiereBonneReponse = null;

io.on("connection", (socket) => {
    console.log("Un appareil vient de se connecter");
    socket.emit(
        "liste-equipes",
        creerListeEquipes()
    );

socket.on("inscription-equipe", (nomEquipe) => {

    if (partieEnCours) {
        socket.emit(
            "inscription-refusee",
            "La partie a déjà commencé."
        );

        return;
    }

    if (typeof nomEquipe !== "string") {
        socket.emit(
            "inscription-refusee",
            "Nom d'équipe invalide."
        );

        return;
    }

    nomEquipe = nomEquipe.trim();

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

        equipes[nomEquipe].socketId =
            socket.id;

        equipes[nomEquipe].connectee =
            true;
    }

    socket.emit("inscription-validee", {
        nom: nomEquipe,
        score: equipes[nomEquipe].score
    });

    console.log(
    "Liste envoyée à l'animateur :",
    creerListeEquipes()
    );

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
        console.log("La partie est lancée par l'animateur");

        clearInterval(chrono);

        indiceQuestion = 0;
        partieEnCours = true;

        for (const nomEquipe in equipes) {
            equipes[nomEquipe].score = 0;
            equipes[nomEquipe].aRepondu = false;
        }

        io.emit("partie-demarree");
        io.emit("scores", equipes);

        envoyerQuestion();
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

        const questionActuelle =
            questions[indiceQuestion];

        const bonneReponse =
            reponse === questionActuelle.bonneReponse;

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

        console.log(
            nomEquipe +
            " a répondu " +
            (reponse + 1) +
            " : " +
            (bonneReponse ? "CORRECT" : "INCORRECT")
        );

        if (toutesLesEquipesOntRepondu()) {
            clearInterval(chrono);
            questionSuivante();
        }
    });

    socket.on("disconnect", () => {

    if (
        socket.nomEquipe &&
        equipes[socket.nomEquipe] &&
        equipes[socket.nomEquipe].socketId === socket.id
    ) {
        equipes[socket.nomEquipe].socketId =
            null;

        equipes[socket.nomEquipe].connectee =
            false;

        io.emit(
            "liste-equipes",
            creerListeEquipes()
        );

        console.log(
            socket.nomEquipe +
            " s'est déconnecté"
        );

    } else {

        console.log(
            "Un appareil vient de se déconnecter"
        );
    }
    });
});

function envoyerQuestion() {
    if (indiceQuestion >= questions.length) {
        terminerPartie();
        return;
    }
    premiereBonneReponse = null;

    for (const nomEquipe in equipes) {
        equipes[nomEquipe].aRepondu = false;
    }

    tempsRestant = 30;

    const question = questions[indiceQuestion];

    io.emit("nouvelle-question", {
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
        terminerPartie();
        return;
    }

    setTimeout(() => {
        envoyerQuestion();
    }, 1000);
}

function terminerPartie() {
    clearInterval(chrono);
    partieEnCours = false;

    io.emit("partie-terminee");
    io.emit("scores", equipes);

    console.log("La partie est terminée");

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