import type { InterviewQuestion } from "../../../types/analysis.types";

export function QuestionTable({ questions }: { questions: InterviewQuestion[] }) {
  const sorted = [...questions].sort((a, b) => b.likelihoodScore - a.likelihoodScore);

  if (sorted.length === 0) {
    return <p className="text-sm text-slate-500">No questions predicted.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">Question</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Difficulty</th>
            <th className="px-4 py-2">Topic</th>
            <th className="px-4 py-2 text-right">Likelihood</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((question) => (
            <tr key={question.id} className="align-top">
              <td className="px-4 py-3 text-slate-800">{question.text}</td>
              <td className="px-4 py-3 text-slate-500">{question.type}</td>
              <td className="px-4 py-3 text-slate-500 capitalize">{question.difficulty}</td>
              <td className="px-4 py-3 text-slate-500">{question.topic}</td>
              <td className="px-4 py-3 text-right text-slate-700">
                {Math.round(question.likelihoodScore * 100)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
