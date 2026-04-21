import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Black-box tests for Lab1.queryBridgeWords using
 * equivalence class partitioning and boundary value analysis.
 *
 * Selected function: queryBridgeWords(String word1, String word2)
 *
 * Requirement specification:
 * - Function: Query bridge words between word1 and word2 in the directed graph.
 *   A bridge word is word3 such that word1->word3 and word3->word2 both exist.
 * - Input: word1 (String), word2 (String) - two English words
 * - Output: String describing bridge words or error messages
 *   - If both words not in graph: "No \"word1\" and \"word2\" in the graph!"
 *   - If only one word not in graph: "No \"missingWord\" in the graph!"
 *   - If no bridge words: "No bridge words from \"word1\" to \"word2\"!"
 *   - If one bridge word: "The bridge word from \"word1\" to \"word2\" is: word3."
 *   - If multiple bridge words:
 *     "The bridge words from \"word1\" to \"word2\" are: w1, w2, and w3."
 *
 * Equivalence classes:
 *   (1) Both words in graph, multiple bridge words exist
 *   (2) Both words in graph, exactly one bridge word
 *   (3) Both words in graph, no bridge words
 *   (4) word1 not in graph, word2 in graph
 *   (5) word1 in graph, word2 not in graph
 *   (6) Both words not in graph
 *   (7) Case insensitivity: word1/word2 in different case
 *   (8) Boundary: word1 == word2, both in graph
 *   (9) Boundary: word1 is empty string
 *   (10) Boundary: word2 is empty string
 */
public class Lab1BlackBoxTest {

  /**
   * Set up the test graph before each test.
   * Graph structure:
   *   the -> scientist, team
   *   scientist -> carefully, analyzed
   *   carefully -> analyzed
   *   analyzed -> the, it
   *   data -> and, so
   *   wrote -> a
   *   a -> detailed
   *   detailed -> report
   *   report -> and, with
   *   and -> shared, the
   *   shared -> the, report
   *   with -> the
   *   team -> requested
   *   requested -> more
   *   more -> data
   *   so -> the
   *   it -> again
   *   again -> (no outgoing)
   */
  @BeforeEach
  public void setUp() {
    Graph g = new Graph();
    g.addEdge("the", "scientist");
    g.addEdge("the", "team");
    g.addEdge("scientist", "carefully");
    g.addEdge("scientist", "analyzed");
    g.addEdge("carefully", "analyzed");
    g.addEdge("analyzed", "the");
    g.addEdge("analyzed", "it");
    g.addEdge("data", "and");
    g.addEdge("data", "so");
    g.addEdge("wrote", "a");
    g.addEdge("a", "detailed");
    g.addEdge("detailed", "report");
    g.addEdge("report", "and");
    g.addEdge("report", "with");
    g.addEdge("and", "shared");
    g.addEdge("and", "the");
    g.addEdge("shared", "the");
    g.addEdge("shared", "report");
    g.addEdge("with", "the");
    g.addEdge("team", "requested");
    g.addEdge("requested", "more");
    g.addEdge("more", "data");
    g.addEdge("so", "the");
    g.addEdge("it", "again");
    Lab1.setGraph(g);
  }

  // TC01: Both words in graph, multiple bridge words exist
  // Build a custom graph: a->b, a->c, b->d, c->d => bridges for (a,d) are b and c
  // Covers equivalence class (1)
  @Test
  @DisplayName("TC01: Multiple bridge words exist")
  public void testMultipleBridgeWords() {
    Graph g = new Graph();
    g.addEdge("a", "b");
    g.addEdge("a", "c");
    g.addEdge("b", "d");
    g.addEdge("c", "d");
    Lab1.setGraph(g);

    String result = Lab1.queryBridgeWords("a", "d");
    assertTrue(
        result.contains("b") && result.contains("c"),
        "Should contain both bridge words: b and c");
    assertTrue(result.startsWith("The bridge words from"),
        "Should indicate multiple bridge words");
  }

  // TC02: Both words in graph, exactly one bridge word
  // word1="analyzed", word2="again": bridge is "it"
  // analyzed->it, it->again
  // Covers equivalence class (2)
  @Test
  @DisplayName("TC02: Single bridge word exists")
  public void testSingleBridgeWord() {
    String result = Lab1.queryBridgeWords("analyzed", "again");
    assertEquals(
        "The bridge word from \"analyzed\" to \"again\" is: it.",
        result);
  }

  // TC03: Both words in graph, no bridge words
  // word1="wrote", word2="team": wrote->a, a->detailed... no path to team
  // Covers equivalence class (3)
  @Test
  @DisplayName("TC03: No bridge words between existing words")
  public void testNoBridgeWords() {
    String result = Lab1.queryBridgeWords("wrote", "team");
    assertEquals(
        "No bridge words from \"wrote\" to \"team\"!",
        result);
  }

  // TC04: word1 not in graph, word2 in graph
  // Covers equivalence class (4)
  @Test
  @DisplayName("TC04: First word not in graph")
  public void testFirstWordNotInGraph() {
    String result = Lab1.queryBridgeWords("hello", "team");
    assertEquals("No \"hello\" in the graph!", result);
  }

  // TC05: word1 in graph, word2 not in graph
  // Covers equivalence class (5)
  @Test
  @DisplayName("TC05: Second word not in graph")
  public void testSecondWordNotInGraph() {
    String result = Lab1.queryBridgeWords("team", "world");
    assertEquals("No \"world\" in the graph!", result);
  }

  // TC06: Both words not in graph
  // Covers equivalence class (6)
  @Test
  @DisplayName("TC06: Both words not in graph")
  public void testBothWordsNotInGraph() {
    String result = Lab1.queryBridgeWords("hello", "world");
    assertEquals(
        "No \"hello\" and \"world\" in the graph!",
        result);
  }

  // TC07: Case insensitivity - input in uppercase
  // the->scientist->analyzed, so bridge for (THE, ANALYZED) is "scientist"
  // Covers equivalence class (7)
  @Test
  @DisplayName("TC07: Case insensitivity")
  public void testCaseInsensitivity() {
    String result = Lab1.queryBridgeWords("THE", "ANALYZED");
    assertEquals(
        "The bridge word from \"the\" to \"analyzed\" is: scientist.",
        result);
  }

  // TC08: Boundary - word1 equals word2, both in graph
  // the->scientist->? no "the"; the->team->? no "the"
  // So no bridge for (the, the)
  // Covers equivalence class (8)
  @Test
  @DisplayName("TC08: Same word as both inputs")
  public void testSameWordInput() {
    String result = Lab1.queryBridgeWords("the", "the");
    assertEquals(
        "No bridge words from \"the\" to \"the\"!",
        result);
  }

  // TC09: Boundary - empty string for word1
  // Covers equivalence class (9)
  @Test
  @DisplayName("TC09: Empty string as word1")
  public void testEmptyWord1() {
    String result = Lab1.queryBridgeWords("", "team");
    assertEquals("No \"\" in the graph!", result);
  }

  // TC10: Boundary - empty string for word2
  // Covers equivalence class (10)
  @Test
  @DisplayName("TC10: Empty string as word2")
  public void testEmptyWord2() {
    String result = Lab1.queryBridgeWords("team", "");
    assertEquals("No \"\" in the graph!", result);
  }
}
