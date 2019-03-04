"use strict";
/*jslint plusplus: true */
var test = require('tape');
var formson = require('lib/index.js');


function create_form() {
    var el = global.document.createElement('FORM');

    el.innerHTML = Array.prototype.join.call(arguments, "\n");
    return el;
}


test('get_value', function (t) {
    if (!global.document) {
        t.skip("This test requires a browser");
        t.end();
        return;
    }

    t.deepEqual(formson.get_element_value(create_form(
        '<input type="text" name="cow" />'
    ).lastChild), '', "input[type=text] Empty");

    t.deepEqual(formson.get_element_value(create_form(
        '<input type="text" name="cow" value="daisy" />'
    ).lastChild), 'daisy', "input[type=text]");

    t.deepEqual(formson.get_element_value(create_form(
        '<textarea name="cow">bessie</textarea>'
    ).lastChild), 'bessie', "textarea");

    t.deepEqual(formson.get_element_value(create_form(
        '<input type="checkbox" name="cow" value="daisy" checked="checked" />'
    ).lastChild), 'daisy', "input[type=checkbox] checked");

    t.deepEqual(formson.get_element_value(create_form(
        '<input type="checkbox" name="cow" value="daisy" />'
    ).lastChild), undefined, "input[type=checkbox] unchecked");

    t.deepEqual(formson.get_element_value(create_form(
        '<input type="checkbox" name="cow" />'
    ).lastChild), false, "input[type=checkbox] (no value) unchecked");

    t.deepEqual(formson.get_element_value(create_form(
        '<input type="checkbox" name="cow" checked="checked" />'
    ).lastChild), true, "input[type=checkbox] (no value) checked");

    t.deepEqual(formson.get_element_value(create_form(
        '<input type="radio" name="cow" value="daisy" checked="checked" />'
    ).lastChild), 'daisy', "input[type=radio] checked");

    t.deepEqual(formson.get_element_value(create_form(
        '<input type="radio" name="cow" value="daisy" />'
    ).lastChild), undefined, "input[type=radio] unchecked");

    t.deepEqual(formson.get_element_value(create_form(
        '<select name="cow"><option>daisy</option><option>freda</option><option>bessie</option></select>'
    ).lastChild), "daisy", "select default");

    t.deepEqual(formson.get_element_value(create_form(
        '<select name="cow"><option>daisy</option><option selected="selected">freda</option><option>bessie</option></select>'
    ).lastChild), "freda", "select selected");

    t.deepEqual(formson.get_element_value(create_form(
        '<select name="cow" multiple="multiple"><option>daisy</option><option>freda</option><option>bessie</option></select>'
    ).lastChild), [], "select[multiple] default");

    t.deepEqual(formson.get_element_value(create_form(
        '<select name="cow" multiple="multiple"><option>daisy</option><option selected="selected">freda</option><option>bessie</option></select>'
    ).lastChild), ["freda"], "select[multiple] 1 item");

    t.deepEqual(formson.get_element_value(create_form(
        '<select name="cow" multiple="multiple"><option>daisy</option><option selected="selected">freda</option><option selected="selected">bessie</option></select>'
    ).lastChild), ["freda", "bessie"], "select[multiple] 2 items");

    t.deepEqual(formson.get_element_value(create_form(
        '<select name="cow" multiple="multiple"><option selected="selected">daisy</option><option selected="selected">freda</option><option selected="selected">bessie</option></select>'
    ).lastChild), ["daisy", "freda", "bessie"], "select[multiple] 3 items");

    t.end();
});


