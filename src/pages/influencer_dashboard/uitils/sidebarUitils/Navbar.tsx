import React from 'react';
import {
  useDashboard,
  type DashboardElementsInterface,
} from '../../helpers/useDashboard';
import { NavLink, useParams } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { lang = 'az' } = useParams();
  const { DashboardElements } = useDashboard();

  return (
    <div className="aside-navbar">
      {DashboardElements?.map((item: DashboardElementsInterface) => {
        if (item.isLink) {
          return (
            <div
              className="nav-item"
              key={item?.id}
              onClick={() => {
                const keysToRemove = Object.keys(localStorage).filter(
                  key => key !== 'collection_id',
                );

                keysToRemove.forEach(key => {
                  localStorage.removeItem(key);
                });

                window.location.href = '/';
              }}
            >
              <div className="item-icon">
                <img src={item?.icon} />
              </div>
              <p>{item?.title}</p>
            </div>
          );
        } else {
          return (
            <NavLink
              to={`/${lang}/influencer/${item?.to ?? ''}`}
              className="nav-item"
              key={item?.id}
              reloadDocument
            >
              <div className="item-icon">
                <img src={item?.icon} />
              </div>
              <p>{item?.title}</p>
            </NavLink>
          );
        }
      })}
    </div>
  );
};

export default Navbar;
