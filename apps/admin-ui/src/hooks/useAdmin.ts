import { useQuery } from "@tanstack/react-query";
import { getAxiosInstance } from "packages/utills/axios/getAxios";

const useAdmin = () => {
  const {
    data: admin,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin"],
    queryFn: async () => {
      const res = await getAxiosInstance("auth").get("/logged-in-admin");
      return res?.data?.admin;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { admin, isLoading, isError, refetch };
};

export default useAdmin;
