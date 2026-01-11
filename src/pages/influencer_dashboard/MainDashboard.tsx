import React from 'react'
import DashboardContent from './uitils/DashboardContent'
import Sidebar from './uitils/Sidebar'
import "../influencer_styles/influencer_dash.scss";

const MainDashboard: React.FC = () => {
    return (
        <section className='main-dashboard'>
            <Sidebar />
            <DashboardContent />
        </section>
    )
}

export default MainDashboard
