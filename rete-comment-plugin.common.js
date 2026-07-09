/*!
* rete-comment-plugin v2.1.3
* (c) 2026 Vitaliy Stoliarov
* Released under the MIT license.
* */
'use strict';



function ___$insertStyle(css) {
    if (!css || typeof window === 'undefined') {
        return;
    }
    const style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.innerHTML = css;
    document.head.appendChild(style);
    return css;
}

Object.defineProperty(exports, '__esModule', { value: true });

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _typeof = require('@babel/runtime/helpers/typeof');
var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _get = require('@babel/runtime/helpers/get');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var rete = require('rete');
var reteAreaPlugin = require('rete-area-plugin');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _typeof__default = /*#__PURE__*/_interopDefaultLegacy(_typeof);
var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);

___$insertStyle(".inline-comment, .frame-comment {\n  color: black;\n  padding: 12px;\n  font-size: 140%;\n  color: white;\n  position: absolute;\n  cursor: move;\n  border-radius: 16px;\n  box-sizing: border-box;\n}\n.inline-comment.selected, .frame-comment.selected {\n  outline: none;\n  border-color: #ffd92c;\n}\n\n.inline-comment {\n  z-index: 4;\n  background: #aec4ff;\n  border: 3px solid #aec4ff;\n  white-space: nowrap;\n}\n\n.frame-comment {\n  z-index: -10;\n  background: rgba(15, 80, 255, 0.2);\n  border: 6px solid transparent;\n}");

