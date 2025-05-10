import { FC, useState, useEffect } from 'react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { WAGMI_CONTRACT_CONFIG } from '../../constants/config'
import classes from '../../pages/HomePage/index.module.css'

interface CreateAnimalProps {
  onAnimalCreated?: () => void;
}

export const CreateAnimal: FC<CreateAnimalProps> = ({ onAnimalCreated }) => {
  const [animalName, setAnimalName] = useState<string>('')
  const [animalImage, setAnimalImage] = useState<string>('https://example.com/placeholder.png')
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
    setMessageValueError(undefined);
  
    if (!animalName) {
      setMessageValueError('Animal name is required!');
      return;
    }
  
    await writeContract({
      ...WAGMI_CONTRACT_CONFIG,
      functionName: 'createAnimal',
      args: [animalName, animalImage, animalAge],
    });
  }

  return (
    <div className={classes.createAnimalSection}>
      <h3>Create New Animal</h3>
      <p>Create a new animal record by filling the fields below.</p>
      
      <div className={classes.setMessageText}>
        <h4>Animal Name</h4>
      </div>
      <Input
        value={animalName}
        label="Name"
        onChange={setAnimalName}
        error={messageValueError}
        disabled={isInteractingWithChain}
      />
      
      <div className={classes.setMessageText}>
        <h4>Animal Image URL</h4>
      </div>
      <Input
        value={animalImage}
        label="Image URL"
        onChange={setAnimalImage}
        disabled={isInteractingWithChain}
      />
      
      <div className={classes.setMessageText}>
        <h4>Animal Age</h4>
      </div>
      <Input
        value={animalAge.toString()}
        label="Age"
        onChange={(value) => setAnimalAge(Number(value))}
        disabled={isInteractingWithChain}
      />
      
      <div className={classes.setMessageActions}>
        <Button disabled={isInteractingWithChain} onClick={handleSetMessage}>
          {isInteractingWithChain ? 'Please wait...' : 'Create Animal'}
        </Button>
      </div>
    </div>
  )
}