import pool from './index';

export async function getOrCreateUser(firebase_uid: string, email: string, name?: string, avatar_url?: string) {
  const existing = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [firebase_uid]);
  if (existing.rows.length > 0) return existing.rows[0];
  const result = await pool.query(
    'INSERT INTO users (firebase_uid, email, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
    [firebase_uid, email, name || null, avatar_url || null]
  );
  return result.rows[0];
}

export async function createChat(user_id: number) {
  const result = await pool.query(
    'INSERT INTO chats (user_id) VALUES ($1) RETURNING *',
    [user_id]
  );
  return result.rows[0];
}

export async function addMessage(chat_id: number, role: 'user' | 'assistant', content: string) {
  const result = await pool.query(
    'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3) RETURNING *',
    [chat_id, role, content]
  );
  return result.rows[0];
}

export async function getLatestSummary(chat_id: number): Promise<string | null> {
  const result = await pool.query(
    'SELECT summary FROM summaries WHERE chat_id = $1 ORDER BY created_at DESC LIMIT 1',
    [chat_id]
  );
  return result.rows[0]?.summary || null;
}

export async function getLastNMessages(chat_id: number, n: number) {
  const result = await pool.query(
    'SELECT role, content FROM messages WHERE chat_id = $1 ORDER BY created_at DESC LIMIT $2',
    [chat_id, n]
  );
  // Reverse to chronological order
  return result.rows.reverse();
}

export async function addOrUpdateSummary(chat_id: number, summary: string) {
  // Insert new summary (could also update latest, but for audit trail we insert)
  const result = await pool.query(
    'INSERT INTO summaries (chat_id, summary) VALUES ($1, $2) RETURNING *',
    [chat_id, summary]
  );
  return result.rows[0];
}

export async function buildPrompt(chat_id: number, user_message: string, n = 10) {
  const summary = await getLatestSummary(chat_id);
  const messages = await getLastNMessages(chat_id, n);
  const prompt: {role: string, content: string}[] = [];
  if (summary) {
    prompt.push({ role: 'system', content: `Summary so far: ${summary}` });
  }
  prompt.push(...messages);
  prompt.push({ role: 'user', content: user_message });
  return prompt;
}

export async function getChatsForUser(user_id: number) {
  const result = await pool.query(
    'SELECT id, created_at, updated_at FROM chats WHERE user_id = $1 ORDER BY updated_at DESC',
    [user_id]
  );
  return result.rows;
}

export async function getMessagesForChat(chat_id: number, limit: number, offset: number) {
  const result = await pool.query(
    'SELECT id, role, content, created_at FROM messages WHERE chat_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3',
    [chat_id, limit, offset]
  );
  return result.rows;
}

export async function getAdminStats() {
  // Get total registered users
  const totalUsersResult = await pool.query('SELECT COUNT(*) as total FROM users');
  const totalUsers = parseInt(totalUsersResult.rows[0].total);

  // Get active users in last 7 days (users who have chats in last 7 days)
  const activeUsersResult = await pool.query(`
    SELECT COUNT(DISTINCT u.id) as active 
    FROM users u 
    JOIN chats c ON u.id = c.user_id 
    WHERE c.updated_at >= NOW() - INTERVAL '7 days'
  `);
  const activeUsers = parseInt(activeUsersResult.rows[0].active);

  return { totalUsers, activeUsers };
}

export async function getUsersWithSearch(search: string = '', limit: number = 10, offset: number = 0) {
  let query = `
    SELECT u.id, u.firebase_uid, u.email, u.name, u.avatar_url, u.created_at,
           COUNT(c.id) as chat_count,
           MAX(c.updated_at) as last_activity
    FROM users u
    LEFT JOIN chats c ON u.id = c.user_id
  `;
  
  const params: any[] = [];
  if (search.trim()) {
    query += ` WHERE u.email ILIKE $1 OR u.name ILIKE $1`;
    params.push(`%${search}%`);
  }
  
  query += `
    GROUP BY u.id, u.firebase_uid, u.email, u.name, u.avatar_url, u.created_at
    ORDER BY u.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  
  params.push(limit, offset);
  
  const result = await pool.query(query, params);
  return result.rows;
}

export async function getTotalUsersCount(search: string = '') {
  let query = 'SELECT COUNT(*) as total FROM users';
  const params: any[] = [];
  
  if (search.trim()) {
    query += ' WHERE email ILIKE $1 OR name ILIKE $1';
    params.push(`%${search}%`);
  }
  
  const result = await pool.query(query, params);
  return parseInt(result.rows[0].total);
}

export async function getUserFinancialInfo(user_id: number) {
  const result = await pool.query(
    'SELECT * FROM user_financial_info WHERE user_id = $1',
    [user_id]
  );
  return result.rows[0] || null;
}

export async function createOrUpdateUserFinancialInfo(
  user_id: number,
  data: {
    gender?: string;
    birthdate?: string;
    estimated_salary?: number;
    country?: string;
    domicile?: string;
    active_loan?: number;
    bi_checking_status?: string;
  }
) {
  const existing = await getUserFinancialInfo(user_id);
  
  if (existing) {
    // Update existing record
    const result = await pool.query(
      `UPDATE user_financial_info 
       SET gender = COALESCE($2, gender),
           birthdate = COALESCE($3, birthdate),
           estimated_salary = COALESCE($4, estimated_salary),
           country = COALESCE($5, country),
           domicile = COALESCE($6, domicile),
           active_loan = COALESCE($7, active_loan),
           bi_checking_status = COALESCE($8, bi_checking_status),
           updated_at = NOW()
       WHERE user_id = $1 
       RETURNING *`,
      [user_id, data.gender, data.birthdate, data.estimated_salary, data.country, data.domicile, data.active_loan, data.bi_checking_status]
    );
    return result.rows[0];
  } else {
    // Create new record
    const result = await pool.query(
      `INSERT INTO user_financial_info 
       (user_id, gender, birthdate, estimated_salary, country, domicile, active_loan, bi_checking_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user_id, data.gender, data.birthdate, data.estimated_salary, data.country, data.domicile, data.active_loan, data.bi_checking_status]
    );
    return result.rows[0];
  }
}

export async function getUserWithFinancialInfo(user_id: number) {
  const result = await pool.query(
    `SELECT 
       u.id, u.firebase_uid, u.email, u.name, u.avatar_url, u.created_at as user_created_at,
       ufi.id as financial_info_id, ufi.user_id, ufi.gender, ufi.birthdate, ufi.estimated_salary, 
       ufi.country, ufi.domicile, ufi.active_loan, ufi.bi_checking_status, 
       ufi.created_at as financial_info_created_at, ufi.updated_at as financial_info_updated_at
     FROM users u
     LEFT JOIN user_financial_info ufi ON u.id = ufi.user_id
     WHERE u.id = $1`,
    [user_id]
  );
  return result.rows[0] || null;
}

export async function getAllMessagesForUser(user_id: number, limit: number = 50) {
  const result = await pool.query(
    `SELECT m.id, m.role, m.content, m.created_at
     FROM messages m
     JOIN chats c ON m.chat_id = c.id
     WHERE c.user_id = $1
     ORDER BY m.created_at DESC
     LIMIT $2`,
    [user_id, limit]
  );
  // Return in chronological order (oldest first)
  return result.rows.reverse();
} 