import "./KPICard.css";
import {
  BriefcaseBusiness,
  IndianRupee,
  Building2,
  MapPinned,
  Users,
  House,
  TrendingUp,
} from "lucide-react";

const ICONS = {
  "Total Jobs": <BriefcaseBusiness size={24} />,
  "Average Salary": <IndianRupee size={24} />,
  Companies: <Building2 size={24} />,
  Cities: <MapPinned size={24} />,
  Roles: <Users size={24} />,
  "Remote Jobs": <House size={24} />,
};

const COLORS = {
  "Total Jobs": "#2563EB",
  "Average Salary": "#16A34A",
  Companies: "#EA580C",
  Cities: "#9333EA",
  Roles: "#0891B2",
  "Remote Jobs": "#4F46E5",
};

export default function KPICard({ title, value }) {
  return (
    <div
      className="kpi-card"
      style={{
        borderLeft: `6px solid ${COLORS[title]}`,
      }}
    >
      <div className="kpi-header">
        <div
          className="icon-box"
          style={{
            background: COLORS[title],
          }}
        >
          {ICONS[title]}
        </div>

        <div className="trend">
          <TrendingUp size={16} />
          8.3%
        </div>
      </div>

      <h4>{title}</h4>

      <h2>{value}</h2>

      <p>Updated from latest market data</p>
    </div>
  );
}