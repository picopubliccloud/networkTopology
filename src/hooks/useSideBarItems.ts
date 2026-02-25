import useData from './useData';

interface Zones{
  CO_Zone:[];
  districtsByZone:{};
}
const useSideBarItems = ()=>{
    const endpoint = `/zones/api/get-zone-districts/`;
    const { data,count, error, isLoading } = useData<Zones>(endpoint);
    return { data, count, error, isLoading };
}

export default useSideBarItems