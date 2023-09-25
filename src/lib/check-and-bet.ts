import { parseEther } from '@ethersproject/units'
import { Wallet } from 'ethers'

import { betAmountAtom } from './atoms'
import { calculateIsBullish } from './calculate-is-bullish'
import { createPancakePredictionContract } from './pancake-prediction-contract-config'

export const checkAndBet = async (signer: Wallet) => {
  const pancakePredictionContract = createPancakePredictionContract(signer)

  const currentEpoch = await pancakePredictionContract.currentEpoch()

  const { amount: currentAmount } = await pancakePredictionContract.ledger(
    currentEpoch,
    signer.address
  )
  getRemainingTimeToBet(signer)

  const isEntered = currentAmount.gt(0)

  if (isEntered) {
    return
  }

  let isBullish = true

  try {
    isBullish = await calculateIsBullish()
  } catch {
    /* empty */
  }

  const betTx = await pancakePredictionContract[
    isBullish ? 'betBull' : 'betBear'
  ](currentEpoch, {
    value: parseEther(betAmountAtom.get())
  })

  await betTx.wait()

  return `Epoch: ${currentEpoch}. Successfully Entered for ${betAmountAtom.get()} BNB ${
    isBullish ? 'Bullish' : 'Bearish'
  }.`
}

async function getRemainingTimeToBet(signer:any) {
  const pancakePredictionContract = createPancakePredictionContract(signer);
  const currentEpoch = await pancakePredictionContract.currentEpoch();
  const epochInfo = await pancakePredictionContract.epochInfo(currentEpoch);

  const epochStartTime = epochInfo.startTime;
  const epochDuration = epochInfo.duration;

  // Отримайте поточний час блокчейну
  const currentBlock = await signer.provider.getBlock("latest");
  const currentTimestamp = currentBlock.timestamp;

  // Обчисліть час, який залишився до закінчення епохи
  const timeRemaining = epochStartTime.add(epochDuration).sub(currentTimestamp);

  return timeRemaining;
}

// Використання функції для отримання залишкового часу
async function checkRemainingTime() {
  const signer = ...; // Отримайте ваш підписник (Wallet) тут
  const remainingTime = await getRemainingTimeToBet(signer);
  console.log(`Час до закінчення ставки: ${utils.formatUnits(remainingTime, "seconds")} секунд`);
}

checkRemainingTime();