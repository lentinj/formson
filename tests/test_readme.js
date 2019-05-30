"use strict";
/*jslint plusplus: true, nomen: true, stupid: true */
var fs = require('fs');
var test = require('tape');
var marked = require('marked');
var formson = require('lib/index.js');


/** Extract tests from markdown */
function md_tests(md, fn) {
    var tests, expecteds, tokens;

    // Extract all blocks
    tokens = marked.lexer(md);
    tests = tokens.filter(function (t) { return t.type === 'code' && /( |^)test( |$)/.test(t.lang); });
    expecteds = tokens.filter(function (t) { return t.type === 'code' && /( |^)expected( |$)/.test(t.lang); });

    // Zip the 2 arrays together
    return tests.map(function (test, i) {
        if (expecteds[i] === undefined) {
            throw new Error("Number of tests (" + tests.length + ") doesn't match expecteds (" + expecteds.length + ")");
        }

        return fn(test.text.trim(), expecteds[i].text.trim());
    });
}


function create_form() {
    var el = global.document.createElement('FORM');

    el.innerHTML = Array.prototype.join.call(arguments, "\n");
    return el;
}


test('README.md snippets', function (t) {
    if (!global.document) {
        t.skip("This test requires a browser");
        t.end();
        return;
    }

    md_tests(fs.readFileSync(__dirname + '/../README.md', 'utf8'), function (test, expected) {
        t.deepEqual(
            formson.form_to_object(create_form(test)),
            JSON.parse(expected),
            test
        );
    });
});
