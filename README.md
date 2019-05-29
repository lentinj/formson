# formson: HTML forms <-> JSON

Convert HTML forms to/from JSON. As well as obeying HTML form serialisation
conventions, can update deep array/object serialisations using a bracket syntax.

Inspired by:

* https://www.w3.org/TR/html-json-forms/
* https://www.npmjs.com/package/@f/serialize-form


## Install

Install from github:

```
npm install git://github.com/lentinj/formson
```

## Usage

First, import the module:

```
var formson = require('formson');
```

Then use one of the following functions

### formson.update_object(obj, form_el)

Update object ``obj`` with the current values of the HTML form ``form_el``'s elements.
Anything in ``obj`` that isn't referenced in ``form_el`` will be left as-is.

### formson.update_form(form_el, obj)

Update HTML form ``form_el`` with the current values in object ``obj``.
The form element names are used to extract and set relevant values from ``obj``.

### formson.form_to_object(form_el)

Shorthand for ``formson.update_form(form_el, {})``. Returns the freshly created
and updated element.


## License

MIT
