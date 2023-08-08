var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/loglevel/lib/loglevel.js
var require_loglevel = __commonJS({
  "node_modules/loglevel/lib/loglevel.js"(exports, module) {
    "use strict";
    (function(root, definition) {
      "use strict";
      if (typeof define === "function" && define.amd) {
        define(definition);
      } else if (typeof module === "object" && module.exports) {
        module.exports = definition();
      } else {
        root.log = definition();
      }
    })(exports, function() {
      "use strict";
      var noop2 = function() {
      };
      var undefinedType = "undefined";
      var isIE = typeof window !== undefinedType && typeof window.navigator !== undefinedType && /Trident\/|MSIE /.test(window.navigator.userAgent);
      var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
      ];
      function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === "function") {
          return method.bind(obj);
        } else {
          try {
            return Function.prototype.bind.call(method, obj);
          } catch (e) {
            return function() {
              return Function.prototype.apply.apply(method, [obj, arguments]);
            };
          }
        }
      }
      function traceForIE() {
        if (console.log) {
          if (console.log.apply) {
            console.log.apply(console, arguments);
          } else {
            Function.prototype.apply.apply(console.log, [console, arguments]);
          }
        }
        if (console.trace)
          console.trace();
      }
      function realMethod(methodName) {
        if (methodName === "debug") {
          methodName = "log";
        }
        if (typeof console === undefinedType) {
          return false;
        } else if (methodName === "trace" && isIE) {
          return traceForIE;
        } else if (console[methodName] !== void 0) {
          return bindMethod(console, methodName);
        } else if (console.log !== void 0) {
          return bindMethod(console, "log");
        } else {
          return noop2;
        }
      }
      function replaceLoggingMethods(level, loggerName) {
        for (var i = 0; i < logMethods.length; i++) {
          var methodName = logMethods[i];
          this[methodName] = i < level ? noop2 : this.methodFactory(methodName, level, loggerName);
        }
        this.log = this.debug;
      }
      function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function() {
          if (typeof console !== undefinedType) {
            replaceLoggingMethods.call(this, level, loggerName);
            this[methodName].apply(this, arguments);
          }
        };
      }
      function defaultMethodFactory(methodName, level, loggerName) {
        return realMethod(methodName) || enableLoggingWhenConsoleArrives.apply(this, arguments);
      }
      function Logger(name, defaultLevel, factory) {
        var self = this;
        var currentLevel;
        defaultLevel = defaultLevel == null ? "WARN" : defaultLevel;
        var storageKey = "loglevel";
        if (typeof name === "string") {
          storageKey += ":" + name;
        } else if (typeof name === "symbol") {
          storageKey = void 0;
        }
        function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || "silent").toUpperCase();
          if (typeof window === undefinedType || !storageKey)
            return;
          try {
            window.localStorage[storageKey] = levelName;
            return;
          } catch (ignore) {
          }
          try {
            window.document.cookie = encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {
          }
        }
        function getPersistedLevel() {
          var storedLevel;
          if (typeof window === undefinedType || !storageKey)
            return;
          try {
            storedLevel = window.localStorage[storageKey];
          } catch (ignore) {
          }
          if (typeof storedLevel === undefinedType) {
            try {
              var cookie = window.document.cookie;
              var location2 = cookie.indexOf(
                encodeURIComponent(storageKey) + "="
              );
              if (location2 !== -1) {
                storedLevel = /^([^;]+)/.exec(cookie.slice(location2))[1];
              }
            } catch (ignore) {
            }
          }
          if (self.levels[storedLevel] === void 0) {
            storedLevel = void 0;
          }
          return storedLevel;
        }
        function clearPersistedLevel() {
          if (typeof window === undefinedType || !storageKey)
            return;
          try {
            window.localStorage.removeItem(storageKey);
            return;
          } catch (ignore) {
          }
          try {
            window.document.cookie = encodeURIComponent(storageKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          } catch (ignore) {
          }
        }
        self.name = name;
        self.levels = {
          "TRACE": 0,
          "DEBUG": 1,
          "INFO": 2,
          "WARN": 3,
          "ERROR": 4,
          "SILENT": 5
        };
        self.methodFactory = factory || defaultMethodFactory;
        self.getLevel = function() {
          return currentLevel;
        };
        self.setLevel = function(level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== void 0) {
            level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
            currentLevel = level;
            if (persist !== false) {
              persistLevelIfPossible(level);
            }
            replaceLoggingMethods.call(self, level, name);
            if (typeof console === undefinedType && level < self.levels.SILENT) {
              return "No console available for logging";
            }
          } else {
            throw "log.setLevel() called with invalid level: " + level;
          }
        };
        self.setDefaultLevel = function(level) {
          defaultLevel = level;
          if (!getPersistedLevel()) {
            self.setLevel(level, false);
          }
        };
        self.resetLevel = function() {
          self.setLevel(defaultLevel, false);
          clearPersistedLevel();
        };
        self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
        };
        self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
        };
        var initialLevel = getPersistedLevel();
        if (initialLevel == null) {
          initialLevel = defaultLevel;
        }
        self.setLevel(initialLevel, false);
      }
      var defaultLogger = new Logger();
      var _loggersByName = {};
      defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "symbol" && typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }
        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name,
            defaultLogger.getLevel(),
            defaultLogger.methodFactory
          );
        }
        return logger;
      };
      var _log = typeof window !== undefinedType ? window.log : void 0;
      defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType && window.log === defaultLogger) {
          window.log = _log;
        }
        return defaultLogger;
      };
      defaultLogger.getLoggers = function getLoggers() {
        return _loggersByName;
      };
      defaultLogger["default"] = defaultLogger;
      return defaultLogger;
    });
  }
});

// src/core/gl.ts
var import_loglevel = __toESM(require_loglevel(), 1);
var glContext;
function getGl(aa = true, selector = "canvas") {
  if (glContext) {
    return glContext;
  }
  import_loglevel.default.info(`\u{1F58C}\uFE0F Creating new WebGL2 context for: '${selector}'`);
  const canvasElement = document.querySelector(selector);
  if (!canvasElement) {
    import_loglevel.default.error(`\u{1F4A5} FATAL! Unable to find element with selector: '${selector}'`);
    return void 0;
  }
  if (canvasElement && canvasElement.tagName !== "CANVAS") {
    import_loglevel.default.error(`\u{1F4A5} FATAL! Element with selector: '${selector}' is not a canvas element`);
    return void 0;
  }
  const canvas = canvasElement;
  if (!canvas) {
    import_loglevel.default.error(`\u{1F4A5} FATAL! Unable to find canvas element with selector: '${selector}'`);
    return void 0;
  }
  glContext = canvas.getContext("webgl2", { antialias: aa }) ?? void 0;
  if (!glContext) {
    import_loglevel.default.error(`\u{1F4A5} Unable to create WebGL2 context, maybe it's not supported on this device`);
    return void 0;
  }
  import_loglevel.default.info(`\u{1F4D0} Internal: ${canvas.width} x ${canvas.height}, display: ${canvas.clientWidth} x ${canvas.clientHeight}`);
  return glContext;
}

// src/core/logging.ts
var import_loglevel2 = __toESM(require_loglevel(), 1);
function setLogLevel(level) {
  import_loglevel2.default.setLevel(level);
}

// package.json
var version = "0.0.4-alpha.1";

