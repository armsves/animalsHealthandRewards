import { FC } from 'react'
import { useWeb3Auth } from '../../hooks/useWeb3Auth'
import { AnimalList } from '../../components/AnimalList'

export const AnimalListPage: FC = () => {
  const {
    state: { authInfo },
    fetchAuthInfo,
  } = useWeb3Auth()

  return (
    <div>
      <AnimalList authInfo={authInfo} fetchAuthInfo={fetchAuthInfo} />
    </div>
  )
}