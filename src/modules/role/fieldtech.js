/*
 * role Field Tech
 *
 * Field tech role defines remote tech that will mine at the work site
 *
 */

var roleFieldTech = {

    /**
    * Create the body of the creep for the role
    * @param {number} energy The amount of energy avalible
    * @param {Object} args Extra arguments
    **/
    getBody: function(energy, args) {
        let workUnits = Math.floor((energy * 0.5) / 125);
        workUnits = workUnits < 1 ? 1 : workUnits;
        workUnits = workUnits > 10 ? 10 : workUnits;
        energy -= 125 * workUnits;
        let carryUnits = Math.floor(energy / 75);
        carryUnits = carryUnits < 1 ? 1 : carryUnits;
        carryUnits = carryUnits > 20 ? 20 : carryUnits;
        moveUnits = Math.ceil((workUnits + carryUnits) / 2);
        if (moveUnits == Math.floor((workUnits + carryUnits) / 2)) {
            moveUnits += 1;
        }

        let body = [];
        for (let i = 0; i < workUnits; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < carryUnits; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }

        return body;
    },

};

registerRole(C.ROLE_FIELDTECH, roleFieldTech);
