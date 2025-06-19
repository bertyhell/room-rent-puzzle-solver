import { Grid } from './grid';
// GridValue might be needed if we decide to manually set cells for demonstration
// import { GridValue } from './enums';
import { isValidSolution } from './validation';

const main = () => {
  // Default input string for demonstration
  const inputString =
`3 _ _ 3 2 _ _ _ 3
_ _ 3 2 _ _ _ _ _
3 0 1 2 _ _ 1 _ 3
0 _ _ _ 2 _ _ _ _
2 _ 3 1 _ _ 3 2 2
2 3 _ 2 _ 3 1 _ 2`;

  console.log("--- Slitherlink Puzzle Solver ---");
  console.log("Demonstrating grid creation from input string:");
  console.log("Input String:");
  console.log(inputString);
  console.log();

  try {
    const grid = Grid.fromString(inputString);

    console.log("Parsed Grid (Initial State - No Walls Added Manually):");
    grid.print();
    console.log();

    // Demonstrate isValidSolution on the initial grid (which is expected to be false
    // if there are number clues > 0, as no walls have been algorithmically placed yet)
    console.log("Checking validity of the initial grid (no walls placed):");
    const initialValidity = isValidSolution(grid);
    console.log("Is the initial grid a valid solution?", initialValidity);
    if (!initialValidity) {
      console.log("(This is expected to be false if there are number clues > 0, as no walls are present to satisfy them, or if no number clues are present at all).");
    }

    console.log("\nTo solve the puzzle or test specific configurations, please use the test suite (`bun test`).");

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error during grid processing:", error.message, error.stack);
    } else {
      console.error("An unknown error occurred during grid processing:", error);
    }
  }
};

main();
