
export const integrals = [
  {
    id: 1,
    formula: '\\int_{a}^{b} (-x^3 - x^2 - 2x + 1) dx',
    fn: (x: number) => -(x**3) - x**2 - 2*x + 1,
    antiderivative: (x: number) => -(x**4/4) - x**3/3 - x**2 + x
  },
  {
    id: 2,
    formula: '\\int_{a}^{b} (-3x^5 - 5x^2 + 4x - 2) dx',
    fn: (x: number) => -3*x**5 - 5*x**2 + 4*x - 2,
    antiderivative: (x: number) => -0.5*x**6 - (5/3)*x**3 + 2*x**2 - 2*x
  },
  {
    id: 3,
    formula: '\\int_{a}^{b} (-x^3 - x^2 + x + 3) dx',
    fn: (x: number) => -(x**3) - x**2 + x + 3,
    antiderivative: (x: number) => -0.25*x**4 - (1/3)*x**3 + 0.5*x**2 + 3*x
  }
];
