import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Random;
import java.util.Scanner;
import java.util.Set;

/**
 * Lab1 main class for directed graph operations.
 */
public class Lab1 {
  private static Graph graph = new Graph();
  private static List<String> words = new ArrayList<>();
  private static final Random RANDOM = new Random();

  /**
   * Set the graph instance for testing purposes.
   *
   * @param g the graph to use
   */
  public static void setGraph(Graph g) {
    graph = g;
  }

  /**
   * Get the graph instance.
   *
   * @return the current graph
   */
  public static Graph getGraph() {
    return graph;
  }

  /**
   * Main entry point.
   *
   * @param args command line arguments, first arg is file path
   */
  public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in, StandardCharsets.UTF_8);
    String filePath = "";

    if (args.length > 0) {
      filePath = args[0];
    } else {
      System.out.println("请选择文件路径:");
      filePath = scanner.nextLine();
    }

    try {
      processFile(filePath);
    } catch (IOException e) {
      System.err.println("读取文件出错: " + e.getMessage());
      return;
    }

    while (true) {
      System.out.println("\n--- Lab1 实验功能菜单 ---");
      System.out.println("1. 展示有向图");
      System.out.println("2. 查询桥接词");
      System.out.println("3. 根据桥接词生成新文本");
      System.out.println("4. 计算两个单词之间的最短路径");
      System.out.println("5. 计算 PageRank");
      System.out.println("6. 随机游走");
      System.out.println("7. 保存并生成有向图 (PNG)");
      System.out.println("0. 退出");
      System.out.print("请选择功能: ");

      String choice = scanner.nextLine();

      if ("0".equals(choice)) {
        break;
      }

      switch (choice) {
        case "1":
          showDirectedGraph(graph);
          break;
        case "2":
          System.out.print("输入第一个单词: ");
          String word1 = scanner.nextLine();
          System.out.print("输入第二个单词: ");
          String word2 = scanner.nextLine();
          String bridgeWords = queryBridgeWords(word1, word2);
          System.out.println(bridgeWords);
          break;
        case "3":
          System.out.print("输入一行新文本: ");
          String inputText = scanner.nextLine();
          System.out.println(generateNewText(inputText));
          break;
        case "4":
          System.out.print("输入起点单词: ");
          String startWord = scanner.nextLine();
          System.out.print("输入终点单词: ");
          String endWord = scanner.nextLine();
          String pathResult = calcShortestPath(startWord, endWord);
          System.out.println(pathResult);

          if (endWord != null && !endWord.trim().isEmpty()
              && !pathResult.contains("不可达")
              && !pathResult.contains("不在图")) {
            String pathOnly = pathResult.split(" \\(长度:")[0];
            List<String> pathList =
                Arrays.asList(pathOnly.split(" -> "));
            saveDirectedGraph(graph, pathList);
          }
          break;
        case "5":
          System.out.print("输入要查询PR值的单词: ");
          String prWord = scanner.nextLine();
          System.out.println("PageRank: " + calPageRank(prWord));
          break;
        case "6":
          System.out.println(randomWalk());
          break;
        case "7":
          saveDirectedGraph(graph, null);
          break;
        default:
          System.out.println("无效选择。");
      }
    }
    scanner.close();
  }

  private static void processFile(String filePath) throws IOException {
    try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(
            new FileInputStream(filePath), StandardCharsets.UTF_8))) {
      String line;
      while ((line = reader.readLine()) != null) {
        String cleanedLine =
            line.replaceAll("[^a-zA-Z]", " ").toLowerCase();
        String[] tokens = cleanedLine.split("\\s+");
        for (String token : tokens) {
          if (!token.isEmpty()) {
            words.add(token);
          }
        }
      }
    }

    for (int i = 0; i < words.size() - 1; i++) {
      graph.addEdge(words.get(i), words.get(i + 1));
    }
  }

  /**
   * Show the directed graph structure.
   *
   * @param g the graph to display
   */
  public static void showDirectedGraph(Graph g) {
    System.out.println("有向图结构 (节点 -> 邻居(权重)):");
    System.out.println(g.toString());
  }

  /**
   * Query bridge words between word1 and word2.
   *
   * @param word1 the source word
   * @param word2 the target word
   * @return a string describing the bridge words found
   */
  public static String queryBridgeWords(String word1, String word2) {
    word1 = word1.toLowerCase();
    word2 = word2.toLowerCase();

    if (!graph.containsNode(word1) || !graph.containsNode(word2)) {
      boolean w1Missing = !graph.containsNode(word1);
      boolean w2Missing = !graph.containsNode(word2);
      if (w1Missing && w2Missing) {
        return "No \"" + word1 + "\" and \"" + word2
            + "\" in the graph!";
      }
      return "No \""
          + (w1Missing ? word1 : word2) + "\" in the graph!";
    }

    Set<String> bridges = new HashSet<>();
    Map<String, Integer> word1Edges = graph.getEdges(word1);

    for (String word3 : word1Edges.keySet()) {
      if (graph.getEdges(word3).containsKey(word2)) {
        bridges.add(word3);
      }
    }

    if (bridges.isEmpty()) {
      return "No bridge words from \"" + word1
          + "\" to \"" + word2 + "\"!";
    }

    List<String> sortedBridges = new ArrayList<>(bridges);
    Collections.sort(sortedBridges);

    if (sortedBridges.size() == 1) {
      return "The bridge word from \"" + word1 + "\" to \""
          + word2 + "\" is: " + sortedBridges.get(0) + ".";
    }

    StringBuilder sb = new StringBuilder("The bridge words from \"");
    sb.append(word1).append("\" to \"").append(word2).append("\" are: ");
    for (int i = 0; i < sortedBridges.size(); i++) {
      sb.append(sortedBridges.get(i));
      if (i < sortedBridges.size() - 2) {
        sb.append(", ");
      } else if (i == sortedBridges.size() - 2) {
        sb.append(", and ");
      }
    }
    sb.append(".");
    return sb.toString();
  }

  /**
   * Generate new text by inserting bridge words.
   *
   * @param inputText the input text
   * @return the new text with bridge words inserted
   */
  public static String generateNewText(String inputText) {
    String[] inputWords =
        inputText.replaceAll("[^a-zA-Z]", " ")
            .toLowerCase().split("\\s+");
    List<String> list = new ArrayList<>();
    for (String w : inputWords) {
      if (!w.isEmpty()) {
        list.add(w);
      }
    }

    if (list.size() < 2) {
      return inputText;
    }

    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < list.size() - 1; i++) {
      String curWord1 = list.get(i);
      String curWord2 = list.get(i + 1);
      sb.append(curWord1).append(" ");

      Set<String> bridges = new HashSet<>();
      if (graph.containsNode(curWord1)
          && graph.containsNode(curWord2)) {
        Map<String, Integer> curWord1Edges =
            graph.getEdges(curWord1);
        for (String word3 : curWord1Edges.keySet()) {
          if (graph.getEdges(word3).containsKey(curWord2)) {
            bridges.add(word3);
          }
        }
      }

      if (!bridges.isEmpty()) {
        List<String> bridgeList = new ArrayList<>(bridges);
        String chosenBridge =
            bridgeList.get(RANDOM.nextInt(bridgeList.size()));
        sb.append(chosenBridge).append(" ");
      }
    }
    sb.append(list.get(list.size() - 1));
    return sb.toString();
  }

  /**
   * Calculate the shortest path between two words.
   *
   * @param word1 the start word
   * @param word2 the end word
   * @return a string describing the shortest path
   */
  public static String calcShortestPath(String word1, String word2) {
    word1 = word1.toLowerCase();
    if (!graph.containsNode(word1)) {
      return "单词 \"" + word1 + "\" 不在图中！";
    }

    if (word2 == null || word2.trim().isEmpty()) {
      StringBuilder allPaths = new StringBuilder(
          "从 \"" + word1 + "\" 到其他结点的最短路径:\n");
      for (String node : graph.getNodes()) {
        if (node.equals(word1)) {
          continue;
        }
        String result = calcSingleShortestPath(word1, node);
        allPaths.append(node).append(": ")
            .append(result).append("\n");
      }
      return allPaths.toString();
    }

    word2 = word2.toLowerCase();
    if (!graph.containsNode(word2)) {
      return "单词 \"" + word2 + "\" 不在图中！";
    }

    return calcSingleShortestPath(word1, word2);
  }

  private static String calcSingleShortestPath(
      String word1, String word2) {
    Map<String, Integer> distances = new HashMap<>();
    final Map<String, String> previous = new HashMap<>();
    PriorityQueue<Node> queue =
        new PriorityQueue<>(Comparator.comparingInt(n -> n.distance));

    for (String node : graph.getNodes()) {
      distances.put(node, Integer.MAX_VALUE);
    }
    distances.put(word1, 0);
    queue.add(new Node(word1, 0));

    while (!queue.isEmpty()) {
      Node current = queue.poll();
      String u = current.name;

      if (u.equals(word2)) {
        break;
      }
      if (current.distance > distances.get(u)) {
        continue;
      }

      for (Map.Entry<String, Integer> entry
          : graph.getEdges(u).entrySet()) {
        String v = entry.getKey();
        int weight = entry.getValue();
        int newDist = distances.get(u) + weight;
        if (newDist < distances.get(v)) {
          distances.put(v, newDist);
          previous.put(v, u);
          queue.add(new Node(v, newDist));
        }
      }
    }

    if (distances.get(word2) == Integer.MAX_VALUE) {
      return "不可达！";
    }

    List<String> path = new ArrayList<>();
    for (String at = word2; at != null; at = previous.get(at)) {
      path.add(at);
    }
    Collections.reverse(path);

    return String.join(" -> ", path)
        + " (长度: " + distances.get(word2) + ")";
  }

  /**
   * Calculate the PageRank value for a given word.
   *
   * @param word the word to calculate PageRank for
   * @return the PageRank value
   */
  public static Double calPageRank(String word) {
    word = word.toLowerCase();
    if (!graph.containsNode(word)) {
      return 0.0;
    }

    double d = 0.85;
    int n = graph.getNodes().size();
    Map<String, Double> pr = new HashMap<>();
    for (String node : graph.getNodes()) {
      pr.put(node, 1.0 / n);
    }

    for (int i = 0; i < 100; i++) {
      Map<String, Double> nextPr = new HashMap<>();
      double sinkRank = 0;
      for (String node : graph.getNodes()) {
        if (graph.getEdges(node).isEmpty()) {
          sinkRank += pr.get(node);
        }
      }

      for (String u : graph.getNodes()) {
        double rankFromNeighbors = 0;
        for (String v : graph.getNodes()) {
          Map<String, Integer> edges = graph.getEdges(v);
          if (edges.containsKey(u)) {
            rankFromNeighbors += pr.get(v) / edges.size();
          }
        }
        rankFromNeighbors += sinkRank / n;
        nextPr.put(u, (1 - d) / n + d * rankFromNeighbors);
      }
      pr = nextPr;
    }

    return pr.get(word);
  }

  /**
   * Perform a random walk on the graph.
   *
   * @return the random walk result as a string
   */
  public static String randomWalk() {
    Set<String> nodes = graph.getNodes();
    if (nodes.isEmpty()) {
      return "图为空！";
    }

    List<String> nodeList = new ArrayList<>(nodes);
    String current =
        nodeList.get(RANDOM.nextInt(nodeList.size()));

    StringBuilder result = new StringBuilder(current);
    Set<String> visitedEdges = new HashSet<>();

    while (true) {
      Map<String, Integer> edges = graph.getEdges(current);
      if (edges.isEmpty()) {
        break;
      }

      List<String> nextList = new ArrayList<>(edges.keySet());
      String next = nextList.get(RANDOM.nextInt(nextList.size()));

      String edgeKey = current + "->" + next;
      if (visitedEdges.contains(edgeKey)) {
        result.append(" ").append(next);
        break;
      }

      visitedEdges.add(edgeKey);
      result.append(" ").append(next);
      current = next;
    }

    String output = result.toString();
    try (BufferedWriter writer = new BufferedWriter(
        new OutputStreamWriter(
            new FileOutputStream("random_walk.txt"),
            StandardCharsets.UTF_8))) {
      writer.write(output);
      System.out.println("结果已从写入 random_walk.txt");
    } catch (IOException e) {
      System.err.println("写入文件出错: " + e.getMessage());
    }

    return output;
  }

  /**
   * Save the directed graph to a DOT file and generate PNG.
   *
   * @param g the graph to save
   * @param highlightPath optional path to highlight
   */
  public static void saveDirectedGraph(Graph g,
      List<String> highlightPath) {
    StringBuilder dot = new StringBuilder();
    dot.append("digraph G {").append(System.lineSeparator());
    dot.append("    node [shape=circle, style=filled, "
        + "fillcolor=\"#E3F2FD\", fontname=\"Arial\"];")
        .append(System.lineSeparator());
    dot.append("    edge [fontname=\"Arial\", fontsize=10];")
        .append(System.lineSeparator());

    Set<String> nodes = g.getNodes();
    if (nodes == null || nodes.isEmpty()) {
      System.out.println("图为空，无法生成图像！");
      return;
    }

    Set<String> pathNodes = new HashSet<>();
    Set<String> pathEdges = new HashSet<>();
    if (highlightPath != null && highlightPath.size() > 0) {
      pathNodes.addAll(highlightPath);
      for (int i = 0; i < highlightPath.size() - 1; i++) {
        pathEdges.add(highlightPath.get(i)
            + "->" + highlightPath.get(i + 1));
      }
    }

    for (String u : nodes) {
      String nodeStyle = pathNodes.contains(u)
          ? " [fillcolor=\"#ff9999\", color=\"red\", "
          + "penwidth=2]" : "";
      dot.append(String.format("    \"%s\"%s;%n", u, nodeStyle));

      Map<String, Integer> edges = g.getEdges(u);
      if (edges != null) {
        for (Map.Entry<String, Integer> e : edges.entrySet()) {
          String v = e.getKey();
          int weight = e.getValue();
          String edgeKey = u + "->" + v;
          String edgeStyle = pathEdges.contains(edgeKey)
              ? " [color=\"red\", penwidth=2, label=\""
              + weight + "\", fontcolor=\"red\"]"
              : " [label=\"" + weight + "\"]";
          dot.append(String.format(
              "    \"%s\" -> \"%s\"%s;%n", u, v, edgeStyle));
        }
      }
    }
    dot.append("}").append(System.lineSeparator());

    String outPath =
        new File("Lab1").exists() ? "Lab1/output/" : "output/";
    File outDir = new File(outPath);
    if (!outDir.exists() && !outDir.mkdirs()) {
      System.out.println("创建输出目录失败！");
      return;
    }

    String baseName =
        (highlightPath != null) ? "shortest_path" : "graph";
    File dotFile = new File(outPath + baseName + ".dot");
    try (PrintWriter fw = new PrintWriter(new OutputStreamWriter(
        new FileOutputStream(dotFile), StandardCharsets.UTF_8))) {
      fw.write(dot.toString());
    } catch (IOException e) {
      System.out.println("写入 dot 文件失败: " + e.getMessage());
      return;
    }

    System.out.println("已保存 dot 代码。正在通过 Web API 生成 "
        + baseName + ".png ...");
    try {
      String encodedDot =
          URLEncoder.encode(dot.toString(), StandardCharsets.UTF_8);
      String urlStr =
          "https://quickchart.io/graphviz?format=png&graph="
          + encodedDot;
      URL url = new URI(urlStr).toURL();
      HttpURLConnection conn =
          (HttpURLConnection) url.openConnection();
      conn.setRequestMethod("GET");
      conn.setConnectTimeout(10000);
      conn.setReadTimeout(10000);

      int responseCode = conn.getResponseCode();
      if (responseCode == 200) {
        try (InputStream in = conn.getInputStream();
             FileOutputStream out = new FileOutputStream(
                 outPath + baseName + ".png")) {
          byte[] buffer = new byte[4096];
          int bytesRead;
          while ((bytesRead = in.read(buffer)) != -1) {
            out.write(buffer, 0, bytesRead);
          }
        }
        System.out.println("成功！图片已保存至: "
            + outPath + baseName + ".png");
      } else {
        System.out.println("API请求失败，请确保网络连接正常！");
      }
    } catch (Exception e) {
      System.out.println("生成图片失败: " + e.getMessage());
    }
  }

  private static class Node {
    String name;
    int distance;

    Node(String name, int distance) {
      this.name = name;
      this.distance = distance;
    }
  }
}
