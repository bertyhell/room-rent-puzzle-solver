import { GridValue } from './enums';

export class Grid {
  public readonly rows: number;
  public readonly cols: number;
  private grid: GridValue[][];

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.grid = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(GridValue.BLANK));
  }

  public static fromString(input: string): Grid {
    const trimmedLines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (trimmedLines.length === 0) {
      throw new Error("Input string contains no valid lines.");
    }

    const tokenizedLines = trimmedLines.map(line => line.split(' '));
    const firstLineLength = tokenizedLines[0].length;

    if (!tokenizedLines.every(lineTokens => lineTokens.length === firstLineLength)) {
      throw new Error("All input lines must have the same number of tokens after trimming and splitting by space.");
    }

    const tokens_per_line = firstLineLength;
    if (tokens_per_line === 0) { // This check assumes filter(line => line.length > 0) ensures non-empty lines.
                                // If a line was " " and split by " ", it might result in ["", ""], length 2.
                                // If a line was "" (empty string) it's filtered out.
                                // If a line was "a" it's ["a"], length 1.
                                // If a line was only spaces and trim made it "", it's filtered.
                                // So tokens_per_line should be > 0 if trimmedLines is not empty.
        throw new Error("Input lines must contain tokens after splitting.");
    }

    const parsedGridValues: GridValue[][] = [];
    for (const lineTokens of tokenizedLines) {
      const currentRowValues: GridValue[] = [];
      for (const token of lineTokens) {
        switch (token) {
          case '_':
            currentRowValues.push(GridValue.BLANK);
            break;
          case '0':
            currentRowValues.push(GridValue.ZERO);
            break;
          case '1':
            currentRowValues.push(GridValue.ONE);
            break;
          case '2':
            currentRowValues.push(GridValue.TWO);
            break;
          case '3':
            currentRowValues.push(GridValue.THREE);
            break;
          // WALL is not parsable from this simple format, it's for boundary/internal use.
          default:
            throw new Error(`Invalid token: '${token}' in input string.`);
        }
      }
      parsedGridValues.push(currentRowValues);
    }

    const num_input_lines = parsedGridValues.length;
    // Dimensions are based on the number of "rooms" or "cells" in the input.
    // Each "room" (token) is at an odd coordinate (1,1), (1,3) etc.
    // The walls/blanks are at even coordinates.
    // So, if input has R rows of tokens, it means R "room" rows.
    // These R rows need R-1 "wall/blank" rows between them, plus one "wall/blank" row at start and end.
    // Total rows = R (rooms) + (R-1) (internal walls/blanks) + 2 (outer border walls/blanks) = 2R+1
    const final_height = (num_input_lines * 2) + 1;
    const final_width = (tokens_per_line * 2) + 1;

    const newGrid = new Grid(final_height, final_width); // Constructor fills with BLANK

    for (let r = 0; r < num_input_lines; r++) {
      for (let c = 0; c < tokens_per_line; c++) {
        const grid_y = (r * 2) + 1; // Map to odd rows
        const grid_x = (c * 2) + 1; // Map to odd columns
        newGrid.set(grid_y, grid_x, parsedGridValues[r][c]);
      }
    }
    return newGrid;
  }

  public get(row: number, col: number): GridValue {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      throw new Error(`Grid coordinates out of bounds: (${row}, ${col})`);
    }
    return this.grid[row][col];
  }

  public set(row: number, col: number, value: GridValue): void {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      throw new Error(`Grid coordinates out of bounds: (${row}, ${col})`);
    }
    this.grid[row][col] = value;
  }

  public print(): void {
    for (let i = 0; i < this.rows; i++) {
      const rowString = this.grid[i]
        .map((cellValue) => {
          switch (cellValue) {
            case GridValue.WALL:
              return '#';
            case GridValue.BLANK:
              return ' '; // Single space
            case GridValue.ZERO:
              return '0';
            case GridValue.ONE:
              return '1';
            case GridValue.TWO:
              return '2';
            case GridValue.THREE:
              return '3';
            default:
              // Should not happen with GridValue enum
              return '?';
          }
        })
        .join(' '); // Keep the space for now, makes it easier to read dense grids
      console.log(rowString);
    }
  }
}
