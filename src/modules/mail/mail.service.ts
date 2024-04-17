import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  sendInvitationEmail(email: string, data: any) {
    // Construct email HTML with placeholders
    const htmlContent = `
      <p>Hello,</p>
      <p>You have been invited to participate in the following assessments:</p>
      <p>Please follow this link to proceed: <a href="${data.assessment}">${data.assessment}</a></p>
      <p>You need to change your password and login to our system to do assessment</p>
      <p>Follow the instructions:</p>
      <ul>
        <li>Update Password: <a href="${data.update_password}">${data.update_password}</a></li>
        <li>Login: <a href="${data.login}">${data.login}</a></li>
      </ul>
      <p>Best regards,</p>
      <p>Pytalent</p>
    `;

    // Send email
    this.mailerService.sendMail({
      to: email,
      subject: 'Pytalent | Invitation to participate assessment',
      html: htmlContent,
    });
  }
}
