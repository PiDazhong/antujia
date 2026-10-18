import archiver from 'archiver';
import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// 获取当前模块的目录路径
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Next.js standalone 部署脚本
 * 前置：已执行 npm run build（产出 .next/standalone、.next/static）
 * 流程：本地组装 standalone 完整包（补 static/public）→ 压缩 → 上传 →
 *       服务器解压到 /opt/damons-home → 重启 node 进程 → 健康检查
 */
const REMOTE_DIR = '/etc/nginx/html/damons-home';
const APP_PORT = '5173';

const sshConfig = {
  host: '47.237.213.46',
  port: '22',
  username: 'root',
  password: 'Lmz123456@',
};

const stageDir = path.join(__dirname, '.deploy', 'stage');
const outputPath = path.join(__dirname, '.deploy', 'damons-home.zip');
const remoteZipPath = '/tmp/damons-home.zip';

// ---------- 本地：组装 standalone 完整包 ----------
// standalone 产物缺少 .next/static 和 public，需手动补入（Next 官方要求）
const prepareStage = () => {
  const standaloneDir = path.join(__dirname, '.next', 'standalone');
  if (!fs.existsSync(path.join(standaloneDir, 'server.js'))) {
    throw new Error('未找到 .next/standalone/server.js，请先执行 npm run build');
  }

  fs.rmSync(path.join(__dirname, '.deploy'), { recursive: true, force: true });
  fs.mkdirSync(stageDir, { recursive: true });

  execSync(`cp -R "${standaloneDir}/." "${stageDir}/"`);
  execSync(`mkdir -p "${path.join(stageDir, '.next')}"`);
  execSync(`cp -R "${path.join(__dirname, '.next', 'static')}" "${path.join(stageDir, '.next', 'static')}"`);
  if (fs.existsSync(path.join(__dirname, 'public'))) {
    execSync(`cp -R "${path.join(__dirname, 'public')}" "${path.join(stageDir, 'public')}"`);
  }
  console.log('本地组装完成：standalone + static + public');
};

// ---------- 本地：打包 ----------
const archiveBuild = () => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`打包完成，包大小: ${(archive.pointer() / 1024 / 1024).toFixed(1)} MB`);
      resolve();
    });
    output.on('error', reject);

    archive.pipe(output);
    archive.directory(stageDir, false);
    archive.finalize();
  });
};

// ---------- 远程：执行 shell 命令并回传输出 ----------
const execRemote = (conn, command) => {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream
        .on('close', (code) => {
          if (code === 0) resolve(stdout);
          else reject(new Error(`远程命令失败 (exit ${code}): ${command}\n${stderr}`));
        })
        .on('data', (data) => (stdout += data.toString()))
        .stderr.on('data', (data) => (stderr += data.toString()));
    });
  });
};

// ---------- 上传并部署 ----------
const uploadAndDeploy = () => {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn
      .on('ready', async () => {
        try {
          console.log('连接服务器成功，开始上传...');
          await new Promise((res, rej) => {
            conn.sftp((err, sftp) => {
              if (err) return rej(err);
              sftp.fastPut(outputPath, remoteZipPath, {}, (e) => (e ? rej(e) : res()));
            });
          });
          console.log('上传完成，开始解压并重启...');

          // 整目录替换（短暂停机，避免旧文件残留）
          await execRemote(
            conn,
            `rm -rf ${REMOTE_DIR} && unzip -oq ${remoteZipPath} -d ${REMOTE_DIR} && chmod -R 755 ${REMOTE_DIR}`
          );

          // systemd 重启（unit 同时管理后端 damonshome-server 与 Next 前端）
          // SSH 已是 root，无需 sudo
          await execRemote(conn, `systemctl restart damons-home`);

          // 健康检查：等待 3s 后请求首页，确认 SSR 服务已起来
          const status = await execRemote(
            conn,
            `sleep 3 && curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:${APP_PORT}/`
          );
          console.log(`健康检查 http://127.0.0.1:${APP_PORT}/ → ${status.trim()}`);

          await execRemote(conn, `rm -f ${remoteZipPath}`);
          conn.end();
          resolve();
        } catch (e) {
          conn.end();
          reject(e);
        }
      })
      .on('error', reject)
      .connect(sshConfig);
  });
};

const main = async () => {
  try {
    console.log('--------------------------------------------------------------------------');
    prepareStage();
    await archiveBuild();
    await uploadAndDeploy();
    console.log('部署完成!!! 请确认 nginx 已配置反向代理到 127.0.0.1:' + APP_PORT);
    console.log('--------------------------------------------------------------------------');
  } catch (error) {
    console.error('部署失败:', error.message);
    process.exit(1);
  } finally {
    fs.rmSync(path.join(__dirname, '.deploy'), { recursive: true, force: true });
  }
};

main();
