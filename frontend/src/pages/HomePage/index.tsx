import { FC } from 'react'
import { Link } from 'react-router-dom'
import classes from './index.module.css'

export const HomePage: FC = () => {
  return (
    <div className={classes.homePage}>
      <div className={classes.linksContainer}>
        <Link to="/create-animal" className={classes.linkBox}>
          <img src="/images/create.png" alt="Create Animal" />
        </Link>
        <Link to="/animal-list" className={classes.linkBox}>
          <img src="/images/list.png" alt="Animal List" />
        </Link>
        <Link to="/rewards" className={classes.linkBox}>
        <img src="/images/rewards.png" alt="Rewards" />
        </Link>
      </div>
    </div>
  )
}