function ownKeys$1(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread$1(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$1(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var Comment = /*#__PURE__*/function () {
  function Comment(text, area, events, options) {
    var _options$id,
      _this = this;
    _classCallCheck__default["default"](this, Comment);
    _defineProperty__default["default"](this, "x", 0);
    _defineProperty__default["default"](this, "y", 0);
    _defineProperty__default["default"](this, "width", 0);
    _defineProperty__default["default"](this, "height", 0);
    _defineProperty__default["default"](this, "links", []);
    _defineProperty__default["default"](this, "prevPosition", null);
    _defineProperty__default["default"](this, "dragOrigin", null);
    this.text = text;
    this.area = area;
    this.events = events;
    this.id = (_options$id = options === null || options === void 0 ? void 0 : options.id) !== null && _options$id !== void 0 ? _options$id : rete.getUID();
    this.element = document.createElement('div');
    this.nested = document.createElement('div');
    this.element.appendChild(this.nested);
    this.element.addEventListener('contextmenu', this.onContextMenu.bind(this));
    this.dragHandler = new reteAreaPlugin.Drag();
    this.dragHandler.initialize(this.nested, {
      getCurrentPosition: function getCurrentPosition() {
        return {
          x: _this.x,
          y: _this.y
        };
      },
      getZoom: function getZoom() {
        return 1;
      }
    }, {
      start: function start() {
        var _this$events;
        _this.dragOrigin = {
          x: _this.x,
          y: _this.y
        };
        _this.prevPosition = _objectSpread$1({}, area.area.pointer);
        if ((_this$events = _this.events) !== null && _this$events !== void 0 && _this$events.pick) {
          _this.events.pick();
        }
      },
      translate: function translate() {
        if (_this.prevPosition) {
          var pointer = _objectSpread$1({}, area.area.pointer);
          var dx = pointer.x - _this.prevPosition.x;
          var dy = pointer.y - _this.prevPosition.y;
          void _this.translate(dx, dy);
          _this.prevPosition = pointer;
        }
      },
      drag: function drag() {
        void _this.finishDrag();
      }
    });
    this.update();
  }
  return _createClass__default["default"](Comment, [{
    key: "linkTo",
    value: function linkTo(ids) {
      this.links = ids;
    }
  }, {
    key: "linkedTo",
    value: function linkedTo(nodeId) {
      return this.links.includes(nodeId);
    }
  }, {
    key: "onContextMenu",
    value: function onContextMenu(e) {
      var _this$events2;
      e.preventDefault();
      e.stopPropagation();
      if ((_this$events2 = this.events) !== null && _this$events2 !== void 0 && _this$events2.contextMenu) {
        this.events.contextMenu();
      }
    }
  }, {
    key: "translate",
    value: function () {
      var _translate = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(dx, dy, sources) {
        var _this$events3;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              this.x += dx;
              this.y += dy;
              if (!((_this$events3 = this.events) !== null && _this$events3 !== void 0 && _this$events3.translate)) {
                _context.next = 5;
                break;
              }
              _context.next = 5;
              return this.events.translate(dx, dy, sources);
            case 5:
              this.update();
            case 6:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function translate(_x, _x2, _x3) {
        return _translate.apply(this, arguments);
      }
      return translate;
    }()
  }, {
    key: "select",
    value: function select() {
      this.nested.classList.add('selected');
    }
  }, {
    key: "unselect",
    value: function unselect() {
      this.nested.classList.remove('selected');
    }
  }, {
    key: "update",
    value: function update() {
      this.nested.innerText = this.text;
      this.nested.style.transform = "translate(".concat(this.x, "px, ").concat(this.y, "px)");
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.dragHandler.destroy();
    }
  }, {
    key: "finishDrag",
    value: function () {
      var _finishDrag = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee2() {
        var _this$events5, _this$events6, _this$events6$dragged;
        var origin, _this$events4, _this$events4$drag, prevLinks;
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              this.prevPosition = null;
              origin = this.dragOrigin;
              this.dragOrigin = null;
              if (origin) {
                _context2.next = 6;
                break;
              }
              (_this$events4 = this.events) === null || _this$events4 === void 0 ? void 0 : (_this$events4$drag = _this$events4.drag) === null || _this$events4$drag === void 0 ? void 0 : _this$events4$drag.call(_this$events4);
              return _context2.abrupt("return");
            case 6:
              prevLinks = _toConsumableArray__default["default"](this.links);
              if ((_this$events5 = this.events) !== null && _this$events5 !== void 0 && _this$events5.drag) {
                this.events.drag();
              }
              _context2.next = 10;
              return (_this$events6 = this.events) === null || _this$events6 === void 0 ? void 0 : (_this$events6$dragged = _this$events6.dragged) === null || _this$events6$dragged === void 0 ? void 0 : _this$events6$dragged.call(_this$events6, origin, prevLinks);
            case 10:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function finishDrag() {
        return _finishDrag.apply(this, arguments);
      }
      return finishDrag;
    }()
  }]);
}();

function intersectRect(r1, r2) {
  return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}
function containsRect(r1, r2) {
  return r2.left > r1.left && r2.right < r1.right && r2.top > r1.top && r2.bottom < r1.bottom;
}
function nodesBBox(editor, area, ids, margin) {
  var marginRect = typeof margin === 'number' ? {
    left: margin,
    top: margin,
    right: margin,
    bottom: margin
  } : margin;
  var rects = ids.map(function (id) {
    var view = area.nodeViews.get(id);
    if (!view) return null;
    var _editor$getNode = editor.getNode(id),
      width = _editor$getNode.width,
      height = _editor$getNode.height;
    return {
      id: id,
      position: view.position,
      width: width,
      height: height
    };
  }).filter(function (item) {
    return Boolean(item);
  });
  if (rects.length === 0) return null;
  var left = Math.min.apply(Math, _toConsumableArray__default["default"](rects.map(function (p) {
    return p.position.x;
  }))) - marginRect.left;
  var top = Math.min.apply(Math, _toConsumableArray__default["default"](rects.map(function (p) {
    return p.position.y;
  }))) - marginRect.top;
  var right = Math.max.apply(Math, _toConsumableArray__default["default"](rects.map(function (rect) {
    return rect.position.x + rect.width;
  }))) + marginRect.right;
  var bottom = Math.max.apply(Math, _toConsumableArray__default["default"](rects.map(function (rect) {
    return rect.position.y + rect.height;
  }))) + marginRect.bottom;
  return {
    left: left,
    right: right,
    top: top,
    bottom: bottom,
    width: Math.abs(left - right),
    height: Math.abs(top - bottom),
    getCenter: function getCenter() {
      return [(left + right) / 2, (top + bottom) / 2];
    }
  };
}
function trackedTranslate(props) {
  var active = new Map();
  var increment = function increment(id) {
    var _active$get;
    return active.set(id, ((_active$get = active.get(id)) !== null && _active$get !== void 0 ? _active$get : 0) + 1);
  };
  var decrement = function decrement(id) {
    var _active$get2;
    return active.set(id, ((_active$get2 = active.get(id)) !== null && _active$get2 !== void 0 ? _active$get2 : 0) - 1);
  };
  return {
    translate: function translate(id, x, y) {
      return _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee() {
        var view, previous;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              view = props.area.nodeViews.get(id);
              if (view) {
                _context.next = 3;
                break;
              }
              throw new Error('cannot find parent node view');
            case 3:
              previous = view.position;
              if (!(previous.x !== x || previous.y !== y)) {
                _context.next = 9;
                break;
              }
              increment(id);
              _context.next = 8;
              return view.translate(x, y);
            case 8:
              decrement(id);
            case 9:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }))();
    },
    isTranslating: function isTranslating(id) {
      var _active$get3;
      return ((_active$get3 = active.get(id)) !== null && _active$get3 !== void 0 ? _active$get3 : 0) > 0;
    }
  };
}
function trackedTranslateComment(comments) {
  var activeTranslations = new Map();
  var increment = function increment(id) {
    var _activeTranslations$g;
    return activeTranslations.set(id, ((_activeTranslations$g = activeTranslations.get(id)) !== null && _activeTranslations$g !== void 0 ? _activeTranslations$g : 0) + 1);
  };
  var decrement = function decrement(id) {
    var _activeTranslations$g2;
    return activeTranslations.set(id, ((_activeTranslations$g2 = activeTranslations.get(id)) !== null && _activeTranslations$g2 !== void 0 ? _activeTranslations$g2 : 0) - 1);
  };
  return {
    translate: function translate(id, dx, dy, sources) {
      return _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee2() {
        var comment;
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              comment = comments.get(id);
              if (comment) {
                _context2.next = 3;
                break;
              }
              throw new Error('cannot find comment');
            case 3:
              if (!(dx !== 0 || dy !== 0)) {
                _context2.next = 8;
                break;
              }
              increment(id);
              _context2.next = 7;
              return comment.translate(dx, dy, sources);
            case 7:
              decrement(id);
            case 8:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }))();
    },
    resize: function resize(id) {
      return _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee3() {
        var comment;
        return _regeneratorRuntime__default["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              comment = comments.get(id);
              if (comment) {
                _context3.next = 3;
                break;
              }
              throw new Error('cannot find comment');
            case 3:
              if (comment.resize) {
                _context3.next = 5;
                break;
              }
              throw new Error('comment does not support resize');
            case 5:
              increment(id);
              _context3.next = 8;
              return comment.resize();
            case 8:
              decrement(id);
            case 9:
            case "end":
              return _context3.stop();
          }
        }, _callee3);
      }))();
    },
    isTranslating: function isTranslating(id) {
      var _activeTranslations$g3;
      return ((_activeTranslations$g3 = activeTranslations.get(id)) !== null && _activeTranslations$g3 !== void 0 ? _activeTranslations$g3 : 0) > 0;
    },
    isResizing: function isResizing(id) {
      var _activeTranslations$g4;
      return ((_activeTranslations$g4 = activeTranslations.get(id)) !== null && _activeTranslations$g4 !== void 0 ? _activeTranslations$g4 : 0) > 0;
    }
  };
}
function trackDragging() {
  var ids = new Set();
  return {
    start: function start(id) {
      ids.add(id);
    },
    stop: function stop(id) {
      ids["delete"](id);
    },
    isDragging: function isDragging(id) {
      return ids.has(id);
    }
  };
}

