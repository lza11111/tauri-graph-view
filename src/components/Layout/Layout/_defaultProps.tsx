import DataAssets from '@/assets/icon/data-assets.svg';
import DataGlossary from '@/assets/icon/data-glossary.svg';
import DataInsights from '@/assets/icon/data-insights.svg';

export default {
  route: {
    fixSiderbar: false,
    splitMenus: true,
    path: '/',
    routes: [
      {
        path: '/data-assets',
        name: 'Assets',
        icon: <img src={DataAssets.src} />,
      },
      {
        path: '/data-glossary',
        name: 'Glossary',
        icon: <img src={DataGlossary.src} />,
      },
      {
        path: '/data-insights',
        name: 'Insights',
        icon: <img src={DataInsights.src} />,
      },
    ],
  },
  location: {
    pathname: '/',
  },
};