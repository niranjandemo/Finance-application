import pool from "./db.js";
import { seedBrokerProducts } from "../scripts/seedBrokerProducts.js";

export const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS risk_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        loss_reaction VARCHAR(50) NOT NULL,
        volatility VARCHAR(50) NOT NULL,
        return_preference VARCHAR(50) NOT NULL,
        emergency_fund VARCHAR(50) NOT NULL,
        investment_behavior VARCHAR(50) NOT NULL,
        risk_score INTEGER NOT NULL,
        risk_category VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database initialized: risk_assessments table verified.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS investments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(50) NOT NULL,
        risk_level VARCHAR(50) NOT NULL,
        target_horizon VARCHAR(50) DEFAULT 'medium',
        expected_return VARCHAR(100),
        minimum_investment NUMERIC(12, 2) DEFAULT 500.00,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if investments table is empty; if so, seed initial catalog
    const countRes = await pool.query("SELECT COUNT(*) FROM investments");
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO investments (name, category, risk_level, target_horizon, expected_return, minimum_investment, description)
        VALUES
          ('Large Cap Equity', 'Equity', 'Moderate', 'medium', '10–12% p.a. (Historical)', 500.00, 'Established companies with relatively lower volatility.'),
          ('Diversified Equity', 'Equity', 'Moderate', 'medium', '12–14% p.a. (Historical)', 1000.00, 'Diversified exposure across multiple sectors.'),
          ('Government Bonds', 'Fixed Income', 'Low', 'short', '7–8% p.a. (Fixed)', 1000.00, 'Lower-risk fixed-income investment category.'),
          ('Equity Mutual Funds', 'Mutual Funds', 'Moderate-High', 'long', '12–15% p.a. (Historical)', 500.00, 'Professionally managed diversified equity exposure.'),
          ('Index Funds', 'Index Funds', 'Moderate', 'long', '11–13% p.a. (Historical)', 500.00, 'Low-cost funds tracking broad market indices like NIFTY 50.'),
          ('Gold & Precious Metals', 'Commodities', 'Low-Moderate', 'medium', '8–10% p.a. (Historical)', 500.00, 'Hedge against inflation and economic uncertainty.')
        ON CONFLICT (name) DO NOTHING;
      `);
      console.log("Database initialized: investments catalog seeded.");
    } else {
      console.log("Database initialized: investments table verified.");
    }

    // Initialize brokers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS brokers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        description TEXT,
        platform_type VARCHAR(100),
        supported_investments TEXT,
        minimum_investment NUMERIC(12, 2) DEFAULT 0.00,
        website TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const brokerCountRes = await pool.query("SELECT COUNT(*) FROM brokers");
    if (parseInt(brokerCountRes.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO brokers (name, description, platform_type, supported_investments, minimum_investment, website)
        VALUES
          ('Zerodha', 'Technology-driven discount brokerage platform supporting equities, derivatives, and direct mutual funds.', 'Discount Broker', 'Stocks, ETFs, Mutual Funds, Bonds', 0.00, 'https://zerodha.com'),
          ('Groww', 'Digital investment platform providing access to equities, direct mutual funds, and fixed deposits.', 'Fintech Platform', 'Stocks, ETFs, Mutual Funds, US Stocks', 0.00, 'https://groww.in'),
          ('Upstox', 'Electronic discount trading platform offering equities, commodities, and investment products.', 'Discount Broker', 'Stocks, ETFs, Mutual Funds, Digital Gold', 0.00, 'https://upstox.com'),
          ('ICICI Direct', 'Full-service banking-integrated investment platform supporting diversified wealth management.', 'Full-Service Broker', 'Stocks, Mutual Funds, Bonds, NPS, IPOs', 0.00, 'https://www.icicidirect.com'),
          ('HDFC Sky', 'Digital discount and wealth investing platform backed by comprehensive institutional research.', 'Discount / Full-Service', 'Stocks, ETFs, Mutual Funds, Global Equities', 0.00, 'https://hdfcsky.com')
        ON CONFLICT (name) DO NOTHING;
      `);
      console.log("Database initialized: brokers directory seeded.");
    } else {
      console.log("Database initialized: brokers table verified.");
    }

    // Initialize and seed broker_products table
    await seedBrokerProducts();

    // Initialize education_content table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS education_content (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        summary TEXT,
        content TEXT NOT NULL,
        difficulty VARCHAR(50) DEFAULT 'Beginner',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const educationCountRes = await pool.query("SELECT COUNT(*) FROM education_content");
    if (parseInt(educationCountRes.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO education_content (title, category, summary, content, difficulty)
        VALUES
          (
            'What is Risk Tolerance?',
            'Risk Management',
            'Learn how your ability and willingness to handle investment losses affect investment suitability.',
            'Risk tolerance represents both your psychological willingness and your financial capacity to withstand investment drawdowns. It is determined by factors such as your investment horizon, current liquidity reserves, income stability, and emotional reaction to market swings. Understanding your risk tolerance helps you select asset allocations that minimize panic selling during downturns and stay committed to long-term compounding.',
            'Beginner'
          ),
          (
            'Stocks vs ETFs',
            'Equities',
            'Understand the differences between individual stocks and exchange-traded funds.',
            'An individual stock represents fractional ownership in a single specific corporation, carrying company-specific risks alongside general market risks. An Exchange-Traded Fund (ETF), in contrast, pools capital from numerous investors to track an entire index or basket of securities. ETFs offer built-in diversification, lower single-stock exposure, and can be traded on exchanges throughout market hours.',
            'Beginner'
          ),
          (
            'Understanding Brokerage Fees',
            'Costs & Fees',
            'Learn about brokerage charges, account maintenance fees and other costs.',
            'When executing trades, investors encounter transaction expenses including brokerage commissions, annual account maintenance charges (AMC), depository participant (DP) fees, and statutory regulatory levies (STT, exchange turnover fees, GST, stamp duty). Even small fee differences compound over multi-year holding periods, making cost transparency an important element of platform selection.',
            'Beginner'
          ),
          (
            'Investment Diversification',
            'Portfolio Strategy',
            'Understand why diversification can be important when constructing an investment portfolio.',
            'Diversification is the risk-management technique of allocating investments across diverse financial instruments, industries, and asset categories. By holding uncorrelated assets—such as combining equities, fixed income securities, and commodities—negative performance in one asset class can be offset by positive or stable performance in others, reducing overall portfolio volatility.',
            'Intermediate'
          ),
          (
            'Investment Horizon',
            'Financial Planning',
            'Learn how the length of time you plan to invest can influence suitable investment categories.',
            'Your investment horizon is the total expected time before you need to liquidate invested capital for a financial goal. Short-term horizons (under 3 years) generally favor lower-risk instruments like bonds or liquid funds to protect capital. Long-term horizons (5 to 10+ years) provide sufficient runway to withstand market volatility and benefit from equity compounding.',
            'Beginner'
          ),
          (
            'Understanding Market Volatility',
            'Market Concepts',
            'Learn what market volatility means and why prices can change over time.',
            'Market volatility refers to the frequency and magnitude of asset price fluctuations within a given timeframe. High volatility implies wide, rapid swings driven by economic announcements, earnings reports, geopolitical events, or shifts in investor sentiment. Volatility is an inherent characteristic of liquid markets rather than an indicator of permanent capital loss.',
            'Intermediate'
          ),
          (
            'Mutual Funds & SIP Basics',
            'Mutual Funds',
            'Explore how mutual funds pool investor capital and how Systematic Investment Plans build discipline.',
            'A mutual fund pools money from multiple investors to invest in a diversified portfolio of equities, debt securities, or money market instruments managed by professional asset management firms. A Systematic Investment Plan (SIP) allows investors to contribute a predetermined amount at recurring intervals, taking advantage of rupee cost averaging without having to time market movements.',
            'Beginner'
          ),
          (
            'Building an Investment Plan',
            'Financial Planning',
            'Learn how setting financial goals and establishing an emergency fund form the foundation of sound investing.',
            'A sound investment plan begins with building an emergency reserve equal to 3 to 6 months of living expenses held in safe, liquid instruments. Once emergency liquidity is secured, clearly articulate your short-, medium-, and long-term financial goals, select asset allocations that match your risk tolerance, and periodically rebalance your portfolio to maintain your desired risk profile.',
            'Intermediate'
          )
        ON CONFLICT (title) DO NOTHING;
      `);
      console.log("Database initialized: education content seeded.");
    } else {
      console.log("Database initialized: education content table verified.");
    }
  } catch (error) {
    console.error("Database initialization error:", error);
  }
};