function _callSuper$2(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct$2() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct$2() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct$2 = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet$2(t, e, o, r) { var p = _get__default["default"](_getPrototypeOf__default["default"](1 & r ? t.prototype : t), e, o); return 2 & r && "function" == typeof p ? function (t) { return p.apply(o, t); } : p; }
var FrameComment = /*#__PURE__*/function (_Comment) {
  function FrameComment(text, area, editor, events, options) {
    var _this;
    _classCallCheck__default["default"](this, FrameComment);
    _this = _callSuper$2(this, FrameComment, [text, area, {
      contextMenu: function contextMenu() {
        var _events$contextMenu;
        events === null || events === void 0 ? void 0 : (_events$contextMenu = events.contextMenu) === null || _events$contextMenu === void 0 ? void 0 : _events$contextMenu.call(events, _assertThisInitialized__default["default"](_this));
      },
      pick: function pick() {
        var _events$pick;
        events === null || events === void 0 ? void 0 : (_events$pick = events.pick) === null || _events$pick === void 0 ? void 0 : _events$pick.call(events, _assertThisInitialized__default["default"](_this));
      },
      translate: function () {
        var _translate = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(dx, dy, sources) {
          return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                if (!(events !== null && events !== void 0 && events.translate)) {
                  _context.next = 3;
                  break;
                }
                _context.next = 3;
                return events.translate(_assertThisInitialized__default["default"](_this), dx, dy, sources);
              case 3:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }));
        function translate(_x, _x2, _x3) {
          return _translate.apply(this, arguments);
        }
        return translate;
      }(),
      drag: function drag() {
        return 1;
      },
      dragged: function () {
        var _dragged = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee2(previous, prevLinks) {
          return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                if (!(events !== null && events !== void 0 && events.dragged)) {
                  _context2.next = 3;
                  break;
                }
                _context2.next = 3;
                return events.dragged(_assertThisInitialized__default["default"](_this), previous, prevLinks);
              case 3:
              case "end":
                return _context2.stop();
            }
          }, _callee2);
        }));
        function dragged(_x4, _x5) {
          return _dragged.apply(this, arguments);
        }
        return dragged;
      }()
    }, options]);
    _defineProperty__default["default"](_this, "width", 100);
    _defineProperty__default["default"](_this, "height", 100);
    _defineProperty__default["default"](_this, "links", []);
    _this.editor = editor;
    _this.nested.className = 'frame-comment';
    return _this;
  }
  _inherits__default["default"](FrameComment, _Comment);
  return _createClass__default["default"](FrameComment, [{
    key: "getRect",
    value: function getRect() {
      return {
        left: this.x,
        top: this.y,
        right: this.x + this.width,
        bottom: this.y + this.height
      };
    }
  }, {
    key: "contains",
    value: function contains(nodeId) {
      var view = this.area.nodeViews.get(nodeId);
      var node = this.editor.getNode(nodeId);
      if (!view) return false;
      return containsRect(this.getRect(), {
        left: view.position.x,
        top: view.position.y,
        right: view.position.x + node.width,
        bottom: view.position.y + node.height
      });
    }
  }, {
    key: "intersects",
    value: function intersects(nodeId) {
      var view = this.area.nodeViews.get(nodeId);
      var node = this.editor.getNode(nodeId);
      if (!view) return false;
      return intersectRect(this.getRect(), {
        left: view.position.x,
        top: view.position.y,
        right: view.position.x + node.width,
        bottom: view.position.y + node.height
      });
    }
  }, {
    key: "linkTo",
    value: function linkTo(ids) {
      _superPropGet$2(FrameComment, "linkTo", this, 3)([ids]);
      void this.resize();
    }
  }, {
    key: "resize",
    value: function () {
      var _resize = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee3() {
        var bbox;
        return _regeneratorRuntime__default["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              bbox = nodesBBox(this.editor, this.area, this.links, {
                top: 50,
                left: 20,
                right: 20,
                bottom: 20
              });
              if (!bbox) {
                _context3.next = 8;
                break;
              }
              this.width = bbox.width;
              this.height = bbox.height;
              _context3.next = 6;
              return this.translate(bbox.left - this.x, bbox.top - this.y, this.links);
            case 6:
              _context3.next = 12;
              break;
            case 8:
              this.width = 100;
              this.height = 100;
              _context3.next = 12;
              return this.translate(0, 0, this.links);
            case 12:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function resize() {
        return _resize.apply(this, arguments);
      }
      return resize;
    }()
  }, {
    key: "update",
    value: function update() {
      _superPropGet$2(FrameComment, "update", this, 3)([]);
      this.nested.style.width = "".concat(this.width, "px");
      this.nested.style.height = "".concat(this.height, "px");
    }
  }]);
}(Comment);

