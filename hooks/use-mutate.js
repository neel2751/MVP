import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSubmitMutation = ({
  mutationFn,
  invalidateKey,
  onSuccessMessage,
  onClose,
  onSuccessUpdate,
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (response) => {
      if (response?.success) {
        if (onSuccessUpdate) {
          onSuccessUpdate(response?.data);
        }

        if (invalidateKey) {
          queryClient.invalidateQueries(invalidateKey, { exact: true });
        }
        if (onSuccessMessage) {
          toast.success(onSuccessMessage(response?.message));
        }
        onClose();
      } else {
        throw new Error(response?.error || "Something went wrong");
      }
    },
    onError: (error) => {
      console.log(`Under this function is ${mutationFn}`, error);
      toast.error(`Error:  ${error.message || error}`);
    },
  });
};