// node_modules/twgl.js/dist/5.x/twgl-full.module.js
var VecType = Float32Array;
function create$1(x, y, z) {
  const dst = new VecType(3);
  if (x) {
    dst[0] = x;
  }
  if (y) {
    dst[1] = y;
  }
  if (z) {
    dst[2] = z;
  }
  return dst;
}
function add(a, b, dst) {
  dst = dst || new VecType(3);
  dst[0] = a[0] + b[0];
  dst[1] = a[1] + b[1];
  dst[2] = a[2] + b[2];
  return dst;
}
function multiply$1(a, b, dst) {
  dst = dst || new VecType(3);
  dst[0] = a[0] * b[0];
  dst[1] = a[1] * b[1];
  dst[2] = a[2] * b[2];
  return dst;
}
var MatType = Float32Array;
function identity(dst) {
  dst = dst || new MatType(16);
  dst[0] = 1;
  dst[1] = 0;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = 1;
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = 0;
  dst[9] = 0;
  dst[10] = 1;
  dst[11] = 0;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = 0;
  dst[15] = 1;
  return dst;
}
function inverse(m, dst) {
  dst = dst || new MatType(16);
  const m00 = m[0 * 4 + 0];
  const m01 = m[0 * 4 + 1];
  const m02 = m[0 * 4 + 2];
  const m03 = m[0 * 4 + 3];
  const m10 = m[1 * 4 + 0];
  const m11 = m[1 * 4 + 1];
  const m12 = m[1 * 4 + 2];
  const m13 = m[1 * 4 + 3];
  const m20 = m[2 * 4 + 0];
  const m21 = m[2 * 4 + 1];
  const m22 = m[2 * 4 + 2];
  const m23 = m[2 * 4 + 3];
  const m30 = m[3 * 4 + 0];
  const m31 = m[3 * 4 + 1];
  const m32 = m[3 * 4 + 2];
  const m33 = m[3 * 4 + 3];
  const tmp_0 = m22 * m33;
  const tmp_1 = m32 * m23;
  const tmp_2 = m12 * m33;
  const tmp_3 = m32 * m13;
  const tmp_4 = m12 * m23;
  const tmp_5 = m22 * m13;
  const tmp_6 = m02 * m33;
  const tmp_7 = m32 * m03;
  const tmp_8 = m02 * m23;
  const tmp_9 = m22 * m03;
  const tmp_10 = m02 * m13;
  const tmp_11 = m12 * m03;
  const tmp_12 = m20 * m31;
  const tmp_13 = m30 * m21;
  const tmp_14 = m10 * m31;
  const tmp_15 = m30 * m11;
  const tmp_16 = m10 * m21;
  const tmp_17 = m20 * m11;
  const tmp_18 = m00 * m31;
  const tmp_19 = m30 * m01;
  const tmp_20 = m00 * m21;
  const tmp_21 = m20 * m01;
  const tmp_22 = m00 * m11;
  const tmp_23 = m10 * m01;
  const t0 = tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31 - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
  const t1 = tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31 - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
  const t2 = tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31 - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
  const t3 = tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21 - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);
  const d = 1 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
  dst[0] = d * t0;
  dst[1] = d * t1;
  dst[2] = d * t2;
  dst[3] = d * t3;
  dst[4] = d * (tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30 - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
  dst[5] = d * (tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30 - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
  dst[6] = d * (tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30 - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
  dst[7] = d * (tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20 - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
  dst[8] = d * (tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33 - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
  dst[9] = d * (tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33 - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
  dst[10] = d * (tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33 - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
  dst[11] = d * (tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23 - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
  dst[12] = d * (tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12 - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
  dst[13] = d * (tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22 - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
  dst[14] = d * (tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02 - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
  dst[15] = d * (tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12 - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));
  return dst;
}
function transformPoint(m, v, dst) {
  dst = dst || create$1();
  const v0 = v[0];
  const v1 = v[1];
  const v2 = v[2];
  const d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + v2 * m[2 * 4 + 3] + m[3 * 4 + 3];
  dst[0] = (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d;
  dst[1] = (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d;
  dst[2] = (v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d;
  return dst;
}
function transformDirection(m, v, dst) {
  dst = dst || create$1();
  const v0 = v[0];
  const v1 = v[1];
  const v2 = v[2];
  dst[0] = v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0];
  dst[1] = v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1];
  dst[2] = v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2];
  return dst;
}
var BYTE$2 = 5120;
var UNSIGNED_BYTE$3 = 5121;
var SHORT$2 = 5122;
var UNSIGNED_SHORT$3 = 5123;
var INT$3 = 5124;
var UNSIGNED_INT$3 = 5125;
var FLOAT$3 = 5126;
var UNSIGNED_SHORT_4_4_4_4$1 = 32819;
var UNSIGNED_SHORT_5_5_5_1$1 = 32820;
var UNSIGNED_SHORT_5_6_5$1 = 33635;
var HALF_FLOAT$1 = 5131;
var UNSIGNED_INT_2_10_10_10_REV$1 = 33640;
var UNSIGNED_INT_10F_11F_11F_REV$1 = 35899;
var UNSIGNED_INT_5_9_9_9_REV$1 = 35902;
var FLOAT_32_UNSIGNED_INT_24_8_REV$1 = 36269;
var UNSIGNED_INT_24_8$1 = 34042;
var glTypeToTypedArray = {};
{
  const tt = glTypeToTypedArray;
  tt[BYTE$2] = Int8Array;
  tt[UNSIGNED_BYTE$3] = Uint8Array;
  tt[SHORT$2] = Int16Array;
  tt[UNSIGNED_SHORT$3] = Uint16Array;
  tt[INT$3] = Int32Array;
  tt[UNSIGNED_INT$3] = Uint32Array;
  tt[FLOAT$3] = Float32Array;
  tt[UNSIGNED_SHORT_4_4_4_4$1] = Uint16Array;
  tt[UNSIGNED_SHORT_5_5_5_1$1] = Uint16Array;
  tt[UNSIGNED_SHORT_5_6_5$1] = Uint16Array;
  tt[HALF_FLOAT$1] = Uint16Array;
  tt[UNSIGNED_INT_2_10_10_10_REV$1] = Uint32Array;
  tt[UNSIGNED_INT_10F_11F_11F_REV$1] = Uint32Array;
  tt[UNSIGNED_INT_5_9_9_9_REV$1] = Uint32Array;
  tt[FLOAT_32_UNSIGNED_INT_24_8_REV$1] = Uint32Array;
  tt[UNSIGNED_INT_24_8$1] = Uint32Array;
}
function getGLTypeForTypedArray(typedArray) {
  if (typedArray instanceof Int8Array) {
    return BYTE$2;
  }
  if (typedArray instanceof Uint8Array) {
    return UNSIGNED_BYTE$3;
  }
  if (typedArray instanceof Uint8ClampedArray) {
    return UNSIGNED_BYTE$3;
  }
  if (typedArray instanceof Int16Array) {
    return SHORT$2;
  }
  if (typedArray instanceof Uint16Array) {
    return UNSIGNED_SHORT$3;
  }
  if (typedArray instanceof Int32Array) {
    return INT$3;
  }
  if (typedArray instanceof Uint32Array) {
    return UNSIGNED_INT$3;
  }
  if (typedArray instanceof Float32Array) {
    return FLOAT$3;
  }
  throw new Error("unsupported typed array type");
}
function getGLTypeForTypedArrayType(typedArrayType) {
  if (typedArrayType === Int8Array) {
    return BYTE$2;
  }
  if (typedArrayType === Uint8Array) {
    return UNSIGNED_BYTE$3;
  }
  if (typedArrayType === Uint8ClampedArray) {
    return UNSIGNED_BYTE$3;
  }
  if (typedArrayType === Int16Array) {
    return SHORT$2;
  }
  if (typedArrayType === Uint16Array) {
    return UNSIGNED_SHORT$3;
  }
  if (typedArrayType === Int32Array) {
    return INT$3;
  }
  if (typedArrayType === Uint32Array) {
    return UNSIGNED_INT$3;
  }
  if (typedArrayType === Float32Array) {
    return FLOAT$3;
  }
  throw new Error("unsupported typed array type");
}
function getTypedArrayTypeForGLType(type) {
  const CTOR = glTypeToTypedArray[type];
  if (!CTOR) {
    throw new Error("unknown gl type");
  }
  return CTOR;
}
var isArrayBuffer$1 = typeof SharedArrayBuffer !== "undefined" ? function isArrayBufferOrSharedArrayBuffer(a) {
  return a && a.buffer && (a.buffer instanceof ArrayBuffer || a.buffer instanceof SharedArrayBuffer);
} : function isArrayBuffer(a) {
  return a && a.buffer && a.buffer instanceof ArrayBuffer;
};
function copyNamedProperties(names, src, dst) {
  names.forEach(function(name) {
    const value = src[name];
    if (value !== void 0) {
      dst[name] = value;
    }
  });
}
function error$1(...args) {
  console.error(...args);
}
var isTypeWeakMaps = /* @__PURE__ */ new Map();
function isType(object, type) {
  if (!object || typeof object !== "object") {
    return false;
  }
  let weakMap = isTypeWeakMaps.get(type);
  if (!weakMap) {
    weakMap = /* @__PURE__ */ new WeakMap();
    isTypeWeakMaps.set(type, weakMap);
  }
  let isOfType = weakMap.get(object);
  if (isOfType === void 0) {
    const s = Object.prototype.toString.call(object);
    isOfType = s.substring(8, s.length - 1) === type;
    weakMap.set(object, isOfType);
  }
  return isOfType;
}
function isBuffer(gl, t) {
  return typeof WebGLBuffer !== "undefined" && isType(t, "WebGLBuffer");
}
function isRenderbuffer(gl, t) {
  return typeof WebGLRenderbuffer !== "undefined" && isType(t, "WebGLRenderbuffer");
}
function isTexture(gl, t) {
  return typeof WebGLTexture !== "undefined" && isType(t, "WebGLTexture");
}
function isSampler(gl, t) {
  return typeof WebGLSampler !== "undefined" && isType(t, "WebGLSampler");
}
var STATIC_DRAW = 35044;
var ARRAY_BUFFER$1 = 34962;
var ELEMENT_ARRAY_BUFFER$2 = 34963;
var BUFFER_SIZE = 34660;
var BYTE$1 = 5120;
var UNSIGNED_BYTE$2 = 5121;
var SHORT$1 = 5122;
var UNSIGNED_SHORT$2 = 5123;
var INT$2 = 5124;
var UNSIGNED_INT$2 = 5125;
var FLOAT$2 = 5126;
var defaults$2 = {
  attribPrefix: ""
};
function setBufferFromTypedArray(gl, type, buffer, array, drawType) {
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, array, drawType || STATIC_DRAW);
}
function createBufferFromTypedArray(gl, typedArray, type, drawType) {
  if (isBuffer(gl, typedArray)) {
    return typedArray;
  }
  type = type || ARRAY_BUFFER$1;
  const buffer = gl.createBuffer();
  setBufferFromTypedArray(gl, type, buffer, typedArray, drawType);
  return buffer;
}
function isIndices(name) {
  return name === "indices";
}
function getNormalizationForTypedArrayType(typedArrayType) {
  if (typedArrayType === Int8Array) {
    return true;
  }
  if (typedArrayType === Uint8Array) {
    return true;
  }
  return false;
}
function getArray$1(array) {
  return array.length ? array : array.data;
}
var texcoordRE = /coord|texture/i;
var colorRE = /color|colour/i;
function guessNumComponentsFromName(name, length3) {
  let numComponents;
  if (texcoordRE.test(name)) {
    numComponents = 2;
  } else if (colorRE.test(name)) {
    numComponents = 4;
  } else {
    numComponents = 3;
  }
  if (length3 % numComponents > 0) {
    throw new Error(`Can not guess numComponents for attribute '${name}'. Tried ${numComponents} but ${length3} values is not evenly divisible by ${numComponents}. You should specify it.`);
  }
  return numComponents;
}
function getNumComponents$1(array, arrayName, numValues) {
  return array.numComponents || array.size || guessNumComponentsFromName(arrayName, numValues || getArray$1(array).length);
}
function makeTypedArray(array, name) {
  if (isArrayBuffer$1(array)) {
    return array;
  }
  if (isArrayBuffer$1(array.data)) {
    return array.data;
  }
  if (Array.isArray(array)) {
    array = {
      data: array
    };
  }
  let Type = array.type ? typedArrayTypeFromGLTypeOrTypedArrayCtor(array.type) : void 0;
  if (!Type) {
    if (isIndices(name)) {
      Type = Uint16Array;
    } else {
      Type = Float32Array;
    }
  }
  return new Type(array.data);
}
function glTypeFromGLTypeOrTypedArrayType(glTypeOrTypedArrayCtor) {
  return typeof glTypeOrTypedArrayCtor === "number" ? glTypeOrTypedArrayCtor : glTypeOrTypedArrayCtor ? getGLTypeForTypedArrayType(glTypeOrTypedArrayCtor) : FLOAT$2;
}
function typedArrayTypeFromGLTypeOrTypedArrayCtor(glTypeOrTypedArrayCtor) {
  return typeof glTypeOrTypedArrayCtor === "number" ? getTypedArrayTypeForGLType(glTypeOrTypedArrayCtor) : glTypeOrTypedArrayCtor || Float32Array;
}
function attribBufferFromBuffer(gl, array) {
  return {
    buffer: array.buffer,
    numValues: 2 * 3 * 4,
    // safely divided by 2, 3, 4
    type: glTypeFromGLTypeOrTypedArrayType(array.type),
    arrayType: typedArrayTypeFromGLTypeOrTypedArrayCtor(array.type)
  };
}
function attribBufferFromSize(gl, array) {
  const numValues = array.data || array;
  const arrayType = typedArrayTypeFromGLTypeOrTypedArrayCtor(array.type);
  const numBytes = numValues * arrayType.BYTES_PER_ELEMENT;
  const buffer = gl.createBuffer();
  gl.bindBuffer(ARRAY_BUFFER$1, buffer);
  gl.bufferData(ARRAY_BUFFER$1, numBytes, array.drawType || STATIC_DRAW);
  return {
    buffer,
    numValues,
    type: getGLTypeForTypedArrayType(arrayType),
    arrayType
  };
}
function attribBufferFromArrayLike(gl, array, arrayName) {
  const typedArray = makeTypedArray(array, arrayName);
  return {
    arrayType: typedArray.constructor,
    buffer: createBufferFromTypedArray(gl, typedArray, void 0, array.drawType),
    type: getGLTypeForTypedArray(typedArray),
    numValues: 0
  };
}
function createAttribsFromArrays(gl, arrays) {
  const attribs = {};
  Object.keys(arrays).forEach(function(arrayName) {
    if (!isIndices(arrayName)) {
      const array = arrays[arrayName];
      const attribName = array.attrib || array.name || array.attribName || defaults$2.attribPrefix + arrayName;
      if (array.value) {
        if (!Array.isArray(array.value) && !isArrayBuffer$1(array.value)) {
          throw new Error("array.value is not array or typedarray");
        }
        attribs[attribName] = {
          value: array.value
        };
      } else {
        let fn;
        if (array.buffer && array.buffer instanceof WebGLBuffer) {
          fn = attribBufferFromBuffer;
        } else if (typeof array === "number" || typeof array.data === "number") {
          fn = attribBufferFromSize;
        } else {
          fn = attribBufferFromArrayLike;
        }
        const { buffer, type, numValues, arrayType } = fn(gl, array, arrayName);
        const normalization = array.normalize !== void 0 ? array.normalize : getNormalizationForTypedArrayType(arrayType);
        const numComponents = getNumComponents$1(array, arrayName, numValues);
        attribs[attribName] = {
          buffer,
          numComponents,
          type,
          normalize: normalization,
          stride: array.stride || 0,
          offset: array.offset || 0,
          divisor: array.divisor === void 0 ? void 0 : array.divisor,
          drawType: array.drawType
        };
      }
    }
  });
  gl.bindBuffer(ARRAY_BUFFER$1, null);
  return attribs;
}
function getBytesPerValueForGLType(gl, type) {
  if (type === BYTE$1)
    return 1;
  if (type === UNSIGNED_BYTE$2)
    return 1;
  if (type === SHORT$1)
    return 2;
  if (type === UNSIGNED_SHORT$2)
    return 2;
  if (type === INT$2)
    return 4;
  if (type === UNSIGNED_INT$2)
    return 4;
  if (type === FLOAT$2)
    return 4;
  return 0;
}
var positionKeys = ["position", "positions", "a_position"];
function getNumElementsFromNonIndexedArrays(arrays) {
  let key;
  let ii;
  for (ii = 0; ii < positionKeys.length; ++ii) {
    key = positionKeys[ii];
    if (key in arrays) {
      break;
    }
  }
  if (ii === positionKeys.length) {
    key = Object.keys(arrays)[0];
  }
  const array = arrays[key];
  const length3 = getArray$1(array).length;
  if (length3 === void 0) {
    return 1;
  }
  const numComponents = getNumComponents$1(array, key);
  const numElements = length3 / numComponents;
  if (length3 % numComponents > 0) {
    throw new Error(`numComponents ${numComponents} not correct for length ${length3}`);
  }
  return numElements;
}
function getNumElementsFromAttributes(gl, attribs) {
  let key;
  let ii;
  for (ii = 0; ii < positionKeys.length; ++ii) {
    key = positionKeys[ii];
    if (key in attribs) {
      break;
    }
    key = defaults$2.attribPrefix + key;
    if (key in attribs) {
      break;
    }
  }
  if (ii === positionKeys.length) {
    key = Object.keys(attribs)[0];
  }
  const attrib = attribs[key];
  if (!attrib.buffer) {
    return 1;
  }
  gl.bindBuffer(ARRAY_BUFFER$1, attrib.buffer);
  const numBytes = gl.getBufferParameter(ARRAY_BUFFER$1, BUFFER_SIZE);
  gl.bindBuffer(ARRAY_BUFFER$1, null);
  const bytesPerValue = getBytesPerValueForGLType(gl, attrib.type);
  const totalElements = numBytes / bytesPerValue;
  const numComponents = attrib.numComponents || attrib.size;
  const numElements = totalElements / numComponents;
  if (numElements % 1 !== 0) {
    throw new Error(`numComponents ${numComponents} not correct for length ${length}`);
  }
  return numElements;
}
function createBufferInfoFromArrays(gl, arrays, srcBufferInfo) {
  const newAttribs = createAttribsFromArrays(gl, arrays);
  const bufferInfo = Object.assign({}, srcBufferInfo ? srcBufferInfo : {});
  bufferInfo.attribs = Object.assign({}, srcBufferInfo ? srcBufferInfo.attribs : {}, newAttribs);
  const indices = arrays.indices;
  if (indices) {
    const newIndices = makeTypedArray(indices, "indices");
    bufferInfo.indices = createBufferFromTypedArray(gl, newIndices, ELEMENT_ARRAY_BUFFER$2);
    bufferInfo.numElements = newIndices.length;
    bufferInfo.elementType = getGLTypeForTypedArray(newIndices);
  } else if (!bufferInfo.numElements) {
    bufferInfo.numElements = getNumElementsFromAttributes(gl, bufferInfo.attribs);
  }
  return bufferInfo;
}
function createBufferFromArray(gl, array, arrayName) {
  const type = arrayName === "indices" ? ELEMENT_ARRAY_BUFFER$2 : ARRAY_BUFFER$1;
  const typedArray = makeTypedArray(array, arrayName);
  return createBufferFromTypedArray(gl, typedArray, type);
}
function createBuffersFromArrays(gl, arrays) {
  const buffers = {};
  Object.keys(arrays).forEach(function(key) {
    buffers[key] = createBufferFromArray(gl, arrays[key], key);
  });
  if (arrays.indices) {
    buffers.numElements = arrays.indices.length;
    buffers.elementType = getGLTypeForTypedArray(makeTypedArray(arrays.indices));
  } else {
    buffers.numElements = getNumElementsFromNonIndexedArrays(arrays);
  }
  return buffers;
}
var getArray = getArray$1;
var getNumComponents = getNumComponents$1;
function augmentTypedArray(typedArray, numComponents) {
  let cursor = 0;
  typedArray.push = function() {
    for (let ii = 0; ii < arguments.length; ++ii) {
      const value = arguments[ii];
      if (value instanceof Array || isArrayBuffer$1(value)) {
        for (let jj = 0; jj < value.length; ++jj) {
          typedArray[cursor++] = value[jj];
        }
      } else {
        typedArray[cursor++] = value;
      }
    }
  };
  typedArray.reset = function(opt_index) {
    cursor = opt_index || 0;
  };
  typedArray.numComponents = numComponents;
  Object.defineProperty(typedArray, "numElements", {
    get: function() {
      return this.length / this.numComponents | 0;
    }
  });
  return typedArray;
}
function createAugmentedTypedArray(numComponents, numElements, opt_type) {
  const Type = opt_type || Float32Array;
  return augmentTypedArray(new Type(numComponents * numElements), numComponents);
}
function allButIndices(name) {
  return name !== "indices";
}
function deindexVertices(vertices) {
  const indices = vertices.indices;
  const newVertices = {};
  const numElements = indices.length;
  function expandToUnindexed(channel) {
    const srcBuffer = vertices[channel];
    const numComponents = srcBuffer.numComponents;
    const dstBuffer = createAugmentedTypedArray(numComponents, numElements, srcBuffer.constructor);
    for (let ii = 0; ii < numElements; ++ii) {
      const ndx = indices[ii];
      const offset = ndx * numComponents;
      for (let jj = 0; jj < numComponents; ++jj) {
        dstBuffer.push(srcBuffer[offset + jj]);
      }
    }
    newVertices[channel] = dstBuffer;
  }
  Object.keys(vertices).filter(allButIndices).forEach(expandToUnindexed);
  return newVertices;
}
function flattenNormals(vertices) {
  if (vertices.indices) {
    throw new Error("can not flatten normals of indexed vertices. deindex them first");
  }
  const normals = vertices.normal;
  const numNormals = normals.length;
  for (let ii = 0; ii < numNormals; ii += 9) {
    const nax = normals[ii + 0];
    const nay = normals[ii + 1];
    const naz = normals[ii + 2];
    const nbx = normals[ii + 3];
    const nby = normals[ii + 4];
    const nbz = normals[ii + 5];
    const ncx = normals[ii + 6];
    const ncy = normals[ii + 7];
    const ncz = normals[ii + 8];
    let nx = nax + nbx + ncx;
    let ny = nay + nby + ncy;
    let nz = naz + nbz + ncz;
    const length3 = Math.sqrt(nx * nx + ny * ny + nz * nz);
    nx /= length3;
    ny /= length3;
    nz /= length3;
    normals[ii + 0] = nx;
    normals[ii + 1] = ny;
    normals[ii + 2] = nz;
    normals[ii + 3] = nx;
    normals[ii + 4] = ny;
    normals[ii + 5] = nz;
    normals[ii + 6] = nx;
    normals[ii + 7] = ny;
    normals[ii + 8] = nz;
  }
  return vertices;
}
function applyFuncToV3Array(array, matrix, fn) {
  const len2 = array.length;
  const tmp = new Float32Array(3);
  for (let ii = 0; ii < len2; ii += 3) {
    fn(matrix, [array[ii], array[ii + 1], array[ii + 2]], tmp);
    array[ii] = tmp[0];
    array[ii + 1] = tmp[1];
    array[ii + 2] = tmp[2];
  }
}
function transformNormal(mi, v, dst) {
  dst = dst || create$1();
  const v0 = v[0];
  const v1 = v[1];
  const v2 = v[2];
  dst[0] = v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2];
  dst[1] = v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2];
  dst[2] = v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2];
  return dst;
}
function reorientDirections(array, matrix) {
  applyFuncToV3Array(array, matrix, transformDirection);
  return array;
}
function reorientNormals(array, matrix) {
  applyFuncToV3Array(array, inverse(matrix), transformNormal);
  return array;
}
function reorientPositions(array, matrix) {
  applyFuncToV3Array(array, matrix, transformPoint);
  return array;
}
function reorientVertices(arrays, matrix) {
  Object.keys(arrays).forEach(function(name) {
    const array = arrays[name];
    if (name.indexOf("pos") >= 0) {
      reorientPositions(array, matrix);
    } else if (name.indexOf("tan") >= 0 || name.indexOf("binorm") >= 0) {
      reorientDirections(array, matrix);
    } else if (name.indexOf("norm") >= 0) {
      reorientNormals(array, matrix);
    }
  });
  return arrays;
}
function createXYQuadVertices(size, xOffset, yOffset) {
  size = size || 2;
  xOffset = xOffset || 0;
  yOffset = yOffset || 0;
  size *= 0.5;
  return {
    position: {
      numComponents: 2,
      data: [
        xOffset + -1 * size,
        yOffset + -1 * size,
        xOffset + 1 * size,
        yOffset + -1 * size,
        xOffset + -1 * size,
        yOffset + 1 * size,
        xOffset + 1 * size,
        yOffset + 1 * size
      ]
    },
    normal: [
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1
    ],
    texcoord: [
      0,
      0,
      1,
      0,
      0,
      1,
      1,
      1
    ],
    indices: [0, 1, 2, 2, 1, 3]
  };
}
function createPlaneVertices(width, depth, subdivisionsWidth, subdivisionsDepth, matrix) {
  width = width || 1;
  depth = depth || 1;
  subdivisionsWidth = subdivisionsWidth || 1;
  subdivisionsDepth = subdivisionsDepth || 1;
  matrix = matrix || identity();
  const numVertices = (subdivisionsWidth + 1) * (subdivisionsDepth + 1);
  const positions = createAugmentedTypedArray(3, numVertices);
  const normals = createAugmentedTypedArray(3, numVertices);
  const texcoords = createAugmentedTypedArray(2, numVertices);
  for (let z = 0; z <= subdivisionsDepth; z++) {
    for (let x = 0; x <= subdivisionsWidth; x++) {
      const u = x / subdivisionsWidth;
      const v = z / subdivisionsDepth;
      positions.push(
        width * u - width * 0.5,
        0,
        depth * v - depth * 0.5
      );
      normals.push(0, 1, 0);
      texcoords.push(u, v);
    }
  }
  const numVertsAcross = subdivisionsWidth + 1;
  const indices = createAugmentedTypedArray(
    3,
    subdivisionsWidth * subdivisionsDepth * 2,
    Uint16Array
  );
  for (let z = 0; z < subdivisionsDepth; z++) {
    for (let x = 0; x < subdivisionsWidth; x++) {
      indices.push(
        (z + 0) * numVertsAcross + x,
        (z + 1) * numVertsAcross + x,
        (z + 0) * numVertsAcross + x + 1
      );
      indices.push(
        (z + 1) * numVertsAcross + x,
        (z + 1) * numVertsAcross + x + 1,
        (z + 0) * numVertsAcross + x + 1
      );
    }
  }
  const arrays = reorientVertices({
    position: positions,
    normal: normals,
    texcoord: texcoords,
    indices
  }, matrix);
  return arrays;
}
function createSphereVertices(radius, subdivisionsAxis, subdivisionsHeight, opt_startLatitudeInRadians, opt_endLatitudeInRadians, opt_startLongitudeInRadians, opt_endLongitudeInRadians) {
  if (subdivisionsAxis <= 0 || subdivisionsHeight <= 0) {
    throw new Error("subdivisionAxis and subdivisionHeight must be > 0");
  }
  opt_startLatitudeInRadians = opt_startLatitudeInRadians || 0;
  opt_endLatitudeInRadians = opt_endLatitudeInRadians || Math.PI;
  opt_startLongitudeInRadians = opt_startLongitudeInRadians || 0;
  opt_endLongitudeInRadians = opt_endLongitudeInRadians || Math.PI * 2;
  const latRange = opt_endLatitudeInRadians - opt_startLatitudeInRadians;
  const longRange = opt_endLongitudeInRadians - opt_startLongitudeInRadians;
  const numVertices = (subdivisionsAxis + 1) * (subdivisionsHeight + 1);
  const positions = createAugmentedTypedArray(3, numVertices);
  const normals = createAugmentedTypedArray(3, numVertices);
  const texcoords = createAugmentedTypedArray(2, numVertices);
  for (let y = 0; y <= subdivisionsHeight; y++) {
    for (let x = 0; x <= subdivisionsAxis; x++) {
      const u = x / subdivisionsAxis;
      const v = y / subdivisionsHeight;
      const theta = longRange * u + opt_startLongitudeInRadians;
      const phi = latRange * v + opt_startLatitudeInRadians;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      const ux = cosTheta * sinPhi;
      const uy = cosPhi;
      const uz = sinTheta * sinPhi;
      positions.push(radius * ux, radius * uy, radius * uz);
      normals.push(ux, uy, uz);
      texcoords.push(1 - u, v);
    }
  }
  const numVertsAround = subdivisionsAxis + 1;
  const indices = createAugmentedTypedArray(3, subdivisionsAxis * subdivisionsHeight * 2, Uint16Array);
  for (let x = 0; x < subdivisionsAxis; x++) {
    for (let y = 0; y < subdivisionsHeight; y++) {
      indices.push(
        (y + 0) * numVertsAround + x,
        (y + 0) * numVertsAround + x + 1,
        (y + 1) * numVertsAround + x
      );
      indices.push(
        (y + 1) * numVertsAround + x,
        (y + 0) * numVertsAround + x + 1,
        (y + 1) * numVertsAround + x + 1
      );
    }
  }
  return {
    position: positions,
    normal: normals,
    texcoord: texcoords,
    indices
  };
}
var CUBE_FACE_INDICES = [
  [3, 7, 5, 1],
  // right
  [6, 2, 0, 4],
  // left
  [6, 7, 3, 2],
  // ??
  [0, 1, 5, 4],
  // ??
  [7, 6, 4, 5],
  // front
  [2, 3, 1, 0]
  // back
];
function createCubeVertices(size) {
  size = size || 1;
  const k = size / 2;
  const cornerVertices = [
    [-k, -k, -k],
    [+k, -k, -k],
    [-k, +k, -k],
    [+k, +k, -k],
    [-k, -k, +k],
    [+k, -k, +k],
    [-k, +k, +k],
    [+k, +k, +k]
  ];
  const faceNormals = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1]
  ];
  const uvCoords = [
    [1, 0],
    [0, 0],
    [0, 1],
    [1, 1]
  ];
  const numVertices = 6 * 4;
  const positions = createAugmentedTypedArray(3, numVertices);
  const normals = createAugmentedTypedArray(3, numVertices);
  const texcoords = createAugmentedTypedArray(2, numVertices);
  const indices = createAugmentedTypedArray(3, 6 * 2, Uint16Array);
  for (let f = 0; f < 6; ++f) {
    const faceIndices = CUBE_FACE_INDICES[f];
    for (let v = 0; v < 4; ++v) {
      const position = cornerVertices[faceIndices[v]];
      const normal = faceNormals[f];
      const uv = uvCoords[v];
      positions.push(position);
      normals.push(normal);
      texcoords.push(uv);
    }
    const offset = 4 * f;
    indices.push(offset + 0, offset + 1, offset + 2);
    indices.push(offset + 0, offset + 2, offset + 3);
  }
  return {
    position: positions,
    normal: normals,
    texcoord: texcoords,
    indices
  };
}
function createTruncatedConeVertices(bottomRadius, topRadius, height, radialSubdivisions, verticalSubdivisions, opt_topCap, opt_bottomCap) {
  if (radialSubdivisions < 3) {
    throw new Error("radialSubdivisions must be 3 or greater");
  }
  if (verticalSubdivisions < 1) {
    throw new Error("verticalSubdivisions must be 1 or greater");
  }
  const topCap = opt_topCap === void 0 ? true : opt_topCap;
  const bottomCap = opt_bottomCap === void 0 ? true : opt_bottomCap;
  const extra = (topCap ? 2 : 0) + (bottomCap ? 2 : 0);
  const numVertices = (radialSubdivisions + 1) * (verticalSubdivisions + 1 + extra);
  const positions = createAugmentedTypedArray(3, numVertices);
  const normals = createAugmentedTypedArray(3, numVertices);
  const texcoords = createAugmentedTypedArray(2, numVertices);
  const indices = createAugmentedTypedArray(3, radialSubdivisions * (verticalSubdivisions + extra / 2) * 2, Uint16Array);
  const vertsAroundEdge = radialSubdivisions + 1;
  const slant = Math.atan2(bottomRadius - topRadius, height);
  const cosSlant = Math.cos(slant);
  const sinSlant = Math.sin(slant);
  const start = topCap ? -2 : 0;
  const end = verticalSubdivisions + (bottomCap ? 2 : 0);
  for (let yy = start; yy <= end; ++yy) {
    let v = yy / verticalSubdivisions;
    let y = height * v;
    let ringRadius;
    if (yy < 0) {
      y = 0;
      v = 1;
      ringRadius = bottomRadius;
    } else if (yy > verticalSubdivisions) {
      y = height;
      v = 1;
      ringRadius = topRadius;
    } else {
      ringRadius = bottomRadius + (topRadius - bottomRadius) * (yy / verticalSubdivisions);
    }
    if (yy === -2 || yy === verticalSubdivisions + 2) {
      ringRadius = 0;
      v = 0;
    }
    y -= height / 2;
    for (let ii = 0; ii < vertsAroundEdge; ++ii) {
      const sin = Math.sin(ii * Math.PI * 2 / radialSubdivisions);
      const cos = Math.cos(ii * Math.PI * 2 / radialSubdivisions);
      positions.push(sin * ringRadius, y, cos * ringRadius);
      if (yy < 0) {
        normals.push(0, -1, 0);
      } else if (yy > verticalSubdivisions) {
        normals.push(0, 1, 0);
      } else if (ringRadius === 0) {
        normals.push(0, 0, 0);
      } else {
        normals.push(sin * cosSlant, sinSlant, cos * cosSlant);
      }
      texcoords.push(ii / radialSubdivisions, 1 - v);
    }
  }
  for (let yy = 0; yy < verticalSubdivisions + extra; ++yy) {
    if (yy === 1 && topCap || yy === verticalSubdivisions + extra - 2 && bottomCap) {
      continue;
    }
    for (let ii = 0; ii < radialSubdivisions; ++ii) {
      indices.push(
        vertsAroundEdge * (yy + 0) + 0 + ii,
        vertsAroundEdge * (yy + 0) + 1 + ii,
        vertsAroundEdge * (yy + 1) + 1 + ii
      );
      indices.push(
        vertsAroundEdge * (yy + 0) + 0 + ii,
        vertsAroundEdge * (yy + 1) + 1 + ii,
        vertsAroundEdge * (yy + 1) + 0 + ii
      );
    }
  }
  return {
    position: positions,
    normal: normals,
    texcoord: texcoords,
    indices
  };
}
function expandRLEData(rleData, padding) {
  padding = padding || [];
  const data = [];
  for (let ii = 0; ii < rleData.length; ii += 4) {
    const runLength = rleData[ii];
    const element = rleData.slice(ii + 1, ii + 4);
    element.push.apply(element, padding);
    for (let jj = 0; jj < runLength; ++jj) {
      data.push.apply(data, element);
    }
  }
  return data;
}
function create3DFVertices() {
  const positions = [
    // left column front
    0,
    0,
    0,
    0,
    150,
    0,
    30,
    0,
    0,
    0,
    150,
    0,
    30,
    150,
    0,
    30,
    0,
    0,
    // top rung front
    30,
    0,
    0,
    30,
    30,
    0,
    100,
    0,
    0,
    30,
    30,
    0,
    100,
    30,
    0,
    100,
    0,
    0,
    // middle rung front
    30,
    60,
    0,
    30,
    90,
    0,
    67,
    60,
    0,
    30,
    90,
    0,
    67,
    90,
    0,
    67,
    60,
    0,
    // left column back
    0,
    0,
    30,
    30,
    0,
    30,
    0,
    150,
    30,
    0,
    150,
    30,
    30,
    0,
    30,
    30,
    150,
    30,
    // top rung back
    30,
    0,
    30,
    100,
    0,
    30,
    30,
    30,
    30,
    30,
    30,
    30,
    100,
    0,
    30,
    100,
    30,
    30,
    // middle rung back
    30,
    60,
    30,
    67,
    60,
    30,
    30,
    90,
    30,
    30,
    90,
    30,
    67,
    60,
    30,
    67,
    90,
    30,
    // top
    0,
    0,
    0,
    100,
    0,
    0,
    100,
    0,
    30,
    0,
    0,
    0,
    100,
    0,
    30,
    0,
    0,
    30,
    // top rung front
    100,
    0,
    0,
    100,
    30,
    0,
    100,
    30,
    30,
    100,
    0,
    0,
    100,
    30,
    30,
    100,
    0,
    30,
    // under top rung
    30,
    30,
    0,
    30,
    30,
    30,
    100,
    30,
    30,
    30,
    30,
    0,
    100,
    30,
    30,
    100,
    30,
    0,
    // between top rung and middle
    30,
    30,
    0,
    30,
    60,
    30,
    30,
    30,
    30,
    30,
    30,
    0,
    30,
    60,
    0,
    30,
    60,
    30,
    // top of middle rung
    30,
    60,
    0,
    67,
    60,
    30,
    30,
    60,
    30,
    30,
    60,
    0,
    67,
    60,
    0,
    67,
    60,
    30,
    // front of middle rung
    67,
    60,
    0,
    67,
    90,
    30,
    67,
    60,
    30,
    67,
    60,
    0,
    67,
    90,
    0,
    67,
    90,
    30,
    // bottom of middle rung.
    30,
    90,
    0,
    30,
    90,
    30,
    67,
    90,
    30,
    30,
    90,
    0,
    67,
    90,
    30,
    67,
    90,
    0,
    // front of bottom
    30,
    90,
    0,
    30,
    150,
    30,
    30,
    90,
    30,
    30,
    90,
    0,
    30,
    150,
    0,
    30,
    150,
    30,
    // bottom
    0,
    150,
    0,
    0,
    150,
    30,
    30,
    150,
    30,
    0,
    150,
    0,
    30,
    150,
    30,
    30,
    150,
    0,
    // left side
    0,
    0,
    0,
    0,
    0,
    30,
    0,
    150,
    30,
    0,
    0,
    0,
    0,
    150,
    30,
    0,
    150,
    0
  ];
  const texcoords = [
    // left column front
    0.22,
    0.19,
    0.22,
    0.79,
    0.34,
    0.19,
    0.22,
    0.79,
    0.34,
    0.79,
    0.34,
    0.19,
    // top rung front
    0.34,
    0.19,
    0.34,
    0.31,
    0.62,
    0.19,
    0.34,
    0.31,
    0.62,
    0.31,
    0.62,
    0.19,
    // middle rung front
    0.34,
    0.43,
    0.34,
    0.55,
    0.49,
    0.43,
    0.34,
    0.55,
    0.49,
    0.55,
    0.49,
    0.43,
    // left column back
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    1,
    // top rung back
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    1,
    // middle rung back
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    1,
    // top
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    // top rung front
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    // under top rung
    0,
    0,
    0,
    1,
    1,
    1,
    0,
    0,
    1,
    1,
    1,
    0,
    // between top rung and middle
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    // top of middle rung
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    // front of middle rung
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    // bottom of middle rung.
    0,
    0,
    0,
    1,
    1,
    1,
    0,
    0,
    1,
    1,
    1,
    0,
    // front of bottom
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    // bottom
    0,
    0,
    0,
    1,
    1,
    1,
    0,
    0,
    1,
    1,
    1,
    0,
    // left side
    0,
    0,
    0,
    1,
    1,
    1,
    0,
    0,
    1,
    1,
    1,
    0
  ];
  const normals = expandRLEData([
    // left column front
    // top rung front
    // middle rung front
    18,
    0,
    0,
    1,
    // left column back
    // top rung back
    // middle rung back
    18,
    0,
    0,
    -1,
    // top
    6,
    0,
    1,
    0,
    // top rung front
    6,
    1,
    0,
    0,
    // under top rung
    6,
    0,
    -1,
    0,
    // between top rung and middle
    6,
    1,
    0,
    0,
    // top of middle rung
    6,
    0,
    1,
    0,
    // front of middle rung
    6,
    1,
    0,
    0,
    // bottom of middle rung.
    6,
    0,
    -1,
    0,
    // front of bottom
    6,
    1,
    0,
    0,
    // bottom
    6,
    0,
    -1,
    0,
    // left side
    6,
    -1,
    0,
    0
  ]);
  const colors = expandRLEData([
    // left column front
    // top rung front
    // middle rung front
    18,
    200,
    70,
    120,
    // left column back
    // top rung back
    // middle rung back
    18,
    80,
    70,
    200,
    // top
    6,
    70,
    200,
    210,
    // top rung front
    6,
    200,
    200,
    70,
    // under top rung
    6,
    210,
    100,
    70,
    // between top rung and middle
    6,
    210,
    160,
    70,
    // top of middle rung
    6,
    70,
    180,
    210,
    // front of middle rung
    6,
    100,
    70,
    210,
    // bottom of middle rung.
    6,
    76,
    210,
    100,
    // front of bottom
    6,
    140,
    210,
    80,
    // bottom
    6,
    90,
    130,
    110,
    // left side
    6,
    160,
    160,
    220
  ], [255]);
  const numVerts = positions.length / 3;
  const arrays = {
    position: createAugmentedTypedArray(3, numVerts),
    texcoord: createAugmentedTypedArray(2, numVerts),
    normal: createAugmentedTypedArray(3, numVerts),
    color: createAugmentedTypedArray(4, numVerts, Uint8Array),
    indices: createAugmentedTypedArray(3, numVerts / 3, Uint16Array)
  };
  arrays.position.push(positions);
  arrays.texcoord.push(texcoords);
  arrays.normal.push(normals);
  arrays.color.push(colors);
  for (let ii = 0; ii < numVerts; ++ii) {
    arrays.indices.push(ii);
  }
  return arrays;
}
function createCrescentVertices(verticalRadius, outerRadius, innerRadius, thickness, subdivisionsDown, startOffset, endOffset) {
  if (subdivisionsDown <= 0) {
    throw new Error("subdivisionDown must be > 0");
  }
  startOffset = startOffset || 0;
  endOffset = endOffset || 1;
  const subdivisionsThick = 2;
  const offsetRange = endOffset - startOffset;
  const numVertices = (subdivisionsDown + 1) * 2 * (2 + subdivisionsThick);
  const positions = createAugmentedTypedArray(3, numVertices);
  const normals = createAugmentedTypedArray(3, numVertices);
  const texcoords = createAugmentedTypedArray(2, numVertices);
  function lerp2(a, b, s) {
    return a + (b - a) * s;
  }
  function createArc(arcRadius, x, normalMult, normalAdd, uMult, uAdd) {
    for (let z = 0; z <= subdivisionsDown; z++) {
      const uBack = x / (subdivisionsThick - 1);
      const v = z / subdivisionsDown;
      const xBack = (uBack - 0.5) * 2;
      const angle2 = (startOffset + v * offsetRange) * Math.PI;
      const s = Math.sin(angle2);
      const c = Math.cos(angle2);
      const radius = lerp2(verticalRadius, arcRadius, s);
      const px = xBack * thickness;
      const py = c * verticalRadius;
      const pz = s * radius;
      positions.push(px, py, pz);
      const n = add(multiply$1([0, s, c], normalMult), normalAdd);
      normals.push(n);
      texcoords.push(uBack * uMult + uAdd, v);
    }
  }
  for (let x = 0; x < subdivisionsThick; x++) {
    const uBack = (x / (subdivisionsThick - 1) - 0.5) * 2;
    createArc(outerRadius, x, [1, 1, 1], [0, 0, 0], 1, 0);
    createArc(outerRadius, x, [0, 0, 0], [uBack, 0, 0], 0, 0);
    createArc(innerRadius, x, [1, 1, 1], [0, 0, 0], 1, 0);
    createArc(innerRadius, x, [0, 0, 0], [uBack, 0, 0], 0, 1);
  }
  const indices = createAugmentedTypedArray(3, subdivisionsDown * 2 * (2 + subdivisionsThick), Uint16Array);
  function createSurface(leftArcOffset, rightArcOffset) {
    for (let z = 0; z < subdivisionsDown; ++z) {
      indices.push(
        leftArcOffset + z + 0,
        leftArcOffset + z + 1,
        rightArcOffset + z + 0
      );
      indices.push(
        leftArcOffset + z + 1,
        rightArcOffset + z + 1,
        rightArcOffset + z + 0
      );
    }
  }
  const numVerticesDown = subdivisionsDown + 1;
  createSurface(numVerticesDown * 0, numVerticesDown * 4);
  createSurface(numVerticesDown * 5, numVerticesDown * 7);
  createSurface(numVerticesDown * 6, numVerticesDown * 2);
  createSurface(numVerticesDown * 3, numVerticesDown * 1);
  return {
    position: positions,
    normal: normals,
    texcoord: texcoords,
    indices
  };
}
function createCylinderVertices(radius, height, radialSubdivisions, verticalSubdivisions, topCap, bottomCap) {
  return createTruncatedConeVertices(
    radius,
    radius,
    height,
    radialSubdivisions,
    verticalSubdivisions,
    topCap,
    bottomCap
  );
}
function createTorusVertices(radius, thickness, radialSubdivisions, bodySubdivisions, startAngle, endAngle) {
  if (radialSubdivisions < 3) {
    throw new Error("radialSubdivisions must be 3 or greater");
  }
  if (bodySubdivisions < 3) {
    throw new Error("verticalSubdivisions must be 3 or greater");
  }
  startAngle = startAngle || 0;
  endAngle = endAngle || Math.PI * 2;
  const range = endAngle - startAngle;
  const radialParts = radialSubdivisions + 1;
  const bodyParts = bodySubdivisions + 1;
  const numVertices = radialParts * bodyParts;
  const positions = createAugmentedTypedArray(3, numVertices);
  const normals = createAugmentedTypedArray(3, numVertices);
  const texcoords = createAugmentedTypedArray(2, numVertices);
  const indices = createAugmentedTypedArray(3, radialSubdivisions * bodySubdivisions * 2, Uint16Array);
  for (let slice = 0; slice < bodyParts; ++slice) {
    const v = slice / bodySubdivisions;
    const sliceAngle = v * Math.PI * 2;
    const sliceSin = Math.sin(sliceAngle);
    const ringRadius = radius + sliceSin * thickness;
    const ny = Math.cos(sliceAngle);
    const y = ny * thickness;
    for (let ring = 0; ring < radialParts; ++ring) {
      const u = ring / radialSubdivisions;
      const ringAngle = startAngle + u * range;
      const xSin = Math.sin(ringAngle);
      const zCos = Math.cos(ringAngle);
      const x = xSin * ringRadius;
      const z = zCos * ringRadius;
      const nx = xSin * sliceSin;
      const nz = zCos * sliceSin;
      positions.push(x, y, z);
      normals.push(nx, ny, nz);
      texcoords.push(u, 1 - v);
    }
  }
  for (let slice = 0; slice < bodySubdivisions; ++slice) {
    for (let ring = 0; ring < radialSubdivisions; ++ring) {
      const nextRingIndex = 1 + ring;
      const nextSliceIndex = 1 + slice;
      indices.push(
        radialParts * slice + ring,
        radialParts * nextSliceIndex + ring,
        radialParts * slice + nextRingIndex
      );
      indices.push(
        radialParts * nextSliceIndex + ring,
        radialParts * nextSliceIndex + nextRingIndex,
        radialParts * slice + nextRingIndex
      );
    }
  }
  return {
    position: positions,
    normal: normals,
    texcoord: texcoords,
    indices
  };
}
function createDiscVertices(radius, divisions, stacks, innerRadius, stackPower) {
  if (divisions < 3) {
    throw new Error("divisions must be at least 3");
  }
  stacks = stacks ? stacks : 1;
  stackPower = stackPower ? stackPower : 1;
  innerRadius = innerRadius ? innerRadius : 0;
  const numVertices = (divisions + 1) * (stacks + 1);
  const positions = createAugmentedTypedArray(3, numVertices);
  const normals = createAugmentedTypedArray(3, numVertices);
  const texcoords = createAugmentedTypedArray(2, numVertices);
  const indices = createAugmentedTypedArray(3, stacks * divisions * 2, Uint16Array);
  let firstIndex = 0;
  const radiusSpan = radius - innerRadius;
  const pointsPerStack = divisions + 1;
  for (let stack = 0; stack <= stacks; ++stack) {
    const stackRadius = innerRadius + radiusSpan * Math.pow(stack / stacks, stackPower);
    for (let i = 0; i <= divisions; ++i) {
      const theta = 2 * Math.PI * i / divisions;
      const x = stackRadius * Math.cos(theta);
      const z = stackRadius * Math.sin(theta);
      positions.push(x, 0, z);
      normals.push(0, 1, 0);
      texcoords.push(1 - i / divisions, stack / stacks);
      if (stack > 0 && i !== divisions) {
        const a = firstIndex + (i + 1);
        const b = firstIndex + i;
        const c = firstIndex + i - pointsPerStack;
        const d = firstIndex + (i + 1) - pointsPerStack;
        indices.push(a, b, c);
        indices.push(a, c, d);
      }
    }
    firstIndex += divisions + 1;
  }
  return {
    position: positions,
    normal: normals,
    texcoord: texcoords,
    indices
  };
}
function randInt(range) {
  return Math.random() * range | 0;
}
function makeRandomVertexColors(vertices, options) {
  options = options || {};
  const numElements = vertices.position.numElements;
  const vColors = createAugmentedTypedArray(4, numElements, Uint8Array);
  const rand = options.rand || function(ndx, channel) {
    return channel < 3 ? randInt(256) : 255;
  };
  vertices.color = vColors;
  if (vertices.indices) {
    for (let ii = 0; ii < numElements; ++ii) {
      vColors.push(rand(ii, 0), rand(ii, 1), rand(ii, 2), rand(ii, 3));
    }
  } else {
    const numVertsPerColor = options.vertsPerColor || 3;
    const numSets = numElements / numVertsPerColor;
    for (let ii = 0; ii < numSets; ++ii) {
      const color = [rand(ii, 0), rand(ii, 1), rand(ii, 2), rand(ii, 3)];
      for (let jj = 0; jj < numVertsPerColor; ++jj) {
        vColors.push(color);
      }
    }
  }
  return vertices;
}
function createBufferFunc(fn) {
  return function(gl) {
    const arrays = fn.apply(this, Array.prototype.slice.call(arguments, 1));
    return createBuffersFromArrays(gl, arrays);
  };
}
function createBufferInfoFunc(fn) {
  return function(gl) {
    const arrays = fn.apply(null, Array.prototype.slice.call(arguments, 1));
    return createBufferInfoFromArrays(gl, arrays);
  };
}
var arraySpecPropertyNames = [
  "numComponents",
  "size",
  "type",
  "normalize",
  "stride",
  "offset",
  "attrib",
  "name",
  "attribName"
];
function copyElements(src, dst, dstNdx, offset) {
  offset = offset || 0;
  const length3 = src.length;
  for (let ii = 0; ii < length3; ++ii) {
    dst[dstNdx + ii] = src[ii] + offset;
  }
}
function createArrayOfSameType(srcArray, length3) {
  const arraySrc = getArray(srcArray);
  const newArray = new arraySrc.constructor(length3);
  let newArraySpec = newArray;
  if (arraySrc.numComponents && arraySrc.numElements) {
    augmentTypedArray(newArray, arraySrc.numComponents);
  }
  if (srcArray.data) {
    newArraySpec = {
      data: newArray
    };
    copyNamedProperties(arraySpecPropertyNames, srcArray, newArraySpec);
  }
  return newArraySpec;
}
function concatVertices(arrayOfArrays) {
  const names = {};
  let baseName;
  for (let ii = 0; ii < arrayOfArrays.length; ++ii) {
    const arrays = arrayOfArrays[ii];
    Object.keys(arrays).forEach(function(name) {
      if (!names[name]) {
        names[name] = [];
      }
      if (!baseName && name !== "indices") {
        baseName = name;
      }
      const arrayInfo = arrays[name];
      const numComponents = getNumComponents(arrayInfo, name);
      const array = getArray(arrayInfo);
      const numElements = array.length / numComponents;
      names[name].push(numElements);
    });
  }
  function getLengthOfCombinedArrays(name) {
    let length3 = 0;
    let arraySpec;
    for (let ii = 0; ii < arrayOfArrays.length; ++ii) {
      const arrays = arrayOfArrays[ii];
      const arrayInfo = arrays[name];
      const array = getArray(arrayInfo);
      length3 += array.length;
      if (!arraySpec || arrayInfo.data) {
        arraySpec = arrayInfo;
      }
    }
    return {
      length: length3,
      spec: arraySpec
    };
  }
  function copyArraysToNewArray(name, base2, newArray) {
    let baseIndex = 0;
    let offset = 0;
    for (let ii = 0; ii < arrayOfArrays.length; ++ii) {
      const arrays = arrayOfArrays[ii];
      const arrayInfo = arrays[name];
      const array = getArray(arrayInfo);
      if (name === "indices") {
        copyElements(array, newArray, offset, baseIndex);
        baseIndex += base2[ii];
      } else {
        copyElements(array, newArray, offset);
      }
      offset += array.length;
    }
  }
  const base = names[baseName];
  const newArrays = {};
  Object.keys(names).forEach(function(name) {
    const info = getLengthOfCombinedArrays(name);
    const newArraySpec = createArrayOfSameType(info.spec, info.length);
    copyArraysToNewArray(name, base, getArray(newArraySpec));
    newArrays[name] = newArraySpec;
  });
  return newArrays;
}
function duplicateVertices(arrays) {
  const newArrays = {};
  Object.keys(arrays).forEach(function(name) {
    const arraySpec = arrays[name];
    const srcArray = getArray(arraySpec);
    const newArraySpec = createArrayOfSameType(arraySpec, srcArray.length);
    copyElements(srcArray, getArray(newArraySpec), 0);
    newArrays[name] = newArraySpec;
  });
  return newArrays;
}
var create3DFBufferInfo = createBufferInfoFunc(create3DFVertices);
var create3DFBuffers = createBufferFunc(create3DFVertices);
var createCubeBufferInfo = createBufferInfoFunc(createCubeVertices);
var createCubeBuffers = createBufferFunc(createCubeVertices);
var createPlaneBufferInfo = createBufferInfoFunc(createPlaneVertices);
var createPlaneBuffers = createBufferFunc(createPlaneVertices);
var createSphereBufferInfo = createBufferInfoFunc(createSphereVertices);
var createSphereBuffers = createBufferFunc(createSphereVertices);
var createTruncatedConeBufferInfo = createBufferInfoFunc(createTruncatedConeVertices);
var createTruncatedConeBuffers = createBufferFunc(createTruncatedConeVertices);
var createXYQuadBufferInfo = createBufferInfoFunc(createXYQuadVertices);
var createXYQuadBuffers = createBufferFunc(createXYQuadVertices);
var createCrescentBufferInfo = createBufferInfoFunc(createCrescentVertices);
var createCrescentBuffers = createBufferFunc(createCrescentVertices);
var createCylinderBufferInfo = createBufferInfoFunc(createCylinderVertices);
var createCylinderBuffers = createBufferFunc(createCylinderVertices);
var createTorusBufferInfo = createBufferInfoFunc(createTorusVertices);
var createTorusBuffers = createBufferFunc(createTorusVertices);
var createDiscBufferInfo = createBufferInfoFunc(createDiscVertices);
var createDiscBuffers = createBufferFunc(createDiscVertices);
var createCresentBufferInfo = createCrescentBufferInfo;
var createCresentBuffers = createCrescentBuffers;
var createCresentVertices = createCrescentVertices;
var primitives = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  create3DFBufferInfo,
  create3DFBuffers,
  create3DFVertices,
  createAugmentedTypedArray,
  createCubeBufferInfo,
  createCubeBuffers,
  createCubeVertices,
  createPlaneBufferInfo,
  createPlaneBuffers,
  createPlaneVertices,
  createSphereBufferInfo,
  createSphereBuffers,
  createSphereVertices,
  createTruncatedConeBufferInfo,
  createTruncatedConeBuffers,
  createTruncatedConeVertices,
  createXYQuadBufferInfo,
  createXYQuadBuffers,
  createXYQuadVertices,
  createCresentBufferInfo,
  createCresentBuffers,
  createCresentVertices,
  createCrescentBufferInfo,
  createCrescentBuffers,
  createCrescentVertices,
  createCylinderBufferInfo,
  createCylinderBuffers,
  createCylinderVertices,
  createTorusBufferInfo,
  createTorusBuffers,
  createTorusVertices,
  createDiscBufferInfo,
  createDiscBuffers,
  createDiscVertices,
  deindexVertices,
  flattenNormals,
  makeRandomVertexColors,
  reorientDirections,
  reorientNormals,
  reorientPositions,
  reorientVertices,
  concatVertices,
  duplicateVertices
});
function isWebGL2(gl) {
  return !!gl.texStorage2D;
}
var glEnumToString = function() {
  const haveEnumsForType = {};
  const enums = {};
  function addEnums(gl) {
    const type = gl.constructor.name;
    if (!haveEnumsForType[type]) {
      for (const key in gl) {
        if (typeof gl[key] === "number") {
          const existing = enums[gl[key]];
          enums[gl[key]] = existing ? `${existing} | ${key}` : key;
        }
      }
      haveEnumsForType[type] = true;
    }
  }
  return function glEnumToString2(gl, value) {
    addEnums(gl);
    return enums[value] || (typeof value === "number" ? `0x${value.toString(16)}` : value);
  };
}();
var defaults$1 = {
  textureColor: new Uint8Array([128, 192, 255, 255]),
  textureOptions: {},
  crossOrigin: void 0
};
var isArrayBuffer2 = isArrayBuffer$1;
var getShared2DContext = function() {
  let s_ctx;
  return function getShared2DContext2() {
    s_ctx = s_ctx || (typeof document !== "undefined" && document.createElement ? document.createElement("canvas").getContext("2d") : null);
    return s_ctx;
  };
}();
var ALPHA = 6406;
var RGB = 6407;
var RGBA$1 = 6408;
var LUMINANCE = 6409;
var LUMINANCE_ALPHA = 6410;
var DEPTH_COMPONENT$1 = 6402;
var DEPTH_STENCIL$1 = 34041;
var CLAMP_TO_EDGE$1 = 33071;
var NEAREST = 9728;
var LINEAR$1 = 9729;
var TEXTURE_2D$2 = 3553;
var TEXTURE_CUBE_MAP$1 = 34067;
var TEXTURE_3D$1 = 32879;
var TEXTURE_2D_ARRAY$1 = 35866;
var TEXTURE_CUBE_MAP_POSITIVE_X = 34069;
var TEXTURE_CUBE_MAP_NEGATIVE_X = 34070;
var TEXTURE_CUBE_MAP_POSITIVE_Y = 34071;
var TEXTURE_CUBE_MAP_NEGATIVE_Y = 34072;
var TEXTURE_CUBE_MAP_POSITIVE_Z = 34073;
var TEXTURE_CUBE_MAP_NEGATIVE_Z = 34074;
var TEXTURE_MIN_FILTER = 10241;
var TEXTURE_MAG_FILTER = 10240;
var TEXTURE_WRAP_S = 10242;
var TEXTURE_WRAP_T = 10243;
var TEXTURE_WRAP_R = 32882;
var TEXTURE_MIN_LOD = 33082;
var TEXTURE_MAX_LOD = 33083;
var TEXTURE_BASE_LEVEL = 33084;
var TEXTURE_MAX_LEVEL = 33085;
var TEXTURE_COMPARE_MODE = 34892;
var TEXTURE_COMPARE_FUNC = 34893;
var UNPACK_ALIGNMENT = 3317;
var UNPACK_ROW_LENGTH = 3314;
var UNPACK_IMAGE_HEIGHT = 32878;
var UNPACK_SKIP_PIXELS = 3316;
var UNPACK_SKIP_ROWS = 3315;
var UNPACK_SKIP_IMAGES = 32877;
var UNPACK_COLORSPACE_CONVERSION_WEBGL = 37443;
var UNPACK_PREMULTIPLY_ALPHA_WEBGL = 37441;
var UNPACK_FLIP_Y_WEBGL = 37440;
var R8 = 33321;
var R8_SNORM = 36756;
var R16F = 33325;
var R32F = 33326;
var R8UI = 33330;
var R8I = 33329;
var RG16UI = 33338;
var RG16I = 33337;
var RG32UI = 33340;
var RG32I = 33339;
var RG8 = 33323;
var RG8_SNORM = 36757;
var RG16F = 33327;
var RG32F = 33328;
var RG8UI = 33336;
var RG8I = 33335;
var R16UI = 33332;
var R16I = 33331;
var R32UI = 33334;
var R32I = 33333;
var RGB8 = 32849;
var SRGB8 = 35905;
var RGB565$1 = 36194;
var RGB8_SNORM = 36758;
var R11F_G11F_B10F = 35898;
var RGB9_E5 = 35901;
var RGB16F = 34843;
var RGB32F = 34837;
var RGB8UI = 36221;
var RGB8I = 36239;
var RGB16UI = 36215;
var RGB16I = 36233;
var RGB32UI = 36209;
var RGB32I = 36227;
var RGBA8 = 32856;
var SRGB8_ALPHA8 = 35907;
var RGBA8_SNORM = 36759;
var RGB5_A1$1 = 32855;
var RGBA4$1 = 32854;
var RGB10_A2 = 32857;
var RGBA16F = 34842;
var RGBA32F = 34836;
var RGBA8UI = 36220;
var RGBA8I = 36238;
var RGB10_A2UI = 36975;
var RGBA16UI = 36214;
var RGBA16I = 36232;
var RGBA32I = 36226;
var RGBA32UI = 36208;
var DEPTH_COMPONENT16$1 = 33189;
var DEPTH_COMPONENT24$1 = 33190;
var DEPTH_COMPONENT32F$1 = 36012;
var DEPTH32F_STENCIL8$1 = 36013;
var DEPTH24_STENCIL8$1 = 35056;
var BYTE = 5120;
var UNSIGNED_BYTE$1 = 5121;
var SHORT = 5122;
var UNSIGNED_SHORT$1 = 5123;
var INT$1 = 5124;
var UNSIGNED_INT$1 = 5125;
var FLOAT$1 = 5126;
var UNSIGNED_SHORT_4_4_4_4 = 32819;
var UNSIGNED_SHORT_5_5_5_1 = 32820;
var UNSIGNED_SHORT_5_6_5 = 33635;
var HALF_FLOAT = 5131;
var HALF_FLOAT_OES = 36193;
var UNSIGNED_INT_2_10_10_10_REV = 33640;
var UNSIGNED_INT_10F_11F_11F_REV = 35899;
var UNSIGNED_INT_5_9_9_9_REV = 35902;
var FLOAT_32_UNSIGNED_INT_24_8_REV = 36269;
var UNSIGNED_INT_24_8 = 34042;
var RG = 33319;
var RG_INTEGER = 33320;
var RED = 6403;
var RED_INTEGER = 36244;
var RGB_INTEGER = 36248;
var RGBA_INTEGER = 36249;
var formatInfo = {};
{
  const f = formatInfo;
  f[ALPHA] = { numColorComponents: 1 };
  f[LUMINANCE] = { numColorComponents: 1 };
  f[LUMINANCE_ALPHA] = { numColorComponents: 2 };
  f[RGB] = { numColorComponents: 3 };
  f[RGBA$1] = { numColorComponents: 4 };
  f[RED] = { numColorComponents: 1 };
  f[RED_INTEGER] = { numColorComponents: 1 };
  f[RG] = { numColorComponents: 2 };
  f[RG_INTEGER] = { numColorComponents: 2 };
  f[RGB] = { numColorComponents: 3 };
  f[RGB_INTEGER] = { numColorComponents: 3 };
  f[RGBA$1] = { numColorComponents: 4 };
  f[RGBA_INTEGER] = { numColorComponents: 4 };
  f[DEPTH_COMPONENT$1] = { numColorComponents: 1 };
  f[DEPTH_STENCIL$1] = { numColorComponents: 2 };
}
var s_textureInternalFormatInfo;
function getTextureInternalFormatInfo(internalFormat) {
  if (!s_textureInternalFormatInfo) {
    const t = {};
    t[ALPHA] = { textureFormat: ALPHA, colorRenderable: true, textureFilterable: true, bytesPerElement: [1, 2, 2, 4], type: [UNSIGNED_BYTE$1, HALF_FLOAT, HALF_FLOAT_OES, FLOAT$1] };
    t[LUMINANCE] = { textureFormat: LUMINANCE, colorRenderable: true, textureFilterable: true, bytesPerElement: [1, 2, 2, 4], type: [UNSIGNED_BYTE$1, HALF_FLOAT, HALF_FLOAT_OES, FLOAT$1] };
    t[LUMINANCE_ALPHA] = { textureFormat: LUMINANCE_ALPHA, colorRenderable: true, textureFilterable: true, bytesPerElement: [2, 4, 4, 8], type: [UNSIGNED_BYTE$1, HALF_FLOAT, HALF_FLOAT_OES, FLOAT$1] };
    t[RGB] = { textureFormat: RGB, colorRenderable: true, textureFilterable: true, bytesPerElement: [3, 6, 6, 12, 2], type: [UNSIGNED_BYTE$1, HALF_FLOAT, HALF_FLOAT_OES, FLOAT$1, UNSIGNED_SHORT_5_6_5] };
    t[RGBA$1] = { textureFormat: RGBA$1, colorRenderable: true, textureFilterable: true, bytesPerElement: [4, 8, 8, 16, 2, 2], type: [UNSIGNED_BYTE$1, HALF_FLOAT, HALF_FLOAT_OES, FLOAT$1, UNSIGNED_SHORT_4_4_4_4, UNSIGNED_SHORT_5_5_5_1] };
    t[DEPTH_COMPONENT$1] = { textureFormat: DEPTH_COMPONENT$1, colorRenderable: true, textureFilterable: false, bytesPerElement: [2, 4], type: [UNSIGNED_INT$1, UNSIGNED_SHORT$1] };
    t[R8] = { textureFormat: RED, colorRenderable: true, textureFilterable: true, bytesPerElement: [1], type: [UNSIGNED_BYTE$1] };
    t[R8_SNORM] = { textureFormat: RED, colorRenderable: false, textureFilterable: true, bytesPerElement: [1], type: [BYTE] };
    t[R16F] = { textureFormat: RED, colorRenderable: false, textureFilterable: true, bytesPerElement: [4, 2], type: [FLOAT$1, HALF_FLOAT] };
    t[R32F] = { textureFormat: RED, colorRenderable: false, textureFilterable: false, bytesPerElement: [4], type: [FLOAT$1] };
    t[R8UI] = { textureFormat: RED_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [1], type: [UNSIGNED_BYTE$1] };
    t[R8I] = { textureFormat: RED_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [1], type: [BYTE] };
    t[R16UI] = { textureFormat: RED_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [2], type: [UNSIGNED_SHORT$1] };
    t[R16I] = { textureFormat: RED_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [2], type: [SHORT] };
    t[R32UI] = { textureFormat: RED_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [4], type: [UNSIGNED_INT$1] };
    t[R32I] = { textureFormat: RED_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [4], type: [INT$1] };
    t[RG8] = { textureFormat: RG, colorRenderable: true, textureFilterable: true, bytesPerElement: [2], type: [UNSIGNED_BYTE$1] };
    t[RG8_SNORM] = { textureFormat: RG, colorRenderable: false, textureFilterable: true, bytesPerElement: [2], type: [BYTE] };
    t[RG16F] = { textureFormat: RG, colorRenderable: false, textureFilterable: true, bytesPerElement: [8, 4], type: [FLOAT$1, HALF_FLOAT] };
    t[RG32F] = { textureFormat: RG, colorRenderable: false, textureFilterable: false, bytesPerElement: [8], type: [FLOAT$1] };
    t[RG8UI] = { textureFormat: RG_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [2], type: [UNSIGNED_BYTE$1] };
    t[RG8I] = { textureFormat: RG_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [2], type: [BYTE] };
    t[RG16UI] = { textureFormat: RG_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [4], type: [UNSIGNED_SHORT$1] };
    t[RG16I] = { textureFormat: RG_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [4], type: [SHORT] };
    t[RG32UI] = { textureFormat: RG_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [8], type: [UNSIGNED_INT$1] };
    t[RG32I] = { textureFormat: RG_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [8], type: [INT$1] };
    t[RGB8] = { textureFormat: RGB, colorRenderable: true, textureFilterable: true, bytesPerElement: [3], type: [UNSIGNED_BYTE$1] };
    t[SRGB8] = { textureFormat: RGB, colorRenderable: false, textureFilterable: true, bytesPerElement: [3], type: [UNSIGNED_BYTE$1] };
    t[RGB565$1] = { textureFormat: RGB, colorRenderable: true, textureFilterable: true, bytesPerElement: [3, 2], type: [UNSIGNED_BYTE$1, UNSIGNED_SHORT_5_6_5] };
    t[RGB8_SNORM] = { textureFormat: RGB, colorRenderable: false, textureFilterable: true, bytesPerElement: [3], type: [BYTE] };
    t[R11F_G11F_B10F] = { textureFormat: RGB, colorRenderable: false, textureFilterable: true, bytesPerElement: [12, 6, 4], type: [FLOAT$1, HALF_FLOAT, UNSIGNED_INT_10F_11F_11F_REV] };
    t[RGB9_E5] = { textureFormat: RGB, colorRenderable: false, textureFilterable: true, bytesPerElement: [12, 6, 4], type: [FLOAT$1, HALF_FLOAT, UNSIGNED_INT_5_9_9_9_REV] };
    t[RGB16F] = { textureFormat: RGB, colorRenderable: false, textureFilterable: true, bytesPerElement: [12, 6], type: [FLOAT$1, HALF_FLOAT] };
    t[RGB32F] = { textureFormat: RGB, colorRenderable: false, textureFilterable: false, bytesPerElement: [12], type: [FLOAT$1] };
    t[RGB8UI] = { textureFormat: RGB_INTEGER, colorRenderable: false, textureFilterable: false, bytesPerElement: [3], type: [UNSIGNED_BYTE$1] };
    t[RGB8I] = { textureFormat: RGB_INTEGER, colorRenderable: false, textureFilterable: false, bytesPerElement: [3], type: [BYTE] };
    t[RGB16UI] = { textureFormat: RGB_INTEGER, colorRenderable: false, textureFilterable: false, bytesPerElement: [6], type: [UNSIGNED_SHORT$1] };
    t[RGB16I] = { textureFormat: RGB_INTEGER, colorRenderable: false, textureFilterable: false, bytesPerElement: [6], type: [SHORT] };
    t[RGB32UI] = { textureFormat: RGB_INTEGER, colorRenderable: false, textureFilterable: false, bytesPerElement: [12], type: [UNSIGNED_INT$1] };
    t[RGB32I] = { textureFormat: RGB_INTEGER, colorRenderable: false, textureFilterable: false, bytesPerElement: [12], type: [INT$1] };
    t[RGBA8] = { textureFormat: RGBA$1, colorRenderable: true, textureFilterable: true, bytesPerElement: [4], type: [UNSIGNED_BYTE$1] };
    t[SRGB8_ALPHA8] = { textureFormat: RGBA$1, colorRenderable: true, textureFilterable: true, bytesPerElement: [4], type: [UNSIGNED_BYTE$1] };
    t[RGBA8_SNORM] = { textureFormat: RGBA$1, colorRenderable: false, textureFilterable: true, bytesPerElement: [4], type: [BYTE] };
    t[RGB5_A1$1] = { textureFormat: RGBA$1, colorRenderable: true, textureFilterable: true, bytesPerElement: [4, 2, 4], type: [UNSIGNED_BYTE$1, UNSIGNED_SHORT_5_5_5_1, UNSIGNED_INT_2_10_10_10_REV] };
    t[RGBA4$1] = { textureFormat: RGBA$1, colorRenderable: true, textureFilterable: true, bytesPerElement: [4, 2], type: [UNSIGNED_BYTE$1, UNSIGNED_SHORT_4_4_4_4] };
    t[RGB10_A2] = { textureFormat: RGBA$1, colorRenderable: true, textureFilterable: true, bytesPerElement: [4], type: [UNSIGNED_INT_2_10_10_10_REV] };
    t[RGBA16F] = { textureFormat: RGBA$1, colorRenderable: false, textureFilterable: true, bytesPerElement: [16, 8], type: [FLOAT$1, HALF_FLOAT] };
    t[RGBA32F] = { textureFormat: RGBA$1, colorRenderable: false, textureFilterable: false, bytesPerElement: [16], type: [FLOAT$1] };
    t[RGBA8UI] = { textureFormat: RGBA_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [4], type: [UNSIGNED_BYTE$1] };
    t[RGBA8I] = { textureFormat: RGBA_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [4], type: [BYTE] };
    t[RGB10_A2UI] = { textureFormat: RGBA_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [4], type: [UNSIGNED_INT_2_10_10_10_REV] };
    t[RGBA16UI] = { textureFormat: RGBA_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [8], type: [UNSIGNED_SHORT$1] };
    t[RGBA16I] = { textureFormat: RGBA_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [8], type: [SHORT] };
    t[RGBA32I] = { textureFormat: RGBA_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [16], type: [INT$1] };
    t[RGBA32UI] = { textureFormat: RGBA_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: [16], type: [UNSIGNED_INT$1] };
    t[DEPTH_COMPONENT16$1] = { textureFormat: DEPTH_COMPONENT$1, colorRenderable: true, textureFilterable: false, bytesPerElement: [2, 4], type: [UNSIGNED_SHORT$1, UNSIGNED_INT$1] };
    t[DEPTH_COMPONENT24$1] = { textureFormat: DEPTH_COMPONENT$1, colorRenderable: true, textureFilterable: false, bytesPerElement: [4], type: [UNSIGNED_INT$1] };
    t[DEPTH_COMPONENT32F$1] = { textureFormat: DEPTH_COMPONENT$1, colorRenderable: true, textureFilterable: false, bytesPerElement: [4], type: [FLOAT$1] };
    t[DEPTH24_STENCIL8$1] = { textureFormat: DEPTH_STENCIL$1, colorRenderable: true, textureFilterable: false, bytesPerElement: [4], type: [UNSIGNED_INT_24_8] };
    t[DEPTH32F_STENCIL8$1] = { textureFormat: DEPTH_STENCIL$1, colorRenderable: true, textureFilterable: false, bytesPerElement: [4], type: [FLOAT_32_UNSIGNED_INT_24_8_REV] };
    Object.keys(t).forEach(function(internalFormat2) {
      const info = t[internalFormat2];
      info.bytesPerElementMap = {};
      info.bytesPerElement.forEach(function(bytesPerElement, ndx) {
        const type = info.type[ndx];
        info.bytesPerElementMap[type] = bytesPerElement;
      });
    });
    s_textureInternalFormatInfo = t;
  }
  return s_textureInternalFormatInfo[internalFormat];
}
function getBytesPerElementForInternalFormat(internalFormat, type) {
  const info = getTextureInternalFormatInfo(internalFormat);
  if (!info) {
    throw "unknown internal format";
  }
  const bytesPerElement = info.bytesPerElementMap[type];
  if (bytesPerElement === void 0) {
    throw "unknown internal format";
  }
  return bytesPerElement;
}
function getFormatAndTypeForInternalFormat(internalFormat) {
  const info = getTextureInternalFormatInfo(internalFormat);
  if (!info) {
    throw "unknown internal format";
  }
  return {
    format: info.textureFormat,
    type: info.type[0]
  };
}
function isPowerOf2(value) {
  return (value & value - 1) === 0;
}
function canGenerateMipmap(gl, width, height, internalFormat) {
  if (!isWebGL2(gl)) {
    return isPowerOf2(width) && isPowerOf2(height);
  }
  const info = getTextureInternalFormatInfo(internalFormat);
  if (!info) {
    throw "unknown internal format";
  }
  return info.colorRenderable && info.textureFilterable;
}
function canFilter(internalFormat) {
  const info = getTextureInternalFormatInfo(internalFormat);
  if (!info) {
    throw "unknown internal format";
  }
  return info.textureFilterable;
}
function getTextureTypeForArrayType(gl, src, defaultType) {
  if (isArrayBuffer2(src)) {
    return getGLTypeForTypedArray(src);
  }
  return defaultType || UNSIGNED_BYTE$1;
}
function guessDimensions(gl, target, width, height, numElements) {
  if (numElements % 1 !== 0) {
    throw "can't guess dimensions";
  }
  if (!width && !height) {
    const size = Math.sqrt(numElements / (target === TEXTURE_CUBE_MAP$1 ? 6 : 1));
    if (size % 1 === 0) {
      width = size;
      height = size;
    } else {
      width = numElements;
      height = 1;
    }
  } else if (!height) {
    height = numElements / width;
    if (height % 1) {
      throw "can't guess dimensions";
    }
  } else if (!width) {
    width = numElements / height;
    if (width % 1) {
      throw "can't guess dimensions";
    }
  }
  return {
    width,
    height
  };
}
function setPackState(gl, options) {
  if (options.colorspaceConversion !== void 0) {
    gl.pixelStorei(UNPACK_COLORSPACE_CONVERSION_WEBGL, options.colorspaceConversion);
  }
  if (options.premultiplyAlpha !== void 0) {
    gl.pixelStorei(UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.premultiplyAlpha);
  }
  if (options.flipY !== void 0) {
    gl.pixelStorei(UNPACK_FLIP_Y_WEBGL, options.flipY);
  }
}
function setSkipStateToDefault(gl) {
  gl.pixelStorei(UNPACK_ALIGNMENT, 4);
  if (isWebGL2(gl)) {
    gl.pixelStorei(UNPACK_ROW_LENGTH, 0);
    gl.pixelStorei(UNPACK_IMAGE_HEIGHT, 0);
    gl.pixelStorei(UNPACK_SKIP_PIXELS, 0);
    gl.pixelStorei(UNPACK_SKIP_ROWS, 0);
    gl.pixelStorei(UNPACK_SKIP_IMAGES, 0);
  }
}
function setTextureSamplerParameters(gl, target, parameteriFn, options) {
  if (options.minMag) {
    parameteriFn.call(gl, target, TEXTURE_MIN_FILTER, options.minMag);
    parameteriFn.call(gl, target, TEXTURE_MAG_FILTER, options.minMag);
  }
  if (options.min) {
    parameteriFn.call(gl, target, TEXTURE_MIN_FILTER, options.min);
  }
  if (options.mag) {
    parameteriFn.call(gl, target, TEXTURE_MAG_FILTER, options.mag);
  }
  if (options.wrap) {
    parameteriFn.call(gl, target, TEXTURE_WRAP_S, options.wrap);
    parameteriFn.call(gl, target, TEXTURE_WRAP_T, options.wrap);
    if (target === TEXTURE_3D$1 || isSampler(gl, target)) {
      parameteriFn.call(gl, target, TEXTURE_WRAP_R, options.wrap);
    }
  }
  if (options.wrapR) {
    parameteriFn.call(gl, target, TEXTURE_WRAP_R, options.wrapR);
  }
  if (options.wrapS) {
    parameteriFn.call(gl, target, TEXTURE_WRAP_S, options.wrapS);
  }
  if (options.wrapT) {
    parameteriFn.call(gl, target, TEXTURE_WRAP_T, options.wrapT);
  }
  if (options.minLod !== void 0) {
    parameteriFn.call(gl, target, TEXTURE_MIN_LOD, options.minLod);
  }
  if (options.maxLod !== void 0) {
    parameteriFn.call(gl, target, TEXTURE_MAX_LOD, options.maxLod);
  }
  if (options.baseLevel !== void 0) {
    parameteriFn.call(gl, target, TEXTURE_BASE_LEVEL, options.baseLevel);
  }
  if (options.maxLevel !== void 0) {
    parameteriFn.call(gl, target, TEXTURE_MAX_LEVEL, options.maxLevel);
  }
  if (options.compareFunc !== void 0) {
    parameteriFn.call(gl, target, TEXTURE_COMPARE_FUNC, options.compareFunc);
  }
  if (options.compareMode !== void 0) {
    parameteriFn.call(gl, target, TEXTURE_COMPARE_MODE, options.compareMode);
  }
}
function setTextureParameters(gl, tex, options) {
  const target = options.target || TEXTURE_2D$2;
  gl.bindTexture(target, tex);
  setTextureSamplerParameters(gl, target, gl.texParameteri, options);
}
function make1Pixel(color) {
  color = color || defaults$1.textureColor;
  if (isArrayBuffer2(color)) {
    return color;
  }
  return new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
}
function setTextureFilteringForSize(gl, tex, options, width, height, internalFormat) {
  options = options || defaults$1.textureOptions;
  internalFormat = internalFormat || RGBA$1;
  const target = options.target || TEXTURE_2D$2;
  width = width || options.width;
  height = height || options.height;
  gl.bindTexture(target, tex);
  if (canGenerateMipmap(gl, width, height, internalFormat)) {
    gl.generateMipmap(target);
  } else {
    const filtering = canFilter(internalFormat) ? LINEAR$1 : NEAREST;
    gl.texParameteri(target, TEXTURE_MIN_FILTER, filtering);
    gl.texParameteri(target, TEXTURE_MAG_FILTER, filtering);
    gl.texParameteri(target, TEXTURE_WRAP_S, CLAMP_TO_EDGE$1);
    gl.texParameteri(target, TEXTURE_WRAP_T, CLAMP_TO_EDGE$1);
  }
}
function shouldAutomaticallySetTextureFilteringForSize(options) {
  return options.auto === true || options.auto === void 0 && options.level === void 0;
}
function getCubeFaceOrder(gl, options) {
  options = options || {};
  return options.cubeFaceOrder || [
    TEXTURE_CUBE_MAP_POSITIVE_X,
    TEXTURE_CUBE_MAP_NEGATIVE_X,
    TEXTURE_CUBE_MAP_POSITIVE_Y,
    TEXTURE_CUBE_MAP_NEGATIVE_Y,
    TEXTURE_CUBE_MAP_POSITIVE_Z,
    TEXTURE_CUBE_MAP_NEGATIVE_Z
  ];
}
function getCubeFacesWithNdx(gl, options) {
  const faces = getCubeFaceOrder(gl, options);
  const facesWithNdx = faces.map(function(face, ndx) {
    return { face, ndx };
  });
  facesWithNdx.sort(function(a, b) {
    return a.face - b.face;
  });
  return facesWithNdx;
}
function setTextureFromElement(gl, tex, element, options) {
  options = options || defaults$1.textureOptions;
  const target = options.target || TEXTURE_2D$2;
  const level = options.level || 0;
  let width = element.width;
  let height = element.height;
  const internalFormat = options.internalFormat || options.format || RGBA$1;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  const type = options.type || formatType.type;
  setPackState(gl, options);
  gl.bindTexture(target, tex);
  if (target === TEXTURE_CUBE_MAP$1) {
    const imgWidth = element.width;
    const imgHeight = element.height;
    let size;
    let slices;
    if (imgWidth / 6 === imgHeight) {
      size = imgHeight;
      slices = [0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0];
    } else if (imgHeight / 6 === imgWidth) {
      size = imgWidth;
      slices = [0, 0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5];
    } else if (imgWidth / 3 === imgHeight / 2) {
      size = imgWidth / 3;
      slices = [0, 0, 1, 0, 2, 0, 0, 1, 1, 1, 2, 1];
    } else if (imgWidth / 2 === imgHeight / 3) {
      size = imgWidth / 2;
      slices = [0, 0, 1, 0, 0, 1, 1, 1, 0, 2, 1, 2];
    } else {
      throw "can't figure out cube map from element: " + (element.src ? element.src : element.nodeName);
    }
    const ctx = getShared2DContext();
    if (ctx) {
      ctx.canvas.width = size;
      ctx.canvas.height = size;
      width = size;
      height = size;
      getCubeFacesWithNdx(gl, options).forEach(function(f) {
        const xOffset = slices[f.ndx * 2 + 0] * size;
        const yOffset = slices[f.ndx * 2 + 1] * size;
        ctx.drawImage(element, xOffset, yOffset, size, size, 0, 0, size, size);
        gl.texImage2D(f.face, level, internalFormat, format, type, ctx.canvas);
      });
      ctx.canvas.width = 1;
      ctx.canvas.height = 1;
    } else if (typeof createImageBitmap !== "undefined") {
      width = size;
      height = size;
      getCubeFacesWithNdx(gl, options).forEach(function(f) {
        const xOffset = slices[f.ndx * 2 + 0] * size;
        const yOffset = slices[f.ndx * 2 + 1] * size;
        gl.texImage2D(f.face, level, internalFormat, size, size, 0, format, type, null);
        createImageBitmap(element, xOffset, yOffset, size, size, {
          premultiplyAlpha: "none",
          colorSpaceConversion: "none"
        }).then(function(imageBitmap) {
          setPackState(gl, options);
          gl.bindTexture(target, tex);
          gl.texImage2D(f.face, level, internalFormat, format, type, imageBitmap);
          if (shouldAutomaticallySetTextureFilteringForSize(options)) {
            setTextureFilteringForSize(gl, tex, options, width, height, internalFormat);
          }
        });
      });
    }
  } else if (target === TEXTURE_3D$1 || target === TEXTURE_2D_ARRAY$1) {
    const smallest = Math.min(element.width, element.height);
    const largest = Math.max(element.width, element.height);
    const depth = largest / smallest;
    if (depth % 1 !== 0) {
      throw "can not compute 3D dimensions of element";
    }
    const xMult = element.width === largest ? 1 : 0;
    const yMult = element.height === largest ? 1 : 0;
    gl.pixelStorei(UNPACK_ALIGNMENT, 1);
    gl.pixelStorei(UNPACK_ROW_LENGTH, element.width);
    gl.pixelStorei(UNPACK_IMAGE_HEIGHT, 0);
    gl.pixelStorei(UNPACK_SKIP_IMAGES, 0);
    gl.texImage3D(target, level, internalFormat, smallest, smallest, smallest, 0, format, type, null);
    for (let d = 0; d < depth; ++d) {
      const srcX = d * smallest * xMult;
      const srcY = d * smallest * yMult;
      gl.pixelStorei(UNPACK_SKIP_PIXELS, srcX);
      gl.pixelStorei(UNPACK_SKIP_ROWS, srcY);
      gl.texSubImage3D(target, level, 0, 0, d, smallest, smallest, 1, format, type, element);
    }
    setSkipStateToDefault(gl);
  } else {
    gl.texImage2D(target, level, internalFormat, format, type, element);
  }
  if (shouldAutomaticallySetTextureFilteringForSize(options)) {
    setTextureFilteringForSize(gl, tex, options, width, height, internalFormat);
  }
  setTextureParameters(gl, tex, options);
}
function noop() {
}
function urlIsSameOrigin(url) {
  if (typeof document !== "undefined") {
    const a = document.createElement("a");
    a.href = url;
    return a.hostname === location.hostname && a.port === location.port && a.protocol === location.protocol;
  } else {
    const localOrigin = new URL(location.href).origin;
    const urlOrigin = new URL(url, location.href).origin;
    return urlOrigin === localOrigin;
  }
}
function setToAnonymousIfUndefinedAndURLIsNotSameOrigin(url, crossOrigin) {
  return crossOrigin === void 0 && !urlIsSameOrigin(url) ? "anonymous" : crossOrigin;
}
function loadImage(url, crossOrigin, callback) {
  callback = callback || noop;
  let img;
  crossOrigin = crossOrigin !== void 0 ? crossOrigin : defaults$1.crossOrigin;
  crossOrigin = setToAnonymousIfUndefinedAndURLIsNotSameOrigin(url, crossOrigin);
  if (typeof Image !== "undefined") {
    img = new Image();
    if (crossOrigin !== void 0) {
      img.crossOrigin = crossOrigin;
    }
    const clearEventHandlers = function clearEventHandlers2() {
      img.removeEventListener("error", onError);
      img.removeEventListener("load", onLoad);
      img = null;
    };
    const onError = function onError2() {
      const msg = "couldn't load image: " + url;
      error$1(msg);
      callback(msg, img);
      clearEventHandlers();
    };
    const onLoad = function onLoad2() {
      callback(null, img);
      clearEventHandlers();
    };
    img.addEventListener("error", onError);
    img.addEventListener("load", onLoad);
    img.src = url;
    return img;
  } else if (typeof ImageBitmap !== "undefined") {
    let err;
    let bm;
    const cb = function cb2() {
      callback(err, bm);
    };
    const options = {};
    if (crossOrigin) {
      options.mode = "cors";
    }
    fetch(url, options).then(function(response) {
      if (!response.ok) {
        throw response;
      }
      return response.blob();
    }).then(function(blob) {
      return createImageBitmap(blob, {
        premultiplyAlpha: "none",
        colorSpaceConversion: "none"
      });
    }).then(function(bitmap) {
      bm = bitmap;
      setTimeout(cb);
    }).catch(function(e) {
      err = e;
      setTimeout(cb);
    });
    img = null;
  }
  return img;
}
function isTexImageSource(obj) {
  return typeof ImageBitmap !== "undefined" && obj instanceof ImageBitmap || typeof ImageData !== "undefined" && obj instanceof ImageData || typeof HTMLElement !== "undefined" && obj instanceof HTMLElement;
}
function loadAndUseImage(obj, crossOrigin, callback) {
  if (isTexImageSource(obj)) {
    setTimeout(function() {
      callback(null, obj);
    });
    return obj;
  }
  return loadImage(obj, crossOrigin, callback);
}
function setTextureTo1PixelColor(gl, tex, options) {
  options = options || defaults$1.textureOptions;
  const target = options.target || TEXTURE_2D$2;
  gl.bindTexture(target, tex);
  if (options.color === false) {
    return;
  }
  const color = make1Pixel(options.color);
  if (target === TEXTURE_CUBE_MAP$1) {
    for (let ii = 0; ii < 6; ++ii) {
      gl.texImage2D(TEXTURE_CUBE_MAP_POSITIVE_X + ii, 0, RGBA$1, 1, 1, 0, RGBA$1, UNSIGNED_BYTE$1, color);
    }
  } else if (target === TEXTURE_3D$1 || target === TEXTURE_2D_ARRAY$1) {
    gl.texImage3D(target, 0, RGBA$1, 1, 1, 1, 0, RGBA$1, UNSIGNED_BYTE$1, color);
  } else {
    gl.texImage2D(target, 0, RGBA$1, 1, 1, 0, RGBA$1, UNSIGNED_BYTE$1, color);
  }
}
function loadTextureFromUrl(gl, tex, options, callback) {
  callback = callback || noop;
  options = options || defaults$1.textureOptions;
  setTextureTo1PixelColor(gl, tex, options);
  options = Object.assign({}, options);
  const img = loadAndUseImage(options.src, options.crossOrigin, function(err, img2) {
    if (err) {
      callback(err, tex, img2);
    } else {
      setTextureFromElement(gl, tex, img2, options);
      callback(null, tex, img2);
    }
  });
  return img;
}
function loadCubemapFromUrls(gl, tex, options, callback) {
  callback = callback || noop;
  const urls = options.src;
  if (urls.length !== 6) {
    throw "there must be 6 urls for a cubemap";
  }
  const level = options.level || 0;
  const internalFormat = options.internalFormat || options.format || RGBA$1;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  const type = options.type || UNSIGNED_BYTE$1;
  const target = options.target || TEXTURE_2D$2;
  if (target !== TEXTURE_CUBE_MAP$1) {
    throw "target must be TEXTURE_CUBE_MAP";
  }
  setTextureTo1PixelColor(gl, tex, options);
  options = Object.assign({}, options);
  let numToLoad = 6;
  const errors = [];
  const faces = getCubeFaceOrder(gl, options);
  let imgs;
  function uploadImg(faceTarget) {
    return function(err, img) {
      --numToLoad;
      if (err) {
        errors.push(err);
      } else {
        if (img.width !== img.height) {
          errors.push("cubemap face img is not a square: " + img.src);
        } else {
          setPackState(gl, options);
          gl.bindTexture(target, tex);
          if (numToLoad === 5) {
            getCubeFaceOrder().forEach(function(otherTarget) {
              gl.texImage2D(otherTarget, level, internalFormat, format, type, img);
            });
          } else {
            gl.texImage2D(faceTarget, level, internalFormat, format, type, img);
          }
          if (shouldAutomaticallySetTextureFilteringForSize(options)) {
            gl.generateMipmap(target);
          }
        }
      }
      if (numToLoad === 0) {
        callback(errors.length ? errors : void 0, tex, imgs);
      }
    };
  }
  imgs = urls.map(function(url, ndx) {
    return loadAndUseImage(url, options.crossOrigin, uploadImg(faces[ndx]));
  });
}
function loadSlicesFromUrls(gl, tex, options, callback) {
  callback = callback || noop;
  const urls = options.src;
  const internalFormat = options.internalFormat || options.format || RGBA$1;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  const type = options.type || UNSIGNED_BYTE$1;
  const target = options.target || TEXTURE_2D_ARRAY$1;
  if (target !== TEXTURE_3D$1 && target !== TEXTURE_2D_ARRAY$1) {
    throw "target must be TEXTURE_3D or TEXTURE_2D_ARRAY";
  }
  setTextureTo1PixelColor(gl, tex, options);
  options = Object.assign({}, options);
  let numToLoad = urls.length;
  const errors = [];
  let imgs;
  const level = options.level || 0;
  let width = options.width;
  let height = options.height;
  const depth = urls.length;
  let firstImage = true;
  function uploadImg(slice) {
    return function(err, img) {
      --numToLoad;
      if (err) {
        errors.push(err);
      } else {
        setPackState(gl, options);
        gl.bindTexture(target, tex);
        if (firstImage) {
          firstImage = false;
          width = options.width || img.width;
          height = options.height || img.height;
          gl.texImage3D(target, level, internalFormat, width, height, depth, 0, format, type, null);
          for (let s = 0; s < depth; ++s) {
            gl.texSubImage3D(target, level, 0, 0, s, width, height, 1, format, type, img);
          }
        } else {
          let src = img;
          let ctx;
          if (img.width !== width || img.height !== height) {
            ctx = getShared2DContext();
            src = ctx.canvas;
            ctx.canvas.width = width;
            ctx.canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
          }
          gl.texSubImage3D(target, level, 0, 0, slice, width, height, 1, format, type, src);
          if (ctx && src === ctx.canvas) {
            ctx.canvas.width = 0;
            ctx.canvas.height = 0;
          }
        }
        if (shouldAutomaticallySetTextureFilteringForSize(options)) {
          gl.generateMipmap(target);
        }
      }
      if (numToLoad === 0) {
        callback(errors.length ? errors : void 0, tex, imgs);
      }
    };
  }
  imgs = urls.map(function(url, ndx) {
    return loadAndUseImage(url, options.crossOrigin, uploadImg(ndx));
  });
}
function setTextureFromArray(gl, tex, src, options) {
  options = options || defaults$1.textureOptions;
  const target = options.target || TEXTURE_2D$2;
  gl.bindTexture(target, tex);
  let width = options.width;
  let height = options.height;
  let depth = options.depth;
  const level = options.level || 0;
  const internalFormat = options.internalFormat || options.format || RGBA$1;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  const type = options.type || getTextureTypeForArrayType(gl, src, formatType.type);
  if (!isArrayBuffer2(src)) {
    const Type = getTypedArrayTypeForGLType(type);
    src = new Type(src);
  } else if (src instanceof Uint8ClampedArray) {
    src = new Uint8Array(src.buffer);
  }
  const bytesPerElement = getBytesPerElementForInternalFormat(internalFormat, type);
  const numElements = src.byteLength / bytesPerElement;
  if (numElements % 1) {
    throw "length wrong size for format: " + glEnumToString(gl, format);
  }
  let dimensions;
  if (target === TEXTURE_3D$1 || target === TEXTURE_2D_ARRAY$1) {
    if (!width && !height && !depth) {
      const size = Math.cbrt(numElements);
      if (size % 1 !== 0) {
        throw "can't guess cube size of array of numElements: " + numElements;
      }
      width = size;
      height = size;
      depth = size;
    } else if (width && (!height || !depth)) {
      dimensions = guessDimensions(gl, target, height, depth, numElements / width);
      height = dimensions.width;
      depth = dimensions.height;
    } else if (height && (!width || !depth)) {
      dimensions = guessDimensions(gl, target, width, depth, numElements / height);
      width = dimensions.width;
      depth = dimensions.height;
    } else {
      dimensions = guessDimensions(gl, target, width, height, numElements / depth);
      width = dimensions.width;
      height = dimensions.height;
    }
  } else {
    dimensions = guessDimensions(gl, target, width, height, numElements);
    width = dimensions.width;
    height = dimensions.height;
  }
  setSkipStateToDefault(gl);
  gl.pixelStorei(UNPACK_ALIGNMENT, options.unpackAlignment || 1);
  setPackState(gl, options);
  if (target === TEXTURE_CUBE_MAP$1) {
    const elementsPerElement = bytesPerElement / src.BYTES_PER_ELEMENT;
    const faceSize = numElements / 6 * elementsPerElement;
    getCubeFacesWithNdx(gl, options).forEach((f) => {
      const offset = faceSize * f.ndx;
      const data = src.subarray(offset, offset + faceSize);
      gl.texImage2D(f.face, level, internalFormat, width, height, 0, format, type, data);
    });
  } else if (target === TEXTURE_3D$1 || target === TEXTURE_2D_ARRAY$1) {
    gl.texImage3D(target, level, internalFormat, width, height, depth, 0, format, type, src);
  } else {
    gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, src);
  }
  return {
    width,
    height,
    depth,
    type
  };
}
function setEmptyTexture(gl, tex, options) {
  const target = options.target || TEXTURE_2D$2;
  gl.bindTexture(target, tex);
  const level = options.level || 0;
  const internalFormat = options.internalFormat || options.format || RGBA$1;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  const type = options.type || formatType.type;
  setPackState(gl, options);
  if (target === TEXTURE_CUBE_MAP$1) {
    for (let ii = 0; ii < 6; ++ii) {
      gl.texImage2D(TEXTURE_CUBE_MAP_POSITIVE_X + ii, level, internalFormat, options.width, options.height, 0, format, type, null);
    }
  } else if (target === TEXTURE_3D$1 || target === TEXTURE_2D_ARRAY$1) {
    gl.texImage3D(target, level, internalFormat, options.width, options.height, options.depth, 0, format, type, null);
  } else {
    gl.texImage2D(target, level, internalFormat, options.width, options.height, 0, format, type, null);
  }
}
function createTexture(gl, options, callback) {
  callback = callback || noop;
  options = options || defaults$1.textureOptions;
  const tex = gl.createTexture();
  const target = options.target || TEXTURE_2D$2;
  let width = options.width || 1;
  let height = options.height || 1;
  const internalFormat = options.internalFormat || RGBA$1;
  gl.bindTexture(target, tex);
  if (target === TEXTURE_CUBE_MAP$1) {
    gl.texParameteri(target, TEXTURE_WRAP_S, CLAMP_TO_EDGE$1);
    gl.texParameteri(target, TEXTURE_WRAP_T, CLAMP_TO_EDGE$1);
  }
  let src = options.src;
  if (src) {
    if (typeof src === "function") {
      src = src(gl, options);
    }
    if (typeof src === "string") {
      loadTextureFromUrl(gl, tex, options, callback);
    } else if (isArrayBuffer2(src) || Array.isArray(src) && (typeof src[0] === "number" || Array.isArray(src[0]) || isArrayBuffer2(src[0]))) {
      const dimensions = setTextureFromArray(gl, tex, src, options);
      width = dimensions.width;
      height = dimensions.height;
    } else if (Array.isArray(src) && (typeof src[0] === "string" || isTexImageSource(src[0]))) {
      if (target === TEXTURE_CUBE_MAP$1) {
        loadCubemapFromUrls(gl, tex, options, callback);
      } else {
        loadSlicesFromUrls(gl, tex, options, callback);
      }
    } else {
      setTextureFromElement(gl, tex, src, options);
      width = src.width;
      height = src.height;
    }
  } else {
    setEmptyTexture(gl, tex, options);
  }
  if (shouldAutomaticallySetTextureFilteringForSize(options)) {
    setTextureFilteringForSize(gl, tex, options, width, height, internalFormat);
  }
  setTextureParameters(gl, tex, options);
  return tex;
}
var error = error$1;
function getElementById(id) {
  return typeof document !== "undefined" && document.getElementById ? document.getElementById(id) : null;
}
var TEXTURE0 = 33984;
var ARRAY_BUFFER = 34962;
var ELEMENT_ARRAY_BUFFER$1 = 34963;
var COMPILE_STATUS = 35713;
var LINK_STATUS = 35714;
var FRAGMENT_SHADER = 35632;
var VERTEX_SHADER = 35633;
var SEPARATE_ATTRIBS = 35981;
var ACTIVE_UNIFORMS = 35718;
var ACTIVE_ATTRIBUTES = 35721;
var TRANSFORM_FEEDBACK_VARYINGS = 35971;
var ACTIVE_UNIFORM_BLOCKS = 35382;
var UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER = 35396;
var UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER = 35398;
var UNIFORM_BLOCK_DATA_SIZE = 35392;
var UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES = 35395;
var FLOAT = 5126;
var FLOAT_VEC2 = 35664;
var FLOAT_VEC3 = 35665;
var FLOAT_VEC4 = 35666;
var INT = 5124;
var INT_VEC2 = 35667;
var INT_VEC3 = 35668;
var INT_VEC4 = 35669;
var BOOL = 35670;
var BOOL_VEC2 = 35671;
var BOOL_VEC3 = 35672;
var BOOL_VEC4 = 35673;
var FLOAT_MAT2 = 35674;
var FLOAT_MAT3 = 35675;
var FLOAT_MAT4 = 35676;
var SAMPLER_2D = 35678;
var SAMPLER_CUBE = 35680;
var SAMPLER_3D = 35679;
var SAMPLER_2D_SHADOW = 35682;
var FLOAT_MAT2x3 = 35685;
var FLOAT_MAT2x4 = 35686;
var FLOAT_MAT3x2 = 35687;
var FLOAT_MAT3x4 = 35688;
var FLOAT_MAT4x2 = 35689;
var FLOAT_MAT4x3 = 35690;
var SAMPLER_2D_ARRAY = 36289;
var SAMPLER_2D_ARRAY_SHADOW = 36292;
var SAMPLER_CUBE_SHADOW = 36293;
var UNSIGNED_INT = 5125;
var UNSIGNED_INT_VEC2 = 36294;
var UNSIGNED_INT_VEC3 = 36295;
var UNSIGNED_INT_VEC4 = 36296;
var INT_SAMPLER_2D = 36298;
var INT_SAMPLER_3D = 36299;
var INT_SAMPLER_CUBE = 36300;
var INT_SAMPLER_2D_ARRAY = 36303;
var UNSIGNED_INT_SAMPLER_2D = 36306;
var UNSIGNED_INT_SAMPLER_3D = 36307;
var UNSIGNED_INT_SAMPLER_CUBE = 36308;
var UNSIGNED_INT_SAMPLER_2D_ARRAY = 36311;
var TEXTURE_2D$1 = 3553;
var TEXTURE_CUBE_MAP = 34067;
var TEXTURE_3D = 32879;
var TEXTURE_2D_ARRAY = 35866;
var typeMap = {};
function getBindPointForSamplerType(gl, type) {
  return typeMap[type].bindPoint;
}
function floatSetter(gl, location2) {
  return function(v) {
    gl.uniform1f(location2, v);
  };
}
function floatArraySetter(gl, location2) {
  return function(v) {
    gl.uniform1fv(location2, v);
  };
}
function floatVec2Setter(gl, location2) {
  return function(v) {
    gl.uniform2fv(location2, v);
  };
}
function floatVec3Setter(gl, location2) {
  return function(v) {
    gl.uniform3fv(location2, v);
  };
}
function floatVec4Setter(gl, location2) {
  return function(v) {
    gl.uniform4fv(location2, v);
  };
}
function intSetter(gl, location2) {
  return function(v) {
    gl.uniform1i(location2, v);
  };
}
function intArraySetter(gl, location2) {
  return function(v) {
    gl.uniform1iv(location2, v);
  };
}
function intVec2Setter(gl, location2) {
  return function(v) {
    gl.uniform2iv(location2, v);
  };
}
function intVec3Setter(gl, location2) {
  return function(v) {
    gl.uniform3iv(location2, v);
  };
}
function intVec4Setter(gl, location2) {
  return function(v) {
    gl.uniform4iv(location2, v);
  };
}
function uintSetter(gl, location2) {
  return function(v) {
    gl.uniform1ui(location2, v);
  };
}
function uintArraySetter(gl, location2) {
  return function(v) {
    gl.uniform1uiv(location2, v);
  };
}
function uintVec2Setter(gl, location2) {
  return function(v) {
    gl.uniform2uiv(location2, v);
  };
}
function uintVec3Setter(gl, location2) {
  return function(v) {
    gl.uniform3uiv(location2, v);
  };
}
function uintVec4Setter(gl, location2) {
  return function(v) {
    gl.uniform4uiv(location2, v);
  };
}
function floatMat2Setter(gl, location2) {
  return function(v) {
    gl.uniformMatrix2fv(location2, false, v);
  };
}
function floatMat3Setter(gl, location2) {
  return function(v) {
    gl.uniformMatrix3fv(location2, false, v);
  };
}
function floatMat4Setter(gl, location2) {
  return function(v) {
    gl.uniformMatrix4fv(location2, false, v);
  };
}
function floatMat23Setter(gl, location2) {
  return function(v) {
    gl.uniformMatrix2x3fv(location2, false, v);
  };
}
function floatMat32Setter(gl, location2) {
  return function(v) {
    gl.uniformMatrix3x2fv(location2, false, v);
  };
}
function floatMat24Setter(gl, location2) {
  return function(v) {
    gl.uniformMatrix2x4fv(location2, false, v);
  };
}
function floatMat42Setter(gl, location2) {
  return function(v) {
    gl.uniformMatrix4x2fv(location2, false, v);
  };
}
function floatMat34Setter(gl, location2) {
  return function(v) {
    gl.uniformMatrix3x4fv(location2, false, v);
  };
}
function floatMat43Setter(gl, location2) {
  return function(v) {
    gl.uniformMatrix4x3fv(location2, false, v);
  };
}
function samplerSetter(gl, type, unit, location2) {
  const bindPoint = getBindPointForSamplerType(gl, type);
  return isWebGL2(gl) ? function(textureOrPair) {
    let texture;
    let sampler;
    if (!textureOrPair || isTexture(gl, textureOrPair)) {
      texture = textureOrPair;
      sampler = null;
    } else {
      texture = textureOrPair.texture;
      sampler = textureOrPair.sampler;
    }
    gl.uniform1i(location2, unit);
    gl.activeTexture(TEXTURE0 + unit);
    gl.bindTexture(bindPoint, texture);
    gl.bindSampler(unit, sampler);
  } : function(texture) {
    gl.uniform1i(location2, unit);
    gl.activeTexture(TEXTURE0 + unit);
    gl.bindTexture(bindPoint, texture);
  };
}
function samplerArraySetter(gl, type, unit, location2, size) {
  const bindPoint = getBindPointForSamplerType(gl, type);
  const units = new Int32Array(size);
  for (let ii = 0; ii < size; ++ii) {
    units[ii] = unit + ii;
  }
  return isWebGL2(gl) ? function(textures) {
    gl.uniform1iv(location2, units);
    textures.forEach(function(textureOrPair, index) {
      gl.activeTexture(TEXTURE0 + units[index]);
      let texture;
      let sampler;
      if (!textureOrPair || isTexture(gl, textureOrPair)) {
        texture = textureOrPair;
        sampler = null;
      } else {
        texture = textureOrPair.texture;
        sampler = textureOrPair.sampler;
      }
      gl.bindSampler(unit, sampler);
      gl.bindTexture(bindPoint, texture);
    });
  } : function(textures) {
    gl.uniform1iv(location2, units);
    textures.forEach(function(texture, index) {
      gl.activeTexture(TEXTURE0 + units[index]);
      gl.bindTexture(bindPoint, texture);
    });
  };
}
typeMap[FLOAT] = { Type: Float32Array, size: 4, setter: floatSetter, arraySetter: floatArraySetter };
typeMap[FLOAT_VEC2] = { Type: Float32Array, size: 8, setter: floatVec2Setter, cols: 2 };
typeMap[FLOAT_VEC3] = { Type: Float32Array, size: 12, setter: floatVec3Setter, cols: 3 };
typeMap[FLOAT_VEC4] = { Type: Float32Array, size: 16, setter: floatVec4Setter, cols: 4 };
typeMap[INT] = { Type: Int32Array, size: 4, setter: intSetter, arraySetter: intArraySetter };
typeMap[INT_VEC2] = { Type: Int32Array, size: 8, setter: intVec2Setter, cols: 2 };
typeMap[INT_VEC3] = { Type: Int32Array, size: 12, setter: intVec3Setter, cols: 3 };
typeMap[INT_VEC4] = { Type: Int32Array, size: 16, setter: intVec4Setter, cols: 4 };
typeMap[UNSIGNED_INT] = { Type: Uint32Array, size: 4, setter: uintSetter, arraySetter: uintArraySetter };
typeMap[UNSIGNED_INT_VEC2] = { Type: Uint32Array, size: 8, setter: uintVec2Setter, cols: 2 };
typeMap[UNSIGNED_INT_VEC3] = { Type: Uint32Array, size: 12, setter: uintVec3Setter, cols: 3 };
typeMap[UNSIGNED_INT_VEC4] = { Type: Uint32Array, size: 16, setter: uintVec4Setter, cols: 4 };
typeMap[BOOL] = { Type: Uint32Array, size: 4, setter: intSetter, arraySetter: intArraySetter };
typeMap[BOOL_VEC2] = { Type: Uint32Array, size: 8, setter: intVec2Setter, cols: 2 };
typeMap[BOOL_VEC3] = { Type: Uint32Array, size: 12, setter: intVec3Setter, cols: 3 };
typeMap[BOOL_VEC4] = { Type: Uint32Array, size: 16, setter: intVec4Setter, cols: 4 };
typeMap[FLOAT_MAT2] = { Type: Float32Array, size: 32, setter: floatMat2Setter, rows: 2, cols: 2 };
typeMap[FLOAT_MAT3] = { Type: Float32Array, size: 48, setter: floatMat3Setter, rows: 3, cols: 3 };
typeMap[FLOAT_MAT4] = { Type: Float32Array, size: 64, setter: floatMat4Setter, rows: 4, cols: 4 };
typeMap[FLOAT_MAT2x3] = { Type: Float32Array, size: 32, setter: floatMat23Setter, rows: 2, cols: 3 };
typeMap[FLOAT_MAT2x4] = { Type: Float32Array, size: 32, setter: floatMat24Setter, rows: 2, cols: 4 };
typeMap[FLOAT_MAT3x2] = { Type: Float32Array, size: 48, setter: floatMat32Setter, rows: 3, cols: 2 };
typeMap[FLOAT_MAT3x4] = { Type: Float32Array, size: 48, setter: floatMat34Setter, rows: 3, cols: 4 };
typeMap[FLOAT_MAT4x2] = { Type: Float32Array, size: 64, setter: floatMat42Setter, rows: 4, cols: 2 };
typeMap[FLOAT_MAT4x3] = { Type: Float32Array, size: 64, setter: floatMat43Setter, rows: 4, cols: 3 };
typeMap[SAMPLER_2D] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1 };
typeMap[SAMPLER_CUBE] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP };
typeMap[SAMPLER_3D] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D };
typeMap[SAMPLER_2D_SHADOW] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1 };
typeMap[SAMPLER_2D_ARRAY] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY };
typeMap[SAMPLER_2D_ARRAY_SHADOW] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY };
typeMap[SAMPLER_CUBE_SHADOW] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP };
typeMap[INT_SAMPLER_2D] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1 };
typeMap[INT_SAMPLER_3D] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D };
typeMap[INT_SAMPLER_CUBE] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP };
typeMap[INT_SAMPLER_2D_ARRAY] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY };
typeMap[UNSIGNED_INT_SAMPLER_2D] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1 };
typeMap[UNSIGNED_INT_SAMPLER_3D] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D };
typeMap[UNSIGNED_INT_SAMPLER_CUBE] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP };
typeMap[UNSIGNED_INT_SAMPLER_2D_ARRAY] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY };
function floatAttribSetter(gl, index) {
  return function(b) {
    if (b.value) {
      gl.disableVertexAttribArray(index);
      switch (b.value.length) {
        case 4:
          gl.vertexAttrib4fv(index, b.value);
          break;
        case 3:
          gl.vertexAttrib3fv(index, b.value);
          break;
        case 2:
          gl.vertexAttrib2fv(index, b.value);
          break;
        case 1:
          gl.vertexAttrib1fv(index, b.value);
          break;
        default:
          throw new Error("the length of a float constant value must be between 1 and 4!");
      }
    } else {
      gl.bindBuffer(ARRAY_BUFFER, b.buffer);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribPointer(
        index,
        b.numComponents || b.size,
        b.type || FLOAT,
        b.normalize || false,
        b.stride || 0,
        b.offset || 0
      );
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index, b.divisor || 0);
      }
    }
  };
}
function intAttribSetter(gl, index) {
  return function(b) {
    if (b.value) {
      gl.disableVertexAttribArray(index);
      if (b.value.length === 4) {
        gl.vertexAttrib4iv(index, b.value);
      } else {
        throw new Error("The length of an integer constant value must be 4!");
      }
    } else {
      gl.bindBuffer(ARRAY_BUFFER, b.buffer);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribIPointer(
        index,
        b.numComponents || b.size,
        b.type || INT,
        b.stride || 0,
        b.offset || 0
      );
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index, b.divisor || 0);
      }
    }
  };
}
function uintAttribSetter(gl, index) {
  return function(b) {
    if (b.value) {
      gl.disableVertexAttribArray(index);
      if (b.value.length === 4) {
        gl.vertexAttrib4uiv(index, b.value);
      } else {
        throw new Error("The length of an unsigned integer constant value must be 4!");
      }
    } else {
      gl.bindBuffer(ARRAY_BUFFER, b.buffer);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribIPointer(
        index,
        b.numComponents || b.size,
        b.type || UNSIGNED_INT,
        b.stride || 0,
        b.offset || 0
      );
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index, b.divisor || 0);
      }
    }
  };
}
function matAttribSetter(gl, index, typeInfo) {
  const defaultSize = typeInfo.size;
  const count = typeInfo.count;
  return function(b) {
    gl.bindBuffer(ARRAY_BUFFER, b.buffer);
    const numComponents = b.size || b.numComponents || defaultSize;
    const size = numComponents / count;
    const type = b.type || FLOAT;
    const typeInfo2 = typeMap[type];
    const stride = typeInfo2.size * numComponents;
    const normalize3 = b.normalize || false;
    const offset = b.offset || 0;
    const rowOffset = stride / count;
    for (let i = 0; i < count; ++i) {
      gl.enableVertexAttribArray(index + i);
      gl.vertexAttribPointer(
        index + i,
        size,
        type,
        normalize3,
        stride,
        offset + rowOffset * i
      );
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index + i, b.divisor || 0);
      }
    }
  };
}
var attrTypeMap = {};
attrTypeMap[FLOAT] = { size: 4, setter: floatAttribSetter };
attrTypeMap[FLOAT_VEC2] = { size: 8, setter: floatAttribSetter };
attrTypeMap[FLOAT_VEC3] = { size: 12, setter: floatAttribSetter };
attrTypeMap[FLOAT_VEC4] = { size: 16, setter: floatAttribSetter };
attrTypeMap[INT] = { size: 4, setter: intAttribSetter };
attrTypeMap[INT_VEC2] = { size: 8, setter: intAttribSetter };
attrTypeMap[INT_VEC3] = { size: 12, setter: intAttribSetter };
attrTypeMap[INT_VEC4] = { size: 16, setter: intAttribSetter };
attrTypeMap[UNSIGNED_INT] = { size: 4, setter: uintAttribSetter };
attrTypeMap[UNSIGNED_INT_VEC2] = { size: 8, setter: uintAttribSetter };
attrTypeMap[UNSIGNED_INT_VEC3] = { size: 12, setter: uintAttribSetter };
attrTypeMap[UNSIGNED_INT_VEC4] = { size: 16, setter: uintAttribSetter };
attrTypeMap[BOOL] = { size: 4, setter: intAttribSetter };
attrTypeMap[BOOL_VEC2] = { size: 8, setter: intAttribSetter };
attrTypeMap[BOOL_VEC3] = { size: 12, setter: intAttribSetter };
attrTypeMap[BOOL_VEC4] = { size: 16, setter: intAttribSetter };
attrTypeMap[FLOAT_MAT2] = { size: 4, setter: matAttribSetter, count: 2 };
attrTypeMap[FLOAT_MAT3] = { size: 9, setter: matAttribSetter, count: 3 };
attrTypeMap[FLOAT_MAT4] = { size: 16, setter: matAttribSetter, count: 4 };
var errorRE = /ERROR:\s*\d+:(\d+)/gi;
function addLineNumbersWithError(src, log8 = "", lineOffset = 0) {
  const matches = [...log8.matchAll(errorRE)];
  const lineNoToErrorMap = new Map(matches.map((m, ndx) => {
    const lineNo = parseInt(m[1]);
    const next = matches[ndx + 1];
    const end = next ? next.index : log8.length;
    const msg = log8.substring(m.index, end);
    return [lineNo - 1, msg];
  }));
  return src.split("\n").map((line, lineNo) => {
    const err = lineNoToErrorMap.get(lineNo);
    return `${lineNo + 1 + lineOffset}: ${line}${err ? `

^^^ ${err}` : ""}`;
  }).join("\n");
}
var spaceRE = /^[ \t]*\n/;
function prepShaderSource(shaderSource) {
  let lineOffset = 0;
  if (spaceRE.test(shaderSource)) {
    lineOffset = 1;
    shaderSource = shaderSource.replace(spaceRE, "");
  }
  return { lineOffset, shaderSource };
}
function reportError(progOptions, msg) {
  progOptions.errorCallback(msg);
  if (progOptions.callback) {
    setTimeout(() => {
      progOptions.callback(`${msg}
${progOptions.errors.join("\n")}`);
    });
  }
  return null;
}
function checkShaderStatus(gl, shaderType, shader, errFn) {
  errFn = errFn || error;
  const compiled = gl.getShaderParameter(shader, COMPILE_STATUS);
  if (!compiled) {
    const lastError = gl.getShaderInfoLog(shader);
    const { lineOffset, shaderSource } = prepShaderSource(gl.getShaderSource(shader));
    const error2 = `${addLineNumbersWithError(shaderSource, lastError, lineOffset)}
Error compiling ${glEnumToString(gl, shaderType)}: ${lastError}`;
    errFn(error2);
    return error2;
  }
  return "";
}
function getProgramOptions(opt_attribs, opt_locations, opt_errorCallback) {
  let transformFeedbackVaryings;
  let transformFeedbackMode;
  let callback;
  if (typeof opt_locations === "function") {
    opt_errorCallback = opt_locations;
    opt_locations = void 0;
  }
  if (typeof opt_attribs === "function") {
    opt_errorCallback = opt_attribs;
    opt_attribs = void 0;
  } else if (opt_attribs && !Array.isArray(opt_attribs)) {
    const opt = opt_attribs;
    opt_errorCallback = opt.errorCallback;
    opt_attribs = opt.attribLocations;
    transformFeedbackVaryings = opt.transformFeedbackVaryings;
    transformFeedbackMode = opt.transformFeedbackMode;
    callback = opt.callback;
  }
  const errorCallback = opt_errorCallback || error;
  const errors = [];
  const options = {
    errorCallback(msg, ...args) {
      errors.push(msg);
      errorCallback(msg, ...args);
    },
    transformFeedbackVaryings,
    transformFeedbackMode,
    callback,
    errors
  };
  {
    let attribLocations = {};
    if (Array.isArray(opt_attribs)) {
      opt_attribs.forEach(function(attrib, ndx) {
        attribLocations[attrib] = opt_locations ? opt_locations[ndx] : ndx;
      });
    } else {
      attribLocations = opt_attribs || {};
    }
    options.attribLocations = attribLocations;
  }
  return options;
}
var defaultShaderType = [
  "VERTEX_SHADER",
  "FRAGMENT_SHADER"
];
function getShaderTypeFromScriptType(gl, scriptType) {
  if (scriptType.indexOf("frag") >= 0) {
    return FRAGMENT_SHADER;
  } else if (scriptType.indexOf("vert") >= 0) {
    return VERTEX_SHADER;
  }
  return void 0;
}
function deleteProgramAndShaders(gl, program, notThese) {
  const shaders = gl.getAttachedShaders(program);
  for (const shader of shaders) {
    if (notThese.has(shader)) {
      gl.deleteShader(shader);
    }
  }
  gl.deleteProgram(program);
}
var wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
function createProgramNoCheck(gl, shaders, programOptions) {
  const program = gl.createProgram();
  const {
    attribLocations,
    transformFeedbackVaryings,
    transformFeedbackMode
  } = getProgramOptions(programOptions);
  for (let ndx = 0; ndx < shaders.length; ++ndx) {
    let shader = shaders[ndx];
    if (typeof shader === "string") {
      const elem = getElementById(shader);
      const src = elem ? elem.text : shader;
      let type = gl[defaultShaderType[ndx]];
      if (elem && elem.type) {
        type = getShaderTypeFromScriptType(gl, elem.type) || type;
      }
      shader = gl.createShader(type);
      gl.shaderSource(shader, prepShaderSource(src).shaderSource);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
    }
  }
  Object.entries(attribLocations).forEach(([attrib, loc]) => gl.bindAttribLocation(program, loc, attrib));
  {
    let varyings = transformFeedbackVaryings;
    if (varyings) {
      if (varyings.attribs) {
        varyings = varyings.attribs;
      }
      if (!Array.isArray(varyings)) {
        varyings = Object.keys(varyings);
      }
      gl.transformFeedbackVaryings(program, varyings, transformFeedbackMode || SEPARATE_ATTRIBS);
    }
  }
  gl.linkProgram(program);
  return program;
}
function createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
  const progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
  const shaderSet = new Set(shaders);
  const program = createProgramNoCheck(gl, shaders, progOptions);
  function hasErrors(gl2, program2) {
    const errors = getProgramErrors(gl2, program2, progOptions.errorCallback);
    if (errors) {
      deleteProgramAndShaders(gl2, program2, shaderSet);
    }
    return errors;
  }
  if (progOptions.callback) {
    waitForProgramLinkCompletionAsync(gl, program).then(() => {
      const errors = hasErrors(gl, program);
      progOptions.callback(errors, errors ? void 0 : program);
    });
    return void 0;
  }
  return hasErrors(gl, program) ? void 0 : program;
}
function wrapCallbackFnToAsyncFn(fn) {
  return function(gl, arg1, ...args) {
    return new Promise((resolve, reject) => {
      const programOptions = getProgramOptions(...args);
      programOptions.callback = (err, program) => {
        if (err) {
          reject(err);
        } else {
          resolve(program);
        }
      };
      fn(gl, arg1, programOptions);
    });
  };
}
var createProgramAsync = wrapCallbackFnToAsyncFn(createProgram);
var createProgramInfoAsync = wrapCallbackFnToAsyncFn(createProgramInfo);
async function waitForProgramLinkCompletionAsync(gl, program) {
  const ext = gl.getExtension("KHR_parallel_shader_compile");
  const checkFn = ext ? (gl2, program2) => gl2.getProgramParameter(program2, ext.COMPLETION_STATUS_KHR) : () => true;
  let waitTime = 0;
  do {
    await wait(waitTime);
    waitTime = 1e3 / 60;
  } while (!checkFn(gl, program));
}
async function waitForAllProgramsLinkCompletionAsync(gl, programs) {
  for (const program of Object.values(programs)) {
    await waitForProgramLinkCompletionAsync(gl, program);
  }
}
function getProgramErrors(gl, program, errFn) {
  errFn = errFn || error;
  const linked = gl.getProgramParameter(program, LINK_STATUS);
  if (!linked) {
    const lastError = gl.getProgramInfoLog(program);
    errFn(`Error in program linking: ${lastError}`);
    const shaders = gl.getAttachedShaders(program);
    const errors = shaders.map((shader) => checkShaderStatus(gl, gl.getShaderParameter(shader, gl.SHADER_TYPE), shader, errFn));
    return `${lastError}
${errors.filter((_) => _).join("\n")}`;
  }
  return void 0;
}
function createProgramFromSources(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
  return createProgram(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback);
}
function isBuiltIn(info) {
  const name = info.name;
  return name.startsWith("gl_") || name.startsWith("webgl_");
}
var tokenRE = /(\.|\[|]|\w+)/g;
var isDigit = (s) => s >= "0" && s <= "9";
function addSetterToUniformTree(fullPath, setter, node, uniformSetters) {
  const tokens = fullPath.split(tokenRE).filter((s) => s !== "");
  let tokenNdx = 0;
  let path = "";
  for (; ; ) {
    const token = tokens[tokenNdx++];
    path += token;
    const isArrayIndex = isDigit(token[0]);
    const accessor = isArrayIndex ? parseInt(token) : token;
    if (isArrayIndex) {
      path += tokens[tokenNdx++];
    }
    const isLastToken = tokenNdx === tokens.length;
    if (isLastToken) {
      node[accessor] = setter;
      break;
    } else {
      const token2 = tokens[tokenNdx++];
      const isArray = token2 === "[";
      const child = node[accessor] || (isArray ? [] : {});
      node[accessor] = child;
      node = child;
      uniformSetters[path] = uniformSetters[path] || function(node2) {
        return function(value) {
          setUniformTree(node2, value);
        };
      }(child);
      path += token2;
    }
  }
}
function createUniformSetters(gl, program) {
  let textureUnit = 0;
  function createUniformSetter(program2, uniformInfo, location2) {
    const isArray = uniformInfo.name.endsWith("[0]");
    const type = uniformInfo.type;
    const typeInfo = typeMap[type];
    if (!typeInfo) {
      throw new Error(`unknown type: 0x${type.toString(16)}`);
    }
    let setter;
    if (typeInfo.bindPoint) {
      const unit = textureUnit;
      textureUnit += uniformInfo.size;
      if (isArray) {
        setter = typeInfo.arraySetter(gl, type, unit, location2, uniformInfo.size);
      } else {
        setter = typeInfo.setter(gl, type, unit, location2, uniformInfo.size);
      }
    } else {
      if (typeInfo.arraySetter && isArray) {
        setter = typeInfo.arraySetter(gl, location2);
      } else {
        setter = typeInfo.setter(gl, location2);
      }
    }
    setter.location = location2;
    return setter;
  }
  const uniformSetters = {};
  const uniformTree = {};
  const numUniforms = gl.getProgramParameter(program, ACTIVE_UNIFORMS);
  for (let ii = 0; ii < numUniforms; ++ii) {
    const uniformInfo = gl.getActiveUniform(program, ii);
    if (isBuiltIn(uniformInfo)) {
      continue;
    }
    let name = uniformInfo.name;
    if (name.endsWith("[0]")) {
      name = name.substr(0, name.length - 3);
    }
    const location2 = gl.getUniformLocation(program, uniformInfo.name);
    if (location2) {
      const setter = createUniformSetter(program, uniformInfo, location2);
      uniformSetters[name] = setter;
      addSetterToUniformTree(name, setter, uniformTree, uniformSetters);
    }
  }
  return uniformSetters;
}
function createTransformFeedbackInfo(gl, program) {
  const info = {};
  const numVaryings = gl.getProgramParameter(program, TRANSFORM_FEEDBACK_VARYINGS);
  for (let ii = 0; ii < numVaryings; ++ii) {
    const varying = gl.getTransformFeedbackVarying(program, ii);
    info[varying.name] = {
      index: ii,
      type: varying.type,
      size: varying.size
    };
  }
  return info;
}
function createUniformBlockSpecFromProgram(gl, program) {
  const numUniforms = gl.getProgramParameter(program, ACTIVE_UNIFORMS);
  const uniformData = [];
  const uniformIndices = [];
  for (let ii = 0; ii < numUniforms; ++ii) {
    uniformIndices.push(ii);
    uniformData.push({});
    const uniformInfo = gl.getActiveUniform(program, ii);
    uniformData[ii].name = uniformInfo.name;
  }
  [
    ["UNIFORM_TYPE", "type"],
    ["UNIFORM_SIZE", "size"],
    // num elements
    ["UNIFORM_BLOCK_INDEX", "blockNdx"],
    ["UNIFORM_OFFSET", "offset"]
  ].forEach(function(pair) {
    const pname = pair[0];
    const key = pair[1];
    gl.getActiveUniforms(program, uniformIndices, gl[pname]).forEach(function(value, ndx) {
      uniformData[ndx][key] = value;
    });
  });
  const blockSpecs = {};
  const numUniformBlocks = gl.getProgramParameter(program, ACTIVE_UNIFORM_BLOCKS);
  for (let ii = 0; ii < numUniformBlocks; ++ii) {
    const name = gl.getActiveUniformBlockName(program, ii);
    const blockSpec = {
      index: gl.getUniformBlockIndex(program, name),
      usedByVertexShader: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER),
      usedByFragmentShader: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER),
      size: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_DATA_SIZE),
      uniformIndices: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES)
    };
    blockSpec.used = blockSpec.usedByVertexShader || blockSpec.usedByFragmentShader;
    blockSpecs[name] = blockSpec;
  }
  return {
    blockSpecs,
    uniformData
  };
}
function setUniformTree(tree, values) {
  for (const name in values) {
    const prop = tree[name];
    if (typeof prop === "function") {
      prop(values[name]);
    } else {
      setUniformTree(tree[name], values[name]);
    }
  }
}
function setUniforms(setters, ...args) {
  const actualSetters = setters.uniformSetters || setters;
  const numArgs = args.length;
  for (let aNdx = 0; aNdx < numArgs; ++aNdx) {
    const values = args[aNdx];
    if (Array.isArray(values)) {
      const numValues = values.length;
      for (let ii = 0; ii < numValues; ++ii) {
        setUniforms(actualSetters, values[ii]);
      }
    } else {
      for (const name in values) {
        const setter = actualSetters[name];
        if (setter) {
          setter(values[name]);
        }
      }
    }
  }
}
function createAttributeSetters(gl, program) {
  const attribSetters = {};
  const numAttribs = gl.getProgramParameter(program, ACTIVE_ATTRIBUTES);
  for (let ii = 0; ii < numAttribs; ++ii) {
    const attribInfo = gl.getActiveAttrib(program, ii);
    if (isBuiltIn(attribInfo)) {
      continue;
    }
    const index = gl.getAttribLocation(program, attribInfo.name);
    const typeInfo = attrTypeMap[attribInfo.type];
    const setter = typeInfo.setter(gl, index, typeInfo);
    setter.location = index;
    attribSetters[attribInfo.name] = setter;
  }
  return attribSetters;
}
function setAttributes(setters, buffers) {
  for (const name in buffers) {
    const setter = setters[name];
    if (setter) {
      setter(buffers[name]);
    }
  }
}
function setBuffersAndAttributes(gl, programInfo, buffers) {
  if (buffers.vertexArrayObject) {
    gl.bindVertexArray(buffers.vertexArrayObject);
  } else {
    setAttributes(programInfo.attribSetters || programInfo, buffers.attribs);
    if (buffers.indices) {
      gl.bindBuffer(ELEMENT_ARRAY_BUFFER$1, buffers.indices);
    }
  }
}
function createProgramInfoFromProgram(gl, program) {
  const uniformSetters = createUniformSetters(gl, program);
  const attribSetters = createAttributeSetters(gl, program);
  const programInfo = {
    program,
    uniformSetters,
    attribSetters
  };
  if (isWebGL2(gl)) {
    programInfo.uniformBlockSpec = createUniformBlockSpecFromProgram(gl, program);
    programInfo.transformFeedbackInfo = createTransformFeedbackInfo(gl, program);
  }
  return programInfo;
}
var notIdRE = /\s|{|}|;/;
function createProgramInfo(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
  const progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
  const errors = [];
  shaderSources = shaderSources.map(function(source) {
    if (!notIdRE.test(source)) {
      const script = getElementById(source);
      if (!script) {
        const err = `no element with id: ${source}`;
        progOptions.errorCallback(err);
        errors.push(err);
      } else {
        source = script.text;
      }
    }
    return source;
  });
  if (errors.length) {
    return reportError(progOptions, "");
  }
  const origCallback = progOptions.callback;
  if (origCallback) {
    progOptions.callback = (err, program2) => {
      origCallback(err, err ? void 0 : createProgramInfoFromProgram(gl, program2));
    };
  }
  const program = createProgramFromSources(gl, shaderSources, progOptions);
  if (!program) {
    return null;
  }
  return createProgramInfoFromProgram(gl, program);
}
function checkAllPrograms(gl, programs, programSpecs, noDeleteShadersSet, programOptions) {
  for (const [name, program] of Object.entries(programs)) {
    const options = { ...programOptions };
    const spec = programSpecs[name];
    if (!Array.isArray(spec)) {
      Object.assign(options, spec);
    }
    const errors = getProgramErrors(gl, program, options.errorCallback);
    if (errors) {
      for (const program2 of Object.values(programs)) {
        const shaders = gl.getAttachedShaders(program2);
        gl.deleteProgram(program2);
        for (const shader of shaders) {
          if (!noDeleteShadersSet.has(shader)) {
            gl.deleteShader(shader);
          }
        }
      }
      return errors;
    }
  }
  return void 0;
}
function createPrograms(gl, programSpecs, programOptions = {}) {
  const noDeleteShadersSet = /* @__PURE__ */ new Set();
  const programs = Object.fromEntries(Object.entries(programSpecs).map(([name, spec]) => {
    const options = { ...programOptions };
    const shaders = Array.isArray(spec) ? spec : spec.shaders;
    if (!Array.isArray(spec)) {
      Object.assign(options, spec);
    }
    shaders.forEach(noDeleteShadersSet.add, noDeleteShadersSet);
    return [name, createProgramNoCheck(gl, shaders, options)];
  }));
  if (programOptions.callback) {
    waitForAllProgramsLinkCompletionAsync(gl, programs).then(() => {
      const errors2 = checkAllPrograms(gl, programs, programSpecs, noDeleteShadersSet, programOptions);
      programOptions.callback(errors2, errors2 ? void 0 : programs);
    });
    return void 0;
  }
  const errors = checkAllPrograms(gl, programs, programSpecs, noDeleteShadersSet, programOptions);
  return errors ? void 0 : programs;
}
function createProgramInfos(gl, programSpecs, programOptions) {
  programOptions = getProgramOptions(programOptions);
  function createProgramInfosForPrograms(gl2, programs2) {
    return Object.fromEntries(Object.entries(programs2).map(
      ([name, program]) => [name, createProgramInfoFromProgram(gl2, program)]
    ));
  }
  const origCallback = programOptions.callback;
  if (origCallback) {
    programOptions.callback = (err, programs2) => {
      origCallback(err, err ? void 0 : createProgramInfosForPrograms(gl, programs2));
    };
  }
  const programs = createPrograms(gl, programSpecs, programOptions);
  if (origCallback || !programs) {
    return void 0;
  }
  return createProgramInfosForPrograms(gl, programs);
}
var createProgramsAsync = wrapCallbackFnToAsyncFn(createPrograms);
var createProgramInfosAsync = wrapCallbackFnToAsyncFn(createProgramInfos);
var TRIANGLES = 4;
var UNSIGNED_SHORT = 5123;
function drawBufferInfo(gl, bufferInfo, type, count, offset, instanceCount) {
  type = type === void 0 ? TRIANGLES : type;
  const indices = bufferInfo.indices;
  const elementType = bufferInfo.elementType;
  const numElements = count === void 0 ? bufferInfo.numElements : count;
  offset = offset === void 0 ? 0 : offset;
  if (elementType || indices) {
    if (instanceCount !== void 0) {
      gl.drawElementsInstanced(type, numElements, elementType === void 0 ? UNSIGNED_SHORT : bufferInfo.elementType, offset, instanceCount);
    } else {
      gl.drawElements(type, numElements, elementType === void 0 ? UNSIGNED_SHORT : bufferInfo.elementType, offset);
    }
  } else {
    if (instanceCount !== void 0) {
      gl.drawArraysInstanced(type, offset, numElements, instanceCount);
    } else {
      gl.drawArrays(type, offset, numElements);
    }
  }
}
var FRAMEBUFFER = 36160;
var RENDERBUFFER = 36161;
var TEXTURE_2D = 3553;
var UNSIGNED_BYTE = 5121;
var DEPTH_COMPONENT = 6402;
var RGBA = 6408;
var DEPTH_COMPONENT24 = 33190;
var DEPTH_COMPONENT32F = 36012;
var DEPTH24_STENCIL8 = 35056;
var DEPTH32F_STENCIL8 = 36013;
var RGBA4 = 32854;
var RGB5_A1 = 32855;
var RGB565 = 36194;
var DEPTH_COMPONENT16 = 33189;
var STENCIL_INDEX = 6401;
var STENCIL_INDEX8 = 36168;
var DEPTH_STENCIL = 34041;
var COLOR_ATTACHMENT0 = 36064;
var DEPTH_ATTACHMENT = 36096;
var STENCIL_ATTACHMENT = 36128;
var DEPTH_STENCIL_ATTACHMENT = 33306;
var CLAMP_TO_EDGE = 33071;
var LINEAR = 9729;
var defaultAttachments = [
  { format: RGBA, type: UNSIGNED_BYTE, min: LINEAR, wrap: CLAMP_TO_EDGE },
  { format: DEPTH_STENCIL }
];
var attachmentsByFormat = {};
attachmentsByFormat[DEPTH_STENCIL] = DEPTH_STENCIL_ATTACHMENT;
attachmentsByFormat[STENCIL_INDEX] = STENCIL_ATTACHMENT;
attachmentsByFormat[STENCIL_INDEX8] = STENCIL_ATTACHMENT;
attachmentsByFormat[DEPTH_COMPONENT] = DEPTH_ATTACHMENT;
attachmentsByFormat[DEPTH_COMPONENT16] = DEPTH_ATTACHMENT;
attachmentsByFormat[DEPTH_COMPONENT24] = DEPTH_ATTACHMENT;
attachmentsByFormat[DEPTH_COMPONENT32F] = DEPTH_ATTACHMENT;
attachmentsByFormat[DEPTH24_STENCIL8] = DEPTH_STENCIL_ATTACHMENT;
attachmentsByFormat[DEPTH32F_STENCIL8] = DEPTH_STENCIL_ATTACHMENT;
function getAttachmentPointForFormat(format, internalFormat) {
  return attachmentsByFormat[format] || attachmentsByFormat[internalFormat];
}
var renderbufferFormats = {};
renderbufferFormats[RGBA4] = true;
renderbufferFormats[RGB5_A1] = true;
renderbufferFormats[RGB565] = true;
renderbufferFormats[DEPTH_STENCIL] = true;
renderbufferFormats[DEPTH_COMPONENT16] = true;
renderbufferFormats[STENCIL_INDEX] = true;
renderbufferFormats[STENCIL_INDEX8] = true;
function isRenderbufferFormat(format) {
  return renderbufferFormats[format];
}
var MAX_COLOR_ATTACHMENT_POINTS = 32;
function isColorAttachmentPoint(attachmentPoint) {
  return attachmentPoint >= COLOR_ATTACHMENT0 && attachmentPoint < COLOR_ATTACHMENT0 + MAX_COLOR_ATTACHMENT_POINTS;
}
function createFramebufferInfo(gl, attachments, width, height) {
  const target = FRAMEBUFFER;
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(target, fb);
  width = width || gl.drawingBufferWidth;
  height = height || gl.drawingBufferHeight;
  attachments = attachments || defaultAttachments;
  const usedColorAttachmentsPoints = [];
  const framebufferInfo = {
    framebuffer: fb,
    attachments: [],
    width,
    height
  };
  attachments.forEach(function(attachmentOptions, i) {
    let attachment = attachmentOptions.attachment;
    const samples = attachmentOptions.samples;
    const format = attachmentOptions.format;
    let attachmentPoint = attachmentOptions.attachmentPoint || getAttachmentPointForFormat(format, attachmentOptions.internalFormat);
    if (!attachmentPoint) {
      attachmentPoint = COLOR_ATTACHMENT0 + i;
    }
    if (isColorAttachmentPoint(attachmentPoint)) {
      usedColorAttachmentsPoints.push(attachmentPoint);
    }
    if (!attachment) {
      if (samples !== void 0 || isRenderbufferFormat(format)) {
        attachment = gl.createRenderbuffer();
        gl.bindRenderbuffer(RENDERBUFFER, attachment);
        if (samples > 1) {
          gl.renderbufferStorageMultisample(RENDERBUFFER, samples, format, width, height);
        } else {
          gl.renderbufferStorage(RENDERBUFFER, format, width, height);
        }
      } else {
        const textureOptions = Object.assign({}, attachmentOptions);
        textureOptions.width = width;
        textureOptions.height = height;
        if (textureOptions.auto === void 0) {
          textureOptions.auto = false;
          textureOptions.min = textureOptions.min || textureOptions.minMag || LINEAR;
          textureOptions.mag = textureOptions.mag || textureOptions.minMag || LINEAR;
          textureOptions.wrapS = textureOptions.wrapS || textureOptions.wrap || CLAMP_TO_EDGE;
          textureOptions.wrapT = textureOptions.wrapT || textureOptions.wrap || CLAMP_TO_EDGE;
        }
        attachment = createTexture(gl, textureOptions);
      }
    }
    if (isRenderbuffer(gl, attachment)) {
      gl.framebufferRenderbuffer(target, attachmentPoint, RENDERBUFFER, attachment);
    } else if (isTexture(gl, attachment)) {
      if (attachmentOptions.layer !== void 0) {
        gl.framebufferTextureLayer(
          target,
          attachmentPoint,
          attachment,
          attachmentOptions.level || 0,
          attachmentOptions.layer
        );
      } else {
        gl.framebufferTexture2D(
          target,
          attachmentPoint,
          attachmentOptions.target || TEXTURE_2D,
          attachment,
          attachmentOptions.level || 0
        );
      }
    } else {
      throw new Error("unknown attachment type");
    }
    framebufferInfo.attachments.push(attachment);
  });
  if (gl.drawBuffers) {
    gl.drawBuffers(usedColorAttachmentsPoints);
  }
  return framebufferInfo;
}
function bindFramebufferInfo(gl, framebufferInfo, target) {
  target = target || FRAMEBUFFER;
  if (framebufferInfo) {
    gl.bindFramebuffer(target, framebufferInfo.framebuffer);
    gl.viewport(0, 0, framebufferInfo.width, framebufferInfo.height);
  } else {
    gl.bindFramebuffer(target, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }
}
function resizeCanvasToDisplaySize(canvas, multiplier) {
  multiplier = multiplier || 1;
  multiplier = Math.max(0, multiplier);
  const width = canvas.clientWidth * multiplier | 0;
  const height = canvas.clientHeight * multiplier | 0;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}

// node_modules/gl-matrix/esm/common.js
var EPSILON = 1e-6;
var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
var RANDOM = Math.random;
var degree = Math.PI / 180;
if (!Math.hypot)
  Math.hypot = function() {
    var y = 0, i = arguments.length;
    while (i--) {
      y += arguments[i] * arguments[i];
    }
    return Math.sqrt(y);
  };

// node_modules/gl-matrix/esm/mat4.js
var mat4_exports = {};
__export(mat4_exports, {
  add: () => add2,
  adjoint: () => adjoint,
  clone: () => clone,
  copy: () => copy,
  create: () => create,
  determinant: () => determinant,
  equals: () => equals,
  exactEquals: () => exactEquals,
  frob: () => frob,
  fromQuat: () => fromQuat,
  fromQuat2: () => fromQuat2,
  fromRotation: () => fromRotation,
  fromRotationTranslation: () => fromRotationTranslation,
  fromRotationTranslationScale: () => fromRotationTranslationScale,
  fromRotationTranslationScaleOrigin: () => fromRotationTranslationScaleOrigin,
  fromScaling: () => fromScaling,
  fromTranslation: () => fromTranslation,
  fromValues: () => fromValues,
  fromXRotation: () => fromXRotation,
  fromYRotation: () => fromYRotation,
  fromZRotation: () => fromZRotation,
  frustum: () => frustum,
  getRotation: () => getRotation,
  getScaling: () => getScaling,
  getTranslation: () => getTranslation,
  identity: () => identity2,
  invert: () => invert,
  lookAt: () => lookAt,
  mul: () => mul,
  multiply: () => multiply,
  multiplyScalar: () => multiplyScalar,
  multiplyScalarAndAdd: () => multiplyScalarAndAdd,
  ortho: () => ortho,
  orthoNO: () => orthoNO,
  orthoZO: () => orthoZO,
  perspective: () => perspective,
  perspectiveFromFieldOfView: () => perspectiveFromFieldOfView,
  perspectiveNO: () => perspectiveNO,
  perspectiveZO: () => perspectiveZO,
  rotate: () => rotate,
  rotateX: () => rotateX,
  rotateY: () => rotateY,
  rotateZ: () => rotateZ,
  scale: () => scale,
  set: () => set,
  str: () => str,
  sub: () => sub,
  subtract: () => subtract,
  targetTo: () => targetTo,
  translate: () => translate,
  transpose: () => transpose
});
function create() {
  var out = new ARRAY_TYPE(16);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}
function clone(a) {
  var out = new ARRAY_TYPE(16);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function fromValues(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  var out = new ARRAY_TYPE(16);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
function set(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
function identity2(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function transpose(out, a) {
  if (out === a) {
    var a01 = a[1], a02 = a[2], a03 = a[3];
    var a12 = a[6], a13 = a[7];
    var a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }
  return out;
}
function invert(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
function adjoint(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  out[0] = a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22);
  out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
  out[2] = a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12);
  out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
  out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
  out[5] = a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22);
  out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
  out[7] = a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12);
  out[8] = a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21);
  out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
  out[10] = a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11);
  out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
  out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
  out[13] = a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21);
  out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
  out[15] = a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11);
  return out;
}
function determinant(a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
function multiply(out, a, b) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
function translate(out, a, v) {
  var x = v[0], y = v[1], z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }
  return out;
}
function scale(out, a, v) {
  var x = v[0], y = v[1], z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function rotate(out, a, rad, axis) {
  var x = axis[0], y = axis[1], z = axis[2];
  var len2 = Math.hypot(x, y, z);
  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;
  if (len2 < EPSILON) {
    return null;
  }
  len2 = 1 / len2;
  x *= len2;
  y *= len2;
  z *= len2;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11];
  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c;
  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;
  if (a !== out) {
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  return out;
}
function rotateX(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}
function rotateY(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}
function rotateZ(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  if (a !== out) {
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}
function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromRotation(out, rad, axis) {
  var x = axis[0], y = axis[1], z = axis[2];
  var len2 = Math.hypot(x, y, z);
  var s, c, t;
  if (len2 < EPSILON) {
    return null;
  }
  len2 = 1 / len2;
  x *= len2;
  y *= len2;
  z *= len2;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromRotationTranslation(out, q, v) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromQuat2(out, a) {
  var translation = new ARRAY_TYPE(3);
  var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7];
  var magnitude = bx * bx + by * by + bz * bz + bw * bw;
  if (magnitude > 0) {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
  } else {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  }
  fromRotationTranslation(out, a, translation);
  return out;
}
function getTranslation(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}
function getScaling(out, mat) {
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out[0] = Math.hypot(m11, m12, m13);
  out[1] = Math.hypot(m21, m22, m23);
  out[2] = Math.hypot(m31, m32, m33);
  return out;
}
function getRotation(out, mat) {
  var scaling = new ARRAY_TYPE(3);
  getScaling(scaling, mat);
  var is1 = 1 / scaling[0];
  var is2 = 1 / scaling[1];
  var is3 = 1 / scaling[2];
  var sm11 = mat[0] * is1;
  var sm12 = mat[1] * is2;
  var sm13 = mat[2] * is3;
  var sm21 = mat[4] * is1;
  var sm22 = mat[5] * is2;
  var sm23 = mat[6] * is3;
  var sm31 = mat[8] * is1;
  var sm32 = mat[9] * is2;
  var sm33 = mat[10] * is3;
  var trace = sm11 + sm22 + sm33;
  var S = 0;
  if (trace > 0) {
    S = Math.sqrt(trace + 1) * 2;
    out[3] = 0.25 * S;
    out[0] = (sm23 - sm32) / S;
    out[1] = (sm31 - sm13) / S;
    out[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
    out[3] = (sm23 - sm32) / S;
    out[0] = 0.25 * S;
    out[1] = (sm12 + sm21) / S;
    out[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
    out[3] = (sm31 - sm13) / S;
    out[0] = (sm12 + sm21) / S;
    out[1] = 0.25 * S;
    out[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
    out[3] = (sm12 - sm21) / S;
    out[0] = (sm31 + sm13) / S;
    out[1] = (sm23 + sm32) / S;
    out[2] = 0.25 * S;
  }
  return out;
}
function fromRotationTranslationScale(out, q, v, s) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  var ox = o[0];
  var oy = o[1];
  var oz = o[2];
  var out0 = (1 - (yy + zz)) * sx;
  var out1 = (xy + wz) * sx;
  var out2 = (xz - wy) * sx;
  var out4 = (xy - wz) * sy;
  var out5 = (1 - (xx + zz)) * sy;
  var out6 = (yz + wx) * sy;
  var out8 = (xz + wy) * sz;
  var out9 = (yz - wx) * sz;
  var out10 = (1 - (xx + yy)) * sz;
  out[0] = out0;
  out[1] = out1;
  out[2] = out2;
  out[3] = 0;
  out[4] = out4;
  out[5] = out5;
  out[6] = out6;
  out[7] = 0;
  out[8] = out8;
  out[9] = out9;
  out[10] = out10;
  out[11] = 0;
  out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
  out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
  out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
  out[15] = 1;
  return out;
}
function fromQuat(out, q) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function frustum(out, left, right, bottom, top, near, far) {
  var rl = 1 / (right - left);
  var tb = 1 / (top - bottom);
  var nf = 1 / (near - far);
  out[0] = near * 2 * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = near * 2 * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near * 2 * nf;
  out[15] = 0;
  return out;
}
function perspectiveNO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2), nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }
  return out;
}
var perspective = perspectiveNO;
function perspectiveZO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2), nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = far * nf;
    out[14] = far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -near;
  }
  return out;
}
function perspectiveFromFieldOfView(out, fov, near, far) {
  var upTan = Math.tan(fov.upDegrees * Math.PI / 180);
  var downTan = Math.tan(fov.downDegrees * Math.PI / 180);
  var leftTan = Math.tan(fov.leftDegrees * Math.PI / 180);
  var rightTan = Math.tan(fov.rightDegrees * Math.PI / 180);
  var xScale = 2 / (leftTan + rightTan);
  var yScale = 2 / (upTan + downTan);
  out[0] = xScale;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = yScale;
  out[6] = 0;
  out[7] = 0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = (upTan - downTan) * yScale * 0.5;
  out[10] = far / (near - far);
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near / (near - far);
  out[15] = 0;
  return out;
}
function orthoNO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
var ortho = orthoNO;
function orthoZO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = near * nf;
  out[15] = 1;
  return out;
}
function lookAt(out, eye, center, up) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len2;
  var eyex = eye[0];
  var eyey = eye[1];
  var eyez = eye[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var centerx = center[0];
  var centery = center[1];
  var centerz = center[2];
  if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
    return identity2(out);
  }
  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len2 = 1 / Math.hypot(z0, z1, z2);
  z0 *= len2;
  z1 *= len2;
  z2 *= len2;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len2 = Math.hypot(x0, x1, x2);
  if (!len2) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len2 = 1 / len2;
    x0 *= len2;
    x1 *= len2;
    x2 *= len2;
  }
  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len2 = Math.hypot(y0, y1, y2);
  if (!len2) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len2 = 1 / len2;
    y0 *= len2;
    y1 *= len2;
    y2 *= len2;
  }
  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}
