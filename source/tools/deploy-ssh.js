const path = require("path");
const { Client } = require("ssh2");

const privateKey = `{{PRIVATE_KEY}}`;
const serverIps = "{{SERVER_IPS}}".split(",");
const remoteDir = "{{REMOTE_DIR}}";
const serviceName = "{{SERVICE_NAME}}";

let username = "{{USERNAME}}";
if (username.startsWith("{{")) {
  username = "root";
}

let port = "{{PORT}}";
if (port.startsWith("{{")) {
  port = "22";
}
port = Number(port);

let tarFile = "{{TAR_FILE}}";
if (tarFile.startsWith("{{")) {
  tarFile = "dist.tar.gz";
}

(async () => {
  await Promise.all(serverIps.map(deploy));
})();

async function deploy(serverIp) {
  await new Promise((resolve, reject) => {
    const client = new Client();
    client.serverIp = serverIp;
    client
      .on("ready", async () => {
        console.log(serverIp + " client start");
        client.sftp(async (err, sftp) => {
          if (err) throw err;
          try {
            sftp.serverIp = serverIp;
            await copyFile(sftp, __dirname, remoteDir);
            if (!serviceName.startsWith("{{")) {
              await exec(client, `systemctl stop ${serviceName}`);
            }
            await exec(client, `cd ${remoteDir} && tar -xzvf ${tarFile}`);
            if (!serviceName.startsWith("{{")) {
              await exec(client, `systemctl start ${serviceName}`);
            }
            resolve();
            client.destroy();
            console.log(serverIp + " client finished");
          } catch (err) {
            reject(err);
            return;
          }
        });
      })
      .connect({
        host: serverIp,
        port,
        username,
        privateKey,
      });
  });
}

async function exec(client, command) {
  await new Promise((resolve, reject) => {
    client.exec(command, (err, stream) => {
      if (err) return reject(err);

      stream
        .on("close", (code, signal) => {
          console.log(
            `${client.serverIp} exec finished. code:${code}, signal:${signal}`,
          );
          if (code) {
            reject();
          } else {
            resolve();
          }
        })
        .on("data", () => {})
        .stderr.on("data", (data) => {
          data && console.log(client.serverIp + " STDERR: " + data);
        });
    });
  });
}

async function copyFile(sftp, localDir, remoteDir) {
  const localFile = path.join(localDir, tarFile).replace(/\\/g, "/");
  const remoteFile = path.join(remoteDir, tarFile).replace(/\\/g, "/");
  console.log(sftp.serverIp + " copyFile", localFile, remoteFile);

  await new Promise((resolve, reject) => {
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
