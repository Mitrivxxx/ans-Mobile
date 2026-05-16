import { client } from '../../client';

export async function getPlanPage(): Promise<string> {
  const res = await client.get(
    '/Plany/PlanyStudentow'
  );

  return res.data;
}