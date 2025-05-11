import { FC, useEffect, useState } from 'react'
import { Button } from '../../components/Button'
//import { RevealInput } from '../../components/Input/RevealInput'
import { StringUtils } from '../../utils/string.utils'
import { Input } from '../../components/Input'
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { WAGMI_CONTRACT_CONFIG, WagmiUseReadContractReturnType } from '../../constants/config'
import classes from './index.module.css'
import { Message } from '../../types'

interface AnimalListProps {
  authInfo: string | null
  fetchAuthInfo: () => Promise<void>
}

export const AnimalList: FC<AnimalListProps> = ({ authInfo, fetchAuthInfo }) => {
  //const { address } = useAccount()

  const [myAnimalIds, setMyAnimalIds] = useState<number[]>([])
  const [selectedAnimalId, setSelectedAnimalId] = useState<number>(0)
  const [healthRecordInput, setHealthRecordInput] = useState<string>('')
  const [message, setMessage] = useState<Message | null>(null)
  const [messageRevealLabel, setMessageRevealLabel] = useState<string>()
  const [messageError, setMessageError] = useState<string | null>(null)
  const [messageValueError, setMessageValueError] = useState<string>()
  const [hasBeenRevealedBefore, setHasBeenRevealedBefore] = useState(false)

  const { data: userAnimals, refetch: refetchUserAnimals } = useReadContract({
    ...WAGMI_CONTRACT_CONFIG,
    functionName: 'getMyAnimals',
    args: [authInfo || new Uint8Array()],
    query: {
      enabled: !!authInfo,
    },
  }) satisfies WagmiUseReadContractReturnType<'getMyAnimals', bigint[]>

  const { data: animalOwner, refetch: refetchOwner } = useReadContract({
    ...WAGMI_CONTRACT_CONFIG,
    functionName: 'ownerOf',
    args: [selectedAnimalId],
    query: {
      enabled: !!selectedAnimalId, // Ensure the query runs only when an animal is selected
    },
  }) satisfies WagmiUseReadContractReturnType<'ownerOf', string>

  const { data: animalData, isError, error, refetch: refetchAnimal } = useReadContract({
    ...WAGMI_CONTRACT_CONFIG,
    functionName: 'getAnimal',
    args: [selectedAnimalId, authInfo],
    query: {
      enabled: !!authInfo && !!selectedAnimalId, // Ensure the query runs only when authInfo and selectedAnimalId are available
      retry: false,
    },
  }) satisfies WagmiUseReadContractReturnType<'getAnimal', [string, string, bigint, string[]]>

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
    if (userAnimals) {
      const ids = userAnimals.map((id) => Number(id))
      setMyAnimalIds(ids)
      if (ids.length > 0 && selectedAnimalId === 0) {
        setSelectedAnimalId(Number(ids[0]))
      }
    }
  }, [userAnimals])

  useEffect(() => {
    if (authInfo && animalData) {
      const [name, image, age, healthRecords] = animalData
      setMessage({
        message: `Name: ${name}, Image: ${image} Age: ${age}, Health Records: ${healthRecords.join(', ')}`,
        author: animalOwner || 'Unknown',
      })
    }
  }, [animalOwner, animalData, authInfo, selectedAnimalId])

  const fetchMessage = async () => {
    setMessageError(null)
    setMessageRevealLabel('Please sign message and wait...')

    try {
      await fetchAuthInfo()
      await refetchUserAnimals()
      await refetchOwner()
      await refetchAnimal()
      setMessageRevealLabel(undefined)
      setHasBeenRevealedBefore(true)

      return Promise.resolve()
    } catch (error) {
      setMessageError((error as Error).message)
      setMessageRevealLabel('Something went wrong! Please try again...')

      throw error
    }
  }

  const handleAnimalSelect = (animalId: number) => {
    setSelectedAnimalId(animalId)
    refetchOwner()
    refetchAnimal()
  }

  useEffect(() => {
    if (isTransactionReceiptSuccess) {
      setHealthRecordInput('')

      if (!hasBeenRevealedBefore) {
        setMessage(null)
        setMessageRevealLabel('Tap to reveal')
      } else {
        fetchMessage()
      }
    } else if (isTransactionReceiptError || isWriteContractError) {
      setMessageValueError(transactionReceiptError?.message ?? writeContractError?.message)
    }
  }, [isTransactionReceiptSuccess, isTransactionReceiptError, isWriteContractError])

  const handleRevealChanged = async (): Promise<void> => {
    if (!isInteractingWithChain) {
      return await fetchMessage()
    }

    return Promise.reject()
  }

  const handleAddHealthRecord = async () => {
    if (!healthRecordInput) {
      setMessageValueError('Health record cannot be empty!')
      return
    }

    await writeContract({
      ...WAGMI_CONTRACT_CONFIG,
      functionName: 'addHealthRecord',
      args: [selectedAnimalId, healthRecordInput, authInfo],
    })

    setHealthRecordInput('')
  }

  return (
    <div className={classes.animalListContainer}>
      <h2 className={classes.title}>My Animals</h2>
      <p className={classes.description}>View and manage your animal health records.</p>

      <div className={classes.addHealthRecordSection}>
        <Button onClick={fetchMessage} disabled={isInteractingWithChain}>
          Fetch My Animals
        </Button>
      </div>

      {myAnimalIds.length > 0 && (
        <div className={classes.animalsList}>
          <h4>Select an animal to view:</h4>
          <div className={classes.animalGrid}>
            {myAnimalIds.map((id) => (
              <div
                key={id}
                className={`${classes.animalCard} ${selectedAnimalId === id ? classes.selectedAnimal : ''}`}
                onClick={() => handleAnimalSelect(id)}
              >
                <span>Animal #{id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {animalData && (
                <div className={classes.animalDetails}>
          {animalData[1] && (
            <div className={classes.imageContainer}>
              <img
                src={animalData[1]}
                alt={`${animalData[0]}'s picture`}
                className={classes.animalImage}
                height={150}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/400x300?text=No+Image+Available'
                  e.currentTarget.alt = 'Fallback image'
                }}
              />
            </div>
          )}
        
          <div className={classes.detailsContainer}>
            <div className={classes.detailRow}>
              <strong>ID:</strong> {selectedAnimalId}
            </div>
            <div className={classes.detailRow}>
              <strong>Name:</strong> {animalData[0]}
            </div>
            <div className={classes.detailRow}>
              <strong>Owner:</strong> {animalOwner || 'Unknown'}
            </div>
            <div className={classes.detailRow}>
              <strong>Age:</strong> {animalData[2]?.toString()}
            </div>
          </div>
        
          <div className={classes.healthRecords}>
            <h4>Health Records:</h4>
            {animalData[3]?.length > 0 ? (
              <ul>
                {animalData[3].map((record, index) => (
                  <li key={index}>{record}</li>
                ))}
              </ul>
            ) : (
              <p>No health records available</p>
            )}
        
            <div className={classes.addHealthRecordSection}>
              <h4>Add Health Record: </h4>
              <Input
                value={healthRecordInput}
                onChange={setHealthRecordInput}
                disabled={isInteractingWithChain}
              />
              <Button onClick={handleAddHealthRecord} disabled={isInteractingWithChain || !healthRecordInput}>
                Add Record
              </Button>
            </div>
          </div>
        </div>
      )}

      {messageError && <p className="error">{StringUtils.truncate(messageError)}</p>}
      {isError && <p className="error">{error.toString()}</p>}
    </div>
  )
}