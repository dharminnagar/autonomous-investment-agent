Handlers.add("TransferFunds", "TransferFunds", function(msg)

    Send({
        Target=msg.TokenId,
        Action="Transfer",
        Recipient= msg.Recipient,
        Quantity=msg.Quantity,
        OriginalSender=msg.OriginalSender
    })
    msg.reply({
        Action="Transfer_Executed",
        Data="Transfer execution was done."
    })
end)