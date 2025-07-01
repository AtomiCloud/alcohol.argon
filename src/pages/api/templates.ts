import type { NextApiRequest, NextApiResponse } from 'next';
import { searchTemplates } from '@/lib/template-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { q: query = '', limit = '20' } = req.query;

    if (typeof query !== 'string') {
      return res.status(400).json({ message: 'Query must be a string' });
    }

    const limitNum = Number.parseInt(limit as string, 10);
    if (Number.isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({ message: 'Limit must be between 1 and 50' });
    }

    // Simulate some processing time for realistic feel
    await new Promise(resolve => setTimeout(resolve, 100));

    const results = await searchTemplates(query, limitNum);

    res.status(200).json({
      query,
      results: results.templates,
      total: results.total,
      timestamp: results.timestamp,
    });
  } catch (error) {
    console.error('Templates API error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
