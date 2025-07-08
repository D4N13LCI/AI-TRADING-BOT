// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Revenue Distributor
 * @dev Contrato para distribuir ganancias de trading según el modelo de Trade Bionic
 */
contract RevenueDistributor is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // Eventos
    event RevenueReceived(uint256 amount, uint256 timestamp);
    event DistributionExecuted(
        uint256 holdersAmount,
        uint256 reinvestmentAmount,
        uint256 operationalAmount,
        uint256 marketingAmount,
        uint256 charityAmount,
        uint256 timestamp
    );
    event HolderRewardClaimed(address indexed holder, uint256 amount, uint256 timestamp);
    event EmergencyWithdraw(address indexed owner, uint256 amount, uint256 timestamp);
    
    // Constantes de distribución (en basis points - 10000 = 100%)
    uint256 public constant HOLDERS_PERCENTAGE = 4000;      // 40%
    uint256 public constant REINVESTMENT_PERCENTAGE = 3500; // 35%
    uint256 public constant OPERATIONAL_PERCENTAGE = 1500;  // 15%
    uint256 public constant MARKETING_PERCENTAGE = 900;     // 9%
    uint256 public constant CHARITY_PERCENTAGE = 100;       // 1%
    
    // Direcciones de distribución
    address public reinvestmentWallet;
    address public operationalWallet;
    address public marketingWallet;
    address public charityWallet;
    
    // Variables de estado
    uint256 public totalRevenueReceived;
    uint256 public totalDistributed;
    uint256 public lastDistributionTime;
    uint256 public constant DISTRIBUTION_INTERVAL = 1 days;
    
    // Mapeos para tracking
    mapping(address => uint256) public holderClaims;
    mapping(address => uint256) public lastClaimTime;
    
    // Token ONIC
    IERC20 public onicToken;
    
    constructor(
        address _onicToken,
        address _reinvestmentWallet,
        address _operationalWallet,
        address _marketingWallet,
        address _charityWallet
    ) {
        require(_onicToken != address(0), "Invalid ONIC token address");
        require(_reinvestmentWallet != address(0), "Invalid reinvestment wallet");
        require(_operationalWallet != address(0), "Invalid operational wallet");
        require(_marketingWallet != address(0), "Invalid marketing wallet");
        require(_charityWallet != address(0), "Invalid charity wallet");
        
        onicToken = IERC20(_onicToken);
        reinvestmentWallet = _reinvestmentWallet;
        operationalWallet = _operationalWallet;
        marketingWallet = _marketingWallet;
        charityWallet = _charityWallet;
        
        lastDistributionTime = block.timestamp;
    }
    
    /**
     * @dev Recibe ganancias de trading
     */
    function receiveRevenue() external payable onlyOwner {
        require(msg.value > 0, "No ETH sent");
        require(block.timestamp >= lastDistributionTime + DISTRIBUTION_INTERVAL, 
                "Too early for next distribution");
        
        totalRevenueReceived += msg.value;
        
        emit RevenueReceived(msg.value, block.timestamp);
        
        // Ejecutar distribución automática
        _distributeRevenue(msg.value);
    }
    
    /**
     * @dev Distribuye las ganancias según el modelo de Trade Bionic
     */
    function _distributeRevenue(uint256 amount) internal {
        uint256 holdersAmount = (amount * HOLDERS_PERCENTAGE) / 10000;
        uint256 reinvestmentAmount = (amount * REINVESTMENT_PERCENTAGE) / 10000;
        uint256 operationalAmount = (amount * OPERATIONAL_PERCENTAGE) / 10000;
        uint256 marketingAmount = (amount * MARKETING_PERCENTAGE) / 10000;
        uint256 charityAmount = (amount * CHARITY_PERCENTAGE) / 10000;
        
        // Transferir a wallets específicas
        if (reinvestmentAmount > 0) {
            payable(reinvestmentWallet).transfer(reinvestmentAmount);
        }
        
        if (operationalAmount > 0) {
            payable(operationalWallet).transfer(operationalAmount);
        }
        
        if (marketingAmount > 0) {
            payable(marketingWallet).transfer(marketingAmount);
        }
        
        if (charityAmount > 0) {
            payable(charityWallet).transfer(charityAmount);
        }
        
        totalDistributed += amount;
        lastDistributionTime = block.timestamp;
        
        emit DistributionExecuted(
            holdersAmount,
            reinvestmentAmount,
            operationalAmount,
            marketingAmount,
            charityAmount,
            block.timestamp
        );
    }
    
    /**
     * @dev Permite a los holders reclamar sus recompensas
     */
    function claimHolderRewards() external nonReentrant whenNotPaused {
        require(onicToken.balanceOf(msg.sender) > 0, "No ONIC tokens held");
        
        uint256 availableRewards = getAvailableRewards(msg.sender);
        require(availableRewards > 0, "No rewards available");
        
        // Transferir recompensa
        payable(msg.sender).transfer(availableRewards);
        holderClaims[msg.sender] += availableRewards;
        lastClaimTime[msg.sender] = block.timestamp;
        
        emit HolderRewardClaimed(msg.sender, availableRewards, block.timestamp);
    }
    
    /**
     * @dev Calcula las recompensas disponibles para un holder
     */
    function getAvailableRewards(address holder) public view returns (uint256) {
        if (onicToken.balanceOf(holder) == 0) {
            return 0;
        }
        
        uint256 totalSupply = onicToken.totalSupply();
        uint256 holderBalance = onicToken.balanceOf(holder);
        uint256 totalRewardShare = (totalRevenueReceived * HOLDERS_PERCENTAGE * holderBalance) / (10000 * totalSupply);
        
        return totalRewardShare - holderClaims[holder];
    }
    
    /**
     * @dev Obtiene estadísticas del contrato
     */
    function getContractStats() external view returns (
        uint256 totalRevenue_,
        uint256 totalDistributed_,
        uint256 lastDistributionTime_,
        uint256 contractBalance
    ) {
        totalRevenue_ = totalRevenueReceived;
        totalDistributed_ = totalDistributed;
        lastDistributionTime_ = lastDistributionTime;
        contractBalance = address(this).balance;
    }
    
    /**
     * @dev Actualiza las direcciones de distribución (solo owner)
     */
    function updateDistributionWallets(
        address _reinvestmentWallet,
        address _operationalWallet,
        address _marketingWallet,
        address _charityWallet
    ) external onlyOwner {
        require(_reinvestmentWallet != address(0), "Invalid reinvestment wallet");
        require(_operationalWallet != address(0), "Invalid operational wallet");
        require(_marketingWallet != address(0), "Invalid marketing wallet");
        require(_charityWallet != address(0), "Invalid charity wallet");
        
        reinvestmentWallet = _reinvestmentWallet;
        operationalWallet = _operationalWallet;
        marketingWallet = _marketingWallet;
        charityWallet = _charityWallet;
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
     * @dev Retiro de emergencia (solo owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        payable(owner()).transfer(balance);
        
        emit EmergencyWithdraw(owner(), balance, block.timestamp);
    }
    
    /**
     * @dev Retira tokens ERC-20 en caso de emergencia
     */
    function emergencyWithdrawToken(address token) external onlyOwner {
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        tokenContract.safeTransfer(owner(), balance);
    }
    
    /**
     * @dev Recibe ETH (para ganancias de trading)
     */
    receive() external payable {
        // Solo aceptar ETH del owner
        require(msg.sender == owner(), "Only owner can send ETH");
    }
} 