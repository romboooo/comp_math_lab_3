export type IntegrationResult = {
  value: number;
  delta: number;
  percent: number;
  rungeError?: number; 
  refinedValue?: number;
  table?: TableData | ErrorTable
};

export type TableData = {
  headers: string[];
  rows: Array<{
    i: number;
    x: number;
    value: number;
    xi12?: number | undefined;
    yi12?: number | undefined;
  }>;
};

export type ErrorTable = {
  headers: string,
  row: string
}
export interface MethodComponentProps {
  a: number;
  b: number;
  func: (x: number) => number;
  epsilon: number;
  integralId: number; 
}
