import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function ProgressChart({ taskScores }: { taskScores: any[] }) {
  if (!taskScores || taskScores.length === 0) {
    return (
      <section className="rounded-xl bg-white shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-2 text-primary">Task Scores</h2>
        <div className="h-40 flex items-center justify-center text-muted-foreground italic">
          No task scores available for chart.
        </div>
      </section>
    );
  }

  const chartData = taskScores.map(task => ({
    name: `${task.task?.order_letter || 'Task'} ${task.task?.title || 'Unknown'}`,
    Score: task.task_score_earned,
    Total: task.task_score_total,
  }));

  return (
    <section className="rounded-xl bg-white shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-primary">Task Scores Overview</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0"/>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 12 }}/>
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: '1px solid #ccc' }}
              labelStyle={{ fontWeight: 'bold', color: '#333' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            {/* Optional: Add a bar for total possible score for comparison? 
            <Bar dataKey="Total" fill="#a5b4fc" radius={[4, 4, 0, 0]} /> 
            */}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
} 