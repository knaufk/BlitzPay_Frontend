/**
 * Created by kknauf on 13.06.15.
 */
'use strict';

var Dispatcher = require('../dispatcher/Beer2PeerDispatcher');

var UserActions = {
    /**
     * @param  {string} text
     */
    payForEvent: function(params) {
        Dispatcher.dispatch({
            actionType: RippleConstants.RIPPLE_PAY,
            parameters: params
        });
    }

};

module.exports = RippleActions;
