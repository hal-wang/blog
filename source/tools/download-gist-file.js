const https = require("https");
const fs = require("fs");

const token = process.argv[2];
const gistId = process.argv[3];
const fileName = process.argv[4];
if (!token || !gistId || !fileName) throw new Error("arguments error");

async function readSteram(stream) {
  const chunks = [];
  await new Promise((resolve, reject) => {
    stream.on("data", (chunk) => {
      const encoding = stream.readableEncoding ?? undefined;
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      } else {
        chunks.push(Buffer.from(chunk, encoding));
      }
    });
    stream.on("end", () => {
      resolve();
    });
    stream.on("error", (err) => {
      reject(err);
    });
  });
  return Buffer.concat(chunks);
}

https.get(
  `https://api.github.com/gists/${gistId}`,
  {
    headers: {
      Accept: "application/vnd.github+jso",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "user-agent": "hal-wang/gist/public-gist/download-gist-file.js",
    },
  },
  async (res) => {
    const json = (await readSteram(res)).toString("utf-8");
    const obj = JSON.parse(json);
    const fileUrl = obj.files[fileName].raw_url;
    https.get(fileUrl, async (res) => {
      const buffer = await readSteram(res);
      fs.writeFileSync(fileName, buffer);
    });
  }
);
