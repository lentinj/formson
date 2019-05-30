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


## Form serialisation details

Form fields can be nested at any depth using square brackets:

```html test
<input type="text" name="cow" value="bessie" />
<input type="text" name="farm[field][cow]" value="freda" />
```

```json expected
{
    "cow": "bessie",
    "farm": { "field": { "cow": "freda" }}
}
```

### Arrays

Multiple form fields with the same name will be treated as an array:

```html test
<input type="text" name="cows" value="bessie" />
<input type="text" name="cows" value="freda" />
<input type="text" name="cows" value="" />
<input type="text" name="cows" value="mary" />
```

```json expected
{
    "cows": ["bessie", "freda", "", "mary"]
}
```

This can be forced even with a single item by using ``[]``:

```html test
<input type="text" name="cows[]" value="bessie" />
```

```json expected
{
    "cows": ["bessie"]
}
```

Individual positions can also be given:

```html test
<input type="text" name="farm[cows][0]" value="bessie" />
<input type="text" name="farm[cows][3]" value="freda" />
<input type="text" name="farm[cows][2]" value="" />
<input type="text" name="farm[cows][1]" value="mary" />
```

```json expected
{
    "farm": { "cows": ["bessie", "mary", "", "freda"] }
}
```

### Checkboxes

Checkboxes are true if checked:

```html test
<input type="checkbox" name="farm[cows]" checked="checked" />
<input type="checkbox" name="farm[pigs]" />
```

```json expected
{
    "farm": { "cows": true, "pigs": false }
}
```

### Select boxes

Select boxes return the value (or text) of selected item, or an array if multiple.

```html test
<select name="cow" multiple="multiple">
  <option selected="selected" value="daisy">Daisy (the best cow)</option>
  <option selected="selected">freda</option>
  <option>bessie</option>
</select>
```

```json expected
{
    "cow": [ "daisy", "freda" ]
}
```

### File input

File inputs will have a javascript File object as their value, if multiple they
will have an array of File objects.

## License

MIT
