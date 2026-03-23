import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function StudentSkillRadar({ labels = [], skills = [] }) {
  const data = {
    labels,
    datasets: [
      {
        label: "Skill Strength",
        data: skills,
        backgroundColor: "rgba(79,140,255,0.2)",
        borderColor: "#4f8cff",
        borderWidth: 2,
        pointBackgroundColor: "#4f8cff"
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          color: "#fff",
          backdropColor: "transparent"
        },
        grid: {
          color: "#444"
        },
        angleLines: {
          color: "#555"
        },
        pointLabels: {
          color: "#fff"
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: "#fff"
        }
      }
    }
  };

  return <Radar data={data} options={options} />;
}

export default StudentSkillRadar;
