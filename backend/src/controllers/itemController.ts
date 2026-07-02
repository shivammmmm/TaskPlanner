import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const listItems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await prisma.item.findMany({
      orderBy: { created_date: 'desc' }
    });
    return res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error listing items' });
  }
};

export const createItem = async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, category, quantity, status } = req.body;

  if (!name || !category || quantity === undefined) {
    return res.status(400).json({ success: false, message: 'Name, category, and quantity are required' });
  }

  try {
    const item = await prisma.item.create({
      data: {
        name,
        description: description || null,
        category,
        quantity: parseInt(quantity),
        status: status || 'available'
      }
    });

    return res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error creating item' });
  }
};

export const updateItem = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, category, quantity, status } = req.body;

  try {
    const record = await prisma.item.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const updated = await prisma.item.update({
      where: { id },
      data: {
        name: name !== undefined ? name : record.name,
        description: description !== undefined ? description : record.description,
        category: category !== undefined ? category : record.category,
        quantity: quantity !== undefined ? parseInt(quantity) : record.quantity,
        status: status !== undefined ? status : record.status
      }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error updating item' });
  }
};

export const deleteItem = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const record = await prisma.item.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    await prisma.item.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error deleting item' });
  }
};
