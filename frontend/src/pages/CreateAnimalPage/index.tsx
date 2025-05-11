import { FC } from 'react'
import { useWeb3Auth } from '../../hooks/useWeb3Auth'
import { CreateAnimal } from '../../components/CreateAnimal'

export const CreateAnimalPage: FC = () => {
  const { fetchAuthInfo } = useWeb3Auth()

  const handleAnimalCreated = () => {
    fetchAuthInfo()
  }

  return (
    <div>
      <CreateAnimal onAnimalCreated={handleAnimalCreated} />
    </div>
  )
}