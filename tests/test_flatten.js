"use strict";
/*jslint */
var test = require('tape');
var flatten = require('lib/flatten.js');

test('to_object', function (t) {
    var out = {};

    out = flatten.to_object([
        {key: "cow[names][0][first]", value: "daisy" },
        {key: "cow[names][1][first]", value: "freda" },
        {key: "cow[noise][mouth]", value: "moo" },
    ]);
    t.deepEqual(out, {
        cow: {
            names: [{ first: "daisy" }, { first: "freda" }],
            noise: { mouth: "moo" },
        },
    }, "Set values");
    out = flatten.to_object([
        {key: "cow[names][0][first]", value: "daisy" },
        {key: "cow[names][1][first]", value: "freda" },
        {key: "cow[noise][mouth]", value: "moo" },
        {key: "cow[names][0][last]", value: "moo" },
        {key: "cow[names][1][last]", value: "mooo" },
    ]);
    t.deepEqual(out, {
        cow: {
            names: [{ first: "daisy", last: "moo" }, { first: "freda", last: "mooo" }],
            noise: { mouth: "moo" },
        },
    }, "Expand existing values");

    out = flatten.to_object([
        {key: "cow[names][][last]", value: "moo" },
        {key: "cow[names][][last]", value: "mooo" },
    ]);
    t.deepEqual(out, {
        cow: {
            names: [{ last: "moo" }, { last: "mooo" }],
        },
    });

    t.end();
});

test('get_values', function (t) {
    var obj = {};

    obj = {
        cow: {
            names: ['daisy', 'freda'],
            noise: { mouth: "moo" },
        },
    };
    t.deepEqual(flatten.get_values(obj, [
        "cow[names][0]",
        "cow[names][1]",
        "cow[noise][mouth]",
    ]), [
        { key: "cow[names][0]", value: "daisy" },
        { key: "cow[names][1]", value: "freda" },
        { key: "cow[noise][mouth]", value: "moo" },
    ]);
    t.end();
});