function frameBounds(comment) {
  return {
    x: comment.x,
    y: comment.y,
    width: comment.width,
    height: comment.height
  };
}
function sameLinkSet(prev, next) {
  return prev.length === next.length && prev.every(function (linkId) {
    return next.includes(linkId);
  });
}
function nextLinks(frame, nodeId) {
  var links = frame.links.filter(function (id) {
    return id !== nodeId;
  });
  return frame.intersects(nodeId) ? [].concat(_toConsumableArray__default["default"](links), [nodeId]) : links;
}
function syncFrameOnNodeDrop(_x, _x2) {
  return _syncFrameOnNodeDrop.apply(this, arguments);
}
function _syncFrameOnNodeDrop() {
  _syncFrameOnNodeDrop = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(frame, nodeId) {
    var prevLinks, next, previous;
    return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          prevLinks = _toConsumableArray__default["default"](frame.links);
          next = nextLinks(frame, nodeId);
          if (!sameLinkSet(prevLinks, next)) {
            _context.next = 7;
            break;
          }
          if (!frame.linkedTo(nodeId)) {
            _context.next = 6;
            break;
          }
          _context.next = 6;
          return frame.resize();
        case 6:
          return _context.abrupt("return", null);
        case 7:
          previous = frameBounds(frame);
          frame.linkTo(next);
          _context.next = 11;
          return frame.resize();
        case 11:
          return _context.abrupt("return", {
            id: frame.id,
            links: {
              prev: prevLinks,
              next: _toConsumableArray__default["default"](frame.links)
            },
            previous: previous,
            current: frameBounds(frame)
          });
        case 12:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _syncFrameOnNodeDrop.apply(this, arguments);
}
function detachNodeFromFrame(_x3, _x4) {
  return _detachNodeFromFrame.apply(this, arguments);
}
function _detachNodeFromFrame() {
  _detachNodeFromFrame = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee2(frame, nodeId) {
    var prevLinks, previous;
    return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          if (frame.linkedTo(nodeId)) {
            _context2.next = 2;
            break;
          }
          return _context2.abrupt("return", null);
        case 2:
          prevLinks = _toConsumableArray__default["default"](frame.links);
          previous = frameBounds(frame);
          frame.linkTo(frame.links.filter(function (id) {
            return id !== nodeId;
          }));
          _context2.next = 7;
          return frame.resize();
        case 7:
          return _context2.abrupt("return", {
            id: frame.id,
            links: {
              prev: prevLinks,
              next: _toConsumableArray__default["default"](frame.links)
            },
            previous: previous,
            current: frameBounds(frame)
          });
        case 8:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _detachNodeFromFrame.apply(this, arguments);
}

function _callSuper$1(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct$1() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct$1() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct$1 = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet$1(t, e, o, r) { var p = _get__default["default"](_getPrototypeOf__default["default"](1 & r ? t.prototype : t), e, o); return 2 & r && "function" == typeof p ? function (t) { return p.apply(o, t); } : p; }
var InlineComment = /*#__PURE__*/function (_Comment) {
  function InlineComment(text, area, events, options) {
    var _this;
    _classCallCheck__default["default"](this, InlineComment);
    _this = _callSuper$1(this, InlineComment, [text, area, {
      contextMenu: function contextMenu() {
        var _events$contextMenu;
        events === null || events === void 0 ? void 0 : (_events$contextMenu = events.contextMenu) === null || _events$contextMenu === void 0 ? void 0 : _events$contextMenu.call(events, _assertThisInitialized__default["default"](_this));
      },
      pick: function pick() {
        var _events$pick;
        events === null || events === void 0 ? void 0 : (_events$pick = events.pick) === null || _events$pick === void 0 ? void 0 : _events$pick.call(events, _assertThisInitialized__default["default"](_this));
      },
      translate: function () {
        var _translate = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(dx, dy, sources) {
          return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                if (!(events !== null && events !== void 0 && events.translate)) {
                  _context.next = 3;
                  break;
                }
                _context.next = 3;
                return events.translate(_assertThisInitialized__default["default"](_this), dx, dy, sources);
              case 3:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }));
        function translate(_x, _x2, _x3) {
          return _translate.apply(this, arguments);
        }
        return translate;
      }(),
      drag: function drag() {
        _this.link();
      },
      dragged: function () {
        var _dragged = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee2(previous, prevLinks) {
          return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                if (!(events !== null && events !== void 0 && events.dragged)) {
                  _context2.next = 3;
                  break;
                }
                _context2.next = 3;
                return events.dragged(_assertThisInitialized__default["default"](_this), previous, prevLinks);
              case 3:
              case "end":
                return _context2.stop();
            }
          }, _callee2);
        }));
        function dragged(_x4, _x5) {
          return _dragged.apply(this, arguments);
        }
        return dragged;
      }()
    }, options]);
    _defineProperty__default["default"](_this, "width", 80);
    _defineProperty__default["default"](_this, "height", 54);
    _this.nested.className = 'inline-comment';
    return _this;
  }
  _inherits__default["default"](InlineComment, _Comment);
  return _createClass__default["default"](InlineComment, [{
    key: "link",
    value: function link() {
      var intersection = this.getIntersectNode();
      this.linkTo(intersection ? [intersection.id] : []);
    }
  }, {
    key: "getIntersectNode",
    value: function getIntersectNode() {
      var commRect = this.nested.getBoundingClientRect();
      return Array.from(this.area.nodeViews).map(function (_ref) {
        var _ref2 = _slicedToArray__default["default"](_ref, 2),
          id = _ref2[0],
          view = _ref2[1];
        return {
          id: id,
          rect: view.element.getBoundingClientRect()
        };
      }).find(function (_ref3) {
        var rect = _ref3.rect;
        return intersectRect(commRect, rect);
      });
    }
  }, {
    key: "update",
    value: function update() {
      _superPropGet$1(InlineComment, "update", this, 3)([]);
      this.width = Math.max(80, this.nested.clientWidth);
    }
  }]);
}(Comment);

