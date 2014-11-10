/**
 * Transform image URL references into inline data URIs.
 */

/*jslint node: true */

var through = require("through");
var path = require("path");
var async = require("async");
var fs = require("fs");
var mime = require("mime");

module.exports = function(filePath, opts) {
  var data = "";
  // Cache regex's
  var rImages = /([\s\S]*?)(url\(([^)]+)\))(?![^;]*;\s*\/\*\s*ImageEmbed:skip\s*\*\/)|([\s\S]+)/img;
  var rExternal = /^(http|https|\/\/)/;
  var rData = /^data:/;
  var rQuotes = /['"]/g;
  var rParams = /([?#].*)$/g;
  var cache = {};

  /**
   * [transformCss description]
   * @param  {[type]} cssContents [description]
   * @param  {[type]} opts        [description]
   * @return {[type]}             [description]
   */
  var transformCss = function(cssPath, cssContents, opts) {
    var result = "";
    var match, imgUrl, line, tasks, group;

    for(var group = rImages.exec(cssContents); group != null; group = rImages.exec(cssContents)) {
      // if there is another url to be processed, then:
      //    group[1] will hold everything up to the url declaration
      //    group[2] will hold the complete url declaration (useful if no encoding will take place)
      //    group[3] will hold the contents of the url declaration
      //    group[4] will be undefined
      // if there is no other url to be processed, then group[1-3] will be undefined
      //    group[4] will hold the entire string
      if(group[4] == null) {
        result += group[1];

        imgUrl = group[3].trim()
          .replace(rQuotes, "")
          .replace(rParams, ""); // remove query string/hash parmams in the filename, like foo.png?bar or foo.png#bar

        // see if this img was already processed before...
        if(cache[imgUrl]) {
          console.log("The image " + imgUrl + " has already been encoded elsewhere in the stylesheet.");
          result = result += cache[imgUrl];
          continue;
        } else {
          // process it and put it into the cache
          var loc = imgUrl;
          var isLocalFile = !rData.test(imgUrl) && !rExternal.test(imgUrl);

          // Resolve the image path relative to the CSS file
          if(!isLocalFile) {
            console.log("It's a remote file. Skip.");
            result += group[2];
            continue;
          } else {
            console.log("It's a local file...");
            // local file system.. fix up the path
            loc = imgUrl.charAt(0) === "/" ?
              loc :
              path.join(path.dirname(cssPath),  /*(opts.baseDir || "") + */imgUrl);

            // If that didn't work, try finding the image relative to
            // the current file instead.
            if(!fs.existsSync(loc)) {
              loc = path.resolve(__dirname + imgUrl);
            }
          }

          var encodedImg = convertImage(loc);
          if(encodedImg != null) {
            var url = "url(" + encodedImg + ")";
            result += url;
            cache[imgUrl] = url;
          } else {
            result += group[2];
          }

          continue;
        }
      } else {
        result += group[4];
        continue;
      }
    }
    return result;
  }

  /**
   * [convertImage description]
   * @param  {[type]} imgPath  [description]
   * @param  {[type]} response [description]
   * @return {[type]}          [description]
   */
  var convertImage = function(imgPath) {
    // Read the file in and convert it.
    var imgFile = fs.readFileSync(imgPath);
    var type = mime.lookup(imgPath);
    return getDataURI(type, imgFile);
  }

  /**
   * Private
   * @param  {[type]} mimeType [description]
   * @param  {[type]} img      [description]
   * @return {[type]}          [description]
   */
  var getDataURI = function(mimeType, imgFile) {
      var ret = "data:";
      ret += mimeType;
      ret += ";base64,";
      ret += imgFile.toString("base64");
      return ret;
  }

  if(filePath !== undefined && path.extname(filePath) !== ".css" )
    return through();
  else
    return through(write, end);

  /**
   * [write description]
   * @param  {[type]} buf [description]
   * @return {[type]}     [description]
   */
  function write(buf) {
    data += buf;
  }

  /**
   * [end description]
   * @return {[type]} [description]
   */
  function end() {
    try {
      this.queue(transformCss(filePath, data, {}));
    } catch( err ) {
      this.emit("error", new Error(err));
    }

    this.queue( null );
  }
}

// var test = function() {
//   transformCss('test/test_1.css');
// }

// test();
