// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ONIC Token
 * @dev Token ERC-20 para el sistema Trade Bionic
 * Distribuye ganancias del trading a los holders
 */
contract ONICToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    
    // Eventos
    event TokensBurned(address indexed burner, uint256 amount);
    event TradingRewardsDistributed(uint256 totalAmount, uint256 timestamp);
    event HolderRewardClaimed(address indexed holder, uint256 amount, uint256 timestamp);
    
    // Constantes
    uint256 public constant INITIAL_SUPPLY = 10_000_000 * 10**18; // 10 millones de tokens
    uint256 public constant BURN_RATE = 100; // 1% (100 basis points)
    uint256 public constant MINIMUM_BURN_AMOUNT = 1000 * 10**18; // 1000 tokens
    
    // Variables de estado
    uint256 public totalBurned;
    uint256 public tradingRewardsPool;
    mapping(address => uint256) public lastRewardClaim;
    mapping(address => uint256) public claimedRewards;
    
    // Timestamps para control de recompensas
    uint256 public lastRewardDistribution;
    uint256 public constant REWARD_DISTRIBUTION_INTERVAL = 1 days;
    
    constructor() ERC20("ONIC Token", "ONIC") {
        _mint(msg.sender, INITIAL_SUPPLY);
        lastRewardDistribution = block.timestamp;
    }
    
    /**
     * @dev Quema tokens del caller
     * @param amount Cantidad de tokens a quemar
     */
    function burn(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        totalBurned += amount;
        
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Quema tokens automáticamente cuando se reciben ganancias de trading
     * Solo puede ser llamado por el owner
     */
    function autoBurn() external onlyOwner {
        uint256 burnAmount = (tradingRewardsPool * BURN_RATE) / 10000;
        
        if (burnAmount >= MINIMUM_BURN_AMOUNT) {
            _burn(address(this), burnAmount);
            totalBurned += burnAmount;
            tradingRewardsPool -= burnAmount;
            
            emit TokensBurned(address(this), burnAmount);
        }
    }
    
    /**
     * @dev Recibe ganancias de trading y las distribuye a holders
     * Solo puede ser llamado por el owner
     */
    function distributeTradingRewards() external payable onlyOwner {
        require(msg.value > 0, "No ETH sent");
        require(block.timestamp >= lastRewardDistribution + REWARD_DISTRIBUTION_INTERVAL, 
                "Too early for next distribution");
        
        tradingRewardsPool += msg.value;
        lastRewardDistribution = block.timestamp;
        
        emit TradingRewardsDistributed(msg.value, block.timestamp);
    }
    
    /**
     * @dev Permite a los holders reclamar sus recompensas
     */
    function claimRewards() external nonReentrant {
        require(balanceOf(msg.sender) > 0, "No tokens held");
        require(tradingRewardsPool > 0, "No rewards available");
        
        uint256 totalSupply = totalSupply();
        uint256 holderBalance = balanceOf(msg.sender);
        uint256 rewardShare = (tradingRewardsPool * holderBalance) / totalSupply;
        
        require(rewardShare > 0, "No rewards to claim");
        
        // Transferir recompensa
        payable(msg.sender).transfer(rewardShare);
        claimedRewards[msg.sender] += rewardShare;
        lastRewardClaim[msg.sender] = block.timestamp;
        
        emit HolderRewardClaimed(msg.sender, rewardShare, block.timestamp);
    }
    
    /**
     * @dev Calcula las recompensas disponibles para un holder
     * @param holder Dirección del holder
     * @return Cantidad de recompensas disponibles
     */
    function getAvailableRewards(address holder) external view returns (uint256) {
        if (balanceOf(holder) == 0 || tradingRewardsPool == 0) {
            return 0;
        }
        
        uint256 totalSupply = totalSupply();
        uint256 holderBalance = balanceOf(holder);
        uint256 totalRewardShare = (tradingRewardsPool * holderBalance) / totalSupply;
        
        return totalRewardShare - claimedRewards[holder];
    }
    
    /**
     * @dev Obtiene estadísticas del token
     */
    function getTokenStats() external view returns (
        uint256 totalSupply_,
        uint256 circulatingSupply,
        uint256 totalBurned_,
        uint256 tradingRewardsPool_,
        uint256 lastRewardDistribution_
    ) {
        totalSupply_ = totalSupply();
        circulatingSupply = totalSupply() - totalBurned;
        totalBurned_ = totalBurned;
        tradingRewardsPool_ = tradingRewardsPool;
        lastRewardDistribution_ = lastRewardDistribution;
    }
    
    /**
     * @dev Pausa el contrato en caso de emergencia
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Despausa el contrato
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override de transfer para incluir pausa
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "Token transfer paused");
    }
    
    /**
     * @dev Permite al owner retirar ETH en caso de emergencia
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Recibe ETH (para ganancias de trading)
     */
    receive() external payable {
        // Solo aceptar ETH del owner para distribuciones
        require(msg.sender == owner(), "Only owner can send ETH");
    }
} 