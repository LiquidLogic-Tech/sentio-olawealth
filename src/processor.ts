import { SuiNetwork } from "@sentio/sdk/sui";
import { normalizeSuiAddress } from "@mysten/sui.js/utils";
import { getPriceBySymbol } from "@sentio/sdk/utils";

import { vault } from "./types/sui/olawealth_vault.js";
import { COIN_DECIMALS } from "./const.js";

vault
  .bind({
    network: SuiNetwork.MAIN_NET,
    startCheckpoint: BigInt(68187989),
  })
  .onEventDepositEvent(async (event, ctx) => {
    const formattedBuckAmount = event.data_decoded.amount
      .asBigDecimal()
      .dividedBy(10 ** COIN_DECIMALS.BUCK);
    ctx.meter.Counter("BUCK_TVL").add(formattedBuckAmount, {
      input_coin_symbol: "BUCK",
    });
    const formattedOLA_LP_Amount = event.data_decoded.amount
      .asBigDecimal()
      .dividedBy(10 ** 9);
    ctx.meter.Counter("Circulating_OLA_LP").add(formattedOLA_LP_Amount, {
      input_coin_symbol: "LP-sUSDC",
    });

    ctx.eventLogger.emit("Deposit_BUCK", {
      sender: event.sender,
      deposited_buck: formattedBuckAmount,
    });
  })
  .onEventStrategyProfitEvent(async (event, ctx) => {
    const formattedBuckAmount = event.data_decoded.profit
      .asBigDecimal()
      .dividedBy(10 ** COIN_DECIMALS.BUCK);
    ctx.meter.Counter("BUCK_TVL").sub(formattedBuckAmount, {
      input_coin_symbol: "BUCK",
    });
  })
  .onEventWithdrawEvent(async (event, ctx) => {
    const formattedBuckAmount = event.data_decoded.amount
      .asBigDecimal()
      .dividedBy(10 ** COIN_DECIMALS.BUCK);
    ctx.meter.Counter("BUCK_TVL").sub(formattedBuckAmount, {
      input_coin_symbol: "BUCK",
    });
    const formattedOLA_LP_Amount = event.data_decoded.amount
      .asBigDecimal()
      .dividedBy(10 ** 9);
    ctx.meter.Counter("Circulating_OLA_LP").sub(formattedOLA_LP_Amount, {
      input_coin_symbol: "LP-sUSDC",
    });
    ctx.eventLogger.emit("Withdraw_BUCK", {
      sender: event.sender,
      deposited_buck: -formattedBuckAmount,
    });
  });

function parse_token(name: string): string {
  let typeArgs = name.split("::");
  switch (normalizeSuiAddress(typeArgs[0])) {
    case "0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881":
      return "BTC";
    case "0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5":
      return "ETH";
    case "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf":
      return "USDC";
    case "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c":
      return "USDT";
    case "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc":
      return "AFSUI";
    case "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55":
      return "VSUI";
    case "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d":
      return "HASUI";
    case "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb":
      return "USDY";
    case "0xc49b92938b1a9f190267d8c2afb2b5943a39e709d83e388c2c1f3b4325be2167":
      return "LP-sUSDC";
    default:
      return typeArgs[2];
  }
}
