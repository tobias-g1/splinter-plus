export interface ForSaleListing {
    fee_percent: number;
    uid: string;
    seller: string;
    card_detail_id: number;
    xp: number;
    gold: boolean;
    edition: number;
    buy_price: string;
    currency: string;
    desc: null;
    type: string;
    rental_type: null;
    market_id: string;
    last_transferred_block: number;
    last_transferred_date: string;
    last_used_block: null;
    last_used_date: null;
    last_used_player: null;
    expiration_date: string;
    price_per_base_xp: number;
}

export interface Settings {
    asset_url: string
    gold_percent: number
    starter_pack_price: number
    booster_pack_price: number
    market_fee: number
    list_fee_per_listing: number
    list_expire_in_days: number
    num_editions: number
    modern_num_editions: number
    core_editions: number[]
    starter_editions: number[]
    soulbound_editions: number[]
    event_creation_whitelist: string[]
    ghost_creation_whitelist: string[]
    bat_event_list: BatEventList[]
    event_entry_fee_required: number
    max_event_entrants: number
    tournaments_creation_fee_dec: number
    account: string
    stats: boolean
    rarity_pcts: number[]
    xp_levels: number[][]
    alpha_xp: number[]
    gold_xp: number[]
    beta_xp: number[]
    beta_gold_xp: number[]
    combine_rates: number[][]
    combine_rates_gold: number[][]
    battles: Battles
    energy: Energy
    multi_lb_start_season: number
    leaderboard_prizes: LeaderboardPrizes
    leagues: Leagues
    dec: Dec
    guilds: Guilds
    barracks_perks: BarracksPerk[][]
    frays: Fray[][]
    supported_currencies: SupportedCurrency[]
    tournament_prize_types: TournamentPrizeTypes
    transfer_cooldown_blocks: number
    untamed_edition_date: string
    active_auth_ops: string[]
    banned_domains: string[]
    version: string
    config_version: number
    land_sale: LandSale
    chaos_legion: ChaosLegion
    riftwatchers: Riftwatchers
    tower_defense: TowerDefense
    runi: Runi
    potions: Potion[]
    promotions: string[]
    sps: Sps
    battles_disabled: number
    blocks_are_behind: boolean
    process_land_blocks: boolean
    dec_batteries: DecBatteries
    market_rental: MarketRental
    loot_chests: LootChests
    conversion_rate: ConversionRate
    reward_pools: RewardPools
    daily_quests: DailyQuest[]
    recaptcha_site_key: string
    fractional_tokens: string[]
    transferrable_tokens: string[]
    cl_end_of_sale: ClEndOfSale
    promo_sale_page: PromoSalePage
    delegation_cooldown: number
    rpc_nodes: string[]
    dec_price: number
    sps_price: number
    maintenance_mode: boolean
    season: Season2
    next_season_end: string
    previous_season: PreviousSeason
    brawl_cycle: BrawlCycle
    guild_store_items: GuildStoreItem[]
    last_block: number
    timestamp: number
    chain_props: ChainProps
    circle_payments_enabled: number
    transak_payments_enabled: number
    zendesk_enabled: number
    dec_max_buy_amount: number
    sps_max_buy_amount: number
    show_special_store: boolean
    paypal_acct: string
    paypal_merchant_id: string
    paypal_client_id: string
    paypal_sandbox: boolean
    ssc: Ssc
    card_holding_accounts: CardHoldingAccount[]
    bridge: Bridge
    ethereum: Ethereum2
    wax: Wax
    sps_airdrop: SpsAirdrop
    api_ops: string[]
    card_image_url: string
    template_caching: boolean
}

export interface SettingsWithIndexSignature extends Settings {
    [key: string]: any;
}

export interface BatEventList {
    id: string
    bat: number
}

export interface Battles {
    asset_url: string
    default_expiration_seconds: number
    reveal_blocks: number
    win_streak_wins: number
    rulesets: Ruleset[]
    min_level_requirement: number[][]
    min_battles_for_reset: number
}

export interface Ruleset {
    active: boolean
    name: string
    description: string
    weight: number
    type?: string
    invalidTypes?: string[]
    invalid?: string[]
    invalidTournaments?: InvalidTournaments
}

export interface InvalidTournaments {
    singleEdition?: boolean
    editionCombinations: number[][]
    setCombinations: number[][]
}

