import React from 'react'
import Profile from './sidebarUitils/Profile'
import Navbar from './sidebarUitils/Navbar'

const Sidebar: React.FC = () => {
    return (
        <aside className="sidebar-left">
            <Profile />
            <Navbar />
        </aside>
    )
}

export default Sidebar
