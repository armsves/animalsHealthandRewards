import { FC } from 'react'
import { Card } from '../../components/Card'
import classes from './index.module.css'
import { useAccount } from 'wagmi'
import { useWeb3Auth } from '../../hooks/useWeb3Auth'
import { AnimalList } from '../../components/AnimalList'
import { CreateAnimal } from '../../components/CreateAnimal'

export const HomePage: FC = () => {
  const { address } = useAccount()
  const {
    state: { authInfo },
    fetchAuthInfo,
  } = useWeb3Auth()

  const handleAnimalCreated = () => {
    // Optionally refresh data after animal creation
    if (address) {
      fetchAuthInfo();
    }
  }

  return (
    <div className={classes.homePage}>
      <Card header={<h2>Animal Health Records</h2>}>
        {address ? (
          <>
            <AnimalList authInfo={authInfo} fetchAuthInfo={fetchAuthInfo} />
            <CreateAnimal onAnimalCreated={handleAnimalCreated} />
          </>
        ) : (
          <div className={classes.connectWalletText}>
            <p>Please connect your wallet to get started.</p>
          </div>
        )}
      </Card>
    </div>
  )
}