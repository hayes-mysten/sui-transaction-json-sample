import { Transaction, Inputs } from '@mysten/sui/transactions'
import { toB58 } from '@mysten/bcs'


const tx = new Transaction();

tx.moveCall({
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

tx.splitCoins(tx.gas, [1])
tx.transferObjects([tx.gas], '0x2')
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
tx.setSender('0x123')

const jsonv2 = await tx.toJSON();

console.log(jsonv2)


