-- Basic DEX implementation for arweave/ao protocol
local bint = require('.bint')(256)
local json = require('json')

-- Initialize state
-- Pool information and liquidity tracking
Pools = Pools or {}
DEFAULT_FEE = DEFAULT_FEE or "3" -- 0.3% fee (will be divided by 1000)

-- Utility functions for bint operations
local utils = {
  add = function(a, b)
    return tostring(bint(a) + bint(b))
  end,
  subtract = function(a, b)
    return tostring(bint(a) - bint(b))
  end,
  multiply = function(a, b)
    return tostring(bint(a) * bint(b))
  end,
  divide = function(a, b)
    return tostring(bint(a) / bint(b))
  end,
  lessThan = function(a, b)
    return bint(a) < bint(b)
  end,
  greaterThan = function(a, b)
    return bint(a) > bint(b)
  end,
  equals = function(a, b)
    return bint(a) == bint(b)
  end
}

-- Get or create pool with default values
local function getOrCreatePool(baseToken, quoteToken)
  local poolKey = baseToken .. "-" .. quoteToken
  
  if not Pools[poolKey] then
    Pools[poolKey] = {
      baseToken = baseToken,
      quoteToken = quoteToken,
      baseReserve = "0",
      quoteReserve = "0",
      lpTokenSupply = "0",
      fee = DEFAULT_FEE,
      lpHolders = {}
    }
  end
  
  return Pools[poolKey]
end

-- Calculate output amount based on constant product formula (x * y = k)
local function getOutputAmount(inputAmount, inputReserve, outputReserve, fee)
  -- Apply fee: inputAmountWithFee = inputAmount * (10000 - fee) / 10000
  local feeMultiplier = utils.subtract("1000", fee)
  local inputAmountWithFee = utils.multiply(inputAmount, feeMultiplier)
  local numerator = utils.multiply(inputAmountWithFee, outputReserve)
  local denominator = utils.add(utils.multiply(inputReserve, "1000"), inputAmountWithFee)
  return utils.divide(numerator, denominator)
end

-- Calculate the price as quote amount / base amount (quote per base)
local function getPrice(baseReserve, quoteReserve)
  if utils.equals(baseReserve, "0") then
    return "0" -- Avoid division by zero
  end
  return utils.divide(quoteReserve, baseReserve)
end

-- HANDLERS
Handlers.add("Balance", "Balance", function(msg)
  ArbitrageConfig.balance  = msg.Balance
end)
-- Swap tokens handler
Handlers.add('Swap', 'Swap', function(msg)
  -- Validate input parameters
  assert(type(msg.BaseToken) == 'string', 'BaseToken is required!')
  assert(type(msg.QuoteToken) == 'string', 'QuoteToken is required!')
  assert(type(msg.InputToken) == 'string', 'InputToken is required!')
  assert(type(msg.InputAmount) == 'string', 'InputAmount is required!')
  assert(type(msg.MinOutputAmount) == 'string', 'MinOutputAmount is required!')
  assert(utils.greaterThan(msg.InputAmount, "0"), 'InputAmount must be greater than zero!')
  
  local baseToken = msg.BaseToken
  local quoteToken = msg.QuoteToken
  local inputToken = msg.InputToken
  local inputAmount = msg.InputAmount
  
  -- Ensure input token is either base or quote token
  assert(inputToken == baseToken or inputToken == quoteToken, 'InputToken must be either BaseToken or QuoteToken')
  
  -- Get the pool
  local pool = getOrCreatePool(baseToken, quoteToken)
  assert(utils.greaterThan(pool.baseReserve, "0") and utils.greaterThan(pool.quoteReserve, "0"), 'Pool has no liquidity')
  
  -- Determine input and output reserves based on input token
  local inputReserve, outputReserve, outputToken
  if inputToken == baseToken then
    inputReserve = pool.baseReserve
    outputReserve = pool.quoteReserve
    outputToken = quoteToken
  else
    inputReserve = pool.quoteReserve
    outputReserve = pool.baseReserve
    outputToken = baseToken
  end
  
  -- Calculate output amount
  local outputAmount = getOutputAmount(inputAmount, inputReserve, outputReserve, pool.fee)
  
  -- Check slippage tolerance
  assert(utils.greaterThan(outputAmount, msg.MinOutputAmount) or utils.equals(outputAmount, msg.MinOutputAmount), 
         'Output amount below minimum: ' .. outputAmount .. ' < ' .. msg.MinOutputAmount)
  
  -- Transfer input tokens from user to this contract
  Send({
    Target = inputToken,
    Action = "Transfer",
    Recipient = ao.id, 
    Quantity = inputAmount,
    From = msg.From
  })
  
  -- Transfer output tokens to user
  Send({
    Target = outputToken,
    Action = "Transfer",
    Recipient = msg.From,
    Quantity = outputAmount,
    From = ao.id
  })
  
  -- Update reserves
  if inputToken == baseToken then
    pool.baseReserve = utils.add(pool.baseReserve, inputAmount)
    pool.quoteReserve = utils.subtract(pool.quoteReserve, outputAmount)
  else
    pool.quoteReserve = utils.add(pool.quoteReserve, inputAmount)
    pool.baseReserve = utils.subtract(pool.baseReserve, outputAmount)
  end 
  -- Save updated pool
  Pools[baseToken .. "-" .. quoteToken] = pool
  
  -- Swap successful
  msg.reply({
    Action = 'Swap-Complete',
    InputToken = inputToken,
    InputAmount = inputAmount,
    OutputToken = outputToken,
    OutputAmount = outputAmount,
    BaseReserve = pool.baseReserve,
    QuoteReserve = pool.quoteReserve,
    Data = "Successfully swapped " .. inputAmount .. " of token " .. 
           inputToken .. " for " .. outputAmount .. " of token " .. 
           outputToken
  })
end)

