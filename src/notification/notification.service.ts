import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationDto } from './notification.dto';
import { Notification_type } from './notification.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationDocument, Notification } from './notification.document';

@Injectable()
export class NotificationService {
  constructor(
    private readonly mailService: MailerService,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async sendEmail(email: NotificationDto) {
    let title = '';
    let message = '';
    switch (email.type) {
      case Notification_type.event_cancelled:
        title = 'Un evento ha sido cancelado';
        message = `El evento "${email.route}" ha sido cancelado`;
        break;
      case Notification_type.event_finished:
        title = 'Un evento ha sido terminado';
        message = `El evento "${email.route}" ha sido terminado`;
        break;
      case Notification_type.task_assigned:
        title = 'Se ha asignado una tarea';
        message = `Se le ha asignado la tarea "${email.route}"`;
        break;
      case Notification_type.task_unassigned:
        title = 'Se ha asignado una tarea';
        message = `Ha sido sacado de la tarea "${email.route}"`;
        break;
      case Notification_type.task_finished:
        title = 'Se ha finalizado una tarea asignada a ti';
        message = `La tarea "${email.route}" fue declarada por su organizador como terminadas`;
        break;
      case Notification_type.quote_sent:
        title = 'Has mandando una cotización';
        message = `Has mandado la cotización ${email.route}`;
        break;
      case Notification_type.quote_received:
        title = 'Has recibido una cotización';
        message = `Has recibido una cotización del ${email.route}`;
        break;
      case Notification_type.quote_accepted:
        title = 'Una de tus cotizaciones ha sido aceptada';
        message = `Tú cotización ${email.route} ha sido aceptada`;
        break;
      default:
        break;
    }

    // await this.mailService.sendMail({
    //   to: email.emails.join(', '),
    //   subject: title,
    //   text: message,
    // });

    await Promise.all(
      email.emails.map((emailString) =>
        this.mailService.sendMail({
          to: emailString,
          subject: title,
          text: message,
        }),
      ),
    );

    // await Promise.all(
    //   email.emails.map(async (info) => {
    //     const notification = new this.notificationModel({
    //       id: (await this.findEmailCount()) + 1,
    //       toUserEmail: info,
    //       date: new Date(),
    //       name: title,
    //       description: message,
    //       status: 'unseen',
    //       url: email.url,
    //     });
    //     await notification.save();
    //   }),
    // );

    const id = await this.findEmailCount();
    const notifications = email.emails.map((info, i) => ({
      id: id + i + 1,
      toUserEmail: info,
      date: new Date(),
      name: title,
      description: message,
      status: 'unseen',
      url: email.url,
    }));

    await this.notificationModel.insertMany(notifications);

    // for (let i = 0; i < email.emails.length; i++) {
    //   const info = email.emails[i];
    //   const notification = new this.notificationModel({
    //     id: (await this.findEmailCount()) + 1,
    //     toUserEmail: info,
    //     date: new Date(),
    //     name: title,
    //     description: message,
    //     status: 'unseen',
    //     url: email.url,
    //   });

    //   await notification.save();
    // }

    return 'se mandó';
  }

  async findEmailCount() {
    return await this.notificationModel.countDocuments();
  }

  async markAsSeenNotification(notificationId: number) {
    try {
      const notification = await this.notificationModel.findOneAndUpdate(
        { id: notificationId },
        { $set: { status: 'seen' } },
        { new: true },
      );
      return notification;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        `No se pudo modificar la notificación con la ${notificationId}`,
      );
    }
  }

  async getEarlyNotifications(email: string) {
    try {
      const notifications = await this.notificationModel
        .find({ toUserEmail: email, status: 'unseen' })
        .sort({ date: -1 })
        .limit(15)
        .exec();
      return notifications;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        `No se pudo conseguir las notificación del usuario con email ${email}`,
      );
    }
  }
}
