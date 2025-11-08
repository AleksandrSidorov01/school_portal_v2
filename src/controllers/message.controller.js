import prisma from '../config/database.js';
import { logActivity } from '../utils/activityLog.js';

// Получить все сообщения
export const getAllMessages = async (req, res, next) => {
  try {
    const { senderId, receiverId, read } = req.query;
    const userId = req.user.id;

    const where = {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    };

    if (senderId) where.senderId = senderId;
    if (receiverId) where.receiverId = receiverId;
    if (read !== undefined) where.read = read === 'true';

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

// Получить сообщение по ID
export const getMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!message) {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }

    // Проверка доступа
    if (message.senderId !== userId && message.receiverId !== userId) {
      return res.status(403).json({ message: 'Нет доступа к этому сообщению' });
    }

    // Отмечаем как прочитанное, если получатель открыл сообщение
    if (message.receiverId === userId && !message.read) {
      await prisma.message.update({
        where: { id },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
      message.read = true;
      message.readAt = new Date();
    }

    res.json({ message });
  } catch (error) {
    next(error);
  }
};

// Получить диалог между двумя пользователями
export const getConversation = async (req, res, next) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: currentUserId,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Отмечаем все непрочитанные сообщения как прочитанные
    const unreadMessages = messages.filter(
      m => m.receiverId === currentUserId && !m.read
    );

    if (unreadMessages.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: {
            in: unreadMessages.map(m => m.id),
          },
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
    }

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

// Создать сообщение
export const createMessage = async (req, res, next) => {
  try {
    const { receiverId, subject, content } = req.validatedData;
    const senderId = req.user.id;

    // Проверка существования получателя
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return res.status(404).json({ message: 'Получатель не найден' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Нельзя отправить сообщение самому себе' });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        subject,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    await logActivity(senderId, 'create', 'message', message.id, {
      receiver: `${receiver.firstName} ${receiver.lastName}`,
    });

    res.status(201).json({
      message: 'Сообщение успешно отправлено',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// Обновить сообщение
export const updateMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subject, content } = req.validatedData;
    const userId = req.user.id;

    // Проверка существования сообщения и прав доступа
    const existingMessage = await prisma.message.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }

    if (existingMessage.senderId !== userId) {
      return res.status(403).json({ message: 'Можно редактировать только свои сообщения' });
    }

    const message = await prisma.message.update({
      where: { id },
      data: {
        subject,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    await logActivity(userId, 'update', 'message', message.id);

    res.json({
      message: 'Сообщение успешно обновлено',
      data: message,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }
    next(error);
  }
};

// Удалить сообщение
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Проверка существования сообщения и прав доступа
    const existingMessage = await prisma.message.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }

    // Можно удалять только свои сообщения
    if (existingMessage.senderId !== userId) {
      return res.status(403).json({ message: 'Можно удалять только свои сообщения' });
    }

    await prisma.message.delete({
      where: { id },
    });

    await logActivity(userId, 'delete', 'message', id);

    res.json({ message: 'Сообщение успешно удалено' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }
    next(error);
  }
};

// Отметить сообщение как прочитанное
export const markMessageAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }

    if (message.receiverId !== userId) {
      return res.status(403).json({ message: 'Можно отмечать только полученные сообщения' });
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    res.json({
      message: 'Сообщение отмечено как прочитанное',
      data: updatedMessage,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }
    next(error);
  }
};

// Получить список диалогов (последние сообщения с каждым пользователем)
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Получаем все сообщения пользователя
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Группируем по собеседникам
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      const conversation = conversationsMap.get(otherUserId);
      if (msg.receiverId === userId && !msg.read) {
        conversation.unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json({ conversations });
  } catch (error) {
    next(error);
  }
};

// Получить количество непрочитанных сообщений
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
};

