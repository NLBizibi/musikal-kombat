const message = document.getElementById("message");
const status = document.getElementById("status");
const equipesDisplay = document.getElementById("equipesDisplay");
const nouvellePartie = document.getElementById("nouvellePartie");
const stop = document.getElementById("stop");
const enonce = document.getElementById("question");
const propositions = document.getElementById("propositions");

let partieEnCours = false;
let indiceEquipe = 0;
let indiceQuestion = 0;

const equipeTest = {
    nom: "Acabra",
    score: 0,
    active: true,
    aRepondu: false
}
const equipe2 = {
    nom: "Grumpies",
    score: 0,
    active: true,
    aRepondu: false
}
const equipes = [equipeTest, equipe2];

const question = {
    texte: "Qui a interprété encore un matin ?",
    reponse: [   
            "Jean-Pierre Mader",
            "Jean-Jacques Goldman",
            "Daniel Balavoine",
            "Johnny Hallyday"
    ],
    bonneReponse: 1
}
const question2 = {
    texte: "Qui a chanté Gigi l'Amoroso ?",
    reponse: [
            "Michèle Torr",
            "Mireille Matthieu",
            "Dalida",
            "France Gall"
    ],
    bonneReponse: 2
}
const questions = [question, question2];

function afficherMessage(texte) {
    message.textContent = texte;
}
function ajouterMessage(texte) {
    message.innerHTML += texte + "<br>";
}
function checkStatus() {
    if (partieEnCours) {
        status.textContent = "La partie est en cours !";
    }
    else {
        status.textContent = "La partie est terminée !";
    }
}
function demarrerPartie() {
    if (partieEnCours) {
        const confirmation = confirm("Es-tu sûr ?");
        if (!confirmation) {
            return;
        }
    }
    indiceQuestion = 0;
    reinitScores();
    partieEnCours = true;
    checkStatus();
    nouvellePartie.style.display = "none";
    stop.style.display = "block";
    nouvelleQuestion();
}
function terminerPartie() {
    partieEnCours = false;
    nouvellePartie.style.display = "block";
    stop.style.display = "none";
    checkStatus();
}
function afficherEquipe(nomEquipe, scoreEquipe, active){
    if (active === true) {
        ajouterMessage(nomEquipe + " : " + scoreEquipe + " - Equipe active");
    }
    else {
        ajouterMessage(nomEquipe + " : " + scoreEquipe + " - Equipe inactive");

    }
}
function trouverEquipe(indice) {
    return equipes[indice];
}
function afficherNomEquipe(indice) {
    return trouverEquipe(indice).nom;
}
function afficherToutesEquipes() {
    afficherMessage("");
    for (let i = 0; i < equipes.length; i++) {
        afficherEquipe(equipes[i].nom, equipes[i].score, equipes[i].active);
    };
}
function activerEquipe(indiceEquipe) {
    equipes[indiceEquipe].active = true;
    afficherToutesEquipes();
}
function desactiverEquipe(indiceEquipe) {
    equipes[indiceEquipe].active = false;
    afficherToutesEquipes();
}
function ajouterPoint(indiceEquipe){
    if(equipes[indiceEquipe].active) {
        equipes[indiceEquipe].score++;
    }
    else{
        alert("L'équipe " + equipes[indiceEquipe].nom + " est inactive !");
    }
    afficherToutesEquipes();
}
function reinitScores() {
    for (let i = 0 ; i < equipes.length ; i++) {
        equipes[i].score = 0;
    }
    afficherToutesEquipes();
}
function creerQuestionPourEquipe(indiceEquipe, questionActuelle) {
    const equipe = trouverEquipe(indiceEquipe);
    for (let i = 0; i < questionActuelle.reponse.length ; i++) {
        const boutonReponse = document.createElement("button");
        boutonReponse.textContent = questionActuelle.reponse[i];
        propositions.appendChild(boutonReponse);
        boutonReponse.addEventListener("click", () => {
            if (!equipe.aRepondu) {
                if (boutonReponse.textContent === questionActuelle.reponse[questionActuelle.bonneReponse]){
                    alert("Bonne réponse !");
                    ajouterPoint(indiceEquipe);
                }
                else {
                    alert("Mauvaise réponse ! Aïe !");
                }
                equipe.aRepondu = true;
                if (toutesLesEquipesOntRepondu()) {
                    nouvelleQuestion();
                }
            }
        });
    }
}
function reinitialiserReponses() {
    for (let i = 0 ; i < equipes.length ; i++) {
        equipes[i].aRepondu = false;
    }
}
function nouvelleQuestion() {
    if (indiceQuestion < questions.length) {
        reinitialiserReponses();
        propositions.innerHTML = "";
        enonce.textContent = questions[indiceQuestion].texte;
        for (let i = 0 ; i < equipes.length ; i++) {
            creerQuestionPourEquipe(i, questions[indiceQuestion]);
        }
        indiceQuestion++;
    }
    else {
        terminerPartie();
    }
}
function toutesLesEquipesOntRepondu() {
    for (let i = 0 ; i < equipes.length; i++) {
        if(!trouverEquipe(i).aRepondu) {
            return false;
        }
    }
    return true;
}

stop.style.display = "none";

nouvellePartie.addEventListener("click", () => {
    demarrerPartie();
});

stop.addEventListener("click", () => {
    terminerPartie();
});

for (let i = 0; i < equipes.length; i++){
    const boutonEquipe = document.createElement("button");
    boutonEquipe.textContent = equipes[i].nom;
    equipesDisplay.appendChild(boutonEquipe);
    boutonEquipe.addEventListener ("click", () => {
        ajouterPoint(i);
    });
};

afficherToutesEquipes();
