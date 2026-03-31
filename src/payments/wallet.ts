import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

export interface AgentWallet {
  publicKey: string;
  secretKey: string;
}

export async function generateWallet(): Promise<AgentWallet> {
  const id = uuidv4().replace(/-/g, "").toUpperCase();
  return {
    publicKey: "G" + id.substring(0, 55),
    secretKey: "S" + id.substring(0, 55),
  };
}

export async function fundTestnetWallet(publicKey: string): Promise<void> {
  console.log(`[mock] funded wallet ${publicKey.slice(0, 8)}...`);
}

export async function getBalance(publicKey: string): Promise<number> {
  return 100.0;
}

export async function sendPayment(
  fromSecret: string,
  toPublicKey: string,
  amount: string
): Promise<string> {
  const mockHash = uuidv4().replace(/-/g, "");
  console.log(`[mock] payment ${amount} XLM → ${toPublicKey.slice(0, 8)}... tx:${mockHash.slice(0, 8)}`);
  return mockHash;
}

export async function getManagerKeypair(): Promise<any> {
  return {
    publicKey: () => process.env.MANAGER_PUBLIC_KEY || "GMOCK",
    secret: () => process.env.MANAGER_SECRET_KEY || "SMOCK",
  };
}