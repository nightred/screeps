/*
 * role Scout
 *
 * scout role defines a movment only long range expendable creep
 *
 */

var roleScout = {

    /**
    * Create the body of the creep for the role
    * @param {number} energy The amount of energy avalible
    * @param {Object} args Extra arguments
    **/
    getBody: function(energy, args) {
        let body = [MOVE];

        return body;
    },

};

registerRole(C.ROLE_SCOUT, roleScout);