function targetTo(out, eye, target, up) {
  var eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
  var z0 = eyex - target[0], z1 = eyey - target[1], z2 = eyez - target[2];
  var len2 = z0 * z0 + z1 * z1 + z2 * z2;
  if (len2 > 0) {
    len2 = 1 / Math.sqrt(len2);
    z0 *= len2;
    z1 *= len2;
    z2 *= len2;
  }
  var x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
  len2 = x0 * x0 + x1 * x1 + x2 * x2;
  if (len2 > 0) {
    len2 = 1 / Math.sqrt(len2);
    x0 *= len2;
    x1 *= len2;
    x2 *= len2;
  }
  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}
function str(a) {
  return "mat4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + ")";
}
function frob(a) {
  return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
}
function add2(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}
function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}
function multiplyScalarAndAdd(out, a, b, scale4) {
  out[0] = a[0] + b[0] * scale4;
  out[1] = a[1] + b[1] * scale4;
  out[2] = a[2] + b[2] * scale4;
  out[3] = a[3] + b[3] * scale4;
  out[4] = a[4] + b[4] * scale4;
  out[5] = a[5] + b[5] * scale4;
  out[6] = a[6] + b[6] * scale4;
  out[7] = a[7] + b[7] * scale4;
  out[8] = a[8] + b[8] * scale4;
  out[9] = a[9] + b[9] * scale4;
  out[10] = a[10] + b[10] * scale4;
  out[11] = a[11] + b[11] * scale4;
  out[12] = a[12] + b[12] * scale4;
  out[13] = a[13] + b[13] * scale4;
  out[14] = a[14] + b[14] * scale4;
  out[15] = a[15] + b[15] * scale4;
  return out;
}
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}
function equals(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  var a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7];
  var a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11];
  var a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  var b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
  var b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11];
  var b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= EPSILON * Math.max(1, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= EPSILON * Math.max(1, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= EPSILON * Math.max(1, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= EPSILON * Math.max(1, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= EPSILON * Math.max(1, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= EPSILON * Math.max(1, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= EPSILON * Math.max(1, Math.abs(a15), Math.abs(b15));
}
var mul = multiply;
var sub = subtract;

// node_modules/gl-matrix/esm/vec3.js
var vec3_exports = {};
__export(vec3_exports, {
  add: () => add3,
  angle: () => angle,
  bezier: () => bezier,
  ceil: () => ceil,
  clone: () => clone2,
  copy: () => copy2,
  create: () => create2,
  cross: () => cross,
  dist: () => dist,
  distance: () => distance,
  div: () => div,
  divide: () => divide,
  dot: () => dot,
  equals: () => equals2,
  exactEquals: () => exactEquals2,
  floor: () => floor,
  forEach: () => forEach,
  fromValues: () => fromValues2,
  hermite: () => hermite,
  inverse: () => inverse2,
  len: () => len,
  length: () => length2,
  lerp: () => lerp,
  max: () => max,
  min: () => min,
  mul: () => mul2,
  multiply: () => multiply2,
  negate: () => negate,
  normalize: () => normalize,
  random: () => random,
  rotateX: () => rotateX2,
  rotateY: () => rotateY2,
  rotateZ: () => rotateZ2,
  round: () => round,
  scale: () => scale2,
  scaleAndAdd: () => scaleAndAdd,
  set: () => set2,
  sqrDist: () => sqrDist,
  sqrLen: () => sqrLen,
  squaredDistance: () => squaredDistance,
  squaredLength: () => squaredLength,
  str: () => str2,
  sub: () => sub2,
  subtract: () => subtract2,
  transformMat3: () => transformMat3,
  transformMat4: () => transformMat4,
  transformQuat: () => transformQuat,
  zero: () => zero
});
function create2() {
  var out = new ARRAY_TYPE(3);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  return out;
}
function clone2(a) {
  var out = new ARRAY_TYPE(3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
function length2(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.hypot(x, y, z);
}
function fromValues2(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function copy2(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
function set2(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function add3(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}
function subtract2(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}
function multiply2(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out;
}
function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out;
}
function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  return out;
}
function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  return out;
}
function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out;
}
function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out;
}
function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  return out;
}
function scale2(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}
function scaleAndAdd(out, a, b, scale4) {
  out[0] = a[0] + b[0] * scale4;
  out[1] = a[1] + b[1] * scale4;
  out[2] = a[2] + b[2] * scale4;
  return out;
}
function distance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return Math.hypot(x, y, z);
}
function squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return x * x + y * y + z * z;
}
function squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return x * x + y * y + z * z;
}
function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}
function inverse2(out, a) {
  out[0] = 1 / a[0];
  out[1] = 1 / a[1];
  out[2] = 1 / a[2];
  return out;
}
function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len2 = x * x + y * y + z * z;
  if (len2 > 0) {
    len2 = 1 / Math.sqrt(len2);
  }
  out[0] = a[0] * len2;
  out[1] = a[1] * len2;
  out[2] = a[2] * len2;
  return out;
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(out, a, b) {
  var ax = a[0], ay = a[1], az = a[2];
  var bx = b[0], by = b[1], bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
function lerp(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  return out;
}
function hermite(out, a, b, c, d, t) {
  var factorTimes2 = t * t;
  var factor1 = factorTimes2 * (2 * t - 3) + 1;
  var factor2 = factorTimes2 * (t - 2) + t;
  var factor3 = factorTimes2 * (t - 1);
  var factor4 = factorTimes2 * (3 - 2 * t);
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
function bezier(out, a, b, c, d, t) {
  var inverseFactor = 1 - t;
  var inverseFactorTimesTwo = inverseFactor * inverseFactor;
  var factorTimes2 = t * t;
  var factor1 = inverseFactorTimesTwo * inverseFactor;
  var factor2 = 3 * t * inverseFactorTimesTwo;
  var factor3 = 3 * factorTimes2 * inverseFactor;
  var factor4 = factorTimes2 * t;
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
function random(out, scale4) {
  scale4 = scale4 || 1;
  var r = RANDOM() * 2 * Math.PI;
  var z = RANDOM() * 2 - 1;
  var zScale = Math.sqrt(1 - z * z) * scale4;
  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z * scale4;
  return out;
}
function transformMat4(out, a, m) {
  var x = a[0], y = a[1], z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
function transformMat3(out, a, m) {
  var x = a[0], y = a[1], z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}
function transformQuat(out, a, q) {
  var qx = q[0], qy = q[1], qz = q[2], qw = q[3];
  var x = a[0], y = a[1], z = a[2];
  var uvx = qy * z - qz * y, uvy = qz * x - qx * z, uvz = qx * y - qy * x;
  var uuvx = qy * uvz - qz * uvy, uuvy = qz * uvx - qx * uvz, uuvz = qx * uvy - qy * uvx;
  var w2 = qw * 2;
  uvx *= w2;
  uvy *= w2;
  uvz *= w2;
  uuvx *= 2;
  uuvy *= 2;
  uuvz *= 2;
  out[0] = x + uvx + uuvx;
  out[1] = y + uvy + uuvy;
  out[2] = z + uvz + uuvz;
  return out;
}
function rotateX2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[0];
  r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
  r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad);
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
function rotateY2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad);
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
function rotateZ2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
  r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
  r[2] = p[2];
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
function angle(a, b) {
  var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2], mag1 = Math.sqrt(ax * ax + ay * ay + az * az), mag2 = Math.sqrt(bx * bx + by * by + bz * bz), mag = mag1 * mag2, cosine = mag && dot(a, b) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
function zero(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  return out;
}
function str2(a) {
  return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
}
function exactEquals2(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
function equals2(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2];
  var b0 = b[0], b1 = b[1], b2 = b[2];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2));
}
var sub2 = subtract2;
var mul2 = multiply2;
var div = divide;
var dist = distance;
var sqrDist = squaredDistance;
var len = length2;
var sqrLen = squaredLength;
var forEach = function() {
  var vec = create2();
  return function(a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 3;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }
    return a;
  };
}();