export interface Energy {
    hourly_regen_rate: number
    conversion_rates_by_league_group: ConversionRatesByLeagueGroup
    max_energy: number
}

export interface ConversionRatesByLeagueGroup {
    DEC: number[]
    "DEC-B": number[]
    CREDITS: number[]
}

export interface LeaderboardPrizes {
    wild: Wild
    modern: Modern
}

export interface Wild {
    Novice: any[]
    Bronze: number[]
    Silver: number[]
    Gold: number[]
    Diamond: number[]
    Champion: number[]
}

export interface Modern {
    Novice: any[]
    Bronze: number[]
    Silver: number[]
    Gold: number[]
    Diamond: number[]
    Champion: number[]
}

export interface Leagues {
    wild: Wild2[]
    modern: Modern2[]
}

export interface Wild2 {
    name: string
    group: string
    league_limit: number
    level: number
    min_rating: number
    min_power: number
    season_rating_reset?: number
}

export interface Modern2 {
    name: string
    group: string
    league_limit: number
    level: number
    min_rating: number
    min_power: number
    season_rating_reset?: number
}

export interface Dec {
    gold_bonus: number
    curve_constant: number
    gold_burn_bonus_2: number
    ecr_reduction_rate: number[][]
    start_block: number
    reduction_blocks: number
    reduction_pct: number
    pool_size_blocks: number
    ecr_regen_rate: number
    alpha_bonus: number
    streak_bonus: number
    streak_bonus_max: number
    burn_rate: number[]
    untamed_burn_rate: number[]
    alpha_burn_bonus: number
    promo_burn_bonus: number
    gold_burn_bonus: number
    max_burn_bonus: number
    orbs_available: number
    orb_cost: number
    dice_available: number
    dice_cost: number
    mystery_potion_blocks: number
    pool_cut_pct: number
    prize_pool_account: string
    eth_withdrawal_fee: number
    tokens_per_block: number
    curve_reduction: number
    beta_bonus: number
}

export interface Guilds {
    brawl_combat_duration: number
    barracks: Barracks
    brawl_prep_duration: number
    max_brawl_size: number
    merit_constant: number
    merit_multiplier: number[]
    quest_lodge: QuestLodge
    guild_hall: GuildHall
    rank_names: string[]
    shop_discount_pct: number[]
    current_fray_edition: number
    dec_bonus_pct: number[]
    creation_fee: number
    brawl_maintenance_delay: number
    sps_full_rewards_min_guilds: number
    sps_reward_decay: number
    sps_decay_day_of_month: number
    arena: Arena
    crown_multiplier: number[]
    sps_tier_pct: number[]
    crown_split_pct: number[]
    guild_shop: GuildShop
    brawl_staggered_start_interval: number
    brawl_cycle_end_offset: number
    brawl_results_duration: number
}

export interface Barracks {
    cost: Cost[]
}

export interface Cost {
    symbol: string
    levels: number[]
}

export interface QuestLodge {
    symbol: string
    levels: number[]
}

export interface GuildHall {
    symbol: string
    levels: number[]
    member_limit: number[]
}

export interface Arena {
    cost: Cost2[]
}

export interface Cost2 {
    symbol: string
    levels: number[]
}

export interface GuildShop {
    cost: Cost3[]
}

export interface Cost3 {
    symbol: string
    levels: number[]
}

export interface BarracksPerk {
    bonus?: string
    delta?: number
    stat?: string
    target?: string
}

export interface Fray {
    sets: Set[]
    foil: string
    rating_level: number
}

export interface Set {
    core: any
    editions: any[]
}

export interface SupportedCurrency {
    name?: string
    currency: string
    type: string
    tournament_enabled: boolean
    payment_enabled?: boolean
    usd_value?: number
    precision?: number
    contract_address?: string
    networks?: Networks
    payment_address?: string
    token_id?: string
    asset_name?: string
    symbol?: string
}

export interface Networks {
    eth: string
    bsc: string
}

export interface TournamentPrizeTypes {
    PLOT: Plot
    TOTEML: Toteml
    TOTEME: Toteme
    TOTEMR: Totemr
    TOTEMC: Totemc
    ALPHA: Alpha
    BETA: Beta
    UNTAMED: Untamed
    ORB: Orb
    DICE: Dice
    CHAOS: Chaos
    NIGHTMARE: Nightmare
    RIFT: Rift
}

