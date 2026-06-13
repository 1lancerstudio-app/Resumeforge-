'use client';

interface SkillMetricProps {
  name: string;
  percentage: number;
  color?: string;
  icon?: React.ReactNode;
}

export function SkillMetric({ name, percentage, color = '#E8FF00', icon }: SkillMetricProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <div className="text-lg">{icon}</div>}
          <span className="text-sm font-medium text-foreground">{name}</span>
        </div>
        <span className="text-sm font-mono text-foreground">{percentage}%</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface SkillMetricsGridProps {
  skills: SkillMetricProps[];
  title?: string;
}

export function SkillMetricsGrid({ skills, title }: SkillMetricsGridProps) {
  return (
    <div className="space-y-4">
      {title && <h3 className="font-semibold text-foreground">{title}</h3>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {skills.map((skill, i) => (
          <SkillMetric key={i} {...skill} />
        ))}
      </div>
    </div>
  );
}
