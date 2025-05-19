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
  for (let i = 1; i <= n; i++) {
    const x = a + i * h;
    rows.push({
      i: i,
      x,
      value: func(x),
    });
  }
  return {
    headers: ["i", "x_i", "y_i"],
    rows,
  };
};

const isErrorTable = (table: TableData | ErrorTable): table is ErrorTable => {
  return typeof table.headers === "string";
};

const buildErrorTable = (): ErrorTable => ({
  headers: "Ошибка",
  row: "Слишком большое n, таблица будет громоздкой",
});

export default function RightRectangleMethod({
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
    setCurrentN(4);
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
        let sum = 0;
        for (let i = 1; i <= n; i++) {
          const xi = a + i * h;
          sum += func(xi);
        }
        return { integralValue: sum * h, sum };
      };

      const { integralValue: I0 } = calculateIntegral(currentN);
      const { integralValue: I1, sum: sum1 } = calculateIntegral(currentN * 2);

      const rungeError = Math.abs(I1 - I0);

      setIterations((prev) => [
        ...prev,
        { n: currentN * 2, value: I1, error: rungeError, sum: sum1 },
      ]);

      if (rungeError <= epsilon) {
        const delta = exact - I1;
        const percent = exact !== 0 ? Math.abs((delta / exact) * 100) : 0;
        const table = buildTable(a, b, currentN * 2, func);

        setResult({
          value: I1,
          delta: Math.abs(delta),
          percent,
          rungeError,
          refinedValue: I1,
          table: currentN * 2 > 500 ? buildErrorTable() : table,
        });
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
      <h2>Метод правых прямоугольников:</h2>
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
              math={`\\sum_{i=1}^{n}y_i=${formatNumber(latest.sum, 4)}`}
            />
          </div>
          <div>
            <InlineMath
              math={`I_{${latest.n}}=${formatNumber(latest.value, 4)}`}
            />
          </div>
          <h3>
            <InlineMath math={`\\varepsilon=${formatNumber(epsilon, 8)}`} />
          </h3>
          <div className="runge-rule">
            <h3>Оценка погрешности по Рунге:</h3>
            <InlineMath
              math={`\\delta=\\frac{I_{2n}-I_n}{2^2 - 1}=${formatNumber(
                latest.error,
                8
              )}${latest.error <= epsilon ? "\\le" : ">"}\\varepsilon`}
            />
          </div>

          <InlineMath
            math={`h \\cdot \\sum_{i=1}^{n} y_i = ${formatValue(
              (b - a) / latest.n,
              4
            )} \\cdot ${formatValue(latest.sum, 2)} = ${latest.value}`}
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

      <h3>Таблица:</h3>
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
                    <td>
                      {" "}
                      <InlineMath math={String(row.i)} />
                    </td>

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
          <InlineMath math={`I_{сред}=${formatNumber(result.value, 10)}`} />
          <InlineMath
            math={`\\delta=|I-I_{сред}|=${formatNumber(
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
