import React from 'react';
import TopTitle from './TopTitle';
import ChartContents from './dashboarduitils/ChartContents';
import BottomChart from './dashboarduitils/BottomChart';
import GETRequest from '../../../../setting/Request';
import { TranslationsKeys } from '../../../../setting/Types';
import { useParams } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const { data: translation } = GETRequest<TranslationsKeys>(`/translates`, 'translates', [
    lang,
  ]);

  return (
    <div className="dashboard-container">
      <TopTitle>
        <div className="left">
          <h3>{translation?.inf_dashboard}</h3>
        </div>
      </TopTitle>
      <div className="container-main">
        <ChartContents />
        <BottomChart />
      </div>
    </div>
  );
};

export default Dashboard;
