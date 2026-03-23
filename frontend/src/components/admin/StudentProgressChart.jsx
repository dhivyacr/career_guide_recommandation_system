import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const CHART_COLORS = ["#4f8cff", "#36d399", "#f59e0b", "#f472b6"];

function StudentProgressChart({ progress }) {
  const labels = progress?.labels || [];
  const datasets = (progress?.datasets || []).map((dataset, index) => ({
    label: dataset.label,
    data: dataset.data,
    borderColor: CHART_COLORS[index % CHART_COLORS.length],
    backgroundColor: `${CHART_COLORS[index % CHART_COLORS.length]}33`,
    borderWidth: 3,
    pointRadius: 4,
    pointHoverRadius: 5,
    tension: 0.4,
    fill: false
  }));

  const data = {
    labels,
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#e5e7eb",
          usePointStyle: true,
          boxWidth: 10
        }
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#e5e7eb",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: "rgba(148, 163, 184, 0.12)"
        },
        ticks: {
          color: "#cbd5e1"
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: "rgba(148, 163, 184, 0.12)"
        },
        ticks: {
          color: "#cbd5e1",
          callback: (value) => `${value}%`
        }
      }
    }
  };

  return <Line data={data} options={options} />;
}

export default StudentProgressChart;
