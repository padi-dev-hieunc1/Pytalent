import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  sendInvitationEmail(email: string) {
    // Construct email HTML with placeholders
    const htmlContent = `
      <p>Hello,</p>
      <p>You have been invited to participate in the following assessments:</p>
      <ul>
        <li>Assessment: <a href="#">Link assessment here</a></li>
      </ul>
      <p>Before doing assessment, you need to change your password to login our system</p>
      <p>Follow the instructions:</p>
      <ul>
        <li>Update Password: <a href="#">Link update password here</a></li>
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
