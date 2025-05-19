use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solend {
    use super::*;

    pub fn initialize_reserve(
        ctx: Context<InitializeReserve>,
        collateral_factor: u8,
        borrow_rate: u8,
        reserve_name: String,
    ) -> Result<()> {
        let reserve = &mut ctx.accounts.reserve;
        reserve.collateral_factor = collateral_factor;
        reserve.borrow_rate = borrow_rate;
        reserve.name = reserve_name;
        reserve.owner = ctx.accounts.owner.key();
        reserve.liquidity_supply = ctx.accounts.liquidity_supply.key();
        reserve.collateral_supply = ctx.accounts.collateral_supply.key();
        reserve.token_mint = ctx.accounts.token_mint.key();
        reserve.bump = *ctx.bumps.get("reserve").unwrap();

        Ok(())
    }

    pub fn deposit(
        ctx: Context<Deposit>,
        amount: u64,
    ) -> Result<()> {
        // Transfer tokens from user to reserve
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.reserve_liquidity.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        // Update user deposit for tracking
        let user_deposit = &mut ctx.accounts.user_deposit;
        user_deposit.owner = ctx.accounts.owner.key();
        user_deposit.reserve = ctx.accounts.reserve.key();
        user_deposit.deposited_amount += amount;
        
        // In a real implementation:
        // 1. Mint equivalent collateral tokens to user
        // 2. Calculate interest accrued since last update
        // 3. Update global state variables

        Ok(())
    }

    pub fn withdraw(
        ctx: Context<Withdraw>,
        amount: u64,
    ) -> Result<()> {
        let user_deposit = &mut ctx.accounts.user_deposit;
        require!(user_deposit.deposited_amount >= amount, ErrorCode::InsufficientFunds);
        
        // In a real implementation:
        // 1. Check that withdrawal doesn't violate health factor
        // 2. Burn collateral tokens from user
        // 3. Update interest rates
        
        // Transfer tokens from reserve to user
        let seeds = &[
            b"reserve".as_ref(),
            ctx.accounts.reserve.token_mint.as_ref(),
            &[ctx.accounts.reserve.bump],
        ];
        let signer = &[&seeds[..]];
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.reserve_liquidity.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.reserve.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_ctx, amount)?;

        // Update user deposit record
        user_deposit.deposited_amount -= amount;

        Ok(())
    }

    pub fn borrow(
        ctx: Context<Borrow>,
        amount: u64,
    ) -> Result<()> {
        // Check collateral and calculate borrow limit
        let user_deposit = &ctx.accounts.user_deposit;
        let reserve = &ctx.accounts.reserve;
        
        // Simple borrow limit calculation (would be more complex in production)
        let borrow_limit = user_deposit.deposited_amount
            .checked_mul(reserve.collateral_factor as u64)
            .unwrap()
            .checked_div(100)
            .unwrap();
            
        // Check if user has enough collateral
        let user_borrow = &mut ctx.accounts.user_borrow;
        let new_borrow_amount = user_borrow.borrowed_amount.checked_add(amount).unwrap();
        require!(new_borrow_amount <= borrow_limit, ErrorCode::InsufficientCollateral);
        
        // Transfer tokens from reserve to user
        let seeds = &[
            b"reserve".as_ref(),
            reserve.token_mint.as_ref(),
            &[reserve.bump],
        ];
        let signer = &[&seeds[..]];
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.reserve_liquidity.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: reserve.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_ctx, amount)?;
        
        // Update borrow record
        user_borrow.borrowed_amount = new_borrow_amount;
        user_borrow.owner = ctx.accounts.owner.key();
        user_borrow.reserve = reserve.key();
        
        // In a real implementation:
        // 1. Update borrow interest index
        // 2. Recalculate health factor
        // 3. Emit borrow event

        Ok(())
    }

    pub fn repay(
        ctx: Context<Repay>,
        amount: u64,
    ) -> Result<()> {
        let user_borrow = &mut ctx.accounts.user_borrow;
        
        // In a real implementation, calculate accrued interest first
        require!(user_borrow.borrowed_amount >= amount, ErrorCode::ExcessiveRepayment);
        
        // Transfer tokens from user to reserve
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.reserve_liquidity.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;
        
        // Update borrow record
        user_borrow.borrowed_amount -= amount;
        
        // In a real implementation:
        // 1. Update interest rate model
        // 2. Recalculate health factor
        // 3. Emit repay event

        Ok(())
    }

    // Additional functions for liquidation would be implemented here
}

