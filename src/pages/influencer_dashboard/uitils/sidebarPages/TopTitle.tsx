import React from 'react'

interface Props {
    children: React.ReactNode
}

const TopTitle: React.FC<Props> = ({ children }) => {
    return (
        <section className='top-title'>
            {children}
        </section>
    )
}

export default TopTitle
