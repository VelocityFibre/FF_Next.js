import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_jUJCNFiG38aY@ep-mute-brook-a99vppmn-pooler.gwc.azure.neon.tech/neondb?sslmode=require';

/**
 * Global Search API Route
 * GET /api/search?q={query}&type={type}&limit={limit}
 * 
 * Uses the PostgreSQL full-text search infrastructure we created
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new Client({ connectionString });

  try {
    const { q, type = 'all', limit = 20 } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    await client.connect();

    // Use the global_search function we created
    const searchResults = await client.query(
      'SELECT * FROM global_search($1, $2)',
      [q, parseInt(limit as string) || 20]
    );

    // Get popular searches related to this query
    const popularSearches = await client.query(`
      SELECT search_term, search_count 
      FROM popular_searches 
      WHERE search_term ILIKE $1 
      ORDER BY search_count DESC 
      LIMIT 5
    `, [`%${q}%`]);

    // Get autocomplete suggestions
    const suggestions = await client.query(`
      SELECT DISTINCT suggestion_text, suggestion_type
      FROM autocomplete_suggestions
      WHERE suggestion_text ILIKE $1
      ORDER BY usage_count DESC
      LIMIT 10
    `, [`${q}%`]);

    // Record this search in history (async, don't wait)
    client.query(`
      INSERT INTO search_history (
        user_id, search_query, search_type, 
        result_count, search_duration_ms, created_at
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    `, [
      req.headers['x-user-id'] || null,
      q,
      type as string,
      searchResults.rows.length,
      50 // You could measure actual duration
    ]).catch(err => console.error('Failed to record search:', err));

    // Update popular searches count
    client.query(`
      INSERT INTO popular_searches (search_term, search_count, category, last_searched)
      VALUES ($1, 1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (search_term, category) 
      DO UPDATE SET 
        search_count = popular_searches.search_count + 1,
        last_searched = CURRENT_TIMESTAMP
    `, [q, type]).catch(err => console.error('Failed to update popular searches:', err));

    // Format response
    const response = {
      success: true,
      query: q,
      results: searchResults.rows.map(row => ({
        type: row.result_type,
        id: row.result_id,
        title: row.result_title,
        description: row.result_description || '',
        relevance: row.relevance
      })),
      suggestions: suggestions.rows.map(s => s.suggestion_text),
      popular: popularSearches.rows.map(p => p.search_term),
      total: searchResults.rows.length
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Search failed' 
    });
  } finally {
    await client.end();
  }
}