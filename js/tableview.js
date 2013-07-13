/*
TableView
requirement: jquery.js, key-events.js, others.js
*/

function TableView () {
    this.initialize.apply(this, arguments);
}

TableView.prototype = {
    initialize: function(jquery_obj, view_id) {
        this.view = jquery_obj;
        if(this.view.length !== 1) {
            throw new Error("Object does not point at unique element");
        }
        this.view_id = String(view_id);
        this.view.addClass(this.view_id);
        this.id_list = [];
        this.selected = [];
        this.cursor = new Cursor(this);
        this.initialized = true;
        this.initialize_events();
    },
    item: function(id_index) {
        return this[this.index(id_index)];
    },
    find: function(selector) {
        return this.item(this.view.children(selector).attr("item_id"));
    },
    insert: function(html, id, index, classes) {
        id = String(id);
        if(id === undefined) {
            throw new Error("'id' property is required");
        }
        if(classes === undefined || classes === null) {
            classes = [];
        }
        if(index === undefined || index === null) {
            index = this.length;
        }
        this.id_list.splice(index, 0, id);
        var insert_html = '<div class="item %classes%" item_id="%id%">%html%</div>'.replace_with({
            "%classes%" : classes.join(" "),
            "%id%" : id,
            "%html%" : html
        });
        if(index === 0) {
            this.view.prepend(insert_html);
        } else {
            $(this.view.children()[index - 1]).after(insert_html);
        }
        this.splice(index, 0, new Item(id, this));
        this[index].elm.bind("mousedown", {this_obj: this}, function(event) {
            if(event.shiftKey) {
                event.data.this_obj.cursor.expand(index);
            } else if(event.metaKey) {
                event.data.this_obj.cursor.add(index).update_base(index);
            } else {
                event.data.this_obj.cursor.move(index);
            }
        });
        return this[index];
    },
    remove: function(id_index) {
        var index = this.index(id_index);
        if(index !== undefined) {
            this.deselect(index);
            this[index].elm.remove();
            this[index].initialized = false;
            this.splice(index, 1);
            this.id_list.splice(index, 1);
            return this;
        } else {
            return false;
        }
    },
    index: function(id_index) {
        var index = id_index;
        if(id_index !== parseInt(id_index, 10)) {
            index = this.id_list.indexOf(id_index);
        } else if(index < 0 || this.id_list.length - 1 < index) {
            index = undefined;
        }
        return index == -1 ? undefined : index;
    },
    select: function(id_index) {
        // console.log(id_index);
        var index = this.index(id_index);
        // console.log(index);
        if(index !== undefined) {
            this.selected.push(this.id_list[index]);
            this.selected = this.selected.unique().map(function(v) {
                return this.id_list.indexOf(v);
            }, this).sort(function(a,b) {
                return a - b;
            }).map(function(v) {
                return this.id_list[v];
            }, this);
            this[index].selected = true;
            this[index].elm.addClass("selected");
            // return this.selected.map(function(v) { return this[this.id_list.indexOf(v)]; }, this);
            return this[index];
        } else {
            return false;
        }
    },
    deselect: function(id_index) {
        var index = this.index(id_index);
        if(index !== undefined) {
            var selected_index = this.selected.indexOf(this.id_list[index]);
            if(selected_index != -1) {
                if(this.selected[selected_index] == this.cursor.base.id && this.selected.length !== 1) {
                    if(selected_index >= this.selected.length / 2) {
                        this.cursor.base = this[this.index(selected_index - 1)];
                    } else {
                        this.cursor.base = this[this.index(selected_index + 1)];
                    }
                }
                this.selected.splice(selected_index, 1);
                this[index].selected = false;
                this[index].elm.removeClass("selected");
                // return this.selected.map(function(v) { return this[this.id_list.indexOf(v)]; }, this);
                return this[index];
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    initialize_events: function() {
        var listener = new KeyEvents(this.view);
        // cross key up
        listener.bind("38", [] ,function() {
            this.cursor.prev();
        }, this);
        // cross key down
        listener.bind("40", [] ,function() {
            this.cursor.next();
        }, this);
        // cross key up with shift
        listener.bind("38", ["s"], function() {
            this.cursor.expand_prev();
        }, this);
        // cross key down with shift
        listener.bind("40", ["s"], function() {
            this.cursor.expand_next();
        }, this);
    }
};

function Cursor () {
    this.initialize.apply(this, arguments);
}

Cursor.prototype = {
    initialize: function(attr) {
        this.attr = attr;
        this.base = { "initialized" : undefined };
        this.expand_head = undefined;
    },
    move: function(index) {
        if(0 <= index && index <= this.attr.length - 1) {
            for(var i = this.attr.selected.length - 1; i >= 0; i--) {
                this.attr.deselect(this.attr.selected[0]);
            }
            this.base = this.attr.select(index);
            if(this.base) {
                this.expand_head = undefined;
            } else {
                this.base = { "initialized" : undefined };
            }
            return this.base.initialized ? this : false;
        } else {
            return false;
        }
    },
    add: function(index) {
        return this.attr.select(index) ? this : false;
    },
    remove: function(index) {
        return this.attr.deselect(index) ? this : false;
    },
    next: function() {
        return this.move((this.expand_head ? this.attr.index(this.expand_head) : this.base.index()) + 1) ? this : false;
    },
    prev: function() {
        return this.move((this.expand_head ? this.attr.index(this.expand_head) : this.base.index()) - 1) ? this : false;
    },
    expand: function(index) {
        if(this.base.initialized) {
            var item = this.attr[index];
            if(item) {
                if(this.expand_head) {
                    console.log(this.base.index());
                    console.log(this.attr.index(this.expand_head));
                    if(this.base.index() < this.attr.index(this.expand_head)) {
                        for(var i = this.base.index() + 1; i <= this.attr.index(this.expand_head); i++) {
                            console.log(i);
                            this.remove(i);
                        }
                    } else {
                        for(var j = this.base.index() - 1; j >= this.attr.index(this.expand_head); j--) {
                            console.log(j);
                            this.remove(j);
                        }
                    }
                }
                if(this.base.index() < index) {
                    for(var k = this.base.index() + 1; k <= index; k++) {
                        this.add(k);
                    }
                } else {
                    for(var l = this.base.index() - 1; l >= index; l--) {
                        this.add(l);
                    }
                }
                this.expand_head = item.id;
            }
        }
        return this;
    },
    expand_next: function() {
        var indexed_selected = this.attr.selected.map(function(v, i) {
            return this.attr.index(v);
        }, this);
        // console.log(indexed_selected);
        if(this.expand_head === undefined) {
            this.expand_head = this.base.id;
        }
        var expand_head_index = this.attr.index(this.expand_head);
        var base_index = this.base.index();
        var expand_head_selected_index = indexed_selected.indexOf(expand_head_index);
        // console.log(indexed_selected);
        // console.log(expand_head_index);
        // console.log(base_index);
        if(expand_head_index >= base_index) {
            for(var j = expand_head_selected_index; j <= indexed_selected.length - 1; j++) {
                // console.log(indexed_selected[j + 1] + ":" + indexed_selected[j]);
                if(j === indexed_selected.length - 1 || indexed_selected[j + 1] - indexed_selected[j] > 1) {
                    var r = this.add(indexed_selected[j] + 1);
                    // console.log(r);
                    if(r) {
                        this.expand_head = this.attr[indexed_selected[j] + 1].id;
                    }
                    break;
                }
            }
        } else if(expand_head_index < base_index) {
            for(var k = expand_head_selected_index; k >= 0; k--) {
                // console.log(indexed_selected[k]);
                // console.log(indexed_selected[k - 1]);
                // console.log(k);
                if(k === 0 || indexed_selected[k] - indexed_selected[k - 1] > 1) {
                    this.remove(indexed_selected[k]);
                    this.expand_head = this.attr[indexed_selected[k] + 1].id;
                    break;
                }
            }
        }
        return this;
    },
    expand_prev: function() {
        var indexed_selected = this.attr.selected.map(function(v, i) {
            return this.attr.index(v);
        }, this);
        // console.log(indexed_selected);
        if(this.expand_head === undefined) {
            this.expand_head = this.base.id;
        }
        var expand_head_index = this.attr.index(this.expand_head);
        var base_index = this.base.index();
        var expand_head_selected_index = indexed_selected.indexOf(expand_head_index);
        // console.log(indexed_selected);
        // console.log(expand_head_index);
        // console.log(base_index);
        if(expand_head_index <= base_index) {
            for(var j = expand_head_selected_index; j >= 0; j--) {
                if(j === 0 || indexed_selected[j] - indexed_selected[j - 1] > 1) {
                    r = this.add(indexed_selected[j] - 1);
                    // console.log(r);
                    if(r) {
                        this.expand_head = this.attr[indexed_selected[j] - 1].id;
                    }
                    break;
                }
            }
        } else if(expand_head_index > base_index) {
            for(var k = expand_head_selected_index; k <= indexed_selected.length - 1; k++) {
                if(k === indexed_selected.length - 1 || indexed_selected[k + 1] - indexed_selected[k] > 1) {
                    this.remove(indexed_selected[k]);
                    this.expand_head = this.attr[indexed_selected[k] - 1].id;
                    break;
                }
            }
        }
        return this;
    },
    update_base: function(index) {
        this.base = this.attr[index];
        console.log(this.base);
        if(this.base) {
            this.expand_head = undefined;
        } else {
            this.base = { "initialized" : undefined };
        }
        return this.base.initialized ? this : false;
    }
};

TableView.prototype.__proto__ = new Array();

function Item () {
    this.initialize.apply(this, arguments);
}

Item.prototype = {
    initialize: function(id, parent) {
        this.id = id;
        this.parent = parent;
        this.elm = this.parent.view.find(".item[item_id=" + this.id + "]");
        this.initialized = true;
        this.selected = false;
    },
    index: function() {
        var i = this.parent.id_list.indexOf(this.id);
        return i == -1 ? undefined : i;
    },
    remove: function() {
        var r = this.parent.remove(this.id);
        if(r) {
            this.initialized = false;
            return this;
        } else {
            return false;
        }
    },
    select: function() {
        var r = this.parent.select(this.id);
        return r ? this : false;
    },
    deselect: function() {
        var r = this.parent.deselect(this.id);
        return r ? this : false;
    }
};
