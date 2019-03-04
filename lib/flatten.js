"use strict";
/*jslint plusplus: true */
var GETTER = { '_getter': true },
    MISSING = { '_missing': true };


function split_key(key_str) {
    var key_parts = key_str.split(/\]\[|\[|\]$/);  // Split path by bracketed expressions

    if (key_parts.length > 1) {
        // If key has more than one part, there's going to be a useless ""
        key_parts.splice(-1, 1);
    }

    // Parse any remaining integers
    return key_parts.map(function (part) {
        return (/^\d+$/).test(part) ? parseInt(part, 10) : part;
    });
}


function walk_object(obj, key_parts, value) {
    if (key_parts[0] === '') {
        // Deal with [] special case
        if (key_parts.length === 1) {
            // The final item should be an array
            if (value !== GETTER) {
                // Replace contents of array, preserving parent reference
                obj.splice.apply(obj, [0, obj.length].concat(value));
            }
            return obj;
        }

        // Intermediate [], form an array out of all inner values
        return value.map(function (unused, i) {
            return walk_object(obj, [i].concat(key_parts.slice(1)), value[i]);
        });
    }

    // Found final item, do work and return
    if (key_parts.length === 1) {
        if (value !== GETTER) {
            obj[key_parts[0]] = value;
        }
        return obj.hasOwnProperty(key_parts[0]) ? obj[key_parts[0]] : MISSING;
    }

    // Make sure object to recurse into exists, before recursing into it
    if (!obj.hasOwnProperty(key_parts[0])) {
        if (value === GETTER) {
            // No point carrying on if just trying to fetch value
            return MISSING;
        }
        obj[key_parts[0]] = key_parts[1] === '' || typeof key_parts[1] === 'number' ? [] : {};
    }
    return walk_object(obj[key_parts[0]], key_parts.slice(1), value);
}


module.exports.to_object = function to_object(flattened_kvs) {
    var root_obj = {};

    flattened_kvs.forEach(function (kv) {
        walk_object(root_obj, split_key(kv.key), kv.value);
    });

    return root_obj;
};


module.exports.get_values = function get_values(root_obj, flattened_keys) {
    return flattened_keys.map(function (key_str) {
        return {
            key: key_str,
            value: walk_object(root_obj, split_key(key_str), GETTER),
        };
    }).filter(function (kv) { return kv.value !== MISSING; });
};