// src/core/context.ts
var import_loglevel7 = __toESM(require_loglevel(), 1);

// src/engine/tuples.ts
function normalize2(tuple) {
  const [x, y, z] = tuple;
  const len2 = Math.sqrt(x * x + y * y + z * z);
  return tuple.map((v) => v / len2);
}
function scale3(tuple, amount) {
  return tuple.map((v) => v * amount);
}
function scaleClamped(colour, amount) {
  scale3(colour, amount);
  return colour.map((v) => Math.min(Math.max(v, 0), 1));
}
function toVec3(tuple) {
  return vec3_exports.fromValues(tuple[0], tuple[1], tuple[2]);
}
function distance2(a, b) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}
function rgbColour255(r, g, b) {
  return [r / 255, g / 255, b / 255];
}
function rgbColourHex(hexString) {
  const hex = hexString.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return rgbColour255(r, g, b);
}
var Colours = class {
};
Colours.RED = [1, 0, 0];
Colours.GREEN = [0, 1, 0];
Colours.BLUE = [0, 0, 1];
Colours.YELLOW = [1, 1, 0];
Colours.CYAN = [0, 1, 1];
Colours.MAGENTA = [1, 0, 1];
Colours.BLACK = [0, 0, 0];
Colours.WHITE = [1, 1, 1];
var Tuples = {
  normalize: normalize2,
  scale: scale3,
  scaleClamped,
  rgbColour255,
  rgbColourHex,
  toVec3,
  distance: distance2
};

