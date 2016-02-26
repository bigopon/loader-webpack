System.register(['aurelia-metadata', 'aurelia-loader', 'aurelia-pal'], function (_export) {
  'use strict';

  var Origin, Loader, DOM, PLATFORM, TextTemplateLoader, WebpackLoader;

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function ensureOriginOnExports(executed, name) {
    var target = executed;
    var key = undefined;
    var exportedValue = undefined;

    if (target.__useDefault) {
      target = target['default'];
    }

    Origin.set(target, new Origin(name, 'default'));

    for (key in target) {
      exportedValue = target[key];

      if (typeof exportedValue === 'function') {
        Origin.set(exportedValue, new Origin(name, key));
      }
    }

    return executed;
  }

  return {
    setters: [function (_aureliaMetadata) {
      Origin = _aureliaMetadata.Origin;
    }, function (_aureliaLoader) {
      Loader = _aureliaLoader.Loader;
    }, function (_aureliaPal) {
      DOM = _aureliaPal.DOM;
      PLATFORM = _aureliaPal.PLATFORM;
    }],
    execute: function () {
      TextTemplateLoader = (function () {
        function TextTemplateLoader() {
          _classCallCheck(this, TextTemplateLoader);
        }

        TextTemplateLoader.prototype.loadTemplate = function loadTemplate(loader, entry) {
          return loader.loadText(entry.address).then(function (text) {
            entry.template = DOM.createTemplateFromMarkup(text);
          });
        };

        return TextTemplateLoader;
      })();

      _export('TextTemplateLoader', TextTemplateLoader);

      WebpackLoader = (function (_Loader) {
        _inherits(WebpackLoader, _Loader);

        function WebpackLoader() {
          _classCallCheck(this, WebpackLoader);

          _Loader.call(this);

          this.moduleRegistry = {};
          this.loaderPlugins = {};
          this.useTemplateLoader(new TextTemplateLoader());

          var that = this;

          this.addPlugin('template-registry-entry', {
            'fetch': function fetch(address) {
              var entry = that.getOrCreateTemplateRegistryEntry(address);
              return entry.templateIsLoaded ? entry : that.templateLoader.loadTemplate(that, entry).then(function (x) {
                return entry;
              });
            }
          });
        }

        WebpackLoader.prototype._import = function _import(moduleId) {
          var _this = this;

          var moduleIdParts = moduleId.split('!');
          var path = moduleIdParts.splice(moduleIdParts.length - 1, 1)[0];
          var loaderPlugin = moduleIdParts.length === 1 ? moduleIdParts[0] : null;

          return new Promise(function (resolve, reject) {
            try {
              if (loaderPlugin) {
                resolve(_this.loaderPlugins[loaderPlugin].fetch(path));
              } else {
                require.ensure([], function (require) {
                  var result = require('aurelia-loader-context/' + path);
                  if (typeof result === 'function') {
                    result(function (res) {
                      return resolve(res);
                    });
                  } else {
                    resolve(result);
                  }
                });
              }
            } catch (e) {
              reject(e);
            }
          });
        };

        WebpackLoader.prototype.map = function map(id, source) {};

        WebpackLoader.prototype.normalizeSync = function normalizeSync(moduleId, relativeTo) {
          return moduleId;
        };

        WebpackLoader.prototype.normalize = function normalize(moduleId, relativeTo) {
          return Promise.resolve(moduleId);
        };

        WebpackLoader.prototype.useTemplateLoader = function useTemplateLoader(templateLoader) {
          this.templateLoader = templateLoader;
        };

        WebpackLoader.prototype.loadAllModules = function loadAllModules(ids) {
          var loads = [];

          for (var i = 0, ii = ids.length; i < ii; ++i) {
            loads.push(this.loadModule(ids[i]));
          }

          return Promise.all(loads);
        };

        WebpackLoader.prototype.loadModule = function loadModule(id) {
          var _this2 = this;

          var existing = this.moduleRegistry[id];
          if (existing) {
            return Promise.resolve(existing);
          }

          return new Promise(function (resolve, reject) {
            try {
              _this2._import(id).then(function (m) {
                _this2.moduleRegistry[id] = m;
                resolve(ensureOriginOnExports(m, id));
              });
            } catch (e) {
              reject(e);
            }
          });
        };

        WebpackLoader.prototype.loadTemplate = function loadTemplate(url) {
          return this._import(this.applyPluginToUrl(url, 'template-registry-entry'));
        };

        WebpackLoader.prototype.loadText = function loadText(url) {
          return this._import(url);
        };

        WebpackLoader.prototype.applyPluginToUrl = function applyPluginToUrl(url, pluginName) {
          return pluginName + '!' + url;
        };

        WebpackLoader.prototype.addPlugin = function addPlugin(pluginName, implementation) {
          this.loaderPlugins[pluginName] = implementation;
        };

        return WebpackLoader;
      })(Loader);

      _export('WebpackLoader', WebpackLoader);

      PLATFORM.Loader = WebpackLoader;

      PLATFORM.eachModule = function (callback) {};
    }
  };
});