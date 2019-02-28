"use strict";
/*jslint plusplus: true */

function split_key(key_str, state) {
    var key_parts = key_str.split(/\]\[|\[|\]$/);  // Split path by bracketed expressions

    if (key_parts.length > 1) {
        // If key has more than one part, there's going to be a useless ""
        key_parts.splice(-1, 1);
    }

    // Parse any remaining integers
    return key_parts.map(function (part, i) {
        var state_key;

        if (part === "") {
            // Use state to auto-number this entry
            state_key = key_parts.slice(0, i).join("/");
            state[state_key] = state[state_key] || 0;
            return state[state_key]++;
        }

        if (/^\d+$/.test(part)) {
            return parseInt(part, 10);
        }

        return part;
    });
}

module.exports.to_object = function to_object(flattened_values) {
    var state = {}, root_obj = {};

    // Add key to parent, complain if it's already there
    function append_value(parent, key, value) {
        if (parent.hasOwnProperty(key)) {
            throw new Error("Key " + key + "already added");
        }
        parent[key] = value;
    }

    flattened_values.forEach(function (kv) {
        var i,
            obj = root_obj,
            k = split_key(kv.key, state);

        // Use obj to trace through stack
        for (i = 0; i < (k.length - 1); i++) {
            if (!obj.hasOwnProperty(k[i])) {
                obj[k[i]] = typeof k[i + 1] === 'number' ? [] : {};
            }
            obj = obj[k[i]];
        }
        // Set the final item to match value
        append_value(obj, k[k.length - 1], kv.value);
    });

    return root_obj;
};

module.exports.get_values = function get_values(root_obj, flattened_keys) {
    var state = {}, out = [];

    flattened_keys.forEach(function (key_str) {
        var i,
            obj = root_obj,
            k = split_key(key_str, state);

        // Use obj to trace through stack
        for (i = 0; i < k.length; i++) {
            if (!obj.hasOwnProperty(k[i])) {
                // Ignore missing values instead of returning undef
                return;
            }
            obj = obj[k[i]];
        }
        // Add the final value to the key/value output
        out.push({key: key_str, value: obj});
    });

    return out;
};
