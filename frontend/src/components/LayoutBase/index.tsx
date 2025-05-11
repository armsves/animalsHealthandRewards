import { FC, PropsWithChildren, ReactNode } from 'react'
//import { useMediaQuery } from 'react-responsive'
import classes from './index.module.css'

interface Props {
  header?: ReactNode
}

export const LayoutBase: FC<PropsWithChildren<Props>> = ({ children, header }) => {
  
  return (
    <div className={classes.layout}>
      {header}
      <main className={classes.main}>{children}</main>
        <footer className={classes.footer}>
          <img src="/circles-logo.svg" alt="Circles Logo" className={classes.footerLogo} />
          <span className={classes.footerText}>Farea 2025 ©</span>
          <img src="/oasis-logo.svg" alt="Oasis Logo" className={classes.footerLogo} />
        </footer>
    </div>
  )
}
