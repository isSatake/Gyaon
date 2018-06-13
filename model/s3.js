const AWS = require('aws-sdk');
const debug = require("debug")("s3");

require('dotenv').config();

const {region, accessKeyId, secretAccessKey, S3_ENDPOINT} = process.env;
const Bucket = process.env.S3_BUCKET || "gyaon";
let params = {Bucket};

if (!S3_ENDPOINT) {
  AWS.config.update({accessKeyId, secretAccessKey, region});
}
const bucket = new AWS.S3({params});
if (S3_ENDPOINT) {
  debug(`S3のエンドポイントが指定されました: ${S3_ENDPOINT}`);
  bucket.endpoint = new AWS.Endpoint(S3_ENDPOINT);
}
debug(AWS.config);

exports.promiseUpload = async (params) => {
  await bucket.upload(params).promise();
  debug("uploaded");
};

exports.promiseDelete= async (name) => {
  await bucket.deleteObject({name}).promise();
  debug(`delete : ${name}`);
};
