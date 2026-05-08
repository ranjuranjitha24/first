import { useState } from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function CalendarView({ interviews, onInterviewClick }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const getInterviewsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return interviews.filter(i => i.date === dateStr);
  };

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="calendar-view">
      <div className="calendar-toolbar">
        <div className="calendar-nav">
          <button className="nav-btn" onClick={prevMonth}>‹</button>
          <h2>{MONTHS[month]} {year}</h2>
          <button className="nav-btn" onClick={nextMonth}>›</button>
        </div>
        <button className="today-btn" onClick={() => setViewDate(new Date())}>Today</button>
      </div>

      <div className="calendar-grid-header">
        {DAYS.map(d => <div key={d} className="grid-header-day">{d}</div>)}
      </div>

      <div className="calendar-grid">
        {calendarDays.map((day, idx) => {
          const dayInterviews = day ? getInterviewsForDay(day) : [];
          const isToday = day && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
          
          return (
            <div key={idx} className={`calendar-day ${day ? '' : 'empty'} ${isToday ? 'today' : ''}`}>
              {day && <span className="day-number">{day}</span>}
              <div className="day-events">
                {dayInterviews.map(i => (
                  <div 
                    key={i._id} 
                    className={`event-tag ${i.status.toLowerCase()}`}
                    onClick={() => onInterviewClick(i)}
                  >
                    <span className="event-time">{i.time}</span>
                    <span className="event-name">{i.employee?.name?.split(' ')[0] || 'Cand.'}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
