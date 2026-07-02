import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { taskService } from '@/services/task.service';
import { meetingService } from '@/services/meeting.service';
import { settingsService } from '@/services/settings.service';
import { ChevronLeft, ChevronRight, CheckSquare, Video, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, isToday, isSameDay } from 'date-fns';

export default function CalendarPage() {
  const { employee } = useOutletContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [t, m, h] = await Promise.all([
        taskService.getTasks('-due_date', 200),
        meetingService.getMeetings('-date', 100),
        settingsService.getHolidays('-date', 50),
      ]);
      setTasks(t); setMeetings(m); setHolidays(h);
      setLoading(false);
    };
    load();
  }, []);

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });
  const startDay = start.getDay();
  const paddingDays = Array.from({ length: startDay }, (_, i) => i);

  const getEventsForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.due_date === dateStr);
    const dayMeetings = meetings.filter(m => m.date === dateStr);
    const dayHolidays = holidays.filter(h => h.date === dateStr);
    return { tasks: dayTasks, meetings: dayMeetings, holidays: dayHolidays };
  };

  return (
    <div>
      <PageHeader title="Calendar" description="View tasks, meetings, and holidays" />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Month Nav */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold text-slate-900">{format(currentMonth, 'MMMM yyyy')}</h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 bg-slate-50 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-500 py-3">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {paddingDays.map(i => <div key={`pad-${i}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/50" />)}
          {days.map(day => {
            const events = getEventsForDay(day);
            const hasEvents = events.tasks.length + events.meetings.length + events.holidays.length > 0;
            return (
              <div key={day.toISOString()} className={`min-h-[100px] border-b border-r border-slate-100 p-2 ${isToday(day) ? 'bg-blue-50/50' : ''}`}>
                <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center' : 'text-slate-700'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {events.holidays.map((h, i) => (
                    <div key={`h-${i}`} className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded truncate">{h.name}</div>
                  ))}
                  {events.tasks.slice(0, 2).map((t, i) => (
                    <div key={`t-${i}`} className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded truncate flex items-center gap-1">
                      <CheckSquare className="w-2.5 h-2.5 shrink-0" />{t.title}
                    </div>
                  ))}
                  {events.meetings.slice(0, 2).map((m, i) => (
                    <div key={`m-${i}`} className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded truncate flex items-center gap-1">
                      <Video className="w-2.5 h-2.5 shrink-0" />{m.title}
                    </div>
                  ))}
                  {(events.tasks.length + events.meetings.length > 4) && (
                    <div className="text-[10px] text-slate-400">+{events.tasks.length + events.meetings.length - 4} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}