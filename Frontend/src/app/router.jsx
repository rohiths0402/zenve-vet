import { createBrowserRouter } from 'react-router-dom';
import AppShell from '../shared/layout/AppShell';

import FeedPage from '../features/feed/pages/FeedPage';
import ClinicalCasesPage from '../features/feed/pages/ClinicalCasesPage';

import NetworkPage from '../features/network/pages/NetworkPage';
import SearchPage from '../features/network/pages/SearchPage';
import DoctorProfilePage from '../features/network/pages/DoctorProfilePage';

import ReelsPage from '../features/reels/pages/ReelsPage';
import MessagesPage from '../features/messaging/pages/MessagesPage';

import BenefitsPage from '../features/extras/pages/BenefitsPage';
import AdvertisePage from '../features/extras/pages/AdvertisePage';
import InnovationPage from '../features/extras/pages/InnovationPage';

import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <AppShell />,
    children: [
      {
        path: '/',
        element: <FeedPage />,
      },
      {
        path: '/clinical-cases',
        element: <ClinicalCasesPage />,
      },
      {
        path: '/network',
        element: <NetworkPage />,
      },
      {
        path: '/search',
        element: <SearchPage />,
      },
      {
        path: '/doctors/:id',
        element: <DoctorProfilePage />,
      },
      {
        path: '/reels',
        element: <ReelsPage />,
      },
      {
        path: '/messages',
        element: <MessagesPage />,
      },
      {
        path: '/messages/:conversationId',
        element: <MessagesPage />,
      },
      {
        path: '/benefits',
        element: <BenefitsPage />,
      },
      {
        path: '/advertise',
        element: <AdvertisePage />,
      },
      {
        path: '/innovation',
        element: <InnovationPage />,
      },
    ],
  },
]);

export default router;