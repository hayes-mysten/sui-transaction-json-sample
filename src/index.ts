import { Transaction, Inputs, coinWithBalance } from '@mysten/sui/transactions'
import { requestSuiFromFaucetV0, getFaucetHost } from '@mysten/sui/faucet'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { toB58 } from '@mysten/bcs'
import { promises } from 'fs'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography'

const client = new SuiClient({ url: getFullnodeUrl('devnet') })
const sender = Ed25519Keypair.fromSecretKey(decodeSuiPrivateKey('suiprivkey1qpakl9hglralt2qml5yzy90mq9mrv2vfld8hxpwllmgl4nwdttkcsqgjer8').secretKey);

await requestSuiFromFaucetV0({ host: getFaucetHost('devnet'), recipient: sender.toSuiAddress() })

const tx = new Transaction();

const result = tx.moveCall({
    target: '0x2::foo::bar',
    arguments: [
        tx.object('0x123'),
        tx.object(
            Inputs.ReceivingRef({
                objectId: '1',
                version: '123',
                digest: toB58(new Uint8Array(32).fill(0x1)),
            }),
        ),
        tx.object(
            Inputs.SharedObjectRef({
                objectId: '2',
                mutable: true,
                initialSharedVersion: '123',
            }),
        ),
        tx.object(
            Inputs.ObjectRef({
                objectId: '3',
                version: '123',
                digest: toB58(new Uint8Array(32).fill(0x1)),
            }),
        ),
        tx.pure.address('0x2'),
    ],
});



const [coin] = tx.splitCoins(tx.gas, [1])
tx.transferObjects([coin, result], '0x2')
tx.makeMoveVec({
    elements: [
        tx.object('4')
    ],
    type: '0x123::foo::Bar'
})

tx.upgrade({
    modules: [[1, 2, 3]],
    dependencies: [],
    package: '0x123',
    ticket: tx.object('5'),
})

tx.publish({
    modules: [[1, 2, 3]],
    dependencies: []
})

tx.setGasBudget(10_000_000)
tx.setSender(sender.toSuiAddress())

const jsonv2 = await tx.toJSON();

await promises.writeFile('sample.json', jsonv2)


const withIntent = new Transaction();
withIntent.setSender(sender.toSuiAddress())
withIntent.transferObjects([coinWithBalance({ balance: 100n})], sender.toSuiAddress())

const unresolvedJSON = await withIntent.toJSON({ supportedIntents: ['CoinWithBalance'] })

await promises.writeFile('unresolved-intent.json', unresolvedJSON)

const resolvedJSON = await withIntent.toJSON({ client, supportedIntents: [] })

await promises.writeFile('resolved-intent.json', resolvedJSON)




