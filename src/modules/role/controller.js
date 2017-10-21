/*
 * role Controller
 *
 * controller role is designed to clain or reserver room controllers.
 *
 */

var roleController = {

    /**
    * Create the body of the creep for the role
    * @param {number} energy The amount of energy avalible
    * @param {Object} args Extra arguments
    **/
    getBody: function(energy, args) {
        args = args || {};
        args.style = args.style || 'default';

        let body = [];
        switch (args.style) {
            case 'reserve':
                let claim = Math.floor(energy / 650);
                claim = claim < 1 ? 1 : claim;
                claim = claim > 5 ? 5 : claim;
                for (var i = 0; i < claim; i++) {
                    body.push(CLAIM);
                    body.push(MOVE);
                }
                break;
            default:
                body = [MOVE,CLAIM];
        }

        return body;
    },

};

registerRole(C.ROLE_CONTROLLER, roleController);