// src/core/cache.ts
var import_loglevel3 = __toESM(require_loglevel(), 1);
var PROG_DEFAULT = "phong";
var PROG_BILLBOARD = "billboard";
var ModelCache = class _ModelCache {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
  }
  /**
   * Return the singleton instance of the model cache
   */
  static get instance() {
    if (!_ModelCache._instance) {
      _ModelCache._instance = new _ModelCache();
    }
    return _ModelCache._instance;
  }
  /**
   * Return a model from the cache by name
   * @param name Name of model without extension
   * @param warn If true, log a warning if model not found
   */
  get(name, warn = true) {
    if (!this.cache.has(name) && warn) {
      import_loglevel3.default.warn(`\u26A0\uFE0F Model '${name}' not found, please load it first`);
      return void 0;
    }
    return this.cache.get(name);
  }
  /**
   * Add a model to the cache, using the model name as key
   */
  add(model) {
    import_loglevel3.default.debug(`\u{1F9F0} Adding model '${model.name}' to cache`);
    this.cache.set(model.name, model);
  }
};
var _TextureCache = class _TextureCache {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
    this.gl = {};
  }
  // Create a new texture cache
  static init(gl) {
    this._instance = new _TextureCache();
    this._instance.gl = gl;
    const white1pixel = createTexture(gl, {
      min: gl.NEAREST,
      mag: gl.NEAREST,
      src: [255, 255, 255, 255]
    });
    const normal1pixel = createTexture(gl, {
      min: gl.NEAREST,
      mag: gl.NEAREST,
      src: [128, 128, 255, 255]
    });
    this._instance.add("_defaults/white", white1pixel);
    this._instance.add("_defaults/normal", normal1pixel);
    _TextureCache.initialized = true;
  }
  static get instance() {
    if (!_TextureCache.initialized) {
      throw new Error("TextureCache not initialized, call TextureCache.init() first");
    }
    return this._instance;
  }
  /**
   * Return a texture from the cache by name
   * @param key Key of texture, this is usually the URL or filename path
   */
  get(key) {
    if (!this.cache.has(key)) {
      import_loglevel3.default.warn(`\u{1F4A5} Texture ${key} not found in cache`);
      return void 0;
    }
    import_loglevel3.default.trace(`\u{1F44D} Returning texture '${key}' from cache, nice!`);
    return this.cache.get(key);
  }
  /**
   * Add a texture to the cache
   * @param key Key of texture, this is usually the URL or filename path
   * @param texture WebGL texture
   */
  add(key, texture) {
    if (this.cache.has(key)) {
      import_loglevel3.default.warn(`\u{1F914} Texture '${key}' already in cache, not adding again`);
      return;
    }
    import_loglevel3.default.debug(`\u{1F9F0} Adding texture '${key}' to cache`);
    this.cache.set(key, texture);
  }
  /**
   * Create or return a texture from the cache by name
   * @param src URL or filename path of texture image
   * @param filter Enable texture filtering and mipmaps (default true)
   * @param flipY Flip the texture vertically (default true)
   */
  getCreate(src, filter = true, flipY = false) {
    if (this.cache.has(src)) {
      import_loglevel3.default.trace(`\u{1F44D} Returning texture '${src}' from cache, nice!`, flipY);
      return this.get(src);
    }
    const texture = createTexture(
      this.gl,
      {
        min: filter ? this.gl.LINEAR_MIPMAP_LINEAR : this.gl.NEAREST,
        mag: filter ? this.gl.LINEAR : this.gl.NEAREST,
        src,
        flipY: flipY ? 1 : 0
      },
      (err) => {
        if (err) {
          import_loglevel3.default.error("\u{1F4A5} Error loading texture", err);
        }
      }
    );
    this.add(src, texture);
    return texture;
  }
};
_TextureCache.initialized = false;
var TextureCache = _TextureCache;
var _ProgramCache = class _ProgramCache {
  /**
   * Create a new program cache, needs a default program to be set
   * @param defaultProg The default program that can be used by most things
   */
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
    this._default = {};
  }
  /**
   * Initialise the program cache with a default program.
   * This MUST be called before using the cache
   * @param defaultProg The default program that can be used by most things
   */
  static init(defaultProg) {
    if (_ProgramCache._instance) {
      import_loglevel3.default.warn("\u{1F914} Program cache already initialised, not doing it again");
      return;
    }
    _ProgramCache._instance = new _ProgramCache();
    _ProgramCache._instance._default = defaultProg;
    _ProgramCache.initialized = true;
  }
  /**
   * Return the singleton instance of the program cache
   */
  static get instance() {
    if (!_ProgramCache.initialized) {
      throw new Error("\u{1F4A5} Program cache not initialised, call init() first");
    }
    return _ProgramCache._instance;
  }
  /**
   * Return a program from the cache by name
   * @param name Name of program
   */
  get(name) {
    const prog = this.cache.get(name);
    if (!prog) {
      import_loglevel3.default.warn(`\u26A0\uFE0F Program '${name}' not found, returning default`);
      return this._default;
    }
    return prog;
  }
  add(name, program) {
    import_loglevel3.default.debug(`\u{1F9F0} Adding program '${name}' to cache`);
    this.cache.set(name, program);
  }
  get default() {
    return this._default;
  }
};
_ProgramCache.initialized = false;
_ProgramCache.PROG_PHONG = "phong";
_ProgramCache.PROG_BILLBOARD = "billboard";
_ProgramCache.PROG_SHADOWMAP = "shadowmap";
var ProgramCache = _ProgramCache;

