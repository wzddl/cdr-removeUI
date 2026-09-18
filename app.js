import fs from "fs/promises";
import path from "path";
import process from "process";
import AdmZip from "adm-zip";
import { DOMParser } from "xmldom";
// 导入配置
import { REMOVE_REF_GUID } from "./config.js";

async function FN_removeCDR_UI() {
  // 让用户输入一个文件后缀为cdws的文件路径
  const userArgs = process.argv.slice(2);
  if (userArgs.length !== 1) {
    console.error("请输入一个文件路径");
    process.exit(1);
  }

  // 检查是否为cdws后缀
  const filePath = userArgs[0];
  const fileExtension = path.extname(filePath);
  if (fileExtension !== ".cdws") {
    console.error("请输入一个后缀为cdws的文件");
    process.exit(1);
  }
  // 提取用户输入的目录，在同目录下创建一个新目录
  const dirPath = path.dirname(filePath);
  const newDirPath = path.join(dirPath, "tempHandle_CDR_UI");
  await fs.mkdir(newDirPath, { recursive: true });
  // 合成绝对路径
  const newFilePath = path.join(newDirPath, path.basename(filePath));
  console.log(newFilePath);

  // 将文件解压到新目录中
  // https://github.com/cthackers/adm-zip/wiki/ADM-ZIP
  const zipFile = new AdmZip(filePath);
  zipFile.extractAllTo(newFilePath, true);
  // 然后读取目录下的 /content/workspace.xml 文件
  const workspaceXmlPath = path.join(newFilePath, "content/workspace.xml");
  const xmlFileContent = await fs.readFile(workspaceXmlPath, "utf-8");
  const doc = new DOMParser().parseFromString(xmlFileContent, "text/xml");

  // 查询uiConfig下的所有items标签，查询guidRef属性比对是否为REMOVE_REF_GUID内部匹配项，如果是则注释
  const ele_uiConfig = doc.getElementsByTagName("uiConfig")[0];
  const ele_items = ele_uiConfig.getElementsByTagName("item");

  // 倒序处理，避免删除导致数组塌陷
  let resultHandled = [];
  for (let i = ele_items.length - 1; i >= 0; i--) {
    const item = ele_items[i];
    const guidRef = item.getAttribute("guidRef");
    LOOP_CHECK: for (let j = 0; j < REMOVE_REF_GUID.length; j++) {
      if (guidRef === REMOVE_REF_GUID[j].GUID) {
        resultHandled.push({
          title: REMOVE_REF_GUID[j].title,
          index: i,
          GUID: REMOVE_REF_GUID[j].GUID,
        });
        ele_uiConfig.removeChild(item);
        break LOOP_CHECK;
      }
    }
  }

  // 合成日志
  let outputText = ``;
  for (let x = 0; x < resultHandled.length; x++) {
    outputText += `${x + 1}. ${resultHandled[x].title} (${resultHandled[x].index})\n`;
  }

  console.log(outputText);
  // 将修改后的xml文件写回原文件
  await fs.writeFile(workspaceXmlPath, doc.toString(), "utf-8");
  // 将修改后的文件重新压缩
  const zipFileNew = new AdmZip();
  zipFileNew.addLocalFolder(newFilePath);
  await fs.writeFile(filePath, zipFileNew.toBuffer(), "binary");
  // 删除临时目录
  await fs.rm(newDirPath, { recursive: true });
}

FN_removeCDR_UI();
