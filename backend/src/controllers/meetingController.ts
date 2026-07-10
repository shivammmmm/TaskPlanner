import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const listMeetings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await prisma.meeting.findMany({
      orderBy: { date: 'desc' }
    });
    return res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error listing meetings' });
  }
};

export const createMeeting = async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, date, time, duration, link, attendees, agenda, start_time, end_time, status, reminder, location, organizer_id, organizer_name } = req.body;

  if (!title || !date) {
    return res.status(400).json({ success: false, message: 'Title and date are required' });
  }

  try {
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description || null,
        date,
        time: time || start_time || null,
        duration: duration !== undefined ? parseInt(duration) : null,
        link: link || null,
        attendees: attendees || [], agenda: agenda || null, start_time: start_time || time || null,
        end_time: end_time || null, status: status || 'scheduled', reminder: reminder || null,
        location: location || null, organizer_id: organizer_id || null, organizer_name: organizer_name || null
      }
    });

    return res.status(201).json({ success: true, data: meeting });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error creating meeting' });
  }
};

export const updateMeeting = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, date, time, duration, link, attendees, agenda, start_time, end_time, status, reminder, location, organizer_id, organizer_name } = req.body;

  try {
    const record = await prisma.meeting.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    const updated = await prisma.meeting.update({
      where: { id },
      data: {
        title: title !== undefined ? title : record.title,
        description: description !== undefined ? description : record.description,
        date: date !== undefined ? date : record.date,
        time: time !== undefined ? time : record.time,
        duration: duration !== undefined ? parseInt(duration) : record.duration,
        link: link !== undefined ? link : record.link,
        attendees: attendees !== undefined ? attendees : record.attendees,
        agenda: agenda !== undefined ? agenda : record.agenda,
        start_time: start_time !== undefined ? start_time : record.start_time,
        end_time: end_time !== undefined ? end_time : record.end_time,
        status: status !== undefined ? status : record.status,
        reminder: reminder !== undefined ? reminder : record.reminder,
        location: location !== undefined ? location : record.location,
        organizer_id: organizer_id !== undefined ? organizer_id : record.organizer_id,
        organizer_name: organizer_name !== undefined ? organizer_name : record.organizer_name
      }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating meeting' });
  }
};

export const deleteMeeting = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const record = await prisma.meeting.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    await prisma.meeting.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Meeting deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error deleting meeting' });
  }
};
