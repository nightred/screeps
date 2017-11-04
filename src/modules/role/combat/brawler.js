/*
 * role Combat Brawler
 *
 * combat brawler role defines an attach creep designed for melle combat
 *
 */

var roleCombatBrawler = {

    /**
    * Create the body of the creep for the role
    * @param {number} energy The amount of energy avalible
    * @param {Object} args Extra arguments
    **/
    getBody: function(energy, args) {
        if (isNaN(energy)) { return ERR_INVALID_ARGS; }
        args = args || {};

        let attackUnits = Math.floor((energy * 0.6) / 130);
        attackUnits = attackUnits < 1 ? 1 : attackUnits;
        attackUnits = attackUnits > 10 ? 10 : attackUnits;
        energy -= (attackUnits * 130);
        let moveUnits = attackUnits;

        let toughUnits = Math.floor(energy / 60);
        toughUnits = toughUnits < 1 ? 1 : toughUnits;
        toughUnits = toughUnits > 15 ? 15 : toughUnits;
        moveUnits += toughUnits;

        let body = [];
        for (var i = 0; i < toughUnits; i++) {
            body.push(TOUGH);
        }
        for (var i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }
        for (var i = 0; i < attackUnits; i++) {
            body.push(ATTACK);
        }

        return body;
    },

};

registerRole(C.ROLE_COMBAT_BRAWLER, roleCombatBrawler);
