/// Serialize the a name value pair into a cookie string suitable for
/// http headers. An optional options object specified cookie parameters
///
/// 连接http/header的cookie名值对(name/value),参数对应Cookie的parameters,
/// 如:
/// serialize('foo', 'bar', { httpOnly: true })
///   => "foo=bar; httpOnly"
///
/// @param {String} name   //参数name为名字
/// @param {String} val    //参数val为值
/// @param {Object} options //这个对象为参数
/// @return {String}        //返回一个字符串
var serialize = function(name, val, opt){
    var pairs = [name + '=' + encode(val)];
    opt = opt || {};

    if (opt.maxAge) pairs.push('Max-Age=' + opt.maxAge);
    if (opt.domain) pairs.push('Domain=' + opt.domain);
    if (opt.path) pairs.push('Path=' + opt.path);
    if (opt.expires) pairs.push('Expires=' + opt.expires.toUTCString());
    if (opt.httpOnly) pairs.push('HttpOnly');
    if (opt.secure) pairs.push('Secure');

    return pairs.join('; ');
};

/// Parse the given cookie header string into an object
/// 对要处理的Cookie header解构到一个对象
///
/// The object has the various cookies as keys(names) => values
/// 这个对象拥有和Cookies名值对对应的属性
/// @param {String} str //此为Cookie header的字符串
/// @return {Object}    //此为返回的对象
var parse = function(str) {
    var obj = {}
    var pairs = str.split(/[;,] */);

    pairs.forEach(function(pair) {
        var eq_idx = pair.indexOf('=')
        var key = pair.substr(0, eq_idx).trim()
        var val = pair.substr(++eq_idx, pair.length).trim();

        // quoted values
        if ('"' == val[0]) {
            val = val.slice(1, -1);
        }

        // only assign once
        if (undefined == obj[key]) {
            try {
                obj[key] = decode(val);
            } catch (e) {
                obj[key] = val;
            }
        }
    });

    return obj;
};

var encode = encodeURIComponent;
var decode = decodeURIComponent;

module.exports.serialize = serialize;
module.exports.parse = parse;
