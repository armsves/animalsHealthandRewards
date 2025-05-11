import { FC, useEffect, useState } from 'react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { useReadContract, useWriteContract } from 'wagmi'
import { WAGMI_CONTRACT_CONFIG } from '../../constants/config'
import classes from './index.module.css'

export const RewardsPage: FC = () => {
  const [rewardAddress, setRewardAddress] = useState<string>('')
  const [isAddingReward, setIsAddingReward] = useState(false)
  const [rewardAddresses, setRewardAddresses] = useState<string[]>([])

  // Write contract to add a reward address
  const { writeContract: addRewardContract } = useWriteContract()

  // Read contract to fetch reward addresses
  const { data: fetchedRewardAddresses, refetch: fetchRewardAddresses } = useReadContract({
    ...WAGMI_CONTRACT_CONFIG,
    functionName: 'getRewardAddresses',
  })

  useEffect(() => {
    if (fetchedRewardAddresses) {
      setRewardAddresses(fetchedRewardAddresses as string[])
    }
  }, [fetchedRewardAddresses])

  const handleAddReward = async () => {
    if (!rewardAddress) {
      //alert('Please enter a valid address.')
      return
    }

    setIsAddingReward(true)
    try {
      await addRewardContract({
        ...WAGMI_CONTRACT_CONFIG,
        functionName: 'addRewardAddress',
        args: [rewardAddress],
      })
      //alert(`Reward address added: ${rewardAddress}`)
      setRewardAddress('') // Clear the input field after adding
      await fetchRewardAddresses() // Refresh the list of reward addresses
    } catch (error) {
      console.error('Error adding reward address:', error)
      //alert('Failed to add reward address. Please try again.')
    } finally {
      setIsAddingReward(false)
    }
  }

  return (
    <div className={classes.rewardsPage}>
      <h2>Rewards</h2>
      <p>Below is the list of addresses eligible for rewards:</p>

      {rewardAddresses.length > 0 ? (
        <ul className={classes.rewardList}>
          {rewardAddresses.map((address) => (
            <li key={address} className={classes.rewardItem}>
              {address}
            </li>
          ))}
        </ul>
      ) : (
        <p>No addresses eligible for rewards at the moment.</p>
      )}

      <div className={classes.inputSection}>
        <h4>Add Reward Address</h4>
        <Input
          value={rewardAddress}
          onChange={setRewardAddress}
          disabled={isAddingReward}
        />
        <Button
          onClick={handleAddReward}
          disabled={isAddingReward || !rewardAddress}
          className={classes.addButton}
        >
          {isAddingReward ? 'Adding...' : 'Add Reward'}
        </Button>
      </div>
    </div>
  )
}