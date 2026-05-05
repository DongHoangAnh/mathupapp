import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Hook to check if user has selected a role
 * Returns true if user needs to select a role
 */
export function useRoleCheck() {
    const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
    const [userId, setUserId] = useState<string>("");
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        checkUserRole();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                await checkUserRole();
            } else if (event === 'SIGNED_OUT') {
                setNeedsRoleSelection(false);
                setUserId("");
                setIsChecking(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const checkUserRole = async () => {
        setIsChecking(true);

        try {
            // Get current user from Supabase
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setNeedsRoleSelection(false);
                setIsChecking(false);
                return;
            }

            setUserId(user.id);

            // Check if user has role in metadata
            const userRole = user.user_metadata?.role;

            // Also check localStorage
            const localUser = localStorage.getItem('mathocean_user');
            const localRole = localUser ? JSON.parse(localUser).role : null;

            // If no role in either place, show role selection
            if (!userRole && !localRole) {
                console.log("User needs to select role");
                setNeedsRoleSelection(true);
            } else {
                setNeedsRoleSelection(false);

                // Sync role if only in one place
                if (userRole && !localRole && localUser) {
                    const userData = JSON.parse(localUser);
                    userData.role = userRole;
                    localStorage.setItem('mathocean_user', JSON.stringify(userData));
                    window.dispatchEvent(new Event('authChange'));
                }
            }
        } catch (error) {
            console.error("Error checking user role:", error);
            setNeedsRoleSelection(false);
            setUserId(""); // Reset userId on error
        } finally {
            setIsChecking(false);
        }
    };

    const markRoleSelected = () => {
        setNeedsRoleSelection(false);
    };

    return {
        needsRoleSelection,
        userId,
        isChecking,
        markRoleSelected,
        recheckRole: checkUserRole
    };
}
