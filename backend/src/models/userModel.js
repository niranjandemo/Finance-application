import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  return result.rows[0];
};

export const createUser = async (name, email, passwordHash) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash]
  );

  return result.rows[0];
};
export const getInvestmentProfile = async (userId) => {
  const result = await pool.query(
    `SELECT
      id,
      user_id,
      age,
      income,
      savings,
      investment_amount,
      goal,
      horizon,
      experience,
      liquidity,
      created_at,
      updated_at
     FROM investment_profiles
     WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0];
};


export const saveInvestmentProfile = async (
  userId,
  age,
  income,
  savings,
  investmentAmount,
  goal,
  horizon,
  experience,
  liquidity
) => {

  const result = await pool.query(
    `INSERT INTO investment_profiles
      (
        user_id,
        age,
        income,
        savings,
        investment_amount,
        goal,
        horizon,
        experience,
        liquidity
      )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (user_id)
     DO UPDATE SET
        age = EXCLUDED.age,
        income = EXCLUDED.income,
        savings = EXCLUDED.savings,
        investment_amount = EXCLUDED.investment_amount,
        goal = EXCLUDED.goal,
        horizon = EXCLUDED.horizon,
        experience = EXCLUDED.experience,
        liquidity = EXCLUDED.liquidity,
        updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      userId,
      age,
      income,
      savings,
      investmentAmount,
      goal,
      horizon,
      experience,
      liquidity,
    ]
  );

  return result.rows[0];
};

export const getRiskAssessment = async (userId) => {
  const result = await pool.query(
    `SELECT
      id,
      user_id,
      loss_reaction,
      volatility,
      return_preference,
      emergency_fund,
      investment_behavior,
      risk_score,
      risk_category,
      created_at,
      updated_at
     FROM risk_assessments
     WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0];
};

export const saveRiskAssessment = async (
  userId,
  lossReaction,
  volatility,
  returnPreference,
  emergencyFund,
  investmentBehavior,
  riskScore,
  riskCategory
) => {
  const result = await pool.query(
    `INSERT INTO risk_assessments
      (
        user_id,
        loss_reaction,
        volatility,
        return_preference,
        emergency_fund,
        investment_behavior,
        risk_score,
        risk_category
      )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id)
     DO UPDATE SET
        loss_reaction = EXCLUDED.loss_reaction,
        volatility = EXCLUDED.volatility,
        return_preference = EXCLUDED.return_preference,
        emergency_fund = EXCLUDED.emergency_fund,
        investment_behavior = EXCLUDED.investment_behavior,
        risk_score = EXCLUDED.risk_score,
        risk_category = EXCLUDED.risk_category,
        updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      userId,
      lossReaction,
      volatility,
      returnPreference,
      emergencyFund,
      investmentBehavior,
      riskScore,
      riskCategory,
    ]
  );

  return result.rows[0];
};

export const findUserById = async (userId) => {
  const result = await pool.query(
    "SELECT id, name, email, created_at FROM users WHERE id = $1",
    [userId]
  );

  return result.rows[0];
};

export const getUserDashboardData = async (userId) => {
  const user = await findUserById(userId);
  const profile = await getInvestmentProfile(userId);
  const riskAssessment = await getRiskAssessment(userId);

  return {
    user,
    profile,
    riskAssessment,
  };
};