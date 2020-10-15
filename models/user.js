const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    uid: {type: String, unique: true},
    commands: {type: Number, default: 0},
    statusmsg: {type: String, default: ''},
    statustype: {type: String, default: ''},
    statusclearmode: {type: String, default: 'auto'},
    statusclearat: {type: Date, default: null},
    statussetat: {type: Date, default: null},
    support: {type: Boolean, default: false},
    staff: {type: Boolean, default: false},
    admin: {type: Boolean, default: false},
    developer: {type: Boolean, default: false},
    blacklisted: {type: Boolean, default: false},
    donator: {type: Boolean, default: false}
});

module.exports = mongoose.model("user", UserSchema);