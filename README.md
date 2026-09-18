# 使用方法

1. 安装Node.js

   - https://nodejs.org/

   

2. 克隆仓库

   ```bash
   git clone https://github.com/wzddl/cdr-removeUI
   ```

   没有git也可以直接下载仓库代码

   

3. 打开命令行工具，执行

   ```bash
   npm i
   ```

   

4. 前往

   ```bash
   C:\%USERNAME%\CHEN\AppData\Roaming\Corel\你的CorelDRAW版本\Draw\Workspace
   ```

   找到需要处理的工作区配置文件cdws

   建议备份一下，然后拷贝到桌面，或者其他地方比如 D:\2026.cdws

   

5. 在本项目根目录运行

   ```bash
   node app.js "文件路径"
   ```

   比如

   ```bash
   node app.js "D:\2026.cdws"
   ```

   操作会回写源文件，由于使用频率不高，所以功能没写太细致