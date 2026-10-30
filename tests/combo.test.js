const {
    calculerPointsCombo,
    enregistrerReponse,
    reponsesCombo,
    enregistrerCorrection,
    correctionsCombo,
    calculerScoreCombo,
    calculerBonusCombo,
    calculerScoreFinalCombo
} = require("../modules/combo");

const assert = require("node:assert/strict");

// TEST 1 : Calcul des points

console.log("Test 1 :", calculerPointsCombo(2));
console.log("Test 2 :", calculerPointsCombo(1));
console.log("Test 3 :", calculerPointsCombo(0));

// TEST 2 : Enregistrement des réponses

enregistrerReponse("equipe1", 1, "Billie Jean");
enregistrerReponse("equipe1", 2, "Thriller");

// L'équipe modifie sa réponse
enregistrerReponse("equipe1", 2, "Beat It");

console.log("Réponses :", reponsesCombo);

assert.equal(reponsesCombo.equipe1[1], "Billie Jean");
assert.equal(reponsesCombo.equipe1[2], "Beat It");

// TEST 3 : Enregistrement des corrections

enregistrerCorrection("equipe1", 1, 2);
enregistrerCorrection("equipe1", 2, 1);

// L'animateur modifie sa correction
enregistrerCorrection("equipe1", 2, 2);

console.log("Corrections :", correctionsCombo);

assert.equal(correctionsCombo.equipe1[1], 2);
assert.equal(correctionsCombo.equipe1[2], 2);

console.log("Tous les tests Combo ont réussi !");

// TEST 4 : Calcul du score total

enregistrerCorrection("equipe1", 3, 1);
enregistrerCorrection("equipe1", 4, 2);
enregistrerCorrection("equipe1", 5, 0);

console.log("Score équipe 1 :", calculerScoreCombo("equipe1"));

assert.equal(calculerScoreCombo("equipe1"), 7);

// L'animateur modifie le morceau 3
enregistrerCorrection("equipe1", 3, 2);

console.log("Score après correction :", calculerScoreCombo("equipe1"));

assert.equal(calculerScoreCombo("equipe1"), 8);

// Une équipe sans correction doit avoir 0 point
assert.equal(calculerScoreCombo("equipe2"), 0);

console.log("Tests du score total réussis !");

// TEST 5 : Bonus Combo prolongé

const points = [2, 2, 2, 1, 2, 2, 2, 2, 0, 2];

points.forEach((pointsMorceau, index) => {
    enregistrerCorrection(
        "equipeBonus",
        index + 1,
        pointsMorceau
    );
});

// Deux séries : 3 parfaites puis 4 parfaites
// Bonus : 1 + 2 = 3
assert.equal(calculerBonusCombo("equipeBonus"), 3);

console.log("Bonus initial :", calculerBonusCombo("equipeBonus"));

// L'animateur retire un point au morceau 6
enregistrerCorrection("equipeBonus", 6, 1);

// La deuxième série est interrompue.
// Il ne reste que le bonus du morceau 3.
assert.equal(calculerBonusCombo("equipeBonus"), 1);
console.log("Bonus après correction :", calculerBonusCombo("equipeBonus"));
console.log("Tests du bonus Combo réussis !");

// TEST 6 : Score final avec bonus

// On définit explicitement les corrections du test
const correctionsTest6 = [2, 2, 2, 1, 2, 1, 2, 2, 0, 2];

correctionsTest6.forEach((points, index) => {
    enregistrerCorrection("equipeBonus", index + 1, points);
});

// Vérification du score après interruption du Combo
console.log(
    "Corrections TEST 6 :",
    correctionsCombo.equipeBonus
);

const scoreFinal = calculerScoreFinalCombo("equipeBonus");

console.log("Score final Combo :", scoreFinal);

assert.equal(scoreFinal, 17);

// L'animateur rétablit la correction du morceau 6
enregistrerCorrection("equipeBonus", 6, 2);

const nouveauScore = calculerScoreFinalCombo("equipeBonus");

console.log("Score final après correction :", nouveauScore);

assert.equal(nouveauScore, 20);

console.log("Tests du score final Combo réussis !");