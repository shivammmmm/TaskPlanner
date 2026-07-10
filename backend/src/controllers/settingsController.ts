import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

// Company Settings
export const getSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await prisma.companySettings.findMany();
    const settings = list.length > 0 ? list[0] : null;
    return res.status(200).json({ success: true, data: settings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error fetching settings' });
  }
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response) => {
  const { company_name, address, phone, email, website, logo_url, working_days, working_hours, timezone, language, work_start_time, work_end_time } = req.body;

  try {
    const list = await prisma.companySettings.findMany();
    let settings;
    if (list.length > 0) {
      settings = await prisma.companySettings.update({
        where: { id: list[0].id },
        data: {
          company_name: company_name !== undefined ? company_name : list[0].company_name,
          address: address !== undefined ? address : list[0].address,
          phone: phone !== undefined ? phone : list[0].phone,
          email: email !== undefined ? email : list[0].email,
          website: website !== undefined ? website : list[0].website,
          logo_url: logo_url !== undefined ? logo_url : list[0].logo_url,
          working_days: working_days !== undefined ? parseInt(working_days) : list[0].working_days,
          working_hours: working_hours !== undefined ? parseFloat(working_hours) : list[0].working_hours,
          timezone: timezone !== undefined ? timezone : list[0].timezone,
          language: language !== undefined ? language : list[0].language,
          work_start_time: work_start_time !== undefined ? work_start_time : list[0].work_start_time,
          work_end_time: work_end_time !== undefined ? work_end_time : list[0].work_end_time
        }
      });
    } else {
      settings = await prisma.companySettings.create({
        data: {
          company_name: company_name || 'Apex Solutions',
          address: address || null,
          phone: phone || null,
          email: email || null,
          website: website || null,
          logo_url: logo_url || null,
          working_days: working_days !== undefined ? parseInt(working_days) : 5,
          working_hours: working_hours !== undefined ? parseFloat(working_hours) : 8,
          timezone: timezone || 'UTC', language: language || 'en',
          work_start_time: work_start_time || '09:00', work_end_time: work_end_time || '18:00'
        }
      });
    }

    return res.status(200).json({ success: true, data: settings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating settings' });
  }
};

// Holidays
export const listHolidays = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: { date: 'asc' }
    });
    return res.status(200).json({ success: true, data: holidays });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error listing holidays' });
  }
};

export const createHoliday = async (req: AuthenticatedRequest, res: Response) => {
  const { name, date, type } = req.body;

  if (!name || !date || !type) {
    return res.status(400).json({ success: false, message: 'Name, date, and type are required' });
  }

  try {
    const holiday = await prisma.holiday.create({
      data: { name, date, type }
    });
    return res.status(201).json({ success: true, data: holiday });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error creating holiday' });
  }
};

export const updateHoliday = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, date, type } = req.body;

  try {
    const record = await prisma.holiday.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    const updated = await prisma.holiday.update({
      where: { id },
      data: {
        name: name !== undefined ? name : record.name,
        date: date !== undefined ? date : record.date,
        type: type !== undefined ? type : record.type
      }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating holiday' });
  }
};

export const deleteHoliday = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const record = await prisma.holiday.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }
    await prisma.holiday.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Holiday deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error deleting holiday' });
  }
};
