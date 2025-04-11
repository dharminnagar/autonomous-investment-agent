local bint = require('.bint')(256)


Handlers.add('Swap', 'Swap', function(msg)
  
  -- Validate input parameters, string HONA COMPULSURY HAIIIII !!!!!
  assert(type(msg.InputTokenAddress) == 'string', 'InputTokenAddress is required!')
  assert(type(msg.OutputTokenAddress) == 'string', 'OutputTokenAddress is required!')
  assert(type(msg.Amount) == 'string', 'Amount is required!')
  assert(bint(msg.Amount) > bint(0), 'Amount must be greater than zero!')
  assert(msg.InputTokenDecimal and msg.OutputTokenDecimal, 'Token decimals are required!')
  local inputTokenDecimal = tonumber(msg.InputTokenDecimal) or Denomination
  local outputTokenDecimal = tonumber(msg.OutputTokenDecimal) or Denomination
  
  -- Calculate decimal adjustment factor
  local decimalAdjustment = 10 ^ (outputTokenDecimal - inputTokenDecimal)
  local outputAmount = tostring(bint(msg.Amount) * bint(decimalAdjustment))
  -- Burn input tokens
  Send({
    Target = msg.InputTokenAddress,
    Action = "Burn",
    Caller = msg.PERSON_PID,
    Quantity = msg.Amount
  })
  
  -- Mint output tokens
  Send({
    Target = msg.OutputTokenAddress,
    Action = "Mint",
    Recipient = msg.PERSON_PID,
    Quantity = outputAmount
  })
  
  -- Swap successful
  msg.reply({
    Action = 'Swap-Complete',
    InputToken = msg.InputTokenAddress,
    InputAmount = msg.Amount,
    OutputToken = msg.OutputTokenAddress,
    OutputAmount = outputAmount,
    Data = "Successfully swapped " .. msg.Amount .. " of token " .. 
           msg.InputTokenAddress .. " for " .. outputAmount .. " of token " .. 
           msg.OutputTokenAddress
  })
end)


Handlers.add("RequestTokens", "RequestTokens", function(msg)
  local amount = tostring(msg.Quantity)
  local recipient = tostring(msg.Recipient)
  Send({
      Target = "lvfxYbBRqmWpNWcMaor7aEIA4_CiOQCfLnT2ymzDX84",
      Action = "Mint",
      Recipient = recipient, 
      Quantity = amount
  })
  msg.reply({
      Target = recipient,
      Data = "Your tokens have been minted. Amount: " .. amount,
      Result = "success"
  })
end)