test('set_element_value', function (t) {
    if (!global.document) {
        t.skip("This test requires a browser");
        t.end();
        return;
    }

    function test_sev(el_string, val, new_val) {
        var el = create_form(el_string).lastChild;

        formson.set_element_value(el, val);
        t.deepEqual(formson.get_element_value(el), arguments.length > 2 ? new_val : val, "Set and fetched value for " + el_string);
    }

    test_sev('<input type="text" name="name" />', 'hello');
    test_sev('<textarea name="name">Goodbye</textarea>', 'hello');
    test_sev('<input type="checkbox" name="name" />', true);
    test_sev('<input type="checkbox" name="name" />', false);
    test_sev('<input type="checkbox" name="name" checked="checked" />', true);
    test_sev('<input type="checkbox" name="name" checked="checked" />', false);
    // NB: Radio boxes only get checked if their value matches the set value
    test_sev('<input type="radio" name="name" value="rabbit" />', 'cow', undefined);
    test_sev('<input type="radio" name="name" value="rabbit" />', 'rabbit', 'rabbit');
    test_sev(
        '<select name="cow"><option>daisy</option><option>freda</option><option>bessie</option></select>',
        'daisy'
    );
    test_sev(
        '<select name="cow"><option>daisy</option><option>freda</option><option>bessie</option></select>',
        ['daisy'],
        'daisy'  // NB: It's not a multiple, so return value will always be scalar
    );
    test_sev(
        '<select name="cow" multiple="multiple"><option>daisy</option><option>freda</option><option>bessie</option></select>',
        ['daisy']
    );
    test_sev(
        '<select name="cow" multiple="multiple"><option>daisy</option><option>freda</option><option>bessie</option></select>',
        ['freda', 'george', 'bessie'],
        ['freda', 'bessie']  // NB: Unknown items discarded
    );
    test_sev(
        '<select name="cow" multiple="multiple"><option selected="selected">daisy</option><option>freda</option><option>bessie</option></select>',
        'bessie',
        ['bessie']  // NB: mutiple, so return type is always array
    );

    t.end();
});


test('form_to_object', function (t) {
    if (!global.document) {
        t.skip("This test requires a browser");
        t.end();
        return;
    }

    t.deepEqual(formson.form_to_object(create_form(
        '<input type="text" name="" value="hello" />',
        '<input type="text" name="text[empty]" />',
        '<input type="text" name="text[withvalue]" value="daisy" />',
        '<input type="text" name="text[disabled]" value="daisy" disabled="disabled" />',
        '<input type="text" name="textarr" value="hello 1" />',
        '<input type="text" name="textarr" value="hello 2" />',
        '<input type="text" name="textarr" value="hello 3" />',
        '<textarea name="textarea">bessie</textarea>'
    )), {
        text: { empty: '', withvalue: 'daisy' },
        textarea: 'bessie',
        textarr: [ 'hello 1', 'hello 2', 'hello 3' ],
    }, "Text fields get translated");

    t.deepEqual(formson.form_to_object(create_form(
        '<fieldset name="cow">',
        '<input type="text" name="cowname" value="daisy" />',
        '<input type="text" name="cowage" value="2" />',
        '</fieldset>',
        '<fieldset name="pig">',
        '<input type="text" name="pigname" value="george" />',
        '<input type="text" name="pigage" value="4" />',
        '</fieldset>'
    )), {
        cowname: 'daisy',
        cowage: '2',
        pigname: 'george',
        pigage: '4',
    }, "Don't pay attention to fieldsets");

    t.deepEqual(formson.form_to_object(create_form(
        '<input type="radio" name="cow" value="freda" />',
        '<input type="radio" name="cow" value="daisy" checked="checked" />',
        '<input type="radio" name="cow" value="bessie" />',
        '<input type="radio" name="pig" value="george" checked="checked" />',
        '<input type="radio" name="pig" value="wilma" />',
        '<input type="radio" name="pig" value="archie" />',
        '<input type="radio" name="ghost" value="harry" />'
    )), {
        cow: "daisy",
        pig: "george",
        ghost: undefined,
    }, "Radios return just the value of the checked item");

    t.deepEqual(formson.form_to_object(create_form(
        '<input type="radio" name="cow" value="freda" />',
        '<input type="radio" name="cow" value="daisy" checked="checked" />',
        '<input type="radio" name="cow" value="bessie" />',
        '<input type="text" name="cow" value="other" />'
    )), {
        cow: ["daisy", "other"],
    }, "Mix of radios and other fields get an array");

    t.deepEqual(formson.form_to_object(create_form(
        '<input type="checkbox" name="farm" value="animal" checked="checked" />',
        '<input type="checkbox" name="cow" value="freda" />',
        '<input type="checkbox" name="cow" value="daisy" checked="checked" />',
        '<input type="checkbox" name="cow" value="bessie" />',
        '<input type="checkbox" name="pig" value="george" checked="checked" />',
        '<input type="checkbox" name="pig" value="wilma" checked="checked" />',
        '<input type="checkbox" name="pig" value="archie" />',
        '<input type="checkbox" name="ostrich" value="harry" />',
        '<input type="checkbox" name="duck" value="arnold" checked="checked" />'
    )), {
        farm: "animal",
        cow: ["daisy"],
        pig: ["george", "wilma"],
        ostrich: undefined,
        duck: "arnold",
    }, "Checkboxes get added to a list if multiple items");

    t.end();
});


