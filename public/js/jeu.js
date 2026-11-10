const status = document.getElementById("status");
const equipesDisplay = document.getElementById("equipesDisplay");
const nouvellePartie = document.getElementById("nouvellePartie");
const stop = document.getElementById("stop");
const enonce = document.getElementById("question");
const propositions = document.getElementById("propositions");
const chrono = document.getElementById("chrono");
const numeroQuestion = document.getElementById("numeroQuestion");
const zoneFin = document.getElementById("zoneFin");
const classement = document.getElementById("classement");


let partieEnCours = false;
let indiceQuestion = 0;
let tempsRestant = 30;
let maitreDuTemps;
let premiereEquipe = null;


const equipes = [
    {
        nom: "Acabra",
        score: 0,
        active: true,
        aRepondu: false
    },
    {
        nom: "Grumpies",
        score: 0,
        active: true,
        aRepondu: false
    }
];


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


function afficherEquipe(indiceEquipe) {

    const equipe = equipes[indiceEquipe];

    const ligneEquipe = document.createElement("p");

    ligneEquipe.textContent =
        equipe.nom + " : " + equipe.score + " point(s)";

    equipesDisplay.appendChild(ligneEquipe);
}


function afficherToutesLesEquipes() {

    equipesDisplay.innerHTML = "";

    for (let i = 0; i < equipes.length; i++) {
        afficherEquipe(i);
    }
}


function reinitialiserScores() {

    for (let i = 0; i < equipes.length; i++) {
        equipes[i].score = 0;
    }

    afficherToutesLesEquipes();
}


function ajouterPoint(indiceEquipe) {

    if (equipes[indiceEquipe].active) {
        equipes[indiceEquipe].score++;
    }

    afficherToutesLesEquipes();
}


function ajouterPointRapidite(indiceEquipe) {

    equipes[indiceEquipe].score++;

    afficherToutesLesEquipes();
}


function reinitialiserReponses() {

    premiereEquipe = null;

    for (let i = 0; i < equipes.length; i++) {
        equipes[i].aRepondu = false;
    }
}


function toutesLesEquipesOntRepondu() {

    for (let i = 0; i < equipes.length; i++) {

        if (!equipes[i].aRepondu) {
            return false;
        }

    }

    return true;
}


function creerQuestionPourEquipe(indiceEquipe, questionActuelle) {

    const equipe = equipes[indiceEquipe];

    const conteneurEquipe = document.createElement("div");

    const titreEquipe = document.createElement("h2");

    titreEquipe.textContent = equipe.nom;

    conteneurEquipe.appendChild(titreEquipe);

    propositions.appendChild(conteneurEquipe);


    for (let i = 0; i < questionActuelle.reponses.length; i++) {

        const boutonReponse = document.createElement("button");

        boutonReponse.textContent =
            questionActuelle.reponses[i];

        conteneurEquipe.appendChild(boutonReponse);


        boutonReponse.addEventListener("click", () => {

            if (equipe.aRepondu) {
                return;
            }


            if (
                i === questionActuelle.bonneReponse
            ) {

                ajouterPoint(indiceEquipe);


                if (premiereEquipe === null) {

                    premiereEquipe = indiceEquipe;

                    ajouterPointRapidite(indiceEquipe);

                }

            }


            equipe.aRepondu = true;


            for (
                let j = 0;
                j < conteneurEquipe.children.length;
                j++
            ) {

                conteneurEquipe.children[j].disabled = true;

            }


            if (toutesLesEquipesOntRepondu()) {

                nouvelleQuestion();

            }

        });

    }

}


function demarrerChrono() {

    clearInterval(maitreDuTemps);

    tempsRestant = 30;

    chrono.textContent = tempsRestant;


    maitreDuTemps = setInterval(() => {

        tempsRestant--;

        chrono.textContent = tempsRestant;


        if (tempsRestant === 0) {

            clearInterval(maitreDuTemps);


            for (let i = 0; i < equipes.length; i++) {

                equipes[i].aRepondu = true;

            }


            nouvelleQuestion();

        }

    }, 1000);

}


function nouvelleQuestion() {

    if (indiceQuestion < questions.length) {

        reinitialiserReponses();

        propositions.innerHTML = "";

        numeroQuestion.textContent =
            "Question " +
            (indiceQuestion + 1) +
            " / " +
            questions.length;

        enonce.textContent =
            questions[indiceQuestion].texte;


        for (let i = 0; i < equipes.length; i++) {

            creerQuestionPourEquipe(
                i,
                questions[indiceQuestion]
            );

        }


        indiceQuestion++;

        demarrerChrono();

    }

    else {

        terminerPartie();

    }

}


function afficherClassement() {

    classement.innerHTML = "";

    const equipesClassees = [...equipes];

    equipesClassees.sort(
        (a, b) => b.score - a.score
    );


    for (let i = 0; i < equipesClassees.length; i++) {

        const ligne = document.createElement("p");

        ligne.textContent =
            (i + 1) +
            " - " +
            equipesClassees[i].nom +
            " : " +
            equipesClassees[i].score +
            " point(s)";

        classement.appendChild(ligne);

    }

}


function demarrerPartie() {

    if (partieEnCours) {

        const confirmation =
            confirm("Es-tu sûr de vouloir recommencer ?");

        if (!confirmation) {
            return;
        }

    }


    clearInterval(maitreDuTemps);

    indiceQuestion = 0;

    reinitialiserScores();

    reinitialiserReponses();

    partieEnCours = true;

    status.textContent = "La partie est en cours !";

    nouvellePartie.style.display = "none";

    stop.style.display = "block";

    zoneFin.style.display = "none";

    nouvelleQuestion();

}


function terminerPartie() {

    clearInterval(maitreDuTemps);

    partieEnCours = false;

    nouvellePartie.style.display = "block";

    stop.style.display = "none";

    status.textContent = "La partie est terminée !";

    chrono.textContent = "—";

    propositions.innerHTML = "";

    enonce.textContent = "";

    numeroQuestion.textContent = "";

    zoneFin.style.display = "block";

    afficherClassement();

}


nouvellePartie.addEventListener(
    "click",
    demarrerPartie
);


stop.addEventListener(
    "click",
    terminerPartie
);


stop.style.display = "none";

chrono.textContent = "—";

afficherToutesLesEquipes();