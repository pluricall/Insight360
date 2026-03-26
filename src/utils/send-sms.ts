import axios from 'axios';
import FormData from 'form-data';

export interface SmsParams {
  account: string;
  licensekey: string;
  phoneNumber: string;
  messageText: string;
  alfaSender: string;
}

export async function sendSMS(params: SmsParams) {
  const form = new FormData();
  form.append('account', params.account);
  form.append('licensekey', params.licensekey);
  form.append('phoneNumber', params.phoneNumber);
  form.append('messageText', params.messageText);
  form.append('alfaSender', params.alfaSender);

  const response = await axios.post(
    'https://api.ez4uteam.com/ez4usms/API/sendSMS.php',
    form,
    {
      headers: form.getHeaders(),
      maxRedirects: 20,
    }
  );

  return response.data;
}
