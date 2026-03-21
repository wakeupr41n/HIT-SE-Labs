# 软件工程实验 (Software Engineering Labs) - Branch C4

本项目包含软件工程课程的所有实验任务。

## 目录结构

- [Lab1/](./Lab1/): 基于大模型的编程与 Git 实战
    - `src/`: 源代码（Lab1.java, Graph.java）
    - `data/`: 实验语料（Easy Test.txt, Cursed Be The Treasure.txt）
    - `docs/`: 实验手册与报告模板
    - `output/`: 自动生成的有向图图像与随机游走文本
- [Lab2/](./Lab2/): (待添加)

## 如何运行 (Lab 1)

### 1. 编译 (Compilation)
进入 `Lab1` 目录，并确保编译器支持 UTF-8 编码。

**通用命令：**
```bash
javac -encoding UTF-8 -d bin src/*.java
```

**如果您未配置环境变量，可以使用 IDE 路径（如 PyCharm/IntelliJ）：**
```powershell
& "C:\Program Files\JetBrains\PyCharm 2025.3.1\jbr\bin\javac.exe" -encoding UTF-8 -d bin src/Graph.java src/Lab1.java
```

### 2. 运行 (Execution)
在 `Lab1` 目录下运行编译好的程序。

**通用命令：**
```bash
java -Dfile.encoding=UTF-8 -cp bin Lab1 data/Easy\ Test.txt
```

**PowerShell 稳定版命令 (针对环境路径优化)：**
```powershell
& "C:\Program Files\JetBrains\PyCharm 2025.3.1\jbr\bin\java.exe" -cp bin Lab1 "data/Easy Test.txt"
```

### 3. 生成物管理 (Outputs)
所有生成的文件均存储在 `Lab1/output/` 目录下：
- `graph.png`: 完整的有向图图像。
- `shortest_path.png`: 标注了最短路径（红色高亮）的有向图。
- `random_walk.txt`: 随机游走生成的路径文本。
- `graph.dot`: 用于辅助渲染的有向图描述文件。
