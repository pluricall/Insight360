import axios from "axios";

export interface AuthenticationGoContactParams {
  username: string;
  password: string;
}

export async function authenticationGoContact({
  username,
  password
}: AuthenticationGoContactParams): Promise<{ token: string }> {
  try {
    const basicAuth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

    const { data } = await axios.post(
      'https://galp.gocontact.com/poll/auth/token',
      {},
      {
        headers: {
          Authorization: basicAuth,
        },
      }
    );

    return {
      token: data.token
    };
  } catch (error: any) {
    console.error("Erro ao criar relatório:", error.response?.data || error.message);
    throw error;
  }
}
