use anchor_lang::prelude::*;

declare_id!("22v3VAtU3BhYvmQwDsypAmjVeyWDR6RbdUnsCTwgdLNA");

#[program]
pub mod tip_jar {
    use super::*;

    /// Initialize a new Tip Jar owned by `owner`
    pub fn initialize_tip_jar(ctx: Context<InitializeTipJar>, owner: Pubkey) -> Result<()> {
        let tip_jar = &mut ctx.accounts.tip_jar;
        tip_jar.owner = owner;
        tip_jar.total_tips = 0;

        emit!(TipJarInitialized {
            tip_jar: tip_jar.key(),
            owner,
        });
        Ok(())
    }

    /// Accept lamports from any user; funds held in this account
    pub fn tip(ctx: Context<Tip>, amount: u64) -> Result<()> {
        // Security: User must send correct lamports
        require!(amount > 0, TipJarError::ZeroTipNotAllowed);

        // Transfer lamports from tipper to tip jar PDA
        let tipper = ctx.accounts.tipper.to_account_info();
        let tip_jar_account = ctx.accounts.tip_jar.to_account_info();
        let system_program = ctx.accounts.system_program.to_account_info();

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &tipper.key,
            &tip_jar_account.key,
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                tipper.clone(),
                tip_jar_account.clone(),
                system_program.clone(),
            ],
        )?;

        ctx.accounts.tip_jar.total_tips = ctx
            .accounts
            .tip_jar
            .total_tips
            .checked_add(amount)
            .ok_or(TipJarError::Overflow)?;

        emit!(Tipped {
            tip_jar: ctx.accounts.tip_jar.key(),
            from: ctx.accounts.tipper.key(), // <-- FIXED HERE!
            amount,
        });

        Ok(())
    }

    /// Withdraw all lamports to a destination — only owner may call
    pub fn withdraw(ctx: Context<Withdraw>, destination: Pubkey) -> Result<()> {
        // Take a copy of account infos for lamports operations
        let tip_jar_account_info = ctx.accounts.tip_jar.to_account_info();
        let destination_account_info = ctx.accounts.destination.to_account_info();

        // Copy owner Pubkey from TipJar before mutably borrowing
        let tip_jar_owner = ctx.accounts.tip_jar.owner;

        // Get the current balance
        let amount = **tip_jar_account_info.lamports.borrow();

        require!(
            tip_jar_owner == ctx.accounts.owner.key(),
            TipJarError::Unauthorized
        );
        require!(amount > 0, TipJarError::NothingToWithdraw);

        // Do the lamports transfer directly between accounts (avoiding mutably borrowing tip_jar struct itself)
        **tip_jar_account_info.lamports.borrow_mut() -= amount;
        **destination_account_info.lamports.borrow_mut() += amount;

        emit!(Withdrawn {
            tip_jar: ctx.accounts.tip_jar.key(),
            owner: ctx.accounts.owner.key(),
            destination,
            amount,
        });

        Ok(())
    }

}

#[derive(Accounts)]
pub struct InitializeTipJar<'info> {
    #[account(init, payer = payer, space = 8 + TipJar::LEN)]
    pub tip_jar: Account<'info, TipJar>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Tip<'info> {
    #[account(mut)]
    pub tip_jar: Account<'info, TipJar>,
    #[account(signer)]
    pub tipper: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, has_one = owner)]
    pub tip_jar: Account<'info, TipJar>,
    pub owner: Signer<'info>,
    #[account(mut)]
    /// CHECK: Only owner may withdraw to any destination pubkey
    pub destination: AccountInfo<'info>,
}

#[account]
pub struct TipJar {
    pub owner: Pubkey,
    pub total_tips: u64,
}

impl TipJar {
    pub const LEN: usize = 32 + 8;
}

#[error_code]
pub enum TipJarError {
    #[msg("Zero tip not allowed")]
    ZeroTipNotAllowed,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Only the owner can withdraw")]
    Unauthorized,
    #[msg("Nothing to withdraw")]
    NothingToWithdraw,
}

/// ----
/// Events
/// ----

#[event]
pub struct TipJarInitialized {
    pub tip_jar: Pubkey,
    pub owner: Pubkey,
}

#[event]
pub struct Tipped {
    pub tip_jar: Pubkey,
    pub from: Pubkey,
    pub amount: u64,
}

#[event]
pub struct Withdrawn {
    pub tip_jar: Pubkey,
    pub owner: Pubkey,
    pub destination: Pubkey,
    pub amount: u64,
}
