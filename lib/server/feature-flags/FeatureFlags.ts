import { FeatureFlags } from "@/lib/types/featureFlags";
import { tryCatch } from "@/lib/utils"


export const getFeatureFlags = async (token: string): Promise<{ data: FeatureFlags | null, error: string | null }> => {
    const { data, error } = await tryCatch(
        fetch(`${process.env.BACKEND_BASE_API}/feature-flags`, {
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