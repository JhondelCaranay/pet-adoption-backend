// import { InternalServerErrorException } from '@nestjs/common';
import * as Vonage from '@vonage/server-sdk';

// @ts-ignore
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

export const sendSmsMessage = async (phone: string, message: string) => {
  const from: string = 'Pet Adoption';

  if (phone.startsWith('0')) {
    phone = `63${phone.substring(1)}`;
  }

  const to: string = phone;
  const text: string = message;

  vonage.message.sendSms(from, to, text, {}, (err, responseData) => {
    if (err) {
      console.log(err);
      // throw new InternalServerErrorException('Something went wrong');
    } else {
      if (responseData.messages[0]['status'] === '0') {
        console.log('Message sent successfully.');
      } else {
        console.log(
          `Message failed with error: ${responseData.messages[0]['error-text']}`,
        );
        // throw new InternalServerErrorException('Something went wrong');
      }
    }
  });
};
