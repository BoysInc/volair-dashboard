import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../use-auth";

import { FeatureFlags } from "@/lib/types/featureFlags";
import { tryCatch } from "@/lib/utils"


export default function useFeatureFlag(featureFlagName: string) {
    const { token } = useAuth();

    if (!token) {
        return { data: null, isLoading: false, error: "No token found" };
    }

    const getFeatureFlag = async (token: string): Promise<{ data: FeatureFlags | null, error: string | null }> => {
        const { data, error } = await tryCatch(
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/feature-flags`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
        )

        if (error) {
            return { data: null, error: error.message };
        }

        const { data: featureFlags, error: featureFlagsError } = await tryCatch(data.json())

        if (featureFlagsError) {
            return { data: null, error: featureFlagsError.message };
        }

        if (!data.ok) {
            return { data: null, error: "Failed to fetch feature flags: " + featureFlags.message };
        }

        return { data: featureFlags.data as FeatureFlags, error: null };
    }


    const { data, isLoading, error } = useQuery({
        queryKey: ["featureFlags", featureFlagName],
        queryFn: async () => {
            const flagReq = await getFeatureFlag(token || "")
            if (flagReq.error) {
                throw new Error(flagReq.error);
            }
            return flagReq.data?.find((flag) => flag.name === featureFlagName) || null;
        },
    });

    return { isEnabled: data?.enabled || false, isLoading, error };
}