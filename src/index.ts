import { Grid } from './grid';
// GridValue might not be directly used here anymore if only using fromString
// import { GridValue } from './enums';

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
    const grid = Grid.fromString(inputString);
    console.log("Grid generated from string:");
    grid.print();
  } catch (error) {
    // It's good practice to check if error is an instance of Error
    if (error instanceof Error) {
      console.error("Error generating grid:", error.message);
    } else {
      console.error("An unknown error occurred:", error);
    }
  }
};

main();
