/*
 * role Combat Medic
 *
 * combat medic role defines a healer that provides support to combat creeps
 */

var roleCombatMedic = {};

/**
* Create the body of the creep for the role
* @param {number} energy The amount of energy avalible
* @param {Object} args Extra arguments
**/
roleCombatMedic.getBody = function(energy, args = {}) {
    if (isNaN(energy)) return ERR_INVALID_ARGS;
    let healUnits = Math.floor((energy * 0.75) / 300);
    healUnits = healUnits < 1 ? 1 : healUnits;
    healUnits = healUnits > 25 ? 25 : healUnits;
    energy -= (healUnits * 300);
    let moveUnits = healUnits;
    let body = [];
    for (var i = 0; i < moveUnits; i++) {
        body.push(MOVE);
    }
    for (var i = 0; i < healUnits; i++) {
        body.push(HEAL);
    }
    return body;
};

registerRole(C.ROLE_COMBAT_MEDIC, roleCombatMedic);
