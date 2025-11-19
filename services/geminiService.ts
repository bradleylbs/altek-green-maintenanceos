
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MaintenanceReport, WorkOrder, ROIData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const getChatResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: `You are "AltekBot", a specialized Maintenance Support AI for Altek Green.
        Your Role: Assist technicians and supervisors with advanced mining equipment maintenance, asset tracking, and safety protocols.
        
        Knowledge Base:
        - Altek Green Mining Systems (Titan Excavators, Haul Trucks, Drill Rigs, Conveyor Systems).
        - Safety: Mine safety regulations (MSHA/DGMS), high voltage safety for electric mining gear, lockout/tagout procedures.
        - Protocol: Geo-fencing rules (restricted mining zones, blasting zones).
        
        Tone: Technical, safety-first, concise.
        If a technician asks about bypassing a geofence, strictly remind them of the compliance policy described in the "Altek Safety" protocol.`,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message });
    return result.text || "System anomaly. Please retry.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Connection to Maintenance Server failed. Offline protocols in effect.";
  }
};

export const generateMaintenanceInsights = async (
  workOrders: WorkOrder[]
): Promise<MaintenanceReport> => {
  try {
    const reportSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "Executive summary of fleet maintenance status for mining operations" },
        criticalIssues: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "List of high priority risks based on the work orders" 
        },
        efficiencyScore: { type: Type.NUMBER, description: "A score from 0-100 on maintenance efficiency" },
        recommendations: { type: Type.STRING, description: "Actionable advice for the supervisor" }
      },
      required: ["summary", "criticalIssues", "efficiencyScore", "recommendations"],
    };

    const prompt = `
      Analyze the following active work orders for the Altek Green Mining Maintenance System.
      Provide a status report for the Site Supervisor.
      
      Work Order Data:
      ${JSON.stringify(workOrders)}
      
      Focus on:
      1. Overdue or Critical items affecting production.
      2. Bottlenecks in specific asset categories (Excavators, Haulers).
      3. Safety risks in the mining environment.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reportSchema,
        // Enable thinking for deeper analysis of safety risks and schedule conflicts
        thinkingConfig: { thinkingBudget: 2048 } 
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as MaintenanceReport;
    }
    throw new Error("No data returned");

  } catch (error) {
    console.error("Report Error:", error);
    return {
      summary: "Unable to generate AI report due to connectivity.",
      criticalIssues: ["Check Network Connection"],
      efficiencyScore: 0,
      recommendations: "Proceed with manual checks."
    };
  }
};

export const calculateEcoSavings = async (
  km: number,
  fuelPrice: number,
  elecPrice: number
): Promise<ROIData> => {
  try {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        yearlySavings: { type: Type.NUMBER },
        monthlySavings: { type: Type.NUMBER },
        paybackPeriodMonths: { type: Type.NUMBER },
        co2Saved: { type: Type.NUMBER },
        advice: { type: Type.STRING },
      },
      required: ["yearlySavings", "monthlySavings", "paybackPeriodMonths", "co2Saved", "advice"],
    };

    const prompt = `
      Calculate ROI for switching from Diesel Mining Equipment to Altek Green Electric Mining Systems.
      
      Inputs:
      - Daily Usage: ${km} km equivalent (or hours)
      - Diesel Cost: ${fuelPrice} per liter
      - Electricity Cost: ${elecPrice} per unit
      
      Assumptions:
      - Diesel Efficiency: Moderate for heavy machinery
      - EV Efficiency: High for electric drive systems
      - Work Days: 300 days/year
      - Vehicle Cost Difference: 150,000 currency units
      - Diesel CO2: High emission factor
      - EV CO2: Low emission factor
      
      Task:
      1. Calculate savings based on the inputs and assumptions.
      2. Provide a short, persuasive business advice string summarizing the benefit for a mining operation.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ROIData;
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("ROI Error:", error);
    // Fallback calculation
    const dieselCost = (km / 20) * fuelPrice * 300;
    const evCost = (km / 10) * elecPrice * 300;
    const yearlySavings = dieselCost - evCost;
    const monthlySavings = yearlySavings / 12;
    
    return {
      yearlySavings: Math.round(yearlySavings),
      monthlySavings: Math.round(monthlySavings),
      paybackPeriodMonths: Math.round(150000 / monthlySavings),
      co2Saved: Math.round(((km/20)*2.6 * 300) - ((km/10)*0.8 * 300)),
      advice: "Switching to Altek electric systems offers significant savings."
    };
  }
};

export const generateMaintenanceChecklist = async (
  assetName: string,
  description: string
): Promise<string[]> => {
  try {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        steps: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "A list of 3-6 technical maintenance steps" 
        }
      },
      required: ["steps"]
    };

    const prompt = `
      Create a technical maintenance checklist for the following task:
      Asset: ${assetName}
      Issue/Task: ${description}
      
      Requirements:
      - Provide 3 to 6 concise, actionable steps.
      - Focus on safety and correct procedure for heavy mining equipment.
      - First step should always be safety related (e.g. Lockout/Tagout, Wheel chocks).
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data.steps || ["Perform safety check", "Diagnose issue", "Repair/Replace", "Verify operation"];
    }
    return [];
  } catch (error) {
    console.error("Checklist Gen Error:", error);
    return ["Ensure safety protocols", "Inspect area", "Resolve issue", "Log completion"];
  }
};

export const enhanceWorkOrderDescription = async (
  text: string,
  assetType: string
): Promise<string> => {
  try {
    const prompt = `
      You are a technical mining fleet supervisor.
      Rewrite the following rough maintenance issue description into a professional, technical, and concise work order description for advanced mining equipment.
      
      Asset Type: ${assetType}
      User Input: "${text}"
      
      Output: Just the rewritten text. No quotes.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Description Enhance Error:", error);
    return text;
  }
};

export const analyzeAssetImage = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  try {
    const prompt = "Analyze this image of a mining equipment component. Describe the visible wear, damage, or anomaly in technical terms suitable for a maintenance work order description. Keep it under 20 words.";
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: prompt }
        ]
      }
    });

    return response.text?.trim() || "Visual anomaly detected. Manual inspection required.";
  } catch (error) {
    console.error("Image Analysis Error:", error);
    return "Image analysis failed. Please enter description manually.";
  }
};
