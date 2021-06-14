import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt,
  log
} from "@graphprotocol/graph-ts";

import {
  PoolCreated,
  FeeAmountEnabled,
  OwnerChanged
} from "../types/Factory/Factory"
import {
  Pool,
  Token
} from "../types/schema"
import {
  Pool as PoolTemplate
} from "../types/templates"
import {
  ZERO_BI,
  ONE_BI
} from "../utils/constants"

import {
  fetchTokenSymbol,
  fetchTokenName,
  fetchTokenTotalSupply,
  fetchTokenDecimals
} from '../utils/token'

export function handlePoolCreated(event: PoolCreated): void {
  let pool = new Pool(event.params.pool.toHexString())

  let token0 = loadToken(event.params.token0)
  let token1 = loadToken(event.params.token1)
  if (token0 == null || token1 == null) {
    return
  }

  pool.token0 = token0.id
  pool.token1 = token1.id
  pool.sqrtPriceX96 = ZERO_BI
  pool.fee = BigInt.fromI32(event.params.fee)
  pool.totalFeesPerLiquidity0X96 = ZERO_BI
  pool.totalFeesPerLiquidity1X96 = ZERO_BI
  pool.lastUpdate = event.block.timestamp

  PoolTemplate.create(event.params.pool)

  pool.save()
}

function loadToken(tokenAddr : Address): Token | null {
  let token = Token.load(tokenAddr.toHexString())

  if (token == null) {
    token = new Token(tokenAddr.toHexString())
    token.symbol = fetchTokenSymbol(tokenAddr)
    token.name = fetchTokenName(tokenAddr)
    let decimals = fetchTokenDecimals(tokenAddr)

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('mybug the decimal on token 0 was null', [])
      return null
    }

    token.decimals = decimals

    token.save()
  }

  return token
}
