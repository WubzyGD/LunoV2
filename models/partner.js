const mongoose = require('mongoose');

const Partners = new mongoose.Schema({
    gid: {unique: true, type: String},
    partners: {type: Object, default: {}},
    total: {type: Number, default: 0}
});

module.exports = mongoose.model('partners', Partners);