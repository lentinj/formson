"use strict";
/*jslint browser: true, plusplus: true*/
var flatten = require('./flatten.js');


function get_element_names(form_el) {
    var i, el, out = {};

    for (i = 0; i < form_el.elements.length; i++) {
        el = form_el.elements[i];

        // Filter out fieldsets / elements that are disabled anyway
        if (el.name && !el.disabled && el.nodeName !== 'FIELDSET') {
            out[el.name] = true;
        }
    }

    return Object.keys(out);
}


function get_element_value(el) {
    var vals;

    if (el.nodeName === 'INPUT' && (el.type === 'file')) {
        return el.multiple ? el.files[0] : el.files;
    }

    if ((window.NodeList && el instanceof window.NodeList) || (window.HTMLCollection && el instanceof window.HTMLCollection)) {
        // Array of items with the same name, e.g. radio/checkbox (NB: MS uses HTMLCollection)
        vals = Array.prototype.map.call(el, get_element_value).filter(function (x) { return x !== undefined; });
        // An array of only radios will have only one item, anything else return an array
        return Array.prototype.some.call(el, function (sub_el) { return sub_el.type !== 'radio'; }) ? vals : vals[0];
    }

    if (el.nodeName === 'INPUT' && el.type === 'checkbox' && !el.hasAttribute('value')) {
        // Without a value, we return true/false
        return !!el.checked;
    }

    if (el.nodeName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
        return el.checked ? el.value : undefined;
    }

    if (el.nodeName === 'SELECT') {
        vals = Array.prototype.map.call(el.options, function (o) {
            return o.selected ? o.value : undefined;
        }).filter(function (x) { return x !== undefined; });
        return el.multiple ? vals : vals[0];
    }

    if (el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA') {
        return el.value;
    }

    throw new Error("Unknown input element type " + el);
}
module.exports.get_element_value = get_element_value;


function set_element_value(el, val) {
    if (el.nodeName === 'FIELDSET') {
        // Can't set a value on a fieldset
        return;
    }

    if (el.nodeName === 'INPUT' && (el.type === 'file')) {
        // Setting file types doesn't make sense, ignore
        return;
    }

    if (el.nodeName === 'INPUT' && el.type === 'checkbox' && !el.hasAttribute('value')) {
        // Without a value, a checkbox returns true/false
        el.checked = !!val;
        return;
    }

    if ((window.NodeList && el instanceof window.NodeList) || (window.HTMLCollection && el instanceof window.HTMLCollection)) {
        // Array of checkboxes / radios with the same name (MS uses HTMLCollection)
        Array.prototype.forEach.call(el, function (sub_el, i) {
            // For non-check/radio items, assume that values are in exepected order.
            set_element_value(sub_el, Array.isArray(val) && sub_el.type !== 'checkbox' && sub_el.type !== 'radio' ? val[i] : val);
        });
        return;
    }

    if (el.nodeName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
        el.checked = Array.isArray(val) ? val.indexOf(el.value) > -1 : el.value === val;
        return;
    }

    if (el.nodeName === 'SELECT') {
        if (Array.isArray(val)) {
            Array.prototype.forEach.call(el.options, function (o) {
                o.selected = val.indexOf(o.value) > -1;
            });
        } else {
            Array.prototype.forEach.call(el.options, function (o) {
                o.selected = (o.value === val);
            });
        }
        return;
    }

    if (el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA') {
        el.value = val || '';
        return;
    }

    throw new Error("Unknown input element type " + el);
}
module.exports.set_element_value = set_element_value;


function form_to_object(form_el) {
    return flatten.to_object(get_element_names(form_el).map(function (k) {
        return { key: k, value: get_element_value(form_el.elements[k]) };
    }));
}
module.exports.form_to_object = form_to_object;


function update_form(form_el, obj) {
    flatten.get_values(
        obj,
        get_element_names(form_el)
    ).forEach(function (kv) {
        set_element_value(form_el.elements[kv.key], kv.value);
    });
}
module.exports.update_form = update_form;
