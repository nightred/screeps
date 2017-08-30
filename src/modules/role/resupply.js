/*
 * Resupply Role
 *
 * resupply role that handles filling extentions and spawn
 *
 */

var roleResupply = {

    /**
    * Create the body of the creep for the role
    * @param {number} energy The amount of energy avalible
    * @param {Object} args Extra arguments
    **/
    getBody: function(energy, args) {
        if (isNaN(energy)) { return ERR_INVALID_ARGS; }

        args = args || {};

        let carryUnits = Math.floor(energy / 75);

        carryUnits = carryUnits < 1 ? 1 : carryUnits;
        carryUnits = carryUnits > 8 ? 8 : carryUnits;

        let moveUnits = Math.ceil(carryUnits / 2);

        let body = [];

        for (let i = 0; i < carryUnits; i++) {
            body.push(CARRY);
        }

        for (let i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }

        return body;
    },

};

registerRole(C.ROLE_RESUPPLY, roleResupply);
