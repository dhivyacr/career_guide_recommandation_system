function statusClass(status) {
  if (status === "Active") {
    return "bg-green-500/20 text-green-300 border-green-400/30";
  }
  return "bg-orange-500/20 text-orange-300 border-orange-400/30";
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }
  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
}

function RecentRegistrationsTable({ rows = [], loading }) {
  return (
    <section className="card-container rounded-3xl p-6">
      <h2 className="text-xl font-semibold text-white">Recent Registrations</h2>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-blue-300/20 text-ai-text/65">
              <th className="px-3 py-3 font-medium">User</th>
              <th className="px-3 py-3 font-medium">Date</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Role</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-4 text-ai-text/70" colSpan={5}>
                  Loading recent registrations...
                </td>
              </tr>
            ) : null}
            {!loading && rows.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-ai-text/70" colSpan={5}>
                  No recent registrations found.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr key={row.id || `${row.user}-${row.date}`} className="border-b border-blue-300/10 text-ai-text/90">
                <td className="px-3 py-4">{row.user}</td>
                <td className="px-3 py-4">{formatDate(row.date)}</td>
                <td className="px-3 py-4">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-4">{String(row.role || "-").replace(/^./, (char) => char.toUpperCase())}</td>
                <td className="px-3 py-4 text-ai-text/70">...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default RecentRegistrationsTable;