// src/engine/camera.ts
var import_loglevel4 = __toESM(require_loglevel(), 1);
var CameraType = /* @__PURE__ */ ((CameraType2) => {
  CameraType2[CameraType2["PERSPECTIVE"] = 0] = "PERSPECTIVE";
  CameraType2[CameraType2["ORTHOGRAPHIC"] = 1] = "ORTHOGRAPHIC";
  return CameraType2;
})(CameraType || {});
var Camera = class {
  /**
   * Create a new default camera
   */
  constructor(type = 0 /* PERSPECTIVE */, aspectRatio = 1) {
    // Used to clamp first person up/down angle
    this.maxAngleUp = Math.PI / 2 - 0.01;
    this.maxAngleDown = -Math.PI / 2 + 0.01;
    this.touches = [];
    this.type = type;
    this.active = true;
    this.position = [0, 0, 30];
    this.lookAt = [0, 0, 0];
    this.up = [0, 1, 0];
    this.near = 0.1;
    this.far = 100;
    this.fov = 45;
    this.aspectRatio = aspectRatio;
    this.orthoZoom = 20;
    this.usedForEnvMap = false;
    this.usedForShadowMap = false;
    this.fpMode = false;
    this.fpAngleY = 0;
    this.fpAngleX = 0;
    this.fpTurnSpeed = 1e-3;
    this.fpMoveSpeed = 1;
    this.fpHandlersAdded = false;
    this.keysDown = /* @__PURE__ */ new Set();
  }
  /**
   * Get the current view matrix for the camera
   */
  get matrix() {
    if (!this.fpMode) {
      const camView2 = mat4_exports.targetTo(mat4_exports.create(), this.position, this.lookAt, this.up);
      return camView2;
    }
    const camView = mat4_exports.targetTo(mat4_exports.create(), [0, 0, 0], [0, 0, -1], this.up);
    mat4_exports.translate(camView, camView, this.position);
    mat4_exports.rotateY(camView, camView, this.fpAngleY);
    mat4_exports.rotateX(camView, camView, this.fpAngleX);
    return camView;
  }
  /**
   * Get the projection matrix for this camera
   * @param aspectRatio Aspect ratio of the canvas
   */
  get projectionMatrix() {
    if (this.type === 1 /* ORTHOGRAPHIC */) {
      const camProj = mat4_exports.ortho(
        mat4_exports.create(),
        -this.aspectRatio * this.orthoZoom,
        this.aspectRatio * this.orthoZoom,
        -this.orthoZoom,
        this.orthoZoom,
        this.near,
        this.far
      );
      return camProj;
    } else {
      const camProj = mat4_exports.perspective(mat4_exports.create(), this.fov * (Math.PI / 180), this.aspectRatio, this.near, this.far);
      return camProj;
    }
  }
  /**
   * Get the camera position as a string for debugging
   */
  toString() {
    const pos = this.position.map((p) => p.toFixed(2));
    return `position: [${pos}]`;
  }
  /**
   * Switches the camera to first person mode, where the camera is controlled by
   * the mouse and keyboard. The mouse controls look direction and the keyboard
   * controls movement.
   * @param angleY Starting look up/down angle in radians, default 0
   * @param angleX Starting look left/right angle in radians, default 0
   * @param turnSpeed Speed of looking in radians, default 0.001
   * @param moveSpeed Speed of moving in units, default 1.0
   */
  enableFPControls(angleY = 0, angleX = 0, turnSpeed = 1e-3, moveSpeed = 1) {
    this.fpMode = true;
    this.fpAngleY = angleY;
    this.fpAngleX = angleX;
    this.fpTurnSpeed = turnSpeed;
    this.fpMoveSpeed = moveSpeed;
    if (this.fpHandlersAdded)
      return;
    const gl = getGl();
    gl?.canvas.addEventListener("click", async () => {
      if (!this.fpMode || !this.active)
        return;
      if (document.pointerLockElement) {
        document.exitPointerLock();
      } else {
        await (gl?.canvas).requestPointerLock();
      }
    });
    window.addEventListener("mousemove", (e) => {
      if (!document.pointerLockElement) {
        return;
      }
      if (!this.fpMode || !this.active)
        return;
      this.fpAngleY += e.movementX * -this.fpTurnSpeed;
      this.fpAngleX += e.movementY * -this.fpTurnSpeed;
      if (this.fpAngleX > this.maxAngleUp)
        this.fpAngleX = this.maxAngleUp;
      if (this.fpAngleX < this.maxAngleDown)
        this.fpAngleX = this.maxAngleDown;
    });
    window.addEventListener("keydown", (e) => {
      if (!this.fpMode || !this.active)
        return;
      this.keysDown.add(e.key);
    });
    window.addEventListener("keyup", (e) => {
      if (!this.fpMode || !this.active)
        return;
      this.keysDown.delete(e.key);
    });
    window.addEventListener("touchstart", (e) => {
      if (!this.fpMode || !this.active)
        return;
      if (e.touches[0].clientX > window.innerWidth / 2) {
        this.touches[0] = e.touches[0];
      }
      if (e.touches[0].clientX < window.innerWidth / 2) {
        if (e.touches[0].clientY < window.innerHeight / 2) {
          this.keysDown.add("w");
        }
        if (e.touches[0].clientY > window.innerHeight / 2) {
          this.keysDown.add("s");
        }
      }
    });
    window.addEventListener("touchend", () => {
      if (!this.fpMode || !this.active)
        return;
      this.touches = [];
      this.keysDown.clear();
    });
    window.addEventListener("touchmove", (e) => {
      if (!this.fpMode || !this.active)
        return;
      if (this.touches.length === 0)
        return;
      const touch = e.touches[0];
      const dx = touch.clientX - this.touches[0].clientX;
      const dy = touch.clientY - this.touches[0].clientY;
      this.fpAngleY += dx * -this.fpTurnSpeed * touch.force * 4;
      this.fpAngleX += dy * -this.fpTurnSpeed * touch.force * 4;
      if (this.fpAngleX > this.maxAngleUp)
        this.fpAngleX = this.maxAngleUp;
      if (this.fpAngleX < this.maxAngleDown)
        this.fpAngleX = this.maxAngleDown;
      this.touches[0] = touch;
    });
    this.fpHandlersAdded = true;
    import_loglevel4.default.info("\u{1F3A5} Camera: first person mode & controls enabled");
  }
  /**
   * Disable FP mode
   */
  disableFPControls() {
    this.fpMode = false;
    document.exitPointerLock();
    import_loglevel4.default.debug("\u{1F3A5} Camera: FPS mode disabled");
  }
  /**
   * Get FP mode state
   */
  get fpModeEnabled() {
    return this.fpMode;
  }
  /**
   * Called every frame to update the camera, currently only used for movement in FP mode
   */
  update() {
    if (!this.fpMode || !this.active)
      return;
    if (this.keysDown.size === 0)
      return;
    const dZ = -Math.cos(this.fpAngleY) * this.fpMoveSpeed;
    const dX = -Math.sin(this.fpAngleY) * this.fpMoveSpeed;
    for (const key of this.keysDown.values()) {
      switch (key) {
        case "ArrowUp":
        case "w":
          this.position[0] += dX;
          this.position[2] += dZ;
          this.lookAt[0] += dX;
          this.lookAt[2] += dZ;
          break;
        case "ArrowDown":
        case "s":
          this.position[0] -= dX;
          this.position[2] -= dZ;
          this.lookAt[0] -= dX;
          this.lookAt[2] -= dZ;
          break;
        case "ArrowLeft":
        case "a":
          this.position[0] += dZ;
          this.position[2] -= dX;
          this.lookAt[0] += dZ;
          this.lookAt[2] -= dX;
          break;
        case "ArrowRight":
        case "d":
          this.position[0] -= dZ;
          this.position[2] += dX;
          this.lookAt[0] -= dZ;
          this.lookAt[2] += dX;
          break;
      }
    }
  }
};

// shaders/shadowmap/glsl.frag
var glsl_default = "#version 300 es\n\n// ============================================================================\n// Shadow map fragment shader\n// Ben Coleman, 2023\n// ============================================================================\n\nprecision highp float;\n\nvoid main() {\n  // Yeah I don't understand this either, but it works\n}\n";

// shaders/shadowmap/glsl.vert
var glsl_default2 = "#version 300 es\n\n// ============================================================================\n// Shadow map vertex shader\n// Ben Coleman, 2023\n// ============================================================================\n\nprecision highp float;\n\nin vec4 position;\n\nuniform mat4 u_worldViewProjection;\n\nvoid main() {\n  gl_Position = u_worldViewProjection * position;\n}\n";

// src/engine/lights.ts
var LightDirectional = class {
  /** Create a default directional light, pointing downward */
  constructor() {
    this._direction = [0, -1, 0];
    this.colour = Colours.WHITE;
    this.ambient = Colours.BLACK;
    this.enabled = true;
    const gl = getGl();
    if (!gl) {
      throw new Error("\u{1F4A5} LightDirectional: Cannot create shadow map shader, no GL context");
    }
    this._shadowMapProgram = createProgramInfo(gl, [glsl_default2, glsl_default], ["shadowProgram"]);
  }
  /**
   * Set the direction of the light ensuring it is normalized
   * @param direction - Direction vector
   */
  set direction(direction) {
    this._direction = Tuples.normalize(direction);
  }
  /**
   * Get the direction of the light
   */
  get direction() {
    return this._direction;
  }
  /**
   * Convenience method allows setting the direction as a point relative to the world origin
   * Values are always converted to a normalized unit direction vector
   * @param x - X position
   * @param y - Y position
   * @param z - Z position
   */
  setAsPosition(x, y, z) {
    this._direction = Tuples.normalize([0 - x, 0 - y, 0 - z]);
  }
  /**
   * Return the base set of uniforms for this light
   */
  get uniforms() {
    return {
      direction: this.direction,
      colour: this.enabled ? this.colour : [0, 0, 0],
      ambient: this.ambient ? this.ambient : [0, 0, 0]
    };
  }
  /**
   * Enable shadows for this light, this will create a shadow map texture and framebuffer
   * There is no way to disabled shadows once enabled
   * @param options A set of ShadowOptions to configure how shadows are calculated
   */
  enableShadows(options) {
    this._shadowOptions = options ?? {};
    if (!this._shadowOptions.mapSize) {
      this._shadowOptions.mapSize = 512;
    }
    if (!this._shadowOptions.zoom) {
      this._shadowOptions.zoom = 120;
    }
    if (!this._shadowOptions.distance) {
      this._shadowOptions.distance = 1e3;
    }
    if (!this._shadowOptions.scatter) {
      this._shadowOptions.scatter = 0.2;
    }
    const gl = getGl();
    if (!gl) {
      throw new Error("\u{1F4A5} LightDirectional: Cannot create shadow map, no GL context");
    }
    this._shadowMapTex = createTexture(gl, {
      width: this._shadowOptions.mapSize,
      height: this._shadowOptions.mapSize,
      internalFormat: gl.DEPTH_COMPONENT32F,
      // Makes this a depth texture
      compareMode: gl.COMPARE_REF_TO_TEXTURE,
      // Becomes a shadow map, e.g. sampler2DShadow
      minMag: gl.LINEAR
      // Can be linear sampled only if compare mode is set
    });
    this._shadowMapFB = createFramebufferInfo(
      gl,
      [{ attachment: this._shadowMapTex, attachmentPoint: gl.DEPTH_ATTACHMENT }],
      this._shadowOptions.mapSize,
      this._shadowOptions.mapSize
    );
  }
  /**
   * Get a virtual camera that can be used to render a shadow map for this light
   * @param zoomLevel - Zoom level of the camera, default: 30
   * @param aspectRatio - Aspect ratio of the camera, default: 1
   */
  getShadowCamera() {
    if (!this._shadowOptions) {
      return void 0;
    }
    const moveDist = this._shadowOptions.distance * 0.2;
    const cam = new Camera(1 /* ORTHOGRAPHIC */, 1);
    cam.orthoZoom = this._shadowOptions.zoom;
    cam.lookAt = [0, 0, 0];
    cam.position = [-this.direction[0] * moveDist, -this.direction[1] * moveDist, -this.direction[2] * moveDist];
    cam.usedForShadowMap = true;
    cam.far = this._shadowOptions.distance;
    return cam;
  }
  /**
   * Get the forward view matrix for the virtual camera used to render the shadow map
   */
  get shadowMatrix() {
    if (!this._shadowOptions) {
      return void 0;
    }
    const shadowCam = this.getShadowCamera();
    if (!shadowCam) {
      return void 0;
    }
    const camViewMatrix = shadowCam.matrix;
    const shadowMatrix = mat4_exports.multiply(
      mat4_exports.create(),
      shadowCam.projectionMatrix,
      mat4_exports.invert(mat4_exports.create(), camViewMatrix)
    );
    return shadowMatrix;
  }
  get shadowMapProgram() {
    return this._shadowMapProgram;
  }
  get shadowMapFrameBufffer() {
    return this._shadowMapFB;
  }
  get shadowMapTexture() {
    return this._shadowMapTex;
  }
  get shadowMapOptions() {
    return this._shadowOptions;
  }
};
var LightPoint = class {
  /**
   * Create a default point light, positioned at the world origin
   * @param position - Position of the light in world space
   * @param colour - Colour of the light
   * @param constant - Attenuation constant drop off rate, default 0.5
   * @param linear - Attenuation linear drop off rate, default 0.018
   * @param quad - Attenuation quadratic drop off rate, default 0.0003
   */
  constructor(position, colour, constant = 0.5, linear = 0.018, quad = 3e-4) {
    this.position = position;
    this.colour = colour;
    this.constant = constant;
    this.linear = linear;
    this.quad = quad;
    this.ambient = Colours.BLACK;
    this.enabled = true;
  }
  /**
   * Return the base set of uniforms for this light
   */
  get uniforms() {
    return {
      enabled: this.enabled,
      quad: this.quad,
      position: this.position,
      colour: this.colour,
      ambient: this.ambient,
      constant: this.constant,
      linear: this.linear
    };
  }
};

