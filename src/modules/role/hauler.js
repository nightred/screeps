/*
 * Hauler Role
 *
 * handles moving energy in a room
 *
 */

var roleHauler = {};

/**
* Create the body of the creep for the role
* @param {number} energy The amount of energy avalible
* @param {Object} args Extra arguments
**/
roleHauler.getBody = function(energy, args) {
    if (isNaN(energy)) return ERR_INVALID_ARGS;
    _.defaults(args, {
        style: 'default'
    });

    let move = 0;
    let carry = 0;
    let work = 0;
    switch (args.style) {
    case 'longhauler':
        energy -= 100;
        work = 1;
        carry = Math.floor(energy / 75);
        carry = carry < 10 ? 10 : carry;
        carry = carry > 24 ? 24 : carry;
        move = Math.ceil(carry / 2);
        if (move == Math.floor(carry / 2)) move += 1;
        break;

    default:
        carry = Math.floor(energy / 75);
        carry = carry < 1 ? 1 : carry;
        carry = carry > 14 ? 14 : carry;
        move = Math.ceil(carry / 2);
        break;

    }

    let body = [];
    for (var i = 0; i < work; i++) {
        body.push(WORK);
    }
    for (var i = 0; i < carry; i++) {
        body.push(CARRY);
    }
    for (var i = 0; i < move; i++) {
        body.push(MOVE);
    }

    return body;
};

registerRole(C.ROLE_HAULER, roleHauler);