test('update_form', function (t) {
    if (!global.document) {
        t.skip("This test requires a browser");
        t.end();
        return;
    }

    function test_uf(form_el_strs, obj, new_obj, message) {
        var form_el = create_form.apply(null, form_el_strs);

        formson.update_form(form_el, obj);
        t.deepEqual(
            formson.form_to_object(form_el),
            new_obj,
            message
        );
    }

    test_uf([
        '<input type="text" name="cow[freda]" value="cow a" />',
        '<input type="text" name="cow[bessie]" value="cow b" />',
        '<input type="text" name="cow[daisy]" value="cow c" />',
    ], {}, {
        cow: { freda: "cow a", bessie: "cow b", daisy: "cow c" },
    }, "Setting nothing gets the original form back");

    test_uf([
        '<input type="text" name="cow[freda]" value="cow a" />',
        '<input type="text" name="cow[bessie]" value="cow b" />',
        '<input type="text" name="cow[daisy]" value="cow c" />',
    ], { cow: { bessie: "BESSIE", george: "GEORGE" }}, {
        cow: { freda: "cow a", bessie: "BESSIE", daisy: "cow c" },
    }, "Set one value, ignored unused value");

    test_uf([
        '<input type="text" name="cow[]" value="cow a" />',
        '<input type="text" name="cow[]" value="cow b" />',
        '<input type="text" name="cow[]" value="cow c" />',
    ], { cow: ["BESSIE", "GEORGE"] }, {
        cow: ["BESSIE", "GEORGE", ''],
    }, "Set 2 out of 3 cows, cleared final cow");

    test_uf([
        '<input type="text" name="cow[]" value="cow a" />',
        '<input type="text" name="cow[]" value="cow b" />',
        '<input type="text" name="cow[]" value="cow c" />',
    ], { cow: ["BESSIE", "GEORGE", "CUTHBERT", "DIBBLE"]}, {
        cow: ["BESSIE", "GEORGE", "CUTHBERT"],
    }, "Set 3 cows, ignored extra value");

    test_uf([
        '<input type="text" name="cow" value="cow a" />',
        '<input type="text" name="cow" value="cow b" />',
        '<input type="text" name="cow" value="cow c" />',
    ], { cow: ['MOO', 'MOOo', 'MOOoO']}, {
        cow: ['MOO', 'MOOo', 'MOOoO'],
    }, "Set array of cow fields in order");

    test_uf([
        '<input type="checkbox" name="cow" value="freda" />',
        '<input type="checkbox" name="cow" value="daisy" checked="checked" />',
        '<input type="checkbox" name="cow" value="bessie" />',
    ], {
        cow: ['freda', 'daisy', 'george'],
    }, {
        cow: ['freda', 'daisy'],
    }, "Set one value, ignored unused value");

    test_uf([
        '<input type="checkbox" name="cow[]" value="freda" />',
        '<input type="checkbox" name="cow[]" value="daisy" checked="checked" />',
        '<input type="checkbox" name="cow[]" value="bessie" />',
    ], {
        cow: ['freda', 'daisy', 'george'],
    }, {
        cow: ['freda', 'daisy'],
    }, "Checkboxes work equivalently with a final []");

    test_uf([
        '<input type="checkbox" name="cow" value="freda" />',
        '<input type="checkbox" name="duck" value="harry" checked="checked" />',
    ], {
        cow: 'freda',
        duck: undefined,
    }, {
        cow: 'freda',
        duck: undefined,
    }, "Can turn single checkboxes on/off");

    test_uf([
        '<input type="checkbox" name="cow[]" value="freda" />',
        '<input type="checkbox" name="duck[]" value="harry" checked="checked" />',
    ], {
        cow: ['freda'],
        duck: [],
    }, {
        cow: ['freda'],
        duck: [],
    }, "Single checkboxes work with array syntax too");

    t.end();
});
