import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface DecisionVelocity {
    hour: number;
    automated: number;
    human: number;
}

export function useDecisionVelocity() {
    const [velocityData, setVelocityData] = useState<DecisionVelocity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVelocity = async () => {
            try {
                const response = await apiClient.get<DecisionVelocity[]>('/stats/velocity');
                setVelocityData(response.data);
            } catch (err) {
                console.error("Failed to fetch decision velocity", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVelocity();
        const interval = setInterval(fetchVelocity, 2000); // Poll every 2s
        return () => clearInterval(interval);
    }, []);

    return { velocityData, loading };
}