function _createForOfIteratorHelper$1(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray$1(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray$1(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray$1(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$1(r, a) : void 0; } }
function _arrayLikeToArray$1(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function createCommentNodeSync(deps) {
  var area = deps.area,
    comments = deps.comments,
    membershipState = deps.membershipState,
    emit = deps.emit;
  var _trackedTranslate = trackedTranslate({
      area: area
    }),
    translate = _trackedTranslate.translate,
    isTranslating = _trackedTranslate.isTranslating;
  var commentTracker = trackedTranslateComment(comments);
  var dragging = trackDragging();
  var nodeDragPrevious = new Map();
  var collectFrameMembership = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(nodeId) {
      var frames, _i, _Array$from, comment, entry;
      return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            frames = [];
            _i = 0, _Array$from = Array.from(comments.values());
          case 2:
            if (!(_i < _Array$from.length)) {
              _context.next = 12;
              break;
            }
            comment = _Array$from[_i];
            if (!(comment instanceof FrameComment)) {
              _context.next = 9;
              break;
            }
            _context.next = 7;
            return syncFrameOnNodeDrop(comment, nodeId);
          case 7:
            entry = _context.sent;
            if (entry) frames.push(entry);
          case 9:
            _i++;
            _context.next = 2;
            break;
          case 12:
            return _context.abrupt("return", frames);
          case 13:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function collectFrameMembership(_x) {
      return _ref.apply(this, arguments);
    };
  }();
  var emitMembership = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee2(frames, node) {
      return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            if (frames.length) {
              _context2.next = 2;
              break;
            }
            return _context2.abrupt("return");
          case 2:
            _context2.next = 4;
            return emit({
              type: 'commentmembershipchanged',
              data: node ? {
                node: node,
                frames: frames
              } : {
                frames: frames
              }
            });
          case 4:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return function emitMembership(_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }();
  return {
    beginNodeDrag: function beginNodeDrag(nodeId) {
      dragging.start(nodeId);
      var view = area.nodeViews.get(nodeId);
      if (view) nodeDragPrevious.set(nodeId, _objectSpread({}, view.position));
    },
    reorderLinkedComments: function reorderLinkedComments(element) {
      var views = Array.from(area.nodeViews.entries());
      var matchedView = views.find(function (_ref3) {
        var _ref4 = _slicedToArray__default["default"](_ref3, 2),
          view = _ref4[1];
        return view.element === element;
      });
      if (!matchedView) return;
      var linkedComments = Array.from(comments.entries()).filter(function (_ref5) {
        var _ref6 = _slicedToArray__default["default"](_ref5, 2),
          comment = _ref6[1];
        return comment.linkedTo(matchedView[0]);
      });
      var _iterator = _createForOfIteratorHelper$1(linkedComments),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray__default["default"](_step.value, 2),
            comment = _step$value[1];
          if (comment instanceof InlineComment) {
            area.area.content.reorder(comment.element, matchedView[1].element.nextElementSibling);
          }
          if (comment instanceof FrameComment) {
            area.area.content.reorder(comment.element, area.area.content.holder.firstChild);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    onNodeTranslated: function onNodeTranslated(data) {
      return _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee4() {
        var id, position, previous, dx, dy;
        return _regeneratorRuntime__default["default"].wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              if (!membershipState.restoring) {
                _context4.next = 2;
                break;
              }
              return _context4.abrupt("return");
            case 2:
              id = data.id, position = data.position, previous = data.previous;
              dx = position.x - previous.x;
              dy = position.y - previous.y;
              _context4.next = 7;
              return Promise.all(Array.from(comments.values()).filter(function (comment) {
                return comment.linkedTo(id);
              }).map(/*#__PURE__*/function () {
                var _ref7 = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee3(comment) {
                  return _regeneratorRuntime__default["default"].wrap(function _callee3$(_context3) {
                    while (1) switch (_context3.prev = _context3.next) {
                      case 0:
                        if (!(comment instanceof InlineComment && !commentTracker.isTranslating(comment.id))) {
                          _context3.next = 3;
                          break;
                        }
                        _context3.next = 3;
                        return commentTracker.translate(comment.id, dx, dy, [id]);
                      case 3:
                        if (!(comment instanceof FrameComment && !dragging.isDragging(id) && !commentTracker.isResizing(comment.id))) {
                          _context3.next = 6;
                          break;
                        }
                        _context3.next = 6;
                        return commentTracker.resize(comment.id);
                      case 6:
                      case "end":
                        return _context3.stop();
                    }
                  }, _callee3);
                }));
                return function (_x4) {
                  return _ref7.apply(this, arguments);
                };
              }()));
            case 7:
            case "end":
              return _context4.stop();
          }
        }, _callee4);
      }))();
    },
    onCommentTranslated: function onCommentTranslated(data) {
      return _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee6() {
        var id, dx, dy, sources, comment;
        return _regeneratorRuntime__default["default"].wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              id = data.id, dx = data.dx, dy = data.dy, sources = data.sources;
              comment = comments.get(id);
              if (comment instanceof FrameComment) {
                _context6.next = 4;
                break;
              }
              return _context6.abrupt("return");
            case 4:
              _context6.next = 6;
              return Promise.all(comment.links.filter(function (linkId) {
                return !(sources !== null && sources !== void 0 && sources.includes(linkId));
              }).map(function (linkId) {
                return {
                  linkId: linkId,
                  view: area.nodeViews.get(linkId)
                };
              }).map(/*#__PURE__*/function () {
                var _ref9 = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee5(_ref8) {
                  var linkId, view;
                  return _regeneratorRuntime__default["default"].wrap(function _callee5$(_context5) {
                    while (1) switch (_context5.prev = _context5.next) {
                      case 0:
                        linkId = _ref8.linkId, view = _ref8.view;
                        if (view) {
                          _context5.next = 3;
                          break;
                        }
                        return _context5.abrupt("return");
                      case 3:
                        _context5.next = 5;
                        return emit({
                          type: 'commentlinktranslate',
                          data: {
                            id: id,
                            link: linkId
                          }
                        });
                      case 5:
                        if (_context5.sent) {
                          _context5.next = 7;
                          break;
                        }
                        return _context5.abrupt("return");
                      case 7:
                        if (isTranslating(linkId)) {
                          _context5.next = 10;
                          break;
                        }
                        _context5.next = 10;
                        return translate(linkId, view.position.x + dx, view.position.y + dy);
                      case 10:
                      case "end":
                        return _context5.stop();
                    }
                  }, _callee5);
                }));
                return function (_x5) {
                  return _ref9.apply(this, arguments);
                };
              }()));
            case 6:
            case "end":
              return _context6.stop();
          }
        }, _callee6);
      }))();
    },
    finalizeNodeDrag: function finalizeNodeDrag(nodeId) {
      return _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee7() {
        var nodePrevious, nodeView, frames;
        return _regeneratorRuntime__default["default"].wrap(function _callee7$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              if (!membershipState.restoring) {
                _context7.next = 2;
                break;
              }
              return _context7.abrupt("return");
            case 2:
              nodePrevious = nodeDragPrevious.get(nodeId);
              nodeView = area.nodeViews.get(nodeId);
              _context7.next = 6;
              return collectFrameMembership(nodeId);
            case 6:
              frames = _context7.sent;
              if (!(frames.length && nodePrevious && nodeView)) {
                _context7.next = 10;
                break;
              }
              _context7.next = 10;
              return emitMembership(frames, {
                id: nodeId,
                previous: nodePrevious,
                current: _objectSpread({}, nodeView.position)
              });
            case 10:
              nodeDragPrevious["delete"](nodeId);
              dragging.stop(nodeId);
            case 12:
            case "end":
              return _context7.stop();
          }
        }, _callee7);
      }))();
    },
    cleanupOnNodeRemoved: function cleanupOnNodeRemoved(nodeId) {
      return _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee8() {
        var frames, _i2, _Array$from2, comment, entry;
        return _regeneratorRuntime__default["default"].wrap(function _callee8$(_context8) {
          while (1) switch (_context8.prev = _context8.next) {
            case 0:
              dragging.stop(nodeId);
              nodeDragPrevious["delete"](nodeId);
              frames = [];
              _i2 = 0, _Array$from2 = Array.from(comments.values());
            case 4:
              if (!(_i2 < _Array$from2.length)) {
                _context8.next = 15;
                break;
              }
              comment = _Array$from2[_i2];
              if (comment instanceof InlineComment && comment.linkedTo(nodeId)) {
                comment.linkTo([]);
              }
              if (!(comment instanceof FrameComment)) {
                _context8.next = 12;
                break;
              }
              _context8.next = 10;
              return detachNodeFromFrame(comment, nodeId);
            case 10:
              entry = _context8.sent;
              if (entry) frames.push(entry);
            case 12:
              _i2++;
              _context8.next = 4;
              break;
            case 15:
              _context8.next = 17;
              return emitMembership(frames);
            case 17:
            case "end":
              return _context8.stop();
          }
        }, _callee8);
      }))();
    }
  };
}

