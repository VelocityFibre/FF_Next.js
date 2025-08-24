/**
 * Skills Overview Component
 * Displays top skills in the workforce as badges
 */


interface Skill {
  skill: string;
  count: number;
}

interface SkillsOverviewProps {
  topSkills: Skill[];
}

export function SkillsOverview({ topSkills }: SkillsOverviewProps) {
  if (!topSkills || topSkills.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills in Workforce</h3>
      <div className="flex flex-wrap gap-2">
        {topSkills.map((skill) => (
          <span
            key={skill.skill}
            className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
          >
            {skill.skill.replace('_', ' ')} ({skill.count})
          </span>
        ))}
      </div>
    </div>
  );
}