Handlers.add("Hello", "Hello", function(msg)
  print("Helllo world")
    msg.reply({
        Action="Hello",
        Data="Hello world"
    })
end)

-- Add liquidity handler
Handlers.add('AddLiquidity', 'AddLiquidity', function(msg)
  print("AddLiquidity")
  -- Validate input parameters
  assert(type(msg.BaseToken) == 'string', 'BaseToken is required!')
  assert(type(msg.QuoteToken) == 'string', 'QuoteToken is required!')
  assert(type(msg.BaseAmount) == 'string', 'BaseAmount is required!')
  assert(type(msg.QuoteAmount) == 'string', 'QuoteAmount is required!')
  assert(utils.greaterThan(msg.BaseAmount, "0"), 'BaseAmount must be greater than zero!')
  assert(utils.greaterThan(msg.QuoteAmount, "0"), 'QuoteAmount must be greater than zero!')
  
  local baseToken = msg.BaseToken
  local quoteToken = msg.QuoteToken
  local baseAmount = msg.BaseAmount
  local quoteAmount = msg.QuoteAmount
  
  -- Get or create the pool
  local poolKey = baseToken .. "-" .. quoteToken

  --@TODO: Check the validity of the getorCreatePool Function
  local pool = getOrCreatePool(baseToken, quoteToken)
  -- print("Pool: ".. pool)
  
  -- Transfer tokens from user to this contract (no LP tokens minted)
  Send({
    Target = baseToken,
    Action = "Transfer",
    Recipient = ao.id,
    Quantity = baseAmount,
    From = msg.From
  })
  
  Send({
    Target = quoteToken,
    Action = "Transfer",
    Recipient = ao.id,
    Quantity = quoteAmount,
    From = msg.From
  })
  
  -- Update pool reserves 
  pool.baseReserve = utils.add(pool.baseReserve, baseAmount)
  pool.quoteReserve = utils.add(pool.quoteReserve, quoteAmount)
  
  -- Save updated pool
  Pools[poolKey] = pool
  
  -- Reply with success (no LP token data)
  msg.reply({
    Action = 'AddLiquidity-Complete',
    BaseToken = baseToken,
    QuoteToken = quoteToken,
    BaseAmount = baseAmount,
    QuoteAmount = quoteAmount,
    NewBaseReserve = pool.baseReserve,
    NewQuoteReserve = pool.quoteReserve,
    Data = "Successfully added liquidity with " .. baseAmount .. " of token " .. 
           baseToken .. " and " .. quoteAmount .. " of token " .. quoteToken
  })
end)
-- Remove liquidity handler
Handlers.add('RemoveLiquidity', 'RemoveLiquidity', function(msg)
  -- Validate input parameters
  assert(type(msg.BaseToken) == 'string', 'BaseToken is required!')
  assert(type(msg.QuoteToken) == 'string', 'QuoteToken is required!')
  assert(type(msg.LPAmount) == 'string', 'LPAmount is required!')
  assert(utils.greaterThan(msg.LPAmount, "0"), 'LPAmount must be greater than zero!')
  
  local baseToken = msg.BaseToken
  local quoteToken = msg.QuoteToken
  local lpAmount = msg.LPAmount
  
  -- Get the pool
  local poolKey = baseToken .. "-" .. quoteToken
  local pool = getOrCreatePool(baseToken, quoteToken)
  
  -- Verify user has enough LP tokens
  assert(pool.lpHolders[msg.From] and utils.greaterThan(pool.lpHolders[msg.From], "0"), 'No LP tokens owned by user')
  assert(utils.greaterThan(pool.lpHolders[msg.From], lpAmount) or utils.equals(pool.lpHolders[msg.From], lpAmount), 
         'Insufficient LP tokens: ' .. pool.lpHolders[msg.From] .. ' < ' .. lpAmount)
  
  -- Calculate tokens to return based on LP token proportion
  local baseAmount = utils.divide(
    utils.multiply(pool.baseReserve, lpAmount),
    pool.lpTokenSupply
  )
  
  local quoteAmount = utils.divide(
    utils.multiply(pool.quoteReserve, lpAmount),
    pool.lpTokenSupply
  )
  
  -- Update LP token balance for the user
  pool.lpHolders[msg.From] = utils.subtract(pool.lpHolders[msg.From], lpAmount)
  
  -- Update pool reserves and LP token supply
  pool.baseReserve = utils.subtract(pool.baseReserve, baseAmount)
  pool.quoteReserve = utils.subtract(pool.quoteReserve, quoteAmount)
  pool.lpTokenSupply = utils.subtract(pool.lpTokenSupply, lpAmount)
  
  -- Transfer tokens to user
  Send({
    Target = baseToken,
    Action = "Transfer",
    Recipient = msg.From,
    Quantity = baseAmount,
    From = ao.id
  })
  
  Send({
    Target = quoteToken,
    Action = "Transfer",
    Recipient = msg.From,
    Quantity = quoteAmount,
    From = ao.id
  })
  
  -- Save updated pool
  Pools[poolKey] = pool
  
  -- RemoveLiquidity successful
  msg.reply({
    Action = 'RemoveLiquidity-Complete',
    BaseToken = baseToken,
    QuoteToken = quoteToken,
    BaseAmount = baseAmount,
    QuoteAmount = quoteAmount,
    LPTokensBurned = lpAmount,
    NewBaseReserve = pool.baseReserve,
    NewQuoteReserve = pool.quoteReserve,
    Data = "Successfully removed liquidity. Returned " .. baseAmount .. " of token " .. 
           baseToken .. " and " .. quoteAmount .. " of token " .. 
           quoteToken .. ". LP tokens burned: " .. lpAmount
  })
end)

