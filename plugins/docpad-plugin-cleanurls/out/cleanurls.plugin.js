// Generated by CoffeeScript 1.6.3
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

module.exports = function(BasePlugin) {
  var CleanUrlsPlugin, _ref;
  return CleanUrlsPlugin = (function(_super) {
    __extends(CleanUrlsPlugin, _super);

    function CleanUrlsPlugin() {
      this.cleanUrlsForDocument = __bind(this.cleanUrlsForDocument, this);
      _ref = CleanUrlsPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    CleanUrlsPlugin.prototype.name = 'cleanurls';

    CleanUrlsPlugin.prototype.config = {
      getRedirectTemplate: function(document) {
        return "<!DOCTYPE html>\n<html>\n	<head>\n		<title>" + (document.get('title') || 'Redirect') + "</title>\n		<meta http-equiv=\"REFRESH\" content=\"0;url=" + (document.get('url')) + "\">\n	</head>\n	<body>\n		This page has moved. You will be automatically redirected to its new location. If you aren't forwarded to the new page, <a href=\"" + (document.get('url')) + "\">click here</a>.\n	</body>\n</html>";
      },
      trailingSlashes: false
    };

    CleanUrlsPlugin.prototype.cleanUrlsForDocument = function(document) {
      var pathUtil, relativeBaseUrl, relativeDirUrl, trailingSlashes, url;
      if (document.getMeta('skipCleanUrls') === true) {
        return;
      }
      url = document.get('url');
      pathUtil = require('path');
      trailingSlashes = this.config.trailingSlashes;
      if (/index\.html$/i.test(url)) {
        relativeDirUrl = pathUtil.dirname(url);
        if (trailingSlashes && relativeDirUrl !== '/') {
          relativeDirUrl += '/';
        }
        document.setUrl(relativeDirUrl);
      } else if (/\.html$/i.test(url)) {
        relativeBaseUrl = url.replace(/\.html$/, '');
        document.setUrl(relativeBaseUrl + (trailingSlashes ? '/' : ''));
        document.addUrl(relativeBaseUrl + (trailingSlashes ? '' : '/'));
      }
      return document;
    };

    CleanUrlsPlugin.prototype.renderBefore = function(opts) {
      var collection, docpad;
      docpad = this.docpad;
      collection = docpad.getCollection('html');
      docpad.log('debug', 'Applying clean urls');
      collection.forEach(this.cleanUrlsForDocument);
      docpad.log('debug', 'Applied clean urls');
      return this;
    };

    CleanUrlsPlugin.prototype.writeAfter = function(opts, next) {
      var TaskGroup, addWriteTask, collection, config, docpad, docpadConfig, getCleanOutPathFromUrl, pathUtil, safefs, tasks;
      config = this.config;
      docpad = this.docpad;
      docpadConfig = docpad.getConfig();
      collection = docpad.getCollection('html');
      TaskGroup = require('taskgroup').TaskGroup;
      safefs = require('safefs');
      pathUtil = require('path');
      getCleanOutPathFromUrl = function(url) {
        url = url.replace(/\/+$/, '');
        if (/index.html$/.test(url)) {
          return pathUtil.join(docpadConfig.outPath, url);
        } else {
          return pathUtil.join(docpadConfig.outPath, url.replace(/\.html$/, '') + '/index.html');
        }
      };
      if (__indexOf.call(docpad.getEnvironments(), 'static') >= 0) {
        docpad.log('debug', 'Writing static clean url files');
        tasks = new TaskGroup().setConfig({
          concurrency: 0
        }).once('complete', function(err) {
          docpad.log('debug', 'Wrote static clean url files');
          return next(err);
        });
        addWriteTask = function(outPath, outContent, encoding) {
          return tasks.addTask(function(complete) {
            return safefs.writeFile(outPath, outContent, encoding, complete);
          });
        };
        collection.forEach(function(document) {
          var encoding, primaryOutPath, primaryUrl, primaryUrlOutPath, redirectContent, redirectOutPath, redirectOutPaths, url, urls, _i, _j, _len, _len1, _results;
          if (document.get('write') === false || document.get('ignore') === true || document.get('render') === false || document.getMeta('skipCleanUrls') === true) {
            return;
          }
          encoding = document.get('encoding');
          primaryUrl = document.get('url');
          primaryUrlOutPath = getCleanOutPathFromUrl(primaryUrl);
          primaryOutPath = document.get('outPath');
          urls = document.get('urls');
          redirectContent = config.getRedirectTemplate(document);
          redirectOutPaths = [];
          if (primaryUrlOutPath !== primaryOutPath) {
            addWriteTask(primaryUrlOutPath, document.getOutContent(), encoding);
            redirectOutPaths.push(primaryOutPath);
          }
          for (_i = 0, _len = urls.length; _i < _len; _i++) {
            url = urls[_i];
            redirectOutPath = getCleanOutPathFromUrl(url);
            if ((__indexOf.call(redirectOutPaths, redirectOutPath) >= 0) === false && redirectOutPath !== primaryUrlOutPath) {
              redirectOutPaths.push(redirectOutPath);
            }
          }
          _results = [];
          for (_j = 0, _len1 = redirectOutPaths.length; _j < _len1; _j++) {
            redirectOutPath = redirectOutPaths[_j];
            _results.push(addWriteTask(redirectOutPath, redirectContent, encoding));
          }
          return _results;
        });
        tasks.run();
      } else {
        next();
      }
      return this;
    };

    return CleanUrlsPlugin;

  })(BasePlugin);
};