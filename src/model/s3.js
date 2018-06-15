const {logger} = require("../util/logger");

const AWS = require('aws-sdk');
const {error, debug} = logger("s3");

require('dotenv').config();

const {region, accessKeyId, secretAccessKey, S3_ENDPOINT} = process.env;
const Bucket = process.env.S3_BUCKET || "gyaon";

if (!S3_ENDPOINT) {
  AWS.config.update({accessKeyId, secretAccessKey, region});
} else {
  AWS.config.update({
    accessKeyId: "dummyId",
    secretAccessKey: "dummySecret"
  });
}
const bucket = new AWS.S3({
  s3ForcePathStyle: true
});
let ensureBucketPromise;
if (S3_ENDPOINT) {
  debug(`S3のエンドポイントが指定されました: ${S3_ENDPOINT}`);
  bucket.endpoint = new AWS.Endpoint(S3_ENDPOINT);
  ensureBucketPromise = (async () => {
    try {
      const buckets = await bucket.listBuckets().promise();
      if (!buckets.Buckets.map(b => b.Name).includes(Bucket)) {
        debug(`バケット"${Bucket}が無いため作成します"`);
        await bucket.createBucket({Bucket}).promise();
        debug(`バケット"${Bucket}"作成完了`);
      }
    } catch (e) {
      error(`failed to create bucket: ${e}`);
    }
  })();
}

debug(AWS.config);
export async function promiseUpload({Key,Body,ContentType})  {
  await ensureBucketPromise;
  await bucket.upload({Bucket, Key, Body, ContentType}).promise();
  debug("uploaded");
}

export async function promiseDelete (Key) {
  await ensureBucketPromise;
  await bucket.deleteObject({Bucket, Key}).promise();
  debug(`delete : ${Key}`);
}