function createInlineHandlers(deps) {
  var area = deps.area,
    emit = deps.emit,
    editComment = deps.editComment;
  return {
    contextMenu: function contextMenu(_ref) {
      var id = _ref.id;
      return void editComment(id);
    },
    pick: function pick(item) {
      area.area.content.reorder(item.element, null);
      void emit({
        type: 'commentselected',
        data: item
      });
    },
    translate: function () {
      var _translate = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(_ref2, dx, dy, sources) {
        var id;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              id = _ref2.id;
              _context.next = 3;
              return emit({
                type: 'commenttranslated',
                data: {
                  id: id,
                  dx: dx,
                  dy: dy,
                  sources: sources
                }
              });
            case 3:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      function translate(_x, _x2, _x3, _x4) {
        return _translate.apply(this, arguments);
      }
      return translate;
    }(),
    dragged: function () {
      var _dragged = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee2(item, previous, prevLinks) {
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return emit({
                type: 'commentdragged',
                data: {
                  id: item.id,
                  previous: previous,
                  prevLinks: prevLinks
                }
              });
            case 2:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      function dragged(_x5, _x6, _x7) {
        return _dragged.apply(this, arguments);
      }
      return dragged;
    }()
  };
}
function createFrameHandlers(deps) {
  var area = deps.area,
    emit = deps.emit,
    editComment = deps.editComment;
  return {
    contextMenu: function contextMenu(_ref3) {
      var id = _ref3.id;
      return void editComment(id);
    },
    pick: function pick(item) {
      area.area.content.reorder(item.element, area.area.content.holder.firstChild);
      void emit({
        type: 'commentselected',
        data: item
      });
    },
    translate: function () {
      var _translate2 = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee3(_ref4, dx, dy, sources) {
        var id;
        return _regeneratorRuntime__default["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              id = _ref4.id;
              _context3.next = 3;
              return emit({
                type: 'commenttranslated',
                data: {
                  id: id,
                  dx: dx,
                  dy: dy,
                  sources: sources
                }
              });
            case 3:
            case "end":
              return _context3.stop();
          }
        }, _callee3);
      }));
      function translate(_x8, _x9, _x10, _x11) {
        return _translate2.apply(this, arguments);
      }
      return translate;
    }(),
    dragged: function () {
      var _dragged2 = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee4(item, previous, prevLinks) {
        return _regeneratorRuntime__default["default"].wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return emit({
                type: 'commentdragged',
                data: {
                  id: item.id,
                  previous: previous,
                  prevLinks: prevLinks
                }
              });
            case 2:
            case "end":
              return _context4.stop();
          }
        }, _callee4);
      }));
      function dragged(_x12, _x13, _x14) {
        return _dragged2.apply(this, arguments);
      }
      return dragged;
    }()
  };
}

/**
 * Enables synchronization between comments and the selector
 * @param plugin Comment plugin instance
 * @param selector Selector instance
 * @param accumulating Accumulating state
 */
function selectable(plugin, selector, accumulating) {
  // eslint-disable-next-line max-statements, complexity
  plugin.addPipe(/*#__PURE__*/function () {
    var _ref = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee2(context) {
      var link, comment, id, _id, _context$data, _id2, dx, dy;
      return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            if (!(!context || _typeof__default["default"](context) !== 'object' || !('type' in context))) {
              _context2.next = 2;
              break;
            }
            return _context2.abrupt("return", context);
          case 2:
            if (!(context.type === 'commentlinktranslate')) {
              _context2.next = 6;
              break;
            }
            link = context.data.link;
            if (!selector.isSelected({
              id: link,
              label: 'node'
            })) {
              _context2.next = 6;
              break;
            }
            return _context2.abrupt("return");
          case 6:
            if (!(context.type === 'commentselected')) {
              _context2.next = 16;
              break;
            }
            comment = context.data;
            id = comment.id;
            if (accumulating.active()) {
              _context2.next = 12;
              break;
            }
            _context2.next = 12;
            return selector.unselectAll();
          case 12:
            _context2.next = 14;
            return selector.add({
              id: id,
              label: 'comment',
              translate: function translate(dx, dy) {
                return _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee() {
                  return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
                    while (1) switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return plugin.translate(id, dx, dy);
                      case 2:
                      case "end":
                        return _context.stop();
                    }
                  }, _callee);
                }))();
              },
              unselect: function unselect() {
                plugin.unselect(id);
              }
            }, accumulating.active());
          case 14:
            comment.select();
            selector.pick({
              id: id,
              label: 'comment'
            });
          case 16:
            if (!(context.type === 'commentunselected')) {
              _context2.next = 20;
              break;
            }
            _id = context.data.id;
            _context2.next = 20;
            return selector.remove({
              id: _id,
              label: 'comment'
            });
          case 20:
            if (!(context.type === 'commenttranslated')) {
              _context2.next = 25;
              break;
            }
            _context$data = context.data, _id2 = _context$data.id, dx = _context$data.dx, dy = _context$data.dy;
            if (!selector.isPicked({
              id: _id2,
              label: 'comment'
            })) {
              _context2.next = 25;
              break;
            }
            _context2.next = 25;
            return selector.translate(dx, dy);
          case 25:
            return _context2.abrupt("return", context);
          case 26:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
}

