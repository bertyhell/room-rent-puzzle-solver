import { Grid } from './grid';
import { solvePuzzle } from './solver';

const main = () => {
  const inputString =
      `
3 _ _ 3 2 _ _ _ 3
_ _ 3 2 _ _ _ _ _
3 0 1 2 _ _ 1 _ 3
0 _ _ _ 2 _ _ _ _
2 _ 3 1 _ _ 3 2 2
2 3 _ 2 _ 3 1 _ 2
`;

  console.log("Input String for Solver:");
  console.log(inputString.trim());

  try {
    const initialGrid = Grid.fromString(inputString);

    console.log("Initial Parsed Grid:");
    initialGrid.print();

    console.log("Attempting to solve puzzle...");
    const startTime = Date.now();
    const solutionGrid = solvePuzzle(initialGrid);
    const endTime = Date.now();

    console.log(`Solver finished in ${(endTime - startTime) / 1000} seconds.`);

    if (solutionGrid) {
      console.log("Solution found:");
      solutionGrid.print();
    } else {
      console.log("No solution found for the puzzle.");
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error during solver demonstration:", error.message, error.stack);
    } else {
      console.error("An unknown error occurred during solver demonstration:", error);
    }
  }
};

main();
