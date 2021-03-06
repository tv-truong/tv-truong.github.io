require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"@akashic/akashic-engine":[function(require,module,exports){
(function() {
"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var g;
(function (g) {
    /**
     * アセット読み込み失敗時のエラーの種別。
     *
     * この値はあくまでもエラーメッセージ出力のための補助情報であり、
     * 網羅性・厳密性を追求したものではないことに注意。
     */
    var AssetLoadErrorType;
    (function (AssetLoadErrorType) {
        /**
         * 明示されていない(以下のいずれかかもしれないし、そうでないかもしれない)。
         */
        AssetLoadErrorType[AssetLoadErrorType["Unspecified"] = 0] = "Unspecified";
        /**
         * エンジンの再試行回数上限設定値を超えた。
         */
        AssetLoadErrorType[AssetLoadErrorType["RetryLimitExceeded"] = 1] = "RetryLimitExceeded";
        /**
         * ネットワークエラー。タイムアウトなど。
         */
        AssetLoadErrorType[AssetLoadErrorType["NetworkError"] = 2] = "NetworkError";
        /**
         * リクエストに問題があるエラー。HTTP 4XX など。
         */
        AssetLoadErrorType[AssetLoadErrorType["ClientError"] = 3] = "ClientError";
        /**
         * サーバ側のエラー。HTTP 5XX など。
         */
        AssetLoadErrorType[AssetLoadErrorType["ServerError"] = 4] = "ServerError";
    })(AssetLoadErrorType = g.AssetLoadErrorType || (g.AssetLoadErrorType = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 例外生成ファクトリ。
     * エンジン内部での例外生成に利用するもので、ゲーム開発者は通常本モジュールを利用する必要はない。
     */
    var ExceptionFactory;
    (function (ExceptionFactory) {
        function createAssertionError(message, cause) {
            var e = new Error(message);
            e.name = "AssertionError";
            e.cause = cause;
            return e;
        }
        ExceptionFactory.createAssertionError = createAssertionError;
        function createTypeMismatchError(methodName, expected, actual, cause) {
            var message = "Type mismatch on " + methodName + ","
                + " expected type is " + expected;
            if (arguments.length > 2) {
                try {
                    var actualString;
                    if (actual && actual.constructor && actual.constructor.name) {
                        actualString = actual.constructor.name;
                    }
                    else {
                        actualString = typeof actual;
                    }
                    message += ", actual type is "
                        + (actualString.length > 40 ? actualString.substr(0, 40) : actualString);
                }
                catch (ex) {
                }
            }
            message += ".";
            var e = new Error(message);
            e.name = "TypeMismatchError";
            e.cause = cause;
            e.expected = expected;
            e.actual = actual;
            return e;
        }
        ExceptionFactory.createTypeMismatchError = createTypeMismatchError;
        function createAssetLoadError(message, retriable, type, cause) {
            if (retriable === void 0) { retriable = true; }
            if (type === void 0) { type = g.AssetLoadErrorType.Unspecified; }
            var e = new Error(message);
            e.name = "AssetLoadError";
            e.cause = cause;
            e.retriable = retriable;
            e.type = type;
            return e;
        }
        ExceptionFactory.createAssetLoadError = createAssetLoadError;
    })(ExceptionFactory = g.ExceptionFactory || (g.ExceptionFactory = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * リソースの生成を行うクラス。
     *
     * このクラス (の実装クラス) のインスタンスはエンジンによって生成される。ゲーム開発者が生成する必要はない。
     * またこのクラスの各種アセット生成メソッドは、エンジンによって暗黙に呼び出されるものである。
     * 通常ゲーム開発者が呼び出す必要はない。
     */
    var ResourceFactory = (function () {
        function ResourceFactory() {
        }
        ResourceFactory.prototype.createSurfaceAtlas = function (width, height) {
            return new g.SurfaceAtlas(this.createSurface(width, height));
        };
        /**
         * 指定Surfaceから指定範囲を切り取ったSurfaceを返す。
         * 範囲を指定しない場合は、指定SurfaceをコピーしたSurfaceを返す。
         */
        ResourceFactory.prototype.createTrimmedSurface = function (targetSurface, targetArea) {
            var area = targetArea || { x: 0, y: 0, width: targetSurface.width, height: targetSurface.height };
            var surface = this.createSurface(area.width, area.height);
            var renderer = surface.renderer();
            renderer.begin();
            renderer.drawImage(targetSurface, area.x, area.y, area.width, area.height, 0, 0);
            renderer.end();
            return surface;
        };
        return ResourceFactory;
    }());
    g.ResourceFactory = ResourceFactory;
})(g || (g = {}));
var g;
(function (g) {
    var RequireCachedValue = (function () {
        function RequireCachedValue(value) {
            this._value = value;
        }
        /**
         * @private
         */
        RequireCachedValue.prototype._cachedValue = function () {
            return this._value;
        };
        return RequireCachedValue;
    }());
    g.RequireCachedValue = RequireCachedValue;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 乱数生成器。
     * `RandomGenerator#get()` によって、新しい乱数を生成することができる。
     */
    var RandomGenerator = (function () {
        function RandomGenerator(seed) {
            this.seed = seed;
            this[0] = this;
        }
        return RandomGenerator;
    }());
    g.RandomGenerator = RandomGenerator;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 各種リソースを表すクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
     * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
     * Scene#assets、またはGame#assetsによって取得して利用する。
     */
    var Asset = (function () {
        function Asset(id, path) {
            this.id = id;
            this.originalPath = path;
            this.path = this._assetPathFilter(path);
            this.onDestroyed = new g.Trigger();
        }
        Asset.prototype.destroy = function () {
            this.onDestroyed.fire(this);
            this.id = undefined;
            this.originalPath = undefined;
            this.path = undefined;
            this.onDestroyed.destroy();
            this.onDestroyed = undefined;
        };
        Asset.prototype.destroyed = function () {
            return this.id === undefined;
        };
        /**
         * 現在利用中で解放出来ない `Asset` かどうかを返す。
         * 戻り値は、利用中である場合真、でなければ偽である。
         *
         * 本メソッドは通常 `false` が返るべきである。
         * 例えば `Sprite` の元画像として使われているケース等では、その `Sprite` によって `Asset` は `Surface` に変換されているべきで、
         * `Asset` が利用中で解放出来ない状態になっていない事を各プラットフォームで保障する必要がある。
         *
         * 唯一、例外的に本メソッドが `true` を返すことがあるのは音楽を表す `Asset` である。
         * BGM等はシーンをまたいで演奏することもありえる上、
         * 演奏中のリソースのコピーを常に各プラットフォームに強制するにはコストがかかりすぎるため、
         * 本メソッドは `true` を返し、適切なタイミングで `Asset` が解放されるよう制御する必要がある。
         */
        Asset.prototype.inUse = function () {
            return false;
        };
        /**
         * @private
         */
        Asset.prototype._assetPathFilter = function (path) {
            // 拡張子の補完・読み替えが必要なassetはこれをオーバーライドすればよい。(対応形式が限定されるaudioなどの場合)
            return path;
        };
        return Asset;
    }());
    g.Asset = Asset;
    /**
     * 画像リソースを表すクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
     * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
     * Scene#assets、またはGame#assetsによって取得して利用する。
     *
     * width, heightでメタデータとして画像の大きさをとることは出来るが、
     * ゲーム開発者はそれ以外の情報を本クラスから直接は取得せず、Sprite等に本リソースを指定して利用する。
     */
    var ImageAsset = (function (_super) {
        __extends(ImageAsset, _super);
        function ImageAsset(id, assetPath, width, height) {
            var _this = _super.call(this, id, assetPath) || this;
            _this.width = width;
            _this.height = height;
            return _this;
        }
        return ImageAsset;
    }(Asset));
    g.ImageAsset = ImageAsset;
    /**
     * 動画リソースを表すクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
     * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
     * Scene#assets、またはGame#assetsによって取得して利用する。
     */
    var VideoAsset = (function (_super) {
        __extends(VideoAsset, _super);
        function VideoAsset(id, assetPath, width, height, system, loop, useRealSize) {
            var _this = _super.call(this, id, assetPath, width, height) || this;
            _this.realWidth = 0;
            _this.realHeight = 0;
            _this._system = system;
            _this._loop = loop;
            _this._useRealSize = useRealSize;
            return _this;
        }
        VideoAsset.prototype.play = function (loop) {
            this.getPlayer().play(this);
            return this.getPlayer();
        };
        VideoAsset.prototype.stop = function () {
            this.getPlayer().stop();
        };
        VideoAsset.prototype.destroy = function () {
            this._system = undefined;
            _super.prototype.destroy.call(this);
        };
        return VideoAsset;
    }(ImageAsset));
    g.VideoAsset = VideoAsset;
    /**
     * 音リソースを表すクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
     * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
     * Scene#assets、またはGame#assetsによって取得して利用する。
     *
     * AudioAsset#playを呼び出す事で、その音を再生することが出来る。
     */
    var AudioAsset = (function (_super) {
        __extends(AudioAsset, _super);
        function AudioAsset(id, assetPath, duration, system, loop, hint) {
            var _this = _super.call(this, id, assetPath) || this;
            _this.duration = duration;
            _this.loop = loop;
            _this.hint = hint;
            _this._system = system;
            _this.data = undefined;
            return _this;
        }
        AudioAsset.prototype.play = function () {
            var player = this._system.createPlayer();
            player.play(this);
            this._lastPlayedPlayer = player;
            return player;
        };
        AudioAsset.prototype.stop = function () {
            var players = this._system.findPlayers(this);
            for (var i = 0; i < players.length; ++i)
                players[i].stop();
        };
        AudioAsset.prototype.inUse = function () {
            return this._system.findPlayers(this).length > 0;
        };
        AudioAsset.prototype.destroy = function () {
            if (this._system)
                this.stop();
            this.data = undefined;
            this._system = undefined;
            this._lastPlayedPlayer = undefined;
            _super.prototype.destroy.call(this);
        };
        return AudioAsset;
    }(Asset));
    g.AudioAsset = AudioAsset;
    /**
     * 文字列リソースを表すクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
     * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
     * Scene#assets、またはGame#assetsによって取得して利用する。
     *
     * TextAsset#dataによって、本リソースが保持する文字列を取得することが出来る。
     */
    var TextAsset = (function (_super) {
        __extends(TextAsset, _super);
        function TextAsset(id, assetPath) {
            var _this = _super.call(this, id, assetPath) || this;
            _this.data = undefined;
            return _this;
        }
        TextAsset.prototype.destroy = function () {
            this.data = undefined;
            _super.prototype.destroy.call(this);
        };
        return TextAsset;
    }(Asset));
    g.TextAsset = TextAsset;
    /**
     * スクリプトリソースを表すクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
     * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
     * Scene#assets、またはGame#assetsによって取得して利用する。
     *
     * ScriptAsset#executeによって、本リソースが表すスクリプトを実行し、その結果を受け取る事が出来る。
     * requireによる参照とは異なり、executeはキャッシュされないため、何度でも呼び出し違う結果を受け取ることが出来る。
     */
    var ScriptAsset = (function (_super) {
        __extends(ScriptAsset, _super);
        function ScriptAsset() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ScriptAsset.prototype.destroy = function () {
            this.script = undefined;
            _super.prototype.destroy.call(this);
        };
        return ScriptAsset;
    }(Asset));
    g.ScriptAsset = ScriptAsset;
})(g || (g = {}));
var g;
(function (g) {
    var AssetLoadingInfo = (function () {
        function AssetLoadingInfo(asset, handler) {
            this.asset = asset;
            this.handlers = [handler];
            this.errorCount = 0;
            this.loading = false;
        }
        return AssetLoadingInfo;
    }());
    function normalizeAudioSystemConfMap(confMap) {
        confMap = confMap || {};
        var systemDefaults = {
            music: {
                loop: true,
                hint: { streaming: true }
            },
            sound: {
                loop: false,
                hint: { streaming: false }
            }
        };
        for (var key in systemDefaults) {
            if (!(key in confMap)) {
                confMap[key] = systemDefaults[key];
            }
        }
        return confMap;
    }
    /**
     * `Asset` を管理するクラス。
     *
     * このクラスのインスタンスは `Game` に一つデフォルトで存在する(デフォルトアセットマネージャ)。
     * デフォルトアセットマネージャは、game.json に記述された通常のアセットを読み込むために利用される。
     *
     * ゲーム開発者は、game.json に記述のないリソースを取得するために、このクラスのインスタンスを独自に生成してよい。
     */
    var AssetManager = (function () {
        /**
         * `AssetManager` のインスタンスを生成する。
         *
         * @param game このインスタンスが属するゲーム
         * @param conf このアセットマネージャに与えるアセット定義。game.json の `"assets"` に相当。
         */
        function AssetManager(game, conf, audioSystemConfMap, moduleMainScripts) {
            this.game = game;
            this.configuration = this._normalize(conf || {}, normalizeAudioSystemConfMap(audioSystemConfMap));
            this._assets = {};
            this._liveAssetVirtualPathTable = {};
            this._liveAbsolutePathTable = {};
            this._moduleMainScripts = moduleMainScripts ? moduleMainScripts : {};
            this._refCounts = {};
            this._loadings = {};
        }
        /**
         * このインスタンスを破棄する。
         */
        AssetManager.prototype.destroy = function () {
            var assetIds = Object.keys(this._refCounts);
            for (var i = 0; i < assetIds.length; ++i) {
                this._releaseAsset(assetIds[i]);
            }
            this.game = undefined;
            this.configuration = undefined;
            this._assets = undefined;
            this._liveAssetVirtualPathTable = undefined;
            this._liveAbsolutePathTable = undefined;
            this._refCounts = undefined;
            this._loadings = undefined;
        };
        /**
         * このインスタンスが破棄済みであるかどうかを返す。
         */
        AssetManager.prototype.destroyed = function () {
            return this.game === undefined;
        };
        /**
         * `Asset` の読み込みを再試行する。
         *
         * 引数 `asset` は読み込みの失敗が (`Scene#assetLoadFail` で) 通知されたアセットでなければならない。
         * @param asset 読み込みを再試行するアセット
         */
        AssetManager.prototype.retryLoad = function (asset) {
            if (!this._loadings.hasOwnProperty(asset.id))
                throw g.ExceptionFactory.createAssertionError("AssetManager#retryLoad: invalid argument.");
            var loadingInfo = this._loadings[asset.id];
            if (loadingInfo.errorCount > AssetManager.MAX_ERROR_COUNT) {
                // DynamicAsset はエラーが規定回数超えた場合は例外にせず諦める。
                if (!this.configuration[asset.id])
                    return;
                throw g.ExceptionFactory.createAssertionError("AssetManager#retryLoad: too many retrying.");
            }
            if (!loadingInfo.loading) {
                loadingInfo.loading = true;
                asset._load(this);
            }
        };
        /**
         * このインスタンスに与えられた `AssetConfigurationMap` のうち、グローバルアセットのIDをすべて返す。
         */
        AssetManager.prototype.globalAssetIds = function () {
            var ret = [];
            var conf = this.configuration;
            for (var p in conf) {
                if (!conf.hasOwnProperty(p))
                    continue;
                if (conf[p].global)
                    ret.push(p);
            }
            return ret;
        };
        /**
         * アセットの取得を要求する。
         *
         * 要求したアセットが読み込み済みでない場合、読み込みが行われる。
         * 取得した結果は `handler` を通して通知される。
         * ゲーム開発者はこのメソッドを呼び出してアセットを取得した場合、
         * 同じアセットID(または取得したアセット)で `unrefAsset()` を呼び出さなければならない。
         *
         * @param assetIdOrConf 要求するアセットのIDまたは設定
         * @param handler 要求結果を受け取るハンドラ
         */
        AssetManager.prototype.requestAsset = function (assetIdOrConf, handler) {
            var assetId = (typeof assetIdOrConf === "string") ? assetIdOrConf : assetIdOrConf.id;
            var waiting = false;
            var loadingInfo;
            if (this._assets.hasOwnProperty(assetId)) {
                ++this._refCounts[assetId];
                handler._onAssetLoad(this._assets[assetId]);
            }
            else if (this._loadings.hasOwnProperty(assetId)) {
                loadingInfo = this._loadings[assetId];
                loadingInfo.handlers.push(handler);
                ++this._refCounts[assetId];
                waiting = true;
            }
            else {
                var a = this._createAssetFor(assetIdOrConf);
                loadingInfo = new AssetLoadingInfo(a, handler);
                this._loadings[assetId] = loadingInfo;
                this._refCounts[assetId] = 1;
                waiting = true;
                loadingInfo.loading = true;
                a._load(this);
            }
            return waiting;
        };
        /**
         * アセットの参照カウントを減らす。
         * 引数の各要素で `unrefAsset()` を呼び出す。
         *
         * @param assetOrId 参照カウントを減らすアセットまたはアセットID
         */
        AssetManager.prototype.unrefAsset = function (assetOrId) {
            var assetId = (typeof assetOrId === "string") ? assetOrId : assetOrId.id;
            if (--this._refCounts[assetId] > 0)
                return;
            this._releaseAsset(assetId);
        };
        /**
         * 複数のアセットの取得を要求する。
         * 引数の各要素で `requestAsset()` を呼び出す。
         *
         * @param assetIdOrConfs 取得するアセットのIDまたはアセット定義
         * @param handler 取得の結果を受け取るハンドラ
         */
        AssetManager.prototype.requestAssets = function (assetIdOrConfs, handler) {
            var waitingCount = 0;
            for (var i = 0, len = assetIdOrConfs.length; i < len; ++i) {
                if (this.requestAsset(assetIdOrConfs[i], handler)) {
                    ++waitingCount;
                }
            }
            return waitingCount;
        };
        /**
         * 複数のアセットを解放する。
         * 引数の各要素で `unrefAsset()` を呼び出す。
         *
         * @param assetOrIds 参照カウントを減らすアセットまたはアセットID
         * @private
         */
        AssetManager.prototype.unrefAssets = function (assetOrIds) {
            for (var i = 0, len = assetOrIds.length; i < len; ++i) {
                this.unrefAsset(assetOrIds[i]);
            }
        };
        AssetManager.prototype._normalize = function (configuration, audioSystemConfMap) {
            var ret = {};
            if (!(configuration instanceof Object))
                throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: invalid arguments.");
            for (var p in configuration) {
                if (!configuration.hasOwnProperty(p))
                    continue;
                var conf = Object.create(configuration[p]);
                if (!conf.path) {
                    throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: No path given for: " + p);
                }
                if (!conf.virtualPath) {
                    throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: No virtualPath given for: " + p);
                }
                if (!conf.type) {
                    throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: No type given for: " + p);
                }
                if (conf.type === "image") {
                    if (typeof conf.width !== "number")
                        throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong width given for the image asset: " + p);
                    if (typeof conf.height !== "number")
                        throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong height given for the image asset: " + p);
                }
                if (conf.type === "audio") {
                    // durationというメンバは後から追加したため、古いgame.jsonではundefinedになる場合がある
                    if (conf.duration === undefined)
                        conf.duration = 0;
                    var audioSystemConf = audioSystemConfMap[conf.systemId];
                    if (conf.loop === undefined) {
                        conf.loop = !!audioSystemConf && !!audioSystemConf.loop;
                    }
                    if (conf.hint === undefined) {
                        conf.hint = audioSystemConf ? audioSystemConf.hint : {};
                    }
                }
                if (conf.type === "video") {
                    if (!conf.useRealSize) {
                        if (typeof conf.width !== "number")
                            throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong width given for the video asset: " + p);
                        if (typeof conf.height !== "number")
                            throw g.ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong height given for the video asset: " + p);
                        conf.useRealSize = false;
                    }
                }
                if (!conf.global)
                    conf.global = false;
                ret[p] = conf;
            }
            return ret;
        };
        /**
         * @private
         */
        AssetManager.prototype._createAssetFor = function (idOrConf) {
            var id;
            var uri;
            var conf;
            if (typeof idOrConf === "string") {
                id = idOrConf;
                conf = this.configuration[id];
                uri = this.configuration[id].path;
            }
            else {
                var dynConf = idOrConf;
                id = dynConf.id;
                conf = dynConf;
                uri = dynConf.uri;
            }
            var resourceFactory = this.game.resourceFactory;
            if (!conf)
                throw g.ExceptionFactory.createAssertionError("AssetManager#_createAssetFor: unknown asset ID: " + id);
            switch (conf.type) {
                case "image":
                    return resourceFactory.createImageAsset(id, uri, conf.width, conf.height);
                case "audio":
                    var system = conf.systemId ? this.game.audio[conf.systemId] : this.game.audio[this.game.defaultAudioSystemId];
                    return resourceFactory.createAudioAsset(id, uri, conf.duration, system, conf.loop, conf.hint);
                case "text":
                    return resourceFactory.createTextAsset(id, uri);
                case "script":
                    return resourceFactory.createScriptAsset(id, uri);
                case "video":
                    // VideoSystemはまだ中身が定義されていなが、将来のためにVideoAssetにVideoSystemを渡すという体裁だけが整えられている。
                    // 以上を踏まえ、ここでは簡単のために都度新たなVideoSystemインスタンスを生成している。
                    return resourceFactory.createVideoAsset(id, uri, conf.width, conf.height, new g.VideoSystem(), conf.loop, conf.useRealSize);
                default:
                    throw g.ExceptionFactory.createAssertionError("AssertionError#_createAssetFor: unknown asset type " + conf.type + " for asset ID: " + id);
            }
        };
        AssetManager.prototype._releaseAsset = function (assetId) {
            var asset = this._assets[assetId] || (this._loadings[assetId] && this._loadings[assetId].asset);
            var path;
            if (asset) {
                path = asset.path;
                if (asset.inUse()) {
                    if (asset instanceof g.AudioAsset) {
                        asset._system.requestDestroy(asset);
                    }
                    else if (asset instanceof g.VideoAsset) {
                        // NOTE: 一旦再生完了を待たずに破棄することにする
                        // TODO: 再生中の動画を破棄するタイミングをどのように扱うか検討し実装
                        asset.destroy();
                    }
                    else {
                        throw g.ExceptionFactory.createAssertionError("AssetManager#unrefAssets: Unsupported in-use " + asset.id);
                    }
                }
                else {
                    asset.destroy();
                }
            }
            delete this._refCounts[assetId];
            delete this._loadings[assetId];
            delete this._assets[assetId];
            if (this.configuration[assetId]) {
                var virtualPath = this.configuration[assetId].virtualPath;
                if (virtualPath && this._liveAssetVirtualPathTable.hasOwnProperty(virtualPath))
                    delete this._liveAssetVirtualPathTable[virtualPath];
                if (path && this._liveAbsolutePathTable.hasOwnProperty(path))
                    delete this._liveAbsolutePathTable[path];
            }
        };
        /**
         * 現在ロード中のアセットの数。(デバッグ用; 直接の用途はない)
         * @private
         */
        AssetManager.prototype._countLoadingAsset = function () {
            return Object.keys(this._loadings).length;
        };
        /**
         * @private
         */
        AssetManager.prototype._onAssetError = function (asset, error) {
            // ロード中に Scene が破棄されていた場合などで、asset が破棄済みになることがある
            if (this.destroyed() || asset.destroyed())
                return;
            var loadingInfo = this._loadings[asset.id];
            var hs = loadingInfo.handlers;
            loadingInfo.loading = false;
            ++loadingInfo.errorCount;
            if (loadingInfo.errorCount > AssetManager.MAX_ERROR_COUNT && error.retriable) {
                error = g.ExceptionFactory.createAssetLoadError("Retry limit exceeded", false, g.AssetLoadErrorType.RetryLimitExceeded, error);
            }
            if (!error.retriable)
                delete this._loadings[asset.id];
            for (var i = 0; i < hs.length; ++i)
                hs[i]._onAssetError(asset, error, this);
        };
        /**
         * @private
         */
        AssetManager.prototype._onAssetLoad = function (asset) {
            // ロード中に Scene が破棄されていた場合などで、asset が破棄済みになることがある
            if (this.destroyed() || asset.destroyed())
                return;
            var loadingInfo = this._loadings[asset.id];
            loadingInfo.loading = false;
            delete this._loadings[asset.id];
            this._assets[asset.id] = asset;
            // DynamicAsset の場合は configuration に書かれていないので以下の判定が偽になる
            if (this.configuration[asset.id]) {
                var virtualPath = this.configuration[asset.id].virtualPath;
                if (!this._liveAssetVirtualPathTable.hasOwnProperty(virtualPath)) {
                    this._liveAssetVirtualPathTable[virtualPath] = asset;
                }
                else {
                    if (this._liveAssetVirtualPathTable[virtualPath].path !== asset.path)
                        throw g.ExceptionFactory.createAssertionError("AssetManager#_onAssetLoad(): duplicated asset path");
                }
                if (!this._liveAbsolutePathTable.hasOwnProperty(asset.path))
                    this._liveAbsolutePathTable[asset.path] = virtualPath;
            }
            var hs = loadingInfo.handlers;
            for (var i = 0; i < hs.length; ++i)
                hs[i]._onAssetLoad(asset);
        };
        return AssetManager;
    }());
    AssetManager.MAX_ERROR_COUNT = 3;
    g.AssetManager = AssetManager;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * node.js の require() ライクな読み込み処理を行い、その結果を返す。
     *
     * node.jsのrequireに限りなく近いモデルでrequireする。
     * ただしアセットIDで該当すればそちらを優先する。また node.js のコアモジュールには対応していない。
     * 通常、ゲーム開発者が利用するのは `Module#require()` であり、このメソッドはその内部実装を提供する。
     * @param game requireを実行するコンテキストを表すGameインスタンス
     * @param path requireのパス。相対パスと、Asset識別名を利用することが出来る。
     *              なお、./xxx.json のようにjsonを指定する場合、そのAssetはTextAssetである必要がある。
     *              その他の形式である場合、そのAssetはScriptAssetである必要がある。
     * @param currentModule このrequireを実行した Module
     * @returns {any} スクリプト実行結果。通常はScriptAsset#executeの結果。
     *                 例外的に、jsonであればTextAsset#dataをJSON.parseした結果が返る
     */
    function _require(game, path, currentModule) {
        // Node.js の require の挙動については http://nodejs.jp/nodejs.org_ja/api/modules.html も参照。
        var targetScriptAsset;
        var resolvedPath;
        var liveAssetVirtualPathTable = game._assetManager._liveAssetVirtualPathTable;
        var moduleMainScripts = game._assetManager._moduleMainScripts;
        // 0. アセットIDらしい場合はまず当該アセットを探す
        if (path.indexOf("/") === -1) {
            if (game._assetManager._assets.hasOwnProperty(path)) {
                targetScriptAsset = game._assetManager._assets[path];
                resolvedPath = game._assetManager._liveAbsolutePathTable[targetScriptAsset.path];
            }
        }
        // 1. If X is a core module,
        // (何もしない。コアモジュールには対応していない。ゲーム開発者は自分でコアモジュールへの依存を解決する必要がある)
        if (/^\.\/|^\.\.\/|^\//.test(path)) {
            // 2. If X begins with './' or '/' or '../'
            if (currentModule) {
                if (!currentModule._virtualDirname)
                    throw g.ExceptionFactory.createAssertionError("g._require: require from DynamicAsset is not supported");
                resolvedPath = g.PathUtil.resolvePath(currentModule._virtualDirname, path);
            }
            else {
                if (!(/^\.\//.test(path)))
                    throw g.ExceptionFactory.createAssertionError("g._require: entry point path must start with './'");
                resolvedPath = path.substring(2);
            }
            if (game._scriptCaches.hasOwnProperty(resolvedPath)) {
                return game._scriptCaches[resolvedPath]._cachedValue();
            }
            else if (game._scriptCaches.hasOwnProperty(resolvedPath + ".js")) {
                return game._scriptCaches[resolvedPath + ".js"]._cachedValue();
            }
            // 2.a. LOAD_AS_FILE(Y + X)
            if (!targetScriptAsset)
                targetScriptAsset = g.Util.findAssetByPathAsFile(resolvedPath, liveAssetVirtualPathTable);
            // 2.b. LOAD_AS_DIRECTORY(Y + X)
            if (!targetScriptAsset)
                targetScriptAsset = g.Util.findAssetByPathAsDirectory(resolvedPath, liveAssetVirtualPathTable);
        }
        else {
            // 3. LOAD_NODE_MODULES(X, dirname(Y))
            // `path` は node module の名前であると仮定して探す
            // akashic-engine独自仕様: 対象の `path` が `moduleMainScripts` に指定されていたらそちらを参照する
            if (moduleMainScripts[path]) {
                resolvedPath = moduleMainScripts[path];
                targetScriptAsset = game._assetManager._liveAssetVirtualPathTable[resolvedPath];
            }
            if (!targetScriptAsset) {
                var dirs = currentModule ? currentModule.paths : [];
                dirs.push("node_modules");
                for (var i = 0; i < dirs.length; ++i) {
                    var dir = dirs[i];
                    resolvedPath = g.PathUtil.resolvePath(dir, path);
                    targetScriptAsset = g.Util.findAssetByPathAsFile(resolvedPath, liveAssetVirtualPathTable);
                    if (targetScriptAsset)
                        break;
                    targetScriptAsset = g.Util.findAssetByPathAsDirectory(resolvedPath, liveAssetVirtualPathTable);
                    if (targetScriptAsset)
                        break;
                }
            }
        }
        if (targetScriptAsset) {
            if (game._scriptCaches.hasOwnProperty(resolvedPath))
                return game._scriptCaches[resolvedPath]._cachedValue();
            if (targetScriptAsset instanceof g.ScriptAsset) {
                var context = new g.ScriptAssetContext(game, targetScriptAsset);
                game._scriptCaches[resolvedPath] = context;
                return context._executeScript(currentModule);
            }
            else if (targetScriptAsset instanceof g.TextAsset) {
                // JSONの場合の特殊挙動をトレースするためのコード。node.jsの仕様に準ずる
                if (targetScriptAsset && g.PathUtil.resolveExtname(path) === ".json") {
                    // Note: node.jsではここでBOMの排除をしているが、いったんakashicでは排除しないで実装
                    var cache = game._scriptCaches[resolvedPath] = new g.RequireCachedValue(JSON.parse(targetScriptAsset.data));
                    return cache._cachedValue();
                }
            }
        }
        throw g.ExceptionFactory.createAssertionError("g._require: can not find module: " + path);
    }
    g._require = _require;
    /**
     * Node.js が提供する module の互換クラス。
     */
    var Module = (function () {
        function Module(game, id, path) {
            var _this = this;
            var dirname = g.PathUtil.resolveDirname(path);
            // `virtualPath` と `virtualDirname` は　`DynamicAsset` の場合は `undefined` になる。
            var virtualPath = game._assetManager._liveAbsolutePathTable[path];
            var virtualDirname = virtualPath ? g.PathUtil.resolveDirname(virtualPath) : undefined;
            var _g = Object.create(g, {
                game: {
                    value: game,
                    enumerable: true
                },
                filename: {
                    value: path,
                    enumerable: true
                },
                dirname: {
                    value: dirname,
                    enumerable: true
                },
                module: {
                    value: this,
                    writable: true,
                    enumerable: true,
                    configurable: true
                }
            });
            this.id = id;
            this.filename = path;
            this.exports = {};
            this.parent = null; // Node.js と互換
            this.loaded = false;
            this.children = [];
            this.paths = virtualDirname ? g.PathUtil.makeNodeModulePaths(virtualDirname) : [];
            this._dirname = dirname;
            this._virtualDirname = virtualDirname;
            this._g = _g;
            // メソッドとしてではなく単体で呼ばれるのでメソッドにせずここで実体を代入する
            this.require = function (path) {
                return (path === "g") ? _g : g._require(game, path, _this);
            };
        }
        return Module;
    }());
    g.Module = Module;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * `ScriptAsset` の実行コンテキスト。
     * 通常スクリプトアセットを実行するためにはこのクラスを経由する。
     *
     * ゲーム開発者がこのクラスを利用する必要はない。
     * スクリプトアセットを実行する場合は、暗黙にこのクラスを利用する `require()` を用いること。
     */
    var ScriptAssetContext = (function () {
        function ScriptAssetContext(game, asset) {
            this._game = game;
            this._asset = asset;
            this._module = new g.Module(game, asset.path, asset.path);
            this._g = this._module._g;
            this._started = false;
        }
        /**
         * @private
         */
        ScriptAssetContext.prototype._cachedValue = function () {
            if (!this._started)
                throw g.ExceptionFactory.createAssertionError("ScriptAssetContext#_cachedValue: not executed yet.");
            return this._module.exports;
        };
        /**
         * @private
         */
        ScriptAssetContext.prototype._executeScript = function (currentModule) {
            if (this._started)
                return this._module.exports;
            if (currentModule) {
                // Node.js 互換挙動: Module#parent は一番最初に require() した module になる
                this._module.parent = currentModule;
                // Node.js 互換挙動: 親 module の children には自身が実行中の段階で既に追加されている
                currentModule.children.push(this._module);
            }
            this._started = true;
            this._asset.execute(this._g);
            this._module.loaded = true;
            return this._module.exports;
        };
        return ScriptAssetContext;
    }());
    g.ScriptAssetContext = ScriptAssetContext;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 変換行列を一般的なJavaScriptのみで表したクラス。
     * 通常ゲーム開発者が本クラスを直接利用する事はない。
     * 各フィールド、メソッドの詳細は `Matrix` インターフェースの説明を参照。
     */
    var PlainMatrix = (function () {
        function PlainMatrix(widthOrSrc, height, scaleX, scaleY, angle) {
            // TODO: (GAMEDEV-845) Float32Arrayの方が速いらしいので、polyfillして使うかどうか検討
            if (widthOrSrc === undefined) {
                this._modified = false;
                this._matrix = [1, 0, 0, 1, 0, 0];
            }
            else if (typeof widthOrSrc === "number") {
                this._modified = false;
                this._matrix = new Array(6);
                this.update(widthOrSrc, height, scaleX, scaleY, angle, 0, 0);
            }
            else {
                this._modified = widthOrSrc._modified;
                this._matrix = [
                    widthOrSrc._matrix[0],
                    widthOrSrc._matrix[1],
                    widthOrSrc._matrix[2],
                    widthOrSrc._matrix[3],
                    widthOrSrc._matrix[4],
                    widthOrSrc._matrix[5]
                ];
            }
        }
        PlainMatrix.prototype.update = function (width, height, scaleX, scaleY, angle, x, y) {
            // ここで求める変換行列Mは、引数で指定された変形を、拡大・回転・平行移動の順に適用するものである。
            // 変形の原点は引数で指定された矩形の中心、すなわち (width/2, height/2) の位置である。従って
            //    M = A^-1 T R S A
            // である。ただしここでA, S, R, Tは、それぞれ以下を表す変換行列である:
            //    A: 矩形の中心を原点に移す(平行移動する)変換
            //    S: X軸方向にscaleX倍、Y軸方向にscaleY倍する変換
            //    R: angle度だけ回転する変換
            //    T: x, yの値だけ平行移動する変換
            // それらは次のように表せる:
            //           1    0   -w           sx    0    0            c   -s    0            1    0    x
            //    A = [  0    1   -h]    S = [  0   sy    0]    R = [  s    c    0]    T = [  0    1    y]
            //           0    0    1            0    0    1            0    0    1            0    0    1
            // ここで sx, sy は scaleX, scaleY であり、c, s は cos(theta), sin(theta)
            // (ただし theta = angle * PI / 180)、w = (width / 2), h = (height / 2) である。
            // 以下の実装は、M の各要素をそれぞれ計算して直接求めている。
            var r = angle * Math.PI / 180;
            var _cos = Math.cos(r);
            var _sin = Math.sin(r);
            var a = _cos * scaleX;
            var b = _sin * scaleX;
            var c = _sin * scaleY;
            var d = _cos * scaleY;
            var w = width / 2;
            var h = height / 2;
            this._matrix[0] = a;
            this._matrix[1] = b;
            this._matrix[2] = -c;
            this._matrix[3] = d;
            this._matrix[4] = -a * w + c * h + w + x;
            this._matrix[5] = -b * w - d * h + h + y;
        };
        PlainMatrix.prototype.updateByInverse = function (width, height, scaleX, scaleY, angle, x, y) {
            // ここで求める変換行列は、update() の求める行列Mの逆行列、M^-1である。update() のコメントに記述のとおり、
            //    M = A^-1 T R S A
            // であるから、
            //    M^-1 = A^-1 S^-1 R^-1 T^-1 A
            // それぞれは次のように表せる:
            //              1    0    w             1/sx     0    0               c    s    0               1    0   -x
            //    A^-1 = [  0    1    h]    S^-1 = [   0  1/sy    0]    R^-1 = [ -s    c    0]    T^-1 = [  0    1   -y]
            //              0    0    1                0     0    1               0    0    1               0    0    1
            // ここで各変数は update() のコメントのものと同様である。
            // 以下の実装は、M^-1 の各要素をそれぞれ計算して直接求めている。
            var r = angle * Math.PI / 180;
            var _cos = Math.cos(r);
            var _sin = Math.sin(r);
            var a = _cos / scaleX;
            var b = _sin / scaleY;
            var c = _sin / scaleX;
            var d = _cos / scaleY;
            var w = width / 2;
            var h = height / 2;
            this._matrix[0] = a;
            this._matrix[1] = -b;
            this._matrix[2] = c;
            this._matrix[3] = d;
            this._matrix[4] = -a * (w + x) - c * (h + y) + w;
            this._matrix[5] = b * (w + x) - d * (h + y) + h;
        };
        PlainMatrix.prototype.multiply = function (matrix) {
            var m1 = this._matrix;
            var m2 = matrix._matrix;
            var m10 = m1[0];
            var m11 = m1[1];
            var m12 = m1[2];
            var m13 = m1[3];
            m1[0] = m10 * m2[0] + m12 * m2[1];
            m1[1] = m11 * m2[0] + m13 * m2[1];
            m1[2] = m10 * m2[2] + m12 * m2[3];
            m1[3] = m11 * m2[2] + m13 * m2[3];
            m1[4] = m10 * m2[4] + m12 * m2[5] + m1[4];
            m1[5] = m11 * m2[4] + m13 * m2[5] + m1[5];
        };
        PlainMatrix.prototype.multiplyNew = function (matrix) {
            var ret = this.clone();
            ret.multiply(matrix);
            return ret;
        };
        PlainMatrix.prototype.reset = function (x, y) {
            this._matrix[0] = 1;
            this._matrix[1] = 0;
            this._matrix[2] = 0;
            this._matrix[3] = 1;
            this._matrix[4] = x || 0;
            this._matrix[5] = y || 0;
        };
        PlainMatrix.prototype.clone = function () {
            return new PlainMatrix(this);
        };
        PlainMatrix.prototype.multiplyInverseForPoint = function (point) {
            var m = this._matrix;
            // id = inverse of the determinant
            var _id = 1 / (m[0] * m[3] + m[2] * -m[1]);
            return {
                x: m[3] * _id * point.x + -m[2] * _id * point.y + (m[5] * m[2] - m[4] * m[3]) * _id,
                y: m[0] * _id * point.y + -m[1] * _id * point.x + (-m[5] * m[0] + m[4] * m[1]) * _id
            };
        };
        PlainMatrix.prototype.scale = function (x, y) {
            var m = this._matrix;
            m[0] *= x;
            m[1] *= y;
            m[2] *= x;
            m[3] *= y;
            m[4] *= x;
            m[5] *= y;
        };
        PlainMatrix.prototype.multiplyPoint = function (point) {
            var m = this._matrix;
            var x = m[0] * point.x + m[2] * point.y + m[4];
            var y = m[1] * point.x + m[3] * point.y + m[5];
            return { x: x, y: y };
        };
        return PlainMatrix;
    }());
    g.PlainMatrix = PlainMatrix;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * ユーティリティ。
     */
    var Util;
    (function (Util) {
        /**
         * 2点間(P1..P2)の距離(pixel)を返す。
         * @param {number} p1x P1-X
         * @param {number} p1y P1-Y
         * @param {number} p2x P2-X
         * @param {number} p2y P2-Y
         */
        function distance(p1x, p1y, p2x, p2y) {
            return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
        }
        Util.distance = distance;
        /**
         * 2点間(P1..P2)の距離(pixel)を返す。
         * @param {CommonOffset} p1 座標1
         * @param {CommonOffset} p2 座標2
         */
        function distanceBetweenOffsets(p1, p2) {
            return Util.distance(p1.x, p1.y, p2.x, p2.y);
        }
        Util.distanceBetweenOffsets = distanceBetweenOffsets;
        /**
         * 2つの矩形の中心座標(P1..P2)間の距離(pixel)を返す。
         * @param {CommonArea} p1 矩形1
         * @param {CommonArea} p2 矩形2
         */
        function distanceBetweenAreas(p1, p2) {
            return Util.distance(p1.x + p1.width / 2, p1.y + p1.height / 2, p2.x + p2.width / 2, p2.y + p2.height / 2);
        }
        Util.distanceBetweenAreas = distanceBetweenAreas;
        // Note: オーバーロードされているのでjsdoc省略
        function createMatrix(width, height, scaleX, scaleY, angle) {
            // Note: asm.js対応環境ではasm.js対応のMatrixを生成するなどしたいため、オーバーヘッドを許容する
            if (width === undefined)
                return new g.PlainMatrix();
            return new g.PlainMatrix(width, height, scaleX, scaleY, angle);
        }
        Util.createMatrix = createMatrix;
        /**
         * e の描画内容を持つ Sprite を生成する。
         * @param scene 作成したSpriteを登録するScene
         * @param e Sprite化したいE
         * @param camera 使用カメラ
         */
        function createSpriteFromE(scene, e, camera) {
            var oldX = e.x;
            var oldY = e.y;
            var x = 0;
            var y = 0;
            var width = e.width;
            var height = e.height;
            var boundingRect = e.calculateBoundingRect(camera);
            if (!boundingRect) {
                throw g.ExceptionFactory.createAssertionError("Util#createSpriteFromE: camera must look e");
            }
            width = boundingRect.right - boundingRect.left;
            height = boundingRect.bottom - boundingRect.top;
            if (boundingRect.left < e.x)
                x = e.x - boundingRect.left;
            if (boundingRect.top < e.y)
                y = e.y - boundingRect.top;
            e.moveTo(x, y);
            // 再描画フラグを立てたくないために e._matrix を直接触っている
            if (e._matrix)
                e._matrix._modified = true;
            var surface = scene.game.resourceFactory.createSurface(Math.ceil(width), Math.ceil(height));
            var renderer = surface.renderer();
            renderer.begin();
            e.render(renderer, camera);
            renderer.end();
            var s = new g.Sprite({
                scene: scene,
                src: surface,
                width: width,
                height: height
            });
            s.moveTo(boundingRect.left, boundingRect.top);
            e.moveTo(oldX, oldY);
            if (e._matrix)
                e._matrix._modified = true;
            return s;
        }
        Util.createSpriteFromE = createSpriteFromE;
        /**
         * scene の描画内容を持つ Sprite を生成する。
         * @param toScene 作ったSpriteを登録するScene
         * @param fromScene Sprite化したいScene
         * @param camera 使用カメラ
         */
        function createSpriteFromScene(toScene, fromScene, camera) {
            var surface = toScene.game.resourceFactory.createSurface(Math.ceil(fromScene.game.width), Math.ceil(fromScene.game.height));
            var renderer = surface.renderer();
            renderer.begin();
            var children = fromScene.children;
            for (var i = 0; i < children.length; ++i)
                children[i].render(renderer, camera);
            renderer.end();
            return new g.Sprite({
                scene: toScene,
                src: surface,
                width: fromScene.game.width,
                height: fromScene.game.height
            });
        }
        Util.createSpriteFromScene = createSpriteFromScene;
        /**
         * 引数 `src` が `undefined` または `Surface` でそのまま返す。
         * そうでなくかつ `ImageAsset` であれば `Surface` に変換して返す。
         *
         * @param src
         */
        function asSurface(src) {
            // Note: TypeScriptのtype guardを活用するため、あえて1つのifで1つの型しか判定していない
            if (!src)
                return src;
            if (src instanceof g.Surface)
                return src;
            if (src instanceof g.ImageAsset)
                return src.asSurface();
            throw g.ExceptionFactory.createTypeMismatchError("Util#asSurface", "ImageAsset|Surface", src);
        }
        Util.asSurface = asSurface;
        /**
         * 与えられたパス文字列がファイルパスであると仮定して、対応するアセットを探す。
         * 見つかった場合そのアセットを、そうでない場合 `undefined` を返す。
         * 通常、ゲーム開発者がファイルパスを扱うことはなく、このメソッドを呼び出す必要はない。
         *
         * @param resolvedPath パス文字列
         * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
         */
        function findAssetByPathAsFile(resolvedPath, liveAssetPathTable) {
            if (liveAssetPathTable.hasOwnProperty(resolvedPath))
                return liveAssetPathTable[resolvedPath];
            if (liveAssetPathTable.hasOwnProperty(resolvedPath + ".js"))
                return liveAssetPathTable[resolvedPath + ".js"];
            return undefined;
        }
        Util.findAssetByPathAsFile = findAssetByPathAsFile;
        /**
         * 与えられたパス文字列がディレクトリパスであると仮定して、対応するアセットを探す。
         * 見つかった場合そのアセットを、そうでない場合 `undefined` を返す。
         * 通常、ゲーム開発者がファイルパスを扱うことはなく、このメソッドを呼び出す必要はない。
         * ディレクトリ内に package.json が存在する場合、package.json 自体もアセットとして
         * `liveAssetPathTable` から参照可能でなければならないことに注意。
         *
         * @param resolvedPath パス文字列
         * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
         */
        function findAssetByPathAsDirectory(resolvedPath, liveAssetPathTable) {
            var path;
            path = resolvedPath + "/package.json";
            if (liveAssetPathTable.hasOwnProperty(path) && liveAssetPathTable[path] instanceof g.TextAsset) {
                var pkg = JSON.parse(liveAssetPathTable[path].data);
                if (pkg && typeof pkg.main === "string") {
                    var asset = Util.findAssetByPathAsFile(g.PathUtil.resolvePath(resolvedPath, pkg.main), liveAssetPathTable);
                    if (asset)
                        return asset;
                }
            }
            path = resolvedPath + "/index.js";
            if (liveAssetPathTable.hasOwnProperty(path))
                return liveAssetPathTable[path];
            return undefined;
        }
        Util.findAssetByPathAsDirectory = findAssetByPathAsDirectory;
        /**
         * idx文字目の文字のchar codeを返す。
         *
         * これはString#charCodeAt()と次の点で異なる。
         * - idx文字目が上位サロゲートの時これを16bit左シフトし、idx+1文字目の下位サロゲートと論理和をとった値を返す。
         * - idx文字目が下位サロゲートの時nullを返す。
         *
         * @param str 文字を取り出される文字列
         * @param idx 取り出される文字の位置
         */
        // highly based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
        function charCodeAt(str, idx) {
            var code = str.charCodeAt(idx);
            if (0xD800 <= code && code <= 0xDBFF) {
                var hi = code;
                var low = str.charCodeAt(idx + 1);
                return (hi << 16) | low;
            }
            if (0xDC00 <= code && code <= 0xDFFF) {
                return null;
            }
            return code;
        }
        Util.charCodeAt = charCodeAt;
        /**
         * サーフェスのアニメーティングイベントへのハンドラ登録。
         *
         * これはゲームエンジンが利用するものであり、ゲーム開発者が呼び出す必要はない。
         *
         * @param animatingHandler アニメーティングハンドラ
         * @param surface サーフェス
         */
        function setupAnimatingHandler(animatingHandler, surface) {
            if (surface.isDynamic) {
                surface.animatingStarted.add(animatingHandler._onAnimatingStarted, animatingHandler);
                surface.animatingStopped.add(animatingHandler._onAnimatingStopped, animatingHandler);
                if (surface.isPlaying()) {
                    animatingHandler._onAnimatingStarted();
                }
            }
        }
        Util.setupAnimatingHandler = setupAnimatingHandler;
        /**
         * アニメーティングハンドラを別のサーフェスへ移動する。
         *
         * これはゲームエンジンが利用するものであり、ゲーム開発者が呼び出す必要はない。
         *
         * @param animatingHandler アニメーティングハンドラ
         * @param beforeSurface ハンドラ登録を解除するサーフェス
         * @param afterSurface ハンドラを登録するサーフェス
         */
        function migrateAnimatingHandler(animatingHandler, beforeSurface, afterSurface) {
            animatingHandler._onAnimatingStopped();
            if (!beforeSurface.destroyed() && beforeSurface.isDynamic) {
                beforeSurface.animatingStarted.remove(animatingHandler._onAnimatingStarted, animatingHandler);
                beforeSurface.animatingStopped.remove(animatingHandler._onAnimatingStopped, animatingHandler);
            }
            if (afterSurface.isDynamic) {
                afterSurface.animatingStarted.add(animatingHandler._onAnimatingStarted, animatingHandler);
                afterSurface.animatingStopped.add(animatingHandler._onAnimatingStopped, animatingHandler);
                if (afterSurface.isPlaying()) {
                    animatingHandler._onAnimatingStarted();
                }
            }
        }
        Util.migrateAnimatingHandler = migrateAnimatingHandler;
    })(Util = g.Util || (g.Util = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * オブジェクトの衝突を表す。
     * - 矩形交差による衝突
     * - 2点間の距離による衝突
     */
    var Collision;
    (function (Collision) {
        /**
         * 矩形交差による衝突判定を行い、その結果を返す。
         * 戻り値は、矩形t1, t2が交差しているとき真、でなければ偽。
         * @param {number} x1 t1-X
         * @param {number} y1 t1-Y
         * @param {number} width1 t1幅
         * @param {number} height1 t1高さ
         * @param {number} x2 t2-X
         * @param {number} y2 t2-Y
         * @param {number} width2 t2幅
         * @param {number} height2 t2高さ
         */
        function intersect(x1, y1, width1, height1, x2, y2, width2, height2) {
            return (x1 <= x2 + width2) && (x2 <= x1 + width1)
                && (y1 <= y2 + height2) && (y2 <= y1 + height1);
        }
        Collision.intersect = intersect;
        /**
         * 矩形交差による衝突判定を行い、その結果を返す。
         * 戻り値は、矩形t1, t2が交差しているとき真、でなければ偽。
         * @param {CommonArea} t1 矩形1
         * @param {CommonArea} t2 矩形2
         */
        function intersectAreas(t1, t2) {
            return Collision.intersect(t1.x, t1.y, t1.width, t1.height, t2.x, t2.y, t2.width, t2.height);
        }
        Collision.intersectAreas = intersectAreas;
        /**
         * 2点間の距離による衝突判定を行い、その結果を返す。
         * 戻り値は、2点間の距離が閾値以内であるとき真、でなければ偽。
         * @param {number} t1x t1-X
         * @param {number} t1y t1-X
         * @param {number} t2x t1-X
         * @param {number} t2y t1-X
         * @param {number} [distance=1] 衝突判定閾値 [pixel]
         */
        function within(t1x, t1y, t2x, t2y, distance) {
            if (distance === void 0) { distance = 1; }
            return distance >= g.Util.distance(t1x, t1y, t2x, t2y);
        }
        Collision.within = within;
        /**
         * 2つの矩形の中心座標間距離による衝突判定を行い、その結果を返す。
         * 戻り値は、2点間の距離が閾値以内であるとき真、でなければ偽。
         * @param {CommonArea} t1 矩形1
         * @param {CommonArea} t2 矩形2
         * @param {number} [distance=1] 衝突判定閾値 [pixel]
         */
        function withinAreas(t1, t2, distance) {
            if (distance === void 0) { distance = 1; }
            return distance >= g.Util.distanceBetweenAreas(t1, t2);
        }
        Collision.withinAreas = withinAreas;
    })(Collision = g.Collision || (g.Collision = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * イベント通知機構クラス。
     */
    var Trigger = (function () {
        function Trigger() {
            this._handlers = [];
            this.length = 0;
        }
        Trigger.prototype.add = function (paramsOrFunc, owner) {
            if (typeof paramsOrFunc === "function") {
                this._handlers.push({
                    func: paramsOrFunc,
                    owner: owner,
                    once: false,
                    name: undefined
                });
            }
            else {
                var params = paramsOrFunc;
                if (typeof params.index === "number") {
                    this._handlers.splice(params.index, 0, {
                        func: params.func,
                        owner: params.owner,
                        once: false,
                        name: params.name
                    });
                }
                else {
                    this._handlers.push({
                        func: params.func,
                        owner: params.owner,
                        once: false,
                        name: params.name
                    });
                }
            }
            this.length = this._handlers.length;
        };
        Trigger.prototype.addOnce = function (paramsOrFunc, owner) {
            if (typeof paramsOrFunc === "function") {
                this._handlers.push({
                    func: paramsOrFunc,
                    owner: owner,
                    once: true,
                    name: undefined
                });
            }
            else {
                var params = paramsOrFunc;
                if (typeof params.index === "number") {
                    this._handlers.splice(params.index, 0, {
                        func: params.func,
                        owner: params.owner,
                        once: true,
                        name: params.name
                    });
                }
                else {
                    this._handlers.push({
                        func: params.func,
                        owner: params.owner,
                        once: true,
                        name: params.name
                    });
                }
            }
            this.length = this._handlers.length;
        };
        /**
         * このTriggerにハンドラを追加する。
         * @deprecated 互換性のために残されている。代わりに `add()` を利用すべきである。実装の変化のため、 `func` が `boolean` を返した時の動作はサポートされていない。
         */
        Trigger.prototype.handle = function (owner, func, name) {
            this.add(func ? { owner: owner, func: func, name: name } : { func: owner });
        };
        /**
         * このTriggerを発火する。
         *
         * 登録された全ハンドラの関数を、引数 `arg` を与えて呼び出す。
         * 呼び出し後、次のいずれかの条件を満たす全ハンドラの登録は解除される。
         * * ハンドラが `addOnce()` で登録されていた場合
         * * ハンドラが `add()` で登録される際に `once: true` オプションが与えられていた場合
         * * 関数がtruthyな値を返した場合
         *
         * @param arg ハンドラに与えられる引数
         */
        Trigger.prototype.fire = function (arg) {
            if (!this._handlers || !this._handlers.length)
                return;
            var handlers = this._handlers.concat();
            for (var i = 0; i < handlers.length; i++) {
                var handler = handlers[i];
                if (handler.func.call(handler.owner, arg) || handler.once) {
                    var index = this._handlers.indexOf(handler);
                    if (index !== -1)
                        this._handlers.splice(index, 1);
                }
            }
            if (this._handlers)
                this.length = this._handlers.length;
        };
        Trigger.prototype.contains = function (paramsOrFunc, owner) {
            var condition = typeof paramsOrFunc === "function" ? { func: paramsOrFunc, owner: owner } : paramsOrFunc;
            for (var i = 0; i < this._handlers.length; i++) {
                if (this._comparePartial(condition, this._handlers[i])) {
                    return true;
                }
            }
            return false;
        };
        Trigger.prototype.remove = function (paramsOrFunc, owner) {
            var condition = typeof paramsOrFunc === "function" ? { func: paramsOrFunc, owner: owner } : paramsOrFunc;
            for (var i = 0; i < this._handlers.length; i++) {
                var handler = this._handlers[i];
                if (condition.func === handler.func && condition.owner === handler.owner && condition.name === handler.name) {
                    this._handlers.splice(i, 1);
                    --this.length;
                    return;
                }
            }
        };
        /**
         * 指定した条件に部分一致するイベントハンドラを削除する。
         *
         * 本メソッドは引数に与えた条件に一致したイベントハンドラを全て削除する。
         * 引数の条件を一部省略した場合、その値の内容が登録時と異なっていても対象のイベントハンドラは削除される。
         * 引数に与えた条件と完全に一致したイベントハンドラのみを削除したい場合は `this.remove()` を用いる。
         * 引数を省略した場合は全てのイベントハンドラを削除する。
         *
         * @param params 削除するイベントハンドラの条件
         */
        Trigger.prototype.removeAll = function (params) {
            var handlers = [];
            if (params) {
                for (var i = 0; i < this._handlers.length; i++) {
                    var handler = this._handlers[i];
                    if (!this._comparePartial(params, handler)) {
                        handlers.push(handler);
                    }
                }
            }
            this._handlers = handlers;
            this.length = this._handlers.length;
        };
        /**
         * このTriggerを破棄する。
         */
        Trigger.prototype.destroy = function () {
            this._handlers = null;
            this.length = null;
        };
        /**
         * このTriggerが破棄されているかを返す。
         */
        Trigger.prototype.destroyed = function () {
            return this._handlers === null;
        };
        /**
         * @private
         */
        Trigger.prototype._comparePartial = function (target, compare) {
            if (target.func !== undefined && target.func !== compare.func)
                return false;
            if (target.owner !== undefined && target.owner !== compare.owner)
                return false;
            if (target.name !== undefined && target.name !== compare.name)
                return false;
            return true;
        };
        return Trigger;
    }());
    g.Trigger = Trigger;
    /**
     * 他のTriggerに反応して発火するイベント通知機構。
     */
    var ChainTrigger = (function (_super) {
        __extends(ChainTrigger, _super);
        /**
         * `ChainTrigger` のインスタンスを生成する。
         *
         * このインスタンスは、 `chain` がfireされたときに `filter` を実行し、真を返した場合に自身をfireする。
         * @param chain このインスタンスがfireするきっかけとなる Trigger
         * @param filter `chain` がfireされたときに実行される関数。省略された場合、または本関数の戻り値が真の場合、このインスタンスをfireする。
         * @param filterOwner `filter` 呼び出し時に使われる `this` の値。
         */
        function ChainTrigger(chain, filter, filterOwner) {
            var _this = _super.call(this) || this;
            _this.chain = chain;
            _this.filter = filter;
            _this.filterOwner = filterOwner;
            _this._isActivated = false;
            return _this;
        }
        ChainTrigger.prototype.add = function (paramsOrHandler, owner) {
            _super.prototype.add.call(this, paramsOrHandler, owner);
            if (!this._isActivated) {
                this.chain.add(this._onChainTriggerFired, this);
                this._isActivated = true;
            }
        };
        ChainTrigger.prototype.addOnce = function (paramsOrHandler, owner) {
            _super.prototype.addOnce.call(this, paramsOrHandler, owner);
            if (!this._isActivated) {
                this.chain.add(this._onChainTriggerFired, this);
                this._isActivated = true;
            }
        };
        ChainTrigger.prototype.remove = function (paramsOrFunc, owner) {
            _super.prototype.remove.call(this, paramsOrFunc, owner);
            if (this.length === 0 && this._isActivated) {
                this.chain.remove(this._onChainTriggerFired, this);
                this._isActivated = false;
            }
        };
        ChainTrigger.prototype.removeAll = function (params) {
            _super.prototype.removeAll.call(this, params);
            if (this.length === 0 && this._isActivated) {
                this.chain.remove(this._onChainTriggerFired, this);
                this._isActivated = false;
            }
        };
        ChainTrigger.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.chain.remove(this._onChainTriggerFired, this);
            this.filter = null;
            this.filterOwner = null;
            this._isActivated = false;
        };
        /**
         * @private
         */
        ChainTrigger.prototype._onChainTriggerFired = function (args) {
            if (!this.filter || this.filter.call(this.filterOwner, args)) {
                this.fire(args);
            }
        };
        return ChainTrigger;
    }(Trigger));
    g.ChainTrigger = ChainTrigger;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 一定時間で繰り返される処理を表すタイマー。
     *
     * ゲーム開発者が本クラスのインスタンスを直接生成することはなく、
     * 通常はScene#setTimeout、Scene#setIntervalによって間接的に利用する。
     */
    var Timer = (function () {
        function Timer(interval, fps) {
            this.interval = interval;
            // NOTE: intervalが浮動小数の場合があるため念のため四捨五入する
            this._scaledInterval = Math.round(interval * fps);
            this.elapsed = new g.Trigger();
            this._scaledElapsed = 0;
        }
        Timer.prototype.tick = function () {
            // NOTE: 1000 / fps * fps = 1000
            this._scaledElapsed += 1000;
            while (this._scaledElapsed >= this._scaledInterval) {
                // NOTE: this.elapsed.fire()内でdestroy()される可能性があるため、destroyed()を判定する
                if (!this.elapsed) {
                    break;
                }
                this.elapsed.fire();
                this._scaledElapsed -= this._scaledInterval;
            }
        };
        Timer.prototype.canDelete = function () {
            return !this.elapsed || this.elapsed.length === 0;
        };
        Timer.prototype.destroy = function () {
            this.interval = undefined;
            this.elapsed.destroy();
            this.elapsed = undefined;
            this._scaledInterval = 0;
            this._scaledElapsed = 0;
        };
        Timer.prototype.destroyed = function () {
            return this.elapsed === undefined;
        };
        return Timer;
    }());
    g.Timer = Timer;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * `Scene#setTimeout` や `Scene#setInterval` の実行単位を表す。
     * ゲーム開発者が本クラスのインスタンスを直接生成することはなく、
     * 本クラスの機能を直接利用することはない。
     */
    var TimerIdentifier = (function () {
        function TimerIdentifier(timer, handler, handlerOwner, fired, firedOwner) {
            this._timer = timer;
            this._handler = handler;
            this._handlerOwner = handlerOwner;
            this._fired = fired;
            this._firedOwner = firedOwner;
            this._timer.elapsed.add(this._fire, this);
        }
        TimerIdentifier.prototype.destroy = function () {
            this._timer.elapsed.remove(this._fire, this);
            this._timer = undefined;
            this._handler = undefined;
            this._handlerOwner = undefined;
            this._fired = undefined;
            this._firedOwner = undefined;
        };
        TimerIdentifier.prototype.destroyed = function () {
            return this._timer === undefined;
        };
        /**
         * @private
         */
        TimerIdentifier.prototype._fire = function () {
            this._handler.call(this._handlerOwner);
            if (this._fired) {
                this._fired.call(this._firedOwner, this);
            }
        };
        return TimerIdentifier;
    }());
    g.TimerIdentifier = TimerIdentifier;
    /**
     * Timerを管理する機構を提供する。
     * ゲーム開発者が本クラスを利用する事はない。
     */
    var TimerManager = (function () {
        function TimerManager(trigger, fps) {
            this._timers = [];
            this._trigger = trigger;
            this._identifiers = [];
            this._fps = fps;
            this._registered = false;
        }
        TimerManager.prototype.destroy = function () {
            for (var i = 0; i < this._identifiers.length; ++i) {
                this._identifiers[i].destroy();
            }
            for (var i = 0; i < this._timers.length; ++i) {
                this._timers[i].destroy();
            }
            this._timers = undefined;
            this._trigger = undefined;
            this._identifiers = undefined;
            this._fps = undefined;
        };
        TimerManager.prototype.destroyed = function () {
            return this._timers === undefined;
        };
        /**
         * 定期間隔で処理を実行するTimerを作成する。
         * 本Timerはフレーム経過によって動作する疑似タイマーであるため、実時間の影響は受けない
         * @param interval Timerの実行間隔（ミリ秒）
         * @returns 作成したTimer
         */
        TimerManager.prototype.createTimer = function (interval) {
            if (!this._registered) {
                this._trigger.add(this._tick, this);
                this._registered = true;
            }
            if (interval < 0)
                throw g.ExceptionFactory.createAssertionError("TimerManager#createTimer: invalid interval");
            // NODE: intervalが0の場合に、Timer#tick()で無限ループとなるためintervalの最小値を1とする。
            if (interval < 1)
                interval = 1;
            // NOTE: Timerの_scaledElapsedと比較するため、this.fps倍した値を用いる
            // Math.min(1000 / this._fps * this.fps, interval * this._fps);
            var acceptableMargin = Math.min(1000, interval * this._fps);
            for (var i = 0; i < this._timers.length; ++i) {
                if (this._timers[i].interval === interval) {
                    if (this._timers[i]._scaledElapsed < acceptableMargin) {
                        return this._timers[i];
                    }
                }
            }
            var timer = new g.Timer(interval, this._fps);
            this._timers.push(timer);
            return timer;
        };
        /**
         * Timerを削除する。
         * @param timer 削除するTimer
         */
        TimerManager.prototype.deleteTimer = function (timer) {
            if (!timer.canDelete())
                return;
            var index = this._timers.indexOf(timer);
            if (index < 0)
                throw g.ExceptionFactory.createAssertionError("TimerManager#deleteTimer: can not find timer");
            this._timers.splice(index, 1);
            timer.destroy();
            if (!this._timers.length) {
                if (!this._registered)
                    throw g.ExceptionFactory.createAssertionError("TimerManager#deleteTimer: handler is not handled");
                this._trigger.remove(this._tick, this);
                this._registered = false;
            }
        };
        TimerManager.prototype.setTimeout = function (handler, milliseconds, owner) {
            var timer = this.createTimer(milliseconds);
            var identifier = new TimerIdentifier(timer, handler, owner, this._onTimeoutFired, this);
            this._identifiers.push(identifier);
            return identifier;
        };
        TimerManager.prototype.clearTimeout = function (identifier) {
            this._clear(identifier);
        };
        TimerManager.prototype.setInterval = function (handler, interval, owner) {
            var timer = this.createTimer(interval);
            var identifier = new TimerIdentifier(timer, handler, owner);
            this._identifiers.push(identifier);
            return identifier;
        };
        TimerManager.prototype.clearInterval = function (identifier) {
            this._clear(identifier);
        };
        /**
         * すべてのTimerを時間経過させる。
         * @private
         */
        TimerManager.prototype._tick = function () {
            var timers = this._timers.concat();
            for (var i = 0; i < timers.length; ++i)
                timers[i].tick();
        };
        /**
         * @private
         */
        TimerManager.prototype._onTimeoutFired = function (identifier) {
            var index = this._identifiers.indexOf(identifier);
            if (index < 0)
                throw g.ExceptionFactory.createAssertionError("TimerManager#_onTimeoutFired: can not find identifier");
            this._identifiers.splice(index, 1);
            var timer = identifier._timer;
            identifier.destroy();
            this.deleteTimer(timer);
        };
        /**
         * @private
         */
        TimerManager.prototype._clear = function (identifier) {
            var index = this._identifiers.indexOf(identifier);
            if (index < 0)
                throw g.ExceptionFactory.createAssertionError("TimerManager#_clear: can not find identifier");
            if (identifier.destroyed())
                throw g.ExceptionFactory.createAssertionError("TimerManager#_clear: invalid identifier");
            this._identifiers.splice(index, 1);
            var timer = identifier._timer;
            identifier.destroy();
            this.deleteTimer(timer);
        };
        return TimerManager;
    }());
    g.TimerManager = TimerManager;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * サウンド再生を行うクラス。
     *
     * 本クラスのインスタンスは、 `AudioSystem#createPlayer()` によって明示的に、
     * または `AudioAsset#play()` によって暗黙的に生成される。
     * ゲーム開発者は本クラスのインスタンスを直接生成すべきではない。
     */
    var AudioPlayer = (function () {
        /**
         * `AudioPlayer` のインスタンスを生成する。
         */
        function AudioPlayer(system) {
            this.played = new g.Trigger();
            this.stopped = new g.Trigger();
            this.currentAudio = undefined;
            this.volume = system.volume;
            this._muted = system._muted;
            this._playbackRate = system._playbackRate;
            this._system = system;
        }
        /**
         * `AudioAsset` を再生する。
         *
         * 再生後、 `this.played` がfireされる。
         * @param audio 再生するオーディオアセット
         */
        AudioPlayer.prototype.play = function (audio) {
            this.currentAudio = audio;
            this.played.fire({
                player: this,
                audio: audio
            });
        };
        /**
         * 再生を停止する。
         *
         * 停止後、 `this.stopped` がfireされる。
         * 再生中でない場合、何もしない(`stopped` もfireされない)。
         */
        AudioPlayer.prototype.stop = function () {
            var audio = this.currentAudio;
            if (!audio)
                return;
            this.currentAudio = undefined;
            this.stopped.fire({
                player: this,
                audio: audio
            });
        };
        /**
         * 音声の終了を検知できるか否か。
         * 通常、ゲーム開発者がこのメソッドを利用する必要はない。
         */
        AudioPlayer.prototype.canHandleStopped = function () {
            return true;
        };
        /**
         * 音量を変更する。
         *
         * @param volume 音量。0以上1.0以下でなければならない
         */
        // エンジンユーザが `AudioPlayer` の派生クラスを実装する場合は、
        // `_changeMuted()` などと同様、このメソッドをオーバーライドして実際に音量を変更する処理を行うこと。
        // オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
        AudioPlayer.prototype.changeVolume = function (volume) {
            this.volume = volume;
        };
        /**
         * ミュート状態を変更する。
         *
         * エンジンユーザが `AudioPlayer` の派生クラスを実装する場合は、
         * このメソッドをオーバーライドして実際にミュート状態を変更する処理を行うこと。
         * オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
         *
         * @param muted ミュート状態にするか否か
         * @private
         */
        AudioPlayer.prototype._changeMuted = function (muted) {
            this._muted = muted;
        };
        /**
         * 再生速度を変更する。
         *
         * エンジンユーザが `AudioPlayer` の派生クラスを実装し、
         * かつ `this._supportsPlaybackRate()` をオーバライドして真を返すようにするならば、
         * このメソッドもオーバーライドして実際に再生速度を変更する処理を行うこと。
         * オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
         *
         * @param rate 再生速度の倍率。0以上でなければならない。1.0で等倍である。
         * @private
         */
        AudioPlayer.prototype._changePlaybackRate = function (rate) {
            this._playbackRate = rate;
        };
        /**
         * 再生速度の変更に対応するか否か。
         *
         * エンジンユーザが `AudioPlayer` の派生クラスを実装し、
         * 再生速度の変更に対応する場合、このメソッドをオーバーライドして真を返さねばならない。
         * その場合 `_changePlaybackRate()` もオーバーライドし、実際の再生速度変更処理を実装しなければならない。
         *
         * なおここで「再生速度の変更に対応する」は、任意の速度で実際に再生できることを意味しない。
         * 実装は等倍速 (再生速度1.0) で実際に再生できなければならない。
         * しかしそれ以外の再生速度が指定された場合、実装はまるで音量がゼロであるかのように振舞ってもよい。
         *
         * このメソッドが偽を返す場合、エンジンは音声の非等倍速度再生に対するデフォルトの処理を実行する。
         * @private
         */
        AudioPlayer.prototype._supportsPlaybackRate = function () {
            return false;
        };
        /**
         * 音量の変更を通知する。
         * @deprecated このメソッドは実験的に導入されたが、利用されていない。将来的に削除される。
         */
        AudioPlayer.prototype._onVolumeChanged = function () {
            // nothing to do
        };
        return AudioPlayer;
    }());
    g.AudioPlayer = AudioPlayer;
})(g || (g = {}));
var g;
(function (g) {
    var AudioSystem = (function () {
        function AudioSystem(id, game) {
            var audioSystemManager = game._audioSystemManager;
            this.id = id;
            this.game = game;
            this._volume = 1;
            this._destroyRequestedAssets = {};
            this._muted = audioSystemManager._muted;
            this._playbackRate = audioSystemManager._playbackRate;
        }
        Object.defineProperty(AudioSystem.prototype, "volume", {
            // volumeの変更時には通知が必要なのでアクセサを使う。
            // 呼び出し頻度が少ないため許容。
            get: function () {
                return this._volume;
            },
            set: function (value) {
                if (value < 0 || value > 1 || isNaN(value) || typeof value !== "number")
                    throw g.ExceptionFactory.createAssertionError("AudioSystem#volume: expected: 0.0-1.0, actual: " + value);
                this._volume = value;
                this._onVolumeChanged();
            },
            enumerable: true,
            configurable: true
        });
        AudioSystem.prototype.requestDestroy = function (asset) {
            this._destroyRequestedAssets[asset.id] = asset;
        };
        /**
         * @private
         */
        AudioSystem.prototype._reset = function () {
            this.stopAll();
            this._volume = 1;
            this._destroyRequestedAssets = {};
            this._muted = this.game._audioSystemManager._muted;
            this._playbackRate = this.game._audioSystemManager._playbackRate;
        };
        /**
         * @private
         */
        AudioSystem.prototype._setMuted = function (value) {
            var before = this._muted;
            this._muted = !!value;
            if (this._muted !== before) {
                this._onMutedChanged();
            }
        };
        /**
         * @private
         */
        AudioSystem.prototype._setPlaybackRate = function (value) {
            if (value < 0 || isNaN(value) || typeof value !== "number")
                throw g.ExceptionFactory.createAssertionError("AudioSystem#playbackRate: expected: greater or equal to 0.0, actual: " + value);
            var before = this._playbackRate;
            this._playbackRate = value;
            if (this._playbackRate !== before) {
                this._onPlaybackRateChanged();
            }
        };
        return AudioSystem;
    }());
    g.AudioSystem = AudioSystem;
    var MusicAudioSystem = (function (_super) {
        __extends(MusicAudioSystem, _super);
        function MusicAudioSystem(id, game) {
            var _this = _super.call(this, id, game) || this;
            _this._player = undefined;
            _this._suppressingAudio = undefined;
            return _this;
        }
        Object.defineProperty(MusicAudioSystem.prototype, "player", {
            // Note: 音楽のないゲームの場合に無駄なインスタンスを作るのを避けるため、アクセサを使う
            get: function () {
                if (!this._player) {
                    this._player = this.game.resourceFactory.createAudioPlayer(this);
                    this._player.played.handle(this, this._onPlayerPlayed);
                    this._player.stopped.handle(this, this._onPlayerStopped);
                }
                return this._player;
            },
            set: function (v) {
                this._player = v;
            },
            enumerable: true,
            configurable: true
        });
        MusicAudioSystem.prototype.findPlayers = function (asset) {
            if (this.player.currentAudio && this.player.currentAudio.id === asset.id)
                return [this.player];
            return [];
        };
        MusicAudioSystem.prototype.createPlayer = function () {
            return this.player;
        };
        MusicAudioSystem.prototype.stopAll = function () {
            if (!this._player)
                return;
            this._player.stop();
        };
        /**
         * @private
         */
        MusicAudioSystem.prototype._reset = function () {
            _super.prototype._reset.call(this);
            if (this._player) {
                this._player.played.remove({ owner: this, func: this._onPlayerPlayed });
                this._player.stopped.remove({ owner: this, func: this._onPlayerStopped });
            }
            this._player = undefined;
            this._suppressingAudio = undefined;
        };
        /**
         * @private
         */
        MusicAudioSystem.prototype._onVolumeChanged = function () {
            this.player.changeVolume(this._volume);
        };
        /**
         * @private
         */
        MusicAudioSystem.prototype._onMutedChanged = function () {
            this.player._changeMuted(this._muted);
        };
        /**
         * @private
         */
        MusicAudioSystem.prototype._onPlaybackRateChanged = function () {
            var player = this.player;
            player._changePlaybackRate(this._playbackRate);
            if (!player._supportsPlaybackRate()) {
                this._onUnsupportedPlaybackRateChanged();
            }
        };
        /**
         * @private
         */
        MusicAudioSystem.prototype._onUnsupportedPlaybackRateChanged = function () {
            // 再生速度非対応の場合のフォールバック: 鳴らそうとしてミュートしていた音があれば鳴らし直す
            if (this._playbackRate === 1.0) {
                if (this._suppressingAudio) {
                    var audio = this._suppressingAudio;
                    this._suppressingAudio = undefined;
                    if (!audio.destroyed()) {
                        this.player._changeMuted(false);
                    }
                }
            }
        };
        /**
         * @private
         */
        MusicAudioSystem.prototype._onPlayerPlayed = function (e) {
            if (e.player !== this._player)
                throw g.ExceptionFactory.createAssertionError("MusicAudioSystem#_onPlayerPlayed: unexpected audio player");
            if (e.player._supportsPlaybackRate())
                return;
            // 再生速度非対応の場合のフォールバック: 鳴らさず即ミュートにする
            if (this._playbackRate !== 1.0) {
                e.player._changeMuted(true);
                this._suppressingAudio = e.audio;
            }
        };
        /**
         * @private
         */
        MusicAudioSystem.prototype._onPlayerStopped = function (e) {
            if (this._suppressingAudio) {
                this._suppressingAudio = undefined;
                this.player._changeMuted(false);
            }
            if (this._destroyRequestedAssets[e.audio.id]) {
                delete this._destroyRequestedAssets[e.audio.id];
                e.audio.destroy();
            }
        };
        return MusicAudioSystem;
    }(AudioSystem));
    g.MusicAudioSystem = MusicAudioSystem;
    var SoundAudioSystem = (function (_super) {
        __extends(SoundAudioSystem, _super);
        function SoundAudioSystem(id, game) {
            var _this = _super.call(this, id, game) || this;
            _this.players = [];
            return _this;
        }
        SoundAudioSystem.prototype.createPlayer = function () {
            var player = this.game.resourceFactory.createAudioPlayer(this);
            if (player.canHandleStopped())
                this.players.push(player);
            player.played.handle(this, this._onPlayerPlayed);
            player.stopped.handle(this, this._onPlayerStopped);
            return player;
        };
        SoundAudioSystem.prototype.findPlayers = function (asset) {
            var ret = [];
            for (var i = 0; i < this.players.length; ++i) {
                if (this.players[i].currentAudio && this.players[i].currentAudio.id === asset.id)
                    ret.push(this.players[i]);
            }
            return ret;
        };
        SoundAudioSystem.prototype.stopAll = function () {
            var players = this.players.concat();
            for (var i = 0; i < players.length; ++i) {
                players[i].stop(); // auto remove
            }
        };
        /**
         * @private
         */
        SoundAudioSystem.prototype._reset = function () {
            _super.prototype._reset.call(this);
            for (var i = 0; i < this.players.length; ++i) {
                var player = this.players[i];
                player.played.remove({ owner: this, func: this._onPlayerPlayed });
                player.stopped.remove({ owner: this, func: this._onPlayerStopped });
            }
            this.players = [];
        };
        /**
         * @private
         */
        SoundAudioSystem.prototype._onMutedChanged = function () {
            var players = this.players;
            for (var i = 0; i < players.length; ++i) {
                players[i]._changeMuted(this._muted);
            }
        };
        /**
         * @private
         */
        SoundAudioSystem.prototype._onPlaybackRateChanged = function () {
            var players = this.players;
            for (var i = 0; i < players.length; ++i) {
                players[i]._changePlaybackRate(this._playbackRate);
            }
        };
        /**
         * @private
         */
        SoundAudioSystem.prototype._onPlayerPlayed = function (e) {
            if (e.player._supportsPlaybackRate())
                return;
            // 再生速度非対応の場合のフォールバック: 鳴らさず即止める
            if (this._playbackRate !== 1.0) {
                e.player.stop();
            }
        };
        /**
         * @private
         */
        SoundAudioSystem.prototype._onPlayerStopped = function (e) {
            var index = this.players.indexOf(e.player);
            if (index < 0)
                return;
            e.player.stopped.remove({ owner: this, func: this._onPlayerStopped });
            this.players.splice(index, 1);
            if (this._destroyRequestedAssets[e.audio.id]) {
                delete this._destroyRequestedAssets[e.audio.id];
                e.audio.destroy();
            }
        };
        /**
         * @private
         */
        SoundAudioSystem.prototype._onVolumeChanged = function () {
            for (var i = 0; i < this.players.length; ++i) {
                this.players[i].changeVolume(this._volume);
            }
        };
        return SoundAudioSystem;
    }(AudioSystem));
    g.SoundAudioSystem = SoundAudioSystem;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * ビデオ再生を行うクラス。
     *
     * ゲーム開発者は本クラスのインスタンスを直接生成すべきではない。
     */
    var VideoPlayer = (function () {
        /**
         * `VideoPlayer` のインスタンスを生成する。
         */
        function VideoPlayer(loop) {
            this._loop = !!loop;
            this.played = new g.Trigger();
            this.stopped = new g.Trigger();
            this.currentVideo = undefined;
            this.volume = 1.0;
        }
        /**
         * `VideoAsset` を再生する。
         *
         * 再生後、 `this.played` がfireされる。
         * @param Video 再生するビデオアセット
         */
        VideoPlayer.prototype.play = function (videoAsset) {
            this.currentVideo = videoAsset;
            this.played.fire({
                player: this,
                video: videoAsset
            });
            videoAsset.asSurface().animatingStarted.fire();
        };
        /**
         * 再生を停止する。
         *
         * 再生中でない場合、何もしない。
         * 停止後、 `this.stopped` がfireされる。
         */
        VideoPlayer.prototype.stop = function () {
            var videoAsset = this.currentVideo;
            this.stopped.fire({
                player: this,
                video: videoAsset
            });
            videoAsset.asSurface().animatingStopped.fire();
        };
        /**
         * 音量を変更する。
         *
         * エンジンユーザが `VideoPlayer` の派生クラスを実装する場合は、
         *  このメソッドをオーバーライドして実際に音量を変更する処理を行うこと。
         *  オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
         * @param volume 音量。0以上1.0以下でなければならない
         */
        VideoPlayer.prototype.changeVolume = function (volume) {
            this.volume = volume;
        };
        return VideoPlayer;
    }());
    g.VideoPlayer = VideoPlayer;
})(g || (g = {}));
var g;
(function (g) {
    // 将来 VideoPlayerインスタンスの一元管理（ボリューム設定などAudioSystemと似た役割）
    // を担うクラス。VideoAssetはVideoSystemを持つという体裁を整えるために(中身が空であるが)
    // 定義されている。
    // TODO: 実装
    var VideoSystem = (function () {
        function VideoSystem() {
        }
        return VideoSystem;
    }());
    g.VideoSystem = VideoSystem;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 二次元の幾何的オブジェクト。位置とサイズ (に加えて傾きや透明度も) を持つ。
     * ゲーム開発者は `E` を使えばよく、通常このクラスを意識する必要はない。
     */
    var Object2D = (function () {
        function Object2D(param) {
            if (!param) {
                this.x = 0;
                this.y = 0;
                this.width = 0;
                this.height = 0;
                this.opacity = 1;
                this.scaleX = 1;
                this.scaleY = 1;
                this.angle = 0;
                this.compositeOperation = undefined;
                this._matrix = undefined;
            }
            else {
                this.x = param.x || 0;
                this.y = param.y || 0;
                this.width = param.width || 0;
                this.height = param.height || 0;
                this.opacity = "opacity" in param ? param.opacity : 1;
                this.scaleX = "scaleX" in param ? param.scaleX : 1;
                this.scaleY = "scaleY" in param ? param.scaleY : 1;
                this.angle = param.angle || 0;
                this.compositeOperation = param.compositeOperation;
                this._matrix = undefined;
            }
        }
        Object2D.prototype.moveTo = function (posOrX, y) {
            if (typeof posOrX === "number" && typeof y !== "number") {
                throw g.ExceptionFactory.createAssertionError("Object2D#moveTo: arguments must be CommonOffset or pair of x and y as a number.");
            }
            if (typeof posOrX === "number") {
                this.x = posOrX;
                this.y = y;
            }
            else {
                this.x = posOrX.x;
                this.y = posOrX.y;
            }
        };
        /**
         * オブジェクトを相対的に移動する。
         * このメソッドは `x` と `y` を同時に加算するためのユーティリティメソッドである。
         * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
         * @param x X座標に加算する値
         * @param y Y座標に加算する値
         */
        Object2D.prototype.moveBy = function (x, y) {
            this.x += x;
            this.y += y;
        };
        Object2D.prototype.resizeTo = function (sizeOrWidth, height) {
            if (typeof sizeOrWidth === "number" && typeof height !== "number") {
                throw g.ExceptionFactory.createAssertionError("Object2D#resizeTo: arguments must be CommonSize or pair of width and height as a number.");
            }
            if (typeof sizeOrWidth === "number") {
                this.width = sizeOrWidth;
                this.height = height;
            }
            else {
                this.width = sizeOrWidth.width;
                this.height = sizeOrWidth.height;
            }
        };
        /**
         * オブジェクトのサイズを相対的に変更する。
         * このメソッドは `width` と `height` を同時に加算するためのユーティリティメソッドである。
         * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
         * @param width 加算する幅
         * @param height 加算する高さ
         */
        Object2D.prototype.resizeBy = function (width, height) {
            this.width += width;
            this.height += height;
        };
        /**
         * オブジェクトの拡大率を設定する。
         * このメソッドは `scaleX` と `scaleY` に同じ値を同時に設定するためのユーティリティメソッドである。
         * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
         * @param scale 拡大率
         */
        Object2D.prototype.scale = function (scale) {
            this.scaleX = scale;
            this.scaleY = scale;
        };
        /**
         * このオブジェクトの変換行列を得る。
         */
        Object2D.prototype.getMatrix = function () {
            if (!this._matrix) {
                this._matrix = g.Util.createMatrix();
            }
            else if (!this._matrix._modified) {
                return this._matrix;
            }
            this._updateMatrix();
            this._matrix._modified = false;
            return this._matrix;
        };
        /**
         * 公開のプロパティから内部の変換行列キャッシュを更新する。
         * @private
         */
        Object2D.prototype._updateMatrix = function () {
            if (this.angle || this.scaleX !== 1 || this.scaleY !== 1) {
                this._matrix.update(this.width, this.height, this.scaleX, this.scaleY, this.angle, this.x, this.y);
            }
            else {
                this._matrix.reset(this.x, this.y);
            }
        };
        return Object2D;
    }());
    g.Object2D = Object2D;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * akashic-engineに描画される全てのエンティティを表す基底クラス。
     * 本クラス単体に描画処理にはなく、直接利用する場合はchildrenを利用したコンテナとして程度で利用される。
     */
    var E = (function (_super) {
        __extends(E, _super);
        /**
         * 各種パラメータを指定して `E` のインスタンスを生成する。
         * @param param 初期化に用いるパラメータのオブジェクト
         */
        function E(param) {
            var _this = _super.call(this, param) || this;
            _this.children = undefined;
            _this.parent = undefined;
            _this._touchable = false;
            _this.state = 0 /* None */;
            _this._hasTouchableChildren = false;
            _this._update = undefined;
            _this._message = undefined;
            _this._pointDown = undefined;
            _this._pointMove = undefined;
            _this._pointUp = undefined;
            _this._targetCameras = undefined;
            _this.tag = param.tag;
            _this.shaderProgram = param.shaderProgram;
            // local は Scene#register() や this.append() の呼び出しよりも先に立てなければならない
            // ローカルシーン・ローカルティック補間シーンのエンティティは強制的に local (ローカルティックが来て他プレイヤーとずれる可能性がある)
            _this.local = (param.scene.local !== g.LocalTickMode.NonLocal) || !!param.local;
            if (param.children) {
                for (var i = 0; i < param.children.length; ++i)
                    _this.append(param.children[i]);
            }
            if (param.parent) {
                param.parent.append(_this);
            }
            if (param.targetCameras)
                _this.targetCameras = param.targetCameras;
            if ("touchable" in param)
                _this.touchable = param.touchable;
            if (!!param.hidden)
                _this.hide();
            // set id, scene
            _this.id = param.id;
            param.scene.register(_this);
            return _this;
        }
        Object.defineProperty(E.prototype, "update", {
            /**
             * 時間経過イベント。本イベントの一度のfireにつき、常に1フレーム分の時間経過が起こる。
             */
            // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
            get: function () {
                if (!this._update)
                    this._update = new g.ChainTrigger(this.scene.update);
                return this._update;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(E.prototype, "message", {
            // updateは代入する必要がないのでsetterを定義しない
            /**
             * このエンティティのmessageイベント。
             */
            // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
            get: function () {
                if (!this._message)
                    this._message = new g.ChainTrigger(this.scene.message);
                return this._message;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(E.prototype, "pointDown", {
            // messageは代入する必要がないのでsetterを定義しない
            /**
             * このエンティティのpoint downイベント。
             */
            // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
            get: function () {
                if (!this._pointDown)
                    this._pointDown = new g.ChainTrigger(this.scene.pointDownCapture, this._isTargetOperation, this);
                return this._pointDown;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(E.prototype, "pointUp", {
            // pointDownは代入する必要がないのでsetterを定義しない
            /**
             * このエンティティのpoint upイベント。
             */
            // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
            get: function () {
                if (!this._pointUp)
                    this._pointUp = new g.ChainTrigger(this.scene.pointUpCapture, this._isTargetOperation, this);
                return this._pointUp;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(E.prototype, "pointMove", {
            // pointUpは代入する必要がないのでsetterを定義しない
            /**
             * このエンティティのpoint moveイベント。
             */
            // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
            get: function () {
                if (!this._pointMove)
                    this._pointMove = new g.ChainTrigger(this.scene.pointMoveCapture, this._isTargetOperation, this);
                return this._pointMove;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(E.prototype, "targetCameras", {
            // pointMoveは代入する必要がないのでsetterを定義しない
            /**
             * このエンティティを表示できるカメラの配列。
             *
             * 初期値は空配列である。
             * この値が `undefined` または空配列である場合、このエンティティとその子孫はカメラによらず描画される。
             * 空でない配列である場合、このエンティティとその子孫は、配列内に含まれるカメラでの描画の際にのみ表示される。
             *
             * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
             */
            // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
            get: function () {
                return this._targetCameras || (this._targetCameras = []);
            },
            set: function (v) {
                this._targetCameras = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(E.prototype, "touchable", {
            /**
             * プレイヤーにとって触れられるオブジェクトであるかを表す。
             *
             * この値が偽である場合、ポインティングイベントの対象にならない。
             * 初期値は `false` である。
             *
             * `E` の他のプロパティと異なり、この値の変更後に `this.modified()` を呼び出す必要はない。
             */
            get: function () {
                return this._touchable;
            },
            set: function (v) {
                if (this._touchable === v)
                    return;
                this._touchable = v;
                if (v) {
                    this._enableTouchPropagation();
                }
                else {
                    this._disableTouchPropagation();
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 自分自身と子孫の内容を描画する。
         *
         * このメソッドは、 `Renderer#draw()` からエンティティのツリー構造をトラバースする過程で暗黙に呼び出される。
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         * @param renderer 描画先に対するRenderer
         * @param camera 対象のカメラ。省略された場合、undefined
         */
        E.prototype.render = function (renderer, camera) {
            this.state &= ~4 /* Modified */;
            if (this.state & 1 /* Hidden */)
                return;
            var cams = this._targetCameras;
            if (cams && cams.length > 0 && (!camera || cams.indexOf(camera) === -1))
                return;
            if (this.state & 8 /* ContextLess */) {
                renderer.translate(this.x, this.y);
                var goDown = this.renderSelf(renderer, camera);
                if (goDown && this.children) {
                    var children = this.children;
                    var len = children.length;
                    for (var i = 0; i < len; ++i)
                        children[i].render(renderer, camera);
                }
                renderer.translate(-this.x, -this.y);
                return;
            }
            renderer.save();
            if (this.angle || this.scaleX !== 1 || this.scaleY !== 1) {
                // Note: this.scaleX/scaleYが0の場合描画した結果何も表示されない事になるが、特殊扱いはしない
                renderer.transform(this.getMatrix()._matrix);
            }
            else {
                // Note: 変形なしのオブジェクトはキャッシュもとらずtranslateのみで処理
                renderer.translate(this.x, this.y);
            }
            if (this.opacity !== 1)
                renderer.opacity(this.opacity);
            if (this.compositeOperation !== undefined)
                renderer.setCompositeOperation(this.compositeOperation);
            if (this.shaderProgram !== undefined && renderer.isSupportedShaderProgram())
                renderer.setShaderProgram(this.shaderProgram);
            var goDown = this.renderSelf(renderer, camera);
            if (goDown && this.children) {
                // Note: concatしていないのでunsafeだが、render中に配列の中身が変わる事はない前提とする
                var children = this.children;
                for (var i = 0; i < children.length; ++i)
                    children[i].render(renderer, camera);
            }
            renderer.restore();
        };
        /**
         * 自分自身の内容を描画する。
         *
         * このメソッドは、 `Renderer#draw()` からエンティティのツリー構造をトラバースする過程で暗黙に呼び出される。
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         *
         * 戻り値は、このエンティティの子孫の描画をスキップすべきであれば偽、でなければ真である。
         * (この値は、子孫の描画方法をカスタマイズする一部のサブクラスにおいて、通常の描画パスをスキップするために用いられる)
         *
         * @param renderer 描画先に対するRenderer
         * @param camera 対象のカメラ
         */
        E.prototype.renderSelf = function (renderer, camera) {
            // nothing to do
            return true;
        };
        /**
         * このエンティティが属する `Game` を返す。
         */
        E.prototype.game = function () {
            return this.scene.game;
        };
        /**
         * 子を追加する。
         *
         * @param e 子エンティティとして追加するエンティティ
         */
        E.prototype.append = function (e) {
            this.insertBefore(e, undefined);
        };
        /**
         * 子を挿入する。
         *
         * `target` が`this` の子でない場合、`append(e)` と同じ動作となる。
         *
         * @param e 子エンティティとして追加するエンティティ
         * @param target 挿入位置にある子エンティティ
         */
        E.prototype.insertBefore = function (e, target) {
            if (e.parent)
                e.remove();
            if (!this.children)
                this.children = [];
            e.parent = this;
            var index = -1;
            if (target !== undefined && (index = this.children.indexOf(target)) > -1) {
                this.children.splice(index, 0, e);
            }
            else {
                this.children.push(e);
            }
            if (e._touchable || e._hasTouchableChildren) {
                this._hasTouchableChildren = true;
                this._enableTouchPropagation();
            }
            this.modified(true);
        };
        /**
         * 子を削除する。
         *
         * `e` が `this` の子でない場合、 `AssertionError` がthrowされる。
         * `e === undefined` であり親がない場合、 `AssertionError` がthrowされる。
         *
         * @param e 削除する子エンティティ。省略された場合、自身を親から削除する
         */
        E.prototype.remove = function (e) {
            if (e === undefined) {
                this.parent.remove(this);
                return;
            }
            var index = this.children ? this.children.indexOf(e) : -1;
            if (index < 0)
                throw g.ExceptionFactory.createAssertionError("E#remove: invalid child");
            this.children[index].parent = undefined;
            this.children.splice(index, 1);
            if (e._touchable || e._hasTouchableChildren) {
                if (!this._findTouchableChildren(this)) {
                    this._hasTouchableChildren = false;
                    this._disableTouchPropagation();
                }
            }
            this.modified(true);
        };
        /**
         * このエンティティを破棄する。
         *
         * 親がある場合、親からは `remove()` される。
         * 子孫を持っている場合、子孫も破棄される。
         */
        E.prototype.destroy = function () {
            if (this.parent)
                this.remove();
            if (this.children) {
                // ここでchildrenはsliceせずに直接処理する: 仮にエンティティが動的に増えたとしても例外なくすべて破壊する
                // 万一destroyが子エンティティを減らさない場合 (サブクラスがこれをオーバーライドしてremoveもsuper.destroy()もしない時) 無限ループになるので注意
                while (this.children.length)
                    this.children[this.children.length - 1].destroy(); // 暗黙にremoveされるので不要なコピーを避けるため後ろから破壊する
                this.children = undefined;
            }
            // この解放はstringとforeachを使って書きたいが、minifyする時は.アクセスの方がいいのでやむを得ない
            if (this._update) {
                this._update.destroy();
                this._update = undefined;
            }
            if (this._message) {
                this._message.destroy();
                this._message = undefined;
            }
            if (this._pointDown) {
                this._pointDown.destroy();
                this._pointDown = undefined;
            }
            if (this._pointMove) {
                this._pointMove.destroy();
                this._pointMove = undefined;
            }
            if (this._pointUp) {
                this._pointUp.destroy();
                this._pointUp = undefined;
            }
            this.scene.unregister(this);
        };
        /**
         * このエンティティが破棄済みであるかを返す。
         */
        E.prototype.destroyed = function () {
            return this.scene === undefined;
        };
        /**
         * このエンティティに対する変更をエンジンに通知する。
         *
         * このメソッドの呼び出し後、 `this` に対する変更が各 `Renderer` の描画に反映される。
         * ただし逆は真ではない。すなわち、再描画は他の要因によって行われることもある。
         * ゲーム開発者は、このメソッドを呼び出していないことをもって再描画が行われていないことを仮定してはならない。
         *
         * 本メソッドは、このオブジェクトの `Object2D` 由来のプロパティ (`x`, `y`, `angle` など) を変更した場合にも呼びだす必要がある。
         * 本メソッドは、描画キャッシュの無効化処理を含まない。描画キャッシュを持つエンティティは、このメソッドとは別に `invalidate()` を提供している。
         * 描画キャッシュの無効化も必要な場合は、このメソッドではなくそちらを呼び出す必要がある。
         * @param isBubbling 通常ゲーム開発者が指定する必要はない。この変更通知が、(このエンティティ自身のみならず)子孫の変更の通知を含む場合、真を渡さなければならない。省略された場合、偽。
         */
        E.prototype.modified = function (isBubbling) {
            // _matrixの用途は描画に限らない(e.g. E#findPointSourceByPoint)ので、Modifiedフラグと無関係にクリアする必要がある
            if (this._matrix)
                this._matrix._modified = true;
            if (this.angle || this.scaleX !== 1 || this.scaleY !== 1 || this.opacity !== 1 || this.compositeOperation !== undefined ||
                this.shaderProgram !== undefined) {
                this.state &= ~8 /* ContextLess */;
            }
            else {
                this.state |= 8 /* ContextLess */;
            }
            if (this.state & 4 /* Modified */)
                return;
            this.state |= 4 /* Modified */;
            if (this.parent)
                this.parent.modified(true);
        };
        /**
         * このメソッドは、 `E#findPointSourceByPoint()` 内で子孫の探索をスキップすべきか判断するために呼ばれる。
         * 通常、子孫の描画方法をカスタマイズする一部のサブクラスにおいて、与えられた座標に対する子孫の探索を制御する場合に利用する。
         * ゲーム開発者がこのメソッドを呼び出す必要はない。
         *
         * 戻り値は、子孫の探索をスキップすべきであれば偽、でなければ真である。
         *
         * @param point このエンティティ（`this`）の位置を基準とした相対座標
         */
        E.prototype.shouldFindChildrenByPoint = function (point) {
            // nothing to do
            return true;
        };
        /**
         * 自身と自身の子孫の中で、その座標に反応する `PointSource` を返す。
         *
         * 戻り値は、対象が見つかった場合、 `target` に見つかったエンティティを持つ `PointSource` である。
         * 対象が見つからなかった場合、 `undefined` である。戻り値が `undefined` でない場合、その `target` プロパティは次を満たす:
         * - このエンティティ(`this`) またはその子孫である
         * - `E#touchable` が真である
         * - カメラ `camera` から可視である中で最も手前にある
         *
         * @param point 対象の座標
         * @param m `this` に適用する変換行列。省略された場合、単位行列
         * @param force touchable指定を無視する場合真を指定する。省略された場合、偽
         * @param camera 対象のカメラ。指定されなかった場合undefined
         */
        E.prototype.findPointSourceByPoint = function (point, m, force, camera) {
            if (this.state & 1 /* Hidden */)
                return undefined;
            var cams = this._targetCameras;
            if (cams && cams.length > 0 && (!camera || cams.indexOf(camera) === -1))
                return undefined;
            m = m ? m.multiplyNew(this.getMatrix()) : this.getMatrix().clone();
            var p = m.multiplyInverseForPoint(point);
            if (this._hasTouchableChildren || (force && this.children && this.children.length)) {
                if (this.shouldFindChildrenByPoint(p)) {
                    for (var i = this.children.length - 1; i >= 0; --i) {
                        var child = this.children[i];
                        if (force || child._touchable || child._hasTouchableChildren) {
                            var target = child.findPointSourceByPoint(point, m, force, camera);
                            if (target)
                                return target;
                        }
                    }
                }
            }
            if (!(force || this._touchable))
                return undefined;
            // 逆行列をポイントにかけた結果がEにヒットしているかを計算
            if (0 <= p.x && this.width > p.x && 0 <= p.y && this.height > p.y) {
                return {
                    target: this,
                    point: p
                };
            }
            return undefined;
        };
        /**
         * このEが表示状態であるかどうかを返す。
         */
        E.prototype.visible = function () {
            return (this.state & 1 /* Hidden */) !== 1 /* Hidden */;
        };
        /**
         * このEを表示状態にする。
         *
         * `this.hide()` によって非表示状態にされたエンティティを表示状態に戻す。
         * 生成直後のエンティティは表示状態であり、 `hide()` を呼び出さない限りこのメソッドを呼び出す必要はない。
         */
        E.prototype.show = function () {
            if (!(this.state & 1 /* Hidden */))
                return;
            this.state &= ~1 /* Hidden */;
            if (this.parent) {
                this.parent.modified(true);
            }
        };
        /**
         * このEを非表示状態にする。
         *
         * `this.show()` が呼ばれるまでの間、このエンティティは各 `Renderer` によって描画されない。
         * また `Game#findPointSource()` で返されることもなくなる。
         * `this#pointDown`, `pointMove`, `pointUp` なども通常の方法ではfireされなくなる。
         */
        E.prototype.hide = function () {
            if (this.state & 1 /* Hidden */)
                return;
            this.state |= 1 /* Hidden */;
            if (this.parent) {
                this.parent.modified(true);
            }
        };
        /**
         * このEの包含矩形を計算する。
         *
         * @param c 使用カメラ。
         */
        E.prototype.calculateBoundingRect = function (c) {
            return this._calculateBoundingRect(undefined, c);
        };
        /**
         * @private
         */
        E.prototype._calculateBoundingRect = function (m, c) {
            var matrix = this.getMatrix();
            if (m) {
                matrix = m.multiplyNew(matrix);
            }
            if (!this.visible() || (c && (!this._targetCameras || this._targetCameras.indexOf(c) === -1))) {
                return undefined;
            }
            var thisBoundingRect = { left: 0, right: this.width, top: 0, bottom: this.height };
            var targetCoordinates = [
                { x: thisBoundingRect.left, y: thisBoundingRect.top },
                { x: thisBoundingRect.left, y: thisBoundingRect.bottom },
                { x: thisBoundingRect.right, y: thisBoundingRect.top },
                { x: thisBoundingRect.right, y: thisBoundingRect.bottom }
            ];
            var convertedPoint = matrix.multiplyPoint(targetCoordinates[0]);
            var result = { left: convertedPoint.x, right: convertedPoint.x, top: convertedPoint.y, bottom: convertedPoint.y };
            for (var i = 1; i < targetCoordinates.length; ++i) {
                convertedPoint = matrix.multiplyPoint(targetCoordinates[i]);
                if (result.left > convertedPoint.x)
                    result.left = convertedPoint.x;
                if (result.right < convertedPoint.x)
                    result.right = convertedPoint.x;
                if (result.top > convertedPoint.y)
                    result.top = convertedPoint.y;
                if (result.bottom < convertedPoint.y)
                    result.bottom = convertedPoint.y;
            }
            if (this.children !== undefined) {
                for (var i = 0; i < this.children.length; ++i) {
                    var nowResult = this.children[i]._calculateBoundingRect(matrix, c);
                    if (nowResult) {
                        if (result.left > nowResult.left)
                            result.left = nowResult.left;
                        if (result.right < nowResult.right)
                            result.right = nowResult.right;
                        if (result.top > nowResult.top)
                            result.top = nowResult.top;
                        if (result.bottom < nowResult.bottom)
                            result.bottom = nowResult.bottom;
                    }
                }
            }
            return result;
        };
        /**
         * @private
         */
        E.prototype._enableTouchPropagation = function () {
            var p = this.parent;
            while (p instanceof E && !p._hasTouchableChildren) {
                p._hasTouchableChildren = true;
                p = p.parent;
            }
        };
        /**
         * @private
         */
        E.prototype._disableTouchPropagation = function () {
            var p = this.parent;
            while (p instanceof E && p._hasTouchableChildren) {
                if (this._findTouchableChildren(p))
                    break;
                p._hasTouchableChildren = false;
                p = p.parent;
            }
        };
        /**
         * @private
         */
        E.prototype._isTargetOperation = function (e) {
            if (this.state & 1 /* Hidden */)
                return false;
            if (e instanceof g.PointEvent)
                return this._touchable && e.target === this;
            return false;
        };
        E.prototype._findTouchableChildren = function (e) {
            if (e.children) {
                for (var i = 0; i < e.children.length; ++i) {
                    if (e.children[i].touchable)
                        return e.children[i];
                    var tmp = this._findTouchableChildren(e.children[i]);
                    if (tmp)
                        return tmp;
                }
            }
            return undefined;
        };
        return E;
    }(g.Object2D));
    g.E = E;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 内部描画キャッシュを持つ `E` 。
     */
    var CacheableE = (function (_super) {
        __extends(CacheableE, _super);
        /**
         * 各種パラメータを指定して `CacheableE` のインスタンスを生成する。
         * @param param このエンティティに対するパラメータ
         */
        function CacheableE(param) {
            var _this = _super.call(this, param) || this;
            _this._shouldRenderChildren = true;
            _this._cache = undefined;
            _this._renderer = undefined;
            _this._renderedCamera = undefined;
            return _this;
        }
        /**
         * このエンティティの描画キャッシュ無効化をエンジンに通知する。
         * このメソッドを呼び出し後、描画キャッシュの再構築が行われ、各 `Renderer` に描画内容の変更が反映される。
         */
        CacheableE.prototype.invalidate = function () {
            this.state &= ~2 /* Cached */;
            this.modified();
        };
        /**
         * このエンティティ自身の描画を行う。
         * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
         */
        CacheableE.prototype.renderSelf = function (renderer, camera) {
            var padding = CacheableE.PADDING;
            if (this._renderedCamera !== camera) {
                this.state &= ~2 /* Cached */;
                this._renderedCamera = camera;
            }
            if (!(this.state & 2 /* Cached */)) {
                this._cacheSize = this.calculateCacheSize();
                var w = Math.ceil(this._cacheSize.width) + padding * 2;
                var h = Math.ceil(this._cacheSize.height) + padding * 2;
                var isNew = !this._cache || (this._cache.width < w) || (this._cache.height < h);
                if (isNew) {
                    if (this._cache && !this._cache.destroyed()) {
                        this._cache.destroy();
                    }
                    this._cache = this.scene.game.resourceFactory.createSurface(w, h);
                    this._renderer = this._cache.renderer();
                }
                var cacheRenderer = this._renderer;
                cacheRenderer.begin();
                if (!isNew) {
                    cacheRenderer.clear();
                }
                cacheRenderer.save();
                cacheRenderer.translate(padding, padding);
                this.renderCache(cacheRenderer, camera);
                cacheRenderer.restore();
                this.state |= 2 /* Cached */;
                cacheRenderer.end();
            }
            if (this._cache && this._cacheSize.width > 0 && this._cacheSize.height > 0) {
                renderer.translate(-padding, -padding);
                this.renderSelfFromCache(renderer);
                renderer.translate(padding, padding);
            }
            return this._shouldRenderChildren;
        };
        /**
         * 内部キャッシュから自身の描画を行う。
         * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
         */
        CacheableE.prototype.renderSelfFromCache = function (renderer) {
            renderer.drawImage(this._cache, 0, 0, this._cacheSize.width + CacheableE.PADDING, this._cacheSize.height + CacheableE.PADDING, 0, 0);
        };
        /**
         * 利用している `Surface` を破棄した上で、このエンティティを破棄する。
         */
        CacheableE.prototype.destroy = function () {
            if (this._cache && !this._cache.destroyed()) {
                this._cache.destroy();
            }
            this._cache = undefined;
            _super.prototype.destroy.call(this);
        };
        /**
         * キャッシュのサイズを取得する。
         * 本クラスを継承したクラスでエンティティのサイズと異なるサイズを利用する場合、このメソッドをオーバーライドする。
         * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
         * このメソッドから得られる値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
         */
        CacheableE.prototype.calculateCacheSize = function () {
            return {
                width: this.width,
                height: this.height
            };
        };
        return CacheableE;
    }(g.E));
    /**
     * _cache のパディングサイズ。
     *
     * @private
     */
    CacheableE.PADDING = 1;
    g.CacheableE = CacheableE;
})(g || (g = {}));
var g;
(function (g) {
    // TODO: (GAMEDEV-1549) コメント整理
    /**
     * 操作対象とするストレージのリージョンを表す。
     */
    // サーバ仕様に則し、値を指定している。
    var StorageRegion;
    (function (StorageRegion) {
        /**
         * slotsを表す。
         */
        StorageRegion[StorageRegion["Slots"] = 1] = "Slots";
        /**
         * scoresを表す。
         */
        StorageRegion[StorageRegion["Scores"] = 2] = "Scores";
        /**
         * countsを表す。
         */
        StorageRegion[StorageRegion["Counts"] = 3] = "Counts";
        /**
         * valuesを表す。
         */
        StorageRegion[StorageRegion["Values"] = 4] = "Values";
    })(StorageRegion = g.StorageRegion || (g.StorageRegion = {}));
    /**
     * 一括取得を行う場合のソート順。
     */
    var StorageOrder;
    (function (StorageOrder) {
        /**
         * 昇順。
         */
        StorageOrder[StorageOrder["Asc"] = 0] = "Asc";
        /**
         * 降順。
         */
        StorageOrder[StorageOrder["Desc"] = 1] = "Desc";
    })(StorageOrder = g.StorageOrder || (g.StorageOrder = {}));
    /**
     * 条件を表す。
     */
    // サーバ仕様に則し、値を指定している。
    var StorageCondition;
    (function (StorageCondition) {
        /**
         * 等価を表す（==）。
         */
        StorageCondition[StorageCondition["Equal"] = 1] = "Equal";
        /**
         * 「より大きい」を表す（>）。
         */
        StorageCondition[StorageCondition["GreaterThan"] = 2] = "GreaterThan";
        /**
         * 「より小さい」を表す（<）。
         */
        StorageCondition[StorageCondition["LessThan"] = 3] = "LessThan";
    })(StorageCondition = g.StorageCondition || (g.StorageCondition = {}));
    /**
     * Countsリージョンへの書き込み操作種別を表す。
     */
    // サーバ仕様に則し、値を指定している。
    var StorageCountsOperation;
    (function (StorageCountsOperation) {
        /**
         * インクリメント操作を実行する。
         */
        StorageCountsOperation[StorageCountsOperation["Incr"] = 1] = "Incr";
        /**
         * デクリメント操作を実行する。
         */
        StorageCountsOperation[StorageCountsOperation["Decr"] = 2] = "Decr";
    })(StorageCountsOperation = g.StorageCountsOperation || (g.StorageCountsOperation = {}));
    /**
     * ストレージの値を保持するクラス。
     * ゲーム開発者がこのクラスのインスタンスを直接生成することはない。
     */
    var StorageValueStore = (function () {
        function StorageValueStore(keys, values) {
            this._keys = keys;
            this._values = values;
        }
        /**
         * 値の配列を `StorageKey` またはインデックスから取得する。
         * 通常、インデックスは `Scene` のコンストラクタに指定した `storageKeys` のインデックスに対応する。
         * @param keyOrIndex `StorageKey` 又はインデックス
         */
        StorageValueStore.prototype.get = function (keyOrIndex) {
            if (this._values === undefined) {
                return [];
            }
            if (typeof keyOrIndex === "number") {
                return this._values[keyOrIndex];
            }
            else {
                var index = this._keys.indexOf(keyOrIndex);
                if (index !== -1) {
                    return this._values[index];
                }
                for (var i = 0; i < this._keys.length; ++i) {
                    var target = this._keys[i];
                    if (target.region === keyOrIndex.region
                        && target.regionKey === keyOrIndex.regionKey
                        && target.userId === keyOrIndex.userId
                        && target.gameId === keyOrIndex.gameId) {
                        return this._values[i];
                    }
                }
            }
            return [];
        };
        /**
         * 値を `StorageKey` またはインデックスから取得する。
         * 対応する値が複数ある場合は、先頭の値を取得する。
         * 通常、インデックスは `Scene` のコンストラクタに指定した `storageKeys` のインデックスに対応する。
         * @param keyOrIndex `StorageKey` 又はインデックス
         */
        StorageValueStore.prototype.getOne = function (keyOrIndex) {
            var values = this.get(keyOrIndex);
            if (!values)
                return undefined;
            return values[0];
        };
        return StorageValueStore;
    }());
    g.StorageValueStore = StorageValueStore;
    /**
     * ストレージの値をロードするクラス。
     * ゲーム開発者がこのクラスのインスタンスを直接生成することはなく、
     * 本クラスの機能を利用することもない。
     */
    var StorageLoader = (function () {
        function StorageLoader(storage, keys, serialization) {
            this._loaded = false;
            this._storage = storage;
            this._valueStore = new StorageValueStore(keys);
            this._handler = undefined;
            this._valueStoreSerialization = serialization;
        }
        /**
         * @private
         */
        StorageLoader.prototype._load = function (handler) {
            this._handler = handler;
            if (this._storage._load) {
                this._storage._load.call(this._storage, this._valueStore._keys, this, this._valueStoreSerialization);
            }
        };
        /**
         * @private
         */
        // 値の取得が完了したタイミングで呼び出される。
        // `values` は `this._valueStore._keys` に対応する値を表す `StorageValue` の配列。
        // 順番は `this._valueStore._keys` と同じでなければならない。
        StorageLoader.prototype._onLoaded = function (values, serialization) {
            this._valueStore._values = values;
            this._loaded = true;
            if (serialization)
                this._valueStoreSerialization = serialization;
            if (this._handler)
                this._handler._onStorageLoaded();
        };
        /**
         * @private
         */
        StorageLoader.prototype._onError = function (error) {
            if (this._handler)
                this._handler._onStorageLoadError(error);
        };
        return StorageLoader;
    }());
    g.StorageLoader = StorageLoader;
    /**
     * ストレージ。
     * ゲーム開発者がこのクラスのインスタンスを直接生成することはない。
     */
    var Storage = (function () {
        function Storage(game) {
            this._game = game;
        }
        /**
         * ストレージに値を書き込む。
         * @param key ストレージキーを表す `StorageKey`
         * @param value 値を表す `StorageValue`
         * @param option 書き込みオプション
         */
        Storage.prototype.write = function (key, value, option) {
            if (this._write) {
                this._write(key, value, option);
            }
        };
        /**
         * 参加してくるプレイヤーの値をストレージから取得することを要求する。
         * 取得した値は `JoinEvent#storageValues` に格納される。
         * @param keys ストレージキーを表す `StorageReadKey` の配列。`StorageReadKey#userId` は無視される。
         */
        Storage.prototype.requestValuesForJoinPlayer = function (keys) {
            this._requestedKeysForJoinPlayer = keys;
        };
        /**
         * @private
         */
        Storage.prototype._createLoader = function (keys, serialization) {
            return new StorageLoader(this, keys, serialization);
        };
        /**
         * @private
         */
        // ストレージに値の書き込むを行う関数を登録する。
        // 登録した関数内の `this` は `Storage` を指す。
        Storage.prototype._registerWrite = function (write) {
            this._write = write;
        };
        /**
         * @private
         */
        // ストレージから値の読み込みを行う関数を登録する。
        // 登録した関数内の `this` は `Storage` を指す。
        // 読み込み完了した場合は、登録した関数内で `loader._onLoaded(values)` を呼ばなければならない。
        // エラーが発生した場合は、登録した関数内で `loader._onError(error)` を呼ばなければならない。
        Storage.prototype._registerLoad = function (load) {
            this._load = load;
        };
        return Storage;
    }());
    g.Storage = Storage;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * シーンのアセットの読み込みと破棄を管理するクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
     */
    var SceneAssetHolder = (function () {
        function SceneAssetHolder(param) {
            this.waitingAssetsCount = param.assetIds.length;
            this._scene = param.scene;
            this._assetManager = param.assetManager;
            this._assetIds = param.assetIds;
            this._assets = [];
            this._handler = param.handler;
            this._handlerOwner = param.handlerOwner || null;
            this._direct = !!param.direct;
            this._requested = false;
        }
        SceneAssetHolder.prototype.request = function () {
            if (this.waitingAssetsCount === 0)
                return false;
            if (this._requested)
                return true;
            this._requested = true;
            this._assetManager.requestAssets(this._assetIds, this);
            return true;
        };
        SceneAssetHolder.prototype.destroy = function () {
            if (this._requested) {
                this._assetManager.unrefAssets(this._assets);
            }
            this.waitingAssetsCount = 0;
            this._scene = undefined;
            this._assetIds = undefined;
            this._handler = undefined;
            this._requested = false;
        };
        SceneAssetHolder.prototype.destroyed = function () {
            return !this._scene;
        };
        SceneAssetHolder.prototype.callHandler = function () {
            this._handler.call(this._handlerOwner);
        };
        /**
         * @private
         */
        SceneAssetHolder.prototype._onAssetError = function (asset, error, assetManager) {
            if (this.destroyed() || this._scene.destroyed())
                return;
            var failureInfo = {
                asset: asset,
                error: error,
                cancelRetry: false
            };
            this._scene.assetLoadFailed.fire(failureInfo);
            if (error.retriable && !failureInfo.cancelRetry) {
                this._assetManager.retryLoad(asset);
            }
            else {
                // game.json に定義されていればゲームを止める。それ以外 (DynamicAsset) では続行。
                if (this._assetManager.configuration[asset.id])
                    this._scene.game.terminateGame();
            }
            this._scene.assetLoadCompleted.fire(asset);
        };
        /**
         * @private
         */
        SceneAssetHolder.prototype._onAssetLoad = function (asset) {
            if (this.destroyed() || this._scene.destroyed())
                return;
            this._scene.assets[asset.id] = asset;
            this._scene.assetLoaded.fire(asset);
            this._scene.assetLoadCompleted.fire(asset);
            this._assets.push(asset);
            --this.waitingAssetsCount;
            if (this.waitingAssetsCount < 0)
                throw g.ExceptionFactory.createAssertionError("SceneAssetHolder#_onAssetLoad: broken waitingAssetsCount");
            if (this.waitingAssetsCount > 0)
                return;
            if (this._direct) {
                this.callHandler();
            }
            else {
                this._scene.game._callSceneAssetHolderHandler(this);
            }
        };
        return SceneAssetHolder;
    }());
    g.SceneAssetHolder = SceneAssetHolder;
    /**
     * そのSceneの状態を表す列挙子。
     *
     * - Destroyed: すでに破棄されているシーンで、再利用が不可能になっている状態を表す
     * - Standby: 初期化された状態のシーンで、シーンスタックへ追加されることを待っている状態を表す
     * - Active: シーンスタックの一番上にいるシーンで、ゲームのカレントシーンとして活性化されている状態を表す
     * - Deactive: シーンスタックにいるが一番上ではないシーンで、裏側で非活性状態になっていることを表す
     * - BeforeDestroyed: これから破棄されるシーンで、再利用が不可能になっている状態を表す
     */
    var SceneState;
    (function (SceneState) {
        SceneState[SceneState["Destroyed"] = 0] = "Destroyed";
        SceneState[SceneState["Standby"] = 1] = "Standby";
        SceneState[SceneState["Active"] = 2] = "Active";
        SceneState[SceneState["Deactive"] = 3] = "Deactive";
        SceneState[SceneState["BeforeDestroyed"] = 4] = "BeforeDestroyed";
    })(SceneState = g.SceneState || (g.SceneState = {}));
    var SceneLoadState;
    (function (SceneLoadState) {
        SceneLoadState[SceneLoadState["Initial"] = 0] = "Initial";
        SceneLoadState[SceneLoadState["Ready"] = 1] = "Ready";
        SceneLoadState[SceneLoadState["ReadyFired"] = 2] = "ReadyFired";
        SceneLoadState[SceneLoadState["LoadedFired"] = 3] = "LoadedFired";
    })(SceneLoadState = g.SceneLoadState || (g.SceneLoadState = {}));
    /**
     * シーンを表すクラス。
     */
    var Scene = (function () {
        /**
         * 各種パラメータを指定して `Scene` のインスタンスを生成する。
         * @param param 初期化に用いるパラメータのオブジェクト
         */
        function Scene(param) {
            var game;
            var local;
            var tickGenerationMode;
            var assetIds;
            game = param.game;
            assetIds = param.assetIds;
            if (!param.storageKeys) {
                this._storageLoader = undefined;
                this.storageValues = undefined;
            }
            else {
                this._storageLoader = game.storage._createLoader(param.storageKeys, param.storageValuesSerialization);
                this.storageValues = this._storageLoader._valueStore;
            }
            local = (param.local === undefined) ? g.LocalTickMode.NonLocal
                : (param.local === false) ? g.LocalTickMode.NonLocal
                    : (param.local === true) ? g.LocalTickMode.FullLocal
                        : param.local;
            tickGenerationMode = (param.tickGenerationMode !== undefined) ? param.tickGenerationMode : g.TickGenerationMode.ByClock;
            this.name = param.name;
            if (!assetIds)
                assetIds = [];
            this.game = game;
            this.local = local;
            this.tickGenerationMode = tickGenerationMode;
            this.loaded = new g.Trigger();
            this._ready = new g.Trigger();
            this.assets = {};
            this._loaded = false;
            this._prefetchRequested = false;
            this._loadingState = SceneLoadState.Initial;
            this.update = new g.Trigger();
            this._timer = new g.TimerManager(this.update, this.game.fps);
            this.assetLoaded = new g.Trigger();
            this.assetLoadFailed = new g.Trigger();
            this.assetLoadCompleted = new g.Trigger();
            this.message = new g.Trigger();
            this.pointDownCapture = new g.Trigger();
            this.pointMoveCapture = new g.Trigger();
            this.pointUpCapture = new g.Trigger();
            this.operation = new g.Trigger();
            this.children = [];
            this.state = SceneState.Standby;
            this.stateChanged = new g.Trigger();
            this._assetHolders = [];
            this._sceneAssetHolder = new SceneAssetHolder({
                scene: this,
                assetManager: this.game._assetManager,
                assetIds: assetIds,
                handler: this._onSceneAssetsLoad,
                handlerOwner: this,
                direct: true
            });
        }
        /**
         * このシーンが変更されたことをエンジンに通知する。
         *
         * このメソッドは、このシーンに紐づいている `E` の `modified()` を呼び出すことで暗黙に呼び出される。
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         * @param isBubbling この関数をこのシーンの子の `modified()` から呼び出す場合、真を渡さなくてはならない。省略された場合、偽。
         */
        Scene.prototype.modified = function (isBubbling) {
            this.game.modified = true;
        };
        /**
         * このシーンを破棄する。
         *
         * 破棄処理の開始時に、このシーンの `stateChanged` が引数 `BeforeDestroyed` でfireされる。
         * 破棄処理の終了時に、このシーンの `stateChanged` が引数 `Destroyed` でfireされる。
         * このシーンに紐づいている全ての `E` と全てのTimerは破棄される。
         * `Scene#setInterval()`, `Scene#setTimeout()` に渡された関数は呼び出されなくなる。
         *
         * このメソッドは `Scene#end` や `Game#popScene` などによって要求されたシーンの遷移時に暗黙に呼び出される。
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         */
        Scene.prototype.destroy = function () {
            this.state = SceneState.BeforeDestroyed;
            this.stateChanged.fire(this.state);
            // TODO: (GAMEDEV-483) Sceneスタックがそれなりの量になると重くなるのでScene#dbが必要かもしれない
            var gameDb = this.game.db;
            for (var p in gameDb) {
                if (gameDb.hasOwnProperty(p) && gameDb[p].scene === this)
                    gameDb[p].destroy();
            }
            var gameDb = this.game._localDb;
            for (var p in gameDb) {
                if (gameDb.hasOwnProperty(p) && gameDb[p].scene === this)
                    gameDb[p].destroy();
            }
            this._timer.destroy();
            this.update.destroy();
            this.message.destroy();
            this.pointDownCapture.destroy();
            this.pointMoveCapture.destroy();
            this.pointUpCapture.destroy();
            this.operation.destroy();
            this.loaded.destroy();
            this.assetLoaded.destroy();
            this.assetLoadFailed.destroy();
            this.assetLoadCompleted.destroy();
            this.assets = {};
            // アセットを参照しているEより先に解放しないよう最後に解放する
            for (var i = 0; i < this._assetHolders.length; ++i)
                this._assetHolders[i].destroy();
            this._sceneAssetHolder.destroy();
            this._storageLoader = undefined;
            this.game = undefined;
            this.state = SceneState.Destroyed;
            this.stateChanged.fire(this.state);
            this.stateChanged.destroy();
        };
        /**
         * 破棄済みであるかを返す。
         */
        Scene.prototype.destroyed = function () {
            return this.game === undefined;
        };
        /**
         * 一定間隔で定期的に処理を実行するTimerを作成して返す。
         *
         * 戻り値は作成されたTimerである。
         * 通常は `Scene#setInterval` を利用すればよく、ゲーム開発者がこのメソッドを呼び出す必要はない。
         * `Timer` はフレーム経過処理(`Scene#update`)で実現される疑似的なタイマーである。実時間の影響は受けない。
         * @param interval Timerの実行間隔（ミリ秒）
         */
        Scene.prototype.createTimer = function (interval) {
            return this._timer.createTimer(interval);
        };
        /**
         * Timerを削除する。
         * @param timer 削除するTimer
         */
        Scene.prototype.deleteTimer = function (timer) {
            this._timer.deleteTimer(timer);
        };
        Scene.prototype.setInterval = function (handler, interval, owner) {
            var t = this._timer;
            if (typeof handler === "number") {
                this.game.logger.warn("[deprecated] Scene#setInterval(): this arguments ordering is now deprecated. Specify the function first.");
                return (owner != null) ? t.setInterval(owner /* 2 */, handler /* 0 */, interval /* 1 */)
                    : t.setInterval(interval /* 1 */, handler /* 0 */, null);
            }
            return t.setInterval(handler, interval, owner);
        };
        /**
         * setIntervalで作成した定期処理を解除する。
         * @param identifier 解除対象
         */
        Scene.prototype.clearInterval = function (identifier) {
            this._timer.clearInterval(identifier);
        };
        Scene.prototype.setTimeout = function (handler, milliseconds, owner) {
            var t = this._timer;
            if (typeof handler === "number") {
                this.game.logger.warn("[deprecated] Scene#setTimeout(): this arguments ordering is now deprecated. Specify the function first.");
                return (owner != null) ? t.setTimeout(owner /* 2 */, handler /* 0 */, milliseconds /* 1 */)
                    : t.setTimeout(milliseconds /* 1 */, handler /* 0 */, null);
            }
            return t.setTimeout(handler, milliseconds, owner);
        };
        /**
         * setTimeoutで作成した処理を削除する。
         * @param identifier 解除対象
         */
        Scene.prototype.clearTimeout = function (identifier) {
            this._timer.clearTimeout(identifier);
        };
        /**
         * このシーンが現在のシーンであるかどうかを返す。
         */
        Scene.prototype.isCurrentScene = function () {
            return this.game.scene() === this;
        };
        /**
         * 次のシーンへの遷移を要求する。
         *
         * このメソッドは、 `toPush` が真ならば `Game#pushScene()` の、でなければ `Game#replaceScene` のエイリアスである。
         * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
         * このシーンが現在のシーンでない場合、 `AssertionError` がthrowされる。
         * @param next 遷移後のシーン
         * @param toPush 現在のシーンを残したままにするなら真、削除して遷移するなら偽を指定する。省略された場合偽
         */
        Scene.prototype.gotoScene = function (next, toPush) {
            if (!this.isCurrentScene())
                throw g.ExceptionFactory.createAssertionError("Scene#gotoScene: this scene is not the current scene");
            if (toPush) {
                this.game.pushScene(next);
            }
            else {
                this.game.replaceScene(next);
            }
        };
        /**
         * このシーンの削除と、一つ前のシーンへの遷移を要求する。
         *
         * このメソッドは `Game#popScene()` のエイリアスである。
         * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
         * このシーンが現在のシーンでない場合、 `AssertionError` がthrowされる。
         */
        Scene.prototype.end = function () {
            if (!this.isCurrentScene())
                throw g.ExceptionFactory.createAssertionError("Scene#end: this scene is not the current scene");
            this.game.popScene();
        };
        /**
         * このSceneにエンティティを登録する。
         *
         * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に呼び出す必要はない。
         * @param e 登録するエンティティ
         */
        Scene.prototype.register = function (e) {
            this.game.register(e);
            e.scene = this;
        };
        /**
         * このSceneからエンティティの登録を削除する。
         *
         * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に呼び出す必要はない。
         * @param e 登録を削除するエンティティ
         */
        Scene.prototype.unregister = function (e) {
            e.scene = undefined;
            this.game.unregister(e);
        };
        /**
         * 子エンティティを追加する。
         *
         * `this.children` の末尾に `e` を追加する(`e` はそれまでに追加されたすべての子エンティティより手前に表示される)。
         *
         * @param e 子エンティティとして追加するエンティティ
         */
        Scene.prototype.append = function (e) {
            this.insertBefore(e, undefined);
        };
        /**
         * 子エンティティを挿入する。
         *
         * `this.children` の`target`の位置に `e` を挿入する。
         * `target` が`this` の子でない場合、`append(e)`と同じ動作となる。
         *
         * @param e 子エンティティとして追加するエンティティ
         * @param target 挿入位置にある子エンティティ
         */
        Scene.prototype.insertBefore = function (e, target) {
            if (e.parent)
                e.remove();
            e.parent = this;
            var index = -1;
            if (target !== undefined && (index = this.children.indexOf(target)) > -1) {
                this.children.splice(index, 0, e);
            }
            else {
                this.children.push(e);
            }
            this.modified(true);
        };
        /**
         * 子エンティティを削除する。
         * `this` の子から `e` を削除する。 `e` が `this` の子でない場合、何もしない。
         * @param e 削除する子エンティティ
         */
        Scene.prototype.remove = function (e) {
            var index = this.children.indexOf(e);
            if (index === -1)
                return;
            this.children[index].parent = undefined;
            this.children.splice(index, 1);
            this.modified(true);
        };
        /**
         * シーン内でその座標に反応する `PointSource` を返す。
         * @param point 対象の座標
         * @param force touchable指定を無視する場合真を指定する。指定されなかった場合偽
         * @param camera 対象のカメラ。指定されなかった場合undefined
         */
        Scene.prototype.findPointSourceByPoint = function (point, force, camera) {
            var mayConsumeLocalTick = (this.local !== g.LocalTickMode.NonLocal);
            var children = this.children;
            var m = undefined;
            if (camera && camera instanceof g.Camera2D)
                m = camera.getMatrix();
            for (var i = children.length - 1; i >= 0; --i) {
                var ret = children[i].findPointSourceByPoint(point, m, force, camera);
                if (ret) {
                    ret.local = ret.target.local || mayConsumeLocalTick;
                    return ret;
                }
            }
            return { target: undefined, point: undefined, local: mayConsumeLocalTick };
        };
        /**
         * アセットの先読みを要求する。
         *
         * `Scene` に必要なアセットは、通常、`Game#pushScene()` などによるシーン遷移にともなって暗黙に読み込みが開始される。
         * ゲーム開発者はこのメソッドを呼び出すことで、シーン遷移前にアセット読み込みを開始する(先読みする)ことができる。
         * 先読み開始後、シーン遷移時までに読み込みが完了していない場合、通常の読み込み処理同様にローディングシーンが表示される。
         *
         * このメソッドは `StorageLoader` についての先読み処理を行わない点に注意。
         * ストレージの場合、書き込みが行われる可能性があるため、順序を無視して先読みすることはできない。
         */
        Scene.prototype.prefetch = function () {
            if (this._loaded) {
                // _load() 呼び出し後に prefetch() する意味はない(先読みではない)。
                return;
            }
            if (this._prefetchRequested)
                return;
            this._prefetchRequested = true;
            this._sceneAssetHolder.request();
        };
        /**
         * シーンが読み込んだストレージの値をシリアライズする。
         *
         * `Scene#storageValues` の内容をシリアライズする。
         */
        Scene.prototype.serializeStorageValues = function () {
            if (!this._storageLoader)
                return undefined;
            return this._storageLoader._valueStoreSerialization;
        };
        Scene.prototype.requestAssets = function (assetIds, handler) {
            if (this._loadingState < SceneLoadState.ReadyFired) {
                // このメソッドは読み込み完了前には呼び出せない。これは実装上の制限である。
                // やろうと思えば _load() で読み込む対象として加えることができる。が、その場合 `handler` を呼び出す方法が単純でないので対応を見送る。
                throw g.ExceptionFactory.createAssertionError("Scene#requestAsset(): can be called after loaded.");
            }
            var holder = new SceneAssetHolder({
                scene: this,
                assetManager: this.game._assetManager,
                assetIds: assetIds,
                handler: handler
            });
            this._assetHolders.push(holder);
            holder.request();
        };
        /**
         * @private
         */
        Scene.prototype._activate = function () {
            this.state = SceneState.Active;
            this.stateChanged.fire(this.state);
        };
        /**
         * @private
         */
        Scene.prototype._deactivate = function () {
            this.state = SceneState.Deactive;
            this.stateChanged.fire(this.state);
        };
        /**
         * @private
         */
        Scene.prototype._needsLoading = function () {
            return this._sceneAssetHolder.waitingAssetsCount > 0 || (this._storageLoader && !this._storageLoader._loaded);
        };
        /**
         * @private
         */
        Scene.prototype._load = function () {
            if (this._loaded)
                return;
            this._loaded = true;
            var needsWait = this._sceneAssetHolder.request();
            if (this._storageLoader) {
                this._storageLoader._load(this);
                needsWait = true;
            }
            if (!needsWait)
                this._notifySceneReady();
        };
        /**
         * @private
         */
        Scene.prototype._onSceneAssetsLoad = function () {
            if (!this._loaded) {
                // prefetch() で開始されたアセット読み込みを完了したが、_load() がまだ呼ばれていない。
                // _notifySceneReady() は _load() 呼び出し後まで遅延する。
                return;
            }
            if (this._storageLoader && !this._storageLoader._loaded) {
                // アセット読み込みを完了したが、ストレージの読み込みが終わっていない。
                // _notifySceneReady() は  _onStorageLoaded() 呼び出し後まで遅延する。
                return;
            }
            this._notifySceneReady();
        };
        /**
         * @private
         */
        Scene.prototype._onStorageLoadError = function (error) {
            this.game.terminateGame();
        };
        /**
         * @private
         */
        Scene.prototype._onStorageLoaded = function () {
            if (this._sceneAssetHolder.waitingAssetsCount === 0)
                this._notifySceneReady();
        };
        /**
         * @private
         */
        Scene.prototype._notifySceneReady = function () {
            // 即座に `_ready` をfireすることはしない。tick()のタイミングで行うため、リクエストをgameに投げておく。
            this._loadingState = SceneLoadState.Ready;
            this.game._fireSceneReady(this);
        };
        /**
         * @private
         */
        Scene.prototype._fireReady = function () {
            this._ready.fire(this);
            this._loadingState = SceneLoadState.ReadyFired;
        };
        /**
         * @private
         */
        Scene.prototype._fireLoaded = function () {
            this.loaded.fire(this);
            this._loadingState = SceneLoadState.LoadedFired;
        };
        return Scene;
    }());
    g.Scene = Scene;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * Assetの読み込み中に表示されるシーン。
     *
     * 本シーンは通常のシーンと異なり、ゲーム内時間(`Game#age`)と独立に実行される。
     * アセットやストレージデータを読み込んでいる間、ゲーム内時間が進んでいない状態でも、
     * `LoadingScene` は画面に変化を与えることができる(`update` がfireされる)。
     *
     * ゲーム開発者は、ローディング中の演出を実装した独自の `LoadingScene` を
     * `Game#loadingScene` に代入することでエンジンに利用させることができる。
     *
     * ゲーム内時間と独立に処理される `LoadingScene` での処理には再現性がない(他プレイヤーと状態が共有されない)。
     * そのため `Game` に対して副作用のある操作を行ってはならない点に注意すること。
     */
    var LoadingScene = (function (_super) {
        __extends(LoadingScene, _super);
        /**
         * `LoadingScene` のインスタンスを生成する。
         * @param param 初期化に用いるパラメータのオブジェクト
         */
        function LoadingScene(param) {
            var _this = this;
            param.local = true; // LoadingScene は強制的にローカルにする
            _this = _super.call(this, param) || this;
            _this.targetReset = new g.Trigger();
            _this.targetReady = new g.Trigger();
            _this.targetAssetLoaded = new g.Trigger();
            _this._explicitEnd = !!param.explicitEnd;
            _this._targetScene = undefined;
            return _this;
        }
        LoadingScene.prototype.destroy = function () {
            this._clearTargetScene();
            _super.prototype.destroy.call(this);
        };
        /**
         * アセットロード待ち対象シーンを変更する。
         *
         * このメソッドは、新たにシーンのロード待ちが必要になった場合にエンジンによって呼び出される。
         * (派生クラスはこの処理をオーバーライドしてもよいが、その場合その中で
         * このメソッド自身 (`g.LoadingScene.prototype.reset`) を呼び出す (`call()` する) 必要がある。)
         *
         * @param targetScene アセットロード待ちが必要なシーン
         */
        LoadingScene.prototype.reset = function (targetScene) {
            this._clearTargetScene();
            this._targetScene = targetScene;
            if (this._loadingState < g.SceneLoadState.LoadedFired) {
                this.loaded.addOnce(this._doReset, this);
            }
            else {
                this._doReset();
            }
        };
        /**
         * アセットロード待ち対象シーンの残りのロード待ちアセット数を取得する。
         */
        LoadingScene.prototype.getTargetWaitingAssetsCount = function () {
            return this._targetScene ? this._targetScene._sceneAssetHolder.waitingAssetsCount : 0;
        };
        /**
         * ローディングシーンを終了する。
         *
         * `Scene#end()` と異なり、このメソッドの呼び出しはこのシーンを破棄しない。(ローディングシーンは再利用される。)
         * このメソッドが呼び出される時、 `targetReady` がfireされた後でなければならない。
         */
        LoadingScene.prototype.end = function () {
            if (!this._targetScene || this._targetScene._loadingState < g.SceneLoadState.Ready) {
                var state = this._targetScene ? g.SceneLoadState[this._targetScene._loadingState] : "(no scene)";
                var msg = "LoadingScene#end(): the target scene is in invalid state: " + state;
                throw g.ExceptionFactory.createAssertionError(msg);
            }
            this.game.popScene(true);
            this.game._fireSceneLoaded(this._targetScene);
            this._clearTargetScene();
        };
        /**
         * @private
         */
        LoadingScene.prototype._clearTargetScene = function () {
            if (!this._targetScene)
                return;
            this._targetScene._ready.removeAll({ owner: this });
            this._targetScene.assetLoaded.removeAll({ owner: this });
            this._targetScene = undefined;
        };
        /**
         * @private
         */
        LoadingScene.prototype._doReset = function () {
            this.targetReset.fire(this._targetScene);
            if (this._targetScene._loadingState < g.SceneLoadState.ReadyFired) {
                this._targetScene._ready.add(this._fireTriggerOnTargetReady, this);
                this._targetScene.assetLoaded.add(this._fireTriggerOnTargetAssetLoad, this);
                this._targetScene._load();
            }
            else {
                this._fireTriggerOnTargetReady(this._targetScene);
            }
        };
        /**
         * @private
         */
        LoadingScene.prototype._fireTriggerOnTargetAssetLoad = function (asset) {
            this.targetAssetLoaded.fire(asset);
        };
        /**
         * @private
         */
        LoadingScene.prototype._fireTriggerOnTargetReady = function (scene) {
            this.targetReady.fire(scene);
            if (!this._explicitEnd) {
                this.end();
            }
        };
        return LoadingScene;
    }(g.Scene));
    g.LoadingScene = LoadingScene;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * カメラのtransformを戻すエンティティ。
     * LoadingSceneのインジケータがカメラの影響を受けないようにするための内部エンティティ。
     */
    var CameraCancellingE = (function (_super) {
        __extends(CameraCancellingE, _super);
        function CameraCancellingE(param) {
            var _this = _super.call(this, param) || this;
            _this._canceller = new g.Object2D();
            return _this;
        }
        CameraCancellingE.prototype.renderSelf = function (renderer, camera) {
            if (!this.children)
                return false;
            if (camera) {
                var c = camera;
                var canceller = this._canceller;
                if (c.x !== canceller.x || c.y !== canceller.y || c.angle !== canceller.angle ||
                    c.scaleX !== canceller.scaleX || c.scaleY !== canceller.scaleY) {
                    canceller.x = c.x;
                    canceller.y = c.y;
                    canceller.angle = c.angle;
                    canceller.scaleX = c.scaleX;
                    canceller.scaleY = c.scaleY;
                    if (canceller._matrix) {
                        canceller._matrix._modified = true;
                    }
                }
                renderer.save();
                renderer.transform(canceller.getMatrix()._matrix);
            }
            // Note: concatしていないのでunsafeだが、render中に配列の中身が変わる事はない前提とする
            var children = this.children;
            for (var i = 0; i < children.length; ++i)
                children[i].render(renderer, camera);
            if (camera) {
                renderer.restore();
            }
            return false;
        };
        return CameraCancellingE;
    }(g.E));
    /**
     * デフォルトローディングシーン。
     *
     * `Game#_defaultLoadingScene` の初期値として利用される。
     * このシーンはいかなるアセットも用いてはならない。
     */
    var DefaultLoadingScene = (function (_super) {
        __extends(DefaultLoadingScene, _super);
        /**
         * `DeafultLoadingScene` のインスタンスを生成する。
         * @param param 初期化に用いるパラメータのオブジェクト
         */
        function DefaultLoadingScene(param) {
            var _this = _super.call(this, { game: param.game, name: "akashic:default-loading-scene" }) || this;
            _this._barWidth = Math.min(param.game.width, Math.max(100, param.game.width / 2));
            _this._barHeight = 5;
            _this._gauge = undefined;
            _this._gaugeUpdateCount = 0;
            _this._totalWaitingAssetCount = 0;
            _this.loaded.handle(_this, _this._onLoaded);
            _this.targetReset.handle(_this, _this._onTargetReset);
            _this.targetAssetLoaded.handle(_this, _this._onTargetAssetLoaded);
            return _this;
        }
        /**
         * @private
         */
        DefaultLoadingScene.prototype._onLoaded = function () {
            var gauge;
            this.append(new CameraCancellingE({
                scene: this,
                children: [
                    new g.FilledRect({
                        scene: this,
                        width: this.game.width,
                        height: this.game.height,
                        cssColor: "rgba(0, 0, 0, 0.8)",
                        children: [
                            new g.FilledRect({
                                scene: this,
                                x: (this.game.width - this._barWidth) / 2,
                                y: (this.game.height - this._barHeight) / 2,
                                width: this._barWidth,
                                height: this._barHeight,
                                cssColor: "gray",
                                children: [
                                    gauge = new g.FilledRect({
                                        scene: this,
                                        width: 0,
                                        height: this._barHeight,
                                        cssColor: "white"
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }));
            gauge.update.handle(this, this._onUpdateGuage);
            this._gauge = gauge;
            return true; // Trigger 登録を解除する
        };
        /**
         * @private
         */
        DefaultLoadingScene.prototype._onUpdateGuage = function () {
            var BLINK_RANGE = 50;
            var BLINK_PER_SEC = 2 / 3;
            ++this._gaugeUpdateCount;
            // 白を上限に sin 波で明滅させる (updateしていることの確認)
            var c = Math.round((255 - BLINK_RANGE)
                + Math.sin((this._gaugeUpdateCount / this.game.fps * BLINK_PER_SEC) * (2 * Math.PI)) * BLINK_RANGE);
            this._gauge.cssColor = "rgb(" + c + "," + c + "," + c + ")";
            this._gauge.modified();
        };
        /**
         * @private
         */
        DefaultLoadingScene.prototype._onTargetReset = function (targetScene) {
            if (this._gauge) {
                this._gauge.width = 0;
                this._gauge.modified();
            }
            this._totalWaitingAssetCount = targetScene._sceneAssetHolder.waitingAssetsCount;
        };
        /**
         * @private
         */
        DefaultLoadingScene.prototype._onTargetAssetLoaded = function (asset) {
            var waitingAssetsCount = this._targetScene._sceneAssetHolder.waitingAssetsCount;
            this._gauge.width = Math.ceil((1 - waitingAssetsCount / this._totalWaitingAssetCount) * this._barWidth);
            this._gauge.modified();
        };
        return DefaultLoadingScene;
    }(g.LoadingScene));
    g.DefaultLoadingScene = DefaultLoadingScene;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 画像を描画するエンティティ。
     */
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        /**
         * 各種パラメータを指定して `Sprite` のインスタンスを生成する。
         * @param param `Sprite` に設定するパラメータ
         */
        function Sprite(param) {
            var _this = _super.call(this, param) || this;
            _this.surface = g.Util.asSurface(param.src);
            if (!("width" in param))
                _this.width = _this.surface.width;
            if (!("height" in param))
                _this.height = _this.surface.height;
            _this.srcWidth = "srcWidth" in param ? param.srcWidth : _this.width;
            _this.srcHeight = "srcHeight" in param ? param.srcHeight : _this.height;
            _this.srcX = param.srcX || 0;
            _this.srcY = param.srcY || 0;
            _this._stretchMatrix = undefined;
            _this._beforeSurface = _this.surface;
            g.Util.setupAnimatingHandler(_this, _this.surface);
            _this._invalidateSelf();
            return _this;
        }
        /**
         * @private
         */
        Sprite.prototype._onUpdate = function () {
            this.modified();
        };
        /**
         * @private
         */
        Sprite.prototype._onAnimatingStarted = function () {
            if (!this.update.contains(this._onUpdate, this)) {
                this.update.add(this._onUpdate, this);
            }
        };
        /**
         * @private
         */
        Sprite.prototype._onAnimatingStopped = function () {
            if (!this.destroyed()) {
                this.update.remove(this._onUpdate, this);
            }
        };
        /**
         * このエンティティ自身の描画を行う。
         * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
         */
        Sprite.prototype.renderSelf = function (renderer, camera) {
            if (this.srcWidth <= 0 || this.srcHeight <= 0) {
                return true;
            }
            if (this._stretchMatrix) {
                renderer.save();
                renderer.transform(this._stretchMatrix._matrix);
            }
            renderer.drawImage(this.surface, this.srcX, this.srcY, this.srcWidth, this.srcHeight, 0, 0);
            if (this._stretchMatrix)
                renderer.restore();
            return true;
        };
        /**
         * このエンティティの描画キャッシュ無効化をエンジンに通知する。
         * このメソッドを呼び出し後、描画キャッシュの再構築が行われ、各 `Renderer` に描画内容の変更が反映される。
         */
        Sprite.prototype.invalidate = function () {
            this._invalidateSelf();
            this.modified();
        };
        /**
         * このエンティティを破棄する。
         * デフォルトでは利用している `Surface` の破棄は行わない点に注意。
         * @param destroySurface trueを指定した場合、このエンティティが抱える `Surface` も合わせて破棄する
         */
        Sprite.prototype.destroy = function (destroySurface) {
            if (this.surface && !this.surface.destroyed()) {
                if (destroySurface) {
                    this.surface.destroy();
                }
                else if (this.surface.isDynamic) {
                    this.surface.animatingStarted.remove(this._onAnimatingStarted, this);
                    this.surface.animatingStopped.remove(this._onAnimatingStopped, this);
                }
            }
            this.surface = undefined;
            _super.prototype.destroy.call(this);
        };
        Sprite.prototype._invalidateSelf = function () {
            if (this.width === this.srcWidth && this.height === this.srcHeight) {
                this._stretchMatrix = undefined;
            }
            else {
                this._stretchMatrix = g.Util.createMatrix();
                this._stretchMatrix.scale(this.width / this.srcWidth, this.height / this.srcHeight);
            }
            if (this.surface !== this._beforeSurface) {
                g.Util.migrateAnimatingHandler(this, this._beforeSurface, this.surface);
                this._beforeSurface = this.surface;
            }
        };
        return Sprite;
    }(g.E));
    g.Sprite = Sprite;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * フレームとタイマーによるアニメーション機構を持つ `Sprite` 。
     *
     * このクラスは、コンストラクタで渡された画像を、
     * 幅 `srcWidth`, 高さ `srcHeight` 単位で区切られた小さな画像(以下、画像片)の集まりであると解釈する。
     * 各画像片は、左上から順に 0 から始まるインデックスで参照される。
     *
     * ゲーム開発者は、このインデックスからなる配列を `FrameSprite#frames` に設定する。
     * `FrameSprite` は、 `frames` に指定されたインデックス(が表す画像片)を順番に描画することでアニメーションを実現する。
     * アニメーションは `interval` ミリ秒ごとに進み、 `frames` の内容をループする。
     *
     * このクラスにおける `srcWidth`, `srcHeight` の扱いは、親クラスである `Sprite` とは異なっていることに注意。
     */
    var FrameSprite = (function (_super) {
        __extends(FrameSprite, _super);
        /**
         * 各種パラメータを指定して `FrameSprite` のインスタンスを生成する。
         * @param param `FrameSprite` に設定するパラメータ
         */
        function FrameSprite(param) {
            var _this = _super.call(this, param) || this;
            _this._lastUsedIndex = 0;
            _this.frameNumber = param.frameNumber || 0;
            _this.frames = "frames" in param ? param.frames : [0];
            _this.interval = param.interval;
            _this._timer = undefined;
            _this.loop = param.loop != null ? param.loop : true;
            _this.finished = new g.Trigger();
            _this._modifiedSelf();
            return _this;
        }
        /**
         * `Sprite` から `FrameSprite` を作成する。
         * @param sprite 画像として使う`Sprite`
         * @param width 作成されるエンティティの高さ。省略された場合、 `sprite.width`
         * @param hegith 作成されるエンティティの高さ。省略された場合、 `sprite.height`
         */
        FrameSprite.createBySprite = function (sprite, width, height) {
            var frameSprite = new FrameSprite({
                scene: sprite.scene,
                src: sprite.surface,
                width: width === undefined ? sprite.width : width,
                height: height === undefined ? sprite.height : height
            });
            frameSprite.srcHeight = height === undefined ? sprite.srcHeight : height;
            frameSprite.srcWidth = width === undefined ? sprite.srcWidth : width;
            return frameSprite;
        };
        /**
         * アニメーションを開始する。
         */
        FrameSprite.prototype.start = function () {
            if (this.interval === undefined)
                this.interval = 1000 / this.game().fps;
            if (this._timer)
                this._free();
            this._timer = this.scene.createTimer(this.interval);
            this._timer.elapsed.add(this._onElapsed, this);
        };
        /**
         * このエンティティを破棄する。
         * デフォルトでは利用している `Surface` の破棄は行わない点に注意。
         * @param destroySurface trueを指定した場合、このエンティティが抱える `Surface` も合わせて破棄する
         */
        FrameSprite.prototype.destroy = function (destroySurface) {
            this.stop();
            _super.prototype.destroy.call(this, destroySurface);
        };
        /**
         * アニメーションを停止する。
         */
        FrameSprite.prototype.stop = function () {
            if (this._timer)
                this._free();
        };
        /**
         * このエンティティに対する変更をエンジンに通知する。詳細は `E#modified()` のドキュメントを参照。
         */
        FrameSprite.prototype.modified = function (isBubbling) {
            this._modifiedSelf(isBubbling);
            _super.prototype.modified.call(this, isBubbling);
        };
        /**
         * @private
         */
        FrameSprite.prototype._onElapsed = function () {
            if (this.frameNumber === this.frames.length - 1) {
                if (this.loop) {
                    this.frameNumber = 0;
                }
                else {
                    this.stop();
                    this.finished.fire();
                }
            }
            else {
                this.frameNumber++;
            }
            this.modified();
        };
        /**
         * @private
         */
        FrameSprite.prototype._free = function () {
            if (!this._timer)
                return;
            this._timer.elapsed.remove(this._onElapsed, this);
            if (this._timer.canDelete())
                this.scene.deleteTimer(this._timer);
            this._timer = undefined;
        };
        /**
         * @private
         */
        FrameSprite.prototype._changeFrame = function () {
            var frame = this.frames[this.frameNumber];
            var sep = Math.floor(this.surface.width / this.srcWidth);
            this.srcX = (frame % sep) * this.srcWidth;
            this.srcY = Math.floor(frame / sep) * this.srcHeight;
            this._lastUsedIndex = frame;
        };
        FrameSprite.prototype._modifiedSelf = function (isBubbling) {
            if (this._lastUsedIndex !== this.frames[this.frameNumber])
                this._changeFrame();
        };
        return FrameSprite;
    }(g.Sprite));
    g.FrameSprite = FrameSprite;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * イベントの種別。
     */
    var EventType;
    (function (EventType) {
        /**
         * 不明なイベント。
         * ゲーム開発者はこの値を利用してはならない。
         */
        EventType[EventType["Unknown"] = 0] = "Unknown";
        /**
         * プレイヤーの参加を表すイベント。
         */
        EventType[EventType["Join"] = 1] = "Join";
        /**
         * プレイヤーの離脱を表すイベント。
         */
        EventType[EventType["Leave"] = 2] = "Leave";
        /**
         * タイムスタンプを表すイベント。
         */
        EventType[EventType["Timestamp"] = 3] = "Timestamp";
        /**
         * 乱数生成器の生成を表すイベント。
         * この値は利用されていない。
         */
        EventType[EventType["Seed"] = 4] = "Seed";
        /**
         * ポイントダウンイベント。
         */
        EventType[EventType["PointDown"] = 5] = "PointDown";
        /**
         * ポイントムーブイベント。
         */
        EventType[EventType["PointMove"] = 6] = "PointMove";
        /**
         * ポイントアップイベント。
         */
        EventType[EventType["PointUp"] = 7] = "PointUp";
        /**
         * 汎用的なメッセージを表すイベント。
         */
        EventType[EventType["Message"] = 8] = "Message";
        /**
         * 操作プラグインが通知する操作を表すイベント。
         */
        EventType[EventType["Operation"] = 9] = "Operation";
    })(EventType = g.EventType || (g.EventType = {}));
    /**
     * ポインティング操作を表すイベント。
     * PointEvent#targetでそのポインティング操作の対象となったエンティティが、
     * PointEvent#pointでそのエンティティから見ての相対座標が取得できる。
     *
     * 本イベントはマルチタッチに対応しており、PointEvent#pointerIdを参照することで識別することが出来る。
     *
     * abstract
     */
    var PointEvent = (function () {
        function PointEvent(pointerId, target, point, player, local, priority) {
            this.priority = priority;
            this.local = local;
            this.player = player;
            this.pointerId = pointerId;
            this.target = target;
            this.point = point;
        }
        return PointEvent;
    }());
    g.PointEvent = PointEvent;
    /**
     * ポインティング操作の開始を表すイベント。
     */
    var PointDownEvent = (function (_super) {
        __extends(PointDownEvent, _super);
        function PointDownEvent(pointerId, target, point, player, local, priority) {
            var _this = _super.call(this, pointerId, target, point, player, local, priority) || this;
            _this.type = EventType.PointDown;
            return _this;
        }
        return PointDownEvent;
    }(PointEvent));
    g.PointDownEvent = PointDownEvent;
    /**
     * ポインティング操作の終了を表すイベント。
     * PointDownEvent後にのみ発生する。
     *
     * PointUpEvent#startDeltaによってPointDownEvent時からの移動量が、
     * PointUpEvent#prevDeltaによって直近のPointMoveEventからの移動量が取得出来る。
     * PointUpEvent#pointにはPointDownEvent#pointと同じ値が格納される。
     */
    var PointUpEvent = (function (_super) {
        __extends(PointUpEvent, _super);
        function PointUpEvent(pointerId, target, point, prevDelta, startDelta, player, local, priority) {
            var _this = _super.call(this, pointerId, target, point, player, local, priority) || this;
            _this.type = EventType.PointUp;
            _this.prevDelta = prevDelta;
            _this.startDelta = startDelta;
            return _this;
        }
        return PointUpEvent;
    }(PointEvent));
    g.PointUpEvent = PointUpEvent;
    /**
     * ポインティング操作の移動を表すイベント。
     * PointDownEvent後にのみ発生するため、MouseMove相当のものが本イベントとして発生することはない。
     *
     * PointMoveEvent#startDeltaによってPointDownEvent時からの移動量が、
     * PointMoveEvent#prevDeltaによって直近のPointMoveEventからの移動量が取得出来る。
     * PointMoveEvent#pointにはPointMoveEvent#pointと同じ値が格納される。
     *
     * 本イベントは、プレイヤーがポインティングデバイスを移動していなくても、
     * カメラの移動等視覚的にポイントが変化している場合にも発生する。
     */
    var PointMoveEvent = (function (_super) {
        __extends(PointMoveEvent, _super);
        function PointMoveEvent(pointerId, target, point, prevDelta, startDelta, player, local, priority) {
            var _this = _super.call(this, pointerId, target, point, player, local, priority) || this;
            _this.type = EventType.PointMove;
            _this.prevDelta = prevDelta;
            _this.startDelta = startDelta;
            return _this;
        }
        return PointMoveEvent;
    }(PointEvent));
    g.PointMoveEvent = PointMoveEvent;
    /**
     * 汎用的なメッセージを表すイベント。
     * MessageEvent#dataによってメッセージ内容を取得出来る。
     */
    var MessageEvent = (function () {
        function MessageEvent(data, player, local, priority) {
            this.type = EventType.Message;
            this.priority = priority;
            this.local = local;
            this.player = player;
            this.data = data;
        }
        return MessageEvent;
    }());
    g.MessageEvent = MessageEvent;
    /**
     * 操作プラグインが通知する操作を表すイベント。
     * プラグインを識別する `OperationEvent#code` と、プラグインごとの内容 `OperationEvent#data` を持つ。
     */
    var OperationEvent = (function () {
        function OperationEvent(code, data, player, local, priority) {
            this.type = EventType.Operation;
            this.priority = priority;
            this.local = local;
            this.player = player;
            this.code = code;
            this.data = data;
        }
        return OperationEvent;
    }());
    g.OperationEvent = OperationEvent;
    /**
     * プレイヤーの参加を表すイベント。
     * JoinEvent#playerによって、参加したプレイヤーを取得出来る。
     */
    var JoinEvent = (function () {
        function JoinEvent(player, storageValues, priority) {
            this.type = EventType.Join;
            this.priority = priority;
            this.player = player;
            this.storageValues = storageValues;
        }
        return JoinEvent;
    }());
    g.JoinEvent = JoinEvent;
    /**
     * プレイヤーの離脱を表すイベント。
     * LeaveEvent#playerによって、離脱したプレイヤーを取得出来る。
     */
    var LeaveEvent = (function () {
        function LeaveEvent(player, priority) {
            this.type = EventType.Leave;
            this.priority = priority;
            this.player = player;
        }
        return LeaveEvent;
    }());
    g.LeaveEvent = LeaveEvent;
    /**
     * タイムスタンプを表すイベント。
     */
    var TimestampEvent = (function () {
        function TimestampEvent(timestamp, player, priority) {
            this.type = EventType.Timestamp;
            this.priority = priority;
            this.player = player;
            this.timestamp = timestamp;
        }
        return TimestampEvent;
    }());
    g.TimestampEvent = TimestampEvent;
    /**
     * 新しい乱数の発生を表すイベント。
     * SeedEvent#generatorによって、本イベントで発生したRandomGeneratorを取得出来る。
     */
    var SeedEvent = (function () {
        function SeedEvent(generator, priority) {
            this.type = EventType.Seed;
            this.priority = priority;
            this.generator = generator;
        }
        return SeedEvent;
    }());
    g.SeedEvent = SeedEvent;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * ログレベル。
     *
     * - Error: サーバ側でも収集される、ゲーム続行不可能なクリティカルなエラーログ
     * - Warn: サーバ側でも収集される、ゲーム続行可能だが危険な状態であることを示す警告ログ
     * - Info: クライアントでのみ収集される情報ログ
     * - Debug: サンドボックス環境でのみ収集される開発時限定のログ。リリース時には本処理をすべて消してリリースすることが望ましい
     */
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["Error"] = 0] = "Error";
        LogLevel[LogLevel["Warn"] = 1] = "Warn";
        LogLevel[LogLevel["Info"] = 2] = "Info";
        LogLevel[LogLevel["Debug"] = 3] = "Debug";
    })(LogLevel = g.LogLevel || (g.LogLevel = {}));
    /**
     * デバッグ/エラー用のログ出力機構。
     */
    var Logger = (function () {
        /**
         * `Logger` のインスタンスを生成する。
         * @param game この `Logger` に紐づく `Game` 。
         */
        function Logger(game) {
            this.game = game;
            this.logging = new g.Trigger();
        }
        Logger.prototype.destroy = function () {
            this.game = undefined;
            this.logging.destroy();
            this.logging = undefined;
        };
        Logger.prototype.destroyed = function () {
            return !this.game;
        };
        /**
         * `LogLevel.Error` のログを出力する。
         * @param message ログメッセージ
         * @param cause 追加の補助情報。省略された場合、 `undefined`
         * @deprecated このメソッドは非推奨である。ゲーム開発者はこのメソッドではなく単に `console.error()` や `console.log()` を利用すべきである。
         */
        Logger.prototype.error = function (message, cause) {
            this.logging.fire({
                game: this.game,
                level: LogLevel.Error,
                message: message,
                cause: cause
            });
        };
        /**
         * `LogLevel.Warn` のログを出力する。
         * @param message ログメッセージ
         * @param cause 追加の補助情報。省略された場合、 `undefined`
         * @deprecated このメソッドは非推奨である。ゲーム開発者はこのメソッドではなく単に `console.warn()` や `console.log()` を利用すべきである。
         */
        Logger.prototype.warn = function (message, cause) {
            this.logging.fire({
                game: this.game,
                level: LogLevel.Warn,
                message: message,
                cause: cause
            });
        };
        /**
         * `LogLevel.Info` のログを出力する。
         * @param message ログメッセージ
         * @param cause 追加の補助情報。省略された場合、 `undefined`
         * @deprecated このメソッドは非推奨である。ゲーム開発者はこのメソッドではなく単に `console.info()` や `console.log()` を利用すべきである。
         */
        Logger.prototype.info = function (message, cause) {
            this.logging.fire({
                game: this.game,
                level: LogLevel.Info,
                message: message,
                cause: cause
            });
        };
        /**
         * `LogLevel.Debug` のログを出力する。
         * @param message ログメッセージ
         * @param cause 追加の補助情報。省略された場合、 `undefined`
         * @deprecated このメソッドは非推奨である。ゲーム開発者はこのメソッドではなく単に `console.debug()` や `console.log()` を利用すべきである。
         */
        Logger.prototype.debug = function (message, cause) {
            this.logging.fire({
                game: this.game,
                level: LogLevel.Debug,
                message: message,
                cause: cause
            });
        };
        return Logger;
    }());
    g.Logger = Logger;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * コンテンツそのものを表すクラス。
     *
     * 本クラスのインスタンスは暗黙に生成され、ゲーム開発者が生成することはない。
     * ゲーム開発者はg.gameによって本クラスのインスタンスを参照できる。
     *
     * 多くの機能を持つが、本クラスをゲーム開発者が利用するのは以下のようなケースである。
     * 1. Sceneの生成時、コンストラクタに引数として渡す
     * 2. Sceneに紐付かないイベント Game#join, Game#leave, Game#seed を処理する
     * 3. 乱数を発生させるため、Game#randomにアクセスしRandomGeneratorを取得する
     * 4. ログを出力するため、Game#loggerでコンテンツに紐付くLoggerを取得する
     * 5. ゲームのメタ情報を確認するため、Game#width, Game#height, Game#fpsにアクセスする
     * 6. グローバルアセットを取得するため、Game#assetsにアクセスする
     * 7. LoadingSceneを変更するため、Game#loadingSceneにゲーム開発者の定義したLoadingSceneを指定する
     * 8. スナップショット機能を作るため、Game#snapshotRequestにアクセスする
     * 9. 現在フォーカスされているCamera情報を得るため、Game#focusingCameraにアクセスする
     * 10.AudioSystemを直接制御するため、Game#audioにアクセスする
     * 11.Sceneのスタック情報を調べるため、Game#scenesにアクセスする
     */
    var Game = (function () {
        /**
         * `Game` のインスタンスを生成する。
         * @param gameConfiguration この `Game` の設定。典型的には game.json の内容をパースしたものを期待する
         * @param resourceFactory この `Game` が用いる、リソースのファクトリ
         * @param assetBase アセットのパスの基準となるディレクトリ。省略された場合、空文字列
         * @param selfId このゲームを実行するユーザのID。省略された場合、`undefined`
         * @param operationPluginViewInfo このゲームの操作プラグインに与えるviewの情報
         */
        function Game(gameConfiguration, resourceFactory, assetBase, selfId, operationPluginViewInfo) {
            gameConfiguration = this._normalizeConfiguration(gameConfiguration);
            this.fps = gameConfiguration.fps;
            this.width = gameConfiguration.width;
            this.height = gameConfiguration.height;
            this.renderers = [];
            this.scenes = [];
            this.random = null;
            this.age = 0;
            this.assetBase = assetBase || "";
            this.resourceFactory = resourceFactory;
            this.selfId = selfId || undefined;
            this.playId = undefined;
            this._audioSystemManager = new g.AudioSystemManager(this);
            this.audio = {
                music: new g.MusicAudioSystem("music", this),
                sound: new g.SoundAudioSystem("sound", this)
            };
            this.defaultAudioSystemId = "sound";
            this.storage = new g.Storage(this);
            this.assets = {};
            this.surfaceAtlasSet = undefined;
            // TODO: (GAMEDEV-666) この三つのイベントはGame自身がデフォルトのイベントハンドラを持って処理する必要があるかも
            this.join = new g.Trigger();
            this.leave = new g.Trigger();
            this.seed = new g.Trigger();
            this._eventTriggerMap = {};
            this._eventTriggerMap[g.EventType.Join] = this.join;
            this._eventTriggerMap[g.EventType.Leave] = this.leave;
            this._eventTriggerMap[g.EventType.Seed] = this.seed;
            this._eventTriggerMap[g.EventType.Message] = undefined;
            this._eventTriggerMap[g.EventType.PointDown] = undefined;
            this._eventTriggerMap[g.EventType.PointMove] = undefined;
            this._eventTriggerMap[g.EventType.PointUp] = undefined;
            this._eventTriggerMap[g.EventType.Operation] = undefined;
            this.resized = new g.Trigger();
            this.skippingChanged = new g.Trigger();
            this.isLastTickLocal = true;
            this.lastOmittedLocalTickCount = 0;
            this._loaded = new g.Trigger();
            this._started = new g.Trigger();
            this.isLoaded = false;
            this.snapshotRequest = new g.Trigger();
            this.external = {};
            this.logger = new g.Logger(this);
            this._main = gameConfiguration.main;
            this._mainParameter = undefined;
            this._configuration = gameConfiguration;
            this._assetManager = new g.AssetManager(this, gameConfiguration.assets, gameConfiguration.audio, gameConfiguration.moduleMainScripts);
            var operationPluginsField = (gameConfiguration.operationPlugins || []);
            this._operationPluginManager = new g.OperationPluginManager(this, operationPluginViewInfo, operationPluginsField);
            this._operationPluginOperated = new g.Trigger();
            this._operationPluginManager.operated.add(this._operationPluginOperated.fire, this._operationPluginOperated);
            this._sceneChanged = new g.Trigger();
            this._sceneChanged.add(this._updateEventTriggers, this);
            this._initialScene = new g.Scene({
                game: this,
                assetIds: this._assetManager.globalAssetIds(),
                local: true,
                name: "akashic:initial-scene"
            });
            this._initialScene.loaded.add(this._onInitialSceneLoaded, this);
            this._reset({ age: 0 });
        }
        Object.defineProperty(Game.prototype, "focusingCamera", {
            /**
             * 使用中のカメラ。
             *
             * `Game#draw()`, `Game#findPointSource()` のデフォルト値として使用される。
             * この値を変更した場合、変更を描画に反映するためには `Game#modified` に真を代入しなければならない。
             * (ただしこの値が非 `undefined` の時、`Game#focusingCamera.modified()` を呼び出す場合は
             * `Game#modified` の操作は省略できる。)
             */
            // focusingCameraが変更されても古いカメラをtargetCamerasに持つエンティティのEntityStateFlags.Modifiedを取りこぼすことが無いように、変更時にはrenderを呼べるようアクセサを使う
            get: function () {
                return this._focusingCamera;
            },
            set: function (c) {
                if (c === this._focusingCamera)
                    return;
                if (this.modified)
                    this.render(this._focusingCamera);
                this._focusingCamera = c;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * シーンスタックへのシーンの追加と、そのシーンへの遷移を要求する。
         *
         * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
         * 実際のシーン遷移は次のフレームまでに(次のupdateのfireまでに)行われる。
         * このメソッドの呼び出しにより、現在のシーンの `stateChanged` が引数 `SceneState.Deactive` でfireされる。
         * その後 `scene.stateChanged` が引数 `SceneState.Active` でfireされる。
         * @param scene 遷移後のシーン
         */
        Game.prototype.pushScene = function (scene) {
            this._sceneChangeRequests.push({ type: 0 /* Push */, scene: scene });
        };
        /**
         * 現在のシーンの置き換えを要求する。
         *
         * 現在のシーンをシーンスタックから取り除き、指定のシーンを追加することを要求する。
         * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
         * 実際のシーン遷移は次のフレームまでに(次のupdateのfireまでに)行われる。
         * 引数 `preserveCurrent` が偽の場合、このメソッドの呼び出しにより現在のシーンは破棄される。
         * またその時 `stateChanged` が引数 `SceneState.Destroyed` でfireされる。
         * その後 `scene.stateChanged` が引数 `SceneState.Active` でfireされる。
         *
         * @param scene 遷移後のシーン
         * @param preserveCurrent 真の場合、現在のシーンを破棄しない(ゲーム開発者が明示的に破棄せねばならない)。省略された場合、偽
         */
        Game.prototype.replaceScene = function (scene, preserveCurrent) {
            this._sceneChangeRequests.push({ type: 1 /* Replace */, scene: scene, preserveCurrent: preserveCurrent });
        };
        /**
         * 一つ前のシーンに戻ることを要求する。
         *
         * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
         * 実際のシーン遷移は次のフレームまでに(次のupdateのfireまでに)行われる。
         * 引数 `preserveCurrent` が偽の場合、このメソッドの呼び出しにより現在のシーンは破棄される。
         * またその時 `stateChanged` が引数 `SceneState.Destroyed` でfireされる。
         * その後一つ前のシーンの `stateChanged` が引数 `SceneState.Active` でfireされる。
         *
         * @param preserveCurrent 真の場合、現在のシーンを破棄しない(ゲーム開発者が明示的に破棄せねばならない)。省略された場合、偽
         */
        Game.prototype.popScene = function (preserveCurrent) {
            this._sceneChangeRequests.push({ type: 2 /* Pop */, preserveCurrent: preserveCurrent });
        };
        /**
         * 現在のシーンを返す。
         * ない場合、 `undefined` を返す。
         */
        Game.prototype.scene = function () {
            if (!this.scenes.length)
                return undefined;
            return this.scenes[this.scenes.length - 1];
        };
        /**
         * この `Game` の時間経過とそれに伴う処理を行う。
         *
         * 現在の `Scene` に対して `Scene#update` をfireし、 `this.events` に設定されたイベントを処理する。
         * このメソッドの呼び出し後、 `this.events.length` は0である。
         * このメソッドは暗黙に呼び出される。ゲーム開発者がこのメソッドを利用する必要はない。
         *
         * 戻り値は呼び出し前後でシーンが変わった(別のシーンに遷移した)場合、真。でなければ偽。
         * @param advanceAge 偽を与えた場合、`this.age` を進めない。
         * @param omittedTickCount タイムスタンプ待ちを省略する動作などにより、(前回の呼び出し以降に)省かれたローカルティックの数。省略された場合、 `0` 。
         */
        Game.prototype.tick = function (advanceAge, omittedTickCount) {
            var scene = undefined;
            if (this._isTerminated)
                return false;
            this.isLastTickLocal = !advanceAge;
            this.lastOmittedLocalTickCount = omittedTickCount || 0;
            if (this.scenes.length) {
                scene = this.scenes[this.scenes.length - 1];
                if (this.events.length) {
                    var events = this.events;
                    this.events = [];
                    for (var i = 0; i < events.length; ++i) {
                        var trigger = this._eventTriggerMap[events[i].type];
                        if (trigger)
                            trigger.fire(events[i]);
                    }
                }
                scene.update.fire();
                if (advanceAge)
                    ++this.age;
            }
            if (this._sceneChangeRequests.length) {
                this._flushSceneChangeRequests();
                return scene !== this.scenes[this.scenes.length - 1];
            }
            return false;
        };
        /**
         * このGameを描画する。
         *
         * このゲームに紐づけられた `Renderer` (`this.renderers` に含まれるすべての `Renderer` で、この `Game` の描画を行う。
         * このメソッドは暗黙に呼び出される。ゲーム開発者がこのメソッドを利用する必要はない。
         *
         * @param camera 対象のカメラ。省略された場合 `Game.focusingCamera`
         */
        Game.prototype.render = function (camera) {
            if (!camera)
                camera = this.focusingCamera;
            var renderers = this.renderers; // unsafe
            for (var i = 0; i < renderers.length; ++i)
                renderers[i].draw(this, camera);
            this.modified = false;
        };
        /**
         * その座標に反応する `PointSource` を返す。
         *
         * 戻り値は、対象が見つかった場合、 `target` に見つかった `E` を持つ `PointSource` である。
         * 対象が見つからなかった場合、 `undefined` である。
         *
         * 戻り値が `undefined` でない場合、その `target` プロパティは次を満たす:
         * - `E#touchable` が真である
         * - カメラ `camera` から可視である中で最も手前にある
         *
         * @param point 対象の座標
         * @param camera 対象のカメラ。指定しなければ `Game.focusingCamera` が使われる
         */
        Game.prototype.findPointSource = function (point, camera) {
            if (!camera)
                camera = this.focusingCamera;
            return this.scene().findPointSourceByPoint(point, false, camera);
        };
        /**
         * このGameにエンティティを登録する。
         *
         * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に利用する必要はない。
         * `e.id` が `undefined` である場合、このメソッドの呼び出し後、 `e.id` には `this` に一意の値が設定される。
         * `e.local` が偽である場合、このメソッドの呼び出し後、 `this.db[e.id] === e` が成立する。
         * `e.local` が真である場合、 `e.id` の値は不定である。
         *
         * @param e 登録するエンティティ
         */
        Game.prototype.register = function (e) {
            if (e.local) {
                if (e.id === undefined) {
                    e.id = --this._localIdx;
                }
                else {
                    // register前にidがある: スナップショットからの復元用パス
                    // スナップショットはローカルエンティティを残さないはずだが、実装上はできるようにしておく。
                    if (e.id > 0)
                        throw g.ExceptionFactory.createAssertionError("Game#register: invalid local id: " + e.id);
                    if (this._localDb.hasOwnProperty(String(e.id)))
                        throw g.ExceptionFactory.createAssertionError("Game#register: conflicted id: " + e.id);
                    if (this._localIdx > e.id)
                        this._localIdx = e.id;
                }
                this._localDb[e.id] = e;
            }
            else {
                if (e.id === undefined) {
                    e.id = ++this._idx;
                }
                else {
                    // register前にidがある: スナップショットからの復元用パス
                    if (e.id < 0)
                        throw g.ExceptionFactory.createAssertionError("Game#register: invalid non-local id: " + e.id);
                    if (this.db.hasOwnProperty(String(e.id)))
                        throw g.ExceptionFactory.createAssertionError("Game#register: conflicted id: " + e.id);
                    // _idxがユニークな値を作れるよう更新しておく
                    if (this._idx < e.id)
                        this._idx = e.id;
                }
                this.db[e.id] = e;
            }
        };
        /**
         * このGameからエンティティの登録を削除する。
         *
         * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に利用する必要はない。
         * このメソッドの呼び出し後、 `this.db[e.id]` は未定義である。
         * @param e 登録を削除するエンティティ
         */
        Game.prototype.unregister = function (e) {
            if (e.local) {
                delete this._localDb[e.id];
            }
            else {
                delete this.db[e.id];
            }
        };
        /**
         * このゲームを離脱する。
         *
         * 多人数プレイの場合、他のクライアントでは `Game#leave` イベントがfireされる。
         * このメソッドの呼び出し後、このクライアントの操作要求は送信されない。
         */
        Game.prototype.leaveGame = function () {
            this._leaveGame();
        };
        /**
         * このゲームを終了する。
         *
         * エンジンに対して続行の断念を通知する。
         * このメソッドの呼び出し後、このクライアントの操作要求は送信されない。
         * またこのクライアントのゲーム実行は行われない(updateを含むイベントのfireはおきない)。
         */
        Game.prototype.terminateGame = function () {
            this._leaveGame();
            this._isTerminated = true;
            this._terminateGame();
        };
        /**
         * @private
         */
        Game.prototype._fireSceneReady = function (scene) {
            this._sceneChangeRequests.push({ type: 3 /* FireReady */, scene: scene });
        };
        /**
         * @private
         */
        Game.prototype._fireSceneLoaded = function (scene) {
            if (scene._loadingState < g.SceneLoadState.LoadedFired) {
                this._sceneChangeRequests.push({ type: 4 /* FireLoaded */, scene: scene });
            }
        };
        /**
         * @private
         */
        Game.prototype._callSceneAssetHolderHandler = function (assetHolder) {
            this._sceneChangeRequests.push({ type: 5 /* CallAssetHolderHandler */, assetHolder: assetHolder });
        };
        /**
         * @private
         */
        Game.prototype._normalizeConfiguration = function (gameConfiguration) {
            if (!gameConfiguration)
                throw g.ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: invalid arguments");
            if (!("assets" in gameConfiguration))
                gameConfiguration.assets = {};
            if (!("fps" in gameConfiguration))
                gameConfiguration.fps = 30;
            if (typeof gameConfiguration.fps !== "number")
                throw g.ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: fps must be given as a number");
            if (!(0 <= gameConfiguration.fps && gameConfiguration.fps <= 60))
                throw g.ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: fps must be a number in (0, 60].");
            if (typeof gameConfiguration.width !== "number")
                throw g.ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: width must be given as a number");
            if (typeof gameConfiguration.height !== "number")
                throw g.ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: height must be given as a number");
            return gameConfiguration;
        };
        /**
         * @private
         */
        Game.prototype._setAudioPlaybackRate = function (playbackRate) {
            this._audioSystemManager._setPlaybackRate(playbackRate);
        };
        /**
         * @private
         */
        Game.prototype._setMuted = function (muted) {
            this._audioSystemManager._setMuted(muted);
        };
        /**
         * g.OperationEventのデータをデコードする。
         * @private
         */
        Game.prototype._decodeOperationPluginOperation = function (code, op) {
            var plugins = this._operationPluginManager.plugins;
            if (!plugins[code] || !plugins[code].decode)
                return op;
            return plugins[code].decode(op);
        };
        /**
         * ゲーム状態のリセット。
         * @private
         */
        Game.prototype._reset = function (param) {
            this._operationPluginManager.stopAll();
            if (this.scene()) {
                while (this.scene() !== this._initialScene) {
                    this.popScene();
                    this._flushSceneChangeRequests();
                }
                if (!this.isLoaded) {
                    // _initialSceneの読み込みが終わっていない: _initialScene自体は使い回すので単にpopする。
                    this.scenes.pop();
                }
            }
            if (param) {
                if (param.age !== undefined)
                    this.age = param.age;
                if (param.randGen !== undefined)
                    this.random = param.randGen;
            }
            this._audioSystemManager._reset();
            this._loaded.removeAll({ func: this._start, owner: this });
            this.join.removeAll();
            this.leave.removeAll();
            this.seed.removeAll();
            this.resized.removeAll();
            this.skippingChanged.removeAll();
            this._idx = 0;
            this._localIdx = 0;
            this._cameraIdx = 0;
            this.db = {};
            this._localDb = {};
            this.events = [];
            this.modified = true;
            this.loadingScene = undefined;
            this._focusingCamera = undefined;
            this._scriptCaches = {};
            this.snapshotRequest.removeAll();
            this._sceneChangeRequests = [];
            this._isTerminated = false;
            this.vars = {};
            if (this.surfaceAtlasSet)
                this.surfaceAtlasSet.destroy();
            this.surfaceAtlasSet = new g.SurfaceAtlasSet({ game: this });
            switch (this._configuration.defaultLoadingScene) {
                case "none":
                    // Note: 何も描画しない実装として利用している
                    this._defaultLoadingScene = new g.LoadingScene({ game: this });
                    break;
                default:
                    this._defaultLoadingScene = new g.DefaultLoadingScene({ game: this });
                    break;
            }
        };
        /**
         * ゲームを破棄する。
         * エンジンユーザとコンテンツに開放された一部プロパティ(external, vars)は維持する点に注意。
         * @private
         */
        Game.prototype._destroy = function () {
            // ユーザコードを扱う操作プラグインを真っ先に破棄
            this._operationPluginManager.destroy();
            // 到達できるシーンを全て破棄
            if (this.scene()) {
                while (this.scene() !== this._initialScene) {
                    this.popScene();
                    this._flushSceneChangeRequests();
                }
            }
            this._initialScene.destroy();
            if (this.loadingScene && !this.loadingScene.destroyed()) {
                this.loadingScene.destroy();
            }
            if (!this._defaultLoadingScene.destroyed()) {
                this._defaultLoadingScene.destroy();
            }
            // NOTE: fps, width, height, external, vars はそのまま保持しておく
            this.db = undefined;
            this.renderers = undefined;
            this.scenes = undefined;
            this.random = undefined;
            this.events = undefined;
            this.join.destroy();
            this.join = undefined;
            this.leave.destroy();
            this.leave = undefined;
            this.seed.destroy();
            this.seed = undefined;
            this.modified = false;
            this.age = 0;
            this.assets = undefined; // this._initialScene.assets のエイリアスなので、特に破棄処理はしない。
            this.isLoaded = false;
            this.loadingScene = undefined;
            this.assetBase = "";
            this.selfId = undefined;
            var audioSystemIds = Object.keys(this.audio);
            for (var i = 0; i < audioSystemIds.length; ++i)
                this.audio[audioSystemIds[i]].stopAll();
            this.audio = undefined;
            this.defaultAudioSystemId = undefined;
            this.logger.destroy();
            this.logger = undefined;
            this.snapshotRequest.destroy();
            this.snapshotRequest = undefined;
            // TODO より能動的にdestroy処理を入れるべきかもしれない
            this.resourceFactory = undefined;
            this.storage = undefined;
            this.playId = undefined;
            this.operationPlugins = undefined; // this._operationPluginManager.pluginsのエイリアスなので、特に破棄処理はしない。
            this.resized.destroy();
            this.resized = undefined;
            this.skippingChanged.destroy();
            this.skippingChanged = undefined;
            this._eventTriggerMap = undefined;
            this._initialScene = undefined;
            this._defaultLoadingScene = undefined;
            this._sceneChanged.destroy();
            this._sceneChanged = undefined;
            this._scriptCaches = undefined;
            this._loaded.destroy();
            this._loaded = undefined;
            this._started.destroy();
            this._started = undefined;
            this._main = undefined;
            this._mainParameter = undefined;
            this._assetManager.destroy();
            this._assetManager = undefined;
            this._audioSystemManager._game = undefined;
            this._audioSystemManager = undefined;
            this._operationPluginManager = undefined;
            this._operationPluginOperated.destroy();
            this._operationPluginOperated = undefined;
            this._idx = 0;
            this._localDb = {};
            this._localIdx = 0;
            this._cameraIdx = 0;
            this._isTerminated = true;
            this._focusingCamera = undefined;
            this._configuration = undefined;
            this._sceneChangeRequests = [];
            this.surfaceAtlasSet.destroy();
            this.surfaceAtlasSet = undefined;
        };
        /**
         * ゲームを開始する。
         *
         * 存在するシーンをすべて(_initialScene以外; あるなら)破棄し、グローバルアセットを読み込み、完了後ゲーム開発者の実装コードの実行を開始する。
         * このメソッドの二度目以降の呼び出しの前には、 `this._reset()` を呼び出す必要がある。
         * @param param ゲームのエントリポイントに渡す値
         * @private
         */
        Game.prototype._loadAndStart = function (param) {
            this._mainParameter = param || {};
            if (!this.isLoaded) {
                this._loaded.add(this._start, this);
                this.pushScene(this._initialScene);
                this._flushSceneChangeRequests();
            }
            else {
                this._start();
            }
        };
        /**
         * グローバルアセットの読み込みを開始する。
         * 単体テスト用 (mainSceneなど特定アセットの存在を前提にする_loadAndStart()はテストに使いにくい) なので、通常ゲーム開発者が利用することはない
         * @private
         */
        Game.prototype._startLoadingGlobalAssets = function () {
            if (this.isLoaded)
                throw g.ExceptionFactory.createAssertionError("Game#_startLoadingGlobalAssets: already loaded.");
            this.pushScene(this._initialScene);
            this._flushSceneChangeRequests();
        };
        /**
         * @private
         */
        Game.prototype._updateEventTriggers = function (scene) {
            this.modified = true;
            if (!scene) {
                this._eventTriggerMap[g.EventType.Message] = undefined;
                this._eventTriggerMap[g.EventType.PointDown] = undefined;
                this._eventTriggerMap[g.EventType.PointMove] = undefined;
                this._eventTriggerMap[g.EventType.PointUp] = undefined;
                this._eventTriggerMap[g.EventType.Operation] = undefined;
                return;
            }
            this._eventTriggerMap[g.EventType.Message] = scene.message;
            this._eventTriggerMap[g.EventType.PointDown] = scene.pointDownCapture;
            this._eventTriggerMap[g.EventType.PointMove] = scene.pointMoveCapture;
            this._eventTriggerMap[g.EventType.PointUp] = scene.pointUpCapture;
            this._eventTriggerMap[g.EventType.Operation] = scene.operation;
            scene._activate();
        };
        /**
         * @private
         */
        Game.prototype._onInitialSceneLoaded = function () {
            this._initialScene.loaded.remove(this._onInitialSceneLoaded, this);
            this.assets = this._initialScene.assets;
            this.isLoaded = true;
            this._loaded.fire();
        };
        /**
         * @private
         */
        Game.prototype._terminateGame = function () {
            // do nothing.
        };
        /**
         * 要求されたシーン遷移を実行する。
         *
         * `pushScene()` 、 `replaceScene()` や `popScene()` によって要求されたシーン遷移を実行する。
         * 通常このメソッドは、毎フレーム一度、フレームの最後に呼び出されることを期待する (`Game#tick()` がこの呼び出しを行う)。
         * ただしゲーム開始時 (グローバルアセット読み込み・スナップショットローダ起動後またはmainScene実行開始時) に関しては、
         * シーン追加がゲーム開発者の記述によらない (`tick()` の外側である) ため、それぞれの箇所で明示的にこのメソッドを呼び出す。
         * @private
         */
        Game.prototype._flushSceneChangeRequests = function () {
            do {
                var reqs = this._sceneChangeRequests;
                this._sceneChangeRequests = [];
                for (var i = 0; i < reqs.length; ++i) {
                    var req = reqs[i];
                    switch (req.type) {
                        case 0 /* Push */:
                            var oldScene = this.scene();
                            if (oldScene) {
                                oldScene._deactivate();
                            }
                            this._doPushScene(req.scene);
                            break;
                        case 1 /* Replace */:
                            // Note: replaceSceneの場合、pop時点では_sceneChangedをfireしない。_doPushScene() で一度だけfireする。
                            this._doPopScene(req.preserveCurrent, false);
                            this._doPushScene(req.scene);
                            break;
                        case 2 /* Pop */:
                            this._doPopScene(req.preserveCurrent, true);
                            break;
                        case 3 /* FireReady */:
                            if (!req.scene.destroyed())
                                req.scene._fireReady();
                            break;
                        case 4 /* FireLoaded */:
                            if (!req.scene.destroyed())
                                req.scene._fireLoaded();
                            break;
                        case 5 /* CallAssetHolderHandler */:
                            req.assetHolder.callHandler();
                            break;
                        default:
                            throw g.ExceptionFactory.createAssertionError("Game#_flushSceneChangeRequests: unknown scene change request.");
                    }
                }
            } while (this._sceneChangeRequests.length > 0); // flush中に追加される限りflushを続行する
        };
        Game.prototype._doPopScene = function (preserveCurrent, fireSceneChanged) {
            var scene = this.scenes.pop();
            if (scene === this._initialScene)
                throw g.ExceptionFactory.createAssertionError("Game#_doPopScene: invalid call; attempting to pop the initial scene");
            if (!preserveCurrent)
                scene.destroy();
            if (fireSceneChanged)
                this._sceneChanged.fire(this.scene());
        };
        Game.prototype._start = function () {
            this._operationPluginManager.initialize();
            this.operationPlugins = this._operationPluginManager.plugins;
            // deprecated の挙動: エントリポイントの指定がない場合
            if (!this._main) {
                if (!this._mainParameter.snapshot) {
                    if (!this.assets.mainScene)
                        throw g.ExceptionFactory.createAssertionError("Game#_start: global asset 'mainScene' not found.");
                    var mainScene = g._require(this, "mainScene")();
                    this.pushScene(mainScene);
                    this._flushSceneChangeRequests();
                }
                else {
                    if (!this.assets.snapshotLoader)
                        throw g.ExceptionFactory.createAssertionError("Game#_start: global asset 'snapshotLoader' not found.");
                    var loader = g._require(this, "snapshotLoader");
                    loader(this._mainParameter.snapshot);
                    this._flushSceneChangeRequests(); // スナップショットローダもシーン遷移を要求する可能性がある(というかまずする)
                }
                this._started.fire();
                return;
            }
            var mainFun = g._require(this, this._main);
            if (!mainFun || typeof mainFun !== "function")
                throw g.ExceptionFactory.createAssertionError("Game#_start: Entry point '" + this._main + "' not found.");
            mainFun(this._mainParameter);
            this._flushSceneChangeRequests(); // シーン遷移を要求する可能性がある(というかまずする)
            this._started.fire();
        };
        Game.prototype._doPushScene = function (scene, loadingScene) {
            if (!loadingScene)
                loadingScene = this.loadingScene || this._defaultLoadingScene;
            this.scenes.push(scene);
            if (scene._needsLoading() && scene._loadingState < g.SceneLoadState.LoadedFired) {
                if (this._defaultLoadingScene._needsLoading())
                    throw g.ExceptionFactory.createAssertionError("Game#_doPushScene: _defaultLoadingScene must not depend on any assets/storages.");
                this._doPushScene(loadingScene, this._defaultLoadingScene);
                loadingScene.reset(scene);
            }
            else {
                // 読み込み待ちのアセットがなければその場で(loadingSceneに任せず)ロード、SceneReadyを発生させてからLoadingSceneEndを起こす。
                this._sceneChanged.fire(scene);
                if (!scene._loaded) {
                    scene._load();
                    this._fireSceneLoaded(scene);
                }
            }
            this.modified = true;
        };
        return Game;
    }());
    g.Game = Game;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 2D世界におけるカメラ。
     */
    var Camera2D = (function (_super) {
        __extends(Camera2D, _super);
        /**
         * 指定されたパラメータで `Camera2D` のインスタンスを生成する。
         * @param param 初期化に用いるパラメータのオブジェクト
         */
        function Camera2D(param) {
            var _this = _super.call(this, param) || this;
            _this.game = param.game;
            _this.local = !!param.local;
            _this.name = param.name;
            _this._modifiedCount = 0;
            // param の width と height は無視する
            _this.width = param.game.width;
            _this.height = param.game.height;
            _this.id = _this.local ? undefined : _this.game._cameraIdx++;
            return _this;
        }
        /**
         * 与えられたシリアリゼーションでカメラを復元する。
         *
         * @param ser `Camera2D#serialize()` の戻り値
         * @param game 復元されたカメラの属する Game
         */
        Camera2D.deserialize = function (ser, game) {
            var s = ser;
            s.param.game = game;
            var ret = new Camera2D(s.param);
            ret.id = s.id;
            return ret;
        };
        /**
         * カメラ状態の変更をエンジンに通知する。
         *
         * このメソッドの呼び出し後、このカメラのプロパティに対する変更が各 `Renderer` の描画に反映される。
         * ただし逆は真ではない。すなわち、再描画は他の要因によって行われることもある。
         * ゲーム開発者は、このメソッドを呼び出していないことをもって再描画が行われていないことを仮定してはならない。
         *
         * 本メソッドは、このオブジェクトの `Object2D` 由来のプロパティ (`x`, `y`, `angle` など) を変更した場合にも呼びだす必要がある。
         */
        Camera2D.prototype.modified = function () {
            this._modifiedCount = (this._modifiedCount + 1) % 32768;
            if (this._matrix)
                this._matrix._modified = true;
            this.game.modified = true;
        };
        /**
         * このカメラをシリアライズする。
         *
         * このメソッドの戻り値を `Camera2D#deserialize()` に渡すことで同じ値を持つカメラを復元することができる。
         */
        Camera2D.prototype.serialize = function () {
            var ser = {
                id: this.id,
                param: {
                    game: undefined,
                    local: this.local,
                    name: this.name,
                    x: this.x,
                    y: this.y,
                    width: this.width,
                    height: this.height,
                    opacity: this.opacity,
                    scaleX: this.scaleX,
                    scaleY: this.scaleY,
                    angle: this.angle,
                    compositeOperation: this.compositeOperation
                }
            };
            return ser;
        };
        /**
         * @private
         */
        Camera2D.prototype._applyTransformToRenderer = function (renderer) {
            if (this.angle || this.scaleX !== 1 || this.scaleY !== 1) {
                // Note: this.scaleX/scaleYが0の場合描画した結果何も表示されない事になるが、特殊扱いはしない
                renderer.transform(this.getMatrix()._matrix);
            }
            else {
                renderer.translate(-this.x, -this.y);
            }
            if (this.opacity !== 1)
                renderer.opacity(this.opacity);
        };
        /**
         * @private
         */
        Camera2D.prototype._updateMatrix = function () {
            // カメラの angle, x, y はエンティティと逆方向に作用することに注意。
            if (this.angle || this.scaleX !== 1 || this.scaleY !== 1) {
                this._matrix.updateByInverse(this.width, this.height, this.scaleX, this.scaleY, this.angle, this.x, this.y);
            }
            else {
                this._matrix.reset(-this.x, -this.y);
            }
        };
        return Camera2D;
    }(g.Object2D));
    g.Camera2D = Camera2D;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * ゲームの描画を行うクラス。
     *
     * 描画は各エンティティによって行われる。通常、ゲーム開発者が本クラスを利用する必要はない。
     */
    var Renderer = (function () {
        function Renderer() {
        }
        Renderer.prototype.draw = function (game, camera) {
            var scene = game.scene();
            if (!scene)
                return;
            this.begin();
            this.save();
            this.clear();
            if (camera) {
                this.save();
                camera._applyTransformToRenderer(this);
            }
            var children = scene.children;
            for (var i = 0; i < children.length; ++i)
                children[i].render(this, camera);
            if (camera) {
                this.restore();
            }
            this.restore();
            this.end();
        };
        Renderer.prototype.begin = function () {
            // nothing to do
        };
        Renderer.prototype.end = function () {
            // nothing to do
        };
        return Renderer;
    }());
    g.Renderer = Renderer;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 描画領域を表すクラス。
     *
     * このクラスのインスタンスは、エンジンによって暗黙に生成される。
     * ゲーム開発者はこのクラスのインスタンスを明示的に生成する必要はなく、またできない。
     */
    var Surface = (function () {
        /**
         * `Surface` のインスタンスを生成する。
         * @param width 描画領域の幅（整数値でなければならない）
         * @param height 描画領域の高さ（整数値でなければならない）
         * @param drawable 描画可能な実体。省略された場合、 `undefined`
         * @param isDynamic drawableが動画であることを示す値。動画である時、真を渡さなくてはならない。省略された場合、偽。
         */
        function Surface(width, height, drawable, isDynamic) {
            if (isDynamic === void 0) { isDynamic = false; }
            if (width % 1 !== 0 || height % 1 !== 0) {
                throw g.ExceptionFactory.createAssertionError("Surface#constructor: width and height must be integers");
            }
            this.width = width;
            this.height = height;
            if (drawable)
                this._drawable = drawable;
            // this._destroyedは破棄時に一度だけ代入する特殊なフィールドなため、コンストラクタで初期値を代入しない
            this.isDynamic = isDynamic;
            if (this.isDynamic) {
                this.animatingStarted = new g.Trigger();
                this.animatingStopped = new g.Trigger();
            }
            else {
                this.animatingStarted = undefined;
                this.animatingStopped = undefined;
            }
        }
        /**
         * このSurfaceの破棄を行う。
         * 以後、このSurfaceを利用することは出来なくなる。
         */
        Surface.prototype.destroy = function () {
            if (this.animatingStarted) {
                this.animatingStarted.destroy();
            }
            if (this.animatingStopped) {
                this.animatingStopped.destroy();
            }
            this._destroyed = true;
        };
        /**
         * このSurfaceが破棄済であるかどうかを判定する。
         */
        Surface.prototype.destroyed = function () {
            // _destroyedはundefinedかtrueなため、常にbooleanが返すように!!演算子を用いる
            return !!this._destroyed;
        };
        return Surface;
    }());
    g.Surface = Surface;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 単一行のテキストを描画するエンティティ。
     * 本クラスの利用には `BitmapFont` または `DynamicFont` が必要となる。
     */
    var Label = (function (_super) {
        __extends(Label, _super);
        /**
         * 各種パラメータを指定して `Label` のインスタンスを生成する。
         * @param param このエンティティに指定するパラメータ
         */
        function Label(param) {
            var _this = _super.call(this, param) || this;
            _this.text = param.text;
            _this.font = param.font;
            _this.textAlign = ("textAlign" in param) ? param.textAlign : g.TextAlign.Left;
            _this.glyphs = new Array(param.text.length);
            _this.fontSize = param.fontSize;
            _this.maxWidth = param.maxWidth;
            _this.widthAutoAdjust = ("widthAutoAdjust" in param) ? param.widthAutoAdjust : true;
            _this.textColor = param.textColor;
            _this._textWidth = 0;
            _this._game = undefined;
            _this._overhangLeft = 0;
            _this._overhangRight = 0;
            _this._invalidateSelf();
            return _this;
        }
        /**
         * `width` と `textAlign` を設定し、 `widthAutoAdjust` を `false` に設定する。
         *
         * このメソッドは `this.textAlign` を設定するためのユーティリティである。
         * `textAlign` を `TextAlign.Left` 以外に設定する場合には、通常 `width` や `widthAutoAdjust` も設定する必要があるため、それらをまとめて行う。
         * このメソッドの呼び出し後、 `this.invalidate()` を呼び出す必要がある。
         * @param width 幅
         * @param textAlign テキストの描画位置
         */
        Label.prototype.aligning = function (width, textAlign) {
            this.width = width;
            this.widthAutoAdjust = false;
            this.textAlign = textAlign;
        };
        /**
         * このエンティティの描画キャッシュ無効化をエンジンに通知する。
         * このメソッドを呼び出し後、描画キャッシュの再構築が行われ、各 `Renderer` に描画内容の変更が反映される。
         */
        Label.prototype.invalidate = function () {
            this._invalidateSelf();
            _super.prototype.invalidate.call(this);
        };
        /**
         * Label自身の描画を行う。
         */
        Label.prototype.renderSelfFromCache = function (renderer) {
            // glyphのはみ出し量に応じて、描画先のX座標を調整する。
            var destOffsetX;
            switch (this.textAlign) {
                case g.TextAlign.Center:
                    destOffsetX = this.widthAutoAdjust ? this._overhangLeft : 0;
                    break;
                case g.TextAlign.Right:
                    destOffsetX = this.widthAutoAdjust ? this._overhangLeft : this._overhangRight;
                    break;
                default:
                    destOffsetX = this._overhangLeft;
                    break;
            }
            renderer.drawImage(this._cache, 0, 0, this._cacheSize.width + g.CacheableE.PADDING, this._cacheSize.height + g.CacheableE.PADDING, destOffsetX, 0);
        };
        Label.prototype.renderCache = function (renderer) {
            if (!this.fontSize || this.height <= 0 || this._textWidth <= 0) {
                return;
            }
            var scale = (this.maxWidth > 0 && this.maxWidth < this._textWidth) ? this.maxWidth / this._textWidth : 1;
            var offsetX = 0;
            switch (this.textAlign) {
                case g.TextAlign.Center:
                    offsetX = this.width / 2 - (this._textWidth + this._overhangLeft) / 2 * scale;
                    break;
                case g.TextAlign.Right:
                    offsetX = this.width - (this._textWidth + this._overhangLeft) * scale;
                    break;
                default:
                    offsetX -= this._overhangLeft * scale;
                    break;
            }
            renderer.translate(offsetX, 0);
            if (scale !== 1) {
                renderer.transform([scale, 0, 0, 1, 0, 0]);
            }
            renderer.save();
            var glyphScale = this.fontSize / this.font.size;
            for (var i = 0; i < this.glyphs.length; ++i) {
                var glyph = this.glyphs[i];
                var glyphWidth = glyph.advanceWidth * glyphScale;
                var code = glyph.code;
                if (!glyph.isSurfaceValid) {
                    glyph = this.font.glyphForCharacter(code);
                    if (!glyph) {
                        this._outputOfWarnLogWithNoGlyph(code, "renderCache()");
                        continue;
                    }
                }
                if (glyph.surface) {
                    renderer.save();
                    renderer.transform([glyphScale, 0, 0, glyphScale, 0, 0]);
                    renderer.drawImage(glyph.surface, glyph.x, glyph.y, glyph.width, glyph.height, glyph.offsetX, glyph.offsetY);
                    renderer.restore();
                }
                renderer.translate(glyphWidth, 0);
            }
            renderer.restore();
            renderer.save();
            if (this.textColor) {
                renderer.setCompositeOperation(g.CompositeOperation.SourceAtop);
                renderer.fillRect(0, 0, this._textWidth, this.height, this.textColor);
            }
            renderer.restore();
        };
        /**
         * このエンティティを破棄する。
         * 利用している `BitmapFont` の破棄は行わないため、 `BitmapFont` の破棄はコンテンツ製作者が明示的に行う必要がある。
         */
        Label.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        Label.prototype._invalidateSelf = function () {
            this.glyphs.length = 0;
            this._textWidth = 0;
            if (!this.fontSize) {
                this.height = 0;
                return;
            }
            var effectiveTextLastIndex = this.text.length - 1;
            // 右のはみだし量を求めるため、text内での有効な最後の glyph のindexを解決する。
            for (var i = this.text.length - 1; i >= 0; --i) {
                var code = g.Util.charCodeAt(this.text, i);
                if (!code) {
                    continue;
                }
                var glyph = this.font.glyphForCharacter(code);
                if (glyph && glyph.width !== 0 && glyph.advanceWidth !== 0) {
                    effectiveTextLastIndex = i;
                    break;
                }
            }
            var maxHeight = 0;
            var glyphScale = this.font.size > 0 ? this.fontSize / this.font.size : 0;
            for (var i = 0; i <= effectiveTextLastIndex; ++i) {
                var code_1 = g.Util.charCodeAt(this.text, i);
                if (!code_1) {
                    continue;
                }
                var glyph = this.font.glyphForCharacter(code_1);
                if (!glyph) {
                    this._outputOfWarnLogWithNoGlyph(code_1, "_invalidateSelf()");
                    continue;
                }
                if (glyph.width < 0 || glyph.height < 0) {
                    continue;
                }
                if (glyph.x < 0 || glyph.y < 0) {
                    continue;
                }
                this.glyphs.push(glyph);
                // Font に StrokeWidth が設定されている場合、文字の描画内容は、描画の基準点よりも左にはみ出る場合や、glyph.advanceWidth より右にはみ出る場合がある。
                // キャッシュサーフェスの幅は、最初の文字と最後の文字のはみ出し部分を考慮して求める必要がある。
                var overhang = 0;
                if (i === 0) {
                    this._overhangLeft = Math.min(glyph.offsetX, 0);
                    overhang = -this._overhangLeft;
                }
                if (i === effectiveTextLastIndex) {
                    this._overhangRight = Math.max((glyph.width + glyph.offsetX) - glyph.advanceWidth, 0);
                    overhang += this._overhangRight;
                }
                this._textWidth += (glyph.advanceWidth + overhang) * glyphScale;
                var height = glyph.offsetY + glyph.height;
                if (maxHeight < height) {
                    maxHeight = height;
                }
            }
            if (this.widthAutoAdjust) {
                this.width = this._textWidth;
            }
            this.height = maxHeight * glyphScale;
        };
        Label.prototype._outputOfWarnLogWithNoGlyph = function (code, functionName) {
            var str = (code & 0xFFFF0000) ? String.fromCharCode((code & 0xFFFF0000) >>> 16, code & 0xFFFF) : String.fromCharCode(code);
            this.game().logger.warn("Label#" + functionName + ": failed to get a glyph for '" + str + "' " +
                "(BitmapFont might not have the glyph or DynamicFont might create a glyph larger than its atlas).");
        };
        return Label;
    }(g.CacheableE));
    g.Label = Label;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * グリフ。
     */
    var Glyph = (function () {
        /**
         * `Glyph` のインスタンスを生成する。
         */
        function Glyph(code, x, y, width, height, offsetX, offsetY, advanceWidth, surface, isSurfaceValid) {
            if (offsetX === void 0) { offsetX = 0; }
            if (offsetY === void 0) { offsetY = 0; }
            if (advanceWidth === void 0) { advanceWidth = width; }
            if (isSurfaceValid === void 0) { isSurfaceValid = !!surface; }
            this.code = code;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.offsetX = offsetX;
            this.offsetY = offsetY;
            this.advanceWidth = advanceWidth;
            this.surface = surface;
            this.isSurfaceValid = isSurfaceValid;
            this._atlas = null;
        }
        /**
         * グリフの描画上の幅を求める。
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         * @param fontSize フォントサイズ
         */
        Glyph.prototype.renderingWidth = function (fontSize) {
            if (!this.width || !this.height) {
                return 0;
            }
            return fontSize / this.height * this.width;
        };
        return Glyph;
    }());
    g.Glyph = Glyph;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 塗りつぶされた矩形を表すエンティティ。
     */
    var FilledRect = (function (_super) {
        __extends(FilledRect, _super);
        /**
         * 各種パラメータを指定して `FilledRect` のインスタンスを生成する。
         * @param param このエンティティに対するパラメータ
         */
        function FilledRect(param) {
            var _this = _super.call(this, param) || this;
            if (typeof param.cssColor !== "string")
                throw g.ExceptionFactory.createTypeMismatchError("ColorBox#constructor(cssColor)", "string", param.cssColor);
            _this.cssColor = param.cssColor;
            return _this;
        }
        /**
         * このエンティティ自身の描画を行う。
         * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
         */
        FilledRect.prototype.renderSelf = function (renderer) {
            renderer.fillRect(0, 0, this.width, this.height, this.cssColor);
            return true;
        };
        return FilledRect;
    }(g.E));
    g.FilledRect = FilledRect;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 枠を表すエンティティ。
     * クリッピングやパディング、バックグラウンドイメージの演出等の機能を持つため、
     * メニューやメッセージ、ステータスのウィンドウ等に利用されることが期待される。
     * このエンティティの子要素は、このエンティティの持つ `Surface` に描画される。
     */
    var Pane = (function (_super) {
        __extends(Pane, _super);
        /**
         * 各種パラメータを指定して `Pane` のインスタンスを生成する。
         * @param param このエンティティに指定するパラメータ
         */
        function Pane(param) {
            var _this = _super.call(this, param) || this;
            _this._oldWidth = param.width;
            _this._oldHeight = param.height;
            _this.backgroundImage = g.Util.asSurface(param.backgroundImage);
            _this.backgroundEffector = param.backgroundEffector;
            _this._shouldRenderChildren = false;
            _this._padding = param.padding;
            _this._initialize();
            _this._paddingChanged = false;
            _this._bgSurface = undefined;
            _this._bgRenderer = undefined;
            return _this;
        }
        Object.defineProperty(Pane.prototype, "padding", {
            get: function () {
                return this._padding;
            },
            /**
             * パディング。
             * このエンティティの子孫は、パディングに指定された分だけ右・下にずれた場所に描画され、またパディングの矩形サイズでクリッピングされる。
             */
            // NOTE: paddingの変更は頻繁に行われるものでは無いと思われるので、フラグを立てるためにアクセサを使う
            set: function (padding) {
                this._padding = padding;
                this._paddingChanged = true;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * このエンティティに対する変更をエンジンに通知する。
         * このメソッドの呼び出し後、 `this` に対する変更が各 `Renderer` の描画に反映される。
         * このメソッドは描画キャッシュの無効化を保証しない。描画キャッシュの無効化も必要な場合、 `invalidate()`を呼び出さなければならない。
         * 詳細は `E#modified()` のドキュメントを参照。
         */
        Pane.prototype.modified = function (isBubbling) {
            if (isBubbling)
                this.state &= ~2 /* Cached */;
            _super.prototype.modified.call(this);
        };
        Pane.prototype.shouldFindChildrenByPoint = function (point) {
            var p = this._normalizedPadding;
            if (p.left < point.x && this.width - p.right > point.x && p.top < point.y && this.height - p.bottom > point.y) {
                return true;
            }
            return false;
        };
        Pane.prototype.renderCache = function (renderer, camera) {
            if (this.width <= 0 || this.height <= 0) {
                return;
            }
            this._renderBackground();
            this._renderChildren(camera);
            if (this._bgSurface) {
                renderer.drawImage(this._bgSurface, 0, 0, this.width, this.height, 0, 0);
            }
            else if (this.backgroundImage) {
                renderer.drawImage(this.backgroundImage, 0, 0, this.width, this.height, 0, 0);
            }
            if (this._childrenArea.width <= 0 || this._childrenArea.height <= 0) {
                return;
            }
            renderer.save();
            if (this._childrenArea.x !== 0 || this._childrenArea.y !== 0) {
                renderer.translate(this._childrenArea.x, this._childrenArea.y);
            }
            renderer.drawImage(this._childrenSurface, 0, 0, this._childrenArea.width, this._childrenArea.height, 0, 0);
            renderer.restore();
        };
        /**
         * このエンティティを破棄する。また、バックバッファで利用している `Surface` も合わせて破棄される。
         * ただし、 `backgroundImage` に利用している `Surface` の破棄は行わない。
         * @param destroySurface trueを指定した場合、 `backgroundImage` に利用している `Surface` も合わせて破棄する。
         */
        Pane.prototype.destroy = function (destroySurface) {
            if (destroySurface && this.backgroundImage && !this.backgroundImage.destroyed()) {
                this.backgroundImage.destroy();
            }
            if (this._bgSurface && !this._bgSurface.destroyed()) {
                this._bgSurface.destroy();
            }
            if (this._childrenSurface && !this._childrenSurface.destroyed()) {
                this._childrenSurface.destroy();
            }
            this.backgroundImage = undefined;
            this._bgSurface = undefined;
            this._childrenSurface = undefined;
            _super.prototype.destroy.call(this);
        };
        /**
         * @private
         */
        Pane.prototype._renderBackground = function () {
            if (this.backgroundImage && this.backgroundEffector) {
                var bgSurface = this.backgroundEffector.render(this.backgroundImage, this.width, this.height);
                if (this._bgSurface !== bgSurface) {
                    if (this._bgSurface && !this._bgSurface.destroyed()) {
                        this._bgSurface.destroy();
                    }
                    this._bgSurface = bgSurface;
                }
            }
            else {
                this._bgSurface = undefined;
            }
        };
        /**
         * @private
         */
        Pane.prototype._renderChildren = function (camera) {
            var isNew = this._oldWidth !== this.width || this._oldHeight !== this.height || this._paddingChanged;
            if (isNew) {
                this._initialize();
                this._paddingChanged = false;
                this._oldWidth = this.width;
                this._oldHeight = this.height;
            }
            this._childrenRenderer.begin();
            if (!isNew) {
                this._childrenRenderer.clear();
            }
            if (this.children) {
                // Note: concatしていないのでunsafeだが、render中に配列の中身が変わる事はない前提とする
                var children = this.children;
                for (var i = 0; i < children.length; ++i) {
                    children[i].render(this._childrenRenderer, camera);
                }
            }
            this._childrenRenderer.end();
        };
        /**
         * @private
         */
        Pane.prototype._initialize = function () {
            var p = this._padding === undefined ? 0 : this._padding;
            var r;
            if (typeof p === "number") {
                r = { top: p, bottom: p, left: p, right: p };
            }
            else {
                r = this._padding;
            }
            this._childrenArea = {
                x: r.left,
                y: r.top,
                width: this.width - r.left - r.right,
                height: this.height - r.top - r.bottom
            };
            var resourceFactory = this.scene.game.resourceFactory;
            if (this._childrenSurface && !this._childrenSurface.destroyed()) {
                this._childrenSurface.destroy();
            }
            this._childrenSurface = resourceFactory.createSurface(Math.ceil(this._childrenArea.width), Math.ceil(this._childrenArea.height));
            this._childrenRenderer = this._childrenSurface.renderer();
            this._normalizedPadding = r;
        };
        /**
         * このPaneの包含矩形を計算する。
         * Eを継承する他のクラスと異なり、Paneは子要素の位置を包括矩形に含まない。
         * @private
         */
        Pane.prototype._calculateBoundingRect = function (m, c) {
            var matrix = this.getMatrix();
            if (m) {
                matrix = m.multiplyNew(matrix);
            }
            if (!this.visible() || (c && (!this._targetCameras || this._targetCameras.indexOf(c) === -1))) {
                return undefined;
            }
            var thisBoundingRect = { left: 0, right: this.width, top: 0, bottom: this.height };
            var targetCoordinates = [
                { x: thisBoundingRect.left, y: thisBoundingRect.top },
                { x: thisBoundingRect.left, y: thisBoundingRect.bottom },
                { x: thisBoundingRect.right, y: thisBoundingRect.top },
                { x: thisBoundingRect.right, y: thisBoundingRect.bottom }
            ];
            var convertedPoint = matrix.multiplyPoint(targetCoordinates[0]);
            var result = { left: convertedPoint.x, right: convertedPoint.x, top: convertedPoint.y, bottom: convertedPoint.y };
            for (var i = 1; i < targetCoordinates.length; ++i) {
                convertedPoint = matrix.multiplyPoint(targetCoordinates[i]);
                if (result.left > convertedPoint.x)
                    result.left = convertedPoint.x;
                if (result.right < convertedPoint.x)
                    result.right = convertedPoint.x;
                if (result.top > convertedPoint.y)
                    result.top = convertedPoint.y;
                if (result.bottom < convertedPoint.y)
                    result.bottom = convertedPoint.y;
            }
            return result;
        };
        return Pane;
    }(g.CacheableE));
    g.Pane = Pane;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 操作プラグインからの通知をハンドルするクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
     */
    var OperationHandler = (function () {
        function OperationHandler(code, owner, handler) {
            this._code = code;
            this._handler = handler;
            this._handlerOwner = owner;
        }
        OperationHandler.prototype.onOperation = function (op) {
            var iop;
            if (op instanceof Array) {
                iop = { _code: this._code, data: op };
            }
            else {
                iop = op;
                iop._code = this._code;
            }
            this._handler.call(this._handlerOwner, iop);
        };
        return OperationHandler;
    }());
    /**
     * 操作プラグインを管理するクラス。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
     */
    var OperationPluginManager = (function () {
        function OperationPluginManager(game, viewInfo, infos) {
            this.operated = new g.Trigger();
            this.plugins = {};
            this._game = game;
            this._viewInfo = viewInfo;
            this._infos = infos;
            this._initialized = false;
        }
        /**
         * 初期化する。
         * このメソッドの呼び出しは、`this.game._loaded` のfire後でなければならない。
         */
        OperationPluginManager.prototype.initialize = function () {
            if (!this._initialized) {
                this._initialized = true;
                this._loadOperationPlugins();
            }
            this._doAutoStart();
        };
        OperationPluginManager.prototype.destroy = function () {
            this.stopAll();
            this.operated.destroy();
            this.operated = undefined;
            this.plugins = undefined;
            this._game = undefined;
            this._viewInfo = undefined;
            this._infos = undefined;
        };
        OperationPluginManager.prototype.stopAll = function () {
            if (!this._initialized)
                return;
            for (var i = 0; i < this._infos.length; ++i) {
                var info = this._infos[i];
                if (info._plugin)
                    info._plugin.stop();
            }
        };
        OperationPluginManager.prototype._doAutoStart = function () {
            for (var i = 0; i < this._infos.length; ++i) {
                var info = this._infos[i];
                if (!info.manualStart && info._plugin)
                    info._plugin.start();
            }
        };
        OperationPluginManager.prototype._loadOperationPlugins = function () {
            for (var i = 0; i < this._infos.length; ++i) {
                var info = this._infos[i];
                if (!info.script)
                    continue;
                var pluginClass = g._require(this._game, info.script);
                if (!pluginClass.isSupported())
                    continue;
                var plugin = new pluginClass(this._game, this._viewInfo, info.option);
                var code = info.code;
                if (this.plugins[code]) {
                    throw new Error("Plugin#code conflicted for code: " + code);
                }
                this.plugins[code] = plugin;
                info._plugin = plugin;
                var handler = new OperationHandler(code, this.operated, this.operated.fire);
                plugin.operationTrigger.handle(handler, handler.onOperation);
            }
        };
        return OperationPluginManager;
    }());
    g.OperationPluginManager = OperationPluginManager;
})(g || (g = {}));
var g;
(function (g) {
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 文字列描画のフォントウェイト。
     */
    var FontWeight;
    (function (FontWeight) {
        /**
         * 通常のフォントウェイト。
         */
        FontWeight[FontWeight["Normal"] = 0] = "Normal";
        /**
         * 太字のフォントウェイト。
         */
        FontWeight[FontWeight["Bold"] = 1] = "Bold";
    })(FontWeight = g.FontWeight || (g.FontWeight = {}));
    /**
     * ビットマップフォントを逐次生成するフォント。
     */
    var DynamicFont = (function () {
        /**
         * 各種パラメータを指定して `DynamicFont` のインスタンスを生成する。
         * @param param `DynamicFont` に設定するパラメータ
         */
        function DynamicFont(param) {
            this.fontFamily = param.fontFamily;
            this.size = param.size;
            this.hint = ("hint" in param) ? param.hint : {};
            this.fontColor = ("fontColor" in param) ? param.fontColor : "black";
            this.fontWeight = ("fontWeight" in param) ? param.fontWeight : FontWeight.Normal;
            this.strokeWidth = ("strokeWidth" in param) ? param.strokeWidth : 0;
            this.strokeColor = ("strokeColor" in param) ? param.strokeColor : "black";
            this.strokeOnly = ("strokeOnly" in param) ? param.strokeOnly : false;
            this._resourceFactory = param.game.resourceFactory;
            this._glyphFactory =
                this._resourceFactory.createGlyphFactory(this.fontFamily, this.size, this.hint.baselineHeight, this.fontColor, this.strokeWidth, this.strokeColor, this.strokeOnly, this.fontWeight);
            this._glyphs = {};
            this._destroyed = false;
            this._isSurfaceAtlasSetOwner = false;
            // NOTE: hint の特定プロパティ(baselineHeight)を分岐の条件にした場合、後でプロパティを追加した時に
            // ここで追従漏れの懸念があるため、引数の hint が省略されているかで分岐させている。
            if (param.surfaceAtlasSet) {
                this._atlasSet = param.surfaceAtlasSet;
            }
            else if (!!param.hint) {
                this._isSurfaceAtlasSetOwner = true;
                this._atlasSet = new g.SurfaceAtlasSet({
                    game: param.game,
                    hint: this.hint
                });
            }
            else {
                this._atlasSet = param.game.surfaceAtlasSet;
            }
            this._atlasSet.addAtlas();
            if (this.hint.presetChars) {
                for (var i = 0, len = this.hint.presetChars.length; i < len; i++) {
                    var code = g.Util.charCodeAt(this.hint.presetChars, i);
                    if (!code) {
                        continue;
                    }
                    this.glyphForCharacter(code);
                }
            }
        }
        /**
         * グリフの取得。
         *
         * 取得に失敗するとnullが返る。
         *
         * 取得に失敗した時、次のようにすることで成功するかもしれない。
         * - DynamicFont生成時に指定する文字サイズを小さくする
         * - アトラスの初期サイズ・最大サイズを大きくする
         *
         * @param code 文字コード
         */
        DynamicFont.prototype.glyphForCharacter = function (code) {
            var glyph = this._glyphs[code];
            if (!(glyph && glyph.isSurfaceValid)) {
                glyph = this._glyphFactory.create(code);
                if (glyph.surface) {
                    var atlas_1 = this._atlasSet.addGlyph(glyph);
                    if (!atlas_1) {
                        return null;
                    }
                    glyph._atlas = atlas_1;
                    glyph._atlas._accessScore += 1;
                }
                this._glyphs[code] = glyph;
            }
            // スコア更新
            // NOTE: LRUを捨てる方式なら単純なタイムスタンプのほうがわかりやすいかもしれない
            // NOTE: 正確な時刻は必要ないはずで、インクリメンタルなカウンタで代用すればDate()生成コストは省略できる
            for (var i = 0; i < this._atlasSet.getAtlasNum(); i++) {
                var atlas = this._atlasSet.getAtlas(i);
                atlas._accessScore /= 2;
            }
            return glyph;
        };
        /**
         * BtimapFontの生成。
         *
         * 実装上の制限から、このメソッドを呼び出す場合、maxAtlasNum が 1 または undefined/null(1として扱われる) である必要がある。
         * そうでない場合、失敗する可能性がある。
         *
         * @param missingGlyph `BitmapFont#map` に存在しないコードポイントの代わりに表示するべき文字。最初の一文字が用いられる。
         */
        DynamicFont.prototype.asBitmapFont = function (missingGlyphChar) {
            var _this = this;
            if (this._atlasSet.getAtlasNum() !== 1) {
                return null;
            }
            var missingGlyphCharCodePoint;
            if (missingGlyphChar) {
                missingGlyphCharCodePoint = g.Util.charCodeAt(missingGlyphChar, 0);
                this.glyphForCharacter(missingGlyphCharCodePoint);
            }
            var glyphAreaMap = {};
            Object.keys(this._glyphs).forEach(function (_key) {
                var key = Number(_key);
                var glyph = _this._glyphs[key];
                var glyphArea = {
                    x: glyph.x,
                    y: glyph.y,
                    width: glyph.width,
                    height: glyph.height,
                    offsetX: glyph.offsetX,
                    offsetY: glyph.offsetY,
                    advanceWidth: glyph.advanceWidth
                };
                glyphAreaMap[key] = glyphArea;
            });
            // NOTE: (defaultGlyphWidth, defaultGlyphHeight)= (0, this.size) とする
            //
            // それぞれの役割は第一に `GlyphArea#width`, `GlyphArea#height` が与えられないときの
            // デフォルト値である。ここでは必ず与えているのでデフォルト値としては利用されない。
            // しかし defaultGlyphHeight は BitmapFont#size にも用いられる。
            // そのために this.size をコンストラクタの第４引数に与えることにする。
            var missingGlyph = glyphAreaMap[missingGlyphCharCodePoint];
            var surface = this._atlasSet.getAtlas(0).duplicateSurface(this._resourceFactory);
            var bitmapFont = new g.BitmapFont({
                src: surface,
                map: glyphAreaMap,
                defaultGlyphWidth: 0,
                defaultGlyphHeight: this.size,
                missingGlyph: missingGlyph
            });
            return bitmapFont;
        };
        DynamicFont.prototype.destroy = function () {
            if (this._isSurfaceAtlasSetOwner) {
                this._atlasSet.destroy();
            }
            this._glyphs = null;
            this._glyphFactory = null;
            this._destroyed = true;
        };
        DynamicFont.prototype.destroyed = function () {
            return this._destroyed;
        };
        return DynamicFont;
    }());
    g.DynamicFont = DynamicFont;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * SurfaceAtlasの空き領域管理クラス。
     *
     * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
     */
    var SurfaceAtlasSlot = (function () {
        function SurfaceAtlasSlot(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.prev = null;
            this.next = null;
        }
        return SurfaceAtlasSlot;
    }());
    g.SurfaceAtlasSlot = SurfaceAtlasSlot;
    function getSurfaceAtlasSlot(slot, width, height) {
        while (slot) {
            if (slot.width >= width && slot.height >= height) {
                return slot;
            }
            slot = slot.next;
        }
        return null;
    }
    function calcAtlasSize(hint) {
        var width = Math.ceil(Math.min(hint.initialAtlasWidth, hint.maxAtlasWidth));
        var height = Math.ceil(Math.min(hint.initialAtlasHeight, hint.maxAtlasHeight));
        return { width: width, height: height };
    }
    /**
     * サーフェスアトラス。
     *
     * 与えられたサーフェスの指定された領域をコピーし一枚のサーフェスにまとめる。
     *
     * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
     */
    var SurfaceAtlas = (function () {
        function SurfaceAtlas(surface) {
            this._surface = surface;
            this._emptySurfaceAtlasSlotHead = new SurfaceAtlasSlot(0, 0, this._surface.width, this._surface.height);
            this._accessScore = 0;
            this._usedRectangleAreaSize = { width: 0, height: 0 };
        }
        /**
         * @private
         */
        SurfaceAtlas.prototype._acquireSurfaceAtlasSlot = function (width, height) {
            // Renderer#drawImage()でサーフェス上の一部を描画するとき、
            // 指定した部分に隣接する画素がにじみ出る現象が確認されている。
            // ここれではそれを避けるため1pixelの余白を与えている。
            width += 1;
            height += 1;
            var slot = getSurfaceAtlasSlot(this._emptySurfaceAtlasSlotHead, width, height);
            if (!slot) {
                return null;
            }
            var remainWidth = slot.width - width;
            var remainHeight = slot.height - height;
            var left;
            var right;
            if (remainWidth <= remainHeight) {
                left = new SurfaceAtlasSlot(slot.x + width, slot.y, remainWidth, height);
                right = new SurfaceAtlasSlot(slot.x, slot.y + height, slot.width, remainHeight);
            }
            else {
                left = new SurfaceAtlasSlot(slot.x, slot.y + height, width, remainHeight);
                right = new SurfaceAtlasSlot(slot.x + width, slot.y, remainWidth, slot.height);
            }
            left.prev = slot.prev;
            left.next = right;
            if (left.prev === null) {
                this._emptySurfaceAtlasSlotHead = left;
            }
            else {
                left.prev.next = left;
            }
            right.prev = left;
            right.next = slot.next;
            if (right.next) {
                right.next.prev = right;
            }
            var acquiredSlot = new SurfaceAtlasSlot(slot.x, slot.y, width, height);
            this._updateUsedRectangleAreaSize(acquiredSlot);
            return acquiredSlot;
        };
        /**
         * @private
         */
        SurfaceAtlas.prototype._updateUsedRectangleAreaSize = function (slot) {
            var slotRight = slot.x + slot.width;
            var slotBottom = slot.y + slot.height;
            if (slotRight > this._usedRectangleAreaSize.width) {
                this._usedRectangleAreaSize.width = slotRight;
            }
            if (slotBottom > this._usedRectangleAreaSize.height) {
                this._usedRectangleAreaSize.height = slotBottom;
            }
        };
        /**
         * サーフェスの追加。
         *
         * @param glyph グリフのサーフェスが持つ情報をSurfaceAtlasへ配置
         */
        SurfaceAtlas.prototype.addSurface = function (glyph) {
            var slot = this._acquireSurfaceAtlasSlot(glyph.width, glyph.height);
            if (!slot) {
                return null;
            }
            var renderer = this._surface.renderer();
            renderer.begin();
            renderer.drawImage(glyph.surface, glyph.x, glyph.y, glyph.width, glyph.height, slot.x, slot.y);
            renderer.end();
            return slot;
        };
        /**
         * このSurfaceAtlasの破棄を行う。
         * 以後、このSurfaceを利用することは出来なくなる。
         */
        SurfaceAtlas.prototype.destroy = function () {
            this._surface.destroy();
        };
        /**
         * このSurfaceAtlasが破棄済であるかどうかを判定する。
         */
        SurfaceAtlas.prototype.destroyed = function () {
            return this._surface.destroyed();
        };
        /**
         * _surfaceを複製する。
         *
         * 複製されたSurfaceは文字を格納するのに必要な最低限のサイズになる。
         */
        SurfaceAtlas.prototype.duplicateSurface = function (resourceFactory) {
            var src = this._surface;
            var dst = resourceFactory.createSurface(this._usedRectangleAreaSize.width, this._usedRectangleAreaSize.height);
            var renderer = dst.renderer();
            renderer.begin();
            renderer.drawImage(src, 0, 0, this._usedRectangleAreaSize.width, this._usedRectangleAreaSize.height, 0, 0);
            renderer.end();
            return dst;
        };
        return SurfaceAtlas;
    }());
    g.SurfaceAtlas = SurfaceAtlas;
    /**
     * DynamicFontで使用される、SurfaceAtlasを管理する。
     */
    var SurfaceAtlasSet = (function () {
        function SurfaceAtlasSet(params) {
            this._surfaceAtlases = [];
            this._atlasGlyphsTable = [];
            this._resourceFactory = params.game.resourceFactory;
            this._currentAtlasIndex = 0;
            var hint = params.hint ? params.hint : {};
            this._maxAtlasNum = hint.maxAtlasNum ? hint.maxAtlasNum : SurfaceAtlasSet.INITIAL_MAX_SURFACEATLAS_NUM;
            // 指定がないとき、やや古いモバイルデバイスでも確保できると言われる
            // 縦横512pxのテクスチャ一枚のアトラスにまとめる形にする
            // 2048x2048で確保してしまうと、Edge, Chrome にて処理が非常に遅くなることがある
            hint.initialAtlasWidth = hint.initialAtlasWidth ? hint.initialAtlasWidth : 512;
            hint.initialAtlasHeight = hint.initialAtlasHeight ? hint.initialAtlasHeight : 512;
            hint.maxAtlasWidth = hint.maxAtlasWidth ? hint.maxAtlasWidth : 512;
            hint.maxAtlasHeight = hint.maxAtlasHeight ? hint.maxAtlasHeight : 512;
            this._atlasSize = calcAtlasSize(hint);
        }
        /**
         * @private
         */
        SurfaceAtlasSet.prototype._deleteAtlas = function (delteNum) {
            var removedObject = this._removeLeastFrequentlyUsedAtlas(delteNum);
            var removedAtlases = removedObject.surfaceAtlases;
            for (var i = 0; i < removedAtlases.length; ++i) {
                removedAtlases[i].destroy();
            }
        };
        /**
         * 使用度の低いサーフェスアトラスを配列から削除する。
         * @private
         */
        SurfaceAtlasSet.prototype._removeLeastFrequentlyUsedAtlas = function (removedNum) {
            var removedAtlases = [];
            var removedGlyphs = [];
            for (var n = 0; n < removedNum; ++n) {
                var minScore = Number.MAX_VALUE;
                var lowScoreAtlasIndex = -1;
                for (var i = 0; i < this._surfaceAtlases.length; ++i) {
                    if (this._surfaceAtlases[i]._accessScore <= minScore) {
                        minScore = this._surfaceAtlases[i]._accessScore;
                        lowScoreAtlasIndex = i;
                    }
                }
                var removedAtlas = this._surfaceAtlases.splice(lowScoreAtlasIndex, 1)[0];
                removedAtlases.push(removedAtlas);
                removedGlyphs.push(this._atlasGlyphsTable.splice(lowScoreAtlasIndex, 1)[0]);
            }
            return { surfaceAtlases: removedAtlases, glyphs: removedGlyphs };
        };
        /**
         * 空き領域のあるSurfaceAtlasを探索する。
         * glyphが持つ情報をSurfaceAtlasへ移動し、移動したSurfaceAtlasの情報でglyphを置き換える。
         * @private
         */
        SurfaceAtlasSet.prototype._moveGlyphSurface = function (glyph) {
            for (var i = 0; i < this._surfaceAtlases.length; ++i) {
                var index = (this._currentAtlasIndex + i) % this._surfaceAtlases.length;
                var atlas = this._surfaceAtlases[index];
                var slot = atlas.addSurface(glyph);
                if (slot) {
                    this._currentAtlasIndex = index;
                    glyph.surface.destroy();
                    glyph.surface = atlas._surface;
                    glyph.x = slot.x;
                    glyph.y = slot.y;
                    if (!this._atlasGlyphsTable[index])
                        this._atlasGlyphsTable[index] = [];
                    this._atlasGlyphsTable[index].push(glyph);
                    return atlas;
                }
            }
            return null;
        };
        /**
         * サーフェスアトラスの再割り当てを行う。
         * @private
         */
        SurfaceAtlasSet.prototype._reallocateAtlas = function () {
            if (this._surfaceAtlases.length >= this._maxAtlasNum) {
                var removedObject = this._removeLeastFrequentlyUsedAtlas(1);
                var atlas = removedObject.surfaceAtlases[0];
                var glyphs = removedObject.glyphs[0];
                for (var i = 0; i < glyphs.length; i++) {
                    var glyph = glyphs[i];
                    glyph.surface = null;
                    glyph.isSurfaceValid = false;
                    glyph._atlas = null;
                }
                atlas.destroy();
            }
            this._surfaceAtlases.push(this._resourceFactory.createSurfaceAtlas(this._atlasSize.width, this._atlasSize.height));
            this._currentAtlasIndex = this._surfaceAtlases.length - 1;
        };
        /**
         * サーフェスアトラスを追加する。
         *
         * 保持している_surfaceAtlasesの数が最大値以上の場合、削除してから追加する。
         *
         * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `constructor` から暗黙に呼び出される。
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         */
        SurfaceAtlasSet.prototype.addAtlas = function () {
            // removeLeastFrequentlyUsedAtlas()では、SurfaceAtlas#_accessScoreの一番小さい値を持つSurfaceAtlasを削除するため、
            // SurfaceAtlas作成時は_accessScoreは0となっているため、削除判定後に作成,追加処理を行う。
            if (this._surfaceAtlases.length >= this._maxAtlasNum) {
                this._deleteAtlas(1);
            }
            this._surfaceAtlases.push(this._resourceFactory.createSurfaceAtlas(this._atlasSize.width, this._atlasSize.height));
        };
        /**
         * 引数で指定されたindexのサーフェスアトラスを取得する。
         *
         * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `glyphForCharacter()` から暗黙に呼び出される。
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         * @param index 取得対象のインデックス
         */
        SurfaceAtlasSet.prototype.getAtlas = function (index) {
            return this._surfaceAtlases[index];
        };
        /**
         * サーフェスアトラスの保持数を取得する。
         *
         * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `glyphForCharacter()` から暗黙に呼び出される。
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         */
        SurfaceAtlasSet.prototype.getAtlasNum = function () {
            return this._surfaceAtlases.length;
        };
        /**
         * 最大サーフェスアトラス保持数取得する。
         */
        SurfaceAtlasSet.prototype.getMaxAtlasNum = function () {
            return this._maxAtlasNum;
        };
        /**
         * 最大アトラス保持数設定する。
         *
         * 設定された値が、現在保持している_surfaceAtlasesの数より大きい場合、
         * removeLeastFrequentlyUsedAtlas()で設定値まで削除する。
         * @param value 設定値
         */
        SurfaceAtlasSet.prototype.changeMaxAtlasNum = function (value) {
            this._maxAtlasNum = value;
            if (this._surfaceAtlases.length > this._maxAtlasNum) {
                var diff = this._surfaceAtlases.length - this._maxAtlasNum;
                this._deleteAtlas(diff);
            }
        };
        /**
         * サーフェスアトラスのサイズを取得する。
         *
         * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `glyphForCharacter()` から暗黙に呼び出される。
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         */
        SurfaceAtlasSet.prototype.getAtlasSize = function () {
            return this._atlasSize;
        };
        /**
         * サーフェスアトラスにグリフを追加する。
         *
         * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `glyphForCharacter()` から暗黙に呼び出される。
         * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
         * @param glyph グリフ
         */
        SurfaceAtlasSet.prototype.addGlyph = function (glyph) {
            // グリフがアトラスより大きいとき、`_atlasSet.addGlyph()`は失敗する。
            // `_reallocateAtlas()`でアトラス増やしてもこれは解決できない。
            // 無駄な空き領域探索とアトラスの再確保を避けるためにここでリターンする。
            if (glyph.width > this._atlasSize.width || glyph.height > this._atlasSize.height) {
                return null;
            }
            var atlas = this._moveGlyphSurface(glyph);
            if (!atlas) {
                // retry
                this._reallocateAtlas();
                atlas = this._moveGlyphSurface(glyph);
            }
            return atlas;
        };
        /**
         * このインスタンスを破棄する。
         */
        SurfaceAtlasSet.prototype.destroy = function () {
            for (var i = 0; i < this._surfaceAtlases.length; ++i) {
                this._surfaceAtlases[i].destroy();
            }
            this._surfaceAtlases = undefined;
            this._resourceFactory = undefined;
            this._atlasGlyphsTable = undefined;
        };
        /**
         * このインスタンスが破棄済みであるかどうかを返す。
         */
        SurfaceAtlasSet.prototype.destroyed = function () {
            return this._surfaceAtlases === undefined;
        };
        return SurfaceAtlasSet;
    }());
    /**
     * SurfaceAtlas最大保持数初期値
     */
    SurfaceAtlasSet.INITIAL_MAX_SURFACEATLAS_NUM = 10;
    g.SurfaceAtlasSet = SurfaceAtlasSet;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * `Game#audio` の管理クラス。
     *
     * 複数の `AudioSystem` に一括で必要な状態設定を行う。
     * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
     */
    var AudioSystemManager = (function () {
        function AudioSystemManager(game) {
            this._game = game;
            this._muted = false;
            this._playbackRate = 1.0;
        }
        /**
         * @private
         */
        AudioSystemManager.prototype._reset = function () {
            this._muted = false;
            this._playbackRate = 1.0;
            var systems = this._game.audio;
            for (var id in systems) {
                if (!systems.hasOwnProperty(id))
                    continue;
                systems[id]._reset();
            }
        };
        /**
         * @private
         */
        AudioSystemManager.prototype._setMuted = function (muted) {
            if (this._muted === muted)
                return;
            this._muted = muted;
            var systems = this._game.audio;
            for (var id in systems) {
                if (!systems.hasOwnProperty(id))
                    continue;
                systems[id]._setMuted(muted);
            }
        };
        /**
         * @private
         */
        AudioSystemManager.prototype._setPlaybackRate = function (rate) {
            if (this._playbackRate === rate)
                return;
            this._playbackRate = rate;
            var systems = this._game.audio;
            for (var id in systems) {
                if (!systems.hasOwnProperty(id))
                    continue;
                systems[id]._setPlaybackRate(rate);
            }
        };
        return AudioSystemManager;
    }());
    g.AudioSystemManager = AudioSystemManager;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 描画時の合成方法。
     */
    var CompositeOperation;
    (function (CompositeOperation) {
        /**
         * 先に描画された領域の上に描画する。
         */
        CompositeOperation[CompositeOperation["SourceOver"] = 0] = "SourceOver";
        /**
         * 先に描画された領域と重なった部分のみを描画する。
         */
        CompositeOperation[CompositeOperation["SourceAtop"] = 1] = "SourceAtop";
        /**
         * 先に描画された領域と重なった部分の色を加算して描画する。
         */
        CompositeOperation[CompositeOperation["Lighter"] = 2] = "Lighter";
        /**
         * 先に描画された領域を全て無視して描画する。
         */
        CompositeOperation[CompositeOperation["Copy"] = 3] = "Copy";
        /**
         * 先に描画された領域と重なった部分に描画を行い、それ以外の部分を透明にする。
         * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
         */
        CompositeOperation[CompositeOperation["ExperimentalSourceIn"] = 4] = "ExperimentalSourceIn";
        /**
         * 先に描画された領域と重なっていない部分に描画を行い、それ以外の部分を透明にする。
         * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
         */
        CompositeOperation[CompositeOperation["ExperimentalSourceOut"] = 5] = "ExperimentalSourceOut";
        /**
         * 描画する領域だけを表示し、先に描画された領域と重なった部分は描画先を表示する。
         * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
         */
        CompositeOperation[CompositeOperation["ExperimentalDestinationAtop"] = 6] = "ExperimentalDestinationAtop";
        /**
         * 先に描画された領域と重なっていない部分を透明にし、重なった部分は描画先を表示する。
         * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
         */
        CompositeOperation[CompositeOperation["ExperimentalDestinationIn"] = 7] = "ExperimentalDestinationIn";
        /**
         * 描画する領域を透明にする。
         */
        CompositeOperation[CompositeOperation["DestinationOut"] = 8] = "DestinationOut";
        /**
         * 先に描画された領域の下に描画する。
         */
        CompositeOperation[CompositeOperation["DestinationOver"] = 9] = "DestinationOver";
        /**
         * 先に描画された領域と重なった部分のみ透明にする。
         */
        CompositeOperation[CompositeOperation["Xor"] = 10] = "Xor";
    })(CompositeOperation = g.CompositeOperation || (g.CompositeOperation = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * グリフファクトリ。
     *
     * `DynamicFont` はこれを利用してグリフを生成する。
     *
     * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
     */
    var GlyphFactory = (function () {
        /**
         * `GlyphFactory` を生成する。
         *
         * @param fontFamily フォントファミリ。g.FontFamilyの定義する定数、フォント名、またはそれらの配列
         * @param fontSize フォントサイズ
         * @param baselineHeight ベースラインの高さ
         * @param strokeWidth 輪郭幅
         * @param strokeColor 輪郭色
         * @param strokeOnly 輪郭を描画するか否か
         * @param fontWeight フォントウェイト
         */
        function GlyphFactory(fontFamily, fontSize, baselineHeight, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) {
            if (baselineHeight === void 0) { baselineHeight = fontSize; }
            if (fontColor === void 0) { fontColor = "black"; }
            if (strokeWidth === void 0) { strokeWidth = 0; }
            if (strokeColor === void 0) { strokeColor = "black"; }
            if (strokeOnly === void 0) { strokeOnly = false; }
            if (fontWeight === void 0) { fontWeight = g.FontWeight.Normal; }
            this.fontFamily = fontFamily;
            this.fontSize = fontSize;
            this.fontWeight = fontWeight;
            this.baselineHeight = baselineHeight;
            this.fontColor = fontColor;
            this.strokeWidth = strokeWidth;
            this.strokeColor = strokeColor;
            this.strokeOnly = strokeOnly;
        }
        return GlyphFactory;
    }());
    g.GlyphFactory = GlyphFactory;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * シーンに与えるローカルティックの種類
     */
    var LocalTickMode;
    (function (LocalTickMode) {
        /**
         * ローカルティックを受け取らない。
         * 通常の(非ローカル)シーン。
         */
        LocalTickMode[LocalTickMode["NonLocal"] = 0] = "NonLocal";
        /**
         * ローカルティックのみ受け取る。
         * ローカルシーン。
         */
        LocalTickMode[LocalTickMode["FullLocal"] = 1] = "FullLocal";
        /**
         * 消化すべきティックがない場合にローカルティックを受け取る。
         * ローカルティック補間シーン。
         */
        LocalTickMode[LocalTickMode["InterpolateLocal"] = 2] = "InterpolateLocal";
    })(LocalTickMode = g.LocalTickMode || (g.LocalTickMode = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * ナインパッチによる描画処理を提供するSurfaceEffector。
     *
     * このSurfaceEffectorは、画像素材の拡大・縮小において「枠」の表現を実現するものである。
     * 画像の上下左右の「枠」部分の幅・高さを渡すことで、上下の「枠」を縦に引き延ばすことなく、
     * また左右の「枠」を横に引き延ばすことなく画像を任意サイズに拡大・縮小できる。
     * ゲームにおけるメッセージウィンドウやダイアログの表現に利用することを想定している。
     */
    var NinePatchSurfaceEffector = (function () {
        /**
         * `NinePatchSurfaceEffector` のインスタンスを生成する。
         * @param game このインスタンスが属する `Game`
         * @param borderWidth 上下左右の「拡大しない」領域の大きさ。すべて同じ値なら数値一つを渡すことができる。省略された場合、 `4`
         */
        function NinePatchSurfaceEffector(game, borderWidth) {
            if (borderWidth === void 0) { borderWidth = 4; }
            this.game = game;
            if (typeof borderWidth === "number") {
                this.borderWidth = { top: borderWidth, bottom: borderWidth, left: borderWidth, right: borderWidth };
            }
            else {
                this.borderWidth = borderWidth;
            }
        }
        /**
         * 指定の大きさに拡大・縮小した描画結果の `Surface` を生成して返す。詳細は `SurfaceEffector#render` の項を参照。
         */
        NinePatchSurfaceEffector.prototype.render = function (srcSurface, width, height) {
            var isCreateSurface = true;
            if (!this._surface || this._surface.width !== width || this._surface.height !== height || this._beforeSrcSurface !== srcSurface) {
                this._surface = this.game.resourceFactory.createSurface(Math.ceil(width), Math.ceil(height));
                this._beforeSrcSurface = srcSurface;
            }
            else {
                isCreateSurface = false;
            }
            var renderer = this._surface.renderer();
            renderer.begin();
            if (!isCreateSurface)
                renderer.clear();
            //    x0  x1                          x2
            // y0 +-----------------------------------+
            //    | 1 |             5             | 2 |
            // y1 |---+---------------------------+---|
            //    |   |                           |   |
            //    | 7 |             9             | 8 |
            //    |   |                           |   |
            // y2 |---+---------------------------+---|
            //    | 3 |             6             | 4 |
            //    +-----------------------------------+
            //
            // 1-4: 拡縮無し
            // 5-6: 水平方向へ拡縮
            // 7-8: 垂直方向へ拡縮
            // 9  : 全方向へ拡縮
            var sx1 = this.borderWidth.left;
            var sx2 = srcSurface.width - this.borderWidth.right;
            var sy1 = this.borderWidth.top;
            var sy2 = srcSurface.height - this.borderWidth.bottom;
            var dx1 = this.borderWidth.left;
            var dx2 = width - this.borderWidth.right;
            var dy1 = this.borderWidth.top;
            var dy2 = height - this.borderWidth.bottom;
            // Draw corners
            var srcCorners = [
                { x: 0, y: 0, width: this.borderWidth.left, height: this.borderWidth.top },
                { x: sx2, y: 0, width: this.borderWidth.right, height: this.borderWidth.top },
                { x: 0, y: sy2, width: this.borderWidth.left, height: this.borderWidth.bottom },
                { x: sx2, y: sy2, width: this.borderWidth.right, height: this.borderWidth.bottom }
            ];
            var destCorners = [
                { x: 0, y: 0 },
                { x: dx2, y: 0 },
                { x: 0, y: dy2 },
                { x: dx2, y: dy2 }
            ];
            var i = 0;
            for (i = 0; i < srcCorners.length; ++i) {
                var c = srcCorners[i];
                renderer.save();
                renderer.translate(destCorners[i].x, destCorners[i].y);
                renderer.drawImage(srcSurface, c.x, c.y, c.width, c.height, 0, 0);
                renderer.restore();
            }
            // Draw borders
            var srcBorders = [
                { x: sx1, y: 0, width: sx2 - sx1, height: this.borderWidth.top },
                { x: 0, y: sy1, width: this.borderWidth.left, height: sy2 - sy1 },
                { x: sx2, y: sy1, width: this.borderWidth.right, height: sy2 - sy1 },
                { x: sx1, y: sy2, width: sx2 - sx1, height: this.borderWidth.bottom }
            ];
            var destBorders = [
                { x: dx1, y: 0, width: dx2 - dx1, height: this.borderWidth.top },
                { x: 0, y: dy1, width: this.borderWidth.left, height: dy2 - dy1 },
                { x: dx2, y: dy1, width: this.borderWidth.right, height: dy2 - dy1 },
                { x: dx1, y: dy2, width: dx2 - dx1, height: this.borderWidth.bottom }
            ];
            for (i = 0; i < srcBorders.length; ++i) {
                var s = srcBorders[i];
                var d = destBorders[i];
                renderer.save();
                renderer.translate(d.x, d.y);
                renderer.transform([d.width / s.width, 0, 0, d.height / s.height, 0, 0]);
                renderer.drawImage(srcSurface, s.x, s.y, s.width, s.height, 0, 0);
                renderer.restore();
            }
            // Draw center
            var sw = sx2 - sx1;
            var sh = sy2 - sy1;
            var dw = dx2 - dx1;
            var dh = dy2 - dy1;
            renderer.save();
            renderer.translate(dx1, dy1);
            renderer.transform([dw / sw, 0, 0, dh / sh, 0, 0]);
            renderer.drawImage(srcSurface, sx1, sy1, sw, sh, 0, 0);
            renderer.restore();
            renderer.end();
            return this._surface;
        };
        return NinePatchSurfaceEffector;
    }());
    g.NinePatchSurfaceEffector = NinePatchSurfaceEffector;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * パスユーティリティ。
     * 通常、ゲーム開発者がファイルパスを扱うことはなく、このモジュールのメソッドを呼び出す必要はない。
     */
    var PathUtil;
    (function (PathUtil) {
        /**
         * 二つのパス文字列をつなぎ、相対パス表現 (".", "..") を解決して返す。
         * @param base 左辺パス文字列 (先頭の "./" を除き、".", ".." を含んではならない)
         * @param path 右辺パス文字列
         */
        function resolvePath(base, path) {
            function split(str) {
                var ret = str.split("/");
                if (ret[ret.length - 1] === "")
                    ret.pop();
                return ret;
            }
            if (path === "")
                return base;
            var baseComponents = PathUtil.splitPath(base);
            var parts = split(baseComponents.path).concat(split(path));
            var resolved = [];
            for (var i = 0; i < parts.length; ++i) {
                var part = parts[i];
                switch (part) {
                    case "..":
                        var popped = resolved.pop();
                        if (popped === undefined || popped === "" || popped === ".")
                            throw g.ExceptionFactory.createAssertionError("PathUtil.resolvePath: invalid arguments");
                        break;
                    case ".":
                        if (resolved.length === 0) {
                            resolved.push(".");
                        }
                        break;
                    case "":
                        resolved = [""];
                        break;
                    default:
                        resolved.push(part);
                }
            }
            return baseComponents.host + resolved.join("/");
        }
        PathUtil.resolvePath = resolvePath;
        /**
         * パス文字列からディレクトリ名部分を切り出して返す。
         * @param path パス文字列
         */
        function resolveDirname(path) {
            var index = path.lastIndexOf("/");
            if (index === -1)
                return path;
            return path.substr(0, index);
        }
        PathUtil.resolveDirname = resolveDirname;
        /**
         * パス文字列から拡張子部分を切り出して返す。
         * @param path パス文字列
         */
        function resolveExtname(path) {
            for (var i = path.length - 1; i >= 0; --i) {
                var c = path.charAt(i);
                if (c === ".") {
                    return path.substr(i);
                }
                else if (c === "/") {
                    return "";
                }
            }
            return "";
        }
        PathUtil.resolveExtname = resolveExtname;
        /**
         * パス文字列から、node.js において require() の探索範囲になるパスの配列を作成して返す。
         * @param path ディレクトリを表すパス文字列
         */
        function makeNodeModulePaths(path) {
            var pathComponents = PathUtil.splitPath(path);
            var host = pathComponents.host;
            path = pathComponents.path;
            if (path[path.length - 1] === "/") {
                path = path.slice(0, path.length - 1);
            }
            var parts = path.split("/");
            var firstDir = parts.indexOf("node_modules");
            var root = (firstDir > 0) ? firstDir - 1 : 0;
            var dirs = [];
            for (var i = parts.length - 1; i >= root; --i) {
                if (parts[i] === "node_modules")
                    continue;
                var dirParts = parts.slice(0, i + 1);
                dirParts.push("node_modules");
                var dir = dirParts.join("/");
                dirs.push(host + dir);
            }
            return dirs;
        }
        PathUtil.makeNodeModulePaths = makeNodeModulePaths;
        /**
         * 与えられたパス文字列に与えられた拡張子を追加する。
         * @param path パス文字列
         * @param ext 追加する拡張子
         */
        function addExtname(path, ext) {
            var index = path.indexOf("?");
            if (index === -1) {
                return path + "." + ext;
            }
            // hoge?query => hoge.ext?query
            return path.substring(0, index) + "." + ext + path.substring(index, path.length);
        }
        PathUtil.addExtname = addExtname;
        /**
         * 与えられたパス文字列からホストを切り出す。
         * @param path パス文字列
         */
        function splitPath(path) {
            var host = "";
            var doubleSlashIndex = path.indexOf("//");
            if (doubleSlashIndex >= 0) {
                var hostSlashIndex = path.indexOf("/", doubleSlashIndex + 2); // 2 === "//".length
                if (hostSlashIndex >= 0) {
                    host = path.slice(0, hostSlashIndex);
                    path = path.slice(hostSlashIndex); // 先頭に "/" を残して絶対パス扱いさせる
                }
                else {
                    host = path;
                    path = "/"; // path全体がホストだったので、絶対パス扱いさせる
                }
            }
            else {
                host = "";
            }
            return { host: host, path: path };
        }
        PathUtil.splitPath = splitPath;
    })(PathUtil = g.PathUtil || (g.PathUtil = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 文字列描画のフォントファミリ。
     * 現バージョンのakashic-engineの `SystemLabel` 及び `DynamicFont` において、この値の指定は参考値に過ぎない。
     * そのため、 それらにおいて 'fontFamily` プロパティを指定した際、実行環境によっては無視される事がありえる。
     */
    var FontFamily;
    (function (FontFamily) {
        /**
         * サンセリフ体。ＭＳ Ｐゴシック等
         */
        FontFamily[FontFamily["SansSerif"] = 0] = "SansSerif";
        /**
         * セリフ体。ＭＳ 明朝等
         */
        FontFamily[FontFamily["Serif"] = 1] = "Serif";
        /**
         * 等幅。ＭＳ ゴシック等
         */
        FontFamily[FontFamily["Monospace"] = 2] = "Monospace";
    })(FontFamily = g.FontFamily || (g.FontFamily = {}));
})(g || (g = {}));
var g;
(function (g_1) {
    /**
     * ラスタ画像によるフォント。
     */
    var BitmapFont = (function () {
        /**
         * 各種パラメータを指定して `BitmapFont` のインスタンスを生成する。
         * @param param `BitmapFont` に設定するパラメータ
         */
        function BitmapFont(param) {
            this.surface = g_1.Util.asSurface(param.src);
            this.map = param.map;
            this.defaultGlyphWidth = param.defaultGlyphWidth;
            this.defaultGlyphHeight = param.defaultGlyphHeight;
            this.missingGlyph = param.missingGlyph;
            this.size = param.defaultGlyphHeight;
        }
        /**
         * コードポイントに対応するグリフを返す。
         * @param code コードポイント
         */
        BitmapFont.prototype.glyphForCharacter = function (code) {
            var g = this.map[code] || this.missingGlyph;
            if (!g) {
                return null;
            }
            var w = g.width === undefined ? this.defaultGlyphWidth : g.width;
            var h = g.height === undefined ? this.defaultGlyphHeight : g.height;
            var offsetX = g.offsetX || 0;
            var offsetY = g.offsetY || 0;
            var advanceWidth = g.advanceWidth === undefined ? w : g.advanceWidth;
            var surface = (w === 0 || h === 0) ? undefined : this.surface;
            return new g_1.Glyph(code, g.x, g.y, w, h, offsetX, offsetY, advanceWidth, surface, true);
        };
        /**
         * 利用している `Surface` を破棄した上で、このフォントを破棄する。
         */
        BitmapFont.prototype.destroy = function () {
            if (this.surface && !this.surface.destroyed()) {
                this.surface.destroy();
            }
            this.map = undefined;
        };
        /**
         * 破棄されたオブジェクトかどうかを判定する。
         */
        BitmapFont.prototype.destroyed = function () {
            // mapをfalsy値で作成された場合最初から破棄扱いになるが、仕様とする
            return !this.map;
        };
        return BitmapFont;
    }());
    g_1.BitmapFont = BitmapFont;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 文字列描画のベースライン。
     */
    var TextBaseline;
    (function (TextBaseline) {
        /**
         * em squareの上。
         */
        TextBaseline[TextBaseline["Top"] = 0] = "Top";
        /**
         * em squareの中央。
         */
        TextBaseline[TextBaseline["Middle"] = 1] = "Middle";
        /**
         * 標準的とされるベースライン。Bottomよりやや上方。
         */
        TextBaseline[TextBaseline["Alphabetic"] = 2] = "Alphabetic";
        /**
         * em squareの下。
         */
        TextBaseline[TextBaseline["Bottom"] = 3] = "Bottom";
    })(TextBaseline = g.TextBaseline || (g.TextBaseline = {}));
    /**
     * システムフォントで文字列を描画するエンティティ。
     *
     * ここでいうシステムフォントとは、akashic-engine実行環境でのデフォルトフォントである。
     * システムフォントは実行環境によって異なる場合がある。したがって `SystemLabel` による描画結果が各実行環境で同一となることは保証されない。
     * その代わりに `SystemLabel` は、Assetの読み込みなしで文字列を描画する機能を提供する。
     *
     * 絵文字などを含むユニコード文字列をすべて `BitmapFont` で提供する事は難しいことから、
     * このクラスは、事実上akashic-engineにおいてユーザ入力文字列を取り扱う唯一の手段である。
     *
     * `SystemLabel` はユーザインタラクションの対象に含めるべきではない。
     * 上述のとおり、各実行環境で描画内容の同一性が保証されないためである。
     * ユーザ入力文字列を含め、 `SystemLabel` によって提示される情報は、参考程度に表示されるなどに留めるべきである。
     * 具体的には `SystemLabel` を `touchable` にする、 `Util.createSpriteFromE()` の対象に含めるなどを行うべきではない。
     * ボタンのようなエンティティのキャプション部分も出来る限り `Label` を用いるべきで、 `SystemLabel` を利用するべきではない。
     *
     * また、akashic-engineは `SystemLabel` の描画順を保証しない。
     * 実行環境によって、次のどちらかが成立する:
     * * `SystemLabel` は、他エンティティ同様に `Scene#children` のツリー構造のpre-order順で描かれる。
     * * `SystemLabel` は、他の全エンティティが描画された後に(画面最前面に)描画される。
     *
     * 実行環境に依存しないゲームを作成するためには、`SystemLabel` はこのいずれでも正しく動作するように利用される必要がある。
     */
    var SystemLabel = (function (_super) {
        __extends(SystemLabel, _super);
        /**
         * 各種パラメータを指定して `SystemLabel` のインスタンスを生成する。
         * @param param このエンティティに指定するパラメータ
         */
        function SystemLabel(param) {
            var _this = _super.call(this, param) || this;
            _this.text = param.text;
            _this.fontSize = param.fontSize;
            _this.textAlign = ("textAlign" in param) ? param.textAlign : g.TextAlign.Left;
            _this.textBaseline = ("textBaseline" in param) ? param.textBaseline : TextBaseline.Alphabetic;
            _this.maxWidth = param.maxWidth;
            _this.textColor = ("textColor" in param) ? param.textColor : "black";
            _this.fontFamily = ("fontFamily" in param) ? param.fontFamily : g.FontFamily.SansSerif;
            _this.strokeWidth = ("strokeWidth" in param) ? param.strokeWidth : 0;
            _this.strokeColor = ("strokeColor" in param) ? param.strokeColor : "black";
            _this.strokeOnly = ("strokeOnly" in param) ? param.strokeOnly : false;
            return _this;
        }
        SystemLabel.prototype.renderSelf = function (renderer, camera) {
            if (this.text) {
                var offsetX;
                switch (this.textAlign) {
                    case g.TextAlign.Right:
                        offsetX = this.width;
                        break;
                    case g.TextAlign.Center:
                        offsetX = this.width / 2;
                        break;
                    default:
                        offsetX = 0;
                }
                renderer.drawSystemText(this.text, offsetX, 0, this.maxWidth, this.fontSize, this.textAlign, this.textBaseline, this.textColor, this.fontFamily, this.strokeWidth, this.strokeColor, this.strokeOnly);
            }
            return true;
        };
        return SystemLabel;
    }(g.E));
    g.SystemLabel = SystemLabel;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * テキストの描画位置。
     */
    var TextAlign;
    (function (TextAlign) {
        /**
         * 左寄せ。
         */
        TextAlign[TextAlign["Left"] = 0] = "Left";
        /**
         * 中央寄せ。
         */
        TextAlign[TextAlign["Center"] = 1] = "Center";
        /**
         * 右寄せ。
         */
        TextAlign[TextAlign["Right"] = 2] = "Right";
    })(TextAlign = g.TextAlign || (g.TextAlign = {}));
})(g || (g = {}));
var g;
(function (g) {
    /**
     * 時間経過の契機(ティック)をどのように生成するか。
     * ただしローカルティック(ローカルシーンの間などの「各プレイヤー間で独立な時間経過処理」)はこのモードの影響を受けない。
     */
    var TickGenerationMode;
    (function (TickGenerationMode) {
        /**
         * 実際の時間経過に従う。
         */
        TickGenerationMode[TickGenerationMode["ByClock"] = 0] = "ByClock";
        /**
         * 時間経過は明示的に要求する。
         * この値を用いる `Scene` の間は、 `Game#raiseTick()` を呼び出さない限り時間経過が起きない。
         */
        TickGenerationMode[TickGenerationMode["Manual"] = 1] = "Manual";
    })(TickGenerationMode = g.TickGenerationMode || (g.TickGenerationMode = {}));
})(g || (g = {}));
var g;
(function (g) {
    // Copyright (c) 2014 Andreas Madsen & Emil Bay
    // From https://github.com/AndreasMadsen/xorshift
    // https://github.com/AndreasMadsen/xorshift/blob/master/LICENSE.md
    // Arranged by DWANGO Co., Ltd.
    var Xorshift = (function () {
        function Xorshift(seed) {
            this.initState(seed);
        }
        Xorshift.deserialize = function (ser) {
            var ret = new Xorshift(0);
            ret._state0U = ser._state0U;
            ret._state0L = ser._state0L;
            ret._state1U = ser._state1U;
            ret._state1L = ser._state1L;
            return ret;
        };
        // シード値が1つの場合にどのようにして初期状態を定義するかは特に定まっていない
        // このコードはロジック的な裏付けは無いが採用例が多いために採用した
        // 以下採用例
        // http://meme.biology.tohoku.ac.jp/klabo-wiki/index.php?cmd=read&page=%B7%D7%BB%BB%B5%A1%2FC%2B%2B#y919a7e1
        // http://hexadrive.sblo.jp/article/63660775.html
        // http://meme.biology.tohoku.ac.jp/students/iwasaki/cxx/random.html#xorshift
        Xorshift.prototype.initState = function (seed) {
            var factor = 1812433253;
            seed = factor * (seed ^ (seed >> 30)) + 1;
            this._state0U = seed;
            seed = factor * (seed ^ (seed >> 30)) + 2;
            this._state0L = seed;
            seed = factor * (seed ^ (seed >> 30)) + 3;
            this._state1U = seed;
            seed = factor * (seed ^ (seed >> 30)) + 4;
            this._state1L = seed;
        };
        Xorshift.prototype.randomInt = function () {
            var s1U = this._state0U;
            var s1L = this._state0L;
            var s0U = this._state1U;
            var s0L = this._state1L;
            this._state0U = s0U;
            this._state0L = s0L;
            var t1U = 0;
            var t1L = 0;
            var t2U = 0;
            var t2L = 0;
            var a1 = 23;
            var m1 = 0xFFFFFFFF << (32 - a1);
            t1U = (s1U << a1) | ((s1L & m1) >>> (32 - a1));
            t1L = s1L << a1;
            s1U = s1U ^ t1U;
            s1L = s1L ^ t1L;
            t1U = s1U ^ s0U;
            t1L = s1L ^ s0L;
            var a2 = 17;
            var m2 = 0xFFFFFFFF >>> (32 - a2);
            t2U = s1U >>> a2;
            t2L = (s1L >>> a2) | ((s1U & m2) << (32 - a2));
            t1U = t1U ^ t2U;
            t1L = t1L ^ t2L;
            var a3 = 26;
            var m3 = 0xFFFFFFFF >>> (32 - a3);
            t2U = s0U >>> a3;
            t2L = (s0L >>> a3) | ((s0U & m3) << (32 - a3));
            t1U = t1U ^ t2U;
            t1L = t1L ^ t2L;
            this._state1U = t1U;
            this._state1L = t1L;
            var sumL = (t1L >>> 0) + (s0L >>> 0);
            t2U = (t1U + s0U + (sumL / 2 >>> 31)) >>> 0;
            t2L = sumL >>> 0;
            return [t2U, t2L];
        };
        Xorshift.prototype.random = function () {
            var t2 = this.randomInt();
            return (t2[0] * 4294967296 + t2[1]) / 18446744073709551616;
        };
        Xorshift.prototype.nextInt = function (min, sup) {
            return Math.floor(min + this.random() * (sup - min));
        };
        Xorshift.prototype.serialize = function () {
            return {
                _state0U: this._state0U,
                _state0L: this._state0L,
                _state1U: this._state1U,
                _state1L: this._state1L
            };
        };
        return Xorshift;
    }());
    g.Xorshift = Xorshift;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * Xorshiftを用いた乱数生成期。
     */
    var XorshiftRandomGenerator = (function (_super) {
        __extends(XorshiftRandomGenerator, _super);
        function XorshiftRandomGenerator(seed, xorshift) {
            var _this = this;
            if (seed === undefined) {
                throw g.ExceptionFactory.createAssertionError("XorshiftRandomGenerator#constructor: seed is undefined");
            }
            else {
                _this = _super.call(this, seed) || this;
                if (!!xorshift) {
                    _this._xorshift = g.Xorshift.deserialize(xorshift);
                }
                else {
                    _this._xorshift = new g.Xorshift(seed);
                }
            }
            return _this;
        }
        XorshiftRandomGenerator.deserialize = function (ser) {
            return new XorshiftRandomGenerator(ser._seed, ser._xorshift);
        };
        XorshiftRandomGenerator.prototype.get = function (min, max) {
            return this._xorshift.nextInt(min, max + 1);
        };
        XorshiftRandomGenerator.prototype.serialize = function () {
            return {
                _seed: this.seed,
                _xorshift: this._xorshift.serialize()
            };
        };
        return XorshiftRandomGenerator;
    }(g.RandomGenerator));
    g.XorshiftRandomGenerator = XorshiftRandomGenerator;
})(g || (g = {}));
var g;
(function (g) {
    /**
     * akashic-engineにおけるシェーダ機能を提供するクラス。
     * 現バージョンのakashic-engineではフラグメントシェーダのみをサポートする。
     */
    var ShaderProgram = (function () {
        /**
         * 各種パラメータを指定して `ShaderProgram` のインスタンスを生成する。
         * @param param `ShaderProgram` に設定するパラメータ
         */
        function ShaderProgram(param) {
            this.fragmentShader = param.fragmentShader;
            this.uniforms = param.uniforms;
        }
        return ShaderProgram;
    }());
    g.ShaderProgram = ShaderProgram;
})(g || (g = {}));
// ordered files
/// <reference path="AssetLoadErrorType.ts" />
/// <reference path="errors.ts" />
/// <reference path="ResourceFactory.ts" />
/// <reference path="commons.ts" />
/// <reference path="RequireCacheable.ts" />
/// <reference path="RequireCachedValue.ts" />
/// <reference path="Destroyable.ts" />
/// <reference path="Registrable.ts" />
/// <reference path="RandomGenerator.ts" />
/// <reference path="EntityStateFlags.ts" />
/// <reference path="AssetLoadHandler.ts" />
/// <reference path="Asset.ts" />
/// <reference path="AssetManagerLoadHandler.ts" />
/// <reference path="AssetLoadFailureInfo.ts" />
/// <reference path="AssetManager.ts" />
/// <reference path="Module.ts" />
/// <reference path="ScriptAssetExecuteEnvironment.ts" />
/// <reference path="ScriptAssetContext.ts" />
/// <reference path="Matrix.ts" />
/// <reference path="Util.ts" />
/// <reference path="Collision.ts" />
/// <reference path="Trigger.ts" />
/// <reference path="Timer.ts" />
/// <reference path="TimerManager.ts" />
/// <reference path="AudioPlayer.ts" />
/// <reference path="AudioSystem.ts" />
/// <reference path="VideoPlayer.ts" />
/// <reference path="VideoSystem.ts" />
/// <reference path="Object2D.ts" />
/// <reference path="E.ts" />
/// <reference path="CacheableE.ts" />
/// <reference path="Storage.ts" />
/// <reference path="Scene.ts" />
/// <reference path="LoadingScene.ts" />
/// <reference path="DefaultLoadingScene.ts" />
/// <reference path="Sprite.ts" />
/// <reference path="FrameSprite.ts" />
/// <reference path="Player.ts" />
/// <reference path="Event.ts" />
/// <reference path="Logger.ts" />
/// <reference path="GameConfiguration.ts" />
/// <reference path="Game.ts" />
/// <reference path="Camera.ts" />
/// <reference path="ImageData.ts" />
/// <reference path="Renderer.ts" />
/// <reference path="Surface.ts" />
/// <reference path="Label.ts" />
/// <reference path="Glyph.ts" />
/// <reference path="FilledRect.ts" />
/// <reference path="Pane.ts" />
/// <reference path="SurfaceEffector.ts" />
/// <reference path="OperationPluginOperation.ts" />
/// <reference path="OperationPlugin.ts" />
/// <reference path="OperationPluginStatic.ts" />
/// <reference path="OperationPluginInfo.ts" />
/// <reference path="OperationPluginView.ts" />
/// <reference path="OperationPluginViewInfo.ts" />
/// <reference path="OperationPluginManager.ts" />
/// <reference path="executeEnvironmentVariables.ts" />
/// <reference path="DynamicFont.ts" />
/// <reference path="SurfaceAtlasSet.ts" />
// non-ordered files
/// <reference path="AudioSystemManager.ts" />
/// <reference path="CompositeOperation.ts" />
/// <reference path="EventFilter.ts" />
/// <reference path="GlyphFactory.ts" />
/// <reference path="Font.ts" />
/// <reference path="GameMainParameterObject.ts" />
/// <reference path="LocalTickMode.ts" />
/// <reference path="NinePatchSurfaceEffector.ts" />
/// <reference path="PathUtil.ts" />
/// <reference path="FontFamily.ts" />
/// <reference path="BitmapFont.ts" />
/// <reference path="SystemLabel.ts" />
/// <reference path="TextAlign.ts" />
/// <reference path="TickGenerationMode.ts" />
/// <reference path="Xorshift.ts" />
/// <reference path="XorshiftRandomGenerator.ts" />
/// <reference path="Shader.ts" />

module.exports = g;
}).call(this);

},{}]},{},[]);