/**
 * Comment plugin extensions
 * @module
 */

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    selectable: selectable
});

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet(t, e, o, r) { var p = _get__default["default"](_getPrototypeOf__default["default"](1 & r ? t.prototype : t), e, o); return 2 & r && "function" == typeof p ? function (t) { return p.apply(o, t); } : p; }
/**
 * A union of all possible signals that can be emitted by the comment plugin
 * @priority 9
 */
/**
 * Comment plugin properties
 */
/**
 * A plugin that provides comments for nodes
 * @priority 8
 */
var CommentPlugin = /*#__PURE__*/function (_Scope) {
  /**
   * @constructor
   * @param props Optional comment plugin properties
   */
  function CommentPlugin(props) {
    var _this;
    _classCallCheck__default["default"](this, CommentPlugin);
    _this = _callSuper(this, CommentPlugin, ['comment']);
    _defineProperty__default["default"](_this, "comments", new Map());
    _defineProperty__default["default"](_this, "membershipState", {
      restoring: false
    });
    _this.props = props;
    return _this;
  }
  _inherits__default["default"](CommentPlugin, _Scope);
  return _createClass__default["default"](CommentPlugin, [{
    key: "setParent",
    value: function setParent(scope) {
      var _this2 = this;
      _superPropGet(CommentPlugin, "setParent", this, 3)([scope]);
      this.area = this.parentScope(reteAreaPlugin.BaseAreaPlugin);
      this.editor = this.area.parentScope(rete.NodeEditor);
      var sync = createCommentNodeSync({
        area: this.area,
        comments: this.comments,
        membershipState: this.membershipState,
        emit: function emit(signal) {
          return _this2.emit(signal);
        }
      });
      this.addPipe(/*#__PURE__*/function () {
        var _ref = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(context) {
          return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                if (!(!context || _typeof__default["default"](context) !== 'object' || !('type' in context))) {
                  _context.next = 2;
                  break;
                }
                return _context.abrupt("return", context);
              case 2:
                if (context.type === 'nodepicked') sync.beginNodeDrag(context.data.id);
                if (context.type === 'reordered') sync.reorderLinkedComments(context.data.element);
                if (!(context.type === 'nodetranslated')) {
                  _context.next = 7;
                  break;
                }
                _context.next = 7;
                return sync.onNodeTranslated(context.data);
              case 7:
                if (!(context.type === 'commenttranslated')) {
                  _context.next = 10;
                  break;
                }
                _context.next = 10;
                return sync.onCommentTranslated(context.data);
              case 10:
                if (!(context.type === 'nodedragged')) {
                  _context.next = 13;
                  break;
                }
                _context.next = 13;
                return sync.finalizeNodeDrag(context.data.id);
              case 13:
                return _context.abrupt("return", context);
              case 14:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }));
        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
      this.editor.addPipe(/*#__PURE__*/function () {
        var _ref2 = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee2(context) {
          return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                if (!(context.type === 'noderemoved')) {
                  _context2.next = 3;
                  break;
                }
                _context2.next = 3;
                return sync.cleanupOnNodeRemoved(context.data.id);
              case 3:
                return _context2.abrupt("return", context);
              case 4:
              case "end":
                return _context2.stop();
            }
          }, _callee2);
        }));
        return function (_x2) {
          return _ref2.apply(this, arguments);
        };
      }());
    }

    /**
     * Trigger edit form for a comment
     * @param id Comment id
     */
  }, {
    key: "editComment",
    value: (function () {
      var _editComment = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee3(id) {
        var _this$props;
        var comment, previousText, newText;
        return _regeneratorRuntime__default["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              comment = this.comments.get(id);
              if (comment) {
                _context3.next = 3;
                break;
              }
              throw new Error('comment not found');
            case 3:
              previousText = comment.text;
              if (!((_this$props = this.props) !== null && _this$props !== void 0 && _this$props.edit)) {
                _context3.next = 10;
                break;
              }
              _context3.next = 7;
              return this.props.edit(comment);
            case 7:
              _context3.t0 = _context3.sent;
              _context3.next = 11;
              break;
            case 10:
              _context3.t0 = prompt('Edit comment', comment.text);
            case 11:
              newText = _context3.t0;
              if (newText !== null) {
                if (newText !== previousText) {
                  comment.text = newText;
                  comment.update();
                  void this.emit({
                    type: 'editcomment',
                    data: comment
                  });
                  void this.emit({
                    type: 'commentedited',
                    data: {
                      comment: comment,
                      previousText: previousText
                    }
                  });
                }
                if (comment instanceof FrameComment) {
                  void comment.resize();
                } else {
                  comment.update();
                }
              }
            case 13:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function editComment(_x3) {
        return _editComment.apply(this, arguments);
      }
      return editComment;
    }())
  }, {
    key: "handlerDeps",
    value: function handlerDeps() {
      var _this3 = this;
      return {
        area: this.area,
        emit: function emit(signal) {
          return _this3.emit(signal);
        },
        editComment: function editComment(id) {
          return _this3.editComment(id);
        }
      };
    }

    /**
     * Restores a comment from serialized state (e.g. undo after delete)
     */
    // eslint-disable-next-line max-statements
  }, {
    key: "restoreComment",
    value: function restoreComment(data) {
      if (data.kind === 'inline') {
        var _comment = new InlineComment(data.text, this.area, createInlineHandlers(this.handlerDeps()), {
          id: data.id
        });
        _comment.x = data.x;
        _comment.y = data.y;
        _comment.width = data.width;
        _comment.height = data.height;
        _comment.linkTo(_toConsumableArray__default["default"](data.links));
        this.add(_comment);
        return _comment;
      }
      var comment = new FrameComment(data.text, this.area, this.editor, createFrameHandlers(this.handlerDeps()), {
        id: data.id
      });
      comment.x = data.x;
      comment.y = data.y;
      comment.width = data.width;
      comment.height = data.height;
      comment.linkTo(_toConsumableArray__default["default"](data.links));
      this.add(comment);
      this.area.area.content.reorder(comment.element, this.area.area.content.holder.firstChild);
      return comment;
    }

    /**
     * Adds an inline comment which is represented by a block with text at certain position, which is attached to the node.
     * When user translates a node, the comment will be translated as well.
     * When user drops a comment on a node, the comment will be linked to the node.
     * @param text Comment text
     * @param position Comment position
     * @param link Node ID the comment is linked with
     * @returns comment that was created
     */
  }, {
    key: "addInline",
    value: function addInline(text, _ref3, link) {
      var _ref4 = _slicedToArray__default["default"](_ref3, 2),
        x = _ref4[0],
        y = _ref4[1];
      var comment = new InlineComment(text, this.area, createInlineHandlers(this.handlerDeps()));
      comment.x = x;
      comment.y = y;
      if (link) comment.linkTo([link]);
      this.add(comment);
      return comment;
    }

    /**
     * Adds a frame comment. Represents a rectangle with a text and nodes linked to it.
     * When user translates a comment, all linked nodes will be translated as well.
     * When user drops a node on a comment, the node will be linked to the comment.
     * @param text Comment text
     * @param links List of node IDs the comment is linked with
     * @returns comment that was created
     */
  }, {
    key: "addFrame",
    value: function addFrame(text) {
      var links = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var comment = new FrameComment(text, this.area, this.editor, createFrameHandlers(this.handlerDeps()));
      comment.linkTo(links);
      this.add(comment);
      this.area.area.content.reorder(comment.element, this.area.area.content.holder.firstChild);
      return comment;
    }
  }, {
    key: "add",
    value: function add(comment) {
      comment.update();
      this.comments.set(comment.id, comment);
      this.area.area.content.add(comment.element);
      void this.emit({
        type: 'commentcreated',
        data: comment
      });
    }

    /**
     * Removes a comment
     * @param id Comment id
     */
  }, {
    key: "delete",
    value: function _delete(id) {
      var comment = this.comments.get(id);
      if (!comment) return;
      this.unselect(id);
      this.area.area.content.remove(comment.element);
      this.comments["delete"](comment.id);
      comment.destroy();
      void this.emit({
        type: 'commentremoved',
        data: comment
      });
    }

    /**
     * Updates comment links and resizes frame comments when needed
     */
  }, {
    key: "setCommentLinks",
    value: (function () {
      var _setCommentLinks = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee4(id, links) {
        var comment;
        return _regeneratorRuntime__default["default"].wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              comment = this.comments.get(id);
              if (comment) {
                _context4.next = 3;
                break;
              }
              return _context4.abrupt("return");
            case 3:
              comment.linkTo(_toConsumableArray__default["default"](links));
              if (!(comment instanceof FrameComment)) {
                _context4.next = 7;
                break;
              }
              _context4.next = 7;
              return comment.resize();
            case 7:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function setCommentLinks(_x4, _x5) {
        return _setCommentLinks.apply(this, arguments);
      }
      return setCommentLinks;
    }()
    /**
     * Restores frame bounds and links without recalculating from linked nodes.
     * Assigns `links` directly instead of `linkTo` to avoid an automatic resize.
     */
    )
  }, {
    key: "setFrameState",
    value: function setFrameState(id, state) {
      var comment = this.comments.get(id);
      if (!(comment instanceof FrameComment)) return;
      comment.links = _toConsumableArray__default["default"](state.links);
      comment.x = state.x;
      comment.y = state.y;
      comment.width = state.width;
      comment.height = state.height;
      comment.update();
    }

    /**
     * Restores frame membership and node position without triggering auto-resize side effects
     */
  }, {
    key: "restoreNodeFrameMembership",
    value: (function () {
      var _restoreNodeFrameMembership = _asyncToGenerator__default["default"](/*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee5(data) {
        var _iterator, _step, frame, view;
        return _regeneratorRuntime__default["default"].wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              this.membershipState.restoring = true;
              _context5.prev = 1;
              _iterator = _createForOfIteratorHelper(data.frames);
              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  frame = _step.value;
                  this.setFrameState(frame.id, frame.state);
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
              if (!data.node) {
                _context5.next = 9;
                break;
              }
              view = this.area.nodeViews.get(data.node.id);
              if (!view) {
                _context5.next = 9;
                break;
              }
              _context5.next = 9;
              return view.translate(data.node.position.x, data.node.position.y);
            case 9:
              _context5.prev = 9;
              this.membershipState.restoring = false;
              return _context5.finish(9);
            case 12:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this, [[1,, 9, 12]]);
      }));
      function restoreNodeFrameMembership(_x6) {
        return _restoreNodeFrameMembership.apply(this, arguments);
      }
      return restoreNodeFrameMembership;
    }()
    /**
     * Translates a comment
     * @param id Comment id
     * @param dx Delta x
     * @param dy Delta y
     */
    )
  }, {
    key: "translate",
    value: function translate(id, dx, dy) {
      var comment = this.comments.get(id);
      if (!comment) return Promise.resolve();
      return comment.translate(dx, dy);
    }

    /**
     * Selects a comment
     * @param id Comment id
     */
  }, {
    key: "select",
    value: function select(id) {
      var comment = this.comments.get(id);
      if (!comment) return;
      comment.select();
      void this.emit({
        type: 'commentselected',
        data: comment
      });
    }

    /**
     * Unselects a comment
     * @param id Comment id
     */
  }, {
    key: "unselect",
    value: function unselect(id) {
      var comment = this.comments.get(id);
      if (!comment) return;
      comment.unselect();
      void this.emit({
        type: 'commentunselected',
        data: comment
      });
    }

    /**
     * Removes all comments
     */
  }, {
    key: "clear",
    value: function clear() {
      var _this4 = this;
      Array.from(this.comments.keys()).map(function (id) {
        _this4["delete"](id);
      });
    }
  }]);
}(rete.Scope);

exports.Comment = Comment;
exports.CommentExtensions = index;
exports.CommentPlugin = CommentPlugin;
exports.FrameComment = FrameComment;
exports.InlineComment = InlineComment;
//# sourceMappingURL=rete-comment-plugin.common.js.map
