import { FC, useState, useEffect } from 'react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { WAGMI_CONTRACT_CONFIG } from '../../constants/config'
import classes from './index.module.css'

interface CreateAnimalProps {
  onAnimalCreated?: () => void
}

export const CreateAnimal: FC<CreateAnimalProps> = ({ onAnimalCreated }) => {
  const [animalName, setAnimalName] = useState<string>('')
  const [animalImage, setAnimalImage] = useState<string>('')
  const [animalAge, setAnimalAge] = useState<number>(0)
  const [messageValueError, setMessageValueError] = useState<string>()

  const {
    data: setMessageTxHash,
    writeContract,
    isPending: isWriteContractPending,
    isError: isWriteContractError,
    error: writeContractError,
  } = useWriteContract()

  const {
    isPending: isTransactionReceiptPending,
    isSuccess: isTransactionReceiptSuccess,
    isError: isTransactionReceiptError,
    error: transactionReceiptError,
  } = useWaitForTransactionReceipt({
    hash: setMessageTxHash,
  })

  const isInteractingWithChain = isWriteContractPending || (setMessageTxHash && isTransactionReceiptPending)

  useEffect(() => {
    if (isTransactionReceiptSuccess) {
      // Reset form after successful creation
      setAnimalName('')
      setAnimalImage('https://example.com/placeholder.png')
      setAnimalAge(0)

      // Notify parent component if callback provided
      if (onAnimalCreated) {
        onAnimalCreated()
      }
    } else if (isTransactionReceiptError || isWriteContractError) {
      setMessageValueError(transactionReceiptError?.message ?? writeContractError?.message)
    }
  }, [isTransactionReceiptSuccess, isTransactionReceiptError, isWriteContractError])

  const handleSetMessage = async () => {
    setMessageValueError(undefined)

    if (!animalName) {
      setMessageValueError('Animal name is required!')
      return
    }

    await writeContract({
      ...WAGMI_CONTRACT_CONFIG,
      functionName: 'createAnimal',
      args: [animalName, animalImage, animalAge],
    })
  }

  return (
    <div className={classes.createAnimalContainer}>
      <h2 className={classes.title}>Create New Animal</h2>
      <p className={classes.description}>Fill in the details below to create a new animal record.</p>

      <div className={classes.inputGroup}>
        <label htmlFor="animalName" className={classes.label}>
          Animal Name
        </label>
        <Input
          value={animalName}
          onChange={setAnimalName}
          error={messageValueError}
          disabled={isInteractingWithChain}
        />
      </div>

      <div className={classes.inputGroup}>
        <label htmlFor="animalImage" className={classes.label}>
          Animal Image URL
        </label>
        <Input
          value={animalImage}
          onChange={setAnimalImage}
          disabled={isInteractingWithChain}
        />
      </div>

      <div className={classes.inputGroup}>
        <label htmlFor="animalAge" className={classes.label}>
          Animal Age
        </label>
        <Input
          value={animalAge.toString()}
          onChange={(value) => setAnimalAge(Number(value))}
          disabled={isInteractingWithChain}
        />
      </div>

      <div className={classes.actions}>
        <Button disabled={isInteractingWithChain} onClick={handleSetMessage}>
          {isInteractingWithChain ? 'Please wait...' : 'Create Animal'}
        </Button>
      </div>
    </div>
  )
}