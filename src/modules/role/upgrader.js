/*
 * role Upgrader
 *
 * template role defines the basic layout of a role
 *
 */

var roleUpgrader = {

    /**
    * Create the body of the creep for the role
    * @param {number} energy The amount of energy avalible
    * @param {Object} args Extra arguments
    **/
    getBody: function(energy, args) {
        if (isNaN(energy)) { return ERR_INVALID_ARGS; }

        args = args || {};

        args.style = args.style || 'default';

        let workUnits = 0;
        let moveUnits = 0;
        let carryUnits = 1;
        let body = [];

        energy -= 50;

        body.push(CARRY);

        switch (args.style) {
        case 'rcl8':
            workUnits = Math.floor(energy / 125);
            workUnits = workUnits < 1 ? 1 : workUnits;
            workUnits = workUnits > 15 ? 15 : workUnits;
            break;
        default:
            workUnits = Math.floor(energy / 125);
            workUnits = workUnits < 1 ? 1 : workUnits;
            workUnits = workUnits > 10 ? 10 : workUnits;
            break;
        }

        moveUnits = Math.ceil(workUnits / 2);

        if (moveUnits == Math.floor(workUnits / 2)) {
            moveUnits += 1;
        }

        for (let i = 0; i < workUnits; i++) {
            body.push(WORK);
        }

        for (let i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }

        return body;
    },

};

registerRole(C.ROLE_UPGRADER, roleUpgrader);
