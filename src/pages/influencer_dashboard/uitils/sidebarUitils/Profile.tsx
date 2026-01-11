import React from 'react'

const Profile: React.FC = () => {
  const userStr = localStorage.getItem('user-info');
  const userObj = userStr ? JSON.parse(userStr) : null;
  console.log(userObj,"userObj")
  return (
    <div className='profile-section'>
      <div className="profile-section__profile">
        <img src="/inf.svg" alt="profile" />
        <h3>{userObj?.data.name ?? "User"}</h3>
        <h3>ID: {userObj?.data.id}</h3>
      </div>
    </div>
  )
}

export default Profile
