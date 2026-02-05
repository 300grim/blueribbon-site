RegisterNetEvent('bldr:server:example', function(data)
    local src = source
    print(('[BLDR] Player %s triggered example event'):format(src))
end)
