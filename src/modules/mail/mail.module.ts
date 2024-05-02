import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { env } from '@env';

@Global() // global module
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: env.email.host,
          secure: false,
          auth: {
            user: env.email.authUser,
            pass: env.email.authPassword,
          },
        },
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
