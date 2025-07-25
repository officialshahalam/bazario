import { useQuery } from "@tanstack/react-query";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import { useAuthStore } from "../store/authStore";
import { isProtected } from "packages/utills/protected";

// fetch userData from api
const fetchUser = async (isLoggedIn: boolean) => {
  const config = isLoggedIn ? isProtected : {};
  const response = await getAxiosInstance("auth").get(
    "/logged-in-user",
    config
  );
  return response.data.user;
};

const useUser = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuthStore();
  const {
    data: user,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetchUser(isLoggedIn),
    staleTime: 1000 * 60 * 5,
    retry: false,
    // @ts-ignore
    onSuccess: () => {
      setIsLoggedIn(true);
    },
    onError: () => {
      setIsLoggedIn(false);
    },
  });

  return { user: user as any, isLoading: isPending, isError };
};

export default useUser;
