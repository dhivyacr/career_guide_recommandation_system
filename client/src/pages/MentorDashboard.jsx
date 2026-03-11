import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
}

function MentorDashboard() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudents() {
      try {
        const response = await api.get("/students");
        setStudents(response.data || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load students");
      }
    }

    loadStudents();
  }, []);

  async function handleFeedback(event) {
    event.preventDefault();
    try {
      const response = await api.post("/mentor/feedback", { studentId: selectedStudent, feedback: feedbackText });
      setStudents((current) =>
        current.map((student) =>
          student._id === response.data._id
            ? {
                ...student,
                mentorFeedback: response.data.mentorFeedback || response.data.mentorReview || feedbackText,
                updatedAt: response.data.updatedAt || new Date().toISOString()
              }
            : student
        )
      );
      setMessage("Feedback saved successfully");
      setFeedbackText("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to save feedback");
    }
  }

  return (
    <Layout title="Mentor Dashboard">
      {error ? <p className="mb-4 rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p> : null}
      {message ? <p className="mb-4 rounded-xl bg-emerald-500/10 p-4 text-emerald-300">{message}</p> : null}
      <div className="grid gap-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold">Students</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Register Number</th>
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2">Career Goal</th>
                  <th className="px-3 py-2">Skills</th>
                  <th className="px-3 py-2">Last Updated</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-t border-slate-800">
                    <td className="px-3 py-3">{student.name || "N/A"}</td>
                    <td className="px-3 py-3">{student.registerNumber || "N/A"}</td>
                    <td className="px-3 py-3">{student.department || "N/A"}</td>
                    <td className="px-3 py-3">{student.careerGoal || student.careerPath || "N/A"}</td>
                    <td className="px-3 py-3">{(student.skills || []).join(", ") || "N/A"}</td>
                    <td className="px-3 py-3">{formatDate(student.updatedAt)}</td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-sky-400"
                        onClick={() => {
                          setSelectedStudent(student._id);
                          setFeedbackText(student.mentorFeedback || "");
                        }}
                      >
                        Give Feedback
                      </button>
                    </td>
                  </tr>
                ))}
                {!students.length ? (
                  <tr>
                    <td className="px-3 py-3 text-slate-400" colSpan={7}>
                      No students found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 lg:max-w-xl">
          <h2 className="text-xl font-semibold">Feedback Submission</h2>
          <form className="mt-4 space-y-4" onSubmit={handleFeedback}>
            <select className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>{student.name}</option>
              ))}
            </select>
            <textarea className="min-h-32 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Feedback" />
            <button className="rounded-xl bg-sky-500 px-4 py-3 font-medium text-slate-950 hover:bg-sky-400" type="submit">
              Submit Feedback
            </button>
          </form>
        </section>
      </div>
    </Layout>
  );
}

export default MentorDashboard;
