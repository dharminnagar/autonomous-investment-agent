-- Arbitrage Agent for Arweave DEXes
local bint = require('.bint')(256)
local json = require('json')


-- DONT MAINTAIN TIME YOURSELF. THE CRON WILL BE AUTO TRIGGERED
-- Initialize state

-- SCAN HAPPENS AUTOMATICALLY BY THE CRON SYSTEM
ArbitrageConfig = ArbitrageConfig or {
  inputToken = nil,       -- Token to arbitrage
  targetToken = nil,      -- Target token to pair with
  slippage = "5",         -- Default slippage in permille (0.5%)
  minProfitThreshold = "5", -- Min profit threshold in permille (0.5%)
  dexProcesses = {},      -- List of DEX process IDs to monitor
  enabled = false         -- Is arbitrage monitoring enabled
}

ArbitrageState = ArbitrageState or {
  balance = "0",          -- Current balance of inputToken
  profitHistory = {},     -- History of profitable trades
  totalProfit = "0"       -- Total profit earned
}

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
    return a < b
  end,
  greaterThan = function(a, b)
    return a > b
  end,
  equals = function(a, b)
    return bint(a) == bint(b)
  end,
  calculateProfit = function(initialAmount, finalAmount)
    if bint(initialAmount) == 0 then return "0" end
    local profit = bint(finalAmount) - bint(initialAmount)
    return tostring(profit)
  end,
  calculateProfitPercentage = function(initialAmount, finalAmount)
    if bint(initialAmount) == 0 then return "0" end
    local profit = bint(finalAmount) - bint(initialAmount)
    local percentage = (profit * bint(1000)) / bint(initialAmount)
    return tostring(percentage)
  end
}

-- Helper function to check if a value exists in a table
local function contains(table, val)
  for i=1, #table do
    if table[i] == val then 
      return true
    end
  end
  return false
end

-- Format timestamp to human readable date
local function formatTimestamp(timestamp)
  timestamp = math.floor(timestamp/1000)
  local date = os.date("!*t", timestamp)
  return string.format("%02d/%02d/%04d %02d:%02d:%02d",
    date.day, date.month, date.year, date.hour, date.min, date.sec)
end

-- Setup handler - Configure the arbitrage agent
Handlers.add('Setup', 'Setup', function(msg)
  assert(type(msg.InputToken) == 'string', 'InputToken is required!')
  assert(type(msg.TargetToken) == 'string', 'TargetToken is required!')
  assert(type(msg.OriginalSender) == 'string', 'original sender is required!')
  assert(type(msg.InputTokenAmount) == 'string', 'Input token amount is required!')
  
  ArbitrageConfig.inputToken = msg.InputToken
  ArbitrageConfig.targetToken = msg.TargetToken
  
  if msg.Slippage and type(msg.Slippage) == 'string' then
    ArbitrageConfig.slippage = msg.Slippage
  end
  
  if msg.MinProfitThreshold and type(msg.MinProfitThreshold) == 'string' then
    ArbitrageConfig.minProfitThreshold = msg.MinProfitThreshold
  end

  --Get the amount of input token from the user to this process.
  
  Send({
    Target = "naoSsbeWp2qO-CYUfKwEZJpxleRSoNye6DJXRCoXw8U",
    TokenId = msg.InputToken,
    Action = "TransferFunds",
    Recipient = ao.id,
    Quantity = msg.InputTokenAmount,
    OriginalSender = msg.OriginalSender
  })
  local amount = Receive({
    Action = "Transfer_Executed"
  }).Data

  msg.reply({
    Action = 'Setup-Complete',
    InputToken = ArbitrageConfig.inputToken,
    TargetToken = ArbitrageConfig.targetToken,
    Slippage = ArbitrageConfig.slippage,
    MinProfitThreshold = ArbitrageConfig.minProfitThreshold,
    Data = "Arbitrage agent configured successfully"
  })
end)

-- Add DEX handler - Add a DEX process to monitor
Handlers.add('AddDEX', 'AddDEX', function(msg)
  assert(type(msg.DexProcessId) == 'string', 'DexProcessId is required!')
  
  if not contains(ArbitrageConfig.dexProcesses, msg.DexProcessId) then
    table.insert(ArbitrageConfig.dexProcesses, msg.DexProcessId)
  end
  
  msg.reply({
    Action = 'AddDEX-Complete',
    DexProcessId = msg.DexProcessId,
    -- @NOTE - DEX COUNT CAN CAUSE PROBLEMS 
    DexCount = #ArbitrageConfig.dexProcesses,
    Data = "DEX added successfully. Total DEXes: " .. #ArbitrageConfig.dexProcesses
  })
end)

