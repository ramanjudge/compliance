import HomeView from '@/components/views/HomeView';
import StatesIndexView from '@/components/views/StatesIndexView';
import StateDetailsView from '@/components/views/StateDetailsView';
import IndustryIndexView from '@/components/views/IndustryIndexView';
import IndustryDetailsView from '@/components/views/IndustryDetailsView';
import CalculatorView from '@/components/views/CalculatorView';
import AdminView from '@/components/views/AdminView';
import { notFound } from 'next/navigation';

export default async function CatchAllPage(props: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await props.params;
  const pathArray = slug || [];
  
  if (pathArray.length === 0) {
    return <HomeView />;
  }
  
  const rootSegment = pathArray[0];

  if (rootSegment === 'admin') {
    return <AdminView />;
  }
  
  if (rootSegment === 'calculator') {
    return <CalculatorView />;
  }
  
  if (rootSegment === 'states') {
    if (pathArray.length === 1) return <StatesIndexView />;
    if (pathArray.length === 2) return <StateDetailsView params={Promise.resolve({ slug: pathArray[1] })} />;
  }
  
  if (rootSegment === 'industry') {
    if (pathArray.length === 1) return <IndustryIndexView />;
    if (pathArray.length === 2) return <IndustryDetailsView params={Promise.resolve({ industryName: pathArray[1] })} />;
  }

  // If none of the routes match, return 404
  return notFound();
}
