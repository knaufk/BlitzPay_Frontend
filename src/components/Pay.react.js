/**
 * Created by kknauf on 13.06.15.
 */
'use strict';

var $ = require('jquery');
var React = require('react');
var mui = require('material-ui');
var TextField = mui.TextField;
var RaisedButton = mui.RaisedButton;
var DropDownMenu = mui.DropDownMenu;
var CircularProgress = mui.CircularProgress;
var RippleService = require('../services/RippleService');
var keyMirror = require('keymirror');

var UserStore = require('../stores/UserStore');

// HARDCODED VALUES TO BE REPLACED (START)
var currency = 'EUR'; // to be read from backend
var targetRippleAccountId = 'rpUNr3n6SdqTX2obxt78RRVQBS9ZJ3az6N'; // TODO to be read from backend
// HARDCODED VALUES TO BE REPLACED (END)

var ripple = require('ripple-lib');

var LoadingState = keyMirror({
    LOADING: null,
    LOADED: null
});

var Pay = React.createClass({
    getInitialState: function() {
        return {
            loadingState: LoadingState.LOADING
        };
    },

    onClickPayButton: function() {
        var user = UserStore.getUser();

        var amount = this.refs.amountField.getValue().replace(',', '.');

        var rippleAmount = ripple.Amount.from_human(amount + ' ' + currency);

        RippleService.pay(user.rippleSecret, targetRippleAccountId, rippleAmount, function (success) {
            console.log('payment result ' + success);
            // TODO
        });

    },

    componentDidMount: function() {
        $.get('http://46.101.128.85:3000/event/'+ this.props.params.eventCode, function(data, status) {
            this.setState({
                eventName: data.eventName,
                totalAmount: data.amount,
                currency: data.currency,
                targetRippleAccountId: data.senderAddress,
                eventCreator: data.senderNickname
            });
        }.bind(this));
        this.setLoadedState();
    },

    setLoadedState: function() {
        this.setState({loadingState: LoadingState.LOADED});
    },

    render: function() {
        if(this.state.loadingState === LoadingState.LOADING) {
            return (<CircularProgress mode = "indeterminate" size={2}/>);
        } else {
            return (
                <div>
                    <h1>Contribute to event {this.state.eventname}</h1>

                    <p>This event has been created by {this.state.eventCreator}. The total requested amount
                        is {this.state.totalAmount} {this.state.currency}.</p>
                    <table>
                        <tr>
                            <td><TextField ref="amountField" defaultValue="0,00"/></td>
                            <td>{this.state.currency}</td>
                        </tr>
                    </table>
                    <RaisedButton label="Pay!" primary={true} onClick={this.onClickPayButton}/>
                </div>
            );
        }
    }
});

module.exports = Pay;
