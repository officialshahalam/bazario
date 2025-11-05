import { useQuery } from "@tanstack/react-query";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import { useAuthStore } from "../store/authStore";
import { isProtected } from "packages/utills/protected";

const fetchUser = async () => {
  const response = await getAxiosInstance("auth").get(
    "/logged-in-user",
    isProtected
  );
  return response.data.user;
};

const useUser = () => {
  const { setIsLoggedIn } = useAuthStore();

  const {
    data: user,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
    meta: {
      onSuccess: () => {
        setIsLoggedIn(true);
      },
      onError: () => {
        setIsLoggedIn(false);
      },
    },
  });

  return { user: user as any, isLoading: isPending, isError };
};

export default useUser;