export interface Plot {
    name: string
    image_filename: string
}

export interface Toteml {
    name: string
    image_filename: string
}

export interface Toteme {
    name: string
    image_filename: string
}

export interface Totemr {
    name: string
    image_filename: string
}

export interface Totemc {
    name: string
    image_filename: string
}

export interface Alpha {
    name: string
    image_filename: string
}

export interface Beta {
    name: string
    image_filename: string
}

export interface Untamed {
    name: string
    image_filename: string
}

export interface Orb {
    name: string
    image_filename: string
}

export interface Dice {
    name: string
    image_filename: string
}

export interface Chaos {
    name: string
    image_filename: string
}

export interface Nightmare {
    name: string
    image_filename: string
}

export interface Rift {
    name: string
    image_filename: string
}

export interface LandSale {
    plot_price: number
    tract_price: number
    region_price: number
    plots_available: number
    plot_plots: number
    tract_plots: number
    region_plots: number
    start_date: string
}

export interface ChaosLegion {
    main_sale_start: string
    pack_price: number
    sale3_start: string
    sale2_end: string
    voucher_drop_rate: number
    voucher_drop_start: string
    pre_sale_end: string
    voucher_drop_duration: number
    pre_sale_start: string
    airdrops: Airdrop[]
}

export interface Airdrop {
    name: string
    id: number
    chance: number
    gold_guarantee?: number
    claim_date: string
    gold_chance?: number
}

export interface Riftwatchers {
    main_sale_start: string
    presale_sale_start: string
    pack_price: number
    airdrops: Airdrop2[]
}

export interface Airdrop2 {
    name: string
    id: number
    chance: number
    gold_chance: number
    gold_guarantee?: number
    claim_date: string
}

export interface TowerDefense {
    presale_sale_start: string
    general_sale_pack_price: number
    general_sale_start: string
    general_sale_voucher_discount: number
    presale_pack_price: number
}

export interface Runi {
    general_summon_start: string
    runi_summon_start: string
    runi_summon_end: string
    is_runi_enabled: number
    whitelist_sale_start: string
}

export interface Potion {
    id: string
    name: string
    item_id: number
    price_per_charge: number
    value: number
    bonuses: Bonuse[]
}

export interface Bonuse {
    min: number
    bonus_pct: number
}

export interface Sps {
    staking_rewards_voucher_acc_tokens_per_share: number
    staking_rewards_last_reward_block: number
    staking_rewards: StakingRewards
    staking_rewards_voucher_last_reward_block: number
    unstaking_interval_seconds: number
    staking_rewards_voucher: StakingRewardsVoucher
    staking_rewards_acc_tokens_per_share: number
    unstaking_periods: number
}

export interface StakingRewards {
    tokens_per_block: number
    reduction_blocks: number
    reduction_pct: number
    start_block: number
}

export interface StakingRewardsVoucher {
    tokens_per_block: number
    start_block: number
}

export interface DecBatteries {
    sale_start: string
    conversion_rates: ConversionRates
    sale_end: string
}

export interface ConversionRates {
    DEC: number
    "VOUCHER-G": number
}

export interface MarketRental {
    minimum_rental_days: number
    maximum_rental_days: number
}

export interface LootChests {
    quest: Quest[]
    season: Season[]
    boosts: Boosts
}

export interface Quest {
    base: number
    step_multiplier: number
    max: number
}

export interface Season {
    base: number
    step_multiplier: number
    max: number
}

export interface Boosts {
    bronze: Bronze
    silver: Silver
    gold: Gold
    diamond: Diamond
    champion: Champion
}

export interface Bronze {
    rarity_boost: number
    token_multiplier: number
}

export interface Silver {
    rarity_boost: number
    token_multiplier: number
}

export interface Gold {
    rarity_boost: number
    token_multiplier: number
}

export interface Diamond {
    rarity_boost: number
    token_multiplier: number
}

export interface Champion {
    rarity_boost: number
    token_multiplier: number
}

export interface ConversionRate {
    sps_dec: number
}

export interface RewardPools {
    claim_limit: number
    claim_limit_time: number
}