// src/engine/envmap.ts
var import_loglevel5 = __toESM(require_loglevel(), 1);

// shaders/envmap/glsl.frag
var glsl_default3 = "#version 300 es\n\n// ============================================================================\n// Environment map fragment shader\n// Ben Coleman, 2023\n// ============================================================================\n\nprecision highp float;\n\nin vec3 v_texCoord;\n\nuniform samplerCube u_envMapTex;\n\nout vec4 outColour;\n\nvoid main() {\n  // Use the texture cube map as the colour\n  // Note: We don't need to do any lighting calculations here\n  outColour = texture(u_envMapTex, v_texCoord);\n}\n";

// shaders/envmap/glsl.vert
var glsl_default4 = "#version 300 es\n\n// ============================================================================\n// Environment map vertex shader\n// Ben Coleman, 2023\n// ============================================================================\n\nprecision highp float;\n\nin vec4 position;\n\nuniform mat4 u_worldViewProjection;\n\nout vec3 v_texCoord;\n\nvoid main() {\n  // This essentially is what makes the envmap work, texCoords\n  // are taken from the vertex position\n  v_texCoord = position.xyz;\n\n  gl_Position = u_worldViewProjection * position;\n}\n";

// src/engine/envmap.ts
var EnvironmentMap = class {
  /**
   * Create a new environment map with 6 textures for each side
   * @param gl GL context
   * @param textureURLs Array of 6 texture URLs, in order: +x, -x, +y, -y, +z, -z
   */
  constructor(gl, textureURLs) {
    this.gl = gl;
    this.programInfo = createProgramInfo(gl, [glsl_default4, glsl_default3]);
    this.cube = primitives.createCubeBufferInfo(gl, 1);
    this.renderAsBackground = true;
    import_loglevel5.default.info(`\u{1F3D4}\uFE0F EnvironmentMap created!`);
    if (textureURLs.length !== 6) {
      throw new Error("\u{1F4A5} Cubemap requires 6 textures");
    }
    this._texture = createTexture(gl, {
      target: gl.TEXTURE_CUBE_MAP,
      src: textureURLs,
      min: gl.LINEAR_MIPMAP_LINEAR,
      mag: gl.LINEAR,
      cubeFaceOrder: [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
      ],
      flipY: 0
    });
  }
  /**
   * Render this envmap as a cube in, around the given camera & matrices
   * This is used for rendering the envmap as a background and skybox around the scene
   * @param viewMatrix View matrix
   * @param projMatrix Projection matrix
   * @param camera Camera
   */
  render(viewMatrix, projMatrix, camera) {
    if (!this.renderAsBackground)
      return;
    this.gl.useProgram(this.programInfo.program);
    this.gl.disable(this.gl.DEPTH_TEST);
    const uniforms = {
      u_envMapTex: this._texture,
      u_worldViewProjection: mat4_exports.create()
    };
    const world = mat4_exports.create();
    mat4_exports.translate(world, world, camera.position);
    mat4_exports.scale(world, world, [camera.far, camera.far, camera.far]);
    const worldView = mat4_exports.multiply(mat4_exports.create(), viewMatrix, world);
    mat4_exports.multiply(uniforms.u_worldViewProjection, projMatrix, worldView);
    setBuffersAndAttributes(this.gl, this.programInfo, this.cube);
    setUniforms(this.programInfo, uniforms);
    drawBufferInfo(this.gl, this.cube);
    this.gl.enable(this.gl.DEPTH_TEST);
  }
  get texture() {
    return this._texture;
  }
};
var DynamicEnvironmentMap = class {
  /**
   * Create a new dynamic environment map
   * @param gl GL context
   * @param size Size of each face of the cube map
   * @param position Position of the center of the cube map, reflections will be rendered from here
   */
  constructor(gl, size, position, far) {
    this.facings = [];
    this._texture = createTexture(gl, {
      target: gl.TEXTURE_CUBE_MAP,
      width: size,
      height: size,
      minMag: gl.LINEAR,
      cubeFaceOrder: [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
      ]
    });
    this.facings = [
      {
        face: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        direction: [1, 0, 0],
        buffer: createFramebufferInfo(
          gl,
          [{ attachment: this._texture, target: gl.TEXTURE_CUBE_MAP_POSITIVE_X }, { format: gl.DEPTH_COMPONENT16 }],
          size,
          size
        )
      },
      {
        face: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        direction: [-1, 0, 0],
        buffer: createFramebufferInfo(
          gl,
          [{ attachment: this._texture, target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X }, { format: gl.DEPTH_COMPONENT16 }],
          size,
          size
        )
      },
      {
        face: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        direction: [0, 1, 0],
        buffer: createFramebufferInfo(
          gl,
          [{ attachment: this._texture, target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y }, { format: gl.DEPTH_COMPONENT16 }],
          size,
          size
        )
      },
      {
        face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        direction: [0, -1, 0],
        buffer: createFramebufferInfo(
          gl,
          [{ attachment: this._texture, target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y }, { format: gl.DEPTH_COMPONENT16 }],
          size,
          size
        )
      },
      {
        face: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        direction: [0, 0, 1],
        buffer: createFramebufferInfo(
          gl,
          [{ attachment: this._texture, target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z }, { format: gl.DEPTH_COMPONENT16 }],
          size,
          size
        )
      },
      {
        face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        direction: [0, 0, -1],
        buffer: createFramebufferInfo(
          gl,
          [{ attachment: this._texture, target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z }, { format: gl.DEPTH_COMPONENT16 }],
          size,
          size
        )
      }
    ];
    this.camera = new Camera(0 /* PERSPECTIVE */);
    this.camera.position = position;
    this.camera.fov = 90;
    this.camera.usedForEnvMap = true;
    this.camera.far = far;
  }
  /** Get the texture of the environment cubemap  */
  get texture() {
    return this._texture;
  }
  /**
   * This is used to position the camera for creating the reflection map
   * @param position Position of the center of the cube map
   */
  set position(pos) {
    this.camera.position = pos;
  }
  /**
   * Update the environment map, by rendering the scene from the given position into the cubemap texture
   * @param ctx GSOTS Context
   */
  update(gl, ctx) {
    for (const facing of this.facings) {
      this.camera.lookAt = [
        this.camera.position[0] + facing.direction[0],
        this.camera.position[1] + facing.direction[1],
        this.camera.position[2] + facing.direction[2]
      ];
      this.camera.up = [0, -1, 0];
      if (facing.face === gl.TEXTURE_CUBE_MAP_NEGATIVE_Y) {
        this.camera.up = [0, 0, -1];
      }
      if (facing.face === gl.TEXTURE_CUBE_MAP_POSITIVE_Y) {
        this.camera.up = [0, 0, 1];
      }
      bindFramebufferInfo(gl, facing.buffer);
      ctx.renderWithCamera(this.camera);
    }
  }
};

// src/models/instance.ts
var Instance = class {
  /**
   * @param {Renderable} renderable - Renderable to use for this instance
   */
  constructor(renderable) {
    this.enabled = true;
    this.metadata = {};
    this.castShadow = true;
    /**
     * Per instance texture flip flags, useful for flipping textures on a per instance basis
     * @default false
     */
    this.flipTextureX = false;
    /**
     * Per instance texture flip flags, useful for flipping textures on a per instance basis
     * @default false
     */
    this.flipTextureY = false;
    this.renderable = renderable;
  }
  /**
   * Rotate this instance around the X axis
   */
  rotateX(angle2) {
    if (!this.rotate)
      this.rotate = [0, 0, 0];
    this.rotate[0] += angle2;
  }
  /**
   * Rotate this instance around the Y axis
   */
  rotateY(angle2) {
    if (!this.rotate)
      this.rotate = [0, 0, 0];
    this.rotate[1] += angle2;
  }
  /**
   * Rotate this instance around the Z axis
   */
  rotateZ(angle2) {
    if (!this.rotate)
      this.rotate = [0, 0, 0];
    this.rotate[2] += angle2;
  }
  rotateZDeg(angle2) {
    this.rotateZ(angle2 * Math.PI / 180);
  }
  rotateYDeg(angle2) {
    this.rotateY(angle2 * Math.PI / 180);
  }
  rotateXDeg(angle2) {
    this.rotateX(angle2 * Math.PI / 180);
  }
  /**
   * Render this instance in the world
   * @param {WebGL2RenderingContext} gl - WebGL context to render into
   * @param {UniformSet} uniforms - Map of uniforms to pass to shader
   */
  render(gl, uniforms, programOverride) {
    if (!this.enabled)
      return;
    if (!this.renderable)
      return;
    if (!gl)
      return;
    if (programOverride && !this.castShadow) {
      return;
    }
    const scale4 = mat4_exports.create();
    const rotate2 = mat4_exports.create();
    const translate2 = mat4_exports.create();
    if (this.scale)
      mat4_exports.scale(scale4, scale4, this.scale);
    if (this.rotate) {
      mat4_exports.rotateX(rotate2, rotate2, this.rotate[0]);
      mat4_exports.rotateY(rotate2, rotate2, this.rotate[1]);
      mat4_exports.rotateZ(rotate2, rotate2, this.rotate[2]);
    }
    if (this.position)
      mat4_exports.translate(translate2, translate2, this.position);
    const world = translate2;
    mat4_exports.multiply(world, world, rotate2);
    mat4_exports.multiply(world, world, scale4);
    uniforms.u_world = world;
    mat4_exports.invert(uniforms.u_worldInverseTranspose, world);
    mat4_exports.transpose(uniforms.u_worldInverseTranspose, uniforms.u_worldInverseTranspose);
    const worldView = mat4_exports.multiply(mat4_exports.create(), uniforms.u_view, world);
    mat4_exports.multiply(uniforms.u_worldViewProjection, uniforms.u_proj, worldView);
    uniforms.u_flipTextureX = this.flipTextureX;
    uniforms.u_flipTextureY = this.flipTextureY;
    this.renderable.render(gl, uniforms, this.material, programOverride);
  }
};

// src/core/stats.ts
var Stats = class {
  constructor() {
    this.prevTime = 0;
    this.drawCallsPerFrame = 0;
    this.instances = 0;
    this.triangles = 0;
    this.deltaTime = 0;
    this.totalTime = 0;
  }
  resetPerFrame() {
    this.drawCallsPerFrame = 0;
  }
  updateTime(now) {
    this.deltaTime = now - this.prevTime;
    this.prevTime = now;
    this.totalTime += this.deltaTime;
  }
  get FPS() {
    return Math.round(1 / this.deltaTime);
  }
  get totalTimeRound() {
    return Math.round(this.totalTime);
  }
};
var stats = new Stats();

// src/models/billboard.ts
var BillboardType = /* @__PURE__ */ ((BillboardType2) => {
  BillboardType2[BillboardType2["SPHERICAL"] = 0] = "SPHERICAL";
  BillboardType2[BillboardType2["CYLINDRICAL"] = 1] = "CYLINDRICAL";
  return BillboardType2;
})(BillboardType || {});
var Billboard = class {
  /** Creates a square billboard */
  constructor(gl, type, material, size) {
    this.type = 1 /* CYLINDRICAL */;
    this.material = material;
    this.type = type;
    const verts = primitives.createXYQuadVertices(size, 0, size / 2);
    for (let i = 1; i < verts.texcoord.length; i += 2) {
      verts.texcoord[i] = 1 - verts.texcoord[i];
    }
    this.bufferInfo = createBufferInfoFromArrays(gl, verts);
    this.programInfo = ProgramCache.instance.get(ProgramCache.PROG_BILLBOARD);
  }
  /**
   * Render is used draw this billboard, this is called from the Instance that wraps
   * this renderable
   */
  render(gl, uniforms, materialOverride) {
    const programInfo = this.programInfo;
    gl.useProgram(programInfo.program);
    if (materialOverride === void 0) {
      this.material.apply(programInfo);
    } else {
      materialOverride.apply(programInfo);
    }
    const worldView = mat4_exports.multiply(mat4_exports.create(), uniforms.u_view, uniforms.u_world);
    const scale4 = mat4_exports.getScaling(vec3_exports.create(), worldView);
    worldView[0] = scale4[0];
    worldView[1] = 0;
    worldView[2] = 0;
    worldView[8] = 0;
    worldView[9] = 0;
    worldView[10] = scale4[2];
    if (this.type == 0 /* SPHERICAL */) {
      worldView[4] = 0;
      worldView[5] = scale4[1];
      worldView[6] = 0;
    }
    mat4_exports.multiply(uniforms.u_worldViewProjection, uniforms.u_proj, worldView);
    setBuffersAndAttributes(gl, programInfo, this.bufferInfo);
    setUniforms(programInfo, uniforms);
    drawBufferInfo(gl, this.bufferInfo);
    stats.drawCallsPerFrame++;
  }
};

// src/engine/material.ts
var Material = class _Material {
  /**
   * Create a new material with default diffuse white colour
   */
  constructor() {
    this.ambient = [1, 1, 1];
    this.diffuse = [1, 1, 1];
    this.specular = [0, 0, 0];
    this.emissive = [0, 0, 0];
    this.shininess = 20;
    this.opacity = 1;
    this.reflectivity = 0;
    this.diffuseTex = TextureCache.instance.get("_defaults/white");
    this.specularTex = TextureCache.instance.get("_defaults/white");
  }
  /**
   * Create a new material from a raw MTL material
   * @param rawMtl Raw MTL material
   * @param basePath Base path for locating & loading textures in MTL file
   * @param filter Apply texture filtering to textures, default: true
   * @param flipY Flip the Y axis of textures, default: false
   */
  static fromMtl(rawMtl, basePath, filter = true, flipY = false) {
    const m = new _Material();
    m.ambient = rawMtl.ka ? rawMtl.ka : [1, 1, 1];
    m.diffuse = rawMtl.kd ? rawMtl.kd : [1, 1, 1];
    m.specular = rawMtl.ks ? rawMtl.ks : [0, 0, 0];
    m.emissive = rawMtl.ke ? rawMtl.ke : [0, 0, 0];
    m.shininess = rawMtl.ns ? rawMtl.ns : 0;
    m.opacity = rawMtl.d ? rawMtl.d : 1;
    if (rawMtl.texDiffuse) {
      m.diffuseTex = TextureCache.instance.getCreate(`${basePath}/${rawMtl.texDiffuse}`, filter, flipY);
    }
    if (rawMtl.texSpecular) {
      m.specularTex = TextureCache.instance.getCreate(`${basePath}/${rawMtl.texSpecular}`, filter, flipY);
    }
    if (rawMtl.texNormal) {
      m.normalTex = TextureCache.instance.getCreate(`${basePath}/${rawMtl.texNormal}`, filter, flipY);
    }
    if (rawMtl.illum && rawMtl.illum > 2) {
      m.reflectivity = (m.specular[0] + m.specular[1] + m.specular[2]) / 3;
    }
    return m;
  }
  /**
   * Create a basic Material with a solid diffuse colour
   */
  static createSolidColour(r, g, b) {
    const m = new _Material();
    m.diffuse = [r, g, b];
    return m;
  }
  /**
   * Create a new Material with a texture map loaded from a URL
   */
  static createBasicTexture(url, filter = true, flipY = false) {
    const m = new _Material();
    m.diffuseTex = TextureCache.instance.getCreate(url, filter, flipY);
    return m;
  }
  /**
   * Add a specular texture map to existing material, probably created with createBasicTexture
   * @param url
   * @param filter
   */
  addSpecularTexture(url, filter = true, flipY = false) {
    this.specularTex = TextureCache.instance.getCreate(url, filter, flipY);
    this.specular = [1, 1, 1];
    this.shininess = 20;
  }
  /**
   * Add a normal texture map to existing material, probably created with createBasicTexture
   * @param url
   * @param filter
   */
  addNormalTexture(url, filter = true, flipY = false) {
    this.normalTex = TextureCache.instance.getCreate(url, filter, flipY);
  }
  /** Create a simple RED Material */
  static get RED() {
    const m = _Material.createSolidColour(1, 0, 0);
    return m;
  }
  /** Create a simple GREEN Material */
  static get GREEN() {
    return _Material.createSolidColour(0, 1, 0);
  }
  /** Create a simple BLUE Material */
  static get BLUE() {
    const m = _Material.createSolidColour(0, 0, 1);
    return m;
  }
  /** Create a simple BLUE Material */
  static get WHITE() {
    const m = _Material.createSolidColour(1, 1, 1);
    return m;
  }
  /**
   * Applies the material to the given program as a uniform struct
   */
  apply(programInfo, uniformSuffix = "") {
    const uni = {
      [`u_mat${uniformSuffix}`]: this.uniforms
    };
    setUniforms(programInfo, uni);
  }
  /**
   * Return the base set of uniforms for this material
   */
  get uniforms() {
    return {
      ambient: this.ambient,
      diffuse: this.diffuse,
      specular: this.specular,
      emissive: this.emissive,
      shininess: this.shininess,
      opacity: this.opacity,
      reflectivity: this.reflectivity,
      diffuseTex: this.diffuseTex ? this.diffuseTex : null,
      specularTex: this.specularTex ? this.specularTex : null,
      normalTex: this.normalTex ? this.normalTex : null,
      hasNormalTex: this.normalTex ? true : false
    };
  }
};

// src/models/primitive.ts
var Primitive = class {
  constructor() {
    this.material = new Material();
    this.triangles = 0;
    this.programInfo = ProgramCache.instance.default;
  }
  get triangleCount() {
    return this.triangles;
  }
  /**
   * Render is used draw this primitive, this is called from the Instance that wraps
   * this renderable.
   */
  render(gl, uniforms, materialOverride, programOverride) {
    if (!this.bufferInfo)
      return;
    const programInfo = programOverride || this.programInfo;
    gl.useProgram(programInfo.program);
    if (materialOverride === void 0) {
      this.material.apply(programInfo);
    } else {
      materialOverride.apply(programInfo);
    }
    setBuffersAndAttributes(gl, programInfo, this.bufferInfo);
    setUniforms(programInfo, uniforms);
    drawBufferInfo(gl, this.bufferInfo);
    stats.drawCallsPerFrame++;
  }
};
var PrimitiveSphere = class extends Primitive {
  /**
   * Create a new sphere primitive
   * @param gl WebGL2RenderingContext
   * @param radius Radius of the sphere
   * @param subdivisionsH Number of horizontal subdivisions
   * @param subdivisionsV Number of vertical subdivisions
   */
  constructor(gl, radius, subdivisionsH, subdivisionsV) {
    super();
    this.bufferInfo = primitives.createSphereBufferInfo(gl, radius, subdivisionsH, subdivisionsV);
    this.triangles += this.bufferInfo.numElements / 3;
  }
};
var PrimitiveCube = class extends Primitive {
  /**
   * Create a new cube primitive
   * @param gl WebGL2RenderingContext
   * @param size Size of the cube
   */
  constructor(gl, size) {
    super();
    this.bufferInfo = primitives.createCubeBufferInfo(gl, size);
    this.triangles += this.bufferInfo.numElements / 3;
  }
};
var PrimitivePlane = class extends Primitive {
  /**
   * Create a new plane primitive
   * @param gl WebGL2RenderingContext
   * @param width Width of the plane
   * @param height Height of the plane
   * @param subdivisionsW Number of horizontal subdivisions
   * @param subdivisionsH Number of vertical subdivisions
   * @param tilingFactor Number of times to tile the texture across the plane
   */
  constructor(gl, width, height, subdivisionsW, subdivisionsH, tilingFactor) {
    super();
    const verts = primitives.createPlaneVertices(width, height, subdivisionsW, subdivisionsH);
    for (let i = 0; i < verts.texcoord.length; i++) {
      verts.texcoord[i] = verts.texcoord[i] * tilingFactor;
    }
    this.bufferInfo = createBufferInfoFromArrays(gl, verts);
    this.triangles += this.bufferInfo.numElements / 3;
  }
};
var PrimitiveCylinder = class extends Primitive {
  /**
   * Create a new cylinder primitive
   * @param gl WebGL2RenderingContext
   * @param radius Radius of the cylinder
   * @param height Height of the cylinder
   * @param subdivisionsR Subdivisions around the cylinder
   * @param subdivisionsV Subdivisions vertically
   * @param caps Should the cylinder have caps
   */
  constructor(gl, radius, height, subdivisionsR, subdivisionsV, caps) {
    super();
    this.bufferInfo = primitives.createCylinderBufferInfo(gl, radius, height, subdivisionsR, subdivisionsV, caps, caps);
    this.triangles += this.bufferInfo.numElements / 3;
  }
};

// src/models/model.ts
var import_loglevel6 = __toESM(require_loglevel(), 1);

// src/parsers/mtl-parser.ts
function parseMTL(mtlFile) {
  const materials = /* @__PURE__ */ new Map();
  let material = {};
  const keywords = {
    newmtl(_, unparsedArgs) {
      material = {};
      materials.set(unparsedArgs, material);
    },
    Ns(parts) {
      material.ns = parseFloat(parts[0]);
    },
    Ka(parts) {
      material.ka = parts.map(parseFloat);
    },
    Kd(parts) {
      material.kd = parts.map(parseFloat);
    },
    Ks(parts) {
      material.ks = parts.map(parseFloat);
    },
    // This is a non-standard addition, but semi-official
    Ke(parts) {
      material.ke = parts.map(parseFloat);
    },
    Ni() {
    },
    d(parts) {
      material.d = parseFloat(parts[0]);
    },
    illum(parts) {
      material.illum = parseInt(parts[0]);
    },
    map_Kd(_, unparsedArgs) {
      material.texDiffuse = unparsedArgs;
    },
    map_Ks(_, unparsedArgs) {
      material.texSpecular = unparsedArgs;
    },
    map_bump(_, unparsedArgs) {
      material.texNormal = unparsedArgs;
    },
    map_Bump(_, unparsedArgs) {
      material.texNormal = unparsedArgs;
    }
  };
  const keywordRE2 = /(\w*)(?: )*(.*)/;
  const lines = mtlFile.split("\n");
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim();
    if (line === "" || line.startsWith("#")) {
      continue;
    }
    const m = keywordRE2.exec(line);
    if (!m) {
      continue;
    }
    const [, keyword, unparsedArgs] = m;
    const parts = line.split(/\s+/).slice(1);
    const handler = keywords[keyword];
    if (!handler) {
      continue;
    }
    handler(parts, unparsedArgs);
  }
  return materials;
}

// src/parsers/obj-parser.ts
var keywordRE = /(\w*)(?: )*(.*)/;
function parseOBJ(objFile, flipUV) {
  const lines = objFile.split("\n");
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];
  const objVertexData = [objPositions, objTexcoords, objNormals];
  let triangles = 0;
  let webglVertexData = [
    [],
    // position
    [],
    // texcoord
    []
    // normal
  ];
  const geometries = Array();
  let geometry = {};
  let material = "__default";
  const materialLibs = Array();
  const keywords = {
    v(parts) {
      objPositions.push(parts.map(parseFloat));
    },
    vn(parts) {
      objNormals.push(parts.map(parseFloat));
    },
    vt(parts) {
      if (flipUV) {
        objTexcoords.push([parseFloat(parts[0]), 1 - parseFloat(parts[1])]);
      } else {
        objTexcoords.push([parseFloat(parts[0]), parseFloat(parts[1])]);
      }
    },
    f(parts) {
      triangles++;
      setGeometry();
      const numTriangles = parts.length - 2;
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0]);
        addVertex(parts[tri + 1]);
        addVertex(parts[tri + 2]);
      }
    },
    usemtl(_, unparsedArgs) {
      material = unparsedArgs;
      newGeometry();
    },
    mtllib(_, unparsedArgs) {
      materialLibs.push(unparsedArgs);
    },
    // Not used, but suppress warnings
    s() {
      return;
    },
    o() {
      return;
    },
    g() {
      return;
    },
    l() {
      return;
    }
  };
  function addVertex(vert) {
    const ptn = vert.split("/");
    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) {
        return;
      }
      const objIndex = parseInt(objIndexStr);
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
      webglVertexData[i].push(...objVertexData[i][index]);
    });
  }
  function newGeometry() {
    if (geometry.material) {
      geometry = {};
    }
  }
  function setGeometry() {
    if (!geometry.material) {
      const position = [];
      const texcoord = [];
      const normal = [];
      webglVertexData = [position, texcoord, normal];
      geometry = {
        material,
        data: {
          position,
          texcoord,
          normal
        }
      };
      geometries.push(geometry);
    }
  }
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim();
    if (line === "" || line.startsWith("#")) {
      continue;
    }
    const m = keywordRE.exec(line);
    if (!m) {
      continue;
    }
    const [, keyword, unparsedArgs] = m;
    const parts = line.split(/\s+/).slice(1);
    const handler = keywords[keyword];
    if (!handler) {
      console.warn("unhandled keyword:", keyword, "at line", lineNo + 1);
      continue;
    }
    handler(parts, unparsedArgs);
  }
  for (const g of geometries) {
    if (g.data.texcoord && g.data.texcoord.length <= 0) {
      delete g.data.texcoord;
    }
  }
  return {
    matLibNames: materialLibs,
    geometries,
    triangles
  };
}

// src/core/files.ts
async function fetchFile(filePath) {
  const resp = await fetch(filePath);
  if (!resp.ok) {
    throw new Error(`\u{1F4A5} File fetch failed: ${resp.statusText}`);
  }
  const text = await resp.text();
  return text;
}

// src/models/model.ts
var Model = class _Model {
  /**
   * Constructor is private, use static `parse()` method instead
   */
  constructor(name) {
    this.parts = [];
    this.materials = {};
    this.name = name;
    this.triangles = 0;
    this.programInfo = ProgramCache.instance.default;
  }
  /**
   * Render is used draw this model, this is called from the Instance that wraps
   * this renderable.
   */
  render(gl, uniforms, materialOverride, programOverride) {
    const programInfo = programOverride || this.programInfo;
    gl.useProgram(programInfo.program);
    for (const part of this.parts) {
      const bufferInfo = part.bufferInfo;
      if (materialOverride === void 0) {
        let material = this.materials[part.materialName];
        if (!material) {
          material = this.materials["__default"];
        }
        material.apply(programInfo);
      } else {
        materialOverride.apply(programInfo);
      }
      setBuffersAndAttributes(gl, programInfo, bufferInfo);
      setUniforms(programInfo, uniforms);
      drawBufferInfo(gl, bufferInfo);
      stats.drawCallsPerFrame++;
    }
  }
  /** Simple getter for the number of triangles in the model */
  get triangleCount() {
    return this.triangles;
  }
  /**
   * Parse an OBJ file & MTL material libraries, returns a new Model
   * @param {string} path - The path to the OBJ file
   * @param {string} objFilename - The name of the OBJ file
   * @param {boolean} filterTextures - Apply texture filtering to textures, default: true
   * @param {boolean} flipTextureY - Flip the Y axis of textures as they are loaded, default: false
   * @param {boolean} flipUV - Flip the UV coords of the model in the vertex/mesh data, default: true
   */
  static async parse(path = ".", objFilename, filterTextures = true, flipTextureY = false, flipUV = true) {
    const startTime = performance.now();
    const name = objFilename.split(".")[0];
    const model = new _Model(name);
    let objFile;
    try {
      objFile = await fetchFile(`${path}/${objFilename}`);
    } catch (err) {
      throw new Error(`\u{1F4A5} Unable to load file '${path}/${objFilename}'`);
    }
    const objData = parseOBJ(objFile, flipUV);
    if (!objData.geometries || objData.geometries.length === 0) {
      throw new Error(`\u{1F4A5} Error parsing '${objFilename}', might not be a OBJ file`);
    }
    if (objData.matLibNames && objData.matLibNames.length > 0) {
      try {
        const mtlFile = await fetchFile(`${path}/${objData.matLibNames[0]}`);
        const materialsRawList = parseMTL(mtlFile);
        for (const [matName, matRaw] of materialsRawList) {
          model.materials[matName] = Material.fromMtl(matRaw, path, filterTextures, flipTextureY);
        }
      } catch (err) {
        import_loglevel6.default.warn(`\u{1F4A5} Unable to load material library ${objData.matLibNames[0]}`);
      }
    }
    model.materials["__default"] = new Material();
    model.materials["__default"].diffuse = [0.1, 0.6, 0.9];
    const gl = getGl();
    if (!gl) {
      throw new Error("\u{1F4A5} Unable to get WebGL context");
    }
    for (const g of objData.geometries) {
      const bufferInfo = createBufferInfoFromArrays(gl, g.data);
      model.parts.push(new ModelPart(bufferInfo, g.material));
    }
    import_loglevel6.default.debug(
      `\u265F\uFE0F Model '${objFilename}' loaded with ${model.parts.length} parts, ${Object.keys(model.materials).length} materials in ${((performance.now() - startTime) / 1e3).toFixed(2)}s`
    );
    model.triangles = objData.triangles;
    return model;
  }
  /**
   * Get list of all material names in this model used by all parts
   * @returns {string[]} - List of material names
   */
  get materialNames() {
    return Object.keys(this.materials);
  }
  /**
   * Get number of parts in this model
   */
  get partsCount() {
    return this.parts.length;
  }
  /**
   * Get list of parts in this model, names are the material names
   * @returns {string[]} - List of part material names
   */
  get partList() {
    return this.parts.map((p) => p.materialName);
  }
  /**
   * Can modify & override an existing named material
   * @param {string} name - Name of the material to modify
   * @param {Material} material - New material to use
   */
  setNamedMaterial(name, material) {
    this.materials[name] = material;
  }
  /**
   * Get a named material
   * @param {string} name - Name of the material to get
   */
  getNamedMaterial(name) {
    return this.materials[name];
  }
};
var ModelPart = class {
  /**
   * @param {twgl.BufferInfo} bufferInfo - WebGL buffer info for this model part
   * @param {string} materialName - Name of the material associated with this part
   */
  constructor(bufferInfo, materialName) {
    this.bufferInfo = bufferInfo;
    this.materialName = materialName;
  }
};

