const API_BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const userApi = {
  getRiskAssessment: async () => {
    const response = await fetch(`${API_BASE_URL}/users/risk-assessment`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, data };
    }

    return data;
  },

  saveRiskAssessment: async (assessmentData) => {
    const response = await fetch(`${API_BASE_URL}/users/risk-assessment`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(assessmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, data };
    }

    return data;
  },

  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/users/dashboard`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, data };
    }

    return data;
  },
};

export const marketApi = {
  getMarketData: async () => {
    const response = await fetch(`${API_BASE_URL}/market`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, data };
    }

    return data;
  },
};

export const investmentApi = {
  getInvestments: async () => {
    const response = await fetch(`${API_BASE_URL}/investments`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, data };
    }

    return data;
  },
};

export const recommendationApi = {
  getRecommendations: async () => {
    const response = await fetch(`${API_BASE_URL}/recommendations`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, data };
    }

    return data;
  },
};

export const explanationApi = {
  getExplanation: async (investmentId) => {
    const response = await fetch(
      `${API_BASE_URL}/recommendations/explain?investmentId=${investmentId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, data };
    }

    return data;
  },
};

export const brokerApi = {
  getBrokers: async () => {
    const response = await fetch(`${API_BASE_URL}/brokers`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, data };
    }

    return data;
  },

  getBrokerProducts: async (brokerId) => {
    const response = await fetch(`${API_BASE_URL}/brokers/${brokerId}/products`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, data };
    }

    return data;
  },
};

export const educationApi = {
  getEducation: async () => {
    const response = await fetch(`${API_BASE_URL}/education`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, data };
    }

    return data;
  },
};

export const mlApi = {
  getPrediction: async () => {
    const response = await fetch(`${API_BASE_URL}/ml/prediction`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, data };
    }

    return data;
  },
};




