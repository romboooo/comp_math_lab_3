import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import '../index.css'

type MethodType = "left" | "right" | "mid" | "trapezoid" | "simpson";

export interface IntegralConfig {
  id: number;
  formula: string;
  fn: (x: number) => number;
  antiderivative: (x: number) => number;
  a: string;
  b: string;
  epsilon: string;
  methods: MethodType[];
}

const initialIntegrals: IntegralConfig[] = [
  {
    id: 1,
    formula: "\\int_{a}^{b} (-x^3 - x^2 - 2x + 1) dx",
    fn: (x) => -(x ** 3) - x ** 2 - 2 * x + 1,
    antiderivative: (x) => -(x**4)/4 - (x**3)/3 - x**2 + x,
    a: "",
    b: "",
    epsilon: "",
    methods: [],
  },
  {
    id: 2,
    formula: "\\int_{a}^{b} (-3x^5 - 5x^2 + 4x - 2) dx",
    fn: (x) => -3 * x ** 5 - 5 * x ** 2 + 4 * x - 2,
    antiderivative: (x) => -(0.5*x**6) - (5/3)*x**3 + 2*x**2 - 2*x,
    a: "",
    b: "",
    epsilon: "",
    methods: [],
  },
  {
    id: 3,
    formula: "\\int_{a}^{b} (-x^3 - x^2 + x + 3) dx",
    fn: (x) => -(x ** 3) - x ** 2 + x + 3,
    antiderivative: (x) => -(0.25*x**4) - (1/3)*x**3 + 0.5*x**2 + 3*x,
    a: "",
    b: "",
    epsilon: "",
    methods: [],
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [integrals, setIntegrals] =
    useState<IntegralConfig[]>(initialIntegrals);

  const updateIntegral = (id: number, updates: Partial<IntegralConfig>) => {
    setIntegrals((prev) =>
      prev.map((integral) =>
        integral.id === id ? { ...integral, ...updates } : integral
      )
    );
  };

  const handleSubmit = (integralId: number) => (e: React.FormEvent) => {
    e.preventDefault();
    const integral = integrals.find((i) => i.id === integralId);

    if (!integral) return;

    const epsilonValue = parseFloat(integral.epsilon.replace(",", "."));
    if (isNaN(epsilonValue) || epsilonValue <= 0) {
      alert("Введите корректное epsilon");
      return;
    }

    if (integral.methods.length > 0 && integral.a && integral.b) {
      navigate("/result", {
        state: {
          formula: integral.formula
            .replace("a", integral.a)
            .replace("b", integral.b),
          integralId: integral.id,
          methods: integral.methods,
          a: parseFloat(integral.a),
          b: parseFloat(integral.b),
          epsilon: epsilonValue,
        },
      });
    }
  };

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>
        Лабораторная работа №3. Численное интегрирование
      </h1>

      {integrals.map((integral) => (
        <div 
          key={integral.id} 
          style={{
            width: '100%',
            maxWidth: '800px',
            margin: '20px 0',
            padding: '25px',
            border: '1px solid #e0e0e0',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <InlineMath math={integral.formula} />
            
            <div style={{ 
              display: 'flex',
              gap: '10px',
              marginTop: '15px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <input
                type="number"
                placeholder="a"
                value={integral.a}
                onChange={(e) => updateIntegral(integral.id, { a: e.target.value })}
                style={{ padding: '8px', width: '120px' }}
              />
              <input
                type="number"
                placeholder="b"
                value={integral.b}
                onChange={(e) => updateIntegral(integral.id, { b: e.target.value })}
                style={{ padding: '8px', width: '120px' }}
              />
              <input
                type="number"
                placeholder="epsilon (точность)"
                value={integral.epsilon}
                step="0.01"
                onChange={(e) => {
                  let value = e.target.value.replace(",", ".");
                  updateIntegral(integral.id, { epsilon: value });
                }}
                style={{ padding: '8px', width: '180px' }}
              />
            </div>
          </div>

          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '20px 0'
          }}>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              width: '100%',
              marginBottom: '20px'
            }}>
              {(["left", "right", "mid", "trapezoid", "simpson"] as MethodType[]).map((method) => (
                <label 
                  key={method}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <input
                    type="checkbox"
                    checked={integral.methods.includes(method)}
                    onChange={(e) => {
                      const newMethods = e.target.checked
                        ? [...integral.methods, method]
                        : integral.methods.filter((m) => m !== method);
                      updateIntegral(integral.id, { methods: newMethods });
                    }}
                  />
                  {methodLabels[method]}
                </label>
              ))}
            </div>

            <button
              onClick={handleSubmit(integral.id)}
              disabled={!integral.methods.length || !integral.a || !integral.b}
              style={{
                padding: '12px 24px',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                width: '100%',
                maxWidth: '300px'
              }}
            >
              Рассчитать интеграл {integral.id}
            </button>
          </div>
        </div>
      ))}
        <h6>ромбу. все права защищены</h6>

    </div>
  );
}

const methodLabels = {
  left: "Левые прямоугольники",
  right: "Правые прямоугольники",
  mid: "Средние прямоугольники",
  trapezoid: "Трапеции",
  simpson: "Симпсон",
};
