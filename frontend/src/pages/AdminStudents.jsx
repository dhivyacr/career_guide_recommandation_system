import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { getStudents } from "../services/adminService";

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchStudents() {
      try {
        const res = await getStudents();
        if (!mounted) {
          return;
        }
        setStudents(res.data?.students || res.data || []);
      } catch (fetchError) {
        if (!mounted) {
          return;
        }
        setError(fetchError.response?.data?.message || "Failed to fetch students");
      }
    }

    fetchStudents();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#071a2f] text-[#e5e7eb]">
      <div className="mx-auto flex max-w-[1400px] gap-6 p-6">
        <AdminSidebar />

        <main className="flex-1 space-y-5">
          <h2 className="text-2xl font-semibold text-white">Students List</h2>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <div className="rounded-2xl border border-white/5 bg-[#0f2747] p-4 shadow-[0_0_20px_rgba(59,130,246,0.12)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[#9cb2d1]">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Degree</th>
                    <th className="px-3 py-2">GPA</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className="border-t border-white/10">
                      <td className="px-3 py-2">{student.name || "N/A"}</td>
                      <td className="px-3 py-2">{student.degree || "N/A"}</td>
                      <td className="px-3 py-2">{student.gpa || "N/A"}</td>
                      <td className="px-3 py-2">
                        <button type="button" className="rounded-lg bg-[#3b82f6] px-3 py-1.5 text-xs font-semibold text-white">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!students.length ? (
                    <tr>
                      <td className="px-3 py-3 text-[#aab9cf]" colSpan={4}>
                        No students found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminStudents;
