import { useQuery } from "@tanstack/react-query";
import { getAxiosInstance } from "packages/utills/axios/getAxios";

// fetch userData from api
const fetchUser = async () => {
  const response = await getAxiosInstance('auth').get("/logged-in-seller");
  return response.data.seller;
};


const useSeller = () => {
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["seller"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { seller, isLoading, isError, refetch };
};

export default useSeller;
