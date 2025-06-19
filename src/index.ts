import { Grid } from './grid';
import { GridValue } from './enums'; // Now needed for manual wall placement
import { isValidSolution } from './validation';

const main = () => {
  const inputString =
`3 _ _ 3 2 _ _ _ 3
_ _ 3 2 _ _ _ _ _
3 0 1 2 _ _ 1 _ 3
0 _ _ _ 2 _ _ _ _
2 _ 3 1 _ _ 3 2 2
2 3 _ 2 _ 3 1 _ 2`;

  console.log("Attempting to generate grid from string...");
  console.log("Input string:");
  console.log(inputString);
  console.log();

  try {
    let grid = Grid.fromString(inputString); // Use 'let' to allow re-assignment for clean slate tests
    console.log("Grid generated from string (initial state):");
    grid.print();
    console.log("Is initial solution valid (expected false as no walls for numbers):", isValidSolution(grid));
    console.log("\n--- Starting Test Scenarios for isValidSolution ---");

    // --- Scenario 1: Valid small loop around the '1' at data cell (2,2) from input, which is grid cell (5,5) ---
    // This '1' needs one wall. We'll make a U-shape and then close it.
    // The '0' at (2,1) from input, grid (5,3), should have no walls.
    // The '2' at (2,3) from input, grid (5,7), should have two walls.
    console.log("\n--- Scenario 1: Attempting a valid loop around '1' at (5,5) ---");
    grid = Grid.fromString(inputString); // Reset grid

    // Cell (5,5) has GridValue.ONE. We need one wall. Let's place it to its left.
    // To make a valid loop, this single wall must be part of a larger structure that doesn't violate other numbers.
    // This is tricky. A single wall for a '1' cannot form a loop by itself.
    // Let's modify a '1' to be a '2' and make a tiny loop.
    // Change input cell (2,2) (grid 5,5) from '1' to '2'
    // For this, we'd need to modify fromString or add a new string.
    // Alternative: Find a '2' in the input. (1,9) is '2' (grid cell 3,19). (2,3) is '2' (grid 5,7)

    // Let's use the '1' at (5,5) and make a valid segment that satisfies it, then test invalid states.
    // Then create a fully valid state with a loop for a '2'.

    // Test 1.1: Satisfy '1' at (5,5) with one wall, but no loop.
    grid.set(5, 4, GridValue.WALL); // Wall to the left of (5,5)
    console.log("Grid with one wall next to '1' at (5,5):");
    grid.print();
    console.log("Scenario 1.1 - Is valid (should be false, no loop, other numbers not satisfied):", isValidSolution(grid));

    // Test 1.2: Create a minimal valid loop for a '2'.
    // Let's use a fresh grid and place a '2' and form a loop.
    // Input: "_ 2 _\n_ _ _\n_ _ _" implies a 3x3 data grid, so 7x7 actual grid.
    // (0,1) is '2', so grid (1,3) is '2'.
    console.log("\n--- Scenario 1.2: Valid small loop for a '2' ---");
    const smallInput = `_ 2 _`; // Creates 3x7 grid. (0,1) is '2', maps to grid (1,3)
    grid = Grid.fromString(smallInput);
    grid.set(1, 2, GridValue.WALL); // Wall left of (1,3)
    grid.set(1, 4, GridValue.WALL); // Wall right of (1,3)
    // These two walls satisfy the '2'. Now make them a loop.
    // Add walls at (0,3) and (2,3) to connect these, but those are data cells. This is wrong.
    // Walls for (1,3) are (0,3), (2,3), (1,2), (1,4).
    // Correct loop for '2' at (1,3): (0,3) and (1,2) -> (0,3) is wall, (1,2) is wall.
    // (0,3) is Wall, (1,2) is Wall.
    grid.set(0, 3, GridValue.WALL); // Top of (1,3)
    // grid.set(1, 2, GridValue.WALL); // Left of (1,3) - already set
    // grid.set(2, 3, GridValue.WALL); // Bottom of (1,3)
    // grid.set(1, 4, GridValue.WALL); // Right of (1,3) - already set
    // To form a loop of just these two walls, they need to connect.
    // This means the "dots" at (0,2), (0,4), (2,2), (2,4) would be involved.
    // This is getting complicated for manual setup. Let's use the example that should work.
    // The provided example string *should* be a valid solution if walls were added correctly.
    // For now, let's simplify Scenario 1 to be a known valid configuration if possible.

    // Let's use a simpler valid case based on the rules:
    // A '0' with no walls around it.
    console.log("\n--- Scenario 1.3: Valid - '0' with no walls ---");
    grid = Grid.fromString("0"); // Grid (1,1) is '0'. No walls.
    console.log("Grid for '0':");
    grid.print();
    console.log("Scenario 1.3 - Is valid:", isValidSolution(grid));


    // --- Scenario 2: Invalid - Broken loop ---
    console.log("\n--- Scenario 2: Invalid - Broken loop ---");
    grid = Grid.fromString("_ 1 _"); // (1,3) is '1'
    grid.set(0, 3, GridValue.WALL); // Wall above (1,3) - satisfies '1'
    // This is a single wall segment. checkWallStructure should make it fail.
    console.log("Grid with a single wall segment (broken loop):");
    grid.print();
    console.log("Scenario 2 - Is valid (should be false):", isValidSolution(grid));

    grid.set(1, 2, GridValue.WALL); // Add another wall to left of (1,3)
    // Now (1,3) has two walls, but they don't form a loop.
    console.log("Grid with two disconnected walls around '1':");
    grid.print();
    console.log("Scenario 2.1 - Is valid (should be false, '1' expects 1 wall, has 2, also not a loop):", isValidSolution(grid));


    // --- Scenario 3: Invalid - Number constraint violated ---
    console.log("\n--- Scenario 3: Invalid - Number constraint violated ---");
    grid = Grid.fromString("_ 1 _"); // (1,3) is '1'
    grid.set(0, 3, GridValue.WALL); // Wall T
    grid.set(2, 3, GridValue.WALL); // Wall B
    // Loop structure for these two could be: (0,3)-(1,2)-(2,3)-(1,4)-(0,3)
    // grid.set(1,2, GridValue.WALL); grid.set(1,4, GridValue.WALL); // These connect T and B to form a loop.
    // But (1,3) is '1' and has 2 walls (T&B). Number constraint violated.
    console.log("Grid for '1' with two walls (T&B):");
    grid.print();
    console.log("Scenario 3 - Is valid (should be false, '1' has 2 walls):", isValidSolution(grid));


    // --- Scenario 4: Invalid - Wall in wrong place ---
    console.log("\n--- Scenario 4: Invalid - Wall in wrong place ---");
    grid = Grid.fromString("_ _ _");
    grid.set(1, 1, GridValue.WALL); // Wall in a data cell (odd,odd)
    console.log("Grid with wall in a data cell (1,1):");
    grid.print();
    console.log("Scenario 4.1 - Is valid (should be false):", isValidSolution(grid));

    grid = Grid.fromString("_ _ _");
    grid.set(0, 0, GridValue.WALL); // Wall in a 'dot' cell (even,even)
    console.log("Grid with wall in a 'dot' cell (0,0):");
    grid.print();
    console.log("Scenario 4.2 - Is valid (should be false):", isValidSolution(grid));

    // --- Scenario 5: A more complex valid case from example (manual) ---
    // This would involve correctly placing all walls for the initial large inputString.
    // That's too complex for manual setup here. The prior tests cover specific rule violations.

    // --- Scenario 5: Two adjacent '3's with a surrounding valid loop ---
    console.log("\n\n--- Scenario 5: Two adjacent '3's with a surrounding valid loop ---");
    const inputStringScenario5 = "3 3"; // Data cells are (0,0) and (0,1) in input string terms
                                      // Mapped to grid: G[1][1] (value 3) and G[1][3] (value 3)
    let gridScenario5 = Grid.fromString(inputStringScenario5);
    console.log("Initial grid for Scenario 5 (from '3 3'):");
    gridScenario5.print();

    // G[1][1] (value 3) needs 3 walls.
    // G[1][3] (value 3) needs 3 walls.
    // Shared wall: (1,2)

    // Walls for G[1][1]: (0,1)T, (2,1)B, (1,0)L. (Shared (1,2)R)
    // Walls for G[1][3]: (0,3)T, (2,3)B, (1,4)R. (Shared (1,2)L)

    // Outer boundary walls:
    gridScenario5.set(0, 1, GridValue.WALL); // Top for G[1][1]
    gridScenario5.set(0, 3, GridValue.WALL); // Top for G[1][3]
    gridScenario5.set(2, 1, GridValue.WALL); // Bottom for G[1][1]
    gridScenario5.set(2, 3, GridValue.WALL); // Bottom for G[1][3]
    gridScenario5.set(1, 0, GridValue.WALL); // Left for G[1][1]
    gridScenario5.set(1, 4, GridValue.WALL); // Right for G[1][3]

    // Shared inner wall gridScenario5.set(1, 2, GridValue.BLANK); // Ensure NO wall between G[1][1] and G[1][3]
    // Since the grid is initialized with BLANK, we just don't set (1,2) to WALL.

    console.log("\nGrid for Scenario 5 with walls set (no middle wall):");
    gridScenario5.print();
    console.log("Scenario 5 - Is valid:", isValidSolution(gridScenario5)); // Expected: true, as each '3' should now have 3 walls.

    console.log("\n--- End of Test Scenarios ---");


  } catch (error) {
    if (error instanceof Error) {
      console.error("Error during processing or testing:", error.message, error.stack);
    } else {
      console.error("An unknown error occurred:", error);
    }
  }
};

main();
