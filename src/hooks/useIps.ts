import useData from './useData';
export interface IpData {
    count:number;
    IP_Address: string;
  }
  const useIps = (selectedCity:string) => {
    const city = selectedCity || 'Dhaka';
    const endpoint = `/get-ips/cisco_xr/FHL_CO/${city}`;
    const { data,count, error, isLoading } = useData<IpData>(endpoint,[selectedCity]);
    return { data,count, error, isLoading };
  };

export default useIps