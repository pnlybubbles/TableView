# tableview.js

UI TableView for twitter timeline.

Key binding supported. (key-events.js)

See main.js to get sample code.

# TableView Class

Setup UI TableView for jquery element.

Each Item objects are accessed with [] method like Array object.

## new TableView(jquery_obj, view_id)

jquery_obj (jQuery Object) : jQuery object

view_id (String) : identification for UI tableview

Initialize TableView to element selected in argument jquery object and specify identification name.

Return : none

## .item(id_index)

id_index (String/Number) : table row item's id (String) or table row index (Number)

Return item by id or index.

Return : (Item Object)

## .find(selector)

selector (String) : css selector String in accordance with jquery.

Return item from selector.

Return : (Item Object)

## .insert(html, id, index, classes)

html (String) : html code to insert into item
id (String) : item id to specify item
index (String) : index to insert item at
classes (Array) : css classes to set in item element

Insert item element to optional index with html and classes

Return : (Item Object) inserted item object

## .remove(id_index)

id_index (String/Number) : table row item's id (String) or table row index (Number)

Remove item element by id or index

Return : (Item Object) removed item object or false if it did not complete

## .index(id_index)

id_index (String/Number) : table row item's id (String) or table row index (Number)

Return current index of item by id and, if argument is index, return correction of index.

Return : (Number) index number of item ,or return undefined if the index does not correct

## .initialized (Property)

If false, the TableView does not initialized.

Return : (Boolean)

## .view (Property)

Element initialized as TableView is saved.

Return : (jQuery Object)

## .selected (Property)

selected item ids are saved.

Return : (Array)

# Item class

Individual items included in tableview.

## .index()

Return current index of this item.

Return : (Number) index number of item ,or return undefined if this item is not found

## .remove()

Remove this item element.

Return : (Item Object) removed item object or false if it did not complete

## .initialized (Property)

If false, the item does not initialized or removed.

Return : (Boolean)

## .elm (Property)

This item element is saved.

Return : (jQuery Object)

## .parent (Property)

tableview item belongs is saved.

Return : (TableView Object)

## .selected (Property)

Whether this item is selected or not is saved.

Return : (Boolean)

# Cursor class

Controller of item selections.

## .move(index)

index (Number) : index of item

Move selected cursor to index.

Return : (Cursor object) or false if it did not complete

## .add(index)

index (Number) : index of item

Add cursor at index.

Return : (Cursor object) or false if it did not complete

## .remove(index)

index (Number) : index of item

Remove cursor at index.

Return : (Cursor object) or false if it did not complete

## .next()

Move cursor to next index.

Return : (Cursor object) or false if it did not complete

## .prev()

Move cursor to previous index.

Return : (Cursor object) or false if it did not complete

## .expand(index)

index (Number) : index of item

Expand cursor to index item, but the base item is maintained.

Return : (Cursor object)

## .expand_next()

Expand cursor to next index item, but the base item is maintained.

Return : (Cursor object)

## .expand_prev()

Expand cursor to previous index item, but the base item is maintained.

Return : (Cursor object)

## .update_base(index)

Update base item to item of index.

Return : (Cursor object) or false if it did not complete

## .attr (Property)

tableview Cursor object belongs is saved.

Return : (TableView Object)
