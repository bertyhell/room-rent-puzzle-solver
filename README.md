# Grid Project

A Node.js TypeScript application demonstrating a dynamically sized grid data structure. The grid is initialized from a multi-line string input, and its dimensions are determined by the content of this string. It features enum-based cell values and a console print function.

## Grid Initialization and Structure

The `Grid` is created using a static factory method `Grid.fromString(inputString)`.

-   **Input Format:**
    -   The input should be a multi-line string.
    -   Each line represents a row of "rooms" or primary cells.
    -   Tokens on each line should be space-separated.
    -   Valid tokens are:
        -   `_` for a blank space (internally `GridValue.BLANK`).
        -   `0`, `1`, `2`, `3` for numerical values (e.g., `GridValue.ZERO`).
    -   All lines must have the same number of tokens after trimming.
    -   The application will throw errors for malformed input (e.g., empty input, inconsistent line lengths, invalid tokens).

-   **Dynamic Sizing:**
    -   The grid's dimensions are calculated based on the input string:
        -   `height = (number of input lines * 2) + 1`
        -   `width = (tokens per line * 2) + 1`
    -   This formula means that the input tokens are placed at odd-numbered coordinates (e.g., (1,1), (1,3), (3,1)). The even-numbered coordinates are initialized as `GridValue.BLANK` and act as separators or "walls" between the primary cells defined in the input string.

-   **Example Usage (`src/index.ts`):**
    ```typescript
    const inputString =
    `3 _ _ 3 2 _ _ _ 3
    _ _ 3 2 _ _ _ _ _
    3 0 1 2 _ _ 1 _ 3
    0 _ _ _ 2 _ _ _ _
    2 _ 3 1 _ _ 3 2 2
    2 3 _ 2 _ 3 1 _ 2`;

    try {
      const grid = Grid.fromString(inputString);
      grid.print();
    } catch (error) {
      console.error("Error generating grid:", error.message);
    }
    ```

## Prerequisites

- Node.js (which includes npm) installed on your system.

## Setup

To install the necessary dependencies, run:
```bash
npm install
```

## Build

To compile the TypeScript code, run:
```bash
npm run build
```
This will generate JavaScript files in the `dist` directory.

## Run

After building the project, you can run the application using:
```bash
npm run start
```
This will execute the compiled code from `dist/index.js` and print the grid (or an error message) to the console.

## Development

For a streamlined development workflow (which automatically builds and then runs the application), use:
```bash
npm run dev
```

---

# room-rent-puzzle-solver
brute force room rent puzzle solver
