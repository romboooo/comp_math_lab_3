import { useState, useEffect } from "react";
import type {
  IntegrationResult,
  MethodComponentProps,
  TableData,
  ErrorTable,
} from "../../utils/integration/types";
import { InlineMath } from "react-katex";
import { integrals } from "../../utils/integrals";
import '../../index.css';

const formatNumber = (num: number, decimals: number): string =>
  num.toFixed(decimals);

const formatValue = (num: number, decimals: number): string =>
  num.toFixed(decimals).replace(".", ",");

const buildTable = (
  a: number,
  b: number,
  n: number,
  func: (x: number) => number
): TableData => {
  const h = (b - a) / n;
  const rows = [];
  for (let i = 0; i <= n; i++) {
    const x = a + i * h;
    rows.push({
      i: i,
      x,
      value: func(x),
    });
  }
  return {
    headers: ["i", "x_i", "f(x_i)"],
    rows,
  };
};
const isErrorTable = (table: TableData | ErrorTable): table is ErrorTable => {
  return typeof table.headers === "string";
};

const buildErrorTable = (): ErrorTable => ({
  headers: "ошибка",
  row: "n слишком большое, таблица будет слишком большой",
});

export default function TrapezoidMethod({
  a,
  b,
  func,
  integralId,
  epsilon,
}: MethodComponentProps) {
  const [result, setResult] = useState<IntegrationResult>({
    value: 0,
    delta: 0,
    percent: 0,
    rungeError: undefined,
    refinedValue: undefined,
    table: undefined,
  });
  const [error, setError] = useState<string | null>(null);
  const [exactResult, setExactResult] = useState<number>(0);
  const [iterations, setIterations] = useState<
    { n: number; value: number; error: number; sum: number }[]
  >([]);
  const [currentN, setCurrentN] = useState<number>(2);
  const [isConverged, setIsConverged] = useState(false);

  useEffect(() => {
    setIterations([]);
    setCurrentN(2);
    setIsConverged(false);
    setResult({
      value: 0,
      delta: 0,
      percent: 0,
      rungeError: undefined,
      refinedValue: undefined,
      table: undefined,
    });
    setError(null);
  }, [a, b, func, integralId, epsilon]);

  useEffect(() => {
    const maxN = 1000000;
    if (currentN > maxN) {
      setError("Превышено максимальное количество разбиений");
      return;
    }

    const integral = integrals.find((i) => i.id === integralId);
    if (!integral || !integral.antiderivative) {
      setError("Интеграл не найден");
      return;
    }
    if (a >= b) {
      setError("a должно быть меньше b");
      return;
    }

    try {
      const exact = integral.antiderivative(b) - integral.antiderivative(a);
      setExactResult(exact);

      const calculateIntegral = (n: number) => {
        const h = (b - a) / n;
        let sum = (func(a) + func(b)) / 2;
        let internalSum = 0;
        for (let i = 1; i < n; i++) {
          const xi = a + i * h;
          const fxi = func(xi);
          internalSum += fxi;
          sum += fxi;
        }
        return { integralValue: sum * h, internalSum };
      };

      const { integralValue: I0 } = calculateIntegral(currentN);
      const { integralValue: I1, internalSum: sum1 } = calculateIntegral(
        currentN * 2
      );

      const rungeError = Math.abs((I1 - I0) / 3);

      setIterations((prev) => [
        ...prev,
        { n: currentN * 2, value: I1, error: rungeError, sum: sum1 },
      ]);

      if (rungeError <= epsilon) {
        const delta = exact - I1;
        const percent = exact !== 0 ? Math.abs((delta / exact) * 100) : 0;
        const table = buildTable(a, b, currentN * 2, func);

        if (currentN * 2 > 500) {
          setResult({
            value: I1,
            delta: Math.abs(delta),
            percent,
            rungeError,
            refinedValue: I1,
            table: buildErrorTable(),
          });
        } else {
          setResult({
            value: I1,
            delta: Math.abs(delta),
            percent,
            rungeError,
            refinedValue: I1,
            table,
          });
        }
        setIsConverged(true);
      } else {
        setCurrentN((prev) => prev * 2);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка вычислений");
      setResult({
        value: 0,
        delta: 0,
        percent: 0,
        rungeError: undefined,
        refinedValue: undefined,
        table: undefined,
      });
    }
  }, [a, b, func, integralId, currentN, epsilon]);

  const latest = iterations[iterations.length - 1];

  return (
    <div className="method-result">
      <h2>Метод трапеций:</h2>
      <h3>
        <InlineMath
          math={`\\ ${
            integrals.find((i) => i.id === integralId)?.formula || "f(x)"
          }\\ \\approx ${formatNumber(exactResult, 10)}`}
        />
      </h3>

      {latest && (
        <div className="calculation-steps">
          <div className="step-info">
            <InlineMath
              math={`n=${
                latest.n
              },\\quad h=\\frac{b-a}{n}=\\frac{${formatNumber(
                b,
                2
              )}-${formatNumber(a, 2)}}{${latest.n}}=${formatNumber(
                (b - a) / latest.n,
                4
              )}`}
            />
          </div>
          <div>
            <InlineMath
              math={`\\sum_{i=1}^{n-1}f(x_i)=${formatNumber(latest.sum, 4)}`}
            />
          </div>
          <div>
            <InlineMath
              math={`I_{${latest.n}}=${formatNumber(latest.value, 4)}`}
            />
          </div>
          <div className="runge-rule">
            <h3>
              <InlineMath
                math={`\\varepsilon=${formatNumber(
                  epsilon,
                  8
                )},\\quad n_{нач}=4`}
              />
            </h3>
            <h3>Оценка погрешности по Рунге:</h3>
            <InlineMath
              math={`\\delta=\\frac{I_n-I_{2n}}{2^2 - 1}=${formatNumber(
                latest.error,
                8
              )}${latest.error <= epsilon ? "\\le" : ">"}\\varepsilon`}
            />
          </div>

          <InlineMath
            math={`h \\cdot \\left( \\frac{f(a) + f(b)}{2} + \\sum_{i=1}^{n-1} f(x_i) \\right) = ${formatValue(
              (b - a) / latest.n,
              4
            )} \\cdot \\left( \\frac{${formatValue(func(a), 2)} + ${formatValue(
              func(b),
              2
            )}}{2} + ${formatValue(latest.sum, 2)} \\right) = ${latest.value}`}
          />
        </div>
      )}

      <div className="iteration-process">
        <h3>Итерационный процесс:</h3>
        {iterations.map((it, idx) => (
          <div key={idx} className="iteration-step">
            <InlineMath
              math={`n=${it.n}\\rightarrow I=${formatNumber(it.value, 10)}`}
            />
            <InlineMath
              math={`\\delta=${formatNumber(it.error, 8)}${
                it.error <= epsilon ? "\\le" : ">"
              }\\varepsilon`}
            />
          </div>
        ))}
        {isConverged && (
          <div className="convergence-message">
            <InlineMath
              math={`\\delta\\le\\varepsilon\\quad\\text{⇒ Критерий достигнут!}`}
            />
          </div>
        )}
      </div>

      {result.table && (
        <div className="result-table">
          {isErrorTable(result.table) ? (
            <div className="error-table-message">{result.table.row}</div>
          ) : (
            <table>
              <thead>
                <tr>
                  {result.table.headers.map((header) => (
                    <th key={header}>
                      <InlineMath math={header} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.table.rows.map((row, i) => (
                  <tr key={i}>
                    <td>{i}</td>
                    <td>
                      <InlineMath math={formatValue(row.x, 4)} />
                    </td>
                    <td>
                      <InlineMath math={formatValue(row.value, 4)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {isConverged && (
        <div className="final-results">
          <h3>Погрешность:</h3>
          <InlineMath math={`I_{точн}=${formatNumber(exactResult, 10)}`} />
          <InlineMath math={`I_{трап}=${formatNumber(result.value, 10)}`} />
          <InlineMath
            math={`\\delta=|I-I_{трап}|=${formatNumber(
              result.delta,
              4
            )}\\,( ${formatNumber(result.percent, 2)}\\%)`}
          />
        </div>
      )}

      {error && <div className="error-message">Ошибка: {error}</div>}
    </div>
  );
}
