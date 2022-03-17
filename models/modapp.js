const mongoose = require('mongoose');

const ma = new mongoose.Schema({
    gid: {unique: true, type: String},
    enabled: {type: Boolean, default: false},
    apps: {type: Object, default: {}}
});

module.exports = mongoose.model('modapps', ma);