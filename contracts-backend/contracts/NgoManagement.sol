// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NgoManagement {
    
    struct Campaign {
        uint256 id;
        address payable ngo;
        string title;
        string description;
        uint256 goal;
        uint256 raised;
        bool isCompleted;
    }

    uint256 public campaignCount = 0;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public donations;

    event CampaignCreated(uint256 id, address ngo, string title, uint256 goal);
    event Donated(uint256 id, address donor, uint256 amount);

    // 1. NGO creates a funding campaign
    function createCampaign(string memory _title, string memory _description, uint256 _goalInWei) public {
        require(_goalInWei > 0, "Goal must be greater than 0");
        campaignCount++;
        campaigns[campaignCount] = Campaign(campaignCount, payable(msg.sender), _title, _description, _goalInWei, 0, false);
        emit CampaignCreated(campaignCount, msg.sender, _title, _goalInWei);
    }

    // 2. Donor donates test ETH to a campaign
    function donate(uint256 _campaignId) public payable {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.value > 0, "Donation must be greater than 0");
        require(!campaign.isCompleted, "Campaign completed");

        campaign.raised += msg.value;
        donations[_campaignId][msg.sender] += msg.value;

        // Directly send donated funds to NGO address
        campaign.ngo.transfer(msg.value);

        if (campaign.raised >= campaign.goal) {
            campaign.isCompleted = true;
        }

        emit Donated(_campaignId, msg.sender, msg.value);
    }

    // 3. Helper to fetch campaign details
    function getCampaign(uint256 _campaignId) public view returns (Campaign memory) {
        return campaigns[_campaignId];
    }
}