// src/core/hud.ts
var HUD = class {
  constructor(canvas) {
    const parent = canvas.parentElement;
    if (!parent)
      throw new Error("\u{1F4A5} Canvas must have a parent element");
    this.canvas = canvas;
    this.hud = document.createElement("div");
    this.hud.classList.add("gsots3d-hud");
    this.update = this.update.bind(this);
    window.addEventListener("resize", this.update);
    window.addEventListener("load", this.update);
    parent.appendChild(this.hud);
    this.update();
  }
  update() {
    const canvasStyles = window.getComputedStyle(this.canvas, null);
    this.hud.style.position = canvasStyles.getPropertyValue("position");
    this.hud.style.top = canvasStyles.getPropertyValue("top");
    this.hud.style.left = canvasStyles.getPropertyValue("left");
    this.hud.style.width = canvasStyles.getPropertyValue("width");
    this.hud.style.height = canvasStyles.getPropertyValue("height");
    this.hud.style.transform = canvasStyles.getPropertyValue("transform");
    this.hud.style.pointerEvents = "none";
  }
  addHUDItem(item) {
    this.hud.appendChild(item);
  }
  debug(msg) {
    this.hud.innerHTML = msg;
  }
};

// shaders/phong/glsl.frag
var glsl_default5 = "#version 300 es\n\n// ============================================================================\n// Phong fragment shader\n// Ben Coleman, 2023\n// ============================================================================\n\nprecision highp float;\n\n// ===== Constants ============================================================\n\nconst int MAX_LIGHTS = 16;\n\n// Got this from http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-16-shadow-mapping/#poisson-sampling\nvec3 poissonDisk[4] = vec3[](\n  vec3(-0.94201624, -0.39906216, 0.0),\n  vec3(0.94558609, -0.76890725, 0.0),\n  vec3(-0.094184101, -0.9293887, 0.0),\n  vec3(0.34495938, 0.2938776, 0.0)\n);\n\n// ===== Structs ==============================================================\n\nstruct LightDir {\n  vec3 direction;\n  vec3 colour;\n  vec3 ambient;\n};\n\nstruct LightPos {\n  vec3 position;\n  vec3 colour;\n  vec3 ambient;\n  float constant;\n  float linear;\n  float quad;\n  bool enabled;\n};\n\nstruct Material {\n  vec3 ambient;\n  vec3 diffuse;\n  vec3 specular;\n  vec3 emissive;\n  float shininess;\n  float opacity;\n  float reflectivity;\n  sampler2D diffuseTex;\n  sampler2D specularTex;\n  sampler2D normalTex;\n  bool hasNormalTex;\n};\n\n// Inputs from vertex shader\nin vec3 v_normal;\nin vec2 v_texCoord;\nin vec4 v_position;\nin vec4 v_shadowCoord;\n\n// Some global uniforms\nuniform vec3 u_camPos;\nuniform float u_gamma;\nuniform bool u_flipTextureX;\nuniform bool u_flipTextureY;\n\n// Main lights and material uniforms\nuniform Material u_mat;\nuniform LightDir u_lightDirGlobal;\nuniform LightPos u_lightsPos[MAX_LIGHTS];\nuniform int u_lightsPosCount;\n// Reflection map isn't part of the material struct for complex reasons\nuniform samplerCube u_reflectionMap;\n// Shadows\nuniform highp sampler2DShadow u_shadowMap;\nuniform float u_shadowScatter;\n\n// Global texture coords shared between functions\nvec2 texCoord;\n\n// Output colour of this pixel/fragment\nout vec4 outColour;\n\n// ===== Helper functions =====================================================\n\n// Simple mixer\nvec4 mix4(vec4 a, vec4 b, float mix) {\n  return a * (1.0 - mix) + b * mix;\n}\n\n// Function to help with get values from the shadow map\nfloat shadowMapSample(highp sampler2DShadow map, vec3 coord) {\n  // As WebGL 2 does not support GL_CLAMP_TO_BORDER or GL_TEXTURE_BORDER_COLOR, we need to do this :(\n  if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0) {\n    return 1.0;\n  }\n\n  return texture(map, coord);\n}\n\n// Shade a fragment using a directional light source\nvec4 shadeDirLight(LightDir light, Material mat, vec3 N, vec3 V) {\n  vec3 L = normalize(-light.direction);\n  vec3 H = normalize(L + V);\n\n  vec3 diffuseCol = vec3(texture(mat.diffuseTex, texCoord)) * mat.diffuse;\n  vec3 specularCol = vec3(texture(mat.specularTex, texCoord)) * mat.specular;\n\n  float diff = dot(N, L);\n  float spec = diff > 0.0 ? pow(max(dot(N, H), 0.0), mat.shininess) : 0.0;\n\n  // Shadow map lookup\n  vec3 projCoords = v_shadowCoord.xyz / v_shadowCoord.w * 0.5 + 0.5;\n  float shadow = 0.0;\n\n  // Carry out PCF for shadows using 4 samples of a poisson disk\n  for (int i = 0; i < 4; i++) {\n    vec3 offset = poissonDisk[i] * (u_shadowScatter / 100.0);\n    shadow += shadowMapSample(u_shadowMap, projCoords + offset) * 0.25;\n  }\n\n  vec3 ambient = light.ambient * mat.ambient * diffuseCol;\n  vec3 diffuse = light.colour * max(diff, 0.0) * diffuseCol * shadow;\n  vec3 specular = light.colour * spec * specularCol * shadow;\n\n  // Return a vec4 to support transparency, note specular is not affected by opacity\n  return vec4(ambient + diffuse, mat.opacity / float(u_lightsPosCount + 1)) + vec4(specular, spec);\n}\n\n// Shade a fragment using a positional light source\nvec4 shadePosLight(LightPos light, Material mat, vec3 N, vec3 V) {\n  vec3 L = normalize(light.position - v_position.xyz);\n  vec3 H = normalize(L + V);\n\n  vec3 diffuseCol = vec3(texture(mat.diffuseTex, texCoord)) * mat.diffuse;\n  vec3 specularCol = vec3(texture(mat.specularTex, texCoord)) * mat.specular;\n\n  float diff = dot(N, L);\n  float spec = diff > 0.0 ? pow(max(dot(N, H), 0.0), mat.shininess) : 0.0;\n\n  // Light attenuation, see: https://learnopengl.com/Lighting/Light-casters\n  float dist = length(light.position - v_position.xyz);\n  float attenuation = 1.0 / (light.constant + light.linear * dist + light.quad * (dist * dist));\n\n  vec3 ambient = light.ambient * mat.ambient * diffuseCol * attenuation;\n  vec3 diffuse = light.colour * max(diff, 0.0) * diffuseCol * attenuation;\n  vec3 specular = light.colour * spec * specularCol * attenuation;\n\n  // Return a vec4 to support transparency, note specular is not affected by opacity\n  return vec4(ambient + diffuse, mat.opacity / float(u_lightsPosCount + 1)) + vec4(specular, spec);\n}\n\n// ===== Main shader ==========================================================\n\nvoid main() {\n  vec3 V = normalize(u_camPos - v_position.xyz);\n\n  // Flip texture coords if needed\n  texCoord = u_flipTextureY ? vec2(v_texCoord.x, 1.0 - v_texCoord.y) : v_texCoord;\n  texCoord = u_flipTextureX ? vec2(1.0 - texCoord.x, texCoord.y) : texCoord;\n\n  vec3 N = normalize(v_normal);\n\n  // Normal mapping, this is expensive so only do it if we have a normal map\n  if (u_mat.hasNormalTex) {\n    vec3 normMap = texture(u_mat.normalTex, texCoord).xyz * 2.0 - 1.0;\n\n    vec3 Q1 = dFdx(v_position.xyz);\n    vec3 Q2 = dFdy(v_position.xyz);\n    vec2 st1 = dFdx(texCoord);\n    vec2 st2 = dFdy(texCoord);\n\n    vec3 T = -normalize(Q1 * st2.t - Q2 * st1.t);\n    vec3 B = normalize(cross(N, T));\n    mat3 TBN = mat3(T, B, N);\n\n    N = normalize(TBN * normMap);\n  }\n\n  // Handle the main directional light, only one of these\n  vec4 outColorPart = shadeDirLight(u_lightDirGlobal, u_mat, N, V);\n\n  // Add positional lights\n  for (int i = 0; i < u_lightsPosCount; i++) {\n    outColorPart += shadePosLight(u_lightsPos[i], u_mat, N, V);\n  }\n\n  // Add emissive component\n  float emissiveAlpha = u_mat.emissive.r + u_mat.emissive.g + u_mat.emissive.b > 0.0 ? 1.0 : 0.0;\n  outColorPart += vec4(u_mat.emissive, emissiveAlpha);\n\n  // Get reflection vector and sample reflection texture\n  vec3 R = reflect(-V, N);\n  vec4 reflectCol = vec4(texture(u_reflectionMap, R).rgb, 1.0);\n\n  // Add reflection component, not sure if this is correct, looks ok\n  outColorPart = mix4(outColorPart, reflectCol, u_mat.reflectivity);\n\n  // Gamma correction, as GL_FRAMEBUFFER_SRGB is not supported on WebGL\n  outColorPart.rgb = pow(outColorPart.rgb, vec3(1.0 / u_gamma));\n\n  outColour = outColorPart;\n}\n";

// shaders/phong/glsl.vert
var glsl_default6 = "#version 300 es\n\n// ============================================================================\n// Phong vertex shader\n// Ben Coleman, 2023\n// ============================================================================\n\nprecision highp float;\n\n// Input attributes from buffers\nin vec4 position;\nin vec3 normal;\nin vec2 texcoord;\n\nuniform mat4 u_worldViewProjection;\nuniform mat4 u_worldInverseTranspose;\nuniform mat4 u_world;\nuniform mat4 u_shadowMatrix;\n\n// Output varying's to pass to fragment shader\nout vec2 v_texCoord;\nout vec3 v_normal;\nout vec4 v_position;\nout vec4 v_shadowCoord;\n\nvoid main() {\n  v_texCoord = texcoord;\n  v_normal = (u_worldInverseTranspose * vec4(normal, 0)).xyz;\n  v_position = u_world * position;\n  v_shadowCoord = u_shadowMatrix * v_position;\n\n  gl_Position = u_worldViewProjection * position;\n}\n";

// shaders/billboard/glsl.frag
var glsl_default7 = "#version 300 es\n\n// ============================================================================\n// Billboard fragment shader\n// Ben Coleman, 2023\n// ============================================================================\n\nprecision highp float;\n\nstruct Material {\n  vec3 ambient;\n  vec3 diffuse;\n  vec3 specular;\n  vec3 emissive;\n  float shininess;\n  float opacity;\n  float reflectivity;\n  sampler2D diffuseTex;\n  sampler2D specularTex;\n  sampler2D normalTex;\n  bool hasNormalTex;\n};\n\n// From vertex shader\nin vec2 v_texCoord;\nin vec3 v_lighting;\n\n// Main lights and material uniforms\nuniform Material u_mat;\nuniform float u_gamma;\n\n// Output colour of this pixel/fragment\nout vec4 outColour;\n\nvoid main() {\n  vec4 texel = texture(u_mat.diffuseTex, v_texCoord);\n\n  // Magic to make transparent sprites work, without blending\n  // Somehow this also works with the shadow map render pass, which is a bonus\n  if (texel.a < 0.75) {\n    discard;\n  }\n\n  vec3 colour = texel.rgb * u_mat.diffuse * v_lighting;\n\n  // Gamma correction, as GL_FRAMEBUFFER_SRGB is not supported on WebGL\n  colour = pow(colour, vec3(1.0 / u_gamma));\n\n  outColour = vec4(colour, u_mat.opacity);\n}\n";

// shaders/billboard/glsl.vert
var glsl_default8 = "#version 300 es\n\n// ============================================================================\n// Billboard vertex shader\n// Ben Coleman, 2023\n// ============================================================================\n\nprecision highp float;\n\nconst int MAX_LIGHTS = 16;\n\nstruct LightDir {\n  vec3 direction;\n  vec3 colour;\n  vec3 ambient;\n};\n\nstruct LightPos {\n  vec3 position;\n  vec3 colour;\n  vec3 ambient;\n  float constant;\n  float linear;\n  float quad;\n  bool enabled;\n};\n\n// Input attributes from buffers\nin vec4 position;\nin vec2 texcoord;\n\nuniform mat4 u_worldViewProjection;\nuniform mat4 u_world;\nuniform int u_lightsPosCount;\nuniform vec3 u_camPos;\nuniform LightDir u_lightDirGlobal;\nuniform LightPos u_lightsPos[MAX_LIGHTS];\n\n// Output varying's to pass to fragment shader\nout vec2 v_texCoord;\nout vec3 v_lighting;\n\n/*\n * Legacy lighting calc\n * Returns vec2(diffuse, specular)\n */\nvec2 lightCalc(vec3 N, vec3 L, vec3 H, float shininess) {\n  float diff = dot(N, L);\n  float spec = diff > 0.0 ? pow(max(dot(N, H), 0.0), shininess) : 0.0;\n  return vec2(diff, spec);\n}\n\nvoid main() {\n  v_texCoord = texcoord;\n  gl_Position = u_worldViewProjection * position;\n  vec3 worldPos = (u_world * position).xyz;\n\n  // Normal for a billboard always points at camera\n  vec3 worldNormal = normalize(u_camPos - worldPos);\n\n  vec3 V = normalize(u_camPos - worldPos);\n  vec3 N = normalize(worldNormal);\n  float fudge = 1.5;\n\n  // Add point lights to lighting output\n  for (int i = 0; i < u_lightsPosCount; i++) {\n    LightPos light = u_lightsPos[i];\n    vec3 L = normalize(light.position - worldPos.xyz);\n\n    float diffuse = max(dot(N, L), 0.0);\n\n    // Distance attenuation\n    float distance = length(light.position - worldPos.xyz);\n    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quad * (distance * distance));\n\n    // Note small hack here to fudge the light intensity\n    v_lighting += light.colour * fudge * attenuation * diffuse;\n  }\n\n  // Add in global directional light\n  // Approximate by using a fixed direction for the normal pointing up\n  vec3 globalLightL = normalize(-u_lightDirGlobal.direction);\n  float globalDiffuse = dot(vec3(0.0, 1.0, 0.0), globalLightL);\n\n  v_lighting += u_lightDirGlobal.colour * globalDiffuse;\n  v_lighting += u_lightDirGlobal.ambient;\n}\n";

// src/core/context.ts
var MAX_LIGHTS = 16;
var Context = class _Context {
  /** Constructor is private, use init() to create a new context */
  constructor(gl) {
    this.instances = [];
    this.instancesTrans = [];
    this.cameras = /* @__PURE__ */ new Map();
    /** All the dynamic point lights in the scene */
    this.lights = [];
    /**
     * The pre-render update function, called every frame.
     * Hook in your custom logic and processing here
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.update = () => {
    };
    /** Gamma correction value, default 1.0 */
    this.gamma = 1;
    this.gl = gl;
    this.started = false;
    this.debug = false;
    this.globalLight = new LightDirectional();
    this.globalLight.setAsPosition(20, 50, 30);
    const defaultCamera = new Camera(0 /* PERSPECTIVE */);
    this.cameras.set("default", defaultCamera);
    this._camera = defaultCamera;
    this.activeCameraName = "default";
    this.hud = new HUD(gl.canvas);
    this.debugDiv = document.createElement("div");
    this.debugDiv.classList.add("gsots3d-debug");
    this.debugDiv.style.fontSize = "min(1.5vw, 20px)";
    this.debugDiv.style.fontFamily = "monospace";
    this.debugDiv.style.color = "white";
    this.debugDiv.style.padding = "1vw";
    this.hud.addHUDItem(this.debugDiv);
    this.loadingDiv = document.createElement("div");
    this.loadingDiv.classList.add("gsots3d-loading");
    this.loadingDiv.innerHTML = "\u{1F4BE} Loading...";
    this.loadingDiv.style.font = "normal 4vw sans-serif";
    this.loadingDiv.style.color = "white";
    this.loadingDiv.style.position = "absolute";
    this.loadingDiv.style.top = "50%";
    this.loadingDiv.style.left = "50%";
    this.loadingDiv.style.transform = "translate(-50%, -50%)";
    this.hud.addHUDItem(this.loadingDiv);
    import_loglevel7.default.info(`\u{1F451} GSOTS-3D context created, v${version}`);
  }
  // ==== Getters =============================================================
  /** Get the active camera */
  get camera() {
    return this._camera;
  }
  /** Get the name of the active camera */
  get cameraName() {
    return this.activeCameraName;
  }
  /**
   * Create & initialize a new Context which will render into provided canvas selector. This is where you start when using the library.
   * @param canvasSelector CSS selector for canvas element, default is 'canvas'
   * @param antiAlias Enable anti-aliasing in GL, default is true
   */
  static async init(canvasSelector = "canvas", antiAlias = true) {
    const gl = getGl(antiAlias, canvasSelector);
    if (!gl) {
      import_loglevel7.default.error("\u{1F4A5} Failed to create WebGL context, this is extremely bad news");
      throw new Error("Failed to get WebGL context");
    }
    const ctx = new _Context(gl);
    const canvas = gl.canvas;
    ctx.camera.aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const phongProgInfo = createProgramInfo(gl, [glsl_default6, glsl_default5]);
    ProgramCache.init(phongProgInfo);
    ProgramCache.instance.add(ProgramCache.PROG_PHONG, phongProgInfo);
    ProgramCache.instance.add(ProgramCache.PROG_BILLBOARD, createProgramInfo(gl, [glsl_default8, glsl_default7]));
    import_loglevel7.default.info(`\u{1F3A8} Loaded all shaders & programs, GL is ready`);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    ctx.render = ctx.render.bind(ctx);
    TextureCache.init(gl);
    return ctx;
  }
  /**
   * Main render loop, called every frame
   * @param now Current time in milliseconds
   */
  async render(now) {
    if (!this.gl)
      return;
    stats.updateTime(now * 1e-3);
    this.update(stats.deltaTime);
    if (this.dynamicEnvMap) {
      this.dynamicEnvMap.update(this.gl, this);
    }
    const shadowCam = this.globalLight.getShadowCamera();
    if (shadowCam) {
      this.gl.cullFace(this.gl.FRONT);
      bindFramebufferInfo(this.gl, this.globalLight.shadowMapFrameBufffer);
      this.renderWithCamera(shadowCam, this.globalLight.shadowMapProgram);
      this.gl.cullFace(this.gl.BACK);
    }
    bindFramebufferInfo(this.gl, null);
    this.renderWithCamera(this.camera);
    if (this.debug) {
      this.debugDiv.innerHTML = `
        <b>GSOTS-3D v${version}</b><br><br>
        <b>Camera: </b>${this.camera.toString()}<br>
        <b>Instances: </b>${stats.instances}<br>
        <b>Draw calls: </b>${stats.drawCallsPerFrame}<br>
        <b>Triangles: </b>${stats.triangles}<br>
        <b>Render: </b>FPS: ${stats.FPS} / ${stats.totalTimeRound}s<br>
      `;
    } else {
      this.debugDiv.innerHTML = "";
    }
    if (this.started)
      requestAnimationFrame(this.render);
    stats.resetPerFrame();
  }
  /**
   * Render the scene from the given camera, used internally
   * @param camera
   */
  renderWithCamera(camera, programOverride) {
    if (!this.gl)
      return;
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    camera.update();
    const camMatrix = camera.matrix;
    let reflectMap = this.envmap?.texture ?? null;
    if (this.dynamicEnvMap) {
      if (!camera.usedForEnvMap) {
        reflectMap = this.dynamicEnvMap.texture;
      }
    }
    const uniforms = {
      u_gamma: this.gamma,
      u_worldInverseTranspose: mat4_exports.create(),
      // Updated per instance
      u_worldViewProjection: mat4_exports.create(),
      // Updated per instance
      u_view: mat4_exports.invert(mat4_exports.create(), camMatrix),
      u_proj: camera.projectionMatrix,
      u_camPos: camera.position,
      u_reflectionMap: reflectMap,
      u_shadowMap: this.globalLight.shadowMapTexture,
      u_shadowMatrix: this.globalLight.shadowMatrix ?? mat4_exports.create(),
      u_shadowScatter: this.globalLight.shadowMapOptions?.scatter ?? 0.2
    };
    if (this.envmap) {
      this.envmap.render(uniforms.u_view, uniforms.u_proj, camera);
    }
    uniforms.u_lightDirGlobal = this.globalLight.uniforms;
    if (this.lights.length > MAX_LIGHTS) {
      this.lights.sort((lightA, lightB) => {
        const ad = vec3_exports.distance(lightA.position, this.camera.position);
        const bd = vec3_exports.distance(lightB.position, this.camera.position);
        return ad - bd;
      });
    }
    let lightCount = 0;
    for (const light of this.lights) {
      if (lightCount >= MAX_LIGHTS)
        break;
      if (!light.enabled)
        continue;
      uniforms[`u_lightsPos[${lightCount++}]`] = light.uniforms;
    }
    uniforms.u_lightsPosCount = lightCount;
    this.gl.enable(this.gl.CULL_FACE);
    for (const instance of this.instances) {
      instance.render(this.gl, uniforms, programOverride);
    }
    this.gl.disable(this.gl.CULL_FACE);
    this.instancesTrans.sort((a, b) => {
      const ad = Tuples.distance(a.position ?? [0, 0, 0], this.camera.position);
      const bd = Tuples.distance(b.position ?? [0, 0, 0], this.camera.position);
      return bd - ad;
    });
    for (const instance of this.instancesTrans) {
      instance.render(this.gl, uniforms, programOverride);
    }
  }
  /**
   * Start the rendering loop
   */
  start() {
    this.loadingDiv.style.display = "none";
    this.started = true;
    requestAnimationFrame(this.render);
  }
  /**
   * Stop the rendering loop
   */
  stop() {
    this.started = false;
  }
  /**
   * Resize the canvas to match the size of the element it's in
   * @param viewportOnly - Only resize the viewport, not the canvas
   */
  resize(viewportOnly = false) {
    const canvas = this.gl.canvas;
    if (!viewportOnly)
      resizeCanvasToDisplaySize(canvas);
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.camera.aspectRatio = canvas.width / canvas.height;
    import_loglevel7.default.info(
      `\u{1F4D0} RESIZE Internal: ${canvas.width} x ${canvas.height}, display: ${canvas.clientWidth} x ${canvas.clientHeight}`
    );
  }
  /**
   * Internal function to add an instance to the scene
   */
  addInstance(instance, material) {
    if (material.opacity !== void 0 && material.opacity < 1) {
      this.instancesTrans.push(instance);
    } else {
      this.instances.push(instance);
    }
  }
  /**
   * Model loader, loads an OBJ model from a file via URL or path and adds it to the cache
   * This is preferred over calling Model.parse() directly
   * @param path Base path to the model file, e.g. './models/'
   * @param fileName Name of the model file, e.g 'teapot.obj'
   * @param filterTextures Apply texture filtering as materials are loaded
   * @param flipTextureY Flip the Y coordinate of the texture
   */
  async loadModel(path, fileName, filterTextures = true, flipY = false) {
    const modelName = fileName.split(".")[0];
    if (ModelCache.instance.get(modelName, false)) {
      import_loglevel7.default.warn(`\u26A0\uFE0F Model '${modelName}' already loaded, skipping`);
      return;
    }
    const model = await Model.parse(path, fileName, filterTextures, flipY, true);
    ModelCache.instance.add(model);
  }
  /**
   * Add a new camera to the scene
   * @param name Name of the camera
   * @param camera Camera instance
   */
  addCamera(name, camera) {
    this.cameras.set(name, camera);
  }
  getCamera(name) {
    return this.cameras.get(name);
  }
  /**
   * Set the active camera
   * @param name Name of the camera to set as active
   */
  setActiveCamera(name) {
    const camera = this.cameras.get(name);
    if (!camera) {
      throw new Error(`\u{1F4A5} Unable to set active camera to '${name}', camera not found`);
    }
    this.camera.active = false;
    this._camera = camera;
    this.camera.active = true;
    this.activeCameraName = name;
  }
  // ==========================================================================
  // Methods to create new instances of renderable objects & things
  // ==========================================================================
  /**
   * Create a new model instance, which should have been previously loaded into the cache
   * @param modelName - Name of the model previously loaded into the cache, don't include the file extension
   */
  createModelInstance(modelName) {
    const model = ModelCache.instance.get(modelName);
    if (!model) {
      throw new Error(`\u{1F4A5} Unable to create model instance for ${modelName}`);
    }
    const instance = new Instance(model);
    this.instances.push(instance);
    stats.triangles += model.triangleCount;
    stats.instances++;
    return instance;
  }
  /**
   * Create an instance of a primitive sphere
   * @param material - Material to apply to the sphere
   * @param radius - Radius of the sphere
   * @param subdivisionsH - Number of subdivisions along the horizontal
   * @param subdivisionsV - Number of subdivisions along the vertical
   */
  createSphereInstance(material, radius = 5, subdivisionsH = 16, subdivisionsV = 8) {
    const sphere = new PrimitiveSphere(this.gl, radius, subdivisionsH, subdivisionsV);
    sphere.material = material;
    const instance = new Instance(sphere);
    this.addInstance(instance, material);
    stats.triangles += sphere.triangleCount;
    stats.instances++;
    import_loglevel7.default.debug(`\u{1F7E2} Created sphere instance, r:${radius}`);
    return instance;
  }
  /**
   * Create an instance of a primitive plane
   * @param material - Material to apply to the plane
   * @param width - Width of the plane
   * @param height - Height of the plane
   * @param subdivisionsW - Number of subdivisions along the width
   * @param subdivisionsH - Number of subdivisions along the height
   * @param tiling - Number of times to tile the texture over the plane
   */
  createPlaneInstance(material, width = 5, height = 5, subdivisionsW = 1, subdivisionsH = 1, tiling = 1) {
    const plane = new PrimitivePlane(this.gl, width, height, subdivisionsW, subdivisionsH, tiling);
    plane.material = material;
    const instance = new Instance(plane);
    this.addInstance(instance, material);
    stats.triangles += plane.triangleCount;
    stats.instances++;
    import_loglevel7.default.debug(`\u{1F7E8} Created plane instance, w:${width} h:${height}`);
    return instance;
  }
  /**
   * Create an instance of a primitive cube
   */
  createCubeInstance(material, size = 5) {
    const cube = new PrimitiveCube(this.gl, size);
    cube.material = material;
    const instance = new Instance(cube);
    this.addInstance(instance, material);
    stats.triangles += cube.triangleCount;
    stats.instances++;
    import_loglevel7.default.debug(`\u{1F4E6} Created cube instance, size:${size}`);
    return instance;
  }
  /**
   * Create an instance of a primitive cylinder
   */
  createCylinderInstance(material, r = 2, h = 5, subdivisionsR = 16, subdivisionsH = 1, caps = true) {
    const cyl = new PrimitiveCylinder(this.gl, r, h, subdivisionsR, subdivisionsH, caps);
    cyl.material = material;
    const instance = new Instance(cyl);
    this.addInstance(instance, material);
    stats.triangles += cyl.triangleCount;
    stats.instances++;
    import_loglevel7.default.debug(`\u{1F6E2}\uFE0F Created cylinder instance, r:${r}`);
    return instance;
  }
  /**
   * Create an instance of a billboard/sprite in the scene
   * @param textureUrl - Path to the texture image file to use for the billboard
   * @param width - Width of the billboard (default: 5)
   * @param height - Height of the billboard (default: 5)
   * @param type - Type of billboard to create (default: CYLINDRICAL)
   */
  createBillboardInstance(material, size = 5, type = 1 /* CYLINDRICAL */) {
    const billboard = new Billboard(this.gl, type, material, size);
    const instance = new Instance(billboard);
    this.addInstance(instance, material);
    stats.triangles += 2;
    stats.instances++;
    import_loglevel7.default.debug(`\u{1F6A7} Created billboard instance of type: ${type} size: ${size}`);
    return instance;
  }
  /**
   * Create a new point light in the scene
   * @param position - Position of the light
   * @param colour - Colour of the light, defaults to white
   * @param intensity - Intensity of the light
   * @returns The new light object
   */
  createPointLight(position, colour = [1, 1, 1], intensity = 1) {
    const light = new LightPoint(position, colour);
    light.position = position;
    light.colour = colour;
    light.constant /= intensity;
    light.linear /= intensity;
    light.quad /= intensity;
    this.lights.push(light);
    import_loglevel7.default.debug(`\u{1F506} Created point light, pos:${position} col:${colour} int:${intensity}`);
    return light;
  }
  /**
   * Set the EnvironmentMap for the scene, will overwrite any existing envmap.
   * This will enable static reflections and create a 'skybox' around the scene
   * @param textureURLs - Array of 6 texture URLs to use for the map, in the order: +X, -X, +Y, -Y, +Z, -Z
   */
  setEnvmap(renderAsBackground = false, ...textureURLs) {
    this.envmap = new EnvironmentMap(this.gl, textureURLs);
    this.envmap.renderAsBackground = renderAsBackground;
  }
  /**
   * Remove any current EnvironmentMap from the scene
   */
  removeEnvmap() {
    this.envmap = void 0;
  }
  /**
   * Get the current EnvironmentMap for the scene
   */
  getEnvmap() {
    return this.envmap;
  }
  /**
   * Set and create a dynamic environment map which will enable dynamic/realtime reflections
   * @param position - Position to render reflections from
   * @param size - Size of the map to render, note higher sizes will come with a big performance hit
   */
  setDynamicEnvmap(position, size = 128, renderDistance = 500) {
    this.dynamicEnvMap = new DynamicEnvironmentMap(this.gl, size, position, renderDistance);
  }
};
export {
  Billboard,
  BillboardType,
  Camera,
  CameraType,
  Colours,
  Context,
  DynamicEnvironmentMap,
  EnvironmentMap,
  HUD,
  Instance,
  LightDirectional,
  LightPoint,
  Material,
  Model,
  ModelCache,
  ModelPart,
  PROG_BILLBOARD,
  PROG_DEFAULT,
  Primitive,
  PrimitiveCube,
  PrimitiveCylinder,
  PrimitivePlane,
  PrimitiveSphere,
  ProgramCache,
  TextureCache,
  Tuples,
  getGl,
  setLogLevel,
  stats
};
/*! Bundled license information:

twgl.js/dist/5.x/twgl-full.module.js:
  (* @license twgl.js 5.5.1 Copyright (c) 2015, Gregg Tavares All Rights Reserved.
  Available via the MIT license.
  see: http://github.com/greggman/twgl.js for details *)
*/
//# sourceMappingURL=gsots3d.js.map