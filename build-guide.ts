import path from "path";
import * as fs from "fs";

type GuideItem = {
  title: string;
  path: string;
};

const guideDir = path.join(__dirname, "source/guide");

async function readGuide(rePath: string) {
  const result: GuideItem[] = [];

  const abPath = path.join(guideDir, rePath);
  const stats = await fs.promises.stat(abPath);
  if (abPath.endsWith(".md") && stats.isFile()) {
    const title = await readTitle(abPath);
    if (title) {
      result.push({
        title: title,
        path: rePath.replace("\\", "/"),
      });
    }
  } else if (stats.isDirectory()) {
    const children = await fs.promises.readdir(path.join(guideDir, rePath));
    for (const child of children) {
      const paths = await readGuide(path.join(rePath, child));
      result.push(...paths);
    }
  }

  return result;
}

async function readTitle(filePath: string) {
  const content = await fs.promises.readFile(filePath, "utf-8");
  const line = content
    .replace(/\r\n/, "\n")
    .split("\n")
    .filter((item) => /^title:\s+.*$/.test(item))[0];
  if (!line || line.length <= 6) return "";

  return line.substring(6).trim();
}

async function getGuides() {
  const guides: GuideItem[] = [];
  const children = await fs.promises.readdir(guideDir);
  for (const child of children) {
    const stats = await fs.promises.stat(path.join(guideDir, child));
    if (stats.isDirectory()) {
      const paths = await readGuide(child);
      guides.push(...paths);
    }
  }
  guides.forEach((guide) => {
    if (guide.path.endsWith("/index.md")) {
      guide.path = guide.path.substring(0, guide.path.length - 9);
    } else {
      guide.path = guide.path.substring(0, guide.path.length - 4);
    }
    guide.path = "./" + guide.path;
  });
  return guides;
}

const template = `---
title: Guide 目录
comments: true
layout: "guide"
date: 2022-12-23 10:25:49
---`;

(async () => {
  const lines = template.replace(/\r\n/, "\n").split("\n");
  lines.push("\n");
  const guides = await getGuides();
  guides.forEach((guide) => {
    lines.push(`- [${guide.title}](${guide.path})`);
  });
  const md = lines.join("\n") + "\n";
  await fs.promises.writeFile(path.join(guideDir, "index.md"), md);
})();
