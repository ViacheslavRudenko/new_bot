import { parseEther } from "@ethersproject/units";
import { Wallet, utils } from "ethers";

import { betAmountAtom } from "./atoms";
import { calculateIsBullish } from "./calculate-is-bullish";
import { createPancakePredictionContract } from "./pancake-prediction-contract-config";

export const checkAndBet = async (signer: Wallet) => {
  const pancakePredictionContract = createPancakePredictionContract(signer);

  const currentEpoch = await pancakePredictionContract.currentEpoch();

  const { amount: currentAmount } = await pancakePredictionContract.ledger(
    currentEpoch,
    signer.address
  );
  getRemainingTimeToBet(signer).then((time) => {
    console.log(calculateIsBullish());
  });

  const isEntered = currentAmount.gt(0);

  if (isEntered) {
    return;
  }

  let isBullish = true;

  try {
    isBullish = await calculateIsBullish();
  } catch {
    /* empty */
  }

  const betTx = await pancakePredictionContract[
    isBullish ? "betBull" : "betBear"
  ](currentEpoch, {
    value: parseEther(betAmountAtom.get()),
  });

  await betTx.wait();

  return `Epoch: ${currentEpoch}. Successfully Entered for ${betAmountAtom.get()} BNB ${
    isBullish ? "Bullish" : "Bearish"
  }.`;
};

async function getRemainingTimeToBet(signer: any) {
  const pancakePredictionContract = createPancakePredictionContract(
    signer
  ) as any;

  const currentEpoch = await pancakePredictionContract.currentEpoch();
  const epochInfo = await pancakePredictionContract.rounds(currentEpoch);

  const dateNow = Date.now();

  const hexTimestamp = epochInfo.lockTimestamp._hex;
  const decimalTimestamp = parseInt(hexTimestamp, 16);
  const timeToBet = decimalTimestamp * 1000;

  const timeRemaining = (timeToBet - dateNow) / 1000;

  return timeRemaining;
}

// Використання функції для отримання залишкового часу
// async function checkRemainingTime() {
//   const signer = new Wallet(""); // Отримайте ваш підписник (Wallet) тут
//   const remainingTime = await getRemainingTimeToBet(signer);
//   console.log(
//     `Час до закінчення ставки: ${utils.formatUnits(
//       remainingTime,
//       "seconds"
//     )} секунд`
//   );
//   return remainingTime;
// }

// checkRemainingTime();