-- List DEXes handler
Handlers.add('ListDEXes', 'ListDEXes', function(msg)
  msg.reply({
    Action = 'ListDEXes-Complete',
    -- @NOTE - arbitrage config count CAN CAUSE PROBLEMS
    DexCount = #ArbitrageConfig.dexProcesses,
    DexList = json.encode(ArbitrageConfig.dexProcesses),
    Data = "Total DEXes: " .. #ArbitrageConfig.dexProcesses
  })
end)

-- Start arbitrage monitoring
Handlers.add('Start', 'Start', function(msg)
  assert(ArbitrageConfig.inputToken, 'Setup required before starting!')
  assert(ArbitrageConfig.targetToken, 'Setup required before starting!')
  assert(#ArbitrageConfig.dexProcesses >= 2, 'At least 2 DEXes required for arbitrage!')
  
  ArbitrageConfig.enabled = true
  
  msg.reply({
    Action = 'Start-Complete',
    Data = "Arbitrage monitoring started. Waiting for next automatic scan."
  })
end)

-- Stop arbitrage monitoring
Handlers.add('Stop', 'Stop', function(msg)
  ArbitrageConfig.enabled = false
  
  msg.reply({
    Action = 'Stop-Complete',
    Data = "Arbitrage monitoring stopped"
  })
end)

-- Get the status of the arbitrage agent
Handlers.add('Status', 'Status', function(msg)
  msg.reply({
    Action = 'Status-Complete',
    Enabled = ArbitrageConfig.enabled,
    InputToken = ArbitrageConfig.inputToken,
    TargetToken = ArbitrageConfig.targetToken,
    Slippage = ArbitrageConfig.slippage,
    MinProfitThreshold = ArbitrageConfig.minProfitThreshold,
    DexCount = #ArbitrageConfig.dexProcesses,
    TotalProfit = ArbitrageState.totalProfit,
    Balance = ArbitrageState.balance,
    Data = "Arbitrage agent status"
  })
end)

-- Execute swap on a specific DEX
local function executeSwap(dexProcessId, baseToken, quoteToken, inputToken, inputAmount, minOutputAmount)
  -- Execute the swap on the DEX
  Send({
    Target = dexProcessId,
    Action = "Swap",
    BaseToken = baseToken,
    QuoteToken = quoteToken,
    InputToken = inputToken,
    InputAmount = inputAmount,
    MinOutputAmount = minOutputAmount
  })
  return nil
end


Handlers.add("GetExtremes", "GetExtremes",function(msg)
  print('reached here')

  local prices = msg.Data
  -- Find highest and lowest prices
  local highestPrice = "0"
  local lowestPrice = "1000000"
  local highestDexId = ""
  local lowestDexId = ""
  
  for dexId, price in pairs(prices) do
    print("Price from DEX " .. dexId .. ": " .. price)
    
    if utils.greaterThan(price, highestPrice) then
      highestPrice = price
      highestDexId = dexId
    end
    
    if utils.lessThan(price, lowestPrice) then
      lowestPrice = price
      lowestDexId = dexId
    end
  end
  
  print("Lowest price: " .. lowestPrice .. " at DEX: " .. lowestDexId)
  print("Highest price: " .. highestPrice .. " at DEX: " .. highestDexId)

  
  -- Create performArbitrageOn table with the highest and lowest price information
  local performArbitrageOn = {
    buy = {
      dexId = lowestDexId,
      price = lowestPrice
    },
    sell = {
      dexId = highestDexId,
      price = highestPrice
    }
  }
  print(performArbitrageOn);
end)

Handlers.add("getPrices", "getPrices", function(msg)
  -- This is to handle notifications from DEX processes or other sources
  -- about potential arbitrage opportunities
  local prices = {}
  for _, dexId in ipairs(ArbitrageConfig.dexProcesses ) do
    -- Then, get the price
    Send({
        Target = dexId,
        Action = "GetPrice",
        BaseToken = ArbitrageConfig.inputToken,
        QuoteToken = ArbitrageConfig.targetToken,
    })
    local price = Receive({
        Action = "GetPrice-Complete"
    }).Price
    print("Price from DEX " .. dexId .. ": " .. price)
    -- Store the price in the prices table with dexId as the key
    prices[dexId] = price
    
  end
  
  Send({
    Target = ao.id,
    Action = 'GetExtremes',
    Data = prices
  })
  
  -- Potentially analyze and execute arbitrage based on notification
end)

-- Core function to scan for arbitrage opportunities
local function scanForArbitrage()
  if not ArbitrageConfig.enabled then return end
  
  -- Get balance of input token
  --@NOTE THIS WILL NOT WORK (FROM) Where are we storing the balance?
  Send({
    Target = ArbitrageConfig.inputToken,
    Action = "Balance",
    Recipient = ao.id,
  })
  local BalanceOfThisProcess = Receive({
    Action = "recievedBalance"
  }).Data
  
  print("The balance is :" .. BalanceOfThisProcess);

  -- Get prices from all configured DEXes
  Send({
    Target = ao.id,
    Action = "getPrices"
  })

  local prices = Receive({
    Action = "getPrices-Received"
  }).Data

  print("Prices received from DEXes: " )

  -- Check if the arbitrage opportunity is profitable (PROFIT SHOULD BE  MORE THAN THE NETWORK FEES)
  -- local amountGained = utils.calculateProfit(lowestPrice, highestPrice)
  -- if(bint(amountGained) > 0.5) then
  --   --NOTIFY ABOUT THE ARBITRAGE OPPORTUNITY
  --   Send({
  --     Target = msg.From,
  --     Action = "ArbitrageOpportunityFound",
  --     Data = "A new profitable arbitrage opportunity found! " ..
  --            "Buy at DEX: " .. lowestDexId .. " at price: " .. lowestPrice .. 
  --            ", Sell at DEX: " .. highestDexId .. " at price: " .. highestPrice,
  --   })
  --   -- Execute the arbitrage
  --   executeSwap(
  --     lowestDexId,
  --     ArbitrageConfig.inputToken,
  --     ArbitrageConfig.targetToken,
  --     ArbitrageConfig.inputToken,
  --     amountGained,
  --     lowestPrice
  --   )
    
  --   executeSwap(
  --     highestDexId,
  --     ArbitrageConfig.inputToken,
  --     ArbitrageConfig.targetToken,
  --     ArbitrageConfig.targetToken,
  --     amountGained,
  --     highestPrice
  --   )
    
    -- -- Update the balance
    -- ArbitrageState.balance = utils.subtract(ArbitrageState.balance, amountGained)
    
    -- Notify about the arbitrage execution
  --   Send({
  --     Target = msg.From,
  --     Action = "ArbitrageExecuted",
  --     BuyDex = lowestDexId,
  --     SellDex = highestDexId,
  --     InputAmount = amountGained,
  --     Data = "Executed arbitrage successfully"
  --   })
  -- else
  --   -- Notify about no arbitrage opportunity
  --   Send({
  --     Target = msg.From,
  --     Action = "NoArbitrageOpportunity",
  --     Data = "No profitable arbitrage opportunity found"
  --   })
  -- end
end

-- Cron handler for automatic scanning
Handlers.add("CronTick",
  Handlers.utils.hasMatchingTag("Action", "Cron"),
  function(msg)
    if not ArbitrageConfig.enabled then return end
    print("Starting automatic scan for arbitrage opportunities...")
    -- Scan for arbitrage opportunities
    scanForArbitrage()
  end
)

-- Get profit history
Handlers.add('ProfitHistory', 'ProfitHistory', function(msg)
  msg.reply({
    Action = 'ProfitHistory-Complete',
    TotalProfit = ArbitrageState.totalProfit,
    History = json.encode(ArbitrageState.profitHistory),
    Data = "Profit history retrieved"
  })
end)

-- Handler to process arbitrage notifications
-- Handlers.add('ArbitrageNotification', 'ArbitrageNotification', function(msg)
--   -- This is to handle notifications from DEX processes or other sources
--   -- about potential arbitrage opportunities
  
--   msg.reply({
--     Action = 'ArbitrageNotification-Received',
--     Data = "Received arbitrage notification"
--   })
  
--   -- Potentially analyze and execute arbitrage based on notification
-- end)