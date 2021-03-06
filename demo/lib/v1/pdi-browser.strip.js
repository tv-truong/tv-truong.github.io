require = function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = "function" == typeof require && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f;
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
    }
    for (var i = "function" == typeof require && require, o = 0; o < r.length; o++) s(r[o]);
    return s;
}({
    1: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var AudioManager = function() {
            function AudioManager() {
                this.audioAssets = [];
                this._masterVolume = 1;
            }
            AudioManager.prototype.registerAudioAsset = function(asset) {
                this.audioAssets.indexOf(asset) === -1 && this.audioAssets.push(asset);
            };
            AudioManager.prototype.removeAudioAsset = function(asset) {
                var index = this.audioAssets.indexOf(asset);
                index === -1 && this.audioAssets.splice(index, 1);
            };
            AudioManager.prototype.setMasterVolume = function(volume) {
                this._masterVolume = volume;
                for (var i = 0; i < this.audioAssets.length; i++) this.audioAssets[i]._lastPlayedPlayer && this.audioAssets[i]._lastPlayedPlayer.notifyMasterVolumeChanged();
            };
            AudioManager.prototype.getMasterVolume = function() {
                return this._masterVolume;
            };
            return AudioManager;
        }();
        exports.AudioManager = AudioManager;
    }, {} ],
    2: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), RenderingHelper_1 = require("./canvas/RenderingHelper"), InputHandlerLayer_1 = require("./InputHandlerLayer"), ContainerController = function() {
            function ContainerController() {
                this.container = null;
                this.surface = null;
                this.inputHandlerLayer = null;
                this.rootView = null;
                this.useResizeForScaling = !1;
                this.pointEventTrigger = new g.Trigger();
                this._rendererReq = null;
                this._disablePreventDefault = !1;
            }
            ContainerController.prototype.initialize = function(param) {
                this._rendererReq = param.rendererRequirement;
                this._disablePreventDefault = !!param.disablePreventDefault;
                this._loadView();
            };
            ContainerController.prototype.setRootView = function(rootView) {
                if (rootView !== this.rootView) {
                    if (this.rootView) {
                        this.unloadView();
                        this._loadView();
                    }
                    this.rootView = rootView;
                    this._appendToRootView(rootView);
                }
            };
            ContainerController.prototype.resetView = function(rendererReq) {
                this.unloadView();
                this._rendererReq = rendererReq;
                this._loadView();
                this._appendToRootView(this.rootView);
            };
            ContainerController.prototype.getRenderer = function() {
                if (!this.surface) throw new Error("this container has no surface");
                return this.surface.renderer();
            };
            ContainerController.prototype.changeScale = function(xScale, yScale) {
                this.useResizeForScaling ? this.surface.changePhysicalScale(xScale, yScale) : this.surface.changeVisualScale(xScale, yScale);
                this.inputHandlerLayer._inputHandler.setScale(xScale, yScale);
            };
            ContainerController.prototype.unloadView = function() {
                this.inputHandlerLayer.disablePointerEvent();
                if (this.rootView) for (;this.rootView.firstChild; ) this.rootView.removeChild(this.rootView.firstChild);
            };
            ContainerController.prototype._loadView = function() {
                var _a = this._rendererReq, width = _a.primarySurfaceWidth, height = _a.primarySurfaceHeight, rc = _a.rendererCandidates, disablePreventDefault = this._disablePreventDefault;
                this.container = document.createDocumentFragment();
                if (this.inputHandlerLayer) {
                    this.inputHandlerLayer.setViewSize({
                        width: width,
                        height: height
                    });
                    this.inputHandlerLayer.pointEventTrigger._reset();
                    this.inputHandlerLayer.view.removeChild(this.surface.canvas);
                    this.surface.destroy();
                } else this.inputHandlerLayer = new InputHandlerLayer_1.InputHandlerLayer({
                    width: width,
                    height: height,
                    disablePreventDefault: disablePreventDefault
                });
                this.surface = RenderingHelper_1.RenderingHelper.createPrimarySurface(width, height, rc);
                this.inputHandlerLayer.view.appendChild(this.surface.getHTMLElement());
                this.container.appendChild(this.inputHandlerLayer.view);
            };
            ContainerController.prototype._appendToRootView = function(rootView) {
                rootView.appendChild(this.container);
                this.inputHandlerLayer.enablePointerEvent();
                this.inputHandlerLayer.pointEventTrigger.handle(this.pointEventTrigger, this.pointEventTrigger.fire);
            };
            return ContainerController;
        }();
        exports.ContainerController = ContainerController;
    }, {
        "./InputHandlerLayer": 3,
        "./canvas/RenderingHelper": 15,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    3: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), TouchHandler_1 = require("./handler/TouchHandler"), InputHandlerLayer = function() {
            function InputHandlerLayer(param) {
                this.view = this._createInputView(param.width, param.height);
                this._inputHandler = void 0;
                this.pointEventTrigger = new g.Trigger();
                this._disablePreventDefault = !!param.disablePreventDefault;
            }
            InputHandlerLayer.prototype.enablePointerEvent = function() {
                var _this = this;
                this._inputHandler = new TouchHandler_1.TouchHandler(this.view, this._disablePreventDefault);
                this._inputHandler.pointTrigger.handle(function(e) {
                    _this.pointEventTrigger.fire(e);
                });
                this._inputHandler.start();
            };
            InputHandlerLayer.prototype.disablePointerEvent = function() {
                this._inputHandler && this._inputHandler.stop();
            };
            InputHandlerLayer.prototype.setOffset = function(offset) {
                var inputViewStyle = "position:relative; left:" + offset.x + "px; top:" + offset.y + "px";
                this._inputHandler.inputView.setAttribute("style", inputViewStyle);
            };
            InputHandlerLayer.prototype.setViewSize = function(size) {
                var view = this.view;
                view.style.width = size.width + "px";
                view.style.height = size.height + "px";
            };
            InputHandlerLayer.prototype._createInputView = function(width, height) {
                var view = document.createElement("div");
                view.setAttribute("tabindex", "1");
                view.className = "input-handler";
                view.setAttribute("style", "display:inline-block; outline:none;");
                view.style.width = width + "px";
                view.style.height = height + "px";
                return view;
            };
            return InputHandlerLayer;
        }();
        exports.InputHandlerLayer = InputHandlerLayer;
    }, {
        "./handler/TouchHandler": 19,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    4: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var RafLooper_1 = require("./RafLooper"), ResourceFactory_1 = require("./ResourceFactory"), ContainerController_1 = require("./ContainerController"), AudioPluginManager_1 = require("./plugin/AudioPluginManager"), AudioManager_1 = require("./AudioManager"), AudioPluginRegistry_1 = require("./plugin/AudioPluginRegistry"), XHRTextAsset_1 = require("./asset/XHRTextAsset"), Platform = function() {
            function Platform(param) {
                this.containerView = param.containerView;
                this.containerController = new ContainerController_1.ContainerController();
                this.audioPluginManager = new AudioPluginManager_1.AudioPluginManager();
                param.audioPlugins && this.audioPluginManager.tryInstallPlugin(param.audioPlugins);
                this.audioPluginManager.tryInstallPlugin(AudioPluginRegistry_1.AudioPluginRegistry.getRegisteredAudioPlugins());
                this._audioManager = new AudioManager_1.AudioManager();
                this.amflow = param.amflow;
                this._platformEventHandler = null;
                this._resourceFactory = param.resourceFactory || new ResourceFactory_1.ResourceFactory({
                    audioPluginManager: this.audioPluginManager,
                    platform: this,
                    audioManager: this._audioManager
                });
                this._rendererReq = null;
                this._disablePreventDefault = !!param.disablePreventDefault;
            }
            Platform.prototype.setPlatformEventHandler = function(handler) {
                if (this.containerController) {
                    this.containerController.pointEventTrigger.removeAll(this._platformEventHandler);
                    this.containerController.pointEventTrigger.handle(handler, handler.onPointEvent);
                }
                this._platformEventHandler = handler;
            };
            Platform.prototype.loadGameConfiguration = function(url, callback) {
                var a = new XHRTextAsset_1.XHRTextAsset("(game.json)", url);
                a._load({
                    _onAssetLoad: function(asset) {
                        callback(null, JSON.parse(a.data));
                    },
                    _onAssetError: function(asset, error) {
                        callback(error, null);
                    }
                });
            };
            Platform.prototype.getResourceFactory = function() {
                return this._resourceFactory;
            };
            Platform.prototype.setRendererRequirement = function(requirement) {
                if (requirement) {
                    this._rendererReq = requirement;
                    this._resourceFactory._rendererCandidates = this._rendererReq.rendererCandidates;
                    if (this.containerController && !this.containerController.inputHandlerLayer) {
                        this.containerController.initialize({
                            rendererRequirement: requirement,
                            disablePreventDefault: this._disablePreventDefault
                        });
                        this.containerController.setRootView(this.containerView);
                        this._platformEventHandler && this.containerController.pointEventTrigger.handle(this._platformEventHandler, this._platformEventHandler.onPointEvent);
                    } else {
                        var surface = this.getPrimarySurface();
                        surface && !surface.destroyed() && surface.destroy();
                        this.containerController.resetView(requirement);
                    }
                } else this.containerController && this.containerController.unloadView();
            };
            Platform.prototype.getPrimarySurface = function() {
                return this.containerController.surface;
            };
            Platform.prototype.getOperationPluginViewInfo = function() {
                var _this = this;
                return {
                    type: "pdi-browser",
                    view: this.containerController.inputHandlerLayer.view,
                    getScale: function() {
                        return _this.containerController.inputHandlerLayer._inputHandler.getScale();
                    }
                };
            };
            Platform.prototype.createLooper = function(fun) {
                return new RafLooper_1.RafLooper(fun);
            };
            Platform.prototype.sendToExternal = function(playId, data) {};
            Platform.prototype.registerAudioPlugins = function(plugins) {
                return this.audioPluginManager.tryInstallPlugin(plugins);
            };
            Platform.prototype.setScale = function(xScale, yScale) {
                this.containerController.changeScale(xScale, yScale);
            };
            Platform.prototype.notifyViewMoved = function() {};
            Platform.prototype.setMasterVolume = function(volume) {
                this._audioManager && this._audioManager.setMasterVolume(volume);
            };
            Platform.prototype.getMasterVolume = function() {
                if (this._audioManager) return this._audioManager.getMasterVolume();
            };
            return Platform;
        }();
        exports.Platform = Platform;
    }, {
        "./AudioManager": 1,
        "./ContainerController": 2,
        "./RafLooper": 5,
        "./ResourceFactory": 6,
        "./asset/XHRTextAsset": 11,
        "./plugin/AudioPluginManager": 20,
        "./plugin/AudioPluginRegistry": 21
    } ],
    5: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var RafLooper = function() {
            function RafLooper(fun) {
                this._fun = fun;
                this._timerId = void 0;
                this._prev = 0;
            }
            RafLooper.prototype.start = function() {
                var _this = this, onAnimationFrame = function(deltaTime) {
                    if (null != _this._timerId) {
                        _this._timerId = requestAnimationFrame(onAnimationFrame);
                        _this._fun(deltaTime - _this._prev);
                        _this._prev = deltaTime;
                    }
                }, onFirstFrame = function(deltaTime) {
                    _this._timerId = requestAnimationFrame(onAnimationFrame);
                    _this._fun(0);
                    _this._prev = deltaTime;
                };
                this._timerId = requestAnimationFrame(onFirstFrame);
            };
            RafLooper.prototype.stop = function() {
                cancelAnimationFrame(this._timerId);
                this._timerId = void 0;
                this._prev = 0;
            };
            return RafLooper;
        }();
        exports.RafLooper = RafLooper;
    }, {} ],
    6: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), HTMLImageAsset_1 = require("./asset/HTMLImageAsset"), HTMLVideoAsset_1 = require("./asset/HTMLVideoAsset"), XHRTextAsset_1 = require("./asset/XHRTextAsset"), XHRScriptAsset_1 = require("./asset/XHRScriptAsset"), RenderingHelper_1 = require("./canvas/RenderingHelper"), GlyphFactory_1 = require("./canvas/GlyphFactory"), ResourceFactory = function(_super) {
            function ResourceFactory(param) {
                var _this = _super.call(this) || this;
                _this._audioPluginManager = param.audioPluginManager;
                _this._audioManager = param.audioManager;
                _this._platform = param.platform;
                return _this;
            }
            __extends(ResourceFactory, _super);
            ResourceFactory.prototype.createAudioAsset = function(id, assetPath, duration, system, loop, hint) {
                var activePlugin = this._audioPluginManager.getActivePlugin(), audioAsset = activePlugin.createAsset(id, assetPath, duration, system, loop, hint);
                if (audioAsset.onDestroyed) {
                    this._audioManager.registerAudioAsset(audioAsset);
                    audioAsset.onDestroyed.handle(this, this._onAudioAssetDestroyed);
                }
                return audioAsset;
            };
            ResourceFactory.prototype.createAudioPlayer = function(system) {
                var activePlugin = this._audioPluginManager.getActivePlugin();
                return activePlugin.createPlayer(system, this._audioManager);
            };
            ResourceFactory.prototype.createImageAsset = function(id, assetPath, width, height) {
                return new HTMLImageAsset_1.HTMLImageAsset(id, assetPath, width, height);
            };
            ResourceFactory.prototype.createVideoAsset = function(id, assetPath, width, height, system, loop, useRealSize) {
                return new HTMLVideoAsset_1.HTMLVideoAsset(id, assetPath, width, height, system, loop, useRealSize);
            };
            ResourceFactory.prototype.createTextAsset = function(id, assetPath) {
                return new XHRTextAsset_1.XHRTextAsset(id, assetPath);
            };
            ResourceFactory.prototype.createScriptAsset = function(id, assetPath) {
                return new XHRScriptAsset_1.XHRScriptAsset(id, assetPath);
            };
            ResourceFactory.prototype.createSurface = function(width, height) {
                return RenderingHelper_1.RenderingHelper.createBackSurface(width, height, this._platform, this._rendererCandidates);
            };
            ResourceFactory.prototype.createGlyphFactory = function(fontFamily, fontSize, baseline, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) {
                return new GlyphFactory_1.GlyphFactory(fontFamily, fontSize, baseline, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight);
            };
            ResourceFactory.prototype._onAudioAssetDestroyed = function(asset) {
                this._audioManager.removeAudioAsset(asset);
            };
            return ResourceFactory;
        }(g.ResourceFactory);
        exports.ResourceFactory = ResourceFactory;
    }, {
        "./asset/HTMLImageAsset": 7,
        "./asset/HTMLVideoAsset": 8,
        "./asset/XHRScriptAsset": 10,
        "./asset/XHRTextAsset": 11,
        "./canvas/GlyphFactory": 14,
        "./canvas/RenderingHelper": 15,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    7: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), ImageAssetSurface = function(_super) {
            function ImageAssetSurface(width, height, drawable) {
                return _super.call(this, width, height, drawable) || this;
            }
            __extends(ImageAssetSurface, _super);
            ImageAssetSurface.prototype.renderer = function() {
                throw g.ExceptionFactory.createAssertionError("ImageAssetSurface cannot be rendered.");
            };
            ImageAssetSurface.prototype.isPlaying = function() {
                return !1;
            };
            return ImageAssetSurface;
        }(g.Surface);
        exports.ImageAssetSurface = ImageAssetSurface;
        var HTMLImageAsset = function(_super) {
            function HTMLImageAsset(id, path, width, height) {
                var _this = _super.call(this, id, path, width, height) || this;
                _this.data = void 0;
                _this._surface = void 0;
                return _this;
            }
            __extends(HTMLImageAsset, _super);
            HTMLImageAsset.prototype.destroy = function() {
                this._surface && !this._surface.destroyed() && this._surface.destroy();
                this.data = void 0;
                this._surface = void 0;
                _super.prototype.destroy.call(this);
            };
            HTMLImageAsset.prototype._load = function(loader) {
                var _this = this, image = new Image();
                image.onerror = function() {
                    loader._onAssetError(_this, g.ExceptionFactory.createAssetLoadError("HTMLImageAsset unknown loading error"));
                };
                image.onload = function() {
                    _this.data = image;
                    loader._onAssetLoad(_this);
                };
                image.src = this.path;
            };
            HTMLImageAsset.prototype.asSurface = function() {
                if (!this.data) throw g.ExceptionFactory.createAssertionError("ImageAssetImpl#asSurface: not yet loaded.");
                if (this._surface) return this._surface;
                this._surface = new ImageAssetSurface(this.width, this.height, this.data);
                return this._surface;
            };
            return HTMLImageAsset;
        }(g.ImageAsset);
        exports.HTMLImageAsset = HTMLImageAsset;
    }, {
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    8: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), HTMLVideoPlayer_1 = require("./HTMLVideoPlayer"), VideoAssetSurface = function(_super) {
            function VideoAssetSurface(width, height, drawable) {
                return _super.call(this, width, height, drawable, !0) || this;
            }
            __extends(VideoAssetSurface, _super);
            VideoAssetSurface.prototype.renderer = function() {
                throw g.ExceptionFactory.createAssertionError("VideoAssetSurface cannot be rendered.");
            };
            VideoAssetSurface.prototype.isPlaying = function() {
                return !1;
            };
            return VideoAssetSurface;
        }(g.Surface), HTMLVideoAsset = function(_super) {
            function HTMLVideoAsset(id, assetPath, width, height, system, loop, useRealSize) {
                var _this = _super.call(this, id, assetPath, width, height, system, loop, useRealSize) || this;
                _this._player = new HTMLVideoPlayer_1.HTMLVideoPlayer();
                _this._surface = new VideoAssetSurface(width, height, null);
                return _this;
            }
            __extends(HTMLVideoAsset, _super);
            HTMLVideoAsset.prototype.inUse = function() {
                return !1;
            };
            HTMLVideoAsset.prototype._load = function(loader) {
                var _this = this;
                setTimeout(function() {
                    loader._onAssetLoad(_this);
                }, 0);
            };
            HTMLVideoAsset.prototype.getPlayer = function() {
                return this._player;
            };
            HTMLVideoAsset.prototype.asSurface = function() {
                return this._surface;
            };
            return HTMLVideoAsset;
        }(g.VideoAsset);
        exports.HTMLVideoAsset = HTMLVideoAsset;
    }, {
        "./HTMLVideoPlayer": 9,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    9: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), HTMLVideoPlayer = function(_super) {
            function HTMLVideoPlayer(loop) {
                var _this = _super.call(this, loop) || this;
                _this.isDummy = !0;
                return _this;
            }
            __extends(HTMLVideoPlayer, _super);
            HTMLVideoPlayer.prototype.play = function(videoAsset) {};
            HTMLVideoPlayer.prototype.stop = function() {};
            HTMLVideoPlayer.prototype.changeVolume = function(volume) {};
            return HTMLVideoPlayer;
        }(g.VideoPlayer);
        exports.HTMLVideoPlayer = HTMLVideoPlayer;
    }, {
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    10: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), XHRLoader_1 = require("../utils/XHRLoader"), XHRScriptAsset = function(_super) {
            function XHRScriptAsset(id, path) {
                var _this = _super.call(this, id, path) || this;
                _this.script = void 0;
                return _this;
            }
            __extends(XHRScriptAsset, _super);
            XHRScriptAsset.prototype._load = function(handler) {
                var _this = this, loader = new XHRLoader_1.XHRLoader();
                loader.get(this.path, function(error, responseText) {
                    if (error) handler._onAssetError(_this, error); else {
                        _this.script = responseText + "\n";
                        handler._onAssetLoad(_this);
                    }
                });
            };
            XHRScriptAsset.prototype.execute = function(execEnv) {
                var func = this._wrap();
                func(execEnv);
                return execEnv.module.exports;
            };
            XHRScriptAsset.prototype._wrap = function() {
                var func = new Function("g", XHRScriptAsset.PRE_SCRIPT + this.script + XHRScriptAsset.POST_SCRIPT);
                return func;
            };
            XHRScriptAsset.PRE_SCRIPT = "(function(exports, require, module, __filename, __dirname) {";
            XHRScriptAsset.POST_SCRIPT = "})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);";
            return XHRScriptAsset;
        }(g.ScriptAsset);
        exports.XHRScriptAsset = XHRScriptAsset;
    }, {
        "../utils/XHRLoader": 31,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    11: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), XHRLoader_1 = require("../utils/XHRLoader"), XHRTextAsset = function(_super) {
            function XHRTextAsset(id, path) {
                var _this = _super.call(this, id, path) || this;
                _this.data = void 0;
                return _this;
            }
            __extends(XHRTextAsset, _super);
            XHRTextAsset.prototype._load = function(handler) {
                var _this = this, loader = new XHRLoader_1.XHRLoader();
                loader.get(this.path, function(error, responseText) {
                    if (error) handler._onAssetError(_this, error); else {
                        _this.data = responseText;
                        handler._onAssetLoad(_this);
                    }
                });
            };
            return XHRTextAsset;
        }(g.TextAsset);
        exports.XHRTextAsset = XHRTextAsset;
    }, {
        "../utils/XHRLoader": 31,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    12: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), Context2DRenderer_1 = require("./Context2DRenderer"), CanvasSurface = function(_super) {
            function CanvasSurface(width, height) {
                var _this = this, canvas = document.createElement("canvas");
                _this = _super.call(this, width, height, canvas) || this;
                canvas.width = width;
                canvas.height = height;
                _this.canvas = canvas;
                _this._context = canvas.getContext("2d");
                _this._renderer = void 0;
                return _this;
            }
            __extends(CanvasSurface, _super);
            CanvasSurface.prototype.destroy = function() {
                this.canvas.width = 1;
                this.canvas.height = 1;
                this.canvas = null;
                this._renderer = null;
                _super.prototype.destroy.call(this);
            };
            CanvasSurface.prototype.renderer = function() {
                this._renderer || (this._renderer = new Context2DRenderer_1.Context2DRenderer(this, this._context));
                return this._renderer;
            };
            CanvasSurface.prototype.getHTMLElement = function() {
                return this.canvas;
            };
            CanvasSurface.prototype.changePhysicalScale = function(xScale, yScale) {
                this.canvas.width = this.width * xScale;
                this.canvas.height = this.height * yScale;
                this._context.scale(xScale, yScale);
            };
            CanvasSurface.prototype.changeVisualScale = function(xScale, yScale) {
                var canvasStyle = this.canvas.style;
                if ("transform" in canvasStyle) {
                    canvasStyle.transformOrigin = "0 0";
                    canvasStyle.transform = "scale(" + xScale + "," + yScale + ")";
                } else if ("webkitTransform" in canvasStyle) {
                    canvasStyle.webkitTransformOrigin = "0 0";
                    canvasStyle.webkitTransform = "scale(" + xScale + "," + yScale + ")";
                } else {
                    canvasStyle.width = Math.floor(xScale * this.width) + "px";
                    canvasStyle.height = Math.floor(yScale * this.width) + "px";
                }
            };
            CanvasSurface.prototype.isPlaying = function() {
                throw g.ExceptionFactory.createAssertionError("CanvasSurface#isPlaying() is not implemented");
            };
            return CanvasSurface;
        }(g.Surface);
        exports.CanvasSurface = CanvasSurface;
    }, {
        "./Context2DRenderer": 13,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    13: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), RenderingHelper_1 = require("./RenderingHelper"), Context2DRenderer = function(_super) {
            function Context2DRenderer(surface, context) {
                var _this = _super.call(this) || this;
                _this.surface = surface;
                _this.context = context;
                return _this;
            }
            __extends(Context2DRenderer, _super);
            Context2DRenderer.prototype.clear = function() {
                this.context.clearRect(0, 0, this.surface.width, this.surface.height);
            };
            Context2DRenderer.prototype.drawImage = function(surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY) {
                this.context.drawImage(surface._drawable, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, width, height);
            };
            Context2DRenderer.prototype.drawSprites = function(surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, count) {
                for (var i = 0; i < count; ++i) this.drawImage(surface, offsetX[i], offsetY[i], width[i], height[i], canvasOffsetX[i], canvasOffsetY[i]);
            };
            Context2DRenderer.prototype.drawSystemText = function(text, x, y, maxWidth, fontSize, textAlign, textBaseline, textColor, fontFamily, strokeWidth, strokeColor, strokeOnly) {
                RenderingHelper_1.RenderingHelper.drawSystemTextByContext2D(this.context, text, x, y, maxWidth, fontSize, textAlign, textBaseline, textColor, fontFamily, strokeWidth, strokeColor, strokeOnly);
            };
            Context2DRenderer.prototype.translate = function(x, y) {
                this.context.translate(x, y);
            };
            Context2DRenderer.prototype.transform = function(matrix) {
                this.context.transform.apply(this.context, matrix);
            };
            Context2DRenderer.prototype.opacity = function(opacity) {
                this.context.globalAlpha *= opacity;
            };
            Context2DRenderer.prototype.save = function() {
                this.context.save();
            };
            Context2DRenderer.prototype.restore = function() {
                this.context.restore();
            };
            Context2DRenderer.prototype.fillRect = function(x, y, width, height, cssColor) {
                var _fillStyle = this.context.fillStyle;
                this.context.fillStyle = cssColor;
                this.context.fillRect(x, y, width, height);
                this.context.fillStyle = _fillStyle;
            };
            Context2DRenderer.prototype.setCompositeOperation = function(operation) {
                this.context.globalCompositeOperation = RenderingHelper_1.RenderingHelper.toTextFromCompositeOperation(operation);
            };
            Context2DRenderer.prototype.setOpacity = function(opacity) {
                this.context.globalAlpha = opacity;
            };
            Context2DRenderer.prototype.setTransform = function(matrix) {
                this.context.setTransform.apply(this.context, matrix);
            };
            return Context2DRenderer;
        }(g.Renderer);
        exports.Context2DRenderer = Context2DRenderer;
    }, {
        "./RenderingHelper": 15,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    14: [ function(require, module, exports) {
        "use strict";
        function createGlyphRenderedSurface(code, fontSize, cssFontFamily, baselineHeight, marginW, marginH, needImageData, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) {
            var scale = fontSize < GlyphFactory._environmentMinimumFontSize ? fontSize / GlyphFactory._environmentMinimumFontSize : 1, surfaceWidth = Math.ceil((fontSize + 2 * marginW) * scale), surfaceHeight = Math.ceil((fontSize + 2 * marginH) * scale), surface = new CanvasSurface_1.CanvasSurface(surfaceWidth, surfaceHeight), canvas = surface.canvas, context = canvas.getContext("2d"), str = 4294901760 & code ? String.fromCharCode((4294901760 & code) >>> 16, 65535 & code) : String.fromCharCode(code), fontWeightValue = fontWeight === g.FontWeight.Bold ? "bold " : "";
            context.save();
            context.font = fontWeightValue + fontSize + "px " + cssFontFamily;
            context.textAlign = "left";
            context.textBaseline = "alphabetic";
            context.lineJoin = "bevel";
            1 !== scale && context.scale(scale, scale);
            if (strokeWidth > 0) {
                context.lineWidth = strokeWidth;
                context.strokeStyle = strokeColor;
                context.strokeText(str, marginW, marginH + baselineHeight);
            }
            if (!strokeOnly) {
                context.fillStyle = fontColor;
                context.fillText(str, marginW, marginH + baselineHeight);
            }
            var advanceWidth = context.measureText(str).width;
            context.restore();
            var result = {
                surface: surface,
                advanceWidth: advanceWidth,
                imageData: needImageData ? context.getImageData(0, 0, canvas.width, canvas.height) : void 0
            };
            return result;
        }
        function calcGlyphArea(imageData) {
            for (var sx = imageData.width, sy = imageData.height, ex = 0, ey = 0, currentPos = 0, y = 0, height = imageData.height; y < height; y = y + 1 | 0) for (var x = 0, width = imageData.width; x < width; x = x + 1 | 0) {
                var a = imageData.data[currentPos + 3];
                if (0 !== a) {
                    x < sx && (sx = x);
                    x > ex && (ex = x);
                    y < sy && (sy = y);
                    y > ey && (ey = y);
                }
                currentPos += 4;
            }
            var glyphArea = void 0;
            glyphArea = sx === imageData.width ? {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            } : {
                x: sx,
                y: sy,
                width: ex - sx + 1,
                height: ey - sy + 1
            };
            return glyphArea;
        }
        function isGlyphAreaEmpty(glyphArea) {
            return 0 === glyphArea.width || 0 === glyphArea.height;
        }
        function fontFamily2FontFamilyName(fontFamily) {
            switch (fontFamily) {
              case g.FontFamily.Monospace:
                return "monospace";

              case g.FontFamily.Serif:
                return "serif";

              default:
                return "sans-serif";
            }
        }
        function quoteIfNotGeneric(name) {
            return genericFontFamilyNames.indexOf(name) !== -1 ? name : '"' + name + '"';
        }
        function fontFamily2CSSFontFamily(fontFamily) {
            return "number" == typeof fontFamily ? fontFamily2FontFamilyName(fontFamily) : "string" == typeof fontFamily ? quoteIfNotGeneric(fontFamily) : fontFamily.map(function(font) {
                return "string" == typeof font ? quoteIfNotGeneric(font) : fontFamily2FontFamilyName(font);
            }).join(",");
        }
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), CanvasSurface_1 = require("./CanvasSurface"), genericFontFamilyNames = [ "serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui" ], GlyphFactory = function(_super) {
            function GlyphFactory(fontFamily, fontSize, baselineHeight, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) {
                var _this = _super.call(this, fontFamily, fontSize, baselineHeight, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) || this;
                _this._glyphAreas = {};
                _this._cssFontFamily = fontFamily2CSSFontFamily(fontFamily);
                var fallbackFontFamilyName = fontFamily2FontFamilyName(g.FontFamily.SansSerif);
                _this._cssFontFamily.indexOf(fallbackFontFamilyName) === -1 && (_this._cssFontFamily += "," + fallbackFontFamilyName);
                _this._marginW = Math.ceil(.3 * _this.fontSize + _this.strokeWidth / 2);
                _this._marginH = Math.ceil(.3 * _this.fontSize + _this.strokeWidth / 2);
                void 0 === GlyphFactory._environmentMinimumFontSize && (GlyphFactory._environmentMinimumFontSize = _this.measureMinimumFontSize());
                return _this;
            }
            __extends(GlyphFactory, _super);
            GlyphFactory.prototype.create = function(code) {
                var result, glyphArea = this._glyphAreas[code];
                if (!glyphArea) {
                    result = createGlyphRenderedSurface(code, this.fontSize, this._cssFontFamily, this.baselineHeight, this._marginW, this._marginH, !0, this.fontColor, this.strokeWidth, this.strokeColor, this.strokeOnly, this.fontWeight);
                    glyphArea = calcGlyphArea(result.imageData);
                    glyphArea.advanceWidth = result.advanceWidth;
                    this._glyphAreas[code] = glyphArea;
                }
                if (isGlyphAreaEmpty(glyphArea)) {
                    result && result.surface.destroy();
                    return new g.Glyph(code, 0, 0, 0, 0, 0, 0, glyphArea.advanceWidth, void 0, !0);
                }
                result || (result = createGlyphRenderedSurface(code, this.fontSize, this._cssFontFamily, this.baselineHeight, this._marginW, this._marginH, !1, this.fontColor, this.strokeWidth, this.strokeColor, this.strokeOnly, this.fontWeight));
                return new g.Glyph(code, glyphArea.x, glyphArea.y, glyphArea.width, glyphArea.height, glyphArea.x - this._marginW, glyphArea.y - this._marginH, glyphArea.advanceWidth, result.surface, !0);
            };
            GlyphFactory.prototype.measureMinimumFontSize = function() {
                var fontSize = 1, str = "M", canvas = document.createElement("canvas"), context = canvas.getContext("2d");
                context.textAlign = "left";
                context.textBaseline = "alphabetic";
                context.lineJoin = "bevel";
                var preWidth;
                context.font = fontSize + "px sans-serif";
                var width = context.measureText(str).width;
                do {
                    preWidth = width;
                    fontSize += 1;
                    context.font = fontSize + "px sans-serif";
                    width = context.measureText(str).width;
                } while (preWidth === width || fontSize > 50);
                return fontSize;
            };
            return GlyphFactory;
        }(g.GlyphFactory);
        exports.GlyphFactory = GlyphFactory;
    }, {
        "./CanvasSurface": 12,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    15: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var RenderingHelper, g = require("@akashic/akashic-engine"), SurfaceFactory_1 = require("./SurfaceFactory");
        !function(RenderingHelper) {
            function toTextFromCompositeOperation(operation) {
                var operationText;
                switch (operation) {
                  case g.CompositeOperation.SourceAtop:
                    operationText = "source-atop";
                    break;

                  case g.CompositeOperation.Lighter:
                    operationText = "lighter";
                    break;

                  case g.CompositeOperation.Copy:
                    operationText = "copy";
                    break;

                  default:
                    operationText = "source-over";
                }
                return operationText;
            }
            function toCompositeOperationFromText(operationText) {
                var operation;
                switch (operationText) {
                  case "source-atop":
                    operation = g.CompositeOperation.SourceAtop;
                    break;

                  case "lighter":
                    operation = g.CompositeOperation.Lighter;
                    break;

                  case "copy":
                    operation = g.CompositeOperation.Copy;
                    break;

                  default:
                    operation = g.CompositeOperation.SourceOver;
                }
                return operation;
            }
            function drawSystemTextByContext2D(context, text, x, y, maxWidth, fontSize, textAlign, textBaseline, textColor, fontFamily, strokeWidth, strokeColor, strokeOnly) {
                var fontFamilyValue, textAlignValue, textBaselineValue;
                context.save();
                switch (fontFamily) {
                  case g.FontFamily.Monospace:
                    fontFamilyValue = "monospace";
                    break;

                  case g.FontFamily.Serif:
                    fontFamilyValue = "serif";
                    break;

                  default:
                    fontFamilyValue = "sans-serif";
                }
                context.font = fontSize + "px " + fontFamilyValue;
                switch (textAlign) {
                  case g.TextAlign.Right:
                    textAlignValue = "right";
                    break;

                  case g.TextAlign.Center:
                    textAlignValue = "center";
                    break;

                  default:
                    textAlignValue = "left";
                }
                context.textAlign = textAlignValue;
                switch (textBaseline) {
                  case g.TextBaseline.Top:
                    textBaselineValue = "top";
                    break;

                  case g.TextBaseline.Middle:
                    textBaselineValue = "middle";
                    break;

                  case g.TextBaseline.Bottom:
                    textBaselineValue = "bottom";
                    break;

                  default:
                    textBaselineValue = "alphabetic";
                }
                context.textBaseline = textBaselineValue;
                context.lineJoin = "bevel";
                if (strokeWidth > 0) {
                    context.lineWidth = strokeWidth;
                    context.strokeStyle = strokeColor;
                    "undefined" == typeof maxWidth ? context.strokeText(text, x, y) : context.strokeText(text, x, y, maxWidth);
                }
                if (!strokeOnly) {
                    context.fillStyle = textColor;
                    "undefined" == typeof maxWidth ? context.fillText(text, x, y) : context.fillText(text, x, y, maxWidth);
                }
                context.restore();
            }
            function createPrimarySurface(width, height, rendererCandidates) {
                return SurfaceFactory_1.SurfaceFactory.createPrimarySurface(width, height, rendererCandidates);
            }
            function createBackSurface(width, height, platform, rendererCandidates) {
                return SurfaceFactory_1.SurfaceFactory.createBackSurface(width, height, platform, rendererCandidates);
            }
            RenderingHelper.toTextFromCompositeOperation = toTextFromCompositeOperation;
            RenderingHelper.toCompositeOperationFromText = toCompositeOperationFromText;
            RenderingHelper.drawSystemTextByContext2D = drawSystemTextByContext2D;
            RenderingHelper.createPrimarySurface = createPrimarySurface;
            RenderingHelper.createBackSurface = createBackSurface;
        }(RenderingHelper = exports.RenderingHelper || (exports.RenderingHelper = {}));
    }, {
        "./SurfaceFactory": 16,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    16: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var SurfaceFactory, CanvasSurface_1 = require("./CanvasSurface");
        !function(SurfaceFactory) {
            function createPrimarySurface(width, height, rendererCandidates) {
                return new CanvasSurface_1.CanvasSurface(width, height);
            }
            function createBackSurface(width, height, platform, rendererCandidates) {
                return new CanvasSurface_1.CanvasSurface(width, height);
            }
            SurfaceFactory.createPrimarySurface = createPrimarySurface;
            SurfaceFactory.createBackSurface = createBackSurface;
        }(SurfaceFactory = exports.SurfaceFactory || (exports.SurfaceFactory = {}));
    }, {
        "./CanvasSurface": 12
    } ],
    17: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), InputAbstractHandler = (require("@akashic/akashic-pdi"), 
        function() {
            function InputAbstractHandler(inputView, disablePreventDefault) {
                if (Object.getPrototypeOf && Object.getPrototypeOf(this) === InputAbstractHandler.prototype) throw new Error("InputAbstractHandler is abstract and should not be directly instantiated");
                this.inputView = inputView;
                this.pointerEventLock = {};
                this._xScale = 1;
                this._yScale = 1;
                this._disablePreventDefault = !!disablePreventDefault;
                this.pointTrigger = new g.Trigger();
            }
            InputAbstractHandler.isSupported = function() {
                return !1;
            };
            InputAbstractHandler.prototype.start = function() {
                throw new Error("This method is abstract");
            };
            InputAbstractHandler.prototype.stop = function() {
                throw new Error("This method is abstract");
            };
            InputAbstractHandler.prototype.setScale = function(xScale, yScale) {
                void 0 === yScale && (yScale = xScale);
                this._xScale = xScale;
                this._yScale = yScale;
            };
            InputAbstractHandler.prototype.pointDown = function(identifier, pagePosition) {
                this.pointTrigger.fire({
                    type: 0,
                    identifier: identifier,
                    offset: this.getOffsetFromEvent(pagePosition)
                });
                this.pointerEventLock[identifier] = !0;
            };
            InputAbstractHandler.prototype.pointMove = function(identifier, pagePosition) {
                this.pointerEventLock.hasOwnProperty(identifier + "") && this.pointTrigger.fire({
                    type: 1,
                    identifier: identifier,
                    offset: this.getOffsetFromEvent(pagePosition)
                });
            };
            InputAbstractHandler.prototype.pointUp = function(identifier, pagePosition) {
                if (this.pointerEventLock.hasOwnProperty(identifier + "")) {
                    this.pointTrigger.fire({
                        type: 2,
                        identifier: identifier,
                        offset: this.getOffsetFromEvent(pagePosition)
                    });
                    delete this.pointerEventLock[identifier];
                }
            };
            InputAbstractHandler.prototype.getOffsetFromEvent = function(e) {
                return {
                    x: e.offsetX,
                    y: e.offsetY
                };
            };
            InputAbstractHandler.prototype.getScale = function() {
                return {
                    x: this._xScale,
                    y: this._yScale
                };
            };
            return InputAbstractHandler;
        }());
        exports.InputAbstractHandler = InputAbstractHandler;
    }, {
        "@akashic/akashic-engine": "@akashic/akashic-engine",
        "@akashic/akashic-pdi": 32
    } ],
    18: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var InputAbstractHandler_1 = require("./InputAbstractHandler"), MouseHandler = function(_super) {
            function MouseHandler(inputView, disablePreventDefault) {
                var _this = _super.call(this, inputView, disablePreventDefault) || this, identifier = 1;
                _this.onMouseDown = function(e) {
                    if (0 === e.button) {
                        _this.eventTarget = e.target;
                        _this.pointDown(identifier, e);
                        window.addEventListener("mousemove", _this.onMouseMove, !1);
                        window.addEventListener("mouseup", _this.onMouseUp, !1);
                        if (!_this._disablePreventDefault) {
                            e.stopPropagation();
                            e.preventDefault();
                        }
                    }
                };
                _this.onMouseMove = function(e) {
                    if (e.target === _this.eventTarget) {
                        _this.pointMove(identifier, e);
                        if (!_this._disablePreventDefault) {
                            e.stopPropagation();
                            e.preventDefault();
                        }
                    }
                };
                _this.onMouseUp = function(e) {
                    if (e.target === _this.eventTarget) {
                        _this.pointUp(identifier, e);
                        window.removeEventListener("mousemove", _this.onMouseMove, !1);
                        window.removeEventListener("mouseup", _this.onMouseUp, !1);
                        if (!_this._disablePreventDefault) {
                            e.stopPropagation();
                            e.preventDefault();
                        }
                    }
                };
                return _this;
            }
            __extends(MouseHandler, _super);
            MouseHandler.prototype.start = function() {
                this.inputView.addEventListener("mousedown", this.onMouseDown, !1);
            };
            MouseHandler.prototype.stop = function() {
                this.inputView.removeEventListener("mousedown", this.onMouseDown, !1);
            };
            return MouseHandler;
        }(InputAbstractHandler_1.InputAbstractHandler);
        exports.MouseHandler = MouseHandler;
    }, {
        "./InputAbstractHandler": 17
    } ],
    19: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var MouseHandler_1 = require("./MouseHandler"), TouchHandler = function(_super) {
            function TouchHandler(inputView, disablePreventDefault) {
                var _this = _super.call(this, inputView, disablePreventDefault) || this;
                _this.onTouchDown = function(e) {
                    for (var touches = e.changedTouches, i = 0, len = touches.length; i < len; i++) {
                        var touch = touches[i];
                        _this.pointDown(touch.identifier, _this.convertToPagePosition(touch));
                    }
                    if (!_this._disablePreventDefault) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                };
                _this.onTouchMove = function(e) {
                    for (var touches = e.changedTouches, i = 0, len = touches.length; i < len; i++) {
                        var touch = touches[i];
                        _this.pointMove(touch.identifier, _this.convertToPagePosition(touch));
                    }
                    if (!_this._disablePreventDefault) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                };
                _this.onTouchUp = function(e) {
                    for (var touches = e.changedTouches, i = 0, len = touches.length; i < len; i++) {
                        var touch = touches[i];
                        _this.pointUp(touch.identifier, _this.convertToPagePosition(touch));
                    }
                    if (!_this._disablePreventDefault) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                };
                return _this;
            }
            __extends(TouchHandler, _super);
            TouchHandler.prototype.start = function() {
                _super.prototype.start.call(this);
                this.inputView.addEventListener("touchstart", this.onTouchDown);
                this.inputView.addEventListener("touchmove", this.onTouchMove);
                this.inputView.addEventListener("touchend", this.onTouchUp);
            };
            TouchHandler.prototype.stop = function() {
                _super.prototype.stop.call(this);
                this.inputView.removeEventListener("touchstart", this.onTouchDown);
                this.inputView.removeEventListener("touchmove", this.onTouchMove);
                this.inputView.removeEventListener("touchend", this.onTouchUp);
            };
            TouchHandler.prototype.convertToPagePosition = function(e) {
                var bounding = this.inputView.getBoundingClientRect(), scale = this.getScale();
                return {
                    offsetX: (e.pageX - Math.round(window.pageXOffset + bounding.left)) / scale.x,
                    offsetY: (e.pageY - Math.round(window.pageYOffset + bounding.top)) / scale.y
                };
            };
            return TouchHandler;
        }(MouseHandler_1.MouseHandler);
        exports.TouchHandler = TouchHandler;
    }, {
        "./MouseHandler": 18
    } ],
    20: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var AudioPluginManager = function() {
            function AudioPluginManager() {
                this._activePlugin = void 0;
            }
            AudioPluginManager.prototype.getActivePlugin = function() {
                return void 0 === this._activePlugin ? null : this._activePlugin;
            };
            AudioPluginManager.prototype.tryInstallPlugin = function(plugins) {
                var PluginConstructor = this.findFirstAvailablePlugin(plugins);
                if (PluginConstructor) {
                    this._activePlugin = new PluginConstructor();
                    return !0;
                }
                return !1;
            };
            AudioPluginManager.prototype.findFirstAvailablePlugin = function(plugins) {
                for (var i = 0, len = plugins.length; i < len; i++) {
                    var plugin = plugins[i];
                    if (plugin.isSupported()) return plugin;
                }
            };
            return AudioPluginManager;
        }();
        exports.AudioPluginManager = AudioPluginManager;
    }, {} ],
    21: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var audioPlugins = [];
        exports.AudioPluginRegistry = {
            addPlugin: function(plugin) {
                audioPlugins.indexOf(plugin) === -1 && audioPlugins.push(plugin);
            },
            getRegisteredAudioPlugins: function() {
                return audioPlugins;
            },
            clear: function() {
                audioPlugins = [];
            }
        };
    }, {} ],
    22: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), HTMLAudioAsset = function(_super) {
            function HTMLAudioAsset() {
                return null !== _super && _super.apply(this, arguments) || this;
            }
            __extends(HTMLAudioAsset, _super);
            HTMLAudioAsset.prototype._load = function(loader) {
                var _this = this;
                if (null != this.path) {
                    var audio = new Audio(), startLoadingAudio = function(path, handlers) {
                        audio.autoplay = !1;
                        audio.preload = "none";
                        audio.src = path;
                        _this._attachAll(audio, handlers);
                        audio.preload = "auto";
                        setAudioLoadInterval(audio, handlers);
                        audio.load();
                    }, handlers = {
                        success: function() {
                            _this._detachAll(audio, handlers);
                            _this.data = audio;
                            loader._onAssetLoad(_this);
                            window.clearInterval(_this._intervalId);
                        },
                        error: function() {
                            _this._detachAll(audio, handlers);
                            _this.data = audio;
                            loader._onAssetError(_this, g.ExceptionFactory.createAssetLoadError("HTMLAudioAsset loading error"));
                            window.clearInterval(_this._intervalId);
                        }
                    }, setAudioLoadInterval = function(audio, handlers) {
                        _this._intervalCount = 0;
                        _this._intervalId = window.setInterval(function() {
                            if (4 === audio.readyState) handlers.success(); else {
                                ++_this._intervalCount;
                                600 === _this._intervalCount && handlers.error();
                            }
                        }, 100);
                    };
                    if (".aac" !== this.path.slice(-4) || HTMLAudioAsset.supportedFormats.indexOf("mp4") === -1) startLoadingAudio(this.path, handlers); else {
                        var altHandlers = {
                            success: handlers.success,
                            error: function() {
                                _this._detachAll(audio, altHandlers);
                                window.clearInterval(_this._intervalId);
                                var altPath = _this.path.slice(0, _this.path.length - 4) + ".mp4";
                                startLoadingAudio(altPath, handlers);
                            }
                        };
                        startLoadingAudio(this.path, altHandlers);
                    }
                } else {
                    this.data = null;
                    setTimeout(function() {
                        return loader._onAssetLoad(_this);
                    }, 0);
                }
            };
            HTMLAudioAsset.prototype.cloneElement = function() {
                return this.data ? new Audio(this.data.src) : null;
            };
            HTMLAudioAsset.prototype._assetPathFilter = function(path) {
                return HTMLAudioAsset.supportedFormats.indexOf("ogg") !== -1 ? g.PathUtil.addExtname(path, "ogg") : HTMLAudioAsset.supportedFormats.indexOf("aac") !== -1 ? g.PathUtil.addExtname(path, "aac") : null;
            };
            HTMLAudioAsset.prototype._attachAll = function(audio, handlers) {
                handlers.success && audio.addEventListener("canplaythrough", handlers.success, !1);
                if (handlers.error) {
                    audio.addEventListener("stalled", handlers.error, !1);
                    audio.addEventListener("error", handlers.error, !1);
                    audio.addEventListener("abort", handlers.error, !1);
                }
            };
            HTMLAudioAsset.prototype._detachAll = function(audio, handlers) {
                handlers.success && audio.removeEventListener("canplaythrough", handlers.success, !1);
                if (handlers.error) {
                    audio.removeEventListener("stalled", handlers.error, !1);
                    audio.removeEventListener("error", handlers.error, !1);
                    audio.removeEventListener("abort", handlers.error, !1);
                }
            };
            return HTMLAudioAsset;
        }(g.AudioAsset);
        exports.HTMLAudioAsset = HTMLAudioAsset;
    }, {
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    23: [ function(require, module, exports) {
        "use strict";
        function resumeHandler() {
            playSuspendedAudioElements();
            clearUserInteractListener();
        }
        function setUserInteractListener() {
            document.addEventListener("keydown", resumeHandler, !0);
            document.addEventListener("mousedown", resumeHandler, !0);
            document.addEventListener("touchend", resumeHandler, !0);
        }
        function clearUserInteractListener() {
            document.removeEventListener("keydown", resumeHandler);
            document.removeEventListener("mousedown", resumeHandler);
            document.removeEventListener("touchend", resumeHandler);
        }
        function playSuspendedAudioElements() {
            state = 2;
            suspendedAudioElements.forEach(function(audio) {
                return audio.play();
            });
            suspendedAudioElements = [];
        }
        var HTMLAudioAutoplayHelper, state = 0, suspendedAudioElements = [];
        !function(HTMLAudioAutoplayHelper) {
            function setupChromeMEIWorkaround(audio) {
                function playHandler() {
                    switch (state) {
                      case 0:
                      case 1:
                        playSuspendedAudioElements();
                        break;

                      case 2:                    }
                    state = 2;
                    clearTimeout(timer);
                }
                function suspendedHandler() {
                    audio.removeEventListener("play", playHandler);
                    switch (state) {
                      case 0:
                        suspendedAudioElements.push(audio);
                        state = 1;
                        setUserInteractListener();
                        break;

                      case 1:
                        suspendedAudioElements.push(audio);
                        break;

                      case 2:
                        audio.play();
                    }
                }
                switch (state) {
                  case 0:
                    audio.addEventListener("play", playHandler, !0);
                    var timer = setTimeout(suspendedHandler, 100);
                    break;

                  case 1:
                    suspendedAudioElements.push(audio);
                    break;

                  case 2:                }
            }
            HTMLAudioAutoplayHelper.setupChromeMEIWorkaround = setupChromeMEIWorkaround;
        }(HTMLAudioAutoplayHelper || (HTMLAudioAutoplayHelper = {}));
        module.exports = HTMLAudioAutoplayHelper;
    }, {} ],
    24: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), autoPlayHelper = require("./HTMLAudioAutoplayHelper"), HTMLAudioPlayer = function(_super) {
            function HTMLAudioPlayer(system, manager) {
                var _this = _super.call(this, system) || this;
                _this._manager = manager;
                _this._endedEventHandler = function() {
                    _this._onAudioEnded();
                };
                _this._onPlayEventHandler = function() {
                    _this._onPlayEvent();
                };
                _this._dummyDurationWaitTimer = null;
                return _this;
            }
            __extends(HTMLAudioPlayer, _super);
            HTMLAudioPlayer.prototype.play = function(asset) {
                this.currentAudio && this.stop();
                var audio = asset.cloneElement();
                if (audio) {
                    autoPlayHelper.setupChromeMEIWorkaround(audio);
                    audio.volume = this._calculateVolume();
                    audio.play().catch(function(err) {});
                    audio.play();
                    audio.loop = asset.loop;
                    audio.addEventListener("ended", this._endedEventHandler, !1);
                    audio.addEventListener("play", this._onPlayEventHandler, !1);
                    this._isWaitingPlayEvent = !0;
                    this._audioInstance = audio;
                } else this._dummyDurationWaitTimer = setTimeout(this._endedEventHandler, asset.duration);
                _super.prototype.play.call(this, asset);
            };
            HTMLAudioPlayer.prototype.stop = function() {
                if (this.currentAudio) {
                    this._clearEndedEventHandler();
                    if (this._audioInstance) if (this._isWaitingPlayEvent) this._isStopRequested = !0; else {
                        this._audioInstance.pause();
                        this._audioInstance = null;
                    }
                    _super.prototype.stop.call(this);
                }
            };
            HTMLAudioPlayer.prototype.changeVolume = function(volume) {
                _super.prototype.changeVolume.call(this, volume);
                this._audioInstance && (this._audioInstance.volume = this._calculateVolume());
            };
            HTMLAudioPlayer.prototype._changeMuted = function(muted) {
                _super.prototype._changeMuted.call(this, muted);
                this._audioInstance && (this._audioInstance.volume = this._calculateVolume());
            };
            HTMLAudioPlayer.prototype.notifyMasterVolumeChanged = function() {
                this._audioInstance && (this._audioInstance.volume = this._calculateVolume());
            };
            HTMLAudioPlayer.prototype._onAudioEnded = function() {
                this._clearEndedEventHandler();
                _super.prototype.stop.call(this);
            };
            HTMLAudioPlayer.prototype._clearEndedEventHandler = function() {
                this._audioInstance && this._audioInstance.removeEventListener("ended", this._endedEventHandler, !1);
                if (null != this._dummyDurationWaitTimer) {
                    clearTimeout(this._dummyDurationWaitTimer);
                    this._dummyDurationWaitTimer = null;
                }
            };
            HTMLAudioPlayer.prototype._onPlayEvent = function() {
                if (this._isWaitingPlayEvent) {
                    this._isWaitingPlayEvent = !1;
                    if (this._isStopRequested) {
                        this._isStopRequested = !1;
                        this._audioInstance.pause();
                        this._audioInstance = null;
                    }
                }
            };
            HTMLAudioPlayer.prototype._calculateVolume = function() {
                return this._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
            };
            return HTMLAudioPlayer;
        }(g.AudioPlayer);
        exports.HTMLAudioPlayer = HTMLAudioPlayer;
    }, {
        "./HTMLAudioAutoplayHelper": 23,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    25: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var HTMLAudioAsset_1 = require("./HTMLAudioAsset"), HTMLAudioPlayer_1 = require("./HTMLAudioPlayer"), HTMLAudioPlugin = function() {
            function HTMLAudioPlugin() {
                this._supportedFormats = this._detectSupportedFormats();
                HTMLAudioAsset_1.HTMLAudioAsset.supportedFormats = this.supportedFormats;
            }
            HTMLAudioPlugin.isSupported = function() {
                var audioElement = document.createElement("audio"), result = !1;
                try {
                    result = void 0 !== audioElement.canPlayType;
                } catch (e) {}
                return result;
            };
            Object.defineProperty(HTMLAudioPlugin.prototype, "supportedFormats", {
                get: function() {
                    return this._supportedFormats;
                },
                set: function(supportedFormats) {
                    this._supportedFormats = supportedFormats;
                    HTMLAudioAsset_1.HTMLAudioAsset.supportedFormats = supportedFormats;
                },
                enumerable: !0,
                configurable: !0
            });
            HTMLAudioPlugin.prototype.createAsset = function(id, assetPath, duration, system, loop, hint) {
                return new HTMLAudioAsset_1.HTMLAudioAsset(id, assetPath, duration, system, loop, hint);
            };
            HTMLAudioPlugin.prototype.createPlayer = function(system, manager) {
                return new HTMLAudioPlayer_1.HTMLAudioPlayer(system, manager);
            };
            HTMLAudioPlugin.prototype._detectSupportedFormats = function() {
                if (navigator.userAgent.indexOf("Edge/") !== -1) return [ "aac" ];
                var audioElement = document.createElement("audio"), supportedFormats = [];
                try {
                    for (var supportedExtensions = [ "ogg", "aac", "mp4" ], i = 0, len = supportedExtensions.length; i < len; i++) {
                        var ext = supportedExtensions[i], canPlay = audioElement.canPlayType("audio/" + ext), supported = "no" !== canPlay && "" !== canPlay;
                        supported && supportedFormats.push(ext);
                    }
                } catch (e) {}
                return supportedFormats;
            };
            return HTMLAudioPlugin;
        }();
        exports.HTMLAudioPlugin = HTMLAudioPlugin;
    }, {
        "./HTMLAudioAsset": 22,
        "./HTMLAudioPlayer": 24
    } ],
    26: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), XHRLoader_1 = require("../../utils/XHRLoader"), helper = require("./WebAudioHelper"), WebAudioAsset = function(_super) {
            function WebAudioAsset() {
                return null !== _super && _super.apply(this, arguments) || this;
            }
            __extends(WebAudioAsset, _super);
            WebAudioAsset.prototype._load = function(loader) {
                var _this = this;
                if (null != this.path) {
                    var successHandler = function(decodedAudio) {
                        _this.data = decodedAudio;
                        loader._onAssetLoad(_this);
                    }, errorHandler = function() {
                        loader._onAssetError(_this, g.ExceptionFactory.createAssetLoadError("WebAudioAsset unknown loading error"));
                    }, onLoadArrayBufferHandler = function(response) {
                        var audioContext = helper.getAudioContext();
                        audioContext.decodeAudioData(response, successHandler, errorHandler);
                    }, xhrLoader = new XHRLoader_1.XHRLoader(), loadArrayBuffer = function(path, onSuccess, onFailed) {
                        xhrLoader.getArrayBuffer(path, function(error, response) {
                            error ? onFailed(error) : onSuccess(response);
                        });
                    };
                    ".aac" !== this.path.slice(-4) ? loadArrayBuffer(this.path, onLoadArrayBufferHandler, errorHandler) : loadArrayBuffer(this.path, onLoadArrayBufferHandler, function(error) {
                        var altPath = _this.path.slice(0, _this.path.length - 4) + ".mp4";
                        loadArrayBuffer(altPath, function(response) {
                            _this.path = altPath;
                            onLoadArrayBufferHandler(response);
                        }, errorHandler);
                    });
                } else {
                    this.data = null;
                    setTimeout(function() {
                        return loader._onAssetLoad(_this);
                    }, 0);
                }
            };
            WebAudioAsset.prototype._assetPathFilter = function(path) {
                return WebAudioAsset.supportedFormats.indexOf("ogg") !== -1 ? g.PathUtil.addExtname(path, "ogg") : WebAudioAsset.supportedFormats.indexOf("aac") !== -1 ? g.PathUtil.addExtname(path, "aac") : null;
            };
            WebAudioAsset.supportedFormats = [];
            return WebAudioAsset;
        }(g.AudioAsset);
        exports.WebAudioAsset = WebAudioAsset;
    }, {
        "../../utils/XHRLoader": 31,
        "./WebAudioHelper": 28,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    27: [ function(require, module, exports) {
        "use strict";
        function resumeHandler() {
            var context = helper.getAudioContext();
            context.resume();
            clearUserInteractListener();
        }
        function setUserInteractListener() {
            document.addEventListener("keydown", resumeHandler, !0);
            document.addEventListener("mousedown", resumeHandler, !0);
            document.addEventListener("touchend", resumeHandler, !0);
        }
        function clearUserInteractListener() {
            document.removeEventListener("keydown", resumeHandler);
            document.removeEventListener("mousedown", resumeHandler);
            document.removeEventListener("touchend", resumeHandler);
        }
        var WebAudioAutoplayHelper, helper = require("./WebAudioHelper");
        !function(WebAudioAutoplayHelper) {
            function setupChromeMEIWorkaround() {
                var context = helper.getAudioContext();
                if (!context || "function" == typeof context.resume) {
                    var gain = helper.createGainNode(context), osc = context.createOscillator();
                    osc.type = "sawtooth";
                    osc.frequency.value = 440;
                    osc.connect(gain);
                    osc.start(0);
                    var contextState = context.state;
                    osc.disconnect();
                    "running" !== contextState && setUserInteractListener();
                }
            }
            WebAudioAutoplayHelper.setupChromeMEIWorkaround = setupChromeMEIWorkaround;
        }(WebAudioAutoplayHelper || (WebAudioAutoplayHelper = {}));
        module.exports = WebAudioAutoplayHelper;
    }, {
        "./WebAudioHelper": 28
    } ],
    28: [ function(require, module, exports) {
        "use strict";
        var WebAudioHelper, AudioContext = window.AudioContext || window.webkitAudioContext, singleContext = null;
        !function(WebAudioHelper) {
            function getAudioContext() {
                if (!singleContext) {
                    singleContext = new AudioContext();
                    WebAudioHelper._workAroundSafari();
                }
                return singleContext;
            }
            function createGainNode(context) {
                return context.createGain ? context.createGain() : context.createGainNode();
            }
            function createBufferNode(context) {
                var sourceNode = context.createBufferSource();
                if (sourceNode.start) return sourceNode;
                sourceNode.start = sourceNode.noteOn;
                sourceNode.stop = sourceNode.noteOff;
                return sourceNode;
            }
            function _workAroundSafari() {
                document.addEventListener("touchstart", function touchInitializeHandler() {
                    document.removeEventListener("touchstart", touchInitializeHandler);
                    singleContext.createBufferSource().start(0);
                }, !0);
            }
            WebAudioHelper.getAudioContext = getAudioContext;
            WebAudioHelper.createGainNode = createGainNode;
            WebAudioHelper.createBufferNode = createBufferNode;
            WebAudioHelper._workAroundSafari = _workAroundSafari;
        }(WebAudioHelper || (WebAudioHelper = {}));
        module.exports = WebAudioHelper;
    }, {} ],
    29: [ function(require, module, exports) {
        "use strict";
        var __extends = this && this.__extends || function() {
            var extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(d, b) {
                d.__proto__ = b;
            } || function(d, b) {
                for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        }();
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), helper = require("./WebAudioHelper"), WebAudioPlayer = function(_super) {
            function WebAudioPlayer(system, manager) {
                var _this = _super.call(this, system) || this;
                _this._audioContext = helper.getAudioContext();
                _this._manager = manager;
                _this._gainNode = helper.createGainNode(_this._audioContext);
                _this._gainNode.connect(_this._audioContext.destination);
                _this._sourceNode = void 0;
                _this._dummyDurationWaitTimer = null;
                _this._endedEventHandler = function() {
                    _this._onAudioEnded();
                };
                return _this;
            }
            __extends(WebAudioPlayer, _super);
            WebAudioPlayer.prototype.changeVolume = function(volume) {
                _super.prototype.changeVolume.call(this, volume);
                this._gainNode.gain.value = this._calculateVolume();
            };
            WebAudioPlayer.prototype._changeMuted = function(muted) {
                _super.prototype._changeMuted.call(this, muted);
                this._gainNode.gain.value = this._calculateVolume();
            };
            WebAudioPlayer.prototype.play = function(asset) {
                this.currentAudio && this.stop();
                if (asset.data) {
                    var bufferNode = helper.createBufferNode(this._audioContext);
                    bufferNode.loop = asset.loop;
                    bufferNode.buffer = asset.data;
                    this._gainNode.gain.value = this._calculateVolume();
                    bufferNode.connect(this._gainNode);
                    this._sourceNode = bufferNode;
                    this._sourceNode.onended = this._endedEventHandler;
                    this._sourceNode.start(0);
                } else this._dummyDurationWaitTimer = setTimeout(this._endedEventHandler, asset.duration);
                _super.prototype.play.call(this, asset);
            };
            WebAudioPlayer.prototype.stop = function() {
                if (this.currentAudio) {
                    this._clearEndedEventHandler();
                    this._sourceNode && this._sourceNode.stop(0);
                    _super.prototype.stop.call(this);
                }
            };
            WebAudioPlayer.prototype.notifyMasterVolumeChanged = function() {
                this._gainNode.gain.value = this._calculateVolume();
            };
            WebAudioPlayer.prototype._onAudioEnded = function() {
                this._clearEndedEventHandler();
                _super.prototype.stop.call(this);
            };
            WebAudioPlayer.prototype._clearEndedEventHandler = function() {
                this._sourceNode && (this._sourceNode.onended = null);
                if (null != this._dummyDurationWaitTimer) {
                    clearTimeout(this._dummyDurationWaitTimer);
                    this._dummyDurationWaitTimer = null;
                }
            };
            WebAudioPlayer.prototype._calculateVolume = function() {
                return this._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
            };
            return WebAudioPlayer;
        }(g.AudioPlayer);
        exports.WebAudioPlayer = WebAudioPlayer;
    }, {
        "./WebAudioHelper": 28,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    30: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var WebAudioAsset_1 = require("./WebAudioAsset"), WebAudioPlayer_1 = require("./WebAudioPlayer"), autoPlayHelper = require("./WebAudioAutoplayHelper"), WebAudioPlugin = function() {
            function WebAudioPlugin() {
                this.supportedFormats = this._detectSupportedFormats();
                autoPlayHelper.setupChromeMEIWorkaround();
            }
            WebAudioPlugin.isSupported = function() {
                return "AudioContext" in window || "webkitAudioContext" in window;
            };
            Object.defineProperty(WebAudioPlugin.prototype, "supportedFormats", {
                get: function() {
                    return this._supportedFormats;
                },
                set: function(supportedFormats) {
                    this._supportedFormats = supportedFormats;
                    WebAudioAsset_1.WebAudioAsset.supportedFormats = supportedFormats;
                },
                enumerable: !0,
                configurable: !0
            });
            WebAudioPlugin.prototype.createAsset = function(id, assetPath, duration, system, loop, hint) {
                return new WebAudioAsset_1.WebAudioAsset(id, assetPath, duration, system, loop, hint);
            };
            WebAudioPlugin.prototype.createPlayer = function(system, manager) {
                return new WebAudioPlayer_1.WebAudioPlayer(system, manager);
            };
            WebAudioPlugin.prototype._detectSupportedFormats = function() {
                if (navigator.userAgent.indexOf("Edge/") !== -1) return [ "aac" ];
                var audioElement = document.createElement("audio"), supportedFormats = [];
                try {
                    for (var supportedExtensions = [ "ogg", "aac", "mp4" ], i = 0, len = supportedExtensions.length; i < len; i++) {
                        var ext = supportedExtensions[i], canPlay = audioElement.canPlayType("audio/" + ext), supported = "no" !== canPlay && "" !== canPlay;
                        supported && supportedFormats.push(ext);
                    }
                } catch (e) {}
                return supportedFormats;
            };
            return WebAudioPlugin;
        }();
        exports.WebAudioPlugin = WebAudioPlugin;
    }, {
        "./WebAudioAsset": 26,
        "./WebAudioAutoplayHelper": 27,
        "./WebAudioPlayer": 29
    } ],
    31: [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var g = require("@akashic/akashic-engine"), XHRLoader = function() {
            function XHRLoader(options) {
                void 0 === options && (options = {});
                this.timeout = options.timeout || 15e3;
            }
            XHRLoader.prototype.get = function(url, callback) {
                this._getRequestObject({
                    url: url,
                    responseType: "text"
                }, callback);
            };
            XHRLoader.prototype.getArrayBuffer = function(url, callback) {
                this._getRequestObject({
                    url: url,
                    responseType: "arraybuffer"
                }, callback);
            };
            XHRLoader.prototype._getRequestObject = function(requestObject, callback) {
                var request = new XMLHttpRequest();
                request.open("GET", requestObject.url, !0);
                request.responseType = requestObject.responseType;
                request.timeout = this.timeout;
                request.addEventListener("timeout", function() {
                    callback(g.ExceptionFactory.createAssetLoadError("loading timeout"));
                }, !1);
                request.addEventListener("load", function() {
                    if (request.status >= 200 && request.status < 300) {
                        var response = "text" === requestObject.responseType ? request.responseText : request.response;
                        callback(null, response);
                    } else callback(g.ExceptionFactory.createAssetLoadError("loading error. status: " + request.status));
                }, !1);
                request.addEventListener("error", function() {
                    callback(g.ExceptionFactory.createAssetLoadError("loading error. status: " + request.status));
                }, !1);
                request.send();
            };
            return XHRLoader;
        }();
        exports.XHRLoader = XHRLoader;
    }, {
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ],
    32: [ function(require, module, exports) {
        "use strict";
    }, {} ],
    "@akashic/pdi-browser": [ function(require, module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var Platform_1 = require("./Platform");
        exports.Platform = Platform_1.Platform;
        var ResourceFactory_1 = require("./ResourceFactory");
        exports.ResourceFactory = ResourceFactory_1.ResourceFactory;
        var g = require("@akashic/akashic-engine");
        exports.g = g;
        var AudioPluginRegistry_1 = require("./plugin/AudioPluginRegistry");
        exports.AudioPluginRegistry = AudioPluginRegistry_1.AudioPluginRegistry;
        var AudioPluginManager_1 = require("./plugin/AudioPluginManager");
        exports.AudioPluginManager = AudioPluginManager_1.AudioPluginManager;
        var HTMLAudioPlugin_1 = require("./plugin/HTMLAudioPlugin/HTMLAudioPlugin");
        exports.HTMLAudioPlugin = HTMLAudioPlugin_1.HTMLAudioPlugin;
        var WebAudioPlugin_1 = require("./plugin/WebAudioPlugin/WebAudioPlugin");
        exports.WebAudioPlugin = WebAudioPlugin_1.WebAudioPlugin;
    }, {
        "./Platform": 4,
        "./ResourceFactory": 6,
        "./plugin/AudioPluginManager": 20,
        "./plugin/AudioPluginRegistry": 21,
        "./plugin/HTMLAudioPlugin/HTMLAudioPlugin": 25,
        "./plugin/WebAudioPlugin/WebAudioPlugin": 30,
        "@akashic/akashic-engine": "@akashic/akashic-engine"
    } ]
}, {}, []);