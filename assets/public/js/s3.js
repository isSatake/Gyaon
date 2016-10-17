import AWS from 'aws-sdk'

AWS.config.accessKeyId = "AKIAI3BDA5VH5M5325NA"
AWS.config.secretAccessKey = "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"
AWS.config.region = "us-west-2"
// AWS.config.loadFromPath("../.config.json");
const bucket = new AWS.S3({params: {Bucket: 'gyaon-editor'}});

export default function(key, blob){
  return new Promise((resolve, reject) => {
    const params = {
      Key: key + "",
      Body: blob
    }
    console.log(params)

    bucket.upload(params, (err, data) =>{
      console.log("uploaded to s3")
      console.log(data)
      err ? resolve(err) : resolve('https://s3-us-west-2.amazonaws.com/gyaon-editor/' + data.key)
    });
  });
}
