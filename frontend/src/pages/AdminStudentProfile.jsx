import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { addMentorGuidance, getStudentByRegisterNumber, saveAdminGuidance } from "../services/adminService";

function renderList(values) {
  if (!values || !values.length) {
    return "N/A";
  }

  return values.join(", ");
}

function AdminStudentProfile() {
  const { registerNumber } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guidance, setGuidance] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchStudent() {
      try {
        setLoading(true);
        setError("");
        const response = await getStudentByRegisterNumber(registerNumber);

        if (!mounted) {
          return;
        }

        const studentData = response.data?.student || null;
        setStudent(studentData);
        setGuidance(studentData?.adminGuidance || "");
      } catch (fetchError) {
        if (!mounted) {
          return;
        }

        setError(fetchError.response?.data?.message || "Failed to fetch student profile.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchStudent();

    return () => {
      mounted = false;
    };
  }, [registerNumber]);

  async function handleSaveGuidance() {
    if (!student?._id || !guidance.trim()) {
      return;
    }

    try {
      setSaving(true);
      const response = await addMentorGuidance(student._id, guidance);
      const updatedStudent = response.data?.student;

      setStudent((current) => ({
        ...current,
        adminGuidance: updatedStudent?.adminGuidance || guidance,
        mentorGuidance: updatedStudent?.mentorGuidance || current?.mentorGuidance || [],
        ...(updatedStudent || {})
      }));
      setGuidance("");
      alert("Guidance saved successfully");
    } catch (saveError) {
      alert(saveError.response?.data?.message || "Failed to save guidance");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#071a2f] text-[#e5e7eb]">
      <div className="mx-auto flex max-w-[1400px] gap-6 p-6">
        <AdminSidebar />

        <main className="flex-1 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Student Profile</h2>
              <p className="mt-1 text-sm text-[#9cb2d1]">Detailed academic and career profile for admin review.</p>
            </div>

            <Link
              to="/admin/students"
              className="rounded-lg border border-white/10 bg-[#0f2747] px-4 py-2 text-sm text-white hover:bg-white/5"
            >
              Back to Students
            </Link>
          </div>

          {loading ? <p className="text-sm text-[#9cb2d1]">Loading student profile...</p> : null}
          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          {!loading && !error && student ? (
            <section className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-2xl border border-white/5 bg-[#0f2747] p-5 shadow-[0_0_20px_rgba(59,130,246,0.12)]">
                  <h3 className="text-lg font-semibold text-white">Student Details</h3>
                  <div className="mt-4 space-y-3 text-sm text-[#d9e6fb]">
                    <p><span className="font-semibold text-white">Name:</span> {student.name || "N/A"}</p>
                    <p><span className="font-semibold text-white">Register Number:</span> {student.registerNumber || "N/A"}</p>
                    <p><span className="font-semibold text-white">Department:</span> {student.department || "N/A"}</p>
                    <p><span className="font-semibold text-white">CGPA:</span> {Number(student.cgpa || 0).toFixed(2)}</p>
                  </div>
                </article>

                <article className="rounded-2xl border border-white/5 bg-[#0f2747] p-5 shadow-[0_0_20px_rgba(59,130,246,0.12)]">
                  <h3 className="text-lg font-semibold text-white">AI Career Recommendation</h3>
                  <p className="mt-4 text-base text-[#d9e6fb]">{student.recommendation || "No recommendation available."}</p>
                </article>
              </div>

              <article className="rounded-2xl border border-white/5 bg-[#0f2747] p-5 shadow-[0_0_20px_rgba(59,130,246,0.12)]">
                <h3 className="text-lg font-semibold text-white">Admin Guidance</h3>
                <textarea
                  value={guidance}
                  onChange={(e) => setGuidance(e.target.value)}
                  placeholder="Write mentor guidance for this student..."
                  className="mt-4 min-h-32 w-full rounded-xl border border-white/10 bg-[#0b1f36] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8da7c9] focus:border-blue-400/60"
                />
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveGuidance}
                    disabled={saving}
                    className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Guidance"}
                  </button>
                </div>
                <div className="mt-5 rounded-xl border border-white/10 bg-[#0b1f36] p-4">
                  <h4 className="text-sm font-semibold text-white">Saved Guidance</h4>
                  {student.mentorGuidance?.length ? (
                    <ul className="mt-2 space-y-3 text-sm text-[#d9e6fb]">
                      {student.mentorGuidance
                        .slice()
                        .reverse()
                        .map((entry, index) => (
                          <li key={`${entry.date || "guidance"}-${index}`} className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                            <p className="whitespace-pre-line">{entry.message}</p>
                            <p className="mt-1 text-xs text-[#8da7c9]">
                              {entry.date ? new Date(entry.date).toLocaleString("en-IN") : ""}
                            </p>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="mt-2 whitespace-pre-line text-sm text-[#d9e6fb]">
                      {student.adminGuidance || "No mentor guidance yet."}
                    </p>
                  )}
                </div>
              </article>

              <article className="rounded-2xl border border-white/5 bg-[#0f2747] p-5 shadow-[0_0_20px_rgba(59,130,246,0.12)]">
                <h3 className="text-lg font-semibold text-white">Skills</h3>
                <p className="mt-3 text-sm text-[#d9e6fb]">{renderList(student.skills)}</p>
              </article>

              <article className="rounded-2xl border border-white/5 bg-[#0f2747] p-5 shadow-[0_0_20px_rgba(59,130,246,0.12)]">
                <h3 className="text-lg font-semibold text-white">Interests</h3>
                <p className="mt-3 text-sm text-[#d9e6fb]">{renderList(student.interests)}</p>
              </article>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default AdminStudentProfile;
