/*
 * Miner Role
 *
 * body of a miner
 *
 */

var roleMiner = {

    /**
    * Create the body of the creep for the role
    * @param {number} energy The amount of energy avalible
    * @param {Object} args Extra arguments
    **/
    getBody: function(energy, args) {
        if (isNaN(energy)) { return ERR_INVALID_ARGS; }

        args = args || {};

        args.style = args.style || 'default';

        let body = [];
        let workUnits = 1;
        let moveUnits = 1;
        let carryUnits = 1;
        let extrasCost = 0;

        switch (args.style) {
        case 'drop':
            workUnits = Math.floor(energy / 125);
            workUnits = workUnits < 1 ? 1 : workUnits;
            workUnits = workUnits > 6 ? 6 : workUnits;
            break;
        case 'ranged':
            energy -= 50;
            body.push(CARRY);
            workUnits = Math.floor(energy / 125);
            workUnits = workUnits < 1 ? 1 : workUnits;
            workUnits = workUnits > 6 ? 6 : workUnits;
            break;
        default:
            energy -= 50;
            body.push(CARRY);
            workUnits = Math.floor(energy / 125);
            workUnits = workUnits < 1 ? 1 : workUnits;
            workUnits = workUnits > 6 ? 6 : workUnits;
            break;
        }

        moveUnits = Math.ceil(workUnits / 2);

        if (moveUnits == Math.floor(workUnits / 2)) {
            moveUnits += 1;
        }

        for (var i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }

        for (var i = 0; i < workUnits; i++) {
            body.push(WORK);
        }

        return body;
    },

};

registerRole(C.ROLE_MINER, roleMiner);