#[derive(Accounts)]
pub struct InitializeReserve<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + Reserve::LEN,
        seeds = [b"reserve", token_mint.key().as_ref()],
        bump
    )]
    pub reserve: Account<'info, Reserve>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub token_mint: Account<'info, token::Mint>,
    
    pub liquidity_supply: Account<'info, TokenAccount>,
    
    pub collateral_supply: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    
    pub token_program: Program<'info, Token>,
    
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub reserve: Account<'info, Reserve>,
    
    #[account(
        mut,
        constraint = reserve_liquidity.owner == reserve.key() @ ErrorCode::InvalidReserveAccount
    )]
    pub reserve_liquidity: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = owner,
        space = 8 + UserDeposit::LEN,
        seeds = [b"user_deposit", reserve.key().as_ref(), owner.key().as_ref()],
        bump
    )]
    pub user_deposit: Account<'info, UserDeposit>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    
    pub token_program: Program<'info, Token>,
    
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub reserve: Account<'info, Reserve>,
    
    #[account(
        mut,
        constraint = reserve_liquidity.owner == reserve.key() @ ErrorCode::InvalidReserveAccount
    )]
    pub reserve_liquidity: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"user_deposit", reserve.key().as_ref(), owner.key().as_ref()],
        bump,
        constraint = user_deposit.owner == owner.key() @ ErrorCode::InvalidOwner
    )]
    pub user_deposit: Account<'info, UserDeposit>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut)]
    pub reserve: Account<'info, Reserve>,
    
    #[account(
        mut,
        constraint = reserve_liquidity.owner == reserve.key() @ ErrorCode::InvalidReserveAccount
    )]
    pub reserve_liquidity: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        seeds = [b"user_deposit", reserve.key().as_ref(), owner.key().as_ref()],
        bump,
        constraint = user_deposit.owner == owner.key() @ ErrorCode::InvalidOwner
    )]
    pub user_deposit: Account<'info, UserDeposit>,
    
    #[account(
        init_if_needed,
        payer = owner,
        space = 8 + UserBorrow::LEN,
        seeds = [b"user_borrow", reserve.key().as_ref(), owner.key().as_ref()],
        bump
    )]
    pub user_borrow: Account<'info, UserBorrow>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    
    pub token_program: Program<'info, Token>,
    
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)]
    pub reserve: Account<'info, Reserve>,
    
    #[account(
        mut,
        constraint = reserve_liquidity.owner == reserve.key() @ ErrorCode::InvalidReserveAccount
    )]
    pub reserve_liquidity: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"user_borrow", reserve.key().as_ref(), owner.key().as_ref()],
        bump,
        constraint = user_borrow.owner == owner.key() @ ErrorCode::InvalidOwner
    )]
    pub user_borrow: Account<'info, UserBorrow>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Reserve {
    pub owner: Pubkey,
    pub token_mint: Pubkey,
    pub liquidity_supply: Pubkey,
    pub collateral_supply: Pubkey,
    pub name: String,
    pub collateral_factor: u8,
    pub borrow_rate: u8,
    pub bump: u8,
}

impl Reserve {
    pub const LEN: usize = 32 + 32 + 32 + 32 + 32 + 1 + 1 + 1;
}

#[account]
pub struct UserDeposit {
    pub owner: Pubkey,
    pub reserve: Pubkey,
    pub deposited_amount: u64,
}

impl UserDeposit {
    pub const LEN: usize = 32 + 32 + 8;
}

#[account]
pub struct UserBorrow {
    pub owner: Pubkey,
    pub reserve: Pubkey,
    pub borrowed_amount: u64,
}

impl UserBorrow {
    pub const LEN: usize = 32 + 32 + 8;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid reserve account")]
    InvalidReserveAccount,
    
    #[msg("Invalid owner")]
    InvalidOwner,
    
    #[msg("Insufficient funds for withdrawal")]
    InsufficientFunds,
    
    #[msg("Insufficient collateral for borrow")]
    InsufficientCollateral,
    
    #[msg("Repayment amount exceeds borrowed amount")]
    ExcessiveRepayment,
}