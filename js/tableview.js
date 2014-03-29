/*
TableView
requirement: jquery.js, key-events.js, others.js
*/

function TableView () {
  this.initialize.apply(this, arguments);
}

TableView.prototype = {
  initialize: function(jquery_obj, view_id) {
    this.obj = jquery_obj;
    if(this.obj.length !== 1) {
      throw new Error("Object does not point at unique element");
    }
    this.obj.append('<div class="item_view"></div>');
    this.view = this.obj.find(".item_view");
    this.view_id = String(view_id);
    this.obj.addClass(this.view_id);
    this.view.css({
      "height" : "100%",
      "width" : "auto",
      "overflow-y" : "scroll"
    });
    this.initialize_scrollbar();
    this.view.css({
      "padding-right" : (this.obj.find(".scrollbox").outerWidth() - (this.view.width() - this.view[0].scrollWidth)) + "px"
    });
    this.id_list = [];
    this.selected = [];
    this.cursor = new Cursor(this);
    this.initialized = true;
    this.auto_scrolling = false;
    this.config = {
      visible_limit : 1500
    };
    this.mouse_down = function(index) {
      if(event.shiftKey) {
        this.cursor.expand(index);
      } else if(event.metaKey) {
        this.cursor.add(index).update_base(index);
      } else {
        this.cursor.move(index);
      }
    };
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
    } else if(index < 0) {
      index = this.length + index;
    }
    this.id_list.splice(index, 0, id);
    var insert_html = '<div class="item %classes%" item_id="%id%">%html%</div>'.replace_with({
      "%classes%" : classes.join(" "),
      "%id%" : id,
      "%html%" : html
    });
    var visible = false;
    if(this.length === 0) {
      visible = true;
    } else if((index == this.length ? this[index - 1].elm : this[index].elm) !== undefined) {
      // var base_item = index == this.length ? this[index - 1] : this[index];
      // console.log(index);
      // console.log(base_item);
      // var scroll_top = this.view.scrollTop();
      // var base_item_height = base_item.elm.outerHeight();
      // var distance_to_base_item = abs(scroll_top + this.view.height() / 2 - (scroll_top + base_item.elm.offset().top + base_item_height / 2)) - base_item_height / 2;
      // if(index == this.length) { distance_to_base_item += base_item_height; }
      // if(distance_to_base_item < this.config.visible_limit) {
      //     visible = true;
      // }
      visible = true;
    }
    // console.log("visible:" + visible);
    if(visible) {
      if(index === 0) {
        this.view.prepend(insert_html);
      } else {
        // console.log(this[index - 1]);
        // console.log("add after");
        this[index - 1].elm.after(insert_html);
      }
    }
    this.splice(index, 0, new Item(id, this));
    this[index].html = insert_html;
    if(visible) {
      this[index].elm.bind("mousedown", {this_obj: this}, function(event) {
        event.data.this_obj.mouse_down.apply(event.data.this_obj, [index]);
      });
      this.render();
    }
    return this[index];
  },
  insert_last: function(html, id, classes) {
    // console.log(this.auto_scrolling);
    var is_bottom = this.auto_scrolling || (this.view.scrollTop() + this.view.height() >= this.view[0].scrollHeight);
    this.insert(html, id, this.length, classes);
    // console.log(is_bottom);
    if(is_bottom) {
      this.auto_scrolling = true;
      this.view.stop(true, false).animate({scrollTop : (this.view[0].scrollHeight - this.view.height())}, 200, 'easeOutQuad', function(){ this.auto_scrolling = false; });
      // console.log(this.view[0].scrollHeight - this.view.height());
      // this.view.scrollTop(this.view[0].scrollHeight - this.view.height());
      this.render();
    }
    // console.log(this.view[0].scrollHeight);
  },
  remove: function(id_index) {
    var index = this.index(id_index);
    if(index !== undefined) {
      this.deselect(index);
      if(this[index].elm) {
        this[index].elm.remove();
      }
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
      this[index].addClass("selected");
      // console.log(this[index].html);
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
        this[index].removeClass("selected");
        // console.log(this[index].html);
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
    this.keybind = new KeyEvents(this.view);
    // cross key up
    this.keybind.bind("38", [], function() {
      this.cursor.prev();
      // this.render.apply(this, arguments);
      this.cursor.update_scroll(function() {
        this.render();
      });
    }, this);
    // cross key down
    this.keybind.bind("40", [], function() {
      this.cursor.next();
      // this.render.apply(this, arguments);
      this.cursor.update_scroll(function() {
        this.render();
      });
    }, this);
    // cross key up with shift
    this.keybind.bind("38", ["s"], function() {
      this.cursor.expand_prev();
      // this.render.apply(this, arguments);
      this.cursor.update_scroll(function() {
        this.render();
      });
    }, this);
    // cross key down with shift
    this.keybind.bind("40", ["s"], function() {
      this.cursor.expand_next();
      // this.render.apply(this, arguments);
      this.cursor.update_scroll(function() {
        this.render();
      });
    }, this);
    // KeyEvents focus
    this.view.bind("mousedown", {this_obj: this}, function(event) {
      event.data.this_obj.keybind.focus();
    });
    // mouse wheel
    this.view.bind("mousewheel", {this_obj: this}, function(event, delta) {
      if(delta > 0) {
        event.data.this_obj.auto_scrolling = false;
      }
      // console.log("scrolling");
      // event.data.this_obj.render.apply(event.data.this_obj, arguments);
      event.data.this_obj.render();
      setTimeout(function() {
        // event.data.this_obj.render.apply(event.data.this_obj, arguments);
        event.data.this_obj.render();
      }, 10);
    });
    // var this_obj = this;
    // this.view[0].onmousewheel = function(event) {
    //     console.log("scrolling");
    //     this_obj.render.apply(this_obj, arguments);
    // };
    // scroll jump
    this.obj.find(".scrollbox").bind("mousedown", {this_obj: this}, function(event) {
      event.data.this_obj.move_scroll(event, true);
    });
    this.obj.find(".scrollbutton").bind("mousedown", {this_obj: this}, function(event) {
      event.stopPropagation();
      var scrollwrap_offset = $(this).parents(".scrollwrap").offset().top;
      var in_scrollbutton_offset = event.clientY - $(this).offset().top;
      var scrollbutton_top_area = $(this).parents(".scrollwrap").height() - $(this).height();
      $(window).bind("mouseup", function() {
        $(window).unbind("mousemove");
        $(window).unbind("mouseup");
      });
      $(window).bind("mousemove", {this_obj: event.data.this_obj,in_scrollbutton_offset: in_scrollbutton_offset, scrollwrap_offset: scrollwrap_offset, scrollbutton: $(this), scrollbutton_top_area: scrollbutton_top_area}, function(event) {
        var bar_position = event.clientY - event.data.scrollwrap_offset - event.data.in_scrollbutton_offset;
        // console.log(bar_position);
        event.data.scrollbutton.css({
          "top" : (bar_position > event.data.scrollbutton_top_area ? event.data.scrollbutton_top_area : bar_position < 0 ? 0 : bar_position) + "px"
        });
        // console.log(event.data.scrollbutton.offset().top);
        event.data.this_obj.move_scroll(event, false);
      });
    });
  },
  initialize_scrollbar: function() {
    this.obj.append('<div class="scrollbox"><div class="scrollwrap"><div class="scrollbutton"></div></div></div>');
    this.obj.css({
      "position" : "relative"
    });
    this.obj.find(".scrollbox").css({
      "display" : "box",
      "position" : "absolute",
      "box-sizing" : "border-box",
      "right" : "0",
      "top" : "0",
      "height" : "100%",
      "width" : "17px",
      "padding" : "3px",
      "border-left" : "1 solid rgb(210, 210, 210)",
      "background-color" : "rgb(255, 255, 255)"
    });
    this.obj.find(".scrollwrap").css({
      "position" : "relative",
      "height" : "100%",
      "width" : "100%"
    });
    this.obj.find(".scrollbutton").css({
      "position" : "absolute",
      "height" : "30px",
      "width" : "100%",
      "top" : "0",
      "left" : "0",
      "background-color" : "rgb(220, 220, 220)"
    }).bind("mouseover", function() {
      $(this).stop(true, false).animate({"background-color" : "rgb(170, 170, 170)"}, 200);
    }).bind("mouseout", function() {
      $(this).stop(true, false).animate({"background-color" : "rgb(220, 220, 220)"}, 200);
    });
  },
  update_scrollbar: function() {
    var first_item = this.find(":first");
    // console.log(this.view.scrollTop() + ":" + first_item.elm.outerHeight() + ":" + first_item.index());
    var top_item_index = first_item.index() + Math.floor(this.view.scrollTop() / first_item.elm.outerHeight());
    // console.log(top_item_index);
    var scrollbutton_top_area = this.obj.find(".scrollwrap").height() - this.obj.find(".scrollbutton").height();
    // var bar_position = scrollbutton_top_area * (top_item_index / (this.length - Math.floor(this.view.height() / first_item.elm.outerHeight())));
    var bar_position = scrollbutton_top_area * ((this.view.scrollTop() + first_item.elm.outerHeight() * first_item.index()) / (first_item.elm.outerHeight() * this.length - this.view.height()));
    // console.log( (this.view.scrollTop() + first_item.elm.outerHeight() * first_item.index()) / (first_item.elm.outerHeight() * this.length - this.view.height()) );
    // console.log(this.obj.find(".scrollwrap").height());
    // console.log(bar_position);
    // console.log(scrollbutton_top_area);
    this.obj.find(".scrollbutton").css({
      "top" : (bar_position > scrollbutton_top_area ? scrollbutton_top_area : bar_position) + "px"
    });
  },
  move_scroll: function(event, update_scrollbar, remain_current) {
    this.auto_scrolling = false;
    var scrollwrap_height = this.obj.find(".scrollwrap").height();
    var scrollbutton_height = this.obj.find(".scrollbutton").height();
    var scroll_y = event.clientY - this.obj.find(".scrollwrap").offset().top - scrollbutton_height / 2;
    // if(scroll_y < 0 || scroll_y > scrollwrap_height - scrollbutton_height) { return false; }
    scroll_y = scroll_y < 0 ? 0 : (scroll_y > scrollwrap_height - scrollbutton_height ? scrollwrap_height - scrollbutton_height : scroll_y);
    var first_item = this.find(":first");
    var last_item = this.find(":last");
    var first_item_index = first_item.index();
    var last_item_index = last_item.index();
    var item_height = first_item.elm.outerHeight();
    var calc_scrolltop = (this.length * item_height - this.view.height()) * (scroll_y / (scrollwrap_height - scrollbutton_height));
    var hidden_scrolltop = calc_scrolltop + (this.view.height() / 2) - this.config.visible_limit;
    // hidden_scrolltop = hidden_scrolltop < 0 ? 0 : hidden_scrolltop;
    var move_fisrt_item_index = Math.ceil((hidden_scrolltop < 0 ? 0 : hidden_scrolltop) / item_height);
    move_fisrt_item_index = move_fisrt_item_index < 0 ? 0 : move_fisrt_item_index;
    var move_last_item_index = move_fisrt_item_index + (this.config.visible_limit * 2 / item_height) - 1;
    move_last_item_index = move_last_item_index > this.length - 1 ? this.length - 1 : move_last_item_index;
    var real_scrolltop = this.config.visible_limit - (this.view.height() / 2) - (move_fisrt_item_index * item_height - hidden_scrolltop);
    // console.log(scroll_y / (scrollwrap_height - scrollbutton_height));
    // console.log("view:" + (this.length * item_height - this.view.height()));
    // console.log("calc:" + calc_scrolltop);
    // console.log("hidden:" + hidden_scrolltop);
    // console.log("real:" + real_scrolltop);
    // var visible_item_count = Math.ceil(this.config.visible_limit * 2 / item_height);
    // var scroll_target_index = Math.round((this.length - Math.floor(this.view.height() / item_height)) * (scroll_y / (scrollwrap_height - scrollbutton_height)));
    // console.log(scroll_target_index);
    // console.log(visible_item_count);
    // var move_fisrt_item_index = scroll_target_index - Math.ceil(visible_item_count / 2);
    // var move_last_item_index = scroll_target_index + Math.ceil(visible_item_count / 2);
    item_index_arr = [];
    for (var i = first_item_index; i <= last_item_index; i++) {
      item_index_arr.push(i);
    }
    // console.log(item_index_arr);
    move_item_index_arr = [];
    for(var j = move_fisrt_item_index; j <= move_last_item_index; j++) {
      move_item_index_arr.push(j);
    }
    // console.log(move_item_index_arr);
    // console.log(+new Date());
    // console.log(item_index_arr.diff(move_item_index_arr));
    remain_current = remain_current === undefined ? false : remain_current;
    if(!remain_current) {
      item_index_arr.diff(move_item_index_arr).forEach(function(v) {
        if(this[v]) { this[v].invisible(); }
      }, this);
    }
    // console.log(+new Date());
    // console.log(move_item_index_arr.diff(item_index_arr));
    move_item_index_arr.diff(item_index_arr).forEach(function(v) {
      if(this[v]) { this[v].visible(); }
    }, this);
    // console.log(+new Date());
    // console.log(this[scroll_target_index]);
    // this.view.scrollTop(this.view.scrollTop() + this[scroll_target_index].elm.offset().top - this.view.height() / 2 + item_height / 2);
    this.view.scrollTop(real_scrolltop);
    // this.view[0].scrollTop = real_scrolltop;
    // console.log("calcview:" + (this.view.scrollTop() + this.find(":first").index() * item_height));
    if(update_scrollbar) { this.update_scrollbar(); }
  },
  render: function() {
    // console.log("r");
    // console.log("rendering");
    [1, -1].forEach(function(v, i) {
      while(1) {
        var base_item = v == -1 ? this.find(":first") : this.find(":last");
        var scroll_top = this.view.scrollTop();
        var base_item_height = base_item.elm.outerHeight();
        var distance_to_base_item = abs(scroll_top + this.view.height() / 2 - (scroll_top + base_item.elm.offset().top - this.view.offset().top + base_item_height / 2)) - base_item_height / 2;
        if(distance_to_base_item > this.config.visible_limit) {
          // console.log("invisible: " + distance_to_base_item);
          base_item.invisible();
          if(v == -1) {
            this.view.scrollTop(scroll_top - base_item_height);
          }
        } else if(base_item.index() !== (v == -1 ? 0 : this.length - 1) && distance_to_base_item + base_item_height < this.config.visible_limit) {
          // console.log("visible: " + (distance_to_base_item + base_item_height));
          // console.log(base_item.index());
          this.item(base_item.index() + v).visible();
          if(v == -1) {
            this.view.scrollTop(scroll_top + base_item_height);
          }
        } else {
          // console.log("no");
          break;
        }
      }
    }, this);
    // console.log(this.view[0].scrollHeight);
    this.update_scrollbar();
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
          // console.log(this.base.index());
          // console.log(this.attr.index(this.expand_head));
          if(this.base.index() < this.attr.index(this.expand_head)) {
            for(var i = this.base.index() + 1; i <= this.attr.index(this.expand_head); i++) {
              // console.log(i);
              this.remove(i);
            }
          } else {
            for(var j = this.base.index() - 1; j >= this.attr.index(this.expand_head); j--) {
              // console.log(j);
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
    // console.log(this.base);
    if(this.base) {
      this.expand_head = undefined;
    } else {
      this.base = { "initialized" : undefined };
    }
    return this.base.initialized ? this : false;
  },
  update_scroll: function(callback) {
    var scroll_top;
    var item = this.expand_head ? this.expand_head : this.base;
    var item_height = item.elm.outerHeight();
    var view_height = this.attr.view.height();
    var view_scroll_top = this.attr.view.scrollTop();
    var item_top = view_scroll_top + item.elm.offset().top - this.attr.view.offset().top;
    var this_obj = this.attr;
    // console.log(item.elm.offset().top - this.attr.view.offset().top);
    // console.log(item_top);
    // console.log(view_scroll_top);
    // console.log(item_top + item_height);
    // console.log(view_scroll_top + view_height);
    // console.log("");
    if(item_top < view_scroll_top) {
      scroll_top = item_top + item_height - (view_height / 2);
      if(scroll_top < 0) {
        scroll_top = 0;
      }
      this.attr.auto_scrolling = false;
      this.attr.view.stop().animate({ scrollTop: scroll_top }, 400, 'easeOutExpo', function() {
        callback.apply(this_obj);
      });
    } else if(item_top + item_height > view_scroll_top + view_height) {
      scroll_top = item_top + item_height - (view_height / 2);
      if(scroll_top > this.attr.view[0].scrollHeight - view_height) {
        scroll_top = this.attr.view[0].scrollHeight - view_height;
      }
      // console.log("scr:" + (scroll_top - view_scroll_top));
      this.attr.auto_scrolling = false;
      this.attr.view.stop().animate({ scrollTop: scroll_top }, 400, 'easeOutExpo', function() {
        callback.apply(this_obj);
      });
    }
  },
  on_change: function(fn, self) {
    fn.apply(self, [this.attr]);
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
    if(this.elm.length === 0) { this.elm = undefined; }
    this.initialized = true;
    this.selected = false;
    this.html = this.elm ? this.elm[0].outerHTML : "";
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
  },
  invisible: function() {
    if(this.elm) {
      this.html = this.elm ? this.elm[0].outerHTML : "";
      this.elm.remove();
      this.elm = undefined;
    }
  },
  visible: function() {
    var i = this.index();
    // console.log(this.html);
    if(i === 0 || this.parent.find(":first") === undefined || i <= this.parent.find(":first").index() - 1) {
      this.parent.view.prepend(this.html);
    } else {
      this.parent.view.children(".item[item_id=" + this.parent[i - 1].id + "]").after(this.html);
    }
    this.elm = this.parent.view.find(".item[item_id=" + this.id + "]");
    if(this.elm.length === 0) {
      this.elm = undefined;
    } else {
      this.elm.bind("mousedown", {this_obj: this.parent}, function(event) {
        event.data.this_obj.mouse_down.apply(event.data.this_obj, [i]);
      });
    }
  },
  addClass: function(class_name) {
    if(this.elm) {
      this.elm.addClass(class_name);
    }
    this.html = this.html.replace(/class="/, "class=\"" + class_name + " ");
  },
  removeClass: function(class_name) {
    if(this.elm) {
      this.elm.removeClass(class_name);
    }
    this.html = this.html.replace(/\s?selected\s?/, "");
  }
};
