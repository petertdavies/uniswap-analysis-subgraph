import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt,
  BigDecimal,
} from "@graphprotocol/graph-ts";

import {
  Swap,
  Initialize
} from "../types/templates/Pool/Pool"

import {
  Pool,
  TenMinUpdate,
  HourUpdate,
  SixHourUpdate,
  DayUpdate
} from "../types/schema"

import {
  ZERO_BI,
  ONE_BI
} from "../utils/constants"

let B2 = BigInt.fromI32(2)
let Q96 = B2.pow(96)
let Q192 = Q96 * Q96
let B10E6 = BigInt.fromI32(10).pow(6)

let TENMIN = BigInt.fromI32(600)
let HOUR = BigInt.fromI32(3600)
let SIXHOUR = BigInt.fromI32(21600)
let DAY = BigInt.fromI32(86400)

export function handleInitialize(event: Initialize): void {
  let pool = Pool.load(event.address.toHexString())
  pool.sqrtPriceX96 = event.params.sqrtPriceX96
  pool.lastUpdate = event.block.timestamp

  let updateTime0 = (event.block.timestamp * TENMIN) / TENMIN
  let update0 = new TenMinUpdate(pool.id + "#" + updateTime0.toString())
  pool.lastTenMinUpdate = update0.id
  update0.pool = pool.id
  update0.timestamp = updateTime0
  update0.sqrtPriceX96 = event.params.sqrtPriceX96
  update0.totalFeesPerLiquidity0X96 = ZERO_BI
  update0.totalFeesPerLiquidity1X96 = ZERO_BI
  update0.save()

  let updateTime1 = (event.block.timestamp * HOUR) / HOUR
  let update1 = new HourUpdate(pool.id + "#" + updateTime1.toString())
  pool.lastHourUpdate = update1.id
  update1.pool = pool.id
  update1.timestamp = updateTime1
  update1.sqrtPriceX96 = event.params.sqrtPriceX96
  update1.totalFeesPerLiquidity0X96 = ZERO_BI
  update1.totalFeesPerLiquidity1X96 = ZERO_BI
  update1.save()

  let updateTime2 = (event.block.timestamp * SIXHOUR) / SIXHOUR
  let update2 = new SixHourUpdate(pool.id + "#" + updateTime2.toString())
  pool.lastSixHourUpdate = update2.id
  update2.pool = pool.id
  update2.timestamp = updateTime2
  update2.sqrtPriceX96 = event.params.sqrtPriceX96
  update2.totalFeesPerLiquidity0X96 = ZERO_BI
  update2.totalFeesPerLiquidity1X96 = ZERO_BI
  update2.save()

  let updateTime3 = (event.block.timestamp * DAY) / DAY
  let update3 = new DayUpdate(pool.id + "#" + updateTime3.toString())
  pool.lastDayUpdate = update3.id
  update3.pool = pool.id
  update3.timestamp = updateTime3
  update3.sqrtPriceX96 = event.params.sqrtPriceX96
  update3.totalFeesPerLiquidity0X96 = ZERO_BI
  update3.totalFeesPerLiquidity1X96 = ZERO_BI
  update3.save()


  pool.save()
}

export function handleSwap(event: Swap): void {
  let pool = Pool.load(event.address.toHexString())

  let oldSqrtP = pool.sqrtPriceX96
  let newSqrtP = event.params.sqrtPriceX96

  if (newSqrtP > oldSqrtP) {
    pool.totalFeesPerLiquidity0X96 += ((newSqrtP - oldSqrtP) * pool.fee) / B10E6
  } else {
    pool.totalFeesPerLiquidity1X96 += (((Q192/newSqrtP) - (Q192/oldSqrtP)) * pool.fee) / B10E6
  }

  let lastUpdate = pool.lastUpdate
  let time = event.block.timestamp

  if (time / TENMIN != lastUpdate / TENMIN) {
    let updateTime = (time / TENMIN) * TENMIN
    let prevUpdate = TenMinUpdate.load(pool.id + "#" + updateTime.minus(TENMIN).toString())
    let update = new TenMinUpdate(pool.id + "#" + updateTime.toString())
    update.pool = pool.id
    update.timestamp = updateTime
    update.sqrtPriceX96 = newSqrtP
    update.totalFeesPerLiquidity0X96 = pool.totalFeesPerLiquidity0X96
    update.totalFeesPerLiquidity1X96 = pool.totalFeesPerLiquidity1X96
    update.save()
  }

  if (time / HOUR != lastUpdate / HOUR) {
    let updateTime = (time / HOUR) * HOUR
    let prevUpdate = HourUpdate.load(pool.id + "#" + updateTime.minus(HOUR).toString())
    let update = new HourUpdate(pool.id + "#" + updateTime.toString())
    update.pool = pool.id
    update.timestamp = updateTime
    update.sqrtPriceX96 = newSqrtP
    update.totalFeesPerLiquidity0X96 = pool.totalFeesPerLiquidity0X96
    update.totalFeesPerLiquidity1X96 = pool.totalFeesPerLiquidity1X96
    update.save()
  }

  if (time / SIXHOUR != lastUpdate / SIXHOUR) {
    let updateTime = (time / SIXHOUR) * SIXHOUR
    let prevUpdate = SixHourUpdate.load(pool.id + "#" + updateTime.minus(SIXHOUR).toString())
    let update = new SixHourUpdate(pool.id + "#" + updateTime.toString())
    update.pool = pool.id
    update.timestamp = updateTime
    update.sqrtPriceX96 = newSqrtP
    update.totalFeesPerLiquidity0X96 = pool.totalFeesPerLiquidity0X96
    update.totalFeesPerLiquidity1X96 = pool.totalFeesPerLiquidity1X96
    update.save()
  }

  if (time / DAY != lastUpdate / DAY) {
    let updateTime = (time / DAY) * DAY
    let prevUpdate = DayUpdate.load(pool.id + "#" + updateTime.minus(DAY).toString())
    let update = new DayUpdate(pool.id + "#" + updateTime.toString())
    update.pool = pool.id
    update.timestamp = updateTime
    update.sqrtPriceX96 = newSqrtP
    update.totalFeesPerLiquidity0X96 = pool.totalFeesPerLiquidity0X96
    update.totalFeesPerLiquidity1X96 = pool.totalFeesPerLiquidity1X96
    update.save()
  }

  pool.sqrtPriceX96 = newSqrtP
  pool.lastUpdate = event.block.timestamp

  pool.save()
}
