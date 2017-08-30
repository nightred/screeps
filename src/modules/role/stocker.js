/*
 * Stocker Role
 *
 * handles moving resources
 *
 */

var roleStocker = {

    /**
    * Create the body of the creep for the role
    * @param {number} energy The amount of energy avalible
    * @param {Object} args Extra arguments
    **/
    getBody: function(energy, args) {
        if (isNaN(energy)) { return ERR_INVALID_ARGS; }

        args = args || {};

        let move = Math.floor((energy / 2) / 50);
        move = move < 1 ? 1 : move;
        move = move > 3 ? 3 : move;

        energy -= move * 50;

        let carry = Math.floor(energy / 50);
        carry = carry < 1 ? 1 : carry;
        carry = carry > 6 ? 6 : carry;

        let body = [];

        for (let i = 0; i < move; i++) {
            body.push(MOVE);
        }

        for (let i = 0; i < carry; i++) {
            body.push(CARRY);
        }

        return body;
    },

};

registerRole(C.ROLE_STOCKER, roleStocker);
