function calculerPointsCombo(correction) {

    if (correction === 2) {
        return 2;
    }

    if (correction === 1) {
        return 1;
    }

    return 0;
}

const reponsesCombo = {};

function enregistrerReponse(equipeId, numeroMorceau, reponse) {

    if (!reponsesCombo[equipeId]) {
        reponsesCombo[equipeId] = {};
    }

    reponsesCombo[equipeId][numeroMorceau] = reponse;

}

const correctionsCombo = {};

function enregistrerCorrection(equipeId, numeroMorceau, points) {

    // Vérifier que la correction est valide
    if (![0, 1, 2].includes(points)) {
        return false;
    }

    // Créer un espace pour l'équipe si nécessaire
    if (!correctionsCombo[equipeId]) {
        correctionsCombo[equipeId] = {};
    }

    // Enregistrer ou remplacer la correction
    correctionsCombo[equipeId][numeroMorceau] = points;

    return true;
}

function calculerScoreCombo(equipeId) {

    const corrections = correctionsCombo[equipeId];

    // Une équipe sans correction possède 0 point
    if (!corrections) {
        return 0;
    }

    let score = 0;

    // Additionner les points de chaque morceau
    for (const points of Object.values(corrections)) {
        score += points;
    }

    return score;
}

function calculerBonusCombo(equipeId) {

    const corrections = correctionsCombo[equipeId];

    if (!corrections) {
        return 0;
    }

    let serie = 0;
    let bonus = 0;

    for (let morceau = 1; morceau <= 10; morceau++) {

        if (corrections[morceau] === 2) {

            serie++;

            // À partir de la 3e réponse parfaite,
            // chaque nouveau morceau rapporte +1 bonus.
            if (serie >= 3) {
                bonus++;
            }
        } 
        else {
            // Une réponse imparfaite interrompt la série
            serie = 0;
        }
    }
    return bonus;
}

function calculerScoreFinalCombo(equipeId) {

    const pointsReponses = calculerScoreCombo(equipeId);
    const pointsBonus = calculerBonusCombo(equipeId);

    return pointsReponses + pointsBonus;
}

module.exports = {
    calculerPointsCombo,
    enregistrerReponse,
    reponsesCombo,
    enregistrerCorrection,
    correctionsCombo,
    calculerScoreCombo,
    calculerBonusCombo,
    calculerScoreFinalCombo
};