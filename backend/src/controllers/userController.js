import {
  getInvestmentProfile,
  saveInvestmentProfile,
  getRiskAssessment as getRiskAssessmentModel,
  saveRiskAssessment as saveRiskAssessmentModel,
  getUserDashboardData,
} from "../models/userModel.js";
import { getUserRecommendations } from "../models/recommendationModel.js";


export const getProfile = async (req, res) => {
  try {

    const userId = req.user.userId;

    const profile = await getInvestmentProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Investment profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });

  } catch (error) {

    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get investment profile",
    });
  }
};


export const saveProfile = async (req, res) => {
  try {

    const userId = req.user.userId;

    const {
      age,
      income,
      savings,
      investmentAmount,
      goal,
      horizon,
      experience,
      liquidity,
    } = req.body;


    if (
      !age ||
      !income ||
      !savings ||
      !investmentAmount ||
      !goal ||
      !horizon ||
      !experience ||
      !liquidity
    ) {
      return res.status(400).json({
        success: false,
        message: "All profile fields are required",
      });
    }


    const profile = await saveInvestmentProfile(
      userId,
      age,
      income,
      savings,
      investmentAmount,
      goal,
      horizon,
      experience,
      liquidity
    );


    res.status(200).json({
      success: true,
      message: "Investment profile saved successfully",
      profile,
    });

  } catch (error) {

    console.error("Save profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save investment profile",
    });
  }
};


export const getRiskAssessment = async (req, res) => {
  try {
    const userId = req.user.userId;

    const assessment = await getRiskAssessmentModel(userId);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Risk assessment not found",
      });
    }

    res.status(200).json({
      success: true,
      assessment,
    });
  } catch (error) {
    console.error("Get risk assessment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get risk assessment",
    });
  }
};


export const saveRiskAssessment = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      lossReaction,
      volatility,
      returnPreference,
      emergencyFund,
      investmentBehavior,
      riskScore,
      riskCategory,
      answers,
    } = req.body;

    const lr = lossReaction ?? answers?.lossReaction;
    const vol = volatility ?? answers?.volatility;
    const rp = returnPreference ?? answers?.returnPreference;
    const ef = emergencyFund ?? answers?.emergencyFund;
    const ib = investmentBehavior ?? answers?.investmentBehavior;

    if (!lr || !vol || !rp || !ef || !ib) {
      return res.status(400).json({
        success: false,
        message: "All risk assessment questionnaire answers are required",
      });
    }

    // Calculate score & category if not provided or validate existing logic
    const answerValues = [Number(lr), Number(vol), Number(rp), Number(ef), Number(ib)];
    const totalScore = answerValues.reduce((sum, val) => sum + val, 0);
    const calculatedScore = Math.round((totalScore / 20) * 100);
    const calculatedCategory =
      calculatedScore <= 40
        ? "Conservative"
        : calculatedScore <= 70
        ? "Moderate"
        : "Aggressive";

    const finalScore =
      riskScore !== undefined && riskScore !== null
        ? Number(riskScore)
        : calculatedScore;
    const finalCategory = riskCategory || calculatedCategory;

    const assessment = await saveRiskAssessmentModel(
      userId,
      String(lr),
      String(vol),
      String(rp),
      String(ef),
      String(ib),
      finalScore,
      finalCategory
    );

    res.status(200).json({
      success: true,
      message: "Risk assessment saved successfully",
      assessment,
    });
  } catch (error) {
    console.error("Save risk assessment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save risk assessment",
    });
  }
};


export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const data = await getUserDashboardData(userId);

    if (!data.user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate profile completion percentage based on real DB data
    let completionScore = 20; // Base: Account exists

    if (data.profile) {
      const profileFields = [
        data.profile.age,
        data.profile.income,
        data.profile.savings,
        data.profile.investment_amount,
        data.profile.goal,
        data.profile.horizon,
        data.profile.experience,
        data.profile.liquidity,
      ];
      const filledFields = profileFields.filter(
        (f) => f !== null && f !== undefined && f !== ""
      ).length;
      completionScore += Math.round((filledFields / 8) * 50);
    }

    if (data.riskAssessment && data.riskAssessment.risk_score !== undefined) {
      completionScore += 30;
    }

    // Obtain overall hybrid suitability from existing recommendation engine
    let aiSuitability = null;
    let aiSuitabilityLabel = "Pending evaluation";

    try {
      const recData = await getUserRecommendations(userId);
      if (
        recData &&
        recData.isPersonalized &&
        recData.overallSuitability !== null &&
        recData.overallSuitability !== undefined
      ) {
        aiSuitability = recData.overallSuitability;
        aiSuitabilityLabel = "Overall Hybrid Score";
      }
    } catch (recErr) {
      console.warn("Could not load recommendations for dashboard suitability:", recErr.message);
    }

    res.status(200).json({
      success: true,
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
      },
      profile: data.profile
        ? {
            age: data.profile.age,
            income: data.profile.income,
            savings: data.profile.savings,
            investmentAmount: data.profile.investment_amount,
            goal: data.profile.goal,
            horizon: data.profile.horizon,
            investmentHorizon: data.profile.horizon,
            experience: data.profile.experience,
            liquidity: data.profile.liquidity,
            updatedAt: data.profile.updated_at,
          }
        : null,
      riskAssessment: data.riskAssessment
        ? {
            score: data.riskAssessment.risk_score,
            category: data.riskAssessment.risk_category,
            riskScore: data.riskAssessment.risk_score,
            riskCategory: data.riskAssessment.risk_category,
            lossReaction: data.riskAssessment.loss_reaction,
            volatility: data.riskAssessment.volatility,
            returnPreference: data.riskAssessment.return_preference,
            emergencyFund: data.riskAssessment.emergency_fund,
            investmentBehavior: data.riskAssessment.investment_behavior,
            updatedAt: data.riskAssessment.updated_at,
          }
        : null,
      profileCompletion: Math.min(100, completionScore),
      aiSuitability,
      aiSuitabilityLabel,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard data",
    });
  }
};