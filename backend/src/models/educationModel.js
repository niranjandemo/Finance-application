import pool from "../config/db.js";

/**
 * Education Model
 *
 * Provides database queries for the financial education library.
 * Uses parameterized queries and reuses the central pool connection.
 */
export const getAllEducationContent = async () => {
  const result = await pool.query(
    `SELECT
      id,
      title,
      category,
      summary,
      content,
      difficulty,
      created_at,
      updated_at
     FROM education_content
     ORDER BY id ASC`
  );

  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    summary: row.summary,
    content: row.content,
    difficulty: row.difficulty,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};
