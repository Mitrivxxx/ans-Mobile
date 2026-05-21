import { client } from '../../client/client';

function responseBody(data: unknown): string {
  return typeof data === 'string' ? data : String(data ?? '');
}

export async function fetchStudentFeesPage(): Promise<string> {
  const response = await client.get('/Finanse/StudentFinanse/Oplaty');
  return responseBody(response.data);
}
