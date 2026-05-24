import { useEffect, useState } from 'react'
import { Card } from './Card'

function useCountUp(end, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime = null;
    let animationFrame;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) animationFrame = requestAnimationFrame(step);
    };
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return count;
}

export function StatCard({ icon, value, label, colorClass, trend, style }) {
  const animatedValue = useCountUp(value || 0);
  return (
    <Card hoverEffect className={`stat-card ${colorClass || 'primary'}`} style={style}>
      <div className="stat-card-glow"></div>
      <div className="stat-content">
        <div className="stat-icon-wrapper">
          <div className="stat-icon">{icon}</div>
        </div>
        <div className="stat-info">
          <div className="stat-label">{label}</div>
          <div className="stat-value">{animatedValue}</div>
          {trend && (
            <div className={`stat-trend ${trend.positive ? 'up' : 'down'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}% <span>vs last month</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
