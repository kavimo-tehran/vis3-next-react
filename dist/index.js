"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Vis3 = void 0;
var _react = _interopRequireWildcard(require("react"));
var cache;
function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var r, c, a = Object.defineProperty, n = { __proto__: null, "default": e }; if (Object(e) !== e) return n; if (cache || "function" != typeof WeakMap || (cache = new WeakMap()), cache) { if (cache.has(e)) return cache.get(e); cache.set(e, n); } for (c in e) "default" !== c && {}.hasOwnProperty.call(e, c) && ((r = a && Object.getOwnPropertyDescriptor(e, c)) && (r.get || r.set) ? a(n, c, r) : n[c] = e[c]); return n; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var Vis3 = exports.Vis3 = function Vis3(_ref) {
  var domainName = _ref.domainName,
    ID = _ref.ID,
    autoplay = _ref.autoplay,
    size = _ref.size,
    onLoad = _ref.onLoad;
  // Set after mount, not during render: a render-time id differs between the server HTML
  // and hydration, React keeps the server's, and the embed would never find its div.
  var _useState = (0, _react.useState)(''),
    _useState2 = _slicedToArray(_useState, 2),
    containerID = _useState2[0],
    setContainerID = _useState2[1];
  (0, _react.useEffect)(function () {
    setContainerID(Math.random().toString(36).substring(2));
  }, []);

  // A ref, so an inline onLoad does not rebuild the player on every parent render
  var onLoadRef = (0, _react.useRef)(onLoad);
  onLoadRef.current = onLoad;
  (0, _react.useEffect)(function () {
    if (!containerID) return;
    var callback = "vis_callback_".concat(containerID);
    var api = null;
    var cancelled = false;
    window[callback] = function (result, vis) {
      var _onLoadRef$current;
      if (cancelled) {
        var _result$api$actions$D, _result$api$actions;
        // Unmounted while the embed was still loading
        delete window[callback];
        return (_result$api$actions$D = (_result$api$actions = result.api.actions).Destroy) === null || _result$api$actions$D === void 0 ? void 0 : _result$api$actions$D.call(_result$api$actions);
      }
      api = result.api;
      (_onLoadRef$current = onLoadRef.current) === null || _onLoadRef$current === void 0 || _onLoadRef$current.call(onLoadRef, result, vis);
    };
    var script = document.createElement('script');
    script.async = true;
    script.src = "https://".concat(domainName || '', "/").concat(ID || '', "/embed?container=").concat(containerID, "&callback=").concat(callback).concat(autoplay ? '&autoplay=true' : '').concat(size ? "&size=".concat(size) : '');
    document.body.appendChild(script);
    return function () {
      var _api$actions$Destroy, _api$actions;
      cancelled = true;
      script.remove();
      if (!api) return;
      // Removing the script frees nothing: the player it built lives on in window.Vis
      (_api$actions$Destroy = (_api$actions = api.actions).Destroy) === null || _api$actions$Destroy === void 0 || _api$actions$Destroy.call(_api$actions);
      delete window[callback];
    };
  }, [containerID, domainName, ID, autoplay, size]);
  return /*#__PURE__*/_react["default"].createElement("div", {
    id: containerID
  });
};