export interface DailyQuest {
    name: string
    active: boolean
    objective_type: string
    min_rating: number
    data: Data
}

export interface Data {
    color?: string
    action: string
    splinter?: string
    value: string
    bonus: number[]
    description: string
    abilities?: string[]
}

export interface ClEndOfSale {
    is_enabled: number
    start_date_time: string
}

export interface PromoSalePage {
    type: string
    shop_config_name: string
    hide_date: string
    show_date: string
}

export interface Season2 {
    id: number
    name: string
    ends: string
    reward_packs: string[]
    reset_block_num: any
}

export interface PreviousSeason {
    id: number
    name: string
    ends: string
    reward_packs: string[]
    reset_block_num: number
}

export interface BrawlCycle {
    id: number
    name: string
    start: string
    status: number
    reset_block_num: any
    end: string
}

export interface GuildStoreItem {
    name: string
    short_desc: string
    unlock_level: number
    cost: Cost4
    icon: string
    icon_sm: string
    color: string
    unit_of_purchase?: string
    symbol: string
    plural?: string
    apply_guild_lodge_discount?: boolean
}

export interface Cost4 {
    symbol: string
    amount: number
    precision: number
}

export interface ChainProps {
    time: string
    ref_block_num: number
    ref_block_id: string
    ref_block_prefix: number
}

export interface Ssc {
    rpc_url: string
    chain_id: string
    hive_rpc_url: string
    hive_chain_id: string
    alpha_token: string
    beta_token: string
    pack_holding_account: string
}

export interface CardHoldingAccount {
    blockchainName: string
    accountName: string
}

export interface Bridge {
    ethereum: Ethereum
    voucher: Voucher
    bsc: Bsc
}

export interface Ethereum {
    DEC: Dec2
    SPS: Sps2
}

export interface Dec2 {
    enabled: boolean
    game_wallet: string
    min_amount: number
    fee_pct: number
}

export interface Sps2 {
    enabled: boolean
    game_wallet: string
    min_amount: number
    fee_pct: number
}

export interface Voucher {
    bridge_wallet: string
}

export interface Bsc {
    DEC: Dec3
    SPS: Sps3
}

export interface Dec3 {
    enabled: boolean
    game_wallet: string
    min_amount: number
    fee_pct: number
}

export interface Sps3 {
    enabled: boolean
    game_wallet: string
    min_amount: number
    fee_pct: number
}

export interface Ethereum2 {
    withdrawal_fee: number
    sps_withdrawal_fee: number
    contracts: Contracts
}

export interface Contracts {
    cards: Cards
    crystals: Crystals
    payments: Payments
}

export interface Cards {
    abi: Abi
    address: string
}

export interface Abi {
    status: string
    message: string
    result: string
}

export interface Crystals {
    abi: Abi2
    address: string
}

export interface Abi2 {
    status: string
    message: string
    result: string
}

export interface Payments {
    abi: Abi3
    address: string
}

export interface Abi3 {
    status: string
    message: string
    result: string
}

export interface Wax {
    login_enabled: boolean
    client_id: string
    auth_url: string
    external: External
}

export interface External {
    token: Token
    atomicassets: Atomicassets
}

export interface Token {
    account: string
}

export interface Atomicassets {
    account: string
}

export interface SpsAirdrop {
    start_date: string
    current_airdrop_day: number
    sps_per_day: number
}


export interface CardLevelInfo {
    level: number;
    next_level: number;
    cards_required: number;
    xp_required: number;
    base_xp: number;
}

export interface Transaction {
    trx_info: TrxInfo
}

export interface TransactionUpdate extends Transaction {
    success: boolean
}

export interface TrxInfo {
    id: string
    block_id: string
    prev_block_id: string
    type: string
    player: string
    data: string
    success: boolean
    error: any
    block_num: number
    created_date: string
    result: string
    steem_price: any
    sbd_price: any
}

export interface Result {
    success: boolean;
    purchaser: string;
    num_cards: number;
    total_usd: number;
    total_dec: number;
    total_fees_dec: number;
    by_seller: Seller[];
}

export interface Seller {
    seller: string;
    items: string[];
}

export interface TokenBalance {
    player: string;
    token: string;
    balance: number | string;
    last_update_date: string | null;
    last_reward_block?: number;
    last_reward_time?: string;
}
