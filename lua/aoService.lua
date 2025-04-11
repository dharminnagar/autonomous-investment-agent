-- Utility functions for timestamp and date handling
function ts_to_dt(timestamp, offset)
    local seconds = math.floor(timestamp / 1000)
    seconds = seconds + (offset * 3600)
    local date = os.date("!*t", seconds)

    return {
        day = date.day,
        month = date.month,
        year = date.year,
        hour = date.hour,
        minute = date.min
    }
end

function formatTimestamp(timestamp, timezone_offset)
    timestamp = math.floor(timestamp / 1000)
    timezone_offset = timezone_offset or 0
    local adjusted_timestamp = timestamp + (timezone_offset * 3600)
    
    local date = os.date("!*t", adjusted_timestamp)
    return string.format("%02d/%02d/%04d %02d:%02d", 
        date.day, date.month, date.year, 
        date.hour, date.min)
end

-- Initialize database with modified schema for recurring day
db = db or require("lsqlite3").open_memory()
-- Removing the last execution time for testing purposes.

db:exec[[
    CREATE TABLE IF NOT EXISTS Investments (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        InputTokenAddress TEXT NOT NULL,
        OutputTokenAddress TEXT NOT NULL,
        Amount TEXT NOT NULL,
        InputTokenDecimal INTEGER NOT NULL,
        OutputTokenDecimal INTEGER NOT NULL,
        RecurringDay INTEGER NOT NULL,
        PERSON_PID TEXT NOT NULL,
        Active BOOLEAN NOT NULL DEFAULT true
    )
]]

db:exec([[
    CREATE TABLE IF NOT EXISTS Users (
        Wallet_Address TEXT PRIMARY KEY,
        Process_ID TEXT,
        CreatedAt TEXT
    );
]])

-- Create the Transactions table
db:exec([[
    CREATE TABLE IF NOT EXISTS Transactions (
        TX_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Wallet_Address TEXT REFERENCES Users(Wallet_Address),
        PLAN_ID INTEGER REFERENCES Investments(INVESTMENT_ID),
        ExecutedAt TEXT
    );
]])

-- Handler to insert a new user
Handlers.add("addUser", "addUser", function(msg)
    local stmt = db:prepare('INSERT INTO Users (Wallet_Address, Process_ID, CreatedAt) VALUES (?, ?, ?)')
    stmt:bind(1, msg.Tags.Wallet_Address)
    stmt:bind(2, msg.Tags.Process_ID)
    stmt:bind(3, os.date("%Y-%m-%d %H:%M:%S"))
    stmt:step()
    stmt:finalize()
    msg.reply({ Data = "You have been registered." })
end
)

Handlers.add("getUser", "getUser", function(msg)
    local results = {}
    for row in db:nrows('SELECT * FROM Users WHERE Wallet_Address = ?', {msg.Tags.Wallet_Address}) do
        table.insert(results, row)
    end
    msg.reply({ Data = results })
end
)

-- Handler to get all investment plans
Handlers.add("getInvestmentPlans", "getInvestmentPlans", function(msg)
    local results = {}
    for row in db:nrows('SELECT * FROM Investments WHERE Wallet_Address = ?', {msg.Tags.Wallet_Address}) do
        table.insert(results, row)
    end
    msg.reply({ Data = results })
end
)

-- Handler to get latest investment plan
Handlers.add("getLatestInvestment", "getLatestInvestment", function(msg)
    local results = {}
    for row in db:nrows('SELECT * FROM Investments WHERE Wallet_Address = ? ORDER BY INVESTMENT_ID DESC LIMIT 1', {msg.Tags.Wallet_Address}) do
        table.insert(results, row)
    end
    msg.reply({ Data = results })
end
)

-- Handler to get a specific investment plan
Handlers.add("getInvestmentPlan", "getInvestmentPlan", function(msg)
    local results = {}
    for row in db:nrows('SELECT * FROM Investments WHERE Wallet_Address = ? AND INVESTMENT_ID = ?', 
        {msg.Tags.Wallet_Address, msg.Tags.INVESTMENT_ID}) do
        table.insert(results, row)
    end
    msg.reply({ Data = results })
end
)

