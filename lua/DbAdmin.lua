-- .load-blueprint apm

-- apm.update()

-- apm.install("@rakis/DbAdmin")

DbAdmin = require("@rakis/DbAdmin")

local db = require('lsqlite3').open_memory()
Admin = DbAdmin.new(db)

local Users = {}

-- Create the Users table
Admin:exec([[
  CREATE TABLE IF NOT EXISTS Users (
    Wallet_Address TEXT PRIMARY KEY,
    Process_ID TEXT,
    CreatedAt TEXT
  );
]])

-- Create the Transactions table
Admin:exec([[
    CREATE TABLE IF NOT EXISTS Transactions (
        TX_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Wallet_Address TEXT REFERENCES Users(Wallet_Address),
        PLAN_ID INTEGER REFERENCES Investments(INVESTMENT_ID),
        ExecutedAt TEXT
    );
]])

-- Create the Investments table
Admin:exec([[
  CREATE TABLE IF NOT EXISTS Investments (
    INVESTMENT_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Wallet_Address TEXT REFERENCES Users(Wallet_Address),
    iToken_Address TEXT REFERENCES Tokens(Address),
    oToken_Address TEXT REFERENCES Tokens(Address),
    numberOfTokens FLOAT(10, 2),
    DayOfInvestment INTEGER
  );
]])

-- Create the Tokens table
Admin:exec([[
  CREATE TABLE IF NOT EXISTS Tokens (
    Address TEXT PRIMARY KEY,
    Name TEXT,
    TICKER TEXT
  );
]])

-- Handler to insert a new user
Handlers.add("addUser", "addUser", function(msg)
  Admin:apply('INSERT INTO Users (Wallet_Address, Process_ID, CreatedAt) VALUES (?, ?, ?)', {
    msg.Tags.Wallet_Address,
    msg.Tags.Process_ID,
    os.date("%Y-%m-%d %H:%M:%S"),
  })
  msg.reply({ Data = "You have been registered." })
end
)

Handlers.add("getUser", "getUser", function(msg)
  local results = Admin:select('SELECT * FROM Users WHERE Wallet_Address = ?;', { msg.Tags.Wallet_Address })
  msg.reply({ Data = results })
end
)

-- Handler to get all investment plans
Handlers.add("getInvestmentPlans", "getInvestmentPlans", function(msg)
  local results = Admin:select('SELECT * FROM Investments WHERE Wallet_Address = ?;', { msg.Tags.Wallet_Address })
  msg.reply({ Data = results })
end
)

-- Handler to get a specific investment plan
Handlers.add("getInvestmentPlan", "getInvestmentPlan", function(msg)
  local results = Admin:select('SELECT * FROM Investments WHERE Wallet_Address = ? AND INVESTMENT_ID = ?;', { msg.Tags.Wallet_Address, msg.Tags.INVESTMENT_ID })
  msg.reply({ Data = results })
end
)

-- Handler to get all transactions for a specific investment plan
Handlers.add("getInvestmentTransactions", "getInvestmentTransactions", function(msg)
  local results = Admin:select('SELECT * FROM Transactions WHERE Wallet_Address = ? AND PLAN_ID = ?;', { msg.Tags.Wallet_Address, msg.Tags.INVESTMENT_ID })
  msg.reply({ Data = results })
end
)

-- Handler to save a new transaction
Handlers.add("saveTransaction", "saveTransaction", function(msg)
  Admin:apply(
  'INSERT INTO Transactions (Wallet_Address, PLAN_ID, ExecutedAt) VALUES (?, ?, ?)',
    {
      msg.Tags.Wallet_Address,
      msg.Tags.INVESTMENT_ID,
      os.date("%Y-%m-%d %H:%M:%S")
    })
  msg.reply({ Data = "Transaction has been added." })
end
)

-- Handler to store a new investment
Handlers.add("storeInvestment", "storeInvestment", function(msg)
  Admin:apply("INSERT INTO Investments (Wallet_Address, iToken_Address, oToken_Address, numberOfTokens, DayOfInvestment) VALUES (?, ?, ?, ?, ?)", {
    msg.Tags.Wallet_Address,
    msg.Tags.iToken_Address,
    msg.Tags.oToken_Address,
    msg.Tags.numberOfTokens,
    msg.Tags.DayOfInvestment
  })
  msg.reply({ Data = "Investment has been added." })
end
)

-- Example usage
Admin:apply("INSERT INTO Users (Wallet_Address, Process_ID, CreatedAt) VALUES (?, ?, ?)", {
  "0x1234567890123456789012345678901234567890",
  "1234567890",
  os.date("%Y-%m-%d %H:%M:%S")
})
Admin:apply("INSERT INTO Investments (Wallet_Address, iToken_Address, oToken_Address, numberOfTokens, DayOfInvestment) VALUES (?, ?, ?, ?, ?)", {
  "0x1234567890123456789012345678901234567890",
  "0x1234567890123456789012345678901234567890",
  "0x1234567890123456789012345678901234567890",
  100,
  os.date("%Y-%m-%d %H:%M:%S")
})

Admin:exec("INSERT INTO Investments (Wallet_Address, iToken_Address, oToken_Address, numberOfTokens, DayOfInvestment) VALUES ('xW9OPT4SeRYfIPMVpcibU7C4SevCvxduDKf6y575ic8', '123345aklsdjkfa', '109234ujaksdhfk102938', 5, '10')")