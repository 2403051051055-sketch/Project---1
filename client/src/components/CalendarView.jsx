import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const CalendarView = ({ tasks, onEventClick }) => {
  // Map tasks to FullCalendar event format
  const events = tasks
    .filter((task) => task.dueDate)
    .map((task) => {
      let color = '#38bdf8'; // sky medium
      if (task.priority === 'high') color = '#ef4444';
      if (task.priority === 'low') color = '#10b981';
      if (task.status === 'completed') color = '#64748b';

      return {
        id: task._id,
        title: `${task.status === 'completed' ? '✓ ' : ''}${task.title}`,
        start: task.dueDate,
        backgroundColor: color,
        borderColor: 'transparent',
        extendedProps: { ...task },
      };
    });

  const handleEventClick = (info) => {
    if (onEventClick && info.event.extendedProps) {
      onEventClick(info.event.extendedProps);
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek',
        }}
        events={events}
        eventClick={handleEventClick}
        height="auto"
        aspectRatio={1.6}
      />
    </div>
  );
};

export default CalendarView;
