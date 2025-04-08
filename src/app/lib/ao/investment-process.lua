-- Investment Process
-- This process handles automated investment scheduling and execution

-- State initialization
if not Handlers.state then
  Handlers.state = {
    plans = {},
    transactions = {},
    portfolios = {}
  }
end

-- Helper function to generate unique IDs
local function generateId()
  return ao.id:sub(1, 8) .. "-" .. os.time()
end

-- Helper function to calculate next execution time based on interval
local function calculateNextExecution(startDate, interval)
  local timestamp = os.time(os.date("!*t", startDate))
  local now = os.time()
  
  if interval == "daily" then
    return timestamp + (86400 * 1) -- 1 day in seconds
  elseif interval == "weekly" then
    return timestamp + (86400 * 7) -- 7 days in seconds
  elseif interval == "monthly" then
    return timestamp + (86400 * 30) -- ~30 days in seconds
  end
end

-- Handler for creating a new investment plan
Handlers.add("createInvestmentPlan", function(msg)
  local plan = msg.data
  plan.id = generateId()
  plan.nextExecution = calculateNextExecution(os.time(os.date("!*t", plan.startDate)), plan.interval)
  plan.status = "active"
  
  Handlers.state.plans[plan.id] = plan
  
  return { id = plan.id }
end)

-- Handler for getting investment plans for a wallet
Handlers.add("getInvestmentPlans", function(msg)
  local walletAddress = msg.data.walletAddress
  local plans = {}
  
  for _, plan in pairs(Handlers.state.plans) do
    if plan.walletAddress == walletAddress then
      table.insert(plans, plan)
    end
  end
  
  return { data = plans }
end)

-- Handler for executing an investment
Handlers.add("executeInvestment", function(msg)
  local planId = msg.data.planId
  local plan = Handlers.state.plans[planId]
  
  if not plan then
    return { error = "Plan not found" }
  end
  
  -- Create transaction record
  local tx = {
    id = generateId(),
    planId = planId,
    type = "buy",
    token = plan.token,
    amount = plan.amount,
    walletAddress = plan.walletAddress,
    timestamp = os.time(),
    status = "completed"
  }
  
  -- Update portfolio
  local portfolio = Handlers.state.portfolios[plan.walletAddress] or {
    totalInvested = 0,
    investments = {}
  }
  
  portfolio.totalInvested = portfolio.totalInvested + plan.amount
  table.insert(portfolio.investments, {
    token = plan.token,
    amount = plan.amount,
    timestamp = os.time()
  })
  
  -- Store transaction and portfolio updates
  Handlers.state.transactions[tx.id] = tx
  Handlers.state.portfolios[plan.walletAddress] = portfolio
  
  -- Update next execution time
  plan.nextExecution = calculateNextExecution(os.time(), plan.interval)
  Handlers.state.plans[planId] = plan
  
  return { id = tx.id }
end)

-- Handler for getting transaction history
Handlers.add("getTransactionHistory", function(msg)
  local walletAddress = msg.data.walletAddress
  local transactions = {}
  
  for _, tx in pairs(Handlers.state.transactions) do
    if tx.walletAddress == walletAddress then
      table.insert(transactions, tx)
    end
  end
  
  return { data = transactions }
end)

-- Handler for getting portfolio value
Handlers.add("getPortfolioValue", function(msg)
  local walletAddress = msg.data.walletAddress
  local portfolio = Handlers.state.portfolios[walletAddress]
  
  if not portfolio then
    return {
      data = {
        totalValue = 0,
        totalInvested = 0,
        profitLoss = 0,
        profitLossPercentage = 0,
        investments = {}
      }
    }
  end
  
  -- In a real implementation, we would fetch current token prices
  -- For now, we'll simulate a 10% increase in value
  local totalValue = portfolio.totalInvested * 1.1
  local profitLoss = totalValue - portfolio.totalInvested
  local profitLossPercentage = (profitLoss / portfolio.totalInvested) * 100
  
  return {
    data = {
      totalValue = totalValue,
      totalInvested = portfolio.totalInvested,
      profitLoss = profitLoss,
      profitLossPercentage = profitLossPercentage,
      investments = portfolio.investments
    }
  }
end)

-- Scheduler to check and execute investments
Scheduler.add("checkInvestments", function()
  local now = os.time()
  
  for planId, plan in pairs(Handlers.state.plans) do
    if plan.status == "active" and plan.nextExecution <= now then
      -- Execute investment
      ao.send({
        action = "executeInvestment",
        data = { planId = planId }
      })
    end
  end
end, 60) -- Run every minute 