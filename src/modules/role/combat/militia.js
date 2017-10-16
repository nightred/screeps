/*
 * role Combat Militia
 *
 * combat militia role defines an militia creep for
 * room and remote area defense
 *
 */

var roleCombatMilitia = {

    /**
    * Create the body of the creep for the role
    * @param {number} energy The amount of energy avalible
    * @param {Object} args Extra arguments
    **/
    getBody: function(energy, args) {
        if (isNaN(energy)) { return ERR_INVALID_ARGS; }

        args = args || {};

        let moveUnits = 0;
        let attackUnits = Math.floor(energy / 130);
        attackUnits = attackUnits < 1 ? 1 : attackUnits;
        attackUnits = attackUnits > 6 ? 6 : attackUnits;

        energy -= (attackUnits * 130);
        moveUnits += attackUnits;

        let rangedUnits = Math.floor(energy / 200);
        rangedUnits = rangedUnits < 1 ? 1 : rangedUnits;
        rangedUnits = rangedUnits > 7 ? 7 : rangedUnits;

        energy -= (rangedUnits * 200);
        moveUnits += rangedUnits;

        let healUnits = Math.floor(energy / 300);
        healUnits = healUnits < 0 ? 0 : healUnits;
        healUnits = healUnits > 2 ? 2 : healUnits;

        energy -= (healUnits * 300);
        moveUnits += healUnits;

        let toughUnits = Math.floor(energy / 60);
        toughUnits = toughUnits < 1 ? 1 : toughUnits;
        toughUnits = toughUnits > 10 ? 10 : toughUnits;

        moveUnits += toughUnits;

        let body = [];
        for (var i = 0; i < toughUnits; i++) {
            body.push(TOUGH);
        }
        for (var i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }
        for (var i = 0; i < rangedUnits; i++) {
            body.push(RANGED_ATTACK);
        }
        for (var i = 0; i < attackUnits; i++) {
            body.push(ATTACK);
        }
        for (var i = 0; i < healUnits; i++) {
            body.push(HEAL);
        }

        return body;
    },

};

registerRole(C.ROLE_COMBAT_MILITIA, roleCombatMilitia);
