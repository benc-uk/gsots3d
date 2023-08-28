var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb2, mod) => function __require() {
  return mod || (0, cb2[__getOwnPropNames(cb2)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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
function getGl(selector = "canvas", aa = true) {
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

// src/core/context.ts
var import_loglevel8 = __toESM(require_loglevel(), 1);

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
function add(a2, b2, dst) {
  dst = dst || new VecType(3);
  dst[0] = a2[0] + b2[0];
  dst[1] = a2[1] + b2[1];
  dst[2] = a2[2] + b2[2];
  return dst;
}
function multiply$1(a2, b2, dst) {
  dst = dst || new VecType(3);
  dst[0] = a2[0] * b2[0];
  dst[1] = a2[1] * b2[1];
  dst[2] = a2[2] * b2[2];
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
  const v02 = v[0];
  const v12 = v[1];
  const v22 = v[2];
  const d = v02 * m[0 * 4 + 3] + v12 * m[1 * 4 + 3] + v22 * m[2 * 4 + 3] + m[3 * 4 + 3];
  dst[0] = (v02 * m[0 * 4 + 0] + v12 * m[1 * 4 + 0] + v22 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d;
  dst[1] = (v02 * m[0 * 4 + 1] + v12 * m[1 * 4 + 1] + v22 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d;
  dst[2] = (v02 * m[0 * 4 + 2] + v12 * m[1 * 4 + 2] + v22 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d;
  return dst;
}
function transformDirection(m, v, dst) {
  dst = dst || create$1();
  const v02 = v[0];
  const v12 = v[1];
  const v22 = v[2];
  dst[0] = v02 * m[0 * 4 + 0] + v12 * m[1 * 4 + 0] + v22 * m[2 * 4 + 0];
  dst[1] = v02 * m[0 * 4 + 1] + v12 * m[1 * 4 + 1] + v22 * m[2 * 4 + 1];
  dst[2] = v02 * m[0 * 4 + 2] + v12 * m[1 * 4 + 2] + v22 * m[2 * 4 + 2];
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
var isArrayBuffer$1 = typeof SharedArrayBuffer !== "undefined" ? function isArrayBufferOrSharedArrayBuffer(a2) {
  return a2 && a2.buffer && (a2.buffer instanceof ArrayBuffer || a2.buffer instanceof SharedArrayBuffer);
} : function isArrayBuffer(a2) {
  return a2 && a2.buffer && a2.buffer instanceof ArrayBuffer;
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
function guessNumComponentsFromName(name, length5) {
  let numComponents;
  if (texcoordRE.test(name)) {
    numComponents = 2;
  } else if (colorRE.test(name)) {
    numComponents = 4;
  } else {
    numComponents = 3;
  }
  if (length5 % numComponents > 0) {
    throw new Error(`Can not guess numComponents for attribute '${name}'. Tried ${numComponents} but ${length5} values is not evenly divisible by ${numComponents}. You should specify it.`);
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
  const length5 = getArray$1(array).length;
  if (length5 === void 0) {
    return 1;
  }
  const numComponents = getNumComponents$1(array, key);
  const numElements = length5 / numComponents;
  if (length5 % numComponents > 0) {
    throw new Error(`numComponents ${numComponents} not correct for length ${length5}`);
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
    const length5 = Math.sqrt(nx * nx + ny * ny + nz * nz);
    nx /= length5;
    ny /= length5;
    nz /= length5;
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
  const len3 = array.length;
  const tmp2 = new Float32Array(3);
  for (let ii = 0; ii < len3; ii += 3) {
    fn(matrix, [array[ii], array[ii + 1], array[ii + 2]], tmp2);
    array[ii] = tmp2[0];
    array[ii + 1] = tmp2[1];
    array[ii + 2] = tmp2[2];
  }
}
function transformNormal(mi, v, dst) {
  dst = dst || create$1();
  const v02 = v[0];
  const v12 = v[1];
  const v22 = v[2];
  dst[0] = v02 * mi[0 * 4 + 0] + v12 * mi[0 * 4 + 1] + v22 * mi[0 * 4 + 2];
  dst[1] = v02 * mi[1 * 4 + 0] + v12 * mi[1 * 4 + 1] + v22 * mi[1 * 4 + 2];
  dst[2] = v02 * mi[2 * 4 + 0] + v12 * mi[2 * 4 + 1] + v22 * mi[2 * 4 + 2];
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
  function lerp4(a2, b2, s) {
    return a2 + (b2 - a2) * s;
  }
  function createArc(arcRadius, x, normalMult, normalAdd, uMult, uAdd) {
    for (let z = 0; z <= subdivisionsDown; z++) {
      const uBack = x / (subdivisionsThick - 1);
      const v = z / subdivisionsDown;
      const xBack = (uBack - 0.5) * 2;
      const angle2 = (startOffset + v * offsetRange) * Math.PI;
      const s = Math.sin(angle2);
      const c2 = Math.cos(angle2);
      const radius = lerp4(verticalRadius, arcRadius, s);
      const px = xBack * thickness;
      const py = c2 * verticalRadius;
      const pz = s * radius;
      positions.push(px, py, pz);
      const n = add(multiply$1([0, s, c2], normalMult), normalAdd);
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
        const a2 = firstIndex + (i + 1);
        const b2 = firstIndex + i;
        const c2 = firstIndex + i - pointsPerStack;
        const d = firstIndex + (i + 1) - pointsPerStack;
        indices.push(a2, b2, c2);
        indices.push(a2, c2, d);
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
  const length5 = src.length;
  for (let ii = 0; ii < length5; ++ii) {
    dst[dstNdx + ii] = src[ii] + offset;
  }
}
function createArrayOfSameType(srcArray, length5) {
  const arraySrc = getArray(srcArray);
  const newArray = new arraySrc.constructor(length5);
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
    let length5 = 0;
    let arraySpec;
    for (let ii = 0; ii < arrayOfArrays.length; ++ii) {
      const arrays = arrayOfArrays[ii];
      const arrayInfo = arrays[name];
      const array = getArray(arrayInfo);
      length5 += array.length;
      if (!arraySpec || arrayInfo.data) {
        arraySpec = arrayInfo;
      }
    }
    return {
      length: length5,
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
  facesWithNdx.sort(function(a2, b2) {
    return a2.face - b2.face;
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
    const a2 = document.createElement("a");
    a2.href = url;
    return a2.hostname === location.hostname && a2.port === location.port && a2.protocol === location.protocol;
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
    const cb2 = function cb3() {
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
      setTimeout(cb2);
    }).catch(function(e) {
      err = e;
      setTimeout(cb2);
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
var TRANSFORM_FEEDBACK_BUFFER = 35982;
var TRANSFORM_FEEDBACK = 36386;
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
  return function(b2) {
    if (b2.value) {
      gl.disableVertexAttribArray(index);
      switch (b2.value.length) {
        case 4:
          gl.vertexAttrib4fv(index, b2.value);
          break;
        case 3:
          gl.vertexAttrib3fv(index, b2.value);
          break;
        case 2:
          gl.vertexAttrib2fv(index, b2.value);
          break;
        case 1:
          gl.vertexAttrib1fv(index, b2.value);
          break;
        default:
          throw new Error("the length of a float constant value must be between 1 and 4!");
      }
    } else {
      gl.bindBuffer(ARRAY_BUFFER, b2.buffer);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribPointer(
        index,
        b2.numComponents || b2.size,
        b2.type || FLOAT,
        b2.normalize || false,
        b2.stride || 0,
        b2.offset || 0
      );
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index, b2.divisor || 0);
      }
    }
  };
}
function intAttribSetter(gl, index) {
  return function(b2) {
    if (b2.value) {
      gl.disableVertexAttribArray(index);
      if (b2.value.length === 4) {
        gl.vertexAttrib4iv(index, b2.value);
      } else {
        throw new Error("The length of an integer constant value must be 4!");
      }
    } else {
      gl.bindBuffer(ARRAY_BUFFER, b2.buffer);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribIPointer(
        index,
        b2.numComponents || b2.size,
        b2.type || INT,
        b2.stride || 0,
        b2.offset || 0
      );
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index, b2.divisor || 0);
      }
    }
  };
}
function uintAttribSetter(gl, index) {
  return function(b2) {
    if (b2.value) {
      gl.disableVertexAttribArray(index);
      if (b2.value.length === 4) {
        gl.vertexAttrib4uiv(index, b2.value);
      } else {
        throw new Error("The length of an unsigned integer constant value must be 4!");
      }
    } else {
      gl.bindBuffer(ARRAY_BUFFER, b2.buffer);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribIPointer(
        index,
        b2.numComponents || b2.size,
        b2.type || UNSIGNED_INT,
        b2.stride || 0,
        b2.offset || 0
      );
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index, b2.divisor || 0);
      }
    }
  };
}
function matAttribSetter(gl, index, typeInfo) {
  const defaultSize = typeInfo.size;
  const count = typeInfo.count;
  return function(b2) {
    gl.bindBuffer(ARRAY_BUFFER, b2.buffer);
    const numComponents = b2.size || b2.numComponents || defaultSize;
    const size = numComponents / count;
    const type = b2.type || FLOAT;
    const typeInfo2 = typeMap[type];
    const stride = typeInfo2.size * numComponents;
    const normalize5 = b2.normalize || false;
    const offset = b2.offset || 0;
    const rowOffset = stride / count;
    for (let i = 0; i < count; ++i) {
      gl.enableVertexAttribArray(index + i);
      gl.vertexAttribPointer(
        index + i,
        size,
        type,
        normalize5,
        stride,
        offset + rowOffset * i
      );
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index + i, b2.divisor || 0);
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
function addLineNumbersWithError(src, log9 = "", lineOffset = 0) {
  const matches = [...log9.matchAll(errorRE)];
  const lineNoToErrorMap = new Map(matches.map((m, ndx) => {
    const lineNo = parseInt(m[1]);
    const next = matches[ndx + 1];
    const end = next ? next.index : log9.length;
    const msg = log9.substring(m.index, end);
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
function bindTransformFeedbackInfo(gl, transformFeedbackInfo, bufferInfo) {
  if (transformFeedbackInfo.transformFeedbackInfo) {
    transformFeedbackInfo = transformFeedbackInfo.transformFeedbackInfo;
  }
  if (bufferInfo.attribs) {
    bufferInfo = bufferInfo.attribs;
  }
  for (const name in bufferInfo) {
    const varying = transformFeedbackInfo[name];
    if (varying) {
      const buf = bufferInfo[name];
      if (buf.offset) {
        gl.bindBufferRange(TRANSFORM_FEEDBACK_BUFFER, varying.index, buf.buffer, buf.offset, buf.size);
      } else {
        gl.bindBufferBase(TRANSFORM_FEEDBACK_BUFFER, varying.index, buf.buffer);
      }
    }
  }
}
function createTransformFeedback(gl, programInfo, bufferInfo) {
  const tf = gl.createTransformFeedback();
  gl.bindTransformFeedback(TRANSFORM_FEEDBACK, tf);
  gl.useProgram(programInfo.program);
  bindTransformFeedbackInfo(gl, programInfo, bufferInfo);
  gl.bindTransformFeedback(TRANSFORM_FEEDBACK, null);
  return tf;
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
function drawObjectList(gl, objectsToDraw) {
  let lastUsedProgramInfo = null;
  let lastUsedBufferInfo = null;
  objectsToDraw.forEach(function(object) {
    if (object.active === false) {
      return;
    }
    const programInfo = object.programInfo;
    const bufferInfo = object.vertexArrayInfo || object.bufferInfo;
    let bindBuffers = false;
    const type = object.type === void 0 ? TRIANGLES : object.type;
    if (programInfo !== lastUsedProgramInfo) {
      lastUsedProgramInfo = programInfo;
      gl.useProgram(programInfo.program);
      bindBuffers = true;
    }
    if (bindBuffers || bufferInfo !== lastUsedBufferInfo) {
      if (lastUsedBufferInfo && lastUsedBufferInfo.vertexArrayObject && !bufferInfo.vertexArrayObject) {
        gl.bindVertexArray(null);
      }
      lastUsedBufferInfo = bufferInfo;
      setBuffersAndAttributes(gl, programInfo, bufferInfo);
    }
    setUniforms(programInfo, object.uniforms);
    drawBufferInfo(gl, bufferInfo, type, object.count, object.offset, object.instanceCount);
  });
  if (lastUsedBufferInfo && lastUsedBufferInfo.vertexArrayObject) {
    gl.bindVertexArray(null);
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
function createVertexArrayInfo(gl, programInfos, bufferInfo) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  if (!programInfos.length) {
    programInfos = [programInfos];
  }
  programInfos.forEach(function(programInfo) {
    setBuffersAndAttributes(gl, programInfo, bufferInfo);
  });
  gl.bindVertexArray(null);
  return {
    numElements: bufferInfo.numElements,
    elementType: bufferInfo.elementType,
    vertexArrayObject: vao
  };
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

// node_modules/gl-matrix/esm/mat3.js
function create() {
  var out = new ARRAY_TYPE(9);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }
  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}

// node_modules/gl-matrix/esm/mat4.js
var mat4_exports = {};
__export(mat4_exports, {
  add: () => add2,
  adjoint: () => adjoint,
  clone: () => clone,
  copy: () => copy,
  create: () => create2,
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
function create2() {
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
function clone(a2) {
  var out = new ARRAY_TYPE(16);
  out[0] = a2[0];
  out[1] = a2[1];
  out[2] = a2[2];
  out[3] = a2[3];
  out[4] = a2[4];
  out[5] = a2[5];
  out[6] = a2[6];
  out[7] = a2[7];
  out[8] = a2[8];
  out[9] = a2[9];
  out[10] = a2[10];
  out[11] = a2[11];
  out[12] = a2[12];
  out[13] = a2[13];
  out[14] = a2[14];
  out[15] = a2[15];
  return out;
}
function copy(out, a2) {
  out[0] = a2[0];
  out[1] = a2[1];
  out[2] = a2[2];
  out[3] = a2[3];
  out[4] = a2[4];
  out[5] = a2[5];
  out[6] = a2[6];
  out[7] = a2[7];
  out[8] = a2[8];
  out[9] = a2[9];
  out[10] = a2[10];
  out[11] = a2[11];
  out[12] = a2[12];
  out[13] = a2[13];
  out[14] = a2[14];
  out[15] = a2[15];
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
function transpose(out, a2) {
  if (out === a2) {
    var a01 = a2[1], a02 = a2[2], a03 = a2[3];
    var a12 = a2[6], a13 = a2[7];
    var a23 = a2[11];
    out[1] = a2[4];
    out[2] = a2[8];
    out[3] = a2[12];
    out[4] = a01;
    out[6] = a2[9];
    out[7] = a2[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a2[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a2[0];
    out[1] = a2[4];
    out[2] = a2[8];
    out[3] = a2[12];
    out[4] = a2[1];
    out[5] = a2[5];
    out[6] = a2[9];
    out[7] = a2[13];
    out[8] = a2[2];
    out[9] = a2[6];
    out[10] = a2[10];
    out[11] = a2[14];
    out[12] = a2[3];
    out[13] = a2[7];
    out[14] = a2[11];
    out[15] = a2[15];
  }
  return out;
}
function invert(out, a2) {
  var a00 = a2[0], a01 = a2[1], a02 = a2[2], a03 = a2[3];
  var a10 = a2[4], a11 = a2[5], a12 = a2[6], a13 = a2[7];
  var a20 = a2[8], a21 = a2[9], a22 = a2[10], a23 = a2[11];
  var a30 = a2[12], a31 = a2[13], a32 = a2[14], a33 = a2[15];
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
function adjoint(out, a2) {
  var a00 = a2[0], a01 = a2[1], a02 = a2[2], a03 = a2[3];
  var a10 = a2[4], a11 = a2[5], a12 = a2[6], a13 = a2[7];
  var a20 = a2[8], a21 = a2[9], a22 = a2[10], a23 = a2[11];
  var a30 = a2[12], a31 = a2[13], a32 = a2[14], a33 = a2[15];
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
function determinant(a2) {
  var a00 = a2[0], a01 = a2[1], a02 = a2[2], a03 = a2[3];
  var a10 = a2[4], a11 = a2[5], a12 = a2[6], a13 = a2[7];
  var a20 = a2[8], a21 = a2[9], a22 = a2[10], a23 = a2[11];
  var a30 = a2[12], a31 = a2[13], a32 = a2[14], a33 = a2[15];
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
function multiply(out, a2, b2) {
  var a00 = a2[0], a01 = a2[1], a02 = a2[2], a03 = a2[3];
  var a10 = a2[4], a11 = a2[5], a12 = a2[6], a13 = a2[7];
  var a20 = a2[8], a21 = a2[9], a22 = a2[10], a23 = a2[11];
  var a30 = a2[12], a31 = a2[13], a32 = a2[14], a33 = a2[15];
  var b0 = b2[0], b1 = b2[1], b22 = b2[2], b3 = b2[3];
  out[0] = b0 * a00 + b1 * a10 + b22 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b22 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b22 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b22 * a23 + b3 * a33;
  b0 = b2[4];
  b1 = b2[5];
  b22 = b2[6];
  b3 = b2[7];
  out[4] = b0 * a00 + b1 * a10 + b22 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b22 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b22 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b22 * a23 + b3 * a33;
  b0 = b2[8];
  b1 = b2[9];
  b22 = b2[10];
  b3 = b2[11];
  out[8] = b0 * a00 + b1 * a10 + b22 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b22 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b22 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b22 * a23 + b3 * a33;
  b0 = b2[12];
  b1 = b2[13];
  b22 = b2[14];
  b3 = b2[15];
  out[12] = b0 * a00 + b1 * a10 + b22 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b22 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b22 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b22 * a23 + b3 * a33;
  return out;
}
function translate(out, a2, v) {
  var x = v[0], y = v[1], z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  if (a2 === out) {
    out[12] = a2[0] * x + a2[4] * y + a2[8] * z + a2[12];
    out[13] = a2[1] * x + a2[5] * y + a2[9] * z + a2[13];
    out[14] = a2[2] * x + a2[6] * y + a2[10] * z + a2[14];
    out[15] = a2[3] * x + a2[7] * y + a2[11] * z + a2[15];
  } else {
    a00 = a2[0];
    a01 = a2[1];
    a02 = a2[2];
    a03 = a2[3];
    a10 = a2[4];
    a11 = a2[5];
    a12 = a2[6];
    a13 = a2[7];
    a20 = a2[8];
    a21 = a2[9];
    a22 = a2[10];
    a23 = a2[11];
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
    out[12] = a00 * x + a10 * y + a20 * z + a2[12];
    out[13] = a01 * x + a11 * y + a21 * z + a2[13];
    out[14] = a02 * x + a12 * y + a22 * z + a2[14];
    out[15] = a03 * x + a13 * y + a23 * z + a2[15];
  }
  return out;
}
function scale(out, a2, v) {
  var x = v[0], y = v[1], z = v[2];
  out[0] = a2[0] * x;
  out[1] = a2[1] * x;
  out[2] = a2[2] * x;
  out[3] = a2[3] * x;
  out[4] = a2[4] * y;
  out[5] = a2[5] * y;
  out[6] = a2[6] * y;
  out[7] = a2[7] * y;
  out[8] = a2[8] * z;
  out[9] = a2[9] * z;
  out[10] = a2[10] * z;
  out[11] = a2[11] * z;
  out[12] = a2[12];
  out[13] = a2[13];
  out[14] = a2[14];
  out[15] = a2[15];
  return out;
}
function rotate(out, a2, rad, axis) {
  var x = axis[0], y = axis[1], z = axis[2];
  var len3 = Math.hypot(x, y, z);
  var s, c2, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;
  if (len3 < EPSILON) {
    return null;
  }
  len3 = 1 / len3;
  x *= len3;
  y *= len3;
  z *= len3;
  s = Math.sin(rad);
  c2 = Math.cos(rad);
  t = 1 - c2;
  a00 = a2[0];
  a01 = a2[1];
  a02 = a2[2];
  a03 = a2[3];
  a10 = a2[4];
  a11 = a2[5];
  a12 = a2[6];
  a13 = a2[7];
  a20 = a2[8];
  a21 = a2[9];
  a22 = a2[10];
  a23 = a2[11];
  b00 = x * x * t + c2;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c2;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c2;
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
  if (a2 !== out) {
    out[12] = a2[12];
    out[13] = a2[13];
    out[14] = a2[14];
    out[15] = a2[15];
  }
  return out;
}
function rotateX(out, a2, rad) {
  var s = Math.sin(rad);
  var c2 = Math.cos(rad);
  var a10 = a2[4];
  var a11 = a2[5];
  var a12 = a2[6];
  var a13 = a2[7];
  var a20 = a2[8];
  var a21 = a2[9];
  var a22 = a2[10];
  var a23 = a2[11];
  if (a2 !== out) {
    out[0] = a2[0];
    out[1] = a2[1];
    out[2] = a2[2];
    out[3] = a2[3];
    out[12] = a2[12];
    out[13] = a2[13];
    out[14] = a2[14];
    out[15] = a2[15];
  }
  out[4] = a10 * c2 + a20 * s;
  out[5] = a11 * c2 + a21 * s;
  out[6] = a12 * c2 + a22 * s;
  out[7] = a13 * c2 + a23 * s;
  out[8] = a20 * c2 - a10 * s;
  out[9] = a21 * c2 - a11 * s;
  out[10] = a22 * c2 - a12 * s;
  out[11] = a23 * c2 - a13 * s;
  return out;
}
function rotateY(out, a2, rad) {
  var s = Math.sin(rad);
  var c2 = Math.cos(rad);
  var a00 = a2[0];
  var a01 = a2[1];
  var a02 = a2[2];
  var a03 = a2[3];
  var a20 = a2[8];
  var a21 = a2[9];
  var a22 = a2[10];
  var a23 = a2[11];
  if (a2 !== out) {
    out[4] = a2[4];
    out[5] = a2[5];
    out[6] = a2[6];
    out[7] = a2[7];
    out[12] = a2[12];
    out[13] = a2[13];
    out[14] = a2[14];
    out[15] = a2[15];
  }
  out[0] = a00 * c2 - a20 * s;
  out[1] = a01 * c2 - a21 * s;
  out[2] = a02 * c2 - a22 * s;
  out[3] = a03 * c2 - a23 * s;
  out[8] = a00 * s + a20 * c2;
  out[9] = a01 * s + a21 * c2;
  out[10] = a02 * s + a22 * c2;
  out[11] = a03 * s + a23 * c2;
  return out;
}
function rotateZ(out, a2, rad) {
  var s = Math.sin(rad);
  var c2 = Math.cos(rad);
  var a00 = a2[0];
  var a01 = a2[1];
  var a02 = a2[2];
  var a03 = a2[3];
  var a10 = a2[4];
  var a11 = a2[5];
  var a12 = a2[6];
  var a13 = a2[7];
  if (a2 !== out) {
    out[8] = a2[8];
    out[9] = a2[9];
    out[10] = a2[10];
    out[11] = a2[11];
    out[12] = a2[12];
    out[13] = a2[13];
    out[14] = a2[14];
    out[15] = a2[15];
  }
  out[0] = a00 * c2 + a10 * s;
  out[1] = a01 * c2 + a11 * s;
  out[2] = a02 * c2 + a12 * s;
  out[3] = a03 * c2 + a13 * s;
  out[4] = a10 * c2 - a00 * s;
  out[5] = a11 * c2 - a01 * s;
  out[6] = a12 * c2 - a02 * s;
  out[7] = a13 * c2 - a03 * s;
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
  var len3 = Math.hypot(x, y, z);
  var s, c2, t;
  if (len3 < EPSILON) {
    return null;
  }
  len3 = 1 / len3;
  x *= len3;
  y *= len3;
  z *= len3;
  s = Math.sin(rad);
  c2 = Math.cos(rad);
  t = 1 - c2;
  out[0] = x * x * t + c2;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c2;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c2;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c2 = Math.cos(rad);
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c2;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c2;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c2 = Math.cos(rad);
  out[0] = c2;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c2;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c2 = Math.cos(rad);
  out[0] = c2;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c2;
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
function fromQuat2(out, a2) {
  var translation = new ARRAY_TYPE(3);
  var bx = -a2[0], by = -a2[1], bz = -a2[2], bw = a2[3], ax = a2[4], ay = a2[5], az = a2[6], aw = a2[7];
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
  fromRotationTranslation(out, a2, translation);
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
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len3;
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
  len3 = 1 / Math.hypot(z0, z1, z2);
  z0 *= len3;
  z1 *= len3;
  z2 *= len3;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len3 = Math.hypot(x0, x1, x2);
  if (!len3) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len3 = 1 / len3;
    x0 *= len3;
    x1 *= len3;
    x2 *= len3;
  }
  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len3 = Math.hypot(y0, y1, y2);
  if (!len3) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len3 = 1 / len3;
    y0 *= len3;
    y1 *= len3;
    y2 *= len3;
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
  var len3 = z0 * z0 + z1 * z1 + z2 * z2;
  if (len3 > 0) {
    len3 = 1 / Math.sqrt(len3);
    z0 *= len3;
    z1 *= len3;
    z2 *= len3;
  }
  var x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
  len3 = x0 * x0 + x1 * x1 + x2 * x2;
  if (len3 > 0) {
    len3 = 1 / Math.sqrt(len3);
    x0 *= len3;
    x1 *= len3;
    x2 *= len3;
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
function str(a2) {
  return "mat4(" + a2[0] + ", " + a2[1] + ", " + a2[2] + ", " + a2[3] + ", " + a2[4] + ", " + a2[5] + ", " + a2[6] + ", " + a2[7] + ", " + a2[8] + ", " + a2[9] + ", " + a2[10] + ", " + a2[11] + ", " + a2[12] + ", " + a2[13] + ", " + a2[14] + ", " + a2[15] + ")";
}
function frob(a2) {
  return Math.hypot(a2[0], a2[1], a2[2], a2[3], a2[4], a2[5], a2[6], a2[7], a2[8], a2[9], a2[10], a2[11], a2[12], a2[13], a2[14], a2[15]);
}
function add2(out, a2, b2) {
  out[0] = a2[0] + b2[0];
  out[1] = a2[1] + b2[1];
  out[2] = a2[2] + b2[2];
  out[3] = a2[3] + b2[3];
  out[4] = a2[4] + b2[4];
  out[5] = a2[5] + b2[5];
  out[6] = a2[6] + b2[6];
  out[7] = a2[7] + b2[7];
  out[8] = a2[8] + b2[8];
  out[9] = a2[9] + b2[9];
  out[10] = a2[10] + b2[10];
  out[11] = a2[11] + b2[11];
  out[12] = a2[12] + b2[12];
  out[13] = a2[13] + b2[13];
  out[14] = a2[14] + b2[14];
  out[15] = a2[15] + b2[15];
  return out;
}
function subtract(out, a2, b2) {
  out[0] = a2[0] - b2[0];
  out[1] = a2[1] - b2[1];
  out[2] = a2[2] - b2[2];
  out[3] = a2[3] - b2[3];
  out[4] = a2[4] - b2[4];
  out[5] = a2[5] - b2[5];
  out[6] = a2[6] - b2[6];
  out[7] = a2[7] - b2[7];
  out[8] = a2[8] - b2[8];
  out[9] = a2[9] - b2[9];
  out[10] = a2[10] - b2[10];
  out[11] = a2[11] - b2[11];
  out[12] = a2[12] - b2[12];
  out[13] = a2[13] - b2[13];
  out[14] = a2[14] - b2[14];
  out[15] = a2[15] - b2[15];
  return out;
}
function multiplyScalar(out, a2, b2) {
  out[0] = a2[0] * b2;
  out[1] = a2[1] * b2;
  out[2] = a2[2] * b2;
  out[3] = a2[3] * b2;
  out[4] = a2[4] * b2;
  out[5] = a2[5] * b2;
  out[6] = a2[6] * b2;
  out[7] = a2[7] * b2;
  out[8] = a2[8] * b2;
  out[9] = a2[9] * b2;
  out[10] = a2[10] * b2;
  out[11] = a2[11] * b2;
  out[12] = a2[12] * b2;
  out[13] = a2[13] * b2;
  out[14] = a2[14] * b2;
  out[15] = a2[15] * b2;
  return out;
}
function multiplyScalarAndAdd(out, a2, b2, scale6) {
  out[0] = a2[0] + b2[0] * scale6;
  out[1] = a2[1] + b2[1] * scale6;
  out[2] = a2[2] + b2[2] * scale6;
  out[3] = a2[3] + b2[3] * scale6;
  out[4] = a2[4] + b2[4] * scale6;
  out[5] = a2[5] + b2[5] * scale6;
  out[6] = a2[6] + b2[6] * scale6;
  out[7] = a2[7] + b2[7] * scale6;
  out[8] = a2[8] + b2[8] * scale6;
  out[9] = a2[9] + b2[9] * scale6;
  out[10] = a2[10] + b2[10] * scale6;
  out[11] = a2[11] + b2[11] * scale6;
  out[12] = a2[12] + b2[12] * scale6;
  out[13] = a2[13] + b2[13] * scale6;
  out[14] = a2[14] + b2[14] * scale6;
  out[15] = a2[15] + b2[15] * scale6;
  return out;
}
function exactEquals(a2, b2) {
  return a2[0] === b2[0] && a2[1] === b2[1] && a2[2] === b2[2] && a2[3] === b2[3] && a2[4] === b2[4] && a2[5] === b2[5] && a2[6] === b2[6] && a2[7] === b2[7] && a2[8] === b2[8] && a2[9] === b2[9] && a2[10] === b2[10] && a2[11] === b2[11] && a2[12] === b2[12] && a2[13] === b2[13] && a2[14] === b2[14] && a2[15] === b2[15];
}
function equals(a2, b2) {
  var a0 = a2[0], a1 = a2[1], a22 = a2[2], a3 = a2[3];
  var a4 = a2[4], a5 = a2[5], a6 = a2[6], a7 = a2[7];
  var a8 = a2[8], a9 = a2[9], a10 = a2[10], a11 = a2[11];
  var a12 = a2[12], a13 = a2[13], a14 = a2[14], a15 = a2[15];
  var b0 = b2[0], b1 = b2[1], b22 = b2[2], b3 = b2[3];
  var b4 = b2[4], b5 = b2[5], b6 = b2[6], b7 = b2[7];
  var b8 = b2[8], b9 = b2[9], b10 = b2[10], b11 = b2[11];
  var b12 = b2[12], b13 = b2[13], b14 = b2[14], b15 = b2[15];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a22 - b22) <= EPSILON * Math.max(1, Math.abs(a22), Math.abs(b22)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= EPSILON * Math.max(1, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= EPSILON * Math.max(1, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= EPSILON * Math.max(1, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= EPSILON * Math.max(1, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= EPSILON * Math.max(1, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= EPSILON * Math.max(1, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= EPSILON * Math.max(1, Math.abs(a15), Math.abs(b15));
}
var mul = multiply;
var sub = subtract;

// node_modules/gl-matrix/esm/quat.js
var quat_exports = {};
__export(quat_exports, {
  add: () => add5,
  calculateW: () => calculateW,
  clone: () => clone4,
  conjugate: () => conjugate,
  copy: () => copy4,
  create: () => create5,
  dot: () => dot3,
  equals: () => equals4,
  exactEquals: () => exactEquals4,
  exp: () => exp,
  fromEuler: () => fromEuler,
  fromMat3: () => fromMat3,
  fromValues: () => fromValues4,
  getAngle: () => getAngle,
  getAxisAngle: () => getAxisAngle,
  identity: () => identity3,
  invert: () => invert2,
  len: () => len2,
  length: () => length4,
  lerp: () => lerp3,
  ln: () => ln,
  mul: () => mul3,
  multiply: () => multiply3,
  normalize: () => normalize3,
  pow: () => pow,
  random: () => random2,
  rotateX: () => rotateX3,
  rotateY: () => rotateY3,
  rotateZ: () => rotateZ3,
  rotationTo: () => rotationTo,
  scale: () => scale4,
  set: () => set4,
  setAxes: () => setAxes,
  setAxisAngle: () => setAxisAngle,
  slerp: () => slerp,
  sqlerp: () => sqlerp,
  sqrLen: () => sqrLen2,
  squaredLength: () => squaredLength3,
  str: () => str3
});

// node_modules/gl-matrix/esm/vec3.js
var vec3_exports = {};
__export(vec3_exports, {
  add: () => add3,
  angle: () => angle,
  bezier: () => bezier,
  ceil: () => ceil,
  clone: () => clone2,
  copy: () => copy2,
  create: () => create3,
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
function create3() {
  var out = new ARRAY_TYPE(3);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  return out;
}
function clone2(a2) {
  var out = new ARRAY_TYPE(3);
  out[0] = a2[0];
  out[1] = a2[1];
  out[2] = a2[2];
  return out;
}
function length2(a2) {
  var x = a2[0];
  var y = a2[1];
  var z = a2[2];
  return Math.hypot(x, y, z);
}
function fromValues2(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function copy2(out, a2) {
  out[0] = a2[0];
  out[1] = a2[1];
  out[2] = a2[2];
  return out;
}
function set2(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function add3(out, a2, b2) {
  out[0] = a2[0] + b2[0];
  out[1] = a2[1] + b2[1];
  out[2] = a2[2] + b2[2];
  return out;
}
function subtract2(out, a2, b2) {
  out[0] = a2[0] - b2[0];
  out[1] = a2[1] - b2[1];
  out[2] = a2[2] - b2[2];
  return out;
}
function multiply2(out, a2, b2) {
  out[0] = a2[0] * b2[0];
  out[1] = a2[1] * b2[1];
  out[2] = a2[2] * b2[2];
  return out;
}
function divide(out, a2, b2) {
  out[0] = a2[0] / b2[0];
  out[1] = a2[1] / b2[1];
  out[2] = a2[2] / b2[2];
  return out;
}
function ceil(out, a2) {
  out[0] = Math.ceil(a2[0]);
  out[1] = Math.ceil(a2[1]);
  out[2] = Math.ceil(a2[2]);
  return out;
}
function floor(out, a2) {
  out[0] = Math.floor(a2[0]);
  out[1] = Math.floor(a2[1]);
  out[2] = Math.floor(a2[2]);
  return out;
}
function min(out, a2, b2) {
  out[0] = Math.min(a2[0], b2[0]);
  out[1] = Math.min(a2[1], b2[1]);
  out[2] = Math.min(a2[2], b2[2]);
  return out;
}
function max(out, a2, b2) {
  out[0] = Math.max(a2[0], b2[0]);
  out[1] = Math.max(a2[1], b2[1]);
  out[2] = Math.max(a2[2], b2[2]);
  return out;
}
function round(out, a2) {
  out[0] = Math.round(a2[0]);
  out[1] = Math.round(a2[1]);
  out[2] = Math.round(a2[2]);
  return out;
}
function scale2(out, a2, b2) {
  out[0] = a2[0] * b2;
  out[1] = a2[1] * b2;
  out[2] = a2[2] * b2;
  return out;
}
function scaleAndAdd(out, a2, b2, scale6) {
  out[0] = a2[0] + b2[0] * scale6;
  out[1] = a2[1] + b2[1] * scale6;
  out[2] = a2[2] + b2[2] * scale6;
  return out;
}
function distance(a2, b2) {
  var x = b2[0] - a2[0];
  var y = b2[1] - a2[1];
  var z = b2[2] - a2[2];
  return Math.hypot(x, y, z);
}
function squaredDistance(a2, b2) {
  var x = b2[0] - a2[0];
  var y = b2[1] - a2[1];
  var z = b2[2] - a2[2];
  return x * x + y * y + z * z;
}
function squaredLength(a2) {
  var x = a2[0];
  var y = a2[1];
  var z = a2[2];
  return x * x + y * y + z * z;
}
function negate(out, a2) {
  out[0] = -a2[0];
  out[1] = -a2[1];
  out[2] = -a2[2];
  return out;
}
function inverse2(out, a2) {
  out[0] = 1 / a2[0];
  out[1] = 1 / a2[1];
  out[2] = 1 / a2[2];
  return out;
}
function normalize(out, a2) {
  var x = a2[0];
  var y = a2[1];
  var z = a2[2];
  var len3 = x * x + y * y + z * z;
  if (len3 > 0) {
    len3 = 1 / Math.sqrt(len3);
  }
  out[0] = a2[0] * len3;
  out[1] = a2[1] * len3;
  out[2] = a2[2] * len3;
  return out;
}
function dot(a2, b2) {
  return a2[0] * b2[0] + a2[1] * b2[1] + a2[2] * b2[2];
}
function cross(out, a2, b2) {
  var ax = a2[0], ay = a2[1], az = a2[2];
  var bx = b2[0], by = b2[1], bz = b2[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
function lerp(out, a2, b2, t) {
  var ax = a2[0];
  var ay = a2[1];
  var az = a2[2];
  out[0] = ax + t * (b2[0] - ax);
  out[1] = ay + t * (b2[1] - ay);
  out[2] = az + t * (b2[2] - az);
  return out;
}
function hermite(out, a2, b2, c2, d, t) {
  var factorTimes2 = t * t;
  var factor1 = factorTimes2 * (2 * t - 3) + 1;
  var factor2 = factorTimes2 * (t - 2) + t;
  var factor3 = factorTimes2 * (t - 1);
  var factor4 = factorTimes2 * (3 - 2 * t);
  out[0] = a2[0] * factor1 + b2[0] * factor2 + c2[0] * factor3 + d[0] * factor4;
  out[1] = a2[1] * factor1 + b2[1] * factor2 + c2[1] * factor3 + d[1] * factor4;
  out[2] = a2[2] * factor1 + b2[2] * factor2 + c2[2] * factor3 + d[2] * factor4;
  return out;
}
function bezier(out, a2, b2, c2, d, t) {
  var inverseFactor = 1 - t;
  var inverseFactorTimesTwo = inverseFactor * inverseFactor;
  var factorTimes2 = t * t;
  var factor1 = inverseFactorTimesTwo * inverseFactor;
  var factor2 = 3 * t * inverseFactorTimesTwo;
  var factor3 = 3 * factorTimes2 * inverseFactor;
  var factor4 = factorTimes2 * t;
  out[0] = a2[0] * factor1 + b2[0] * factor2 + c2[0] * factor3 + d[0] * factor4;
  out[1] = a2[1] * factor1 + b2[1] * factor2 + c2[1] * factor3 + d[1] * factor4;
  out[2] = a2[2] * factor1 + b2[2] * factor2 + c2[2] * factor3 + d[2] * factor4;
  return out;
}
function random(out, scale6) {
  scale6 = scale6 || 1;
  var r = RANDOM() * 2 * Math.PI;
  var z = RANDOM() * 2 - 1;
  var zScale = Math.sqrt(1 - z * z) * scale6;
  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z * scale6;
  return out;
}
function transformMat4(out, a2, m) {
  var x = a2[0], y = a2[1], z = a2[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
function transformMat3(out, a2, m) {
  var x = a2[0], y = a2[1], z = a2[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}
function transformQuat(out, a2, q) {
  var qx = q[0], qy = q[1], qz = q[2], qw = q[3];
  var x = a2[0], y = a2[1], z = a2[2];
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
function rotateX2(out, a2, b2, rad) {
  var p = [], r = [];
  p[0] = a2[0] - b2[0];
  p[1] = a2[1] - b2[1];
  p[2] = a2[2] - b2[2];
  r[0] = p[0];
  r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
  r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad);
  out[0] = r[0] + b2[0];
  out[1] = r[1] + b2[1];
  out[2] = r[2] + b2[2];
  return out;
}
function rotateY2(out, a2, b2, rad) {
  var p = [], r = [];
  p[0] = a2[0] - b2[0];
  p[1] = a2[1] - b2[1];
  p[2] = a2[2] - b2[2];
  r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad);
  out[0] = r[0] + b2[0];
  out[1] = r[1] + b2[1];
  out[2] = r[2] + b2[2];
  return out;
}
function rotateZ2(out, a2, b2, rad) {
  var p = [], r = [];
  p[0] = a2[0] - b2[0];
  p[1] = a2[1] - b2[1];
  p[2] = a2[2] - b2[2];
  r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
  r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
  r[2] = p[2];
  out[0] = r[0] + b2[0];
  out[1] = r[1] + b2[1];
  out[2] = r[2] + b2[2];
  return out;
}
function angle(a2, b2) {
  var ax = a2[0], ay = a2[1], az = a2[2], bx = b2[0], by = b2[1], bz = b2[2], mag1 = Math.sqrt(ax * ax + ay * ay + az * az), mag2 = Math.sqrt(bx * bx + by * by + bz * bz), mag = mag1 * mag2, cosine = mag && dot(a2, b2) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
function zero(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  return out;
}
function str2(a2) {
  return "vec3(" + a2[0] + ", " + a2[1] + ", " + a2[2] + ")";
}
function exactEquals2(a2, b2) {
  return a2[0] === b2[0] && a2[1] === b2[1] && a2[2] === b2[2];
}
function equals2(a2, b2) {
  var a0 = a2[0], a1 = a2[1], a22 = a2[2];
  var b0 = b2[0], b1 = b2[1], b22 = b2[2];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a22 - b22) <= EPSILON * Math.max(1, Math.abs(a22), Math.abs(b22));
}
var sub2 = subtract2;
var mul2 = multiply2;
var div = divide;
var dist = distance;
var sqrDist = squaredDistance;
var len = length2;
var sqrLen = squaredLength;
var forEach = function() {
  var vec = create3();
  return function(a2, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 3;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a2.length);
    } else {
      l = a2.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a2[i];
      vec[1] = a2[i + 1];
      vec[2] = a2[i + 2];
      fn(vec, vec, arg);
      a2[i] = vec[0];
      a2[i + 1] = vec[1];
      a2[i + 2] = vec[2];
    }
    return a2;
  };
}();

// node_modules/gl-matrix/esm/vec4.js
function create4() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }
  return out;
}
function clone3(a2) {
  var out = new ARRAY_TYPE(4);
  out[0] = a2[0];
  out[1] = a2[1];
  out[2] = a2[2];
  out[3] = a2[3];
  return out;
}
function fromValues3(x, y, z, w) {
  var out = new ARRAY_TYPE(4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function copy3(out, a2) {
  out[0] = a2[0];
  out[1] = a2[1];
  out[2] = a2[2];
  out[3] = a2[3];
  return out;
}
function set3(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function add4(out, a2, b2) {
  out[0] = a2[0] + b2[0];
  out[1] = a2[1] + b2[1];
  out[2] = a2[2] + b2[2];
  out[3] = a2[3] + b2[3];
  return out;
}
function scale3(out, a2, b2) {
  out[0] = a2[0] * b2;
  out[1] = a2[1] * b2;
  out[2] = a2[2] * b2;
  out[3] = a2[3] * b2;
  return out;
}
function length3(a2) {
  var x = a2[0];
  var y = a2[1];
  var z = a2[2];
  var w = a2[3];
  return Math.hypot(x, y, z, w);
}
function squaredLength2(a2) {
  var x = a2[0];
  var y = a2[1];
  var z = a2[2];
  var w = a2[3];
  return x * x + y * y + z * z + w * w;
}
function normalize2(out, a2) {
  var x = a2[0];
  var y = a2[1];
  var z = a2[2];
  var w = a2[3];
  var len3 = x * x + y * y + z * z + w * w;
  if (len3 > 0) {
    len3 = 1 / Math.sqrt(len3);
  }
  out[0] = x * len3;
  out[1] = y * len3;
  out[2] = z * len3;
  out[3] = w * len3;
  return out;
}
function dot2(a2, b2) {
  return a2[0] * b2[0] + a2[1] * b2[1] + a2[2] * b2[2] + a2[3] * b2[3];
}
function lerp2(out, a2, b2, t) {
  var ax = a2[0];
  var ay = a2[1];
  var az = a2[2];
  var aw = a2[3];
  out[0] = ax + t * (b2[0] - ax);
  out[1] = ay + t * (b2[1] - ay);
  out[2] = az + t * (b2[2] - az);
  out[3] = aw + t * (b2[3] - aw);
  return out;
}
function exactEquals3(a2, b2) {
  return a2[0] === b2[0] && a2[1] === b2[1] && a2[2] === b2[2] && a2[3] === b2[3];
}
function equals3(a2, b2) {
  var a0 = a2[0], a1 = a2[1], a22 = a2[2], a3 = a2[3];
  var b0 = b2[0], b1 = b2[1], b22 = b2[2], b3 = b2[3];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a22 - b22) <= EPSILON * Math.max(1, Math.abs(a22), Math.abs(b22)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3));
}
var forEach2 = function() {
  var vec = create4();
  return function(a2, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 4;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a2.length);
    } else {
      l = a2.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a2[i];
      vec[1] = a2[i + 1];
      vec[2] = a2[i + 2];
      vec[3] = a2[i + 3];
      fn(vec, vec, arg);
      a2[i] = vec[0];
      a2[i + 1] = vec[1];
      a2[i + 2] = vec[2];
      a2[i + 3] = vec[3];
    }
    return a2;
  };
}();

// node_modules/gl-matrix/esm/quat.js
function create5() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  out[3] = 1;
  return out;
}
function identity3(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
function getAxisAngle(out_axis, q) {
  var rad = Math.acos(q[3]) * 2;
  var s = Math.sin(rad / 2);
  if (s > EPSILON) {
    out_axis[0] = q[0] / s;
    out_axis[1] = q[1] / s;
    out_axis[2] = q[2] / s;
  } else {
    out_axis[0] = 1;
    out_axis[1] = 0;
    out_axis[2] = 0;
  }
  return rad;
}
function getAngle(a2, b2) {
  var dotproduct = dot3(a2, b2);
  return Math.acos(2 * dotproduct * dotproduct - 1);
}
function multiply3(out, a2, b2) {
  var ax = a2[0], ay = a2[1], az = a2[2], aw = a2[3];
  var bx = b2[0], by = b2[1], bz = b2[2], bw = b2[3];
  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
function rotateX3(out, a2, rad) {
  rad *= 0.5;
  var ax = a2[0], ay = a2[1], az = a2[2], aw = a2[3];
  var bx = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw + aw * bx;
  out[1] = ay * bw + az * bx;
  out[2] = az * bw - ay * bx;
  out[3] = aw * bw - ax * bx;
  return out;
}
function rotateY3(out, a2, rad) {
  rad *= 0.5;
  var ax = a2[0], ay = a2[1], az = a2[2], aw = a2[3];
  var by = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw - az * by;
  out[1] = ay * bw + aw * by;
  out[2] = az * bw + ax * by;
  out[3] = aw * bw - ay * by;
  return out;
}
function rotateZ3(out, a2, rad) {
  rad *= 0.5;
  var ax = a2[0], ay = a2[1], az = a2[2], aw = a2[3];
  var bz = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw + ay * bz;
  out[1] = ay * bw - ax * bz;
  out[2] = az * bw + aw * bz;
  out[3] = aw * bw - az * bz;
  return out;
}
function calculateW(out, a2) {
  var x = a2[0], y = a2[1], z = a2[2];
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = Math.sqrt(Math.abs(1 - x * x - y * y - z * z));
  return out;
}
function exp(out, a2) {
  var x = a2[0], y = a2[1], z = a2[2], w = a2[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var et = Math.exp(w);
  var s = r > 0 ? et * Math.sin(r) / r : 0;
  out[0] = x * s;
  out[1] = y * s;
  out[2] = z * s;
  out[3] = et * Math.cos(r);
  return out;
}
function ln(out, a2) {
  var x = a2[0], y = a2[1], z = a2[2], w = a2[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var t = r > 0 ? Math.atan2(r, w) / r : 0;
  out[0] = x * t;
  out[1] = y * t;
  out[2] = z * t;
  out[3] = 0.5 * Math.log(x * x + y * y + z * z + w * w);
  return out;
}
function pow(out, a2, b2) {
  ln(out, a2);
  scale4(out, out, b2);
  exp(out, out);
  return out;
}
function slerp(out, a2, b2, t) {
  var ax = a2[0], ay = a2[1], az = a2[2], aw = a2[3];
  var bx = b2[0], by = b2[1], bz = b2[2], bw = b2[3];
  var omega, cosom, sinom, scale0, scale1;
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  if (cosom < 0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  if (1 - cosom > EPSILON) {
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    scale0 = 1 - t;
    scale1 = t;
  }
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
function random2(out) {
  var u1 = RANDOM();
  var u2 = RANDOM();
  var u3 = RANDOM();
  var sqrt1MinusU1 = Math.sqrt(1 - u1);
  var sqrtU1 = Math.sqrt(u1);
  out[0] = sqrt1MinusU1 * Math.sin(2 * Math.PI * u2);
  out[1] = sqrt1MinusU1 * Math.cos(2 * Math.PI * u2);
  out[2] = sqrtU1 * Math.sin(2 * Math.PI * u3);
  out[3] = sqrtU1 * Math.cos(2 * Math.PI * u3);
  return out;
}
function invert2(out, a2) {
  var a0 = a2[0], a1 = a2[1], a22 = a2[2], a3 = a2[3];
  var dot4 = a0 * a0 + a1 * a1 + a22 * a22 + a3 * a3;
  var invDot = dot4 ? 1 / dot4 : 0;
  out[0] = -a0 * invDot;
  out[1] = -a1 * invDot;
  out[2] = -a22 * invDot;
  out[3] = a3 * invDot;
  return out;
}
function conjugate(out, a2) {
  out[0] = -a2[0];
  out[1] = -a2[1];
  out[2] = -a2[2];
  out[3] = a2[3];
  return out;
}
function fromMat3(out, m) {
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;
  if (fTrace > 0) {
    fRoot = Math.sqrt(fTrace + 1);
    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    var i = 0;
    if (m[4] > m[0])
      i = 1;
    if (m[8] > m[i * 3 + i])
      i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }
  return out;
}
function fromEuler(out, x, y, z) {
  var halfToRad = 0.5 * Math.PI / 180;
  x *= halfToRad;
  y *= halfToRad;
  z *= halfToRad;
  var sx = Math.sin(x);
  var cx = Math.cos(x);
  var sy = Math.sin(y);
  var cy = Math.cos(y);
  var sz = Math.sin(z);
  var cz = Math.cos(z);
  out[0] = sx * cy * cz - cx * sy * sz;
  out[1] = cx * sy * cz + sx * cy * sz;
  out[2] = cx * cy * sz - sx * sy * cz;
  out[3] = cx * cy * cz + sx * sy * sz;
  return out;
}
function str3(a2) {
  return "quat(" + a2[0] + ", " + a2[1] + ", " + a2[2] + ", " + a2[3] + ")";
}
var clone4 = clone3;
var fromValues4 = fromValues3;
var copy4 = copy3;
var set4 = set3;
var add5 = add4;
var mul3 = multiply3;
var scale4 = scale3;
var dot3 = dot2;
var lerp3 = lerp2;
var length4 = length3;
var len2 = length4;
var squaredLength3 = squaredLength2;
var sqrLen2 = squaredLength3;
var normalize3 = normalize2;
var exactEquals4 = exactEquals3;
var equals4 = equals3;
var rotationTo = function() {
  var tmpvec3 = create3();
  var xUnitVec3 = fromValues2(1, 0, 0);
  var yUnitVec3 = fromValues2(0, 1, 0);
  return function(out, a2, b2) {
    var dot4 = dot(a2, b2);
    if (dot4 < -0.999999) {
      cross(tmpvec3, xUnitVec3, a2);
      if (len(tmpvec3) < 1e-6)
        cross(tmpvec3, yUnitVec3, a2);
      normalize(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot4 > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross(tmpvec3, a2, b2);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot4;
      return normalize3(out, out);
    }
  };
}();
var sqlerp = function() {
  var temp1 = create5();
  var temp2 = create5();
  return function(out, a2, b2, c2, d, t) {
    slerp(temp1, a2, d, t);
    slerp(temp2, b2, c2, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}();
var setAxes = function() {
  var matr = create();
  return function(out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize3(out, fromMat3(out, matr));
  };
}();

// package.json
var version = "0.0.5-alpha.1";

// node_modules/cannon-es/dist/cannon-es.js
var Mat3 = class _Mat3 {
  /**
   * A vector of length 9, containing all matrix elements.
   */
  /**
   * @param elements A vector of length 9, containing all matrix elements.
   */
  constructor(elements) {
    if (elements === void 0) {
      elements = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    this.elements = elements;
  }
  /**
   * Sets the matrix to identity
   * @todo Should perhaps be renamed to `setIdentity()` to be more clear.
   * @todo Create another function that immediately creates an identity matrix eg. `eye()`
   */
  identity() {
    const e = this.elements;
    e[0] = 1;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;
    e[4] = 1;
    e[5] = 0;
    e[6] = 0;
    e[7] = 0;
    e[8] = 1;
  }
  /**
   * Set all elements to zero
   */
  setZero() {
    const e = this.elements;
    e[0] = 0;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;
    e[4] = 0;
    e[5] = 0;
    e[6] = 0;
    e[7] = 0;
    e[8] = 0;
  }
  /**
   * Sets the matrix diagonal elements from a Vec3
   */
  setTrace(vector) {
    const e = this.elements;
    e[0] = vector.x;
    e[4] = vector.y;
    e[8] = vector.z;
  }
  /**
   * Gets the matrix diagonal elements
   */
  getTrace(target) {
    if (target === void 0) {
      target = new Vec3();
    }
    const e = this.elements;
    target.x = e[0];
    target.y = e[4];
    target.z = e[8];
    return target;
  }
  /**
   * Matrix-Vector multiplication
   * @param v The vector to multiply with
   * @param target Optional, target to save the result in.
   */
  vmult(v, target) {
    if (target === void 0) {
      target = new Vec3();
    }
    const e = this.elements;
    const x = v.x;
    const y = v.y;
    const z = v.z;
    target.x = e[0] * x + e[1] * y + e[2] * z;
    target.y = e[3] * x + e[4] * y + e[5] * z;
    target.z = e[6] * x + e[7] * y + e[8] * z;
    return target;
  }
  /**
   * Matrix-scalar multiplication
   */
  smult(s) {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i] *= s;
    }
  }
  /**
   * Matrix multiplication
   * @param matrix Matrix to multiply with from left side.
   */
  mmult(matrix, target) {
    if (target === void 0) {
      target = new _Mat3();
    }
    const A = this.elements;
    const B = matrix.elements;
    const T = target.elements;
    const a11 = A[0], a12 = A[1], a13 = A[2], a21 = A[3], a22 = A[4], a23 = A[5], a31 = A[6], a32 = A[7], a33 = A[8];
    const b11 = B[0], b12 = B[1], b13 = B[2], b21 = B[3], b22 = B[4], b23 = B[5], b31 = B[6], b32 = B[7], b33 = B[8];
    T[0] = a11 * b11 + a12 * b21 + a13 * b31;
    T[1] = a11 * b12 + a12 * b22 + a13 * b32;
    T[2] = a11 * b13 + a12 * b23 + a13 * b33;
    T[3] = a21 * b11 + a22 * b21 + a23 * b31;
    T[4] = a21 * b12 + a22 * b22 + a23 * b32;
    T[5] = a21 * b13 + a22 * b23 + a23 * b33;
    T[6] = a31 * b11 + a32 * b21 + a33 * b31;
    T[7] = a31 * b12 + a32 * b22 + a33 * b32;
    T[8] = a31 * b13 + a32 * b23 + a33 * b33;
    return target;
  }
  /**
   * Scale each column of the matrix
   */
  scale(vector, target) {
    if (target === void 0) {
      target = new _Mat3();
    }
    const e = this.elements;
    const t = target.elements;
    for (let i = 0; i !== 3; i++) {
      t[3 * i + 0] = vector.x * e[3 * i + 0];
      t[3 * i + 1] = vector.y * e[3 * i + 1];
      t[3 * i + 2] = vector.z * e[3 * i + 2];
    }
    return target;
  }
  /**
   * Solve Ax=b
   * @param b The right hand side
   * @param target Optional. Target vector to save in.
   * @return The solution x
   * @todo should reuse arrays
   */
  solve(b2, target) {
    if (target === void 0) {
      target = new Vec3();
    }
    const nr = 3;
    const nc = 4;
    const eqns = [];
    let i;
    let j;
    for (i = 0; i < nr * nc; i++) {
      eqns.push(0);
    }
    for (i = 0; i < 3; i++) {
      for (j = 0; j < 3; j++) {
        eqns[i + nc * j] = this.elements[i + 3 * j];
      }
    }
    eqns[3 + 4 * 0] = b2.x;
    eqns[3 + 4 * 1] = b2.y;
    eqns[3 + 4 * 2] = b2.z;
    let n = 3;
    const k = n;
    let np;
    const kp = 4;
    let p;
    do {
      i = k - n;
      if (eqns[i + nc * i] === 0) {
        for (j = i + 1; j < k; j++) {
          if (eqns[i + nc * j] !== 0) {
            np = kp;
            do {
              p = kp - np;
              eqns[p + nc * i] += eqns[p + nc * j];
            } while (--np);
            break;
          }
        }
      }
      if (eqns[i + nc * i] !== 0) {
        for (j = i + 1; j < k; j++) {
          const multiplier = eqns[i + nc * j] / eqns[i + nc * i];
          np = kp;
          do {
            p = kp - np;
            eqns[p + nc * j] = p <= i ? 0 : eqns[p + nc * j] - eqns[p + nc * i] * multiplier;
          } while (--np);
        }
      }
    } while (--n);
    target.z = eqns[2 * nc + 3] / eqns[2 * nc + 2];
    target.y = (eqns[1 * nc + 3] - eqns[1 * nc + 2] * target.z) / eqns[1 * nc + 1];
    target.x = (eqns[0 * nc + 3] - eqns[0 * nc + 2] * target.z - eqns[0 * nc + 1] * target.y) / eqns[0 * nc + 0];
    if (isNaN(target.x) || isNaN(target.y) || isNaN(target.z) || target.x === Infinity || target.y === Infinity || target.z === Infinity) {
      throw `Could not solve equation! Got x=[${target.toString()}], b=[${b2.toString()}], A=[${this.toString()}]`;
    }
    return target;
  }
  /**
   * Get an element in the matrix by index. Index starts at 0, not 1!!!
   * @param value If provided, the matrix element will be set to this value.
   */
  e(row, column, value) {
    if (value === void 0) {
      return this.elements[column + 3 * row];
    } else {
      this.elements[column + 3 * row] = value;
    }
  }
  /**
   * Copy another matrix into this matrix object.
   */
  copy(matrix) {
    for (let i = 0; i < matrix.elements.length; i++) {
      this.elements[i] = matrix.elements[i];
    }
    return this;
  }
  /**
   * Returns a string representation of the matrix.
   */
  toString() {
    let r = "";
    const sep = ",";
    for (let i = 0; i < 9; i++) {
      r += this.elements[i] + sep;
    }
    return r;
  }
  /**
   * reverse the matrix
   * @param target Target matrix to save in.
   * @return The solution x
   */
  reverse(target) {
    if (target === void 0) {
      target = new _Mat3();
    }
    const nr = 3;
    const nc = 6;
    const eqns = reverse_eqns;
    let i;
    let j;
    for (i = 0; i < 3; i++) {
      for (j = 0; j < 3; j++) {
        eqns[i + nc * j] = this.elements[i + 3 * j];
      }
    }
    eqns[3 + 6 * 0] = 1;
    eqns[3 + 6 * 1] = 0;
    eqns[3 + 6 * 2] = 0;
    eqns[4 + 6 * 0] = 0;
    eqns[4 + 6 * 1] = 1;
    eqns[4 + 6 * 2] = 0;
    eqns[5 + 6 * 0] = 0;
    eqns[5 + 6 * 1] = 0;
    eqns[5 + 6 * 2] = 1;
    let n = 3;
    const k = n;
    let np;
    const kp = nc;
    let p;
    do {
      i = k - n;
      if (eqns[i + nc * i] === 0) {
        for (j = i + 1; j < k; j++) {
          if (eqns[i + nc * j] !== 0) {
            np = kp;
            do {
              p = kp - np;
              eqns[p + nc * i] += eqns[p + nc * j];
            } while (--np);
            break;
          }
        }
      }
      if (eqns[i + nc * i] !== 0) {
        for (j = i + 1; j < k; j++) {
          const multiplier = eqns[i + nc * j] / eqns[i + nc * i];
          np = kp;
          do {
            p = kp - np;
            eqns[p + nc * j] = p <= i ? 0 : eqns[p + nc * j] - eqns[p + nc * i] * multiplier;
          } while (--np);
        }
      }
    } while (--n);
    i = 2;
    do {
      j = i - 1;
      do {
        const multiplier = eqns[i + nc * j] / eqns[i + nc * i];
        np = nc;
        do {
          p = nc - np;
          eqns[p + nc * j] = eqns[p + nc * j] - eqns[p + nc * i] * multiplier;
        } while (--np);
      } while (j--);
    } while (--i);
    i = 2;
    do {
      const multiplier = 1 / eqns[i + nc * i];
      np = nc;
      do {
        p = nc - np;
        eqns[p + nc * i] = eqns[p + nc * i] * multiplier;
      } while (--np);
    } while (i--);
    i = 2;
    do {
      j = 2;
      do {
        p = eqns[nr + j + nc * i];
        if (isNaN(p) || p === Infinity) {
          throw `Could not reverse! A=[${this.toString()}]`;
        }
        target.e(i, j, p);
      } while (j--);
    } while (i--);
    return target;
  }
  /**
   * Set the matrix from a quaterion
   */
  setRotationFromQuaternion(q) {
    const x = q.x;
    const y = q.y;
    const z = q.z;
    const w = q.w;
    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2;
    const xy = x * y2;
    const xz = x * z2;
    const yy = y * y2;
    const yz = y * z2;
    const zz = z * z2;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;
    const e = this.elements;
    e[3 * 0 + 0] = 1 - (yy + zz);
    e[3 * 0 + 1] = xy - wz;
    e[3 * 0 + 2] = xz + wy;
    e[3 * 1 + 0] = xy + wz;
    e[3 * 1 + 1] = 1 - (xx + zz);
    e[3 * 1 + 2] = yz - wx;
    e[3 * 2 + 0] = xz - wy;
    e[3 * 2 + 1] = yz + wx;
    e[3 * 2 + 2] = 1 - (xx + yy);
    return this;
  }
  /**
   * Transpose the matrix
   * @param target Optional. Where to store the result.
   * @return The target Mat3, or a new Mat3 if target was omitted.
   */
  transpose(target) {
    if (target === void 0) {
      target = new _Mat3();
    }
    const M = this.elements;
    const T = target.elements;
    let tmp2;
    T[0] = M[0];
    T[4] = M[4];
    T[8] = M[8];
    tmp2 = M[1];
    T[1] = M[3];
    T[3] = tmp2;
    tmp2 = M[2];
    T[2] = M[6];
    T[6] = tmp2;
    tmp2 = M[5];
    T[5] = M[7];
    T[7] = tmp2;
    return target;
  }
};
var reverse_eqns = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var Vec3 = class _Vec3 {
  constructor(x, y, z) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (z === void 0) {
      z = 0;
    }
    this.x = x;
    this.y = y;
    this.z = z;
  }
  /**
   * Vector cross product
   * @param target Optional target to save in.
   */
  cross(vector, target) {
    if (target === void 0) {
      target = new _Vec3();
    }
    const vx = vector.x;
    const vy = vector.y;
    const vz = vector.z;
    const x = this.x;
    const y = this.y;
    const z = this.z;
    target.x = y * vz - z * vy;
    target.y = z * vx - x * vz;
    target.z = x * vy - y * vx;
    return target;
  }
  /**
   * Set the vectors' 3 elements
   */
  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  /**
   * Set all components of the vector to zero.
   */
  setZero() {
    this.x = this.y = this.z = 0;
  }
  /**
   * Vector addition
   */
  vadd(vector, target) {
    if (target) {
      target.x = vector.x + this.x;
      target.y = vector.y + this.y;
      target.z = vector.z + this.z;
    } else {
      return new _Vec3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
    }
  }
  /**
   * Vector subtraction
   * @param target Optional target to save in.
   */
  vsub(vector, target) {
    if (target) {
      target.x = this.x - vector.x;
      target.y = this.y - vector.y;
      target.z = this.z - vector.z;
    } else {
      return new _Vec3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
    }
  }
  /**
   * Get the cross product matrix a_cross from a vector, such that a x b = a_cross * b = c
   *
   * See {@link https://www8.cs.umu.se/kurser/TDBD24/VT06/lectures/Lecture6.pdf Umeå University Lecture}
   */
  crossmat() {
    return new Mat3([0, -this.z, this.y, this.z, 0, -this.x, -this.y, this.x, 0]);
  }
  /**
   * Normalize the vector. Note that this changes the values in the vector.
    * @return Returns the norm of the vector
   */
  normalize() {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const n = Math.sqrt(x * x + y * y + z * z);
    if (n > 0) {
      const invN = 1 / n;
      this.x *= invN;
      this.y *= invN;
      this.z *= invN;
    } else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }
    return n;
  }
  /**
   * Get the version of this vector that is of length 1.
   * @param target Optional target to save in
   * @return Returns the unit vector
   */
  unit(target) {
    if (target === void 0) {
      target = new _Vec3();
    }
    const x = this.x;
    const y = this.y;
    const z = this.z;
    let ninv = Math.sqrt(x * x + y * y + z * z);
    if (ninv > 0) {
      ninv = 1 / ninv;
      target.x = x * ninv;
      target.y = y * ninv;
      target.z = z * ninv;
    } else {
      target.x = 1;
      target.y = 0;
      target.z = 0;
    }
    return target;
  }
  /**
   * Get the length of the vector
   */
  length() {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    return Math.sqrt(x * x + y * y + z * z);
  }
  /**
   * Get the squared length of the vector.
   */
  lengthSquared() {
    return this.dot(this);
  }
  /**
   * Get distance from this point to another point
   */
  distanceTo(p) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const px = p.x;
    const py = p.y;
    const pz = p.z;
    return Math.sqrt((px - x) * (px - x) + (py - y) * (py - y) + (pz - z) * (pz - z));
  }
  /**
   * Get squared distance from this point to another point
   */
  distanceSquared(p) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const px = p.x;
    const py = p.y;
    const pz = p.z;
    return (px - x) * (px - x) + (py - y) * (py - y) + (pz - z) * (pz - z);
  }
  /**
   * Multiply all the components of the vector with a scalar.
   * @param target The vector to save the result in.
   */
  scale(scalar, target) {
    if (target === void 0) {
      target = new _Vec3();
    }
    const x = this.x;
    const y = this.y;
    const z = this.z;
    target.x = scalar * x;
    target.y = scalar * y;
    target.z = scalar * z;
    return target;
  }
  /**
   * Multiply the vector with an other vector, component-wise.
   * @param target The vector to save the result in.
   */
  vmul(vector, target) {
    if (target === void 0) {
      target = new _Vec3();
    }
    target.x = vector.x * this.x;
    target.y = vector.y * this.y;
    target.z = vector.z * this.z;
    return target;
  }
  /**
   * Scale a vector and add it to this vector. Save the result in "target". (target = this + vector * scalar)
   * @param target The vector to save the result in.
   */
  addScaledVector(scalar, vector, target) {
    if (target === void 0) {
      target = new _Vec3();
    }
    target.x = this.x + scalar * vector.x;
    target.y = this.y + scalar * vector.y;
    target.z = this.z + scalar * vector.z;
    return target;
  }
  /**
   * Calculate dot product
   * @param vector
   */
  dot(vector) {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  }
  isZero() {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }
  /**
   * Make the vector point in the opposite direction.
   * @param target Optional target to save in
   */
  negate(target) {
    if (target === void 0) {
      target = new _Vec3();
    }
    target.x = -this.x;
    target.y = -this.y;
    target.z = -this.z;
    return target;
  }
  /**
   * Compute two artificial tangents to the vector
   * @param t1 Vector object to save the first tangent in
   * @param t2 Vector object to save the second tangent in
   */
  tangents(t1, t2) {
    const norm = this.length();
    if (norm > 0) {
      const n = Vec3_tangents_n;
      const inorm = 1 / norm;
      n.set(this.x * inorm, this.y * inorm, this.z * inorm);
      const randVec = Vec3_tangents_randVec;
      if (Math.abs(n.x) < 0.9) {
        randVec.set(1, 0, 0);
        n.cross(randVec, t1);
      } else {
        randVec.set(0, 1, 0);
        n.cross(randVec, t1);
      }
      n.cross(t1, t2);
    } else {
      t1.set(1, 0, 0);
      t2.set(0, 1, 0);
    }
  }
  /**
   * Converts to a more readable format
   */
  toString() {
    return `${this.x},${this.y},${this.z}`;
  }
  /**
   * Converts to an array
   */
  toArray() {
    return [this.x, this.y, this.z];
  }
  /**
   * Copies value of source to this vector.
   */
  copy(vector) {
    this.x = vector.x;
    this.y = vector.y;
    this.z = vector.z;
    return this;
  }
  /**
   * Do a linear interpolation between two vectors
   * @param t A number between 0 and 1. 0 will make this function return u, and 1 will make it return v. Numbers in between will generate a vector in between them.
   */
  lerp(vector, t, target) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    target.x = x + (vector.x - x) * t;
    target.y = y + (vector.y - y) * t;
    target.z = z + (vector.z - z) * t;
  }
  /**
   * Check if a vector equals is almost equal to another one.
   */
  almostEquals(vector, precision) {
    if (precision === void 0) {
      precision = 1e-6;
    }
    if (Math.abs(this.x - vector.x) > precision || Math.abs(this.y - vector.y) > precision || Math.abs(this.z - vector.z) > precision) {
      return false;
    }
    return true;
  }
  /**
   * Check if a vector is almost zero
   */
  almostZero(precision) {
    if (precision === void 0) {
      precision = 1e-6;
    }
    if (Math.abs(this.x) > precision || Math.abs(this.y) > precision || Math.abs(this.z) > precision) {
      return false;
    }
    return true;
  }
  /**
   * Check if the vector is anti-parallel to another vector.
   * @param precision Set to zero for exact comparisons
   */
  isAntiparallelTo(vector, precision) {
    this.negate(antip_neg);
    return antip_neg.almostEquals(vector, precision);
  }
  /**
   * Clone the vector
   */
  clone() {
    return new _Vec3(this.x, this.y, this.z);
  }
};
Vec3.ZERO = new Vec3(0, 0, 0);
Vec3.UNIT_X = new Vec3(1, 0, 0);
Vec3.UNIT_Y = new Vec3(0, 1, 0);
Vec3.UNIT_Z = new Vec3(0, 0, 1);
var Vec3_tangents_n = new Vec3();
var Vec3_tangents_randVec = new Vec3();
var antip_neg = new Vec3();
var AABB = class _AABB {
  /**
   * The lower bound of the bounding box
   */
  /**
   * The upper bound of the bounding box
   */
  constructor(options) {
    if (options === void 0) {
      options = {};
    }
    this.lowerBound = new Vec3();
    this.upperBound = new Vec3();
    if (options.lowerBound) {
      this.lowerBound.copy(options.lowerBound);
    }
    if (options.upperBound) {
      this.upperBound.copy(options.upperBound);
    }
  }
  /**
   * Set the AABB bounds from a set of points.
   * @param points An array of Vec3's.
   * @return The self object
   */
  setFromPoints(points, position, quaternion, skinSize) {
    const l = this.lowerBound;
    const u = this.upperBound;
    const q = quaternion;
    l.copy(points[0]);
    if (q) {
      q.vmult(l, l);
    }
    u.copy(l);
    for (let i = 1; i < points.length; i++) {
      let p = points[i];
      if (q) {
        q.vmult(p, tmp$1);
        p = tmp$1;
      }
      if (p.x > u.x) {
        u.x = p.x;
      }
      if (p.x < l.x) {
        l.x = p.x;
      }
      if (p.y > u.y) {
        u.y = p.y;
      }
      if (p.y < l.y) {
        l.y = p.y;
      }
      if (p.z > u.z) {
        u.z = p.z;
      }
      if (p.z < l.z) {
        l.z = p.z;
      }
    }
    if (position) {
      position.vadd(l, l);
      position.vadd(u, u);
    }
    if (skinSize) {
      l.x -= skinSize;
      l.y -= skinSize;
      l.z -= skinSize;
      u.x += skinSize;
      u.y += skinSize;
      u.z += skinSize;
    }
    return this;
  }
  /**
   * Copy bounds from an AABB to this AABB
   * @param aabb Source to copy from
   * @return The this object, for chainability
   */
  copy(aabb) {
    this.lowerBound.copy(aabb.lowerBound);
    this.upperBound.copy(aabb.upperBound);
    return this;
  }
  /**
   * Clone an AABB
   */
  clone() {
    return new _AABB().copy(this);
  }
  /**
   * Extend this AABB so that it covers the given AABB too.
   */
  extend(aabb) {
    this.lowerBound.x = Math.min(this.lowerBound.x, aabb.lowerBound.x);
    this.upperBound.x = Math.max(this.upperBound.x, aabb.upperBound.x);
    this.lowerBound.y = Math.min(this.lowerBound.y, aabb.lowerBound.y);
    this.upperBound.y = Math.max(this.upperBound.y, aabb.upperBound.y);
    this.lowerBound.z = Math.min(this.lowerBound.z, aabb.lowerBound.z);
    this.upperBound.z = Math.max(this.upperBound.z, aabb.upperBound.z);
  }
  /**
   * Returns true if the given AABB overlaps this AABB.
   */
  overlaps(aabb) {
    const l1 = this.lowerBound;
    const u1 = this.upperBound;
    const l2 = aabb.lowerBound;
    const u2 = aabb.upperBound;
    const overlapsX = l2.x <= u1.x && u1.x <= u2.x || l1.x <= u2.x && u2.x <= u1.x;
    const overlapsY = l2.y <= u1.y && u1.y <= u2.y || l1.y <= u2.y && u2.y <= u1.y;
    const overlapsZ = l2.z <= u1.z && u1.z <= u2.z || l1.z <= u2.z && u2.z <= u1.z;
    return overlapsX && overlapsY && overlapsZ;
  }
  // Mostly for debugging
  volume() {
    const l = this.lowerBound;
    const u = this.upperBound;
    return (u.x - l.x) * (u.y - l.y) * (u.z - l.z);
  }
  /**
   * Returns true if the given AABB is fully contained in this AABB.
   */
  contains(aabb) {
    const l1 = this.lowerBound;
    const u1 = this.upperBound;
    const l2 = aabb.lowerBound;
    const u2 = aabb.upperBound;
    return l1.x <= l2.x && u1.x >= u2.x && l1.y <= l2.y && u1.y >= u2.y && l1.z <= l2.z && u1.z >= u2.z;
  }
  getCorners(a2, b2, c2, d, e, f, g, h) {
    const l = this.lowerBound;
    const u = this.upperBound;
    a2.copy(l);
    b2.set(u.x, l.y, l.z);
    c2.set(u.x, u.y, l.z);
    d.set(l.x, u.y, u.z);
    e.set(u.x, l.y, u.z);
    f.set(l.x, u.y, l.z);
    g.set(l.x, l.y, u.z);
    h.copy(u);
  }
  /**
   * Get the representation of an AABB in another frame.
   * @return The "target" AABB object.
   */
  toLocalFrame(frame, target) {
    const corners = transformIntoFrame_corners;
    const a2 = corners[0];
    const b2 = corners[1];
    const c2 = corners[2];
    const d = corners[3];
    const e = corners[4];
    const f = corners[5];
    const g = corners[6];
    const h = corners[7];
    this.getCorners(a2, b2, c2, d, e, f, g, h);
    for (let i = 0; i !== 8; i++) {
      const corner = corners[i];
      frame.pointToLocal(corner, corner);
    }
    return target.setFromPoints(corners);
  }
  /**
   * Get the representation of an AABB in the global frame.
   * @return The "target" AABB object.
   */
  toWorldFrame(frame, target) {
    const corners = transformIntoFrame_corners;
    const a2 = corners[0];
    const b2 = corners[1];
    const c2 = corners[2];
    const d = corners[3];
    const e = corners[4];
    const f = corners[5];
    const g = corners[6];
    const h = corners[7];
    this.getCorners(a2, b2, c2, d, e, f, g, h);
    for (let i = 0; i !== 8; i++) {
      const corner = corners[i];
      frame.pointToWorld(corner, corner);
    }
    return target.setFromPoints(corners);
  }
  /**
   * Check if the AABB is hit by a ray.
   */
  overlapsRay(ray) {
    const {
      direction,
      from
    } = ray;
    const dirFracX = 1 / direction.x;
    const dirFracY = 1 / direction.y;
    const dirFracZ = 1 / direction.z;
    const t1 = (this.lowerBound.x - from.x) * dirFracX;
    const t2 = (this.upperBound.x - from.x) * dirFracX;
    const t3 = (this.lowerBound.y - from.y) * dirFracY;
    const t4 = (this.upperBound.y - from.y) * dirFracY;
    const t5 = (this.lowerBound.z - from.z) * dirFracZ;
    const t6 = (this.upperBound.z - from.z) * dirFracZ;
    const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
    const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));
    if (tmax < 0) {
      return false;
    }
    if (tmin > tmax) {
      return false;
    }
    return true;
  }
};
var tmp$1 = new Vec3();
var transformIntoFrame_corners = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];
var EventTarget = class {
  /**
   * Add an event listener
   * @return The self object, for chainability.
   */
  addEventListener(type, listener) {
    if (this._listeners === void 0) {
      this._listeners = {};
    }
    const listeners = this._listeners;
    if (listeners[type] === void 0) {
      listeners[type] = [];
    }
    if (!listeners[type].includes(listener)) {
      listeners[type].push(listener);
    }
    return this;
  }
  /**
   * Check if an event listener is added
   */
  hasEventListener(type, listener) {
    if (this._listeners === void 0) {
      return false;
    }
    const listeners = this._listeners;
    if (listeners[type] !== void 0 && listeners[type].includes(listener)) {
      return true;
    }
    return false;
  }
  /**
   * Check if any event listener of the given type is added
   */
  hasAnyEventListener(type) {
    if (this._listeners === void 0) {
      return false;
    }
    const listeners = this._listeners;
    return listeners[type] !== void 0;
  }
  /**
   * Remove an event listener
   * @return The self object, for chainability.
   */
  removeEventListener(type, listener) {
    if (this._listeners === void 0) {
      return this;
    }
    const listeners = this._listeners;
    if (listeners[type] === void 0) {
      return this;
    }
    const index = listeners[type].indexOf(listener);
    if (index !== -1) {
      listeners[type].splice(index, 1);
    }
    return this;
  }
  /**
   * Emit an event.
   * @return The self object, for chainability.
   */
  dispatchEvent(event) {
    if (this._listeners === void 0) {
      return this;
    }
    const listeners = this._listeners;
    const listenerArray = listeners[event.type];
    if (listenerArray !== void 0) {
      event.target = this;
      for (let i = 0, l = listenerArray.length; i < l; i++) {
        listenerArray[i].call(this, event);
      }
    }
    return this;
  }
};
var Quaternion = class _Quaternion {
  constructor(x, y, z, w) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (z === void 0) {
      z = 0;
    }
    if (w === void 0) {
      w = 1;
    }
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
  /**
   * Set the value of the quaternion.
   */
  set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }
  /**
   * Convert to a readable format
   * @return "x,y,z,w"
   */
  toString() {
    return `${this.x},${this.y},${this.z},${this.w}`;
  }
  /**
   * Convert to an Array
   * @return [x, y, z, w]
   */
  toArray() {
    return [this.x, this.y, this.z, this.w];
  }
  /**
   * Set the quaternion components given an axis and an angle in radians.
   */
  setFromAxisAngle(vector, angle2) {
    const s = Math.sin(angle2 * 0.5);
    this.x = vector.x * s;
    this.y = vector.y * s;
    this.z = vector.z * s;
    this.w = Math.cos(angle2 * 0.5);
    return this;
  }
  /**
   * Converts the quaternion to [ axis, angle ] representation.
   * @param targetAxis A vector object to reuse for storing the axis.
   * @return An array, first element is the axis and the second is the angle in radians.
   */
  toAxisAngle(targetAxis) {
    if (targetAxis === void 0) {
      targetAxis = new Vec3();
    }
    this.normalize();
    const angle2 = 2 * Math.acos(this.w);
    const s = Math.sqrt(1 - this.w * this.w);
    if (s < 1e-3) {
      targetAxis.x = this.x;
      targetAxis.y = this.y;
      targetAxis.z = this.z;
    } else {
      targetAxis.x = this.x / s;
      targetAxis.y = this.y / s;
      targetAxis.z = this.z / s;
    }
    return [targetAxis, angle2];
  }
  /**
   * Set the quaternion value given two vectors. The resulting rotation will be the needed rotation to rotate u to v.
   */
  setFromVectors(u, v) {
    if (u.isAntiparallelTo(v)) {
      const t1 = sfv_t1;
      const t2 = sfv_t2;
      u.tangents(t1, t2);
      this.setFromAxisAngle(t1, Math.PI);
    } else {
      const a2 = u.cross(v);
      this.x = a2.x;
      this.y = a2.y;
      this.z = a2.z;
      this.w = Math.sqrt(u.length() ** 2 * v.length() ** 2) + u.dot(v);
      this.normalize();
    }
    return this;
  }
  /**
   * Multiply the quaternion with an other quaternion.
   */
  mult(quat, target) {
    if (target === void 0) {
      target = new _Quaternion();
    }
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    const aw = this.w;
    const bx = quat.x;
    const by = quat.y;
    const bz = quat.z;
    const bw = quat.w;
    target.x = ax * bw + aw * bx + ay * bz - az * by;
    target.y = ay * bw + aw * by + az * bx - ax * bz;
    target.z = az * bw + aw * bz + ax * by - ay * bx;
    target.w = aw * bw - ax * bx - ay * by - az * bz;
    return target;
  }
  /**
   * Get the inverse quaternion rotation.
   */
  inverse(target) {
    if (target === void 0) {
      target = new _Quaternion();
    }
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const w = this.w;
    this.conjugate(target);
    const inorm2 = 1 / (x * x + y * y + z * z + w * w);
    target.x *= inorm2;
    target.y *= inorm2;
    target.z *= inorm2;
    target.w *= inorm2;
    return target;
  }
  /**
   * Get the quaternion conjugate
   */
  conjugate(target) {
    if (target === void 0) {
      target = new _Quaternion();
    }
    target.x = -this.x;
    target.y = -this.y;
    target.z = -this.z;
    target.w = this.w;
    return target;
  }
  /**
   * Normalize the quaternion. Note that this changes the values of the quaternion.
   */
  normalize() {
    let l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    if (l === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 0;
    } else {
      l = 1 / l;
      this.x *= l;
      this.y *= l;
      this.z *= l;
      this.w *= l;
    }
    return this;
  }
  /**
   * Approximation of quaternion normalization. Works best when quat is already almost-normalized.
   * @author unphased, https://github.com/unphased
   */
  normalizeFast() {
    const f = (3 - (this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)) / 2;
    if (f === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 0;
    } else {
      this.x *= f;
      this.y *= f;
      this.z *= f;
      this.w *= f;
    }
    return this;
  }
  /**
   * Multiply the quaternion by a vector
   */
  vmult(v, target) {
    if (target === void 0) {
      target = new Vec3();
    }
    const x = v.x;
    const y = v.y;
    const z = v.z;
    const qx = this.x;
    const qy = this.y;
    const qz = this.z;
    const qw = this.w;
    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;
    target.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    target.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    target.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return target;
  }
  /**
   * Copies value of source to this quaternion.
   * @return this
   */
  copy(quat) {
    this.x = quat.x;
    this.y = quat.y;
    this.z = quat.z;
    this.w = quat.w;
    return this;
  }
  /**
   * Convert the quaternion to euler angle representation. Order: YZX, as this page describes: https://www.euclideanspace.com/maths/standards/index.htm
   * @param order Three-character string, defaults to "YZX"
   */
  toEuler(target, order) {
    if (order === void 0) {
      order = "YZX";
    }
    let heading;
    let attitude;
    let bank;
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const w = this.w;
    switch (order) {
      case "YZX":
        const test = x * y + z * w;
        if (test > 0.499) {
          heading = 2 * Math.atan2(x, w);
          attitude = Math.PI / 2;
          bank = 0;
        }
        if (test < -0.499) {
          heading = -2 * Math.atan2(x, w);
          attitude = -Math.PI / 2;
          bank = 0;
        }
        if (heading === void 0) {
          const sqx = x * x;
          const sqy = y * y;
          const sqz = z * z;
          heading = Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * sqy - 2 * sqz);
          attitude = Math.asin(2 * test);
          bank = Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * sqx - 2 * sqz);
        }
        break;
      default:
        throw new Error(`Euler order ${order} not supported yet.`);
    }
    target.y = heading;
    target.z = attitude;
    target.x = bank;
  }
  /**
   * Set the quaternion components given Euler angle representation.
   *
   * @param order The order to apply angles: 'XYZ' or 'YXZ' or any other combination.
   *
   * See {@link https://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors MathWorks} reference
   */
  setFromEuler(x, y, z, order) {
    if (order === void 0) {
      order = "XYZ";
    }
    const c1 = Math.cos(x / 2);
    const c2 = Math.cos(y / 2);
    const c3 = Math.cos(z / 2);
    const s1 = Math.sin(x / 2);
    const s2 = Math.sin(y / 2);
    const s3 = Math.sin(z / 2);
    if (order === "XYZ") {
      this.x = s1 * c2 * c3 + c1 * s2 * s3;
      this.y = c1 * s2 * c3 - s1 * c2 * s3;
      this.z = c1 * c2 * s3 + s1 * s2 * c3;
      this.w = c1 * c2 * c3 - s1 * s2 * s3;
    } else if (order === "YXZ") {
      this.x = s1 * c2 * c3 + c1 * s2 * s3;
      this.y = c1 * s2 * c3 - s1 * c2 * s3;
      this.z = c1 * c2 * s3 - s1 * s2 * c3;
      this.w = c1 * c2 * c3 + s1 * s2 * s3;
    } else if (order === "ZXY") {
      this.x = s1 * c2 * c3 - c1 * s2 * s3;
      this.y = c1 * s2 * c3 + s1 * c2 * s3;
      this.z = c1 * c2 * s3 + s1 * s2 * c3;
      this.w = c1 * c2 * c3 - s1 * s2 * s3;
    } else if (order === "ZYX") {
      this.x = s1 * c2 * c3 - c1 * s2 * s3;
      this.y = c1 * s2 * c3 + s1 * c2 * s3;
      this.z = c1 * c2 * s3 - s1 * s2 * c3;
      this.w = c1 * c2 * c3 + s1 * s2 * s3;
    } else if (order === "YZX") {
      this.x = s1 * c2 * c3 + c1 * s2 * s3;
      this.y = c1 * s2 * c3 + s1 * c2 * s3;
      this.z = c1 * c2 * s3 - s1 * s2 * c3;
      this.w = c1 * c2 * c3 - s1 * s2 * s3;
    } else if (order === "XZY") {
      this.x = s1 * c2 * c3 - c1 * s2 * s3;
      this.y = c1 * s2 * c3 - s1 * c2 * s3;
      this.z = c1 * c2 * s3 + s1 * s2 * c3;
      this.w = c1 * c2 * c3 + s1 * s2 * s3;
    }
    return this;
  }
  clone() {
    return new _Quaternion(this.x, this.y, this.z, this.w);
  }
  /**
   * Performs a spherical linear interpolation between two quat
   *
   * @param toQuat second operand
   * @param t interpolation amount between the self quaternion and toQuat
   * @param target A quaternion to store the result in. If not provided, a new one will be created.
   * @returns {Quaternion} The "target" object
   */
  slerp(toQuat, t, target) {
    if (target === void 0) {
      target = new _Quaternion();
    }
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    const aw = this.w;
    let bx = toQuat.x;
    let by = toQuat.y;
    let bz = toQuat.z;
    let bw = toQuat.w;
    let omega;
    let cosom;
    let sinom;
    let scale0;
    let scale1;
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    if (cosom < 0) {
      cosom = -cosom;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    }
    if (1 - cosom > 1e-6) {
      omega = Math.acos(cosom);
      sinom = Math.sin(omega);
      scale0 = Math.sin((1 - t) * omega) / sinom;
      scale1 = Math.sin(t * omega) / sinom;
    } else {
      scale0 = 1 - t;
      scale1 = t;
    }
    target.x = scale0 * ax + scale1 * bx;
    target.y = scale0 * ay + scale1 * by;
    target.z = scale0 * az + scale1 * bz;
    target.w = scale0 * aw + scale1 * bw;
    return target;
  }
  /**
   * Rotate an absolute orientation quaternion given an angular velocity and a time step.
   */
  integrate(angularVelocity, dt, angularFactor, target) {
    if (target === void 0) {
      target = new _Quaternion();
    }
    const ax = angularVelocity.x * angularFactor.x, ay = angularVelocity.y * angularFactor.y, az = angularVelocity.z * angularFactor.z, bx = this.x, by = this.y, bz = this.z, bw = this.w;
    const half_dt = dt * 0.5;
    target.x += half_dt * (ax * bw + ay * bz - az * by);
    target.y += half_dt * (ay * bw + az * bx - ax * bz);
    target.z += half_dt * (az * bw + ax * by - ay * bx);
    target.w += half_dt * (-ax * bx - ay * by - az * bz);
    return target;
  }
};
var sfv_t1 = new Vec3();
var sfv_t2 = new Vec3();
var SHAPE_TYPES = {
  /** SPHERE */
  SPHERE: 1,
  /** PLANE */
  PLANE: 2,
  /** BOX */
  BOX: 4,
  /** COMPOUND */
  COMPOUND: 8,
  /** CONVEXPOLYHEDRON */
  CONVEXPOLYHEDRON: 16,
  /** HEIGHTFIELD */
  HEIGHTFIELD: 32,
  /** PARTICLE */
  PARTICLE: 64,
  /** CYLINDER */
  CYLINDER: 128,
  /** TRIMESH */
  TRIMESH: 256
};
var Shape = class _Shape {
  /**
   * Identifier of the Shape.
   */
  /**
   * The type of this shape. Must be set to an int > 0 by subclasses.
   */
  /**
   * The local bounding sphere radius of this shape.
   */
  /**
   * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled.
   * @default true
   */
  /**
   * @default 1
   */
  /**
   * @default -1
   */
  /**
   * Optional material of the shape that regulates contact properties.
   */
  /**
   * The body to which the shape is added to.
   */
  /**
   * All the Shape types.
   */
  constructor(options) {
    if (options === void 0) {
      options = {};
    }
    this.id = _Shape.idCounter++;
    this.type = options.type || 0;
    this.boundingSphereRadius = 0;
    this.collisionResponse = options.collisionResponse ? options.collisionResponse : true;
    this.collisionFilterGroup = options.collisionFilterGroup !== void 0 ? options.collisionFilterGroup : 1;
    this.collisionFilterMask = options.collisionFilterMask !== void 0 ? options.collisionFilterMask : -1;
    this.material = options.material ? options.material : null;
    this.body = null;
  }
  /**
   * Computes the bounding sphere radius.
   * The result is stored in the property `.boundingSphereRadius`
   */
  updateBoundingSphereRadius() {
    throw `computeBoundingSphereRadius() not implemented for shape type ${this.type}`;
  }
  /**
   * Get the volume of this shape
   */
  volume() {
    throw `volume() not implemented for shape type ${this.type}`;
  }
  /**
   * Calculates the inertia in the local frame for this shape.
   * @see http://en.wikipedia.org/wiki/List_of_moments_of_inertia
   */
  calculateLocalInertia(mass, target) {
    throw `calculateLocalInertia() not implemented for shape type ${this.type}`;
  }
  /**
   * @todo use abstract for these kind of methods
   */
  calculateWorldAABB(pos, quat, min2, max2) {
    throw `calculateWorldAABB() not implemented for shape type ${this.type}`;
  }
};
Shape.idCounter = 0;
Shape.types = SHAPE_TYPES;
var Transform = class _Transform {
  /**
   * position
   */
  /**
   * quaternion
   */
  constructor(options) {
    if (options === void 0) {
      options = {};
    }
    this.position = new Vec3();
    this.quaternion = new Quaternion();
    if (options.position) {
      this.position.copy(options.position);
    }
    if (options.quaternion) {
      this.quaternion.copy(options.quaternion);
    }
  }
  /**
   * Get a global point in local transform coordinates.
   */
  pointToLocal(worldPoint, result) {
    return _Transform.pointToLocalFrame(this.position, this.quaternion, worldPoint, result);
  }
  /**
   * Get a local point in global transform coordinates.
   */
  pointToWorld(localPoint, result) {
    return _Transform.pointToWorldFrame(this.position, this.quaternion, localPoint, result);
  }
  /**
   * vectorToWorldFrame
   */
  vectorToWorldFrame(localVector, result) {
    if (result === void 0) {
      result = new Vec3();
    }
    this.quaternion.vmult(localVector, result);
    return result;
  }
  /**
   * pointToLocalFrame
   */
  static pointToLocalFrame(position, quaternion, worldPoint, result) {
    if (result === void 0) {
      result = new Vec3();
    }
    worldPoint.vsub(position, result);
    quaternion.conjugate(tmpQuat$1);
    tmpQuat$1.vmult(result, result);
    return result;
  }
  /**
   * pointToWorldFrame
   */
  static pointToWorldFrame(position, quaternion, localPoint, result) {
    if (result === void 0) {
      result = new Vec3();
    }
    quaternion.vmult(localPoint, result);
    result.vadd(position, result);
    return result;
  }
  /**
   * vectorToWorldFrame
   */
  static vectorToWorldFrame(quaternion, localVector, result) {
    if (result === void 0) {
      result = new Vec3();
    }
    quaternion.vmult(localVector, result);
    return result;
  }
  /**
   * vectorToLocalFrame
   */
  static vectorToLocalFrame(position, quaternion, worldVector, result) {
    if (result === void 0) {
      result = new Vec3();
    }
    quaternion.w *= -1;
    quaternion.vmult(worldVector, result);
    quaternion.w *= -1;
    return result;
  }
};
var tmpQuat$1 = new Quaternion();
var ConvexPolyhedron = class _ConvexPolyhedron extends Shape {
  /** vertices */
  /**
   * Array of integer arrays, indicating which vertices each face consists of
   */
  /** faceNormals */
  /** worldVertices */
  /** worldVerticesNeedsUpdate */
  /** worldFaceNormals */
  /** worldFaceNormalsNeedsUpdate */
  /**
   * If given, these locally defined, normalized axes are the only ones being checked when doing separating axis check.
   */
  /** uniqueEdges */
  /**
   * @param vertices An array of Vec3's
   * @param faces Array of integer arrays, describing which vertices that is included in each face.
   */
  constructor(props) {
    if (props === void 0) {
      props = {};
    }
    const {
      vertices = [],
      faces = [],
      normals = [],
      axes,
      boundingSphereRadius
    } = props;
    super({
      type: Shape.types.CONVEXPOLYHEDRON
    });
    this.vertices = vertices;
    this.faces = faces;
    this.faceNormals = normals;
    if (this.faceNormals.length === 0) {
      this.computeNormals();
    }
    if (!boundingSphereRadius) {
      this.updateBoundingSphereRadius();
    } else {
      this.boundingSphereRadius = boundingSphereRadius;
    }
    this.worldVertices = [];
    this.worldVerticesNeedsUpdate = true;
    this.worldFaceNormals = [];
    this.worldFaceNormalsNeedsUpdate = true;
    this.uniqueAxes = axes ? axes.slice() : null;
    this.uniqueEdges = [];
    this.computeEdges();
  }
  /**
   * Computes uniqueEdges
   */
  computeEdges() {
    const faces = this.faces;
    const vertices = this.vertices;
    const edges = this.uniqueEdges;
    edges.length = 0;
    const edge = new Vec3();
    for (let i = 0; i !== faces.length; i++) {
      const face = faces[i];
      const numVertices = face.length;
      for (let j = 0; j !== numVertices; j++) {
        const k = (j + 1) % numVertices;
        vertices[face[j]].vsub(vertices[face[k]], edge);
        edge.normalize();
        let found = false;
        for (let p = 0; p !== edges.length; p++) {
          if (edges[p].almostEquals(edge) || edges[p].almostEquals(edge)) {
            found = true;
            break;
          }
        }
        if (!found) {
          edges.push(edge.clone());
        }
      }
    }
  }
  /**
   * Compute the normals of the faces.
   * Will reuse existing Vec3 objects in the `faceNormals` array if they exist.
   */
  computeNormals() {
    this.faceNormals.length = this.faces.length;
    for (let i = 0; i < this.faces.length; i++) {
      for (let j = 0; j < this.faces[i].length; j++) {
        if (!this.vertices[this.faces[i][j]]) {
          throw new Error(`Vertex ${this.faces[i][j]} not found!`);
        }
      }
      const n = this.faceNormals[i] || new Vec3();
      this.getFaceNormal(i, n);
      n.negate(n);
      this.faceNormals[i] = n;
      const vertex = this.vertices[this.faces[i][0]];
      if (n.dot(vertex) < 0) {
        console.error(`.faceNormals[${i}] = Vec3(${n.toString()}) looks like it points into the shape? The vertices follow. Make sure they are ordered CCW around the normal, using the right hand rule.`);
        for (let j = 0; j < this.faces[i].length; j++) {
          console.warn(`.vertices[${this.faces[i][j]}] = Vec3(${this.vertices[this.faces[i][j]].toString()})`);
        }
      }
    }
  }
  /**
   * Compute the normal of a face from its vertices
   */
  getFaceNormal(i, target) {
    const f = this.faces[i];
    const va2 = this.vertices[f[0]];
    const vb2 = this.vertices[f[1]];
    const vc2 = this.vertices[f[2]];
    _ConvexPolyhedron.computeNormal(va2, vb2, vc2, target);
  }
  /**
   * Get face normal given 3 vertices
   */
  static computeNormal(va2, vb2, vc2, target) {
    const cb2 = new Vec3();
    const ab2 = new Vec3();
    vb2.vsub(va2, ab2);
    vc2.vsub(vb2, cb2);
    cb2.cross(ab2, target);
    if (!target.isZero()) {
      target.normalize();
    }
  }
  /**
   * @param minDist Clamp distance
   * @param result The an array of contact point objects, see clipFaceAgainstHull
   */
  clipAgainstHull(posA, quatA, hullB, posB, quatB, separatingNormal, minDist, maxDist, result) {
    const WorldNormal = new Vec3();
    let closestFaceB = -1;
    let dmax = -Number.MAX_VALUE;
    for (let face = 0; face < hullB.faces.length; face++) {
      WorldNormal.copy(hullB.faceNormals[face]);
      quatB.vmult(WorldNormal, WorldNormal);
      const d = WorldNormal.dot(separatingNormal);
      if (d > dmax) {
        dmax = d;
        closestFaceB = face;
      }
    }
    const worldVertsB1 = [];
    for (let i = 0; i < hullB.faces[closestFaceB].length; i++) {
      const b2 = hullB.vertices[hullB.faces[closestFaceB][i]];
      const worldb = new Vec3();
      worldb.copy(b2);
      quatB.vmult(worldb, worldb);
      posB.vadd(worldb, worldb);
      worldVertsB1.push(worldb);
    }
    if (closestFaceB >= 0) {
      this.clipFaceAgainstHull(separatingNormal, posA, quatA, worldVertsB1, minDist, maxDist, result);
    }
  }
  /**
   * Find the separating axis between this hull and another
   * @param target The target vector to save the axis in
   * @return Returns false if a separation is found, else true
   */
  findSeparatingAxis(hullB, posA, quatA, posB, quatB, target, faceListA, faceListB) {
    const faceANormalWS3 = new Vec3();
    const Worldnormal1 = new Vec3();
    const deltaC = new Vec3();
    const worldEdge0 = new Vec3();
    const worldEdge1 = new Vec3();
    const Cross = new Vec3();
    let dmin = Number.MAX_VALUE;
    const hullA = this;
    if (!hullA.uniqueAxes) {
      const numFacesA = faceListA ? faceListA.length : hullA.faces.length;
      for (let i = 0; i < numFacesA; i++) {
        const fi = faceListA ? faceListA[i] : i;
        faceANormalWS3.copy(hullA.faceNormals[fi]);
        quatA.vmult(faceANormalWS3, faceANormalWS3);
        const d = hullA.testSepAxis(faceANormalWS3, hullB, posA, quatA, posB, quatB);
        if (d === false) {
          return false;
        }
        if (d < dmin) {
          dmin = d;
          target.copy(faceANormalWS3);
        }
      }
    } else {
      for (let i = 0; i !== hullA.uniqueAxes.length; i++) {
        quatA.vmult(hullA.uniqueAxes[i], faceANormalWS3);
        const d = hullA.testSepAxis(faceANormalWS3, hullB, posA, quatA, posB, quatB);
        if (d === false) {
          return false;
        }
        if (d < dmin) {
          dmin = d;
          target.copy(faceANormalWS3);
        }
      }
    }
    if (!hullB.uniqueAxes) {
      const numFacesB = faceListB ? faceListB.length : hullB.faces.length;
      for (let i = 0; i < numFacesB; i++) {
        const fi = faceListB ? faceListB[i] : i;
        Worldnormal1.copy(hullB.faceNormals[fi]);
        quatB.vmult(Worldnormal1, Worldnormal1);
        const d = hullA.testSepAxis(Worldnormal1, hullB, posA, quatA, posB, quatB);
        if (d === false) {
          return false;
        }
        if (d < dmin) {
          dmin = d;
          target.copy(Worldnormal1);
        }
      }
    } else {
      for (let i = 0; i !== hullB.uniqueAxes.length; i++) {
        quatB.vmult(hullB.uniqueAxes[i], Worldnormal1);
        const d = hullA.testSepAxis(Worldnormal1, hullB, posA, quatA, posB, quatB);
        if (d === false) {
          return false;
        }
        if (d < dmin) {
          dmin = d;
          target.copy(Worldnormal1);
        }
      }
    }
    for (let e0 = 0; e0 !== hullA.uniqueEdges.length; e0++) {
      quatA.vmult(hullA.uniqueEdges[e0], worldEdge0);
      for (let e1 = 0; e1 !== hullB.uniqueEdges.length; e1++) {
        quatB.vmult(hullB.uniqueEdges[e1], worldEdge1);
        worldEdge0.cross(worldEdge1, Cross);
        if (!Cross.almostZero()) {
          Cross.normalize();
          const dist2 = hullA.testSepAxis(Cross, hullB, posA, quatA, posB, quatB);
          if (dist2 === false) {
            return false;
          }
          if (dist2 < dmin) {
            dmin = dist2;
            target.copy(Cross);
          }
        }
      }
    }
    posB.vsub(posA, deltaC);
    if (deltaC.dot(target) > 0) {
      target.negate(target);
    }
    return true;
  }
  /**
   * Test separating axis against two hulls. Both hulls are projected onto the axis and the overlap size is returned if there is one.
   * @return The overlap depth, or FALSE if no penetration.
   */
  testSepAxis(axis, hullB, posA, quatA, posB, quatB) {
    const hullA = this;
    _ConvexPolyhedron.project(hullA, axis, posA, quatA, maxminA);
    _ConvexPolyhedron.project(hullB, axis, posB, quatB, maxminB);
    const maxA = maxminA[0];
    const minA = maxminA[1];
    const maxB = maxminB[0];
    const minB = maxminB[1];
    if (maxA < minB || maxB < minA) {
      return false;
    }
    const d0 = maxA - minB;
    const d1 = maxB - minA;
    const depth = d0 < d1 ? d0 : d1;
    return depth;
  }
  /**
   * calculateLocalInertia
   */
  calculateLocalInertia(mass, target) {
    const aabbmax = new Vec3();
    const aabbmin = new Vec3();
    this.computeLocalAABB(aabbmin, aabbmax);
    const x = aabbmax.x - aabbmin.x;
    const y = aabbmax.y - aabbmin.y;
    const z = aabbmax.z - aabbmin.z;
    target.x = 1 / 12 * mass * (2 * y * 2 * y + 2 * z * 2 * z);
    target.y = 1 / 12 * mass * (2 * x * 2 * x + 2 * z * 2 * z);
    target.z = 1 / 12 * mass * (2 * y * 2 * y + 2 * x * 2 * x);
  }
  /**
   * @param face_i Index of the face
   */
  getPlaneConstantOfFace(face_i) {
    const f = this.faces[face_i];
    const n = this.faceNormals[face_i];
    const v = this.vertices[f[0]];
    const c2 = -n.dot(v);
    return c2;
  }
  /**
   * Clip a face against a hull.
   * @param worldVertsB1 An array of Vec3 with vertices in the world frame.
   * @param minDist Distance clamping
   * @param Array result Array to store resulting contact points in. Will be objects with properties: point, depth, normal. These are represented in world coordinates.
   */
  clipFaceAgainstHull(separatingNormal, posA, quatA, worldVertsB1, minDist, maxDist, result) {
    const faceANormalWS = new Vec3();
    const edge0 = new Vec3();
    const WorldEdge0 = new Vec3();
    const worldPlaneAnormal1 = new Vec3();
    const planeNormalWS1 = new Vec3();
    const worldA1 = new Vec3();
    const localPlaneNormal = new Vec3();
    const planeNormalWS = new Vec3();
    const hullA = this;
    const worldVertsB2 = [];
    const pVtxIn = worldVertsB1;
    const pVtxOut = worldVertsB2;
    let closestFaceA = -1;
    let dmin = Number.MAX_VALUE;
    for (let face = 0; face < hullA.faces.length; face++) {
      faceANormalWS.copy(hullA.faceNormals[face]);
      quatA.vmult(faceANormalWS, faceANormalWS);
      const d = faceANormalWS.dot(separatingNormal);
      if (d < dmin) {
        dmin = d;
        closestFaceA = face;
      }
    }
    if (closestFaceA < 0) {
      return;
    }
    const polyA = hullA.faces[closestFaceA];
    polyA.connectedFaces = [];
    for (let i = 0; i < hullA.faces.length; i++) {
      for (let j = 0; j < hullA.faces[i].length; j++) {
        if (
          /* Sharing a vertex*/
          polyA.indexOf(hullA.faces[i][j]) !== -1 && /* Not the one we are looking for connections from */
          i !== closestFaceA && /* Not already added */
          polyA.connectedFaces.indexOf(i) === -1
        ) {
          polyA.connectedFaces.push(i);
        }
      }
    }
    const numVerticesA = polyA.length;
    for (let i = 0; i < numVerticesA; i++) {
      const a2 = hullA.vertices[polyA[i]];
      const b2 = hullA.vertices[polyA[(i + 1) % numVerticesA]];
      a2.vsub(b2, edge0);
      WorldEdge0.copy(edge0);
      quatA.vmult(WorldEdge0, WorldEdge0);
      posA.vadd(WorldEdge0, WorldEdge0);
      worldPlaneAnormal1.copy(this.faceNormals[closestFaceA]);
      quatA.vmult(worldPlaneAnormal1, worldPlaneAnormal1);
      posA.vadd(worldPlaneAnormal1, worldPlaneAnormal1);
      WorldEdge0.cross(worldPlaneAnormal1, planeNormalWS1);
      planeNormalWS1.negate(planeNormalWS1);
      worldA1.copy(a2);
      quatA.vmult(worldA1, worldA1);
      posA.vadd(worldA1, worldA1);
      const otherFace = polyA.connectedFaces[i];
      localPlaneNormal.copy(this.faceNormals[otherFace]);
      const localPlaneEq2 = this.getPlaneConstantOfFace(otherFace);
      planeNormalWS.copy(localPlaneNormal);
      quatA.vmult(planeNormalWS, planeNormalWS);
      const planeEqWS2 = localPlaneEq2 - planeNormalWS.dot(posA);
      this.clipFaceAgainstPlane(pVtxIn, pVtxOut, planeNormalWS, planeEqWS2);
      while (pVtxIn.length) {
        pVtxIn.shift();
      }
      while (pVtxOut.length) {
        pVtxIn.push(pVtxOut.shift());
      }
    }
    localPlaneNormal.copy(this.faceNormals[closestFaceA]);
    const localPlaneEq = this.getPlaneConstantOfFace(closestFaceA);
    planeNormalWS.copy(localPlaneNormal);
    quatA.vmult(planeNormalWS, planeNormalWS);
    const planeEqWS = localPlaneEq - planeNormalWS.dot(posA);
    for (let i = 0; i < pVtxIn.length; i++) {
      let depth = planeNormalWS.dot(pVtxIn[i]) + planeEqWS;
      if (depth <= minDist) {
        console.log(`clamped: depth=${depth} to minDist=${minDist}`);
        depth = minDist;
      }
      if (depth <= maxDist) {
        const point = pVtxIn[i];
        if (depth <= 1e-6) {
          const p = {
            point,
            normal: planeNormalWS,
            depth
          };
          result.push(p);
        }
      }
    }
  }
  /**
   * Clip a face in a hull against the back of a plane.
   * @param planeConstant The constant in the mathematical plane equation
   */
  clipFaceAgainstPlane(inVertices, outVertices, planeNormal, planeConstant) {
    let n_dot_first;
    let n_dot_last;
    const numVerts = inVertices.length;
    if (numVerts < 2) {
      return outVertices;
    }
    let firstVertex = inVertices[inVertices.length - 1];
    let lastVertex = inVertices[0];
    n_dot_first = planeNormal.dot(firstVertex) + planeConstant;
    for (let vi = 0; vi < numVerts; vi++) {
      lastVertex = inVertices[vi];
      n_dot_last = planeNormal.dot(lastVertex) + planeConstant;
      if (n_dot_first < 0) {
        if (n_dot_last < 0) {
          const newv = new Vec3();
          newv.copy(lastVertex);
          outVertices.push(newv);
        } else {
          const newv = new Vec3();
          firstVertex.lerp(lastVertex, n_dot_first / (n_dot_first - n_dot_last), newv);
          outVertices.push(newv);
        }
      } else {
        if (n_dot_last < 0) {
          const newv = new Vec3();
          firstVertex.lerp(lastVertex, n_dot_first / (n_dot_first - n_dot_last), newv);
          outVertices.push(newv);
          outVertices.push(lastVertex);
        }
      }
      firstVertex = lastVertex;
      n_dot_first = n_dot_last;
    }
    return outVertices;
  }
  /**
   * Updates `.worldVertices` and sets `.worldVerticesNeedsUpdate` to false.
   */
  computeWorldVertices(position, quat) {
    while (this.worldVertices.length < this.vertices.length) {
      this.worldVertices.push(new Vec3());
    }
    const verts = this.vertices;
    const worldVerts = this.worldVertices;
    for (let i = 0; i !== this.vertices.length; i++) {
      quat.vmult(verts[i], worldVerts[i]);
      position.vadd(worldVerts[i], worldVerts[i]);
    }
    this.worldVerticesNeedsUpdate = false;
  }
  computeLocalAABB(aabbmin, aabbmax) {
    const vertices = this.vertices;
    aabbmin.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    aabbmax.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
    for (let i = 0; i < this.vertices.length; i++) {
      const v = vertices[i];
      if (v.x < aabbmin.x) {
        aabbmin.x = v.x;
      } else if (v.x > aabbmax.x) {
        aabbmax.x = v.x;
      }
      if (v.y < aabbmin.y) {
        aabbmin.y = v.y;
      } else if (v.y > aabbmax.y) {
        aabbmax.y = v.y;
      }
      if (v.z < aabbmin.z) {
        aabbmin.z = v.z;
      } else if (v.z > aabbmax.z) {
        aabbmax.z = v.z;
      }
    }
  }
  /**
   * Updates `worldVertices` and sets `worldVerticesNeedsUpdate` to false.
   */
  computeWorldFaceNormals(quat) {
    const N = this.faceNormals.length;
    while (this.worldFaceNormals.length < N) {
      this.worldFaceNormals.push(new Vec3());
    }
    const normals = this.faceNormals;
    const worldNormals = this.worldFaceNormals;
    for (let i = 0; i !== N; i++) {
      quat.vmult(normals[i], worldNormals[i]);
    }
    this.worldFaceNormalsNeedsUpdate = false;
  }
  /**
   * updateBoundingSphereRadius
   */
  updateBoundingSphereRadius() {
    let max2 = 0;
    const verts = this.vertices;
    for (let i = 0; i !== verts.length; i++) {
      const norm2 = verts[i].lengthSquared();
      if (norm2 > max2) {
        max2 = norm2;
      }
    }
    this.boundingSphereRadius = Math.sqrt(max2);
  }
  /**
   * calculateWorldAABB
   */
  calculateWorldAABB(pos, quat, min2, max2) {
    const verts = this.vertices;
    let minx;
    let miny;
    let minz;
    let maxx;
    let maxy;
    let maxz;
    let tempWorldVertex = new Vec3();
    for (let i = 0; i < verts.length; i++) {
      tempWorldVertex.copy(verts[i]);
      quat.vmult(tempWorldVertex, tempWorldVertex);
      pos.vadd(tempWorldVertex, tempWorldVertex);
      const v = tempWorldVertex;
      if (minx === void 0 || v.x < minx) {
        minx = v.x;
      }
      if (maxx === void 0 || v.x > maxx) {
        maxx = v.x;
      }
      if (miny === void 0 || v.y < miny) {
        miny = v.y;
      }
      if (maxy === void 0 || v.y > maxy) {
        maxy = v.y;
      }
      if (minz === void 0 || v.z < minz) {
        minz = v.z;
      }
      if (maxz === void 0 || v.z > maxz) {
        maxz = v.z;
      }
    }
    min2.set(minx, miny, minz);
    max2.set(maxx, maxy, maxz);
  }
  /**
   * Get approximate convex volume
   */
  volume() {
    return 4 * Math.PI * this.boundingSphereRadius / 3;
  }
  /**
   * Get an average of all the vertices positions
   */
  getAveragePointLocal(target) {
    if (target === void 0) {
      target = new Vec3();
    }
    const verts = this.vertices;
    for (let i = 0; i < verts.length; i++) {
      target.vadd(verts[i], target);
    }
    target.scale(1 / verts.length, target);
    return target;
  }
  /**
   * Transform all local points. Will change the .vertices
   */
  transformAllPoints(offset, quat) {
    const n = this.vertices.length;
    const verts = this.vertices;
    if (quat) {
      for (let i = 0; i < n; i++) {
        const v = verts[i];
        quat.vmult(v, v);
      }
      for (let i = 0; i < this.faceNormals.length; i++) {
        const v = this.faceNormals[i];
        quat.vmult(v, v);
      }
    }
    if (offset) {
      for (let i = 0; i < n; i++) {
        const v = verts[i];
        v.vadd(offset, v);
      }
    }
  }
  /**
   * Checks whether p is inside the polyhedra. Must be in local coords.
   * The point lies outside of the convex hull of the other points if and only if the direction
   * of all the vectors from it to those other points are on less than one half of a sphere around it.
   * @param p A point given in local coordinates
   */
  pointIsInside(p) {
    const verts = this.vertices;
    const faces = this.faces;
    const normals = this.faceNormals;
    const positiveResult = null;
    const pointInside = new Vec3();
    this.getAveragePointLocal(pointInside);
    for (let i = 0; i < this.faces.length; i++) {
      let n = normals[i];
      const v = verts[faces[i][0]];
      const vToP = new Vec3();
      p.vsub(v, vToP);
      const r1 = n.dot(vToP);
      const vToPointInside = new Vec3();
      pointInside.vsub(v, vToPointInside);
      const r2 = n.dot(vToPointInside);
      if (r1 < 0 && r2 > 0 || r1 > 0 && r2 < 0) {
        return false;
      }
    }
    return positiveResult ? 1 : -1;
  }
  /**
   * Get max and min dot product of a convex hull at position (pos,quat) projected onto an axis.
   * Results are saved in the array maxmin.
   * @param result result[0] and result[1] will be set to maximum and minimum, respectively.
   */
  static project(shape, axis, pos, quat, result) {
    const n = shape.vertices.length;
    project_worldVertex;
    const localAxis = project_localAxis;
    let max2 = 0;
    let min2 = 0;
    const localOrigin = project_localOrigin;
    const vs = shape.vertices;
    localOrigin.setZero();
    Transform.vectorToLocalFrame(pos, quat, axis, localAxis);
    Transform.pointToLocalFrame(pos, quat, localOrigin, localOrigin);
    const add7 = localOrigin.dot(localAxis);
    min2 = max2 = vs[0].dot(localAxis);
    for (let i = 1; i < n; i++) {
      const val = vs[i].dot(localAxis);
      if (val > max2) {
        max2 = val;
      }
      if (val < min2) {
        min2 = val;
      }
    }
    min2 -= add7;
    max2 -= add7;
    if (min2 > max2) {
      const temp = min2;
      min2 = max2;
      max2 = temp;
    }
    result[0] = max2;
    result[1] = min2;
  }
};
var maxminA = [];
var maxminB = [];
var project_worldVertex = new Vec3();
var project_localAxis = new Vec3();
var project_localOrigin = new Vec3();
var Box = class _Box extends Shape {
  /**
   * The half extents of the box.
   */
  /**
   * Used by the contact generator to make contacts with other convex polyhedra for example.
   */
  constructor(halfExtents) {
    super({
      type: Shape.types.BOX
    });
    this.halfExtents = halfExtents;
    this.convexPolyhedronRepresentation = null;
    this.updateConvexPolyhedronRepresentation();
    this.updateBoundingSphereRadius();
  }
  /**
   * Updates the local convex polyhedron representation used for some collisions.
   */
  updateConvexPolyhedronRepresentation() {
    const sx = this.halfExtents.x;
    const sy = this.halfExtents.y;
    const sz = this.halfExtents.z;
    const V = Vec3;
    const vertices = [new V(-sx, -sy, -sz), new V(sx, -sy, -sz), new V(sx, sy, -sz), new V(-sx, sy, -sz), new V(-sx, -sy, sz), new V(sx, -sy, sz), new V(sx, sy, sz), new V(-sx, sy, sz)];
    const faces = [
      [3, 2, 1, 0],
      // -z
      [4, 5, 6, 7],
      // +z
      [5, 4, 0, 1],
      // -y
      [2, 3, 7, 6],
      // +y
      [0, 4, 7, 3],
      // -x
      [1, 2, 6, 5]
      // +x
    ];
    const axes = [new V(0, 0, 1), new V(0, 1, 0), new V(1, 0, 0)];
    const h = new ConvexPolyhedron({
      vertices,
      faces,
      axes
    });
    this.convexPolyhedronRepresentation = h;
    h.material = this.material;
  }
  /**
   * Calculate the inertia of the box.
   */
  calculateLocalInertia(mass, target) {
    if (target === void 0) {
      target = new Vec3();
    }
    _Box.calculateInertia(this.halfExtents, mass, target);
    return target;
  }
  static calculateInertia(halfExtents, mass, target) {
    const e = halfExtents;
    target.x = 1 / 12 * mass * (2 * e.y * 2 * e.y + 2 * e.z * 2 * e.z);
    target.y = 1 / 12 * mass * (2 * e.x * 2 * e.x + 2 * e.z * 2 * e.z);
    target.z = 1 / 12 * mass * (2 * e.y * 2 * e.y + 2 * e.x * 2 * e.x);
  }
  /**
   * Get the box 6 side normals
   * @param sixTargetVectors An array of 6 vectors, to store the resulting side normals in.
   * @param quat Orientation to apply to the normal vectors. If not provided, the vectors will be in respect to the local frame.
   */
  getSideNormals(sixTargetVectors, quat) {
    const sides = sixTargetVectors;
    const ex = this.halfExtents;
    sides[0].set(ex.x, 0, 0);
    sides[1].set(0, ex.y, 0);
    sides[2].set(0, 0, ex.z);
    sides[3].set(-ex.x, 0, 0);
    sides[4].set(0, -ex.y, 0);
    sides[5].set(0, 0, -ex.z);
    if (quat !== void 0) {
      for (let i = 0; i !== sides.length; i++) {
        quat.vmult(sides[i], sides[i]);
      }
    }
    return sides;
  }
  /**
   * Returns the volume of the box.
   */
  volume() {
    return 8 * this.halfExtents.x * this.halfExtents.y * this.halfExtents.z;
  }
  /**
   * updateBoundingSphereRadius
   */
  updateBoundingSphereRadius() {
    this.boundingSphereRadius = this.halfExtents.length();
  }
  /**
   * forEachWorldCorner
   */
  forEachWorldCorner(pos, quat, callback) {
    const e = this.halfExtents;
    const corners = [[e.x, e.y, e.z], [-e.x, e.y, e.z], [-e.x, -e.y, e.z], [-e.x, -e.y, -e.z], [e.x, -e.y, -e.z], [e.x, e.y, -e.z], [-e.x, e.y, -e.z], [e.x, -e.y, e.z]];
    for (let i = 0; i < corners.length; i++) {
      worldCornerTempPos.set(corners[i][0], corners[i][1], corners[i][2]);
      quat.vmult(worldCornerTempPos, worldCornerTempPos);
      pos.vadd(worldCornerTempPos, worldCornerTempPos);
      callback(worldCornerTempPos.x, worldCornerTempPos.y, worldCornerTempPos.z);
    }
  }
  /**
   * calculateWorldAABB
   */
  calculateWorldAABB(pos, quat, min2, max2) {
    const e = this.halfExtents;
    worldCornersTemp[0].set(e.x, e.y, e.z);
    worldCornersTemp[1].set(-e.x, e.y, e.z);
    worldCornersTemp[2].set(-e.x, -e.y, e.z);
    worldCornersTemp[3].set(-e.x, -e.y, -e.z);
    worldCornersTemp[4].set(e.x, -e.y, -e.z);
    worldCornersTemp[5].set(e.x, e.y, -e.z);
    worldCornersTemp[6].set(-e.x, e.y, -e.z);
    worldCornersTemp[7].set(e.x, -e.y, e.z);
    const wc = worldCornersTemp[0];
    quat.vmult(wc, wc);
    pos.vadd(wc, wc);
    max2.copy(wc);
    min2.copy(wc);
    for (let i = 1; i < 8; i++) {
      const wc2 = worldCornersTemp[i];
      quat.vmult(wc2, wc2);
      pos.vadd(wc2, wc2);
      const x = wc2.x;
      const y = wc2.y;
      const z = wc2.z;
      if (x > max2.x) {
        max2.x = x;
      }
      if (y > max2.y) {
        max2.y = y;
      }
      if (z > max2.z) {
        max2.z = z;
      }
      if (x < min2.x) {
        min2.x = x;
      }
      if (y < min2.y) {
        min2.y = y;
      }
      if (z < min2.z) {
        min2.z = z;
      }
    }
  }
};
var worldCornerTempPos = new Vec3();
var worldCornersTemp = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];
var BODY_TYPES = {
  /** DYNAMIC */
  DYNAMIC: 1,
  /** STATIC */
  STATIC: 2,
  /** KINEMATIC */
  KINEMATIC: 4
};
var BODY_SLEEP_STATES = {
  /** AWAKE */
  AWAKE: 0,
  /** SLEEPY */
  SLEEPY: 1,
  /** SLEEPING */
  SLEEPING: 2
};
var Body = class _Body extends EventTarget {
  /**
   * Dispatched after two bodies collide. This event is dispatched on each
   * of the two bodies involved in the collision.
   * @event collide
   * @param body The body that was involved in the collision.
   * @param contact The details of the collision.
   */
  /**
   * A dynamic body is fully simulated. Can be moved manually by the user, but normally they move according to forces. A dynamic body can collide with all body types. A dynamic body always has finite, non-zero mass.
   */
  /**
   * A static body does not move during simulation and behaves as if it has infinite mass. Static bodies can be moved manually by setting the position of the body. The velocity of a static body is always zero. Static bodies do not collide with other static or kinematic bodies.
   */
  /**
   * A kinematic body moves under simulation according to its velocity. They do not respond to forces. They can be moved manually, but normally a kinematic body is moved by setting its velocity. A kinematic body behaves as if it has infinite mass. Kinematic bodies do not collide with other static or kinematic bodies.
   */
  /**
   * AWAKE
   */
  /**
   * SLEEPY
   */
  /**
   * SLEEPING
   */
  /**
   * Dispatched after a sleeping body has woken up.
   * @event wakeup
   */
  /**
   * Dispatched after a body has gone in to the sleepy state.
   * @event sleepy
   */
  /**
   * Dispatched after a body has fallen asleep.
   * @event sleep
   */
  constructor(options) {
    if (options === void 0) {
      options = {};
    }
    super();
    this.id = _Body.idCounter++;
    this.index = -1;
    this.world = null;
    this.vlambda = new Vec3();
    this.collisionFilterGroup = typeof options.collisionFilterGroup === "number" ? options.collisionFilterGroup : 1;
    this.collisionFilterMask = typeof options.collisionFilterMask === "number" ? options.collisionFilterMask : -1;
    this.collisionResponse = typeof options.collisionResponse === "boolean" ? options.collisionResponse : true;
    this.position = new Vec3();
    this.previousPosition = new Vec3();
    this.interpolatedPosition = new Vec3();
    this.initPosition = new Vec3();
    if (options.position) {
      this.position.copy(options.position);
      this.previousPosition.copy(options.position);
      this.interpolatedPosition.copy(options.position);
      this.initPosition.copy(options.position);
    }
    this.velocity = new Vec3();
    if (options.velocity) {
      this.velocity.copy(options.velocity);
    }
    this.initVelocity = new Vec3();
    this.force = new Vec3();
    const mass = typeof options.mass === "number" ? options.mass : 0;
    this.mass = mass;
    this.invMass = mass > 0 ? 1 / mass : 0;
    this.material = options.material || null;
    this.linearDamping = typeof options.linearDamping === "number" ? options.linearDamping : 0.01;
    this.type = mass <= 0 ? _Body.STATIC : _Body.DYNAMIC;
    if (typeof options.type === typeof _Body.STATIC) {
      this.type = options.type;
    }
    this.allowSleep = typeof options.allowSleep !== "undefined" ? options.allowSleep : true;
    this.sleepState = _Body.AWAKE;
    this.sleepSpeedLimit = typeof options.sleepSpeedLimit !== "undefined" ? options.sleepSpeedLimit : 0.1;
    this.sleepTimeLimit = typeof options.sleepTimeLimit !== "undefined" ? options.sleepTimeLimit : 1;
    this.timeLastSleepy = 0;
    this.wakeUpAfterNarrowphase = false;
    this.torque = new Vec3();
    this.quaternion = new Quaternion();
    this.initQuaternion = new Quaternion();
    this.previousQuaternion = new Quaternion();
    this.interpolatedQuaternion = new Quaternion();
    if (options.quaternion) {
      this.quaternion.copy(options.quaternion);
      this.initQuaternion.copy(options.quaternion);
      this.previousQuaternion.copy(options.quaternion);
      this.interpolatedQuaternion.copy(options.quaternion);
    }
    this.angularVelocity = new Vec3();
    if (options.angularVelocity) {
      this.angularVelocity.copy(options.angularVelocity);
    }
    this.initAngularVelocity = new Vec3();
    this.shapes = [];
    this.shapeOffsets = [];
    this.shapeOrientations = [];
    this.inertia = new Vec3();
    this.invInertia = new Vec3();
    this.invInertiaWorld = new Mat3();
    this.invMassSolve = 0;
    this.invInertiaSolve = new Vec3();
    this.invInertiaWorldSolve = new Mat3();
    this.fixedRotation = typeof options.fixedRotation !== "undefined" ? options.fixedRotation : false;
    this.angularDamping = typeof options.angularDamping !== "undefined" ? options.angularDamping : 0.01;
    this.linearFactor = new Vec3(1, 1, 1);
    if (options.linearFactor) {
      this.linearFactor.copy(options.linearFactor);
    }
    this.angularFactor = new Vec3(1, 1, 1);
    if (options.angularFactor) {
      this.angularFactor.copy(options.angularFactor);
    }
    this.aabb = new AABB();
    this.aabbNeedsUpdate = true;
    this.boundingRadius = 0;
    this.wlambda = new Vec3();
    this.isTrigger = Boolean(options.isTrigger);
    if (options.shape) {
      this.addShape(options.shape);
    }
    this.updateMassProperties();
  }
  /**
   * Wake the body up.
   */
  wakeUp() {
    const prevState = this.sleepState;
    this.sleepState = _Body.AWAKE;
    this.wakeUpAfterNarrowphase = false;
    if (prevState === _Body.SLEEPING) {
      this.dispatchEvent(_Body.wakeupEvent);
    }
  }
  /**
   * Force body sleep
   */
  sleep() {
    this.sleepState = _Body.SLEEPING;
    this.velocity.set(0, 0, 0);
    this.angularVelocity.set(0, 0, 0);
    this.wakeUpAfterNarrowphase = false;
  }
  /**
   * Called every timestep to update internal sleep timer and change sleep state if needed.
   * @param time The world time in seconds
   */
  sleepTick(time) {
    if (this.allowSleep) {
      const sleepState = this.sleepState;
      const speedSquared = this.velocity.lengthSquared() + this.angularVelocity.lengthSquared();
      const speedLimitSquared = this.sleepSpeedLimit ** 2;
      if (sleepState === _Body.AWAKE && speedSquared < speedLimitSquared) {
        this.sleepState = _Body.SLEEPY;
        this.timeLastSleepy = time;
        this.dispatchEvent(_Body.sleepyEvent);
      } else if (sleepState === _Body.SLEEPY && speedSquared > speedLimitSquared) {
        this.wakeUp();
      } else if (sleepState === _Body.SLEEPY && time - this.timeLastSleepy > this.sleepTimeLimit) {
        this.sleep();
        this.dispatchEvent(_Body.sleepEvent);
      }
    }
  }
  /**
   * If the body is sleeping, it should be immovable / have infinite mass during solve. We solve it by having a separate "solve mass".
   */
  updateSolveMassProperties() {
    if (this.sleepState === _Body.SLEEPING || this.type === _Body.KINEMATIC) {
      this.invMassSolve = 0;
      this.invInertiaSolve.setZero();
      this.invInertiaWorldSolve.setZero();
    } else {
      this.invMassSolve = this.invMass;
      this.invInertiaSolve.copy(this.invInertia);
      this.invInertiaWorldSolve.copy(this.invInertiaWorld);
    }
  }
  /**
   * Convert a world point to local body frame.
   */
  pointToLocalFrame(worldPoint, result) {
    if (result === void 0) {
      result = new Vec3();
    }
    worldPoint.vsub(this.position, result);
    this.quaternion.conjugate().vmult(result, result);
    return result;
  }
  /**
   * Convert a world vector to local body frame.
   */
  vectorToLocalFrame(worldVector, result) {
    if (result === void 0) {
      result = new Vec3();
    }
    this.quaternion.conjugate().vmult(worldVector, result);
    return result;
  }
  /**
   * Convert a local body point to world frame.
   */
  pointToWorldFrame(localPoint, result) {
    if (result === void 0) {
      result = new Vec3();
    }
    this.quaternion.vmult(localPoint, result);
    result.vadd(this.position, result);
    return result;
  }
  /**
   * Convert a local body point to world frame.
   */
  vectorToWorldFrame(localVector, result) {
    if (result === void 0) {
      result = new Vec3();
    }
    this.quaternion.vmult(localVector, result);
    return result;
  }
  /**
   * Add a shape to the body with a local offset and orientation.
   * @return The body object, for chainability.
   */
  addShape(shape, _offset, _orientation) {
    const offset = new Vec3();
    const orientation = new Quaternion();
    if (_offset) {
      offset.copy(_offset);
    }
    if (_orientation) {
      orientation.copy(_orientation);
    }
    this.shapes.push(shape);
    this.shapeOffsets.push(offset);
    this.shapeOrientations.push(orientation);
    this.updateMassProperties();
    this.updateBoundingRadius();
    this.aabbNeedsUpdate = true;
    shape.body = this;
    return this;
  }
  /**
   * Remove a shape from the body.
   * @return The body object, for chainability.
   */
  removeShape(shape) {
    const index = this.shapes.indexOf(shape);
    if (index === -1) {
      console.warn("Shape does not belong to the body");
      return this;
    }
    this.shapes.splice(index, 1);
    this.shapeOffsets.splice(index, 1);
    this.shapeOrientations.splice(index, 1);
    this.updateMassProperties();
    this.updateBoundingRadius();
    this.aabbNeedsUpdate = true;
    shape.body = null;
    return this;
  }
  /**
   * Update the bounding radius of the body. Should be done if any of the shapes are changed.
   */
  updateBoundingRadius() {
    const shapes = this.shapes;
    const shapeOffsets = this.shapeOffsets;
    const N = shapes.length;
    let radius = 0;
    for (let i = 0; i !== N; i++) {
      const shape = shapes[i];
      shape.updateBoundingSphereRadius();
      const offset = shapeOffsets[i].length();
      const r = shape.boundingSphereRadius;
      if (offset + r > radius) {
        radius = offset + r;
      }
    }
    this.boundingRadius = radius;
  }
  /**
   * Updates the .aabb
   */
  updateAABB() {
    const shapes = this.shapes;
    const shapeOffsets = this.shapeOffsets;
    const shapeOrientations = this.shapeOrientations;
    const N = shapes.length;
    const offset = tmpVec;
    const orientation = tmpQuat;
    const bodyQuat = this.quaternion;
    const aabb = this.aabb;
    const shapeAABB = updateAABB_shapeAABB;
    for (let i = 0; i !== N; i++) {
      const shape = shapes[i];
      bodyQuat.vmult(shapeOffsets[i], offset);
      offset.vadd(this.position, offset);
      bodyQuat.mult(shapeOrientations[i], orientation);
      shape.calculateWorldAABB(offset, orientation, shapeAABB.lowerBound, shapeAABB.upperBound);
      if (i === 0) {
        aabb.copy(shapeAABB);
      } else {
        aabb.extend(shapeAABB);
      }
    }
    this.aabbNeedsUpdate = false;
  }
  /**
   * Update `.inertiaWorld` and `.invInertiaWorld`
   */
  updateInertiaWorld(force) {
    const I = this.invInertia;
    if (I.x === I.y && I.y === I.z && !force)
      ;
    else {
      const m1 = uiw_m1;
      const m2 = uiw_m2;
      uiw_m3;
      m1.setRotationFromQuaternion(this.quaternion);
      m1.transpose(m2);
      m1.scale(I, m1);
      m1.mmult(m2, this.invInertiaWorld);
    }
  }
  /**
   * Apply force to a point of the body. This could for example be a point on the Body surface.
   * Applying force this way will add to Body.force and Body.torque.
   * @param force The amount of force to add.
   * @param relativePoint A point relative to the center of mass to apply the force on.
   */
  applyForce(force, relativePoint) {
    if (relativePoint === void 0) {
      relativePoint = new Vec3();
    }
    if (this.type !== _Body.DYNAMIC) {
      return;
    }
    if (this.sleepState === _Body.SLEEPING) {
      this.wakeUp();
    }
    const rotForce = Body_applyForce_rotForce;
    relativePoint.cross(force, rotForce);
    this.force.vadd(force, this.force);
    this.torque.vadd(rotForce, this.torque);
  }
  /**
   * Apply force to a local point in the body.
   * @param force The force vector to apply, defined locally in the body frame.
   * @param localPoint A local point in the body to apply the force on.
   */
  applyLocalForce(localForce, localPoint) {
    if (localPoint === void 0) {
      localPoint = new Vec3();
    }
    if (this.type !== _Body.DYNAMIC) {
      return;
    }
    const worldForce = Body_applyLocalForce_worldForce;
    const relativePointWorld = Body_applyLocalForce_relativePointWorld;
    this.vectorToWorldFrame(localForce, worldForce);
    this.vectorToWorldFrame(localPoint, relativePointWorld);
    this.applyForce(worldForce, relativePointWorld);
  }
  /**
   * Apply torque to the body.
   * @param torque The amount of torque to add.
   */
  applyTorque(torque2) {
    if (this.type !== _Body.DYNAMIC) {
      return;
    }
    if (this.sleepState === _Body.SLEEPING) {
      this.wakeUp();
    }
    this.torque.vadd(torque2, this.torque);
  }
  /**
   * Apply impulse to a point of the body. This could for example be a point on the Body surface.
   * An impulse is a force added to a body during a short period of time (impulse = force * time).
   * Impulses will be added to Body.velocity and Body.angularVelocity.
   * @param impulse The amount of impulse to add.
   * @param relativePoint A point relative to the center of mass to apply the force on.
   */
  applyImpulse(impulse, relativePoint) {
    if (relativePoint === void 0) {
      relativePoint = new Vec3();
    }
    if (this.type !== _Body.DYNAMIC) {
      return;
    }
    if (this.sleepState === _Body.SLEEPING) {
      this.wakeUp();
    }
    const r = relativePoint;
    const velo = Body_applyImpulse_velo;
    velo.copy(impulse);
    velo.scale(this.invMass, velo);
    this.velocity.vadd(velo, this.velocity);
    const rotVelo = Body_applyImpulse_rotVelo;
    r.cross(impulse, rotVelo);
    this.invInertiaWorld.vmult(rotVelo, rotVelo);
    this.angularVelocity.vadd(rotVelo, this.angularVelocity);
  }
  /**
   * Apply locally-defined impulse to a local point in the body.
   * @param force The force vector to apply, defined locally in the body frame.
   * @param localPoint A local point in the body to apply the force on.
   */
  applyLocalImpulse(localImpulse, localPoint) {
    if (localPoint === void 0) {
      localPoint = new Vec3();
    }
    if (this.type !== _Body.DYNAMIC) {
      return;
    }
    const worldImpulse = Body_applyLocalImpulse_worldImpulse;
    const relativePointWorld = Body_applyLocalImpulse_relativePoint;
    this.vectorToWorldFrame(localImpulse, worldImpulse);
    this.vectorToWorldFrame(localPoint, relativePointWorld);
    this.applyImpulse(worldImpulse, relativePointWorld);
  }
  /**
   * Should be called whenever you change the body shape or mass.
   */
  updateMassProperties() {
    const halfExtents = Body_updateMassProperties_halfExtents;
    this.invMass = this.mass > 0 ? 1 / this.mass : 0;
    const I = this.inertia;
    const fixed = this.fixedRotation;
    this.updateAABB();
    halfExtents.set((this.aabb.upperBound.x - this.aabb.lowerBound.x) / 2, (this.aabb.upperBound.y - this.aabb.lowerBound.y) / 2, (this.aabb.upperBound.z - this.aabb.lowerBound.z) / 2);
    Box.calculateInertia(halfExtents, this.mass, I);
    this.invInertia.set(I.x > 0 && !fixed ? 1 / I.x : 0, I.y > 0 && !fixed ? 1 / I.y : 0, I.z > 0 && !fixed ? 1 / I.z : 0);
    this.updateInertiaWorld(true);
  }
  /**
   * Get world velocity of a point in the body.
   * @param worldPoint
   * @param result
   * @return The result vector.
   */
  getVelocityAtWorldPoint(worldPoint, result) {
    const r = new Vec3();
    worldPoint.vsub(this.position, r);
    this.angularVelocity.cross(r, result);
    this.velocity.vadd(result, result);
    return result;
  }
  /**
   * Move the body forward in time.
   * @param dt Time step
   * @param quatNormalize Set to true to normalize the body quaternion
   * @param quatNormalizeFast If the quaternion should be normalized using "fast" quaternion normalization
   */
  integrate(dt, quatNormalize, quatNormalizeFast) {
    this.previousPosition.copy(this.position);
    this.previousQuaternion.copy(this.quaternion);
    if (!(this.type === _Body.DYNAMIC || this.type === _Body.KINEMATIC) || this.sleepState === _Body.SLEEPING) {
      return;
    }
    const velo = this.velocity;
    const angularVelo = this.angularVelocity;
    const pos = this.position;
    const force = this.force;
    const torque2 = this.torque;
    const quat = this.quaternion;
    const invMass = this.invMass;
    const invInertia = this.invInertiaWorld;
    const linearFactor = this.linearFactor;
    const iMdt = invMass * dt;
    velo.x += force.x * iMdt * linearFactor.x;
    velo.y += force.y * iMdt * linearFactor.y;
    velo.z += force.z * iMdt * linearFactor.z;
    const e = invInertia.elements;
    const angularFactor = this.angularFactor;
    const tx = torque2.x * angularFactor.x;
    const ty = torque2.y * angularFactor.y;
    const tz = torque2.z * angularFactor.z;
    angularVelo.x += dt * (e[0] * tx + e[1] * ty + e[2] * tz);
    angularVelo.y += dt * (e[3] * tx + e[4] * ty + e[5] * tz);
    angularVelo.z += dt * (e[6] * tx + e[7] * ty + e[8] * tz);
    pos.x += velo.x * dt;
    pos.y += velo.y * dt;
    pos.z += velo.z * dt;
    quat.integrate(this.angularVelocity, dt, this.angularFactor, quat);
    if (quatNormalize) {
      if (quatNormalizeFast) {
        quat.normalizeFast();
      } else {
        quat.normalize();
      }
    }
    this.aabbNeedsUpdate = true;
    this.updateInertiaWorld();
  }
};
Body.idCounter = 0;
Body.COLLIDE_EVENT_NAME = "collide";
Body.DYNAMIC = BODY_TYPES.DYNAMIC;
Body.STATIC = BODY_TYPES.STATIC;
Body.KINEMATIC = BODY_TYPES.KINEMATIC;
Body.AWAKE = BODY_SLEEP_STATES.AWAKE;
Body.SLEEPY = BODY_SLEEP_STATES.SLEEPY;
Body.SLEEPING = BODY_SLEEP_STATES.SLEEPING;
Body.wakeupEvent = {
  type: "wakeup"
};
Body.sleepyEvent = {
  type: "sleepy"
};
Body.sleepEvent = {
  type: "sleep"
};
var tmpVec = new Vec3();
var tmpQuat = new Quaternion();
var updateAABB_shapeAABB = new AABB();
var uiw_m1 = new Mat3();
var uiw_m2 = new Mat3();
var uiw_m3 = new Mat3();
var Body_applyForce_rotForce = new Vec3();
var Body_applyLocalForce_worldForce = new Vec3();
var Body_applyLocalForce_relativePointWorld = new Vec3();
var Body_applyImpulse_velo = new Vec3();
var Body_applyImpulse_rotVelo = new Vec3();
var Body_applyLocalImpulse_worldImpulse = new Vec3();
var Body_applyLocalImpulse_relativePoint = new Vec3();
var Body_updateMassProperties_halfExtents = new Vec3();
var Broadphase_collisionPairs_r = new Vec3();
new Vec3();
new Quaternion();
new Vec3();
new Vec3();
var GridBroadphase_collisionPairs_d = new Vec3();
new Vec3();
var RaycastResult = class {
  /**
   * rayFromWorld
   */
  /**
   * rayToWorld
   */
  /**
   * hitNormalWorld
   */
  /**
   * hitPointWorld
   */
  /**
   * hasHit
   */
  /**
   * shape
   */
  /**
   * body
   */
  /**
   * The index of the hit triangle, if the hit shape was a trimesh
   */
  /**
   * Distance to the hit. Will be set to -1 if there was no hit
   */
  /**
   * If the ray should stop traversing the bodies
   */
  constructor() {
    this.rayFromWorld = new Vec3();
    this.rayToWorld = new Vec3();
    this.hitNormalWorld = new Vec3();
    this.hitPointWorld = new Vec3();
    this.hasHit = false;
    this.shape = null;
    this.body = null;
    this.hitFaceIndex = -1;
    this.distance = -1;
    this.shouldStop = false;
  }
  /**
   * Reset all result data.
   */
  reset() {
    this.rayFromWorld.setZero();
    this.rayToWorld.setZero();
    this.hitNormalWorld.setZero();
    this.hitPointWorld.setZero();
    this.hasHit = false;
    this.shape = null;
    this.body = null;
    this.hitFaceIndex = -1;
    this.distance = -1;
    this.shouldStop = false;
  }
  /**
   * abort
   */
  abort() {
    this.shouldStop = true;
  }
  /**
   * Set result data.
   */
  set(rayFromWorld, rayToWorld, hitNormalWorld, hitPointWorld, shape, body, distance3) {
    this.rayFromWorld.copy(rayFromWorld);
    this.rayToWorld.copy(rayToWorld);
    this.hitNormalWorld.copy(hitNormalWorld);
    this.hitPointWorld.copy(hitPointWorld);
    this.shape = shape;
    this.body = body;
    this.distance = distance3;
  }
};
var _Shape$types$SPHERE;
var _Shape$types$PLANE;
var _Shape$types$BOX;
var _Shape$types$CYLINDER;
var _Shape$types$CONVEXPO;
var _Shape$types$HEIGHTFI;
var _Shape$types$TRIMESH;
var RAY_MODES = {
  /** CLOSEST */
  CLOSEST: 1,
  /** ANY */
  ANY: 2,
  /** ALL */
  ALL: 4
};
_Shape$types$SPHERE = Shape.types.SPHERE;
_Shape$types$PLANE = Shape.types.PLANE;
_Shape$types$BOX = Shape.types.BOX;
_Shape$types$CYLINDER = Shape.types.CYLINDER;
_Shape$types$CONVEXPO = Shape.types.CONVEXPOLYHEDRON;
_Shape$types$HEIGHTFI = Shape.types.HEIGHTFIELD;
_Shape$types$TRIMESH = Shape.types.TRIMESH;
var Ray = class _Ray {
  /**
   * from
   */
  /**
   * to
   */
  /**
   * direction
   */
  /**
   * The precision of the ray. Used when checking parallelity etc.
   * @default 0.0001
   */
  /**
   * Set to `false` if you don't want the Ray to take `collisionResponse` flags into account on bodies and shapes.
   * @default true
   */
  /**
   * If set to `true`, the ray skips any hits with normal.dot(rayDirection) < 0.
   * @default false
   */
  /**
   * collisionFilterMask
   * @default -1
   */
  /**
   * collisionFilterGroup
   * @default -1
   */
  /**
   * The intersection mode. Should be Ray.ANY, Ray.ALL or Ray.CLOSEST.
   * @default RAY.ANY
   */
  /**
   * Current result object.
   */
  /**
   * Will be set to `true` during intersectWorld() if the ray hit anything.
   */
  /**
   * User-provided result callback. Will be used if mode is Ray.ALL.
   */
  /**
   * CLOSEST
   */
  /**
   * ANY
   */
  /**
   * ALL
   */
  get [_Shape$types$SPHERE]() {
    return this._intersectSphere;
  }
  get [_Shape$types$PLANE]() {
    return this._intersectPlane;
  }
  get [_Shape$types$BOX]() {
    return this._intersectBox;
  }
  get [_Shape$types$CYLINDER]() {
    return this._intersectConvex;
  }
  get [_Shape$types$CONVEXPO]() {
    return this._intersectConvex;
  }
  get [_Shape$types$HEIGHTFI]() {
    return this._intersectHeightfield;
  }
  get [_Shape$types$TRIMESH]() {
    return this._intersectTrimesh;
  }
  constructor(from, to) {
    if (from === void 0) {
      from = new Vec3();
    }
    if (to === void 0) {
      to = new Vec3();
    }
    this.from = from.clone();
    this.to = to.clone();
    this.direction = new Vec3();
    this.precision = 1e-4;
    this.checkCollisionResponse = true;
    this.skipBackfaces = false;
    this.collisionFilterMask = -1;
    this.collisionFilterGroup = -1;
    this.mode = _Ray.ANY;
    this.result = new RaycastResult();
    this.hasHit = false;
    this.callback = (result) => {
    };
  }
  /**
   * Do itersection against all bodies in the given World.
   * @return True if the ray hit anything, otherwise false.
   */
  intersectWorld(world, options) {
    this.mode = options.mode || _Ray.ANY;
    this.result = options.result || new RaycastResult();
    this.skipBackfaces = !!options.skipBackfaces;
    this.collisionFilterMask = typeof options.collisionFilterMask !== "undefined" ? options.collisionFilterMask : -1;
    this.collisionFilterGroup = typeof options.collisionFilterGroup !== "undefined" ? options.collisionFilterGroup : -1;
    this.checkCollisionResponse = typeof options.checkCollisionResponse !== "undefined" ? options.checkCollisionResponse : true;
    if (options.from) {
      this.from.copy(options.from);
    }
    if (options.to) {
      this.to.copy(options.to);
    }
    this.callback = options.callback || (() => {
    });
    this.hasHit = false;
    this.result.reset();
    this.updateDirection();
    this.getAABB(tmpAABB$1);
    tmpArray.length = 0;
    world.broadphase.aabbQuery(world, tmpAABB$1, tmpArray);
    this.intersectBodies(tmpArray);
    return this.hasHit;
  }
  /**
   * Shoot a ray at a body, get back information about the hit.
   * @deprecated @param result set the result property of the Ray instead.
   */
  intersectBody(body, result) {
    if (result) {
      this.result = result;
      this.updateDirection();
    }
    const checkCollisionResponse = this.checkCollisionResponse;
    if (checkCollisionResponse && !body.collisionResponse) {
      return;
    }
    if ((this.collisionFilterGroup & body.collisionFilterMask) === 0 || (body.collisionFilterGroup & this.collisionFilterMask) === 0) {
      return;
    }
    const xi = intersectBody_xi;
    const qi = intersectBody_qi;
    for (let i = 0, N = body.shapes.length; i < N; i++) {
      const shape = body.shapes[i];
      if (checkCollisionResponse && !shape.collisionResponse) {
        continue;
      }
      body.quaternion.mult(body.shapeOrientations[i], qi);
      body.quaternion.vmult(body.shapeOffsets[i], xi);
      xi.vadd(body.position, xi);
      this.intersectShape(shape, qi, xi, body);
      if (this.result.shouldStop) {
        break;
      }
    }
  }
  /**
   * Shoot a ray at an array bodies, get back information about the hit.
   * @param bodies An array of Body objects.
   * @deprecated @param result set the result property of the Ray instead.
   *
   */
  intersectBodies(bodies, result) {
    if (result) {
      this.result = result;
      this.updateDirection();
    }
    for (let i = 0, l = bodies.length; !this.result.shouldStop && i < l; i++) {
      this.intersectBody(bodies[i]);
    }
  }
  /**
   * Updates the direction vector.
   */
  updateDirection() {
    this.to.vsub(this.from, this.direction);
    this.direction.normalize();
  }
  intersectShape(shape, quat, position, body) {
    const from = this.from;
    const distance3 = distanceFromIntersection(from, this.direction, position);
    if (distance3 > shape.boundingSphereRadius) {
      return;
    }
    const intersectMethod = this[shape.type];
    if (intersectMethod) {
      intersectMethod.call(this, shape, quat, position, body, shape);
    }
  }
  _intersectBox(box, quat, position, body, reportedShape) {
    return this._intersectConvex(box.convexPolyhedronRepresentation, quat, position, body, reportedShape);
  }
  _intersectPlane(shape, quat, position, body, reportedShape) {
    const from = this.from;
    const to = this.to;
    const direction = this.direction;
    const worldNormal = new Vec3(0, 0, 1);
    quat.vmult(worldNormal, worldNormal);
    const len3 = new Vec3();
    from.vsub(position, len3);
    const planeToFrom = len3.dot(worldNormal);
    to.vsub(position, len3);
    const planeToTo = len3.dot(worldNormal);
    if (planeToFrom * planeToTo > 0) {
      return;
    }
    if (from.distanceTo(to) < planeToFrom) {
      return;
    }
    const n_dot_dir = worldNormal.dot(direction);
    if (Math.abs(n_dot_dir) < this.precision) {
      return;
    }
    const planePointToFrom = new Vec3();
    const dir_scaled_with_t = new Vec3();
    const hitPointWorld = new Vec3();
    from.vsub(position, planePointToFrom);
    const t = -worldNormal.dot(planePointToFrom) / n_dot_dir;
    direction.scale(t, dir_scaled_with_t);
    from.vadd(dir_scaled_with_t, hitPointWorld);
    this.reportIntersection(worldNormal, hitPointWorld, reportedShape, body, -1);
  }
  /**
   * Get the world AABB of the ray.
   */
  getAABB(aabb) {
    const {
      lowerBound,
      upperBound
    } = aabb;
    const to = this.to;
    const from = this.from;
    lowerBound.x = Math.min(to.x, from.x);
    lowerBound.y = Math.min(to.y, from.y);
    lowerBound.z = Math.min(to.z, from.z);
    upperBound.x = Math.max(to.x, from.x);
    upperBound.y = Math.max(to.y, from.y);
    upperBound.z = Math.max(to.z, from.z);
  }
  _intersectHeightfield(shape, quat, position, body, reportedShape) {
    shape.data;
    shape.elementSize;
    const localRay = intersectHeightfield_localRay;
    localRay.from.copy(this.from);
    localRay.to.copy(this.to);
    Transform.pointToLocalFrame(position, quat, localRay.from, localRay.from);
    Transform.pointToLocalFrame(position, quat, localRay.to, localRay.to);
    localRay.updateDirection();
    const index = intersectHeightfield_index;
    let iMinX;
    let iMinY;
    let iMaxX;
    let iMaxY;
    iMinX = iMinY = 0;
    iMaxX = iMaxY = shape.data.length - 1;
    const aabb = new AABB();
    localRay.getAABB(aabb);
    shape.getIndexOfPosition(aabb.lowerBound.x, aabb.lowerBound.y, index, true);
    iMinX = Math.max(iMinX, index[0]);
    iMinY = Math.max(iMinY, index[1]);
    shape.getIndexOfPosition(aabb.upperBound.x, aabb.upperBound.y, index, true);
    iMaxX = Math.min(iMaxX, index[0] + 1);
    iMaxY = Math.min(iMaxY, index[1] + 1);
    for (let i = iMinX; i < iMaxX; i++) {
      for (let j = iMinY; j < iMaxY; j++) {
        if (this.result.shouldStop) {
          return;
        }
        shape.getAabbAtIndex(i, j, aabb);
        if (!aabb.overlapsRay(localRay)) {
          continue;
        }
        shape.getConvexTrianglePillar(i, j, false);
        Transform.pointToWorldFrame(position, quat, shape.pillarOffset, worldPillarOffset);
        this._intersectConvex(shape.pillarConvex, quat, worldPillarOffset, body, reportedShape, intersectConvexOptions);
        if (this.result.shouldStop) {
          return;
        }
        shape.getConvexTrianglePillar(i, j, true);
        Transform.pointToWorldFrame(position, quat, shape.pillarOffset, worldPillarOffset);
        this._intersectConvex(shape.pillarConvex, quat, worldPillarOffset, body, reportedShape, intersectConvexOptions);
      }
    }
  }
  _intersectSphere(sphere, quat, position, body, reportedShape) {
    const from = this.from;
    const to = this.to;
    const r = sphere.radius;
    const a2 = (to.x - from.x) ** 2 + (to.y - from.y) ** 2 + (to.z - from.z) ** 2;
    const b2 = 2 * ((to.x - from.x) * (from.x - position.x) + (to.y - from.y) * (from.y - position.y) + (to.z - from.z) * (from.z - position.z));
    const c2 = (from.x - position.x) ** 2 + (from.y - position.y) ** 2 + (from.z - position.z) ** 2 - r ** 2;
    const delta = b2 ** 2 - 4 * a2 * c2;
    const intersectionPoint = Ray_intersectSphere_intersectionPoint;
    const normal = Ray_intersectSphere_normal;
    if (delta < 0) {
      return;
    } else if (delta === 0) {
      from.lerp(to, delta, intersectionPoint);
      intersectionPoint.vsub(position, normal);
      normal.normalize();
      this.reportIntersection(normal, intersectionPoint, reportedShape, body, -1);
    } else {
      const d1 = (-b2 - Math.sqrt(delta)) / (2 * a2);
      const d2 = (-b2 + Math.sqrt(delta)) / (2 * a2);
      if (d1 >= 0 && d1 <= 1) {
        from.lerp(to, d1, intersectionPoint);
        intersectionPoint.vsub(position, normal);
        normal.normalize();
        this.reportIntersection(normal, intersectionPoint, reportedShape, body, -1);
      }
      if (this.result.shouldStop) {
        return;
      }
      if (d2 >= 0 && d2 <= 1) {
        from.lerp(to, d2, intersectionPoint);
        intersectionPoint.vsub(position, normal);
        normal.normalize();
        this.reportIntersection(normal, intersectionPoint, reportedShape, body, -1);
      }
    }
  }
  _intersectConvex(shape, quat, position, body, reportedShape, options) {
    intersectConvex_minDistNormal;
    const normal = intersectConvex_normal;
    const vector = intersectConvex_vector;
    intersectConvex_minDistIntersect;
    const faceList = options && options.faceList || null;
    const faces = shape.faces;
    const vertices = shape.vertices;
    const normals = shape.faceNormals;
    const direction = this.direction;
    const from = this.from;
    const to = this.to;
    const fromToDistance = from.distanceTo(to);
    const Nfaces = faceList ? faceList.length : faces.length;
    const result = this.result;
    for (let j = 0; !result.shouldStop && j < Nfaces; j++) {
      const fi = faceList ? faceList[j] : j;
      const face = faces[fi];
      const faceNormal = normals[fi];
      const q = quat;
      const x = position;
      vector.copy(vertices[face[0]]);
      q.vmult(vector, vector);
      vector.vadd(x, vector);
      vector.vsub(from, vector);
      q.vmult(faceNormal, normal);
      const dot4 = direction.dot(normal);
      if (Math.abs(dot4) < this.precision) {
        continue;
      }
      const scalar = normal.dot(vector) / dot4;
      if (scalar < 0) {
        continue;
      }
      direction.scale(scalar, intersectPoint);
      intersectPoint.vadd(from, intersectPoint);
      a.copy(vertices[face[0]]);
      q.vmult(a, a);
      x.vadd(a, a);
      for (let i = 1; !result.shouldStop && i < face.length - 1; i++) {
        b.copy(vertices[face[i]]);
        c.copy(vertices[face[i + 1]]);
        q.vmult(b, b);
        q.vmult(c, c);
        x.vadd(b, b);
        x.vadd(c, c);
        const distance3 = intersectPoint.distanceTo(from);
        if (!(_Ray.pointInTriangle(intersectPoint, a, b, c) || _Ray.pointInTriangle(intersectPoint, b, a, c)) || distance3 > fromToDistance) {
          continue;
        }
        this.reportIntersection(normal, intersectPoint, reportedShape, body, fi);
      }
    }
  }
  /**
   * @todo Optimize by transforming the world to local space first.
   * @todo Use Octree lookup
   */
  _intersectTrimesh(mesh, quat, position, body, reportedShape, options) {
    const normal = intersectTrimesh_normal;
    const triangles = intersectTrimesh_triangles;
    const treeTransform = intersectTrimesh_treeTransform;
    const vector = intersectConvex_vector;
    const localDirection = intersectTrimesh_localDirection;
    const localFrom = intersectTrimesh_localFrom;
    const localTo = intersectTrimesh_localTo;
    const worldIntersectPoint = intersectTrimesh_worldIntersectPoint;
    const worldNormal = intersectTrimesh_worldNormal;
    const indices = mesh.indices;
    mesh.vertices;
    const from = this.from;
    const to = this.to;
    const direction = this.direction;
    treeTransform.position.copy(position);
    treeTransform.quaternion.copy(quat);
    Transform.vectorToLocalFrame(position, quat, direction, localDirection);
    Transform.pointToLocalFrame(position, quat, from, localFrom);
    Transform.pointToLocalFrame(position, quat, to, localTo);
    localTo.x *= mesh.scale.x;
    localTo.y *= mesh.scale.y;
    localTo.z *= mesh.scale.z;
    localFrom.x *= mesh.scale.x;
    localFrom.y *= mesh.scale.y;
    localFrom.z *= mesh.scale.z;
    localTo.vsub(localFrom, localDirection);
    localDirection.normalize();
    const fromToDistanceSquared = localFrom.distanceSquared(localTo);
    mesh.tree.rayQuery(this, treeTransform, triangles);
    for (let i = 0, N = triangles.length; !this.result.shouldStop && i !== N; i++) {
      const trianglesIndex = triangles[i];
      mesh.getNormal(trianglesIndex, normal);
      mesh.getVertex(indices[trianglesIndex * 3], a);
      a.vsub(localFrom, vector);
      const dot4 = localDirection.dot(normal);
      const scalar = normal.dot(vector) / dot4;
      if (scalar < 0) {
        continue;
      }
      localDirection.scale(scalar, intersectPoint);
      intersectPoint.vadd(localFrom, intersectPoint);
      mesh.getVertex(indices[trianglesIndex * 3 + 1], b);
      mesh.getVertex(indices[trianglesIndex * 3 + 2], c);
      const squaredDistance2 = intersectPoint.distanceSquared(localFrom);
      if (!(_Ray.pointInTriangle(intersectPoint, b, a, c) || _Ray.pointInTriangle(intersectPoint, a, b, c)) || squaredDistance2 > fromToDistanceSquared) {
        continue;
      }
      Transform.vectorToWorldFrame(quat, normal, worldNormal);
      Transform.pointToWorldFrame(position, quat, intersectPoint, worldIntersectPoint);
      this.reportIntersection(worldNormal, worldIntersectPoint, reportedShape, body, trianglesIndex);
    }
    triangles.length = 0;
  }
  /**
   * @return True if the intersections should continue
   */
  reportIntersection(normal, hitPointWorld, shape, body, hitFaceIndex) {
    const from = this.from;
    const to = this.to;
    const distance3 = from.distanceTo(hitPointWorld);
    const result = this.result;
    if (this.skipBackfaces && normal.dot(this.direction) > 0) {
      return;
    }
    result.hitFaceIndex = typeof hitFaceIndex !== "undefined" ? hitFaceIndex : -1;
    switch (this.mode) {
      case _Ray.ALL:
        this.hasHit = true;
        result.set(from, to, normal, hitPointWorld, shape, body, distance3);
        result.hasHit = true;
        this.callback(result);
        break;
      case _Ray.CLOSEST:
        if (distance3 < result.distance || !result.hasHit) {
          this.hasHit = true;
          result.hasHit = true;
          result.set(from, to, normal, hitPointWorld, shape, body, distance3);
        }
        break;
      case _Ray.ANY:
        this.hasHit = true;
        result.hasHit = true;
        result.set(from, to, normal, hitPointWorld, shape, body, distance3);
        result.shouldStop = true;
        break;
    }
  }
  /**
   * As per "Barycentric Technique" as named
   * {@link https://www.blackpawn.com/texts/pointinpoly/default.html here} but without the division
   */
  static pointInTriangle(p, a2, b2, c2) {
    c2.vsub(a2, v0);
    b2.vsub(a2, v1);
    p.vsub(a2, v2);
    const dot00 = v0.dot(v0);
    const dot01 = v0.dot(v1);
    const dot02 = v0.dot(v2);
    const dot11 = v1.dot(v1);
    const dot12 = v1.dot(v2);
    let u;
    let v;
    return (u = dot11 * dot02 - dot01 * dot12) >= 0 && (v = dot00 * dot12 - dot01 * dot02) >= 0 && u + v < dot00 * dot11 - dot01 * dot01;
  }
};
Ray.CLOSEST = RAY_MODES.CLOSEST;
Ray.ANY = RAY_MODES.ANY;
Ray.ALL = RAY_MODES.ALL;
var tmpAABB$1 = new AABB();
var tmpArray = [];
var v1 = new Vec3();
var v2 = new Vec3();
var intersectBody_xi = new Vec3();
var intersectBody_qi = new Quaternion();
var intersectPoint = new Vec3();
var a = new Vec3();
var b = new Vec3();
var c = new Vec3();
new Vec3();
new RaycastResult();
var intersectConvexOptions = {
  faceList: [0]
};
var worldPillarOffset = new Vec3();
var intersectHeightfield_localRay = new Ray();
var intersectHeightfield_index = [];
var Ray_intersectSphere_intersectionPoint = new Vec3();
var Ray_intersectSphere_normal = new Vec3();
var intersectConvex_normal = new Vec3();
var intersectConvex_minDistNormal = new Vec3();
var intersectConvex_minDistIntersect = new Vec3();
var intersectConvex_vector = new Vec3();
var intersectTrimesh_normal = new Vec3();
var intersectTrimesh_localDirection = new Vec3();
var intersectTrimesh_localFrom = new Vec3();
var intersectTrimesh_localTo = new Vec3();
var intersectTrimesh_worldNormal = new Vec3();
var intersectTrimesh_worldIntersectPoint = new Vec3();
new AABB();
var intersectTrimesh_triangles = [];
var intersectTrimesh_treeTransform = new Transform();
var v0 = new Vec3();
var intersect = new Vec3();
function distanceFromIntersection(from, direction, position) {
  position.vsub(from, v0);
  const dot4 = v0.dot(direction);
  direction.scale(dot4, intersect);
  intersect.vadd(from, intersect);
  const distance3 = position.distanceTo(intersect);
  return distance3;
}
var Utils = class {
  /**
   * Extend an options object with default values.
   * @param options The options object. May be falsy: in this case, a new object is created and returned.
   * @param defaults An object containing default values.
   * @return The modified options object.
   */
  static defaults(options, defaults) {
    if (options === void 0) {
      options = {};
    }
    for (let key in defaults) {
      if (!(key in options)) {
        options[key] = defaults[key];
      }
    }
    return options;
  }
};
var Constraint = class _Constraint {
  /**
   * Equations to be solved in this constraint.
   */
  /**
   * Body A.
   */
  /**
   * Body B.
   */
  /**
   * Set to false if you don't want the bodies to collide when they are connected.
   */
  constructor(bodyA, bodyB, options) {
    if (options === void 0) {
      options = {};
    }
    options = Utils.defaults(options, {
      collideConnected: true,
      wakeUpBodies: true
    });
    this.equations = [];
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.id = _Constraint.idCounter++;
    this.collideConnected = options.collideConnected;
    if (options.wakeUpBodies) {
      if (bodyA) {
        bodyA.wakeUp();
      }
      if (bodyB) {
        bodyB.wakeUp();
      }
    }
  }
  /**
   * Update all the equations with data.
   */
  update() {
    throw new Error("method update() not implmemented in this Constraint subclass!");
  }
  /**
   * Enables all equations in the constraint.
   */
  enable() {
    const eqs = this.equations;
    for (let i = 0; i < eqs.length; i++) {
      eqs[i].enabled = true;
    }
  }
  /**
   * Disables all equations in the constraint.
   */
  disable() {
    const eqs = this.equations;
    for (let i = 0; i < eqs.length; i++) {
      eqs[i].enabled = false;
    }
  }
};
Constraint.idCounter = 0;
var JacobianElement = class {
  /**
   * spatial
   */
  /**
   * rotational
   */
  constructor() {
    this.spatial = new Vec3();
    this.rotational = new Vec3();
  }
  /**
   * Multiply with other JacobianElement
   */
  multiplyElement(element) {
    return element.spatial.dot(this.spatial) + element.rotational.dot(this.rotational);
  }
  /**
   * Multiply with two vectors
   */
  multiplyVectors(spatial, rotational) {
    return spatial.dot(this.spatial) + rotational.dot(this.rotational);
  }
};
var Equation = class _Equation {
  /**
   * Minimum (read: negative max) force to be applied by the constraint.
   */
  /**
   * Maximum (read: positive max) force to be applied by the constraint.
   */
  /**
   * SPOOK parameter
   */
  /**
   * SPOOK parameter
   */
  /**
   * SPOOK parameter
   */
  /**
   * A number, proportional to the force added to the bodies.
   */
  constructor(bi, bj, minForce, maxForce) {
    if (minForce === void 0) {
      minForce = -1e6;
    }
    if (maxForce === void 0) {
      maxForce = 1e6;
    }
    this.id = _Equation.idCounter++;
    this.minForce = minForce;
    this.maxForce = maxForce;
    this.bi = bi;
    this.bj = bj;
    this.a = 0;
    this.b = 0;
    this.eps = 0;
    this.jacobianElementA = new JacobianElement();
    this.jacobianElementB = new JacobianElement();
    this.enabled = true;
    this.multiplier = 0;
    this.setSpookParams(1e7, 4, 1 / 60);
  }
  /**
   * Recalculates a, b, and eps.
   *
   * The Equation constructor sets typical SPOOK parameters as such:
   * * `stiffness` = 1e7
   * * `relaxation` = 4
   * * `timeStep`= 1 / 60, _note the hardcoded refresh rate._
   */
  setSpookParams(stiffness, relaxation, timeStep) {
    const d = relaxation;
    const k = stiffness;
    const h = timeStep;
    this.a = 4 / (h * (1 + 4 * d));
    this.b = 4 * d / (1 + 4 * d);
    this.eps = 4 / (h * h * k * (1 + 4 * d));
  }
  /**
   * Computes the right hand side of the SPOOK equation
   */
  computeB(a2, b2, h) {
    const GW = this.computeGW();
    const Gq = this.computeGq();
    const GiMf = this.computeGiMf();
    return -Gq * a2 - GW * b2 - GiMf * h;
  }
  /**
   * Computes G*q, where q are the generalized body coordinates
   */
  computeGq() {
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    const bi = this.bi;
    const bj = this.bj;
    const xi = bi.position;
    const xj = bj.position;
    return GA.spatial.dot(xi) + GB.spatial.dot(xj);
  }
  /**
   * Computes G*W, where W are the body velocities
   */
  computeGW() {
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    const bi = this.bi;
    const bj = this.bj;
    const vi = bi.velocity;
    const vj = bj.velocity;
    const wi = bi.angularVelocity;
    const wj = bj.angularVelocity;
    return GA.multiplyVectors(vi, wi) + GB.multiplyVectors(vj, wj);
  }
  /**
   * Computes G*Wlambda, where W are the body velocities
   */
  computeGWlambda() {
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    const bi = this.bi;
    const bj = this.bj;
    const vi = bi.vlambda;
    const vj = bj.vlambda;
    const wi = bi.wlambda;
    const wj = bj.wlambda;
    return GA.multiplyVectors(vi, wi) + GB.multiplyVectors(vj, wj);
  }
  /**
   * Computes G*inv(M)*f, where M is the mass matrix with diagonal blocks for each body, and f are the forces on the bodies.
   */
  computeGiMf() {
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    const bi = this.bi;
    const bj = this.bj;
    const fi = bi.force;
    const ti = bi.torque;
    const fj = bj.force;
    const tj = bj.torque;
    const invMassi = bi.invMassSolve;
    const invMassj = bj.invMassSolve;
    fi.scale(invMassi, iMfi);
    fj.scale(invMassj, iMfj);
    bi.invInertiaWorldSolve.vmult(ti, invIi_vmult_taui);
    bj.invInertiaWorldSolve.vmult(tj, invIj_vmult_tauj);
    return GA.multiplyVectors(iMfi, invIi_vmult_taui) + GB.multiplyVectors(iMfj, invIj_vmult_tauj);
  }
  /**
   * Computes G*inv(M)*G'
   */
  computeGiMGt() {
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    const bi = this.bi;
    const bj = this.bj;
    const invMassi = bi.invMassSolve;
    const invMassj = bj.invMassSolve;
    const invIi = bi.invInertiaWorldSolve;
    const invIj = bj.invInertiaWorldSolve;
    let result = invMassi + invMassj;
    invIi.vmult(GA.rotational, tmp);
    result += tmp.dot(GA.rotational);
    invIj.vmult(GB.rotational, tmp);
    result += tmp.dot(GB.rotational);
    return result;
  }
  /**
   * Add constraint velocity to the bodies.
   */
  addToWlambda(deltalambda) {
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    const bi = this.bi;
    const bj = this.bj;
    const temp = addToWlambda_temp;
    bi.vlambda.addScaledVector(bi.invMassSolve * deltalambda, GA.spatial, bi.vlambda);
    bj.vlambda.addScaledVector(bj.invMassSolve * deltalambda, GB.spatial, bj.vlambda);
    bi.invInertiaWorldSolve.vmult(GA.rotational, temp);
    bi.wlambda.addScaledVector(deltalambda, temp, bi.wlambda);
    bj.invInertiaWorldSolve.vmult(GB.rotational, temp);
    bj.wlambda.addScaledVector(deltalambda, temp, bj.wlambda);
  }
  /**
   * Compute the denominator part of the SPOOK equation: C = G*inv(M)*G' + eps
   */
  computeC() {
    return this.computeGiMGt() + this.eps;
  }
};
Equation.idCounter = 0;
var iMfi = new Vec3();
var iMfj = new Vec3();
var invIi_vmult_taui = new Vec3();
var invIj_vmult_tauj = new Vec3();
var tmp = new Vec3();
var addToWlambda_temp = new Vec3();
var ContactEquation = class extends Equation {
  /**
   * "bounciness": u1 = -e*u0
   */
  /**
   * World-oriented vector that goes from the center of bi to the contact point.
   */
  /**
   * World-oriented vector that starts in body j position and goes to the contact point.
   */
  /**
   * Contact normal, pointing out of body i.
   */
  constructor(bodyA, bodyB, maxForce) {
    if (maxForce === void 0) {
      maxForce = 1e6;
    }
    super(bodyA, bodyB, 0, maxForce);
    this.restitution = 0;
    this.ri = new Vec3();
    this.rj = new Vec3();
    this.ni = new Vec3();
  }
  computeB(h) {
    const a2 = this.a;
    const b2 = this.b;
    const bi = this.bi;
    const bj = this.bj;
    const ri = this.ri;
    const rj = this.rj;
    const rixn = ContactEquation_computeB_temp1;
    const rjxn = ContactEquation_computeB_temp2;
    const vi = bi.velocity;
    const wi = bi.angularVelocity;
    bi.force;
    bi.torque;
    const vj = bj.velocity;
    const wj = bj.angularVelocity;
    bj.force;
    bj.torque;
    const penetrationVec = ContactEquation_computeB_temp3;
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    const n = this.ni;
    ri.cross(n, rixn);
    rj.cross(n, rjxn);
    n.negate(GA.spatial);
    rixn.negate(GA.rotational);
    GB.spatial.copy(n);
    GB.rotational.copy(rjxn);
    penetrationVec.copy(bj.position);
    penetrationVec.vadd(rj, penetrationVec);
    penetrationVec.vsub(bi.position, penetrationVec);
    penetrationVec.vsub(ri, penetrationVec);
    const g = n.dot(penetrationVec);
    const ePlusOne = this.restitution + 1;
    const GW = ePlusOne * vj.dot(n) - ePlusOne * vi.dot(n) + wj.dot(rjxn) - wi.dot(rixn);
    const GiMf = this.computeGiMf();
    const B = -g * a2 - GW * b2 - h * GiMf;
    return B;
  }
  /**
   * Get the current relative velocity in the contact point.
   */
  getImpactVelocityAlongNormal() {
    const vi = ContactEquation_getImpactVelocityAlongNormal_vi;
    const vj = ContactEquation_getImpactVelocityAlongNormal_vj;
    const xi = ContactEquation_getImpactVelocityAlongNormal_xi;
    const xj = ContactEquation_getImpactVelocityAlongNormal_xj;
    const relVel = ContactEquation_getImpactVelocityAlongNormal_relVel;
    this.bi.position.vadd(this.ri, xi);
    this.bj.position.vadd(this.rj, xj);
    this.bi.getVelocityAtWorldPoint(xi, vi);
    this.bj.getVelocityAtWorldPoint(xj, vj);
    vi.vsub(vj, relVel);
    return this.ni.dot(relVel);
  }
};
var ContactEquation_computeB_temp1 = new Vec3();
var ContactEquation_computeB_temp2 = new Vec3();
var ContactEquation_computeB_temp3 = new Vec3();
var ContactEquation_getImpactVelocityAlongNormal_vi = new Vec3();
var ContactEquation_getImpactVelocityAlongNormal_vj = new Vec3();
var ContactEquation_getImpactVelocityAlongNormal_xi = new Vec3();
var ContactEquation_getImpactVelocityAlongNormal_xj = new Vec3();
var ContactEquation_getImpactVelocityAlongNormal_relVel = new Vec3();
var tmpVec1$2 = new Vec3();
var tmpVec2$2 = new Vec3();
var tmpVec1$1 = new Vec3();
var tmpVec2$1 = new Vec3();
new Vec3();
new Vec3();
var LockConstraint_update_tmpVec1 = new Vec3();
var LockConstraint_update_tmpVec2 = new Vec3();
var HingeConstraint_update_tmpVec1 = new Vec3();
var HingeConstraint_update_tmpVec2 = new Vec3();
var FrictionEquation = class extends Equation {
  // Tangent
  /**
   * @param slipForce should be +-F_friction = +-mu * F_normal = +-mu * m * g
   */
  constructor(bodyA, bodyB, slipForce) {
    super(bodyA, bodyB, -slipForce, slipForce);
    this.ri = new Vec3();
    this.rj = new Vec3();
    this.t = new Vec3();
  }
  computeB(h) {
    this.a;
    const b2 = this.b;
    this.bi;
    this.bj;
    const ri = this.ri;
    const rj = this.rj;
    const rixt = FrictionEquation_computeB_temp1;
    const rjxt = FrictionEquation_computeB_temp2;
    const t = this.t;
    ri.cross(t, rixt);
    rj.cross(t, rjxt);
    const GA = this.jacobianElementA;
    const GB = this.jacobianElementB;
    t.negate(GA.spatial);
    rixt.negate(GA.rotational);
    GB.spatial.copy(t);
    GB.rotational.copy(rjxt);
    const GW = this.computeGW();
    const GiMf = this.computeGiMf();
    const B = -GW * b2 - h * GiMf;
    return B;
  }
};
var FrictionEquation_computeB_temp1 = new Vec3();
var FrictionEquation_computeB_temp2 = new Vec3();
var ContactMaterial = class _ContactMaterial {
  /**
   * Identifier of this material.
   */
  /**
   * Participating materials.
   */
  /**
   * Friction coefficient.
   * @default 0.3
   */
  /**
   * Restitution coefficient.
   * @default 0.3
   */
  /**
   * Stiffness of the produced contact equations.
   * @default 1e7
   */
  /**
   * Relaxation time of the produced contact equations.
   * @default 3
   */
  /**
   * Stiffness of the produced friction equations.
   * @default 1e7
   */
  /**
   * Relaxation time of the produced friction equations
   * @default 3
   */
  constructor(m1, m2, options) {
    options = Utils.defaults(options, {
      friction: 0.3,
      restitution: 0.3,
      contactEquationStiffness: 1e7,
      contactEquationRelaxation: 3,
      frictionEquationStiffness: 1e7,
      frictionEquationRelaxation: 3
    });
    this.id = _ContactMaterial.idCounter++;
    this.materials = [m1, m2];
    this.friction = options.friction;
    this.restitution = options.restitution;
    this.contactEquationStiffness = options.contactEquationStiffness;
    this.contactEquationRelaxation = options.contactEquationRelaxation;
    this.frictionEquationStiffness = options.frictionEquationStiffness;
    this.frictionEquationRelaxation = options.frictionEquationRelaxation;
  }
};
ContactMaterial.idCounter = 0;
var Material = class _Material {
  /**
   * Material name.
   * If options is a string, name will be set to that string.
   * @todo Deprecate this
   */
  /** Material id. */
  /**
   * Friction for this material.
   * If non-negative, it will be used instead of the friction given by ContactMaterials. If there's no matching ContactMaterial, the value from `defaultContactMaterial` in the World will be used.
   */
  /**
   * Restitution for this material.
   * If non-negative, it will be used instead of the restitution given by ContactMaterials. If there's no matching ContactMaterial, the value from `defaultContactMaterial` in the World will be used.
   */
  constructor(options) {
    if (options === void 0) {
      options = {};
    }
    let name = "";
    if (typeof options === "string") {
      name = options;
      options = {};
    }
    this.name = name;
    this.id = _Material.idCounter++;
    this.friction = typeof options.friction !== "undefined" ? options.friction : -1;
    this.restitution = typeof options.restitution !== "undefined" ? options.restitution : -1;
  }
};
Material.idCounter = 0;
var applyForce_r = new Vec3();
var applyForce_r_unit = new Vec3();
var applyForce_u = new Vec3();
var applyForce_f = new Vec3();
var applyForce_worldAnchorA = new Vec3();
var applyForce_worldAnchorB = new Vec3();
var applyForce_ri = new Vec3();
var applyForce_rj = new Vec3();
var applyForce_ri_x_f = new Vec3();
var applyForce_rj_x_f = new Vec3();
var applyForce_tmp = new Vec3();
var chassis_velocity_at_contactPoint = new Vec3();
var relpos = new Vec3();
new Vec3();
new Vec3();
new Vec3();
var tmpVec4 = new Vec3();
var tmpVec5 = new Vec3();
var tmpVec6 = new Vec3();
new Ray();
new Vec3();
var castRay_rayvector = new Vec3();
var castRay_target = new Vec3();
var directions = [new Vec3(1, 0, 0), new Vec3(0, 1, 0), new Vec3(0, 0, 1)];
var updateFriction_surfNormalWS_scaled_proj = new Vec3();
var calcRollingFriction_vel1 = new Vec3();
var calcRollingFriction_vel2 = new Vec3();
var calcRollingFriction_vel = new Vec3();
var computeImpulseDenominator_r0 = new Vec3();
var computeImpulseDenominator_c0 = new Vec3();
var computeImpulseDenominator_vec = new Vec3();
var computeImpulseDenominator_m = new Vec3();
var resolveSingleBilateral_vel1 = new Vec3();
var resolveSingleBilateral_vel2 = new Vec3();
var resolveSingleBilateral_vel = new Vec3();
var Sphere = class extends Shape {
  /**
   * The radius of the sphere.
   */
  /**
   *
   * @param radius The radius of the sphere, a non-negative number.
   */
  constructor(radius) {
    super({
      type: Shape.types.SPHERE
    });
    this.radius = radius !== void 0 ? radius : 1;
    if (this.radius < 0) {
      throw new Error("The sphere radius cannot be negative.");
    }
    this.updateBoundingSphereRadius();
  }
  /** calculateLocalInertia */
  calculateLocalInertia(mass, target) {
    if (target === void 0) {
      target = new Vec3();
    }
    const I = 2 * mass * this.radius * this.radius / 5;
    target.x = I;
    target.y = I;
    target.z = I;
    return target;
  }
  /** volume */
  volume() {
    return 4 * Math.PI * Math.pow(this.radius, 3) / 3;
  }
  updateBoundingSphereRadius() {
    this.boundingSphereRadius = this.radius;
  }
  calculateWorldAABB(pos, quat, min2, max2) {
    const r = this.radius;
    const axes = ["x", "y", "z"];
    for (let i = 0; i < axes.length; i++) {
      const ax = axes[i];
      min2[ax] = pos[ax] - r;
      max2[ax] = pos[ax] + r;
    }
  }
};
var torque = new Vec3();
var worldAxis = new Vec3();
var SPHSystem_getNeighbors_dist = new Vec3();
var SPHSystem_update_dist = new Vec3();
var SPHSystem_update_a_pressure = new Vec3();
var SPHSystem_update_a_visc = new Vec3();
var SPHSystem_update_gradW = new Vec3();
var SPHSystem_update_r_vec = new Vec3();
var SPHSystem_update_u = new Vec3();
var Plane = class extends Shape {
  /** worldNormal */
  /** worldNormalNeedsUpdate */
  constructor() {
    super({
      type: Shape.types.PLANE
    });
    this.worldNormal = new Vec3();
    this.worldNormalNeedsUpdate = true;
    this.boundingSphereRadius = Number.MAX_VALUE;
  }
  /** computeWorldNormal */
  computeWorldNormal(quat) {
    const n = this.worldNormal;
    n.set(0, 0, 1);
    quat.vmult(n, n);
    this.worldNormalNeedsUpdate = false;
  }
  calculateLocalInertia(mass, target) {
    if (target === void 0) {
      target = new Vec3();
    }
    return target;
  }
  volume() {
    return (
      // The plane is infinite...
      Number.MAX_VALUE
    );
  }
  calculateWorldAABB(pos, quat, min2, max2) {
    tempNormal.set(0, 0, 1);
    quat.vmult(tempNormal, tempNormal);
    const maxVal = Number.MAX_VALUE;
    min2.set(-maxVal, -maxVal, -maxVal);
    max2.set(maxVal, maxVal, maxVal);
    if (tempNormal.x === 1) {
      max2.x = pos.x;
    } else if (tempNormal.x === -1) {
      min2.x = pos.x;
    }
    if (tempNormal.y === 1) {
      max2.y = pos.y;
    } else if (tempNormal.y === -1) {
      min2.y = pos.y;
    }
    if (tempNormal.z === 1) {
      max2.z = pos.z;
    } else if (tempNormal.z === -1) {
      min2.z = pos.z;
    }
  }
  updateBoundingSphereRadius() {
    this.boundingSphereRadius = Number.MAX_VALUE;
  }
};
var tempNormal = new Vec3();
var getHeightAt_weights = new Vec3();
var getHeightAt_a = new Vec3();
var getHeightAt_b = new Vec3();
var getHeightAt_c = new Vec3();
var getNormalAt_a = new Vec3();
var getNormalAt_b = new Vec3();
var getNormalAt_c = new Vec3();
var getNormalAt_e0 = new Vec3();
var getNormalAt_e1 = new Vec3();
var halfDiagonal = new Vec3();
var tmpAABB = new AABB();
var computeNormals_n = new Vec3();
var unscaledAABB = new AABB();
var getEdgeVector_va = new Vec3();
var getEdgeVector_vb = new Vec3();
var cb = new Vec3();
var ab = new Vec3();
var va = new Vec3();
var vb = new Vec3();
var vc = new Vec3();
var cli_aabb = new AABB();
var computeLocalAABB_worldVert = new Vec3();
var calculateWorldAABB_frame = new Transform();
var calculateWorldAABB_aabb = new AABB();
var STATIC = Body.STATIC;
var Pool = class {
  constructor() {
    this.objects = [];
    this.type = Object;
  }
  /**
   * Release an object after use
   */
  release() {
    const Nargs = arguments.length;
    for (let i = 0; i !== Nargs; i++) {
      this.objects.push(i < 0 || arguments.length <= i ? void 0 : arguments[i]);
    }
    return this;
  }
  /**
   * Get an object
   */
  get() {
    if (this.objects.length === 0) {
      return this.constructObject();
    } else {
      return this.objects.pop();
    }
  }
  /**
   * Construct an object. Should be implemented in each subclass.
   */
  constructObject() {
    throw new Error("constructObject() not implemented in this Pool subclass yet!");
  }
  /**
   * @return Self, for chaining
   */
  resize(size) {
    const objects = this.objects;
    while (objects.length > size) {
      objects.pop();
    }
    while (objects.length < size) {
      objects.push(this.constructObject());
    }
    return this;
  }
};
var Vec3Pool = class extends Pool {
  constructor() {
    super(...arguments);
    this.type = Vec3;
  }
  /**
   * Construct a vector
   */
  constructObject() {
    return new Vec3();
  }
};
var COLLISION_TYPES = {
  sphereSphere: Shape.types.SPHERE,
  spherePlane: Shape.types.SPHERE | Shape.types.PLANE,
  boxBox: Shape.types.BOX | Shape.types.BOX,
  sphereBox: Shape.types.SPHERE | Shape.types.BOX,
  planeBox: Shape.types.PLANE | Shape.types.BOX,
  convexConvex: Shape.types.CONVEXPOLYHEDRON,
  sphereConvex: Shape.types.SPHERE | Shape.types.CONVEXPOLYHEDRON,
  planeConvex: Shape.types.PLANE | Shape.types.CONVEXPOLYHEDRON,
  boxConvex: Shape.types.BOX | Shape.types.CONVEXPOLYHEDRON,
  sphereHeightfield: Shape.types.SPHERE | Shape.types.HEIGHTFIELD,
  boxHeightfield: Shape.types.BOX | Shape.types.HEIGHTFIELD,
  convexHeightfield: Shape.types.CONVEXPOLYHEDRON | Shape.types.HEIGHTFIELD,
  sphereParticle: Shape.types.PARTICLE | Shape.types.SPHERE,
  planeParticle: Shape.types.PLANE | Shape.types.PARTICLE,
  boxParticle: Shape.types.BOX | Shape.types.PARTICLE,
  convexParticle: Shape.types.PARTICLE | Shape.types.CONVEXPOLYHEDRON,
  cylinderCylinder: Shape.types.CYLINDER,
  sphereCylinder: Shape.types.SPHERE | Shape.types.CYLINDER,
  planeCylinder: Shape.types.PLANE | Shape.types.CYLINDER,
  boxCylinder: Shape.types.BOX | Shape.types.CYLINDER,
  convexCylinder: Shape.types.CONVEXPOLYHEDRON | Shape.types.CYLINDER,
  heightfieldCylinder: Shape.types.HEIGHTFIELD | Shape.types.CYLINDER,
  particleCylinder: Shape.types.PARTICLE | Shape.types.CYLINDER,
  sphereTrimesh: Shape.types.SPHERE | Shape.types.TRIMESH,
  planeTrimesh: Shape.types.PLANE | Shape.types.TRIMESH
};
var Narrowphase = class {
  /**
   * Internal storage of pooled contact points.
   */
  /**
   * Pooled vectors.
   */
  get [COLLISION_TYPES.sphereSphere]() {
    return this.sphereSphere;
  }
  get [COLLISION_TYPES.spherePlane]() {
    return this.spherePlane;
  }
  get [COLLISION_TYPES.boxBox]() {
    return this.boxBox;
  }
  get [COLLISION_TYPES.sphereBox]() {
    return this.sphereBox;
  }
  get [COLLISION_TYPES.planeBox]() {
    return this.planeBox;
  }
  get [COLLISION_TYPES.convexConvex]() {
    return this.convexConvex;
  }
  get [COLLISION_TYPES.sphereConvex]() {
    return this.sphereConvex;
  }
  get [COLLISION_TYPES.planeConvex]() {
    return this.planeConvex;
  }
  get [COLLISION_TYPES.boxConvex]() {
    return this.boxConvex;
  }
  get [COLLISION_TYPES.sphereHeightfield]() {
    return this.sphereHeightfield;
  }
  get [COLLISION_TYPES.boxHeightfield]() {
    return this.boxHeightfield;
  }
  get [COLLISION_TYPES.convexHeightfield]() {
    return this.convexHeightfield;
  }
  get [COLLISION_TYPES.sphereParticle]() {
    return this.sphereParticle;
  }
  get [COLLISION_TYPES.planeParticle]() {
    return this.planeParticle;
  }
  get [COLLISION_TYPES.boxParticle]() {
    return this.boxParticle;
  }
  get [COLLISION_TYPES.convexParticle]() {
    return this.convexParticle;
  }
  get [COLLISION_TYPES.cylinderCylinder]() {
    return this.convexConvex;
  }
  get [COLLISION_TYPES.sphereCylinder]() {
    return this.sphereConvex;
  }
  get [COLLISION_TYPES.planeCylinder]() {
    return this.planeConvex;
  }
  get [COLLISION_TYPES.boxCylinder]() {
    return this.boxConvex;
  }
  get [COLLISION_TYPES.convexCylinder]() {
    return this.convexConvex;
  }
  get [COLLISION_TYPES.heightfieldCylinder]() {
    return this.heightfieldCylinder;
  }
  get [COLLISION_TYPES.particleCylinder]() {
    return this.particleCylinder;
  }
  get [COLLISION_TYPES.sphereTrimesh]() {
    return this.sphereTrimesh;
  }
  get [COLLISION_TYPES.planeTrimesh]() {
    return this.planeTrimesh;
  }
  // get [COLLISION_TYPES.convexTrimesh]() {
  //   return this.convexTrimesh
  // }
  constructor(world) {
    this.contactPointPool = [];
    this.frictionEquationPool = [];
    this.result = [];
    this.frictionResult = [];
    this.v3pool = new Vec3Pool();
    this.world = world;
    this.currentContactMaterial = world.defaultContactMaterial;
    this.enableFrictionReduction = false;
  }
  /**
   * Make a contact object, by using the internal pool or creating a new one.
   */
  createContactEquation(bi, bj, si, sj, overrideShapeA, overrideShapeB) {
    let c2;
    if (this.contactPointPool.length) {
      c2 = this.contactPointPool.pop();
      c2.bi = bi;
      c2.bj = bj;
    } else {
      c2 = new ContactEquation(bi, bj);
    }
    c2.enabled = bi.collisionResponse && bj.collisionResponse && si.collisionResponse && sj.collisionResponse;
    const cm = this.currentContactMaterial;
    c2.restitution = cm.restitution;
    c2.setSpookParams(cm.contactEquationStiffness, cm.contactEquationRelaxation, this.world.dt);
    const matA = si.material || bi.material;
    const matB = sj.material || bj.material;
    if (matA && matB && matA.restitution >= 0 && matB.restitution >= 0) {
      c2.restitution = matA.restitution * matB.restitution;
    }
    c2.si = overrideShapeA || si;
    c2.sj = overrideShapeB || sj;
    return c2;
  }
  createFrictionEquationsFromContact(contactEquation, outArray) {
    const bodyA = contactEquation.bi;
    const bodyB = contactEquation.bj;
    const shapeA = contactEquation.si;
    const shapeB = contactEquation.sj;
    const world = this.world;
    const cm = this.currentContactMaterial;
    let friction = cm.friction;
    const matA = shapeA.material || bodyA.material;
    const matB = shapeB.material || bodyB.material;
    if (matA && matB && matA.friction >= 0 && matB.friction >= 0) {
      friction = matA.friction * matB.friction;
    }
    if (friction > 0) {
      const mug = friction * (world.frictionGravity || world.gravity).length();
      let reducedMass = bodyA.invMass + bodyB.invMass;
      if (reducedMass > 0) {
        reducedMass = 1 / reducedMass;
      }
      const pool = this.frictionEquationPool;
      const c1 = pool.length ? pool.pop() : new FrictionEquation(bodyA, bodyB, mug * reducedMass);
      const c2 = pool.length ? pool.pop() : new FrictionEquation(bodyA, bodyB, mug * reducedMass);
      c1.bi = c2.bi = bodyA;
      c1.bj = c2.bj = bodyB;
      c1.minForce = c2.minForce = -mug * reducedMass;
      c1.maxForce = c2.maxForce = mug * reducedMass;
      c1.ri.copy(contactEquation.ri);
      c1.rj.copy(contactEquation.rj);
      c2.ri.copy(contactEquation.ri);
      c2.rj.copy(contactEquation.rj);
      contactEquation.ni.tangents(c1.t, c2.t);
      c1.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, world.dt);
      c2.setSpookParams(cm.frictionEquationStiffness, cm.frictionEquationRelaxation, world.dt);
      c1.enabled = c2.enabled = contactEquation.enabled;
      outArray.push(c1, c2);
      return true;
    }
    return false;
  }
  /**
   * Take the average N latest contact point on the plane.
   */
  createFrictionFromAverage(numContacts) {
    let c2 = this.result[this.result.length - 1];
    if (!this.createFrictionEquationsFromContact(c2, this.frictionResult) || numContacts === 1) {
      return;
    }
    const f1 = this.frictionResult[this.frictionResult.length - 2];
    const f2 = this.frictionResult[this.frictionResult.length - 1];
    averageNormal.setZero();
    averageContactPointA.setZero();
    averageContactPointB.setZero();
    const bodyA = c2.bi;
    c2.bj;
    for (let i = 0; i !== numContacts; i++) {
      c2 = this.result[this.result.length - 1 - i];
      if (c2.bi !== bodyA) {
        averageNormal.vadd(c2.ni, averageNormal);
        averageContactPointA.vadd(c2.ri, averageContactPointA);
        averageContactPointB.vadd(c2.rj, averageContactPointB);
      } else {
        averageNormal.vsub(c2.ni, averageNormal);
        averageContactPointA.vadd(c2.rj, averageContactPointA);
        averageContactPointB.vadd(c2.ri, averageContactPointB);
      }
    }
    const invNumContacts = 1 / numContacts;
    averageContactPointA.scale(invNumContacts, f1.ri);
    averageContactPointB.scale(invNumContacts, f1.rj);
    f2.ri.copy(f1.ri);
    f2.rj.copy(f1.rj);
    averageNormal.normalize();
    averageNormal.tangents(f1.t, f2.t);
  }
  /**
   * Generate all contacts between a list of body pairs
   * @param p1 Array of body indices
   * @param p2 Array of body indices
   * @param result Array to store generated contacts
   * @param oldcontacts Optional. Array of reusable contact objects
   */
  getContacts(p1, p2, world, result, oldcontacts, frictionResult, frictionPool) {
    this.contactPointPool = oldcontacts;
    this.frictionEquationPool = frictionPool;
    this.result = result;
    this.frictionResult = frictionResult;
    const qi = tmpQuat1;
    const qj = tmpQuat2;
    const xi = tmpVec1;
    const xj = tmpVec2;
    for (let k = 0, N = p1.length; k !== N; k++) {
      const bi = p1[k];
      const bj = p2[k];
      let bodyContactMaterial = null;
      if (bi.material && bj.material) {
        bodyContactMaterial = world.getContactMaterial(bi.material, bj.material) || null;
      }
      const justTest = bi.type & Body.KINEMATIC && bj.type & Body.STATIC || bi.type & Body.STATIC && bj.type & Body.KINEMATIC || bi.type & Body.KINEMATIC && bj.type & Body.KINEMATIC;
      for (let i = 0; i < bi.shapes.length; i++) {
        bi.quaternion.mult(bi.shapeOrientations[i], qi);
        bi.quaternion.vmult(bi.shapeOffsets[i], xi);
        xi.vadd(bi.position, xi);
        const si = bi.shapes[i];
        for (let j = 0; j < bj.shapes.length; j++) {
          bj.quaternion.mult(bj.shapeOrientations[j], qj);
          bj.quaternion.vmult(bj.shapeOffsets[j], xj);
          xj.vadd(bj.position, xj);
          const sj = bj.shapes[j];
          if (!(si.collisionFilterMask & sj.collisionFilterGroup && sj.collisionFilterMask & si.collisionFilterGroup)) {
            continue;
          }
          if (xi.distanceTo(xj) > si.boundingSphereRadius + sj.boundingSphereRadius) {
            continue;
          }
          let shapeContactMaterial = null;
          if (si.material && sj.material) {
            shapeContactMaterial = world.getContactMaterial(si.material, sj.material) || null;
          }
          this.currentContactMaterial = shapeContactMaterial || bodyContactMaterial || world.defaultContactMaterial;
          const resolverIndex = si.type | sj.type;
          const resolver = this[resolverIndex];
          if (resolver) {
            let retval = false;
            if (si.type < sj.type) {
              retval = resolver.call(this, si, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
            } else {
              retval = resolver.call(this, sj, si, xj, xi, qj, qi, bj, bi, si, sj, justTest);
            }
            if (retval && justTest) {
              world.shapeOverlapKeeper.set(si.id, sj.id);
              world.bodyOverlapKeeper.set(bi.id, bj.id);
            }
          }
        }
      }
    }
  }
  sphereSphere(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    if (justTest) {
      return xi.distanceSquared(xj) < (si.radius + sj.radius) ** 2;
    }
    const contactEq = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
    xj.vsub(xi, contactEq.ni);
    contactEq.ni.normalize();
    contactEq.ri.copy(contactEq.ni);
    contactEq.rj.copy(contactEq.ni);
    contactEq.ri.scale(si.radius, contactEq.ri);
    contactEq.rj.scale(-sj.radius, contactEq.rj);
    contactEq.ri.vadd(xi, contactEq.ri);
    contactEq.ri.vsub(bi.position, contactEq.ri);
    contactEq.rj.vadd(xj, contactEq.rj);
    contactEq.rj.vsub(bj.position, contactEq.rj);
    this.result.push(contactEq);
    this.createFrictionEquationsFromContact(contactEq, this.frictionResult);
  }
  spherePlane(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
    r.ni.set(0, 0, 1);
    qj.vmult(r.ni, r.ni);
    r.ni.negate(r.ni);
    r.ni.normalize();
    r.ni.scale(si.radius, r.ri);
    xi.vsub(xj, point_on_plane_to_sphere);
    r.ni.scale(r.ni.dot(point_on_plane_to_sphere), plane_to_sphere_ortho);
    point_on_plane_to_sphere.vsub(plane_to_sphere_ortho, r.rj);
    if (-point_on_plane_to_sphere.dot(r.ni) <= si.radius) {
      if (justTest) {
        return true;
      }
      const ri = r.ri;
      const rj = r.rj;
      ri.vadd(xi, ri);
      ri.vsub(bi.position, ri);
      rj.vadd(xj, rj);
      rj.vsub(bj.position, rj);
      this.result.push(r);
      this.createFrictionEquationsFromContact(r, this.frictionResult);
    }
  }
  boxBox(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    si.convexPolyhedronRepresentation.material = si.material;
    sj.convexPolyhedronRepresentation.material = sj.material;
    si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
    sj.convexPolyhedronRepresentation.collisionResponse = sj.collisionResponse;
    return this.convexConvex(si.convexPolyhedronRepresentation, sj.convexPolyhedronRepresentation, xi, xj, qi, qj, bi, bj, si, sj, justTest);
  }
  sphereBox(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    const v3pool = this.v3pool;
    const sides = sphereBox_sides;
    xi.vsub(xj, box_to_sphere);
    sj.getSideNormals(sides, qj);
    const R = si.radius;
    let found = false;
    const side_ns = sphereBox_side_ns;
    const side_ns1 = sphereBox_side_ns1;
    const side_ns2 = sphereBox_side_ns2;
    let side_h = null;
    let side_penetrations = 0;
    let side_dot1 = 0;
    let side_dot2 = 0;
    let side_distance = null;
    for (let idx = 0, nsides = sides.length; idx !== nsides && found === false; idx++) {
      const ns = sphereBox_ns;
      ns.copy(sides[idx]);
      const h = ns.length();
      ns.normalize();
      const dot4 = box_to_sphere.dot(ns);
      if (dot4 < h + R && dot4 > 0) {
        const ns1 = sphereBox_ns1;
        const ns2 = sphereBox_ns2;
        ns1.copy(sides[(idx + 1) % 3]);
        ns2.copy(sides[(idx + 2) % 3]);
        const h1 = ns1.length();
        const h2 = ns2.length();
        ns1.normalize();
        ns2.normalize();
        const dot1 = box_to_sphere.dot(ns1);
        const dot22 = box_to_sphere.dot(ns2);
        if (dot1 < h1 && dot1 > -h1 && dot22 < h2 && dot22 > -h2) {
          const dist3 = Math.abs(dot4 - h - R);
          if (side_distance === null || dist3 < side_distance) {
            side_distance = dist3;
            side_dot1 = dot1;
            side_dot2 = dot22;
            side_h = h;
            side_ns.copy(ns);
            side_ns1.copy(ns1);
            side_ns2.copy(ns2);
            side_penetrations++;
            if (justTest) {
              return true;
            }
          }
        }
      }
    }
    if (side_penetrations) {
      found = true;
      const r2 = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
      side_ns.scale(-R, r2.ri);
      r2.ni.copy(side_ns);
      r2.ni.negate(r2.ni);
      side_ns.scale(side_h, side_ns);
      side_ns1.scale(side_dot1, side_ns1);
      side_ns.vadd(side_ns1, side_ns);
      side_ns2.scale(side_dot2, side_ns2);
      side_ns.vadd(side_ns2, r2.rj);
      r2.ri.vadd(xi, r2.ri);
      r2.ri.vsub(bi.position, r2.ri);
      r2.rj.vadd(xj, r2.rj);
      r2.rj.vsub(bj.position, r2.rj);
      this.result.push(r2);
      this.createFrictionEquationsFromContact(r2, this.frictionResult);
    }
    let rj = v3pool.get();
    const sphere_to_corner = sphereBox_sphere_to_corner;
    for (let j = 0; j !== 2 && !found; j++) {
      for (let k = 0; k !== 2 && !found; k++) {
        for (let l = 0; l !== 2 && !found; l++) {
          rj.set(0, 0, 0);
          if (j) {
            rj.vadd(sides[0], rj);
          } else {
            rj.vsub(sides[0], rj);
          }
          if (k) {
            rj.vadd(sides[1], rj);
          } else {
            rj.vsub(sides[1], rj);
          }
          if (l) {
            rj.vadd(sides[2], rj);
          } else {
            rj.vsub(sides[2], rj);
          }
          xj.vadd(rj, sphere_to_corner);
          sphere_to_corner.vsub(xi, sphere_to_corner);
          if (sphere_to_corner.lengthSquared() < R * R) {
            if (justTest) {
              return true;
            }
            found = true;
            const r2 = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
            r2.ri.copy(sphere_to_corner);
            r2.ri.normalize();
            r2.ni.copy(r2.ri);
            r2.ri.scale(R, r2.ri);
            r2.rj.copy(rj);
            r2.ri.vadd(xi, r2.ri);
            r2.ri.vsub(bi.position, r2.ri);
            r2.rj.vadd(xj, r2.rj);
            r2.rj.vsub(bj.position, r2.rj);
            this.result.push(r2);
            this.createFrictionEquationsFromContact(r2, this.frictionResult);
          }
        }
      }
    }
    v3pool.release(rj);
    rj = null;
    const edgeTangent = v3pool.get();
    const edgeCenter = v3pool.get();
    const r = v3pool.get();
    const orthogonal = v3pool.get();
    const dist2 = v3pool.get();
    const Nsides = sides.length;
    for (let j = 0; j !== Nsides && !found; j++) {
      for (let k = 0; k !== Nsides && !found; k++) {
        if (j % 3 !== k % 3) {
          sides[k].cross(sides[j], edgeTangent);
          edgeTangent.normalize();
          sides[j].vadd(sides[k], edgeCenter);
          r.copy(xi);
          r.vsub(edgeCenter, r);
          r.vsub(xj, r);
          const orthonorm = r.dot(edgeTangent);
          edgeTangent.scale(orthonorm, orthogonal);
          let l = 0;
          while (l === j % 3 || l === k % 3) {
            l++;
          }
          dist2.copy(xi);
          dist2.vsub(orthogonal, dist2);
          dist2.vsub(edgeCenter, dist2);
          dist2.vsub(xj, dist2);
          const tdist = Math.abs(orthonorm);
          const ndist = dist2.length();
          if (tdist < sides[l].length() && ndist < R) {
            if (justTest) {
              return true;
            }
            found = true;
            const res = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
            edgeCenter.vadd(orthogonal, res.rj);
            res.rj.copy(res.rj);
            dist2.negate(res.ni);
            res.ni.normalize();
            res.ri.copy(res.rj);
            res.ri.vadd(xj, res.ri);
            res.ri.vsub(xi, res.ri);
            res.ri.normalize();
            res.ri.scale(R, res.ri);
            res.ri.vadd(xi, res.ri);
            res.ri.vsub(bi.position, res.ri);
            res.rj.vadd(xj, res.rj);
            res.rj.vsub(bj.position, res.rj);
            this.result.push(res);
            this.createFrictionEquationsFromContact(res, this.frictionResult);
          }
        }
      }
    }
    v3pool.release(edgeTangent, edgeCenter, r, orthogonal, dist2);
  }
  planeBox(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    sj.convexPolyhedronRepresentation.material = sj.material;
    sj.convexPolyhedronRepresentation.collisionResponse = sj.collisionResponse;
    sj.convexPolyhedronRepresentation.id = sj.id;
    return this.planeConvex(si, sj.convexPolyhedronRepresentation, xi, xj, qi, qj, bi, bj, si, sj, justTest);
  }
  convexConvex(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest, faceListA, faceListB) {
    const sepAxis = convexConvex_sepAxis;
    if (xi.distanceTo(xj) > si.boundingSphereRadius + sj.boundingSphereRadius) {
      return;
    }
    if (si.findSeparatingAxis(sj, xi, qi, xj, qj, sepAxis, faceListA, faceListB)) {
      const res = [];
      const q = convexConvex_q;
      si.clipAgainstHull(xi, qi, sj, xj, qj, sepAxis, -100, 100, res);
      let numContacts = 0;
      for (let j = 0; j !== res.length; j++) {
        if (justTest) {
          return true;
        }
        const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
        const ri = r.ri;
        const rj = r.rj;
        sepAxis.negate(r.ni);
        res[j].normal.negate(q);
        q.scale(res[j].depth, q);
        res[j].point.vadd(q, ri);
        rj.copy(res[j].point);
        ri.vsub(xi, ri);
        rj.vsub(xj, rj);
        ri.vadd(xi, ri);
        ri.vsub(bi.position, ri);
        rj.vadd(xj, rj);
        rj.vsub(bj.position, rj);
        this.result.push(r);
        numContacts++;
        if (!this.enableFrictionReduction) {
          this.createFrictionEquationsFromContact(r, this.frictionResult);
        }
      }
      if (this.enableFrictionReduction && numContacts) {
        this.createFrictionFromAverage(numContacts);
      }
    }
  }
  sphereConvex(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    const v3pool = this.v3pool;
    xi.vsub(xj, convex_to_sphere);
    const normals = sj.faceNormals;
    const faces = sj.faces;
    const verts = sj.vertices;
    const R = si.radius;
    let found = false;
    for (let i = 0; i !== verts.length; i++) {
      const v = verts[i];
      const worldCorner = sphereConvex_worldCorner;
      qj.vmult(v, worldCorner);
      xj.vadd(worldCorner, worldCorner);
      const sphere_to_corner = sphereConvex_sphereToCorner;
      worldCorner.vsub(xi, sphere_to_corner);
      if (sphere_to_corner.lengthSquared() < R * R) {
        if (justTest) {
          return true;
        }
        found = true;
        const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
        r.ri.copy(sphere_to_corner);
        r.ri.normalize();
        r.ni.copy(r.ri);
        r.ri.scale(R, r.ri);
        worldCorner.vsub(xj, r.rj);
        r.ri.vadd(xi, r.ri);
        r.ri.vsub(bi.position, r.ri);
        r.rj.vadd(xj, r.rj);
        r.rj.vsub(bj.position, r.rj);
        this.result.push(r);
        this.createFrictionEquationsFromContact(r, this.frictionResult);
        return;
      }
    }
    for (let i = 0, nfaces = faces.length; i !== nfaces && found === false; i++) {
      const normal = normals[i];
      const face = faces[i];
      const worldNormal = sphereConvex_worldNormal;
      qj.vmult(normal, worldNormal);
      const worldPoint = sphereConvex_worldPoint;
      qj.vmult(verts[face[0]], worldPoint);
      worldPoint.vadd(xj, worldPoint);
      const worldSpherePointClosestToPlane = sphereConvex_worldSpherePointClosestToPlane;
      worldNormal.scale(-R, worldSpherePointClosestToPlane);
      xi.vadd(worldSpherePointClosestToPlane, worldSpherePointClosestToPlane);
      const penetrationVec = sphereConvex_penetrationVec;
      worldSpherePointClosestToPlane.vsub(worldPoint, penetrationVec);
      const penetration = penetrationVec.dot(worldNormal);
      const worldPointToSphere = sphereConvex_sphereToWorldPoint;
      xi.vsub(worldPoint, worldPointToSphere);
      if (penetration < 0 && worldPointToSphere.dot(worldNormal) > 0) {
        const faceVerts = [];
        for (let j = 0, Nverts = face.length; j !== Nverts; j++) {
          const worldVertex = v3pool.get();
          qj.vmult(verts[face[j]], worldVertex);
          xj.vadd(worldVertex, worldVertex);
          faceVerts.push(worldVertex);
        }
        if (pointInPolygon(faceVerts, worldNormal, xi)) {
          if (justTest) {
            return true;
          }
          found = true;
          const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
          worldNormal.scale(-R, r.ri);
          worldNormal.negate(r.ni);
          const penetrationVec2 = v3pool.get();
          worldNormal.scale(-penetration, penetrationVec2);
          const penetrationSpherePoint = v3pool.get();
          worldNormal.scale(-R, penetrationSpherePoint);
          xi.vsub(xj, r.rj);
          r.rj.vadd(penetrationSpherePoint, r.rj);
          r.rj.vadd(penetrationVec2, r.rj);
          r.rj.vadd(xj, r.rj);
          r.rj.vsub(bj.position, r.rj);
          r.ri.vadd(xi, r.ri);
          r.ri.vsub(bi.position, r.ri);
          v3pool.release(penetrationVec2);
          v3pool.release(penetrationSpherePoint);
          this.result.push(r);
          this.createFrictionEquationsFromContact(r, this.frictionResult);
          for (let j = 0, Nfaceverts = faceVerts.length; j !== Nfaceverts; j++) {
            v3pool.release(faceVerts[j]);
          }
          return;
        } else {
          for (let j = 0; j !== face.length; j++) {
            const v12 = v3pool.get();
            const v22 = v3pool.get();
            qj.vmult(verts[face[(j + 1) % face.length]], v12);
            qj.vmult(verts[face[(j + 2) % face.length]], v22);
            xj.vadd(v12, v12);
            xj.vadd(v22, v22);
            const edge = sphereConvex_edge;
            v22.vsub(v12, edge);
            const edgeUnit = sphereConvex_edgeUnit;
            edge.unit(edgeUnit);
            const p = v3pool.get();
            const v1_to_xi = v3pool.get();
            xi.vsub(v12, v1_to_xi);
            const dot4 = v1_to_xi.dot(edgeUnit);
            edgeUnit.scale(dot4, p);
            p.vadd(v12, p);
            const xi_to_p = v3pool.get();
            p.vsub(xi, xi_to_p);
            if (dot4 > 0 && dot4 * dot4 < edge.lengthSquared() && xi_to_p.lengthSquared() < R * R) {
              if (justTest) {
                return true;
              }
              const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
              p.vsub(xj, r.rj);
              p.vsub(xi, r.ni);
              r.ni.normalize();
              r.ni.scale(R, r.ri);
              r.rj.vadd(xj, r.rj);
              r.rj.vsub(bj.position, r.rj);
              r.ri.vadd(xi, r.ri);
              r.ri.vsub(bi.position, r.ri);
              this.result.push(r);
              this.createFrictionEquationsFromContact(r, this.frictionResult);
              for (let j2 = 0, Nfaceverts = faceVerts.length; j2 !== Nfaceverts; j2++) {
                v3pool.release(faceVerts[j2]);
              }
              v3pool.release(v12);
              v3pool.release(v22);
              v3pool.release(p);
              v3pool.release(xi_to_p);
              v3pool.release(v1_to_xi);
              return;
            }
            v3pool.release(v12);
            v3pool.release(v22);
            v3pool.release(p);
            v3pool.release(xi_to_p);
            v3pool.release(v1_to_xi);
          }
        }
        for (let j = 0, Nfaceverts = faceVerts.length; j !== Nfaceverts; j++) {
          v3pool.release(faceVerts[j]);
        }
      }
    }
  }
  planeConvex(planeShape, convexShape, planePosition, convexPosition, planeQuat, convexQuat, planeBody, convexBody, si, sj, justTest) {
    const worldVertex = planeConvex_v;
    const worldNormal = planeConvex_normal;
    worldNormal.set(0, 0, 1);
    planeQuat.vmult(worldNormal, worldNormal);
    let numContacts = 0;
    const relpos2 = planeConvex_relpos;
    for (let i = 0; i !== convexShape.vertices.length; i++) {
      worldVertex.copy(convexShape.vertices[i]);
      convexQuat.vmult(worldVertex, worldVertex);
      convexPosition.vadd(worldVertex, worldVertex);
      worldVertex.vsub(planePosition, relpos2);
      const dot4 = worldNormal.dot(relpos2);
      if (dot4 <= 0) {
        if (justTest) {
          return true;
        }
        const r = this.createContactEquation(planeBody, convexBody, planeShape, convexShape, si, sj);
        const projected = planeConvex_projected;
        worldNormal.scale(worldNormal.dot(relpos2), projected);
        worldVertex.vsub(projected, projected);
        projected.vsub(planePosition, r.ri);
        r.ni.copy(worldNormal);
        worldVertex.vsub(convexPosition, r.rj);
        r.ri.vadd(planePosition, r.ri);
        r.ri.vsub(planeBody.position, r.ri);
        r.rj.vadd(convexPosition, r.rj);
        r.rj.vsub(convexBody.position, r.rj);
        this.result.push(r);
        numContacts++;
        if (!this.enableFrictionReduction) {
          this.createFrictionEquationsFromContact(r, this.frictionResult);
        }
      }
    }
    if (this.enableFrictionReduction && numContacts) {
      this.createFrictionFromAverage(numContacts);
    }
  }
  boxConvex(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    si.convexPolyhedronRepresentation.material = si.material;
    si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
    return this.convexConvex(si.convexPolyhedronRepresentation, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
  }
  sphereHeightfield(sphereShape, hfShape, spherePos, hfPos, sphereQuat, hfQuat, sphereBody, hfBody, rsi, rsj, justTest) {
    const data = hfShape.data;
    const radius = sphereShape.radius;
    const w = hfShape.elementSize;
    const worldPillarOffset2 = sphereHeightfield_tmp2;
    const localSpherePos = sphereHeightfield_tmp1;
    Transform.pointToLocalFrame(hfPos, hfQuat, spherePos, localSpherePos);
    let iMinX = Math.floor((localSpherePos.x - radius) / w) - 1;
    let iMaxX = Math.ceil((localSpherePos.x + radius) / w) + 1;
    let iMinY = Math.floor((localSpherePos.y - radius) / w) - 1;
    let iMaxY = Math.ceil((localSpherePos.y + radius) / w) + 1;
    if (iMaxX < 0 || iMaxY < 0 || iMinX > data.length || iMinY > data[0].length) {
      return;
    }
    if (iMinX < 0) {
      iMinX = 0;
    }
    if (iMaxX < 0) {
      iMaxX = 0;
    }
    if (iMinY < 0) {
      iMinY = 0;
    }
    if (iMaxY < 0) {
      iMaxY = 0;
    }
    if (iMinX >= data.length) {
      iMinX = data.length - 1;
    }
    if (iMaxX >= data.length) {
      iMaxX = data.length - 1;
    }
    if (iMaxY >= data[0].length) {
      iMaxY = data[0].length - 1;
    }
    if (iMinY >= data[0].length) {
      iMinY = data[0].length - 1;
    }
    const minMax = [];
    hfShape.getRectMinMax(iMinX, iMinY, iMaxX, iMaxY, minMax);
    const min2 = minMax[0];
    const max2 = minMax[1];
    if (localSpherePos.z - radius > max2 || localSpherePos.z + radius < min2) {
      return;
    }
    const result = this.result;
    for (let i = iMinX; i < iMaxX; i++) {
      for (let j = iMinY; j < iMaxY; j++) {
        const numContactsBefore = result.length;
        let intersecting = false;
        hfShape.getConvexTrianglePillar(i, j, false);
        Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset2);
        if (spherePos.distanceTo(worldPillarOffset2) < hfShape.pillarConvex.boundingSphereRadius + sphereShape.boundingSphereRadius) {
          intersecting = this.sphereConvex(sphereShape, hfShape.pillarConvex, spherePos, worldPillarOffset2, sphereQuat, hfQuat, sphereBody, hfBody, sphereShape, hfShape, justTest);
        }
        if (justTest && intersecting) {
          return true;
        }
        hfShape.getConvexTrianglePillar(i, j, true);
        Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset2);
        if (spherePos.distanceTo(worldPillarOffset2) < hfShape.pillarConvex.boundingSphereRadius + sphereShape.boundingSphereRadius) {
          intersecting = this.sphereConvex(sphereShape, hfShape.pillarConvex, spherePos, worldPillarOffset2, sphereQuat, hfQuat, sphereBody, hfBody, sphereShape, hfShape, justTest);
        }
        if (justTest && intersecting) {
          return true;
        }
        const numContacts = result.length - numContactsBefore;
        if (numContacts > 2) {
          return;
        }
      }
    }
  }
  boxHeightfield(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    si.convexPolyhedronRepresentation.material = si.material;
    si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
    return this.convexHeightfield(si.convexPolyhedronRepresentation, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
  }
  convexHeightfield(convexShape, hfShape, convexPos, hfPos, convexQuat, hfQuat, convexBody, hfBody, rsi, rsj, justTest) {
    const data = hfShape.data;
    const w = hfShape.elementSize;
    const radius = convexShape.boundingSphereRadius;
    const worldPillarOffset2 = convexHeightfield_tmp2;
    const faceList = convexHeightfield_faceList;
    const localConvexPos = convexHeightfield_tmp1;
    Transform.pointToLocalFrame(hfPos, hfQuat, convexPos, localConvexPos);
    let iMinX = Math.floor((localConvexPos.x - radius) / w) - 1;
    let iMaxX = Math.ceil((localConvexPos.x + radius) / w) + 1;
    let iMinY = Math.floor((localConvexPos.y - radius) / w) - 1;
    let iMaxY = Math.ceil((localConvexPos.y + radius) / w) + 1;
    if (iMaxX < 0 || iMaxY < 0 || iMinX > data.length || iMinY > data[0].length) {
      return;
    }
    if (iMinX < 0) {
      iMinX = 0;
    }
    if (iMaxX < 0) {
      iMaxX = 0;
    }
    if (iMinY < 0) {
      iMinY = 0;
    }
    if (iMaxY < 0) {
      iMaxY = 0;
    }
    if (iMinX >= data.length) {
      iMinX = data.length - 1;
    }
    if (iMaxX >= data.length) {
      iMaxX = data.length - 1;
    }
    if (iMaxY >= data[0].length) {
      iMaxY = data[0].length - 1;
    }
    if (iMinY >= data[0].length) {
      iMinY = data[0].length - 1;
    }
    const minMax = [];
    hfShape.getRectMinMax(iMinX, iMinY, iMaxX, iMaxY, minMax);
    const min2 = minMax[0];
    const max2 = minMax[1];
    if (localConvexPos.z - radius > max2 || localConvexPos.z + radius < min2) {
      return;
    }
    for (let i = iMinX; i < iMaxX; i++) {
      for (let j = iMinY; j < iMaxY; j++) {
        let intersecting = false;
        hfShape.getConvexTrianglePillar(i, j, false);
        Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset2);
        if (convexPos.distanceTo(worldPillarOffset2) < hfShape.pillarConvex.boundingSphereRadius + convexShape.boundingSphereRadius) {
          intersecting = this.convexConvex(convexShape, hfShape.pillarConvex, convexPos, worldPillarOffset2, convexQuat, hfQuat, convexBody, hfBody, null, null, justTest, faceList, null);
        }
        if (justTest && intersecting) {
          return true;
        }
        hfShape.getConvexTrianglePillar(i, j, true);
        Transform.pointToWorldFrame(hfPos, hfQuat, hfShape.pillarOffset, worldPillarOffset2);
        if (convexPos.distanceTo(worldPillarOffset2) < hfShape.pillarConvex.boundingSphereRadius + convexShape.boundingSphereRadius) {
          intersecting = this.convexConvex(convexShape, hfShape.pillarConvex, convexPos, worldPillarOffset2, convexQuat, hfQuat, convexBody, hfBody, null, null, justTest, faceList, null);
        }
        if (justTest && intersecting) {
          return true;
        }
      }
    }
  }
  sphereParticle(sj, si, xj, xi, qj, qi, bj, bi, rsi, rsj, justTest) {
    const normal = particleSphere_normal;
    normal.set(0, 0, 1);
    xi.vsub(xj, normal);
    const lengthSquared = normal.lengthSquared();
    if (lengthSquared <= sj.radius * sj.radius) {
      if (justTest) {
        return true;
      }
      const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
      normal.normalize();
      r.rj.copy(normal);
      r.rj.scale(sj.radius, r.rj);
      r.ni.copy(normal);
      r.ni.negate(r.ni);
      r.ri.set(0, 0, 0);
      this.result.push(r);
      this.createFrictionEquationsFromContact(r, this.frictionResult);
    }
  }
  planeParticle(sj, si, xj, xi, qj, qi, bj, bi, rsi, rsj, justTest) {
    const normal = particlePlane_normal;
    normal.set(0, 0, 1);
    bj.quaternion.vmult(normal, normal);
    const relpos2 = particlePlane_relpos;
    xi.vsub(bj.position, relpos2);
    const dot4 = normal.dot(relpos2);
    if (dot4 <= 0) {
      if (justTest) {
        return true;
      }
      const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
      r.ni.copy(normal);
      r.ni.negate(r.ni);
      r.ri.set(0, 0, 0);
      const projected = particlePlane_projected;
      normal.scale(normal.dot(xi), projected);
      xi.vsub(projected, projected);
      r.rj.copy(projected);
      this.result.push(r);
      this.createFrictionEquationsFromContact(r, this.frictionResult);
    }
  }
  boxParticle(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    si.convexPolyhedronRepresentation.material = si.material;
    si.convexPolyhedronRepresentation.collisionResponse = si.collisionResponse;
    return this.convexParticle(si.convexPolyhedronRepresentation, sj, xi, xj, qi, qj, bi, bj, si, sj, justTest);
  }
  convexParticle(sj, si, xj, xi, qj, qi, bj, bi, rsi, rsj, justTest) {
    let penetratedFaceIndex = -1;
    const penetratedFaceNormal = convexParticle_penetratedFaceNormal;
    const worldPenetrationVec = convexParticle_worldPenetrationVec;
    let minPenetration = null;
    const local = convexParticle_local;
    local.copy(xi);
    local.vsub(xj, local);
    qj.conjugate(cqj);
    cqj.vmult(local, local);
    if (sj.pointIsInside(local)) {
      if (sj.worldVerticesNeedsUpdate) {
        sj.computeWorldVertices(xj, qj);
      }
      if (sj.worldFaceNormalsNeedsUpdate) {
        sj.computeWorldFaceNormals(qj);
      }
      for (let i = 0, nfaces = sj.faces.length; i !== nfaces; i++) {
        const verts = [sj.worldVertices[sj.faces[i][0]]];
        const normal = sj.worldFaceNormals[i];
        xi.vsub(verts[0], convexParticle_vertexToParticle);
        const penetration = -normal.dot(convexParticle_vertexToParticle);
        if (minPenetration === null || Math.abs(penetration) < Math.abs(minPenetration)) {
          if (justTest) {
            return true;
          }
          minPenetration = penetration;
          penetratedFaceIndex = i;
          penetratedFaceNormal.copy(normal);
        }
      }
      if (penetratedFaceIndex !== -1) {
        const r = this.createContactEquation(bi, bj, si, sj, rsi, rsj);
        penetratedFaceNormal.scale(minPenetration, worldPenetrationVec);
        worldPenetrationVec.vadd(xi, worldPenetrationVec);
        worldPenetrationVec.vsub(xj, worldPenetrationVec);
        r.rj.copy(worldPenetrationVec);
        penetratedFaceNormal.negate(r.ni);
        r.ri.set(0, 0, 0);
        const ri = r.ri;
        const rj = r.rj;
        ri.vadd(xi, ri);
        ri.vsub(bi.position, ri);
        rj.vadd(xj, rj);
        rj.vsub(bj.position, rj);
        this.result.push(r);
        this.createFrictionEquationsFromContact(r, this.frictionResult);
      } else {
        console.warn("Point found inside convex, but did not find penetrating face!");
      }
    }
  }
  heightfieldCylinder(hfShape, convexShape, hfPos, convexPos, hfQuat, convexQuat, hfBody, convexBody, rsi, rsj, justTest) {
    return this.convexHeightfield(convexShape, hfShape, convexPos, hfPos, convexQuat, hfQuat, convexBody, hfBody, rsi, rsj, justTest);
  }
  particleCylinder(si, sj, xi, xj, qi, qj, bi, bj, rsi, rsj, justTest) {
    return this.convexParticle(sj, si, xj, xi, qj, qi, bj, bi, rsi, rsj, justTest);
  }
  sphereTrimesh(sphereShape, trimeshShape, spherePos, trimeshPos, sphereQuat, trimeshQuat, sphereBody, trimeshBody, rsi, rsj, justTest) {
    const edgeVertexA = sphereTrimesh_edgeVertexA;
    const edgeVertexB = sphereTrimesh_edgeVertexB;
    const edgeVector = sphereTrimesh_edgeVector;
    const edgeVectorUnit = sphereTrimesh_edgeVectorUnit;
    const localSpherePos = sphereTrimesh_localSpherePos;
    const tmp2 = sphereTrimesh_tmp;
    const localSphereAABB = sphereTrimesh_localSphereAABB;
    const v22 = sphereTrimesh_v2;
    const relpos2 = sphereTrimesh_relpos;
    const triangles = sphereTrimesh_triangles;
    Transform.pointToLocalFrame(trimeshPos, trimeshQuat, spherePos, localSpherePos);
    const sphereRadius = sphereShape.radius;
    localSphereAABB.lowerBound.set(localSpherePos.x - sphereRadius, localSpherePos.y - sphereRadius, localSpherePos.z - sphereRadius);
    localSphereAABB.upperBound.set(localSpherePos.x + sphereRadius, localSpherePos.y + sphereRadius, localSpherePos.z + sphereRadius);
    trimeshShape.getTrianglesInAABB(localSphereAABB, triangles);
    const v = sphereTrimesh_v;
    const radiusSquared = sphereShape.radius * sphereShape.radius;
    for (let i = 0; i < triangles.length; i++) {
      for (let j = 0; j < 3; j++) {
        trimeshShape.getVertex(trimeshShape.indices[triangles[i] * 3 + j], v);
        v.vsub(localSpherePos, relpos2);
        if (relpos2.lengthSquared() <= radiusSquared) {
          v22.copy(v);
          Transform.pointToWorldFrame(trimeshPos, trimeshQuat, v22, v);
          v.vsub(spherePos, relpos2);
          if (justTest) {
            return true;
          }
          let r = this.createContactEquation(sphereBody, trimeshBody, sphereShape, trimeshShape, rsi, rsj);
          r.ni.copy(relpos2);
          r.ni.normalize();
          r.ri.copy(r.ni);
          r.ri.scale(sphereShape.radius, r.ri);
          r.ri.vadd(spherePos, r.ri);
          r.ri.vsub(sphereBody.position, r.ri);
          r.rj.copy(v);
          r.rj.vsub(trimeshBody.position, r.rj);
          this.result.push(r);
          this.createFrictionEquationsFromContact(r, this.frictionResult);
        }
      }
    }
    for (let i = 0; i < triangles.length; i++) {
      for (let j = 0; j < 3; j++) {
        trimeshShape.getVertex(trimeshShape.indices[triangles[i] * 3 + j], edgeVertexA);
        trimeshShape.getVertex(trimeshShape.indices[triangles[i] * 3 + (j + 1) % 3], edgeVertexB);
        edgeVertexB.vsub(edgeVertexA, edgeVector);
        localSpherePos.vsub(edgeVertexB, tmp2);
        const positionAlongEdgeB = tmp2.dot(edgeVector);
        localSpherePos.vsub(edgeVertexA, tmp2);
        let positionAlongEdgeA = tmp2.dot(edgeVector);
        if (positionAlongEdgeA > 0 && positionAlongEdgeB < 0) {
          localSpherePos.vsub(edgeVertexA, tmp2);
          edgeVectorUnit.copy(edgeVector);
          edgeVectorUnit.normalize();
          positionAlongEdgeA = tmp2.dot(edgeVectorUnit);
          edgeVectorUnit.scale(positionAlongEdgeA, tmp2);
          tmp2.vadd(edgeVertexA, tmp2);
          const dist2 = tmp2.distanceTo(localSpherePos);
          if (dist2 < sphereShape.radius) {
            if (justTest) {
              return true;
            }
            const r = this.createContactEquation(sphereBody, trimeshBody, sphereShape, trimeshShape, rsi, rsj);
            tmp2.vsub(localSpherePos, r.ni);
            r.ni.normalize();
            r.ni.scale(sphereShape.radius, r.ri);
            r.ri.vadd(spherePos, r.ri);
            r.ri.vsub(sphereBody.position, r.ri);
            Transform.pointToWorldFrame(trimeshPos, trimeshQuat, tmp2, tmp2);
            tmp2.vsub(trimeshBody.position, r.rj);
            Transform.vectorToWorldFrame(trimeshQuat, r.ni, r.ni);
            Transform.vectorToWorldFrame(trimeshQuat, r.ri, r.ri);
            this.result.push(r);
            this.createFrictionEquationsFromContact(r, this.frictionResult);
          }
        }
      }
    }
    const va2 = sphereTrimesh_va;
    const vb2 = sphereTrimesh_vb;
    const vc2 = sphereTrimesh_vc;
    const normal = sphereTrimesh_normal;
    for (let i = 0, N = triangles.length; i !== N; i++) {
      trimeshShape.getTriangleVertices(triangles[i], va2, vb2, vc2);
      trimeshShape.getNormal(triangles[i], normal);
      localSpherePos.vsub(va2, tmp2);
      let dist2 = tmp2.dot(normal);
      normal.scale(dist2, tmp2);
      localSpherePos.vsub(tmp2, tmp2);
      dist2 = tmp2.distanceTo(localSpherePos);
      if (Ray.pointInTriangle(tmp2, va2, vb2, vc2) && dist2 < sphereShape.radius) {
        if (justTest) {
          return true;
        }
        let r = this.createContactEquation(sphereBody, trimeshBody, sphereShape, trimeshShape, rsi, rsj);
        tmp2.vsub(localSpherePos, r.ni);
        r.ni.normalize();
        r.ni.scale(sphereShape.radius, r.ri);
        r.ri.vadd(spherePos, r.ri);
        r.ri.vsub(sphereBody.position, r.ri);
        Transform.pointToWorldFrame(trimeshPos, trimeshQuat, tmp2, tmp2);
        tmp2.vsub(trimeshBody.position, r.rj);
        Transform.vectorToWorldFrame(trimeshQuat, r.ni, r.ni);
        Transform.vectorToWorldFrame(trimeshQuat, r.ri, r.ri);
        this.result.push(r);
        this.createFrictionEquationsFromContact(r, this.frictionResult);
      }
    }
    triangles.length = 0;
  }
  planeTrimesh(planeShape, trimeshShape, planePos, trimeshPos, planeQuat, trimeshQuat, planeBody, trimeshBody, rsi, rsj, justTest) {
    const v = new Vec3();
    const normal = planeTrimesh_normal;
    normal.set(0, 0, 1);
    planeQuat.vmult(normal, normal);
    for (let i = 0; i < trimeshShape.vertices.length / 3; i++) {
      trimeshShape.getVertex(i, v);
      const v22 = new Vec3();
      v22.copy(v);
      Transform.pointToWorldFrame(trimeshPos, trimeshQuat, v22, v);
      const relpos2 = planeTrimesh_relpos;
      v.vsub(planePos, relpos2);
      const dot4 = normal.dot(relpos2);
      if (dot4 <= 0) {
        if (justTest) {
          return true;
        }
        const r = this.createContactEquation(planeBody, trimeshBody, planeShape, trimeshShape, rsi, rsj);
        r.ni.copy(normal);
        const projected = planeTrimesh_projected;
        normal.scale(relpos2.dot(normal), projected);
        v.vsub(projected, projected);
        r.ri.copy(projected);
        r.ri.vsub(planeBody.position, r.ri);
        r.rj.copy(v);
        r.rj.vsub(trimeshBody.position, r.rj);
        this.result.push(r);
        this.createFrictionEquationsFromContact(r, this.frictionResult);
      }
    }
  }
  // convexTrimesh(
  //   si: ConvexPolyhedron, sj: Trimesh, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion,
  //   bi: Body, bj: Body, rsi?: Shape | null, rsj?: Shape | null,
  //   faceListA?: number[] | null, faceListB?: number[] | null,
  // ) {
  //   const sepAxis = convexConvex_sepAxis;
  //   if(xi.distanceTo(xj) > si.boundingSphereRadius + sj.boundingSphereRadius){
  //       return;
  //   }
  //   // Construct a temp hull for each triangle
  //   const hullB = new ConvexPolyhedron();
  //   hullB.faces = [[0,1,2]];
  //   const va = new Vec3();
  //   const vb = new Vec3();
  //   const vc = new Vec3();
  //   hullB.vertices = [
  //       va,
  //       vb,
  //       vc
  //   ];
  //   for (let i = 0; i < sj.indices.length / 3; i++) {
  //       const triangleNormal = new Vec3();
  //       sj.getNormal(i, triangleNormal);
  //       hullB.faceNormals = [triangleNormal];
  //       sj.getTriangleVertices(i, va, vb, vc);
  //       let d = si.testSepAxis(triangleNormal, hullB, xi, qi, xj, qj);
  //       if(!d){
  //           triangleNormal.scale(-1, triangleNormal);
  //           d = si.testSepAxis(triangleNormal, hullB, xi, qi, xj, qj);
  //           if(!d){
  //               continue;
  //           }
  //       }
  //       const res: ConvexPolyhedronContactPoint[] = [];
  //       const q = convexConvex_q;
  //       si.clipAgainstHull(xi,qi,hullB,xj,qj,triangleNormal,-100,100,res);
  //       for(let j = 0; j !== res.length; j++){
  //           const r = this.createContactEquation(bi,bj,si,sj,rsi,rsj),
  //               ri = r.ri,
  //               rj = r.rj;
  //           r.ni.copy(triangleNormal);
  //           r.ni.negate(r.ni);
  //           res[j].normal.negate(q);
  //           q.mult(res[j].depth, q);
  //           res[j].point.vadd(q, ri);
  //           rj.copy(res[j].point);
  //           // Contact points are in world coordinates. Transform back to relative
  //           ri.vsub(xi,ri);
  //           rj.vsub(xj,rj);
  //           // Make relative to bodies
  //           ri.vadd(xi, ri);
  //           ri.vsub(bi.position, ri);
  //           rj.vadd(xj, rj);
  //           rj.vsub(bj.position, rj);
  //           result.push(r);
  //       }
  //   }
  // }
};
var averageNormal = new Vec3();
var averageContactPointA = new Vec3();
var averageContactPointB = new Vec3();
var tmpVec1 = new Vec3();
var tmpVec2 = new Vec3();
var tmpQuat1 = new Quaternion();
var tmpQuat2 = new Quaternion();
var planeTrimesh_normal = new Vec3();
var planeTrimesh_relpos = new Vec3();
var planeTrimesh_projected = new Vec3();
var sphereTrimesh_normal = new Vec3();
var sphereTrimesh_relpos = new Vec3();
new Vec3();
var sphereTrimesh_v = new Vec3();
var sphereTrimesh_v2 = new Vec3();
var sphereTrimesh_edgeVertexA = new Vec3();
var sphereTrimesh_edgeVertexB = new Vec3();
var sphereTrimesh_edgeVector = new Vec3();
var sphereTrimesh_edgeVectorUnit = new Vec3();
var sphereTrimesh_localSpherePos = new Vec3();
var sphereTrimesh_tmp = new Vec3();
var sphereTrimesh_va = new Vec3();
var sphereTrimesh_vb = new Vec3();
var sphereTrimesh_vc = new Vec3();
var sphereTrimesh_localSphereAABB = new AABB();
var sphereTrimesh_triangles = [];
var point_on_plane_to_sphere = new Vec3();
var plane_to_sphere_ortho = new Vec3();
var pointInPolygon_edge = new Vec3();
var pointInPolygon_edge_x_normal = new Vec3();
var pointInPolygon_vtp = new Vec3();
function pointInPolygon(verts, normal, p) {
  let positiveResult = null;
  const N = verts.length;
  for (let i = 0; i !== N; i++) {
    const v = verts[i];
    const edge = pointInPolygon_edge;
    verts[(i + 1) % N].vsub(v, edge);
    const edge_x_normal = pointInPolygon_edge_x_normal;
    edge.cross(normal, edge_x_normal);
    const vertex_to_p = pointInPolygon_vtp;
    p.vsub(v, vertex_to_p);
    const r = edge_x_normal.dot(vertex_to_p);
    if (positiveResult === null || r > 0 && positiveResult === true || r <= 0 && positiveResult === false) {
      if (positiveResult === null) {
        positiveResult = r > 0;
      }
      continue;
    } else {
      return false;
    }
  }
  return true;
}
var box_to_sphere = new Vec3();
var sphereBox_ns = new Vec3();
var sphereBox_ns1 = new Vec3();
var sphereBox_ns2 = new Vec3();
var sphereBox_sides = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];
var sphereBox_sphere_to_corner = new Vec3();
var sphereBox_side_ns = new Vec3();
var sphereBox_side_ns1 = new Vec3();
var sphereBox_side_ns2 = new Vec3();
var convex_to_sphere = new Vec3();
var sphereConvex_edge = new Vec3();
var sphereConvex_edgeUnit = new Vec3();
var sphereConvex_sphereToCorner = new Vec3();
var sphereConvex_worldCorner = new Vec3();
var sphereConvex_worldNormal = new Vec3();
var sphereConvex_worldPoint = new Vec3();
var sphereConvex_worldSpherePointClosestToPlane = new Vec3();
var sphereConvex_penetrationVec = new Vec3();
var sphereConvex_sphereToWorldPoint = new Vec3();
new Vec3();
new Vec3();
var planeConvex_v = new Vec3();
var planeConvex_normal = new Vec3();
var planeConvex_relpos = new Vec3();
var planeConvex_projected = new Vec3();
var convexConvex_sepAxis = new Vec3();
var convexConvex_q = new Vec3();
var particlePlane_normal = new Vec3();
var particlePlane_relpos = new Vec3();
var particlePlane_projected = new Vec3();
var particleSphere_normal = new Vec3();
var cqj = new Quaternion();
var convexParticle_local = new Vec3();
new Vec3();
var convexParticle_penetratedFaceNormal = new Vec3();
var convexParticle_vertexToParticle = new Vec3();
var convexParticle_worldPenetrationVec = new Vec3();
var convexHeightfield_tmp1 = new Vec3();
var convexHeightfield_tmp2 = new Vec3();
var convexHeightfield_faceList = [0];
var sphereHeightfield_tmp1 = new Vec3();
var sphereHeightfield_tmp2 = new Vec3();
new AABB();
var tmpRay = new Ray();
var performance2 = globalThis.performance || {};
if (!performance2.now) {
  let nowOffset = Date.now();
  if (performance2.timing && performance2.timing.navigationStart) {
    nowOffset = performance2.timing.navigationStart;
  }
  performance2.now = () => Date.now() - nowOffset;
}
new Vec3();
var World_step_collideEvent = {
  type: Body.COLLIDE_EVENT_NAME,
  body: null,
  contact: null
};

// src/engine/tuples.ts
function normalize4(tuple) {
  const [x, y, z] = tuple;
  const len3 = Math.sqrt(x * x + y * y + z * z);
  return tuple.map((v) => v / len3);
}
function scale5(tuple, amount) {
  return tuple.map((v) => v * amount);
}
function scaleClamped(colour, amount) {
  scale5(colour, amount);
  return colour.map((v) => Math.min(Math.max(v, 0), 1));
}
function toVec3(tuple) {
  return vec3_exports.fromValues(tuple[0], tuple[1], tuple[2]);
}
function distance2(a2, b2) {
  return Math.sqrt((a2[0] - b2[0]) ** 2 + (a2[1] - b2[1]) ** 2 + (a2[2] - b2[2]) ** 2);
}
function add6(a2, b2) {
  return [a2[0] + b2[0], a2[1] + b2[1], a2[2] + b2[2]];
}
function fromCannon(value) {
  if (value instanceof Vec3) {
    return [value.x, value.y, value.z];
  }
  return [value.x, value.y, value.z, value.w];
}
function rgbColour255(r, g, b2) {
  return [r / 255, g / 255, b2 / 255];
}
function rgbColourHex(hexString) {
  const hex = hexString.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b2 = parseInt(hex.substring(4, 6), 16);
  return rgbColour255(r, g, b2);
}
var Colours = {
  RED: [1, 0, 0],
  GREEN: [0, 1, 0],
  BLUE: [0, 0, 1],
  YELLOW: [1, 1, 0],
  CYAN: [0, 1, 1],
  MAGENTA: [1, 0, 1],
  BLACK: [0, 0, 0],
  WHITE: [1, 1, 1]
};
var Tuples = {
  normalize: normalize4,
  scale: scale5,
  scaleClamped,
  rgbColour255,
  rgbColourHex,
  toVec3,
  distance: distance2,
  fromCannon,
  add: add6
};

// src/core/cache.ts
var import_loglevel2 = __toESM(require_loglevel(), 1);
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
      import_loglevel2.default.warn(`\u26A0\uFE0F Model '${name}' not found, please load it first`);
      return void 0;
    }
    return this.cache.get(name);
  }
  /**
   * Add a model to the cache, using the model name as key
   */
  add(model) {
    import_loglevel2.default.debug(`\u{1F9F0} Adding model '${model.name}' to cache`);
    this.cache.set(model.name, model);
  }
};
var _TextureCache = class _TextureCache {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
    this.gl = {};
    this.defaultWhite = {};
    this.defaultRand = {};
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
    const randArray = new Uint8Array(512 * 512 * 4);
    for (let i = 0; i < 512 * 512 * 4; i++) {
      randArray[i] = Math.floor(Math.random() * 255);
    }
    const randomRGB = createTexture(gl, {
      min: gl.NEAREST,
      mag: gl.NEAREST,
      src: randArray,
      width: 512,
      height: 512,
      wrap: gl.REPEAT
    });
    this._instance.defaultWhite = white1pixel;
    this._instance.defaultRand = randomRGB;
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
      import_loglevel2.default.warn(`\u{1F4A5} Texture ${key} not found in cache`);
      return void 0;
    }
    import_loglevel2.default.trace(`\u{1F44D} Returning texture '${key}' from cache, nice!`);
    return this.cache.get(key);
  }
  /**
   * Add a texture to the cache
   * @param key Key of texture, this is usually the URL or filename path
   * @param texture WebGL texture
   */
  add(key, texture) {
    if (this.cache.has(key)) {
      import_loglevel2.default.warn(`\u{1F914} Texture '${key}' already in cache, not adding again`);
      return;
    }
    import_loglevel2.default.debug(`\u{1F9F0} Adding texture '${key}' to cache`);
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
      import_loglevel2.default.trace(`\u{1F44D} Returning texture '${src}' from cache, nice!`, flipY);
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
          import_loglevel2.default.error("\u{1F4A5} Error loading texture", err);
        }
      }
    );
    this.add(src, texture);
    return texture;
  }
  static get defaultWhite() {
    return this.instance.defaultWhite;
  }
  static get defaultRand() {
    return this.instance.defaultRand;
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
      import_loglevel2.default.warn("\u{1F914} Program cache already initialised, not doing it again");
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
      import_loglevel2.default.warn(`\u26A0\uFE0F Program '${name}' not found, returning default`);
      return this._default;
    }
    return prog;
  }
  add(name, program) {
    import_loglevel2.default.debug(`\u{1F9F0} Adding program '${name}' to cache`);
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
var import_loglevel3 = __toESM(require_loglevel(), 1);
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
    import_loglevel3.default.info("\u{1F3A5} Camera: first person mode & controls enabled");
  }
  /**
   * Disable FP mode
   */
  disableFPControls() {
    this.fpMode = false;
    document.exitPointerLock();
    import_loglevel3.default.debug("\u{1F3A5} Camera: FPS mode disabled");
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
        case "]":
          this.position[1] += this.fpMoveSpeed * 0.75;
          this.lookAt[1] += this.fpMoveSpeed * 0.75;
          break;
        case "[":
          this.position[1] -= this.fpMoveSpeed * 0.75;
          this.lookAt[1] -= this.fpMoveSpeed * 0.75;
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
    this.shadowViewOffset = [0, 0, 0];
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
    if (!this._shadowOptions.polygonOffset) {
      this._shadowOptions.polygonOffset = 0;
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
    const moveDist = this._shadowOptions.distance * 0.9;
    const cam = new Camera(1 /* ORTHOGRAPHIC */, 4 / 3);
    cam.usedForShadowMap = true;
    cam.orthoZoom = this._shadowOptions.zoom;
    cam.lookAt = this.shadowViewOffset;
    cam.position = [
      -this.direction[0] * moveDist + this.shadowViewOffset[0],
      -this.direction[1] * moveDist + this.shadowViewOffset[1],
      -this.direction[2] * moveDist + this.shadowViewOffset[2]
    ];
    cam.far = this._shadowOptions.distance * 2;
    return cam;
  }
  /**
   * Get the forward view matrix for the virtual camera used to render the shadow map.
   * Returns undefined if shadows are not enabled
   */
  get shadowMatrix() {
    if (!this._shadowOptions) {
      return void 0;
    }
    const shadowCam = this.getShadowCamera();
    if (!shadowCam) {
      return void 0;
    }
    const shadowMat = mat4_exports.multiply(
      mat4_exports.create(),
      shadowCam.projectionMatrix,
      mat4_exports.invert(mat4_exports.create(), shadowCam.matrix)
    );
    return shadowMat;
  }
  /**
   * Are shadows enabled for this light?
   */
  get shadowsEnabled() {
    return this._shadowOptions !== void 0;
  }
  /**
   * Get the shadow map program, will be undefined if shadows are not enabled
   */
  get shadowMapProgram() {
    return this._shadowMapProgram;
  }
  /**
   * Get the shadow map framebuffer, will be undefined if shadows are not enabled
   */
  get shadowMapFrameBufffer() {
    return this._shadowMapFB;
  }
  /**
   * Get the shadow map texture, will be undefined if shadows are not enabled
   */
  get shadowMapTexture() {
    return this._shadowMapTex;
  }
  /**
   * Get the shadow map options, will be undefined if shadows are not enabled
   */
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
var import_loglevel4 = __toESM(require_loglevel(), 1);

// shaders/envmap/glsl.frag
var glsl_default3 = "#version 300 es\n\n// ============================================================================\n// Environment map fragment shader\n// Ben Coleman, 2023\n// ============================================================================\n\nprecision highp float;\n\nin vec3 v_texCoord;\n\nuniform samplerCube u_envMapTex;\n\nout vec4 outColour;\n\nvoid main() {\n  // Use the texture cube map as the colour\n  // Note: We don't need to do any lighting calculations here\n  outColour = texture(u_envMapTex, v_texCoord);\n}\n";

// shaders/envmap/glsl.vert
var glsl_default4 = "#version 300 es\n\n// ============================================================================\n// Environment map vertex shader\n// Ben Coleman, 2023\n// ============================================================================\n\nprecision highp float;\n\nin vec4 position;\n\nuniform mat4 u_worldViewProjection;\n\nout vec3 v_texCoord;\n\nvoid main() {\n  // This essentially is what makes the envmap work, texCoords\n  // are taken from the vertex position\n  v_texCoord = position.xyz;\n\n  gl_Position = u_worldViewProjection * position;\n}\n";

// src/core/stats.ts
var Stats = {
  drawCallsPerFrame: 0,
  instances: 0,
  triangles: 0,
  prevTime: 0,
  deltaTime: 0,
  totalTime: 0,
  frameCount: 0,
  fpsBucket: [],
  resetPerFrame() {
    Stats.drawCallsPerFrame = 0;
  },
  updateTime(now) {
    Stats.deltaTime = now * 1e-3 - Stats.prevTime;
    Stats.prevTime = now * 1e-3;
    Stats.totalTime += Stats.deltaTime;
    Stats.fpsBucket.push(Stats.deltaTime);
    if (Stats.fpsBucket.length > 10) {
      Stats.fpsBucket.shift();
    }
  },
  get FPS() {
    const sum = Stats.fpsBucket.reduce((a2, b2) => a2 + b2, 0);
    return Math.round(1 / (sum / Stats.fpsBucket.length));
  },
  get totalTimeRound() {
    return Math.round(Stats.totalTime);
  }
};

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
    import_loglevel4.default.info(`\u{1F3D4}\uFE0F EnvironmentMap created!`);
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
   * Render this envmap as a cube around the given camera & matrices
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
    Stats.drawCallsPerFrame++;
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

// src/engine/node.ts
var import_loglevel5 = __toESM(require_loglevel(), 1);
var EVENT_POSITION = "position";
var Node = class {
  /** Create a default node, at origin with scale of [1,1,1] and no rotation */
  constructor() {
    this._children = [];
    this.id = uniqueId();
    this.metadata = {};
    this.eventHandlers = /* @__PURE__ */ new Map();
    this.eventHandlers.set(EVENT_POSITION, []);
    this.position = [0, 0, 0];
    this.scale = [1, 1, 1];
    this.quaternion = quat_exports.create();
    this._enabled = true;
    this._receiveShadow = true;
    this._castShadow = true;
    this._physicsBody = void 0;
    import_loglevel5.default.debug(`\u{1F4CD} Node created with id ${this.id}`);
  }
  /** Rotate this instance around the X, Y and Z axis in radians */
  rotate(ax, ay, az) {
    quat_exports.rotateX(this.quaternion, this.quaternion, ax);
    quat_exports.rotateY(this.quaternion, this.quaternion, ay);
    quat_exports.rotateZ(this.quaternion, this.quaternion, az);
  }
  /** Rotate this instance around the X axis*/
  rotateX(angle2) {
    quat_exports.rotateX(this.quaternion, this.quaternion, angle2);
  }
  /** Rotate this instance around the Y axis*/
  rotateY(angle2) {
    quat_exports.rotateY(this.quaternion, this.quaternion, angle2);
  }
  /** Rotate this instance around the Z axis, in radians*/
  rotateZ(angle2) {
    quat_exports.rotateZ(this.quaternion, this.quaternion, angle2);
  }
  /** Rotate this instance around the X axis by a given angle in degrees */
  rotateZDeg(angle2) {
    this.rotateZ(angle2 * Math.PI / 180);
  }
  /** Rotate this instance around the Y axis by a given angle in degrees */
  rotateYDeg(angle2) {
    this.rotateY(angle2 * Math.PI / 180);
  }
  /** Rotate this instance around the Z axis by a given angle in degrees */
  rotateXDeg(angle2) {
    this.rotateX(angle2 * Math.PI / 180);
  }
  /** Set the rotation quaternion directly, normally users should use the rotate methods.
   * This method is for advanced uses, like integration with an external physics system */
  setQuaternion(quatArray) {
    this.quaternion = quat_exports.fromValues(quatArray[0], quatArray[1], quatArray[2], quatArray[3]);
  }
  /** Get the rotation quaternion as a XYZW 4-tuple */
  getQuaternion() {
    return [this.quaternion[0], this.quaternion[1], this.quaternion[2], this.quaternion[3]];
  }
  /**
   * Return the world or model matrix for this node, this is the matrix that places this node in the world.
   * This will be in relation to the parent node, if there is one.
   */
  get modelMatrix() {
    const modelMatrix = mat4_exports.fromRotationTranslationScale(mat4_exports.create(), this.quaternion, this.position, this.scale);
    if (!this.parent) {
      return modelMatrix;
    }
    mat4_exports.multiply(modelMatrix, this.parent.modelMatrix ?? mat4_exports.create(), modelMatrix);
    return modelMatrix;
  }
  /** Convenience method to make another Node a child of this one */
  addChild(node) {
    node._parent = this;
    this._children.push(node);
  }
  /** Convenience method to remove a child Node */
  removeChild(node) {
    node._parent = void 0;
    this._children = this._children.filter((child) => child.id !== node.id);
  }
  /** Convenience method to remove all child Nodes */
  removeAllChildren() {
    this._children.forEach((child) => {
      child._parent = void 0;
    });
    this._children = [];
  }
  /** Sets the parent this Node, to the provided Node */
  set parent(node) {
    if (this._parent) {
      this._parent.removeChild(this);
    }
    if (node) {
      node.addChild(this);
    }
  }
  /** Fetch all child Nodes of this Node */
  get children() {
    return this._children;
  }
  /** Get current parent of this Node */
  get parent() {
    return this._parent;
  }
  /** Is this Node enabled. Disabled nodes will not be rendered */
  get enabled() {
    return this._enabled;
  }
  /** Set enabled state of this Node, this will also set all child nodes */
  set enabled(enabled) {
    this._enabled = enabled;
    this._children.forEach((child) => {
      child.enabled = enabled;
    });
  }
  /** Does this Node cast shadows, default true  */
  get castShadow() {
    return this._castShadow;
  }
  /** Set will this Node cast shadows, this will also set all child nodes */
  set castShadow(value) {
    this._castShadow = value;
    this._children.forEach((child) => {
      child.castShadow = value;
    });
  }
  /** Does this Node receive shadows, default true */
  get receiveShadow() {
    return this._receiveShadow;
  }
  /** Set will this Node receive shadows, this will also set all child nodes */
  set receiveShadow(value) {
    this._receiveShadow = value;
    this._children.forEach((child) => {
      child.receiveShadow = value;
    });
  }
  /** Get the physics body for this Node, if there is one */
  get physicsBody() {
    return this._physicsBody;
  }
  /** Set the physics body for this Node */
  set physicsBody(body) {
    this._physicsBody = body;
  }
  /**
   * Updates the position & rotation of this node to match it's linked physics Body
   * This is called automatically by the engine, but can be called manually if needed
   */
  updateFromPhysicsBody() {
    if (!this._physicsBody)
      return;
    this.position = Tuples.fromCannon(this._physicsBody.position);
    this.setQuaternion(Tuples.fromCannon(this._physicsBody.quaternion));
    for (const handler of this.eventHandlers.get(EVENT_POSITION) ?? []) {
      handler({
        position: this.position,
        rotation: this.getQuaternion(),
        scale: this.scale,
        nodeId: this.id
      });
    }
  }
  /**
   * Add an event handler to listen for node changes
   * @param event NodeEvent type, one of 'position', 'rotation', 'scale'
   * @param handler Function to call when event is triggered
   */
  addEventHandler(event, handler) {
    this.eventHandlers.get(event)?.push(handler);
  }
};
function uniqueId() {
  const dateString = Date.now().toString(36).substring(0, 5);
  const randomness = Math.random().toString(36).substring(0, 5);
  return dateString + randomness;
}

// src/renderable/instance.ts
var Instance = class extends Node {
  /**
   * Create a new instace of a renderable thing
   * @param {Renderable} renderable - Renderable to use for this instance
   */
  constructor(renderable) {
    super();
    /** Flip all textures on this instance on the X axis */
    this.flipTextureX = false;
    /** Flip all textures on this instance on the Y axis */
    this.flipTextureY = false;
    this.renderable = renderable;
  }
  setPosition(x, y, z) {
    if (x instanceof Array) {
      this.position = x;
      return;
    }
    if (y === void 0 || z === void 0)
      throw new Error("setPosition requires either an array or 3 numbers");
    this.position = [x, y, z];
  }
  /**
   * Render this instance in the world, called internally by the context when rendering
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
    const world = this.modelMatrix;
    uniforms.u_world = world;
    mat4_exports.invert(uniforms.u_worldInverseTranspose, world);
    mat4_exports.transpose(uniforms.u_worldInverseTranspose, uniforms.u_worldInverseTranspose);
    const worldView = mat4_exports.multiply(mat4_exports.create(), uniforms.u_view, world);
    mat4_exports.multiply(uniforms.u_worldViewProjection, uniforms.u_proj, worldView);
    uniforms.u_flipTextureX = this.flipTextureX;
    uniforms.u_flipTextureY = this.flipTextureY;
    uniforms.u_receiveShadow = this.receiveShadow;
    this.renderable.render(gl, uniforms, this.material, programOverride);
  }
};

// src/renderable/billboard.ts
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
    const scale6 = mat4_exports.getScaling(vec3_exports.create(), worldView);
    worldView[0] = scale6[0];
    worldView[1] = 0;
    worldView[2] = 0;
    worldView[8] = 0;
    worldView[9] = 0;
    worldView[10] = scale6[2];
    if (this.type == 0 /* SPHERICAL */) {
      worldView[4] = 0;
      worldView[5] = scale6[1];
      worldView[6] = 0;
    }
    mat4_exports.multiply(uniforms.u_worldViewProjection, uniforms.u_proj, worldView);
    setBuffersAndAttributes(gl, programInfo, this.bufferInfo);
    setUniforms(programInfo, uniforms);
    drawBufferInfo(gl, this.bufferInfo);
    Stats.drawCallsPerFrame++;
  }
};

// src/engine/material.ts
var Material2 = class _Material {
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
    this.diffuseTex = TextureCache.defaultWhite;
    this.specularTex = TextureCache.defaultWhite;
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
  static createSolidColour(r, g, b2) {
    const m = new _Material();
    m.diffuse = [r, g, b2];
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
  /**
   * Clone this material, returns a new material with the same properties
   */
  clone() {
    const m = new _Material();
    m.ambient = this.ambient;
    m.diffuse = this.diffuse;
    m.specular = this.specular;
    m.emissive = this.emissive;
    m.shininess = this.shininess;
    m.opacity = this.opacity;
    m.reflectivity = this.reflectivity;
    m.diffuseTex = this.diffuseTex;
    m.specularTex = this.specularTex;
    m.normalTex = this.normalTex;
    return m;
  }
};

// src/renderable/primitive.ts
var Primitive = class {
  constructor() {
    this.material = new Material2();
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
    let disableCulling = false;
    if (this instanceof PrimitiveCylinder && !this.caps) {
      gl.disable(gl.CULL_FACE);
      disableCulling = true;
    }
    drawBufferInfo(gl, this.bufferInfo);
    if (disableCulling) {
      gl.enable(gl.CULL_FACE);
    }
    Stats.drawCallsPerFrame++;
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
    this.radius = radius;
  }
};
var PrimitiveCube = class extends Primitive {
  /**
   * Create a new cube primitive
   * @param gl WebGL2RenderingContext
   * @param size Size of the cube
   */
  constructor(gl, size, tilingFactor) {
    super();
    const verts = primitives.createCubeVertices(size);
    if (tilingFactor) {
      for (let i = 0; i < verts.texcoord.length; i++) {
        verts.texcoord[i] = verts.texcoord[i] * tilingFactor;
      }
    }
    this.bufferInfo = createBufferInfoFromArrays(gl, verts);
    this.triangles += this.bufferInfo.numElements / 3;
    this.size = size;
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
    this.caps = caps;
    this.bufferInfo = primitives.createCylinderBufferInfo(
      gl,
      radius,
      height,
      subdivisionsR,
      subdivisionsV,
      caps,
      caps
    );
    this.triangles += this.bufferInfo.numElements / 3;
  }
};

// src/renderable/particles.ts
var import_loglevel6 = __toESM(require_loglevel(), 1);

// shaders/particles/update.frag
var update_default = "#version 300 es\n\n// ============================================================================\n// Particle update fragment shader\n// Ben Coleman, 2023\n// ============================================================================\n\nprecision highp float;\n\n// Does nothing, just here to make the WebGL compiler happy!\nvoid main() {}\n";

// shaders/particles/update.vert
var update_default2 = "#version 300 es\n\n// ============================================================================\n// Particle update vertex shader, for on GPU particle simulation\n// Ben Coleman, 2023\n// ============================================================================\n\nprecision highp float;\n\nin vec4 position;\nin vec3 velocity;\nin vec2 age;\nin vec4 props;\nin float seed;\n\nuniform float u_deltaTime;\nuniform sampler2D u_randTex;\nuniform float u_maxInstances;\nuniform vec2 u_lifetimeMinMax;\nuniform vec2 u_powerMinMax;\nuniform vec3 u_gravity;\nuniform vec3 u_direction1;\nuniform vec3 u_direction2;\nuniform float u_timeScale;\nuniform vec2 u_sizeMinMax;\nuniform vec2 u_initialRotationMinMax;\nuniform vec2 u_rotationSpeedMinMax;\nuniform bool u_enabled;\nuniform vec3 u_emitterBoxMin;\nuniform vec3 u_emitterBoxMax;\nuniform float u_accel;\nuniform vec3 u_posOffset;\n\nout vec4 tf_position;\nout vec3 tf_velocity;\nout vec2 tf_age;\nout vec4 tf_props;\n\nvec4 rand(float offset) {\n  float uv = float(gl_VertexID) / u_maxInstances + offset;\n  return texture(u_randTex, vec2(uv)).rgba;\n}\n\nfloat randBetween(float min, float max, float offset) {\n  vec4 r = rand(offset);\n  return min + (max - min) * r.w;\n}\n\n// NOTES: TF varyings & packing\n// * position[0,1,2] = current position\n// * position[3] = rotation\n// * age[0] = current age\n// * age[1] = lifetime\n// * props[0] = size\n// * props[1] = rotation speed\n\nvoid main() {\n  float t = u_deltaTime;\n  float new_age = age[0] + t;\n\n  float rot = position[3] + props[1] * t;\n\n  tf_velocity = velocity * u_accel + u_gravity * t;\n  tf_position = vec4(position.xyz + tf_velocity * t, rot);\n  tf_age[0] = new_age;\n  tf_age[1] = age[1];\n  tf_props = props;\n\n  // Dead particles are respawned\n  if (new_age > age[1] && u_enabled) {\n    vec4 r = rand(seed);\n\n    tf_age[0] = 0.0;\n    tf_position[0] = randBetween(u_emitterBoxMin.x, u_emitterBoxMax.x, r.x) + u_posOffset.x;\n    tf_position[1] = randBetween(u_emitterBoxMin.y, u_emitterBoxMax.y, r.y) + u_posOffset.y;\n    tf_position[2] = randBetween(u_emitterBoxMin.z, u_emitterBoxMax.z, r.z) + u_posOffset.z;\n    tf_position[3] = randBetween(u_initialRotationMinMax.x, u_initialRotationMinMax.y, seed);\n\n    float power = randBetween(u_powerMinMax.x, u_powerMinMax.y, 0.0);\n\n    tf_velocity = vec3(\n      randBetween(u_direction1.x, u_direction2.x, r.x + position.x) * power,\n      randBetween(u_direction1.y, u_direction2.y, r.y + position.y) * power,\n      randBetween(u_direction1.z, u_direction2.z, r.z + position.z) * power\n    );\n\n    tf_age[1] = randBetween(u_lifetimeMinMax.x, u_lifetimeMinMax.y, seed + position.x);\n    tf_props[0] = randBetween(u_sizeMinMax.x, u_sizeMinMax.y, seed + position.y);\n    tf_props[1] = randBetween(u_rotationSpeedMinMax.x, u_rotationSpeedMinMax.y, seed);\n  }\n}\n";

// shaders/particles/render.frag
var render_default = "#version 300 es\n\n// ============================================================================\n// Particle render fragment shader\n// Ben Coleman, 2023\n// ============================================================================\n\nprecision highp float;\n\nin vec2 v_texcoord;\nin float v_ageNorm;\n\nuniform sampler2D u_texture;\nuniform vec4 u_ageColour;\nuniform vec4 u_preColour;\n\nout vec4 outColor;\n\nvoid main() {\n  vec4 tex = texture(u_texture, v_texcoord);\n  tex.r *= u_preColour.r;\n  tex.g *= u_preColour.g;\n  tex.b *= u_preColour.b;\n  tex.a *= u_preColour.a;\n\n  tex.a *= 1.0 - v_ageNorm * u_ageColour.a;\n  tex.r *= 1.0 - v_ageNorm * u_ageColour.r;\n  tex.g *= 1.0 - v_ageNorm * u_ageColour.g;\n  tex.b *= 1.0 - v_ageNorm * u_ageColour.b;\n\n  outColor = tex;\n}\n";

// shaders/particles/render.vert
var render_default2 = "#version 300 es\n\n// ============================================================================\n// Particle render vertex shader\n// Ben Coleman, 2023\n// ============================================================================\n\nprecision highp float;\n\nin vec4 position; // Vertex positions of the particle quad\nin vec2 texcoord;\nin vec4 tf_position; // Position of the particle\nin vec2 tf_age;\nin vec4 tf_props;\n\nuniform mat4 u_view;\nuniform mat4 u_proj;\nuniform mat4 u_world;\nuniform float u_agePower;\n\nout vec2 v_texcoord;\nout vec3 v_position;\nout float v_ageNorm;\n\nvoid main() {\n  vec3 vert_pos = position.xyz;\n  v_ageNorm = clamp(tf_age[0] / tf_age[1], 0.0, 1.0);\n  v_ageNorm = pow(v_ageNorm, u_agePower);\n\n  // Rotate by tf_position[3] (rotation)\n  float s = sin(tf_position[3]);\n  float c = cos(tf_position[3]);\n  mat2 rot = mat2(c, -s, s, c);\n  vert_pos.xy = rot * position.xy;\n\n  // Scale by tf_props[0] (size)\n  vert_pos = vert_pos.xyz * tf_props[0];\n\n  // Move to the world at the particle position\n  vec4 world_pos = u_world * vec4(tf_position.xyz, 1.0);\n  vec4 view_pos = u_view * world_pos;\n\n  // Billboarding magic\n  gl_Position = u_proj * (view_pos + vec4(vert_pos.xy, 0.0, 0.0));\n\n  v_position = world_pos.xyz;\n  v_texcoord = texcoord;\n}\n";

// src/renderable/particles.ts
var emptyMat = mat4_exports.create();
var ParticleSystem = class {
  /**
   * Create a new particle system
   * @param gl WebGL2 rendering context
   * @param maxParticles Maximum number of particles in the system
   * @param baseSize Size of the particle quad
   */
  constructor(gl, maxParticles, baseSize) {
    this.emitRate = 300;
    this.minLifetime = 2;
    this.maxLifetime = 6;
    this.minPower = 25;
    this.maxPower = 35;
    this.gravity = [0, -9.81, 0];
    this.direction1 = [-0.5, 1, -0.5];
    this.direction2 = [0.5, 1, 0.5];
    this.timeScale = 3;
    this.ageColour = [0, 0, 0, 1];
    this.minSize = 1;
    this.maxSize = 1;
    this.minInitialRotation = 0;
    this.maxInitialRotation = 0;
    this.minRotationSpeed = 0;
    this.maxRotationSpeed = 0;
    this.duration = -1;
    this.enabled = true;
    this.emitterBoxMin = [0, 0, 0];
    this.emitterBoxMax = [0, 0, 0];
    this.acceleration = 1;
    this.blendSource = gl.SRC_ALPHA;
    this.blendDest = gl.ONE;
    this.preColour = [1, 1, 1, 1];
    this.agePower = 1;
    this.localSpace = false;
    this.progInfoUpdate = createProgramInfo(gl, [update_default2, update_default], {
      transformFeedbackVaryings: ["tf_position", "tf_velocity", "tf_age", "tf_props"]
    });
    this.progInfoRender = createProgramInfo(gl, [render_default2, render_default]);
    const positions = new Float32Array(maxParticles * 4);
    const velocities = new Float32Array(maxParticles * 3);
    const ages = new Float32Array(maxParticles * 2);
    const props = new Float32Array(maxParticles * 4);
    const seeds = new Float32Array(maxParticles);
    for (let i = 0; i < maxParticles; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      positions[i * 3 + 3] = 0;
      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
      ages[i * 2] = 0;
      ages[i * 2 + 1] = Math.random() * 3;
      props[i * 4] = 1;
      props[i * 4 + 1] = 0;
      props[i * 4 + 2] = 0;
      props[i * 4 + 3] = 0;
      seeds[i] = Math.random();
    }
    this.inputBuffInfo = createBufferInfoFromArrays(gl, {
      position: { numComponents: 4, data: positions, divisor: 0 },
      velocity: { numComponents: 3, data: velocities, divisor: 0 },
      age: { numComponents: 2, data: ages, divisor: 0 },
      props: { numComponents: 4, data: props, divisor: 0 },
      seed: { numComponents: 1, data: seeds, divisor: 0 }
    });
    const quadVerts = primitives.createXYQuadVertices(baseSize);
    Object.assign(quadVerts, {
      tf_position: { numComponents: 4, data: positions, divisor: 1 },
      tf_velocity: { numComponents: 3, data: velocities, divisor: 1 },
      tf_age: { numComponents: 2, data: ages, divisor: 1 },
      tf_props: { numComponents: 4, data: props, divisor: 1 }
    });
    this.outputBuffInfo = createBufferInfoFromArrays(gl, quadVerts);
    this.outputVAO = createVertexArrayInfo(gl, this.progInfoRender, this.outputBuffInfo);
    this.texture = TextureCache.defaultWhite;
    import_loglevel6.default.info("\u2728 Created particle system with", maxParticles, "particles");
  }
  /**
   * Render the particle system and implement the renderable interface
   * @param gl WebGL2 rendering context
   * @param uniforms Uniforms to pass to the shaders
   */
  render(gl, uniforms) {
    if (this.duration == 0) {
      this.enabled = false;
    }
    if (this.duration > 0) {
      this.duration--;
    }
    gl.blendFunc(this.blendSource, this.blendDest);
    this.updateParticles(gl, uniforms.u_world);
    this.renderParticles(gl, uniforms);
    for (const attribName in this.inputBuffInfo.attribs) {
      const tempBuff = this.inputBuffInfo.attribs[attribName].buffer;
      if (this.outputBuffInfo && this.outputBuffInfo.attribs && this.outputBuffInfo.attribs[`tf_${attribName}`]) {
        this.inputBuffInfo.attribs[attribName].buffer = this.outputBuffInfo.attribs[`tf_${attribName}`].buffer;
        this.outputBuffInfo.attribs[`tf_${attribName}`].buffer = tempBuff;
      }
    }
  }
  /**
   * Update the particles positions and velocities
   */
  updateParticles(gl, worldTrans) {
    const tf = createTransformFeedback(gl, this.progInfoUpdate, this.outputBuffInfo);
    const pos = [0, 0, 0];
    if (!this.localSpace) {
      vec3_exports.transformMat4(pos, pos, worldTrans);
    }
    gl.enable(gl.RASTERIZER_DISCARD);
    gl.useProgram(this.progInfoUpdate.program);
    setBuffersAndAttributes(gl, this.progInfoUpdate, this.inputBuffInfo);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
    gl.beginTransformFeedback(gl.POINTS);
    setUniforms(this.progInfoUpdate, {
      u_time: Stats.totalTime,
      u_deltaTime: Stats.deltaTime * this.timeScale,
      u_randTex: TextureCache.defaultRand,
      // NOTE: ULTRA IMPORTANT! Without this the rand function in the shader will not work
      u_maxInstances: this.inputBuffInfo.numElements,
      u_enabled: this.enabled,
      u_lifetimeMinMax: [this.minLifetime, this.maxLifetime],
      u_gravity: this.gravity,
      u_powerMinMax: [this.minPower, this.maxPower],
      u_direction1: this.direction1,
      u_direction2: this.direction2,
      u_timeScale: this.timeScale,
      u_sizeMinMax: [this.minSize, this.maxSize],
      u_initialRotationMinMax: [this.minInitialRotation, this.maxInitialRotation],
      u_rotationSpeedMinMax: [this.minRotationSpeed, this.maxRotationSpeed],
      u_emitterBoxMin: this.emitterBoxMin,
      u_emitterBoxMax: this.emitterBoxMax,
      u_accel: this.acceleration,
      u_posOffset: pos
    });
    drawBufferInfo(gl, this.inputBuffInfo, gl.POINTS, this.emitRate);
    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.disable(gl.RASTERIZER_DISCARD);
  }
  /**
   * Render the particles to the world
   */
  renderParticles(gl, uniforms) {
    gl.useProgram(this.progInfoRender.program);
    const particleUniforms = {
      ...uniforms,
      u_world: this.localSpace ? uniforms.u_world : emptyMat,
      u_texture: this.texture,
      u_ageColour: this.ageColour,
      u_preColour: this.preColour,
      u_agePower: this.agePower
    };
    setUniforms(this.progInfoRender, particleUniforms);
    const objList = [
      {
        programInfo: this.progInfoRender,
        vertexArrayInfo: this.outputVAO,
        uniforms: particleUniforms,
        instanceCount: this.emitRate
      }
    ];
    setBuffersAndAttributes(gl, this.progInfoRender, this.outputVAO);
    drawObjectList(gl, objList);
  }
};

// src/renderable/model.ts
var import_loglevel7 = __toESM(require_loglevel(), 1);

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
    // Position
    [],
    // Texcoord
    []
    // Normal
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

// src/renderable/model.ts
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
    this._boundingBox = [
      Number.MAX_VALUE,
      Number.MAX_VALUE,
      Number.MAX_VALUE,
      Number.MIN_VALUE,
      Number.MIN_VALUE,
      Number.MIN_VALUE
    ];
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
          material = this.materials.__default;
        }
        material.apply(programInfo);
      } else {
        materialOverride.apply(programInfo);
      }
      setBuffersAndAttributes(gl, programInfo, bufferInfo);
      setUniforms(programInfo, uniforms);
      drawBufferInfo(gl, bufferInfo);
      Stats.drawCallsPerFrame++;
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
  static async parse(path = ".", objFilename, filterTextures = true, flipTextureY = false, flipUV = false) {
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
          model.materials[matName] = Material2.fromMtl(matRaw, path, filterTextures, flipTextureY);
        }
      } catch (err) {
        import_loglevel7.default.warn(`\u{1F4A5} Unable to load material library ${objData.matLibNames[0]}`);
      }
    }
    model.materials.__default = new Material2();
    model.materials.__default.diffuse = [0.1, 0.6, 0.9];
    const gl = getGl();
    if (!gl) {
      throw new Error("\u{1F4A5} Unable to get WebGL context");
    }
    for (const g of objData.geometries) {
      for (let i = 0; i < g.data.position.length; i += 3) {
        const x = g.data.position[i];
        const y = g.data.position[i + 1];
        const z = g.data.position[i + 2];
        if (x < model._boundingBox[0])
          model._boundingBox[0] = x;
        if (y < model._boundingBox[1])
          model._boundingBox[1] = y;
        if (z < model._boundingBox[2])
          model._boundingBox[2] = z;
        if (x > model._boundingBox[3])
          model._boundingBox[3] = x;
        if (y > model._boundingBox[4])
          model._boundingBox[4] = y;
        if (z > model._boundingBox[5])
          model._boundingBox[5] = z;
      }
      import_loglevel7.default.info(`\u265F\uFE0F Model '${objFilename}' part '${g.material}'`);
      const bufferInfo = createBufferInfoFromArrays(gl, g.data);
      model.parts.push(new ModelPart(bufferInfo, g.material));
    }
    import_loglevel7.default.debug(
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
  get boundingBox() {
    return this._boundingBox;
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
    this.debug = false;
    const parent = canvas.parentElement;
    if (!parent)
      throw new Error("\u{1F4A5} Canvas must have a parent element");
    this.canvas = canvas;
    this.hud = document.createElement("div");
    this.hud.classList.add("gsots3d-hud");
    this.hud.style.pointerEvents = "none";
    this.updateWithCanvas = this.updateWithCanvas.bind(this);
    window.addEventListener("resize", this.updateWithCanvas);
    window.addEventListener("load", this.updateWithCanvas);
    this.debugDiv = document.createElement("div");
    this.debugDiv.classList.add("gsots3d-debug");
    this.debugDiv.style.fontSize = "min(1.5vw, 20px)";
    this.debugDiv.style.fontFamily = "monospace";
    this.debugDiv.style.color = "white";
    this.debugDiv.style.padding = "1vw";
    this.addHUDItem(this.debugDiv);
    this.loadingDiv = document.createElement("div");
    this.loadingDiv.classList.add("gsots3d-loading");
    this.loadingDiv.innerHTML = `\u{1F4BE} Loading...<br><br><div style='font-size:1.5vw'>GSOTS-3D v${version}</div>`;
    this.loadingDiv.style.font = "normal 3vw sans-serif";
    this.loadingDiv.style.color = "#ccc";
    this.loadingDiv.style.position = "absolute";
    this.loadingDiv.style.top = "50%";
    this.loadingDiv.style.left = "50%";
    this.loadingDiv.style.textAlign = "center";
    this.loadingDiv.style.transform = "translate(-50%, -50%)";
    this.addHUDItem(this.loadingDiv);
    parent.appendChild(this.hud);
    this.updateWithCanvas();
  }
  updateWithCanvas() {
    const canvasStyles = window.getComputedStyle(this.canvas, null);
    this.hud.style.position = canvasStyles.getPropertyValue("position");
    this.hud.style.top = canvasStyles.getPropertyValue("top");
    this.hud.style.left = canvasStyles.getPropertyValue("left");
    this.hud.style.width = canvasStyles.getPropertyValue("width");
    this.hud.style.height = canvasStyles.getPropertyValue("height");
    this.hud.style.transform = canvasStyles.getPropertyValue("transform");
  }
  addHUDItem(item) {
    this.hud.appendChild(item);
  }
  render(debug = false, camera) {
    if (debug) {
      this.debugDiv.innerHTML = `
        <b>GSOTS-3D v${version}</b><br><br>
        <b>Camera: </b>${camera.toString()}<br>
        <b>Instances: </b>${Stats.instances}<br>
        <b>Draw calls: </b>${Stats.drawCallsPerFrame}<br>
        <b>Triangles: </b>${Stats.triangles}<br>
        <b>Render: </b>FPS: ${Stats.FPS} / ${Stats.totalTimeRound}s<br>
      `;
    } else {
      this.debugDiv.innerHTML = "";
    }
  }
  hideLoading() {
    this.loadingDiv.style.display = "none";
  }
};

// shaders/phong/glsl.frag
var glsl_default5 = "#version 300 es\n\n// ============================================================================\n// Phong fragment shader\n// Ben Coleman, 2023\n// ============================================================================\n\nprecision highp float;\n\n// ===== Constants ============================================================\n\nconst int MAX_LIGHTS = 16;\nconst int MAX_SHADOWS = 8;\nconst float MAX_SHAD_A = 0.125;\n\n// Got this from http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-16-shadow-mapping/#poisson-sampling\nvec3 poissonDisk[8] = vec3[](\n  vec3(-0.94201624, -0.39906216, -0.4684316),\n  vec3(0.94558609, -0.76890725, -0.34478877),\n  vec3(-0.094184101, -0.9293887, -0.3048823),\n  vec3(0.34495938, 0.2938776, -0.001735733),\n  vec3(-0.91588581, 0.45771432, -0.087759815),\n  vec3(-0.81544232, -0.87912464, -0.03352997),\n  vec3(-0.38277543, 0.27676845, -0.9485365),\n  vec3(-0.58723171, -0.73007023, -0.22162315)\n);\n\n// ===== Structs ==============================================================\n\nstruct LightDir {\n  vec3 direction;\n  vec3 colour;\n  vec3 ambient;\n};\n\nstruct LightPos {\n  vec3 position;\n  vec3 colour;\n  vec3 ambient;\n  float constant;\n  float linear;\n  float quad;\n  bool enabled;\n};\n\nstruct Material {\n  vec3 ambient;\n  vec3 diffuse;\n  vec3 specular;\n  vec3 emissive;\n  float shininess;\n  float opacity;\n  float reflectivity;\n  sampler2D diffuseTex;\n  sampler2D specularTex;\n  sampler2D normalTex;\n  bool hasNormalTex;\n};\n\n// Inputs from vertex shader\nin vec3 v_normal;\nin vec2 v_texCoord;\nin vec4 v_position;\nin vec4 v_shadowCoord;\n\n// Some global uniforms\nuniform vec3 u_camPos;\nuniform float u_gamma;\nuniform bool u_flipTextureX;\nuniform bool u_flipTextureY;\n\n// Main lights and material uniforms\nuniform Material u_mat;\nuniform LightDir u_lightDirGlobal;\nuniform LightPos u_lightsPos[MAX_LIGHTS];\nuniform int u_lightsPosCount;\n// Reflection map isn't part of the material struct for complex reasons\nuniform samplerCube u_reflectionMap;\n// Shadows\nuniform highp sampler2DShadow u_shadowMap;\n// uniform float u_shadowScatter;  // REMOVED FOR NOW\nuniform bool u_receiveShadow;\n\n// Global texture coords shared between functions\nvec2 texCoord;\n\n// Output colour of this pixel/fragment\nout vec4 outColour;\n\n// ===== Helper functions =====================================================\n\n// Simple mixer\nvec4 mix4(vec4 a, vec4 b, float mix) {\n  return a * (1.0 - mix) + b * mix;\n}\n\n// Function to help with get values from the shadow map\nfloat shadowMapSample(highp sampler2DShadow map, vec3 coord) {\n  // As WebGL 2 does not support GL_CLAMP_TO_BORDER or GL_TEXTURE_BORDER_COLOR, we need to do this :(\n  if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0) {\n    return 1.0;\n  }\n\n  return texture(map, coord);\n}\n\n// Shade a fragment using a directional light source\nvec4 shadeDirLight(LightDir light, Material mat, vec3 N, vec3 V) {\n  vec3 L = normalize(-light.direction);\n  vec3 H = normalize(L + V);\n\n  vec3 diffuseCol = vec3(texture(mat.diffuseTex, texCoord)) * mat.diffuse;\n  vec3 specularCol = vec3(texture(mat.specularTex, texCoord)) * mat.specular;\n\n  float diff = dot(N, L);\n  float spec = diff > 0.0 ? pow(max(dot(N, H), 0.0), mat.shininess) : 0.0;\n\n  // Shadow map lookup\n  vec3 projCoords = v_shadowCoord.xyz / v_shadowCoord.w * 0.5 + 0.5;\n\n  // REMOVED FOR NOW - PCF for shadows using 8 samples of a poisson disk\n  // float shadow = u_receiveShadow ? 0.0 : 1.0;\n  // float scatter = u_shadowScatter / 100.0;\n  // for (int i = u_receiveShadow ? 0 : MAX_SHADOWS; i < MAX_SHADOWS; i++) {\n  //   vec3 offset = poissonDisk[i] * scatter;\n  //   shadow += shadowMapSample(u_shadowMap, projCoords + offset) * MAX_SHAD_A;\n  // }\n\n  float shadow = u_receiveShadow ? shadowMapSample(u_shadowMap, projCoords) : 1.0;\n\n  vec3 ambient = light.ambient * mat.ambient * diffuseCol;\n  vec3 diffuse = light.colour * max(diff, 0.0) * diffuseCol * shadow;\n  vec3 specular = light.colour * spec * specularCol * shadow;\n\n  // Return a vec4 to support transparency, note specular is not affected by opacity\n  return vec4(ambient + diffuse, mat.opacity / float(u_lightsPosCount + 1)) + vec4(specular, spec);\n}\n\n// Shade a fragment using a positional light source\nvec4 shadePosLight(LightPos light, Material mat, vec3 N, vec3 V) {\n  vec3 L = normalize(light.position - v_position.xyz);\n  vec3 H = normalize(L + V);\n\n  vec3 diffuseCol = vec3(texture(mat.diffuseTex, texCoord)) * mat.diffuse;\n  vec3 specularCol = vec3(texture(mat.specularTex, texCoord)) * mat.specular;\n\n  float diff = dot(N, L);\n  float spec = diff > 0.0 ? pow(max(dot(N, H), 0.0), mat.shininess) : 0.0;\n\n  // Light attenuation, see: https://learnopengl.com/Lighting/Light-casters\n  float dist = length(light.position - v_position.xyz);\n  float attenuation = 1.0 / (light.constant + light.linear * dist + light.quad * (dist * dist));\n\n  vec3 ambient = light.ambient * mat.ambient * diffuseCol * attenuation;\n  vec3 diffuse = light.colour * max(diff, 0.0) * diffuseCol * attenuation;\n  vec3 specular = light.colour * spec * specularCol * attenuation;\n\n  // Return a vec4 to support transparency, note specular is not affected by opacity\n  return vec4(ambient + diffuse, mat.opacity / float(u_lightsPosCount + 1)) + vec4(specular, spec);\n}\n\n// ===== Main shader ==========================================================\n\nvoid main() {\n  vec3 V = normalize(u_camPos - v_position.xyz);\n\n  // Flip texture coords if needed\n  texCoord = u_flipTextureY ? vec2(v_texCoord.x, 1.0 - v_texCoord.y) : v_texCoord;\n  texCoord = u_flipTextureX ? vec2(1.0 - texCoord.x, texCoord.y) : texCoord;\n\n  vec3 N = normalize(v_normal);\n\n  // Normal mapping, this is expensive so only do it if we have a normal map\n  if (u_mat.hasNormalTex) {\n    vec3 normMap = texture(u_mat.normalTex, texCoord).xyz * 2.0 - 1.0;\n\n    vec3 Q1 = dFdx(v_position.xyz);\n    vec3 Q2 = dFdy(v_position.xyz);\n    vec2 st1 = dFdx(texCoord);\n    vec2 st2 = dFdy(texCoord);\n\n    vec3 T = -normalize(Q1 * st2.t - Q2 * st1.t);\n    vec3 B = normalize(cross(N, T));\n    mat3 TBN = mat3(T, B, N);\n\n    N = normalize(TBN * normMap);\n  }\n\n  // Handle the main directional light, only one of these\n  vec4 outColorPart = shadeDirLight(u_lightDirGlobal, u_mat, N, V);\n\n  // Add positional lights\n  for (int i = 0; i < u_lightsPosCount; i++) {\n    outColorPart += shadePosLight(u_lightsPos[i], u_mat, N, V);\n  }\n\n  // Add emissive component\n  float emissiveAlpha = u_mat.emissive.r + u_mat.emissive.g + u_mat.emissive.b > 0.0 ? 1.0 : 0.0;\n  outColorPart += vec4(u_mat.emissive, emissiveAlpha);\n\n  // Get reflection vector and sample reflection texture\n  vec3 R = reflect(-V, N);\n  vec4 reflectCol = vec4(texture(u_reflectionMap, R).rgb, 1.0);\n\n  // Add reflection component, not sure if this is correct, looks ok\n  outColorPart = mix4(outColorPart, reflectCol, u_mat.reflectivity);\n\n  // Gamma correction, as GL_FRAMEBUFFER_SRGB is not supported on WebGL\n  outColorPart.rgb = pow(outColorPart.rgb, vec3(1.0 / u_gamma));\n\n  outColour = outColorPart;\n}\n";

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
    /**
     * The pre-render update function, called every frame.
     * Hook in your custom logic and processing here
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.update = () => {
    };
    this.gl = gl;
    this.started = false;
    this.debug = false;
    this.gamma = 1;
    this.instances = /* @__PURE__ */ new Map();
    this.instancesTrans = /* @__PURE__ */ new Map();
    this.instancesParticles = /* @__PURE__ */ new Map();
    this.cameras = /* @__PURE__ */ new Map();
    this.lights = [];
    this.renderPass = 0;
    this.physicsTimeStep = 1 / 60;
    this.globalLight = new LightDirectional();
    this.globalLight.setAsPosition(20, 50, 30);
    const defaultCamera = new Camera(0 /* PERSPECTIVE */);
    this.cameras.set("default", defaultCamera);
    this._camera = defaultCamera;
    this.activeCameraName = "default";
    this.hud = new HUD(gl.canvas);
    import_loglevel8.default.info(`\u{1F451} GSOTS-3D context created, v${version}`);
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
  /** Get the current EnvironmentMap for the scene */
  get envmap() {
    return this._envmap;
  }
  /**
   * Create & initialize a new Context which will render into provided canvas. This is where you start when using the library.
   * @param canvasSelector CSS selector for canvas element, default is 'canvas'
   * @param antiAlias Enable anti-aliasing in the renderer, default is true
   */
  static async init(canvasSelector = "canvas", antiAlias = true) {
    const gl = getGl(canvasSelector, antiAlias);
    if (!gl) {
      import_loglevel8.default.error("\u{1F4A5} Failed to create WebGL context, this is extremely bad news");
      throw new Error("Failed to get WebGL context");
    }
    const ctx = new _Context(gl);
    const canvas = gl.canvas;
    ctx.camera.aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const phongProgInfo = createProgramInfo(gl, [glsl_default6, glsl_default5]);
    ProgramCache.init(phongProgInfo);
    ProgramCache.instance.add(ProgramCache.PROG_PHONG, phongProgInfo);
    ProgramCache.instance.add(ProgramCache.PROG_BILLBOARD, createProgramInfo(gl, [glsl_default8, glsl_default7]));
    import_loglevel8.default.info(`\u{1F3A8} Loaded all shaders & programs, GL is ready`);
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
    Stats.updateTime(now);
    this.camera.update();
    this.globalLight.shadowViewOffset = this.camera.position;
    if (this.dynamicEnvMap) {
      this.dynamicEnvMap.update(this.gl, this);
    }
    if (this.globalLight.shadowsEnabled) {
      this.gl.cullFace(this.gl.FRONT);
      this.gl.enable(this.gl.POLYGON_OFFSET_FILL);
      const shadowOpt = this.globalLight.shadowMapOptions;
      this.gl.polygonOffset(shadowOpt?.polygonOffset ?? 0, 1);
      bindFramebufferInfo(this.gl, this.globalLight.shadowMapFrameBufffer);
      const shadowCam = this.globalLight.getShadowCamera();
      if (shadowCam)
        this.renderWithCamera(shadowCam, this.globalLight.shadowMapProgram);
      this.gl.cullFace(this.gl.BACK);
      this.gl.disable(this.gl.POLYGON_OFFSET_FILL);
    }
    bindFramebufferInfo(this.gl, null);
    this.renderWithCamera(this.camera);
    this.hud.render(this.debug, this.camera);
    this.update(Stats.deltaTime, now);
    if (this.physicsWorld) {
      this.physicsWorld.step(this.physicsTimeStep, Stats.prevTime);
    }
    Stats.resetPerFrame();
    Stats.frameCount++;
    this.renderPass = 0;
    if (this.started)
      requestAnimationFrame(this.render);
  }
  /**
   * Render the scene from the given camera, used internally for rendering both the main view,
   * but also shadow maps and dynamic env maps
   * @param camera
   */
  renderWithCamera(camera, programOverride) {
    if (!this.gl)
      return;
    this.renderPass++;
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    const camMatrix = camera.matrix;
    let reflectMap = this._envmap?.texture ?? null;
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
      u_shadowMatrix: this.globalLight.shadowMatrix ?? mat4_exports.create()
      // u_shadowScatter: this.globalLight.shadowMapOptions?.scatter ?? 0.2,
    };
    if (this._envmap) {
      this._envmap.render(uniforms.u_view, uniforms.u_proj, camera);
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
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    for (const [_id, instance] of this.instances) {
      instance.render(this.gl, uniforms, programOverride);
      if (this.renderPass == 1)
        instance.updateFromPhysicsBody();
    }
    const instancesTransArray = Array.from(this.instancesTrans.values());
    instancesTransArray.sort((a2, b2) => {
      const ad = Tuples.distance(a2.position ?? [0, 0, 0], this.camera.position);
      const bd = Tuples.distance(b2.position ?? [0, 0, 0], this.camera.position);
      return bd - ad;
    });
    this.gl.disable(this.gl.CULL_FACE);
    for (const instance of instancesTransArray) {
      instance.render(this.gl, uniforms, programOverride);
      if (this.renderPass == 1)
        instance.updateFromPhysicsBody();
    }
    this.gl.depthMask(false);
    for (const [_id, instance] of this.instancesParticles) {
      instance.render(this.gl, uniforms, programOverride);
    }
    this.gl.depthMask(true);
  }
  /**
   * Start the rendering loop, without calling this nothing will render
   */
  start() {
    import_loglevel8.default.info("\u{1F680} Starting main GSOTS render loop!");
    this.hud.hideLoading();
    this.started = true;
    requestAnimationFrame(this.render);
  }
  /**
   * Stop the rendering loop
   */
  stop() {
    import_loglevel8.default.info("\u{1F6D1} Stopping main GSOTS render loop");
    this.started = false;
  }
  /**
   * Resize the canvas to match the size of the HTML element that contains it
   * @param viewportOnly - Only resize the viewport, not the canvas
   */
  resize(viewportOnly = false) {
    const canvas = this.gl.canvas;
    if (!viewportOnly)
      resizeCanvasToDisplaySize(canvas);
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.camera.aspectRatio = canvas.width / canvas.height;
    import_loglevel8.default.info(
      `\u{1F4D0} RESIZE Internal: ${canvas.width} x ${canvas.height}, display: ${canvas.clientWidth} x ${canvas.clientHeight}`
    );
  }
  /**
   * Internal function to add an instance to the scene
   */
  addInstance(instance, material) {
    if (material.opacity !== void 0 && material.opacity < 1) {
      this.instancesTrans.set(instance.id, instance);
    } else {
      this.instances.set(instance.id, instance);
    }
  }
  /**
   * Model loader, loads an OBJ model from a file via URL or path and adds it to the cache
   * This is preferred over calling Model.parse() directly
   * @param path Base path to the model file, e.g. './renderable/'
   * @param fileName Name of the model file, e.g 'teapot.obj'
   * @param filterTextures Apply texture filtering as materials are loaded
   * @param flipTextureY Flip the Y coordinate of the texture
   */
  async loadModel(path, fileName, filterTextures = true, flipY = false, flipUV = true) {
    const modelName = fileName.split(".")[0];
    if (ModelCache.instance.get(modelName, false)) {
      import_loglevel8.default.warn(`\u26A0\uFE0F Model '${modelName}' already loaded, skipping`);
      return;
    }
    const model = await Model.parse(path, fileName, filterTextures, flipY, flipUV);
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
  setLogLevel(level) {
    import_loglevel8.default.setLevel(level);
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
    this.instances.set(instance.id, instance);
    Stats.triangles += model.triangleCount;
    Stats.instances++;
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
    Stats.triangles += sphere.triangleCount;
    Stats.instances++;
    import_loglevel8.default.debug(`\u{1F7E2} Created sphere instance, r:${radius}`);
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
    Stats.triangles += plane.triangleCount;
    Stats.instances++;
    import_loglevel8.default.debug(`\u{1F7E8} Created plane instance, w:${width} h:${height}`);
    return instance;
  }
  /**
   * Create an instance of a primitive cube
   */
  createCubeInstance(material, size = 5, tilingFactor) {
    const cube = new PrimitiveCube(this.gl, size, tilingFactor);
    cube.material = material;
    const instance = new Instance(cube);
    this.addInstance(instance, material);
    Stats.triangles += cube.triangleCount;
    Stats.instances++;
    import_loglevel8.default.debug(`\u{1F4E6} Created cube instance, size:${size}`);
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
    Stats.triangles += cyl.triangleCount;
    Stats.instances++;
    import_loglevel8.default.debug(`\u{1F6E2}\uFE0F Created cylinder instance, r:${r}`);
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
    Stats.triangles += 2;
    Stats.instances++;
    import_loglevel8.default.debug(`\u{1F6A7} Created billboard instance of type: ${type} size: ${size}`);
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
    import_loglevel8.default.debug(`\u{1F506} Created point light, pos:${position} col:${colour} int:${intensity}`);
    return light;
  }
  /**
   * Create a new particle system in the scene
   * @param maxParticles Maximum number of particles to allow in the system
   * @param baseSize Base size of the particles, default 2
   * @returns Both the instance and the particle system
   */
  createParticleSystem(maxParticles = 1e3, baseSize = 2) {
    const particleSystem = new ParticleSystem(this.gl, maxParticles, baseSize);
    const instance = new Instance(particleSystem);
    instance.castShadow = false;
    this.instancesParticles.set(instance.id, instance);
    Stats.instances++;
    return { instance, particleSystem };
  }
  /**
   * Set the EnvironmentMap for the scene, will overwrite any existing envmap.
   * This will enable static reflections and create a 'skybox' around the scene
   * @param textureURLs - Array of 6 texture URLs to use for the map, in the order: +X, -X, +Y, -Y, +Z, -Z
   */
  setEnvmap(renderAsBackground = false, ...textureURLs) {
    this._envmap = new EnvironmentMap(this.gl, textureURLs);
    this._envmap.renderAsBackground = renderAsBackground;
  }
  /**
   * Remove any current EnvironmentMap from the scene
   */
  removeEnvmap() {
    this._envmap = void 0;
  }
  /**
   * Set and create a dynamic environment map which will enable dynamic/realtime reflections
   * @param position - Position to render reflections from
   * @param size - Size of the map to render, note higher sizes will come with a big performance hit
   */
  setDynamicEnvmap(position, size = 256, renderDistance = 500) {
    this.dynamicEnvMap = new DynamicEnvironmentMap(this.gl, size, position, renderDistance);
  }
  /**
   * Remove instance from the scene, it will no longer be rendered
   * @param instance - Instance to remove
   */
  removeInstance(instance) {
    if (!instance)
      return;
    if (instance.renderable instanceof ParticleSystem) {
      this.instancesParticles.delete(instance.id);
      return;
    }
    this.instances.delete(instance.id);
    this.instancesTrans.delete(instance.id);
  }
};

// src/engine/physics.ts
function createSphereBody(inst, mass, material, offset = [0, 0, 0]) {
  if (inst.renderable === void 0) {
    throw new Error("Cannot create body for instance with no renderable");
  }
  let radius = 1;
  if (inst.renderable instanceof PrimitiveSphere) {
    radius = inst.renderable.radius;
  }
  if (inst.renderable instanceof PrimitiveCube) {
    radius = inst.renderable.size / 2;
  }
  if (inst.renderable instanceof Model) {
    const boundBox = inst.renderable.boundingBox;
    const x = (boundBox[3] - boundBox[0]) * inst.scale[0];
    const y = (boundBox[4] - boundBox[1]) * inst.scale[1];
    const z = (boundBox[5] - boundBox[2]) * inst.scale[2];
    radius = Math.max(x, y, z) / 2;
  }
  const body = new Body({
    mass,
    position: new Vec3(inst.position[0], inst.position[1], inst.position[2]),
    material
  });
  const offsetVec = new Vec3(offset[0], offset[1], offset[2]);
  body.addShape(new Sphere(radius), offsetVec);
  inst.physicsBody = body;
  return body;
}
function createBoxBody(inst, mass, material, offset = [0, 0, 0]) {
  if (inst.renderable === void 0) {
    throw new Error("Cannot create body for instance with no renderable");
  }
  let sizeVec = new Vec3(0.5, 0.5, 0.5);
  if (inst.renderable instanceof PrimitiveSphere) {
    const size = inst.renderable.radius * 2;
    sizeVec = new Vec3(size, size, size);
  }
  if (inst.renderable instanceof PrimitiveCube) {
    const size = inst.renderable.size;
    sizeVec = new Vec3(size, size, size);
  }
  if (inst.renderable instanceof Model) {
    const boundBox = inst.renderable.boundingBox;
    sizeVec = new Vec3(
      (boundBox[3] - boundBox[0]) * inst.scale[0] / 2,
      (boundBox[4] - boundBox[1]) * inst.scale[1] / 2,
      (boundBox[5] - boundBox[2]) * inst.scale[2] / 2
    );
  }
  const quat = inst.getQuaternion();
  const body = new Body({
    mass,
    material,
    position: new Vec3(inst.position[0], inst.position[1], inst.position[2]),
    quaternion: new Quaternion(quat[0], quat[1], quat[2], quat[3])
  });
  const offsetVec = new Vec3(offset[0], offset[1], offset[2]);
  body.addShape(new Box(sizeVec), offsetVec);
  inst.physicsBody = body;
  return body;
}
function createPlaneBody(inst, mass, material) {
  const instQuat = inst.getQuaternion();
  const q = quat_exports.fromValues(instQuat[0], instQuat[1], instQuat[2], instQuat[3]);
  quat_exports.rotateX(q, q, -Math.PI / 2);
  const quaternion = new Quaternion(q[0], q[1], q[2], q[3]);
  const body = new Body({
    mass,
    position: new Vec3(inst.position[0], inst.position[1], inst.position[2]),
    shape: new Plane(),
    material,
    quaternion
  });
  inst.physicsBody = body;
  return body;
}
var Physics = {
  createSphereBody,
  createBoxBody,
  createPlaneBody
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
  Material2 as Material,
  Model,
  ModelCache,
  ModelPart,
  Node,
  PROG_BILLBOARD,
  PROG_DEFAULT,
  ParticleSystem,
  Physics,
  Primitive,
  PrimitiveCube,
  PrimitiveCylinder,
  PrimitivePlane,
  PrimitiveSphere,
  ProgramCache,
  Stats,
  TextureCache,
  Tuples,
  getGl
};
/*! Bundled license information:

twgl.js/dist/5.x/twgl-full.module.js:
  (* @license twgl.js 5.5.1 Copyright (c) 2015, Gregg Tavares All Rights Reserved.
  Available via the MIT license.
  see: http://github.com/greggman/twgl.js for details *)
*/
//# sourceMappingURL=gsots3d.js.map