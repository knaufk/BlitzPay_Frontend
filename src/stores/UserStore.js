/**
 * Created by kknauf on 13.06.15.
 */

'use strict';

var Beer2PeerDispatcher = require('../dispatcher/Beer2PeerDispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var CryptoService = require("../services/CryptoService");

var UserConstants = require('../constants/UserConstants.js');

var RippleService = require('../services/RippleService');

var CHANGE_USER_EVENT = 'change';
var CHANGE_BALANCE_EVENT = 'changeBalance';

var user = {
    name: '',
    rippleAccount: '',
    rippleSecret: '',
    balances: [],
    isLoggedIn: function () {
        return this.name !== '';
    }
};

function setBalances(balances) {
    user.balances = balances;
}

function setUser(name, secret) {
    console.log('Logging in...');
    user.name = name;
    user.rippleSecret = secret;
    user.rippleAccount = RippleService.getAccountFromSecret(secret);
}

function storeAndSetUser(name, secret, pin) {
    var account = RippleService.getAccountFromSecret(secret);
    CryptoService.encryptSecret(secret, pin, account);
    localStorage.setItem("name", name);
    setUser(name, secret);
}

function directLogin(name, account) {
    console.log('Logging in...');
    user.name = name;
    user.rippleAccount = account;
}

function logout() {
    console.log('Logging out...');
    localStorage.clear();
    user.name = '';
    user.rippleSecret = '';
    user.rippleAccount = '';
    user.balances = [];
}

var UserStore = assign({}, EventEmitter.prototype, {

    getUser: function () {
        return user;
    },

    emitUserChange: function () {
        this.emit(CHANGE_USER_EVENT);
    },

    emitBalanceChange: function () {
        this.emit(CHANGE_BALANCE_EVENT);
    },

    addUserChangeListener: function (callback) {
        this.on(CHANGE_USER_EVENT, callback);
    },

    removeUserChangeListener: function (callback) {
        this.removeListener(CHANGE_USER_EVENT, callback);
    },

    addBalanceChangeListener: function (callback) {
        this.on(CHANGE_BALANCE_EVENT, callback);
    },

    removeBalanceChangeListener: function (callback) {
        this.removeListener(CHANGE_BALANCE_EVENT, callback);
    }
});

Beer2PeerDispatcher.register(function (action) {
    var username, secret, pin, account, balances;
    switch (action.actionType) {
        case UserConstants.USER_CREATE_WITH_SECRET:
            username = action.username.trim();
            secret = action.secret.trim();
            if (!action.pin) {
                setUser(username, secret);
            } else {
                pin = action.pin.trim();
                storeAndSetUser(username, secret, pin);
            }
            UserStore.emitUserChange();
            break;
        case UserConstants.USER_DIRECT_LOGIN:
            username = action.username.trim();
            account = action.account.trim();
            directLogin(username, account);
            UserStore.emitUserChange();
            break;
        case UserConstants.USER_LOGOUT:
            logout();
            UserStore.emitUserChange();
            break;
        case UserConstants.USER_BALANCE_CHANGE:
            balances = action.balances;
            setBalances(balances);
            UserStore.emitBalanceChange();
    }

});

module.exports = UserStore;
