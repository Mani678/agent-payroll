import * as StellarSdk from "@stellar/stellar-sdk";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const server = new StellarSdk.Horizon.Server(
  process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org"
);

export interface AgentWallet {
  publicKey: string;
  secretKey: string;
}

export async function generateWallet(): Promise<AgentWallet> {
  const keypair = StellarSdk.Keypair.random();
  await fundTestnetWallet(keypair.publicKey());
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
}

export async function fundTestnetWallet(publicKey: string): Promise<void> {
  await axios.get(
    `https://friendbot.stellar.org?addr=${publicKey}`
  );
}

export async function getBalance(publicKey: string): Promise<number> {
  try {
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find(
      (b: any) => b.asset_type === "native"
    );
    return xlmBalance ? parseFloat(xlmBalance.balance) : 0;
  } catch {
    return 0;
  }
}

export async function sendPayment(
  fromSecret: string,
  toPublicKey: string,
  amount: string
): Promise<string> {
  const fromKeypair = StellarSdk.Keypair.fromSecret(fromSecret);
  const fromAccount = await server.loadAccount(fromKeypair.publicKey());

  const transaction = new StellarSdk.TransactionBuilder(fromAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: toPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: amount,
      })
    )
    .setTimeout(30)
    .build();

  transaction.sign(fromKeypair);
  const result = await server.submitTransaction(transaction);
  return result.hash;
}

export async function getManagerKeypair(): Promise<StellarSdk.Keypair> {
  return StellarSdk.Keypair.fromSecret(process.env.MANAGER_SECRET_KEY!);
}