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
        attackUnits = attackUnits > 12 ? 12 : attackUnits;

        energy -= (attackUnits * 130);
        moveUnits += Math.ceil(attackUnits);

        let healUnits = Math.floor(energy / 300);
        healUnits = healUnits < 0 ? 0 : healUnits;
        healUnits = healUnits > 3 ? 3 : healUnits;

        energy -= (healUnits * 300);
        moveUnits += Math.ceil(healUnits);

        let toughUnits = Math.floor(energy / 60);
        toughUnits = toughUnits < 1 ? 1 : toughUnits;
        toughUnits = toughUnits > 10 ? 10 : toughUnits;

        moveUnits += Math.ceil(toughUnits);

        let body = [];
        for (let i = 0; i < toughUnits; i++) {
            body.push(TOUGH);
        }
        for (let i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < attackUnits; i++) {
            body.push(ATTACK);
        }
        for (let i = 0; i < healUnits; i++) {
            body.push(HEAL);
        }

        return body;
    },

};

module.exports = roleCombatMilitia;
