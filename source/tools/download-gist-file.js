const https = require("https");
const fs = require("fs");

const token = process.argv[2];
const gistId = process.argv[3];
const fileName = process.argv[4];

if (!token || !gistId || !fileName) {
  throw new Error("arguments error");
}

function request(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      const chunks = [];

      if (res.statusCode !== 200) {
        return reject(
          new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`),
        );
      }

      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      res.on("error", reject);
    });
  });
}

(async () => {
  const apiHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "hal-wang/gist/download-gist-file",
  };

  const apiRes = await request(
    `https://api.github.com/gists/${gistId}`,
    apiHeaders,
  );

  const gist = JSON.parse(apiRes.toString("utf-8"));
  const file = gist.files[fileName];

  if (!file) {
    throw new Error(`file "${fileName}" not found in gist`);
  }

  const content = Buffer.from(file.content, "utf-8");
  fs.writeFileSync(fileName, content);

  console.log(`downloaded: ${fileName}`);
})();
