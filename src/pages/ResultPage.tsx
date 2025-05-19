import { useLocation, useNavigate } from "react-router-dom";
import type { MethodComponentProps } from "../utils/integration/types";
import { integrals } from "../utils/integrals";
import LeftMethod from "../components/methods/Left";
import RightMethod from "../components/methods/Right";
import MidMethod from "../components/methods/Mid";
import TrapezoidMethod from "../components/methods/Trapezoid";
import SimpsonMethod from "../components/methods/Simpson";
import "../index.css";

type MethodComponents = {
  [key: string]: React.ComponentType<MethodComponentProps>;
};

const methodComponents: MethodComponents = {
  left: LeftMethod,
  right: RightMethod,
  mid: MidMethod,
  trapezoid: TrapezoidMethod,
  simpson: SimpsonMethod,
};

type LocationState = {
  integralId: number;
  a: number;
  b: number;
  methods: string[];
  epsilon: number;
};

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  if (!state) return <div>Данные не загружены</div>;

  const selectedIntegral = integrals.find((i) => i.id === state.integralId);

  if (!selectedIntegral) {
    return <div className="error">Интеграл #{state.integralId} не найден</div>;
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          left: "0px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          textDecoration: "underline",
          alignSelf: "flex-end",
        }}
      >
        ← На главную
      </button>

      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          marginTop: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1 style={{ textAlign: "center" }}>Результаты вычислений</h1>

        {state.methods.map((method) => {
          const MethodComponent = methodComponents[method];
          return MethodComponent ? (
            <div
              key={method}
              style={{
                width: "100%",
                maxWidth: "800px",
                margin: "20px 0",
                padding: "20px",
                border: "1px solid #eee",
                borderRadius: "8px",
              }}
            >
              <MethodComponent
                a={state.a}
                b={state.b}
                func={selectedIntegral.fn}
                integralId={state.integralId}
                epsilon={state.epsilon}
              />
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}
