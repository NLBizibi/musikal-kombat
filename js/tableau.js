const socket = io();

const mancheEcran =
    document.getElementById("mancheEcran");
const progressionEcran =
    document.getElementById("progressionEcran");
const questionEcran =
    document.getElementById("questionEcran");
const reponsesEcran =
    document.getElementById("reponsesEcran");
const chronoEcran =
    document.getElementById("chronoEcran");
const zoneQCM =
    document.getElementById("zoneQCM");
const zoneClassement =
    document.getElementById("zoneClassement");
const classementEcran =
    document.getElementById("classementEcran");
const etapeQcm =
    document.getElementById("etapeQcm");
const etapeSprint =
    document.getElementById("etapeSprint");
const etapeCombo =
    document.getElementById("etapeCombo");
const etapeUppercut =
    document.getElementById("etapeUppercut");

let scoresEquipes = {};

function afficherClassement() {
    classementEcran.innerHTML = "";

    const classement =
        Object.entries(scoresEquipes)
            .sort((a, b) => b[1].score - a[1].score);

    for (let i = 0; i < classement.length; i++) {
        const [nomEquipe, equipe] = classement[i];
        const ligne = document.createElement("p");

        ligne.textContent = (i + 1) + ". " + nomEquipe + " — " + equipe.score + " point(s)";
        classementEcran.appendChild(ligne);
    }
}

function afficherProgressionPartie(manche) {
    const etapes = [
        {
            nom: "qcm",
            element: etapeQcm,
            texte: "QCM"
        },
        {
            nom: "sprint",
            element: etapeSprint,
            texte: "SPRINT"
        },
        {
            nom: "combo",
            element: etapeCombo,
            texte: "COMBO"
        },
        {
            nom: "uppercut",
            element: etapeUppercut,
            texte: "UPPERCUT"
        }
    ];

    const indiceActuel =
        etapes.findIndex(
            (etape) => etape.nom === manche
        );

    for (let i = 0; i < etapes.length; i++) {
        if (i < indiceActuel) {
            etapes[i].element.textContent =
                etapes[i].texte + " ✓";
        } else if (i === indiceActuel) {
            etapes[i].element.textContent =
                etapes[i].texte + " ●";
        } else {
            etapes[i].element.textContent =
                etapes[i].texte + " ○";
        }
    }
}

socket.on("manche-changee", (manche) => {
    mancheEcran.textContent =
        "Manche : " + manche.toUpperCase();

    afficherProgressionPartie(manche);
});

socket.on("nouvelle-question", (question) => {
    questionEcran.textContent =
        question.question;

    progressionEcran.textContent =
        "Question " +
        question.numero +
        " / " +
        question.total;

    reponsesEcran.innerHTML = "";

    for (let i = 0; i < question.reponses.length; i++) {
        const reponse =
            document.createElement("p");

        reponse.textContent =
            String.fromCharCode(65 + i) +
            " — " +
            question.reponses[i];

        reponsesEcran.appendChild(reponse);
    }
});

socket.on("chrono", (temps) => {
    chronoEcran.textContent =
        "⏱ " + temps;
});

socket.on("manche-terminee", (manche) => {
    questionEcran.textContent =
        "Manche " +
        manche.toUpperCase() +
        " terminée !";

    reponsesEcran.innerHTML = "";
    chronoEcran.textContent = "";
});

socket.on("scores", (equipes) => {
    scoresEquipes = equipes;
});

socket.on("affichage-classement", (afficher) => {
    if (afficher) {
        zoneQCM.hidden = true;
        zoneClassement.hidden = false;

        afficherClassement();
    } else {
        zoneClassement.hidden = true;
        zoneQCM.hidden = false;
    }
});