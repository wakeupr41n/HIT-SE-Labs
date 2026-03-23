import java.io.*;
import java.util.*;

public class Lab1 {
    private static Graph graph = new Graph();
    private static List<String> words = new ArrayList<>();

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
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
            System.out.println("0. 退出");
            System.out.print("请选择功能: ");
            
            String choice = scanner.nextLine();
            
            if ("0".equals(choice)) break;
            
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
                    System.out.println(calcShortestPath(startWord, endWord));
                    break;
                case "5":
                    System.out.print("输入要查询PR值的单词: ");
                    String prWord = scanner.nextLine();
                    System.out.println("PageRank: " + calPageRank(prWord));
                    break;
                case "6":
                    System.out.println(randomWalk());
                    break;
                default:
                    System.out.println("无效选择。");
            }
        }
        scanner.close();
    }

    private static void processFile(String filePath) throws IOException {
        BufferedReader reader = new BufferedReader(new FileReader(filePath));
        String line;
        while ((line = reader.readLine()) != null) {
            // Replace punctuation and non-alphabets with space
            String cleanedLine = line.replaceAll("[^a-zA-Z]", " ").toLowerCase();
            String[] tokens = cleanedLine.split("\\s+");
            for (String token : tokens) {
                if (!token.isEmpty()) {
                    words.add(token);
                }
            }
        }
        reader.close();
        
        for (int i = 0; i < words.size() - 1; i++) {
            graph.addEdge(words.get(i), words.get(i + 1));
        }
    }

    public static void showDirectedGraph(Graph G) {
        System.out.println("有向图结构 (节点 -> 邻居(权重)):");
        System.out.println(G.toString());
    }

    public static String queryBridgeWords(String word1, String word2) {
        word1 = word1.toLowerCase();
        word2 = word2.toLowerCase();
        
        if (!graph.containsNode(word1) || !graph.containsNode(word2)) {
            boolean w1Missing = !graph.containsNode(word1);
            boolean w2Missing = !graph.containsNode(word2);
            if (w1Missing && w2Missing) return "No \"" + word1 + "\" and \"" + word2 + "\" in the graph!";
            return "No \"" + (w1Missing ? word1 : word2) + "\" in the graph!";
        }
        
        Set<String> bridges = new HashSet<>();
        Map<String, Integer> word1Edges = graph.getEdges(word1);
        
        for (String word3 : word1Edges.keySet()) {
            if (graph.getEdges(word3).containsKey(word2)) {
                bridges.add(word3);
            }
        }
        
        if (bridges.isEmpty()) {
            return "No bridge words from \"" + word1 + "\" to \"" + word2 + "\"!";
        }
        
        List<String> sortedBridges = new ArrayList<>(bridges);
        Collections.sort(sortedBridges);
        
        if (sortedBridges.size() == 1) {
            return "The bridge word from \"" + word1 + "\" to \"" + word2 + "\" is: " + sortedBridges.get(0) + ".";
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

    public static String generateNewText(String inputText) {
        String[] inputWords = inputText.replaceAll("[^a-zA-Z]", " ").toLowerCase().split("\\s+");
        List<String> list = new ArrayList<>();
        for (String w : inputWords) if (!w.isEmpty()) list.add(w);
        
        if (list.size() < 2) return inputText;
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < list.size() - 1; i++) {
            String word1 = list.get(i);
            String word2 = list.get(i + 1);
            sb.append(word1).append(" ");
            
            // Re-use logic from queryBridgeWords but pick one randomly
            Set<String> bridges = new HashSet<>();
            if (graph.containsNode(word1) && graph.containsNode(word2)) {
                Map<String, Integer> word1Edges = graph.getEdges(word1);
                for (String word3 : word1Edges.keySet()) {
                    if (graph.getEdges(word3).containsKey(word2)) {
                        bridges.add(word3);
                    }
                }
            }
            
            if (!bridges.isEmpty()) {
                List<String> bridgeList = new ArrayList<>(bridges);
                String chosenBridge = bridgeList.get(new Random().nextInt(bridgeList.size()));
                sb.append(chosenBridge).append(" ");
            }
        }
        sb.append(list.get(list.size() - 1));
        return sb.toString();
    }

    public static String calcShortestPath(String word1, String word2) {
        word1 = word1.toLowerCase();
        if (!graph.containsNode(word1)) {
            return "单词 \"" + word1 + "\" 不在图中！";
        }

        if (word2 == null || word2.trim().isEmpty()) {
            StringBuilder allPaths = new StringBuilder("从 \"" + word1 + "\" 到其他结点的最短路径:\n");
            for (String node : graph.getNodes()) {
                if (node.equals(word1)) continue;
                String result = calcSingleShortestPath(word1, node);
                allPaths.append(node).append(": ").append(result).append("\n");
            }
            return allPaths.toString();
        }

        word2 = word2.toLowerCase();
        if (!graph.containsNode(word2)) {
            return "单词 \"" + word2 + "\" 不在图中！";
        }

        return calcSingleShortestPath(word1, word2);
    }

    private static String calcSingleShortestPath(String word1, String word2) {
        // Dijkstra logic
        Map<String, Integer> distances = new HashMap<>();
        Map<String, String> previous = new HashMap<>();
        PriorityQueue<Node> queue = new PriorityQueue<>(Comparator.comparingInt(n -> n.distance));
        
        for (String node : graph.getNodes()) {
            distances.put(node, Integer.MAX_VALUE);
        }
        distances.put(word1, 0);
        queue.add(new Node(word1, 0));
        
        while (!queue.isEmpty()) {
            Node current = queue.poll();
            String u = current.name;
            
            if (u.equals(word2)) break;
            if (current.distance > distances.get(u)) continue;
            
            for (Map.Entry<String, Integer> entry : graph.getEdges(u).entrySet()) {
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
        
        return String.join(" -> ", path) + " (长度: " + distances.get(word2) + ")";
    }

    public static Double calPageRank(String word) {
        word = word.toLowerCase();
        if (!graph.containsNode(word)) return 0.0;
        
        double d = 0.85;
        int N = graph.getNodes().size();
        Map<String, Double> pr = new HashMap<>();
        for (String node : graph.getNodes()) {
            pr.put(node, 1.0 / N);
        }
        
        // Iterations for convergence
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
                // Handle out-degree 0 nodes by distributing their rank equally
                rankFromNeighbors += sinkRank / N;
                nextPr.put(u, (1 - d) / N + d * rankFromNeighbors);
            }
            pr = nextPr;
        }
        
        return pr.get(word);
    }

    public static String randomWalk() {
        Set<String> nodes = graph.getNodes();
        if (nodes.isEmpty()) return "图为空！";
        
        List<String> nodeList = new ArrayList<>(nodes);
        String current = nodeList.get(new Random().nextInt(nodeList.size()));
        
        StringBuilder result = new StringBuilder(current);
        Set<String> visitedEdges = new HashSet<>();
        
        while (true) {
            Map<String, Integer> edges = graph.getEdges(current);
            if (edges.isEmpty()) break;
            
            List<String> nextList = new ArrayList<>(edges.keySet());
            String next = nextList.get(new Random().nextInt(nextList.size()));
            
            String edgeKey = current + "->" + next;
            if (visitedEdges.contains(edgeKey)) {
                result.append(" ").append(next);
                break;
            }
            
            visitedEdges.add(edgeKey);
            result.append(" ").append(next);
            current = next;
            
            // Allow manual stop check if it were interactive, but here we just run till edge repeats or leaf
        }
        
        String output = result.toString();
        try {
            BufferedWriter writer = new BufferedWriter(new FileWriter("random_walk.txt"));
            writer.write(output);
            writer.close();
            System.out.println("结果已从写入 random_walk.txt");
        } catch (IOException e) {
            System.err.println("写入文件出错: " + e.getMessage());
        }
        
        return output;
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