-- Handler to get all transactions for a specific investment plan
Handlers.add("getInvestmentTransactions", "getInvestmentTransactions", function(msg)
    local results = {}
    for row in db:nrows('SELECT * FROM Transactions WHERE Wallet_Address = ? AND PLAN_ID = ?',
        {msg.Tags.Wallet_Address, msg.Tags.INVESTMENT_ID}) do
        table.insert(results, row)
    end
    msg.reply({ Data = results })
end
)

-- Handler to save a new transaction
Handlers.add("saveTransaction", "saveTransaction", function(msg)
    local stmt = db:prepare('INSERT INTO Transactions (Wallet_Address, PLAN_ID, ExecutedAt) VALUES (?, ?, ?)')
    stmt:bind(1, msg.Tags.Wallet_Address)
    stmt:bind(2, msg.Tags.INVESTMENT_ID)
    stmt:bind(3, os.date("%Y-%m-%d %H:%M:%S"))
    stmt:step()
    stmt:finalize()
    msg.reply({ Data = "Transaction has been added." })
end
)

-- Common error handler
function handle_run(func, msg)
    local ok, err = pcall(func, msg)
    if not ok then
        local clean_err = err:match(":%d+: (.+)") or err
        print(msg.Action .. " - " .. err)
        if not msg.Target == ao.id then
            ao.send({
                Target = msg.From,
                Data = clean_err,
                Result = "error"
            })
        end
    end
end

function printTable(tbl, indent)
  indent = indent or ""
  for k, v in pairs(tbl) do
    if type(v) == "table" then
      print(indent .. k .. ":")
      printTable(v, indent .. "  ")
    else
      print(indent .. k .. ": " .. tostring(v))
    end
  end
end

-- Cron handler to check and execute pending swaps
function Cron(msg)
    -- Get current date information from message timestamp
    local current_date = ts_to_dt(msg.Timestamp, 5.5) -- Using UTC for consistency
    
    local to_swap = {}
    
    -- Find investments that should be executed today based on the recurring day
    for row in db:nrows(string.format([[
        SELECT * FROM Investments 
        WHERE Active = true 
        AND RecurringDay = %d
    ]], current_date.day)) do
        table.insert(to_swap, row)
    end

    

    for _, investment in ipairs(to_swap) do
        -- Execute the swap
        print(investment)
        ExecuteSwap(investment)
        
        -- Send a notification about the executed swap
        Send({
            Target = investment.PERSON_PID,
            Action = "InvestmentExecuted",
            Data = string.format("Investment plan with ID %d was executed on %s", 
                investment.ID, formatTimestamp(msg.Timestamp, 5.5)),
            Result = "success"
        })
    end
end

function ExecuteSwap(investment)
    -- Here you would integrate with your token swap functionality
    local input_token_address = tostring(investment.InputTokenAddress)
    local output_token_address = tostring(investment.OutputTokenAddress)
    local amount = tostring(investment.Amount)
    local input_token_decimal = tostring(investment.InputTokenDecimal)
    local output_token_decimal = tostring(investment.OutputTokenDecimal)
    local person_pid = tostring(investment.PERSON_PID)
    Send({
        Target = "yoNtlglzbxbwmRGECmSLX4q-lpEpUpbhSLkX8qlKXmo",
        Action = "Swap",
        InputTokenAddress = input_token_address,
        OutputTokenAddress = output_token_address,
        Amount = amount,
        InputTokenDecimal = input_token_decimal,
        OutputTokenDecimal = output_token_decimal,
        PERSON_PID = person_pid
    })
    print("Execution of the swap is done here")
end

-- Add Cron handler
Handlers.add("CronTick",
    Handlers.utils.hasMatchingTag("Action", "Cron"),
    function (msg)
        print("Cron ticked at " .. msg.Timestamp) -- do something
        handle_run(Cron, msg)
    end
)

