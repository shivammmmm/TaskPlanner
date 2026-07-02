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
  const { title, description, date, time, duration, link, attendees } = req.body;

  if (!title || !date || !time || !duration) {
    return res.status(400).json({ success: false, message: 'Title, date, time, and duration are required' });
  }

  try {
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description || null,
        date,
        time,
        duration: parseInt(duration),
        link: link || null,
        attendees: attendees || []
      }
    });

    return res.status(201).json({ success: true, data: meeting });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error creating meeting' });
  }
};

export const updateMeeting = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, date, time, duration, link, attendees } = req.body;

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
        attendees: attendees !== undefined ? attendees : record.attendees
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
