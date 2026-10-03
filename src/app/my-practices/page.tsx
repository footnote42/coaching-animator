import { MyPracticesClient } from './MyPracticesClient';

export const metadata = {
  title: 'My Practices',
  robots: { index: false },
};

export default function MyPracticesPage() {
  return <MyPracticesClient />;
}