-- GetPrice handler
Handlers.add('GetPrice', 'GetPrice', function(msg)
  -- Validate input parameters
  assert(type(msg.BaseToken) == 'string', 'BaseToken is required!')
  assert(type(msg.QuoteToken) == 'string', 'QuoteToken is required!')
  
  local baseToken = msg.BaseToken
  local quoteToken = msg.QuoteToken
  
  -- Get the pool
  local poolKey = baseToken .. "-" .. quoteToken
  local pool = getOrCreatePool(baseToken, quoteToken)
  
  -- Calculate price (quote per base)
  local price = getPrice(pool.baseReserve, pool.quoteReserve)
  
  -- GetPrice successful
  msg.reply({
    Action = 'GetPrice-Complete',
    BaseToken = baseToken,
    QuoteToken = quoteToken,
    Price = price,
    BaseReserve = pool.baseReserve,
    QuoteReserve = pool.quoteReserve,
    Data = "Current price of " .. baseToken .. " is " .. price .. " " .. quoteToken
  })
end)

-- GetPool handler - returns pool information
Handlers.add('GetPool', 'GetPool', function(msg)

  print("Reached here")
  -- Validate input parameters
  assert(type(msg.BaseToken) == 'string', 'BaseToken is required!')
  assert(type(msg.QuoteToken) == 'string', 'QuoteToken is required!')
  
  local baseToken = msg.BaseToken
  local quoteToken = msg.QuoteToken
  
  -- Get the pool
  local poolKey = baseToken .. "-" .. quoteToken
  local pool = getOrCreatePool(baseToken, quoteToken)
  
  -- print("Pool: ".. pool)

  -- GetPool successful
  local poolInfo = {
    BaseToken = pool.baseToken,
    QuoteToken = pool.quoteToken,
    BaseReserve = pool.baseReserve,
    QuoteReserve = pool.quoteReserve,
    LPTokenSupply = pool.lpTokenSupply,
    Fee = pool.fee
  }
  print(poolInfo)
  
  msg.reply({
    Action = 'GetPool-Complete',
    Data = json.encode(poolInfo)
  })
end)

