const {Schema, model} = require("mongoose");

module.exports = model('stores', new Schema({
    gid: {type: String, required: true, unique: true},
    items: {
        type: [{
            name: {type: String, required: true, maxLength: 50},
            buyType: {
                type: String,
                required: true,
                default: 'role',
                enum: ['role', 'ar', 'mute']
            },
            item: {type: String, required: true},
            price: {type: Number, min: 0, required: true},
            description: {type: String, maxLength: 250, required: true}
        }],
        default: () => ([]), required: true,
        validate: {
            validator: items => items.length <= 20
        }
    },
    hasCustomAr: {type: Boolean, required: true, default: false}
}));