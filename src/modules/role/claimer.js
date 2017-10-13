/*
 * role Claimer
 */

var roleClaimer = {

    /**
    * Create the body of the creep for the role
    * @param {number} energy The amount of energy avalible
    * @param {Object} args Extra arguments
    **/
    getBody: function(energy, args = {}) {
        let body = [MOVE,CLAIM];
        return body;
    },

};

registerRole(C.ROLE_CLAIMER, roleClaimer);
