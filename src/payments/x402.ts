import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export interface PaymentRequest {
  amount: string;
  currency: string;
  destination: string;
  memo?: string;
}

export interface X402Response {
  success: boolean;
  txHash?: string;
  error?: string;
}

export async function handleX402Payment(
  url: string,
  secretKey: string,
  payload: any
): Promise<any> {
  try {
    const firstResponse = await axios.post(url, payload);
    return firstResponse.data;
  } catch (error: any) {
    if (error.response?.status === 402) {
      const paymentDetails = error.response.data;
      const txHash = await submitX402Payment(paymentDetails, secretKey);
      const retryResponse = await axios.post(url, payload, {
        headers: {
          "X-Payment": txHash,
          "X-Payment-Scheme": "stellar",
        },
      });
      return retryResponse.data;
    }
    throw error;
  }
}

async function submitX402Payment(
  paymentDetails: any,
  secretKey: string
): Promise<string> {
  const { sendPayment } = await import("./wallet");
  const amount = process.env.PAYMENT_AMOUNT_USDC || "0.01";
  const txHash = await sendPayment(
    secretKey,
    paymentDetails.destination || process.env.X402_FACILITATOR_URL!,
    amount
  );
  return txHash;
}

export function createPaymentHeader(txHash: string): Record<string, string> {
  return {
    "X-Payment": txHash,
    "X-Payment-Scheme": "stellar",
    "X-Payment-Network": "testnet",
  };
}