-- GetLPBalance handler - returns user's LP token balance
Handlers.add('GetLPBalance', 'GetLPBalance', function(msg)
  -- Validate input parameters
  assert(type(msg.BaseToken) == 'string', 'BaseToken is required!')
  assert(type(msg.QuoteToken) == 'string', 'QuoteToken is required!')
  
  local baseToken = msg.BaseToken
  local quoteToken = msg.QuoteToken
  local userAddress = msg.Address or msg.From
  
  -- Get the pool
  local poolKey = baseToken .. "-" .. quoteToken
  local pool = getOrCreatePool(baseToken, quoteToken)
  
  -- Get LP balance
  local lpBalance = pool.lpHolders[userAddress] or "0"
  
  -- GetLPBalance successful
  msg.reply({
    Action = 'GetLPBalance-Complete',
    BaseToken = baseToken,
    QuoteToken = quoteToken,
    Address = userAddress,
    LPBalance = lpBalance,
    Data = "LP token balance for " .. userAddress .. " is " .. lpBalance
  })
end)

-- GetPoolList handler - returns all available pools
Handlers.add('GetPoolList', 'GetPoolList', function(msg)
  local poolList = {}
  print('Reached here')
  
  for poolKey, pool in pairs(Pools) do
    table.insert(poolList, {
      PoolKey = poolKey,
      BaseToken = pool.baseToken,
      QuoteToken = pool.quoteToken,
      BaseReserve = pool.baseReserve,
      QuoteReserve = pool.quoteReserve
    })
  end
  for _, pool in ipairs(poolList) do
    print("PoolKey: " .. pool.PoolKey)
    print("BaseToken: " .. pool.BaseToken)
    print("QuoteToken: " .. pool.QuoteToken)
    print("BaseReserve: " .. pool.BaseReserve)
    print("QuoteReserve: " .. pool.QuoteReserve)
    print("-----")
  end

  msg.reply({
    Action = 'GetPoolList-Complete',
    Data = json.encode(poolList)
  })
end)


-- PreviewSwap handler - calculates the output amount without executing the swap
Handlers.add('PreviewSwap', 'PreviewSwap', function(msg)
  -- Validate input parameters
  assert(type(msg.BaseToken) == 'string', 'BaseToken is required!')
  assert(type(msg.QuoteToken) == 'string', 'QuoteToken is required!')
  assert(type(msg.InputToken) == 'string', 'InputToken is required!')
  assert(type(msg.InputAmount) == 'string', 'InputAmount is required!')
  
  local baseToken = msg.BaseToken
  local quoteToken = msg.QuoteToken
  local inputToken = msg.InputToken
  local inputAmount = msg.InputAmount
  
  -- Ensure input token is either base or quote token
  assert(inputToken == baseToken or inputToken == quoteToken, 'InputToken must be either BaseToken or QuoteToken')
  
  -- Get the pool
  local pool = getOrCreatePool(baseToken, quoteToken)
  
  -- Determine input and output reserves based on input token
  local inputReserve, outputReserve, outputToken
  if inputToken == baseToken then
    inputReserve = pool.baseReserve
    outputReserve = pool.quoteReserve
    outputToken = quoteToken
  else
    inputReserve = pool.quoteReserve
    outputReserve = pool.baseReserve
    outputToken = baseToken
  end
  
  -- Calculate output amount
  local outputAmount = "0"
  if utils.greaterThan(inputReserve, "0") and utils.greaterThan(outputReserve, "0") then
    outputAmount = getOutputAmount(inputAmount, inputReserve, outputReserve, pool.fee)
  end
  
  -- Calculate price impact
  local priceImpact = "0"
  if utils.greaterThan(inputReserve, "0") and utils.greaterThan(outputReserve, "0") then
    local spotPrice = utils.divide(outputReserve, inputReserve)
    local executionPrice = utils.divide(outputAmount, inputAmount)
    local priceDiff = utils.subtract(spotPrice, executionPrice)
    priceImpact = utils.divide(
      utils.multiply(priceDiff, "10000"),
      spotPrice
    )
  end
  
  -- PreviewSwap successful
  msg.reply({
    Action = 'PreviewSwap-Complete',
    InputToken = inputToken,
    InputAmount = inputAmount,
    OutputToken = outputToken,
    OutputAmount = outputAmount,
    PriceImpact = priceImpact,
    Data = "Swap preview: " .. inputAmount .. " of " .. inputToken .. 
           " for approximately " .. outputAmount .. " of " .. outputToken
  })
end)