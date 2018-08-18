var fs = require('fs');

//ファイルの書き込み関数
function writeFile(path, data) {
  fs.writeFile(path, data, function (err) {
    if (err) {
        throw err;
    }
  });
}

const sensorReq = function (httpReq, httpRes, next) {
  let json = JSON.stringify(httpReq.query);
  writeFile("envData.json", json);
  global.io.emit("data", json);
  httpRes.send("ok");
};



module.exports = sensorReq;