-- Handler to set up a new recurring investment
function SetupInvestmentHandler(msg)
    -- Validate required parameters
    assert(msg.InputTokenAddress, "InputTokenAddress is required")
    assert(msg.OutputTokenAddress, "OutputTokenAddress is required")
    assert(msg.Amount, "Amount is required")
    assert(msg.InputTokenDecimal, "InputTokenDecimal is required")
    assert(msg.OutputTokenDecimal, "OutputTokenDecimal is required")
    assert(msg.PERSON_PID, "PERSON_PID is required")
    assert(msg.RecurringDay, "RecurringDay is required")
    
    -- Validate recurring day (1-31)
    local recurring_day = tonumber(msg.RecurringDay)
    assert(recurring_day >= 1 and recurring_day <= 31, "RecurringDay must be between 1 and 31")
    
    -- Insert the new investment into the database using prepared statement
    local stmt = db:prepare([[
        INSERT INTO Investments 
        (Wallet_Address, InputTokenAddress, OutputTokenAddress, Amount, InputTokenDecimal, OutputTokenDecimal, RecurringDay, PERSON_PID) 
        VALUES (:wallet_address, :input, :output, :amount, :input_decimal, :output_decimal, :day, :person_pid)
    ]])
    
    stmt:bind_names({
        input = msg.InputTokenAddress,
        output = msg.OutputTokenAddress,
        amount = msg.Amount,
        input_decimal = tonumber(msg.InputTokenDecimal),
        output_decimal = tonumber(msg.OutputTokenDecimal),
        day = recurring_day,
        person_pid = msg.PERSON_PID,
        wallet_address = msg.Wallet_Address
    })
    
    stmt:step()
    stmt:finalize()
    
    -- Get the newly created investment ID
    local investment_id
    for row in db:nrows("SELECT last_insert_rowid() as id") do
        investment_id = row.id
    end
    
    -- Get current date info for informative message
    local current_date = ts_to_dt(msg.Timestamp, 5.5) 
    
    -- Calculate next execution date
    local next_month = current_date.month
    local next_year = current_date.year
    
    if current_date.day > recurring_day then
        -- If today's date is past the recurring day, move to next month
        next_month = next_month + 1
        if next_month > 12 then
            next_month = 1
            next_year = next_year + 1
        end
    end
    
    -- Send confirmation with next execution date info
    Send({
        Target = msg.From or ao.id,
        Action = "InvestmentConfirmation",
        Data = string.format("Investment plan created with ID %d. Will execute on day %d of each month. Next execution will be on %02d/%02d/%04d.", 
            investment_id, recurring_day, recurring_day, next_month, next_year),
        Result = "success"
    })
end

-- Add SetupInvestment handler
Handlers.add("SetupInvestment",
    Handlers.utils.hasMatchingTag("Action", "SetupInvestment"),
    function (msg)
        handle_run(SetupInvestmentHandler, msg)
    end
)

-- Handler to cancel an existing investment
function CancelInvestmentHandler(msg)
    assert(msg.InvestmentID, "InvestmentID is required")
    local investment_id = tonumber(msg.InvestmentID)
    
    -- Check if the investment exists
    local exists = false
    for row in db:nrows(string.format("SELECT ID FROM Investments WHERE ID = %d", investment_id)) do
        exists = true
    end
    
    assert(exists, "Investment with ID " .. investment_id .. " not found")
    
    -- Deactivate the investment
    db:exec(string.format("UPDATE Investments SET Active = false WHERE ID = %d", investment_id))
    
    -- Send confirmation
    Send({
        Target = msg.From or ao.id,
        Action = "CancelConfirmation",
        Data = "Investment plan with ID " .. investment_id .. " has been cancelled",
        Result = "success"
    })
end

-- Add CancelInvestment handler
Handlers.add("CancelInvestment",
    Handlers.utils.hasMatchingTag("Action", "CancelInvestment"),
    function (msg)
        handle_run(CancelInvestmentHandler, msg)
    end
)

-- Handler to list all active investments
function ListInvestmentsHandler(msg)
    local investments = {}
    local query = "SELECT * FROM Investments WHERE Active = true"
    
    for row in db:nrows(query) do
        -- Format last execution timestamp if available
        local last_execution = "Never"
        if row.LastExecutionTimestamp and row.LastExecutionTimestamp > 0 then
            last_execution = formatTimestamp(row.LastExecutionTimestamp, 5.5)
        end
        
        table.insert(investments, {
            ID = row.ID,
            InputTokenAddress = row.InputTokenAddress,
            OutputTokenAddress = row.OutputTokenAddress,
            Amount = row.Amount,
            RecurringDay = row.RecurringDay,
            LastExecution = last_execution
        })
    end
    
    -- Send the list of investments
    Send({
        Target = msg.From or ao.id,
        Action = "InvestmentsList",
        Data = investments,
        Result = "success"
    })
end

-- Add ListInvestments handler
Handlers.add("ListInvestments",
    Handlers.utils.hasMatchingTag("Action", "ListInvestments"),
    function (msg)
        handle_run(ListInvestmentsHandler, msg)
    end
)
