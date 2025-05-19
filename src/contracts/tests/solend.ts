import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Solend } from '../target/types/solend';
import { 
  TOKEN_PROGRAM_ID, 
  createMint, 
  createAccount,
  mintTo,
  getAccount
} from '@solana/spl-token';
import { assert } from 'chai';

describe('solend', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Solend as Program<Solend>;
  const wallet = provider.wallet;

  let tokenMint: anchor.web3.PublicKey;
  let userTokenAccount: anchor.web3.PublicKey;
  let liquiditySupply: anchor.web3.PublicKey;
  let collateralSupply: anchor.web3.PublicKey;
  let reserve: anchor.web3.PublicKey;
  let userDeposit: anchor.web3.PublicKey;
  let userBorrow: anchor.web3.PublicKey;
  
  const reserveName = "SOL Reserve";
  const collateralFactor = 80; // 80%
  const borrowRate = 5; // 5%
  const depositAmount = 100_000_000; // 100 tokens with 6 decimals
  const borrowAmount = 50_000_000; // 50 tokens

  before(async () => {
    // Create a new token mint
    tokenMint = await createMint(
      provider.connection,
      wallet.payer,
      wallet.publicKey,
      null,
      6 // 6 decimals
    );

    // Create user token account
    userTokenAccount = await createAccount(
      provider.connection,
      wallet.payer,
      tokenMint,
      wallet.publicKey
    );

    // Mint tokens to user
    await mintTo(
      provider.connection,
      wallet.payer,
      tokenMint,
      userTokenAccount,
      wallet.payer,
      1_000_000_000 // 1000 tokens
    );

    // Create reserve PDA
    [reserve] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("reserve"), tokenMint.toBuffer()],
      program.programId
    );

    // Create liquidity supply account
    liquiditySupply = await createAccount(
      provider.connection,
      wallet.payer,
      tokenMint,
      reserve
    );

    // Create collateral supply account
    collateralSupply = await createAccount(
      provider.connection,
      wallet.payer,
      tokenMint,
      reserve
    );

    // Create user deposit PDA
    [userDeposit] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_deposit"), reserve.toBuffer(), wallet.publicKey.toBuffer()],
      program.programId
    );

    // Create user borrow PDA
    [userBorrow] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_borrow"), reserve.toBuffer(), wallet.publicKey.toBuffer()],
      program.programId
    );
  });

  it('Initializes a reserve', async () => {
    await program.methods
      .initializeReserve(collateralFactor, borrowRate, reserveName)
      .accounts({
        reserve,
        owner: wallet.publicKey,
        tokenMint,
        liquiditySupply,
        collateralSupply,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    // Verify reserve account data
    const reserveAccount = await program.account.reserve.fetch(reserve);
    assert.equal(reserveAccount.name, reserveName);
    assert.equal(reserveAccount.collateralFactor, collateralFactor);
    assert.equal(reserveAccount.borrowRate, borrowRate);
    assert.ok(reserveAccount.owner.equals(wallet.publicKey));
    assert.ok(reserveAccount.tokenMint.equals(tokenMint));
    assert.ok(reserveAccount.liquiditySupply.equals(liquiditySupply));
    assert.ok(reserveAccount.collateralSupply.equals(collateralSupply));
  });

  it('Deposits tokens into a reserve', async () => {
    // Get initial token balances
    const userBalanceBefore = (await getAccount(provider.connection, userTokenAccount)).amount;
    const reserveBalanceBefore = (await getAccount(provider.connection, liquiditySupply)).amount;

    // Deposit tokens
    await program.methods
      .deposit(new anchor.BN(depositAmount))
      .accounts({
        reserve,
        reserveLiquidity: liquiditySupply,
        userTokenAccount,
        userDeposit,
        owner: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    // Verify token balances
    const userBalanceAfter = (await getAccount(provider.connection, userTokenAccount)).amount;
    const reserveBalanceAfter = (await getAccount(provider.connection, liquiditySupply)).amount;
    const userDepositAccount = await program.account.userDeposit.fetch(userDeposit);

    assert.equal(
      userBalanceBefore - userBalanceAfter,
      BigInt(depositAmount),
      'User balance should decrease by deposit amount'
    );
    assert.equal(
      reserveBalanceAfter - reserveBalanceBefore,
      BigInt(depositAmount),
      'Reserve balance should increase by deposit amount'
    );
    assert.equal(
      userDepositAccount.depositedAmount.toString(),
      depositAmount.toString(),
      'User deposit record should reflect deposit amount'
    );
  });

  it('Borrows tokens from a reserve', async () => {
    // Get initial token balances
    const userBalanceBefore = (await getAccount(provider.connection, userTokenAccount)).amount;
    const reserveBalanceBefore = (await getAccount(provider.connection, liquiditySupply)).amount;

    // Borrow tokens
    await program.methods
      .borrow(new anchor.BN(borrowAmount))
      .accounts({
        reserve,
        reserveLiquidity: liquiditySupply,
        userTokenAccount,
        userDeposit,
        userBorrow,
        owner: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    // Verify token balances
    const userBalanceAfter = (await getAccount(provider.connection, userTokenAccount)).amount;
    const reserveBalanceAfter = (await getAccount(provider.connection, liquiditySupply)).amount;
    const userBorrowAccount = await program.account.userBorrow.fetch(userBorrow);

    assert.equal(
      userBalanceAfter - userBalanceBefore,
      BigInt(borrowAmount),
      'User balance should increase by borrow amount'
    );
    assert.equal(
      reserveBalanceBefore - reserveBalanceAfter,
      BigInt(borrowAmount),
      'Reserve balance should decrease by borrow amount'
    );
    assert.equal(
      userBorrowAccount.borrowedAmount.toString(),
      borrowAmount.toString(),
      'User borrow record should reflect borrow amount'
    );
  });

  it('Repays borrowed tokens', async () => {
    // Get initial token balances
    const userBalanceBefore = (await getAccount(provider.connection, userTokenAccount)).amount;
    const reserveBalanceBefore = (await getAccount(provider.connection, liquiditySupply)).amount;
    const userBorrowBefore = await program.account.userBorrow.fetch(userBorrow);

    // Amount to repay - half of the borrowed amount
    const repayAmount = borrowAmount / 2;

    // Repay tokens
    await program.methods
      .repay(new anchor.BN(repayAmount))
      .accounts({
        reserve,
        reserveLiquidity: liquiditySupply,
        userTokenAccount,
        userBorrow,
        owner: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    // Verify token balances
    const userBalanceAfter = (await getAccount(provider.connection, userTokenAccount)).amount;
    const reserveBalanceAfter = (await getAccount(provider.connection, liquiditySupply)).amount;
    const userBorrowAfter = await program.account.userBorrow.fetch(userBorrow);

    assert.equal(
      userBalanceBefore - userBalanceAfter,
      BigInt(repayAmount),
      'User balance should decrease by repay amount'
    );
    assert.equal(
      reserveBalanceAfter - reserveBalanceBefore,
      BigInt(repayAmount),
      'Reserve balance should increase by repay amount'
    );
    assert.equal(
      userBorrowBefore.borrowedAmount.toNumber() - userBorrowAfter.borrowedAmount.toNumber(),
      repayAmount,
      'User borrow record should be reduced by repay amount'
    );
  });

  it('Withdraws deposited tokens', async () => {
    // Get initial token balances
    const userBalanceBefore = (await getAccount(provider.connection, userTokenAccount)).amount;
    const reserveBalanceBefore = (await getAccount(provider.connection, liquiditySupply)).amount;
    const userDepositBefore = await program.account.userDeposit.fetch(userDeposit);

    // Amount to withdraw - half of the deposit
    const withdrawAmount = depositAmount / 2;

    // Withdraw tokens
    await program.methods
      .withdraw(new anchor.BN(withdrawAmount))
      .accounts({
        reserve,
        reserveLiquidity: liquiditySupply,
        userTokenAccount,
        userDeposit,
        owner: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    // Verify token balances
    const userBalanceAfter = (await getAccount(provider.connection, userTokenAccount)).amount;
    const reserveBalanceAfter = (await getAccount(provider.connection, liquiditySupply)).amount;
    const userDepositAfter = await program.account.userDeposit.fetch(userDeposit);

    assert.equal(
      userBalanceAfter - userBalanceBefore,
      BigInt(withdrawAmount),
      'User balance should increase by withdraw amount'
    );
    assert.equal(
      reserveBalanceBefore - reserveBalanceAfter,
      BigInt(withdrawAmount),
      'Reserve balance should decrease by withdraw amount'
    );
    assert.equal(
      userDepositBefore.depositedAmount.toNumber() - userDepositAfter.depositedAmount.toNumber(),
      withdrawAmount,
      'User deposit record should be reduced by withdraw amount'
    );
  });
});